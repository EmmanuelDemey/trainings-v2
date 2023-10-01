---
layout: cover
---

# APM

---

# APM

* Nous allons aborder dans ce chapitre comment monitorer une application Java
    * Présenter le ECS
    * Gérer les logs applicatifs
    * Mettre en en place un APM

---

# Elastic Common Schema

* **ECS** est une spécification permettant de standardiser les documents indexés dans Elasticsearch.
* Cela permet de faciliter la recherche, visualisation et corrélation entre les documents
* Toutes les solutions de la suite **Elastic** respectent cette spécification

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

# Gérer les logs applicatifs

* Si vous souhaitez générer des logs applicatifs utilisant le *ECS*, il suffit d'utiliser le
module *log4j2-ecs-layout* proposé par Elastic.
* Il est fonctionnel avec les framework
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

# Configuration pour Spring Boot

* Puis configurer LogBack (ici spécifique à Spring Boot)

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
* Permet de monitorer un système en recoltant les temps d'exécutions
    * de requêtes HTTP
    * d'accès à une base de données
    * d'une manipulation d'un cache
    * des métriques
    * des erreurs
    * ...
* D'autres solutions existent : Dynatrace, Datadog ou encore NewRelic

--- 

# APM Installation

* Avec l'intégration Elastic APM
* Avec le serveur standalone APM

---

# Architecture

image::../images/apm.png[]

---

# Installation

* Pour mettre en oeuvre APM, il faudra
    * lancer le serveur APM (configuration identique à celle de la stack Beat)
    * installer une dépendance en fonction du langage de programmation utilisé
    * visualiser les données depuis Kibana

---

# Installation

* Pour lancer le serveur APM, il faudra
    * éventuellement le configurer via le fichier `apm-server.yml`
    * exécuter la commande `./apm-server -e`

---

# Démo avec APM standalone

---

# Langage supporté

* Il existe de nombreux Agent APM
    * Go
    * Java
    * Node.js
    * Python
    * Ruby
    * .NET
    * PHP

---

# Agent Java

* Agent supportant de multiple frameworks Java
* Détecte par défaut les appels vers les bases de données, requetes HTTP, ...
* Aucune modification de votre code est nécessaire

---

# Installation

* Activation automatique

```xml
<dependency>
    <groupId>co.elastic.apm</groupId>
    <artifactId>apm-agent-attach</artifactId>
    <version>${elastic-apm.version}</version>
</dependency>
```

---

# Installation

* Exemple d'activation pour une application Spring Boot

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

* Activation via la ligne de commande

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

* La configuration sera à réalisée dans le fichier de configuration `src/main/resources/elasticapm.properties`

```
service_name=javalin
server_url=http://localhost:8200
```

---

# Configuration

* La configuration peut se faire également
    * via des propriétés Java

```
-Delastic.apm.service_name=my-cool-service
```

    * via des variables d'environnement

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

* Un span contient des informations sur l'exécution d'un code
* Il mesure du début à la fin de son exécution
* Peut avoir des relations vers des spans enfants
* Contient les propriétés `transaction.id`, `parent.id`, `name`, `type`

---

# Transaction

* Une Transaction est un Span particulier
* On peut définir une transaction comme étant l'unité de travail principal du code instrumenté
* Possède des informations liés
    * au service (environnement, framework, ...)
    * le host (IP, architecture, ...)
    * l'URL (domaine, port, ...)

---

# Public API

* Nous pouvons intéragir dans les `span` et `transactions` crées.
    * Annotation
    * Public API
    * OpenTelemetry ou OpenTracing Bridges

* Il faut installer la dépendance

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

* Les types ne sont pas normés, mais Elastic propose une liste de type utilisée par l'ensemble des Agents APM
    * `app`
    * `db`
    * `cache`
    * `template`
    * `ext`

---

# SPAN API

* Nous pouvons également ajouter des labels à la current span

```java
Span span = ElasticApm.currentSpan();
span.setLabel("foo", "bar");
```

---

# Plugin API

* Elastic propose également un SDK permettant de créer un plugin afin d'instrumenter votre code.
* Ces plugins seront exécutés directement par l'agent Java

```java
@Advice.OnMethodEnter(suppress = Throwable.class, inline = false)
public static Object onEnterHandle(@Advice.Argument(0) String requestLine) {
}

@Advice.OnMethodExit(suppress = Throwable.class, onThrowable = Throwable.class, inline = false)
public static void onExitHandle(@Advice.Thrown Throwable thrown, @Advice.Enter Object scopeObject) {
}
```

---

# Distributing Tracing

* La corrélation entre les différentes briques de votre infrastructure est possible grâce au header `trace-id`

```java
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

* Visualisation de l'ensemble des services instrumentés
* Permet de voir les relations entre les services
* Un service non instrumenté ou quand le header `traceparent` est absent, la connexion ne sera pas visible.

image::../images/servicemap.png[]

---

# RUM

* RUM == Real User Monitoring
* Permet de récupérer des métriques d'une application Web
    * Load Time
    * API Request
    * Navigation des SPQ
    * Core Web Vitals

---

# Configuration du Serveur

* Il faut premièrement activer RUM sur le serveur APM
* Ainsi que configurer correctement les CORS

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

* Nous avons ensuite une API similaire au client Java

```javascript
apm.setUserContext(context)
apm.addFilter(payload => ...)
apm.startTransaction(...)
apm.startSpan(...)
----
```

