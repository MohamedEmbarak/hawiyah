// Compiled by renamed-inputs.test.ts with the Angular compiler; no test imports it.
// Current holds the names of 0.3.0 and compiles; each line of Removed uses one renamed or removed name and does not.
import { Component } from '@angular/core';
import { HwAccordionComponent, HwAlertComponent, HwAvatarGroupComponent, HwButtonDirective, HwButtonGroupComponent, HwCalendarComponent, HwCarouselComponent, HwChipComponent, HwCollapsibleComponent, HwCookieConsentComponent, HwDataTableComponent, HwDescriptionListComponent, HwDialogComponent, HwDrawerComponent, HwFeedbackComponent, HwIconButtonComponent, HwLinkDirective, HwMenuComponent, HwMeterComponent, HwNotificationListComponent, HwPageHeaderComponent, HwPopoverComponent, HwPortalHeaderComponent, HwProgressComponent, HwServiceCardComponent, HwServiceDetailsComponent, HwSkeletonComponent, HwSpinnerComponent, HwStatComponent, HwStepperComponent, HwTableComponent, HwTimelineComponent, HwTooltipComponent, HwTooltipTriggerDirective, HwTreeViewComponent } from '@hawiyah/angular';
import type { HwAccordionItem, HwAvatarItem, HwBreadcrumbItem, HwConsentChoice, HwDataColumn, HwFeedbackValue, HwMenuItem, HwNotification, HwStep, HwTableColumn, HwTimelineItem, HwTreeNode } from '@hawiyah/angular';

const imports = [HwAccordionComponent, HwAlertComponent, HwAvatarGroupComponent, HwButtonDirective, HwButtonGroupComponent, HwCalendarComponent, HwCarouselComponent, HwChipComponent, HwCollapsibleComponent, HwCookieConsentComponent, HwDataTableComponent, HwDescriptionListComponent, HwDialogComponent, HwDrawerComponent, HwFeedbackComponent, HwIconButtonComponent, HwLinkDirective, HwMenuComponent, HwMeterComponent, HwNotificationListComponent, HwPageHeaderComponent, HwPopoverComponent, HwPortalHeaderComponent, HwProgressComponent, HwServiceCardComponent, HwServiceDetailsComponent, HwSkeletonComponent, HwSpinnerComponent, HwStatComponent, HwStepperComponent, HwTableComponent, HwTimelineComponent, HwTooltipComponent, HwTooltipTriggerDirective, HwTreeViewComponent];
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
<hw-service-card title="Permit" [metadata]="facts" /><hw-service-details title="Permit" [metadata]="facts" [requirementTemplate]="entry" /><ng-template #entry let-requirement>{{ requirement }}</ng-template>
<hw-alert tone="danger" role="status" variant="outline" closeLabel="Close" (dismissed)="chosen('alert')">Saved</hw-alert><hw-skeleton variant="text" style="inline-size: 60%" /><hw-spinner aria-label="Loading" size="sm" />
<hw-progress aria-label="Upload" size="lg" [value]="40" /><hw-meter aria-labelledby="heading" [value]="10" /><hw-chip removeLabel="Remove" tone="info" variant="outline" size="sm" (removed)="chosen('chip')">Tag</hw-chip>
<hw-avatar-group aria-label="Team" [items]="people" [getOverflowLabel]="count" /><hw-button-group aria-label="Actions"><hw-icon-button aria-label="Search" aria-describedby="note" /></hw-button-group>
<hw-description-list variant="compact" [items]="facts" /><hw-stat label="Requests" trend="12%" trendTone="success" variant="plain" tone="danger" /><hw-timeline aria-label="History" [items]="history" />
<hw-notification-list aria-label="Inbox" emptyMessage="None" unreadLabel="Unread" [items]="notices" [getMarkReadLabel]="mark" (read)="chosen($event)" (dismissed)="chosen($event)" />
<hw-feedback aria-label="Feedback" yesLabel="Yes" noLabel="No" commentLabel="More" submitLabel="Send" successMessage="Thanks" [(value)]="answer" (feedback)="sent($event)" />
<hw-cookie-consent title="Cookies" description="Optional" acceptLabel="Accept" rejectLabel="Reject" variant="banner" [(open)]="open" (consent)="consented($event)" />
<button hwButton type="submit" loading disabled>Send</button><a hwLink href="/x" variant="neutral" current external disabled>Link</a>` })
export class Current {
  people: HwAvatarItem[] = [{ name: 'Rana Cole', initials: 'RC', size: '64', variant: 'square' }]; history: HwTimelineItem[] = [{ id: 'a', title: 'Sent', dateTime: '2026-10-27', dateLabel: '27 October', status: 'upcoming' }];
  notices: HwNotification[] = [{ id: 'a', title: 'Ready', dateTime: '2026-10-28', dateLabel: '28 October', read: false }]; answer: HwFeedbackValue = { helpful: null, comment: '' };
  count = (count: number) => String(count); mark = (item: HwNotification) => item.title; sent(value: HwFeedbackValue) { return value.helpful; } consented(choice: HwConsentChoice) { return choice; }
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
<hw-service-details title="Permit" [details]="[]" />
<hw-alert [dismissible]="true" closeLabel="Close" />
<hw-skeleton [width]="'60%'" />
<hw-skeleton [height]="'2rem'" />
<hw-chip [removable]="true" removeLabel="Remove" />
<hw-avatar-group label="Team" [avatars]="[]" [getOverflowLabel]="count" />
<hw-icon-button label="Search" [describedBy]="'note'" />
<hw-timeline label="History" [items]="[{id: 'a', title: 'Sent', state: 'complete'}]" />
<hw-timeline label="History" [items]="[{id: 'a', title: 'Sent', time: 'Today'}]" />
<hw-timeline label="History" [items]="[{id: 'a', title: 'Sent', status: 'active'}]" />
<hw-notification-list label="Inbox" emptyMessage="None" unreadLabel="Unread" [items]="[{id: 'a', title: 'Ready', unread: true}]" />
<hw-notification-list label="Inbox" emptyMessage="None" unreadLabel="Unread" [items]="[{id: 'a', title: 'Ready', time: 'Today'}]" />
<hw-feedback label="Helpful?" yesLabel="Yes" noLabel="No" commentLabel="More" submitLabel="Send" successMessage="Thanks" [value]="true" />
<hw-cookie-consent title="Cookies" description="Optional" acceptLabel="Accept" rejectLabel="Reject" [visible]="true" />
<hw-link href="/x">Text</hw-link>
<hw-feedback label="Helpful?" yesLabel="Yes" noLabel="No" successMessage="Thanks" />
<hw-cookie-consent title="Cookies" acceptLabel="Accept" rejectLabel="Reject" />` })
export class Removed { count = (count: number) => String(count); expanded: readonly string[] = []; name = (node: HwTreeNode) => node.label; seen(value: unknown) { return value; } }
