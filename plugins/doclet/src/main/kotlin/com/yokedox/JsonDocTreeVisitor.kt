package com.yokedox

import com.sun.source.doctree.*

fun toJson(tree: DocTree?): JsonValue {
  if (tree == null) {
    return JsonValue(null)
  }
  val base = mutableMapOf<String, Any?>(
    "kind" to tree.kind.name
  )
  base.putAll(JsonDocTreeVisitor().visit(tree))
  return JsonValue(base)

}

fun toJson(list: Iterable<DocTree>): JsonValue {
  return JsonValue(list.map { toJson(it) })
}

class JsonDocTreeVisitor : DocTreeVisitor<JsonObject, Void> {
  fun visit(tree: DocTree): JsonObject {
    return tree.accept(this, null)
  }

  override fun visitAttribute(node: AttributeTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name),
      "value" to toJson(node.value),
      "valueKind" to toJson(node.valueKind.name)
    )
  }

  override fun visitAuthor(node: AuthorTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitComment(node: CommentTree, p: Void?): JsonObject {
    return mapOf(
      "body" to toJson(node.body)
    )
  }

  override fun visitDeprecated(node: DeprecatedTree, p: Void?): JsonObject {
    return mapOf(
      "body" to toJson(node.body),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitDocComment(node: DocCommentTree, p: Void?): JsonObject {
    return mapOf(
      "blockTags" to toJson(node.blockTags),
      "body" to toJson(node.body),
      "firstSentence" to toJson(node.firstSentence),
      "fullBody" to toJson(node.fullBody),
      "postamble" to toJson(node.postamble),
      "preamble" to toJson(node.preamble)
    )
  }

  override fun visitDocRoot(node: DocRootTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitDocType(node: DocTypeTree, p: Void?): JsonObject {
    return mapOf(
      "text" to toJson(node.text)
    )
  }

  override fun visitEndElement(node: EndElementTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name)
    )
  }

  override fun visitEntity(node: EntityTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name)
    )
  }

  override fun visitErroneous(node: ErroneousTree, p: Void?): JsonObject {
    throw Error("Encountered erroneous text: ${node.diagnostic}")
  }

  override fun visitHidden(node: HiddenTree, p: Void?): JsonObject {
    return mapOf(
      "body" to toJson(node.body),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitIdentifier(node: IdentifierTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name)
    )
  }

  override fun visitIndex(node: IndexTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description),
      "searchTerm" to toJson(node.searchTerm)
    )
  }

  override fun visitInheritDoc(node: InheritDocTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitLink(node: LinkTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "label" to toJson(node.label),
      "reference" to toJson(node.reference)
    )
  }

  override fun visitLiteral(node: LiteralTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "body" to toJson(node.body)
    )
  }

  override fun visitParam(node: ParamTree, p: Void?): JsonObject {
    return mapOf(
      "name" to toJson(node.name),
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description),
      "isTypeParameter" to toJson(node.isTypeParameter)
    )
  }

  override fun visitProvides(node: ProvidesTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description),
      "serviceType" to toJson(node.serviceType)
    )
  }

  override fun visitReference(node: ReferenceTree, p: Void?): JsonObject {
    return mapOf(
      "signature" to toJson(node.signature)
    )
  }

  override fun visitReturn(node: ReturnTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description)
    )
  }

  override fun visitSee(node: SeeTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "reference" to toJson(node.reference)
    )
  }

  override fun visitSerial(node: SerialTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description)
    )
  }

  override fun visitSerialData(node: SerialDataTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description)
    )
  }

  override fun visitSerialField(node: SerialFieldTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description),
      "name" to toJson(node.name),
      "type" to toJson(node.type)
    )
  }

  override fun visitSince(node: SinceTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "body" to toJson(node.body)
    )
  }

  override fun visitStartElement(node: StartElementTree, p: Void?): JsonObject {
    return mapOf(
      "attributes" to toJson(node.attributes),
      "name" to toJson(node.name),
      "isSelfClosing" to toJson(node.isSelfClosing)
    )
  }

  override fun visitSummary(node: SummaryTree, p: Void?): JsonObject {
    return mapOf(
      "summary" to toJson(node.summary),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitSystemProperty(node: SystemPropertyTree, p: Void?): JsonObject {
    return mapOf(
      "propertyName" to toJson(node.propertyName),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitText(node: TextTree, p: Void?): JsonObject {
    return mapOf(
      "body" to toJson(node.body)
    )
  }

  override fun visitThrows(node: ThrowsTree, p: Void?): JsonObject {
    return mapOf(
      "description" to toJson(node.description),
      "exceptionName" to toJson(node.exceptionName),
      "tagName" to toJson(node.tagName)
    )
  }

  override fun visitUnknownBlockTag(node: UnknownBlockTagTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "content" to toJson(node.content)
    )
  }

  override fun visitUnknownInlineTag(node: UnknownInlineTagTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "content" to toJson(node.content)
    )
  }

  override fun visitUses(node: UsesTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "description" to toJson(node.description),
      "serviceType" to toJson(node.serviceType)
    )
  }

  override fun visitValue(node: ValueTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "reference" to toJson(node.reference)
    )
  }

  override fun visitVersion(node: VersionTree, p: Void?): JsonObject {
    return mapOf(
      "tagName" to toJson(node.tagName),
      "body" to toJson(node.body)
    )
  }

  override fun visitOther(node: DocTree, p: Void?): JsonObject {
    return mapOf(
      "kind" to toJson(node.kind.name)
    )
  }
}
