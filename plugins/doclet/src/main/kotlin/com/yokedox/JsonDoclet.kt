package com.yokedox

import com.sun.source.util.DocTrees
import java.util.*
import javax.lang.model.SourceVersion
import jdk.javadoc.doclet.*
import java.io.File
import javax.tools.Diagnostic

lateinit var docTrees: DocTrees

fun toJson(environment: DocletEnvironment): JsonValue {
  return JsonValue(mapOf(
    "includedElements" to toJson(environment.includedElements),
    "sourceVersion" to toJson(environment.sourceVersion),
    "moduleMode" to toJson(environment.moduleMode)
  ))
}

fun <R> makeOption(names: List<String>,
                   description: String,
                   parameters: List<String> = listOf(),
                   _process: (arguments: List<String>) -> R): Doclet.Option {
  return object : Doclet.Option {
    override fun getArgumentCount(): Int {
      return parameters.size
    }

    override fun getDescription(): String {
      return description
    }

    override fun getKind(): Doclet.Option.Kind {
      return Doclet.Option.Kind.STANDARD
    }

    override fun getNames(): MutableList<String> {
      return names.toMutableList()
    }

    override fun getParameters(): String {
      return parameters.joinToString(" ")
    }

    override fun process(option: String, arguments: MutableList<String>): Boolean {
      _process(arguments)
      return true
    }
  }
}

/**
 * A doclet that outputs JSON.
 */
class JsonDoclet : Doclet {
  private var _locale: Locale? = null
  private var _reporter: Reporter? = null

  // Options
  var outputPath: String? = null
  var compact: Boolean = true
  var force: Boolean = false

  override fun init(locale: Locale?, reporter: Reporter?) {
    _locale = locale
    _reporter = reporter
  }

  override fun getName(): String {
    return "JsonDoclet"
  }

  override fun getSupportedOptions(): Set<Doclet.Option> {
    return setOf(
      makeOption(
        listOf("-d"),
        "Ignored. Use --output-path instead.",
        listOf("</path/to/output/directory/>")
      ) {
        _reporter?.print(Diagnostic.Kind.NOTE, "Ignoring option -d: ${it[0]}. Use --output-path.")
      },
      makeOption(
        listOf("-doctitle"),
        "Included only for compatibility with legacy build scripts. Ignored.",
        listOf("<html-code>")
      ) {
        _reporter?.print(Diagnostic.Kind.NOTE, "Ignoring option -doctitle: ${it[0]}")
      },
      makeOption(
        listOf("-windowtitle"),
        "Included only for compatibility with legacy build scripts. Ignored.",
        listOf("<text>")
      ) {
        _reporter?.print(Diagnostic.Kind.NOTE, "Ignoring option -windowtitle: ${it[0]}")
      },
      makeOption(
        listOf("--output-path", "-o"),
        "Specify where to save the output",
        listOf("</path/to/output.json>")
      ) { outputPath = it[0] },
      makeOption(
        listOf("--no-compact"),
        "Disable compaction of the JSON output that removes null fields and empty arrays, objects, and strings"
      ) { compact = false },
      makeOption(
        listOf("--force", "-f"),
        "Overwrite file specified by --output-path, if it exists"
      ) { force = true }
    )
  }

  fun getOption(name: String): Doclet.Option? {
    return supportedOptions.find { it.names.contains(name) }
  }

  override fun getSupportedSourceVersion(): SourceVersion {
    return SourceVersion.RELEASE_0
  }

  override fun run(environment: DocletEnvironment): Boolean {
    val file = File(outputPath)

    if (file.exists() && !force) {
      throw Error("File exists: ${outputPath}. Refusing to overwrite file without -f.")
    }

    docTrees = environment.docTrees
    var root = toJson(environment)
    if (compact) {
      root = root.compacted()
    }
    file.writeText(root.toJsonString())
    return true
  }
}
