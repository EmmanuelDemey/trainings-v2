---
layout: cover
---

# Introduction

---
layout: statement
---

What does the term *Digital Accessibility* mean to you?

---
layout: statement
---

Who do you think is concerned by this topic?

---

# Synonyms

- Accessibilité (French)
- Accessibility
- A11Y
- E-Accessibility
- Web Accessibility
- Digital Accessibility

---
layout: statement
---

<blockquote>
The power of the Web is in its universality. Access by everyone regardless of disability is an essential aspect.

<p>Tim Berners-Lee</p>
</blockquote>

---
layout: statement
---

Web accessibility means making the content of a website available to everyone,
whatever their context of use.


---
layout: statement
---

<blockquote>
Making digital resources available to all individuals, whatever their hardware, network infrastructure,
language, culture, geographic location or physical or mental abilities.

<p>Edutec</p>
</blockquote>

---

# Why accessibility?

* **Legal obligations**
    * European law (European Accessibility Act - EAA): mandatory since June 2025
    * France: RGAA (Référentiel Général d'Amélioration de l'Accessibilité, the French accessibility standard)
    * United States: ADA (Americans with Disabilities Act) and Section 508
    * Canada: AODA (Accessibility for Ontarians with Disabilities Act)

---

# Why accessibility?

* **Business reasons**
    * Reach a wider audience: 16% of the world population
    * Avoid lawsuits (many cases in the United States)
    * Improve the user experience for everyone
    * Positive impact on SEO and performance

---

# Why accessibility?

* **Technical and quality reasons**
    * More maintainable and robust code
    * Better cross-browser compatibility
    * Better semantic structure
    * Easier automated testing
    * Better overall usability

---

# Introduction

- It is not limited to people with disabilities.
- Have you ever experienced one of the following:
    * An application unusable on mobile
    * An application not available in your country
    * An application unusable on your network
    * Content that is hard to understand
    * A business task that is hard to complete
    * ...

---

# Introduction

- In this training, we will focus on issues related to:
    * visual impairments
    * hearing impairments
    * motor impairments
    * cognitive impairments

---

# Secondary goals

- Build interfaces that are
    * simpler
    * easier to use
    * easier to maintain

---

# Impairments

- Visual impairment
- Motor impairment
- Hearing impairment
- Cognitive impairment

---

# Impairments

- An impairment can be
    * permanent
    * temporary

---

# Visual impairments

- **Blurred vision**: difficulty focusing on details
- **Protanopia**: difficulty perceiving red light (red-green colour blindness)
- **Deuteranopia**: difficulty perceiving green light (red-green colour blindness)
- **Tritanopia**: difficulty perceiving blue light (blue-yellow colour blindness)
- **Achromatopsia**: inability to see colours, only shades of grey
- **Total blindness**: complete absence of vision

---

# Motor impairments

- **Partial or total paralysis**: difficulty or inability to move some parts of the body
- **Tremors**: difficulty making precise movements (clicking, selecting)
- **Arthritis**: joint pain and stiffness limiting movement
- **Neuromuscular disorders**: muscle weakness, reduced coordination
- These people may use:
    * the keyboard only (no mouse)
    * switches
    * an eye-tracking pointing device
    * speech recognition

---

# Hearing impairments

- **Total deafness**: complete absence of hearing
- **Partial deafness**: partial hearing loss
- **Tinnitus**: perception of phantom sounds
- These people need:
    * captions for video and audio content
    * text transcripts
    * visual alerts instead of sound alerts
    * sign language (for some content)

---

# Cognitive impairments

- **Dyslexia**: difficulty with reading and spelling
- **ADHD**: attention deficit disorder, with or without hyperactivity
- **Memory disorders**: difficulty retaining or recalling information
- **Autism spectrum disorders**: difficulties with communication and social interaction
- These people benefit from:
    * clear and simple content
    * consistent and predictable navigation
    * enough reading time
    * no distracting animations

---

# Statistics

- 70% of websites are not accessible
- At least 2.2 billion people worldwide have a near or distance vision impairment (WHO)
- 300 million people are affected by a colour vision deficiency (colour blindness)
- 16% of the world population lives with a significant disability, i.e. about 1.3 billion people (WHO, 2023)
- The global assistive technology market was expected to reach 26 billion dollars by 2024

---

# Situational & Temporary Disabilities

## Accessibility benefits everyone

Many accessibility features also help in temporary situations:

- **Broken arm** → voice control, one-handed navigation
- **Noisy environment** → video captions
- **Bright sunlight** → high-contrast mode, dark theme
- **New parent** → voice control, keyboard shortcuts
- **Slow connection** → reduced animations, simplified layouts

**Key point**: accessible design improves the experience of everyone, not only of people with a permanent disability!

---

# Assistive devices

- Eye Tracking
- MouthStick
- Switch
- Screen magnifiers
- Screen readers

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

# Screen magnifiers

![Lens](/images/a11y/screenmagnifier.jpeg)

---

# Screen readers

![Lens](/images/a11y/braille.jpg)

---

# Screen readers

- Mainly used by people with a visual impairment.
- They convert the content of a website or an application into speech or braille.
- They provide shortcuts to navigate through a page.
- Content is read faster (350 words per minute) than a person's reading speed (150 words per minute)

---


# Screen readers

- How do a screen reader and a browser interact?
    * The browser builds the DOM Tree and the Accessibility Tree

- Once these trees are built, we can interact with them through
    * DOM: Document Object Model
    * CSSOM: CSS Object Model
    * AOM: Accessibility Object Model

- The browser exposes and updates this accessibility information through the operating system APIs
    * NSAccessibility (macOS), UI Automation (Microsoft), ...

- Screen readers subscribe to this information to render the content of the visited website

---

# Screen readers

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

# Screen readers

```
id=1 role=WebArea name="Demo"
id=2 role=Label name="Name"
id=3 role=TextField value="Manu" labelledByIds=[2]
id=4 role=Group
id=5 role=Button name="OK"
```

---

# Inspecting the Accessibility Tree

## Chrome/Edge DevTools

1. Open DevTools (F12)
2. Go to the "Elements" tab
3. Open the "Accessibility" pane, or enable the full-page accessibility tree view
4. See how screen readers perceive your content

**Tip**: use it regularly during development to catch semantic issues early!

---

# Screen readers

- NVDA (\*)
- JAWS (\*)
- VoiceOver (macOS, iOS)
- TalkBack (Android)
- Narrator
- Orca

(\*) account for 80% of the screen reader market.

---

# Screen readers

- [Assistive Tech - VoiceOver](https://youtu.be/5R-6WvAihms) (8 min) - Web navigation with VoiceOver. Recommended for every developer.
- [Assistive Tech - VoiceOver on iOS](https://youtu.be/bCHpdjvxBws) (5 min) - Demo of the mobile screen reader
- [Assistive Tech - Talkback](https://youtu.be/0Zpzl4EKCco) (6 min) - Navigating with the Android screen reader
- [Assistive Tech - NVDA](https://youtu.be/Jao3s_CwdRU) (7 min) - Windows screen reader (the most used, along with JAWS)

**Pro Tip**: try testing your own website with these tools before deploying!

---

# Rotor

- Some screen readers provide a **rotor**
- A mechanism to
    * view the structure of the page
    * navigate more easily

- Example with VoiceOver
    * VO+U: open the **rotor**
    * VO+ <-/->: navigate
    * VO+Fn+ ->: end of the page
    * VO+Fn+ <-: beginning of the page
    * VO+Command+L: next link
    * VO+Command+H: next heading
    * ...

---

# Screen readers

- Users navigate differently on desktop / mobile
    * Keyboard on desktop
    * Touch and swipe gestures on mobile.


---

# Demos

- Starting VoiceOver
- Opening the rotor
- Navigating / filtering through the rotor
- Navigating the web page
- Reading content
- HTML Summary
- Speech rate

---
layout: cover
---

# Hands-on

---
layout: cover
---

# Workshop 1

Screen reader
