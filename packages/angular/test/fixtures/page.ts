// A host page for component tests: every exported component is available to the template.
import '@angular/compiler';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as hawiyah from '@hawiyah/angular';

let pages = 0;
const imports = Object.values(hawiyah).filter(value => typeof value === 'function' && ('ɵcmp' in value || 'ɵdir' in value)) as never[];
/** Renders `template` in a host component attached to the document. `update` assigns to the host and renders again. */
export function page<T extends object>(template: string, state: T = {} as T) {
  class Host { constructor() { Object.assign(this, state); } }
  // The host attribute keeps the generated ids of same-shaped pages apart (NG0912).
  Component({ standalone: true, changeDetection: ChangeDetectionStrategy.Default, host: { 'data-page': String(++pages) }, imports, template })(Host);
  const fixture = TestBed.createComponent(Host); document.body.append(fixture.nativeElement); fixture.detectChanges();
  const update = (changes: Partial<T> = {}) => { Object.assign(fixture.componentInstance, changes); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); };
  return { fixture, root: fixture.nativeElement as HTMLElement, state: fixture.componentInstance as unknown as T, update };
}

/** Markup with the attributes in name order and without the comment nodes Angular leaves as anchors:
 * attribute order and those anchors are not part of the contract, everything else is. */
export function markup(source: Element | string): string {
  if (typeof source === 'string') { const holder = document.createElement('template'); holder.innerHTML = source; return [...holder.content.childNodes].map(serialize).join(''); }
  return serialize(source);
}
function serialize(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const element = node as Element;
  const attributes = [...element.attributes].filter(attribute => !/^(ng-|_ng|ngh$)/.test(attribute.name)).map(attribute => ` ${attribute.name}="${attribute.value}"`).sort().join('');
  return `<${element.localName}${attributes}>${[...element.childNodes].map(serialize).join('')}</${element.localName}>`;
}
/** Attributes of one element by name. */
export const attributesOf = (element: Element): Record<string, string> => Object.fromEntries([...element.attributes].filter(attribute => !/^(ng-|_ng|ngh$)/.test(attribute.name)).map(attribute => [attribute.name, attribute.value]));
/** Child nodes that are not Angular's comment anchors. */
export const contentOf = (element: Element): Node[] => [...element.childNodes].filter(node => node.nodeType !== Node.COMMENT_NODE);
