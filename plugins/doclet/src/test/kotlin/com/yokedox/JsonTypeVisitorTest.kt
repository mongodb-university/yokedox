package com.yokedox

import org.junit.Test

import org.junit.Assert.*
import javax.lang.model.element.AnnotationMirror
import javax.lang.model.element.Element
import javax.lang.model.type.*

abstract class MockTypeMirror(private val _kind: TypeKind): TypeMirror {
  override fun getAnnotationMirrors(): MutableList<out AnnotationMirror> {
    return mutableListOf()
  }

  override fun <A: Annotation?> getAnnotation(annotationType: Class<A>?): A {
    TODO("Not yet implemented")
  }

  override fun <A: Annotation?> getAnnotationsByType(annotationType: Class<A>?): Array<A> {
    TODO("Not yet implemented")
  }

  override fun getKind(): TypeKind {
    return _kind
  }

  override fun <R: Any?, P: Any?> accept(visitor: TypeVisitor<R, P>, data: P): R {
    return when (this) {
      is PrimitiveType -> visitor.visitPrimitive(this, data)
      is NullType -> visitor.visitNull(this, data)
      is ArrayType -> visitor.visitArray(this, data)
      is DeclaredType -> visitor.visitDeclared(this, data)
      is ErrorType -> visitor.visitError(this, data)
      is TypeVariable -> visitor.visitTypeVariable(this, data)
      is WildcardType -> visitor.visitWildcard(this, data)
      is ExecutableType -> visitor.visitExecutable(this, data)
      is NoType -> visitor.visitNoType(this, data)
      is UnionType -> visitor.visitUnion(this, data)
      is IntersectionType -> visitor.visitIntersection(this, data)
      else -> throw Error("unknown type: $this")
    }
  }
}

class MockPrimitiveType(kind: TypeKind): MockTypeMirror(kind), PrimitiveType

class JsonTypeVisitorTest {

  @Test
  fun visitPrimitive() {
    val type = MockPrimitiveType(TypeKind.BOOLEAN)
    val result = toJson(type)
    // "Primitive" can represent boolean, byte, short, int, long, char, float, and double.
    assertEquals(result.size, 1)
    assertEquals(result["kind"], "BOOLEAN")
  }

  @Test
  fun visitNull() {
    val type = object: MockTypeMirror(TypeKind.NULL), NullType {
    }
    val result = toJson(type)
    assertEquals(result.size, 1)
    assertEquals(result["kind"], "NULL")
  }

  @Test
  fun visitArray() {
    val type = object: MockTypeMirror(TypeKind.ARRAY), ArrayType {
      override fun getComponentType(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT)
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "ARRAY")
    assertEquals(result["componentType"], mapOf(
      "kind" to "INT"
    ))
  }

  @Test
  fun visitDeclared() {
    val type = object: MockTypeMirror(TypeKind.DECLARED), DeclaredType {
      override fun asElement(): Element {
        TODO("Not yet implemented")
      }

      override fun getEnclosingType(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT)
      }

      override fun getTypeArguments(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "DECLARED")
    assertEquals(result["enclosingType"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["typeArguments"], listOf<TypeMirror>())
  }

  @Test
  fun visitError() {
    val type = object: MockTypeMirror(TypeKind.ERROR), ErrorType {
      override fun asElement(): Element {
        TODO("Not yet implemented")
      }

      override fun getEnclosingType(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT)
      }

      override fun getTypeArguments(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "ERROR")
    assertEquals(result["enclosingType"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["typeArguments"], listOf<TypeMirror>())
  }


  @Test
  fun visitTypeVariable() {
    val type = object: MockTypeMirror(TypeKind.TYPEVAR), TypeVariable {
      override fun asElement(): Element {
        TODO("Not yet implemented")
      }

      override fun getUpperBound(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT);
      }

      override fun getLowerBound(): TypeMirror {
        return MockPrimitiveType(TypeKind.FLOAT);
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "TYPEVAR")
    assertEquals(result["upperBound"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["lowerBound"], mapOf(
      "kind" to "FLOAT"
    ))
  }

  @Test
  fun visitWildcard() {
    val type = object: MockTypeMirror(TypeKind.WILDCARD), WildcardType {
      override fun getExtendsBound(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT);
      }

      override fun getSuperBound(): TypeMirror {
        return MockPrimitiveType(TypeKind.FLOAT);
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 3)
    assertEquals(result["extendsBound"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["superBound"], mapOf(
      "kind" to "FLOAT"
    ))
  }

  @Test
  fun visitExecutable() {
    val type = object: MockTypeMirror(TypeKind.EXECUTABLE), ExecutableType {
      override fun getTypeVariables(): MutableList<out TypeVariable> {
        return mutableListOf()
      }

      override fun getReturnType(): TypeMirror {
        return MockPrimitiveType(TypeKind.INT)
      }

      override fun getParameterTypes(): MutableList<out TypeMirror> {
        return mutableListOf(
          MockPrimitiveType(TypeKind.INT),
          MockPrimitiveType(TypeKind.FLOAT),
          MockPrimitiveType(TypeKind.BOOLEAN)
        )
      }

      override fun getReceiverType(): TypeMirror {
        return MockPrimitiveType(TypeKind.BYTE)
      }

      override fun getThrownTypes(): MutableList<out TypeMirror> {
        return mutableListOf()
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 6)
    assertEquals(result["kind"], "EXECUTABLE")
    assertEquals(result["typeVariables"], listOf<TypeVariable>())
    assertEquals(result["returnType"], mapOf(
      "kind" to "INT"
    ))
    assertEquals(result["parameterTypes"], listOf(
      mapOf("kind" to "INT"),
      mapOf("kind" to "FLOAT"),
      mapOf("kind" to "BOOLEAN")
    ))
    assertEquals(result["receiverType"], mapOf("kind" to "BYTE"))
    assertEquals(result["thrownTypes"], listOf<TypeMirror>())
  }

  @Test
  fun visitNoType() {
    val type = object: MockTypeMirror(TypeKind.NONE), NoType {
    }
    val result = toJson(type)
    assertEquals(result.size, 1)
    assertEquals(result["kind"], "NONE")
  }

  @Test
  fun visitUnion() {
    val type = object: MockTypeMirror(TypeKind.UNION), UnionType {
      override fun getAlternatives(): MutableList<out TypeMirror> {
        return mutableListOf(
          MockPrimitiveType(TypeKind.INT),
          MockPrimitiveType(TypeKind.FLOAT),
          MockPrimitiveType(TypeKind.BOOLEAN)
        )
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "UNION")
    assertEquals(result["alternatives"], listOf(
      mapOf("kind" to "INT"),
      mapOf("kind" to "FLOAT"),
      mapOf("kind" to "BOOLEAN")
    ))
  }

  @Test
  fun visitIntersection() {
    val type = object: MockTypeMirror(TypeKind.INTERSECTION), IntersectionType {
      override fun getBounds(): MutableList<out TypeMirror> {
        return mutableListOf(
          MockPrimitiveType(TypeKind.INT),
          MockPrimitiveType(TypeKind.FLOAT),
          MockPrimitiveType(TypeKind.BOOLEAN)
        )
      }
    }
    val result = toJson(type)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "INTERSECTION")
  }
}
