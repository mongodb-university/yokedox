package com.yokedox

import javax.lang.model.element.*
import javax.lang.model.util.AbstractElementVisitor9

fun toJson(element: Element?): JsonValue {
  if (element == null) {
    return JsonValue(null)
  }
  val base = mutableMapOf<String, Any?>(
    "kind" to toJson(element.kind),
    "annotationMirrors" to toJson(element.annotationMirrors),
    "modifiers" to toJson(element.modifiers),
    "simpleName" to toJson(element.simpleName),
    "enclosingElement" to toJsonReference(element.enclosingElement),
    "enclosedElements" to toJson(element.enclosedElements)
  )
  base["docCommentTree"] = toJson(docTrees.getDocCommentTree(element))
  base.putAll(JsonElementVisitor().visit(element))
  return JsonValue(base)
}

// Some elements contain references to other elements.
// If fully expanded in JSON, this could be an infinite cycle.
// toJsonReference() encodes only the required information
// about the element to look it up elsewhere.
fun toJsonReference(element: Element?): JsonValue {
  if (element == null) {
    return JsonValue(null);
  }
  return JsonValue(mutableMapOf(
    "kind" to toJson(element.kind),
    "simpleName" to toJson(element.simpleName),
    "isReference" to true
  ))
}

fun toJson(kind: ElementKind): JsonValue {
  return JsonValue(kind.name)
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
      "superclass" to toJson(e.superclass),
      "interfaces" to toJson(e.interfaces),
      "typeParameters" to toJson(e.typeParameters)
    )
  }

  override fun visitVariable(e: VariableElement, p: Void?): JsonObject {
    return mapOf(
      "constantValue" to JsonValue(e.constantValue)
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
      "isVarArgs" to toJson(e.isVarArgs)
    )
  }

  override fun visitTypeParameter(e: TypeParameterElement, p: Void?): JsonObject {
    return mapOf(
      "bounds" to toJson(e.bounds),
      "genericElement" to toJsonReference(e.genericElement)
    )
  }

  override fun visitModule(t: ModuleElement, p: Void?): JsonObject {
    return mapOf(
      "directives" to toJson(t.directives),
      "qualifiedName" to toJson(t.qualifiedName),
      "isOpen" to toJson(t.isOpen),
      "isUnnamed" to toJson(t.isUnnamed)
    )
  }
}
