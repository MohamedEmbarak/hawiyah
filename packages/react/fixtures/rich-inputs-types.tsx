// Type fixture for react.rich-inputs.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { Combobox, FileDropzone, MultiSelect, ToggleGroup } from '../src/index.js';

const options = [{ value: 'a', label: 'A' }];
const comboTexts = { options, emptyMessage: 'None', getResultsMessage: (count: number) => `${count}` };
const multiTexts = { options, searchLabel: 'Filter', emptyMessage: 'None', getResultsMessage: (count: number) => `${count}` };
const rejectedMessage = (files: readonly File[]) => `${files.length} rejected`;

export const accepted = <>
  <Combobox label="City" {...comboTexts} onQueryChange={query => query.trim()} />
  <FileDropzone label="Files" dropLabel="Drop" />
  <FileDropzone label="Files" dropLabel="Drop" maxSize={5} getRejectedMessage={rejectedMessage} onReject={files => files.length} readOnly />
  <MultiSelect label="Services" {...multiTexts} getSelectedMessage={count => `${count}`} />
  <MultiSelect aria-label="Services" {...multiTexts} />
  <ToggleGroup label="View" options={options} hint="Hint" error="Error" required />
  <ToggleGroup aria-labelledby="view-heading" options={options} />
</>;

export const rejected = <>
  {/* @ts-expect-error [RENAME-02] onInputChange was renamed onQueryChange */}
  <Combobox label="City" {...comboTexts} onInputChange={(query: string) => query} />
  {/* @ts-expect-error [TEXT-02] maxSize requires getRejectedMessage */}
  <FileDropzone label="Files" dropLabel="Drop" maxSize={5} />
  {/* @ts-expect-error [TEXT-01] getResultsMessage is required */}
  <MultiSelect label="Services" options={options} searchLabel="Filter" emptyMessage="None" />
  {/* @ts-expect-error [NAME-04] a label, an aria-label or an aria-labelledby is required */}
  <ToggleGroup options={options} />
</>;
