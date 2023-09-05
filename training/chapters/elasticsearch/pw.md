# Travaux Pratiques

Dans ce document, nous allons présenter la partie pratique de la formation. 

## TP XX Présentation générale


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

## TP2 - Schéma

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html[Mapping]

Commencons par récupérer le `mapping` des index créés précédemment.

```
GET person-v2/_mapping
```

Créez un `template` afin de définir le mapping suivant (nous nous basons sur le jeu de données retournés par le site json-generator.com)

* Les propriétés `picture` ne doit pas être indexé.
* Les propriétés `eyeColor`, `gender`, `phone` ne doivent pas étre analysées.
* Les propriétés `name`, `company`, `address`, `about` doivent être analysées (seule, cette représentation est utile).
* Le champ `registered` doit étre de type `Date`. Vous devriez spécifier le format supporté. Pour nos données, le format à utiliser sera `yyyy-MM-dd`.
* Convertissez l'object `location` en un objet de type `geo_point`

Une fois le template créé, réindexez les documents de l'index `person-v2` dans un index `person-v3`.

Modifiez l'alias `person` pour pointer vers `person-v3`

Essayez de trouver des requêtes qui retournaient des résultats avec l'ancienne configuration, mais plus à présent. Essayez de comprendre pourquoi vous obtenez ce résultat.

## TP3 - Recherche

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html[Query DSL]

Nous allons à présent faire des recherches sur le jeu de données que nous venons d'indexer. Pour cela, le formateur vous proposera une requête bulk afin d'indexer un plus grand nombre de documents.

Exécutez des requêtes permettant de répondre aux questions suivantes :

* Combien de personnes sont des femmes ?
* Combien de personnes ont un age supérieur à 20 ans ?
* Combien d'hommes ont un age supérieur à 20 ans ?
* Retournez toutes les personnes qui ont un age supérieur à 20 ans, et dont la balance est comprise entre $1000 et $2000. (vous devriez avoir quelques problèmes sur ce point)
* Trouvez toutes les personnes qui sont situées à moins de 10km de Paris.

Pour les personnes ayant de l'avance dans la partie pratique, vous pouvez continuer avec les actions suivantes :

* Depuis Kibana, essayer de faire depuis la page `Discover` les mêmes recherches que celles définies précédemment.

## TP4 - Agrégation

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html[Aggregations]

Nous allons dans cette partie pratique réaliser des requêtes d'agrégations sur les données que nous venons d'indexer.

* Calculer l'age moyen des personnes indexées
* Calculer le nombre de personnes par genre
* Calculer le nombre de personnes par genre et par couleur des yeux
* Calculer le nombre de personnes par genre et par année d'enregistrement (propriété `registered`).
* Par année, calculer la répartition des genres (male/female) et l’âge moyen des personnes. ET, récupérer l’année ou l’âge moyen est le plus élevé.
* Modifier la requête précédente pour n'obtenir que les buckets des années ou l’âge moyen est supérieur à 28.
* Modifier la requête précédente pour savoir qui est la personne la plus agée de cette `bucket` créée précédemment. Restituer uniquement certaines informations (name, âge).

Pour les personnes ayant de l'avance dans la partie pratique, vous pouvez continuer avec les actions suivantes :

* Vous pouvez essayer de les implémenter également via des widgets Kibana.

## TP5 - Ingest

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/7.10/ingest.html[Ingest Node]

Les documents que nous avons indexé depuis le début de cette formation possédent une propriété correspondant à une valeur monétaire (`balance`).

Vous devez mettre en place un pipeline d'ingestion permettant de supprimer la devise de chaque valeur, convertir la donnée en flottant et l'enregistrer dans une nouvelle propriété `convertedBalance`.

Une fois ce pipeline testé et créé dans Elasticsearch, vous pouvez réindexer les données de l'index `person-v3` dans un nouvel index `person-v4` en utilisant cette pipeline.

Essayer de réaliser une requête `range` sur le champ `balance`.

Une fois les données réindexées, vérifier qu'une requête de type `range` sur le champ `convertedBalance` fonctionne.

## TP7 - Operating

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles : 

* https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html[Snapshot and restore API
* https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-stats.html[Cluster stats API]

Dans ce TP, je vous propose de mettre en place trois choses : 

* Nous allons tout d'abord démarrer un nouveau noeud dans notre cluster.

Pour cela, nous allons tout d'abord copier le répertoire `config` dans un autre répertoire que nous nommerons `config2`. 

Dans le fichier `elasticsearch.yml` de ce nouveau répertoire, modifiez les propriétés suivantes :

* node.name: node-2
* path.data: <-- afin de pointer vers autre répertoire que le noeud 1 -->
* path.logs: <-- afin de pointer vers autre répertoire que le noeud 1 -->

Une fois cette configuration réalisée, lancez le nouveau noeud. Vous trouverez ci-dessous les commandes pour Linux/MacOS (modifiez le chemin absolu en fonction de votre système d'exploitation): 

* Syntaxe pour Linux / MacOS

En une seule instruction:

```
ES_PATH_CONF=/Users/emmanueldemey/Downloads/elasticsearch-7.10.1/config2/ ./bin/elasticsearch
```

Une fois lancé, si vous exécutez la requête suivante, vous devriez voir vos deux noeuds .

```
GET _cat/nodes
```

Assurez-vous que votre index à présent ait un statut `green`.

Si vous utilisez Docker pour lancer Elasticsearch, la société Elastic propose une configuration pour Docker Compose
sur la documentation officielle.

* https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html[Elasticsearch et Docker Compose]


* Mettons en place un système de backup de notre index.

Ajouter dans le fichier de configuration `elasticsearch.yml` la configuration suivante:

```
path:
  repo:
    - ./backups
```

puis redémarrer les noeuds.

Vous pouvez ensuite créer un `repository` `my fs_backup` de type `fs`.
Réaliser une snapshot de l'index `person-v3` dans ce repository.

Une fois cette snapshot réalisée, faites un `restore` dans un nouvel index que nous nommerons de la même façon mais suffixé par `_backup`.

* Vous pouvez également utiliser l'API `cluster stats` afin de visualiser les statistiques de notre cluster et essayer d'en comprendre la signification.

## TP8 - SDK

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html[Elasticsearch Node.js client]

Dans ce TP, nous allons tout simplement initier un projet Node.js permettant de faire nos premières requêtes vers un cluster Elasticsearch.

Nous allons tout d'abord initier le projet Node.js. dans un  nouveau répertoire, exécutez la commande suivante :

```
npm init --yes
```

Vous pouvez à présent installer la dépendance `@elastic/elasticsearch`.

```
npm install @elastic/elasticsearch
```

Dans un nouveau fichier `src/index.js`, nous allons importer le module précédemment installé afin de créer un client Elasticsearch.

```
const { Client } = require('@elastic/elasticsearch')
const fs = require('fs');

const client = new Client({
    node: 'https://localhost:9200',

    auth: {
        username: 'elastic',
        password: 'XXX'
    },
    tls: {
      ca: fs.readFileSync('./config/certs/http_ca.crt'),
      rejectUnauthorized: false
    }
})
```

Une fois le projet créé, vous pouvez à present ajouter dans le fichier `src/index.js` le code nécessaire pour
refaire les requêtes des TPs 4 et 5.


## TP XX - SQL

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-sql.html[SQL access]

Afin de manipuler la syntaxe SQL, exécutez des requêtes SQL afin de répondre aux mêmes questions que les TPs
sur les agrégations.

* Calculer l'age moyen des personnes indexées
* Calculer le nombre de personnes par genre
* Calculer le nombre de personnes par genre et par couleur des yeux
* Calculer le nombre de personnes par genre et par année d'enregistrement (propriété `registered`).

# TP XX - APM

Nous allons initiliser une application Spring Boot, sur laquelle nous allons activer APM.

* Installez, configurez et démarrez un serveur Elastic APM avec les informations de connexion données par le formatteur.
* Nous allons utiliser le projet PetClinic pour tester APM. Executez la commande suivante :

```
git clone https://github.com/spring-projects/spring-petclinic
```

* Ajoutez la dépendance

```xml
<dependency>
  <groupId>co.elastic.apm</groupId>
  <artifactId>apm-agent-attach</artifactId>
  <version>1.34.1</version>
</dependency>
````

* Configurez l'agent APM.
  * Ajoutez votre prénom dans le nom du service, afin de le différencier dans l'interface de Kibana
  * Ajoutez l'URL du serveur APM
  * Définissez l'environnement comme étant l'environnement de production

* Démarrer votre application Spring Boot et assurer qu'à la première requête HTTP reçue, un log sera envoyé dans Elasticsearch.
* Jetez un coup d'oeil au `Service Map` et assurez-vous que la base de données `h2` utilisée est bien visible.

* Dupliquez le projet Spring Boot
  * Modifiez le port HTTP utilisé (utilisant le paramètre `server.port` dans le fichier de configuration application.properties)
  * Ajouter APM sur cette deuxième instance (avec un nom différent)
  * Faite le nécessaire que pour le endpoint '/vets' du premier service appel le endpoint '/vets' du deuxième.
  * Assurez-vous que les informations arrivent correctement dans APM et qu'une transaction est composé de `span` exécutés par les deux services.
* Créez une page web permettant de consommer le endpoint `/vets` et ajoutez une intégration RUM

## TP3 - Dimensionnement

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/run-elasticsearch-locally.html[Run Elasticsearch locally]

Nous allons dans cette partie pratique démarrer un second noeud dans notre cluster.

* Pour cela, nous devons récupérer un nouveau `enrollment-token` depuis le noeud existant pour l'utiliser lors du lancement du nouveau noeud

```
bin/elasticsearch-create-enrollment-token -s node
bin/elasticsearch --enrollment-token <enrollment-token>
```

* Grace aux API de monitoring, assurez-vous que les deux sont bien disponibles et qu'ils communiquent correctement.

```
GET /_cat/indices
```

* Votre cluster doit avoir à présent un status `green`. Pourquoi ?
* Exécutez la requete `GET _cat/shards` et vérifiez que l'ensemble des shards sont correctement assignés
* Appliquez une configuration pour que les shards (primary et replicas) ne doivent pas etre positionnés sur la même machine
(ce qui est le cas pour l'instant dans cette formation, car nous sommes en local)

* Afin de tester les APIs permettant d'avoir un impact sur la répartition des shards, exécutez une requête permettant d'interdire l'allocation de nos shards
sur l'un de vos deux noeuds (en utilisant la propriété `_name` par exemple.) Le status de votre cluster devrait changé.

## TP4 - Retention

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/ilm-shrink.html[Shrink API]
* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/ilm-index-lifecycle.html[ILM]

* Afin de manipuler la `Shrink API`, veuillez réindexer un jeu de donnée existant dans un nouvel index avec la configuration suivante:
  * nombre de shard: 5
  * nombre de replicas: 1

* Utilisez la `Shrink API`, afin de migrer notre index vers un nouvel index ayant 1 seul shard et aucun shard réplica.

* Via l'API ou via l'interface graphique de Kibana, veuillez créez un ILM permettant de faire ce `shrink` pour tous les index d'un jour d'ancienneté.

* Appliquez cet ILM à un nouvel template que vous allez associer à des indexes nommés `kibana*`. Ces indexes devront également avoir la configuration suivante:
  * nombre de shard: 5
  * nombre de replicas: 1

* Indexez des documents dans un nouvel index respectant le pattern défini précédemment.

* Faudra attendre demain pour vérifier que le `shrink` a correctement été exécuté

## TP5 - Monitoring

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-slowlog.html[SlowLog]
* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/configuring-metricbeat.html[Collecting Elasticsearch monitoring data with Metricbeat]
* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/configuring-filebeat.html[Collecting Elasticsearch monitoring data with Filebeat]

Dans ce TP, nous allons commencer par activer les slowlog puis mettre en place la stack `Beat`

* Dans le fichier de configuration, définissez une configuration de slowlog. Attention, les seuils
doivent etre très petits pour que vous puissiez avoir un résultat pour vos requetes.

* Une fois configuré, faites une requête. Et vérifiez que logs ont été écrites dans un fichier.

* Modifiez cette configuration à la volée via l'API '_settings'.


Dans cette partie pratique, nous allons mettre en place *Metricbeat* et *Filebeat*.

* Téléchargez, configurez et lancez *Metricbeat* afin d'indexer dans Elasticsearch les métriques de votre Elasticsearch
(Il sera peut etre recommandé de monitorer un autre cluster Elasticsearch, pour éviter d'envoyer les données dans le même cluster)

* Avec la configuration par défaut, metricbeat communique avec elasticsearch via le protocole http, sans autorisation. Pensez à mettre à jour les champs nécessaires dans le fichier **metricbeat.yml**.

```
# -- Elasticsearch Output --
output.elasticsearch:
  hosts: ["localhost:9200"]
  protocol: "https"

  username: "elastic"
  password: "password"
  ssl:
    verification_mode: none
```

* Dans un premier temps, utilisez l'instruction **setup** pour précharger les objets nécessaires à metricbeat dans Kibana.

* Une fois cette étape réalisée, vous pouvez lancer le binaire de metricbeat (option -e pour avoir plus de traces).

* Depuis Kibana, parcourez les pages `Observability` pour visualiser les données indexées.

* Téléchargez, configurez et lancez *Filebeat* afin d'indexer les logs dans Elasticsearch.

* Avant de lancer le binaire filebeat, modifier le fichier de configuration avec:

```
output.elasticsearch:
  # Array of hosts to connect to.
  hosts: ["localhost:9200"]

  protocol: "https"
  username: "elastic"
  password: "password"
  ssl:
    verification_mode: none
```

* Activez Filebeat pour aller récupérer les lignes de logs du cluster Elasticsearch que nous souhaitons monitorer.

* Vous pouvez ensuite executer le **setup**, puis lancer le binaire heartbeat.

* Dans la vue **Observalibility** de Kibana, vous devriez dorénavant voir des données correspondant aux logs indexés.

## TP6 - Alerting

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/xpack-alerting.html[Watcher]


Dans cette partie pratique, nous allons mettre en place une solution d'alerting respectant les critères suivants

* Créez une alerte qui
  * s'exécute toutes les 10 minutes
  * Vérifie si il y a un vol dont le retard est supérieur à 0
  * Indexe une alerte si au moins un document est détecté

* Indexez un nouveau document qui respect la requête précédente.

* Visualisez ces données depuis la page `Discover` de Kibana.
