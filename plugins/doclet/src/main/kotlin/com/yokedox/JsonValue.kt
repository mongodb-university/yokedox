package com.yokedox

class JsonValue(val value: Any?) {
}

typealias JsonObject = Map<String, JsonValue>

typealias JsonArray = List<JsonValue>
