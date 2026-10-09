---
layout: cover
---

# SQL

---

# SQL

* Elasticsearch provides an SQL-like syntax for executing search and aggregation queries.
* These queries will be translated by Elasticsearch into historical queries.
* There is also a JDBC connector to connect your applications directly to Elasticsearch using this syntax.

---

# SQL

```
POST /_sql?format=txt
{
  "query": "SELECT * FROM library WHERE release_date < '2000-01-01'"
}
```

---

# Formats

* CSV
* JSON
* TSV
* TXT
* YML
* CBOR (binary)
* Smile (binary)

---

# Syntax

```
SELECT [TOP [ count ] ] select_expr [, ...]
[ FROM table_name ]
[ WHERE condition ]
[ GROUP BY grouping_element [, ...] ]
[ HAVING condition]
[ ORDER BY expression [ ASC | DESC ] [, ...] ]
[ LIMIT [ count ] ]
```

---

# SELECT

```
SELECT emp_no FROM emp;
```

---

# WHERE

```
SELECT author, name FROM library WHERE MATCH(author, 'frank');
```

---

# ORDER BY and LIMIT

```
SELECT emp_no FROM emp ORDER BY id LIMIT 2;
```

--- 

# GROUP BY and HAVING

```
SELECT languages AS l, COUNT(*) AS c
FROM emp
GROUP BY l
HAVING c BETWEEN 15 AND 20;
```

---
layout: cover
---
# Practical Part