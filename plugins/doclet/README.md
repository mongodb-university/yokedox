# Yokedox JSON Doclet

This [doclet](https://docs.oracle.com/javase/9/docs/api/jdk/javadoc/doclet/package-summary.html)
converts Javadoc entities to a single JSON file containing everything that Javadoc reports.

## Building the Doclet

```bash
./gradlew build
```

A successful build produces a fat jar for use with Javadoc in `build/libs/yokedox-all.jar `.

## Using the Doclet with Javadoc

Supported (tested) javadoc versions:
- javadoc 12.0.2

The following Javadoc command uses the doclet against a project:

```bash
javadoc \
  -doclet com.yokedox.JsonDoclet \
  -docletpath path/to/yokedox/build/libs/yokedox-all.jar \
  -sourcepath path/to/my/project/src/main/java/ \
  com.myorg.myproject
```

**WARNING!** This doclet is a work in progress and may not be ready for your use.


## Testing

### Unit Tests

You can run the unit tests with the following command in the project directory:

```bash
./gradlew test
```

### Test Project

A test Java project is located in the `test/` directory. These tests were
shamelessly borrowed from Markus Bernhardt's
[xml-doclet](https://github.com/MarkusBernhardt/xml-doclet) (who, according to
their README, also shamelessly borrowed them from Seth Call.

You can build and run the doclet against this test project with the following command:

```bash
./gradlew testDoclet
```
