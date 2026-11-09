# Editable application blocks

These small HTML compositions use maintained Nasaq primitives. Copy them into
your application and change content/layout there; keep the semantic roles and
documented behavior hooks. These files are application-owned after copying.
Source version: Nasaq 0.2.0. Later updates require review against your changes.

- `service-card.html`: service discovery metadata and a meaningful action.
- `application-section.html`: conditional form section with native validation.
- `request-timeline.html`: readable progress and explicit next action.

Complete interactive examples live in `apps/playground/src/main.ts` and
`examples/{react,angular,vue}`. Authentication, persistence, search and upload
storage belong to the consuming application. All demo data is fictional.

Generate a new block with `pnpm new:component your-block-name`.
