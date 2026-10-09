# Fixture of the chapter « Multitenancy »: per-application and monthly logs indices, and a shared one with a tenant field

```bash
POST /_bulk
{ "index": { "_index": "logs-app_a" } }
{ "timestamp": "2025-01-15T10:00:00Z", "level": "INFO", "message": "started" }
{ "index": { "_index": "logs-app_b" } }
{ "timestamp": "2025-01-15T10:00:00Z", "level": "ERROR", "message": "failed" }
{ "index": { "_index": "logs-2025.01" } }
{ "timestamp": "2025-01-15T10:00:00Z", "level": "INFO", "message": "january" }
{ "index": { "_index": "logs-2025.02" } }
{ "timestamp": "2025-02-15T10:00:00Z", "level": "INFO", "message": "february" }
{ "index": { "_index": "logs-2025.03" } }
{ "timestamp": "2025-03-15T10:00:00Z", "level": "INFO", "message": "march" }
{ "index": { "_index": "logs-shared" } }
{ "timestamp": "2025-01-15T10:00:00Z", "tenant": "A", "message": "tenant A" }
{ "index": { "_index": "logs-shared" } }
{ "timestamp": "2025-01-15T10:00:00Z", "tenant": "B", "message": "tenant B" }
```
