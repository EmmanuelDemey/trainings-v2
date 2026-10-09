# Fixture of the chapter « Analyzers »: a movies index whose title is analyzed

```bash
PUT /movies
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "english" }
    }
  }
}
```
