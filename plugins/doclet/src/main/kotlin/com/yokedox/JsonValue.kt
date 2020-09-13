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
  private val value: Any?

  constructor(other: JsonValue?) {
    value = other?.value
  }

  constructor(value: Iterable<Any?>): this(value as Any?)

  constructor(value: Map<String, Any?>): this(value as Any?)

  constructor(value: Number): this(value as Any?)

  constructor(value: Any?) {
    this.value = when(value) {
      null -> null
      is String -> value
      is Boolean -> value
      is Number -> value
      is Iterable<*> -> value.map { JsonValue(it) }
      is Map<*, *> -> value.mapKeys { it.key as String }.mapValues { JsonValue(it.value) }
      is JsonValue -> value.value
      else -> throw Error("Cannot convert type to JsonValue: $value")
    }
  }

  override operator fun equals(other: Any?): Boolean {
    return value == other
  }

  operator fun get(key: String): JsonValue? {
    return when(value) {
      is Map<*, *> -> value.get(key) as JsonValue?
      else -> throw Error("get() called with string key on non-object type! (value=$value)")
    }
  }

  operator fun get(index: Int): JsonValue? {
    return when(value) {
      is Iterable<*> -> value.elementAt(index) as JsonValue?
      else -> throw Error("get() called with integer index on non-array type! (value=$value)")
    }
  }

  val size: Int
    get() = when(value) {
      is Iterable<*> -> value.count()
      is Map<*, *> -> value.size
      else -> throw Error("`size` called on JsonValue that is not an object or array (value=$value)")
    }

  fun toJsonString(): String {
    return when (value) {
      is Iterable<*> -> arrayToString()
      is Map<*, *> -> objectToString()
      else -> Klaxon().toJsonString(value) // Let Klaxon handle this
    }
  }

  override fun toString(): String {
    return value.toString()
  }

  private fun arrayToString(): String {
    return "[${(value as Iterable<*>).joinToString { (it as JsonValue).toJsonString() }}]"
  }

  private fun objectToString(): String {
    val serialized = (value as Map<*, *>).entries.joinToString {
      "${JsonValue(it.key as String).toJsonString()}: ${(it.value as JsonValue).toJsonString()}"
    }
    return "{$serialized}"
  }
}
