plugins {
    // Apply the org.jetbrains.kotlin.jvm Plugin to add support for Kotlin.
    id("org.jetbrains.kotlin.jvm") version "1.4.31"

    // Apply the java-library plugin for API and implementation separation.
    `java-library`

    // Provide fat jar (all dependencies included) support for use with javadoc
    id("com.github.johnrengelman.shadow") version "6.0.0"
}

java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

dependencies {
    // 1.8 tools.jar for Javadoc API
    implementation( files(org.gradle.internal.jvm.Jvm.current().toolsJar))

    // Align versions of all Kotlin components
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))

    // Use the Kotlin JDK 8 standard library.
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    // This dependency is used internally, and not exposed to consumers on their own compile classpath.
    implementation("com.google.guava:guava:30.0-jre")

    // Use the Kotlin test library.
    testImplementation("org.jetbrains.kotlin:kotlin-test")

    // Use the Kotlin JUnit integration.
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")

    // This dependency is exported to consumers, that is to say found on their compile classpath.
    api("org.apache.commons:commons-math3:3.6.1")

    // JSON parsing https://github.com/cbeust/klaxon
    implementation("com.beust:klaxon:5.5")
}

tasks.build {
    // Build fat jar (all dependencies included) for use with javadoc
    val shadowJar = tasks.named("shadowJar")
    finalizedBy(shadowJar)
}

tasks.register("testDoclet") {
    dependsOn(tasks.build)
    mustRunAfter(tasks.build)
    doLast {
        project.exec {
            // Run javadoc with this doclet against the ./test project
            // and output json files in ./build/test
            commandLine = listOf(
                "javadoc", "-d", "./build/test",
                "-docletpath", "./build/libs/JsonDocletJava8-all.jar",
                "-doclet", "com.yokedox.JsonDoclet8",
                "-sourcepath", "./test/src/main/java",
                "com.yokedox.test"
            )
        }
        project.exec {
            // Quick & dirty: use ajv-cli (via npx) to validate output of above against the JSON schema
            commandLine = listOf("bash", "-o", "pipefail", "-c",
                "find ./build/test -iname '*.json' | xargs printf '\\-d %s ' | xargs npx ajv-cli validate -s ./doclet8.schema.json"
            )
        }
    }
}
