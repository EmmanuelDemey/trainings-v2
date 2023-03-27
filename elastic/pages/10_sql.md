---
layout: cover
---

# SQL

---

# SQL

* Elasticsearch met à disposition une syntaxe SQL permettant d'exécuter des requêtes de recherche et d'agrégation.
* Ces requêtes seront traduites par Elasticsearch en requetes historiques
* Existe également un connecteur JDBC pour conntecter vos applicatifs directement à Elasticsearch en utilisant cette syntaxe.

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
* CBOR (binaire)
* Smile (binaire)

---

# Syntaxe

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

# ORDERBY et LIMIT

```
SELECT emp_no FROM emp ORDER BY id LIMIT 2;
```

--- 

# GROUP BY et HAVING

```
SELECT languages AS l, COUNT(*) AS c
FROM emp
GROUP BY l
HAVING c BETWEEN 15 AND 20;
```
