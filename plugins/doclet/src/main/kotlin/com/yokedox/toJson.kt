package com.yokedox

import jdk.javadoc.doclet.DocletEnvironment
import javax.lang.model.SourceVersion
import javax.lang.model.element.Modifier
import javax.lang.model.element.Name
import javax.lang.model.element.NestingKind

fun toJson(name: Name): JsonValue {
  return JsonValue(name.toString())
}

fun toJson(kind: NestingKind): JsonValue {
  return toJson(kind.name)
}

fun toJson(modifier: Modifier): JsonValue {
  return JsonValue(modifier.name)
}

fun toJson(sourceVersion: SourceVersion): JsonValue {
  return JsonValue(sourceVersion.name)
}

fun toJson(moduleMode: DocletEnvironment.ModuleMode): JsonValue {
  return JsonValue(moduleMode.name)
}

@JvmName("toJsonIterableModifier")
fun toJson(modifiers: Iterable<Modifier>): JsonValue {
  return JsonValue(modifiers.map { toJson(it) })
}

fun toJson(environment: DocletEnvironment): JsonValue {
  return JsonValue(mapOf(
    "includedElements" to toJson(environment.includedElements),
    "specifiedElements" to toJson(environment.specifiedElements),
    "sourceVersion" to toJson(environment.sourceVersion),
    "moduleMode" to toJson(environment.moduleMode)
  ))
}
