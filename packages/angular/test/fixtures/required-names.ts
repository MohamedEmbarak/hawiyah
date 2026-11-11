// Compiled by required-names.test.ts with the Angular compiler; no test imports it.
// Each template of WithoutName omits only `label`, so every diagnostic is about that input.
import { Component } from '@angular/core';
import { HwSearchFieldComponent, HwToggleGroupComponent, HwTreeViewComponent } from '@hawiyah/angular';

const imports = [HwSearchFieldComponent, HwToggleGroupComponent, HwTreeViewComponent];

@Component({ selector: 'app-with-name', standalone: true, imports, template: `
<hw-search-field label="Search" clearLabel="Clear search" searchLabel="Search" />
<hw-toggle-group [label]="view" [options]="[]" />
<hw-tree-view label="Sections" [nodes]="[]" />` })
export class WithName { view = 'View'; }

@Component({ selector: 'app-without-name', standalone: true, imports, template: `
<hw-search-field clearLabel="Clear search" searchLabel="Search" />
<hw-toggle-group [options]="[]" />
<hw-tree-view [nodes]="[]" />` })
export class WithoutName {}
