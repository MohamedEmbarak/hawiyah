import { expect, it } from 'vitest';
import { projectDownloadFiles } from '../apps/playground/src/project-download';
import { projectExample } from '../apps/playground/src/project-examples';

it.each(['ar', 'en'] as const)('exports the selected %s document language in all supported project formats', locale => {
  for (const framework of ['vanilla', 'react', 'vue', 'angular'] as const) {
    for (const language of ['javascript', 'typescript'] as const) {
      if (framework === 'angular' && language === 'javascript') continue;
      const example = projectExample('button', framework, language, locale, '<button>OK</button>');
      const files = projectDownloadFiles(example, example.files, framework, language, locale);
      const root = new DOMParser().parseFromString(files['index.html'], 'text/html').documentElement;
      expect(root.lang).toBe(locale);
      expect(root.dir).toBe(locale === 'ar' ? 'rtl' : 'ltr');
      expect(files[example.entry]).toBeTruthy();
    }
  }
});

it('preserves the edited language and direction of a complete vanilla HTML document', () => {
  const example = projectExample('button', 'vanilla', 'javascript', 'ar', '<button>OK</button>');
  const html = '<!doctype html><html lang="en" dir="rtl"><body>Edited</body></html>';
  const files = projectDownloadFiles(example, { ...example.files, html }, 'vanilla', 'javascript', 'ar');
  expect(files['index.html']).toBe(html);
});
