package com.yokedox

import com.sun.source.doctree.*
import jdk.jshell.Diag
import org.junit.Test

import org.junit.Assert.*
import java.util.*
import javax.lang.model.element.Name
import javax.tools.Diagnostic
import javax.tools.JavaFileObject
import kotlin.test.assertFails

abstract class MockTree(private val _kind: DocTree.Kind) : DocTree {
  override fun getKind(): DocTree.Kind {
    return _kind
  }

  override fun <R: Any?, D: Any?> accept(visitor: DocTreeVisitor<R, D>, data: D?): R {
    return when(this) {
      is AttributeTree -> visitor.visitAttribute(this, data)
      is AuthorTree -> visitor.visitAuthor(this, data)
      is CommentTree -> visitor.visitComment(this, data)
      is DeprecatedTree -> visitor.visitDeprecated(this, data)
      is DocCommentTree -> visitor.visitDocComment(this, data)
      is DocRootTree -> visitor.visitDocRoot(this, data)
      is DocTypeTree -> visitor.visitDocType(this, data)
      is EndElementTree -> visitor.visitEndElement(this, data)
      is EntityTree -> visitor.visitEntity(this, data)
      is ErroneousTree -> visitor.visitErroneous(this, data)
      is HiddenTree -> visitor.visitHidden(this, data)
      is IdentifierTree -> visitor.visitIdentifier(this, data)
      is IndexTree -> visitor.visitIndex(this, data)
      is InheritDocTree -> visitor.visitInheritDoc(this, data)
      is LinkTree -> visitor.visitLink(this, data)
      is LiteralTree -> visitor.visitLiteral(this, data)
      is ParamTree -> visitor.visitParam(this, data)
      is ProvidesTree -> visitor.visitProvides(this, data)
      is ReferenceTree -> visitor.visitReference(this, data)
      is ReturnTree -> visitor.visitReturn(this, data)
      is SeeTree -> visitor.visitSee(this, data)
      is SerialTree -> visitor.visitSerial(this, data)
      is SerialDataTree -> visitor.visitSerialData(this, data)
      is SerialFieldTree -> visitor.visitSerialField(this, data)
      is SinceTree -> visitor.visitSince(this, data)
      is StartElementTree -> visitor.visitStartElement(this, data)
      is SummaryTree -> visitor.visitSummary(this, data)
      is TextTree -> visitor.visitText(this, data)
      is ThrowsTree -> visitor.visitThrows(this, data)
      is UnknownBlockTagTree -> visitor.visitUnknownBlockTag(this, data)
      is UnknownInlineTagTree -> visitor.visitUnknownInlineTag(this, data)
      is UsesTree -> visitor.visitUses(this, data)
      is ValueTree -> visitor.visitValue(this, data)
      is VersionTree -> visitor.visitVersion(this, data)
      else -> visitor.visitOther(this, data)
    }
  }
}

class MockIdentifierTree(private val _name: String): MockTree(DocTree.Kind.IDENTIFIER), IdentifierTree {
  override fun getName(): Name {
    return makeName(_name)
  }
}

class MockReferenceTree(private val _signature: String): MockTree(DocTree.Kind.REFERENCE), ReferenceTree {
  override fun getSignature(): String {
    return _signature
  }
}

class MockDiagnostic: Diagnostic<JavaFileObject> {
  override fun getKind(): Diagnostic.Kind {
    TODO("Not yet implemented")
  }

  override fun getSource(): JavaFileObject? {
    TODO("Not yet implemented")
  }

  override fun getPosition(): Long {
    TODO("Not yet implemented")
  }

  override fun getStartPosition(): Long {
    TODO("Not yet implemented")
  }

  override fun getEndPosition(): Long {
    TODO("Not yet implemented")
  }

  override fun getLineNumber(): Long {
    TODO("Not yet implemented")
  }

  override fun getColumnNumber(): Long {
    TODO("Not yet implemented")
  }

  override fun getCode(): String {
    TODO("Not yet implemented")
  }

  override fun getMessage(locale: Locale?): String {
    TODO("Not yet implemented")
  }
}

fun makeName(s: String): Name {
  return object: Name {
    override fun get(index: Int): Char {
      return s[index]
    }

    override fun subSequence(startIndex: Int, endIndex: Int): CharSequence {
      return s.subSequence(startIndex, endIndex)
    }

    override fun contentEquals(cs: CharSequence): Boolean {
      return s.contentEquals(cs)
    }

    override val length: Int
      get() = s.length

    override fun toString(): String {
      return s
    }
  }
}

class JsonDocTreeVisitorTest {

  @Test
  fun visitAttribute() {
    val node = object: MockTree(DocTree.Kind.ATTRIBUTE), AttributeTree {
      override fun getName(): Name {
        return makeName("some name")
      }

      override fun getValueKind(): AttributeTree.ValueKind {
        return AttributeTree.ValueKind.SINGLE
      }

      override fun getValue(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "ATTRIBUTE")
    assertEquals(result["name"], "some name")
    assertEquals(result["valueKind"], "SINGLE")
    assertEquals(result["value"], mutableListOf<DocTree>())
  }

  @Test
  fun visitAuthor() {
    val node = object: MockTree(DocTree.Kind.AUTHOR), AuthorTree {
      override fun getTagName(): String {
        return "author"
      }

      override fun getName(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "AUTHOR")
    assertEquals(result["tagName"], "author")
    assertEquals(result["name"], mutableListOf<DocTree>())
  }

  @Test
  fun visitComment() {
    val node = object: MockTree(DocTree.Kind.COMMENT), CommentTree {
      override fun getBody(): String {
        return "this is a body"
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "COMMENT")
    assertEquals(result["body"], "this is a body")
  }

  @Test
  fun visitDeprecated() {
    val node = object: MockTree(DocTree.Kind.DEPRECATED), DeprecatedTree {
      override fun getTagName(): String {
        return "deprecated"
      }

      override fun getBody(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "DEPRECATED")
    assertEquals(result["tagName"], "deprecated")
    assertEquals(result["body"], listOf<DocTree>())
  }

  @Test
  fun visitDocComment() {
    val node = object: MockTree(DocTree.Kind.DOC_COMMENT), DocCommentTree {
      override fun getFirstSentence(): MutableList<out DocTree> {
        return mutableListOf()
      }

      override fun getBody(): MutableList<out DocTree> {
        return mutableListOf()
      }

      override fun getBlockTags(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(7, result.size)
    assertEquals(result["kind"], "DOC_COMMENT")
    assertEquals(result["firstSentence"], listOf<DocTree>())
    assertEquals(result["body"], listOf<DocTree>())
    assertEquals(result["blockTags"], listOf<DocTree>())
    assertEquals(result["preamble"], listOf<DocTree>())
    assertEquals(result["postamble"], listOf<DocTree>())
    assertEquals(result["fullBody"], listOf<DocTree>())
  }

  @Test
  fun visitDocRoot() {
    val node = object: MockTree(DocTree.Kind.DOC_ROOT), DocRootTree {
      override fun getTagName(): String {
        return "root"
      }
    }
    val result = toJson(node)
    assertEquals(2, result.size)
    assertEquals(result["kind"], "DOC_ROOT")
    assertEquals(result["tagName"], "root")
  }

  @Test
  fun visitDocType() {
    val node = object: MockTree(DocTree.Kind.DOC_TYPE), DocTypeTree {
      override fun getText(): String {
        return "some text"
      }
    }
    val result = toJson(node)
    assertEquals(2, result.size)
    assertEquals(result["kind"], "DOC_TYPE")
    assertEquals(result["text"], "some text")
  }

  @Test
  fun visitEndElement() {
    val node = object: MockTree(DocTree.Kind.END_ELEMENT), EndElementTree {
      override fun getName(): Name {
        return makeName("some name")
      }
    }
    val result = toJson(node)
    assertEquals(2, result.size)
    assertEquals(result["kind"], "END_ELEMENT")
    assertEquals(result["name"], "some name")
  }

  @Test
  fun visitEntity() {
    val node = object: MockTree(DocTree.Kind.ENTITY), EntityTree {
      override fun getName(): Name {
        return makeName("some name")
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "ENTITY")
    assertEquals(result["name"], "some name")
  }

  @Test
  fun visitErroneous() {
    val node = object: MockTree(DocTree.Kind.ERRONEOUS), ErroneousTree {
      override fun getBody(): String {
        return "body text"
      }

      override fun getDiagnostic(): Diagnostic<JavaFileObject> {
        return MockDiagnostic()
      }
    }
    assertFails {
      toJson(node)
    }
  }

  @Test
  fun visitHidden() {
    val node = object: MockTree(DocTree.Kind.HIDDEN), HiddenTree {
      override fun getTagName(): String {
        return "hidden"
      }

      override fun getBody(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(3, result.size)
    assertEquals(result["kind"], "HIDDEN")
    assertEquals(result["tagName"], "hidden")
    assertEquals(result["body"], listOf<DocTree>())
  }

  @Test
  fun visitIdentifier() {
    val node = MockIdentifierTree("someName")
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "IDENTIFIER")
    assertEquals(result["name"], "someName")
  }

  @Test
  fun visitIndex() {
    val node = object: MockTree(DocTree.Kind.INDEX), IndexTree {
      override fun getTagName(): String {
        return "index"
      }

      override fun getSearchTerm(): DocTree {
        return object: MockTree(DocTree.Kind.ENTITY), EntityTree {
          override fun getName(): Name {
            return makeName("search term")
          }
        }
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "INDEX")
    assertEquals(result["tagName"], "index")
    assertEquals(result["searchTerm"], mapOf(
      "kind" to "ENTITY",
      "name" to "search term"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitInheritDoc() {
    val node = object: MockTree(DocTree.Kind.INHERIT_DOC), InheritDocTree {
      override fun getTagName(): String {
        return "inherit"
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "INHERIT_DOC")
    assertEquals(result["tagName"], "inherit")
  }

  @Test
  fun visitLink() {
    val node = object: MockTree(DocTree.Kind.LINK), LinkTree {
      override fun getTagName(): String {
        return "link"
      }

      override fun getReference(): ReferenceTree {
        return MockReferenceTree("some signature")
      }

      override fun getLabel(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "LINK")
    assertEquals(result["tagName"], "link")
    assertEquals(result["reference"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "some signature"
    ))
    assertEquals(result["label"], listOf<DocTree>())
  }

  @Test
  fun visitLiteral() {
    val node = object: MockTree(DocTree.Kind.LITERAL), LiteralTree {
      override fun getTagName(): String {
        return "literal"
      }

      override fun getBody(): TextTree {
        return object: MockTree(DocTree.Kind.TEXT), TextTree {
          override fun getBody(): String {
            return "some body"
          }
        }
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "LITERAL")
    assertEquals(result["tagName"], "literal")
    assertEquals(result["body"], mapOf(
      "kind" to "TEXT",
      "body" to "some body"
    ))
  }

  @Test
  fun visitOther() {
    val node = object: MockTree(DocTree.Kind.OTHER) {
    }
    val result = toJson(node)
    assertEquals(result.size, 1)
    assertEquals(result["kind"], "OTHER")
  }

  @Test
  fun visitParam() {
    val node = object: MockTree(DocTree.Kind.PARAM), ParamTree {
      override fun getTagName(): String {
        return "param"
      }

      override fun isTypeParameter(): Boolean {
        return true
      }

      override fun getName(): IdentifierTree {
        return MockIdentifierTree("someName")
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 5)
    assertEquals(result["kind"], "PARAM")
    assertEquals(result["tagName"], "param")
    assertEquals(result["isTypeParameter"], true)
    assertEquals(result["name"], mapOf(
      "kind" to "IDENTIFIER",
      "name" to "someName"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitProvides() {
    val node = object: MockTree(DocTree.Kind.PROVIDES), ProvidesTree {
      override fun getTagName(): String {
        return "provides"
      }

      override fun getServiceType(): ReferenceTree {
        return MockReferenceTree("someServiceType")
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "PROVIDES")
    assertEquals(result["tagName"], "provides")
    assertEquals(result["serviceType"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "someServiceType"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitReference() {
    val node = MockReferenceTree("someSignature")
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "REFERENCE")
    assertEquals(result["signature"], "someSignature")
  }

  @Test
  fun visitReturn() {
    val node = object: MockTree(DocTree.Kind.RETURN), ReturnTree {
      override fun getTagName(): String {
        return "return"
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "RETURN")
    assertEquals(result["tagName"], "return")
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitSee() {
    val node = object: MockTree(DocTree.Kind.SEE), SeeTree {
      override fun getTagName(): String {
        return "see"
      }

      override fun getReference(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "SEE")
    assertEquals(result["tagName"], "see")
    assertEquals(result["reference"], listOf<DocTree>())
  }

  @Test
  fun visitSerial() {
    val node = object: MockTree(DocTree.Kind.SERIAL), SerialTree {
      override fun getTagName(): String {
        return "serial"
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "SERIAL")
    assertEquals(result["tagName"], "serial")
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitSerialData() {
    val node = object: MockTree(DocTree.Kind.SERIAL_DATA), SerialDataTree {
      override fun getTagName(): String {
        return "serialdata"
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "SERIAL_DATA")
    assertEquals(result["tagName"], "serialdata")
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitSerialField() {
    val node = object: MockTree(DocTree.Kind.SERIAL_FIELD), SerialFieldTree {
      override fun getTagName(): String {
        return "serialField"
      }

      override fun getName(): IdentifierTree {
        return MockIdentifierTree("serial name")
      }

      override fun getType(): ReferenceTree {
        return MockReferenceTree("some type")
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 5)
    assertEquals(result["kind"], "SERIAL_FIELD")
    assertEquals(result["tagName"], "serialField")
    assertEquals(result["name"], mapOf(
      "kind" to "IDENTIFIER",
      "name" to "serial name"
    ))
    assertEquals(result["type"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "some type"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitSince() {
    val node = object: MockTree(DocTree.Kind.SINCE), SinceTree {
      override fun getTagName(): String {
        return "since"
      }

      override fun getBody(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "SINCE")
    assertEquals(result["tagName"], "since")
    assertEquals(result["body"], listOf<DocTree>())
  }

  @Test
  fun visitStartElement() {
    val node = object: MockTree(DocTree.Kind.START_ELEMENT), StartElementTree {
      override fun getName(): Name {
        return makeName("someName")
      }

      override fun getAttributes(): MutableList<out DocTree> {
        return mutableListOf()
      }

      override fun isSelfClosing(): Boolean {
        return true
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "START_ELEMENT")
    assertEquals(result["name"], "someName")
    assertEquals(result["attributes"], listOf<DocTree>())
    assertEquals(result["isSelfClosing"], true)
  }

  @Test
  fun visitSummary() {
    val node = object: MockTree(DocTree.Kind.SUMMARY), SummaryTree {
      override fun getTagName(): String {
        return "summary"
      }

      override fun getSummary(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "SUMMARY")
    assertEquals(result["tagName"], "summary")
    assertEquals(result["summary"], listOf<DocTree>())
  }

  @Test
  fun visitText() {
    val node = object: MockTree(DocTree.Kind.TEXT), TextTree {
      override fun getBody(): String {
        return "some body"
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "TEXT")
    assertEquals(result["body"], "some body")
  }

  @Test
  fun visitThrows() {
    val node = object: MockTree(DocTree.Kind.THROWS), ThrowsTree {
      override fun getTagName(): String {
        return "throws"
      }

      override fun getExceptionName(): ReferenceTree {
        return MockReferenceTree("someException")
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "THROWS")
    assertEquals(result["tagName"], "throws")
    assertEquals(result["exceptionName"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "someException"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitUnknownBlockTag() {
    val node = object : MockTree(DocTree.Kind.UNKNOWN_BLOCK_TAG), UnknownBlockTagTree {
      override fun getTagName(): String {
        return "someUnknownTag"
      }

      override fun getContent(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "UNKNOWN_BLOCK_TAG")
    assertEquals(result["tagName"], "someUnknownTag")
    assertEquals(result["content"], listOf<DocTree>())
  }

  @Test
  fun visitUnknownInlineTag() {
    val node = object: MockTree(DocTree.Kind.UNKNOWN_INLINE_TAG), UnknownInlineTagTree {
      override fun getTagName(): String {
        return "someUnknownInlineTag"
      }

      override fun getContent(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "UNKNOWN_INLINE_TAG")
    assertEquals(result["tagName"], "someUnknownInlineTag")
    assertEquals(result["content"], listOf<DocTree>())
  }

  @Test
  fun visitUses() {
    val node = object: MockTree(DocTree.Kind.USES), UsesTree {
      override fun getTagName(): String {
        return "uses"
      }

      override fun getServiceType(): ReferenceTree {
        return MockReferenceTree("someServiceType")
      }

      override fun getDescription(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "USES")
    assertEquals(result["tagName"], "uses")
    assertEquals(result["serviceType"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "someServiceType"
    ))
    assertEquals(result["description"], listOf<DocTree>())
  }

  @Test
  fun visitValue() {
    val node = object: MockTree(DocTree.Kind.VALUE), ValueTree {
      override fun getTagName(): String {
        return "value"
      }

      override fun getReference(): ReferenceTree {
        return MockReferenceTree("someValueReference")
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "VALUE")
    assertEquals(result["tagName"], "value")
    assertEquals(result["reference"], mapOf(
      "kind" to "REFERENCE",
      "signature" to "someValueReference"
    ))
  }

  @Test
  fun visitVersion() {
    val node = object: MockTree(DocTree.Kind.VERSION), VersionTree {
      override fun getTagName(): String {
        return "version"
      }

      override fun getBody(): MutableList<out DocTree> {
        return mutableListOf()
      }
    }
    val result = toJson(node)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "VERSION")
    assertEquals(result["tagName"], "version")
    assertEquals(result["body"], listOf<DocTree>())
  }
}
