package com.yokedox

import org.junit.Test

import org.junit.Assert.*
import javax.lang.model.element.ModuleElement
import javax.lang.model.element.PackageElement
import javax.lang.model.element.TypeElement

abstract class MockDirective(private val _kind: ModuleElement.DirectiveKind): ModuleElement.Directive {
  override fun getKind(): ModuleElement.DirectiveKind {
    return _kind
  }

  override fun <R: Any?, P: Any?> accept(visitor: ModuleElement.DirectiveVisitor<R, P>, data: P): R {
    return when (this) {
      is ModuleElement.RequiresDirective -> visitor.visitRequires(this, data)
      is ModuleElement.ExportsDirective -> visitor.visitExports(this, data)
      is ModuleElement.OpensDirective -> visitor.visitOpens(this, data)
      is ModuleElement.UsesDirective -> visitor.visitUses(this, data)
      is ModuleElement.ProvidesDirective -> visitor.visitProvides(this, data)
      else -> throw Error("unknown directive type: $this")
    }
  }
}

class JsonDirectiveVisitorTest {
  @Test fun visitRequires() {
    val directive = object: MockDirective(ModuleElement.DirectiveKind.REQUIRES), ModuleElement.RequiresDirective {
      override fun isStatic(): Boolean {
        return true
      }

      override fun isTransitive(): Boolean {
        return false
      }

      override fun getDependency(): ModuleElement? {
        return null
      }
    }
    val result = toJson(directive)
    assertEquals(result.size, 4)
    assertEquals(result["kind"], "REQUIRES")
    assertEquals(result["isStatic"], true)
    assertEquals(result["isTransitive"], false)
    assertEquals(result["dependency"], JsonValue(null))
  }

  @Test fun visitExports() {
    val directive = object: MockDirective(ModuleElement.DirectiveKind.EXPORTS), ModuleElement.ExportsDirective {
      override fun getPackage(): PackageElement? {
        return null
      }

      override fun getTargetModules(): MutableList<out ModuleElement> {
        return mutableListOf()
      }
    }
    val result = toJson(directive)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "EXPORTS")
    assertEquals(result["package"], JsonValue(null))
    assertEquals(result["targetModules"], listOf<Any>())
  }

  @Test fun visitOpens() {
    val directive = object: MockDirective(ModuleElement.DirectiveKind.OPENS), ModuleElement.OpensDirective {
      override fun getPackage(): PackageElement? {
        return null
      }

      override fun getTargetModules(): MutableList<out ModuleElement> {
        return mutableListOf()
      }
    }
    val result = toJson(directive)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "OPENS")
    assertEquals(result["package"], JsonValue(null))
    assertEquals(result["targetModules"], listOf<Any>())
  }

  @Test fun visitUses() {
    val directive = object: MockDirective(ModuleElement.DirectiveKind.USES), ModuleElement.UsesDirective {
      override fun getService(): TypeElement? {
        return null
      }
    }
    val result = toJson(directive)
    assertEquals(result.size, 2)
    assertEquals(result["kind"], "USES")
    assertEquals(result["service"], JsonValue(null))
  }

  @Test fun visitProvides() {
    val directive = object: MockDirective(ModuleElement.DirectiveKind.PROVIDES), ModuleElement.ProvidesDirective {
      override fun getService(): TypeElement? {
        return null
      }

      override fun getImplementations(): MutableList<out TypeElement> {
        return mutableListOf()
      }
    }

    val result = toJson(directive)
    assertEquals(result.size, 3)
    assertEquals(result["kind"], "PROVIDES")
    assertEquals(result["service"], JsonValue(null))
    assertEquals(result["implementations"], listOf<Any>())
  }
}
