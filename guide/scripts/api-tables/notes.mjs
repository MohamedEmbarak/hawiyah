// The generated note of a JavaScript table that step 30 reads from the
// published stylesheet alone (leadAmendments A11 of milestone 5): the classes
// of 26 components without a vanilla controller have no row in the stable class
// and state API of the @hawiyah/styles README. content:api-tables and the
// scaffold write the note as a NOTE alert directly after the table; step 30
// requires it there for those components and refuses it for the others. The
// version is the installed @hawiyah/styles, so the note follows the pin.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function stylesVersion(nodeModules) {
  return JSON.parse(readFileSync(join(nodeModules, '@hawiyah', 'styles', 'package.json'), 'utf8')).version;
}

const TEXT = {
  en: (version) => `These classes and attributes are read from the published stylesheet and are outside the stable contract of ${version}.`,
  ar: (version) => `تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار ${version}.`,
};

/** The text of the note in a page language. */
export function generatedNote(lang, version) {
  return TEXT[lang === 'ar' ? 'ar' : 'en'](version);
}

/** The note as Markdown, as content:api-tables writes it. */
export function generatedNoteMarkdown(lang, version) {
  return `> [!NOTE]\n> ${generatedNote(lang, version)}`;
}
