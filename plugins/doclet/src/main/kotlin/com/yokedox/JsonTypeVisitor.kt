package com.yokedox

import javax.lang.model.type.*
import javax.lang.model.util.AbstractTypeVisitor9

fun toJson(typeMirror: TypeMirror): JsonValue {
  val base = mutableMapOf<String, Any?>(
    "kind" to typeMirror.kind.name
  )
  base.putAll(JsonTypeVisitor().visit(typeMirror))
  return JsonValue(base)
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
    return mapOf() // Nothing to add over base
  }

  override fun visitTypeVariable(t: TypeVariable, p: Void?): JsonObject {
    return mapOf(
      "upperBound" to toJson(t.upperBound),
      "lowerBound" to toJson(t.lowerBound)
    )
  }

  override fun visitWildcard(t: WildcardType, p: Void?): JsonObject {
    return mapOf(
      "extendsBound" to toJson(t.extendsBound),
      "superBound" to toJson(t.superBound)
    )
  }

  override fun visitExecutable(t: ExecutableType, p: Void?): JsonObject {
    return mapOf(
      "typeVariables" to toJson(t.typeVariables),
      "returnType" to toJson(t.returnType),
      "parameterTypes" to toJson(t.parameterTypes),
      "receiverType" to toJson(t.receiverType),
      "thrownTypes" to toJson(t.thrownTypes)
    )
  }

  override fun visitNoType(t: NoType, p: Void?): JsonObject {
    return mapOf() // Nothing to add over base
  }

  override fun visitUnion(t: UnionType, p: Void?): JsonObject {
    return mapOf(
      "alternatives" to toJson(t.alternatives)
    )
  }

  override fun visitIntersection(t: IntersectionType, p: Void?): JsonObject {
    return mapOf(
      "bounds" to toJson(t.bounds)
    )
  }
}
