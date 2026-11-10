/** Shows a model value in a native input without echoing the user's own typing back.
 * Number and date inputs report '' while what is being typed is incomplete ('-', '1e',
 * one segment of a date); writing that '' into the input would erase the draft. The
 * input is therefore written only when the model changed from outside, and only when
 * it does not already show that value. */
export class InputValueSync {
  private shown: string | undefined;
  private forced = false;
  /** The user typed: the input already shows what the model is about to hold. */
  typed(value: string): void { this.shown = value; }
  /** A form wrote or reset the model: show it even where it looks unchanged, clearing any draft. */
  force(): void { this.forced = true; }
  /** Call after every render with the model as text. */
  apply(input: HTMLInputElement | undefined, value: string): void {
    if (!input || (!this.forced && value === this.shown)) return;
    if (this.forced || input.value !== value) input.value = value;
    this.shown = value; this.forced = false;
  }
}
