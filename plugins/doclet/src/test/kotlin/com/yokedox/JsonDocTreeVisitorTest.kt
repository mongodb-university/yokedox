package com.yokedox

import com.sun.source.doctree.*
import org.junit.Test

import org.junit.Assert.*
import javax.lang.model.element.Name

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

  /*
  @Test
  fun visitDeprecated() {
    val node = object: MockTree(DocTree.Kind.DEPRECATED), DeprecatedTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "DEPRECATED")
  }

  @Test
  fun visitDocComment() {
    val node = object: MockTree(DocTree.Kind.DOC_COMMENT), DocCommentTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "DOC_COMMENT")
  }

  @Test
  fun visitDocRoot() {
    val node = object: MockTree(DocTree.Kind.DOC_ROOT), DocRootTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "DOC_ROOT")
  }

  @Test
  fun visitDocType() {
    val node = object: MockTree(DocTree.Kind.DOC_TYPE), DocTypeTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "DOC_TYPE")
  }

  @Test
  fun visitEndElement() {
    val node = object: MockTree(DocTree.Kind.END_ELEMENT), EndElementTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "END_ELEMENT")
  }

  @Test
  fun visitEntity() {
    val node = object: MockTree(DocTree.Kind.ENTITY), EntityTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "ENTITY")
  }

  @Test
  fun visitErroneous() {
    val node = object: MockTree(DocTree.Kind.ERRONEOUS), ErroneousTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "ERRONEOUS")
  }

  @Test
  fun visitHidden() {
    val node = object: MockTree(DocTree.Kind.HIDDEN), HiddenTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "HIDDEN")
  }

  @Test
  fun visitIdentifier() {
    val node = object: MockTree(DocTree.Kind.IDENTIFIER), IdentifierTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "IDENTIFIER")
  }

  @Test
  fun visitIndex() {
    val node = object: MockTree(DocTree.Kind.INDEX), IndexTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "INDEX")
  }

  @Test
  fun visitInheritDoc() {
    val node = object: MockTree(DocTree.Kind.INHERIT_DOC), InheritDocTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "INHERIT_DOC")
  }

  @Test
  fun visitLink() {
    val node = object: MockTree(DocTree.Kind.LINK), LinkTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "LINK")
  }

  @Test
  fun visitLiteral() {
    val node = object: MockTree(DocTree.Kind.LITERAL), LiteralTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "LITERAL")
  }

  @Test
  fun visitOther() {
    val node = object: MockTree(DocTree.Kind.OTHER), OtherTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "OTHER")
  }

  @Test
  fun visitParam() {
    val node = object: MockTree(DocTree.Kind.PARAM), ParamTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "PARAM")
  }

  @Test
  fun visitProvides() {
    val node = object: MockTree(DocTree.Kind.PROVIDES), ProvidesTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "PROVIDES")
  }

  @Test
  fun visitReference() {
    val node = object: MockTree(DocTree.Kind.REFERENCE), ReferenceTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "REFERENCE")
  }

  @Test
  fun visitReturn() {
    val node = object: MockTree(DocTree.Kind.RETURN), ReturnTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "RETURN")
  }

  @Test
  fun visitSee() {
    val node = object: MockTree(DocTree.Kind.SEE), SeeTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SEE")
  }

  @Test
  fun visitSerial() {
    val node = object: MockTree(DocTree.Kind.SERIAL), SerialTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SERIAL")
  }

  @Test
  fun visitSerialData() {
    val node = object: MockTree(DocTree.Kind.SERIAL_DATA), SerialDataTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SERIAL_DATA")
  }

  @Test
  fun visitSerialField() {
    val node = object: MockTree(DocTree.Kind.SERIAL_FIELD), SerialFieldTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SERIAL_FIELD")
  }

  @Test
  fun visitSince() {
    val node = object: MockTree(DocTree.Kind.SINCE), SinceTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SINCE")
  }

  @Test
  fun visitStartElement() {
    val node = object: MockTree(DocTree.Kind.START_ELEMENT), StartElementTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "START_ELEMENT")
  }

  @Test
  fun visitSummary() {
    val node = object: MockTree(DocTree.Kind.SUMMARY), SummaryTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "SUMMARY")
  }

  @Test
  fun visitText() {
    val node = object: MockTree(DocTree.Kind.TEXT), TextTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "TEXT")
  }

  @Test
  fun visitThrows() {
    val node = object: MockTree(DocTree.Kind.THROWS), ThrowsTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "THROWS")
  }

  @Test
  fun visitUnknownBlockTag() {
    val node = object: MockTree(DocTree.Kind.UNKNOWN_BLOCK_TAG), UnknownBlockTagTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "UNKNOWN_BLOCK_TAG")
  }

  @Test
  fun visitUnknownInlineTag() {
    val node = object: MockTree(DocTree.Kind.UNKNOWN_INLINE_TAG), UnknownInlineTagTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "UNKNOWN_INLINE_TAG")
  }

  @Test
  fun visitUses() {
    val node = object: MockTree(DocTree.Kind.USES), UsesTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "USES")
  }

  @Test
  fun visitValue() {
    val node = object: MockTree(DocTree.Kind.VALUE), ValueTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "VALUE")
  }

  @Test
  fun visitVersion() {
    val node = object: MockTree(DocTree.Kind.VERSION), VersionTree {
    }
    val result = toJson(node)
    assertEquals(result["kind"], "VERSION")
  }
*/
}
