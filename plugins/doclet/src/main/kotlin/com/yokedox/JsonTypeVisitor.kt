package com.yokedox

import com.beust.klaxon.JsonArray
import com.beust.klaxon.JsonObject
import com.beust.klaxon.JsonValue
import javax.lang.model.type.*
import javax.lang.model.util.AbstractTypeVisitor9

fun toJson(obj: JsonObject): JsonValue {
  return makeJsonValue(obj)
}

fun toJson(typeMirror: TypeMirror): JsonValue {
  val result = JsonObject(mapOf(
    "kind" to toJson(typeMirror.kind)
  ))
  result.putAll(JsonTypeVisitor().visit(typeMirror))
  return toJson(result)
}

fun toJson(typeKind: TypeKind): JsonObject {
  return JsonObject(mapOf(
    "name" to typeKind.name,
    "isPrimitive" to typeKind.isPrimitive
  ))
}

fun toJson(list: Iterable<TypeMirror>): JsonValue {
  return toJson(list.map { toJson(it) })
}

class JsonTypeVisitor : AbstractTypeVisitor9<JsonObject, Void>() {
  override fun visitPrimitive(t: PrimitiveType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitNull(t: NullType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitArray(t: ArrayType, p: Void?): JsonObject {
    return JsonObject(mapOf(
      "componentType" to toJson(t.componentType)
    ))
  }

  override fun visitDeclared(t: DeclaredType, p: Void?): JsonObject {
    return JsonObject(mapOf(
      // TODO: asElement? or will that lead us in to circle?
      "enclosingType" to toJson(t.enclosingType),
      "typeArguments" to toJson(t.typeArguments)
    ))
  }

  override fun visitError(t: ErrorType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitTypeVariable(t: TypeVariable, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitWildcard(t: WildcardType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitExecutable(t: ExecutableType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitNoType(t: NoType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitUnion(t: UnionType, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitIntersection(t: IntersectionType, p: Void?): JsonObject {
    return JsonObject()
  }
}
