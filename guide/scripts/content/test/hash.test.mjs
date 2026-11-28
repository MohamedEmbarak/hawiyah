// Section hashes and the content:hash command.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { frontMatterBlock, hashText, sectionHashes, splitSections } from '../hash.mjs';
import { guideDir, validAr, validEn } from './helpers.mjs';

describe('section hashes', () => {
  it('splits the summary and the h2 sections, ignoring headings inside code fences', () => {
    const text = '# T\n\nSummary.  \n\n## Example\n\n```md\n## not a heading\n```\n\n## API\nText\n';
    expect(splitSections(text)).toEqual([
      { id: 'summary', text: 'Summary.', line: 3 },
      { id: 'example', text: '## Example\n\n```md\n## not a heading\n```', line: 5 },
      { id: 'api', text: '## API\nText', line: 11 },
    ]);
  });

  it('hashes the first 12 hex characters of sha256 and ignores line endings and trailing spaces', () => {
    expect(hashText('abc')).toBe(createHash('sha256').update('abc').digest('hex').slice(0, 12));
    expect(sectionHashes('# T\r\n\r\nA.   \r\n')).toEqual(sectionHashes('# T\n\nA.\n'));
  });

  it('maps Arabic h2 texts to the same section ids', () => {
    expect(Object.keys(sectionHashes(validAr()))).toEqual(Object.keys(sectionHashes(validEn())));
  });

  it('prints the block the Arabic fixture carries', () => {
    const block = frontMatterBlock(validEn());
    expect(validAr().startsWith(`${block}\n`)).toBe(true);
  });

  it('npm run content:hash prints a YAML block with the key source and edits nothing', () => {
    const before = validAr();
    const output = execFileSync(process.execPath, ['scripts/content/hash.mjs', 'fixture-a', '--docs', 'scripts/content/test/fixtures/docs'], { cwd: guideDir, encoding: 'utf8' });
    expect(output).toBe(`${frontMatterBlock(validEn())}\n`);
    expect(output.split('\n').slice(0, 2)).toEqual(['---', 'source:']);
    expect(validAr()).toBe(before);
  });
});
