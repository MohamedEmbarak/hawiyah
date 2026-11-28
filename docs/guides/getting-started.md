# Getting started

Hawiyah is used in four ways: with plain JavaScript through `@hawiyah/styles` and `@hawiyah/vanilla`, or with the React, Vue or Angular adapter. Every way shares one stylesheet, and the application supplies the language, the direction and all text.

## Packages and versions

Each way needs two packages: `@hawiyah/styles`, which holds the stylesheet, and one adapter.

Table: The packages of each way of use

| Way | Adapter package | Peer dependencies |
| --- | --- | --- |
| JavaScript | `@hawiyah/vanilla` | None. |
| React | `@hawiyah/react` | React 19 and React DOM 19. |
| Vue | `@hawiyah/vue` | Vue 3.5 or a later 3.x release. |
| Angular | `@hawiyah/angular` | Angular 22 (`@angular/common`, `@angular/core` and `@angular/forms`) and RxJS 7.8 or a later 7.x release. |

The seven packages share one version, and the current version is 0.3.0. It is published under the dist-tag next, so a command that names no version or tag installs the release that the dist-tag latest points to, which is an older one. The install command printed in the READMEs of the packages names no version and therefore installs that older release. Install both packages with the package manager of the project at the exact version 0.3.0 written after each package name; a dist-tag is not used, because the tag next moves to the next release. The install section of the home page of the guide generates the command of each package manager from the pinned version, and this page does not repeat it.

The packages are pre-1.0 releases, so a minor version may still change an API. Every adapter depends on `@hawiyah/core` at the same version, so installing the adapter installs it; install it directly only when application code imports its helpers.

## Stylesheet

The stylesheet is imported once, at the entry point of the application. It is a single flat file, and nothing imports it implicitly. The reset and the fonts that the tokens name are separate opt-in files: `@hawiyah/styles/fonts.css` loads the fonts and is never part of the stylesheet.

```js title="src/main.js"
import '@hawiyah/styles/styles.css';
import { enhance } from '@hawiyah/vanilla';

enhance(document.querySelector('#application'));
```

`enhance()` of `@hawiyah/vanilla` upgrades the semantic markup inside the element it receives and returns a function that undoes the enhancement; an application that removes the subtree calls that function first. The JavaScript path assumes a bundler, such as Vite, that resolves package imports. A page without a bundler can link the built stylesheet file of `@hawiyah/styles` directly, and the directory of that file is served as it is, with its assets directory, because fonts and icons are referenced relative to the file.

```tsx title="src/main.tsx"
import '@hawiyah/styles/styles.css';
import { Button } from '@hawiyah/react';
```

```ts title="src/main.ts"
import { createApp } from 'vue';
import App from './App.vue';
import '@hawiyah/styles/styles.css';

createApp(App).mount('#app');
```

The Angular application loads the stylesheet once in the file src/styles.css with an import rule for `@hawiyah/styles/styles.css`, and imports the standalone components and directives it uses from `@hawiyah/angular`, for example `HwButtonDirective`. The READMEs of the packages show the import in an example component and name no entry point, and the Angular README names no file; the files of this section are the placement of the guide, and any placement that loads the stylesheet once works.

## Language and direction

The application sets `lang` and `dir` on the document or on a subtree, and the two are independent: a page in English can contain an Arabic region, and the reverse. The packages never read the document language to choose text or direction.

```html title="index.html"
<html lang="en" dir="ltr">
  <body>
    <div id="application">…</div>
    <section lang="ar" dir="rtl">…</section>
  </body>
</html>
```

The packaged styles use logical properties, so a component follows the computed direction of the element it stands in. Where the application already knows the reading order, it sets an explicit `dir`, because engines without CSS scope apply the decorative geometry of an automatic boundary in the left-to-right direction. Theme, mode and density are the HTML attributes `data-hw-theme`, `data-hw-mode` and `data-hw-density` on an ancestor, and they do not depend on the language.

## Reset

The reset is opt-in. `@hawiyah/styles/styles.css` does not apply a global reset; a new application that owns its base styling imports `@hawiyah/styles/reset.css` as well, in the same place.

```js title="src/main.js"
import '@hawiyah/styles/styles.css';
// Optional, only when the application wants the reset:
import '@hawiyah/styles/reset.css';
```

## Text from the application

The packages contain no built-in strings, no translations and no default locale. Every word that a component places on its own elements, such as accessible names, labels of internal controls, headings and status or validation messages, is a prop, an input, an option or an attribute written by the application. The primary content, such as the label of a button, is the element content or data.

A text needed only with a feature is required with that feature. A text that depends on data is a function whose name starts with get and ends in Label or Message in the adapters, which receives the data and returns the whole string; the component adds no words or punctuation. A component that formats a date or a number, or sorts text, takes a locale from the application and does not fall back to the locale of the browser.

In `@hawiyah/vanilla`, a text is read from the authored markup first, then from the option of the controller, then from a `data-hw-*` attribute on the controller root. A function input is read from a template attribute named without get, for example `data-hw-page-label` for the function input of the page label, and three options replace an authored inner name when they are passed explicitly: the clear label of `createSearchField`, the show label of `createPasswordField` and the brand label of `createPortalHeader`. When a required text is missing, the component renders nothing in its place and warns once during development.

## Example

The example is a [Button](../components/button.md) with a visible label, written in each of the four ways. The label names the action. The `html` block writes `type="button"`, because the browser default of a button in a form is submit; `Button` and `hwButton` write the type `button` unless another type is given.

```html live example=continue
<button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>
```

```tsx live example=continue
<Button variant="primary">Continue</Button>
```

```vue live example=continue
<Button variant="primary">Continue</Button>
```

```ts live example=continue framework=angular
template: `<button hwButton variant="primary">Continue</button>`
```

The four results are the same element. The `html` block needs no script, because a native button works without `@hawiyah/vanilla`; `enhance()` matters for the components that have a controller. React, Vue and Angular own their elements and render the button themselves, and no vanilla controller is mounted into their trees. The component pages state the full API of each component, starting with [Button](../components/button.md).
