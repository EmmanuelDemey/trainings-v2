# Screen Readers

* Used mostly by people with visual disabilities
* It converts a digital content to an audio or braille stream
* Provide some shortcust in order to reduce the reading of the page
* When the Screen reader reads the content of the page, the speed is at 350 word per minu

--- 

# Screen Readers

* How a screen reader is able to communicate with a browser ?
    * The browser will generate :
    * DOM: Document Object Model 
    * CSSOM: CSS Object Model
    * Accessibility Tree

* The Accessibility Tree will be exposed to native Accessibility *driver*
    * OSX Accessibility Platform (OSX)
    * UI Automation (Microsoft)
    * MS Active Accessibility (Microsoft)
    * Accessibility Toolkit (ATK)

* Screen Readers will also use these natives drivers

* Everytime an *event* is triggered on your web page, the browser will expose the new state of your tree
---

# Screen Readers

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

* Here is an example of a generated **Accessibility tree**

```
id=1 role=WebArea name="Demo"
    id=2 role=Label name="Name"
    id=3 role=TextField value="Manu" labelledByIds=[2]
    id=4 role=Group
        id=5 role=Button name="OK"
```

* Chromium-based browser provide tools in order to visualize this tree.

---

# Screen Readers

* NVDA (*)
* JAWS (*)
* Voice Over (iOS)
* TalkBack (Android)
* Narrator
* ChromeVox (Chrome plugin)

(*) More than 80% of the market

---

# Screen Readers

* https://youtu.be/5R-6WvAihms[Assistive Tech - VoiceOver]
* https://youtu.be/bCHpdjvxBws[Assistive Tech - VoiceOver on iOS]
* https://youtu.be/0Zpzl4EKCco[Assistive Tech - Talkback]
* https://youtu.be/Jao3s_CwdRU[Assistive Tech - NVDA]

---

# Rotor

* Each Screen Readers provide a **Rotor**
* Feature that allow to
* visualize the structure of the page
* browse easliy 

---

# Shortcusts

* Here are some example of shortcuts used on VoiceOver
    * VO+U : in order to open `rotor`
    * VO+ <-/-> : For browsing
    * VO+Fn+ -> : End of the page
    * VO+Fn+ <- : Start of the page
    * VO+Commande+L : Next link
    * VO+Commande+H : Next header
    * ...

---

# Demo

* Launch VoiceOver
* open the Rotor
* Navigate and Filter on the Rotor
* Navigate on the page
* Reading content
* Speed

---
layout: cover
---

# Take few minutes to use a screen reader based on a website you already know
