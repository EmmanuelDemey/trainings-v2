# TP 1 — Screen readers

> Install a screen reader, learn its few essential shortcuts, and browse the web the way a blind user does.

**Duration**: 45 min (1 h if NVDA has to be installed first) · **Chapter**: 2 — Introduction to accessibility

## Goal

Chapter 2 — Every workshop after this one ends with *"test it with a screen
reader"*. This one makes sure you have one installed, and that you can use it
well enough to tell a good page from a broken one.

There is no code in this workshop, and nothing to run `verify` on.

## Setup

Depending on your operating system, you may have to install one:

- **Windows**: install [NVDA](https://www.nvaccess.org/download/), free and
  open source. Windows also ships *Narrator* (Ctrl + Win + Enter), but NVDA is
  the one most screen reader users run, with JAWS. No admin rights? The
  installer offers to **continue running** NVDA without installing it.
- **macOS**: VoiceOver is already there. Turn it on and off with
  **Cmd + F5** (Fn + Cmd + F5 on some laptop keyboards). Use Safari with it: it
  is the pair Apple tests. In Safari, open *Settings → Advanced* and tick
  *Press Tab to highlight each item on a webpage*: without it, Tab skips the
  links.
- **Linux**: install **Orca** from your package manager
  (`sudo apt install orca`, `sudo dnf install orca`…), and turn it on with
  **Super + Alt + S** in GNOME.

Use headphones if you are in a room with other people, and turn the speech rate
down at first. Users run it much faster than you will.

## Steps

### 1. Learn the essential shortcuts

**NVDA (Windows)** — the *NVDA key* is **Insert** (or Caps Lock, if you chose it):

| Keys | What it does |
|---|---|
| NVDA + Down arrow (laptop layout: NVDA + A) | read everything from here |
| Ctrl | stop speaking |
| NVDA + Space | switch between browse mode and focus (forms) mode |
| H / Shift + H | next / previous heading |
| 1 to 6 | next heading of that level |
| K | next link |
| F | next form field |
| D | next landmark |
| T | next table |
| NVDA + F7 | the elements list: headings, links, landmarks |

**VoiceOver (macOS)** — **VO** is **Ctrl + Option**:

| Keys | What it does |
|---|---|
| VO + A | read everything |
| Ctrl | stop speaking |
| VO + arrows | move from element to element |
| VO + U | the rotor: lists of headings, links, landmarks, form controls (arrows to change list) |
| VO + Cmd + H / VO + Cmd + L / VO + Cmd + J | next heading / link / form control |
| VO + Q | single-key Quick Nav on / off: then H, L, J, T jump like NVDA's H, K, F, T |
| VO + Space | activate the current element |
| VO + Shift + Down / Up | interact with / stop interacting with a group (a table, a web area) |

**Orca (Linux)** — the *Orca key* is **Insert** (desktop layout) or Caps Lock
(laptop layout):

| Keys | What it does |
|---|---|
| Numpad + (laptop layout: Orca + ;) | read everything |
| H / K / F / T / M | next heading / link / form field / table / landmark |
| Alt + Shift + H (or K, F…) | the list of headings (links, form fields…) |
| Orca + A | switch browse mode and focus mode |
| Orca + H | learn mode: press keys to hear what they do, F2 lists the shortcuts, Esc leaves |

In every one of them, **Tab** still moves from focusable element to focusable
element, exactly as without a screen reader.

### 2. Browse a few sites

1. Pick two or three sites you know well: your own app, a news site, a public
   service site.
2. On each one, **do not use the mouse**. Find the main heading, then list all
   the headings (H, or the rotor / elements list). Can you understand how the
   page is organised from its headings alone?
3. Jump from link to link (K). Are all of them meaningful out of context, or do
   you hear *"Read more, Read more, Click here"*?
4. Jump from landmark to landmark (D in NVDA, M in Orca, the rotor in
   VoiceOver). Is there a *navigation*, a
   *main*, a *banner*?
5. Find an image. What is announced: a description, a file name, nothing?

### 3. Fill in a form with your eyes closed

Pick a sign-up or contact form and fill it in **with your eyes closed**, or with
the screen turned off.

- Is each field announced with its label?
- Do you know which fields are required?
- Submit it with a mistake. Do you hear the error? Do you know which field it
  is about, and how to fix it?

### 4. Write down what was hard

Keep a short list of what stopped you or slowed you down. You will meet most of
those problems again in the next workshops, and fix them.

## Checking your work

Nothing automated. You are done when, with your screen reader on, you can:

- read a whole page, and stop the speech;
- list the headings of a page and jump to one;
- jump from link to link and from form field to form field;
- fill in and submit a simple form without looking;
- name three things that made a site hard to use.

## Troubleshooting

**Problem**: the letters (H, K…) type into a field instead of jumping
→ You are in focus (forms) mode. Press **Esc**, or NVDA + Space / Orca + A, to
go back to browse mode.

**Problem**: H, K, F do nothing with VoiceOver
→ Single-key Quick Nav is off. Turn it on with **VO + Q**, or use the rotor
(VO + U).

**Problem**: Tab skips the links in Safari
→ *Settings → Advanced → Press Tab to highlight each item on a webpage*, or
use Option + Tab.

**Problem**: Cmd + F5 does nothing on a Mac laptop
→ The F keys act as media keys: press **Fn + Cmd + F5**, or triple-press
Touch ID.

**Problem**: the NVDA key does not work (remote desktop, virtual machine)
→ Insert is often captured by the remote session. Choose Caps Lock as NVDA key
(*NVDA menu → Preferences → Settings → Keyboard*), or run NVDA on your own
machine.

**Problem**: the speech is too fast or too slow
→ NVDA: **NVDA + Ctrl + Left / Right** picks a voice setting (*Rate*),
**NVDA + Ctrl + Up / Down** changes it. VoiceOver: the same with **VO + Cmd**.
Orca: Orca + Space, *Voice* tab.

## Going further

- Try the same page with a **second** screen reader, or on a phone (VoiceOver
  on iOS, TalkBack on Android): the gestures are different, and so is the
  experience.
- Turn on the screen magnifier of your OS (Windows Magnifier, macOS Zoom) at
  400 % and browse the same sites. What disappears off screen?
- Open the **Accessibility** pane of the browser devtools (Chrome: *Elements →
  Accessibility*; Firefox: *Accessibility* tab) and compare what it shows with
  what your screen reader says.

## Useful links

- [Assistive Tech — VoiceOver](https://youtu.be/5R-6WvAihms)
- [Assistive Tech — NVDA](https://youtu.be/Jao3s_CwdRU)
- [NVDA user guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver user guide for Mac](https://support.apple.com/guide/voiceover/welcome/mac)
- [Orca help](https://help.gnome.org/users/orca/stable/)
- [WebAIM — Using NVDA to evaluate web accessibility](https://webaim.org/articles/nvda/)
- [WebAIM — Using VoiceOver to evaluate web accessibility](https://webaim.org/articles/voiceover/)
