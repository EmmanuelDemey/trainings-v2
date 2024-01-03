---
layout: cover
---

# Ingest Pipelines

---

# Ingest Pipeline

* Les pipelines d'Ingestion permettent de modifier la donnée avant indexation
* Identique à des pipelines *Logstash*.
* Peuvent être exécutés par des noeuds spécifiques : **Ingest Node**.

```
node.ingest: false
```

---

# Création

```
PUT _ingest/pipeline/my_pipeline_id
{
  "description" : "describe pipeline",
  "processors" : [
    {
      "set" : {
        "field": "firstName",
        "value": "Emmanuel"
      }
    }
  ]
}
```

---

# Utilisation #1

```
PUT my-index/_doc/1?pipeline=my_pipeline_id
{
  "lastName": "Demey"
}
```

---

# Utilisation #2

```
POST _bulk
{ "index" : { "_index" : "my-index", "_id" : "1", "pipeline": "my_pipeline_id" } }
{ "lastName": "Demey" }
```

---

# Utilisation #3

```
PUT my-index/_settings
{
  "index.default_pipeline": "my_pipeline_id"
}
```

---

# Processeurs

* Set
* Drop
* Grok
* Convert
* ...

---

# Processeur Drop

```
PUT _ingest/pipeline/my-pipeline-id
{
  "description": "drop document if the network name is Guest",
  "processors" : [
    {
        "drop": {
            "if" : "ctx.network_name == 'Guest'"
        }
    }
  ]
}
```

---

# Processeur Convert

```
PUT _ingest/pipeline/my-pipeline-id
{
  "description": "converts the content of the id field to an integer",
  "processors" : [
    {
      "convert" : {
        "field" : "id",
        "type": "integer"
      }
    }
  ]
}
```

---

# Processeur Grok

* Convertir une chaine de caractère en document JSON
    * 192.168.1.13 POST /service/create 143 7

```
{
  "duration": 7,
  "request": "/service/create",
  "method": "POST",
  "bytes": 143,
  "client": "192.168.1.13"
}
```

---

# Processeur Grok

```
PUT _ingest/pipeline/my-pipeline-id
{
  "description": "converts a text into a JSON document",
  "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": ["%{IP:client} %{WORD:method} %{URIPATHPARAM:request} %{NUMBER:bytes:int} %{NUMBER:duration:double}"]
        }
      }
    ]
}
```

---

# Simulation d'un Pipeline

```
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "description" : "...",
    "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": ["%{IP:client} %{WORD:method} %{URIPATHPARAM:request} %{NUMBER:bytes:int} %{NUMBER:duration:double}"]
        }
      }
    ]
  },
  "docs":[
    {
      "_source": {
        "message": "55.3.244.1 GET /index.html 15824 0.043"
      }
    }
  ]
}
```

---

# Indexation de documents

* Si nous souhaitons organiser des documents (pdf, doc, xls, ...) nous devons indexer le contenu en base64
* Elasticsearch fournit un préprocesseur **attachment** permettant d'extraire des informations du document indexé
* Une fois ces informations récupérées, elles seront indexées comme n'importe quel document.

```
PUT _ingest/pipeline/blob
{
  "description": "Extract attachment information",
    "processors": [
      {
        "attachment": {
          "field": "data",
          "remove_binary": true
        }
      }
    ]
}

POST /blob_index/_doc?pipeline=blob
{
  "data": "Base64-content...=="
}

GET /blob_index/_search?q=elasticsearch
```

---
