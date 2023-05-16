---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# use UnoCSS
css: unocss
---

# React

---

# Plan

--- 

# Hooks

---

# useState

---

# useEffect

---

# useMemo

---

# useCallback 

---

# Composants avancés

---

# Render Props

---

# HOC

---

# Redux

---

# Redux Toolkit

---

# createSelector 

* la méthode `createSelector`est une méthode définie dans le module `reselect`
* Elle permet de créer un sélecteur d'une partie du state tout en gardant en mémoire le résultat de calculs réalisés précédemment. 

```javascript
const selectNumCompletedTodos = createSelector(
  (state) => state.todos,
  (todos) => todos.filter((todo) => todo.completed).length
)

export const CompletedTodosCounter = () => {
  const numCompletedTodos = useSelector(selectNumCompletedTodos)
  return <div>{numCompletedTodos}</div>
}
```
