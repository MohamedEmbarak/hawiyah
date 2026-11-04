import { Component, Directive, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { layoutStyles, type LayoutSpacing, type Responsive } from '@nasaq/core';

/** Responsive sizing is expressed as CSS custom properties; no viewport script. */
@Directive()
export abstract class NqLayout {
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

@Component({selector: 'nq-container', standalone: true, imports: [NgStyle], template: `<div class="nq-container" [ngStyle]="styles"><ng-content /></div>`})
export class NqContainerComponent extends NqLayout {}
@Component({selector: 'nq-stack', standalone: true, imports: [NgStyle], template: `<div class="nq-stack" [ngStyle]="styles"><ng-content /></div>`})
export class NqStackComponent extends NqLayout {}
@Component({selector: 'nq-inline', standalone: true, imports: [NgStyle], template: `<div class="nq-inline" [ngStyle]="styles"><ng-content /></div>`})
export class NqInlineComponent extends NqLayout {}
@Component({selector: 'nq-grid', standalone: true, imports: [NgStyle], template: `<div class="nq-grid" [ngStyle]="styles"><ng-content /></div>`})
export class NqGridComponent extends NqLayout {}
@Component({selector: 'nq-columns', standalone: true, imports: [NgStyle], template: `<div class="nq-columns" [ngStyle]="styles"><ng-content /></div>`})
export class NqColumnsComponent extends NqLayout {}
@Component({selector: 'nq-sidebar', standalone: true, imports: [NgStyle], template: `<div class="nq-sidebar" [ngStyle]="styles" [attr.data-side]="side" [attr.data-collapse-at]="collapseAt"><aside><ng-content select="[nqSidebar]" /></aside><div><ng-content /></div></div>`})
export class NqSidebarComponent extends NqLayout { @Input() side: 'start' | 'end' = 'start'; @Input() collapseAt: 'sm' | 'md' | 'lg' = 'md'; }
@Component({selector: 'nq-center', standalone: true, imports: [NgStyle], template: `<div class="nq-center" [ngStyle]="styles"><ng-content /></div>`})
export class NqCenterComponent extends NqLayout {}
@Component({selector: 'nq-spacer', standalone: true, host: {class: 'nq-spacer', 'aria-hidden': 'true', '[style]': 'styles'}, template: ''})
export class NqSpacerComponent extends NqLayout {}
@Component({selector: 'nq-aspect-ratio', standalone: true, imports: [NgStyle], template: `<div class="nq-aspect-ratio" [ngStyle]="styles"><ng-content /></div>`})
export class NqAspectRatioComponent extends NqLayout { override ratio = 16 / 9; }
@Component({selector: 'nq-section', standalone: true, imports: [NgStyle], template: `<section class="nq-section" [ngStyle]="styles" [attr.aria-label]="label || null"><ng-content /></section>`})
export class NqSectionComponent extends NqLayout { @Input() label = ''; }
@Component({selector: 'nq-app-shell', standalone: true, imports: [NgStyle], template: `<div class="nq-app-shell" [ngStyle]="styles" [attr.data-side]="side"><a class="nq-skip-link" [href]="'#' + mainId">{{ skipLabel }}</a><header class="nq-app-shell-header"><ng-content select="[nqShellHeader]" /></header><aside class="nq-app-shell-sidebar"><ng-content select="[nqShellSidebar]" /></aside><main class="nq-app-shell-main" [id]="mainId" tabindex="-1"><ng-content /></main><footer class="nq-app-shell-footer"><ng-content select="[nqShellFooter]" /></footer></div>`})
export class NqAppShellComponent extends NqLayout { @Input() mainId = 'main-content'; @Input() skipLabel = 'انتقل إلى المحتوى'; @Input() side: 'start' | 'end' = 'start'; }
@Component({selector: 'nq-page-header', standalone: true, imports: [NgStyle], template: `<header class="nq-page-header" [ngStyle]="styles"><ng-content select="[nqBreadcrumb]" /><div class="nq-page-header-main"><div><h1>{{ title }}</h1>@if (description) {<p>{{ description }}</p>}</div><div class="nq-page-header-actions"><ng-content /></div></div></header>`})
export class NqPageHeaderComponent extends NqLayout { @Input({required: true}) title = ''; @Input() description = ''; }
