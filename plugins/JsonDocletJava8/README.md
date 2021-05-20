# Javadoc JSON Doclet for Java 1.8

This is a doclet (Javadoc plugin) that will transform raw Javadoc constructs to JSON according 
to the [schema](./doclet8.schema.json).

Works with Javadoc 1.8 (and possibly earlier). For later versions, see [doclet](../doclet).

The following:

```shell
$ javadoc \
  -d output \
  -docletpath path/to/JsonDocletJava8/build/libs/JsonDocletJava8-all.jar \
  -doclet com.yokedox.JsonDoclet8 \
  -sourcepath ...
  com.example.my.project
```

Will generate JSON files:

```
./output/com.example.my.project.json
./output/com/example/my/project/MyClass1.json
./output/com/example/my/project/MyClass2.json
...
```

The JSON files contain the **complete** constructs of Javadoc. You can use
these to re-skin, analyze, mung, etc. without having to write a doclet yourself.

## Building the Doclet

Ensure you are using Java 1.8 or so:

```shell
$ echo $JAVA_HOME 
/Library/Java/JavaVirtualMachines/jdk1.8.0_202.jdk/Contents/Home
```

To build, use the Gradle script from this directory:

```shell
$ ./gradlew build
```

If successful, the doclet will appear in `build/libs/JsonDocletJava8-all.jar`.

## Using the Doclet

Run Javadoc with the -doclet and -docletPath flags:

```shell
$ javadoc \
  -d path/to/desired/output/directory \
  -docletpath path/to/JsonDocletJava8/build/libs/JsonDocletJava8-all.jar \
  -doclet com.yokedox.JsonDoclet8 \
  -sourcepath ...
```

The `-d` option specifies the directory to output files into. The doclet
produces one JSON file per included class and package. The class files will be
in a subdirectory corresponding to the class's package name.

>For example, the doclet renders `com.example.MyClass` to
>`com/example/MyClass.json` within the destination directory specified by the
>`-d` flag passed to `javadoc`.

## Using the JSON Schema

The output of the doclet should match the JSON schema at [./doclet8.schema.json](./doclet8.schema.json).

To test, use your JSON Schema validator of choice. For example, try this:

```sh
npx ajv-cli validate -s path/to/JsonDocletJava8/doclet8.schema.json -d SomeClass.json
```

The result should be:

```
SomeClass.json valid
```

**If the result is NOT valid, please [open an
issue](https://github.com/mongodb-university/yokedox/issues/new).** If possible,
please include the original class file, json file, and javadoc version.

## Editing the Doclet

To edit, use IDEA:

```shell
$ idea .
```

The entrypoint is `JsonDoclet8.start()`.

`parse()` in Docs.kt is the entrypoint for parsing ClassDocs. To see how the
properties of JSON are decided, look at the corresponding class definition in
the javadoc library (e.g. ClassDoc, ProgramElementDoc, MemberDoc, etc.).

Class properties are mostly serialized as they appear in the official javadoc
library with minor exceptions:

- ClassDocs and PackageDocs are not fully parsed when encountered in the tree,
  or there would be endless cycles of docs. The fully parsed versions are at the
  root of the resulting JSON. Inner instances are included by reference only.
- Backlinks are not included. Again, this is to avoid endless cycles.

## Files of Interest

- **doclet8.schema.json:** the JSON schema to validate everything.
- **JsonDoclet8.kt:** the entrypoint for the doclet.
- **toJson.kt:** miscellaneous Javadoc type to JSON converters.
- **Docs.kt:** Javadoc "Doc" and "Doc" subclass JSON converters. Contains the parse() entrypoint for both ClassDoc and PackageDoc.
- **Tags.kt:** Javadoc "Tag" and "Tag" subclass JSON converters.
- **Types.kt:** Javadoc "Type" and "Type" subclass JSON converters.
- **JsonValue.kt:** Klaxon JSON library helper (copied from ../doclet)

## Tests

A test Java project is located in the `test/` directory. These tests were
shamelessly borrowed from Markus Bernhardt's
[xml-doclet](https://github.com/MarkusBernhardt/xml-doclet) (who, according to
their README, also shamelessly borrowed them from Seth Call.

You can build and run the doclet against this test project with the following
command:

```bash
./gradlew testDoclet
```

This will also validate the output against the JSON schema using
[ajv-cli](https://www.npmjs.com/package/ajv-cli) via
[npx](https://www.npmjs.com/package/npx).

