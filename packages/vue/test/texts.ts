// Application text used by the tests. Hawiyah ships no built-in strings, so every test supplies its own.
const monthText = { locale: 'en-US', previousLabel: 'Previous month', nextLabel: 'Next month', unsupportedMessage: 'This date is outside the supported Umm al-Qura range.', rangeLabel: 'Supported Hijri range' } as const;
export const calendarText = { ...monthText, label: 'Calendar' } as const;
export const datePickerText = {
  ...monthText, calendarSystemLabel: 'Calendar system', gregorianLabel: 'Gregorian', hijriLabel: 'Hijri',
  calendarLabel: 'Choose a date', openLabel: 'Open calendar', closeLabel: 'Close calendar', invalidMessage: 'Enter a valid date.', unavailableMessage: 'This date is unavailable.',
} as const;
export const comboboxText = { emptyMessage: 'No options found', getResultsMessage: (count: number) => `${count} results available`, requiredMessage: 'Choose an option from the list.' } as const;
export const dialogText = { closeLabel: 'Close' } as const;
export const paginationText = {
  label: 'Pagination', previousLabel: 'Previous page', nextLabel: 'Next page', getPageLabel: (page: number) => `Page ${page}`,
  getGapLabel: (start: number, end: number) => `Pages ${start} to ${end}`, jumpLabel: 'Go to page', goLabel: 'Go',
} as const;
export const tabsText = { overflowLabel: 'More tabs' } as const;
export const multiSelectText = { searchLabel: 'Search options', emptyMessage: 'No options found', getResultsMessage: (count: number) => `${count} options shown`, requiredMessage: 'Choose at least one option.' } as const;
export const tagInputText = { getRemoveLabel: (tag: string) => `Remove ${tag}`, requiredMessage: 'Add at least one item.' } as const;
export const dropzoneText = { dropLabel: 'Choose files or drop them here', getRejectedMessage: (files: readonly File[]) => `Not accepted: ${files.map(file => file.name).join(', ')}` } as const;
export const rangeSliderText = { lowerLabel: 'Minimum', upperLabel: 'Maximum' } as const;
export const ratingText = { getRatingLabel: (value: number, max: number) => `${value} of ${max}` } as const;
export const stepperText = { completeLabel: 'Completed', upcomingLabel: 'Not started' } as const;
