# Maintenance — the indices the snapshot, restore and allocation examples work on

```bash
PUT /products
{ "settings": { "number_of_replicas": 0 } }

PUT /products-2024
{ "settings": { "number_of_replicas": 0 } }

PUT /orders-2024-01-15
{ "settings": { "number_of_replicas": 0 } }

PUT /my-index
{ "settings": { "number_of_replicas": 0 } }

POST /products/_doc
{ "name": "Laptop" }
```
