# TP 1 — Installation et premiers pas

> Démarrer OpenSearch et OpenSearch Dashboards avec Docker, interroger le cluster, et comprendre pourquoi il devient jaune.

**Durée** : 20 min · **Chapitre** : 3 — Installation et API REST

## Contexte

Le lab tient dans un fichier, `docker-compose.yml`, dans ce dossier : un nœud OpenSearch et OpenSearch Dashboards, plugin de sécurité désactivé. Vous le démarrez, puis vous parlez au cluster par son API REST, depuis Dev Tools et depuis un terminal.

Chaque étape dit **quoi** faire, pas **comment** : cherchez l'API dans la documentation, essayez, lisez la réponse, ajustez. Le résultat attendu vous permet de vérifier. Les indices sont repliés — ouvrez-les seulement si vous bloquez.

## Mise en place

Sous Linux, une fois par machine :

```bash
sudo sysctl -w vm.max_map_count=262144
```

Dans ce dossier :

```bash
docker compose up -d --wait
```

Ouvrez **http://localhost:5601**, puis menu ☰ → **Management** → **Dev Tools**.

Référence : [Installing OpenSearch with Docker](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/docker/).

## Exercices

### Étape 1 : Qui répond ?

Demandez au cluster sa version et sa distribution.

<details>
<summary>Indice</summary>

La racine `/` de l'API.

</details>

**Résultat attendu** :

```json
{
  "version": { "distribution": "opensearch", "number": "3.9.0" }
}
```

### Étape 2 : En quelle santé ?

Affichez la santé du cluster, puis la liste de ses nœuds avec leurs rôles, sous forme de tableau.

<details>
<summary>Indice</summary>

`_cluster/health`, puis une API `_cat` — `?v` ajoute les en-têtes.

</details>

**Résultat attendu** (la santé) :

```json
{ "status": "green", "number_of_nodes": 1 }
```

**Question** : quel nœud est le `cluster_manager` ? Quels rôles a-t-il ?

### Étape 3 : Un index jaune

Créez un index `hello` avec **1 shard** et **1 réplica**, puis affichez la santé de cet index.

<details>
<summary>Indice</summary>

`PUT /hello` avec un bloc `settings`. La santé d'un index : `_cluster/health/<index>`, ou `_cat/indices`.

</details>

**Résultat attendu** :

```json
{ "status": "yellow", "active_primary_shards": 1, "unassigned_shards": 1 }
```

**Question** : où le réplica pourrait-il aller ? Affichez les shards de l'index avec `_cat/shards` pour le voir.

### Étape 4 : Le remettre au vert

Sans recréer l'index, rendez-le `green`.

<details>
<summary>Indice</summary>

`number_of_replicas` est un setting **dynamique** : `PUT /hello/_settings`.

</details>

**Résultat attendu** (la santé de l'index) :

```json
{ "status": "green", "unassigned_shards": 0 }
```

### Étape 5 : Sans Dev Tools

Depuis un terminal, listez les index avec `curl`, en n'affichant que les colonnes `index`, `health` et `docs.count`.

<details>
<summary>Indice</summary>

`_cat/indices?v&h=…`. Dans Dev Tools, la clé à molette → **Copy as cURL** donne la commande.

</details>

## Critères de réussite

- Le lab tourne : OpenSearch sur 9200, Dashboards sur 5601
- Vous savez lire `status`, et expliquer un `yellow` sur un seul nœud
- Vous avez modifié un setting dynamique à chaud

## Pour aller plus loin

- Ajoutez un **deuxième nœud** au `docker-compose.yml` (même `cluster.name`, `discovery.seed_hosts`, `cluster.initial_cluster_manager_nodes`, sans `discovery.type`). Remettez un réplica à `hello` : il devient vert. Arrêtez un nœud : que devient l'index ?
- Démarrez OpenSearch **avec** le plugin de sécurité (`OPENSEARCH_INITIAL_ADMIN_PASSWORD`) : que faut-il changer dans vos appels `curl` ?

## Dépannage

**Problème** : le conteneur `opensearch` redémarre en boucle, `max virtual memory areas vm.max_map_count [65530] is too low`
→ `sudo sysctl -w vm.max_map_count=262144` (et dans `/etc/sysctl.conf` pour le garder).

**Problème** : `port is already allocated`
→ Un autre service écoute sur 9200 ou 5601. Changez le port **à gauche** dans `ports:` (`"9201:9200"`).

**Problème** : Dashboards affiche « OpenSearch Dashboards server is not ready yet »
→ Patientez une minute : il attend qu'OpenSearch soit prêt.
