package com.yokedox

import com.beust.klaxon.JsonArray
import com.beust.klaxon.JsonObject
import com.beust.klaxon.JsonValue
import javax.lang.model.element.*
import javax.lang.model.util.AbstractElementVisitor9

fun toJson(b: Boolean): JsonValue {
  return makeJsonValue(b)
}

fun toJson(list: Iterable<JsonValue>): JsonValue {
  return makeJsonValue(list)
}

fun toJson(name: Name): JsonValue {
  return makeJsonValue(name.toString())
}

fun toJson(element: Element): JsonValue {
  val base = JsonObject(mapOf(
    // TODO: Ignoring annotation mirrors for now
    "kind" to toJson(element.kind),
    "modifiers" to toJson(element.modifiers),
    "simpleName" to toJson(element.simpleName)
  ))
  base.putAll(JsonElementVisitor().visit(element))
  return makeJsonValue(base)
}

fun toJson(kind: ElementKind): JsonObject {
  return JsonObject(mapOf(
    "name" to kind.name,
    "isClass" to kind.isClass,
    "isField" to kind.isField,
    "isInterface" to kind.isInterface
  ))
}

fun toJson(modifier: Modifier): JsonValue {
  return makeJsonValue(modifier.name)
}

@JvmName("toJsonIterableModifier")
fun toJson(modifiers: Iterable<Modifier>): JsonValue {
  return makeJsonValue(modifiers.map { toJson(it) })
}

@JvmName("toJsonIterableElement")
fun toJson(list: Iterable<Element>): JsonValue {
  return toJson(list.map { toJson(it) })
}

class JsonElementVisitor : AbstractElementVisitor9<JsonObject, Void>() {
  override fun visitPackage(e: PackageElement, p: Void?): JsonObject {
    return JsonObject(mapOf(
      "qualifiedName" to e.qualifiedName,
      "isUnnamed" to e.isUnnamed
    ))
  }

  override fun visitType(e: TypeElement, p: Void?): JsonObject {
    return JsonObject(mapOf(
      "nestingKind" to e.nestingKind.toString(),
      "nestingKindIsNested" to e.nestingKind.isNested,
      "qualifiedName" to e.qualifiedName,
      "superclass" to toJson(e.superclass)
    ))
  }

  override fun visitVariable(e: VariableElement, p: Void?): JsonObject {
    return JsonObject(mapOf(
      "constantValue" to e.constantValue
    ))
  }

  override fun visitExecutable(e: ExecutableElement, p: Void?): JsonObject {
    return JsonObject(mapOf(
      "defaultValue" to toJson(e.defaultValue),
      "parameters" to toJson(e.parameters),
      "receiverType" to toJson(e.receiverType),
      "returnType" to toJson(e.returnType),
      "thrownTypes" to toJson(e.thrownTypes),
      "typeParameters" to toJson(e.typeParameters),
      "isDefault" to toJson(e.isDefault),
      "isVarargs" to toJson(e.isVarArgs)
    ))
  }

  override fun visitTypeParameter(e: TypeParameterElement, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitModule(t: ModuleElement, p: Void?): JsonObject {
    return JsonObject()
  }
}
