---
layout: cover
---

# Beats

---

# Architecture

* Agents written in Go
* Data collectors
* Follow the same configuration philosophy
* Configured via a YAML file
* Extensible

---

# Architecture

* Configuration via a YAML configuration file

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

* Agent used to ensure the availability of a service

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

* Agent used to index log lines
* Possibility to enable modules to support logs from open-source products

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

* Agent used to index server or system metrics
* Possibility to enable modules to support logs from open-source products

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

* Agent used to index network packets passing through an information system
* Possibility to enable modules to support standardized frames.

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

# Best Practices

* Like Logstash, we can configure the `bulk` size and the number of `workers`

```
output.elasticsearch:
  hosts: ["10.45.3.2:9220", "10.45.3.1:9230"]
  worker: 1
  bulk_max_size: 50
```

---