package com.yokedox

import javax.lang.model.type.*
import javax.lang.model.util.AbstractTypeVisitor9

fun toJson(typeMirror: TypeMirror): JsonValue {
  val base = mutableMapOf(
    "kind" to toJson(typeMirror.kind)
  )
  base.putAll(JsonTypeVisitor().visit(typeMirror))
  return JsonValue(base)
}

fun toJson(typeKind: TypeKind): JsonValue {
  return JsonValue(mapOf(
    "name" to toJson(typeKind.name),
    "isPrimitive" to toJson(typeKind.isPrimitive)
  ))
}

fun toJson(list: Iterable<TypeMirror>): JsonValue {
  return toJson(list.map { toJson(it) })
}

class JsonTypeVisitor : AbstractTypeVisitor9<JsonObject, Void>() {
  override fun visitPrimitive(t: PrimitiveType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitNull(t: NullType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitArray(t: ArrayType, p: Void?): JsonObject {
    return mapOf(
      "componentType" to toJson(t.componentType)
    )
  }

  override fun visitDeclared(t: DeclaredType, p: Void?): JsonObject {
    return mapOf(
      // TODO: asElement? or will that lead us in to circle?
      "enclosingType" to toJson(t.enclosingType),
      "typeArguments" to toJson(t.typeArguments)
    )
  }

  override fun visitError(t: ErrorType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitTypeVariable(t: TypeVariable, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitWildcard(t: WildcardType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitExecutable(t: ExecutableType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitNoType(t: NoType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitUnion(t: UnionType, p: Void?): JsonObject {
    return mapOf()
  }

  override fun visitIntersection(t: IntersectionType, p: Void?): JsonObject {
    return mapOf()
  }
}
