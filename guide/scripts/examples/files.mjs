// Copies the example payloads of .cache/examples/frames into the built site:
//   <browserDir>/examples/<id>/<lang>/<example>/<framework>.json
//   <browserDir>/examples/<id>/<lang>/<example>/<framework>/<fileName>   (download files)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { resetDir, writeFile } from './modules.mjs';

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function payloadFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...payloadFiles(path));
    else if (name.endsWith('.json')) out.push(path);
  }
  return out.sort();
}

/** Returns { payloads, files } counts; throws on a payload that does not match its path. */
export function copyExampleFiles(framesDir, examplesDir) {
  if (!existsSync(framesDir)) throw new Error(`${framesDir} does not exist; build step 25-examples writes it`);
  resetDir(examplesDir);
  let files = 0;
  const list = payloadFiles(framesDir);
  for (const path of list) {
    const rel = relative(framesDir, path).split(/[\\/]/);
    const payload = JSON.parse(readFileSync(path, 'utf8'));
    const expected = [payload.id, payload.lang, payload.example, `${payload.framework}.json`];
    if (rel.join('/') !== expected.join('/')) throw new Error(`${rel.join('/')} holds the payload of ${expected.join('/')}`);
    writeFile(join(examplesDir, ...expected), readFileSync(path, 'utf8'));
    for (const [fileName, source] of Object.entries(payload.files)) {
      if (!SAFE_NAME.test(fileName)) throw new Error(`${rel.join('/')}: file name ${fileName} is not allowed`);
      writeFile(join(examplesDir, payload.id, payload.lang, payload.example, payload.framework, fileName), source);
      files += 1;
    }
  }
  return { payloads: list.length, files };
}
