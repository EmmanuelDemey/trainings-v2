---
layout: cover
---

# Logstash

---

# Logstash

* Solution historique de la suite Elastic pour faire de l'ingestion de données
* Logstash est un ETL
    * E pour Extract
    * T pour Transform
    * L pour Load
* La suite Beat n'est pas une solution concurrente à Logstash.

---

# ETL

* ETL
    * E pour Extract = Inputs
    * T pour Transform = Filters
    * L pour Load = Outputs
* Pour un même message reçu, nous pouvons avoir plusieurs éléments pour chaque étape.

---

# Getting Started

```
bin/logstash -e 'input { stdin { } } output { stdout {} }'

bin/logstash -f first-pipeline.conf
```

---

# Fichier de configuration

```
input {
  ...
}

filter {
  ...
}

output {
  ...
}
```

---

# Inputs

```
input {
  beats {
    port => 5044
  }
}
```

---

# Inputs

```
input {
  beats {
    port => 5044
  }
}
```

---

# Inputs

```
input {
  jdbc {
    jdbc_driver_library => "mysql-connector-java-5.1.36-bin.jar"
    jdbc_driver_class => "com.mysql.jdbc.Driver"
    jdbc_connection_string => "jdbc:mysql://localhost:3306/mydb"
    jdbc_user => "mysql"
    parameters => { "favorite_artist" => "Beethoven" }
    schedule => "* * * * *"
    statement => "SELECT * from songs where artist = :favorite_artist"
  }
}
```

---

# Filters

```
filter {
    mutate {
        split => ["hostname", "."]
        add_field => { "shortHostname" => "%{hostname[0]}" }
    }

    mutate {
        rename => ["shortHostname", "hostname" ]
    }
}
```

---

# Filters

```
filter {
  grok {
    match => { "message" => "%{IP:client} %{WORD:method} %{URIPATHPARAM:request} %{NUMBER:bytes} %{NUMBER:duration}" }
  }
}
```

---

# Filters

```
filter {
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
    target => "@timestamp"
 }
}
```

---

# Outputs

```
output {
  elasticsearch {
    index => "%{[some_field][sub_field]}-%{+YYYY.MM.dd}"
  }
}
```

---

# Debug

* Pour tester votre fichier de configuration

```
bin/logstash --config.test_and_exit -f <path_to_config_file>
```

---

# Inputs

```
input {
  beats {
    port => 5044,
    type => "beat"
  }
  jdbc {
    type => "jdbc"
  }
}

filter {
    if [type] == "jdbc" {
    }
    if [type] == "beat" {
    }
}
```

---

# Pipeline

* Si vous avez plusieurs pipelines à exécuter, nous pouvons définir un fichier pipelines.yml.
* Ce fichier doit être définir dans le répertoire `path.settings`

```
- pipeline.id: my-pipeline_1
  path.config: "/etc/path/to/p1.config"
  pipeline.workers: 3
- pipeline.id: my-other-pipeline
  path.config: "/etc/different/path/p2.cfg"
  queue.type: persisted
```

---

# Pipeline

* Possibilité de faire une communication cross-pipeline

```
- pipeline.id: upstream
  config.string: input { stdin {} } output { pipeline { send_to => [myVirtualAddress] } }
- pipeline.id: downstream
  config.string: input { pipeline { address => myVirtualAddress } }
```

---

# Optimisation

* Nous pouvons tuner Logstash via deux propriétés
    * `workers` : le nombre maximal de traitements en parallèle
    * `batch size` : le nombre d'éléments qui seront traités en un seul batch
* Vous pouvez augmenter les `workers quand vous remarquez que le CPU n'est pas complètement utilisé.
* Une augmentation du batch size nécessitera peut être une augmentation de la HEAP.

```
pipeline.workers: 12
pipeline.batch.size: 125
```

---

# Monitoring

* Logstash propose 4 API pour le monitoring

```
curl -XGET localhost:9600/_node
curl -XGET localhost:9600/_node/plugins
curl -XGET localhost:9600/_node/stats
curl -XGET localhost:9600/_node/hot_threads
```

---

# Monitoring

* Demo avec Kibana

---
