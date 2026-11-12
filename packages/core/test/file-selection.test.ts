import { describe, expect, it } from 'vitest';
import { evaluateFileSelection, isFileDrag, matchesFileAccept } from '../src/index.js';

const file = (name: string, type: string, size = 10) => ({ name, type, size });
const pdf = file('report.pdf', 'application/pdf'); const png = file('photo.png', 'image/png'); const text = file('notes.txt', 'text/plain');

describe('evaluateFileSelection', () => {
  it('[FILESEL-01] rejects only the mismatching file of a mixed batch and accepts nothing', () => {
    const result = evaluateFileSelection([pdf, text, png], { accept: '.pdf,.png', multiple: true });
    expect(result).toEqual({ accepted: [], rejected: [text], reasons: ['type'] });
    const clean = evaluateFileSelection([pdf, png], { accept: '.pdf,.png', multiple: true });
    expect(clean).toEqual({ accepted: [pdf, png], rejected: [], reasons: [] });
    expect(clean.accepted).not.toBe(clean.rejected);
  });
  it('[FILESEL-02] rejects every file with count when several arrive without multiple', () => {
    expect(evaluateFileSelection([pdf, png])).toEqual({ accepted: [], rejected: [pdf, png], reasons: ['count', 'count'] });
    expect(evaluateFileSelection([pdf, png], { multiple: false, accept: '.txt' }).reasons).toEqual(['count', 'count']);
    expect(evaluateFileSelection([pdf, png], { multiple: true })).toEqual({ accepted: [pdf, png], rejected: [], reasons: [] });
    expect(evaluateFileSelection([pdf])).toEqual({ accepted: [pdf], rejected: [], reasons: [] });
    expect(evaluateFileSelection([])).toEqual({ accepted: [], rejected: [], reasons: [] });
  });
  it('[FILESEL-03] limits the size only for a finite positive maxSize, and names the type first', () => {
    const large = file('large.pdf', 'application/pdf', 2048); const exact = file('exact.pdf', 'application/pdf', 1024);
    expect(evaluateFileSelection([large], { maxSize: 1024 })).toEqual({ accepted: [], rejected: [large], reasons: ['size'] });
    expect(evaluateFileSelection([exact], { maxSize: 1024 }).accepted).toEqual([exact]);
    for (const maxSize of [0, -1, undefined, null, Number.POSITIVE_INFINITY, Number.NaN]) expect(evaluateFileSelection([large], { maxSize }).accepted, String(maxSize)).toEqual([large]);
    const wrong = file('large.txt', 'text/plain', 2048);
    expect(evaluateFileSelection([wrong, large], { accept: '.pdf', maxSize: 1024, multiple: true })).toEqual({ accepted: [], rejected: [wrong, large], reasons: ['type', 'size'] });
  });
  it('[FILESEL-04] matches extensions, wildcard and exact types without regard to case, spaces or empty tokens', () => {
    expect(matchesFileAccept(file('REPORT.PDF', ''), '.pdf')).toBe(true); expect(matchesFileAccept(pdf, '.PDF')).toBe(true);
    expect(matchesFileAccept(png, 'image/*')).toBe(true); expect(matchesFileAccept(file('photo', 'IMAGE/PNG'), 'image/*')).toBe(true);
    expect(matchesFileAccept(pdf, 'image/*')).toBe(false); expect(matchesFileAccept(file('image', 'imagery/x'), 'image/*')).toBe(false);
    expect(matchesFileAccept(pdf, 'application/pdf')).toBe(true); expect(matchesFileAccept(pdf, 'application/pd')).toBe(false);
    expect(matchesFileAccept(text, ' .pdf , text/plain ,')).toBe(true); expect(matchesFileAccept(text, '.pdf, ,image/*,')).toBe(false);
    for (const accept of ['', ' ', ',', null, undefined]) expect(matchesFileAccept(text, accept), String(accept)).toBe(true);
  });
});

it('[FILESEL-05] tells a drag of files from any other drag', () => {
  expect(isFileDrag({ types: ['text/plain', 'Files'] })).toBe(true);
  expect(isFileDrag({ types: { length: 1, 0: 'Files' } })).toBe(true);
  expect(isFileDrag({ types: ['text/uri-list'] })).toBe(false); expect(isFileDrag({ types: [] })).toBe(false);
  expect(isFileDrag({ types: null })).toBe(false); expect(isFileDrag({})).toBe(false);
  expect(isFileDrag(null)).toBe(false); expect(isFileDrag(undefined)).toBe(false);
});
