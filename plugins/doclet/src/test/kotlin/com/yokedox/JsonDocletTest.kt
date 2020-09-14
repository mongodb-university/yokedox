package com.yokedox

import com.sun.source.doctree.DocCommentTree
import com.sun.source.doctree.DocTree
import com.sun.source.tree.*
import com.sun.source.util.*
import jdk.javadoc.doclet.Doclet
import jdk.javadoc.doclet.DocletEnvironment
import org.junit.Test

import org.junit.Assert.*
import java.text.BreakIterator
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
    fun getSupportedOptions() {
      assertEquals(setOf<Doclet.Option>(), JsonDoclet().supportedOptions)
    }

    @Test
    fun getSupportedSourceVersion() {
      assertEquals(SourceVersion.RELEASE_0, JsonDoclet().supportedSourceVersion)
    }

    @Test
    fun run() {
      val docTrees = MockDocTrees()
      val environment = MockDocletEnvironment(docTrees)
      assert(JsonDoclet().run(environment))
    }
}
