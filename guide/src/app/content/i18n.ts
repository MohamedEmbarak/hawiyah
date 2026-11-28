import { Texts } from '../i18n/text';
import type { AlertKind } from './model';

export interface ContentTexts {
  /** Accessible name of the copy button of a code listing. */
  readonly copyCode: string;
  readonly copied: string;
  readonly copyFailed: string;
  /** Title of a code listing whose info string names no title and no known language. */
  readonly codeListing: string;
  /** The single cell of a table without rows. */
  readonly emptyTable: string;
  /** Visually hidden text after the text of a link that opens in a new tab. */
  readonly opensInNewTab: string;
  /** Titles of the GitHub alert kinds. */
  readonly alerts: Readonly<Record<AlertKind, string>>;
}

export const contentTexts: Texts<ContentTexts> = {
  en: {
    copyCode: 'Copy code',
    copied: 'Copied',
    copyFailed: 'Copying failed. Select the code and copy it manually.',
    codeListing: 'Code listing',
    emptyTable: 'No rows',
    opensInNewTab: '(opens in a new tab)',
    alerts: { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' },
  },
  ar: {
    copyCode: 'نسخ الشيفرة',
    copied: 'تم النسخ',
    copyFailed: 'تعذّر النسخ. حدّد الشيفرة وانسخها يدويًا.',
    codeListing: 'الشيفرة',
    emptyTable: 'لا توجد صفوف',
    opensInNewTab: '(يُفتح في علامة تبويب جديدة)',
    alerts: { note: 'ملاحظة', tip: 'تلميح', important: 'مهم', warning: 'تحذير', caution: 'تنبيه' },
  },
};
