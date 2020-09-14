/*
 * This Kotlin source file was generated by the Gradle 'init' task.
 */
package com.yokedox

import org.junit.Test
import org.junit.Assert.*
import kotlin.test.assertFails

class JsonValueTest {
  @Test fun testValueEquals() {
    assertEquals(JsonValue(null), null)
    assertEquals(JsonValue(1), 1)
    assertEquals(JsonValue(1.023), 1.023)
    assertEquals(JsonValue(1e-10), 1e-10)
    assertEquals(JsonValue(-20), -20)
    assertEquals(JsonValue(true), true)
    assertEquals(JsonValue(false), false)
    assertEquals(JsonValue("something"), "something")
    assertEquals(JsonValue(mapOf(
      "a" to 1
    )), mapOf(
      "a" to 1
    ))
    assertEquals(JsonValue(listOf(
      1, "a", false
    )), listOf(1, "a", false))
  }

  @Test fun testJsonValueEquals() {
    assertEquals(JsonValue(null), JsonValue(null))
    assertEquals(JsonValue(1), JsonValue(1))
    assertEquals(JsonValue("string"), JsonValue("string"))
    assertNotEquals(JsonValue(null), JsonValue(1))
  }

  @Test fun testObjectGet() {
    val nullValue = JsonValue(null)
    val numberValue = JsonValue(1.234)
    val boolValue = JsonValue(true)
    val stringValue = JsonValue("string")
    val arrayValue = JsonValue(listOf())
    val objectValue = JsonValue(mapOf("a" to 1))
    assertFails { nullValue["bad"] }
    assertFails { numberValue["bad"] }
    assertFails { boolValue["bad"] }
    assertFails { stringValue["bad"] }
    assertFails { arrayValue["bad"] }
    assertEquals(objectValue["a"], 1)
  }

  @Test fun testArrayGet() {
    val nullValue = JsonValue(null)
    val numberValue = JsonValue(1.234)
    val boolValue = JsonValue(true)
    val stringValue = JsonValue("string")
    val objectValue = JsonValue(mapOf("a" to 1))
    val arrayValue = JsonValue(listOf(100, 200, 300, 400))
    assertFails { nullValue[0] }
    assertFails { numberValue[1] }
    assertFails { boolValue[2] }
    assertFails { stringValue[3] }
    assertFails { objectValue[4] }
    assertFails { arrayValue[999] }
    assertEquals(arrayValue[0], 100)
    assertEquals(arrayValue[1], 200)
    assertEquals(arrayValue[2], 300)
    assertEquals(arrayValue[3], 400)
  }

  @Test fun testArrayOrObjectSize() {
    val nullValue = JsonValue(null)
    val numberValue = JsonValue(1.234)
    val boolValue = JsonValue(true)
    val stringValue = JsonValue("string")
    val objectValue = JsonValue(mapOf(
      "a" to 1,
      "b" to 2,
      "c" to 3,
      "d" to 4
    ))
    val arrayValue = JsonValue(listOf(100, 200, 300, 400))
    assertFails { nullValue.size }
    assertFails { numberValue.size }
    assertFails { boolValue.size }
    assertFails { stringValue.size }
    assertEquals(arrayValue.size, 4)
    assertEquals(objectValue.size, 4)
  }

  @Test fun testNumberToString() {
    assertEquals("123", JsonValue(123).toJsonString())
    assertEquals("123", JsonValue(123.toByte()).toJsonString())
    assertEquals("123", JsonValue(123.toShort()).toJsonString())
    assertEquals("123", JsonValue(123.toLong()).toJsonString())
    assertEquals("\"a\"", JsonValue('a').toJsonString())
    assertEquals("123.0", JsonValue(123.toDouble()).toJsonString())
    assertEquals("123.0", JsonValue(123.toFloat()).toJsonString())
  }

  @Test fun testArrayToString() {
    val array = JsonValue(listOf(
      1,
      "some \" string",
      1e-13,
      JsonValue(1.02),
      JsonValue(true)
    ))
    assertEquals("""[1, "some \" string", 1.0E-13, 1.02, true]""", array.toJsonString())
  }

  @Test fun testObjectToString() {
    val obj = JsonValue(mapOf<String, JsonValue>(
      "one" to JsonValue(1),
      "some string" to JsonValue("some \" string"),
      "small number" to JsonValue(1e-13),
      "float" to JsonValue(1.02),
      "true" to JsonValue(true),
      "null" to JsonValue(null),
      "array" to JsonValue(listOf(
        JsonValue(1),
        JsonValue(2),
        JsonValue(3)
      ))
    ))
    assertEquals("""{"one": 1, "some string": "some \" string", "small number": 1.0E-13, "float": 1.02, "true": true, "null": null, "array": [1, 2, 3]}""", obj.toJsonString())
  }

  @Test fun invalidValueFails() {
    class SomeRandomClass
    assertFails {
      JsonValue(SomeRandomClass())
    }
  }

  @Test fun invalidObjectKeyTypeFails() {
    assertFails {
      // Non-string keys
      JsonValue(mapOf(
        1 to 99
      )).toString()
    }
  }

  @Test fun invalidObjectValueTypeFails() {
    assertFails {
      class SomeRandomClass
      JsonValue(mapOf(
        "test" to SomeRandomClass()
      )).toString()
    }
  }

  @Test fun testHashCode() {
    assertEquals(JsonValue(null).hashCode(), 0)
    assertEquals(JsonValue("string").hashCode(), "string".hashCode())
    assertEquals(JsonValue(1).hashCode(), 1.hashCode())
    assertEquals(JsonValue(1.234).hashCode(), 1.234.hashCode())
    assertEquals(JsonValue(JsonValue("something")).hashCode(), JsonValue("something").hashCode())
    assertEquals(JsonValue(listOf(1, 2, 3)).hashCode(), mutableListOf(1, 2, 3).hashCode())
  }
}
