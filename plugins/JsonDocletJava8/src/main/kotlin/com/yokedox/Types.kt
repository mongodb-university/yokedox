package com.yokedox

import com.beust.klaxon.JsonArray
import com.sun.javadoc.*

/**
 * Parses the given Type to a JsonObject. Includes Type subclass information.
 */
fun toJson(v: Type?): JsonObject? {
    if (v == null) {
        return null
    }

    val value = mutableMapOf(
        "_class" to "Type",
        "asString" to try {
            v.toString()
        } catch (e: NullPointerException) {
            // This might fail on some types for some reason.
            "${v.qualifiedTypeName()} (toString() failed)"
        },
        "typeName" to v.typeName(),
        "qualifiedTypeName" to v.qualifiedTypeName(),
        "simpleTypeName" to v.simpleTypeName(),
        "dimension" to v.dimension(),
        "isPrimitive" to v.isPrimitive,
        "elementType" to (if (v.elementType == null) null else toJson(v.elementType)),
        "isClass" to (v is ClassDoc),
        "isAnnotationType" to (v is AnnotationTypeDoc),
    )
    // Explicitly downcast to each type here as
    // the subtypes are not all directly used, so
    // some subtype overloads would never be called.
    //
    // Please do not implement toJson() for Type subclasses
    // listed here.
    when (v) {
        is ParameterizedType ->
            value.putAll(mapOf(
                "_class" to "ParameterizedType",
                "typeArguments" to v.typeArguments().map { toJson(it) },
                "superclassType" to toJson(v.superclassType()),
                "interfaceTypes" to v.interfaceTypes().map { toJson(it) },
                "containingType" to toJson(v.containingType()),
            ))
        is TypeVariable ->
            value.putAll(mapOf(
                "_class" to "TypeVariable",
                "bounds" to v.bounds().map { toJson(it) },
                // Not included - back reference
                // "owner" to toJson(v.owner()),
                "annotations" to v.annotations().map { toJson(it) },
            ))
        is WildcardType ->
            value.putAll(mapOf(
                "_class" to "WildcardType",
                "extendsBounds" to v.extendsBounds().map { toJson(it) },
                "superBounds" to v.superBounds().map { toJson(it) },
            ))
        is AnnotatedType ->
            value.putAll(mapOf(
                "_class" to "AnnotatedType",
                "annotations" to v.annotations().map { toJson(it) },
                "underlyingType" to toJson(v.underlyingType()),
            ))
        is ClassDoc ->
            value["_class"] = "ClassDoc"
    }
    return value
}
