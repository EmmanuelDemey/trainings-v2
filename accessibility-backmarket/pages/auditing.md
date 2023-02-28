---
layout: cover
---

# Auditing

---

# Manual evaluation

* Tools are not able to find all **quality** issues
    * accessibility
    * UX
    * Performance

* You need manual evaluation in order to be sure your application is 

* Add **Is the feature fully accessible?** in your definition of done

* Work people with disabilities during the build of the application
    
---

# Automatic evaluation

* We will talk about tools
    * tools usable via the browser
        * W3C Validators
        * Axe
        * Lighthouse
    * tools usable in your CI
        * ESLint
        * Pally
        * Testing Library
        * Playwright
        
---

# W3C Validators

* A valid HTML code is an HTML code following the semantic of the language
* A good HTML foundation is a good start for an accessible application.

![W3C Validator screenshot](/images/w3cvalidator.png)

---

# Axe

* Browser extension developed by the **Deque** company
* Usable via the terminal also

![Axe extension screenshot](https://arctouch.com/wp-content/uploads/2022/08/axe-devtools-accessibility-chrome-extension.png)

---

# Lighthouse

* Available on all Chromium-based browser
* Usable via the terminal
* Define multiple checks categories
    * performance
    * accessibility
    * best practices
    * seo
* The **Accessibility** category is based on **Axe**

--- 

# Lighthouse

![Lighthouse screenshot](https://f.hellowork.com/bdmtools/2019/12/google-Lighthouse-report.png)

--- 

# Linting

* The **ESLint** exosystem provide a dedicated plugin for detected accessibility issues on a Vue.js application 

```
npm i -D eslint-plugin-vuejs-accessibility
```

* You need to enable the plugin 

```json
{
  "plugins": ["vuejs-accessibility"]
}
```

* And finally enable specific rules or activated the recommanded ones

```json
{
  "rules": {
    "vuejs-accessibility/rule-name": "error"
  }
  //"extends": ["plugin:vuejs-accessibility/recommended"]
}
```

--- 

# Pally

* Another tool usable programmatically or on the terminal in order to audit a webpage

```javascript
//pa11y https://example.com/

const pa11y = require('pa11y');

pa11y('https://example.com/').then((results) => {
    /*
    {
        documentTitle: 'The title of the page that was tested',
        pageUrl: 'The URL that Pa11y was run against',
        issues: [
            {
                code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
                context: '<a href="https://example.com/"><img src="example.jpg" alt=""/></a>',
                message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
                selector: 'html > body > p:nth-child(1) > a',
                type: 'error',
                typeCode: 1
            }
        ]
    }
    */
});
```

---

# Testing Library

* **Testing Library** well known utility package for testing React.js applicaiton
* Usable also with other frameworks like Vue.js
* Provide utility methods in order to interact with HTML elements by their roles
    * *ByRole
    * *ByLabelText
* Good practice in order to be sure that your HTML is semantic

```shell
npm i -D @testing-library/vue
```

---

# Testing Library

```javascript
import {render, fireEvent} from '@testing-library/vue'
import Component from './Component.vue'

test('properly handles v-model', async () => {
  const {getByLabelText, getByText} = render(Component)

  const usernameInput = getByLabelText(/username/i)

  await fireEvent.update(usernameInput, 'Bob')

  getByText('Hi, my name is Bob')
})
```

---

# Playwright

* Solution used to write end-to-end tests
* Provide a package in order to run accessibility checks on tested pages

```shell
npm i -D @axe-core/playwrite 
```

```javascript 
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // 1

test('should not have any automatically detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('https://your-site.com/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

# Other tools

* Web Developer extension
* Tota11y
* WAVE
* Color Contrast / Tanaguru
* Aviewer
* Validator HTML/CSS
* Andy 
* Voiceover.js

---
layout: cover
---

# PW Add ESLint, Testing Library and Playwright on your project
