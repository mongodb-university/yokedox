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
      is DocTree -> visitor.visitOther(this, data)
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
      else -> throw Error("Unsupported tree: $this")
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
      assertEquals(result["kind"], "ATTRIBUTE")
      assertEquals(result["name"], "some name")
      assertEquals(result["valueKind"], "SINGLE")
      assertEquals(result["value"], mutableListOf<DocTree>())
    }

    @Test
    fun visitAuthor() {
    }

    @Test
    fun visitComment() {
    }

    @Test
    fun visitDeprecated() {
    }

    @Test
    fun visitDocComment() {
    }

    @Test
    fun visitDocRoot() {
    }

    @Test
    fun visitDocType() {
    }

    @Test
    fun visitEndElement() {
    }

    @Test
    fun visitEntity() {
    }

    @Test
    fun visitErroneous() {
    }

    @Test
    fun visitHidden() {
    }

    @Test
    fun visitIdentifier() {
    }

    @Test
    fun visitIndex() {
    }

    @Test
    fun visitInheritDoc() {
    }

    @Test
    fun visitLink() {
    }

    @Test
    fun visitLiteral() {
    }

    @Test
    fun visitParam() {
    }

    @Test
    fun visitProvides() {
    }

    @Test
    fun visitReference() {
    }

    @Test
    fun visitReturn() {
    }

    @Test
    fun visitSee() {
    }

    @Test
    fun visitSerial() {
    }

    @Test
    fun visitSerialData() {
    }

    @Test
    fun visitSerialField() {
    }

    @Test
    fun visitSince() {
    }

    @Test
    fun visitStartElement() {
    }

    @Test
    fun visitSummary() {
    }

    @Test
    fun visitSystemProperty() {
    }

    @Test
    fun visitText() {
    }

    @Test
    fun visitThrows() {
    }

    @Test
    fun visitUnknownBlockTag() {
    }

    @Test
    fun visitUnknownInlineTag() {
    }

    @Test
    fun visitUses() {
    }

    @Test
    fun visitValue() {
    }

    @Test
    fun visitVersion() {
    }

    @Test
    fun visitOther() {
    }
}
