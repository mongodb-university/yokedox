package com.yokedox

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
>...
>
>Algorithm for Inheriting Method Comments - If a method does not have a doc comment, or has an {@inheritDoc} tag, the Javadoc tool searches for an applicable comment using the following algorithm, which is designed to find the most specific applicable doc comment, giving preference to interfaces over superclasses:
>
>1. Look in each directly implemented (or extended) interface in the order they appear following the word implements (or extends) in the method declaration. Use the first doc comment found for this method.
>2. If step 1 failed to find a doc comment, recursively apply this entire algorithm to each directly implemented (or extended) interface, in the same order they were examined in step 1.
>3. If step 2 failed to find a doc comment and this is a class other than Object (not an interface):
>  a. If the superclass has a doc comment for this method, use it.
>  b. If step 3a failed to find a doc comment, recursively apply this entire algorithm to the superclass.
*/
fun inheritDocs(v: Doc): Map<String, Any?> {
    if (v !is MethodDoc || v.overriddenMethod() == null) {
        return mapOf(
            "tags" to v.tags().map { toJson(it) },
            "seeTags" to v.seeTags().map { toJson(it) },
            "inlineTags" to v.inlineTags().map { toJson(it) },
            "firstSentenceTags" to v.firstSentenceTags().map { toJson(it) },
        )
    }

    val tags = getOverriddenTagsAsMap(v).values
    val inlineTags = getOverriddenTags(v, MethodDoc::inlineTags)
    val firstSentenceTags = getOverriddenTags(v, MethodDoc::firstSentenceTags)

    return mapOf(
        "tags" to tags.map { toJson(it) },
        "seeTags" to v.seeTags().map { toJson(it) },
        "inlineTags" to inlineTags.map { toJson(it) },
        "firstSentenceTags" to firstSentenceTags.map { toJson(it) },
    )
}

private fun getOverriddenTagsAsMap(v: MethodDoc): Map<String, Tag> {
    val tags = v.tags().map { Pair(it.kind(), it) }.toMap()
    if (v.overriddenMethod() == null) {
        return tags
    }
    val result = mutableMapOf<String, Tag>()
    result.putAll(getOverriddenTagsAsMap(v.overriddenMethod()))
    // Override non-empty tags unless the tag comment contains "@inheritDoc"
    result.putAll(tags.filter { it.value.inlineTags().count { it.kind() == "@inheritDoc" } == 0 })
    return result
}

private fun getOverriddenTags(v: MethodDoc, getTags: (v: MethodDoc) -> Array<Tag>): List<Tag> {
    val tags = getTags(v)

    // Use tags as-is if method does not override anything
    val overriddenMethod = v.overriddenMethod() ?: return tags.toList()

    // Use tags as-is if tags have any content and there is no {@inheritDoc} tag
    if (tags.isNotEmpty() && tags.count { it.kind() == "@inheritDoc" } == 0) {
        return tags.toList()
    }

    // Otherwise use overridden method's tags
    return getOverriddenTags(overriddenMethod, getTags)
}
