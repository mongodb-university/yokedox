package com.yokedox

import com.beust.klaxon.JsonArray
import com.beust.klaxon.JsonValue
import javax.lang.model.element.AnnotationMirror
import javax.lang.model.element.AnnotationValue
import javax.lang.model.element.VariableElement
import javax.lang.model.type.TypeMirror
import javax.lang.model.util.AbstractAnnotationValueVisitor9

fun toJson(annotationValue: AnnotationValue): JsonValue {
  return JsonAnnotationValueVisitor().visit(annotationValue);
}

fun toJson(list: Iterable<AnnotationValue>): JsonValue {
  return makeJsonValue(list.map { toJson(it) })
}

class JsonAnnotationValueVisitor : AbstractAnnotationValueVisitor9<JsonValue, Void>() {
  override fun visitBoolean(b: Boolean, p: Void?): JsonValue {
    return makeJsonValue(b)
  }

  override fun visitByte(b: Byte, p: Void?): JsonValue {
    return makeJsonValue(b)
  }

  override fun visitChar(c: Char, p: Void?): JsonValue {
    return makeJsonValue(c)
  }

  override fun visitDouble(d: Double, p: Void?): JsonValue {
    return makeJsonValue(d)
  }

  override fun visitFloat(f: Float, p: Void?): JsonValue {
    return makeJsonValue(f)
  }

  override fun visitInt(i: Int, p: Void?): JsonValue {
    return makeJsonValue(i)
  }

  override fun visitLong(i: Long, p: Void?): JsonValue {
    return makeJsonValue(i)
  }

  override fun visitShort(s: Short, p: Void?): JsonValue {
    return makeJsonValue(s)
  }

  override fun visitString(s: String, p: Void?): JsonValue {
    return makeJsonValue(s)
  }

  override fun visitType(t: TypeMirror, p: Void?): JsonValue {
    return makeJsonValue(t)
  }

  override fun visitEnumConstant(c: VariableElement, p: Void?): JsonValue {
    return makeJsonValue(c)
  }

  override fun visitAnnotation(a: AnnotationMirror, p: Void?): JsonValue {
    return makeJsonValue(null) // TODO: Ignoring annotation mirrors until finding out whether they are actually useful
  }

  override fun visitArray(vals: MutableList<out AnnotationValue>, p: Void?): JsonValue {
    return toJson(vals)
  }
}
