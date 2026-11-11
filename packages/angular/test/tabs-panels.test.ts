import '@angular/compiler';
import './fixtures/texts';
import { text, withText } from './fixtures/application-text';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HwTabComponent, HwTabsComponent } from '@hawiyah/angular';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => TestBed.resetTestingModule());

function host<T extends object>(type: new () => T, template: string, changeDetection = ChangeDetectionStrategy.Default) {
  Component({ standalone: true, imports: [HwTabComponent, HwTabsComponent], template, changeDetection })(type); Object.assign(type.prototype, { text });
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}
/** Applies a change made to the host's own state, as an application would by marking the host for check. */
function refresh(fixture: ComponentFixture<unknown>) { fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck(); fixture.detectChanges(); }
const state = (root: HTMLElement) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  return { tabs, panels, visible: panels.filter(panel => !panel.hidden).map(panel => panel.textContent), selected: tabs.filter(tab => tab.getAttribute('aria-selected') === 'true').map(tab => tab.textContent) };
};

describe('Angular tab panels', () => {
  it('renders each panel inside its hw-tab, linked to its tab in both directions', () => {
    class Host { tab = 'two'; }
    const fixture = host(Host, `<hw-tabs ${withText.tabs} id="steps" label="Steps" [(value)]="tab"><hw-tab value="one" label="One"><p>First</p></hw-tab><hw-tab value="two" label="Two"><p>Second</p></hw-tab><p class="note">Note</p></hw-tabs>`);
    const root = fixture.nativeElement as HTMLElement, { tabs, panels, visible, selected } = state(root);
    expect(panels.map(panel => panel.parentElement!.localName)).toEqual(['hw-tab', 'hw-tab']);
    expect(panels.map(panel => panel.parentElement!.parentElement!.className)).toEqual(['hw-tabs', 'hw-tabs']);
    expect(panels.map(panel => [panel.localName, panel.className, panel.tabIndex])).toEqual([['section', 'hw-tab-panel', 0], ['section', 'hw-tab-panel', 0]]);
    expect(panels.map(panel => panel.id)).toEqual(['steps-panel-0', 'steps-panel-1']);
    expect(tabs.map(tab => tab.getAttribute('aria-controls'))).toEqual(panels.map(panel => panel.id));
    expect(panels.map(panel => panel.getAttribute('aria-labelledby'))).toEqual(tabs.map(tab => tab.id));
    expect(visible).toEqual(['Second']); expect(selected).toEqual(['Two']);
    expect(root.querySelector('.hw-tabs > .note')!.textContent).toBe('Note');
    expect(root.querySelector('.hw-tabs')!.firstElementChild!.className).toBe('hw-tab-bar');
  });

  it('follows clicks under OnPush and programmatic value changes', () => {
    class Host { tab = 'one'; }
    const fixture = host(Host, `<hw-tabs ${withText.tabs} label="Steps" [(value)]="tab"><hw-tab value="one" label="One">First</hw-tab><hw-tab value="two" label="Two">Second</hw-tab></hw-tabs>`, ChangeDetectionStrategy.OnPush);
    const root = fixture.nativeElement as HTMLElement;
    expect(state(root).visible).toEqual(['First']);
    state(root).tabs[1]!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.tab).toBe('two');
    expect(state(root).visible).toEqual(['Second']); expect(state(root).selected).toEqual(['Two']);
    fixture.componentInstance.tab = 'one'; refresh(fixture);
    expect(state(root).visible).toEqual(['First']);
  });

  it('keeps identifiers and selection correct when tabs are added, disabled and removed', () => {
    class Host { tab = 'b'; items = [{ value: 'a', label: 'A', disabled: false }, { value: 'b', label: 'B', disabled: false }]; }
    const fixture = host(Host, `<hw-tabs ${withText.tabs} id="list" label="List" [value]="tab">@for (item of items; track item.value) {<hw-tab [value]="item.value" [label]="item.label" [disabled]="item.disabled">{{ item.label }} panel</hw-tab>}</hw-tabs>`);
    const root = fixture.nativeElement as HTMLElement;
    expect(state(root).visible).toEqual(['B panel']);
    expect(state(root).panels.map(panel => panel.id)).toEqual(['list-panel-0', 'list-panel-1']);
    // A tab inserted before the selected one is rendered before the tabset has ordered it.
    fixture.componentInstance.items = [{ value: 'new', label: 'New', disabled: false }, ...fixture.componentInstance.items];
    expect(() => refresh(fixture)).not.toThrow();
    let current = state(root);
    expect(current.panels.map(panel => panel.id)).toEqual(['list-panel-0', 'list-panel-1', 'list-panel-2']);
    expect(current.panels.map(panel => panel.getAttribute('aria-labelledby'))).toEqual(current.tabs.map(tab => tab.id));
    expect(current.visible).toEqual(['B panel']); expect(current.selected).toEqual(['B']);
    fixture.componentInstance.items = fixture.componentInstance.items.map(item => ({ ...item, disabled: item.value === 'b' }));
    refresh(fixture);
    expect(state(root).visible).toEqual(['New panel']);
    fixture.componentInstance.items = fixture.componentInstance.items.filter(item => item.value !== 'new');
    refresh(fixture);
    current = state(root);
    expect(current.panels.map(panel => panel.id)).toEqual(['list-panel-0', 'list-panel-1']);
    expect(current.visible).toEqual(['A panel']);
  });
});
