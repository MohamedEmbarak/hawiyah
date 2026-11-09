import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { HwAvatarGroupComponent, HwTimelineComponent } from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, beforeAll, expect, it } from 'vitest';
import { AvatarGroup as ReactAvatarGroup } from '../packages/react/src/expanded-content';
import { AvatarGroup as VueAvatarGroup } from '../packages/vue/src/content';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanups: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  TestBed.resetTestingModule();
  document.body.replaceChildren();
});

const members = Array.from({length: 7}, (_, index) => ({name: `Member ${index + 1}`}));
const overflowLabel = (count: number) => `Additional members (${count})`;

async function mountGroup(adapter: string, host: HTMLElement) {
  const label = 'Review team';
  if (adapter === 'react') {
    const root = createRoot(host);
    cleanups.push(async () => { await act(() => root.unmount()); });
    return async (max: number) => {
      await act(() => root.render(createElement(ReactAvatarGroup, {items: members, max, label, getOverflowLabel: overflowLabel})));
    };
  }
  if (adapter === 'vue') {
    const limit = ref(5);
    const app = createApp({render: () => h(VueAvatarGroup, {items: members, max: limit.value, label, remainingLabel: overflowLabel})});
    app.mount(host);
    cleanups.push(() => app.unmount());
    return async (max: number) => { limit.value = max; await nextTick(); };
  }
  const fixture = TestBed.createComponent(HwAvatarGroupComponent);
  host.append(fixture.nativeElement);
  fixture.componentRef.setInput('label', label);
  fixture.componentRef.setInput('avatars', members);
  fixture.componentRef.setInput('overflowLabel', overflowLabel);
  cleanups.push(() => fixture.destroy());
  return async (max: number) => { fixture.componentRef.setInput('max', max); fixture.detectChanges(); };
}

for (const adapter of ['react', 'vue', 'angular']) {
  it(`${adapter}: avatar overflow has a single named image and tracks the actual omitted count`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const setMax = await mountGroup(adapter, host);
    for (const [max, visible] of [[2.9, 2], [0, 0], [-1, 0], [NaN, 5], [Infinity, 7]] as const) {
      await setMax(max);
      const group = host.querySelector('[role="group"]')!;
      const hiddenCount = members.length - visible;
      const overflow = group.querySelector(':scope > .hw-avatar:last-child[aria-label^="Additional members"]');
      expect(group.getAttribute('aria-label')).toBe('Review team');
      expect(group.querySelectorAll('.hw-avatar')).toHaveLength(visible + Number(hiddenCount > 0));
      if (hiddenCount) {
        expect(overflow?.getAttribute('role')).toBe('img');
        expect(overflow?.getAttribute('aria-label')).toBe(overflowLabel(hiddenCount));
        expect(overflow?.textContent).toBe(`+${hiddenCount}`);
      } else {
        expect(overflow).toBeNull();
      }
    }
  });
}

it('Angular announces the current timeline step and moves that marker when the state changes', () => {
  const fixture = TestBed.createComponent(HwTimelineComponent);
  cleanups.push(() => fixture.destroy());
  fixture.componentRef.setInput('label', 'Application stages');
  const update = (current: number) => {
    fixture.componentRef.setInput('items', ['Received', 'Review', 'Decision'].map((title, index) => ({
      title, state: index === current ? 'current' : index < current ? 'complete' : 'pending',
    })));
    fixture.detectChanges();
  };
  for (const current of [1, 2]) {
    update(current);
    const list: HTMLElement = fixture.nativeElement.querySelector('ol');
    expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(list.children[current]!.getAttribute('aria-current')).toBe('step');
  }
});
