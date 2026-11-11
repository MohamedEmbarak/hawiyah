import { booleanAttribute, Component, Directive, ElementRef, HostAttributeToken, inject, Input } from '@angular/core';
import { bindAngularFragmentLinks } from './fragment-links';
import { HwTexts } from './text';
import { NgStyle } from '@angular/common';
import { layoutStyles, type LayoutSpacing, type Responsive } from '@hawiyah/core';

/** Responsive sizing is expressed as CSS custom properties; no viewport script. */
@Directive()
export abstract class HwLayout {
  @Input() gap?: Responsive<LayoutSpacing>;
  @Input() padding?: Responsive<LayoutSpacing>;
  @Input() align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  @Input() justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** The bare attribute means true; an unset input writes no --hw-layout-wrap. */
  @Input({transform: (value: unknown) => value === undefined || value === null ? undefined : booleanAttribute(value)}) wrap?: boolean;
  @Input() columns?: Responsive<number>;
  @Input() minItemWidth?: string;
  @Input() maxWidth?: string;
  @Input() sidebarWidth?: string;
  @Input() ratio?: number;
  get styles(): Record<string, string | number> { return layoutStyles(this); }
}

// The host element is the layout box: it carries the hw- class and the layout custom properties, and the
// template is the projected content alone. class, id, aria-* and data-* written on the element therefore
// sit on the element the stylesheet styles. The attribute selectors place the same box on a native element.
@Component({selector: 'hw-container, [hwContainer]', standalone: true, host: {class: 'hw-container', '[style]': 'styles'}, template: `<ng-content />`})
export class HwContainerComponent extends HwLayout {}
@Component({selector: 'hw-stack, [hwStack]', standalone: true, host: {class: 'hw-stack', '[style]': 'styles'}, template: `<ng-content />`})
export class HwStackComponent extends HwLayout {}
@Component({selector: 'hw-inline, [hwInline]', standalone: true, host: {class: 'hw-inline', '[style]': 'styles'}, template: `<ng-content />`})
export class HwInlineComponent extends HwLayout {}
@Component({selector: 'hw-grid, [hwGrid]', standalone: true, host: {class: 'hw-grid', '[style]': 'styles'}, template: `<ng-content />`})
export class HwGridComponent extends HwLayout {}
@Component({selector: 'hw-columns, [hwColumns]', standalone: true, host: {class: 'hw-columns', '[style]': 'styles'}, template: `<ng-content />`})
export class HwColumnsComponent extends HwLayout {}
/** The element marked hwSidebar and the one content element are the two children of the host grid, sidebar first. */
@Component({selector: 'hw-sidebar', standalone: true, host: {class: 'hw-sidebar', '[style]': 'styles', '[attr.data-side]': 'side', '[attr.data-collapse-at]': 'collapseAt'}, template: `<ng-content select="[hwSidebar]" /><ng-content />`})
export class HwSidebarComponent extends HwLayout { @Input() side: 'start' | 'end' = 'start'; @Input() collapseAt: 'sm' | 'md' | 'lg' = 'md'; }
@Component({selector: 'hw-center, [hwCenter]', standalone: true, host: {class: 'hw-center', '[style]': 'styles'}, template: `<ng-content />`})
export class HwCenterComponent extends HwLayout {}
@Component({selector: 'hw-spacer', standalone: true, host: {class: 'hw-spacer', 'aria-hidden': 'true', '[style]': 'styles'}, template: ''})
export class HwSpacerComponent extends HwLayout {}
@Component({selector: 'hw-aspect-ratio, [hwAspectRatio]', standalone: true, host: {class: 'hw-aspect-ratio', '[style]': 'styles'}, template: `<ng-content />`})
export class HwAspectRatioComponent extends HwLayout { override ratio = 16 / 9; }
@Component({selector: 'hw-section, [hwSection]', standalone: true, host: {class: 'hw-section', '[style]': 'styles', '[attr.aria-label]': 'label || authoredLabel', '[attr.role]': 'label && !native ? "region" : authoredRole'}, template: `<ng-content />`})
export class HwSectionComponent extends HwLayout {
  /** Optional name of the section. On hw-section it also makes the host a region; a native section needs no role. */
  @Input() label = '';
  protected readonly native = (inject(ElementRef).nativeElement as Element).tagName.toLowerCase() === 'section';
  // The two bindings own their attributes, so what the application wrote there is kept while label is not given.
  protected readonly authoredLabel = inject(new HostAttributeToken('aria-label'), {optional: true});
  protected readonly authoredRole = inject(new HostAttributeToken('role'), {optional: true});
}
/** Three regions are always rendered and the stylesheet hides an empty one: projection cannot be detected.
 * The banner and contentinfo landmarks come from what the application projects. */
@Component({selector: 'hw-app-shell', standalone: true, host: {class: 'hw-app-shell', '[style]': 'styles', '[attr.data-side]': 'side'}, template: `<a class="hw-skip-link" [attr.href]="fragment(mainId)">{{ texts.need('skipLabel', skipLabel) }}</a><div class="hw-app-shell-header"><ng-content select="[hwShellHeader]" /></div><aside class="hw-app-shell-sidebar"><ng-content select="[hwShellSidebar]" /></aside><main class="hw-app-shell-main" [id]="mainId" tabindex="-1"><ng-content /></main><div class="hw-app-shell-footer"><ng-content select="[hwShellFooter]" /></div>`})
export class HwAppShellComponent extends HwLayout {
  @Input() mainId = 'main-content';
  /** Visible text of the skip link, which is always rendered. */
  @Input({required: true}) skipLabel = '';
  @Input() side: 'start' | 'end' = 'start';
  protected readonly texts = new HwTexts('hw-app-shell');
  constructor() { super(); bindAngularFragmentLinks(':scope > a.hw-skip-link'); }
  protected fragment(id: string): string { return `#${encodeURIComponent(id)}`; }
}
// The host cannot be a header element, so the page header keeps its inner header; the stylesheet makes the host a block.
// The input named title is not a native tooltip on the wrapper element.
@Component({selector: 'hw-page-header', standalone: true, imports: [NgStyle], host: {'[attr.title]': 'null'}, template: `<header class="hw-page-header" [ngStyle]="styles"><ng-content select="[hwBreadcrumb]" /><div class="hw-page-header-main"><div><h1>{{ title }}</h1>@if (description) {<p>{{ description }}</p>}</div><div class="hw-page-header-actions"><ng-content /></div></div></header>`})
export class HwPageHeaderComponent extends HwLayout { @Input({required: true}) title = ''; @Input() description = ''; }
