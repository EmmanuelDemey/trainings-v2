---
layout: cover
---

# Microdata

---

# Microdata

* Adds metadata to the HTML code, which helps search engines understand the content of your page.
* HTML tags define the structure of the page, while microdata adds semantic information.
* Microdata structures the page content, making it easier to interpret for search engines and assistive technologies.
* Several reasons to use Microdata:
    * **Improve SEO**: search engines understand your content better, which can improve your ranking.
    * **Rich Snippets**: rich results (stars, recipes, events, etc.) are displayed in search results, increasing the click-through rate.
    * **Accessibility**: makes the content easier to understand for users and search engines, making it more accessible.

* Available through several libraries, including:
    * **Schema.org**: the most widely used library, offering a wide range of vocabularies for different types of content.

---

# Schema.org

* Supported by Bing, Google, Yahoo and other search engines.
* Each library provides vocabularies, such as:
    * **Person**: to describe individuals.
    * **Restaurant**: to describe food establishments.
    * **Event**: to describe events.
    * **Product**: to describe products.
    * **Review**: to describe reviews of products or services.

---

# Vocabulary

* Each vocabulary provides properties to add to our HTML code.
* For example, for the `Restaurant` vocabulary:
    * **name**: the name of the restaurant.
    * **image**: a picture of the restaurant.
    * **geo**: the geographic coordinates.
    * **events**: special events organized by the restaurant.
    * **menu**: link to the restaurant's menu.

---

# Vocabulary

* To add a vocabulary, define the root HTML element containing the data to annotate.
* Use the `itemscope` and `itemtype` attributes to indicate the type of content.

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

# Vocabulary

* Add extra attributes on child elements to provide more details.
* Use the `itemprop` property to specify the properties of the elements.

```html
<section itemscope itemtype="https://schema.org/Restaurant">
    <h1 itemprop="name">Super Taco Bar</h1>
    <h2>Menu</h2>
    <p itemprop="address">
       Lille
   	</p>
</section>
```

* **Why it matters**: it structures the information so that search engines can easily interpret it.

---

# Vocabulary

* Nest vocabularies to better structure and organize the information hierarchically.

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

* **Benefit**: it provides detailed information about the address, which can improve visibility in local search results.

---

# LD+JSON format

* Use a JSON format to define this metadata, which is often easier to read and maintain.

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

* **Using `sameAs`**: links several social profiles to the same person, strengthening credibility and online visibility.

---
layout: cover
---

# Workshop

Workshop 9: microdata
