package com.yokedox

import com.sun.javadoc.*

/**
 * Entrypoint to fully parse a ClassDoc. Subsequently discovered ClassDocs
 * in the tree are referenced by fully-qualified name only.
 */
fun parse(v: ClassDoc): JsonValue {
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as ProgramElementDoc, true) as JsonObject)
    value.putAll(mapOf(
        "_class" to "ParsedClassDoc",
        "isAbstract" to v.isAbstract,
        "isSerializable" to v.isSerializable,
        "isExternalizable" to v.isExternalizable,
        "serializationMethods" to v.serializationMethods().map { toJson(it) },
        "serializableFields" to v.serializableFields().map { toJson(it) },
        "definesSerializableFields" to v.definesSerializableFields(),
        "superclassType" to toJson(v.superclassType()),
        // "interfaces" not included because "interfaceTypes" is recommended instead
        "interfaceTypes" to v.interfaceTypes().map { toJson(it) },
        "typeParameters" to v.typeParameters().map { toJson(it) },
        "typeParamTags" to v.typeParamTags().map { toJson(it) },
        // True = Filter according to specified access modifier option
        "fields" to v.fields(true).map { toJson(it) },
        "enumConstants" to v.enumConstants().map { toJson(it) },
        "methods" to v.methods(true).map { toJson(it) },
        "constructors" to v.constructors(true).map { toJson(it) },
        "innerClasses" to v.innerClasses(true).map { toJson(it) },
        // Include AnnotationTypeDoc information if present.
        "isAnnotationType" to (v is AnnotationTypeDoc),
    ))
    when (v) {
        is AnnotationTypeDoc ->
            value["elements"] = v.elements().map { toJson(it) }
    }
    return JsonValue(value)
}

/**
 * Entrypoint to fully parse a PackageDoc. The resulting object refers to
 * inner ClassDocs by fully-qualified name rather than fully parsing out
 * the ClassDocs.
 */
fun parse(v: PackageDoc): JsonValue {
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as Doc) as JsonObject)
    value.putAll(mapOf(
        "_class" to "ParsedPackageDoc",
        "allClasses" to v.allClasses(true).map { toJson(it) },
        "ordinaryClasses" to v.ordinaryClasses().map { toJson(it) },
        "exceptions" to v.exceptions().map { toJson(it) },
        "errors" to v.errors().map { toJson(it) },
        "enums" to v.enums().map { toJson(it) },
        "interfaces" to v.interfaces().map { toJson(it) },
        "annotationTypes" to v.annotationTypes().map { toJson(it) },
        "annotations" to v.annotations().map { toJson(it) },
    ))
    return JsonValue(value)
}

/**
 * Returns a reference version of the ClassDoc so as to avoid circular
 * toJson() calls.
 *
 * @see parse
 */
fun toJson(v: ClassDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as Type?) as JsonObject)
    // Include the useful and non-recursive 'modifiers' field
    value.putAll(mapOf(
      "modifiers" to v.modifiers(),
    ))
    return value
}

/**
 * Converts the given Doc to a JsonObject.
 *
 * Dispatches to the appropriate moreJson() functions for the correct subtype.
 *
 * @param deepParse If true, ClassDoc and PackageDoc are rendered as references
 *                  rather than fully parsed to avoid endless circular parsing.
 */
fun toJson(v: Doc?, deepParse: Boolean = false): JsonObject? {
    if (v == null) {
        return null
    }
    // Special case for ClassDoc and PackageDoc to avoid circular references.
    if (!deepParse && v is ClassDoc) {
        return toJson(v)
    }
    if (!deepParse && v is PackageDoc) {
        return mapOf(
            "_class" to "PackageDoc",
            "name" to v.name()
        )
    }

    val value = mutableMapOf<String, Any?>(
        "commentText" to v.commentText(),
        "tags" to v.tags().map { toJson(it) },
        "seeTags" to v.seeTags().map { toJson(it) },
        "inlineTags" to v.inlineTags().map { toJson(it) },
        "firstSentenceTags" to v.firstSentenceTags().map { toJson(it) },
        "name" to v.name(),
        "isField" to v.isField,
        "isEnumConstant" to v.isEnumConstant,
        "isConstructor" to v.isConstructor,
        "isMethod" to v.isMethod,
        "isAnnotationTypeElement" to v.isAnnotationTypeElement,
        "isInterface" to v.isInterface,
        "isException" to v.isException,
        "isError" to v.isError,
        "isEnum" to v.isEnum,
        "isAnnotationType" to v.isAnnotationType,
        "isOrdinaryClass" to v.isOrdinaryClass,
        "isClass" to v.isClass,
        "isIncluded" to v.isIncluded,
        "position" to toJson(v.position())
    )
    when (v) {
        is ProgramElementDoc ->
            value.putAll(moreJson(v))
    }
    return value
}

/**
 * Parses ProgramElementDoc properties (minus base class Doc properties) to JSON. Dispatches to
 * other moreJson() functions for further subclasses.
 */
private fun moreJson(v: ProgramElementDoc): JsonObject {
    val value = mutableMapOf(
        "_class" to "ProgramElementDoc",
        "containingClass" to (if (v.containingClass() == null) null else toJson(v.containingClass())),
        "containingPackage" to toJson(v.containingPackage()),
        "qualifiedName" to v.qualifiedName(),
        "modifierSpecifier" to v.modifierSpecifier(),
        "modifiers" to v.modifiers(),
        "annotations" to v.annotations().map { toJson(it) },
        "isPublic" to v.isPublic,
        "isProtected" to v.isProtected,
        "isPrivate" to v.isPrivate,
        "isPackagePrivate" to v.isPackagePrivate,
        "isStatic" to v.isStatic,
        "isFinal" to v.isFinal,
    )
    when (v) {
        is ClassDoc ->
            value.putAll(toJson(v) as JsonObject)
        is MemberDoc ->
            value.putAll(moreJson(v))
    }
    return value
}

/**
 * Parses MemberDoc properties (minus base class ProgramElementDoc properties) to JSON.
 * Dispatches to other moreJson() functions for further subclasses.
 */
private fun moreJson(v: MemberDoc): JsonObject {
    val value = mutableMapOf<String, Any?>(
        "_class" to "MemberDoc",
        "isSynthetic" to v.isSynthetic
    )
    when (v) {
        is ExecutableMemberDoc ->
            value.putAll(moreJson(v))
        is FieldDoc ->
            value.putAll(moreJson(v))
    }
    return value
}

private fun moreJson(v: ExecutableMemberDoc): JsonObject {
    val value = mutableMapOf<String, Any?>(
        "_class" to "ExecutableMemberDoc",
        "thrownExceptionTypes" to v.thrownExceptionTypes().map { toJson(it) },
        "isNative" to v.isNative,
        "isSynchronized" to v.isSynchronized,
        "isVarArgs" to v.isVarArgs,
        "parameters" to v.parameters().map { toJson(it) },
        "receiverType" to toJson(v.receiverType()),
        "throwsTags" to v.throwsTags().map { toJson(it) },
        "paramTags" to v.paramTags().map { toJson(it) },
        "typeParamTags" to v.typeParamTags().map { toJson(it) },
        "signature" to v.signature(),
        "flatSignature" to v.flatSignature(),
        "typeParameters" to v.typeParameters().map { toJson(it) },
        "isConstructor" to (v is ConstructorDoc)
    )
    when (v) {
        is MethodDoc ->
            value.putAll(moreJson(v))
    }
    return value
}

private fun moreJson(v: MethodDoc): JsonObject {
    val value = mutableMapOf<String, Any?>(
        "_class" to "MethodDoc",
        "isAbstract" to v.isAbstract,
        "isDefault" to v.isDefault,
        "returnType" to toJson(v.returnType()),
        "overriddenType" to toJson(v.overriddenType()),
        // Provide class for overridden method only because name and signature
        // are implied in this method object
        "overriddenMethodContainingClass" to
                (if (v.overriddenMethod() == null)
                    null else toJson(v.overriddenMethod().containingClass())),
    )
    when (v) {
        is AnnotationTypeElementDoc ->
            value.putAll(moreJson(v))
    }
    return value
}

private fun moreJson(v: AnnotationTypeElementDoc): JsonObject {
    return mapOf(
        "_class" to "AnnotationTypeElementDoc",
        "defaultValue" to toJson(v.defaultValue()),
    )
}

private fun moreJson(v: FieldDoc): JsonObject {
    return mapOf(
        "_class" to "FieldDoc",
        "type" to toJson(v.type()),
        "isTransient" to v.isTransient,
        "isVolatile" to v.isVolatile,
        "serialFieldTags" to v.serialFieldTags().map { toJson(it) },
        "constantValue" to v.constantValue()?.toString(),
        "constantValueExpression" to v.constantValueExpression()
    )
}
