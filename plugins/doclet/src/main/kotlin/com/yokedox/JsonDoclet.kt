package com.yokedox

import com.sun.source.util.DocTrees
import java.util.*
import javax.lang.model.SourceVersion
import jdk.javadoc.doclet.*

lateinit var docTrees: DocTrees

fun toJson(environment: DocletEnvironment): JsonValue {
  return JsonValue(mapOf(
    "includedElements" to toJson(environment.includedElements),
    "specifiedElements" to toJson(environment.specifiedElements),
    "sourceVersion" to toJson(environment.sourceVersion),
    "moduleMode" to toJson(environment.moduleMode)
  ))
}

/**
 * A doclet that outputs JSON.
 */
class JsonDoclet : Doclet {
  override fun init(locale: Locale?, reporter: Reporter?) {
  }

  override fun getName(): String {
    return "JsonDoclet"
  }

  override fun getSupportedOptions(): Set<Doclet.Option> {
    return setOf()
  }

  override fun getSupportedSourceVersion(): SourceVersion {
    return SourceVersion.RELEASE_0
  }

  override fun run(environment: DocletEnvironment): Boolean {
    docTrees = environment.docTrees
    val root = toJson(environment)
    println(root.toJsonString())
    return true
  }
}
