---
layout: cover
---

# Introduction

---
layout: statement
---

Pour vous, que signifie le terme _Accessibilité_ ?

---
layout: statement
---

- Pour vous, qui est concerné par ce sujet ?

---

# Synonymes

- Accessibilité
- Accessibility
- A11Y
- E-Accessibily

---
layout: statement
---

<blockquote>
The power of the web is in its universality. Access by everyone regardless of disability in an essential aspect.

<p>Tim Berners-Lee</p>
</blockquote>

---
layout: statement
---

L'accessibilité web est le fait de mettre à disposition le contenu d'un site web à tout le monde,
quelque soit son contexte d'utilisation.


---
layout: statement
---

<blockquote>
La mise à disposition de ressources numériques à tous les individus, quels que soient leur matériel, leur infrastructure
réseau, leur langue, leur culture, leur localisation géographique ou leurs aptitudes physiques ou mentales".

<p>Edutec</p>
</blockquote>

---

# Introduction

* Pourquoi une nécessité pour vous ?
    * vos clients vont vous l'obliger (gouvernements, éducation, ...)
    * la loi vous l'oblige (active dans plusieurs pays)
    * permet de créer un site web de meilleure qualité

---

# Introduction

- Cela n'est pas limité qu'aux personnes en situation de handicap.
- Avez-vous déjà vécu l'une des experiences suivantes :
    * Application non utilisable sur mobile
    * Application non disponible dans votre pays
    * Application non utilisable sur votre réseau

---

# Introduction

- À ces problèmes, plusieurs solutions possibles
    * Responsive Web Design
    * Internationalisation
    * Service Worker, Cache API,...

---

# Introduction

- Mais dans cette formation nous allons nous limiter aux problématiques liées au déficiences :
    * visuels
    * auditives
    * motrices
    * cognitives

---

# Buts secondaires

- Créer des interfaces
    * plus simple
    * plus facile à utiliser
    * plus facile à maintenir

---

# Déficiences

- Déficience visuelle
- Déficience motrice
- Déficience auditive
- Déficience cognitive

---

# Déficiences

- Une déficience peut être
    * permanente
    * temporaire

---

# Déficiences

- Ces déficiences ne sont pas forcément liées que à des handicaps.
- L'accessibilité peut être bénéfique pour tout le monde.
    * lorsque vous êtes dans une zone bruyante (déficience auditive)
    * lorsque vous êtes en extérieur (déficience visuelle)

---

# Déficiences visuels

- `Blurred vision` : Difficultés à se concentrer sur les détails
- `Protanopia` : Difficultés à voir les lumières rouges
- `Deuteranopia` : Difficultés à voir les lumières vertes
- `Tritanopia` : Difficultés à voir les lumières bleues
- `Achromatopsia`: Difficultés à voir les couleurs sauf les nuances de gris.

---

# Statistiques

- 70% des sites Web ne sont pas accessibles.
- 1 milliard de personnes ayant une déficience visuelle
- 300 millions de personnes impactées par une déficience visuelle liée aux couleurs.

---

# Présentation de appareils utilisés

- Eye Tracking
- MouthStick
- Switch
- Amplificateurs d'écran
- Synthétiseurs Vocaux

---

# Eye Tracking

![Lens](/images/a11y/stephen-hawking.webp)

---

# MouthStick

![Lens](/images/a11y/mouthstick.jpg)

---

# Switch

![Lens](/images/a11y/switch.png)

---

# Amplificateurs d'écran

![Lens](/images/a11y/screenmagnifier.jpeg)

---

# Synthétiseurs Vocaux

![Lens](/images/a11y/braille.jpg)

---

# Synthétiseurs Vocaux

- Utilisé principalement par les personnes avec une déficiance visuelle.
- Il convertit le contenu d'un site web ou d'une application en audio ou en braille.
- Propose des raccourcis permettant de naviguer à travers une page.
- Le contenu est lu plus rapidement (350 mots par minute) que la vitesse de lecture d'une personne (150 mots par minute)

---

# Comment cela fonctionne ?

- Les User-agent (navigateurs) utilisent l'API des systèmes d'exploitation
    * OSX Accessibility Platform (OSX)
    * UI Automation (Microsoft)
    * MS Active Accessibility (Microsoft)
    * Accessibility Toolkit (ATK)
    * ...

---

# Comment cela fonctionne ?

- Les synthétiseur vocaux s'abonnent à des évenements émis par ces APIs

---

# Synthétiseurs Vocaux

- Les utilisateurs navigueront de différentes manières sur desktop / mobile
    * Le clavier sur desktop
    * Navigation par Touch et Swipe sur mobile.


---

# Synthétiseurs Vocaux

- Comment intéragissent un synthétiseur vocal et un navigateur ?
    * Le navigateur genère : 
        * DOM Tree
        * Accessibility Tree

---

# Synthétiseurs Vocaux

- Une fois ces arbres créées, nous pouvons intéragir avec grâce aux
    * DOM : Document Object Model
    * CSSOM : CSS Object Model
    * AOM : Accessibility Object Model
* Le synthétiseur vocal se base sur cet AOM

---

# Synthétiseurs Vocaux

```html
<html>
    <head><title>Demo</title></head>
    <body>
        <label for="name">Name</label>
        <input id="name" value="Manu"/>
        <div>
            <button>OK</button>
        </div>
    </body>
</html>
```

---

# Synthétiseurs Vocaux

```
id=1 role=WebArea name="Demo"
id=2 role=Label name="Name"
id=3 role=TextField value="Manu" labelledByIds=[2]
id=4 role=Group
id=5 role=Button name="OK"
```

---

# Synthétiseurs Vocaux

- NVDA (\*)
- JAWS (\*)
- Voice Over (iOS)
- TalkBack (Android)
- Narrator
- ChromeVox (plugin Chrome)

(\*) représent 80% du marché.

---

# Synthétiseurs Vocaux

- https://youtu.be/5R-6WvAihms[Assistive Tech - VoiceOver]
- https://youtu.be/bCHpdjvxBws[Assistive Tech - VoiceOver on iOS]
- https://youtu.be/0Zpzl4EKCco[Assistive Tech - Talkback]
- https://youtu.be/Jao3s_CwdRU[Assistive Tech - NVDA]

---

# Rotor

- Chaque synthétiseur vocal propose un `rotor`
- Mécanisme permettant de
    * visualiser la structure de la page
    * de naviguer plus facilement

---

# Raccourcis

- Exemple pour Voice Over
    * VO+U : Pour ouvrir le `rotor`
    * VO+ <-/-> : Pour naviguer
    * VO+Fn+ -> : Fin de la page
    * VO+Fn+ <- : Début de la page
    * VO+Commande+L : Prochain Lien
    * VO+Commande+H : Prochain Titre
    * ...

---

# Démos

- Lancement de Voice Over
- Ouvrir le rotor
- Naviguer / filtrer à travers le rotor
- Navigation sur la page Web
- Lecture de contenu
- HTML Summary
- Vitesse

---

# Affordances

![Lens](/images/a11y/affordance.jpg)

---

---
layout: statement
---

<blockquote>
Quand on voit une theiere, sans manuel d'utilisation, nous savons comment l'utiliser.
</blockquote>

---
layout: cover
---

# PW1
