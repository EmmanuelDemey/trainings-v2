---
layout: cover
---

# Analyzers

---

# Analyzers

* Each property of type `text` will be analyzed by Elasticsearch.
* This `analyze` phase consists of three steps:
    * Char Filters
    * Tokenizer
    * Token Filters
* After the analysis phase, the result is placed in a inverted index.

---

# Analyzers

![](/images/analyzer.png)

---

# Char Filters

* Char Filters allow modification of the original text by removing, modifying, or adding characters.
* Multiple `Char Filters` can be configured for an analyzer.
* Each implementation is configurable.

---

# Char Filters

* Only three *Char Filters* are available:
  
* `HTML Strip`

```
<p>I&apos;m so <b>happy</b>!</p
-> \nI'm so happy!\n
```

* `Mapping`

```
My license plate is ٢٥٠١٥
-> My license plate is 25015
```

* `Pattern Replace`

```
My credit card is 123-456-789
-> My credit card is 123_456_789
```

---

# Tokenizers

* A tokenizer defines how the text should be broken down.
* We have one token as input, and 0+ tokens as output.
* Only one Tokenizer can be configured for an analyzer.
* Each implementation is configurable.
* Many tokenizers are available natively.

---

# Tokenizers

* Whitespace tokenizer

```
The 2 QUICK Brown-Foxes jumped over the lazy dog's bone.

-> [ The, 2, QUICK, Brown-Foxes, jumped, over, the, lazy, dog's, bone. ]
```

* Letter tokenizer

```
The 2 QUICK Brown-Foxes jumped over the lazy dog's bone.

-> [ The, QUICK, Brown, Foxes, jumped, over, the, lazy, dog, s, bone ]
```

* Path Hierarchy tokenizer

```
/one/two/three

-> [ /one, /one/two, /one/two/three ]
```

* N-gram tokenizer

```
Quick

-> [ Q, Qu, u, ui, i, ic, c, ck, k]
```

---

# Token Filters

* A token filter allows modification, deletion, or addition of tokens to the previously created list.
* Used to remove common words, manage synonyms, conjugations, accents, casing...
* Multiple Token Filters can be configured for an analyzer.
* Each implementation is configurable.
* Many token filters are available natively.

---

# Token Filters

* Stop token filter

```
a quick fox jumps over the lazy dog

-> [ quick, fox, jumps, over, lazy, dog ]
```

* Ascii folding token filter

```
açaí à la carte

-> [ acai, a, la, carte ]
```

* Stemmer token filter

```
développeuse

-> developeu
```

* Synonym token filter

```
a quick fox jumps over the lazy dog

-> [ quick, fox, jumps, over, lazy, dog, hound ]
```

---

# Custom Analyzers

* With these elements, we can create our own Analyzers.
* And then associate them with certain fields in our documents.
* An analyzer can be defined for indexing and for searching.
* By default, the one for indexing is also used for searching.

---

# Custom Analyzers

```
PUT movies
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "char_filter": [
            "html_strip"
          ],
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  }
}
```

---

# Custom Analyzers

```
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}
```

---

# Built-in Analyzers

* You can also use the built-in analyzers
    * `Keyword`,
    * `Standard`
    * `Language`
    * ...

```
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "french"
      }
    }
  }
}
```

---

# Analyzers

![](/images/analyzer_example.png)

---

# Analyzers

![](/images/analyzer3.png)

---

# Mapping Modification

* If the mapping changes, a complete reindexing of the data is necessary.
* Good practice: use an alias to avoid changing the application code.
* Reindexing can be done via a batch system or using the _reindex_ API.

---

# Mapping Modification

![](/images/reindex1.png)

---

# Mapping Modification

![](/images/reindex2.png)

---

# Mapping Modification

![](/images/reindex3.png)

---

# Alias Configuration

```
POST /_aliases
{
    "actions": [
        {
            "remove": {
                "alias": "movies",
                "index": "movies_v1"
            }
        },
        {
            "add": {
                "alias": "movies",
                "index": "movies_v2"
            }
        }
    ]
}
```

---

# Reindex API

* We can reindex a complete index

```
POST _reindex
{
  "source": {
    "index": "movies_v1"
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* Or just a portion by defining a search query

```
POST _reindex
{
  "source": {
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Reindex API

* We're not limited to indexes within the same cluster
* We can reindex data from a remote cluster

```
POST _reindex
{
  "source": {
    "remote": {
      "host": "http://otherhost:9200"
    },
    "index": "movies_v1",
    "query": {
      "term": {
        "year": 2010
      }
    }
  },
  "dest": {
    "index": "movies_v2"
  }
}
```

---

# Test Your Mapping

* Elasticsearch provides an endpoint for testing your mappings

```
POST _analyze
{
  "analyzer": "whitespace",
  "text":     "The quick brown fox."
}
```

---

# Test Your Mapping

```
{
  "tokens": [
    {
      "token

": "The",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0
    },
    {
      "token": "quick",
      "start_offset": 4,
      "end_offset": 9,
      "type": "word",
      "position": 1
    },
    {
      "token": "brown",
      "start_offset": 10,
      "end_offset": 15,
      "type": "word",
      "position": 2
    },
    {
      "token": "fox.",
      "start_offset": 16,
      "end_offset": 20,
      "type": "word",
      "position": 3
    }
  ]
}
```
---

# Test Your Mappings

```
POST _analyze
{
  "tokenizer": "standard",
  "filter":  [ "lowercase", "asciifolding" ],
  "text":      "Is this déja vu?"
}
```
---

# Test Your Mappings

```
POST my_index/_analyze
{
  "field": "my_text",
  "text":  "Is this déjà vu?"
}
```

---

# Templates

* We can define `index` and `component` templates
* This centralizes the configuration of an index
* And can be reused when a new index is created
* Using templates is a recommended practice

---

# Component Templates

```
PUT _component_template/component_template1
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}
```

---

# Index Templates

```
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        }
      }
    },
    "aliases": {
      "mydata": { }
    }
  },
  "priority": 500,
  "composed_of": ["component_template1"],
  "_meta": {
    "description": "my custom"
  }
}
```

---
layout: cover
---
# Presentation of the Documentation
