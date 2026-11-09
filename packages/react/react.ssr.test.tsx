// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as Hawiyah from './src/index.js';

describe('React server rendering', () => {
  it('imports and renders the complete catalog without browser globals', () => {
    expect(typeof window).toBe('undefined');
    const html = renderToString(<>
      <Hawiyah.Button>Continue</Hawiyah.Button>
      <Hawiyah.Field label="Reference"><Hawiyah.TextField name="reference" /></Hawiyah.Field>
      <Hawiyah.Textarea label="Notes" /><Hawiyah.Select label="Service" options={[{ value: 'permit', label: 'Permit' }]} />
      <Hawiyah.Checkbox label="Agree" /><Hawiyah.Radio name="kind" label="Person" /><Hawiyah.Switch label="Alerts" />
      <Hawiyah.Tabs label="Details" items={[{ value: 'one', label: 'One', content: 'First' }]} />
      <Hawiyah.Dialog title="Confirm" defaultOpen>Ready</Hawiyah.Dialog>
      <Hawiyah.Combobox label="City" options={[{ value: 'riyadh', label: 'Riyadh' }]} />
      <Hawiyah.Accordion items={[{ value: 'faq', title: 'Question', content: 'Answer' }]} />
      <Hawiyah.Card header="Card">Body</Hawiyah.Card><Hawiyah.Badge>New</Hawiyah.Badge><Hawiyah.Alert>Update</Hawiyah.Alert>
      <Hawiyah.Table caption="Requests"><tbody><tr><td>One</td></tr></tbody></Hawiyah.Table>
      <Hawiyah.Pagination totalPages={2} /><Hawiyah.Breadcrumb items={[{ label: 'Home' }]} />
      <Hawiyah.Progress label="Complete" value={50} /><Hawiyah.Skeleton /><Hawiyah.Spinner />
      <Hawiyah.Avatar name="Demo User" /><Hawiyah.Divider />
      <Hawiyah.Tooltip content="Help"><Hawiyah.Button>Info</Hawiyah.Button></Hawiyah.Tooltip>
      <Hawiyah.FileUpload label="Attachment" /><Hawiyah.Stepper current="start" items={[{ value: 'start', label: 'Start' }]} />
      <Hawiyah.EmptyState title="No requests" />
    </>);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('type="file"');
    expect(html).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/u);
  });
});
