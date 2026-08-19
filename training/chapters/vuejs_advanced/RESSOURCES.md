# Vue.js Avancé — ressources

## Socle

- Lire — https://vuejs.org/guide/introduction.html
- Lire — https://github.com/vuejs/rfcs
- Lire — https://blog.vuejs.org
- Lire — https://router.vuejs.org
- Lire — https://pinia.vuejs.org
- Lire — https://vite.dev/guide/

## 1. Fondamentaux & réactivité

- Lire — https://vuejs.org/guide/extras/reactivity-in-depth.html
- Lire — https://vuejs.org/guide/extras/rendering-mechanism.html
- Lire — https://vuejs.org/guide/typescript/composition-api.html
- Lire — https://github.com/vuejs/core/tree/main/packages/reactivity/src
- Regarder — https://www.vuemastery.com/courses (💰 — "Vue 3 Deep Dive with Evan You")

## 2. Composants avancés

- Lire — https://vuejs.org/guide/components/async.html
- Lire — https://vuejs.org/guide/built-ins/suspense.html
- Lire — https://vuejs.org/guide/components/slots.html
- Lire — https://vuejs.org/guide/best-practices/performance.html
- Lire — https://github.com/tailwindlabs/headlessui
- Lire — https://github.com/unovue/reka-ui
- Regarder — https://antfu.me/talks

## 2bis. Render functions & JSX

- Lire — https://vuejs.org/guide/extras/render-function.html
- Lire — https://vuejs.org/api/render-function.html
- Lire — https://vuejs.org/guide/extras/rendering-mechanism.html
- Lire — https://github.com/vuejs/babel-plugin-jsx
- Lire — https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx
- Lire — https://github.com/vuejs/core/blob/main/packages/runtime-core/src/h.ts
- Essayer — https://play.vuejs.org (onglet « Compiled » pour lire le render généré)

## 2ter. Transition & TransitionGroup

- Lire — https://vuejs.org/guide/built-ins/transition.html
- Lire — https://vuejs.org/guide/built-ins/transition-group.html
- Lire — https://vuejs.org/api/built-in-components.html#transition
- Lire — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Lire — https://web.dev/articles/animations-guide (ce qui coûte cher au navigateur)
- Lire — https://aerotwist.com/blog/flip-your-animations/ (la technique FLIP)
- Lire — https://motion.dev/docs (piloter les hooks JS)
- Lire — https://gsap.com/docs/v3/
- Essayer — https://play.vuejs.org (tester une transition sans monter un projet)

## 3. Composables & directives

- Lire — https://vuejs.org/guide/reusability/composables.html
- Lire — https://vuejs.org/guide/reusability/custom-directives.html
- Lire — https://vueuse.org
- Lire — https://github.com/vueuse/vueuse/tree/main/packages/core
- Lire — https://michaelnthiessen.com
- Lire — https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Écouter — https://deja-vue.io

## 3bis. Plugins

- Lire — https://vuejs.org/guide/reusability/plugins.html
- Lire — https://vuejs.org/api/application.html
- Lire — https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties
- Lire — https://github.com/vuejs/router/blob/main/packages/router/src/router.ts (`install`)
- Lire — https://github.com/vuejs/pinia/blob/v3/packages/pinia/src/createPinia.ts
- Lire — https://github.com/vuejs/devtools/tree/main/packages/devtools-api
- Lire — https://vite.dev/guide/build.html#library-mode

## 4. Tests — fondamentaux

- Lire — https://vuejs.org/guide/scaling-up/testing.html
- Lire — https://test-utils.vuejs.org
- Lire — https://vitest.dev/guide/
- Lire — https://testing-library.com/docs/vue-testing-library/intro/
- Lire — https://kentcdodds.com/blog/testing-implementation-details
- Lire — https://kentcdodds.com/blog/write-tests
- Lire — https://github.com/tc39/proposal-explicit-resource-management
- Lire — https://lachlan-miller.me
- Écouter — https://frontendfirst.fm

## 5. Vue Router

- Lire — https://router.vuejs.org/guide/advanced/navigation-guards.html
- Lire — https://router.vuejs.org/guide/advanced/transitions.html
- Lire — https://router.vuejs.org/guide/advanced/scroll-behavior.html
- Lire — https://github.com/vuejs/router
- Lire — https://github.com/posva/unplugin-vue-router
- Lire — https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- Lire — https://developer.chrome.com/docs/web-platform/view-transitions/

## 5bis. Écosystème unplugin-*

- Lire — https://unplugin.unjs.io
- Lire — https://github.com/unjs/unplugin
- Lire — https://uvr.esm.is
- Lire — https://uvr.esm.is/guide/file-based-routing.html
- Lire — https://uvr.esm.is/guide/extending-routes.html
- Lire — https://uvr.esm.is/guide/typescript.html
- Lire — https://github.com/vuejs/router (uvr y a été fusionné)
- Lire — https://github.com/unplugin/unplugin-auto-import
- Lire — https://github.com/unjs/unimport (le moteur derrière auto-import)
- Lire — https://github.com/unplugin/unplugin-vue-components
- Lire — https://github.com/unplugin/unplugin-vue-components/tree/main/src/core/resolvers
- Lire — https://github.com/antfu-collective/vitesse (les trois plugins en situation)
- Lire — https://nuxt.com/docs/guide/concepts/auto-imports (la même idée, intégrée)
- Regarder — https://antfu.me/talks

## 6. Pinia

- Lire — https://pinia.vuejs.org/core-concepts/plugins.html
- Lire — https://pinia.vuejs.org/cookbook/composing-stores.html
- Lire — https://pinia.vuejs.org/cookbook/testing.html
- Lire — https://pinia.vuejs.org/cookbook/hot-module-replacement.html
- Lire — https://github.com/vuejs/pinia/tree/v3/packages/pinia/src
- Lire — https://github.com/prazdevs/pinia-plugin-persistedstate
- Lire — https://pinia-colada.esm.dev/guide/queries.html
- Lire — https://pinia-colada.esm.dev/guide/query-invalidation.html
- Lire — https://tanstack.com/query/latest/docs/framework/vue/overview
- Lire — https://uvr.esm.is/data-loaders/

## 7. Formulaires & validation

- Lire — https://zod.dev
- Lire — https://zod.dev/v4 (nouveautés, `treeifyError`, `prettifyError`)
- Lire — https://vee-validate.logaretm.com/v4/
- Lire — https://vee-validate.logaretm.com/v4/guide/composition-api/typed-schema/
- Lire — https://vee-validate.logaretm.com/v4/examples/array-fields/
- Lire — https://github.com/standard-schema/standard-schema
- Lire — https://www.w3.org/WAI/tutorials/forms/
- Lire — https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
- Lire — https://adamsilver.io/blog/ (design de formulaires)
- Lire — https://valibot.dev (l'alternative légère à Zod)

## 8. Tests — intégration & e2e

- Lire — https://test-utils.vuejs.org/guide/advanced/vue-router.html
- Lire — https://pinia.vuejs.org/cookbook/testing.html
- Lire — https://mswjs.io/docs/
- Lire — https://docs.cypress.io/app/core-concepts/best-practices
- Lire — https://docs.cypress.io/api/commands/session
- Lire — https://docs.cypress.io/api/commands/intercept
- Lire — https://github.com/cypress-io/github-action

## 9. Production & déploiement

- Lire — https://vite.dev/config/build-options.html
- Lire — https://vite.dev/guide/env-and-mode.html
- Lire — https://rollupjs.org/configuration-options/#output-manualchunks
- Lire — https://web.dev/articles/vitals
- Lire — https://web.dev/articles/strict-csp
- Lire — https://addyosmani.com/blog/
- Lire — https://docs.netlify.com
- Lire — https://vercel.com/docs
- Lire — https://github.com/btd/rollup-plugin-visualizer
- Lire — https://github.com/ai/size-limit
- Lire — https://github.com/GoogleChrome/lighthouse-ci
- Regarder — https://www.youtube.com/@ChromeDevs
- Écouter — https://syntax.fm

## Veille

- Lire — https://news.vuejs.org
- Lire — https://bytes.dev
- Lire — https://frontendfoc.us
- Regarder — https://vuejs.amsterdam
- Regarder — https://vueconf.us
- Regarder — https://nuxt.com/blog (Nuxt Nation, replays)
- Regarder — https://vueschool.io/courses (💰)
- Écouter — https://webrush.io
- Écouter — https://podrocket.logrocket.com
- Écouter — https://ifttd.io (FR)
- Écouter — https://artisandeveloppeur.fr (FR)

---

# Certification Vue.js (certificates.dev)

Mid-Level : 135 min = 30 QCM + 105 min de code · réussite = **25/30 au QCM (83 %)**
\+ 1 development challenge + 1 bug challenge · doc Vue accessible pendant l'examen ·
Composition ou Options API au choix · JS ou TS au choix.

## Logistique & retours d'expérience

- Lire — https://certificates.dev/vuejs
- Lire — https://support.certificates.dev/category/63-vuejs-certification
- Lire — https://support.certificates.dev/article/62-what-are-the-pass-requirements-for-the-certified-vue-js-developer-exam
- Lire — https://medium.com/@aletorres1102/vue-school-certification-my-experience-tips-and-final-thoughts-aa5e7a55f2cf
- Regarder — https://certificates.dev/vuejs/free-weekend
- Regarder — https://vueschool.io/courses (💰 — partenaire officiel de la certification)

## Au programme de la certification, absent de cette formation

### Options API

La formation est 100 % Composition API ; le QCM peut porter sur les deux.

- Lire — https://vuejs.org/api/options-state.html
- Lire — https://vuejs.org/api/options-lifecycle.html
- Lire — https://vuejs.org/guide/extras/composition-api-faq.html

### Syntaxe de template & bindings

- Lire — https://vuejs.org/guide/essentials/template-syntax.html
- Lire — https://vuejs.org/guide/essentials/class-and-style.html
- Lire — https://vuejs.org/guide/essentials/conditional.html
- Lire — https://vuejs.org/guide/essentials/list.html
- Lire — https://vuejs.org/api/built-in-directives.html

### Événements & liaisons de formulaire

Le chapitre 7 couvre la validation et l'accessibilité ; les bases de `v-model`
sur chaque type de contrôle restent à réviser.

- Lire — https://vuejs.org/guide/essentials/event-handling.html
- Lire — https://vuejs.org/guide/essentials/forms.html

### Composants — bases non couvertes

- Lire — https://vuejs.org/guide/essentials/component-basics.html
- Lire — https://vuejs.org/guide/components/registration.html
- Lire — https://vuejs.org/guide/components/attrs.html
- Lire — https://vuejs.org/guide/components/props.html
- Lire — https://vuejs.org/guide/components/events.html
- Lire — https://vuejs.org/guide/components/v-model.html

### Composants intégrés

- Lire — https://vuejs.org/guide/built-ins/transition.html
- Lire — https://vuejs.org/guide/built-ins/transition-group.html
- Lire — https://vuejs.org/guide/built-ins/teleport.html
- Lire — https://vuejs.org/guide/built-ins/keep-alive.html

### Écosystème

Le module « Vue.js Ecosystem » de la formation officielle cite encore **Vuex**, et
ajoute **Nuxt** — deux sujets hors périmètre de cette formation.

- Lire — https://vuex.vuejs.org
- Lire — https://nuxt.com/docs/getting-started/introduction
- Lire — https://vuejs.org/guide/scaling-up/tooling.html

### Debugging (le « bug challenge »)

- Lire — https://github.com/vuejs/devtools
- Lire — https://vuejs.org/error-reference/
- Lire — https://vuejs.org/api/application.html (`app.config.errorHandler`, `warnHandler`)

### Référence complète

À parcourir en entier une fois : c'est le périmètre exact du QCM.

- Lire — https://vuejs.org/api/
