# Point de synchro client — Formation Elastic Security for SIEM

Formation de 3 jours : 11 chapitres, 7 TP guidés en français, lab Docker Elastic 9.5.6.

> **Priorités** : les sections 2 (version, licence) et 4 (prérequis Docker) sont à trancher en premier : elles peuvent changer le contenu des TP et décident si le lab démarre le matin du J1.

## 1. Participants et objectifs

- [ ] Combien de participants ? Quels profils : analystes SOC N1/N2, ingénieurs SIEM, admins système, RSSI ?
- [ ] Ont-ils déjà utilisé Elastic ou Kibana ? Sinon, quel SIEM (Splunk, QRadar, Sentinel…) ?
- [ ] Savent-ils écrire des requêtes (KQL, ES|QL, Lucene, SPL) ?
- [ ] Qu'attendez-vous concrètement à la fin des 3 jours : triage d'alertes, écriture de règles, threat hunting, déploiement ?
- [ ] Une migration ou un déploiement en cours motive-t-il la formation ?
- [ ] Une certification Elastic est-elle visée ensuite ?

## 2. Contexte Elastic du client

- [ ] Elastic Cloud, self-managed ou ECE/ECK ?
- [ ] Quelle version ? Le lab tourne en 9.5.6 : si leur prod est en 8.x, l'UI de la Security app et certaines fonctions ES|QL diffèrent.
- [ ] Quelle licence (Basic, Platinum, Enterprise) ? Certaines fonctions en dépendent : règles ML, entity analytics, AI Assistant, Attack Discovery.
- [ ] Elastic Agent et Fleet sont-ils déjà déployés, ou utilisent-ils encore Beats ou Logstash ?
- [ ] Quelles sources de logs collectent-ils : Windows/Sysmon, Linux/auditd, firewall, proxy, EDR tiers, cloud (AWS, Azure, M365), Active Directory ?
- [ ] Leurs données sont-elles conformes à ECS, ou ont-ils des mappings custom ?
- [ ] Utilisent-ils déjà Elastic Defend (EDR) ?

## 3. Contenu et priorités

- [ ] Le programme suit l'outline officiel Elastic (stack/Fleet, ECS, Discover, visualisations, dashboards, Security app, règles, alertes/Timeline/Cases, capstone). Y a-t-il un module à approfondir ou à alléger ?
- [ ] Règles de détection : préfèrent-ils l'usage des règles prébuilt ou l'écriture de règles custom (KQL, EQL, ES|QL, threshold, ML) ?
- [ ] Faut-il ajouter des sujets hors programme : MITRE ATT&CK mapping, detection-as-code, Elastic AI Assistant, connecteurs (ServiceNow, Jira, TheHive), RBAC/Spaces ?
- [ ] Ont-ils des cas d'usage ou des scénarios d'attaque réels à intégrer au capstone (sans données sensibles) ?
- [ ] Visualisations et dashboards : importants pour eux, ou déjà maîtrisés ?

## 4. Logistique technique (critique pour les TP)

- [ ] Les participants ont-ils des postes avec **Docker + Compose v2** et **8 Go de RAM libres** ?
- [ ] Ont-ils les droits admin pour installer Docker ? Un proxy d'entreprise ou un filtrage bloque-t-il `docker.elastic.co` ?
- [ ] Plan B : peuvent-ils créer un essai Elastic Cloud de 14 jours (email pro, accès Internet sortant) ? Ou le client fournit-il un environnement de formation ?
- [ ] Les ports `5601`, `9200` et `8220` sont-ils disponibles en local ?
- [ ] Peut-on faire un test de prérequis avant le J1 (checklist envoyée en amont) ?

## 5. Format et organisation

- [ ] Slides en anglais, TP en français : est-ce que ça convient ? Faut-il tout traduire en français, ou tout en anglais ?


## Notes de la réunion

-
