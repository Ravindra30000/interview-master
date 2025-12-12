Step #1 - "build": Digest: sha256:e72b5bdbe03635ee47614e077cf04e33be8bf0be81cbe05bd4dcde90e2646483
Step #1 - "build": Status: Downloaded newer image for us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01
Step #1 - "build": us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01
Step #1 - "build": Warning: No cached data will be used, no cache specified.
Step #1 - "build": ===> ANALYZING
Step #1 - "build": Image with name "us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest" not found
Step #1 - "build": ===> DETECTING
Step #1 - "build": target distro name/version labels not found, reading /etc/os-release file
Step #1 - "build": ======== Output: google.dotnet.sdk@0.9.1 ========
Step #1 - "build": Opting out: no project files or .dll files found
Step #1 - "build": ======== Output: google.dotnet.functions-framework@0.0.1 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.dotnet.publish@0.9.0 ========
Step #1 - "build": Opting out: no project files found and GOOGLE_BUILDABLE not set
Step #1 - "build": ======== Output: google.dotnet.runtime@0.9.1 ========
Step #1 - "build": Opting out: no project files or .dll files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.dotnet.sdk@0.9.1
Step #1 - "build": skip: google.dotnet.functions-framework@0.0.1
Step #1 - "build": fail: google.dotnet.publish@0.9.0
Step #1 - "build": fail: google.dotnet.runtime@0.9.1
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.dotnet.runtime@0.9.1 ========
Step #1 - "build": Opting out: no project files or .dll files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.dotnet.runtime@0.9.1
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.dart.sdk@1.0.0 ========
Step #1 - "build": Opting out: neither pubspec.yaml nor any .dart files found
Step #1 - "build": ======== Output: google.dart.pub@0.1.0 ========
Step #1 - "build": Opting out: pubspec.yaml not found
Step #1 - "build": ======== Output: google.dart.compile@1.0.0 ========
Step #1 - "build": Opting out: no .dart files found
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.dart.sdk@1.0.0
Step #1 - "build": skip: google.dart.pub@0.1.0
Step #1 - "build": fail: google.dart.compile@1.0.0
Step #1 - "build": ======== Output: google.go.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.go.functions-framework@0.9.4 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.go.build@0.9.0 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.go.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.go.runtime@0.9.1
Step #1 - "build": fail: google.go.functions-framework@0.9.4
Step #1 - "build": fail: google.go.build@0.9.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.go.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.go.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.go.gomod@0.9.0 ========
Step #1 - "build": Opting out: go.mod not found
Step #1 - "build": ======== Output: google.go.build@0.9.0 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.go.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.go.runtime@0.9.1
Step #1 - "build": fail: google.go.gomod@0.9.0
Step #1 - "build": fail: google.go.build@0.9.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.go.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.go.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.go.gopath@0.9.0 ========
Step #1 - "build": Opting in: go.mod file not found, assuming GOPATH build
Step #1 - "build": ======== Output: google.go.build@0.9.0 ========
Step #1 - "build": Opting out: no .go files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.go.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.go.runtime@0.9.1
Step #1 - "build": pass: google.go.gopath@0.9.0
Step #1 - "build": fail: google.go.build@0.9.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.go.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.graalvm@0.1.0 ========
Step #1 - "build": Opting out: GOOGLE_JAVA_USE_NATIVE_IMAGE not set
Step #1 - "build": ======== Output: google.java.maven@0.9.1 ========
Step #1 - "build": Opting out: none of the following found: pom.xml or .mvn/extensions.xml.
Step #1 - "build": ======== Output: google.java.functions-framework@1.1.0 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.java.native-image@0.1.0 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.graalvm@0.1.0
Step #1 - "build": fail: google.java.maven@0.9.1
Step #1 - "build": skip: google.java.functions-framework@1.1.0
Step #1 - "build": pass: google.java.native-image@0.1.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.maven@0.9.1 ========
Step #1 - "build": Opting out: none of the following found: pom.xml or .mvn/extensions.xml.
Step #1 - "build": ======== Output: google.java.functions-framework@1.1.0 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": fail: google.java.maven@0.9.1
Step #1 - "build": fail: google.java.functions-framework@1.1.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.gradle@0.10.0 ========
Step #1 - "build": Opting out: none of the following found: build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle
Step #1 - "build": ======== Output: google.java.functions-framework@1.1.0 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": skip: google.java.gradle@0.10.0
Step #1 - "build": fail: google.java.functions-framework@1.1.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.exploded-jar@0.9.0 ========
Step #1 - "build": Opting out: META-INF/MANIFEST.MF not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": fail: google.java.exploded-jar@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.maven@0.9.1 ========
Step #1 - "build": Opting out: none of the following found: pom.xml or .mvn/extensions.xml.
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": fail: google.java.maven@0.9.1
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.maven@0.9.1 ========
Step #1 - "build": Opting out: none of the following found: pom.xml or .mvn/extensions.xml.
Step #1 - "build": ======== Output: google.java.entrypoint@0.9.0 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": fail: google.java.maven@0.9.1
Step #1 - "build": pass: google.java.entrypoint@0.9.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.gradle@0.10.0 ========
Step #1 - "build": Opting out: none of the following found: build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": skip: google.java.gradle@0.10.0
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.java.runtime@0.9.2 ========
Step #1 - "build": Opting out: none of the following found: pom.xml, .mvn/extensions.xml, build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle, META-INF/MANIFEST.MF, *.java, *.jar
Step #1 - "build": ======== Output: google.java.gradle@0.10.0 ========
Step #1 - "build": Opting out: none of the following found: build.gradle, build.gradle.kts, settings.gradle.kts, settings.gradle
Step #1 - "build": ======== Output: google.java.entrypoint@0.9.0 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.java.clear-source@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_CLEAR_SOURCE not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.java.runtime@0.9.2
Step #1 - "build": skip: google.java.gradle@0.10.0
Step #1 - "build": pass: google.java.entrypoint@0.9.0
Step #1 - "build": skip: google.java.clear-source@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.config.flex@0.9.1 ========
Step #1 - "build": Opting out: Env var GAE_APPLICATION_YAML_PATH is not set, not a GAE Flex app.
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.pip@0.9.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.python.webserver@0.9.1 ========
Step #1 - "build": Opting in: requirements.txt with gunicorn not found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.config.flex@0.9.1
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": pass: google.python.pip@0.9.2
Step #1 - "build": pass: google.python.webserver@0.9.1
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.functions-framework@0.9.6 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.python.poetry@0.1.0 ========
Step #1 - "build": Opting out: Python Poetry Buildpack is not supported in the current release track.
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": fail: google.python.functions-framework@0.9.6
Step #1 - "build": fail: google.python.poetry@0.1.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.functions-framework@0.9.6 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.python.uv@0.1.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Python version not specified, using the latest available Python runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: environment variable GOOGLE_PYTHON_PACKAGE_MANAGER is not uv
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": fail: google.python.functions-framework@0.9.6
Step #1 - "build": fail: google.python.uv@0.1.0
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.functions-framework@0.9.6 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.python.pip@0.9.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": fail: google.python.functions-framework@0.9.6
Step #1 - "build": pass: google.python.pip@0.9.2
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.poetry@0.1.0 ========
Step #1 - "build": Opting out: Python Poetry Buildpack is not supported in the current release track.
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": fail: google.python.poetry@0.1.0
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.uv@0.1.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Python version not specified, using the latest available Python runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: environment variable GOOGLE_PYTHON_PACKAGE_MANAGER is not uv
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": fail: google.python.uv@0.1.0
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.pip@0.9.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": pass: google.python.pip@0.9.2
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.ruby.runtime@0.0.1 ========
Step #1 - "build": Opting out: no .rb files found
Step #1 - "build": ======== Output: google.ruby.rubygems@0.9.0 ========
Step #1 - "build": Opting out: no Gemfile or gems.rb found
Step #1 - "build": ======== Output: google.ruby.bundle@0.9.0 ========
Step #1 - "build": Opting out: no Gemfile or gems.rb found
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.ruby.rails@0.9.0 ========
Step #1 - "build": Opting out: bin/rails not found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.ruby.runtime@0.0.1
Step #1 - "build": skip: google.ruby.rubygems@0.9.0
Step #1 - "build": skip: google.ruby.bundle@0.9.0
Step #1 - "build": skip: google.nodejs.runtime@1.0.0
Step #1 - "build": skip: google.ruby.rails@0.9.0
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.ruby.runtime@0.0.1 ========
Step #1 - "build": Opting out: no .rb files found
Step #1 - "build": ======== Output: google.utils.archive-source@0.0.1 ========
Step #1 - "build": Opting out: Env var X_GOOGLE_TARGET_PLATFORM is not set to gcf.
Step #1 - "build": ======== Output: google.ruby.bundle@0.9.0 ========
Step #1 - "build": Opting out: no Gemfile or gems.rb found
Step #1 - "build": ======== Output: google.ruby.functions-framework@0.9.1 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.ruby.runtime@0.0.1
Step #1 - "build": skip: google.utils.archive-source@0.0.1
Step #1 - "build": fail: google.ruby.bundle@0.9.0
Step #1 - "build": fail: google.ruby.functions-framework@0.9.1
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.php.runtime@0.0.2 ========
Step #1 - "build": Opting out: composer.json or .php files not found
Step #1 - "build": ======== Output: google.utils.nginx@0.0.1 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.php.composer-install@0.0.1 ========
Step #1 - "build": Opting out: composer.json not found
Step #1 - "build": ======== Output: google.php.composer-gcp-build@0.9.1 ========
Step #1 - "build": Opting out: composer.json not found
Step #1 - "build": ======== Output: google.php.composer@0.9.1 ========
Step #1 - "build": Opting out: composer.json not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.php.webconfig@0.0.1 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.php.runtime@0.0.2
Step #1 - "build": pass: google.utils.nginx@0.0.1
Step #1 - "build": skip: google.php.composer-install@0.0.1
Step #1 - "build": skip: google.php.composer-gcp-build@0.9.1
Step #1 - "build": skip: google.php.composer@0.9.1
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.php.webconfig@0.0.1
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.nodejs.yarn@2.1.1 ========
Step #1 - "build": Opting out: package.json not found
Step #1 - "build": ======== Output: google.nodejs.functions-framework@0.9.4 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.nodejs.runtime@1.0.0
Step #1 - "build": fail: google.nodejs.yarn@2.1.1
Step #1 - "build": skip: google.nodejs.functions-framework@0.9.4
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.nodejs.pnpm@0.1.1 ========
Step #1 - "build": Opting out: package.json not found
Step #1 - "build": ======== Output: google.nodejs.functions-framework@0.9.4 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.nodejs.runtime@1.0.0
Step #1 - "build": fail: google.nodejs.pnpm@0.1.1
Step #1 - "build": skip: google.nodejs.functions-framework@0.9.4
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.nodejs.npm@1.1.1 ========
Step #1 - "build": Opting out: package.json not found
Step #1 - "build": ======== Output: google.nodejs.functions-framework@0.9.4 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.nodejs.runtime@1.0.0
Step #1 - "build": fail: google.nodejs.npm@1.1.1
Step #1 - "build": skip: google.nodejs.functions-framework@0.9.4
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.nodejs.functions-framework@0.9.4 ========
Step #1 - "build": Opting out: GOOGLE_FUNCTION_TARGET not set
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.nodejs.runtime@1.0.0
Step #1 - "build": fail: google.nodejs.functions-framework@0.9.4
Step #1 - "build": skip: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.nodejs.runtime@1.0.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: neither package.json nor any .js files found
Step #1 - "build": ======== Output: google.config.entrypoint@0.9.0 ========
Step #1 - "build": Opting out: GOOGLE_ENTRYPOINT not set, no valid entrypoint in app.yaml and Procfile not found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.nodejs.runtime@1.0.0
Step #1 - "build": fail: google.config.entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.webserver@0.9.1 ========
Step #1 - "build": Opting in: requirements.txt with gunicorn not found
Step #1 - "build": ======== Output: google.python.poetry@0.1.0 ========
Step #1 - "build": Opting out: Python Poetry Buildpack is not supported in the current release track.
Step #1 - "build": ======== Output: google.python.missing-entrypoint@0.9.0 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": pass: google.python.webserver@0.9.1
Step #1 - "build": fail: google.python.poetry@0.1.0
Step #1 - "build": fail: google.python.missing-entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.webserver@0.9.1 ========
Step #1 - "build": Opting in: requirements.txt with gunicorn not found
Step #1 - "build": ======== Output: google.python.uv@0.1.0 ========
Step #1 - "build": WARNING: unknown stack ID "", falling back to Ubuntu 22.04
Step #1 - "build": Python version not specified, using the latest available Python runtime for the stack "ubuntu2204"
Step #1 - "build": Opting out: environment variable GOOGLE_PYTHON_PACKAGE_MANAGER is not uv
Step #1 - "build": ======== Output: google.python.missing-entrypoint@0.9.0 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": pass: google.python.webserver@0.9.1
Step #1 - "build": fail: google.python.uv@0.1.0
Step #1 - "build": fail: google.python.missing-entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.python.runtime@0.9.1 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.python.webserver@0.9.1 ========
Step #1 - "build": Opting in: requirements.txt with gunicorn not found
Step #1 - "build": ======== Output: google.python.pip@0.9.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Output: google.python.missing-entrypoint@0.9.0 ========
Step #1 - "build": Opting out: no .py files found
Step #1 - "build": ======== Output: google.utils.label-image@0.0.2 ========
Step #1 - "build": Opting in: always enabled
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.python.runtime@0.9.1
Step #1 - "build": pass: google.python.webserver@0.9.1
Step #1 - "build": pass: google.python.pip@0.9.2
Step #1 - "build": fail: google.python.missing-entrypoint@0.9.0
Step #1 - "build": pass: google.utils.label-image@0.0.2
Step #1 - "build": ======== Output: google.ruby.missing-entrypoint@0.0.1 ========
Step #1 - "build": Opting out: no .rb files found
Step #1 - "build": ======== Results ========
Step #1 - "build": fail: google.ruby.missing-entrypoint@0.0.1
Step #1 - "build": ERROR: No buildpack groups passed detection.
Step #1 - "build": ERROR: Please check that you are running against the correct path.
Step #1 - "build": ERROR: failed to detect: no buildpacks participating
Finished Step #1 - "build"
ERROR
ERROR: build step 1 "us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01" failed: step exited with non-zero status: 20
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
artifacts:
  images:
  - us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
createTime: '2025-12-12T17:24:02.116991480Z'
failureInfo:
  detail: 'Build step failure: build step 1 "us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01"
    failed: step exited with non-zero status: 20'
  type: USER_BUILD_STEP
finishTime: '2025-12-12T17:24:52.924713Z'
id: 55cc1d3d-4d00-42b0-8e97-04bf4ae65793
images:
- us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
logUrl: https://console.cloud.google.com/cloud-build/builds;region=us-central1/55cc1d3d-4d00-42b0-8e97-04bf4ae65793?project=921696971578
name: projects/921696971578/locations/us-central1/builds/55cc1d3d-4d00-42b0-8e97-04bf4ae65793
options:
  env:
  - CNB_APP_DIR=/workspace
  - CNB_ANALYZED_PATH=/layers/analyzed.toml
  - CNB_BUILDPACKS_DIR=/cnb/buildpacks
  - CNB_GROUP_PATH=/layers/group.toml
  - CNB_LAYERS_DIR=/layers
  - CNB_PLAN_PATH=/layers/plan.toml
  - CNB_PLATFORM_DIR=/platform
  - CNB_PLATFORM_API=0.11
  - CNB_NO_COLOR=true
  - CNB_USER_ID=1000
  - CNB_GROUP_ID=1000
  - CNB_SKIP_RESTORE=true
  - CNB_REPORT_PATH=/workspace/report.toml
  logStreamingOption: STREAM_OFF
  logging: CLOUD_LOGGING_ONLY
  pool: {}
  volumes:
  - name: layers
    path: /layers
  - name: platform
    path: /platform
projectId: interview-master-d8c6f
queueTtl: 360s
results:
  buildStepImages:
  - sha256:602a8f57fe80a59309651b20ba2377d0caa7d770fee8b3ae920ea27f9c206ea8
  - sha256:e72b5bdbe03635ee47614e077cf04e33be8bf0be81cbe05bd4dcde90e2646483
  - ''
  buildStepOutputs:
  - ''
  - ''
  - ''
serviceAccount: projects/interview-master-d8c6f/serviceAccounts/921696971578-compute@developer.gserviceaccount.com
source:
  storageSource:
    bucket: run-sources-interview-master-d8c6f-us-central1
    generation: '1765560240696223'
    object: services/interview-master/1765560220.528067-0e35157c68a44031a71135f05b98e1b1.zip
sourceProvenance:
  fileHashes:
    ? gs://run-sources-interview-master-d8c6f-us-central1/services/interview-master/1765560220.528067-0e35157c68a44031a71135f05b98e1b1.zip#1765560240696223
    : fileHash:
      - type: MD5
        value: aO0gseY7IQjFr4iJj2BZFg==
  resolvedStorageSource:
    bucket: run-sources-interview-master-d8c6f-us-central1
    generation: '1765560240696223'
    object: services/interview-master/1765560220.528067-0e35157c68a44031a71135f05b98e1b1.zip
startTime: '2025-12-12T17:24:02.606380141Z'
status: FAILURE
steps:
- args:
  - --phase=pre
  - --app_image_unique=us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
  - --app_image_stable=us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
  - --env_var_names=BUILDER_OUTPUT,GOOGLE_LABEL_BUILDER_VERSION,GOOGLE_LABEL_BUILDER_IMAGE,GOOGLE_LABEL_RUN_IMAGE,GOOGLE_LABEL_SOURCE,GOOGLE_USE_SERVERLESS_RUNTIMES_TARBALLS,GOOGLE_RUNTIME_IMAGE_REGION,GOOGLE_BUILD_ENV,GOOGLE_BUILD_UNIVERSE,X_GOOGLE_SET_NODE_HEAP_SIZE,GOOGLE_LABEL_BUILD_ID,GOOGLE_LABEL_BASE_IMAGE
  - --experimental_skip_retag_cache
  env:
  - GOOGLE_LABEL_BUILDER_VERSION=universal_builder_20251202_RC01
  - GOOGLE_LABEL_BUILDER_IMAGE=us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01
  - GOOGLE_LABEL_RUN_IMAGE=us-central1-docker.pkg.dev/serverless-runtimes/google-22/run/universal:public-image-next
  - GOOGLE_LABEL_SOURCE=gs://run-sources-interview-master-d8c6f-us-central1/services/interview-master/1765560220.528067-0e35157c68a44031a71135f05b98e1b1.zip#1765560240696223
  - GOOGLE_USE_SERVERLESS_RUNTIMES_TARBALLS=true
  - GOOGLE_RUNTIME_IMAGE_REGION=us-central1
  - GOOGLE_BUILD_ENV=prod
  - GOOGLE_BUILD_UNIVERSE=gdu
  - X_GOOGLE_SET_NODE_HEAP_SIZE=true
  - GOOGLE_LABEL_BUILD_ID=55cc1d3d-4d00-42b0-8e97-04bf4ae65793
  - GOOGLE_LABEL_BASE_IMAGE=us-central1-docker.pkg.dev/serverless-runtimes/google-22/run/universal:public-image-next
  id: pre-buildpack
  name: us-central1-docker.pkg.dev/serverless-runtimes/utilities/buildpack-shim:base_20251101_18_04_RC00
  pullTiming:
    endTime: '2025-12-12T17:24:11.103183879Z'
    startTime: '2025-12-12T17:24:10.170023677Z'
  status: SUCCESS
  timing:
    endTime: '2025-12-12T17:24:11.782124641Z'
    startTime: '2025-12-12T17:24:10.170023677Z'
- args:
  - --tag=us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
  - us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest
  entrypoint: /cnb/lifecycle/creator
  env:
  - CNB_RUN_IMAGE=us-central1-docker.pkg.dev/serverless-runtimes/google-22/run/universal:public-image-next
  exitCode: 20
  id: build
  name: us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01
  pullTiming:
    endTime: '2025-12-12T17:24:38.822572743Z'
    startTime: '2025-12-12T17:24:11.782186844Z'
  status: FAILURE
  timing:
    endTime: '2025-12-12T17:24:42.013795677Z'
    startTime: '2025-12-12T17:24:11.782186844Z'
- args:
  - -c
  - |-
    text="$(cat /workspace/report.toml)"
    app="us-central1-docker.pkg.dev/interview-master-d8c6f/cloud-run-source-deploy/interview-master:latest"
    regex="digest\s*=\s*\"([^\"]+)\""
    if [[ "$text" =~ $regex ]]
    then
        digest="@${BASH_REMATCH[1]}"
        digestImage="${app/:latest/$digest}"
        docker pull $digestImage
        docker tag $digestImage $app
    else
        echo "failed to detect image digest"
        exit 1
    fi
  entrypoint: bash
  id: post-buildpack
  name: gcr.io/cloud-builders/docker
  status: QUEUED
substitutions:
  _GOOGLE_BUILD_ENV: prod
  _GOOGLE_BUILD_UNIVERSE: gdu
  _GOOGLE_LABEL_BASE_IMAGE: us-central1-docker.pkg.dev/serverless-runtimes/google-22/run/universal:public-image-next
  _GOOGLE_LABEL_BUILDER_IMAGE: us-central1-docker.pkg.dev/serverless-runtimes/google-22-full/builder/universal:universal_builder_20251202_RC01
  _GOOGLE_LABEL_BUILDER_VERSION: universal_builder_20251202_RC01
  _GOOGLE_LABEL_RUN_IMAGE: us-central1-docker.pkg.dev/serverless-runtimes/google-22/run/universal:public-image-next
  _GOOGLE_LABEL_SOURCE: gs://run-sources-interview-master-d8c6f-us-central1/services/interview-master/1765560220.528067-0e35157c68a44031a71135f05b98e1b1.zip#1765560240696223
  _GOOGLE_RUNTIME_IMAGE_REGION: us-central1
  _GOOGLE_USE_SERVERLESS_RUNTIMES_TARBALLS: 'true'
  _X_GOOGLE_SET_NODE_HEAP_SIZE: 'true'
tags:
- p-run
- r-buildpacks
- b-universal_builder_20251202_RC01
- bt-LIFECYCLE
- service_interview-master
timeout: 1800s
timing:
  BUILD:
    endTime: '2025-12-12T17:24:42.013862882Z'
    startTime: '2025-12-12T17:24:09.675267292Z'
  FETCHSOURCE:
    endTime: '2025-12-12T17:24:09.674219190Z'
    startTime: '2025-12-12T17:24:05.497756618Z'
  STORAGE_SOURCE:
    endTime: '2025-12-12T17:24:09.674219190Z'
    startTime: '2025-12-12T17:24:05.497756618Z'
ravindratomar300@cloudshell:~/interview-master (interview-master-d8c6f)$ 

Welcome to Cloud Shell! Type "help" to get started, or type "gemini" to try prompting with Gemini CLI.
Your Cloud Platform project in this session is set to interview-master-d8c6f.
Use `gcloud config set project [PROJECT_ID]` to change to a different project.
ravindratomar300@cloudshell:~ (interview-master-d8c6f)$ cd ~/interview-master
echo "=== Checking key files ==="
ls -la package.json Dockerfile next.config.mjs
echo ""
echo "=== package.json exists? ==="
test -f package.json && echo "YES" || echo "NO"
echo ""
echo "=== Dockerfile exists? ==="
test -f Dockerfile && echo "YES" || echo "NO"
=== Checking key files ===
-rw-rw-r-- 1 ravindratomar300 ravindratomar300 1351 Dec 12 15:05 Dockerfile
-rw-rw-r-- 1 ravindratomar300 ravindratomar300  245 Dec 12 15:05 next.config.mjs
-rw-rw-r-- 1 ravindratomar300 ravindratomar300  825 Dec 12 15:05 package.json

=== package.json exists? ===
YES

=== Dockerfile exists? ===
YES
ravindratomar300@cloudshell:~/interview-master (interview-master-d8c6f)$ cd ~/interview-master

# Build the Docker image
gcloud builds submit --tag gcr.io/interview-master-d8c6f/interview-master:latest

# Deploy using the built image
gcloud run deploy interview-master \
  --image gcr.io/interview-master-d8c6f/interview-master:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="$ENV_VARS" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10
Creating temporary archive of 57 file(s) totalling 971.3 KiB before compression.
Some files were not included in the source upload.

Check the gcloud log [/tmp/tmp.coX8mmbT3a/logs/2025.12.12/17.38.34.767087.log] to see which files and the contents of the
default gcloudignore file used (see `$ gcloud topic gcloudignore` to learn
more).

Uploading tarball of [.] to [gs://interview-master-d8c6f_cloudbuild/source/1765561115.150476-aa9782befa054a899c2cc7b5168a1a5d.tgz]
Created [https://cloudbuild.googleapis.com/v1/projects/interview-master-d8c6f/locations/global/builds/77355a3c-ec07-4590-b519-816f58f8b1d4].
Logs are available at [ https://console.cloud.google.com/cloud-build/builds/77355a3c-ec07-4590-b519-816f58f8b1d4?project=921696971578 ].
Waiting for build to complete. Polling interval: 1 second(s).
---------------------------------------------------------------------------- REMOTE BUILD OUTPUT ----------------------------------------------------------------------------
starting build "77355a3c-ec07-4590-b519-816f58f8b1d4"

FETCHSOURCE
Fetching storage object: gs://interview-master-d8c6f_cloudbuild/source/1765561115.150476-aa9782befa054a899c2cc7b5168a1a5d.tgz#1765561117632155
Copying gs://interview-master-d8c6f_cloudbuild/source/1765561115.150476-aa9782befa054a899c2cc7b5168a1a5d.tgz#1765561117632155...
/ [1 files][197.5 KiB/197.5 KiB]                                                
Operation completed over 1 objects/197.5 KiB.
BUILD
Already have image (with digest): gcr.io/cloud-builders/gcb-internal
Sending build context to Docker daemon  767.5kB
Step 1/28 : FROM node:20-alpine AS base
20-alpine: Pulling from library/node
014e56e61396: Already exists
d28ab52fe429: Pulling fs layer
34226f541496: Pulling fs layer
6ac8cc1f0b52: Pulling fs layer
34226f541496: Verifying Checksum
34226f541496: Download complete
6ac8cc1f0b52: Verifying Checksum
6ac8cc1f0b52: Download complete
d28ab52fe429: Verifying Checksum
d28ab52fe429: Download complete
d28ab52fe429: Pull complete
34226f541496: Pull complete
6ac8cc1f0b52: Pull complete
Digest: sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
Status: Downloaded newer image for node:20-alpine
 9992b59c17bf
Step 2/28 : FROM base AS deps
 9992b59c17bf
Step 3/28 : RUN apk add --no-cache libc6-compat
 Running in f232d4643830
(1/3) Installing musl-obstack (1.2.3-r2)
(2/3) Installing libucontext (1.3.3-r0)
(3/3) Installing gcompat (1.1.0-r4)
OK: 10 MiB in 21 packages
Removing intermediate container f232d4643830
 3d53898b3203
Step 4/28 : WORKDIR /app
 Running in 4a4805c39555
Removing intermediate container 4a4805c39555
 6ad6eba5cadb
Step 5/28 : COPY package.json package-lock.json* ./
 a396d6bacdb5
Step 6/28 : RUN   if [ -f package-lock.json ]; then npm ci;   else echo "Lockfile not found." && exit 1;   fi
 Running in 4c119120edc2
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
