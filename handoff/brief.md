# Hawiyah: rebuild the guide on the published packages

## Goal
Rebuild the Hawiyah guide (https://mohamedembarak.github.io/hawiyah/) so that every page is an honest render of the published npm packages. That covers the landing page, component pages, templates, layouts and brand pages. Do not reimplement the current guide; rethink it: brief pages, live usage, full references in Markdown, a redesigned editor and a new animated landing page.

## Working mode
- This is a large, multi-phase task. Use a multi-agent workflow: parallel subagents for audits and per-component work, and separate reviewer agents that verify independently. Give reviewers the code, not your conclusions.
- Use the most capable model at the highest effort for architecture, design and final review. Use cheaper agents only for mechanical bulk work.
- Stop at each decision gate below and wait for my choice. Do not build past a gate on assumptions.
- Push back when a requirement conflicts with another one or with what the packages can do, and say what you would do instead.

## Repository and current state
- Repo: MohamedEmbarak/hawiyah. pnpm monorepo, Node 24, pnpm 11.25.0. Read AGENTS.md, README.md, CONTRACT.md, EXPANSION.md, llms.txt and docs/ first.
- Packages are published on npm at 0.2.1, all on the same version: @hawiyah/tokens, styles, core, vanilla, react, vue, angular.
- The current guide is apps/playground, a hand-written vanilla TypeScript + Vite app. It uses the packages through `workspace:*`. Its live editor runs preview runtimes built from local sources (apps/playground/src/generated/*, scripts/build-project-previews.mjs). So today the guide does not prove that the published packages work.
- 83 Playwright specs in tests/browser target the current guide.
- GitHub Pages deploys the guide from main (.github/workflows/pages.yml, base path /hawiyah/). Tag pushes run .github/workflows/publish.yml, which already requests an id-token for npm trusted publishing.

## Requirements

### 1. Honest render
- Build the new guide as an Angular application using @hawiyah/angular, @hawiyah/styles and @hawiyah/tokens. Install them from the npm registry at a pinned published version: no workspace links, aliases or copied source.
- If the guide needs something the packages cannot do, treat it as a package gap: fix it in the package with tests, release it, then use it. No guide-only CSS or behavior that imitates a component.
- Add a CI check that fails if any @hawiyah/* package resolves from somewhere other than the registry, or at a version other than the pinned one.
- Prerender the routes for GitHub Pages, so deep links work under /hawiyah/.
- Propose how to preview unreleased package work without weakening this rule for the deployed guide, for example a clearly labelled preview build from local tarballs. Releases will become frequent, so also propose moving npm publishing to trusted publishing from GitHub Actions instead of seven manual 2FA approvals per release.
- The live editor also runs the published packages, in all four frameworks (JavaScript, React, Vue, Angular). Every framework shows the same example for a given component.

### 2. Revise every component and page
- Audit every component in all four adapters, against the DGA Platforms Code and against each other: API parity, behavior, RTL/LTR, keyboard, accessibility and visual parity.
- Report the gaps with evidence (file, line, screenshot) before fixing anything.
- Audit every guide page and template the same way.

### 3. Content model: brief pages, full references in Markdown
- No repeated text. Each fact lives in exactly one place.
- Each component page is a brief: one or two sentences, the live example, and an interactive editor showing real usage.
- Each component gets its own Markdown file (for example docs/components/<id>.md) covering its full feature set:
  - every prop, input, output, event and slot, per framework;
  - variants and states;
  - accessibility and RTL notes.
- That Markdown file is the single source. It must read well on GitHub and also be rendered in the guide at its own route.
- Anything not in the live example can be tried from the Markdown page: a "try it" action opens it in the editor so readers can experiment themselves. Generate this from the Markdown (for example fenced blocks marked as live), not from a second hand-kept list.

### 4. Editor redesign
Propose, then build, a redesigned live editor. Three directions were sketched earlier and none was chosen; propose better ones if you can:
- A) One toolbar: framework and language as segmented controls, icon actions, Run with its shortcut, a thin status bar, and more editor height.
- B) Preview first: the result on top like the preview tab, with the code below in a collapsible panel with framework tabs.
- C) Workspace: a side panel with frameworks and a file tree, the editor and result side by side, and a log panel.

### 5. Animated landing page
- Subtle, formal and compliant with the DGA Platforms Code.
- Motion uses the Platforms Code motion values, respects prefers-reduced-motion, and never blocks reading or interaction.
- Purpose: a quick introduction to the packages and the fastest path to a working install, with npm first. Aim for creativity, elegance and easy onboarding.
- Propose three distinct design directions.

### 6. Creative ideas
Do not reproduce the current guide. Propose a short list of better ways for people to discover, learn and adopt the packages. For each idea, give the problem it solves and its cost.

## Decision gates
- Gate 1, after the audit: present the prioritized findings, the architecture for the Angular guide with registry-pinned packages, the content model and the creative ideas. Then wait.
- Gate 2, design: present the three landing directions and the editor proposals as working prototypes built with the real packages. Show each in Arabic and English, light and dark, and at desktop and phone widths. Then wait for my choice.
- Gate 3, build: implement on a branch. Keep the current guide deployed from main until I approve the switch. Pause for review at meaningful milestones.

## Constraints (non-negotiable)
- Tone: describe Hawiyah as a UI component library built to comply with the DGA Platforms Code, in a formal register. It is not an official DGA product and holds no certification; never claim either. Do not overstate it as being "for government platforms". No AI-sounding marketing copy.
- Icons: use only the DGA Platforms Code icon set, which is Hugeicons Stroke Rounded at the commit pinned in packages/styles/src/assets/icons/provenance.json. Framework logos may keep the existing Simple Icons marks.
- Languages: Arabic and English with full RTL/LTR support. Locale and direction stay independent of each other.
- Accessibility: WCAG 2.2 AA, working keyboard and screen-reader paths, visible focus.
- Commits: author every commit as "Mohamed Hussein <16551319+MohamedEmbarak@users.noreply.github.com>". The repository has one contributor: no Co-Authored-By or other trailers, and no other author or committer identity.
- npm: never publish without my explicit approval for that specific release, and publish only through `pnpm release:packages`.
- Never commit credentials, tokens, .env values, local absolute paths or test artifacts.

## Verification
- End every phase with evidence, not claims:
  - package tests, typecheck and the clean-consumer package check;
  - the new guide's own unit and Playwright suites;
  - axe checks, RTL/LTR checks and reduced-motion checks;
  - a production build with HAWIYAH_BASE_PATH=/hawiyah/.
- Have reviewer agents that did not write the code verify each milestone.
- Report what passed, what failed (with output), and what was not checked.