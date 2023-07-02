---
layout: cover
---

# Les composants

---

# Structure d'une application React

* Une application est composée de composants React
* Ces composants vont formés un arbre de composants
* A chaque fois qu'un composant est "modifié", lui et ces enfants seront regénérés
* Algorithme de mise à jour se basant sur un Virtual DOM
* Optimisation possible (memoization).
* Vous pouvez utiliser une extention **React DevTools** afin de pouvoir debugger votre arbre de composants

---

# Virtual DOM

* Le Virtual DOM est une représentation en mémoire du DOM
* Une fois la méthode du composant exécuté, un Virtual DOM est créé
* Ce nouveau Virtual DOM est comparé avec le précédent
* A partir de cette comparaison, React va déterminé les manipulations du DOM nécessaires

---

# Les composants

* Un composant peut etre
    * `stateless`
    * `statefull`
* Nous pouvons les définir
    * via des fonctions
    * via des classes.

---

# Les composants

* Un composant pourra accepter des paramètres, que nous nommons `props`.
* Si un `props` change, le composant sera regéné

---

# Les composants

* Définition d'un composant en utilisant une `fonction`.

```javascript
// <Title content={'Content Title'} />
type TitleProps = {
    content: string
};

const Title = ( props: TitleProps ) => {
    return <h1> { props.content } </h1>
}
export default Title;
```

---

# Les composants

* Destructuration des `props` avant la génération du rendu.

```javascript
// <Title content={'Content Title'} />
type TitleProps = {
    content: string
};

const Title = ( { content }: TitleProps ) => {
    return <h1> { content } </h1>
}

export default Title;
```

---

# Les composants

* Définition d'un composant en utilisant une `class`.
* Les classes étaient plutôt utilisées pour les composants stateful (avant l'apparition des `hooks`)

```javascript
import { Component } from 'react';

// <Title content={'Content Title'} />
type TitleProps = {
    content: string
};

class Title extends Component<TitleProps> {
    render(){
        return <h1> { this.props.content } </h1>
    }
}

export default Title;
```

---

# Les composants

* Destructuration des `props` avant la génération du rendu.

```javascript
import { Component } from 'react';

// <Title content={'Content Title'} />
type TitleProps = {
    content: string
};

class Title extends Component<TitleProps> {
    render(){
        const { content } = this.props;
        return <h1> { content } </h1>
    }
}

export default Title;
```

---

# Les props

* Nous avons la possibilité de définir un arbre d'éléments. Il sera accessible via la `props` `children`.

```javascript
// <Title>Content Title</Title>
type TitleProps = {
    children: React.ReactNode
};

const Title = ( { children }: TitleProps ) => {
    return <h1> { children } </h1>
}
export default Title;
```

---

# Render props

* Il est possible de définir un `children` comme une fonction
* Ceci permet de recevoir de la donnée depuis le composant parent.
* N'est plus trop recommandé. Il est préférable d'utiliser le `Context` et les `hooks`
* Attention aux espaces !

---

# Les props

* Si nous souhaitons étre notifié lors d'une action d'un composant enfant, nous allons passer des fonctions
en `props` à notre composant.

```javascript
//<ValidationButton action={() => { alert('validated)}} />
type ValidationButtonProps = {
    action: (event: Event) => void 
};

const ValidationButton = ({action}: ValidationButtonProps) => {
    return <button className="btn" onClick={action}>Validate</button>;
}
export default ValidationButton;
```

---

# Les appels de fonction

* Nous pouvons définir des fonctions qui seront appelées suite à l'interaction de l'utilisateur

```javascript
const CollapsiblePanel = () =>{
    const togglePanel = () => alert("togglePanel");

    return (
        <section>
            <header>
                <button onClick={togglePanel}>
                    Panel
                </button>
            </header>
            <div>Content</div>
        </section>
    )
}
export default CollapsiblePanel;
```

---

# Les composants - Bonnes pratiques

* Nous évitons d'écrire des composants usine à gaz
* Trop de `props` complexifiera la maintenabilité du composant
* Nous préférons suivre l'architecture atomique (atome, molécule, organisme, ... page)

---

# Composant statefull

* Avant de présenter les *hook*, un composant statefull ne pouvait étre défini que via une classe.
* Pour modifier l'état du composant, nous devons appeler la méthode `setState`.
* A chaque fois que le `state` est modifié, le composant est regénéré.

---

# Composant statefull

* Elle accepte deux signatures :
    * un objet partiel permettant de faire la mise à jour.
    * une fonction qui retourne un objet partiel

---

# Higher Order Component

* Un HoC est juste le fait d'appeler une méthode qui :
    * prend en paramètre un composant
    * retourne ce composant avec des fonctionnalités supplémentaires.

```javascript
const withTranslation = Component => EnhancedComponent;
// withTranslation(UserCard)
```

---

# Higher Order Component

```javascript
// const AppWithPreference = withPreferences(App)
function withPreferences(WrappedComponent) {
  return () => {
    const preferences = localStorage.getItem('preferences');
    return <WrappedComponent preferences={preferences} {...this.props} />;
  };
}
```

---

# Structure du projet

* Deux structures de projets sont possibles
* Découpage technique

```
/src
    /components
    /utils
```

---

# Structure du projet

* Découpage métier (puis éventuellement technique)

```javascript
/src
    /feature-1
        /components
        /utils
    /feature-2
        /components
    /shared
        /components
```

---

# Structure complète

* Les feuilles de style et les tests unitaires se situent dans le même repertoire.

```
/src
    /feature-1
        /components
            /menu
                /menu.js
                /style.css
                /menu.spec.js
```

---

# PropTypes et valeur par défaut

* De manière similaire, nous pouvons définir des valeurs par défaut.

```javascript
import PropTypes from 'prop-types';

const Title = ({content}) => <h1>{content}</h1>;

Title.propTypes = {
  content: PropTypes.string
};
Title.defaultProps = {
    content: 'Default Title';
}
export default Title;
```

---

# PropTypes et valeur par défaut

* Pour des raisons de performance, vous devez éviter de définir la valeur par défaut directement dans la signature de la méthode

```javascript
import PropTypes from 'prop-types';

const Title = ({content = 'Default Title'})
                    => <h1>{content}</h1>;

export default Title;
```

---

# ComponentProps

* React propose un type avancé permettant de récupérer dynamiquement le type des *props* d'un élément HTML ou composant React. 

```typescript
import { ComponentProps } from "react";
import { Button } from "some-external-library";

type MyButtonProps = ComponentProps<typeof Button>;

type MyDivProps = ComponentProps<"div"> & {
  myProp: string;
};
const MyDiv = ({ myProp, ...props }: MyDivProps) => {
  console.log(myProp!);
  return <div {...props} />;
};
```

---

include::./includes/06_css.adoc[]

