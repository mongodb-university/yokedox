package com.yokedox

import com.sun.javadoc.*

fun toJson(v: Tag): JsonObject {
    val value = mutableMapOf<String, Any?>(
        "name" to v.name(),
        "kind" to v.kind(),
        "text" to v.text(),
        "inlineTags" to v.inlineTags().map { toJson(it) },
        "firstSentenceTags" to v.firstSentenceTags().map { toJson(it) },
        "position" to toJson(v.position())
    )
    // Explicitly downcast to each type here as
    // the subtypes are not all directly used, so
    // some subtype overloads would never be called.
    //
    // Please do not implement toJson() for Tag subclasses
    // listed here.
    when (v) {
        is ParamTag ->
            value.putAll(mapOf(
                "parameterName" to v.parameterName(),
                "parameterComment" to v.parameterComment(),
                "isTypeParameter" to v.isTypeParameter,
            ))
        is SeeTag ->
            value.putAll(mapOf(
                "label" to v.label(),
                "referencedPackage" to v.referencedPackage(),
                "referencedClassName" to v.referencedClassName(),
                "referencedClass" to v.referencedClass(),
                "referencedMemberName" to v.referencedMemberName(),
                "referencedMember" to v.referencedMember(),
            ))
        is SerialFieldTag ->
            value.putAll(mapOf(
                "fieldName" to v.fieldName(),
                "fieldType" to v.fieldType(),
                "fieldTypeDoc" to v.fieldTypeDoc(),
                "description" to v.description(),
            ))
        is ThrowsTag ->
            value.putAll(mapOf(
                "exceptionName" to v.exceptionName(),
                "exceptionComment" to v.exceptionComment(),
                "exceptionType" to v.exceptionType(),
            ))
    }
    return value
}
