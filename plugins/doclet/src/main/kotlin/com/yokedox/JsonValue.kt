package com.yokedox

import com.beust.klaxon.Klaxon

typealias JsonObject = Map<String, JsonValue>

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

  constructor(value: Iterable<Any?>) {
    this.value = value.map { JsonValue(it) }
  }

  constructor(value: Map<String, Any?>) {
    this.value = value
  }

  constructor(value: Any?) {
    this.value = when(value) {
      null -> null
      is String -> value
      is Boolean -> value
      is Number -> value
      is Iterable<*> -> value.map { JsonValue(it) }
      is Map<*, *> -> value.map { it.key as String to JsonValue(it.value) }
      is JsonValue -> value.value
      else -> throw Error("Cannot convert type to JsonValue: $value")
    }
  }

  constructor(value: Number) {
    this.value = value
  }

  override fun equals(other: Any?): Boolean {
    return value == other
  }

  operator fun get(key: String): JsonValue? {
    assert(value is Map<*, *>)
    return (value as Map<*, *>)[key] as JsonValue?
  }

  override fun toString(): String {
    return when (value) {
      is Iterable<*> -> arrayToString()
      is Map<*, *> -> objectToString()
      else -> Klaxon().toJsonString(value) // Let Klaxon handle this
    }
  }

  private fun arrayToString(): String {
    return "[${(value as Iterable<*>).joinToString { (it as JsonValue).toString() }}]"
  }

  private fun objectToString(): String {
    val serialized = (value as Map<*, *>).entries.joinToString {
      "${JsonValue(it.key as String)}: ${(it.value as JsonValue)}"
    }
    return "{$serialized}"
  }
}
