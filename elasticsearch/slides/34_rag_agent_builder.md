---
layout: cover
---

# 34 - RAG and Agent Builder

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Explain** Retrieval Augmented Generation, and what Elasticsearch brings to it
- **Prepare** an index for RAG: chunks, `semantic_text`, the `semantic` highlighter
- **Connect** an LLM with the Inference API (`completion`, `chat_completion`)
- **Build** a RAG flow in ES|QL: retrieve, `RERANK`, `COMPLETION`
- **Describe** Elastic Agent Builder: agents, tools, the converse API, MCP and A2A
- **Create** an ES|QL tool and an agent through the Kibana API

---

# Why RAG?

An LLM alone:

- knows nothing **after its training cut-off**, and nothing of **your** data (tickets, docs, contracts…)
- **hallucinates**: a fluent answer, even when it does not know
- cannot say **where** an answer comes from

**Retrieval Augmented Generation**: search first, then let the LLM answer **from the documents found**

- The knowledge stays in the index: up to date, with its **permissions** (DLS/FLS, chapter 17)
- The answer can **cite its sources**
- Retrieval quality = answer quality: this is a **search** problem — Elasticsearch's job

---

# The RAG flow

```text
 question ──► retrieve ──► rerank ──► build the prompt ──► LLM ──► answer + sources
              (hybrid:      (top 50      (instructions,
               BM25 + kNN)   → top 5)     chunks, question)
```

| Step | In Elasticsearch |
|---|---|
| Split and embed the documents | `semantic_text` (chunking + inference at index time) |
| Retrieve | Retrievers: `rrf`, `linear` (chapter 13), or ES\|QL `MATCH` / `KNN` / `FORK` + `FUSE` |
| Keep the relevant passages | The `semantic` highlighter: the best **chunks**, not whole documents |
| Rerank | `text_similarity_reranker` retriever, ES\|QL `RERANK` |
| Generate | Inference API (`completion`, `chat_completion`), ES\|QL `COMPLETION`, Playground, Agent Builder |

---

# Chunks: `chunking_settings`

```json
PUT /kb
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "product": { "type": "keyword" },
      "content": {
        "type": "semantic_text",
        "inference_id": ".multilingual-e5-small-elasticsearch",
        "chunking_settings": { "strategy": "sentence", "max_chunk_size": 20, "sentence_overlap": 0 }
      }
    }
  }
}
```

- A long document is **split** before embedding: one vector per chunk, all searched
- `strategy`: `sentence` (default, `max_chunk_size` in words, `sentence_overlap` 0 or 1), `word` (`overlap` in words), `none`
- Small chunks: precise passages, more vectors; large chunks: more context per hit
- Default: `sentence`, 250 words, 1 sentence of overlap

---

# The knowledge base

<!-- ci: retry -->
```json
POST /kb/_bulk?refresh=true
{"index":{"_id":"1"}}
{"title":"Reset your password","product":"account","content":"Open Settings, then Security. Click Reset password and follow the link we email you. The link expires after 30 minutes."}
{"index":{"_id":"2"}}
{"title":"Delivery times","product":"shop","content":"Orders ship within 24 hours. Delivery takes 2 to 4 working days in France, 5 to 7 days elsewhere in Europe."}
{"index":{"_id":"3"}}
{"title":"Refunds","product":"shop","content":"You can return an item within 30 days. The refund reaches your bank account 5 days after we receive the parcel."}
```

- The first bulk deploys the E5 model on the ML node: allow a minute the first time

---

# Retrieve the passages

```json
POST /kb/_search
{
  "query": { "match": { "content": "When will my order be delivered?" } },
  "size": 1,
  "_source": ["title"],
  "highlight": { "fields": { "content": { "type": "semantic", "number_of_fragments": 1 } } }
}
```

**Expected result**:

```json
{
  "hits": { "hits": [ {
    "_id": "2",
    "_source": { "title": "Delivery times" },
    "highlight": { "content": [ "Delivery takes 2 to 4 working days in France, 5 to 7 days elsewhere in Europe." ] }
  } ] }
}
```

- The highlighter returns the **chunk** that matched — not the whole document: a short, focused context for the LLM
- In production: a hybrid retriever (`rrf`), a filter on the user's product or language, a reranker

---

# Connect an LLM: the Inference API

<!-- ci: skip -->
```json
PUT /_inference/completion/claude-completion
{
  "service": "anthropic",
  "service_settings": { "api_key": "<api key>", "model_id": "claude-haiku-5-5" },
  "task_settings": { "max_tokens": 1024 }
}
```

<!-- ci: skip -->
```json
POST /_inference/completion/claude-completion
{ "input": "In one sentence: what is a shard?" }
```

- Task types: `completion` (one prompt, one answer), `chat_completion` (messages, tools, **streaming** with `_stream`)
- Services: OpenAI, Azure OpenAI, Anthropic (`chat_completion` new in 9.5), Amazon Bedrock, Google Vertex AI, Mistral, Cohere…
- On Elastic Cloud: the **Elastic Inference Service** (EIS) provides managed LLM and embedding endpoints, no key to manage
- The key is stored in the endpoint, checked at creation: a wrong key fails at once (`401 … invalid x-api-key`)

---

# RAG in ES|QL: build the prompt

```json
POST /_query?format=txt
{
  "query": """
    FROM kb METADATA _score
    | WHERE MATCH(content, ?question)
    | SORT _score DESC
    | LIMIT 2
    | STATS context = MV_CONCAT(VALUES(content), " --- ")
    | EVAL prompt = CONCAT("Answer using only these sources. ", context, " Question: ", ?question)
    | KEEP prompt
  """,
  "params": [ { "question": "When will my order be delivered?" } ]
}
```

- `?question`: a **parameter**, never concatenated into the query (injection, chapter 12)
- `STATS … VALUES` + `MV_CONCAT`: the top passages become **one** context
- Then a single line: `| COMPLETION answer = prompt WITH { "inference_id": "claude-completion" }`

---

# `RERANK` and `COMPLETION`

<!-- ci: skip -->
```json
POST /_query?format=txt
{
  "query": """
    FROM kb METADATA _score
    | WHERE MATCH(content, ?question)
    | SORT _score DESC
    | LIMIT 50
    | RERANK ?question ON content WITH { "inference_id": ".rerank-v1-elasticsearch" }
    | SORT _score DESC
    | LIMIT 3
    | STATS context = MV_CONCAT(VALUES(content), " --- ")
    | EVAL prompt = CONCAT("Answer using only these sources. ", context, " Question: ", ?question)
    | COMPLETION answer = prompt WITH { "inference_id": "claude-completion", "timeout": "60s" }
    | KEEP answer
  """,
  "params": [ { "question": "When will my order be delivered?" } ]
}
```

- `RERANK` (GA since 9.4) rewrites `_score` but **does not sort**: add `SORT _score DESC` after it
- `COMPLETION` (GA since 9.3) needs a `completion` endpoint; **one LLM call per row** (100 rows max by default): aggregate first
- New in 9.5: a `timeout` option on both

---

# RAG without code: Playground

- Kibana → **Search → Playground**
  - choose an **LLM connector** (OpenAI, Bedrock, Gemini, Anthropic, EIS…) and one or more **indices**
  - tune the retrieval: fields, `semantic_text` or kNN, the number of passages
  - edit the **instructions** (system prompt), ask questions, see the citations
- **View code**: the Python or LangChain code of what you just tuned — the start of your application

> Prototype the prompt and the retrieval in Playground, then move the code into your application.

---

# RAG: the pitfalls

| Pitfall | Answer |
|---|---|
| The right document is never retrieved | Hybrid search, synonyms, smaller chunks, reranking: **measure** recall |
| The LLM ignores the context | Clear instructions: « answer only from the sources, say *I don't know* otherwise » |
| A document contains instructions (« ignore the previous… ») | **Prompt injection**: treat retrieved text as data, restrict what tools may do |
| A user sees another customer's data | Search **as the user**: API key or DLS — never with a superuser |
| Cost and latency | Fewer, shorter chunks; cache frequent answers; a smaller model |
| « It works on my 5 questions » | A set of real questions with expected answers, replayed at each change |

---

# Elastic Agent Builder

An **agent**: an LLM that **decides** which tools to call, reads their results, and loops until it can answer.

- **Agent Builder**, in Kibana (since 9.2): build agents that work **on your Elasticsearch data**
- **Agents**: instructions (a system prompt) + a set of tools
- **Tools**:
  - **built-in**: `platform.core.search`, `platform.core.list_indices`, `platform.core.get_index_mapping`, `platform.core.get_document_by_id`…
  - **custom**: an **ES|QL** query with parameters, an **index search** limited to some indices, a **workflow**, an **MCP** server
- A default agent, in the chat UI: ask « which hosts had the most 500 errors yesterday? »
- Everything is also an **API**: `kbn:/api/agent_builder/…`

---

# A custom ES|QL tool

<!-- ci: skip -->
```json
POST kbn:/api/agent_builder/tools
{
  "id": "kb-search",
  "type": "esql",
  "description": "Search the help center. Use it for any question about accounts, delivery or refunds.",
  "tags": ["support"],
  "configuration": {
    "query": "FROM kb METADATA _score | WHERE MATCH(content, ?question) | SORT _score DESC | LIMIT 3 | KEEP title, content",
    "params": {
      "question": { "type": "string", "description": "The customer's question, in their words" }
    }
  }
}
```

- The LLM chooses the tool from its **description**: write it for the model, not for you
- The query is **fixed**, the LLM only fills `?question`: no free-form query on your cluster
- `kbn:` in Dev Tools sends the request to **Kibana**, not to Elasticsearch

---

# An agent

<!-- ci: skip -->
```json
POST kbn:/api/agent_builder/agents
{
  "id": "support-agent",
  "name": "Support assistant",
  "description": "Answers customer questions from the help center",
  "configuration": {
    "instructions": "You answer customer questions. Use only the help center. Quote the article title. If you do not find the answer, say so.",
    "tools": [ { "tool_ids": ["kb-search", "platform.core.get_document_by_id"] } ]
  }
}
```

<!-- ci: skip -->
```json
POST kbn:/api/agent_builder/converse
{ "agent_id": "support-agent", "input": "When will my order be delivered?" }
```

- The response: `conversation_id` (send it back to continue), `steps` (reasoning, `tool_call` with its `params` and `results`), `response.message`, `model_usage`
- The agent needs an **LLM connector** (or EIS) configured in Kibana

---

# Open your agents: MCP and A2A

- **MCP server**: `{KIBANA_URL}/api/agent_builder/mcp` (`/s/<space>/…` in a space) — GA since 9.3
  - Claude Desktop, Claude Code, VS Code, Cursor… call **your tools** (built-in and custom) on your data
  - authentication: an **API key** (`Authorization: ApiKey …`), with the `feature_agentBuilder.read` privilege
- **A2A** (Agent-to-Agent): other agent frameworks talk to **your agents**
- **Converse API**: your own application, chat UI or Slack bot

<!-- ci: skip -->
```json
POST /_security/api_key
{
  "name": "mcp-client",
  "role_descriptors": {
    "mcp": {
      "indices": [ { "names": ["kb"], "privileges": ["read", "view_index_metadata"] } ],
      "applications": [ { "application": "kibana-.kibana", "privileges": ["feature_agentBuilder.read"], "resources": ["*"] } ]
    }
  }
}
```

---

# New in 9.5

- **Agent observability** (technical preview): LLM calls, tool calls and reasoning steps traced as **OpenTelemetry** data, in Elasticsearch
- **Human-in-the-loop**: sensitive actions wait for an approval — `converse` returns `status: awaiting_prompt` and `response.prompts`, answered with `allow: true/false`; every decision is audited
- **Create from chat**: describe a tool, a query or a workflow, Agent Builder drafts and saves it
- Inference: Anthropic `chat_completion`, multimodal embeddings (image, audio, video, PDF), multimodal rerank on EIS
- ES|QL: `timeout` on `COMPLETION` and `RERANK`

---

# Security: an agent is a user

- An agent runs with the **privileges of the caller** (user or API key): DLS, FLS and index privileges still apply
- Give the API key of an MCP client **only** the indices its tools need
- Prefer **ES|QL tools with parameters** to a free « run any query » tool
- Retrieved text is **untrusted**: a document may try to steer the agent (prompt injection)
- Log and review: the `steps` of `converse`, the 9.5 traces, the Kibana audit log

---

# Quiz

**An ES|QL RAG query uses `RERANK` then `COMPLETION`, on the top 50 hits. It is slow and expensive. Why?**

- A) `RERANK` is slower than `MATCH`
- B) `COMPLETION` calls the LLM **once per row**: 50 calls instead of one
- C) ES|QL cannot call an LLM
- D) `RERANK` must come after `COMPLETION`

<v-click>

**Answer: B** — `LIMIT` the reranked rows, then aggregate them into one context with `STATS … VALUES`, so `COMPLETION` runs on a single row.

</v-click>

---
layout: cover
---

# Workshop 21

## Building a hybrid semantic search application
