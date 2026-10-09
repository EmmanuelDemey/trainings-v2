# Fixture of the chapter « Aliases »: two monthly logs indices

```bash
POST /_bulk
{ "index": { "_index": "logs_2024_02" } }
{ "timestamp": "2024-02-15T10:00:00Z", "level": "error", "message": "february" }
{ "index": { "_index": "logs_2024_03" } }
{ "timestamp": "2024-03-15T10:00:00Z", "level": "info", "message": "march" }
```
