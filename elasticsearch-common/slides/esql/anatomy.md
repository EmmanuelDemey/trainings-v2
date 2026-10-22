# Anatomy of a query

* A **source command**: `FROM` (indices, aliases, data streams), `ROW`, `SHOW`, `TS` (time series)
* Then **processing commands**, separated by `|`

| Command | Role |
|---------|------|
| `WHERE` | Filter rows |
| `EVAL` | Compute new columns |
| `KEEP` / `DROP` / `RENAME` | Choose the columns |
| `STATS … BY` | Aggregate |
| `SORT` / `LIMIT` | Order and cut |
| `DISSECT` / `GROK` | Parse a string into columns |
| `ENRICH` / `LOOKUP JOIN` | Add columns from another index |

* Without `LIMIT`, a query returns **1000 rows** at most
