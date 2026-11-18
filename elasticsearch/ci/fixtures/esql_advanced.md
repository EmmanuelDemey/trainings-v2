# The `web-logs` and `hosts` indices the examples of the advanced ES|QL chapter query

The enrich policy is created by the chapter itself: the wipe between two files
does not delete enrich policies, so this fixture removes the one of a previous run.

```bash
DELETE /_enrich/policy/hosts-policy

PUT /web-logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "url": { "type": "keyword" },
      "message": { "type": "text" },
      "status": { "type": "integer" },
      "bytes": { "type": "long" },
      "client_ip": { "type": "ip" },
      "host": { "type": "keyword" },
      "labels": { "type": "flattened" }
    }
  }
}

POST /web-logs/_bulk?refresh=true
{"index":{}}
{"@timestamp":"2026-10-01T10:00:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1200,"client_ip":"81.2.69.142","host":"web-1","labels":{"env":"prod","team":"web"}}
{"index":{}}
{"@timestamp":"2026-10-01T10:05:00Z","url":"/cart","message":"POST /cart failed: payment timeout","status":500,"bytes":300,"client_ip":"8.8.8.8","host":"web-2","labels":{"env":"prod","team":"shop"}}
{"index":{}}
{"@timestamp":"2026-10-01T10:06:00Z","url":"/cart","message":"POST /cart failed: timeout","status":500,"bytes":300,"client_ip":"8.8.8.8","host":"web-2","labels":{"env":"prod","team":"shop"}}
{"index":{}}
{"@timestamp":"2026-10-01T11:00:00Z","url":"/old","message":"GET /old not found","status":404,"bytes":0,"client_ip":"89.160.20.128","host":"web-1","labels":{"env":"staging","team":"web"}}

PUT /hosts
{
  "mappings": {
    "properties": {
      "host": { "type": "keyword" },
      "datacenter": { "type": "keyword" },
      "owner": { "type": "keyword" }
    }
  }
}

POST /hosts/_bulk?refresh=true
{"index":{}}
{"host":"web-1","datacenter":"paris","owner":"team-web"}
{"index":{}}
{"host":"web-2","datacenter":"frankfurt","owner":"team-shop"}
```
