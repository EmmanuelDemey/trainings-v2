# Travaux Pratiques

Dans ce document, nous allons présenter la partie pratique de la formation. 

## TP1 Indexation

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html
* https://www.elastic.co/blog/how-many-shards-should-i-have-in-my-elasticsearch-cluster


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

### Status du cluster

Vous pouvez vérifier le status du cluster grâce à la requête suivante :

```
GET /_cluster/health
```

Pouvez-vous expliquer pourquoi vous obtenez ce résultat ? Que pouvez-vous faire pour avoir un cluster dans un état `green` ?

## TP2 - Schéma

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html

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

* https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html

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

* https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html

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

* https://www.elastic.co/guide/en/elasticsearch/reference/7.10/ingest.html

Les documents que nous avons indexé depuis le début de cette formation possédent une propriété correspondant à une valeur monétaire (`balance`).

Vous devez mettre en place un pipeline d'ingestion permettant de supprimer la devise de chaque valeur, convertir la donnée en flottant et l'enregistrer dans une nouvelle propriété `convertedBalance`.

Une fois ce pipeline testé et créé dans Elasticsearch, vous pouvez réindexer les données de l'index `person-v3` dans un nouvel index `person-v4` en utilisant cette pipeline.

Essayer de réaliser une requête `range` sur le champ `balance`.

Une fois les données réindexées, vérifier qu'une requête de type `range` sur le champ `convertedBalance` fonctionne.


## TP6 - SDK

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html

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


## TP7 - SQL

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-sql.html

Afin de manipuler la syntaxe SQL, exécutez des requêtes SQL afin de répondre aux mêmes questions que les TPs
sur les agrégations.

* Calculer l'age moyen des personnes indexées
* Calculer le nombre de personnes par genre
* Calculer le nombre de personnes par genre et par couleur des yeux
* Calculer le nombre de personnes par genre et par année d'enregistrement (propriété `registered`).


## TP8 - Dimensionnement

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/run-elasticsearch-locally.html

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

## TP9 - Retention

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/ilm-shrink.html
* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/ilm-index-lifecycle.html

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


## TP10 - Alerting

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/8.4/xpack-alerting.html


Dans cette partie pratique, nous allons mettre en place une solution d'alerting respectant les critères suivants

* Créez une alerte qui
  * s'exécute toutes les 10 minutes
  * Vérifie si il y a un vol dont le retard est supérieur à 0
  * Indexe une alerte si au moins un document est détecté

* Indexez un nouveau document qui respect la requête précédente.

* Visualisez ces données depuis la page `Discover` de Kibana.

## TP11 - Sécurité

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://discuss.elastic.co/t/authentication-for-kibana-unknown-setting-xpack-security-enabled/254434/2

Dans ce TP, nous allons mettre en place la partie sécurité sur notre cluster.

* Via l'API créez un nouveau rôle ne donnant accès qu'aux index `person-*`
* Créez un nouvel utilisateur ayant le rôle créé précédemment
* Assurez-vous que le role et l'utilisateur précédemment créés sont bien fonctionnels. (il ne devrait pas avoir accès aux index interne de Elasticsearch)
* Ajoutez au rôle précédemment des contraintes sur les propriétés et sur les documents retournés.
  * Par exemple, il ne doit pas pouvoir récupérer la propriété `age`
  * Il doit pouvoir récupérer que les documents ayant la propriété `gender` égale à `female`


Comme partie bonus, vous pouvez :

* Créer un utilisateur depuis l'interface graphique de Kibana
* Créer des `spaces` et des utilisateurs ayant accès à l'un d'entre eux

## TP12 - Snapshot And Restore

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html

Dans ce TP, je vous propose de mettre en place un système de backup de notre index.

Ajouter dans le fichier de configuration `elasticsearch.yml` la configuration suivante:

```
path:
  repo:
    - ./backups
```

Puis redémarrer votre noeud.

Vous pouvez ensuite créer un `repository` `my fs_backup` de type `fs`.
Réaliser une snapshot de l'index `person-v3` dans ce repository.

Une fois cette snapshot réalisée, faites un `restore` dans un nouvel index que nous nommerons de la même façon mais suffixé par `_backup`.

* Vous pouvez également utiliser l'API `cluster stats` afin de visualiser les statistiques de notre cluster et essayer d'en comprendre la signification.

Comme partie bonus, vous pouvez :

* Refaire le même traitement mais depuis l'interface de Kibana
* Créer et exécuter un SLM

Pour exécuter un SLM sans avoir besoin d'attendre, vous pouvez utiliser le endpoint `_execute`

```
POST _slm/policy/nightly-snapshots/_execute
```
