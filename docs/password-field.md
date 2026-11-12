# Password visibility

PasswordField defaults to an integrated eye toggle at the logical end of the
input. The concealed state offers the application's `showLabel`; the revealed
state offers its `hideLabel` with a slashed eye. Both texts are required in
every adapter; the component has no wording of its own. The decorative 24px mask follows the text
color, including forced colors. It does not mirror in RTL. The input retains its
comfortable/compact/mobile density height; space reserved inside the input keeps
the password text clear of the toggle.

All adapters accept `toggleVariant: 'icon' | 'text'`, defaulting to `icon`.
React uses `toggleVariant="text"`; Vue accepts `toggle-variant="text"`; Angular
accepts `toggleVariant="text"`. Vanilla accepts the option on
`createPasswordField`, or `data-hw-toggle-variant="text"` on the picker root or
toggle. The text variant shows the same texts visibly and may wrap or grow as
needed. `showLabel` and `hideLabel` remain the accessible action names in
both variants; the toggle also exposes `aria-pressed` and `aria-controls`.

Use a shared wrapper for vanilla markup:

```html
<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="account-password">كلمة المرور</label>
  <div class="hw-password-control">
    <input class="hw-input" id="account-password" name="password"
      type="password" autocomplete="current-password" data-hw-password-input>
    <button class="hw-button" type="button" data-hw-password-toggle
      data-hw-show-label="إظهار كلمة المرور"
      data-hw-hide-label="إخفاء كلمة المرور">إظهار كلمة المرور</button>
  </div>
</div>
```

The vanilla enhancer preserves caller-owned structure and restores the original
button contents/attributes and input type on destruction. Legacy separate-input
markup continues to work; use `.hw-password-control` for integrated positioning.
Each framework renders its own input and button without the vanilla enhancer.

Customize the artwork through scoped CSS masks, without changing accessible
labels or component DOM:

```css
.account-form {
  --hw-password-show-icon: url('/icons/reveal.svg');
  --hw-password-hide-icon: url('/icons/conceal.svg');
  --hw-password-icon-size: 1.5rem;
}
```

Visibility changes preserve the input node, value, form submission and current
button focus. Read-only passwords can still be revealed because visibility does
not edit their value. Disabled inputs, including those inside disabled fieldsets,
cannot be toggled. A native form reset conceals the value in every adapter and
reports `false` once when it was visible. Paste and password-manager behavior
remain native.

Visibility is the state `visible` in every adapter:

- React: `visible`, `defaultVisible` and `onVisibleChange(visible)`.
- Vue: `v-model:visible` (`visible`, `defaultVisible`, `update:visible`).
- Angular: `[(visible)]` (`visible` and `(visibleChange)`); a value written by
  Angular Forms does not change visibility.
- Vanilla: `createPasswordField` returns `visible`, `toggle()` and `destroy()`,
  takes `onVisibleChange(visible)`, and `hw:change` carries `{ visible }`.

The two unchanged SVGs, `view.svg` and `view-off-slash.svg`, come from the same
pinned [MIT-licensed Hugeicons commit](https://github.com/hugeicons/hugeicons/tree/35c0b0b6ca286617b581e3383e5cbe2232ddb7d6)
as the existing curated assets. Their hashes and individual source URLs are in
`packages/styles/src/assets/icons/provenance.json`; the full MIT notice remains
alongside them. These additions have no claimed DGA node comparison or visual
parity and are not redistributed Figma exports.
