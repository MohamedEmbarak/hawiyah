# Mobile switch geometry

Opt into the mobile profile with `data-nq-density="mobile"` on an application
or subtree, or `createThemeVariables({}, { density: 'mobile' })`. All four native
adapters use the same `nq-switch` styles. At a 16 px root font size:

| Geometry | Comfortable / compact | Mobile |
| --- | --- | --- |
| Track | 44×26 px | 52×32 px |
| Thumb | 18×18 px | 28×28 px |
| Outer-edge thumb inset | 4 px | 2 px |
| Thumb travel | 18 px | 20 px |

Comfortable and compact preserve their previous placement exactly. A nested
comfortable/compact density resets the switch geometry even inside a mobile
scope. Theme and color-mode boundaries do not reset density. Existing DGA/custom
200 ms and original Nasaq 180 ms motion, semantic colors and shadows remain;
reduced motion removes the transition. Forced colors retains native appearance
with the decorative thumb hidden. Native checkbox/switch semantics, names,
disabled behavior and keyboard focus remain owned by each framework or the
browser. The source's visual 32 px track height is not a claim of a 44 px touch
target; applications should retain a comfortably sized associated label.

## Source mapping

These are decoded properties from **Mobile Components - Platforms Code
(Community).fig**, reused from the existing local extraction. No additional
prototype playback or pixel-parity assessment is claimed.

| Local source node | Observed geometry |
| --- | --- |
| Set `5403:403565`; default LTR off `5403:403566` | 52×32 component |
| Track `5403:403567`; thumb `5403:403568` | Track 52×32; thumb 28×28 at x2/y2 |
| Default LTR on `5403:403570`; thumb `5403:403572` | Thumb at x22/y2 |
| Default RTL on `5403:403575`; thumb `5403:403577` | Thumb at x2/y2 |
| Default RTL off `5403:403580`; thumb `5403:403582` | Thumb at x22/y2 |

All 12 local Default/Pressed/Disabled variants under this set are 52×32.
Their local symbol versions are `10980:63665` through `10980:63676`; these
identifiers are not official library release numbers. The internal hover cache
`5403:403584` is **48×24**, with older symbol version `10303:28773`. That cache is
excluded from this geometry mapping. Fill/radius references on local nodes still
include imported variables; this task maps explicit geometry and retains Nasaq's
existing theme colors and focus treatment.

## Scoped geometry tokens

The density profiles define these additive variables:

- `--nq-switch-width`
- `--nq-switch-height`
- `--nq-switch-thumb-size`
- `--nq-switch-thumb-offset`
- `--nq-switch-thumb-offset-checked`

The offset tokens are CSS inset values **inside the existing 1 px border**.
For mobile they are `calc(0.125rem - 1px)` and `calc(1.375rem - 1px)`, yielding
outer positions 2 and 22 px at the standard root size. Rem-based dimensions scale
with the root font size. Logical inline offsets mirror RTL/LTR automatically.
Customize related geometry together when overriding these tokens, and keep the
thumb inside the track in both states. No public class or existing token changed
name; no official assets were added. Hajj remains outside this mapping.
