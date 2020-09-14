package com.yokedox

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import javax.lang.model.element.*
import javax.lang.model.type.DeclaredType
import javax.lang.model.type.TypeKind
import javax.lang.model.type.TypeMirror

class MockAnnotationValue(private val _value: Any): AnnotationValue {
  override fun getValue(): Any {
    return _value
  }

  override fun <R: Any?, P: Any?> accept(visitor: AnnotationValueVisitor<R, P>, data: P): R {
    return when (_value) {
      is Boolean -> visitor.visitBoolean(_value, data)
      is Byte -> visitor.visitByte(_value, data)
      is Char -> visitor.visitChar(_value, data)
      is Double -> visitor.visitDouble(_value, data)
      is Float -> visitor.visitFloat(_value, data)
      is Int -> visitor.visitInt(_value, data)
      is Long -> visitor.visitLong(_value, data)
      is Short -> visitor.visitShort(_value, data)
      is String -> visitor.visitString(_value, data)
      is TypeMirror -> visitor.visitType(_value, data)
      is VariableElement -> visitor.visitEnumConstant(_value, data)
      is AnnotationMirror -> visitor.visitAnnotation(_value, data)
      is List<*> -> visitor.visitArray(_value.map { it as AnnotationValue }, data)
      else -> throw Error("unknown annotation type: $_value")
    }
  }
}

class JsonAnnotationValueVisitorTest {
  @Before
  @Test fun setUp() {
    docTrees = MockDocTrees()
  }

  @Test fun visitBoolean() {
    val result = toJson(MockAnnotationValue(false))
    assertEquals(result, false)
    assertEquals(result.toJsonString(), "false")
  }

  @Test fun visitByte() {
    val result = toJson(MockAnnotationValue('a'.toByte()))
    assertEquals(result, 'a'.toByte())
    assertEquals("97", result.toJsonString())
  }

  @Test fun visitChar() {
    val result = toJson(MockAnnotationValue('a'))
    assertEquals(result, 'a')
    assertEquals(result.toJsonString(), "\"a\"")
  }

  @Test fun visitDouble() {
    val result = toJson(MockAnnotationValue(1.0))
    assertEquals(result, 1.0)
  }

  @Test fun visitFloat() {
    val result = toJson(MockAnnotationValue(1.0.toFloat()))
    assertEquals(result, 1.0.toFloat())
    assertEquals(result.toJsonString(), "1.0")
  }

  @Test fun visitInt() {
    val result = toJson(MockAnnotationValue(1))
    assertEquals(result, 1)
  }

  @Test fun visitLong() {
    val result = toJson(MockAnnotationValue(1.toLong()))
    assertEquals(result, 1.toLong())
    assertEquals(result.toJsonString(), "1")
  }

  @Test fun visitShort() {
    val result = toJson(MockAnnotationValue(1.toShort()))
    assertEquals(result, 1.toShort())
  }

  @Test fun visitString() {
    val result = toJson(MockAnnotationValue("string"))
    assertEquals(result, "string")
  }

  @Test fun visitType() {
    val result = toJson(MockAnnotationValue(MockPrimitiveType(TypeKind.NONE)))
    assertEquals("""{"kind": "NONE"}""", result.toJsonString())
  }

  @Test fun visitEnumConstant() {
    val result = toJson(MockAnnotationValue(MockVariableElement(ElementKind.LOCAL_VARIABLE, "SOME_CONSTANT_VALUE")))
    assertEquals(result.size, 8)
    assertEquals(result["kind"], "LOCAL_VARIABLE")
    assertEquals(result["simpleName"], "LOCAL_VARIABLE")
    assertEquals(result["annotationMirrors"], listOf<AnnotationMirror>())
    assertEquals(result["modifiers"], listOf<Modifier>())
    assertEquals(result["enclosingElement"], JsonValue(null))
    assertEquals(result["enclosedElements"], listOf<Element>())
    assertEquals(result["docCommentTree"], JsonValue(null))
    assertEquals(result["constantValue"], "SOME_CONSTANT_VALUE")
  }

  @Test fun visitAnnotation() {
    val result = toJson(MockAnnotationValue(object: AnnotationMirror {
      override fun getAnnotationType(): DeclaredType {
        return object: MockTypeMirror(TypeKind.DECLARED), DeclaredType {
          override fun asElement(): Element {
            TODO("Not yet implemented")
          }

          override fun getEnclosingType(): TypeMirror? {
            return null
          }

          override fun getTypeArguments(): MutableList<out TypeMirror> {
            return mutableListOf()
          }
        }
      }

      override fun getElementValues(): MutableMap<out ExecutableElement, out AnnotationValue> {
        return mutableMapOf()
      }
    }))
    assertEquals(result["annotationType"], mapOf(
      "kind" to "DECLARED",
      "enclosingType" to null,
      "typeArguments" to listOf<Any>()
    ))
  }

  @Test fun visitArray() {
    val result = toJson(MockAnnotationValue(mutableListOf(
      MockAnnotationValue(true),
      MockAnnotationValue('a'),
      MockAnnotationValue("some string"),
      MockAnnotationValue(1234)
    )))
    assertEquals(result, listOf(
      true, 'a', "some string", 1234
    ))
  }
}
