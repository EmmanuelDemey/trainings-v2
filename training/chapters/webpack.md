# Webpack

* Webpack est un *Bundler*
* Permet d'optimiser notre application en appliquant plusieurs traitements
  * Concaténation des modules
  * Minification
  * Transpilation
  * Gestion des feuilles de styles
  * Treeshaking
  * ...

---

# Webpack

```javascript
module.exports = {
  entry: './src/index.js'
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'})
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
```
---

# Webpack

* La configuration Webpack n'est pas visible par défaut
* Possibilité de l'extraire via la commande `npm eject`
* Surchargeable si nous utilisons le module `react-app-rewired`

