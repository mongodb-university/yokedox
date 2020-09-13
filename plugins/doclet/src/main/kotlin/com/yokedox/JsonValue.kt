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

  // Constrain possible types in the constructor
  constructor(value: Iterable<JsonValue>) {
    this.value = value
  }

  constructor(value: JsonObject) {
    this.value = value
  }

  constructor(value: String) {
    this.value = value
  }

  constructor(value: Boolean) {
    this.value = value
  }

  constructor(value: Number) {
    this.value = value
  }

  constructor() {
    this.value = null
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
