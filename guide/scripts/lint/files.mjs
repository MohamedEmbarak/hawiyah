// File discovery and finding helpers shared by the three linters. Paths in
// findings are relative to the linted root (guide/ or a fixture root) and
// use forward slashes.

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function listFiles(root, top, accept) {
  const files = [];
  const start = join(root, top);
  if (!existsSync(start)) return files;
  const walk = (rel) => {
    for (const dirent of readdirSync(join(root, rel), { withFileTypes: true })) {
      const path = `${rel}/${dirent.name}`;
      if (dirent.isDirectory()) {
        if (dirent.name === 'node_modules' || path === 'src/generated' || /(^|\/)test\/fixtures$/.test(path)) continue;
        walk(path);
      } else if (dirent.isFile() && accept(path)) {
        files.push(path);
      }
    }
  };
  walk(top);
  return files.sort();
}

export function finding(rule, file, line, column, message) {
  return { rule, file, line, column, message };
}

export function formatFinding(item) {
  return `${item.rule} ${item.file}:${item.line}:${item.column}: ${item.message}`;
}

export function sortFindings(findings) {
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule));
}
