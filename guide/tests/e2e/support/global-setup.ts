import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Fails early with a clear message when the build the requested project tests is
// missing or was built for another base path.
const expectedBase = '/hawiyah/';

function requested(): string[] {
  const projects: string[] = [];
  const argv = process.argv;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? '';
    if (arg.startsWith('--project=')) projects.push(arg.slice('--project='.length));
    else if (arg === '--project' && argv[i + 1]) projects.push(argv[i + 1] ?? '');
  }
  return projects.length > 0 ? projects : ['prod', 'dev'];
}

export default function globalSetup(): void {
  const dirs: Record<string, string> = { prod: 'dist/browser', dev: 'dist-dev/browser' };
  for (const project of requested()) {
    const dir = dirs[project];
    if (!dir) continue;
    const index = join(dir, 'index.html');
    if (!existsSync(index)) {
      throw new Error(
        `e2e: ${index} is missing. Build first: HAWIYAH_BASE_PATH=${expectedBase} ` +
          (project === 'dev' ? 'npm run build:dev-check' : 'npm run build'),
      );
    }
    const html = readFileSync(index, 'utf8');
    const match = /<base href="([^"]*)"/.exec(html);
    if (!match || match[1] !== expectedBase) {
      throw new Error(
        `e2e: ${index} has base href ${match ? `"${match[1]}"` : '(none)'}; rebuild with HAWIYAH_BASE_PATH=${expectedBase}`,
      );
    }
  }
}
