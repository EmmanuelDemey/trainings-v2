---
layout: cover
---

# Microdata

---

# Microdata

* Permet d'ajout des méta données au code HTML
* Les balises HTML permettent de définir la structure de la page
* Microdata permet de définir le contenu de la page
* Disponibles via plusieurs librairies
    * Schema.org

---

# Schema.org

* Supporté par Bing, Google, Yahoo
* Chaque librairie met à disposition des vocabulaires
    * Person
    * Restaurant
    * Event
    * Product
    * ...

---

# Vocabulaire

* Chaque vocabulaire propose des propriétés que nous pouvons ajouter à notre code HTML.
* Par exemple, pour le vocabulaire `Restaurant` :
    * name
    * image
    * geo
    * events
    * ...

---

# Vocabulaire

* Pour ajouter un vocabulaire, nous devons définir l'élément HTML racine contenant la données que nous souhaitons annoter.
* Utilisation des attributs `itemscope` et `itemtype`.

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

* Nous pouvons à présent ajouter des attributs supplémentaires sur les éléments enfants.
* Utilisation de la propriété `itemprop`

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <p itemprop="address">
       Lille
   	</p>
</section>
```

---

# Vocabulaire

* Nous pouvons imbriquer les vocabulaires

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <p itemprop="addressLocality">Lille</p>
    </div>
</section>
```

---

# Formation LD+JSON

* Nous pouvons également utiliser un format JSON pour définir ces métadonnées

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "name": "Emmanuel Demey",
  "url": "http://twitter.com/EmmanuelDemey"
}
</script>-
```

---
