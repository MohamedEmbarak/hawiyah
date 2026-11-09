import { Component, Directive, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { layoutStyles, type LayoutSpacing, type Responsive } from '@hawiyah/core';

/** Responsive sizing is expressed as CSS custom properties; no viewport script. */
@Directive()
export abstract class HwLayout {
  @Input() gap?: Responsive<LayoutSpacing>;
  @Input() padding?: Responsive<LayoutSpacing>;
  @Input() align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  @Input() justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  @Input() wrap?: boolean;
  @Input() columns?: Responsive<number>;
  @Input() minItemWidth?: string;
  @Input() maxWidth?: string;
  @Input() sidebarWidth?: string;
  @Input() ratio?: number;
  get styles(): Record<string, string | number> { return layoutStyles(this); }
}

@Component({selector: 'hw-container', standalone: true, imports: [NgStyle], template: `<div class="hw-container" [ngStyle]="styles"><ng-content /></div>`})
export class HwContainerComponent extends HwLayout {}
@Component({selector: 'hw-stack', standalone: true, imports: [NgStyle], template: `<div class="hw-stack" [ngStyle]="styles"><ng-content /></div>`})
export class HwStackComponent extends HwLayout {}
@Component({selector: 'hw-inline', standalone: true, imports: [NgStyle], template: `<div class="hw-inline" [ngStyle]="styles"><ng-content /></div>`})
export class HwInlineComponent extends HwLayout {}
@Component({selector: 'hw-grid', standalone: true, imports: [NgStyle], template: `<div class="hw-grid" [ngStyle]="styles"><ng-content /></div>`})
export class HwGridComponent extends HwLayout {}
@Component({selector: 'hw-columns', standalone: true, imports: [NgStyle], template: `<div class="hw-columns" [ngStyle]="styles"><ng-content /></div>`})
export class HwColumnsComponent extends HwLayout {}
@Component({selector: 'hw-sidebar', standalone: true, imports: [NgStyle], template: `<div class="hw-sidebar" [ngStyle]="styles" [attr.data-side]="side" [attr.data-collapse-at]="collapseAt"><aside><ng-content select="[hwSidebar]" /></aside><div><ng-content /></div></div>`})
export class HwSidebarComponent extends HwLayout { @Input() side: 'start' | 'end' = 'start'; @Input() collapseAt: 'sm' | 'md' | 'lg' = 'md'; }
@Component({selector: 'hw-center', standalone: true, imports: [NgStyle], template: `<div class="hw-center" [ngStyle]="styles"><ng-content /></div>`})
export class HwCenterComponent extends HwLayout {}
@Component({selector: 'hw-spacer', standalone: true, host: {class: 'hw-spacer', 'aria-hidden': 'true', '[style]': 'styles'}, template: ''})
export class HwSpacerComponent extends HwLayout {}
@Component({selector: 'hw-aspect-ratio', standalone: true, imports: [NgStyle], template: `<div class="hw-aspect-ratio" [ngStyle]="styles"><ng-content /></div>`})
export class HwAspectRatioComponent extends HwLayout { override ratio = 16 / 9; }
@Component({selector: 'hw-section', standalone: true, imports: [NgStyle], template: `<section class="hw-section" [ngStyle]="styles" [attr.aria-label]="label || null"><ng-content /></section>`})
export class HwSectionComponent extends HwLayout { @Input() label = ''; }
@Component({selector: 'hw-app-shell', standalone: true, imports: [NgStyle], template: `<div class="hw-app-shell" [ngStyle]="styles" [attr.data-side]="side"><a class="hw-skip-link" [href]="'#' + mainId">{{ skipLabel }}</a><header class="hw-app-shell-header"><ng-content select="[hwShellHeader]" /></header><aside class="hw-app-shell-sidebar"><ng-content select="[hwShellSidebar]" /></aside><main class="hw-app-shell-main" [id]="mainId" tabindex="-1"><ng-content /></main><footer class="hw-app-shell-footer"><ng-content select="[hwShellFooter]" /></footer></div>`})
export class HwAppShellComponent extends HwLayout { @Input() mainId = 'main-content'; @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() side: 'start' | 'end' = 'start'; }
@Component({selector: 'hw-page-header', standalone: true, imports: [NgStyle], template: `<header class="hw-page-header" [ngStyle]="styles"><ng-content select="[hwBreadcrumb]" /><div class="hw-page-header-main"><div><h1>{{ title }}</h1>@if (description) {<p>{{ description }}</p>}</div><div class="hw-page-header-actions"><ng-content /></div></div></header>`})
export class HwPageHeaderComponent extends HwLayout { @Input({required: true}) title = ''; @Input() description = ''; }
