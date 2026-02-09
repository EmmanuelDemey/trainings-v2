---
layout: cover
---

# APM

---

# APM

* In this chapter, we will cover how to monitor a Java application
    * Introducing the ECS
    * Managing application logs
    * Setting up APM

---

# Elastic Common Schema

* **ECS** is a specification for standardizing documents indexed in Elasticsearch.
* This makes it easier to search, visualize, and correlate between documents.
* All solutions in the **Elastic** stack adhere to this specification.

```json
{
    "@timestamp": "2022-10-20T17:38:40.752Z",
    "service": {
      "type": "system"
    },
    "system": {
      "socket": {
        "summary": {
          "tcp": {
            "all": {
              "listening": 29,
              "established": 109,
              "close_wait": 2,
              "fin_wait2": 0,
              "count": 143,
              "syn_recv": 0,
              "fin_wait1": 0,
              "closing": 0,
              "time_wait": 0,
              "last_ack": 0,
              "syn_sent": 0
            }
          },
          "udp": {
            "all": {
              "count": 10
            }
          },
          "all": {
            "count": 153,
            "listening": 29
          }
        }
      }
    },
    "host": {
      "name": "MacBook",
      "mac": [],
      "hostname": "MBP",
      "architecture": "x86_64",
      "os": {
        "type": "macos",
        "platform": "darwin",
        "version": "12.4",
        "family": "darwin",
        "name": "macOS",
        "kernel": "21.5.0",
        "build": "21F79"
      }
    }
}
```

---

# Managing Application Logs

* If you want to generate application logs using *ECS*, simply use the *log4j2-ecs-layout* module provided by Elastic.
* It works with frameworks like:
    * LogBack
    * Log4j2
    * Log4j
    * JUL

```xml
<dependency>
    <groupId>co.elastic.logging</groupId>
    <artifactId>logback-ecs-encoder</artifactId>
    <version>${ecs-logging-java.version}</version>
</dependency>
```

---

# Configuration for Spring Boot

* Then configure LogBack (specific to Spring Boot here)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}}/spring.log}"/>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <include resource="org/springframework/boot/logging/logback/console-appender.xml" />
    <include resource="org/springframework/boot/logging/logback/file-appender.xml" />
    <include resource="co/elastic/logging/logback/boot/ecs-console-appender.xml" />
    <include resource="co/elastic/logging/logback/boot/ecs-file-appender.xml" />
    <root level="INFO">
        <appender-ref ref="ECS_JSON_CONSOLE"/>
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ECS_JSON_FILE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

# APM

* APM = Application Performance Monitoring
* Allows monitoring a system by collecting execution times
    * of HTTP requests
    * database accesses
    * cache manipulation
    * metrics
    * errors
    * ...
* Other solutions exist: Dynatrace, Datadog, or NewRelic

--- 

# APM Installation

* With Elastic APM integration
* With standalone APM server

---

# Architecture

image::../images/apm.png[]

---

# Installation

* To implement APM, you will need to:
    * start the APM server (configuration similar to that of the Beat stack)
    * install a dependency according to the programming language used
    * view the data from Kibana

---

# Installation

* To start the APM server, you will need to:
    * optionally configure it via the `apm-server.yml` file
    * execute the command `./apm-server -e`

---

# Demo with standalone APM

---

# Supported Languages

* There are many APM agents available:
    * Go
    * Java
    * Node.js
    * Python
    * Ruby
    * .NET
    * PHP

---

# Java Agent

* Agent supporting multiple Java frameworks
* Automatically detects calls to databases, HTTP requests, etc.
* No modification of your code is necessary

---

# Installation

* Automatic activation

```xml
<dependency>
    <groupId>co.elastic.apm</groupId>
    <artifactId>apm-agent-attach</artifactId>
    <version>${elastic-apm.version}</version>
</dependency>
```

---

# Installation

* Example of activation for a Spring Boot application

```java
package fr.emmanueldemey.apm;

import co.elastic.apm.attach.ElasticApmAttacher;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApmApplication {

	public static void main(String[] args) {
		ElasticApmAttacher.attach();
		SpringApplication.run(ApmApplication.class, args);
	}

}
```

---

# Installation

* Activation via the command line

```
java -javaagent:/path/to/elastic-apm-agent-<version>.jar \
     -Delastic.apm.service_name=my-application \
     -Delastic.apm.server_urls=http://localhost:8200 \
     -Delastic.apm.secret_token= \
     -Delastic.apm.environment=production \
     -Delastic.apm.application_packages=org.example \
     -jar my-application.jar
```

---

# Configuration

* Configuration will be done in the `src/main/resources/elasticapm.properties` configuration file

```
service_name=javalin
server_url=http://localhost:8200
```

---

# Configuration

* Configuration can also be done
    * via Java properties

```
-Delastic.apm.service_name=my-cool-service
```

    * via environment variables

```
ELASTIC_APM_SERVICE_NAME=my-cool-service
```

---

# Data Model

* Span
* Transactions
* Errors
* Metrics

---

# Span

* A span contains information about the execution of code
* It measures from the beginning to the end of its execution
* Can have relationships with child spans
* Contains properties such as `transaction.id`, `parent.id`, `name`, `type`

---

# Transaction

* A Transaction is a special Span
* We can define a transaction as the main unit of work of the instrumented code
* Possesses related information
    * to the service (environment, framework, ...)
    * the host (IP, architecture, ...)
    * the URL (domain, port, ...)

---

# Public API

* We

 can interact with the created `span` and `transactions`.
    * Annotation
    * Public API
    * OpenTelemetry or OpenTracing Bridges

* Dependency installation is required

```xml
<dependency>
    <groupId>co.elastic.apm</groupId>
    <artifactId>apm-agent-api</artifactId>
    <version>${elastic-apm.version}</version>
</dependency>
```

---

# @Traced

```java
import co.elastic.apm.api.Traced;

@Traced()
public void delay(int length) {
    try {
        Thread.sleep(length);
    } catch(Exception e) {
        e.printStackTrace();
    }
}
```

---

# SPAN API

```java
import co.elastic.apm.api.ElasticApm;
import co.elastic.apm.api.Span;

public Response onOutgoingRequest(Request request) throws Exception {
    Span span = ElasticApm.currentSpan()
        .startSpan("external", "http", null)
        .setName(request.getMethod() + " " + request.getHost());

    try {
        return request.execute();
    } catch (Exception e) {
        span.captureException(e);
        throw e;
    } finally {
        span.end();
    }
}
```

---

# SPAN API

* Types are not standardized, but Elastic provides a list of types used by all APM Agents
    * `app`
    * `db`
    * `cache`
    * `template`
    * `ext`

---

# SPAN API

* We can also add labels to the current span

```java
import co.elastic.apm.api.ElasticApm;
import co.elastic.apm.api.Span;

Span span = ElasticApm.currentSpan();
span.setLabel("foo", "bar");
```

---

# Plugin API

* Elastic also provides an SDK to create a plugin to instrument your code.
* These plugins will be executed directly by the Java agent

```java
import net.bytebuddy.asm.Advice;

@Advice.OnMethodEnter(suppress = Throwable.class, inline = false)
public static Object onEnterHandle(@Advice.Argument(0) String requestLine) {
}

@Advice.OnMethodExit(suppress = Throwable.class, onThrowable = Throwable.class, inline = false)
public static void onExitHandle(@Advice.Thrown Throwable thrown, @Advice.Enter Object scopeObject) {
}
```

---

# Distributing Tracing

* Correlation between the different components of your infrastructure is possible thanks to the `trace-id` header

```java
import co.elastic.apm.api.ElasticApm;
import co.elastic.apm.api.Span;
import co.elastic.apm.api.Scope;

public Response onOutgoingRequest(Request request) throws Exception {
    Span span = ElasticApm.currentSpan()
        .startSpan("external", "http", null)
        .setName(request.getMethod() + " " + request.getHost());

    try (final Scope scope = transaction.activate()) {
        span.injectTraceHeaders((name, value) -> request.addHeader(name, value));
        return request.execute();
    } catch (Exception e) {
        span.captureException(e);
        throw e;
    } finally {
        span.end();
    }
}
```

---

# Service Map

* Visualization of all instrumented services
* Allows to see the relationships between services
* An uninstrumented service or when the `traceparent` header is absent, the connection will not be visible.

image::../images/servicemap.png[]

---

# RUM

* RUM == Real User Monitoring
* Allows to retrieve metrics from a Web application
    * Load Time
    * API Request
    * Navigation of SPQ
    * Core Web Vitals

---

# Server Configuration

* Firstly, you need to enable RUM on the APM server
* As well as correctly configure CORS

```
apm-server.rum.enabled: true
apm-server.auth.anonymous.rate_limit.event_limit: 300
apm-server.auth.anonymous.rate_limit.ip_limit: 1000
apm-server.auth.anonymous.allow_service: [your_service_name]
apm-server.rum.allow_origins: ['*']
apm-server.rum.allow_headers: ["header1", "header2"]
```

---

# Installation

```
npm install @elastic/apm-rum --save
```

```javascript
import { init } from '@elastic/apm-rum'

const apm = init({
  serviceName: 'react-app',
  serverUrl: 'http://localhost:8200',
  distributedTracingOrigins: ['http://localhost:8080']
})
```

---

# API

* We then have an API similar to the Java client

```javascript
apm.setUserContext(context)
apm.addFilter(payload => ...)
apm.startTransaction(...)
apm.startSpan(...)
----
```

