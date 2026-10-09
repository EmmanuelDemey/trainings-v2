# The `web-logs` index and the `countries` lookup index the ES|QL examples query

```bash
PUT /web-logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "url": { "type": "keyword" },
      "message": { "type": "text" },
      "status": { "type": "integer" },
      "bytes": { "type": "long" },
      "country_code": { "type": "keyword" },
      "host": { "type": "keyword" }
    }
  }
}

POST /web-logs/_bulk
{"index":{}}
{"@timestamp":"2026-10-01T10:00:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1200,"country_code":"FR","host":"web-1"}
{"index":{}}
{"@timestamp":"2026-10-01T10:05:00Z","url":"/cart","message":"POST /cart failed: timeout","status":500,"bytes":300,"country_code":"DE","host":"web-2"}
{"index":{}}
{"@timestamp":"2026-10-01T11:00:00Z","url":"/old","message":"GET /old not found","status":404,"bytes":0,"country_code":"FR","host":"web-1"}
{"index":{}}
{"@timestamp":"2026-10-01T11:30:00Z","url":"/home","message":"GET /home served","status":200,"bytes":1500,"country_code":"ES","host":"web-2"}

PUT /countries
{
  "settings": { "index.mode": "lookup" },
  "mappings": {
    "properties": {
      "country_code": { "type": "keyword" },
      "country_name": { "type": "keyword" }
    }
  }
}

POST /countries/_bulk
{"index":{}}
{"country_code":"FR","country_name":"France"}
{"index":{}}
{"country_code":"DE","country_name":"Germany"}
{"index":{}}
{"country_code":"ES","country_name":"Spain"}
```
