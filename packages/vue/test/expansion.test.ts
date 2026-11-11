import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createApp,
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  ref,
} from "vue";
import type { App, Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import { UMALQURA_MIN_DATE, UMALQURA_MAX_DATE } from "@hawiyah/core";
import {
  Calendar,
  DatePicker,
  DataTable,
  Grid,
  Menu,
  MultiSelect,
  NumberField,
  PinInput,
  Popover,
  RangeSlider,
  TagInput,
  ToastRegion,
  TreeView,
  ToggleGroup,
  Drawer,
  PasswordField,
  SearchField,
  FileDropzone,
  Feedback,
  CookieConsent,
  Carousel,
  Stack,
} from "../src/index.js";
import { calendarText, datePickerText } from "./texts.js";
const applications: App[] = [];
function mount(component: Component) {
  const root = document.createElement("div");
  document.body.append(root);
  const app = createApp(component);
  applications.push(app);
  app.mount(root);
  return root;
}
async function key(node: Element, key: string) {
  node.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
  await nextTick();
}
async function input(node: HTMLInputElement, value: string) {
  node.value = value;
  node.dispatchEvent(new Event("input", { bubbles: true }));
  await nextTick();
}
function nativeDialog() {
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
      this.dispatchEvent(new Event("close"));
    },
  });
}
afterEach(() => {
  applications.splice(0).forEach((app) => app.unmount());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
describe("expanded Vue controls", () => {
  it("normalizes pasted PIN digits, preserves empty numbers, and resets actual form values", async () => {
    const pin = ref("");
    const number = ref<number | "">(10);
    const root = mount(
      defineComponent(
        () => () =>
          h("form", {}, [
            h(PinInput, {
              label: "Code",
              name: "code",
              modelValue: pin.value,
              "onUpdate:modelValue": (value) => {
                pin.value = value;
              },
            }),
            h(NumberField, {
              label: "Amount",
              name: "amount",
              modelValue: number.value,
              defaultValue: 10,
              min: 1,
              max: 20,
              "onUpdate:modelValue": (value) => {
                number.value = value;
              },
            }),
          ]),
      ),
    );
    await input(root.querySelector("input[name=code]")!, "١۲3٤۵6");
    expect(pin.value).toBe("123456");
    expect(new FormData(root.querySelector("form")!).get("code")).toBe(
      "123456",
    );
    await input(root.querySelector("input[name=amount]")!, "");
    expect(number.value).toBe("");
    root.querySelector("form")!.reset();
    await Promise.resolve();
    await nextTick();
    expect(pin.value).toBe("");
    expect(number.value).toBe(10);
  });
  it("searches normalized multiselect labels, submits repeated values and honors readonly", async () => {
    const values = ref<readonly string[]>(["r"]);
    const readonly = ref(false);
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "form",
            {},
            h(MultiSelect, {
              label: "Cities",
              searchLabel: "Find city",
              emptyMessage: "No matching city",
              requiredMessage: "Choose at least one city.",
              name: "city",
              modelValue: values.value,
              defaultValue: ["r"],
              required: true,
              readonly: readonly.value,
              options: [
                { value: "r", label: "الرياض" },
                { value: "j", label: "جِدَّة" },
                { value: "d", label: "الدمام", disabled: true },
              ],
              "onUpdate:modelValue": (value) => {
                values.value = value;
              },
            }),
          ),
      ),
    );
    const search = root.querySelector<HTMLInputElement>("input[type=search]")!;
    await input(search, "جدة");
    expect(root.querySelectorAll("input[type=checkbox]")).toHaveLength(1);
    root.querySelector<HTMLInputElement>("input[type=checkbox]")!.click();
    await nextTick();
    expect(new FormData(root.querySelector("form")!).getAll("city")).toEqual([
      "r",
      "j",
    ]);
    readonly.value = true;
    await nextTick();
    expect(
      root.querySelector<HTMLInputElement>("input[type=checkbox]")!.disabled,
    ).toBe(true);
    root.querySelector("form")!.reset();
    await Promise.resolve();
    await nextTick();
    expect(values.value).toEqual(["r"]);
    expect(search.value).toBe("");
  });
  it("adds unique tags and keeps required selection validity separate from typed draft", async () => {
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "form",
            {},
            h(TagInput, { label: "Tags", name: "tag", required: true, requiredMessage: "Add at least one tag.", getRemoveLabel: (tag: string) => `Remove ${tag}` }),
          ),
      ),
    );
    const control = root.querySelector<HTMLInputElement>(
      "input:not([type=hidden])",
    )!;
    await nextTick();
    expect(control.validity.customError).toBe(true);
    await input(control, "first");
    await key(control, "Enter");
    expect(control.validity.customError).toBe(false);
    await input(control, "first");
    await key(control, "Enter");
    expect(new FormData(root.querySelector("form")!).getAll("tag")).toEqual([
      "first",
    ]);
    await key(control, "Backspace");
    expect(control.validity.customError).toBe(true);
    expect(new FormData(root.querySelector("form")!).getAll("tag")).toEqual([]);
  });
  it("prevents crossed range bounds and preserves submitted readonly values", async () => {
    const values = ref<readonly [number, number]>([20, 70]);
    const readonly = ref(false);
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "form",
            {},
            h(RangeSlider, {
              label: "Budget",
              lowerLabel: "Minimum",
              upperLabel: "Maximum",
              lowerName: "min",
              upperName: "max",
              modelValue: values.value,
              defaultValue: [20, 70],
              readonly: readonly.value,
              "onUpdate:modelValue": (value) => {
                values.value = value;
              },
            }),
          ),
      ),
    );
    const lower = root.querySelector<HTMLInputElement>("input[name=min]")!;
    await input(lower, "90");
    expect(values.value).toEqual([70, 70]);
    readonly.value = true;
    await nextTick();
    await input(lower, "10");
    expect(values.value).toEqual([70, 70]);
    expect(new FormData(root.querySelector("form")!).get("min")).toBe("70");
    root.querySelector("form")!.reset();
    await Promise.resolve();
    await nextTick();
    expect(values.value).toEqual([20, 70]);
  });
  it("keeps password visibility and clear-search actions accessible and resettable", async () => {
    const root = mount(
      defineComponent(
        () => () =>
          h("form", {}, [
            h(PasswordField, { label: "Password", defaultValue: "secret", showLabel: "Show password", hideLabel: "Hide password" }),
            h(SearchField, { label: "Search", clearLabel: "Clear search", defaultValue: "query" }),
          ]),
      ),
    );
    const reveal = root.querySelector<HTMLButtonElement>(
      '[aria-label="Show password"]',
    )!;
    reveal.click();
    await nextTick();
    expect(
      root.querySelector<HTMLInputElement>(".hw-password-field input")!.type,
    ).toBe("text");
    expect(reveal.getAttribute("aria-pressed")).toBe("true");
    root
      .querySelector<HTMLButtonElement>('[aria-label="Clear search"]')!
      .click();
    await nextTick();
    expect(
      root.querySelector<HTMLInputElement>("input[type=search]")!.value,
    ).toBe("");
    root.querySelector("form")!.reset();
    await Promise.resolve();
    await nextTick();
    expect(
      root.querySelector<HTMLInputElement>("input[type=search]")!.value,
    ).toBe("query");
  });
  it("submits repeated multiple-toggle values and restores their form defaults", async () => {
    const values = ref<string | readonly string[]>(["a"]);
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "form",
            {},
            h(ToggleGroup, {
              label: "Formats",
              name: "format",
              multiple: true,
              modelValue: values.value,
              defaultValue: ["a"],
              options: [
                { value: "a", label: "PDF" },
                { value: "b", label: "CSV" },
              ],
              "onUpdate:modelValue": (value) => {
                values.value = value;
              },
            }),
          ),
      ),
    );
    root.querySelectorAll<HTMLButtonElement>("button")[1]!.click();
    await nextTick();
    expect(new FormData(root.querySelector("form")!).getAll("format")).toEqual([
      "a",
      "b",
    ]);
    expect(
      root.querySelectorAll("button")[1]!.getAttribute("aria-pressed"),
    ).toBe("true");
    root.querySelector("form")!.reset();
    await Promise.resolve();
    await nextTick();
    expect(values.value).toEqual(["a"]);
  });
  it("rejects invalid dropped files instead of retaining them as successful form controls", async () => {
    const reject = vi.fn();
    const files = vi.fn();
    const root = mount(
      defineComponent(
        () => () =>
          h(FileDropzone, {
            label: "Upload",
            dropLabel: "Choose files or drop them here",
            accept: ".pdf",
            onReject: reject,
            "onUpdate:files": files,
          }),
      ),
    );
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", {
      value: { files: [new File(["bad"], "image.png", { type: "image/png" })] },
    });
    root.querySelector(".hw-file-dropzone")!.dispatchEvent(drop);
    await nextTick();
    expect(reject).toHaveBeenCalledOnce();
    expect(files).toHaveBeenCalledWith([]);
  });
});
describe("Vue calendars and interactions", () => {
  it("navigates a leap day in RTL and enforces min/max without handwritten calendar arithmetic", async () => {
    const value = ref("2024-02-29");
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "div",
            { dir: "rtl" },
            h(Calendar, {
              ...calendarText,
              label: "Dates",
              modelValue: value.value,
              min: "2024-02-28",
              max: "2024-03-05",
              "onUpdate:modelValue": (next) => {
                value.value = next;
              },
            }),
          ),
      ),
    );
    const selected = root.querySelector<HTMLButtonElement>(
      "[data-selected=true]",
    )!;
    selected.focus();
    await key(selected, "ArrowRight");
    expect(
      (document.activeElement as HTMLElement).getAttribute("aria-label"),
    ).toContain("February 28");
    await key(document.activeElement!, "Home");
    expect(
      (document.activeElement as HTMLElement).getAttribute("aria-label"),
    ).toContain("February 28");
    await key(document.activeElement!, "PageDown");
    expect(
      (document.activeElement as HTMLElement).getAttribute("aria-label"),
    ).toContain("March 5");
    (document.activeElement as HTMLButtonElement).click();
    await nextTick();
    expect(value.value).toBe("2024-03-05");
    expect(
      root.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!
        .disabled,
    ).toBe(true);
  });
  it("switches Gregorian and Saudi Umm al-Qura while preserving ISO selection and reopens its month", async () => {
    nativeDialog();
    const value = ref("2024-03-11");
    const system = ref<"gregory" | "islamic-umalqura">("gregory");
    const root = mount(
      defineComponent(
        () => () =>
          h(DatePicker, {
            ...datePickerText,
            label: "Date",
            modelValue: value.value,
            calendar: system.value,
            "onUpdate:modelValue": (next) => {
              value.value = next;
            },
            "onUpdate:calendar": (next) => {
              system.value = next;
            },
          }),
      ),
    );
    root
      .querySelector<HTMLButtonElement>('[aria-label="Open calendar"]')!
      .click();
    await nextTick();
    (root.querySelector('.hw-calendar-switch input[value="islamic-umalqura"]') as HTMLInputElement).click();
    await nextTick();
    expect(system.value).toBe("islamic-umalqura");
    expect(value.value).toBe("2024-03-11");
    expect(
      root.querySelector<HTMLInputElement>(".hw-date-picker > input[type=hidden]")!.value,
    ).toBe("2024-03-11");
    expect(root.querySelector(".hw-calendar-toolbar")!.textContent).toContain(
      "Ramadan",
    );
    root.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click();
    await nextTick();
    expect(
      root.querySelector(".hw-calendar-toolbar")!.textContent,
    ).not.toContain("Ramadan");
    root
      .querySelector("dialog")!
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    await nextTick();
    root
      .querySelector<HTMLButtonElement>('[aria-label="Open calendar"]')!
      .click();
    await nextTick();
    expect(root.querySelector(".hw-calendar-toolbar")!.textContent).toContain(
      "Ramadan",
    );
    (root.querySelector('.hw-calendar-switch input[value="gregory"]') as HTMLInputElement).click();
    await nextTick();
    expect(value.value).toBe("2024-03-11");
    expect(root.querySelector(".hw-calendar-toolbar")!.textContent).toContain(
      "March 2024",
    );
  });
  it("guards Saudi table boundaries and uses table-backed accessible Hijri dates", async () => {
    const value = ref(UMALQURA_MIN_DATE);
    const root = mount(
      defineComponent(
        () => () =>
          h(Calendar, {
            ...calendarText,
            calendar: "islamic-umalqura",
            modelValue: value.value,
          }),
      ),
    );
    const first = root.querySelector<HTMLButtonElement>(
      "[data-selected=true]",
    )!;
    expect(first.textContent).toBe("1");
    expect(first.getAttribute("aria-label")).toContain("1343 AH");
    expect(first.getAttribute("aria-label")).toContain("Muharram 1");
    expect(
      root.querySelector<HTMLButtonElement>('[aria-label="Previous month"]')!
        .disabled,
    ).toBe(true);
    first.focus();
    await key(first, "PageUp");
    await key(first, "ArrowLeft");
    expect(document.activeElement).toBe(first);
    value.value = UMALQURA_MAX_DATE;
    await nextTick();
    const last = root.querySelector<HTMLButtonElement>("[data-selected=true]")!;
    last.focus();
    expect(
      root.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!
        .disabled,
    ).toBe(true);
    await key(last, "PageDown");
    await key(last, "ArrowRight");
    expect(document.activeElement).toBe(last);
    const outOfRange = mount(
      defineComponent(
        () => () =>
          h(DatePicker, {
            ...datePickerText,
            locale: "ar-SA",
            label: "Historic date",
            calendar: "islamic-umalqura",
            defaultValue: "1900-01-01",
          }),
      ),
    );
    await nextTick();
    const input =
      outOfRange.querySelector<HTMLInputElement>("input[type=text]")!;
    expect(input.value).toBe("1900-01-01");
    expect(input.validity.customError).toBe(true);
    expect(input.min).toBe(UMALQURA_MIN_DATE);
  });
  it("moves menu focus past disabled items and returns focus on Escape; popovers close outside", async () => {
    const selected = vi.fn();
    const root = mount(
      defineComponent(
        () => () =>
          h("div", {}, [
            h(Menu, {
              label: "Actions",
              items: [
                { value: "a", label: "First" },
                { value: "b", label: "Disabled", disabled: true },
                { value: "c", label: "Last" },
              ],
              onSelect: selected,
            }),
            h(Popover, { label: "Help details", triggerLabel: "Help" }, () =>
              h("a", { href: "#help" }, "Read more"),
            ),
          ]),
      ),
    );
    const trigger = root.querySelector<HTMLButtonElement>(
      "[aria-haspopup=menu]",
    )!;
    trigger.click();
    await nextTick();
    expect(document.activeElement?.textContent).toBe("First");
    await key(document.activeElement!, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Last");
    await key(document.activeElement!, "Escape");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    root.querySelector<HTMLButtonElement>(".hw-popover button")!.click();
    await nextTick();
    expect(root.querySelector<HTMLElement>(".hw-popover-content")!.hidden).toBe(
      false,
    );
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await nextTick();
    expect(root.querySelector<HTMLElement>(".hw-popover-content")!.hidden).toBe(
      true,
    );
  });
  it("expands a tree with RTL arrows and selects a visible child", async () => {
    const selected = vi.fn();
    const root = mount(
      defineComponent(
        () => () =>
          h(
            "div",
            { dir: "rtl" },
            h(TreeView, {
              label: "Services",
              getExpandLabel: (node: { label: string }) => `Expand ${node.label}`,
              getCollapseLabel: (node: { label: string }) => `Collapse ${node.label}`,
              items: [
                {
                  id: "parent",
                  label: "Parent",
                  children: [
                    { id: "disabled", label: "Unavailable", disabled: true },
                    { id: "child", label: "Child" },
                  ],
                },
                { id: "last", label: "Last" },
              ],
              "onUpdate:modelValue": selected,
            }),
          ),
      ),
    );
    const parent = root.querySelector<HTMLElement>("[role=treeitem]")!;
    parent.focus();
    await key(parent, "ArrowLeft");
    expect(parent.getAttribute("aria-expanded")).toBe("true");
    await key(parent, "ArrowLeft");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Child");
    await key(document.activeElement!, "Enter");
    expect(selected).toHaveBeenCalledWith("child");
    await key(document.activeElement!, "ArrowRight");
    expect(document.activeElement).toBe(parent);
  });
  it("uses native drawer lifecycle and caller-owned toast dismissal", async () => {
    nativeDialog();
    const open = ref(false);
    const dismiss = vi.fn();
    const root = mount(
      defineComponent(
        () => () =>
          h("div", {}, [
            h(
              "button",
              {
                onClick: () => {
                  open.value = true;
                },
              },
              "Open",
            ),
            h(
              Drawer,
              {
                title: "Navigation",
                closeLabel: "Close",
                side: "start",
                open: open.value,
                "onUpdate:open": (value) => {
                  open.value = value;
                },
              },
              () => h("a", { href: "#section" }, "Section"),
            ),
            h(ToastRegion, {
              label: "Notifications",
              getDismissLabel: (message: { message: string }) => `Dismiss notification: ${message.message}`,
              messages: [
                { id: "one", message: "Saved" },
                { id: "two", message: "Urgent", urgent: true },
              ],
              onDismiss: dismiss,
            }),
          ]),
      ),
    );
    const trigger = root.querySelector("button")!;
    trigger.focus();
    trigger.click();
    await nextTick();
    expect(root.querySelector("dialog")!.open).toBe(true);
    expect(root.querySelector("dialog")!.dataset.side).toBe("start");
    root
      .querySelector("dialog")!
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(trigger);
    root
      .querySelector<HTMLButtonElement>('[aria-label="Dismiss notification: Saved"]')!
      .click();
    await nextTick();
    expect(dismiss).toHaveBeenCalledWith("one");
    expect(root.querySelector("[role=status]")!.textContent).toContain("Saved");
    expect(root.querySelector("[role=alert]")!.textContent).toContain("Urgent");
  });
});
describe("Vue content and layouts", () => {
  it("sorts numeric rows stably without mutating the caller and exposes aria-sort", async () => {
    const rows = [
      { id: "first", amount: 10 },
      { id: "second", amount: 2 },
      { id: "third", amount: 10 },
    ];
    const root = mount(
      defineComponent(
        () => () =>
          h(DataTable, {
            caption: "Requests",
            locale: "en-US",
            emptyMessage: "No requests",
            rows,
            columns: [
              { key: "id", label: "ID" },
              { key: "amount", label: "Amount", sortable: true },
            ],
          }),
      ),
    );
    root.querySelector<HTMLButtonElement>("th button")!.click();
    await nextTick();
    expect(
      [...root.querySelectorAll("tbody tr")].map(
        (row) => row.firstElementChild?.textContent,
      ),
    ).toEqual(["second", "first", "third"]);
    expect(root.querySelector("[aria-sort]")!.getAttribute("aria-sort")).toBe(
      "ascending",
    );
    expect(rows.map((row) => row.id)).toEqual(["first", "second", "third"]);
    root.querySelector<HTMLButtonElement>("th button")!.click();
    await nextTick();
    expect(root.querySelector("[aria-sort]")!.getAttribute("aria-sort")).toBe(
      "descending",
    );
  });
  it("emits configurable platform actions and carousel movement without backend claims", async () => {
    const feedback = vi.fn();
    const reject = vi.fn();
    const root = mount(
      defineComponent(
        () => () =>
          h("div", {}, [
            h(Feedback, { label: "Was this page helpful?", yesLabel: "Yes", noLabel: "No", commentLabel: "Tell us more", submitLabel: "Send feedback", successMessage: "Thank you for your feedback.", onSubmit: feedback }),
            h(CookieConsent, {
              title: "Cookie preferences",
              description: "Optional analytics.",
              acceptLabel: "Accept optional cookies",
              rejectLabel: "Reject optional cookies",
              preferencesLabel: "Manage preferences",
              onReject: reject,
            }),
            h(Carousel, {
              label: "Highlights",
              previousLabel: "Previous slide",
              nextLabel: "Next slide",
              indicatorsLabel: "Choose a slide",
              emptyLabel: "No slides",
              getSlideLabel: (position: number, total: number) => `Slide ${position} of ${total}`,
              slides: [
                { id: "a", content: "One" },
                { id: "b", content: "Two" },
              ],
            }),
          ]),
      ),
    );
    const buttons = [...root.querySelectorAll<HTMLButtonElement>("button")];
    buttons.find((button) => button.textContent === "Yes")!.click();
    await nextTick();
    [...root.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "Send feedback")!
      .click();
    expect(feedback).toHaveBeenCalledWith({ value: "yes", comment: "" });
    buttons
      .find((button) => button.textContent === "Reject optional cookies")!
      .click();
    await nextTick();
    expect(reject).toHaveBeenCalledOnce();
    expect(root.querySelector<HTMLElement>(".hw-cookie-consent")!.hidden).toBe(
      true,
    );
    buttons.find((button) => button.getAttribute("aria-label") === "Next slide")!.click();
    await nextTick();
    expect(root.querySelector(".hw-carousel [role=status]")!.textContent).toBe(
      "Slide 2 of 2",
    );
  });
  it("renders responsive layout variables on the server without viewport globals", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            Grid,
            {
              columns: { base: 1, md: 3 },
              gap: { base: 2, lg: 6 },
              padding: 4,
            },
            () =>
              h(Stack, { as: "section", gap: 3 }, () => h("p", {}, "Content")),
          ),
      }),
    );
    expect(html).toContain("--hw-layout-columns-md:3");
    expect(html).toContain("--hw-layout-gap-lg:var(--hw-space-6, 1.5rem)");
    expect(html).toContain("<section");
  });
});
