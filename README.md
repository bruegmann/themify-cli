# Themify

CLI that helps you to add Bootstrap CSS and customize it.

## Install

```
npm i -g themify-cli
```

## Get help

Run this to see all available commands and options:

```
themify help
```

## Blue Web

Run this to create a custom theme CSS file locally:

```
themify blue-web -o my-theme.css
```

Some prompts will guide you through the process.

## `compile` command

`compile` is the base command. For most cases you should use one of the other commands above instead.

### Usage

When your project not already has a full Bootstrap CSS file, run this to add one:

```
themify compile --output bootstrap.min.css --full
```

### Add theme

Choose one of the styles

```
themify compile -o variables.min.css -s new-york
```

### Custom variables

Create a file with custom Sass variables:

```scss
// my-vars.scss
$primary: yellow;
```

Then run this:

```
themify compile -o variables.min.css -s new-york --import-before my-vars.scss
```

To override CSS variables, you set a file that should be imported after Bootstrap:

```css
/* my-css-vars.css */
.btn-primary {
    --bs-btn-color: blue !important;
}
```

```
themify compile -o variables.min.css -s new-york --import-before my-vars.scss --import-after my-css-vars.css
```
