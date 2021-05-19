package com.yokedox

import com.sun.javadoc.*

/**
 * Entrypoint to fully parse a ClassDoc. Subsequently discovered ClassDocs
 * in the tree are referenced by fully-qualified name only.
 */
fun parse(v: ClassDoc): JsonObject {
    val value = mutableMapOf<String, Any?>()
    val type = toJson(v as Type)
    if (type != null) {
        value.putAll(type)
    }
    value.putAll(toJson(v as ProgramElementDoc) as JsonObject)
    value.putAll(mapOf(
        "isAbstract" to v.isAbstract,
        "isSerializable" to v.isSerializable,
        "isExternalizable" to v.isExternalizable,
        "serializationMethods" to v.serializationMethods().map { toJson(it) },
        "serializableFields" to v.serializableFields().map { toJson(it) },
        "definesSerializableFields" to v.definesSerializableFields(),
        "superclassType" to toJson(v.superclassType()),
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
    return value
}

/**
 * Entrypoint to fully parse a PackageDoc. The resulting object refers to
 * inner ClassDocs by fully-qualified name rather than fully parsing out
 * the ClassDocs.
 */
fun parse(v: PackageDoc): JsonObject {
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as Doc) as JsonObject)
    value.putAll(mapOf(
        "allClasses" to v.allClasses(true).map { toJson(it) },
        "ordinaryClasses" to v.ordinaryClasses().map { toJson(it) },
        "exceptions" to v.exceptions().map { toJson(it) },
        "errors" to v.errors().map { toJson(it) },
        "enums" to v.enums().map { toJson(it) },
        "interfaces" to v.interfaces().map { toJson(it) },
        "annotationTypes" to v.annotationTypes().map { toJson(it) },
        "annotations" to v.annotations().map { toJson(it) },
    ))
    return value
}

/**
 * Returns a reference version of the ClassDoc so as to avoid circular
 * toJson() calls.
 *
 * @see parse
 */
fun toJson(v: ClassDoc?): JsonObject? {
    // Return reference information only
    return toJson(v as Type?)
}

/**
 * Converts the given Doc to a JsonObject. Note that this must be called with
 * the derived type to get the correct overload and all information for the
 * derived type.
 */
fun toJson(v: Doc?): JsonObject? {
    if (v == null) {
        return null
    }
    return mapOf(
        "commentText" to v.commentText(),
        "tags" to v.tags().map { toJson(it) },
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
}

fun toJson(v: ProgramElementDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as Doc) as JsonObject)
    value.putAll(mapOf(
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
    ))
    return value
}

fun toJson(v: MemberDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as ProgramElementDoc) as JsonObject)
    value.putAll(mapOf(
        "isSynthetic" to v.isSynthetic
    ))
    return value
}

fun toJson(v: ExecutableMemberDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as MemberDoc) as JsonObject)
    value.putAll(mapOf(
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
    ))
    return value
}

fun toJson(v: MethodDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as ExecutableMemberDoc) as JsonObject)
    value.putAll(mapOf(
        "isAbstract" to v.isAbstract,
        "isDefault" to v.isDefault,
        "returnType" to toJson(v.returnType()),
        "overriddenType" to toJson(v.overriddenType()),
        // Provide qualified class name for overridden method only
        // because name and signature are implied in this method object
        "overriddenMethodContainingClass" to
                (if (v.overriddenMethod() == null)
                    null else toJson(v.overriddenMethod().containingClass())),
    ))
    return value
}

fun toJson(v: AnnotationTypeElementDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as MethodDoc) as JsonObject)
    value.putAll(mapOf(
        "defaultValue" to toJson(v.defaultValue()),
    ))
    return value
}

fun toJson(v: FieldDoc?): JsonObject? {
    if (v == null) {
        return null
    }
    val value = mutableMapOf<String, Any?>()
    value.putAll(toJson(v as MemberDoc) as JsonObject)
    value.putAll(mapOf(
        "type" to toJson(v.type()),
        "isTransient" to v.isTransient,
        "isVolatile" to v.isVolatile,
        "serialFieldTags" to v.serialFieldTags().map { toJson(it) },
        "constantValue" to v.constantValue()?.toString(),
        "constantValueExpression" to v.constantValueExpression()
    ))
    return value
}

/**
 * Returns only the name of the package.
 *
 * @see parse
 */
fun toJson(v: PackageDoc?): JsonValue? {
    return JsonValue(v?.name())
}
