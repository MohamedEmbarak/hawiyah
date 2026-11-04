import type {Locale} from './data';

export const basicInputComponents = {
  field: 'Field',
  'input-group': 'InputGroup',
  'password-field': 'PasswordField',
  'number-field': 'NumberField',
  slider: 'Slider',
  'range-slider': 'RangeSlider',
} as const;
export type BasicInputId = keyof typeof basicInputComponents;
export const basicInputProjectIds = Object.keys(basicInputComponents) as BasicInputId[];
export function isBasicInputId(id: string): id is BasicInputId {
  return Object.hasOwn(basicInputComponents, id);
}

interface Example {
  initialValue: string;
  stateType: string;
  angularStateType?: string;
  componentImports?: string;
  angularImports?: string;
  vanilla: string;
  react: string;
  vue: string;
  angular: string;
  output: {label: string; initial: string; react: string; vue: string; angular: string};
  /** Statements for the vanilla form's refresh() body. */
  display: string;
}

export interface BasicInputProjectRecipe {
  initialValue: string;
  stateType: string;
  angularStateType: string;
  componentImports: string;
  angularImports: string;
  vanilla: string;
  vanillaScript: string;
  react: string;
  vue: string;
  angular: string;
}

type Translate = (english: string, arabic: string) => string;
const text = (value: string) => JSON.stringify(value);

function field(t: Translate): Example {
  const label = t('Service name', 'اسم الخدمة');
  const hint = t('Enter at least 3 characters.', 'أدخل 3 أحرف على الأقل.');
  const error = t('The service name needs at least 3 characters.', 'يجب أن يتكون اسم الخدمة من 3 أحرف على الأقل.');
  const invalid = 'value.touched && value.name.trim().length < 3';
  return {
    initialValue: "{ name: '', touched: false }", stateType: '{ name: string; touched: boolean }',
    componentImports: 'Field, TextField',
    vanilla: `<div class="nq-field">\n  <label class="nq-label" for="service-name">${label} <span class="nq-required-marker" aria-hidden="true">*</span></label>\n  <input class="nq-input" id="service-name" name="serviceName" required minlength="3" aria-describedby="service-name-hint">\n  <span class="nq-hint" id="service-name-hint">${hint}</span>\n  <span class="nq-error" id="service-name-error" hidden>${error}</span>\n</div>`,
    react: `<Field controlId="service-name" label="${label}" hint="${hint}" required\n  error={${invalid} ? '${error}' : undefined}>\n  <TextField name="serviceName" minLength={3} value={value.name}\n    onChange={event => setValue({ ...value, name: event.currentTarget.value })}\n    onBlur={() => setValue({ ...value, touched: true })} />\n</Field>`,
    vue: `<Field control-id="service-name" label="${label}" hint="${hint}" required\n  :error="${invalid} ? '${error}' : undefined">\n  <TextField name="serviceName" minlength="3" v-model="value.name" @blur="value.touched = true" />\n</Field>`,
    angular: `<nq-field #field controlId="service-name" label="${label}" hint="${hint}" required\n  [error]="${invalid} ? '${error}' : ''">\n  <input #serviceName class="nq-input" id="service-name" name="serviceName" minlength="3"\n    [required]="field.required" [attr.aria-describedby]="field.descriptionIds"\n    [attr.aria-invalid]="field.error ? true : null" [value]="value.name"\n    (input)="value.name = serviceName.value" (blur)="value.touched = true">\n</nq-field>`,
    output: {label: t('Current name', 'الاسم الحالي'), initial: '—', react: "value.name || '—'", vue: "value.name || '—'", angular: "value.name || '—'"},
    display: `const input = form.elements.namedItem('serviceName');\n    const error = form.querySelector('.nq-error');\n    if (!(input instanceof HTMLInputElement) || !(error instanceof HTMLElement)) return;\n    const invalid = touched && input.value.trim().length < 3;\n    error.hidden = !invalid;\n    if (invalid) input.setAttribute('aria-invalid', 'true');\n    else input.removeAttribute('aria-invalid');\n    input.setAttribute('aria-describedby', invalid ? 'service-name-hint service-name-error' : 'service-name-hint');\n    output.value = input.value || '—';`,
  };
}

function inputGroup(t: Translate): Example {
  const label = t('Amount in Saudi riyals', 'المبلغ بالريال السعودي');
  const symbol = '<span class="nq-riyal" aria-hidden="true">⃁</span>';
  const attributes = 'id="service-fee" name="fee" type="number" dir="ltr" min="0" step="0.05" required';
  return {
    initialValue: "'25.00'", stateType: 'string', componentImports: 'InputGroup, TextField',
    vanilla: `<label class="nq-label" for="service-fee">${label}</label>\n<div class="nq-input-group"><span class="nq-input-addon">${symbol}</span><input class="nq-input" ${attributes} value="25.00"></div>`,
    react: `<label className="nq-label" htmlFor="service-fee">${label}</label>\n<InputGroup start={${symbol.replace('class=', 'className=')}}>\n  <TextField ${attributes} value={value} onChange={event => setValue(event.currentTarget.value)} />\n</InputGroup>`,
    vue: `<label class="nq-label" for="service-fee">${label}</label>\n<InputGroup>\n  <template #prefix>${symbol}</template>\n  <TextField ${attributes} default-value="25.00" v-model="value" />\n</InputGroup>`,
    angular: `<label class="nq-label" for="service-fee">${label}</label>\n<nq-input-group>\n  ${symbol.replace('<span ', '<span nqPrefix ')}\n  <input #amount class="nq-input" ${attributes} [value]="value" (input)="value = amount.value">\n</nq-input-group>`,
    output: {label: t('Current amount', 'المبلغ الحالي'), initial: '25.00', react: "value || '—'", vue: "value || '—'", angular: "value || '—'"},
    display: "output.value = String(new FormData(form).get('fee') || '—');",
  };
}

function password(t: Translate): Example {
  const label = t('Demo password', 'كلمة مرور تجريبية');
  const hint = t('Use a sample value for this example.', 'استخدم قيمة تجريبية في هذا المثال.');
  const show = t('Show password', 'إظهار كلمة المرور'), hide = t('Hide password', 'إخفاء كلمة المرور');
  const entered = t('Entered', 'تم الإدخال'), empty = t('Empty', 'فارغ');
  const output = `value ? '${entered}' : '${empty}'`;
  return {
    initialValue: "''", stateType: 'string',
    vanilla: `<div class="nq-field nq-password-field" data-nq="password-field">\n  <label class="nq-label" for="account-secret">${label}</label>\n  <div class="nq-password-control">\n    <input class="nq-input" id="account-secret" name="password" type="password" autocomplete="new-password" required aria-describedby="password-hint" data-nq-password-input>\n    <button class="nq-button" type="button" data-variant="ghost" data-nq-password-toggle data-nq-show-label="${show}" data-nq-hide-label="${hide}" aria-label="${show}"><span class="nq-password-icon" aria-hidden="true"></span></button>\n  </div>\n  <span class="nq-hint" id="password-hint">${hint}</span>\n</div>`,
    react: `<PasswordField id="account-secret" name="password" label="${label}" hint="${hint}"\n  autoComplete="new-password" required showLabel="${show}" hideLabel="${hide}"\n  value={value} onChange={event => setValue(event.currentTarget.value)} />`,
    vue: `<PasswordField id="account-secret" name="password" label="${label}" hint="${hint}"\n  autocomplete="new-password" required show-label="${show}" hide-label="${hide}" v-model="value" />`,
    angular: `<nq-password-field controlId="account-secret" name="password" label="${label}" hint="${hint}"\n  autocomplete="new-password" required showLabel="${show}" hideLabel="${hide}" [(value)]="value" />`,
    output: {label: t('Input state', 'حالة الإدخال'), initial: empty, react: output, vue: output, angular: output},
    display: `output.value = new FormData(form).get('password') ? ${text(entered)} : ${text(empty)};`,
  };
}

function numberField(t: Translate): Example {
  const label = t('Requested seats', 'المقاعد المطلوبة');
  const hint = t('Choose a whole number from 1 to 20.', 'اختر عددًا صحيحًا من 1 إلى 20.');
  const capacity = t('Available seats', 'المقاعد المتاحة'), waitlist = t('Waitlist', 'قائمة الانتظار');
  return {
    initialValue: '2', stateType: "number | ''", angularStateType: 'number | null',
    vanilla: `<div class="nq-field"><label class="nq-label" for="seats">${label}</label><input class="nq-input nq-number-field" id="seats" name="seats" type="number" min="1" max="20" step="1" required value="2" aria-describedby="seats-hint"><span class="nq-hint" id="seats-hint">${hint}</span></div>\n<label class="nq-field"><span class="nq-label">${capacity}</span><input class="nq-input nq-number-field" name="capacity" type="number" readonly value="12"></label>\n<label class="nq-field"><span class="nq-label">${waitlist}</span><input class="nq-input nq-number-field" name="waitlist" type="number" disabled value="4"></label>`,
    react: `<NumberField name="seats" label="${label}" hint="${hint}" min={1} max={20} step={1} required\n  value={value} onChange={event => setValue(event.currentTarget.value === '' ? '' : event.currentTarget.valueAsNumber)} />\n<NumberField name="capacity" label="${capacity}" readOnly value={12} />\n<NumberField name="waitlist" label="${waitlist}" disabled value={4} />`,
    vue: `<NumberField name="seats" label="${label}" hint="${hint}" :min="1" :max="20" :step="1" required :default-value="2" v-model="value" />\n<NumberField name="capacity" label="${capacity}" readonly :default-value="12" />\n<NumberField name="waitlist" label="${waitlist}" disabled :default-value="4" />`,
    angular: `<nq-number-field name="seats" label="${label}" hint="${hint}" [min]="1" [max]="20" [step]="1" required [(value)]="value" />\n<nq-number-field name="capacity" label="${capacity}" readOnly [value]="12" />\n<nq-number-field name="waitlist" label="${waitlist}" disabled [value]="4" />`,
    output: {label: t('Current request', 'العدد المطلوب حاليًا'), initial: '2', react: "value === '' ? '—' : value", vue: "value === '' ? '—' : value", angular: "value ?? '—'"},
    display: "output.value = String(new FormData(form).get('seats') || '—');",
  };
}

function slider(t: Translate): Example {
  const label = t('Completion threshold (%)', 'نسبة الإنجاز المطلوبة (%)');
  const hint = t('Adjust in steps of 5.', 'عدّل القيمة بمقدار 5 في كل خطوة.');
  return {
    initialValue: '50', stateType: 'number',
    vanilla: `<div class="nq-field"><label class="nq-label" for="completion">${label}</label><input class="nq-slider" id="completion" name="completion" type="range" min="0" max="100" step="5" value="50" aria-describedby="completion-hint"><span class="nq-hint" id="completion-hint">${hint}</span></div>`,
    react: `<Slider name="completion" label="${label}" hint="${hint}" min={0} max={100} step={5}\n  showValue={false} value={value} onValueChange={setValue} />`,
    vue: `<Slider name="completion" label="${label}" hint="${hint}" :min="0" :max="100" :step="5" :default-value="50" v-model="value" />`,
    angular: `<nq-slider name="completion" label="${label}" hint="${hint}" [min]="0" [max]="100" [step]="5" [(value)]="value" />`,
    output: {label: t('Current threshold', 'نسبة الإنجاز الحالية'), initial: '50%', react: "value + '%'", vue: "value + '%'", angular: "value + '%'"},
    display: "output.value = String(new FormData(form).get('completion')) + '%';",
  };
}

function rangeSlider(t: Translate): Example {
  const label = t('Processing time in days', 'مدة المعالجة بالأيام');
  const lower = t('Minimum days', 'الحد الأدنى للأيام'), upper = t('Maximum days', 'الحد الأعلى للأيام');
  const hint = t('Choose the earliest and latest delivery day.', 'حدّد أقرب يوم للتسليم وآخر يوم مناسب.');
  const format = "value[0] + ' – ' + value[1]";
  return {
    initialValue: '[20, 80]', stateType: 'readonly [number, number]', angularStateType: '[number, number]',
    vanilla: `<fieldset class="nq-range-slider" data-nq="range-slider" aria-describedby="range-hint"><legend class="nq-label">${label}</legend>\n  <label class="nq-label">${lower}<input class="nq-slider" type="range" name="minDays" min="0" max="100" step="5" value="20" data-nq-lower></label>\n  <label class="nq-label">${upper}<input class="nq-slider" type="range" name="maxDays" min="0" max="100" step="5" value="80" data-nq-upper></label>\n  <span class="nq-hint" id="range-hint">${hint}</span>\n</fieldset>`,
    react: `<RangeSlider label="${label}" hint="${hint}" lowerLabel="${lower}" upperLabel="${upper}"\n  lowerName="minDays" upperName="maxDays" min={0} max={100} step={5} value={value} onValueChange={setValue} />`,
    vue: `<RangeSlider label="${label}" hint="${hint}" lower-label="${lower}" upper-label="${upper}"\n  lower-name="minDays" upper-name="maxDays" :min="0" :max="100" :step="5" :default-value="[20, 80]" v-model="value" />`,
    angular: `<nq-range-slider label="${label}" hint="${hint}" lowerLabel="${lower}" upperLabel="${upper}"\n  lowerName="minDays" upperName="maxDays" [min]="0" [max]="100" [step]="5" [(value)]="value" />`,
    output: {label: t('Selected interval', 'الفترة المختارة'), initial: '20 – 80', react: format, vue: format, angular: format},
    display: "const data = new FormData(form);\n    output.value = String(data.get('minDays')) + ' – ' + String(data.get('maxDays'));",
  };
}

const examples: Record<BasicInputId, (translate: Translate) => Example> = {
  field, 'input-group': inputGroup, 'password-field': password, 'number-field': numberField, slider, 'range-slider': rangeSlider,
};

export function basicInputProjectRecipe(id: BasicInputId, locale: Locale): BasicInputProjectRecipe {
  const t: Translate = (english, arabic) => locale === 'ar' ? arabic : english;
  const sample = examples[id](t);
  const reset = t('Restore initial value', 'استعادة القيمة الأولية');
  const initial = sample.initialValue;
  const form = (framework: 'react' | 'vue' | 'angular' | 'vanilla') => {
    const css = framework === 'react' ? 'className' : 'class';
    const events = {
      react: ` onSubmit={event => event.preventDefault()} onReset={() => setValue(${initial})}`,
      vue: ` @submit.prevent @reset="value = ${initial}"`,
      angular: ` (submit)="$event.preventDefault()" (reset)="value = ${initial}"`,
      vanilla: '',
    };
    const output = framework === 'vanilla' ? sample.output.initial : framework === 'react' ? `{${sample.output.react}}` : `{{ ${sample.output[framework]} }}`;
    return `<form ${css}="nq-stack" data-basic-input-project="${id}"${events[framework]}>\n${sample[framework]}\n  <p>${sample.output.label} <output data-basic-value>${output}</output></p>\n  <button type="reset" ${css}="nq-button" data-variant="secondary">${reset}</button>\n</form>`;
  };
  const touch = id === 'field';
  const vanillaScript = `\nconst form = root.querySelector('form');\nconst output = form?.querySelector('[data-basic-value]');\nif (form instanceof HTMLFormElement && output instanceof HTMLOutputElement) {\n  const events = new AbortController();${touch ? '\n  let touched = false;' : ''}\n  const refresh = () => {\n    ${sample.display}\n  };\n  form.addEventListener('input', refresh, { signal: events.signal });${touch ? "\n  form.addEventListener('focusout', event => {\n    if (event.target instanceof HTMLInputElement && event.target.name === 'serviceName') {\n      touched = true;\n      refresh();\n    }\n  }, { signal: events.signal });" : ''}\n  form.addEventListener('reset', () => {${touch ? '\n    touched = false;' : ''}\n    queueMicrotask(refresh);\n  }, { signal: events.signal });\n  form.addEventListener('submit', event => event.preventDefault(), { signal: events.signal });\n  window.addEventListener('pagehide', () => events.abort(), { once: true });\n  refresh();\n}\n`;
  return {
    initialValue: initial, stateType: sample.stateType, angularStateType: sample.angularStateType ?? sample.stateType,
    componentImports: sample.componentImports ?? basicInputComponents[id], angularImports: sample.angularImports ?? `Nq${basicInputComponents[id]}Component`,
    vanilla: form('vanilla'), vanillaScript, react: form('react'), vue: form('vue'), angular: form('angular'),
  };
}
