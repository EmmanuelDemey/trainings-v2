---
layout: cover
---

# fetch

---

# Présentation générale

- API native de JavaScript
- Permet de récupérer des ressources
- Basée sur des Promesses (`Promise`)
- Fonction asynchrone

## Syntaxe de base :

```javascript
fetch(url, options) // options is an optional object
```

---

# GET

```javascript
fetch("https://api.example.com/data")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Parse la réponse en JSON
  })
  .then(data => console.log(data))
  .catch(error => console.error("Erreur : ", error))
  .finally(() => doSomething());
```

---

# POST

```javascript
fetch("https://api.example.com/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  body: JSON.stringify({
    name: "John Doe",
    age: 30
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error("Erreur : ", error));

```

---

# Remarques

## Gestion des erreurs

- `fetch` ne rejette pas la promesse si le serveur répond avec un code d'erreur HTTP (comme 404 ou 500).
- Vous devez vérifier manuellement `response.ok` pour détecter les erreurs.

## Timeout 

- `fetch` ne gère pas directement les délais d'attente
- Utilisez `AbortController` pour implémenter un timeout :

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

fetch("https://api.example.com/data", { signal: controller.signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Request aborted or failed", error))
  .finally(() => clearTimeout(timeoutId));
```