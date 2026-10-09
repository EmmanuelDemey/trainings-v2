---
layout: cover
---

# Logstash

---

# Logstash

* Historical solution in the Elastic suite for data ingestion
* Logstash is an ETL
    * E for Extract
    * T for Transform
    * L for Load
* The Beats suite is not a competing solution to Logstash.

---

# ETL

* ETL
    * E for Extract = Inputs
    * T for Transform = Filters
    * L for Load = Outputs
* For the same received message, we can have multiple elements for each step.

---

# Getting Started

```
bin/logstash -e 'input { stdin { } } output { stdout {} }'

bin/logstash -f first-pipeline.conf
```

---

# Configuration File

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
    index => "%{\[some_field\]\[sub_field\]}-%{+YYYY.MM.dd}"
  }
}
```

---

# Debug

* To test your configuration file

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

* If you have multiple pipelines to execute, we can define a pipelines.yml file.
* This file must be defined in the `path.settings` directory

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

* Possibility to perform cross-pipeline communication

```
- pipeline.id: upstream
  config.string: input { stdin {} } output { pipeline { send_to => [myVirtualAddress] } }
- pipeline.id: downstream
  config.string: input { pipeline { address => myVirtualAddress } }
```

---

# Optimization

* We can tune Logstash via two properties
    * `workers`: the maximum number of parallel processes
    * `batch size`: the number of items that will be processed in a single batch
* You can increase `workers` when you notice that the CPU is not fully utilized.
* Increasing the batch size may require increasing the HEAP.

```
pipeline.workers: 12
pipeline.batch.size: 125
```

---

# Monitoring

* Logstash offers 4 APIs for monitoring

```
curl -XGET localhost:9600/_node
curl -XGET localhost:9600/_node/plugins
curl -XGET localhost:9600/_node/stats
curl -XGET localhost:9600/_node/hot_threads
```

---

# Monitoring

* Demo with Kibana

---