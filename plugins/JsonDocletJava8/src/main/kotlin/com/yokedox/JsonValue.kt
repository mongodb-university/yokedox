package com.yokedox

import com.beust.klaxon.Klaxon

typealias JsonObject = Map<String, Any?>

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

/*
NOTE on custom JSON implementation:

- Klaxon (JSON library) did not do well with building up JSON value trees for output.
- GSON (2.8.6) failed to load custom Javadoc type serializers with the exception due to reflection:

    Unable to make field public final jdk.javadoc.internal.tool.ElementsTable
      jdk.javadoc.internal.tool.DocEnvImpl.etable accessible:
      module jdk.javadoc does not "exports jdk.javadoc.internal.tool" to unnamed module @3e8c9981
      at java.base/java.lang.reflect.AccessibleObject.checkCanSetAccessible(AccessibleObject.java:341)
      ...

  Could not figure out how to use --add-exports with Kotlin gradle project for internal classes.
  Considered wrapping every Javadoc type in a wrapper and providing serializers for the wrappers, but at that point...
 */

class JsonValue {
    private val _value: Any?

    constructor(value: Iterable<Any?>): this(value as Any?)

    constructor(value: Map<String, Any?>): this(value as Any?)

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
        return when (other) {
            is JsonValue -> _value == other._value
            else -> _value == other
        }
    }

    operator fun get(key: String): JsonValue? {
        return when(_value) {
            is Map<*, *> -> _value[key] as JsonValue?
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

    @Suppress("UNCHECKED_CAST")
    val keys: Set<String>
        get() = when(_value) {
            is Map<*, *> -> (_value as Map<String, JsonValue>).keys
            else -> throw Error("`keys` called on JsonValue that is not an object (value=$_value)")
        }

    fun toJsonString(): String {
        return when (_value) {
            is Iterable<*> -> arrayToString()
            is Map<*, *> -> objectToString()
            is Byte -> Klaxon().toJsonString(_value.toInt()) // Klaxon would render Byte as String
            is Short -> Klaxon().toJsonString(_value.toInt()) // Klaxon would render Short as String
            is Char -> Klaxon().toJsonString(_value.toString()) // Klaxon would render Char as Int
            else -> Klaxon().toJsonString(_value) // Let Klaxon handle this
        }
    }

    override fun toString(): String {
        return _value.toString()
    }

    private fun arrayToString(): String {
        return "[${(_value as Iterable<*>).joinToString { (it as JsonValue).toJsonString() }}]"
    }

    @Suppress("UNCHECKED_CAST")
    private fun objectToString(): String {
        val serialized = (_value as Map<String, JsonValue>).entries.joinToString {
            "${JsonValue(it.key).toJsonString()}: ${it.value.toJsonString()}"
        }
        return "{$serialized}"
    }

    override fun hashCode(): Int {
        return _value?.hashCode() ?: 0
    }

    // Returns true if the value can be discarded.
    fun isDisposable(): Boolean {
        return when (_value) {
            null -> true
            is String -> _value == ""
            is Iterable<*> -> _value.count() == 0
            is Map<*, *> -> _value.size == 0
            is JsonValue -> _value.isDisposable()
            else -> false
        }
    }

    // Returns a copy with discards null fields and empty strings, objects, and arrays.
    @Suppress("UNCHECKED_CAST")
    fun compacted(): JsonValue {
        return when (_value) {
            is Iterable<*> -> JsonValue((_value as Iterable<JsonValue>)
                .map {
                    it.compacted()
                }
                .filter {
                    !it.isDisposable()
                })
            is Map<*, *> -> JsonValue((_value as Map<String, JsonValue>)
                .mapValues {
                    it.value.compacted()
                }.filter {
                    !it.value.isDisposable()
                })
            else -> this
        }
    }
}
