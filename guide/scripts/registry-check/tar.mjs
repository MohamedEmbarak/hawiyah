// Minimal reader of gzip-compressed ustar archives as written by npm pack.
// Returns { path, sha256, size } for every regular file under package/, with
// the leading 'package/' removed. PAX ('x', 'g') and GNU long-name ('L')
// headers are honoured; other entry types (directories, links) are skipped.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const BLOCK = 512;

function text(buffer, start, length) {
  const slice = buffer.subarray(start, start + length);
  const end = slice.indexOf(0);
  return slice.subarray(0, end === -1 ? slice.length : end).toString('utf8');
}

function octal(buffer, start, length) {
  const first = buffer[start];
  if (first & 0x80) {
    // Base-256 encoding for large sizes.
    let value = 0;
    for (let i = 1; i < length; i += 1) value = value * 256 + buffer[start + i];
    return value;
  }
  const value = text(buffer, start, length).trim();
  return value === '' ? 0 : Number.parseInt(value, 8);
}

function parsePax(body) {
  const fields = {};
  let offset = 0;
  // Record lengths count bytes, so the records are cut from the buffer.
  while (offset < body.length) {
    const space = body.indexOf(0x20, offset);
    if (space === -1) break;
    const length = Number.parseInt(body.subarray(offset, space).toString('ascii'), 10);
    if (!Number.isFinite(length) || length <= 0) break;
    const record = body.subarray(space + 1, offset + length - 1).toString('utf8');
    const equals = record.indexOf('=');
    if (equals !== -1) fields[record.slice(0, equals)] = record.slice(equals + 1);
    offset += length;
  }
  return fields;
}

export function readTarEntries(archive) {
  const data = archive[0] === 0x1f && archive[1] === 0x8b ? gunzipSync(archive) : archive;
  const files = [];
  let offset = 0;
  let longName = null;
  let pax = {};
  let globalPax = {};
  while (offset + BLOCK <= data.length) {
    const header = data.subarray(offset, offset + BLOCK);
    if (header.every((byte) => byte === 0)) break;
    const size = octal(header, 124, 12);
    const type = String.fromCharCode(header[156] || 0x30);
    const magic = text(header, 257, 6);
    let name = text(header, 0, 100);
    const prefix = magic.startsWith('ustar') ? text(header, 345, 155) : '';
    if (prefix) name = `${prefix}/${name}`;
    const bodyStart = offset + BLOCK;
    const body = data.subarray(bodyStart, bodyStart + size);
    offset = bodyStart + Math.ceil(size / BLOCK) * BLOCK;
    if (type === 'x') { pax = parsePax(body); continue; }
    if (type === 'g') { globalPax = { ...globalPax, ...parsePax(body) }; continue; }
    if (type === 'L') { longName = text(body, 0, body.length); continue; }
    const fullName = pax.path ?? longName ?? globalPax.path ?? name;
    pax = {};
    longName = null;
    if (type !== '0' && type !== '\0' && type !== '7') continue;
    const normalised = fullName.replace(/^\.\//, '');
    if (!normalised.startsWith('package/')) continue;
    files.push({
      path: normalised.slice('package/'.length),
      size,
      sha256: createHash('sha256').update(body).digest('hex'),
    });
  }
  return files;
}

export function readTarFile(file) {
  return readTarEntries(readFileSync(file));
}

export function sha512Integrity(buffer) {
  return `sha512-${createHash('sha512').update(buffer).digest('base64')}`;
}
