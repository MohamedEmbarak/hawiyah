// The text an application supplies. Hawiyah ships no strings, so the test pages pass their own:
// one entry per component, holding the inputs that component needs for the text it renders.
const calendar = { previousLabel: 'Previous month', nextLabel: 'Next month', rangeLabel: 'Supported dates' };
export const text = {
  combobox: { emptyMessage: 'No results', requiredMessage: 'Select an option from the list.', getResultsMessage: (count: number) => `${count} results available` },
  passwordField: { showLabel: 'Show password', hideLabel: 'Hide password' },
  searchField: { clearLabel: 'Clear search', searchLabel: 'Search', getResultsMessage: (count: number) => `${count} suggestions available` },
  rangeSlider: { lowerLabel: 'Minimum', upperLabel: 'Maximum' },
  rating: { getRatingLabel: (value: number, max: number) => `${value} of ${max}` },
  ratingDisplay: { getValueLabel: (value: number, max: number) => `Rated ${value} of ${max}` },
  tagInput: { requiredMessage: 'Add at least one tag.', getRemoveLabel: (tag: string) => `Remove ${tag}` },
  multiSelect: { searchLabel: 'Search options', emptyMessage: 'No options', requiredMessage: 'Select at least one option.', getSelectedMessage: (count: number) => `${count} selected`, getResultsMessage: (count: number) => `${count} options match` },
  calendar: { label: 'Calendar', locale: 'ar-SA', ...calendar, unsupportedMessage: 'This date is outside the supported Umm al-Qura range.' },
  datePicker: { label: 'Date', locale: 'ar-SA', calendarLabel: 'Choose a date', openLabel: 'Open calendar', closeLabel: 'Close calendar', ...calendar, calendarSystemLabel: 'Calendar system', gregorianLabel: 'Gregorian', hijriLabel: 'Hijri', invalidMessage: 'Enter a valid date.', unsupportedMessage: 'This date is outside the supported Umm al-Qura range.' },
  fileDropzone: { label: 'Documents', dropLabel: 'Drop files here or choose files', getSelectedMessage: (files: readonly { name: string }[]) => `${files.length} files selected`, getRejectedMessage: (files: readonly { name: string }[]) => `${files.length} files were not accepted` },
  fileUploadList: { labels: { selected: 'Selected', uploading: 'Uploading', complete: 'Uploaded', error: 'Upload failed', remove: 'Remove', getProgressLabel: (name: string) => `Uploading ${name}`, getRemoveLabel: (name: string) => `Remove ${name}` } },
  treeView: { getExpandLabel: (node: { label: string }) => `Expand ${node.label}`, getCollapseLabel: (node: { label: string }) => `Collapse ${node.label}` },
  stepper: { completeLabel: 'Complete', upcomingLabel: 'Not started' },
  dialog: { closeLabel: 'Close dialog' },
  popover: { triggerLabel: 'Open' },
  tabs: { overflowLabel: 'More tabs' },
  pagination: { label: 'Pagination', previousLabel: 'Previous page', nextLabel: 'Next page', jumpLabel: 'Go to page', goLabel: 'Go', getPageLabel: (page: number) => `Page ${page}`, getGapLabel: (start: number, end: number) => `Pages ${start} to ${end}` },
  carousel: { previousLabel: 'Previous slide', nextLabel: 'Next slide', indicatorsLabel: 'Choose a slide', emptyLabel: 'No slides', getSlideLabel: (position: number, total: number) => `Slide ${position} of ${total}` },
  toastRegion: { label: 'Notifications', getDismissLabel: (toast: { title?: string; message: string }) => `Dismiss: ${toast.title ?? toast.message}` },
  table: { emptyMessage: 'No records' },
  dataTable: { emptyMessage: 'No records', locale: 'ar-SA' },
};
export type TextKey = keyof typeof text;

/** The same inputs as template attributes, for a host component that exposes `text`. */
export const withText = Object.fromEntries(Object.entries(text).map(([component, inputs]) => [component, Object.entries(inputs).map(([name, value]) => typeof value === 'string' ? `${name}="${value}"` : `[${name}]="text.${component}.${name}"`).join(' ')])) as Record<TextKey, string>;
