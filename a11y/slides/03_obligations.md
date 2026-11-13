---
layout: cover
---


# Obligations

---

# Standards

* International: WCAG
* France: RGAA
* United Kingdom: BS 8878 (superseded by ISO 30071-1)
* Belgium: AnySurfer
* Luxembourg: Renow
* Switzerland: eCH-0059

---


# Directive européenne 2016/2102 (EU Web Accessibility Directive)

* Adopted on **26 October 2016** by the European Parliament
* Requires public sector websites and mobile applications to be accessible
* Based on the **EN 301 549** standard (which references WCAG 2.1 level AA)
* Phased compliance deadlines:
  - New websites: September 2019
  - Existing websites: September 2020
  - Mobile applications: June 2021

**Source**: [Directive EU 2016/2102](https://eur-lex.europa.eu/eli/dir/2016/2102/oj)

---

# Legal obligations

* The European directive has been transposed into national laws:
    * **Public Sector Bodies Accessibility Regulations 2018** (UK)
    * **Décret du 24 juillet 2019** (France, decree no. 2019-768)
    * Each EU member state has its own transposition

---

# Legal obligations

* The public sector includes:
    * Regional, national and local authorities
    * Any organisation receiving public funding

---


# RGAA 4.1 - The French standard

* **RGAA**: Référentiel Général d'Amélioration de l'Accessibilité (general accessibility improvement framework)
* Current version: **RGAA 4.1** (February 2021)
* French technical method to check WCAG 2.1 level AA compliance
* **106 criteria** organised into 13 themes
* Directly aligned with WCAG 2.1 level AA + French specifics

**Source**: [Official RGAA 4.1](https://accessibilite.numerique.gouv.fr/)

---

# RGAA 4.1 - The 13 themes

1. Images
2. Frames
3. Colours
4. Multimedia
5. Tables
6. Links
7. Scripts
8. Mandatory elements
9. Information structure
10. Information presentation
11. Forms
12. Navigation
13. Consultation

---

# In France - Public sector

* Following the decree of 24 July 2019, mandatory for:
  - Public administrations
  - Local authorities
  - Public institutions
* **Possible penalties**: fine of up to **€20,000 per year**

**Source**: [Décret n° 2019-768](https://www.legifrance.gouv.fr/eli/decret/2019/7/24/CPAE1913344D/jo/texte)

---

# In France - Private sector

* Extended to the private sector since 2019
* Applies to **companies with a turnover above €250 million**
* Applies to online communication services
* Same level of requirement: RGAA 4.1 compliance (WCAG 2.1 AA)

---

# In France - Mandatory documents

Besides the technical fixes, 3 documents are mandatory:

1. **Déclaration d'accessibilité** (accessibility statement)
   - Compliance level (non-compliant, partially compliant, fully compliant)
   - Test results
   - Justification of non-compliances

2. **Schéma pluriannuel** (multi-year plan, 3 years)
   - Accessibility strategy

3. **Plans d'action annuels** (annual action plans)
   - Concrete actions derived from the multi-year plan

**Source**: [RGAA legal obligations](https://accessibilite.numerique.gouv.fr/obligations/)

---

# Acronyms

* W3C (World Wide Web Consortium)
* WAI (Web Accessibility Initiative)
* WCAG (Web Content Accessibility Guidelines)
* ATAG (Authoring Tool Accessibility Guidelines)
* UAAG (User Agent Accessibility Guidelines)

---

# Acronyms - W3C

* World Wide Web Consortium
    * International community
    * Develops Web standards
    * Led by the inventor of the Web: Tim Berners-Lee

---


# Acronyms - WCAG

* The W3C publishes the WCAG
* Web Content Accessibility Guidelines
* The latest published version is **WCAG 2.2** (October 2023)
* Has several conformance levels: A, AA and AAA
* **WCAG 3.0** is under development
* *ISO 40500* and European standard *EN 301 549*

**Sources**:
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C WAI News](https://www.w3.org/WAI/news/) - To stay up to date

**Note**: WCAG 2.2 remains the current legal reference; WCAG 3.0 will introduce new criteria.

---


# Acronyms - WCAG

* 4 principles
* content must be:
    * *perceivable*
    * *operable*
    * *understandable*
    * *robust*

---

# WCAG history

* **WCAG 1.0** (1999): first version
* **WCAG 2.0** (2008): major overhaul, became ISO 40500
* **WCAG 2.1** (2018): 17 criteria added (mobile, low vision, cognitive)
* **WCAG 2.2** (2023): 9 new criteria added (and 4.1.1 Parsing removed)
  - Focus Not Obscured (2.4.11, 2.4.12)
  - Focus Appearance (2.4.13)
  - Dragging Movements (2.5.7)
  - Target Size (Minimum) (2.5.8)
  - Consistent Help (3.2.6)
  - Redundant Entry (3.3.7)
  - Accessible Authentication (3.3.8, 3.3.9)

**Source**: [W3C WCAG History](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

# WCAG 2.2 - Structure

* **4 principles** (POUR)
* **13 guidelines**
* **86 testable success criteria**
* **3 conformance levels**: A, AA and AAA

---

# WCAG conformance levels

## Level A (Minimum)

* **31 essential baseline criteria**
* Without them, some users cannot access the content at all
* Example: every image must have a text alternative

---

# WCAG conformance levels

## Level AA (Required)

* **24 additional criteria** (55 in total with A)
* This is the **legally required level** in most countries
* Example: minimum contrast ratio of 4.5:1 for normal text

---

# WCAG conformance levels

## Level AAA (Excellence)

* **31 additional criteria** (86 in total)
* The highest conformance level
* Recommended but **not always achievable** for all content
* Example: 7:1 contrast ratio, sign language for videos

**Source**: [Understanding Levels of Conformance](https://www.w3.org/WAI/WCAG22/Understanding/conformance#levels)

---
layout: statement
---

<blockquote>
Picture accessibility compliance levels as mountains. The first peak to reach is AA. This includes both A and AA
criteria. Behind it, in the mist, there is a larger peak, AAA. That one is not always completely reachable.

<p>Marie Guillaumet</p>
</blockquote>


---


# Current state

* Most websites are not accessible because:
    * it is not a priority for the project
    * people think it brings no added value
    * few people have the knowledge.

---


# Who is involved

* Accessibility is not only a technical issue
* Everyone must be made aware
    * Product Manager, Product Owner, Scrum Master
    * UX / UI
    * Developers
    * Content Designers
    * QA

---


# The most common mistakes

* Interactive elements
* DOM order
* Text alternatives
* Skip links
* Styling of focusable elements

---
layout: statement
---

<blockquote>
Imagine the needs of disabled people as a rainbow. Each type of disability has specific needs.
But together, all the accessibility adjustments create a cohesive whole. Accessibility guidelines
and success criteria help ensure we forget nothing.

<p>Marie Guillaumet</p>
</blockquote>

---

# Court cases - Domino's Pizza (USA)

* **2019**: the US Supreme Court declined to hear Domino's appeal, leaving the Ninth Circuit ruling in place
* Lawsuit filed by a blind user
* Inaccessible website and mobile app
* Impossible to order online with a screen reader
* **Cost**: legal fees + complete website overhaul
* Key precedent: the ADA applies to websites and apps tied to physical "places of public accommodation"

**Source**: [Robles v. Domino's Pizza](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/18-1539.html)

---

# Court cases - Beyoncé (USA)

* **2019**: lawsuit against the parkwood-ent.com website
* Beyoncé's merchandising website not ADA-compliant
* Images without text alternatives
* Impossible to navigate with the keyboard
* **Out-of-court settlement** + website brought into compliance

**Source**: [Billboard Article](https://www.billboard.com/business/legal/beyonce-sued-website-violating-americans-disabilities-act-8490493/)

---

# Court cases - France

* **2020**: formal notices sent to several French ministries
* Failure to meet RGAA obligations
* No accessibility statement
* **Areva**: convicted in 2011 (a first in France)
* Many administrations are still working towards compliance

**Source**: [Baromètre accessibilité numérique](https://accessibilite.numerique.gouv.fr/ressources/barometre-annuel/)

---

# Success Story - GOV.UK

* UK government website
* **Redesigned in 2012** with accessibility as the #1 priority
* WCAG 2.1 level AA compliance
* **Results**:
  - 60% fewer support calls
  - User satisfaction up from 62% to 85%
  - "Design of the Year" award 2013
  - Estimated savings: £60-80M per year

**Source**: [GOV.UK Accessibility Blog](https://accessibility.blog.gov.uk/)

---

# Success Story - Microsoft

* Accessibility programme since the 2000s
* **Xbox Adaptive Controller** (2018): adapted controller
* Automatic captions in Teams
* Narrator (screen reader) built into Windows
* **Impact**:
  - Wider market (1 billion people with disabilities)
  - Positive brand image
  - Technological innovation that benefits everyone

**Source**: [Microsoft Accessibility](https://www.microsoft.com/en-us/accessibility)

---

# Success Story - BBC

* Strict accessibility standards since 2010
* **BBC iPlayer**: 100% accessible
* Testing with disabled users at every iteration
* **ROI**:
  - +20% wider audience
  - Better SEO (improved Google rankings)
  - More maintainable and faster code
  - Lower support costs

**Source**: [BBC Accessibility Guidelines](https://www.bbc.co.uk/accessibility/forproducts/)

---

# ROI of accessibility

## Measurable benefits

* **Wider market**: 16% of the world population (1+ billion)
* **Spending power**: €6.9 trillion worldwide
* **SEO**: +30% organic visibility on average
* **Performance**: accessible sites = faster sites
* **Maintenance**: -40% costs thanks to semantic code
* **Image**: positive competitive differentiation

**Sources**:
- [WHO Disability Report](https://www.who.int/teams/noncommunicable-diseases/sensory-functions-disability-and-rehabilitation/world-report-on-disability)
- [Return on Disability Group](https://www.rod-group.com/)

---

# Calculating the ROI of accessibility

## Investment

- **Initial audit**: 1-2 weeks
- **Team training**: 1-2 days
- **Implementation**: 5-10% of development time
- **Continuous testing**: built into QA

## Returns

- **Audience**: +16% (1+ billion people)
- **SEO**: +30% organic visibility
- **Support**: -40% complaints
- **Legal protection**: avoid lawsuits (average cost: €50K-500K)
- **Reputation**: positive public relations

**Use these figures to pitch accessibility to your management!**

---
layout: cover
---

# Workshop 2

Manual audit
