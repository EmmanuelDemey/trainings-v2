---
layout: section
---

# Part 10: Audit of Your Cluster

## HANDS-ON SESSION ON YOUR CLUSTERS

---

# Audit Checklist

<v-clicks>

**1. Configuration**:
- [ ] Check elasticsearch.yml
- [ ] Node roles
- [ ] JVM settings

**2. Mappings**:
- [ ] Identify unnecessary `text` fields
- [ ] Check dynamic templates
- [ ] Analyze fielddata

**3. Sizing**:
- [ ] Number of shards vs volume
- [ ] Memory:data ratio
- [ ] Disk usage

</v-clicks>

---

# Audit Commands

```bash
# 1. Global health
GET /_cluster/health

# 2. Nodes and resources
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,disk.used_percent,node.role

# 3. Problematic indices
GET /_cat/indices?v&s=store.size:desc&h=index,pri,rep,docs.count,store.size

# 4. Unassigned shards
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason&s=state

# 5. Thread pool rejections
GET /_cat/thread_pool?v&h=node_name,name,rejected&s=rejected:desc
```

---

# Mapping Audit

```bash
# View mapping of an index
GET /logs-parkki-*/_mapping

# Search for text fields
GET /logs-parkki-*/_mapping?filter_path=**.type

# Fielddata cache
GET /_cat/fielddata?v&format=json
```

<v-click>

**Questions to ask yourself**:
- Is this `text` field really necessary?
- Are we doing aggregations on this field?
- Can we switch it to `keyword`?

</v-click>

---

# Immediate Recommendations

<v-clicks>

**Quick wins**:
1. Increase `refresh_interval` to 30s
2. Switch filter fields to `keyword`
3. Set up ILM Hot/Warm/Delete
4. Configure slowlogs

**Medium term**:
1. Review mappings
2. Implement data streams
3. Optimize templates

**Long term**:
1. Hot/Warm architecture on dedicated nodes
2. Proactive monitoring with alerting
3. Automated maintenance procedures

</v-clicks>
