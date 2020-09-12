JAR=xml-doclet-1.0.5-jar-with-dependencies.jar
JAR_PATH="build/plugins/javadoc/$(JAR)"

javadoc:
	mkdir -p build/plugins/javadoc
	wget "http://search.maven.org/remotecontent?filepath=com/github/markusbernhardt/xml-doclet/1.0.5/$(JAR)" \
		-O "$(JAR_PATH)"

plugins: javadoc

default: plugins
