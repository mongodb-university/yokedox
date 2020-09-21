package com.yokedox;
import com.sun.tools.javac.main.CommandLine;
import com.yokedox.JsonDoclet;
import com.yokedox.JsonDocletKt;
import jdk.javadoc.doclet.StandardDoclet;
import jdk.javadoc.internal.tool.*;
import org.junit.Test;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import com.sun.tools.javac.util.*;

public class JavadocTest {
  @Test
  public void test() throws IOException {
    var context = new Context() {
      @Override
      public <T> void put(Key<T> key, T data) {
        try {
          super.put(key, data);
        } catch (AssertionError error) {
          // ... gulp ...
        }
      }
    };
    var start = new Start(context);
    start.begin(JsonDoclet.class, List.of(
      "-sourcepath", "test/src/main/java/",
      "--output-path", "tmp/com.yokedox.test.json",
      "-f",
      "com.yokedox.test"
    ), List.of());
  }
}
