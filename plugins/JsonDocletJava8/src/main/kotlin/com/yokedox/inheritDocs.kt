package com.yokedox

import com.sun.javadoc.ClassDoc
import com.sun.javadoc.Doc
import com.sun.javadoc.MethodDoc
import com.sun.javadoc.Tag


/*
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

    var haveMainDescription = isUsableComment(v.tags())
    var haveReturn = isUsableTag(v,"return")
    var haveParams = isUsableTag(v, "param")
    var haveThrows = isUsableTag(v, "throws")

    if (haveMainDescription && haveReturn && haveParams && haveThrows) {
        return tagsAsIs
    }

    val result = tagsAsIs.toMutableMap()

    val tags = v.tags().toMutableList()

    traverseHierarchy(v) {
        if (!haveReturn && isUsableTag(it, "return")) {
            haveReturn = true
            tags.addAll(it.tags("return"))
        }
        // This doesn't necessarily cover ALL params
        if (!haveParams && isUsableTag(it, "param")) {
            haveParams = true
            tags.addAll(it.tags("param"))
        }
        // This doesn't necessarily cover ALL throws
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
        haveMainDescription && haveReturn && haveParams && haveThrows
    }
    result["tags"] = tags.map { toJson(it) }
    return result
}

/**
    Traverse the hierarchy per the standard doclet algorithm.

    Algorithm is as follows:
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
    /*
    >Algorithm for Inheriting Method Comments - If a method does not have a doc comment, or has an {@inheritDoc} tag, the Javadoc tool searches for an applicable comment using the following algorithm, which is designed to find the most specific applicable doc comment, giving preference to interfaces over superclasses:
    >

    */
    val methodId = methodDoc.name() + methodDoc.signature()

    // Step 1.
    val interfaceTypes = containingClass.interfaceTypes()
    for (interfaceType in interfaceTypes) {
        val classDoc = interfaceType.asClassDoc() ?: continue
        val overloadedMethod = classDoc.methods().find { methodId == it.name() + it.signature() } ?: continue
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
    val superclass = containingClass.superclassType()?.asClassDoc()
    if (superclass != null) {
        val overriddenMethod = superclass.methods().find { methodId == it.name() + it.signature() }
        if (overriddenMethod != null) {
            onOverriddenMethodFound(overriddenMethod)
        }
        // Step 3b.
        val shouldContinueTraversal = traverseHierarchy(methodDoc, superclass, onOverriddenMethodFound)
        if (!shouldContinueTraversal) {
            return false
        }
    }
    return true
}

private fun isUsableComment(tags: Array<Tag>?): Boolean {
    return tags != null && tags.isNotEmpty() && tags.count { it.kind() == "@inheritDoc" } == 0
}

private fun isUsableTag(methodDoc: MethodDoc, tagName: String): Boolean {
    val tags = methodDoc.tags(tagName)
    return isUsableComment(tags)
}
