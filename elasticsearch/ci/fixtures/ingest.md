# Ingest — the pipeline and the source index the « How to use » examples rely on

```bash
PUT _ingest/pipeline/my_ingest_pipeline
{
  "processors": [
    { "set": { "field": "ingested", "value": true } }
  ]
}

POST /existing-index/_doc
{ "field1": "value1" }
```
