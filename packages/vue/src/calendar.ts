import {
  computed,
  defineComponent,
  h,
  mergeProps,
  nextTick,
  ref,
  watch,
  watchEffect,
} from "vue";
import type { PropType } from "vue";
import {
  formatCalendarDate,
  getCalendarMonth,
  getDirection,
  isDateInRange,
  isDisabled,
  isCalendarDateSupported,
  UMALQURA_MIN_DATE,
  UMALQURA_MAX_DATE,
  moveCalendarDate,
} from "@nasaq/core";
import type { CalendarDay, CalendarSystem } from "@nasaq/core";
import { Button, decorate } from "./forms.js";
import { Dialog, Tooltip } from "./interactive.js";
import {
  decorationProps,
  joinIds,
  useField,
  useFormReset,
  useValue,
} from "./shared.js";

function dateMessage(message: string) {
  return message.split(/([0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2})/u).map(part =>
    /^[0-9٠-٩]{4}-[0-9٠-٩]{2}-[0-9٠-٩]{2}$/u.test(part) ? h("bdi", { dir: "ltr" }, part) : part);
}

const calendarProps = {
  modelValue: String,
  defaultValue: { type: String, default: "" },
  month: String,
  min: String,
  max: String,
  locale: { type: String, default: "ar-SA" },
  calendar: { type: String as PropType<CalendarSystem>, default: "gregory" },
  weekStartsOn: { type: Number, default: 0 },
  disabled: Boolean,
  readonly: Boolean,
  label: { type: String, default: "Calendar" },
  previousLabel: { type: String, default: "Previous month" },
  nextLabel: { type: String, default: "Next month" },
  unsupportedMessage: {
    type: String,
    default:
      "This date is outside the supported Umm al-Qura range (1924-08-01 to 2077-11-16).",
  },
  isDateDisabled: Function as PropType<(value: string) => boolean>,
} as const;
export const Calendar = defineComponent({
  name: "NqCalendar",
  inheritAttrs: false,
  props: calendarProps,
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:month": (_value: string) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const valid = (value: string | undefined) =>
      value && isDateInRange(value) ? value : undefined;
    const month = ref(valid(props.month) ?? valid(model.value.value));
    const focused = ref<string>();
    const buttons = new Map<string, HTMLButtonElement>();
    const hidden = ref<HTMLInputElement>();
    const blocked = (value: string) =>
      !isCalendarDateSupported(value, props.calendar) ||
      !isDateInRange(value, props.min, props.max) ||
      Boolean(props.isDateDisabled?.(value));
    const page = computed(() =>
      getCalendarMonth({
        month: month.value,
        value: valid(model.value.value),
        min: props.min,
        max: props.max,
        locale: props.locale,
        calendar: props.calendar,
        weekStartsOn: props.weekStartsOn,
        fixedWeeks: true,
      }),
    );
    const focusValue = computed(
      () =>
        page.value.days.find(
          (day) => day.value === focused.value && !blocked(day.value),
        )?.value ??
        page.value.days.find((day) => day.selected && !blocked(day.value))
          ?.value ??
        page.value.days.find((day) => !day.outside && !blocked(day.value))
          ?.value ??
        page.value.days.find((day) => !blocked(day.value))?.value,
    );
    function changeMonth(value: string) {
      month.value = value;
      emit("update:month", value);
    }
    function focusDate(value: string) {
      if (props.min && value < props.min) value = props.min;
      if (props.max && value > props.max) value = props.max;
      if (blocked(value)) return;
      focused.value = value;
      if (!page.value.days.some((day) => day.value === value && !day.outside))
        changeMonth(value);
      void nextTick(() => buttons.get(value)?.focus());
    }
    watch(
      () => props.month,
      (value) => {
        if (valid(value)) month.value = value;
      },
    );
    watch(
      () => props.modelValue,
      (value) => {
        if (valid(value)) {
          month.value = value;
          focused.value = value;
        }
      },
    );
    useFormReset(hidden, () => {
      model.set(props.defaultValue);
      month.value = valid(props.month) ?? valid(props.defaultValue);
      focused.value = undefined;
    });
    expose({
      focus: () => {
        if (focusValue.value) buttons.get(focusValue.value)?.focus();
      },
    });
    function move(
      value: string,
      amount: number,
      unit: "day" | "month" | "year",
    ) {
      try {
        return moveCalendarDate(value, amount, unit, props.calendar);
      } catch (error) {
        if (error instanceof RangeError) return undefined;
        throw error;
      }
    }
    function dateLabel(day: CalendarDay) {
      return isCalendarDateSupported(day.value, props.calendar)
        ? formatCalendarDate(day.value, {
            locale: props.locale,
            calendar: props.calendar,
            dateStyle: "full",
          })
        : day.value;
    }
    function keyboard(event: KeyboardEvent, value: string, index: number) {
      if (props.disabled) return;
      let amount = 0;
      let unit: "day" | "month" | "year" = "day";
      switch (event.key) {
        case "ArrowRight":
          amount =
            getDirection(event.currentTarget as Element) === "rtl" ? -1 : 1;
          break;
        case "ArrowLeft":
          amount =
            getDirection(event.currentTarget as Element) === "rtl" ? 1 : -1;
          break;
        case "ArrowDown":
          amount = 7;
          break;
        case "ArrowUp":
          amount = -7;
          break;
        case "Home":
          amount = -(index % 7);
          break;
        case "End":
          amount = 6 - (index % 7);
          break;
        case "PageUp":
          amount = -1;
          unit = event.shiftKey ? "year" : "month";
          break;
        case "PageDown":
          amount = 1;
          unit = event.shiftKey ? "year" : "month";
          break;
        default:
          return;
      }
      event.preventDefault();
      let candidate = move(value, amount, unit);
      if (!candidate) return;
      if (props.min && candidate < props.min) candidate = props.min;
      if (props.max && candidate > props.max) candidate = props.max;
      for (let attempt = 0; attempt < 366 && blocked(candidate); attempt++) {
        const next = move(candidate, amount < 0 ? -1 : 1, "day");
        if (!next || !isDateInRange(next, props.min, props.max)) return;
        candidate = next;
      }
      focusDate(candidate);
    }
    return () => {
      const monthStart = page.value.days.find((day) => !day.outside)?.value;
      const previousAllowed =
        page.value.previous !== monthStart &&
        getCalendarMonth({
          month: page.value.previous,
          min: props.min,
          max: props.max,
          calendar: props.calendar,
        }).days.some((day) => !day.outside && !blocked(day.value));
      const nextAllowed =
        page.value.next !== monthStart &&
        getCalendarMonth({
          month: page.value.next,
          min: props.min,
          max: props.max,
          calendar: props.calendar,
        }).days.some((day) => !day.outside && !blocked(day.value));
      return h("div", mergeProps(attrs, { class: "nq-calendar" }), [
        h("input", {
          ref: hidden,
          type: "hidden",
          name: attrs.name,
          form: attrs.form,
          value: model.value.value,
          disabled: props.disabled,
        }),
        h("div", { class: "nq-calendar-toolbar" }, [
          h(
            Button,
            {
              variant: "ghost",
              "aria-label": props.previousLabel,
              class: "nq-calendar-prev",
              disabled: props.disabled || !previousAllowed,
              onClick: () => changeMonth(page.value.previous),
            },
            () => props.previousLabel,
          ),
          h("div", { class: "nq-calendar-heading" }, [
            h("span", { "aria-live": "polite", "aria-atomic": "true" }, page.value.label),
            props.calendar === "islamic-umalqura" && h(Tooltip, { class: "nq-calendar-info", content: `${props.locale.startsWith("ar") ? "التواريخ الهجرية المدعومة" : "Supported Hijri dates"}: \u2066${UMALQURA_MIN_DATE} – ${UMALQURA_MAX_DATE}\u2069` }, () => h("span", { tabindex: 0, role: "img", class: "nq-calendar-info-icon nq-tooltip-trigger", "aria-label": props.locale.startsWith("ar") ? "التواريخ الهجرية المدعومة" : "Supported Hijri dates" }, "i")),
          ]),
          h(
            Button,
            {
              variant: "ghost",
              "aria-label": props.nextLabel,
              class: "nq-calendar-next",
              disabled: props.disabled || !nextAllowed,
              onClick: () => changeMonth(page.value.next),
            },
            () => props.nextLabel,
          ),
        ]),
        model.value.value &&
          !isCalendarDateSupported(model.value.value, props.calendar) &&
          h("p", { role: "status", class: "nq-sr-only" }, dateMessage(props.unsupportedMessage)),
        h(
          "table",
          {
            role: "grid",
            "aria-label": `${props.label}: ${page.value.label}`,
            "aria-readonly": props.readonly || undefined,
          },
          [
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                page.value.weekdays.map((day, index) =>
                  h("th", { key: index, scope: "col" }, day),
                ),
              ),
            ),
            h(
              "tbody",
              {},
              Array.from({ length: 6 }, (_, week) =>
                h(
                  "tr",
                  // Keep overlapping weeks keyed by date when the visible month changes.
                  // A positional row key can mount then remove the same date ref.
                  { key: page.value.days[week * 7]?.value ?? week },
                  page.value.days
                    .slice(week * 7, week * 7 + 7)
                    .map((day, dayIndex) =>
                      h(
                        "td",
                        {
                          key: day.value,
                          role: "gridcell",
                          "aria-selected": day.selected,
                        },
                        h(
                          "button",
                          {
                            ref: (element: unknown) => {
                              if (element)
                                buttons.set(
                                  day.value,
                                  element as HTMLButtonElement,
                                );
                              else buttons.delete(day.value);
                            },
                            type: "button",
                            class: "nq-calendar-day",
                            "data-outside": day.outside ? "true" : undefined,
                            "data-selected": day.selected ? "true" : undefined,
                            "aria-current": day.today ? "date" : undefined,
                            "aria-label": dateLabel(day),
                            disabled:
                              props.disabled ||
                              day.disabled ||
                              blocked(day.value),
                            tabindex: focusValue.value === day.value ? 0 : -1,
                            onFocus: () => {
                              focused.value = day.value;
                            },
                            onKeydown: (event: KeyboardEvent) =>
                              keyboard(event, day.value, week * 7 + dayIndex),
                            onClick: () => {
                              if (
                                !props.disabled &&
                                !props.readonly &&
                                !blocked(day.value)
                              ) {
                                model.set(day.value);
                                focused.value = day.value;
                                if (day.outside) changeMonth(day.value);
                              }
                            },
                          },
                          day.label,
                        ),
                      ),
                    ),
                ),
              ),
            ),
          ],
        ),
      ]);
    };
  },
});
export const DatePicker = defineComponent({
  name: "NqDatePicker",
  inheritAttrs: false,
  props: {
    ...calendarProps,
    ...decorationProps,
    calendar: { type: String as PropType<CalendarSystem>, default: undefined },
    calendarSwitchable: { type: Boolean, default: true },
    calendarSystemLabel: { type: String, default: "Display calendar" },
    gregoryLabel: { type: String, default: "Gregorian" },
    hijriLabel: { type: String, default: "Umm al-Qura" },
    calendarLabel: { type: String, default: "Choose date" },
    openLabel: { type: String, default: "Open calendar" },
    closeLabel: { type: String, default: "Close calendar" },
    invalidMessage: { type: String, default: "Choose an available date." },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:calendar": (_value: CalendarSystem) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const field = useField(props, attrs);
    const element = ref<HTMLInputElement>();
    const calendar = ref<{ focus: () => void }>();
    const open = ref(false);
    const calendarSystem = useValue(
      () => props.calendar,
      "gregory" as CalendarSystem,
      (v) => emit("update:calendar", v),
    );
    const model = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit("update:modelValue", v),
    );
    const draft = ref(model.value.value);
    const editing = ref(false);
    watch(() => model.value.value, value => { draft.value = value; });
    const blocked = () => props.disabled || props.readonly || !element.value || isDisabled(element.value);
    const commit = (value: string) => {
      const canonical = !value || isDateInRange(value);
      draft.value = canonical && props.modelValue !== undefined ? props.modelValue : value;
      if (canonical) model.set(value);
    };
    const show = () => { if (!blocked()) { open.value = true; void nextTick(() => calendar.value?.focus()); } };
    watch(() => props.disabled || props.readonly, disabled => { if (disabled) open.value = false; });
    const minimum = computed(() =>
      calendarSystem.value.value === "islamic-umalqura" &&
      (!props.min || props.min < UMALQURA_MIN_DATE)
        ? UMALQURA_MIN_DATE
        : props.min,
    );
    const maximum = computed(() =>
      calendarSystem.value.value === "islamic-umalqura" &&
      (!props.max || props.max > UMALQURA_MAX_DATE)
        ? UMALQURA_MAX_DATE
        : props.max,
    );
    const formattedDate = computed(() => {
      const value = model.value.value;
      return value && isCalendarDateSupported(value, calendarSystem.value.value)
        ? formatCalendarDate(value, { locale: props.locale, calendar: calendarSystem.value.value, dateStyle: "full" })
        : "";
    });
    const validationMessage = computed(() => {
      const value = draft.value;
      if (!value) return "";
      if (!isDateInRange(value)) return props.invalidMessage;
      if (!isCalendarDateSupported(value, calendarSystem.value.value)) {
        return calendarSystem.value.value === "islamic-umalqura"
          ? props.unsupportedMessage
          : props.invalidMessage;
      }
      return !isDateInRange(value, minimum.value, maximum.value) ||
        props.isDateDisabled?.(value)
        ? props.invalidMessage
        : "";
    });
    watchEffect(() =>
      element.value?.setCustomValidity(validationMessage.value),
    );
    useFormReset(element, () => {
      model.set(props.defaultValue);
      draft.value = props.modelValue ?? props.defaultValue;
      open.value = false;
    });
    expose({ element, focus: () => element.value?.focus() });
    return () =>
      decorate(
        props,
        field.id.value,
        h("div", { class: "nq-date-picker" }, [
          h("div", { class: "nq-date-picker-control" }, [
            h(
              "input",
              mergeProps(attrs, field.controlAttrs.value, {
                ref: element,
                type: "text",
                name: undefined,
                placeholder: attrs.placeholder ?? "YYYY-MM-DD",
                "aria-haspopup": "dialog",
                "aria-controls": `${field.id.value}-dialog`,
                class: "nq-input",
                value: !editing.value && draft.value && !validationMessage.value && isCalendarDateSupported(draft.value, calendarSystem.value.value) ? formatCalendarDate(draft.value, { locale: props.locale, calendar: calendarSystem.value.value, dateStyle: "medium" }) : draft.value,
                min: minimum.value,
                max: maximum.value,
                disabled: props.disabled,
                readonly: props.readonly,
                "aria-invalid": validationMessage.value
                  ? true
                  : field.controlAttrs.value["aria-invalid"],
                "aria-describedby": joinIds(
                  field.controlAttrs.value["aria-describedby"],
                  formattedDate.value && `${field.id.value}-formatted`,
                  validationMessage.value &&
                    `${field.id.value}-validation-error`,
                ),
                onKeydown: (event: KeyboardEvent) => {
                  if (!event.defaultPrevented && !event.isComposing && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === "ArrowDown" && !blocked()) { event.preventDefault(); show(); }
                },
                onFocus: (event: FocusEvent) => { if (!blocked()) { (event.target as HTMLInputElement).value = draft.value; (event.target as HTMLInputElement).select(); editing.value = true; } },
                onBlur: () => { editing.value = false; },
                onInput: (event: Event) => {
                  if (!blocked()) commit((event.target as HTMLInputElement).value);
                },
              }),
            ),
            h(
              Button,
              {
                variant: "ghost",
                class: "nq-date-picker-trigger",
                disabled: props.disabled || props.readonly,
                "aria-label": props.openLabel,
                "aria-expanded": open.value,
                "aria-haspopup": "dialog",
                "aria-controls": `${field.id.value}-dialog`,
                onClick: show,
              },
              () => h("span", { class: "nq-date-picker-icon", "aria-hidden": "true" }),
            ),
          ]),
          h("input", { type: "hidden", name: attrs.name, form: attrs.form, disabled: props.disabled, value: isDateInRange(model.value.value) ? model.value.value : "" }),
          h("output", {
            id: `${field.id.value}-formatted`,
            for: field.id.value,
            class: "nq-sr-only nq-date-picker-value",
            "aria-live": "polite",
            "aria-atomic": "true",
            hidden: !formattedDate.value,
          }, formattedDate.value),
          validationMessage.value &&
            h(
              "p",
              {
                id: `${field.id.value}-validation-error`,
                class: "nq-error",
                role: "alert",
              },
              dateMessage(validationMessage.value),
            ),
          h(
            Dialog,
            {
              id: `${field.id.value}-dialog`,
              open: open.value,
              "onUpdate:open": (value: boolean) => {
                open.value = value;
              },
              title: props.calendarLabel,
              closeLabel: props.closeLabel,
            },
            () => [
              h("div", { class: "nq-calendar-options" }, [props.calendarSwitchable && h("div", { class: "nq-calendar-system nq-calendar-switch", role: "radiogroup", "aria-label": props.calendarSystemLabel, "data-calendar": calendarSystem.value.value },
                (["gregory", "islamic-umalqura"] as const).map(system => h("label", { key: system }, [
                  h("input", { type: "radio", name: `${field.id.value}-calendar-system`, form: "", value: system, checked: calendarSystem.value.value === system, disabled: props.disabled || props.readonly, onChange: async (event: Event) => { const group = (event.target as HTMLInputElement).closest('.nq-calendar-switch'); calendarSystem.set(system); await nextTick(); group?.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach(radio => { radio.checked = radio.value === calendarSystem.value.value; }); } }),
                  h("span", {}, system === "gregory" ? props.gregoryLabel : props.hijriLabel),
                ]))),

              ]),
              h(Calendar, {
                ...props,
                calendar: calendarSystem.value.value,
                month:
                  open.value && isDateInRange(model.value.value)
                    ? model.value.value
                    : props.month,
                label: props.calendarLabel,
                ref: calendar,
                modelValue: model.value.value,
                "onUpdate:modelValue": (value: string) => {
                  if (!blocked()) { commit(value); open.value = false; }
                },
              }),
            ],
          ),
        ]),
      );
  },
});
