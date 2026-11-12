// Compiled by required-names.test.ts with the Angular compiler; no test imports it.
// Each template of WithoutName omits only `label`, so every diagnostic is about that input.
import { Component } from '@angular/core';
import { HwMultiSelectComponent, HwRadioGroupComponent, HwSearchFieldComponent, HwTagInputComponent, HwTextFieldComponent, HwToggleGroupComponent, HwTreeViewComponent } from '@hawiyah/angular';

const imports = [HwMultiSelectComponent, HwRadioGroupComponent, HwSearchFieldComponent, HwTagInputComponent, HwTextFieldComponent, HwToggleGroupComponent, HwTreeViewComponent];

@Component({ selector: 'app-with-name', standalone: true, imports, template: `
<hw-search-field label="Search" clearLabel="Clear search" />
<hw-search-field aria-label="Search" clearLabel="Clear search" />
<hw-toggle-group [label]="view" [options]="[]" />
<hw-toggle-group [aria-label]="view" aria-describedby="note" [options]="[]" />
<hw-text-field aria-labelledby="heading" [aria-invalid]="true" form="outer" (focused)="seen($event)" (blurred)="seen($event)" />
<hw-radio-group label="Branch" [options]="[]" />
<hw-tag-input label="Tags" [getRemoveLabel]="remove" />
<hw-multi-select label="Cities" searchLabel="Filter" emptyMessage="None" [getResultsMessage]="count" [options]="[]" />
<hw-tree-view label="Sections" [items]="[]" [getExpandLabel]="node" [getCollapseLabel]="node" />
<hw-tree-view aria-label="Sections" [items]="[]" [getExpandLabel]="node" [getCollapseLabel]="node" />` })
export class WithName { view = 'View'; node = (node: { label: string }) => node.label; remove = (tag: string) => tag; count = (count: number) => String(count); seen(event: FocusEvent) { return event; } }

// A search field, a toggle group and a tree view may be named by aria-label or aria-labelledby, so their label is checked when they render.
@Component({ selector: 'app-without-name', standalone: true, imports, template: `
<hw-search-field clearLabel="Clear search" />
<hw-toggle-group [options]="[]" />
<hw-tree-view [items]="[]" [getExpandLabel]="node" [getCollapseLabel]="node" />` })
export class WithoutName { node = (node: { label: string }) => node.label; }

// Renamed and removed inputs have no alias; the options of a toggle group and the results text of a multi-select are required.
@Component({ selector: 'app-removed', standalone: true, imports, template: `
<hw-tag-input label="Tags" [addLabel]="'Add'" [getRemoveLabel]="remove" />
<hw-text-field [describedBy]="'note'" />
<hw-toggle-group label="View" />
<hw-multi-select label="Cities" searchLabel="Filter" emptyMessage="None" [options]="[]" />` })
export class Removed { remove = (tag: string) => tag; }
