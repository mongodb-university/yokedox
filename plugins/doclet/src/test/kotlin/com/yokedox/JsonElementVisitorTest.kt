package com.yokedox

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import javax.lang.model.AnnotatedConstruct
import javax.lang.model.element.*
import javax.lang.model.type.TypeKind
import javax.lang.model.type.TypeMirror

abstract class MockAnnotatedConstruct: AnnotatedConstruct {
  override fun getAnnotationMirrors(): MutableList<out AnnotationMirror> {
    return mutableListOf()
  }

  override fun <A : Annotation?> getAnnotation(annotationType: Class<A>?): A {
    TODO("Not yet implemented")
  }

  override fun <A : Annotation?> getAnnotationsByType(annotationType: Class<A>?): Array<A> {
    TODO("Not yet implemented")
  }
}

abstract class MockElement(
  private val _kind: ElementKind,
  private val _simpleName: Name = makeName(_kind.name),
  private val _modifiers: MutableSet<Modifier> = mutableSetOf(),
  private val _enclosingElement: Element? = null,
  private val _enclosedElements: MutableList<out Element> = mutableListOf()
): Element, MockAnnotatedConstruct() {
  override fun asType(): TypeMirror {
    TODO("Not yet implemented")
  }

  override fun getKind(): ElementKind {
    return _kind
  }

  override fun getModifiers(): MutableSet<Modifier> {
    return _modifiers
  }

  override fun getSimpleName(): Name {
    return _simpleName
  }

  override fun getEnclosingElement(): Element? {
    return _enclosingElement
  }

  override fun getEnclosedElements(): MutableList<out Element> {
    return _enclosedElements
  }

  override fun <R : Any?, P : Any?> accept(visitor: ElementVisitor<R, P>, data: P): R {
    return when (this) {
      is PackageElement -> visitor.visitPackage(this, data)
      is TypeElement -> visitor.visitType(this, data)
      is VariableElement -> visitor.visitVariable(this, data)
      is ExecutableElement -> visitor.visitExecutable(this, data)
      is TypeParameterElement -> visitor.visitTypeParameter(this, data)
      is ModuleElement -> visitor.visitModule(this, data)
      else -> throw Error("unknown Element type: $this")
    }
  }
}

class MockVariableElement(kind: ElementKind, private val _constantValue: Any?): MockElement(kind), VariableElement {
  override fun getConstantValue(): Any? {
    return _constantValue
  }
}

class JsonElementVisitorTest {
  @Before fun setUp() {
    docTrees = MockDocTrees()
  }

  @Test fun testBaseProperties() {
    val element = object: MockElement(
      ElementKind.PACKAGE,
      makeName("some other simple name"),
      mutableSetOf(
        Modifier.DEFAULT,
        Modifier.ABSTRACT,
        Modifier.FINAL,
        Modifier.TRANSIENT
      ),
      MockVariableElement(ElementKind.CLASS, "EnclosingClass"),
      mutableListOf(
        MockVariableElement(ElementKind.LOCAL_VARIABLE, "SOME_CONSTANT"),
        MockVariableElement(ElementKind.ENUM, "SOME_OTHER_CONSTANT")
      )
    ), PackageElement {
      override fun getQualifiedName(): Name {
        return makeName("arbitrarily.chosen.type")
      }

      override fun isUnnamed(): Boolean {
        return false
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 9)
    assertEquals(result["kind"], "PACKAGE")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf(
      "DEFAULT", "ABSTRACT", "FINAL", "TRANSIENT"
    ))
    assertEquals(result["simpleName"], "some other simple name")
    assertEquals(result["enclosedElements"], listOf(
      mapOf(
        "kind" to "LOCAL_VARIABLE",
        "annotationMirrors" to listOf<Any>(),
        "modifiers" to listOf<Any>(),
        "simpleName" to "LOCAL_VARIABLE",
        "enclosingElement" to null,
        "enclosedElements" to listOf<Any>(),
        "docCommentTree" to null,
        "constantValue" to "SOME_CONSTANT"
      ), mapOf(
      "kind" to "ENUM",
      "annotationMirrors" to listOf<Any>(),
      "modifiers" to listOf<Any>(),
      "simpleName" to "ENUM",
      "enclosingElement" to null,
      "enclosedElements" to listOf<Any>(),
      "docCommentTree" to null,
      "constantValue" to "SOME_OTHER_CONSTANT"
    )))
    assertEquals(result["enclosingElement"], mapOf(
      "kind" to "CLASS",
      "simpleName" to "CLASS",
      "isReference" to true
    ))
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["qualifiedName"], "arbitrarily.chosen.type")
    assertEquals(result["isUnnamed"], false)
  }

  @Test fun visitPackage() {
    val element = object: MockElement(ElementKind.PACKAGE), PackageElement {
      override fun getQualifiedName(): Name {
        return makeName("some.qualified.name")
      }

      override fun isUnnamed(): Boolean {
        return false
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 9)
    assertEquals(result["kind"], "PACKAGE")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["simpleName"], "PACKAGE")
    assertEquals(result["enclosedElements"], listOf<Element>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["qualifiedName"], "some.qualified.name")
    assertEquals(result["isUnnamed"], false)
  }

  @Test fun visitType() {
    val element = object: MockElement(ElementKind.CLASS), TypeElement {
      override fun getTypeParameters(): MutableList<out TypeParameterElement> {
        return mutableListOf()
      }

      override fun getQualifiedName(): Name {
        return makeName("some.qualified.name")
      }

      override fun getNestingKind(): NestingKind {
        return NestingKind.ANONYMOUS
      }

      override fun getSuperclass(): TypeMirror? {
        return null
      }

      override fun getInterfaces(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 12)
    assertEquals(result["kind"], "CLASS")
    assertEquals(result["simpleName"], "CLASS")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["enclosedElements"], listOf<Element>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["qualifiedName"], "some.qualified.name")
    assertEquals(result["nestingKind"], "ANONYMOUS")
    assertEquals(result["superclass"], JsonValue(null))
  }

  @Test fun visitVariable() {
    val element = MockVariableElement(ElementKind.LOCAL_VARIABLE, 1234)
    val result = toJson(element)
    assertEquals(result.size, 8)
    assertEquals(result["kind"], "LOCAL_VARIABLE")
    assertEquals(result["simpleName"], "LOCAL_VARIABLE")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["enclosedElements"], listOf<Any>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["constantValue"], 1234)
  }

  @Test fun visitExecutable() {
    val element = object: MockElement(ElementKind.METHOD), ExecutableElement {
      override fun getTypeParameters(): MutableList<out TypeParameterElement> {
        return mutableListOf()
      }

      override fun getReturnType(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT)
      }

      override fun getParameters(): MutableList<out VariableElement> {
        return mutableListOf()
      }

      override fun getReceiverType(): TypeMirror {
        return MockPrimitiveType(TypeKind.BOOLEAN)
      }

      override fun isVarArgs(): Boolean {
        return false
      }

      override fun isDefault(): Boolean {
        return false
      }

      override fun getThrownTypes(): MutableList<out TypeMirror> {
        return mutableListOf()
      }

      override fun getDefaultValue(): AnnotationValue? {
        return MockAnnotationValue("some annotation")
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 15)
    assertEquals(result["kind"], "METHOD")
    assertEquals(result["simpleName"], "METHOD")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["enclosedElements"], listOf<Any>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["typeParameters"], listOf<Any>())
    assertEquals(result["returnType"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["parameters"], listOf<Any>())
    assertEquals(result["receiverType"], mapOf(
      "kind" to "BOOLEAN"
    ))
    assertEquals(result["isVarArgs"], false)
    assertEquals(result["isDefault"], false)
    assertEquals(result["thrownTypes"], listOf<Any>())
    assertEquals(result["defaultValue"], "some annotation")
  }

  @Test fun visitTypeParameter() {
    val element = object: MockElement(ElementKind.TYPE_PARAMETER), TypeParameterElement {
      override fun getGenericElement(): Element {
        return MockVariableElement(ElementKind.LOCAL_VARIABLE, JsonValue(null))
      }

      override fun getBounds(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 9)
    assertEquals(result["kind"], "TYPE_PARAMETER")
    assertEquals(result["simpleName"], "TYPE_PARAMETER")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["enclosedElements"], listOf<Any>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["genericElement"], mapOf(
      "kind" to "LOCAL_VARIABLE",
      "simpleName" to "LOCAL_VARIABLE",
      "isReference" to true
    ))
    assertEquals(result["bounds"], listOf<Any>())
    assertEquals(result.keys, setOf(
      "kind", "annotationMirrors", "modifiers", "simpleName", "enclosingElement", "enclosedElements", "docCommentTree", "bounds", "genericElement"
    ))
  }

  @Test fun visitModule() {
    val element = object: MockElement(ElementKind.MODULE), ModuleElement {
      override fun getQualifiedName(): Name {
        return makeName("some.qualified.name")
      }

      override fun isOpen(): Boolean {
        return true
      }

      override fun isUnnamed(): Boolean {
        return false
      }

      override fun getDirectives(): MutableList<out ModuleElement.Directive> {
        return mutableListOf()
      }
    }
    val result = toJson(element)
    assertEquals(result.size, 11)
    assertEquals(result["kind"], "MODULE")
    assertEquals(result["simpleName"], "MODULE")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["qualifiedName"], "some.qualified.name")
    assertEquals(result["isOpen"], true)
    assertEquals(result["isUnnamed"], false)
    assertEquals(result["directives"], listOf<Any>())
    assertEquals(result["enclosedElements"], listOf<Any>())
    assertEquals(result["enclosingElement"], null)
  }

  @Test fun typeParameterInfiniteLoop() {
    val element = object: MockElement(ElementKind.CLASS), TypeElement {
      override fun getTypeParameters(): MutableList<out TypeParameterElement> {
        return mutableListOf(
          object : MockElement(ElementKind.TYPE_PARAMETER), TypeParameterElement {
            override fun getGenericElement(): Element {
              return this // cyclical reference!
            }

            override fun getBounds(): MutableList<out TypeMirror> {
              return mutableListOf()
            }
          }
        )
      }

      override fun getQualifiedName(): Name {
        return makeName("some.qualified.name")
      }

      override fun getNestingKind(): NestingKind {
        return NestingKind.ANONYMOUS
      }

      override fun getSuperclass(): TypeMirror? {
        return null
      }

      override fun getInterfaces(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    toJson(element)
  }

}
