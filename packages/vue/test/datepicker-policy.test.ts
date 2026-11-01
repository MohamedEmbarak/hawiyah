import { afterEach, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import type { App } from "vue";
import { DatePicker } from "../src/index.js";
import { formatCalendarDate } from "@nasaq/core";
import type { CalendarSystem } from "@nasaq/core";

let application: App | undefined;
afterEach(() => {
  application?.unmount();
  application = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it("restores a rejected calendar selection and applies an accepted selection to both selector and grid", async () => {
  const mode = ref<CalendarSystem>("gregory");
  const accept = ref(false);
  const changes = vi.fn();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
  const root = document.createElement("div");
  document.body.append(root);
  application = createApp(
    defineComponent(
      () => () =>
        h(DatePicker, {
          label: "Appointment",
          calendar: mode.value,
          defaultValue: "2026-10-15",
          locale: "en-US",
          "onUpdate:calendar": (value) => {
            changes(value);
            if (accept.value) mode.value = value;
          },
        }),
    ),
  );
  application.mount(root);
  root
    .querySelector<HTMLButtonElement>('[aria-label="Open calendar"]')!
    .click();
  await nextTick();
  const select = root.querySelector("select")!;
  const chooseHijri = async () => {
    select.value = "islamic-umalqura";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await nextTick();
  };
  await chooseHijri();
  expect(changes).toHaveBeenCalledWith("islamic-umalqura");
  expect(select.value).toBe("gregory");
  expect(root.querySelector(".nq-calendar-toolbar")!.textContent).toContain(
    "October 2026",
  );
  expect(root.querySelector<HTMLInputElement>("input[type=text]")!.value).toBe(
    "2026-10-15",
  );
  accept.value = true;
  await nextTick();
  await chooseHijri();
  expect(select.value).toBe("islamic-umalqura");
  expect(root.querySelector(".nq-calendar-toolbar")!.textContent).toContain(
    "1448 AH",
  );
  expect(root.querySelector<HTMLInputElement>("input[type=text]")!.value).toBe(
    "2026-10-15",
  );
});

it("associates unsupported-date errors and clears them when switching back without rewriting ISO", async () => {
  const mode = ref<CalendarSystem>("islamic-umalqura");
  const root = document.createElement("div");
  document.body.append(root);
  application = createApp(
    defineComponent(
      () => () =>
        h("div", {}, [
          h("p", { id: "date-context" }, "Original historical date."),
          h(DatePicker, {
            label: "Historic date",
            hint: "Keep the original day.",
            "aria-describedby": "date-context",
            calendar: mode.value,
            defaultValue: "1900-01-01",
            unsupportedMessage:
              "This day is outside the Saudi reference table.",
          }),
        ]),
    ),
  );
  application.mount(root);
  await nextTick();
  const input = root.querySelector<HTMLInputElement>("input[type=text]")!;
  expect(input.checkValidity()).toBe(false);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  const descriptionIds = input.getAttribute("aria-describedby")!.split(" ");
  expect(descriptionIds).toContain("date-context");
  const descriptions = descriptionIds.map(
    (id) => document.getElementById(id)!.textContent,
  );
  expect(descriptions).toContain("Keep the original day.");
  expect(descriptions).toContain(
    "This day is outside the Saudi reference table.",
  );
  mode.value = "gregory";
  await nextTick();
  expect(input.checkValidity()).toBe(true);
  expect(input.getAttribute("aria-invalid")).toBeNull();
  expect(input.getAttribute("aria-describedby")).not.toContain(
    "validation-error",
  );
  expect(root.querySelector(".nq-date-picker > .nq-error")).toBeNull();
  expect(input.value).toBe("1900-01-01");
});


it("shows the canonical selected calendar below the closed field and preserves its description associations", async () => {
  const value = ref("2029-08-11");
  const mode = ref<CalendarSystem>("islamic-umalqura");
  const root = document.createElement("div"); document.body.append(root);
  application = createApp(defineComponent(() => () => h(DatePicker, { label: "Date", hint: "Original day", modelValue: value.value, calendar: mode.value, locale: "en-SA" })));
  application.mount(root); await nextTick();
  const input = root.querySelector<HTMLInputElement>("input[type=text]")!;
  const output = root.querySelector<HTMLOutputElement>(".nq-date-picker-value")!;
  expect(root.querySelector("dialog")!.open).toBe(false);
  expect(output.hidden).toBe(false);
  expect(output.textContent).toBe(formatCalendarDate(value.value, { calendar: mode.value, locale: "en-SA", dateStyle: "full" }));
  expect(output.htmlFor.value).toBe(input.id);
  expect(input.getAttribute("aria-describedby")!.split(" ")).toContain(output.id);
  expect(input.getAttribute("aria-describedby")!.split(" ").map(id => document.getElementById(id)?.textContent)).toContain("Original day");
  mode.value = "gregory"; await nextTick();
  expect(input.value).toBe("2029-08-11");
  expect(output.textContent).toBe(formatCalendarDate(value.value, { calendar: mode.value, locale: "en-SA", dateStyle: "full" }));
  value.value = ""; await nextTick(); expect(output.hidden).toBe(true); expect(output.textContent).toBe("");
  value.value = "1900-01-01"; mode.value = "islamic-umalqura"; await nextTick(); expect(output.hidden).toBe(true); expect(output.textContent).toBe(""); expect(input.checkValidity()).toBe(false);
});

it("isolates ISO endpoints in visible validation prose without changing the native message", async () => {
  const root = document.createElement("div"); document.body.append(root);
  const message = "خارج النطاق 1924-08-01 إلى 2077-11-16.";
  application = createApp(defineComponent(() => () => h(DatePicker, { label: "Date", defaultValue: "1900-01-01", calendar: "islamic-umalqura", unsupportedMessage: message })));
  application.mount(root); await nextTick();
  const error = root.querySelector(".nq-date-picker > .nq-error")!;
  expect(error.textContent).toBe(message);
  expect([...error.querySelectorAll('bdi[dir="ltr"]')].map(node => node.textContent)).toEqual(["1924-08-01", "2077-11-16"]);
  const input = root.querySelector<HTMLInputElement>('input[type="text"]')!;
  expect(input.validationMessage).toBe(message); expect(input.value).toBe("1900-01-01");
});
