// Compiled by renamed-inputs.test.ts with the Angular compiler; no test imports it.
// Current holds the names of 0.3.0 and compiles; each line of Removed uses one renamed or removed name and does not.
import { Component } from '@angular/core';
import { HwAccordionComponent, HwCalendarComponent, HwCarouselComponent, HwCollapsibleComponent, HwDataTableComponent, HwDialogComponent, HwDrawerComponent, HwMenuComponent, HwPageHeaderComponent, HwPopoverComponent, HwPortalHeaderComponent, HwServiceCardComponent, HwServiceDetailsComponent, HwStepperComponent, HwTableComponent, HwTooltipComponent, HwTooltipTriggerDirective, HwTreeViewComponent } from '@hawiyah/angular';
import type { HwAccordionItem, HwBreadcrumbItem, HwDataColumn, HwMenuItem, HwStep, HwTableColumn, HwTreeNode } from '@hawiyah/angular';

const imports = [HwAccordionComponent, HwCalendarComponent, HwCarouselComponent, HwCollapsibleComponent, HwDataTableComponent, HwDialogComponent, HwDrawerComponent, HwMenuComponent, HwPageHeaderComponent, HwPopoverComponent, HwPortalHeaderComponent, HwServiceCardComponent, HwServiceDetailsComponent, HwStepperComponent, HwTableComponent, HwTooltipComponent, HwTooltipTriggerDirective, HwTreeViewComponent];
// A type alias: an interface has no index signature and so is not a Record<string, unknown>.
type Request = { id: string; title: string };

@Component({ selector: 'app-current', standalone: true, imports, template: `
<hw-accordion aria-label="Questions" [items]="questions" [titleTemplate]="title" [contentTemplate]="title" (toggled)="opened($event.value, $event.open)" /><ng-template #title let-item let-index="index">{{ index }} {{ item.title }}</ng-template>
<hw-stepper aria-label="Progress" completeLabel="Complete" upcomingLabel="Not started" [items]="steps" current="review" [activeIndex]="1" />
<hw-data-table caption="Requests" emptyMessage="None" locale="en" [columns]="columns" [rows]="rows" [rowKey]="key" [(sortKey)]="sortKey" [(sortDirection)]="sortDirection" />
<hw-table aria-label="Requests" emptyMessage="None" [columns]="plain" [rows]="rows" [rowKey]="key" />
<hw-menu aria-label="Actions" triggerLabel="Actions" triggerVariant="ghost" [items]="actions" (action)="chosen($event)" [(open)]="open" />
<hw-popover aria-labelledby="heading" triggerLabel="Filters" triggerVariant="secondary" />
<hw-tree-view aria-label="Sections" [items]="nodes" [(expanded)]="expanded" [getExpandLabel]="name" [getCollapseLabel]="name" />
<hw-dialog title="Review" closeLabel="Close" aria-describedby="note" [aria-labelledby]="'heading'" /><hw-drawer title="Filters" closeLabel="Close" [aria-describedby]="'note'" aria-label="Filter" />
<hw-tooltip text="Hint"><button type="button" hwTooltipTrigger aria-describedby="note">Target</button></hw-tooltip>
<hw-calendar aria-label="Day" locale="en" previousLabel="Previous" nextLabel="Next" unsupportedMessage="Out of range" [isDateDisabled]="rejected" />
<hw-carousel aria-labelledby="heading" previousLabel="Previous" nextLabel="Next" emptyLabel="None" [getSlideLabel]="slide" />
<hw-collapsible label="More" disabled />
<hw-page-header title="Services" [level]="2" />
<hw-portal-header menuLabel="Menu" navigationLabel="Main" [(open)]="open" />
<hw-service-card title="Permit" [metadata]="facts" /><hw-service-details title="Permit" [metadata]="facts" [requirementTemplate]="entry" /><ng-template #entry let-requirement>{{ requirement }}</ng-template>` })
export class Current {
  questions: HwAccordionItem[] = [{ value: 'fees', title: 'Fees' }]; steps: HwStep[] = [{ value: 'review', label: 'Review' }]; actions: HwMenuItem[] = [{ value: 'edit', label: 'Edit', href: '#edit' }];
  nodes: HwTreeNode[] = []; expanded: readonly string[] = []; trail: HwBreadcrumbItem[] = [{ label: 'Home', href: '/', current: true }];
  columns: HwDataColumn<Request>[] = [{ key: 'id', label: 'Reference', sortable: true }]; plain: HwTableColumn<Request>[] = [{ key: 'id', label: 'Reference', rowHeader: true }]; rows: Request[] = [];
  sortKey = 'id'; sortDirection: 'ascending' | 'descending' = 'ascending'; open = false; facts = [{ term: 'Fee', description: 'No fee' }];
  key = (row: Request, index: number) => row.id + index; name = (node: HwTreeNode) => node.label; slide = (position: number, total: number) => `${position}/${total}`; rejected = (value: string) => value === '';
  opened(value: string, open: boolean) { return value + open; } chosen(value: string) { return value; }
}

@Component({ selector: 'app-removed', standalone: true, imports, template: `
<hw-accordion [items]="[{id: 'fees', title: 'Fees', content: 'No fee'}]" />
<hw-accordion [items]="[]" (toggled)="seen($event.id)" />
<hw-stepper label="Progress" completeLabel="Complete" upcomingLabel="Not started" [steps]="[]" />
<hw-stepper label="Progress" completeLabel="Complete" upcomingLabel="Not started" [items]="[]" [current]="1" />
<hw-stepper label="Progress" [items]="[]" />
<hw-data-table caption="Requests" emptyMessage="None" locale="en" (sortChange)="seen($event.direction)" />
<hw-menu label="Actions" triggerLabel="Actions" [items]="[{id: 'edit', label: 'Edit'}]" />
<hw-tree-view label="Sections" [nodes]="[]" [getExpandLabel]="name" [getCollapseLabel]="name" />
<hw-tree-view label="Sections" [items]="[]" [(expandedIds)]="expanded" [getExpandLabel]="name" [getCollapseLabel]="name" />
<hw-tree-view label="Sections" [items]="[]" />
<hw-dialog title="Review" closeLabel="Close" [describedBy]="'note'" />
<hw-service-card title="Permit" [duration]="'3 days'" />
<hw-service-card title="Permit" [fee]="'No fee'" />
<hw-service-details title="Permit" [details]="[]" />` })
export class Removed { expanded: readonly string[] = []; name = (node: HwTreeNode) => node.label; seen(value: unknown) { return value; } }
