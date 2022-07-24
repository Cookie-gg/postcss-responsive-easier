# postcss-responsive-easier

PostCSS plugin that makes it easier to write responsive styles.

## Install

```bash
npm i -D postcss @cookie_gg/postcss-responsive-easier
# or
yarn add -D postcss @cookie_gg/postcss-responsive-easier
```

## Usage

You have to use this plugin with [postcss-nested](https://github.com/postcss/postcss-nested) and set it after postcss-responsive-easier.

```js:postcss.config.js
module.exports = {
  ...
  plugins: [
    // other plugins...
    ['@cookie_gg/postcss-responsive-easier', {
        skip: '*',
        breakpoints: ['1000px', '750px'],
      }
    ],
    ['postcss-nested']
  ]
  ...
}
```

```css:style.css
/* before */
h1 {
  font-size: 50px | 25px | 30px;
}

/* after */
@media (min-width: 1001px) {
  h1 {
    font-size: 50px;
  }
}
@media (min-width: 751px) and (max-width: 1000px) {
  h1 {
    font-size: 25px;
  }
}
@media (max-width: 750px) {
  h1 {
    font-size: 30px;
  }
}
```

## Options

**breakpoints: `Array<String>`**

> default: `['1000px', '750px']`

Provide a custom set of breakpoints

**skip: `String`**

> default: '\*'

Define the skip syntax used to ignore portions of the shorthand.

## Experimental

> this is an experimental feature, so it will become reasons of error

You can use responsive separator `|` in calc, var, rgb and rgba.

```css:global.css
:root {
  --spacing-s: 15px;
  --spacing-m: 25px;
  --spacing-l: 35px;
}
```

```css:style.css
/* before */
h1 {
  font-size: calc((50px | 25px | 30px) * (2 | 3 | 4));
  padding: var((--spacing-s | --spacing-m | --spacing-l));
}

/* after */
@media (min-width: 1001px) {
  h1 {
    font-size: calc(50px * 2);
    padding: var(--spacing-s);
  }
}
@media (min-width: 751px) and (max-width: 1000px) {
  h1 {
    font-size: calc(25px * 3);
    padding: var(--spacing-m);
  }
}
@media (max-width: 750px) {
  h1 {
    font-size: calc(30px * 4);
    padding: var(--spacing-l);
  }
}
```
