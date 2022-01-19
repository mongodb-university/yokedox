package com.yokedox

import com.sun.javadoc.*

/**
 * Parses the given Tag to a JsonObject. Includes Tag subclass information.
 */
fun toJson(v: Tag, level: Int = 0): JsonObject {
    val value = mutableMapOf<String, Any?>(
        "_class" to "Tag",
        "name" to v.name(),
        "kind" to v.kind(),
        "text" to v.text(),
        // Position bloats up the file quite a bit and isn't really needed for tags
        // "position" to toJson(v.position()),
    )
    if (level == 0) {
        // The following could lead to infinite recursion if unchecked
        value["inlineTags"] = v.inlineTags().map { toJson(it, level + 1) }
        value["firstSentenceTags"] = v.firstSentenceTags().map { toJson(it, level + 1) }
    }
    // Explicitly downcast to each type here as
    // the subtypes are not all directly used, so
    // some subtype overloads would never be called.
    //
    // Please do not implement toJson() for Tag subclasses
    // listed here.
    when (v) {
        is ParamTag ->
            value.putAll(mapOf(
                "_class" to "ParamTag",
                "parameterName" to v.parameterName(),
                "parameterComment" to v.parameterComment(),
                "isTypeParameter" to v.isTypeParameter,
            ))
        is SeeTag ->
            value.putAll(mapOf(
                "_class" to "SeeTag",
                "label" to v.label(),
                "referencedPackage" to toJson(v.referencedPackage()),
                "referencedClassName" to v.referencedClassName(),
                "referencedClass" to toJson(v.referencedClass()),
                "referencedMemberName" to v.referencedMemberName(),
                // Do not follow backlink
                // "referencedMember" to toJson(v.referencedMember()),
            ))
        is SerialFieldTag ->
            value.putAll(mapOf(
                "_class" to "SerialFieldTag",
                "fieldName" to v.fieldName(),
                "fieldType" to toJson(v.fieldType()),
                "fieldTypeDoc" to toJson(v.fieldTypeDoc()),
                "description" to v.description(),
            ))
        is ThrowsTag ->
            value.putAll(mapOf(
                "_class" to "ThrowsTag",
                "exceptionName" to v.exceptionName(),
                "exceptionComment" to v.exceptionComment(),
                "exceptionType" to toJson(v.exceptionType()),
            ))
    }

    return value
}
