// Self-tests of the readers against the installed 0.3.0 files (5a.3): the
// default readers find the component of every target in the published
// JavaScript, read known defaults, and the slot and stylesheet readers find what
// the published files hold. A changed package build fails here loudly.
import { beforeAll, describe, expect, it } from 'vitest';
import { angularDefaults } from '../defaults-angular.mjs';
import { reactDefaults } from '../defaults-react.mjs';
import { vueDefaults } from '../defaults-vue.mjs';
import { declaredMembers } from '../members.mjs';
import { vueSlots } from '../slots-vue.mjs';
import { attributesFor } from '../stylesheet-selectors.mjs';
import { testReaders } from './helpers.mjs';

let readers;
let all;
beforeAll(() => {
  readers = testReaders();
  all = [...readers.components.keys()].map((id) => declaredMembers(readers, id));
}, 120000);

const text = (map, name) => map.get(name)?.text;

describe('every component of components.json', () => {
  it('has 85 ids, each with a target in every adapter and no reader error', () => {
    expect(all).toHaveLength(85);
    const errors = all.flatMap((item) => ['vanilla', 'react', 'vue', 'angular'].flatMap((framework) => item[framework].problems.map((problem) => `${item.id} ${framework}: ${problem}`)));
    expect(errors).toEqual([]);
    expect(all.filter((item) => ['vanilla', 'react', 'vue', 'angular'].some((framework) => item[framework].missingTarget)).map((item) => item.id)).toEqual([]);
  });
  it('reads defaults from the published JavaScript of all three frameworks', () => {
    // Measured on 0.3.0: 76 React, 186 Vue and 603 Angular members with a literal default.
    // The bounds are 90 % of that, so a reader that stops reading a form fails here.
    const count = (framework) => all.flatMap((item) => item[framework].members).filter((member) => member.default && member.default !== '—').length;
    expect(count('react')).toBeGreaterThanOrEqual(68);
    expect(count('vue')).toBeGreaterThanOrEqual(167);
    expect(count('angular')).toBeGreaterThanOrEqual(542);
  });
  it('reads the slots of Vue components from the published build', () => {
    const slots = all.flatMap((item) => item.vue.members.filter((member) => member.kind === 'slot').map((member) => `${item.id}:${member.name}`));
    expect(slots.length).toBeGreaterThanOrEqual(84); // 93 on 0.3.0
    expect(slots).toEqual(expect.arrayContaining(['button:default', 'tabs:<value>', 'tabs:tab:<value>', 'portal-layout:footer']));
  });
  it('26 components without a vanilla controller have no row in the styles contract (A11, PG-M5-2)', () => {
    const generated = all.filter((item) => item.vanilla.source === 'stylesheet' && item.vanilla.generatedNote).map((item) => item.id).sort();
    expect(generated).toHaveLength(26);
    expect(generated).toEqual(['app-shell', 'aspect-ratio', 'avatar-group', 'button-group', 'center', 'collapsible', 'columns', 'description-list', 'grid',
      'inline', 'input-group', 'link', 'meter', 'mobile-top-bar', 'number-field', 'page-header', 'portal-footer', 'portal-layout', 'secondary-nav', 'section',
      'service-card', 'service-details', 'sidebar', 'site-verification', 'spacer', 'stat']);
  });
});

describe('React default reader', () => {
  it('reads destructuring defaults, a layout factory and a delegating component', () => {
    expect(text(reactDefaults(readers.published.react, 'Button').defaults, 'variant')).toBe("'primary'");
    expect(text(reactDefaults(readers.published.react, 'SearchField').defaults, 'maxSuggestions')).toBe('8');
    expect(reactDefaults(readers.published.react, 'Stack').problems).toEqual([]);
    expect(text(reactDefaults(readers.published.react, 'ToggleGroup').defaults, 'variant')).toBe("'segmented'");
    expect(reactDefaults(readers.published.react, 'Checkbox').problems).toEqual([]);
  });
  it('reports an export it cannot find', () => {
    expect(reactDefaults(readers.published.react, 'NoSuchComponent').problems).toEqual(['the published JavaScript of @hawiyah/react has no export NoSuchComponent']);
  });
});

describe('Vue default reader', () => {
  it('reads explicit defaults, Boolean casting, default: undefined and spread props', () => {
    const dialog = vueDefaults(readers.published.vue, 'Dialog').defaults;
    expect(text(dialog, 'closeOnBackdrop')).toBe('true');
    expect(text(dialog, 'defaultOpen')).toBe('false');
    expect(text(dialog, 'open')).toBe('—');
    expect(vueDefaults(readers.published.vue, 'Rating').problems).toEqual([]);
    expect(text(vueDefaults(readers.published.vue, 'Stack').defaults, 'collapseAt')).toBe("'md'");
  });
  it('lets a later prop replace one of a spread, and reads a factory parameter from the call', () => {
    // layout(name, className, tag = "div") declares { ...layoutProps, as: { type: String, default: tag } }:
    // the shared layoutProps say 'div', the factory's own as replaces it with the tag of the call.
    expect(vueDefaults(readers.published.vue, 'Section').defaults.get('as')).toMatchObject({ text: "'section'", computed: false, source: { file: '@hawiyah/vue/dist/layout.js', text: '"section"' } });
    for (const name of ['Stack', 'Container', 'Spacer', 'Center']) {
      expect(vueDefaults(readers.published.vue, name).defaults.get('as')).toMatchObject({ text: "'div'", computed: false, source: { file: '@hawiyah/vue/dist/layout.js', text: '"div"' } });
    }
    // Rating spreads ratingNumberProps (max 100) and then declares max: 5; DatePicker replaces
    // the calendar of calendarProps ('gregory') with default: undefined.
    expect(text(vueDefaults(readers.published.vue, 'Rating').defaults, 'max')).toBe('5');
    expect(text(vueDefaults(readers.published.vue, 'Rating').defaults, 'defaultValue')).toBe('0');
    expect(text(vueDefaults(readers.published.vue, 'DatePicker').defaults, 'calendar')).toBe('—');
  });
});

describe('Angular default reader', () => {
  it('reads constructor initialisers of a class and its base, and marks generated values', () => {
    const tabs = angularDefaults(readers.published.angular, 'HwTabsComponent').fields;
    expect(text(tabs, 'orientation')).toBe("'horizontal'");
    expect(text(tabs, 'ariaLabel')).toBe('null');
    expect(tabs.get('id')).toMatchObject({ text: '—', computed: true });
    expect(text(angularDefaults(readers.published.angular, 'HwPaginationComponent').fields, 'page')).toBe('1');
  });
});

describe('Vue slot reader', () => {
  it('reads named, dynamic and forwarded slots', () => {
    expect(vueSlots(readers.published.vue, 'Button')).toEqual({ named: ['default'], dynamic: [], problems: [] });
    expect(vueSlots(readers.published.vue, 'Tabs').dynamic.sort()).toEqual(['`tab:${item.value}`', 'item.value'].sort());
    const drawer = vueSlots(readers.published.vue, 'Drawer');
    expect(drawer.problems).toEqual([]);
    expect(drawer.named).toEqual(expect.arrayContaining(vueSlots(readers.published.vue, 'Dialog').named));
  });
});

describe('stylesheet selectors', () => {
  it('reads values and presence attributes on a class from dist/styles.css', () => {
    const button = attributesFor(readers.selectors, ['hw-button']);
    expect(button.get('data-size')).toEqual({ values: ['lg', 'sm'], presence: true, open: false });
    expect(button.get('data-icon-only')).toEqual({ values: [], presence: true, open: false });
    expect(button.has('data-hw-mode')).toBe(false);
  });
});
