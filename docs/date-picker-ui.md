# Date picker presentation

The compact DatePicker combines an editable text field with an inset calendar icon,
a 24rem maximum-width modal, and a green animated rectangular Gregorian/Hijri
switch. Arabic is the default; labels remain localized while all digits use 0–9.
The idle field displays the active calendar, and focus exposes the Gregorian ISO
draft for typing. Submitted values remain ISO.

The panel reserves six week rows with noninteractive blank presentation rows when
needed. Switching calendars and navigating shorter months preserves panel height
and position. The 44px minimum day height remains; seven fluid columns fit narrow
screens, which does not imply 44px-wide targets at every viewport.

A small muted information icon beside the Hijri month heading reveals the pinned
provider's date range on hover or keyboard focus. It has no click-to-toggle behavior.
Escape dismisses the tooltip without closing the dialog. Visible input validation
continues to explain unsupported dates. ISO endpoints are isolated from RTL prose.

The inset icon uses the pinned MIT Hugeicons calendar asset listed in provenance.
Arrow masks mirror in RTL. Motion uses shared tokens, and reduced motion removes
the switch transition. Original and custom themes continue to provide their colors.

Framework adapters own their DOM. Public hw classes and variables remain stable.
The pinned Umm al-Qura provider, range, calculations and keyboard date navigation
are unchanged. See [date-input.md](date-input.md) for draft/submission behavior.

These screenshot-driven changes are Hawiyah usability decisions, not extracted DGA
calendar dimensions or a claim of official certification. Hajj remains excluded.
