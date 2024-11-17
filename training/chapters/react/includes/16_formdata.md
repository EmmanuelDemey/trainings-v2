---
layout: cover
---

# FormData

---

# FormData

### Qu'est-ce donc ?

FormData est une interface JavaScript utile pour collecter et gérer facilement les données d'un formulaire HTML

### Avantages

- Pratique pour manipuler des champs de formulaire sans avoir à écrire beaucoup de logique supplémentaire
- Support natif pour les fichiers, idéal pour les formulaires avec upload
- Évite de configurer manuellement des champs contrôlés

### Inconvénients

- Pas directement compatible avec le format JSON, si votre serveur attend des données JSON, vous devez convertir FormData en objet

```typescript
const formData = new FormData(form);
const jsonData = Object.fromEntries(formData.entries());
```

---

# FormData

```typescript {*}{maxHeight:'400px'}
function MyForm() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const form = event.currentTarget; // Référence au formulaire
    const formData = new FormData(form); // Crée une instance FormData à partir du formulaire

    // Afficher les données dans la console
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Poster vers le serveur
    fetch('/api/submit', {
        method: 'POST',
        body: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Nom :
          <input type="text" name="name" />
        </label>
      </div>
      <div>
        <label>
          Email :
          <input type="email" name="email" />
        </label>
      </div>
      <div>
        <label>
          Fichier :
          <input type="file" name="file" />
        </label>
      </div>
      <button type="submit">Soumettre</button>
    </form>
  );
}

export default MyForm;
```