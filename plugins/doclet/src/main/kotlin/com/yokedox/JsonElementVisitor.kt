package com.yokedox

import javax.lang.model.element.*
import javax.lang.model.util.AbstractElementVisitor9

fun toJson(name: Name): JsonValue {
  return JsonValue(name.toString())
}

fun toJson(kind: NestingKind): JsonValue {
  return JsonValue(mapOf(
    "name" to toJson(kind.name),
    "isNested" to toJson(kind.isNested)
  ))
}

@JvmName("toJsonIterableModuleElementDirective")
fun toJson(list: Iterable<ModuleElement.Directive>): JsonValue {
  return JsonValue(list.map { toJson(it) })
}

fun toJson(element: Element): JsonValue {
  val base = mutableMapOf<String, JsonValue>(
    // TODO: Ignoring annotation mirrors for now
    "kind" to toJson(element.kind),
    "modifiers" to toJson(element.modifiers),
    "simpleName" to toJson(element.simpleName)
  )
  base.putAll(JsonElementVisitor().visit(element))
  return JsonValue(base)
}

fun toJson(s: String): JsonValue {
  return JsonValue(s)
}

fun toJson(kind: ElementKind): JsonValue {
  return JsonValue(mapOf(
    "name" to toJson(kind.name),
    "isClass" to toJson(kind.isClass),
    "isField" to toJson(kind.isField),
    "isInterface" to toJson(kind.isInterface)
  ))
}

fun toJson(modifier: Modifier): JsonValue {
  return JsonValue(modifier.name)
}

@JvmName("toJsonIterableModifier")
fun toJson(modifiers: Iterable<Modifier>): JsonValue {
  return JsonValue(modifiers.map { toJson(it) })
}

@JvmName("toJsonIterableElement")
fun toJson(list: Iterable<Element>): JsonValue {
  return toJson(list.map { toJson(it) })
}

class JsonElementVisitor : AbstractElementVisitor9<JsonObject, Void>() {
  override fun visitPackage(e: PackageElement, p: Void?): JsonObject {
    return mapOf(
      "qualifiedName" to toJson(e.qualifiedName),
      "isUnnamed" to toJson(e.isUnnamed)
    )
  }

  override fun visitType(e: TypeElement, p: Void?): JsonObject {
    return mapOf(
      "nestingKind" to toJson(e.nestingKind),
      "qualifiedName" to toJson(e.qualifiedName),
      "superclass" to toJson(e.superclass)
    )
  }

  override fun visitVariable(e: VariableElement, p: Void?): JsonObject {
    return mapOf(
      // "constantValue" to JsonValue(e.constantValue) // TODO: constantValue is type-erased 'Object'
    )
  }

  override fun visitExecutable(e: ExecutableElement, p: Void?): JsonObject {
    return mapOf(
      "defaultValue" to toJson(e.defaultValue),
      "parameters" to toJson(e.parameters),
      "receiverType" to toJson(e.receiverType),
      "returnType" to toJson(e.returnType),
      "thrownTypes" to toJson(e.thrownTypes),
      "typeParameters" to toJson(e.typeParameters),
      "isDefault" to toJson(e.isDefault),
      "isVarargs" to toJson(e.isVarArgs)
    )
  }

  override fun visitTypeParameter(e: TypeParameterElement, p: Void?): JsonObject {
    return mapOf(
      "bounds" to toJson(e.bounds),
      "enclosingElement" to toJson(e.enclosingElement),
      "genericElement" to toJson(e.genericElement)
    )
  }

  override fun visitModule(t: ModuleElement, p: Void?): JsonObject {
    return mapOf(
      "directives" to toJson(t.directives),
      "enclosedElements" to toJson(t.enclosedElements),
      //  "enclosingElement" to toJson(t.enclosingElement), // TODO: This can be null and will crash
      "qualifiedName" to toJson(t.qualifiedName),
      "isOpen" to toJson(t.isOpen),
      "isUnnamed" to toJson(t.isUnnamed)
    )
  }
}
