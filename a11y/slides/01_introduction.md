---
layout: cover
---

# 01 - Why accessibility

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Define** digital accessibility — and see that it concerns far more people
  than "the disabled"
- **Argue** for it: legal, business and quality reasons
- **Name** the four families of impairments and what each one needs from a page
- **Recognise** the assistive technologies, and explain how a screen reader
  reads a page through the **accessibility tree**
- **Drive** a screen reader with its essential shortcuts, on desktop and on a
  phone — workshop 01

<!--
Five verbs: the first two are the "why", the last three the "how". Ask the room early who has a screen reader on their phone: there is always one already on it, VoiceOver or TalkBack.
-->

---
layout: statement
---

What does *digital accessibility* mean to you?
Who do you think it concerns?

<!--
Two or three minutes, collect the answers on the board. Most people answer "blind people" and "the law": the next slides widen both. Keep the board: the recap comes back to it.
-->

---

# What we are talking about

<div style="display: flex; gap: 2em;">
<div style="flex: 1;">

> The power of the Web is in its universality. Access by everyone regardless
> of disability is an essential aspect.
>
> — **Tim Berners-Lee**

> Making digital resources available to all individuals, whatever their
> hardware, network infrastructure, language, culture, geographic location or
> physical or mental abilities.
>
> — **Edutec**

</div>
<div style="flex: 1;">

### In one sentence

Making the content of a website available to **everyone**, whatever their
**context of use**.

### Also called

*Accessibility*, **a11y** (a + 11 letters + y), *e-accessibility*, *web
accessibility*, *accessibilité* (French)

### Not only disability

- An app unusable on **mobile**, on a **slow network**, in your **country**
- Content **hard to understand**, a business task **hard to complete**

</div>
</div>

<!--
The Edutec definition is wider than disability on purpose: hardware, network, language. That is the bridge to "accessibility benefits everyone" a few slides later. a11y is a numeronym, like i18n.
-->

---

# Why accessibility?

<div style="display: flex; gap: 2em;">
<div>

### Legal

- **Europe** — the European Accessibility Act (EAA): mandatory since **June 2025**
- **France** — the RGAA
- **USA** — ADA and Section 508
- **Canada** — AODA (Ontario)
- Chapter 02 details them

</div>
<div>

### Business

- Reach **16%** of the world population
- Avoid **lawsuits** (many in the USA)
- A better experience **for everyone**
- Better **SEO** and performance

</div>
<div>

### Quality

- Semantic, **maintainable**, robust code
- Better cross-browser support
- **Easier tests**: a page testable by role is
  testable by a screen reader
- Simpler interfaces, easier to use

</div>
</div>

<br />

> **16%** of the world population — about **1.3 billion** people — live with a
> significant disability (WHO, 2023). **95.9%** of the top million home pages
> fail WCAG on errors a tool can detect (WebAIM Million, 2026).

<!--
The WebAIM figure is a floor: only automatically detectable errors are
counted. Top errors: low contrast (84%), missing alt (53%), missing form
labels (51%) — all covered in the workshops.
https://webaim.org/projects/million/
-->

---

# Four families of impairments

Permanent **or** temporary. This training covers all four.

| | Examples | What they need from the page |
|---|---|---|
| **Visual** | Blurred vision · colour blindness (protanopia: red, deuteranopia: green, tritanopia: blue, achromatopsia: no colour) · total blindness | Text alternatives, **contrast**, colour never the only signal, a page that zooms, a screen reader that can read it |
| **Motor** | Paralysis · tremors · arthritis · neuromuscular disorders | **Keyboard only**, switches, eye tracking, voice control — large targets, no precise gestures |
| **Hearing** | Total or partial deafness · tinnitus | **Captions**, transcripts, visual alerts instead of sounds, sign language |
| **Cognitive** | Dyslexia · ADHD · memory disorders · autism spectrum | Clear simple content, **consistent** navigation, enough time, no distracting animations |

- **2.2 billion** people have a near or distance vision impairment (WHO);
  **300 million** are colour blind

<!--
Insist on the cognitive family: it is the largest and the least known, and its needs (plain language, consistency, time) are rarely tested. Colour blindness: about 1 man in 12, 1 woman in 200 — test it in DevTools, Rendering, Emulate vision deficiencies (chapter 08).
-->

<style>
table { font-size: 0.8em; }
td, th { padding-top: 0.3em !important; padding-bottom: 0.3em !important; }
</style>

---

# Accessibility benefits everyone

Situational and temporary disabilities meet the same features:

| Situation | The feature that helps |
|---|---|
| A **broken arm**, a **baby** in your arms | Keyboard shortcuts, voice control, one-handed navigation |
| A **noisy** train, a silent open space | Video **captions** |
| **Bright sunlight** on the screen | High contrast, a dark theme |
| A **slow** connection | Reduced animations, simpler layouts |
| Getting **older** | Larger text, zoom, larger targets |

<br />

> Accessible design improves the experience of **everyone**, not only of people
> with a permanent disability — the *curb cut effect*.

<!--
Curb cuts were made for wheelchairs; prams, suitcases and bikes use them every day. Same with captions: most viewers who turn them on are not deaf. Microsoft's Inclusive Design toolkit frames it as permanent, temporary and situational: one arm, an arm injury, a new parent.
-->

---

# Assistive technologies

<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1em; text-align: center; font-size: 0.85em;">
<div>

![Stephen Hawking, an infrared sensor fixed on his glasses](/images/a11y/stephen-hawking.webp)

**Cheek sensor** — a muscle twitch selects a letter

</div>
<div>

![Mouthstick](/images/a11y/mouthstick.jpg)

**Mouthstick** — keys pressed with a stick

</div>
<div>

![Switch](/images/a11y/switch.png)

**Switch** — one or two buttons scan the page

</div>
<div>

![Screen magnifier](/images/a11y/screenmagnifier.jpeg)

**Screen magnifier** — the page zoomed around the focus

</div>
<div>

![Braille display](/images/a11y/braille.jpg)

**Screen reader** — speech, or a braille display

</div>
</div>

<br />

- Most of them **emulate a keyboard**: a page usable with Tab, Enter, Space and
  the arrows works with all of them — chapter 03

<style>
img { max-height: 140px; margin: 0 auto; object-fit: contain; }
</style>

<!--
Stephen Hawking did not use eye tracking: an infrared sensor on his glasses
detected a cheek twitch, and software scanned letters — a single-switch
setup. Eye tracking exists too (Tobii, built in iOS 18 and Windows).
-->

---

# Screen readers

<div style="display: flex; gap: 2em;">
<div>

- Mainly used by people with a **visual impairment**
- Turn a page into **speech** or **braille**
- Provide **shortcuts** to jump through the page: headings, links,
  landmarks, form fields
- Experienced users listen at **300+ words per minute** — twice the pace of
  normal speech
- On **desktop**: the keyboard. On **mobile**: touch and swipe gestures

</div>
<div>

| Screen reader | Platform |
|---|---|
| **NVDA** (\*) | Windows — free, open source |
| **JAWS** (\*) | Windows — commercial |
| **VoiceOver** | macOS, iOS — built in |
| **TalkBack** | Android — built in |
| Narrator | Windows — built in |
| Orca | Linux |

(\*) together, almost **90%** of primary desktop screen readers — JAWS 55%,
NVDA 33% (WebAIM survey, 2026)

</div>
</div>

<!--
WebAIM Screen Reader User Survey #11 (2026): JAWS rebounds (55% primary,
41% in 2024), NVDA 33%. On mobile, iOS/VoiceOver 73%, Android 24%.
https://webaim.org/projects/screenreadersurvey11/
-->

---

# How a screen reader reads a page

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```html
<html>
  <head><title>Demo</title></head>
  <body>
    <label for="name">Name</label>
    <input id="name" value="Manu" />
    <div>
      <button>OK</button>
    </div>
  </body>
</html>
```

```text
id=1 role=WebArea   name="Demo"
id=2 role=Label     name="Name"
id=3 role=TextField value="Manu" labelledByIds=[2]
id=4 role=generic   (ignored)
id=5 role=Button    name="OK"
```

</div>
<div style="flex: 1; min-width: 0;">

1. The browser builds the **DOM tree** — and from it the **accessibility tree**:
   each node a **role**, a **name**, a **state**, a value
2. It exposes that tree through the **OS accessibility APIs**: NSAccessibility
   (macOS), UI Automation (Windows), AT-SPI (Linux)
3. The screen reader **subscribes** to it, and reads it to the user

- Scripts reach it through the DOM, the CSSOM — and, one day, the **AOM**
  (Accessibility Object Model)
- **Inspect it**: DevTools → *Elements* → *Accessibility* pane, or the
  full-page accessibility tree view. Use it while you code

</div>
</div>

<br />

> The screen reader **never sees your CSS or your `div`s**: only what lands in
> that tree. Most of this training is about filling it correctly.

<!--
Demo: open this snippet in Chrome, DevTools → Elements → Accessibility, tick
"Enable full-page accessibility tree". The `div` has no role worth
exposing: Chrome drops it from the tree. The label gives the field its name.
-->

---

# Navigating with VoiceOver — the rotor

<div style="display: flex; gap: 2em;">
<div>

| Keys | What it does |
|---|---|
| **VO** | Ctrl + Option |
| Cmd + F5 | VoiceOver on / off |
| VO + U | the **rotor**: headings, links, landmarks, form controls |
| VO + ← / → | previous / next item |
| VO + Cmd + H | next heading |
| VO + Cmd + L | next link |
| VO + Fn + ← / → | beginning / end of the page |

</div>
<div>

- The **rotor** (NVDA: the *elements list*, NVDA + F7) shows the **structure**
  of the page — and lets you jump in it
- A page with no headings and no landmarks gives an **empty rotor**: the user
  has to listen to everything
- Live demo:
  - turn VoiceOver on, change the speech rate
  - open the rotor, filter it, jump to a heading
  - read a page, fill a field

</div>
</div>

<style>
table { font-size: 0.85em; }
</style>

<!--
Lower the speech rate first, the room cannot follow the default. Windows
attendees: same demo with NVDA (NVDA + F7 for the elements list, H for next
heading, K for next link).
-->

---

# On mobile — VoiceOver (iOS) and TalkBack (Android)

| Action | VoiceOver — iOS | TalkBack — Android |
|---|---|---|
| Turn on / off | Settings → Accessibility, Siri, or a triple-click of the side button once set as the Accessibility Shortcut | Hold **both volume keys** a few seconds |
| Explore | Drag a finger: what is under it is read | Same |
| Next / previous item | Swipe **right** / **left** | Swipe **right** / **left** |
| Activate | **Double-tap** | **Double-tap** |
| Read from the top / from here | Two-finger swipe **up** / **down** | — / two-finger **triple-tap** (from the next item) |
| Pause speech | Two-finger tap | Two-finger tap |
| Scroll | **Three**-finger swipe | **Two**-finger swipe |
| Jump by type | The **rotor**: two-finger rotation, then swipe up / down | **Reading controls**: three-finger swipe up / down, then swipe up / down |
| Back | Two-finger **scrub** (a "Z") | Swipe down then left |

<style>
table { font-size: 0.72em; }
td, th { padding-top: 0.15em !important; padding-bottom: 0.15em !important; }
</style>

<!--
Sources: Apple, "Learn VoiceOver gestures on iPhone"; Google, "Use TalkBack gestures" (TalkBack 9.1+, multi-finger). Gestures vary with the TalkBack version and the phone maker: check on the device you demo with. Screen curtain on iOS (three-finger triple-tap) blacks out the screen while VoiceOver keeps running: the most convincing demo. Mobile use matters: in the WebAIM 2026 survey, most respondents also use a screen reader on a phone — iOS/VoiceOver 73%, Android 24%.
-->

---

# Mobile versus desktop — what changes

<div style="display: flex; gap: 2em;">
<div>

### For the user

- **No Tab key**: the swipe follows the **DOM order**, not the visual one
- A single tap **selects**, a **double-tap** activates: hover and
  "tap to reveal" do not exist
- The **rotor** / reading controls replace the shortcut keys: headings,
  links, form controls, landmarks
- An **on-screen keyboard** takes half the screen when a field has the focus
- Screen **curtain**: many users browse with the screen off

</div>
<div>

### For you

- Same rules, same tree: **roles, names, states**
- Touch **targets** of at least **24 × 24 px** (2.5.8, AA) — 44 px is better
- No gesture that **needs** several fingers or a path (2.5.1) or a drag
  (2.5.7): give a simple tap alternative
- **Orientation** and **zoom** never locked (1.3.4, 1.4.4) — chapter 03
- Test on a **real phone**: the simulators do not run VoiceOver or TalkBack
  the same way

</div>
</div>

<!--
The swipe order is the DOM order: a CSS grid or flex `order` that reorders visually breaks it, exactly as with Tab on desktop. `user-scalable=no` or `maximum-scale=1` in the viewport meta blocks pinch-zoom: iOS Safari ignores it since iOS 10, Android Chrome does not always. On iOS the Xcode simulator has no VoiceOver: use the Accessibility Inspector, or a real device.
-->

---

# Watch it before you try it

| Video | Length | What you see |
|---|---|---|
| [Screen Reader Basics — VoiceOver](https://youtu.be/5R-6WvAihms) | 12 min | Browsing the web with VoiceOver — **recommended for every developer** |
| [Assistive Tech — VoiceOver on iOS](https://youtu.be/bCHpdjvxBws) | 7 min | The mobile screen reader, with gestures |
| [Assistive Tech — TalkBack](https://youtu.be/0Zpzl4EKCco) | 11 min | The Android screen reader |
| [Screen Reader Basics — NVDA](https://youtu.be/Jao3s_CwdRU) | 9 min | The Windows screen reader — the most used, with JAWS |

<br />

> Test your own site with one of them **before** you deploy: five minutes are
> enough to find the worst problems.

<!--
Do not play them in the room: give the links, they are homework or the first step of workshop 01. If you show one, the VoiceOver basics, two minutes, at a high speech rate: it makes the "300 words per minute" figure concrete.
-->

---

# Recap

- Accessibility = the content available to **everyone**, whatever the
  **context of use** — not only people with a disability
- **Four families** of impairments — visual, motor, hearing, cognitive —
  permanent or temporary, and situational for all of us
- Assistive technologies mostly **emulate a keyboard**; screen readers read
  the **accessibility tree** — role, name, state — never the CSS
- The **rotor** shows the page's structure: no headings, no landmarks, no
  shortcuts
- On a **phone**: swipe, double-tap, the rotor or the reading controls — the
  same tree, read in **DOM order**

> In the workshop you **hear** your first pages: everything later in the
> training is about what you heard.

<!--
Transition: workshop 01 is manual, no automated grading. Pair people whose
laptop cannot run a screen reader. Then chapter 02: the standards that say
what "accessible" means, and who must comply.
-->

---

# Quiz — Why accessibility

**Who benefits from an accessible page?**

- A) Only blind people
- B) Only people with a permanent disability
- C) Only the users of assistive technologies
- D) Everyone: permanent, temporary and situational impairments

<v-click>

**Answer: D** — Everyone — a broken arm, the sun on a phone, a noisy train.

</v-click>

---

# Quiz — Why accessibility

**What does a screen reader read?**

- A) The **accessibility tree**
- B) The CSS
- C) The raw HTML source
- D) The pixels on the screen

<v-click>

**Answer: A** — The accessibility tree: **role, name, state** of each node. Never the CSS.

</v-click>

---

# Quiz — Why accessibility

**Most assistive technologies emulate which device?**

- A) A mouse
- B) A touch screen
- C) A **keyboard**
- D) A game controller

<v-click>

**Answer: C** — A keyboard: everything must work with Tab, Enter, Space and the arrows.

</v-click>

---
layout: cover
---

# Workshop 01

## Screen readers

<!--
45 minutes, 1 h if NVDA has to be installed. No code, no verify. Those who finish early: the same steps with VoiceOver or TalkBack on their phone. Next chapter: the standards that say what "accessible" means, and who must comply.
-->
