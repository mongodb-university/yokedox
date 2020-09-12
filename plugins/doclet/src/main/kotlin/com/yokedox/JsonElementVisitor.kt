package com.yokedox

import com.beust.klaxon.JsonObject
import javax.lang.model.element.*
import javax.lang.model.util.AbstractElementVisitor9

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
    return JsonObject()
  }

  override fun visitExecutable(e: ExecutableElement, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitTypeParameter(e: TypeParameterElement, p: Void?): JsonObject {
    return JsonObject()
  }

  override fun visitModule(t: ModuleElement, p: Void?): JsonObject {
    return JsonObject()
  }
}
