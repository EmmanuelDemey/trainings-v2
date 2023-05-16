# Travaux Pratiques

Dans ce document, nous allons présenter la partie pratique de la formation. 

## TP1 Présentation générale


Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html[Installing Elasticsearch]
* elastic.co/guide/en/elastic-stack-get-started/current/get-started-docker.html[Elasticsearch/Kibana with Docker]

Ce TP a pour but de s'assurer que Elasticsearch et Kibana sont correctement installés sur votre machine.

Si cela n'est pas la cas, je vous propose de les télécharger et de les démarrer.

Pour les télécharger, nous vous invitons à visiter le site officiel de Elastic : https://www.elastic.co/downloads .

Une fois les deux projets téléchargés, vous devez ouvrir deux fenêtres dans votre terminal, pour lancer les deux commandes suivantes :

La première depuis le répertoire d'installation d'Elasticsearch

```shell
./bin/elasticsearch
```

* Vous devriez avoir ce résultat dans la console :

```shell
[2022-03-02T14:04:34,725][INFO ][o.e.d.DiscoveryModule    ] [MBP-de-Maxime] using discovery type [zen] and seed hosts providers [settings]
[2022-03-02T14:04:35,587][INFO ][o.e.n.Node               ] [MBP-de-Maxime] initialized
[2022-03-02T14:04:35,588][INFO ][o.e.n.Node               ] [MBP-de-Maxime] starting ...
[2022-03-02T14:04:35,666][INFO ][o.e.x.s.c.f.PersistentCache] [MBP-de-Maxime] persistent cache index loaded
[2022-03-02T14:04:35,667][INFO ][o.e.x.d.l.DeprecationIndexingComponent] [MBP-de-Maxime] deprecation component started
[2022-03-02T14:04:35,817][INFO ][o.e.t.TransportService   ] [MBP-de-Maxime] publish_address {127.0.0.1:9300}, bound_addresses {[::1]:9300}, {127.0.0.1:9300}
[2022-03-02T14:04:36,110][INFO ][o.e.c.c.Coordinator      ] [MBP-de-Maxime] setting initial configuration to VotingConfiguration{29fYQ_asSxiPrb6WJLcXJg}
[2022-03-02T14:04:36,342][INFO ][o.e.c.s.MasterService    ] [MBP-de-Maxime] elected-as-master ([1] nodes joined)[{MBP-de-Maxime}{29fYQ_asSxiPrb6WJLcXJg}{DIMpeVmsRRGlqFvwedT0Sg}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw} elect leader, _BECOME_MASTER_TASK_, _FINISH_ELECTION_], term: 1, version: 1, delta: master node changed {previous [], current [{MBP-de-Maxime}{29fYQ_asSxiPrb6WJLcXJg}{DIMpeVmsRRGlqFvwedT0Sg}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}]}
[2022-03-02T14:04:36,433][INFO ][o.e.c.c.CoordinationState] [MBP-de-Maxime] cluster UUID set to [1bbZOgUuTHSIJpVfwU3ANg]
[2022-03-02T14:04:36,517][INFO ][o.e.c.s.ClusterApplierService] [MBP-de-Maxime] master node changed {previous [], current [{MBP-de-Maxime}{29fYQ_asSxiPrb6WJLcXJg}{DIMpeVmsRRGlqFvwedT0Sg}{127.0.0.1}{127.0.0.1:9300}{cdfhilmrstw}]}, term: 1, version: 1, reason: Publication{term=1, version=1}
[2022-03-02T14:04:36,564][INFO ][o.e.h.AbstractHttpServerTransport] [MBP-de-Maxime] publish_address {192.168.1.50:9200}, bound_addresses {[::1]:9200}, {127.0.0.1:9200}, {192.168.1.50:9200}
[2022-03-02T14:04:36,579][INFO ][o.e.n.Node               ] [MBP-de-Maxime] started
```

* Vérifiez que le noeud Elasticsearch est bien fonctionnel en visitant la page `https://localhost:9200`.

Depuis la version 8 de la stack Elastic, la securité est activée par défaut. Après avoir "accepté le risque" dans votre navigateur pour l'exception **https**, un prompt vous demandera un **Nom d'utilisateur** et un **mot de passe**.

Dans les logs du processus elasticsearch, vous devriez trouver des traces ressemblant à :

```shell
✅ Elasticsearch security features have been automatically configured!
✅ Authentication is enabled and cluster connections are encrypted.

ℹ️  Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
  67NS4JHryq2V7+CmUVri

ℹ️  HTTP CA certificate SHA-256 fingerprint:
  cf4ed25b2efef5fe9e043c565937c9ccb5d8b8e4fd5a71877d63ad608a496f1e

ℹ️  Configure Kibana to use this cluster:
• Run Kibana and click the configuration link in the terminal when Kibana starts.
• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
  eyJ2ZXIiOiI4LjAuMSIsImFkciI6WyIxOTIuMTY4LjEuNTA6OTIwMCJdLCJmZ3IiOiJjZjRlZDI1YjJlZmVmNWZlOWUwNDNjNTY1OTM3YzljY2I1ZDhiOGU0ZmQ1YTcxODc3ZDYzYWQ2MDhhNDk2ZjFlIiwia2V5IjoiNzJhN1NuOEI5NDZxUmVxLXBVY2o6ZmNfT0JrVGRRVHV0a19NLUdZZlczdyJ9

ℹ️  Configure other nodes to join this cluster:
• On this node:
  ⁃ Create an enrollment token with `bin/elasticsearch-create-enrollment-token -s node`.
  ⁃ Uncomment the transport.host setting at the end of config/elasticsearch.yml.
  ⁃ Restart Elasticsearch.
• On other nodes:
  ⁃ Start Elasticsearch with `bin/elasticsearch --enrollment-token <token>`, using the enrollment token that you generated.
```

Vous y trouverez le mot de passe généré pour l'utilisateur **elastic**, le fingerprint du certificat HTTPS ainsi que un **enrollment token** valide pour les prochaines 30 minutes. Identifiez vous avec l'utilisateur **elastic** et le mot de passe généré.

* Lors de la consultation du endpoint _https://localhost:9200_ une trame ressemblant à la suivante devrait être produite:

```json
{
  "name": "Emmanuel",
  "cluster_name": "elasticsearch",
  "cluster_uuid": "p4rcLtCjQW6s3FRyT3lo1A",
  "version": {
    "number": "8.3.3",
    "build_flavor": "default",
    "build_type": "tar",
    "build_hash": "801fed82df74dbe537f89b71b098ccaff88d2c56",
    "build_date": "2022-07-23T19:30:09.227964828Z",
    "build_snapshot": false,
    "lucene_version": "9.2.0",
    "minimum_wire_compatibility_version": "7.17.0",
    "minimum_index_compatibility_version": "7.0.0"
  },
  "tagline": "You Know, for Search"
}
```

Nous vous recommandons de modifier le mot de passe de l'utilisateur **elastic** (dans un autre terminal)

```shell
bin/elasticsearch-reset-password -u elastic -i
```

Depuis le répertoire d'installation de Kibana.

```shell
./bin/kibana
```

* Vous devriez avoir ce résultat dans la console :

```shell
log   [09:30:33.990] [info][status][plugin:reporting@7.6.1] Status changed from uninitialized to green - Ready
log   [09:30:34.034] [info][listening] Server running at http://localhost:5601
log   [09:30:34.868] [info][server][Kibana][http] http server running at http://localhost:5601
```

* Vérifiez que l'instance de Kibana est bien fonctionnelle en visitant la page `http://localhost:5601`. Un prompt vous demandera un **enrollment token** (présent dans les logs du processus elasticsearch).
Vous pourrez ensuite vous identifier avec l'utilisateur **elastic**.

Modifiez le nom de votre cluster ainsi que le nom du noeud dans le fichier de configuration `elasticsearch.yml`. Cette action nécessite un redemarrage du noeud.
Une fois réalisé, assurez-vous que la modification a bien été prise en compte.

Constatez que l'option security du xpack est activée:

```yaml
# Enable security features
xpack.security.enabled: true
```


Pour les personnes ayant de l'avance dans la partie pratique, vous pouvez continer avec les actions suivantes :

* Depuis Kibana, vous pouvez indexer un jeu de données d'exemple. Une fois indexé, naviguez à traver Kibana afin d'en découvrir les possibilités.

## TP1 Indexation

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html[Getting Started with Elasticsearch]
* https://www.elastic.co/blog/how-many-shards-should-i-have-in-my-elasticsearch-cluster[How many shards should I have in my Elasticsearch cluster?]


Lors de TP, nous allons mettre en pratique les points suivants :

* Indexer des documents
* Récupérer, modifier et supprimer des documents
* Exécuter des requêtes bulk

### Indexation

Afin de créer un jeu de données, nous allons utiliser le site https://www.json-generator.com/[json-generator.com].

Veuillez utiliser le générateur suivant :

```json
[
  '{{repeat(3, 3)}}',
  {
    isActive: '{{bool()}}',
    balance: '{{floating(1000, 4000, 2, "$0,0.00")}}',
    picture: 'http://placehold.it/32x32',
    age: '{{integer(20, 40)}}',
    eyeColor: '{{random("blue", "brown", "green")}}',
    name: '{{firstName()}} {{surname()}}',
    gender: '{{gender()}}',
    company: '{{company().toUpperCase()}}',
    email: '{{email()}}',
    phone: '+1 {{phone()}}',
    address: '{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}',
    about: '{{lorem(1, "paragraphs")}}',
    registered: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-dd")}}',
    location: {
		lat: '{{floating(48.866667, 90)}}',
		lon: '{{floating(2.333333, 180)}}'
	},
    tags: [
      '{{repeat(7)}}',
      '{{lorem(1, "words")}}'
    ],
    friends: [
      '{{repeat(3)}}',
      {
        id: '{{index()}}',
        name: '{{firstName()}} {{surname()}}'
      }
    ]
  }
]
```

Nous allons tout d'abord indexer unitairement dans un index `person-v1` les objets générés par ce site.

Nous allons de plus créer un alias `person` pointant vers l'index que nous venons de créer.

### Manipulation des documents

Avec les données que nous venons d'indexer, exécutez des requêtes permettant de réaliser les actions suivantes :

* Récupérer un document à partir de l'identifiant généré par Elasticsearch.
* Modifier un document
* Supprimer un document

### Requêtes Bulk

Afin de manipuler les requêtes bulk, indexez les mêmes documents indexés précédement mais dans un nouvel index `person-v2` en utilisant cette API.

Faites la modification nécessaire pour que l'alias `person` pointe vers ce nouvel index.

Vérifiez que les requêtes exécutées précédemment sont toujours fonctionnelles suite à ces modifications.

### Alias

Nous allons créer deux alias supplémentaires pour l'index `person-v2` :

* Un qui pointe sur les document dont la propriété `gender` est égale à `male`
* Un qui pointe sur les document dont la propriété `gender` est égale à `female`

Vérifiez que des requêtes de recherche sur l'un de ces indexes retournent bien les bonnes données.

### Recherche

Faites une simple recherche avec la syntaxe suivante pour retourner un sous-ensemble des données indexées.

```
GET /person/_search?q=...
```

=== Status du cluster

Vous pouvez vérifier le status du cluster grâce à la requête suivante :

```
GET /_cluster/health
```

Pouvez-vous expliquer pourquoi vous obtenez ce résultat ? Que pouvez-vous faire pour avoir un cluster dans un état `green` ?

## TP 10 - SQL

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-sql.html[SQL access]

Afin de manipuler la syntaxe SQL, exécutez des requêtes SQL afin de répondre aux mêmes questions que les TPs
sur les agrégations.

* Calculer l'age moyen des personnes indexées
* Calculer le nombre de personnes par genre
* Calculer le nombre de personnes par genre et par couleur des yeux
* Calculer le nombre de personnes par genre et par année d'enregistrement (propriété `registered`).
