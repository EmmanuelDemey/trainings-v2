## PW1 - Getting Started

Afin de finaliser cette mise en pratique, voici quelques liens qui pourraient être utiles :

* https://fr.reactjs.org/[React]
* https://create-react-app.dev/[create-react-app]
* https://bulma.io/[Bulma]


Dans ce TP, nous allons tout d'abord initialiser un projet React via le module `create-react-app`.

Dans votre terminal, veuillez exécuter les commandes suivantes :

```shell
npm install -g create-react-app
create-react-app training --template typescript
```

Une fois le projet créé, vous pouvez exécuter les commandes suivantes afin de vérifier qu'il est bien fonctionnel.

```shell
cd training
npm run start
```

Nous allons ensuite installer la librairie CSS `Bulma`, nous permettant de nous aider lors de la création du style de notre application.
Pour cela, vous devez exécuter la commande suivante :

```shell
npm install bulma
```

Une fois installée, vous devez l'importer dans votre application. Nous avons l'habitude de faire ce genre d'import au plus haut niveau de l'application. Donc par exemple dans le fichier `src/index.tsx`.

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bulma/css/bulma.css";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

Nous allons ensuite intégrer le *layout* de base de la librairie Bulma. Modifiez tout d'abord le contenu du fichier `public/index.html` avec le contenu suivante :

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello Bulma!</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Nous allons terminer par la modification du fichier `src/App.tsx`.

```typescript
import "./App.css";

function App() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Hello World</h1>
        <p className="subtitle">
          My first website with <strong>Bulma</strong>!
        </p>
      </div>
    </section>
  );
}

export default App;
```

Vous pouvez également générer la version de production et émuler le fonctionnement d'un serveur web.

```shell
npm run build
cd build
npx serve
```
