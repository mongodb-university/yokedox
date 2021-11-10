package com.yokedox

import com.sun.javadoc.*

fun toJson(v: SourcePosition?): JsonObject? {
    if (v == null) {
        return null
    }
    return mapOf(
        "line" to v.line(),
        "column" to v.column(),
        "file" to v.file().path
    )
}

fun toJson(v: AnnotationValue?): JsonValue {
    return JsonValue(v?.toString())
}

fun toJson(v: AnnotationDesc): JsonObject {
    return mapOf(
        "annotationType" to toJson(v.annotationType()),
        "elementValues" to v.elementValues().map { JsonValue(
            mapOf(
                "element" to toJson(it.element()),
                "value" to toJson(it.value())
            ))
        },
        "isSynthesized" to v.isSynthesized,
    )
}

fun toJson(v: Parameter): JsonObject {
    return mapOf(
        "type" to toJson(v.type()),
        "name" to v.name(),
        "typeName" to v.typeName(),
        "asString" to v.toString(),
        "annotations" to v.annotations().map { toJson(it) },
    )
}