<h1 align="center">
  StaticPages
</h1>
<h3 align="center">
  Plugin that creates static HTML files from React templates
</h3>
<p align="center">
  <a href="https://github.com/lavireo/staticpages-webpack-plugin/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="staticpages-webpack-plugin is released under the MIT license." />
  </a>
  <a href="https://www.npmjs.org/package/staticpages-webpack-plugin">
    <img src="https://img.shields.io/npm/v/staticpages-webpack-plugin" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/staticpages-webpack-plugin?minimal=true">
    <img src="https://img.shields.io/npm/dm/staticpages-webpack-plugin.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://npmcharts.com/compare/staticpages-webpack-plugin?minimal=true">
    <img src="https://img.shields.io/npm/dt/staticpages-webpack-plugin.svg" alt="Total downloads on npm." />
  </a>
</p>

## Install

Using npm:

```
npm i --save-dev staticpages-webpack-plugin
```

Using yarn:

```
yarn add -D staticpages-webpack-plugin
```

This is a webpack plugin that simplifies creation of HTML files to serve your webpack bundles. This is especially useful for webpack bundles that include a hash in the filename which changes every compilation.

## Zero Config

The `staticpages-webpack-plugin` works without configuration.

## Usage

StaticPages will generate a static html file for each entry in `src/pages` that can then be served by your webserver.

#### webpack.config.js

```js
const StaticPagesWebpackPlugin = require('staticpages-webpack-plugin')

module.exports = {
  entry: 'index.js',
  output: {
    path:     __dirname + '/dist',
    filename: 'app.js'
  },
  plugins: [
    new StaticPagesWebpackPlugin()
  ]
}
```

#### src/pages/index.jsx

```jsx
export default (props) => (
  <h1>Hello World</h1>
);
```

Will generate ``dist/index.html`` with the following content

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
</head>
<body>
  <div id="app">
    <h1>Hello World</h1>
  </div>
  <script src="app.js"></script>
</body>
</html>
```

## Options

## Properties

## Contributors

This project exists thanks to all the people who contribute.  
You're free to contribute to this project by submitting [issues](https://github.com/lavireo/staticpages-webpack-plugin/issues) and/or [pull requests](https://github.com/lavireo/staticpages-webpack-plugin/pulls).

## License

Licensed under the [MIT License](https://github.com/lavireo/staticpages-webpack-plugin/blob/master/LICENSE).