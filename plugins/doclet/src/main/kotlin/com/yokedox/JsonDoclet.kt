package com.yokedox

import com.sun.source.util.DocTrees
import java.util.*
import javax.lang.model.SourceVersion
import jdk.javadoc.doclet.*

lateinit var docTrees: DocTrees

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
    return HashSet()
  }

  override fun getSupportedSourceVersion(): SourceVersion {
    return SourceVersion.RELEASE_9
  }

  override fun run(environment: DocletEnvironment): Boolean {
    docTrees = environment.docTrees
    val root = toJson(environment)
    println(root.toJsonString())
    return true
  }
}
