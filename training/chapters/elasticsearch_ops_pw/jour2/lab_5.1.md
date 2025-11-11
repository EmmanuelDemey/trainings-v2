## Lab 5.1: Création d'une Alerte Simple avec Kibana Rules

**Objectif**: Créer une alerte de surveillance de la santé du cluster avec Kibana Rules et tester son déclenchement.

**Contexte**: Les Kibana Rules offrent une interface graphique intuitive pour créer des alertes sans manipuler du JSON. Vous allez créer une règle qui surveille la santé du cluster et vous notifie lorsqu'il passe en statut YELLOW ou RED.

### Étape 1: Accéder à l'Interface de Gestion des Règles

1. Ouvrez Kibana dans votre navigateur
2. Dans le menu latéral, cliquez sur **Stack Management** (icône d'engrenage)
3. Sous la section **Alerts and Insights**, cliquez sur **Rules**

Vous devriez voir l'interface de gestion des règles avec la liste des règles existantes (si disponible).

### Étape 2: Créer une Nouvelle Règle

1. Cliquez sur le bouton **Create rule** en haut à droite
2. Sélectionnez le type de règle: **Elasticsearch query**
   - Ce type permet d'exécuter des requêtes Elasticsearch et de déclencher des alertes selon les résultats
3. Donnez un nom à votre règle: `cluster-health-monitor`
4. Ajoutez des tags pour organiser vos alertes: `cluster`, `health`, `ops`

### Étape 3: Configurer la Requête de Surveillance

Dans la section **Define your query**:

1. **Index**: Sélectionnez `.monitoring-es-*` ou créez un index temporaire pour les tests
2. **Time field**: `@timestamp` ou le champ de temps de votre index
3. **Query**: Configurez la requête pour surveiller la santé du cluster

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-5m"
            }
          }
        }
      ],
      "filter": [
        {
          "terms": {
            "cluster_state.status": ["yellow", "red"]
          }
        }
      ]
    }
  }
}
```

4. **Size**: Laissez à `100` documents
5. **Threshold**: Configurez le seuil de déclenchement
   - **WHEN**: `query matches`
   - **FOR THE LAST**: `5 minutes`
   - **GROUPED OVER**: `all documents`

### Étape 4: Alternative - Utiliser l'API Cluster Health

Si vous n'avez pas d'index de monitoring, créez une règle avec un type **ES query** simulé:

1. Créez un index de test pour simuler des états de santé:

```bash
# Créer un index de test
PUT /cluster_health_logs

# Indexer un document simulant un état YELLOW
POST /cluster_health_logs/_doc
{
  "@timestamp": "2024-01-15T10:00:00Z",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 2
}
```

2. Configurez la règle pour interroger cet index:
   - **Index**: `cluster_health_logs`
   - **Time field**: `@timestamp`
   - **Query**: Rechercher les documents avec `status: yellow` ou `status: red`

### Étape 5: Configurer la Fréquence de Vérification

Dans la section **Check every**:

1. **Check every**: `1 minute`
   - La règle sera évaluée toutes les minutes
2. **Notify**: `Every time alert is active`
   - Alternative: `On status change` pour ne notifier que lors des changements d'état

### Étape 6: Définir les Actions (Actions Simplifiées pour Tests)

Pour ce premier lab, nous allons utiliser une action simple de journalisation:

1. Dans la section **Actions**, cliquez sur **Add action**
2. Sélectionnez **Server log** comme type de connecteur
   - Cette action journalise dans les logs Kibana, pratique pour les tests
3. Configurez le message:

```
Alerte: Le cluster {{context.cluster.name}} est en état {{context.status}}!

Détails:
- Statut: {{context.status}}
- Nœuds: {{context.number_of_nodes}}
- Shards non assignés: {{context.unassigned_shards}}
- Date: {{context.date}}

Action requise: Vérifier l'état du cluster avec GET _cluster/health
```

4. **Action group**: Sélectionnez `Alert` (déclenchée quand l'alerte est active)

### Étape 7: Sauvegarder et Activer la Règle

1. Cliquez sur **Save** en bas de page
2. La règle est automatiquement activée après sa création
3. Vérifiez que le statut est **Enabled** dans la liste des règles

### Étape 8: Tester le Déclenchement de l'Alerte

Maintenant testons que l'alerte se déclenche correctement:

#### Méthode 1: Simuler un État YELLOW (si environnement de test)

```bash
# Créer un index avec 2 répliques sur un cluster à 1 seul nœud
PUT /test-yellow-alert
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 2
  }
}

# Vérifier que le cluster passe en YELLOW
GET _cluster/health
```

**Résultat attendu**:
```json
{
  "cluster_name": "es-ops-training",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "unassigned_shards": 2,
  ...
}
```

#### Méthode 2: Indexer un Document de Test

Si vous utilisez l'index de simulation:

```bash
# Indexer un nouveau document YELLOW
POST /cluster_health_logs/_doc
{
  "@timestamp": "{{NOW}}",
  "status": "yellow",
  "cluster_name": "es-ops-training",
  "number_of_nodes": 3,
  "unassigned_shards": 5
}

# Forcer le refresh
POST /cluster_health_logs/_refresh
```

### Étape 9: Vérifier que l'Alerte s'est Déclenchée

1. Retournez dans **Stack Management** → **Rules**
2. Cliquez sur votre règle `cluster-health-monitor`
3. Consultez l'onglet **Alert history** ou **History**
   - Vous devriez voir les déclenchements récents
4. Vérifiez les logs Kibana pour voir le message journalisé:

```bash
# Depuis votre terminal, consultez les logs Kibana
docker logs kibana | grep "cluster-health-monitor"
# OU si installation locale
tail -f /var/log/kibana/kibana.log | grep "cluster-health-monitor"
```

**Résultat attendu dans les logs**:
```
[ALERT] cluster-health-monitor: Le cluster es-ops-training est en état yellow!
```

### Étape 10: Tester la Désactivation et Modification

1. **Désactiver la règle**:
   - Dans la liste des règles, cliquez sur le switch pour désactiver `cluster-health-monitor`
   - Le statut passe à **Disabled**
   - Vérifiez qu'aucune nouvelle alerte n'est déclenchée

2. **Modifier la règle**:
   - Cliquez sur le nom de la règle
   - Cliquez sur **Edit rule** en haut à droite
   - Changez la fréquence de vérification à `5 minutes`
   - Sauvegardez

3. **Réactiver la règle**:
   - Réactivez le switch pour remettre la règle en état **Enabled**

### Points Clés à Retenir

✅ **Kibana Rules** offrent une interface graphique pour créer des alertes sans JSON
✅ Le type **Elasticsearch query** permet d'interroger n'importe quel index
✅ La **fréquence de vérification** contrôle combien de fois la règle est évaluée
✅ Les **actions** définissent ce qui se passe quand l'alerte se déclenche
✅ L'action **Server log** est idéale pour les tests et le debugging
✅ Les règles peuvent être **activées/désactivées** sans les supprimer
✅ L'historique des alertes est accessible via l'interface Kibana

---

