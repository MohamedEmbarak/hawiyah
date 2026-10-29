# Modify and extend Nasaq

Choose the narrowest extension point that solves the product need. Theme values change appearance; documented variants change a component presentation; blocks compose reusable controls; new primitives are added when the interaction itself is reusable.

## Change appearance through tokens

The theme contract uses `data-nq-theme`, `data-nq-mode`, `data-nq-density`, and `--nq-` variables. Find the actual semantic variable in the token source, then override it in an application-owned stylesheet loaded after Nasaq. Keep overrides scoped to the intended theme or application container. Avoid editing generated output.

The default appearance is `dga`, using verified foundation values from the supplied **2026-10-29** snapshot. Select `data-nq-theme="nasaq"` explicitly for the teal/ivory identity. Use `custom` for application-owned overrides, and record any departure from the mapped reference that affects an alignment claim. [The reference record](dga-reference.md) identifies the source boundary; a custom theme is not certified by inheriting these tokens.

Treat a semantic token as a relationship: a surface color must be evaluated with its text, border, focus, hover, disabled, and error colors. Changing one accent does not establish that the resulting theme passes contrast checks. Recheck light/dark and RTL/LTR configurations relevant to the product.

For example, an application can define a scoped light theme:

```css
[data-nq-theme="custom"][data-nq-mode="light"] {
  --nq-color-primary: #005b56;
  --nq-color-primary-hover: #004b47;
  --nq-color-primary-active: #003b38;
  --nq-color-on-primary: #ffffff;
  --nq-radius-md: 0.75rem;
}
```

These are illustrative application overrides, not official DGA token values. Inspect `packages/tokens/tokens.json` for the complete source and `packages/tokens/src/index.ts` for the typed helper:

```ts
import { createThemeVariables } from '@nasaq/tokens';

const variables = createThemeVariables(
  { '--nq-radius-md': '0.75rem' },
  { theme: 'custom', mode: 'light', density: 'comfortable' },
);
```

The helper returns a plain variable map; the application decides where to apply it. `custom` starts from the DGA default; explicit `nasaq` uses its own palette and font/radius/spacing/content metrics. Control densities remain shared across both themes; see the [migration sizes](dga-reference.md#migrating-an-existing-nasaq-application) before adopting the updated defaults. Inspect the selected base values as well as the overrides when checking a custom theme. Token changes should be made in the source and regenerated with `pnpm --filter @nasaq/tokens generate`, not by editing generated CSS.

## Use documented variants

Button appearance is expressed through the shared class and attributes:

```html
<button type="button" class="nq-button"
        data-variant="secondary" data-size="sm">
  Save draft
</button>
```

The initial button variants are `primary`, `secondary`, `ghost`, and `danger`; sizes are `sm`, `md`, and `lg`. Use the framework adapter's documented props when rendering with that framework. Do not infer that an attribute is supported by an adapter without checking its public API.

Native `disabled`, validation semantics, and supported ARIA/state attributes describe behavior. Do not replace them with a cosmetic class. If an icon-only button is appropriate, provide an accessible name.

## Compose a product block

The application owns this service-card composition:

```html
<article class="nq-card">
  <div class="nq-card-body">
    <span class="nq-badge" data-tone="info">Online service</span>
    <h2>Update a request</h2>
    <p>Review the requirements before changing your application.</p>
    <a class="nq-button" data-variant="secondary" href="/services/update">
      View requirements
    </a>
  </div>
</article>
```

Keep product copy, routes, authorization, data fetching, and business validation in the block or application. A reusable Card does not need to understand a government service domain. Copy an example block into the consuming application when its structure needs frequent local changes.

Start from the [existing editable blocks](../blocks/README.md), or run:

```sh
pnpm new:component request-summary
```

This creates `blocks/request-summary/index.html`, `styles.css`, and `README.md`, and refuses to overwrite an existing directory. It creates an application block, not a package export, library primitive, framework adapter, or automatic catalog entry. Change placeholder copy and connect application behavior before using it. Review future upstream updates against your copied version.

## Add a component

1. Define the user task, semantic HTML, public states, and keyboard/focus behavior. Check whether composition already solves it.
2. Add a catalog entry with a truthful status and a short contract. Identify the shared CSS and any reusable core behavior.
3. Implement the vanilla reference with explicit lifecycle cleanup where JavaScript is necessary.
4. Add native framework adapters using the shared behavior and styles. Preserve the framework's rendering, state, and form conventions.
5. Supply examples for default, disabled, error, loading, empty, and direction-sensitive states where applicable.
6. Test meaningful behavior, package imports, and the task in a real browser. Add manual accessibility evidence where automation is insufficient.
7. Update documentation, coverage, and compatibility notes. Mark a component verified only for the tested scope.

## Preserve accessibility during customization

Keep visible labels connected to controls, help and error text discoverable, focus visible, keyboard order logical, and status messages understandable. A custom trigger must retain its interaction semantics. A visual rearrangement must not make the DOM reading order misleading. Preserve reduced-motion preferences and check long translated text, zoom, and narrow layouts.

## Keep changes compatible

Prefer an additive variant or a new block when existing behavior can remain intact. A renamed export, removed prop, changed event meaning, changed required markup, or altered documented token is a public API change. Record the effect on all adapters and provide a migration path before releasing it. Do not promise that arbitrary private selector overrides will survive an internal rewrite.

Switching the default appearance from the earlier Nasaq palette to the mapped DGA foundation is a visual migration even when component exports remain unchanged. Explicitly select the intended theme in existing applications, review source-derived spacing and typography changes, and repeat relevant contrast, reflow, focus and state checks. Keep behavior and calendar-value contracts independent from the appearance change.

## AI-assisted workflow

Give the assistant the desired task, framework, locale, direction, theme, data states, and constraints. Ask it to inspect actual exports and an existing example before editing. A useful request is:

> Build a request-review block using the existing Nasaq components in this application. Use Arabic with RTL layout, show loading and validation states, keep business data outside the primitives, and preserve keyboard behavior. Inspect the component catalog and actual adapter APIs first. Report any component you need to add and verify the affected flow.

The assistant should extend source files and tests through public contracts, not patch generated `dist` files or invent package exports. `llms.txt` and `components.json` help navigation; they do not replace reading the implementation.
