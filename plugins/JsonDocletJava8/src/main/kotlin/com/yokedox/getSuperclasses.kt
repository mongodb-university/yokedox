package com.yokedox

import com.sun.javadoc.ClassDoc
import com.sun.javadoc.MethodDoc
import com.sun.javadoc.Type

fun getSuperclasses(v: Type): List<Type> {
    val classDoc = v.asClassDoc() ?: return listOf()
    val superclassType = classDoc.superclassType() ?: return listOf()
    return listOf(superclassType).plus(getSuperclasses(superclassType))
}

fun getInterfaces(v: Type): List<Type> {
    val classDoc = v.asClassDoc() ?: return listOf()
    val interfaceTypes = classDoc.interfaceTypes().toList()
    return interfaceTypes.plus(interfaceTypes.flatMap { getInterfaces(it) })
}

fun getInheritedMethods(v: ClassDoc): Map<String, List<MethodDoc>> {
    val superclasses = getSuperclasses(v)
    val interfaces = getInterfaces(v)
    return makeTypeNameToMethodsMap(superclasses).plus(makeTypeNameToMethodsMap(interfaces))
}

fun makeTypeNameToMethodsMap(types: List<Type>): Map<String, List<MethodDoc>> {
    val result = mutableMapOf<String, List<MethodDoc>>()
    types.forEach {
        val classDoc = it.asClassDoc()
        if (classDoc != null) {
            result[it.qualifiedTypeName()] = classDoc.methods().toList()
        }
    }
    return result
}
