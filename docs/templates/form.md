# Service request form

The template of a service request form: a page header, a form of text fields, a select, a radio group, a date picker and a file upload, the marking of required fields, a form-level error summary and the submit and cancel buttons. It is shown at rest and with validation errors.

## Example

The page header names the service and the form follows it in one column. A sentence at the start of the form states that an asterisk marks a required field. Each control carries a visible label, and the actions stand at the end of the form: submit first, cancel after it. Every text, label and message is written by the application in the language of the page; the values are fictional.

### Form at rest

No field has a message. Only the appointment date holds a fixed value, so that the example does not depend on today's date; the other fields are empty. The required fields show one marker after their label and keep the native `required` attribute. The delivery option has one option selected, so the group always holds a value. The form has the attribute novalidate, so the application validates and writes the messages itself; without it the browser shows its own messages.

```html live example=rest static differences=text-field-adapter-attributes,select-adapter-attributes,file-upload-adapter-labelledby,radio-adapter-markup,date-picker-adapter-markup,stack-vue-layout-attributes,inline-vue-layout-attributes,date-picker-value-order,date-picker-adapter-height frame
<div class="hw-stack">
  <header class="hw-page-header">
    <div class="hw-page-header-main">
      <div><h1>Request a service</h1><p>Complete the form to submit a service request. You can review the request before it is sent.</p></div>
    </div>
  </header>
  <form novalidate>
    <div class="hw-stack">
      <p>Fields marked with an asterisk (*) are required.</p>
      <div class="hw-field">
        <label class="hw-label" for="rest-name" id="rest-name-label">Full name<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-name" name="full-name" autocomplete="name" required aria-describedby="rest-name-hint">
        <p class="hw-hint" id="rest-name-hint">Write the name as it appears on your identity document.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-email" id="rest-email-label">Email address<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-email" name="email" type="email" autocomplete="email" required>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-mobile" id="rest-mobile-label">Mobile number</label>
        <input class="hw-input" id="rest-mobile" name="mobile" type="tel" autocomplete="tel">
      </div>
      <div class="hw-field">
        <label class="hw-label" for="rest-type" id="rest-type-label">Type of request<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <select class="hw-select" id="rest-type" name="type" required>
          <option value="">Select a type</option>
          <option value="new">New application</option>
          <option value="renewal">Renewal</option>
          <option value="replacement">Replacement</option>
        </select>
      </div>
      <fieldset class="hw-field">
        <legend class="hw-label">How would you like to receive the decision?</legend>
        <label class="hw-choice" for="rest-delivery-post"><input class="hw-radio" id="rest-delivery-post" name="delivery" type="radio" value="post" checked>By post</label>
        <label class="hw-choice" for="rest-delivery-email"><input class="hw-radio" id="rest-delivery-email" name="delivery" type="radio" value="email">By email</label>
        <label class="hw-choice" for="rest-delivery-office"><input class="hw-radio" id="rest-delivery-office" name="delivery" type="radio" value="office">Collect in person</label>
      </fieldset>
      <div class="hw-date-picker" data-hw="date-picker" data-hw-locale="en" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri (Umm al-Qura)" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a date in the form YYYY-MM-DD." data-hw-unsupported-message="This date is outside the supported Umm al-Qura range.">
        <label class="hw-label" for="rest-date">Preferred appointment date<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <div class="hw-date-picker-control"><input class="hw-input" id="rest-date" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="appointment" value="2026-03-12" required aria-describedby="rest-date-hint">
        <button type="button" data-hw-date-trigger aria-label="Open calendar">Calendar</button></div>
        <p class="hw-hint" id="rest-date-hint">Use the form YYYY-MM-DD.</p>
        <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
          <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
          <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
        </dialog>
      </div>
      <div class="hw-field hw-upload">
        <label class="hw-label" for="rest-document" id="rest-document-label">Supporting document<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="rest-document" name="document" type="file" accept=".pdf,.jpg,.png" required aria-describedby="rest-document-hint">
        <p class="hw-hint" id="rest-document-hint">Attach a PDF, JPG or PNG file of up to 2 MB.</p>
      </div>
      <div class="hw-inline">
        <button class="hw-button" type="submit" data-variant="primary" data-size="md">Submit the request</button>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">Cancel</button>
      </div>
    </div>
  </form>
</div>
```

```tsx live example=rest
<Stack>
  <PageHeader
    title="Request a service"
    description="Complete the form to submit a service request. You can review the request before it is sent."
  />
  <form noValidate>
    <Stack>
      <p>Fields marked with an asterisk (*) are required.</p>
      <TextField id="rest-name" label="Full name" name="full-name" autoComplete="name" required hint="Write the name as it appears on your identity document." />
      <TextField id="rest-email" label="Email address" name="email" type="email" autoComplete="email" required />
      <TextField id="rest-mobile" label="Mobile number" name="mobile" type="tel" autoComplete="tel" />
      <Select
        id="rest-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        required
        options={[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]}
      />
      <fieldset className="hw-field">
        <legend className="hw-label">How would you like to receive the decision?</legend>
        <Radio label="By post" name="delivery" value="post" defaultChecked />
        <Radio label="By email" name="delivery" value="email" />
        <Radio label="Collect in person" name="delivery" value="office" />
      </fieldset>
      <DatePicker id="rest-date" name="appointment" defaultValue="2026-03-12" required locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." />
      <FileUpload id="rest-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" required hint="Attach a PDF, JPG or PNG file of up to 2 MB." />
      <Inline>
        <Button variant="primary" type="submit">Submit the request</Button>
        <Button variant="secondary" type="button">Cancel</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```vue live example=rest
<Stack>
  <PageHeader title="Request a service" description="Complete the form to submit a service request. You can review the request before it is sent." />
  <form novalidate>
    <Stack>
      <p>Fields marked with an asterisk (*) are required.</p>
      <TextField id="rest-name" label="Full name" name="full-name" autocomplete="name" required hint="Write the name as it appears on your identity document." />
      <TextField id="rest-email" label="Email address" name="email" type="email" autocomplete="email" required />
      <TextField id="rest-mobile" label="Mobile number" name="mobile" type="tel" autocomplete="tel" />
      <Select
        id="rest-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        required
        :options="[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]"
      />
      <fieldset class="hw-field">
        <legend class="hw-label">How would you like to receive the decision?</legend>
        <Radio label="By post" name="delivery" value="post" default-value="post" />
        <Radio label="By email" name="delivery" value="email" default-value="post" />
        <Radio label="Collect in person" name="delivery" value="office" default-value="post" />
      </fieldset>
      <DatePicker id="rest-date" name="appointment" default-value="2026-03-12" required locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendar-label="Choose appointment date" open-label="Open calendar" close-label="Close" previous-label="Previous month" next-label="Next month" calendar-system-label="Calendar system" gregorian-label="Gregorian" hijri-label="Hijri (Umm al-Qura)" range-label="Supported range" invalid-message="Enter a date in the form YYYY-MM-DD." unsupported-message="This date is outside the supported Umm al-Qura range." />
      <FileUpload id="rest-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" required hint="Attach a PDF, JPG or PNG file of up to 2 MB." />
      <Inline>
        <Button variant="primary" type="submit">Submit the request</Button>
        <Button variant="secondary" type="button">Cancel</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```ts live example=rest framework=angular
template: `<hw-stack>
  <hw-page-header title="Request a service" description="Complete the form to submit a service request. You can review the request before it is sent." />
  <form novalidate>
    <hw-stack>
      <p>Fields marked with an asterisk (*) are required.</p>
      <hw-text-field controlId="rest-name" label="Full name" name="full-name" autocomplete="name" [required]="true" hint="Write the name as it appears on your identity document." />
      <hw-text-field controlId="rest-email" label="Email address" name="email" type="email" autocomplete="email" [required]="true" />
      <hw-text-field controlId="rest-mobile" label="Mobile number" name="mobile" type="tel" autocomplete="tel" />
      <hw-select
        controlId="rest-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        [required]="true"
        [options]="[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]"
      />
      <hw-radio-group label="How would you like to receive the decision?" name="delivery" value="post" [options]="[
        { value: 'post', label: 'By post' },
        { value: 'email', label: 'By email' },
        { value: 'office', label: 'Collect in person' },
      ]" />
      <hw-date-picker controlId="rest-date" name="appointment" value="2026-03-12" [required]="true" locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." />
      <hw-file-upload controlId="rest-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" [required]="true" hint="Attach a PDF, JPG or PNG file of up to 2 MB." />
      <hw-inline>
        <button hwButton variant="primary" type="submit">Submit the request</button>
        <button hwButton variant="secondary" type="button">Cancel</button>
      </hw-inline>
    </hw-stack>
  </form>
</hw-stack>`
```

### Form with validation errors

The application has validated the submission. The error summary is a danger Alert at the start of the form, before the notice of required fields, and lists each problem as a link to its field. Each field with a problem shows its message in a paragraph after the control, marks the control with `aria-invalid="true"` and describes it with the message. The summary has `role="status"` because the markup is rendered with the page and is not a late event; an application that adds the summary after a submission uses the default role of the danger tone, which interrupts the reader, and moves focus to the summary. The Alert is not focusable, so the application gives the summary the `tabindex` attribute with the value -1 before it moves focus. The markup is static: it holds no script and does not validate.

```html live example=errors static differences=text-field-adapter-attributes,select-adapter-attributes,file-upload-adapter-labelledby,radio-adapter-markup,date-picker-adapter-markup,stack-vue-layout-attributes,inline-vue-layout-attributes,date-picker-value-order,date-picker-adapter-height frame
<div class="hw-stack">
  <header class="hw-page-header">
    <div class="hw-page-header-main">
      <div><h1>Request a service</h1><p>Complete the form to submit a service request. You can review the request before it is sent.</p></div>
    </div>
  </header>
  <form novalidate>
    <div class="hw-stack">
      <div class="hw-alert" data-tone="danger" role="status">
        <div class="hw-alert-content"><strong>The request was not submitted.</strong><p>Correct the following and submit the request again.</p><ul class="hw-stack">
          <li><a class="hw-link" href="#errors-name">Enter your full name.</a></li>
          <li><a class="hw-link" href="#errors-email">Enter an email address in the form name@example.com.</a></li>
          <li><a class="hw-link" href="#errors-type">Select the type of request.</a></li>
          <li><a class="hw-link" href="#errors-date">Choose a working day for the appointment.</a></li>
          <li><a class="hw-link" href="#errors-document">Attach the supporting document before you submit the request.</a></li>
        </ul></div>
      </div>
      <p>Fields marked with an asterisk (*) are required.</p>
      <div class="hw-field">
        <label class="hw-label" for="errors-name" id="errors-name-label">Full name<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-name" name="full-name" autocomplete="name" required aria-invalid="true" aria-describedby="errors-name-hint errors-name-error">
        <p class="hw-hint" id="errors-name-hint">Write the name as it appears on your identity document.</p>
        <p class="hw-error" id="errors-name-error">Enter your full name.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-email" id="errors-email-label">Email address<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-email" name="email" type="email" autocomplete="email" value="applicant.example.com" required aria-invalid="true" aria-describedby="errors-email-error">
        <p class="hw-error" id="errors-email-error">Enter an email address in the form name@example.com.</p>
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-mobile" id="errors-mobile-label">Mobile number</label>
        <input class="hw-input" id="errors-mobile" name="mobile" type="tel" autocomplete="tel" value="0500000000">
      </div>
      <div class="hw-field">
        <label class="hw-label" for="errors-type" id="errors-type-label">Type of request<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <select class="hw-select" id="errors-type" name="type" required aria-invalid="true" aria-describedby="errors-type-error">
          <option value="">Select a type</option>
          <option value="new">New application</option>
          <option value="renewal">Renewal</option>
          <option value="replacement">Replacement</option>
        </select>
        <p class="hw-error" id="errors-type-error">Select the type of request.</p>
      </div>
      <fieldset class="hw-field">
        <legend class="hw-label">How would you like to receive the decision?</legend>
        <label class="hw-choice" for="errors-delivery-post"><input class="hw-radio" id="errors-delivery-post" name="delivery" type="radio" value="post" checked>By post</label>
        <label class="hw-choice" for="errors-delivery-email"><input class="hw-radio" id="errors-delivery-email" name="delivery" type="radio" value="email">By email</label>
        <label class="hw-choice" for="errors-delivery-office"><input class="hw-radio" id="errors-delivery-office" name="delivery" type="radio" value="office">Collect in person</label>
      </fieldset>
      <div class="hw-date-picker" data-hw="date-picker" data-hw-locale="en" data-hw-previous-label="Previous month" data-hw-next-label="Next month" data-hw-calendar-system-label="Calendar system" data-hw-gregorian-label="Gregorian" data-hw-hijri-label="Hijri (Umm al-Qura)" data-hw-range-label="Supported range" data-hw-invalid-message="Enter a date in the form YYYY-MM-DD." data-hw-unsupported-message="This date is outside the supported Umm al-Qura range.">
        <label class="hw-label" for="errors-date">Preferred appointment date<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <div class="hw-date-picker-control"><input class="hw-input" id="errors-date" type="text" placeholder="YYYY-MM-DD" data-hw-date-input name="appointment" value="2026-03-14" required aria-invalid="true" aria-describedby="errors-date-hint errors-date-error">
        <button type="button" data-hw-date-trigger aria-label="Open calendar">Calendar</button></div>
        <p class="hw-hint" id="errors-date-hint">Use the form YYYY-MM-DD.</p>
        <p class="hw-error" id="errors-date-error">Choose a working day for the appointment.</p>
        <dialog class="hw-dialog" data-hw-date-dialog aria-label="Choose appointment date">
          <header class="hw-dialog-header"><h2>Choose appointment date</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>Close</button></header>
          <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
        </dialog>
      </div>
      <div class="hw-field hw-upload">
        <label class="hw-label" for="errors-document" id="errors-document-label">Supporting document<span class="hw-required-marker" aria-hidden="true"> *</span></label>
        <input class="hw-input" id="errors-document" name="document" type="file" accept=".pdf,.jpg,.png" required aria-invalid="true" aria-describedby="errors-document-hint errors-document-error">
        <p class="hw-hint" id="errors-document-hint">Attach a PDF, JPG or PNG file of up to 2 MB.</p>
        <p class="hw-error" id="errors-document-error">Attach the supporting document before you submit the request.</p>
      </div>
      <div class="hw-inline">
        <button class="hw-button" type="submit" data-variant="primary" data-size="md">Submit the request</button>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">Cancel</button>
      </div>
    </div>
  </form>
</div>
```

```tsx live example=errors
<Stack>
  <PageHeader
    title="Request a service"
    description="Complete the form to submit a service request. You can review the request before it is sent."
  />
  <form noValidate>
    <Stack>
      <Alert tone="danger" role="status" title="The request was not submitted.">
        <p>Correct the following and submit the request again.</p>
        <ul className="hw-stack">
          <li><Link href="#errors-name">Enter your full name.</Link></li>
          <li><Link href="#errors-email">Enter an email address in the form name@example.com.</Link></li>
          <li><Link href="#errors-type">Select the type of request.</Link></li>
          <li><Link href="#errors-date">Choose a working day for the appointment.</Link></li>
          <li><Link href="#errors-document">Attach the supporting document before you submit the request.</Link></li>
        </ul>
      </Alert>
      <p>Fields marked with an asterisk (*) are required.</p>
      <TextField id="errors-name" label="Full name" name="full-name" autoComplete="name" required hint="Write the name as it appears on your identity document." error="Enter your full name." />
      <TextField id="errors-email" label="Email address" name="email" type="email" autoComplete="email" defaultValue="applicant.example.com" required error="Enter an email address in the form name@example.com." />
      <TextField id="errors-mobile" label="Mobile number" name="mobile" type="tel" autoComplete="tel" defaultValue="0500000000" />
      <Select
        id="errors-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        required
        error="Select the type of request."
        options={[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]}
      />
      <fieldset className="hw-field">
        <legend className="hw-label">How would you like to receive the decision?</legend>
        <Radio label="By post" name="delivery" value="post" defaultChecked />
        <Radio label="By email" name="delivery" value="email" />
        <Radio label="Collect in person" name="delivery" value="office" />
      </fieldset>
      <DatePicker id="errors-date" name="appointment" defaultValue="2026-03-14" required locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." error="Choose a working day for the appointment." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." />
      <FileUpload id="errors-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" required hint="Attach a PDF, JPG or PNG file of up to 2 MB." error="Attach the supporting document before you submit the request." />
      <Inline>
        <Button variant="primary" type="submit">Submit the request</Button>
        <Button variant="secondary" type="button">Cancel</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```vue live example=errors
<Stack>
  <PageHeader title="Request a service" description="Complete the form to submit a service request. You can review the request before it is sent." />
  <form novalidate>
    <Stack>
      <Alert tone="danger" role="status" title="The request was not submitted.">
        <p>Correct the following and submit the request again.</p>
        <ul class="hw-stack">
          <li><Link href="#errors-name">Enter your full name.</Link></li>
          <li><Link href="#errors-email">Enter an email address in the form name@example.com.</Link></li>
          <li><Link href="#errors-type">Select the type of request.</Link></li>
          <li><Link href="#errors-date">Choose a working day for the appointment.</Link></li>
          <li><Link href="#errors-document">Attach the supporting document before you submit the request.</Link></li>
        </ul>
      </Alert>
      <p>Fields marked with an asterisk (*) are required.</p>
      <TextField id="errors-name" label="Full name" name="full-name" autocomplete="name" required hint="Write the name as it appears on your identity document." error="Enter your full name." />
      <TextField id="errors-email" label="Email address" name="email" type="email" autocomplete="email" default-value="applicant.example.com" required error="Enter an email address in the form name@example.com." />
      <TextField id="errors-mobile" label="Mobile number" name="mobile" type="tel" autocomplete="tel" default-value="0500000000" />
      <Select
        id="errors-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        required
        error="Select the type of request."
        :options="[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]"
      />
      <fieldset class="hw-field">
        <legend class="hw-label">How would you like to receive the decision?</legend>
        <Radio label="By post" name="delivery" value="post" default-value="post" />
        <Radio label="By email" name="delivery" value="email" default-value="post" />
        <Radio label="Collect in person" name="delivery" value="office" default-value="post" />
      </fieldset>
      <DatePicker id="errors-date" name="appointment" default-value="2026-03-14" required locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." error="Choose a working day for the appointment." placeholder="YYYY-MM-DD" calendar-label="Choose appointment date" open-label="Open calendar" close-label="Close" previous-label="Previous month" next-label="Next month" calendar-system-label="Calendar system" gregorian-label="Gregorian" hijri-label="Hijri (Umm al-Qura)" range-label="Supported range" invalid-message="Enter a date in the form YYYY-MM-DD." unsupported-message="This date is outside the supported Umm al-Qura range." />
      <FileUpload id="errors-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" required hint="Attach a PDF, JPG or PNG file of up to 2 MB." error="Attach the supporting document before you submit the request." />
      <Inline>
        <Button variant="primary" type="submit">Submit the request</Button>
        <Button variant="secondary" type="button">Cancel</Button>
      </Inline>
    </Stack>
  </form>
</Stack>
```

```ts live example=errors framework=angular
template: `<hw-stack>
  <hw-page-header title="Request a service" description="Complete the form to submit a service request. You can review the request before it is sent." />
  <form novalidate>
    <hw-stack>
      <hw-alert tone="danger" role="status" title="The request was not submitted.">
        <p>Correct the following and submit the request again.</p>
        <ul class="hw-stack">
          <li><a hwLink href="#errors-name">Enter your full name.</a></li>
          <li><a hwLink href="#errors-email">Enter an email address in the form name@example.com.</a></li>
          <li><a hwLink href="#errors-type">Select the type of request.</a></li>
          <li><a hwLink href="#errors-date">Choose a working day for the appointment.</a></li>
          <li><a hwLink href="#errors-document">Attach the supporting document before you submit the request.</a></li>
        </ul>
      </hw-alert>
      <p>Fields marked with an asterisk (*) are required.</p>
      <hw-text-field controlId="errors-name" label="Full name" name="full-name" autocomplete="name" [required]="true" hint="Write the name as it appears on your identity document." error="Enter your full name." />
      <hw-text-field controlId="errors-email" label="Email address" name="email" type="email" autocomplete="email" value="applicant.example.com" [required]="true" error="Enter an email address in the form name@example.com." />
      <hw-text-field controlId="errors-mobile" label="Mobile number" name="mobile" type="tel" autocomplete="tel" value="0500000000" />
      <hw-select
        controlId="errors-type"
        label="Type of request"
        name="type"
        placeholder="Select a type"
        [required]="true"
        error="Select the type of request."
        [options]="[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'replacement', label: 'Replacement' },
        ]"
      />
      <hw-radio-group label="How would you like to receive the decision?" name="delivery" value="post" [options]="[
        { value: 'post', label: 'By post' },
        { value: 'email', label: 'By email' },
        { value: 'office', label: 'Collect in person' },
      ]" />
      <hw-date-picker controlId="errors-date" name="appointment" value="2026-03-14" [required]="true" locale="en" label="Preferred appointment date" hint="Use the form YYYY-MM-DD." error="Choose a working day for the appointment." placeholder="YYYY-MM-DD" calendarLabel="Choose appointment date" openLabel="Open calendar" closeLabel="Close" previousLabel="Previous month" nextLabel="Next month" calendarSystemLabel="Calendar system" gregorianLabel="Gregorian" hijriLabel="Hijri (Umm al-Qura)" rangeLabel="Supported range" invalidMessage="Enter a date in the form YYYY-MM-DD." unsupportedMessage="This date is outside the supported Umm al-Qura range." />
      <hw-file-upload controlId="errors-document" label="Supporting document" name="document" accept=".pdf,.jpg,.png" [required]="true" hint="Attach a PDF, JPG or PNG file of up to 2 MB." error="Attach the supporting document before you submit the request." />
      <hw-inline>
        <button hwButton variant="primary" type="submit">Submit the request</button>
        <button hwButton variant="secondary" type="button">Cancel</button>
      </hw-inline>
    </hw-stack>
  </form>
</hw-stack>`
```

## Composition

- [PageHeader](../components/page-header.md) names the service and states what the reader can do on the page. The title is the `h1` of the page.
- [Stack](../components/stack.md) keeps the notice, the fields and the actions in one column with one space between them. The `form` element stands between two stacks: the outer one holds the header and the form, the inner one holds the notice, the fields and the actions.
- [Alert](../components/alert.md) carries the error summary. Hawiyah 0.3.0 has no error summary component: the alert holds a title, one sentence and a list of links, written by the application, and the application moves focus to it after a failed submission, which needs the `tabindex` attribute with the value -1 on the alert because it is not focusable.
- [Link](../components/link.md) is each entry of the error summary and leads to the field with the problem.
- [TextField](../components/text-field.md) collects the name, the email address and the mobile number. A required field shows its marker and an error shows after the control.
- [Select](../components/select.md) collects the type of request; its empty first option prompts the reader and is the value that the browser rejects when the field is required.
- [Radio](../components/radio.md) collects the delivery option. In the vanilla, React and Vue blocks the application writes the `fieldset` and the `legend`, and a radio shows no required marker; the Angular block uses `hw-radio-group`, which renders them. The group is not marked as required, and the application preselects one option so that the group always holds a value.
- [DatePicker](../components/date-picker.md) collects the preferred appointment date as an ISO date. The group holds a fixed value, so that the example does not depend on today's date.
- [FileUpload](../components/file-upload.md) selects the supporting document. It does not send the file; transport and server validation belong to the application.
- [Inline](../components/inline.md) lays the two actions in one row, which wraps when the row is narrow.
- [Button](../components/button.md) is the primary submit action and the secondary cancel action. The application gives the cancel action its effect.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the template; the evidence of each component is on its own page.

### Sources

- The [coverage notes](../coverage.md) map the native input types to components, among them the file input to FileUpload or FileDropzone, the date input to DatePicker and the submit control to a Button with the submit type. The notes do not record a match of this template with a template of the supplied Platforms Code files.
- The [input validation notes](../input-validation-colors.md) describe the explicit application error that marks a field invalid and states that the application decides when to show it, which is the basis of the error state of the second group.
- The [layout notes](../layout.md) state that layout is CSS-driven; the template uses no measurement of the viewport in script.
