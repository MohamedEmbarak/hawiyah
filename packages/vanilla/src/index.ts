import { createSearchField } from './search-field.js';
import { observeReadonlyChoice, observeFieldValue, type FieldValueElement, type FieldValueObserver } from '@hawiyah/core';
import { createTabs } from './tabs.js';
import { createContentNavigation } from './content-navigation.js';
export { createContentNavigation };
export type { ContentNavigationOptions, ContentNavigationController } from './content-navigation.js';
import { createStepper } from './stepper.js';
export { createStepper };
export type { StepperOptions, StepperController } from './stepper.js';
import { createAccordion } from './accordion.js';
export { createAccordion };
export type { AccordionOptions, AccordionController } from './accordion.js';
import { createPortalHeader } from './portal.js';
import { createSkipLink } from './skip-link.js';
export { createSkipLink };
export type { SkipLinkController } from './skip-link.js';
import { createNavigationDrawer } from './navigation-drawer.js';
export { createNavigationDrawer };
export type { NavigationDrawerOptions, NavigationDrawerController } from './navigation-drawer.js';
import { createSideNavigation } from './side-navigation.js';
export { createSideNavigation };
export type { SideNavigationOptions, SideNavigationController } from './side-navigation.js';
import { createCopyButton } from './copy-button.js';
export { createCopyButton };
export type { CopyButtonOptions, CopyButtonController } from './copy-button.js';
export type { CopyStatus, CopyResult } from '@hawiyah/core';
export { createPortalHeader };
export type { PortalHeaderOptions, PortalHeaderController } from './portal.js';
import { createDialog } from './dialog.js';
import { createCombobox } from './combobox.js';
import { createTooltip } from './tooltip.js';
import { createPagination } from './pagination.js';
import { createPasswordField, createRangeSlider, createRating, createPinInput, createTagInput, createMultiSelect, createFileDropzone } from './controls.js';
import { createPopover, createMenu, createDrawer, createToastRegion } from './disclosures.js';
import { createCalendar, createDatePicker } from './calendar.js';
import { createToggleGroup, createFeedback, createCookieConsent, createTreeView, createCarousel, createDataTable } from './content.js';

export { createTabs, createDialog, createCombobox, createTooltip, createPagination };
export { createSearchField };
export type { SearchFieldOptions, SearchFieldController } from './search-field.js';
export { createPasswordField, createRangeSlider, createRating, createPinInput, createTagInput, createMultiSelect, createFileDropzone, createPopover, createMenu, createDrawer, createToastRegion };
export { createCalendar, createDatePicker };
export { createToggleGroup, createFeedback, createCookieConsent, createTreeView, createCarousel, createDataTable };
export type { ToggleGroupOptions, ToggleGroupController, FeedbackOptions, FeedbackController, ConsentChoice, CookieConsentOptions, CookieConsentController, TreeViewOptions, TreeViewController, CarouselOptions, CarouselController, SortDirection, DataTableOptions, DataTableController } from './content.js';
export type { CalendarOptions, CalendarController, DatePickerOptions, DatePickerController } from './calendar.js';
export type { ValueController, PasswordFieldOptions, RangeSliderOptions, RatingOptions, PinInputOptions, TagInputOptions, MultiSelectOptions, FileDropzoneOptions } from './controls.js';
export type { PopoverOptions, PopoverController, MenuOptions, ToastRegionOptions } from './disclosures.js';
export type { TabsOptions, TabsController } from './tabs.js';
export type { DialogOptions, DialogController } from './dialog.js';
export type { ComboboxOptions, ComboboxController } from './combobox.js';
export type { TooltipOptions, TooltipController } from './tooltip.js';
export type { PaginationOptions, PaginationController } from './pagination.js';

type Controller = { destroy(): void };
const registry = new WeakMap<HTMLElement, { controller: Controller; references: number }>();
const factories: Record<string, (element: HTMLElement) => Controller> = {
  'content-navigation': createContentNavigation,
  stepper: element => createStepper(element as HTMLOListElement),
  accordion: createAccordion,
  'navigation-drawer': element => createNavigationDrawer(element as HTMLDialogElement),
  'side-navigation': createSideNavigation, 'copy-button': createCopyButton,
  'portal-header': createPortalHeader,
  'skip-link': element => createSkipLink(element as HTMLAnchorElement),
  tabs: createTabs, dialog: element => createDialog(element as HTMLDialogElement), combobox: createCombobox,
  'search-field': createSearchField, tooltip: createTooltip, pagination: createPagination, 'password-field': createPasswordField,
  'range-slider': createRangeSlider, rating: createRating, 'pin-input': createPinInput, 'tag-input': createTagInput,
  'multi-select': createMultiSelect, 'file-dropzone': createFileDropzone,
  popover: createPopover, menu: createMenu, drawer: element => createDrawer(element as HTMLDialogElement),
  'toast-region': createToastRegion,
  calendar: createCalendar, 'date-picker': createDatePicker,
  'toggle-group': createToggleGroup, feedback: createFeedback, 'cookie-consent': createCookieConsent,
  'tree-view': createTreeView, carousel: createCarousel, 'data-table': createDataTable,
};
const selector = Object.keys(factories).map(name => `[data-hw="${name}"]`).join(', ');

/** Enhance existing semantic HTML; call the returned function before removing it. */
export function enhance(root?: ParentNode): () => void {
  const target = root ?? (typeof document === 'undefined' ? undefined : document);
  if (!target) return () => {};
  const elements = [...target.querySelectorAll<HTMLElement>(selector)];
  if ('matches' in target && typeof target.matches === 'function' && target.matches(selector)) elements.unshift(target as HTMLElement);
  const acquired: HTMLElement[] = [];
  const fields: FieldValueObserver[] = [];
  let destroyed = false;
  const release = () => {
    if (destroyed) return;
    destroyed = true;
    for (const field of fields) field.destroy();
    let failed = false;
    let firstError: unknown;
    for (const element of acquired.reverse()) {
      const entry = registry.get(element);
      if (!entry || --entry.references > 0) continue;
      registry.delete(element);
      try { entry.controller.destroy(); } catch (error) { if (!failed) firstError = error; failed = true; }
    }
    if (failed) throw firstError;
  };
  try {
    for (const element of elements) {
      const existing = registry.get(element);
      if (existing) { existing.references++; acquired.push(element); continue; }
      const factory = factories[element.dataset.hw || ''];
      if (!factory) continue;
      const controller = factory(element);
      registry.set(element, { controller, references: 1 });
      acquired.push(element);
    }
    const inputs = [...target.querySelectorAll<FieldValueElement>('.hw-input, .hw-textarea, .hw-select')];
    if ('matches' in target && typeof target.matches === 'function' && target.matches('.hw-input, .hw-textarea, .hw-select')) inputs.unshift(target as FieldValueElement);
    for (const input of inputs) fields.push(observeFieldValue(input));
    const choices = [...target.querySelectorAll<HTMLInputElement>('.hw-checkbox, .hw-radio, .hw-switch')];
    if ('matches' in target && typeof target.matches === 'function' && target.matches('.hw-checkbox, .hw-radio, .hw-switch')) choices.unshift(target as HTMLInputElement);
    for (const input of choices) fields.push(observeReadonlyChoice(input));
  } catch (error) { release(); throw error; }
  return release;
}

export { createFileUploadList } from './file-upload-list.js';
export type { FileUploadListOptions } from './file-upload-list.js';
