package com.yokedox

import com.sun.javadoc.DocErrorReporter
import com.sun.javadoc.Doclet
import com.sun.javadoc.LanguageVersion
import com.sun.javadoc.RootDoc
import java.io.File
import kotlin.io.path.ExperimentalPathApi
import kotlin.io.path.Path
import kotlin.io.path.exists
import kotlin.io.path.isDirectory

// For reference, see com.sun.javadoc.Doclet.
// Kotlin does not allow override of static methods.
class JsonDoclet8 {
    companion object {
        /**
         * Generate documentation here.
         * This method is required for all doclets.
         *
         * @return true on success.
         */
        @ExperimentalPathApi
        @JvmStatic
        fun start(root: RootDoc): Boolean {
            // Already validated by other methods below
            val directoryPath = Path(root.options().find { it[0] == "-d" }!![1])
            if (!directoryPath.exists()) {
                // Create working directory
                if (!directoryPath.toFile().mkdirs()) {
                    root.printError("Failed to create directory: '${directoryPath}'")
                    return false
                }
            } else if (!directoryPath.isDirectory()) {
                root.printError("Path specified by -d is not a directory: '${directoryPath}'")
                return false
            }

            root.specifiedPackages().forEach {
                val packageJson = parse(it).compacted()
                val path = directoryPath.resolve( "${it.name()}.json")
                path.toFile().bufferedWriter().use { out ->
                    out.write(packageJson.toJsonString())
                }
            }

            root.classes().forEach {
                val classJson = parse(it).compacted()
                val path = directoryPath.resolve(it.containingPackage().name().split(".").joinToString("/"))
                // Create directory if needed
                if (!path.exists() && !path.toFile().mkdirs()) {
                    root.printError("Could not create directory '${path}' for class ${it.name()}")
                    return false
                }
                path.resolve("${it.name()}.json").toFile().bufferedWriter().use { out ->
                    out.write(classJson.toJsonString())
                }
            }
            return true
        }

        /**
         * Check for doclet-added options.  Returns the number of
         * arguments you must specify on the command line for the
         * given option.  For example, "-d docs" would return 2.
         * <P>
         * This method is required if the doclet contains any options.
         * If this method is missing, Javadoc will print an invalid flag
         * error for every option.
         *
         * @return number of arguments on the command line for an option
         * including the option name itself.  Zero return means
         * option not known.  Negative value means error occurred.
        </P> */
        @JvmStatic
        fun optionLength(option: String): Int {
            return when (option) {
                "-d" -> 2 // directory
                else -> 0 // default is option unknown
            }
        }

        /**
         * Check that options have the correct arguments.
         * <P>
         * This method is not required, but is recommended,
         * as every option will be considered valid if this method
         * is not present.  It will default gracefully (to true)
         * if absent.
        </P> * <P>
         * Printing option related error messages (using the provided
         * DocErrorReporter) is the responsibility of this method.
         *
         * @return true if the options are valid.
        </P> */
        @JvmStatic
        fun validOptions(
            options: Array<Array<String>>,
            reporter: DocErrorReporter
        ): Boolean {
            if (options.find { it[0] == "-d" } == null) {
                reporter.printError("Missing required doclet option: -d <destination directory>")
                return false
            }
            return true
        }

        /**
         * Return the version of the Java Programming Language supported
         * by this doclet.
         *
         *
         * This method is required by any doclet supporting a language version
         * newer than 1.1.
         *
         * @return  the language version supported by this doclet.
         * @since 1.5
         */
        @JvmStatic
        fun languageVersion(): LanguageVersion {
            return LanguageVersion.JAVA_1_5
        }
    }
}
