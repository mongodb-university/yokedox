package com.yokedox

import com.beust.klaxon.Klaxon

typealias JsonObject = Map<String, JsonValue>

typealias JsonArray = List<JsonValue>

class JsonValue {
  enum class Type {
    ARRAY,
    OBJECT,
    PRIMITIVE,
  }
  val type: Type
  private val value: Any?

  // Constrain possible types in the constructor
  constructor(value: Iterable<JsonValue>) {
    this.value = value
    type = Type.ARRAY
  }

  constructor(value: JsonObject) {
    this.value = value
    type = Type.OBJECT
  }

  constructor(value: String) {
    this.value = value
    type = Type.PRIMITIVE
  }

  constructor(value: Boolean) {
    this.value = value
    type = Type.PRIMITIVE
  }

  constructor(value: Number) {
    this.value = value
    type = Type.PRIMITIVE
  }

  constructor() {
    this.value = null
    type = Type.PRIMITIVE
  }

  override fun toString(): String {
    return when (type) {
      Type.ARRAY -> arrayToString()
      Type.OBJECT -> objectToString()
      Type.PRIMITIVE -> Klaxon().toJsonString(value)
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
