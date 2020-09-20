package com.yokedox

import com.sun.source.doctree.DocCommentTree
import com.sun.source.doctree.DocTree
import com.sun.source.tree.*
import com.sun.source.util.*
import jdk.javadoc.doclet.Doclet
import jdk.javadoc.doclet.DocletEnvironment
import jdk.javadoc.doclet.Reporter
import org.junit.Test

import org.junit.Assert.*
import java.text.BreakIterator
import java.util.*
import javax.lang.model.SourceVersion
import javax.lang.model.element.*
import javax.lang.model.type.DeclaredType
import javax.lang.model.type.ErrorType
import javax.lang.model.type.TypeMirror
import javax.lang.model.util.Elements
import javax.lang.model.util.Types
import javax.tools.Diagnostic
import javax.tools.FileObject
import javax.tools.JavaFileManager
import javax.tools.JavaFileObject
import kotlin.test.assertFails

class MockDocTrees: DocTrees() {
  override fun getSourcePositions(): DocSourcePositions {
    TODO("Not yet implemented")
  }

  override fun getTree(element: Element?): Tree {
    TODO("Not yet implemented")
  }

  override fun getTree(element: TypeElement?): ClassTree {
    TODO("Not yet implemented")
  }

  override fun getTree(method: ExecutableElement?): MethodTree {
    TODO("Not yet implemented")
  }

  override fun getTree(e: Element?, a: AnnotationMirror?): Tree {
    TODO("Not yet implemented")
  }

  override fun getTree(e: Element?, a: AnnotationMirror?, v: AnnotationValue?): Tree {
    TODO("Not yet implemented")
  }

  override fun getPath(unit: CompilationUnitTree?, node: Tree?): TreePath {
    TODO("Not yet implemented")
  }

  override fun getPath(e: Element?): TreePath {
    TODO("Not yet implemented")
  }

  override fun getPath(e: Element?, a: AnnotationMirror?): TreePath {
    TODO("Not yet implemented")
  }

  override fun getPath(e: Element?, a: AnnotationMirror?, v: AnnotationValue?): TreePath {
    TODO("Not yet implemented")
  }

  override fun getElement(path: DocTreePath?): Element {
    TODO("Not yet implemented")
  }

  override fun getElement(path: TreePath?): Element {
    TODO("Not yet implemented")
  }

  override fun getTypeMirror(path: TreePath?): TypeMirror {
    TODO("Not yet implemented")
  }

  override fun getScope(path: TreePath?): Scope {
    TODO("Not yet implemented")
  }

  override fun getDocComment(path: TreePath?): String {
    TODO("Not yet implemented")
  }

  override fun isAccessible(scope: Scope?, type: TypeElement?): Boolean {
    TODO("Not yet implemented")
  }

  override fun isAccessible(scope: Scope?, member: Element?, type: DeclaredType?): Boolean {
    TODO("Not yet implemented")
  }

  override fun getOriginalType(errorType: ErrorType?): TypeMirror {
    TODO("Not yet implemented")
  }

  override fun printMessage(kind: Diagnostic.Kind?, msg: CharSequence?, t: DocTree?, c: DocCommentTree?, root: CompilationUnitTree?) {
    TODO("Not yet implemented")
  }

  override fun printMessage(kind: Diagnostic.Kind?, msg: CharSequence?, t: Tree?, root: CompilationUnitTree?) {
    TODO("Not yet implemented")
  }

  override fun getLub(tree: CatchTree?): TypeMirror {
    TODO("Not yet implemented")
  }

  override fun getBreakIterator(): BreakIterator {
    TODO("Not yet implemented")
  }

  override fun getDocCommentTree(path: TreePath?): DocCommentTree {
    TODO("Not yet implemented")
  }

  override fun getDocCommentTree(e: Element?): DocCommentTree? {
    return null
  }

  override fun getDocCommentTree(fileObject: FileObject?): DocCommentTree {
    TODO("Not yet implemented")
  }

  override fun getDocCommentTree(e: Element?, relativePath: String?): DocCommentTree {
    TODO("Not yet implemented")
  }

  override fun getDocTreePath(fileObject: FileObject?, packageElement: PackageElement?): DocTreePath {
    TODO("Not yet implemented")
  }

  override fun getFirstSentence(list: MutableList<out DocTree>?): MutableList<DocTree> {
    TODO("Not yet implemented")
  }

  override fun setBreakIterator(breakiterator: BreakIterator?) {
    TODO("Not yet implemented")
  }

  override fun getDocTreeFactory(): DocTreeFactory {
    TODO("Not yet implemented")
  }

}

class MockDocletEnvironment(private val _docTrees: DocTrees) : DocletEnvironment {
  override fun getSpecifiedElements(): MutableSet<out Element> {
    return mutableSetOf()
  }

  override fun getIncludedElements(): MutableSet<out Element> {
    return mutableSetOf()
  }

  override fun getDocTrees(): DocTrees {
    return _docTrees
  }

  override fun getElementUtils(): Elements {
    TODO("Not yet implemented")
  }

  override fun getTypeUtils(): Types {
    TODO("Not yet implemented")
  }

  override fun isIncluded(e: Element?): Boolean {
    TODO("Not yet implemented")
  }

  override fun isSelected(e: Element?): Boolean {
    TODO("Not yet implemented")
  }

  override fun getJavaFileManager(): JavaFileManager {
    TODO("Not yet implemented")
  }

  override fun getSourceVersion(): SourceVersion {
    return SourceVersion.RELEASE_0
  }

  override fun getModuleMode(): DocletEnvironment.ModuleMode {
    return DocletEnvironment.ModuleMode.ALL
  }

  override fun getFileKind(type: TypeElement?): JavaFileObject.Kind {
    TODO("Not yet implemented")
  }
}

class JsonDocletTest {
    @Test
    fun getName() {
      assertEquals("JsonDoclet", JsonDoclet().name)
    }

    @Test
    fun getSupportedSourceVersion() {
      assertEquals(SourceVersion.RELEASE_0, JsonDoclet().supportedSourceVersion)
    }

    @Test
    fun testDocletInit() {
      val locale = Locale("en")
      val reporter = object: Reporter {
        override fun print(kind: Diagnostic.Kind?, msg: String?) {
          TODO("Not yet implemented")
        }

        override fun print(kind: Diagnostic.Kind?, path: DocTreePath?, msg: String?) {
          TODO("Not yet implemented")
        }

        override fun print(kind: Diagnostic.Kind?, e: Element?, msg: String?) {
          TODO("Not yet implemented")
        }
      }
      JsonDoclet().init(locale, reporter)
    }

    @Test
    fun run() {
      val _docTrees = MockDocTrees()
      val environment = MockDocletEnvironment(_docTrees)

      val doclet = JsonDoclet()

      assertFails { doclet.run(environment) }

      doclet.outputPath = "tmp/test.json"
      doclet.force = true
      assert(doclet.run(environment))

      // Global docTrees dependency set
      assertEquals(_docTrees, docTrees)

      // No overwrite without -f
      doclet.force = false
      assertFails { doclet.run(environment) }
    }

    @Test
    fun testDocletOptions() {
      val doclet = JsonDoclet()
      val options = doclet.supportedOptions
      assertEquals(options.map { it.names.toSet() }.toSet(), setOf(
        setOf("-d"),
        setOf("-doctitle"),
        setOf("-windowtitle"),
        setOf("-f", "--force"),
        setOf("-o", "--output-path"),
        setOf("--no-compact")
      ))
    }

    @Test
    fun testMakeOption() {
      var processed = false
      val o = makeOption(
        listOf("-t", "--test"),
        "It is a test option",
        listOf()
      ) {
        processed = true
      }
      assertFalse(processed)
      assertEquals(o.names, listOf("-t", "--test"))
      assertEquals(o.description, "It is a test option")
      assertEquals(o.parameters, "")
      assertEquals(o.argumentCount, 0)
      assertEquals(o.kind, Doclet.Option.Kind.STANDARD)
      o.process("", listOf())
      assertTrue(processed)

      processed = false
      val o2 = makeOption(
        listOf("-t2", "--test2"),
        "It is a test option with multiple arguments",
        listOf("a", "b", "c")
      ) {
        processed = true
      }
      assertFalse(processed)
      assertEquals(o2.names, listOf("-t2", "--test2"))
      assertEquals(o2.description, "It is a test option with multiple arguments")
      assertEquals(o2.parameters, "a b c")
      assertEquals(o2.argumentCount, 3)
      assertEquals(o2.kind, Doclet.Option.Kind.STANDARD)
      o.process("", listOf("a", "b", "c"))
      assertTrue(processed)
    }

    @Test
    fun testDocletOptionsProcessors() {
      val doclet = JsonDoclet()
      assertEquals(doclet.outputPath, null)
      assertEquals(doclet.compact, true)
      assertEquals(doclet.force, false)

      doclet.getOption("-d")!!.process("-d", listOf("some path"))
      doclet.getOption("-doctitle")!!.process("-doctitle", listOf("some html"))
      doclet.getOption("-windowtitle")!!.process("-windowtitle", listOf("some text"))
      // The above options are ignored. There should be no change:
      assertEquals(doclet.outputPath, null)
      assertEquals(doclet.compact, true)
      assertEquals(doclet.force, false)

      val o = doclet.getOption("-o")
      o!!.process("-o", listOf("some path"))
      assertEquals(doclet.outputPath, "some path") // Set to some path
      assertEquals(doclet.compact, true)
      assertEquals(doclet.force, false)

      val noCompact = doclet.getOption("--no-compact")
      noCompact!!.process("--no-compact", listOf())
      assertEquals(doclet.outputPath, "some path")
      assertEquals(doclet.compact, false) // Set to false
      assertEquals(doclet.force, false)

      val force = doclet.getOption("-f")
      force!!.process("-f", listOf())
      assertEquals(doclet.outputPath, "some path")
      assertEquals(doclet.compact, false)
      assertEquals(doclet.force, true) // Set to false
    }

    @Test
    fun environmentToJson() {
      val docTrees = MockDocTrees()
      val result = toJson(MockDocletEnvironment(docTrees))
      assertEquals(result.size, 4)
      assertEquals(result, mapOf(
        "includedElements" to listOf<Any>(),
        "specifiedElements" to listOf<Any>(),
        "sourceVersion" to "RELEASE_0",
        "moduleMode" to "ALL"
      ))
    }
}
