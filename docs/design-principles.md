# Design principles

Nasaq — نسق is an independent implementation for useful, coherent products. Its default appearance follows verified DGA Platforms Code foundation values from the supplied snapshot exported on **2026-10-29**. Extensions and application compositions remain separately documented; sharing a foundation does not establish full official component parity.

The optional **Woven Rhythm** identity uses teal/ivory surfaces through `data-nq-theme="nasaq"`. The Arabic-only **نسق** wordmark remains the project's identity under either theme. Its outlined **Aref Ruqaa Bold** lettering needs no runtime font; loader artwork animates the same lettering. Interface text uses **IBM Plex Sans Arabic and IBM Plex Sans**. The [brand decision](../brand/decision.json) and [brand guide](../brand/index.html) hold the artwork rules. Preserve the wordmark's orientation in RTL; mirror directional interface cues only when their meaning calls for it.

## One visual language, several contexts

The default `dga` theme should remain coherent across a small form, a dense workspace, and a public service page. Typography, spacing, surfaces, color and hierarchy should follow the mapped foundation evidence. Choose `nasaq` explicitly for the teal/ivory treatment. Custom branding uses documented token overrides rather than edits scattered across components, and records deviations from the reference when an alignment claim depends on them.

## Arabic belongs in the foundation

Design and test with real Arabic and English copy. Direction is independent from locale: an Arabic interface can contain an LTR account identifier, and an English interface can display Arabic names. Use logical spacing, preserve meaningful icon direction, isolate mixed-direction identifiers where appropriate, and avoid assumptions about numeral or calendar preferences.

## Make state understandable

Every action needs a clear result. Forms need labels, help, validation, and a path to correction. Long-running work needs progress or an honest waiting state. Lists need useful empty and error states. Destructive actions need an appropriate confirmation and recovery path. Color is never the sole carrier of meaning.

## Prefer native semantics

Use buttons for actions, links for navigation, inputs for data entry, tables for tabular information, and headings for structure. Native behavior is the starting point. Add custom interaction only when its benefit justifies the keyboard, focus, screen-reader, and maintenance work it creates.

## Composition keeps the system adaptable

A component solves a reusable interaction. A block combines components for a task. A journey connects tasks and owns application data. These layers can evolve independently: a request-review block should not require a new version of every input component.

Layout primitives express familiar composition choices: stack content, place items inline, define a grid, or add a sidebar. Native input types, visual variants, and specialist integrations stay clearly identified; adding aliases must not inflate the component count. New components need a useful responsibility and a documented boundary.

## Accessibility remains a design requirement

The project target is WCAG 2.2 AA. Contrast, focus visibility, keyboard operation, accessible names, reflow, reduced motion, and zoom behavior influence design choices from the start. Automated checks support manual evaluation; a passing tool result alone is not an accessibility audit.

## Improve through real journeys

Demonstrate more than isolated controls. Service discovery should lead to requirements, an application, correction, review, and confirmation. Request management should explain status, filters, next actions, and missing data. Examples use fictional information and clearly distinguish simulated behavior from integrated services.

## Keep customization legible

Prefer a small number of meaningful variants and semantic tokens over a large collection of unrelated flags. Public parts, state attributes, and extension recipes should be easy to find. A coding assistant should be able to follow an example without guessing private internals.

## Be precise about alignment

Track a requirement's source, scope, and validation separately from a design preference. New layouts, components, and themes are welcome. Their inclusion does not imply DGA approval. See [alignment](alignment.md) for the evidence model.

The [supplied-source record](dga-reference.md) covers 17 decoded files and identifies six transfer-blocked files, mixed imported component versions, and the missing standalone web component library. Export dates identify snapshots, not official release versions. A prototype action with a missing destination or unspecified timing is not a basis for claiming an official animation; retain keyboard and reduced-motion equivalents when implementing verified transitions.
