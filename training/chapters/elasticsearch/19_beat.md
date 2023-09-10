---
layout: cover
---

# Beats

---

# Architecture

* Agents écrits en Go
* Collecteurs de données
* Respectent la même philosophie de configuration
* Configuration via un fichier YAML
* Extensibles

---

# Architecture

* Configuration via un fichier de configuration yaml

```
./bin/*beat setup -e
./bin/*beat -e
```

---

# Architecture

```
output.elasticsearch:
  hosts: ["10.45.3.2:9220", "10.45.3.1:9230"]
```

---

# Heartbeat

* Agent permettant de s'assurer de la disponibilité d'un service

---

# Heartbeat

```
heartbeat.monitors:
- type: tcp
  schedule: '*/5 * * * * * *'
  hosts: ["myhost:12345"]
  id: my-tcp-service
- type: http
  schedule: '@every 5s'
  urls: ["http://example.net"]
  service_name: apm-service-name
  id: my-http-service
  name: My HTTP Service
```

---

# Heartbeat

```
./heartbeat setup -e
./heartbeat -e
```

---

# Filebeat

* Agent permettant d'indexer des lignes de logs
* Possibilité d'activer des modules permettant de supporter des logs de produits open-source

```
filebeat modules enable system nginx mysql
```

---

# Filebeat

```
./filebeat setup -e
./filebeat -e
```

---

# Metricbeat

* Agent permettant d'indexer des métriques d'un serveur ou d'un système
* Possibilité d'activer des modules permettant de supporter des logs de produits open-source

```
metricbeat modules enable apache mysql
```

---

# Metricbeat

```
./metricbeat setup -e
./metricbeat -e
```

---

# Packetbeat

* Agent permettant d'indexer des paquets réseau transitant dans un système d'informations
* Possibilité d'activer des modules permettant de supporter des trames standardisées.

---

# Packetbeat

```
./packetbeat setup -e
./packetbeat -e
```

---

# Packetbeat

```
packetbeat.protocols:

- type: dhcpv4
  ports: [67, 68]

- type: dns
  ports: [53]

- type: http
  ports: [80, 8080, 8081, 5000, 8002]
```

---

# Bonnes Pratiques

* Comme Logstash, nous pouvons configurer la taille du `bulk` et le nombre de `worker`

```
output.elasticsearch:
  hosts: ["10.45.3.2:9220", "10.45.3.1:9230"]
  worker: 1
  bulk_max_size: 50
```

---