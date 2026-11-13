---
layout: cover
---

# Complex components

---

# Complex components

* We are now going to work on complex components/patterns
    * Tooltip
    * Tabs
    * Modals
    * Tree
    * Alerts
    * Video / Audio

---

# Tooltip

* Tooltips are often handled through a `hover` event
* Not usable by keyboard users.

```html
<label>
  Email
  <input aria-describedby="tooltip"/>
</label>
<button> ? </button>
<span id="tooltip" hidden>explanation</span>
```

---

# Tooltip

```javascript
const tooltip = document.querySelector('#tooltip');
const button = document.querySelector('button')

button.addEventListener('mouseover', () => {
  tooltip.removeAttribute('hidden')
})

button.addEventListener('click', () => {
  tooltip.toggleAttribute('hidden')
})

button.addEventListener('mouseout', () => {
  tooltip.setAttribute('hidden', '')
})
```

---

# Tabs

* To implement an accessible `tab` system, we will use the `tablist`, `tab` and `tabpanel` roles.
* We will indicate that each tab controls a panel
* We will define the state of a tab: selected or not.

---

# Tabs

```html
<div>
  <div role="tablist" aria-label="Fruits">
    <button role="tab" aria-selected="true" aria-controls="apples-tab" id="apples">Apples</button>
    <button role="tab" aria-selected="false" aria-controls="oranges-tab" id="oranges" tabindex="-1">
        Oranges
    </button>
  </div>

  <div role="tabpanel" id="apples-tab" aria-labelledby="apples">
    <p>Apples tab content</p>
  </div>

  <div role="tabpanel" id="oranges-tab" aria-labelledby="oranges">
    <p>Oranges tab content</p>
  </div>
</div>
```

---

# Modals

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-heading">
  <h1 id="modal-heading">Confirmation</h1>

  <p>Are you sure you want to discard all of your notes?</p>

  <div>
    <button type="button">No</button>
    <button type="button">Yes</button>
  </div>
</div>
```

---

# Modals

```html
<div role="dialog" aria-modal="true" aria-label="Confirmation">

  <p>Are you sure you want to discard all of your notes?</p>

  <div>
    <button type="button">No</button>
    <button type="button">Yes</button>
  </div>
</div>
```

---

# Modals

* `role="dialog"`
* `aria-modal`
* `aria-label`
* `aria-labelledby`

---

# Modals

* Once the modal is in place, we must make sure some behaviors work properly.

* When the modal opens:
    * `focus` must be moved to the first focusable field of the modal
    * Only the modal's elements must be `focusable`
    * The window can be closed with the `Escape` key

* When the modal closes:
    * `focus` must return to the element that opened the modal.

---

# Full example

```html
<button class="open-modal">Open the modal</button>

<div role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <h1 id="modal-heading">Confirmation</h1>
      <form>
        <label>User <input /></label>
        <label>Password <input type="password"/></label>
        <button>Sign Up</button>
      </form>
</div>

<div class="modal-overlay"></div>
```

---

# Full example

```javascript
let focustedElementBeforeModal;

const modal = document.querySelector('[role="dialog"]');
const modalOverlay = document.querySelector('.modal-overlay');
const modalToggle = document.querySelector('.open-modal');
modalToggle.addEventListener('click', openModal);
```

---

# Full example

```javascript
function openModal(){
    focustedElementBeforeModal = document.activeElement;

    modal.addEventListener('keydown', tabKeyHandler);
    modalOverlay.addEventListener('click', closeModal);

    const button = modal.querySelector('button');
    button.addEventListener('click', closeModal);

    ...
```

---

# Full example

```javascript
    ...

    const focusableElementSelectors = 'a[href], button, input:not[disabled]';
    let focusableElements = modal.querySelectorAll(focusableElementSelectors);
    focusableElements = Array.prototype.slice.call(focusableElements);

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    ...
```

---

# Full example

```javascript
    ...

    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    firstFocusableElement.focus();
    ...
```

---

# Full example

```javascript
    ...

    function tabKeyHandler(e){
        if(e.keyCode === 9){
            if(e.shiftKey){
                if(document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if(document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }

        if(e.keyCode === 27){
            closeModal();
        }
    }
    ...
```

---

# Full example

```javascript
    ...

    function closeModal(e){
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        focustedElementBeforeModal.focus();
    }
    ...
```

---

# The inert attribute

* The `inert` attribute is now supported by all modern browsers
* This attribute removes user events from an element and hides it from screen readers
* Very useful for modals: make the rest of the page `inert`
* We also have native **dialog** and **popover** elements

```html
<div>
  <button>I am not inert</button>
</div>
<div inert>
  <button>I am inert</button>
</div>
```

---

# Tree

* There is no `tree` element in the HTML specification.
* We will use the following ARIA attributes:
    * `role=tree`
    * `role=treeitem`
    * `aria-expanded=true/false`
* And add some JavaScript

---

# Tree

```html
<ul role="tree">
    <li role="treeitem" aria-expanded="true"> ... </li>
    <li role="treeitem" aria-expanded="false"> ... </li>
</ul>
```

---

# Alerts

* An alert is
    * an area that is dynamically updated
    * that must be read automatically as soon as it changes.
* For this, we will use *aria-live regions*

---

# Alerts

* We must add the *alert* role to our HTML element
* Adding this role turns it into an *aria-live region*

```html
<section role="alert"> Here is the message </section>
```

---

# Alerts

* Give your users time to see/hear the content
    * Avoid alerts that disappear quickly.
    * Or wait for the speech synthesizer to read it
    * Or set up an acknowledgement system

---

# Alerts

* For compatibility reasons, the region must not be added dynamically.

```html
<section role="alert"></section>
<button>Submit</button>
```

---

# Alerts

```javascript
document.querySelector('button').addEventListener('click', () => {
    const alert = document.querySelector("[role='alert']")
    alert.innerHTML = "here is my content"
});
```

---

# Alerts

* Two types of regions:
    * `assertive` (default value)
    * `polite`

```html
<section role="alert" aria-live="assertive"></section>
<section role="alert" aria-live="polite"></section>
```

---

# Videos

* Video transcripts must be provided

```html
<video class="span12 readable" poster="your-video-poster.jpg" controls title="My Movie">
  <source src="your-video.m4v" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
  <source src="your-video.ogg" type='application/ogg' />
  <source src="your-video.webm" type='video/webm' />
  <track src="your-video-transcript.vtt" label="English Captions" kind="subtitles" srclang="en-us" default />
</video>
```

---

# Videos

* Several formats are available:
    * VTT
    * TTML
    * SRT

---

# Videos - VTT

```
WEBVTT

1
00:00:09.000 --> 00:00:11.000
<b>Alice:</b> Curiouser and curiouser.

2
00:00:17.000 --> 00:00:18.000
<b>Rabbit:</b> I told you she was the right Alice!

3
00:00:19.000 --> 00:00:20.000
<b>Mouse:</b> I am not convinced.
```

---

# Videos - TTML

```
<tt xmlns="http://www.w3.org/ns/ttml" xml:lang="en">
  <body>
    <div>
      <p begin="00:00:9.00" end="00:00:11.00">
        Alice: Curiouser and curiouser.
      </p>
      <p begin="00:00:17:00" end="00:00:18:00">
        Rabbit: I told you she was the right Alice!
      </p>
    </div>
  </body>
</tt>
```

---

# Audio and Video

* Video
    * Provide captions
    * Provide transcripts
    * Include a sign language version

* Audio
    * Provide transcripts
    * Include a sign language version

---
layout: cover
---

# Workshop

Workshop 7: accessible modal dialog
