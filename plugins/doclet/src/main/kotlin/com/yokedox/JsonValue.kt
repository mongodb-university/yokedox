package com.yokedox

import com.beust.klaxon.Klaxon

typealias JsonObject = Map<String, Any?>

typealias JsonArray = List<JsonValue>

fun toJson(b: Boolean): JsonValue {
  return JsonValue(b)
}

fun toJson(s: String): JsonValue {
  return JsonValue(s)
}

@JvmName("toJsonIterableJsonValue")
fun toJson(list: Iterable<JsonValue>): JsonValue {
  return JsonValue(list)
}

// Klaxon (JSON library) did not do well with building up JSON value trees
// so wrapping it here
class JsonValue {
  private val _value: Any?

  constructor(other: JsonValue?) {
    _value = other?._value
  }

  constructor(value: Iterable<Any?>): this(value as Any?)

  constructor(value: Map<String, Any?>): this(value as Any?)

  constructor(value: Number): this(value as Any?)

  constructor(value: Any?) {
    this._value = when(value) {
      null -> null
      is String -> value
      is Boolean -> value
      is Number -> value
      is Char -> value
      is Iterable<*> -> value.map { JsonValue(it) }
      is Map<*, *> -> value.mapKeys { it.key as String }.mapValues { JsonValue(it.value) }
      is JsonValue -> value._value
      else -> throw Error("Cannot convert type to JsonValue: $value")
    }
  }

  override operator fun equals(other: Any?): Boolean {
    return _value == other
  }

  operator fun get(key: String): JsonValue? {
    return when(_value) {
      is Map<*, *> -> _value.get(key) as JsonValue?
      else -> throw Error("get() called with string key on non-object type! (value=$_value)")
    }
  }

  operator fun get(index: Int): JsonValue? {
    return when(_value) {
      is Iterable<*> -> _value.elementAt(index) as JsonValue?
      else -> throw Error("get() called with integer index on non-array type! (value=$_value)")
    }
  }

  val size: Int
    get() = when(_value) {
      is Iterable<*> -> _value.count()
      is Map<*, *> -> _value.size
      else -> throw Error("`size` called on JsonValue that is not an object or array (value=$_value)")
    }

  fun toJsonString(): String {
    return when (_value) {
      is Iterable<*> -> arrayToString()
      is Map<*, *> -> objectToString()
      is Byte -> Klaxon().toJsonString(_value.toInt()) // Klaxon would render Byte as String
      is Short -> Klaxon().toJsonString(_value.toInt()) // Klaxon would render Short as String
      else -> Klaxon().toJsonString(_value) // Let Klaxon handle this
    }
  }

  override fun toString(): String {
    return _value.toString()
  }

  private fun arrayToString(): String {
    return "[${(_value as Iterable<*>).joinToString { (it as JsonValue).toJsonString() }}]"
  }

  private fun objectToString(): String {
    val serialized = (_value as Map<*, *>).entries.joinToString {
      "${JsonValue(it.key as String).toJsonString()}: ${(it.value as JsonValue).toJsonString()}"
    }
    return "{$serialized}"
  }
}
