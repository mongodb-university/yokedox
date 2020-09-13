package com.yokedox

import com.beust.klaxon.Converter
import com.beust.klaxon.JsonValue
import com.beust.klaxon.internal.ConverterFinder
import kotlin.reflect.KProperty

private class DummyConverter : Converter {
  override fun canConvert(cls: Class<*>): Boolean {
    TODO("Will not be implemented")
  }

  override fun fromJson(jv: JsonValue): Any? {
    TODO("Will not be implemented")
  }

  override fun toJson(value: Any): String {
    TODO("Will not be implemented")
  }
}

private class DummyConverterFinder : ConverterFinder {
  val converter = DummyConverter()
  override fun findConverter(value: Any, prop: KProperty<*>?): Converter {
    return converter
  }
}

private val converterFinder = DummyConverterFinder()

// Convenience function to replace Klaxon JsonValue constructor, which does not allow
// easily storing arbitrary values outside of a JSON parse job
fun makeJsonValue(value: Any?): JsonValue {
  return JsonValue(value, null, null, converterFinder)
}
