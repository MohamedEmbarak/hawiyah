// Type fixture for react.text-contract.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { ContentNavigation, SideNavigation } from '../src/index.js';

const items = [{ id: 'intro', label: 'Introduction' }];

export const accepted = <>
  <ContentNavigation items={items} label="On this page" />
  <ContentNavigation items={items} aria-label="Contents" />
  <ContentNavigation items={items} aria-labelledby="contents-heading" />
  <SideNavigation items={items} label="Sections" />
  <SideNavigation items={items} aria-label="Sections" />
  <SideNavigation items={items} aria-labelledby="sections-heading" />
</>;

export const rejected = <>
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <ContentNavigation items={items} />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <SideNavigation items={items} />
</>;
