package com.yokedox

import javax.lang.model.element.AnnotationMirror
import javax.lang.model.element.AnnotationValue
import javax.lang.model.element.VariableElement
import javax.lang.model.type.TypeMirror
import javax.lang.model.util.AbstractAnnotationValueVisitor9

fun toJson(annotationValue: AnnotationValue): JsonValue {
  return JsonAnnotationValueVisitor().visit(annotationValue);
}

fun toJson(list: Iterable<AnnotationValue>): JsonValue {
  return JsonValue(list.map { toJson(it) })
}

@JvmName("toJsonIterableAnnotationMirror")
fun toJson(list: Iterable<AnnotationMirror>): JsonValue {
  return JsonValue(list.map { toJson(it) })
}

fun toJson(mirror: AnnotationMirror): JsonValue {
  return JsonValue(mapOf(
    "annotationType" to toJson(mirror.annotationType)
  ))
}

class JsonAnnotationValueVisitor : AbstractAnnotationValueVisitor9<JsonValue, Void>() {
  override fun visitBoolean(b: Boolean, p: Void?): JsonValue {
    return JsonValue(b)
  }

  override fun visitByte(b: Byte, p: Void?): JsonValue {
    return JsonValue(b)
  }

  override fun visitChar(c: Char, p: Void?): JsonValue {
    return JsonValue(c)
  }

  override fun visitDouble(d: Double, p: Void?): JsonValue {
    return JsonValue(d)
  }

  override fun visitFloat(f: Float, p: Void?): JsonValue {
    return JsonValue(f)
  }

  override fun visitInt(i: Int, p: Void?): JsonValue {
    return JsonValue(i)
  }

  override fun visitLong(i: Long, p: Void?): JsonValue {
    return JsonValue(i)
  }

  override fun visitShort(s: Short, p: Void?): JsonValue {
    return JsonValue(s)
  }

  override fun visitString(s: String, p: Void?): JsonValue {
    return JsonValue(s)
  }

  override fun visitType(t: TypeMirror, p: Void?): JsonValue {
    return toJson(t)
  }

  override fun visitEnumConstant(c: VariableElement, p: Void?): JsonValue {
    return toJson(c)
  }

  override fun visitAnnotation(a: AnnotationMirror, p: Void?): JsonValue {
    return JsonValue(null) // TODO: Ignoring annotation mirrors until finding out whether they are actually useful
  }

  override fun visitArray(vals: MutableList<out AnnotationValue>, p: Void?): JsonValue {
    return toJson(vals)
  }
}
