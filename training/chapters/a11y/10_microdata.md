---
layout: cover
---

# Microdata

---

# Microdata

* Permet d'ajouter des méta-données au code HTML, ce qui aide les moteurs de recherche à comprendre le contenu de votre page.
* Les balises HTML définissent la structure de la page, tandis que les microdatas ajoutent des informations sémantiques.
* Microdata permet de structurer le contenu de la page, facilitant ainsi l'interprétation par les moteurs de recherche et les technologies d'assistance.
* Plusieurs raisons d'utiliser les Microdatas :
    * **Améliorer le SEO** : Les moteurs de recherche comprennent mieux votre contenu, ce qui peut améliorer votre classement.
    * **Rich Snippets** : Affichage de résultats enrichis (étoiles, recettes, événements, etc.) dans les résultats de recherche, augmentant le taux de clics.
    * **Accessibilité** : Facilite la compréhension pour les utilisateurs et les moteurs de recherche, rendant le contenu plus accessible.

* Disponibles via plusieurs librairies, notamment :
    * **Schema.org** : La bibliothèque la plus utilisée, offrant une large gamme de vocabulaires pour différents types de contenu.

---

# Schema.org

* Supporté par Bing, Google, Yahoo, et d'autres moteurs de recherche.
* Chaque librairie propose des vocabulaires, tels que :
    * **Person** : Pour décrire des individus.
    * **Restaurant** : Pour décrire des établissements de restauration.
    * **Event** : Pour décrire des événements.
    * **Product** : Pour décrire des produits.
    * **Review** : Pour décrire des avis sur des produits ou services.

---

# Vocabulaire

* Chaque vocabulaire propose des propriétés à ajouter à notre code HTML.
* Par exemple, pour le vocabulaire `Restaurant` :
    * **name** : Le nom du restaurant.
    * **image** : Une image du restaurant.
    * **geo** : Les coordonnées géographiques.
    * **events** : Les événements spéciaux organisés par le restaurant.
    * **menu** : Lien vers le menu du restaurant.

---

# Vocabulaire

* Pour ajouter un vocabulaire, définissez l'élément HTML racine contenant les données à annoter.
* Utilisation des attributs `itemscope` et `itemtype` pour indiquer le type de contenu.

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1>Super Taco Bar</h1>
    <h2>Menu</h2>
    <p>
       Lille
   	</p>
</section>
```

---

# Vocabulaire

* Ajoutez des attributs supplémentaires sur les éléments enfants pour fournir plus de détails.
* Utilisation de la propriété `itemprop` pour spécifier les propriétés des éléments.

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <p itemprop="address">
       Lille
   	</p>
</section>
```

* **Importance** : Cela aide à structurer les informations de manière à ce qu'elles soient facilement interprétables par les moteurs de recherche.

---

# Vocabulaire

* Imbriquer les vocabulaires pour une meilleure structuration et une hiérarchisation des informations.

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <p itemprop="addressLocality">Lille</p>
        <p itemprop="addressRegion">Hauts-de-France</p>
        <p itemprop="postalCode">59000</p>
    </div>
</section>
```

* **Avantage** : Cela permet de fournir des informations détaillées sur l'adresse, ce qui peut améliorer la visibilité dans les résultats de recherche locaux.

---

# Formation LD+JSON

* Utilisez un format JSON pour définir ces métadonnées, ce qui est souvent plus facile à lire et à maintenir.

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "name": "Emmanuel Demey",
  "url": "http://twitter.com/EmmanuelDemey",
  "sameAs": [
    "http://facebook.com/EmmanuelDemey",
    "http://linkedin.com/in/EmmanuelDemey"
  ]
}
</script>
```

* **Utilisation de `sameAs`** : Cela permet de lier plusieurs profils sociaux à une même personne, renforçant ainsi la crédibilité et la visibilité en ligne.