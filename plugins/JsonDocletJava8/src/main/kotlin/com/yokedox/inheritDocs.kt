package com.yokedox

import com.sun.javadoc.*


/**
    Inherit method docs from interfaces and superclasses according to the standard doclet algorithm.

    In Javadoc, docs inheritance seems to happen in the standard doclet.
    We don't have access to inherited docs. So we need to implement it here.

    From "Automatic Copying of Method Comments" https://docs.oracle.com/javase/6/docs/technotes/tools/solaris/javadoc.html

    >When a main description, or @return, @param or @throws tag is missing from a method comment, the Javadoc tool copies the corresponding main description or tag comment from the method it overrides or implements (if any), according to the algorithm below.
    >
    >...
    >
    >Inherit from classes and interfaces - Inheriting of comments occurs in all three possible cases of inheritance from classes and interfaces:
    >
    >- When a method in a class overrides a method in a superclass
    >- When a method in an interface overrides a method in a superinterface
    >- When a method in a class implements a method in an interface
    >
*/
fun inheritDocs(v: Doc): Map<String, Any?> {
    val tagsAsIs = mapOf(
        "tags" to v.tags().map { toJson(it) },
        "seeTags" to v.seeTags().map { toJson(it) },
        "inlineTags" to v.inlineTags().map { toJson(it) },
        "firstSentenceTags" to v.firstSentenceTags().map { toJson(it) },
    )
    if (v !is MethodDoc) {
        return tagsAsIs
    }

    // Initialize map of each parameter name to a tag. Will look to fill
    // in missing tags for all parameters.
    val paramTagsByName = mutableMapOf<String, ParamTag?>()
    v.parameters().forEach {
        paramTagsByName[it.name()] = null
    }
    collectParamTags(paramTagsByName, v.tags("param"))
    val haveParams = {
        // Have all params when none of the map entries have null values
        paramTagsByName.values.count {
            it == null
        } == 0
    }

    var haveMainDescription = isUsableComment(v.inlineTags())
    var haveReturn = isUsableTag(v,"return")
    var haveThrows = isUsableTag(v, "throws")

    if (haveMainDescription && haveReturn && haveThrows && haveParams()) {
        return tagsAsIs
    }

    val result = tagsAsIs.toMutableMap()

    val tags = v.tags().filter {
        it.name() != "param"
    }.toMutableList()

    traverseHierarchy(v) {
        if (!haveReturn && isUsableTag(it, "return")) {
            haveReturn = true
            tags.addAll(it.tags("return"))
        }
        if (!haveParams()) {
            collectParamTags(paramTagsByName, it.tags("param"))
        }
        // This doesn't necessarily cover ALL throws?
        if (!haveThrows && isUsableTag(it, "throws")) {
            haveThrows = true
            tags.addAll(it.tags("throws"))
        }
        if (!haveMainDescription && isUsableComment(it.inlineTags())) {
            haveMainDescription = true
            // "firstSentenceTags" is essentially the first part of "inlineTags"
            result.putAll(
                mapOf(
                    "inlineTags" to it.inlineTags().map { tag -> toJson(tag) },
                    "firstSentenceTags" to it.firstSentenceTags().map { tag -> toJson(tag) },
                )
            )
        }
        val shouldContinue = !haveMainDescription || !haveReturn || !haveThrows || !haveParams()
        shouldContinue
    }
    tags.addAll(
        paramTagsByName.values.filter {
            it != null
        }
    )
    result["tags"] = tags.map { toJson(it) }
    return result
}

/**
    Traverse the hierarchy per the standard doclet algorithm.

    Algorithm is as follows (from "Automatic Copying of Method Comments" https://docs.oracle.com/javase/6/docs/technotes/tools/solaris/javadoc.html):
    >1. Look in each directly implemented (or extended) interface in the order they appear following the word implements (or extends) in the method declaration. Use the first doc comment found for this method.
    >2. If step 1 failed to find a doc comment, recursively apply this entire algorithm to each directly implemented (or extended) interface, in the same order they were examined in step 1.
    >3. If step 2 failed to find a doc comment and this is a class other than Object (not an interface):
    >  a. If the superclass has a doc comment for this method, use it.
    >  b. If step 3a failed to find a doc comment, recursively apply this entire algorithm to the superclass.

    On each found overridden method, call the onOverriddenMethodFound function. If the function returns false, stop. Otherwise,
    continue traversing the hierarchy.

    @return false if the traversal was stopped by onOverriddenMethodFound returning false, otherwise true.
 */
private fun traverseHierarchy(methodDoc: MethodDoc, containingClass: ClassDoc = methodDoc.containingClass(), onOverriddenMethodFound: (methodDoc: MethodDoc) -> Boolean): Boolean {
    val methodId = getMethodId(methodDoc)

    // Step 1. (See method comment ^)
    val interfaceTypes = containingClass.interfaceTypes()
    for (interfaceType in interfaceTypes) {
        val classDoc = interfaceType.asClassDoc() ?: continue
        val overloadedMethod = classDoc.methods().find { methodId == getMethodId(it) } ?: continue
        val shouldContinueTraversal = onOverriddenMethodFound(overloadedMethod)
        if (!shouldContinueTraversal) {
            return false
        }
    }

    // Step 2.
    for (interfaceType in interfaceTypes) {
        val classDoc = interfaceType.asClassDoc() ?: continue
        val shouldContinueTraversal = traverseHierarchy(methodDoc, classDoc, onOverriddenMethodFound)
        if (!shouldContinueTraversal) {
            return false
        }
    }

    // Step 3.
    val superclass = containingClass.superclassType()?.asClassDoc() ?: return true
    var shouldContinueTraversal = true
    val overriddenMethod = superclass.methods().find { methodId == getMethodId(it) }
    if (overriddenMethod != null) {
        shouldContinueTraversal = onOverriddenMethodFound(overriddenMethod)
    }
    if (!shouldContinueTraversal) {
        return false
    }
    // Step 3b.
    shouldContinueTraversal = traverseHierarchy(methodDoc, superclass, onOverriddenMethodFound)
    if (!shouldContinueTraversal) {
        return false
    }
    return true
}

/**
 * Returns the method name and signature.
 */
private fun getMethodId(methodDoc: MethodDoc): String {
    return methodDoc.name() + methodDoc.signature()
}

/**
 * Returns true if the comment can be used because it has content and does not have an inheritDoc tag.
 */
private fun isUsableComment(tags: Array<Tag>?): Boolean {
    return tags != null && tags.isNotEmpty() && tags.count { it.kind() == "@inheritDoc" } == 0
}

/**
 * Returns true if the tags of the given type can be used.
 */
private fun isUsableTag(methodDoc: MethodDoc, tagName: String): Boolean {
    val tags = methodDoc.tags(tagName)
    return isUsableComment(tags)
}

/**
 * Looks through the given tags array to gather param tags for a set of parameter names.
 *
 * Gathers param tags where the parameter name is a key in the given paramTagsByName
 * map. Stores those param tags as values in the given map if the value for that entry is still null.
 */
private fun collectParamTags(paramTagsByName: MutableMap<String, ParamTag?>, tags: Array<Tag>?) {
    tags?.forEach { tag ->
        val paramTag = tag as ParamTag
        if (isUsableComment(paramTag.inlineTags())) {
            val parameterName = paramTag.parameterName()
            if (paramTagsByName.containsKey(parameterName) && paramTagsByName[parameterName] == null) {
                paramTagsByName[parameterName] = paramTag
            }
        }
    }
}