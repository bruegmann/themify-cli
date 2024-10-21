# Themify

CLI that helps you to add Bootstrap CSS and customize it.

## Usage

When your project not already has a full Bootstrap CSS file, run this to add one:

```
npx themify compile --output bootstrap.min.css --full
```

## Add theme

Choose one of the styles

```
npx themify compile -o variables.min.css -s new-york
```

## Custom variables

Create a file with custom Sass variables:

```scss
// my-vars.scss
$primary: yellow;
```

Then run this:

```
npx themify compile -o variables.min.css -s new-york --import-before my-vars.scss
```

To override CSS variables, you set a file that should be imported after Bootstrap:

```css
/* my-css-vars.css */
.btn-primary {
    --bs-btn-color: blue !important;
}
```

```
npx themify compile -o variables.min.css -s new-york --import-before my-vars.scss --import-after my-css-vars.css
```

## Get help

Run this to see all available options for the `compile` command:

```
npx themify help compile
```
