/// <reference path="./frame-text.d.ts" />
// The srcdoc of an example frame (editor.frame.document and editor.fallback.document).
// Pure functions: the caller supplies the runtime URLs, the nonce, the token and
// the run, so the same input always gives the same document.
import type { CompiledExample, ExampleDirection, ExampleFramework, ExampleLanguage } from '../payload';
import { EXAMPLE_PROJECT_PREFIX } from '../payload';
import bootstrapSource from './bootstrap.frame.js' with { loader: 'text' };
import startBundledSource from './start-bundled.frame.js' with { loader: 'text' };
import startModulesSource from './start-modules.frame.js' with { loader: 'text' };
import { CHANNEL, PROTOCOL_VERSION } from './protocol';

/** Sandbox of every example frame: scripts and forms, nothing else (no same origin, popups or navigation). */
export const FRAME_SANDBOX = 'allow-scripts allow-forms';
export const FRAME_REFERRER_POLICY = 'no-referrer';

/** Id of the element that holds the example's host markup. */
export const MOUNT_ID = 'hawiyah-preview-root';

export interface FrameDocumentInput {
  readonly framework: ExampleFramework;
  readonly lang: ExampleLanguage;
  readonly dir: ExampleDirection;
  readonly mode: 'light' | 'dark';
  /** The frame title text in the page language, also written into the document <title> (leadAmendments A10). */
  readonly title: string;
  readonly compiled: Pick<CompiledExample, 'host' | 'entry' | 'modules' | 'classic'>;
  /** <origin><base>runtime/, ending in '/'. */
  readonly runtimeBase: string;
  /** Stylesheets of the frame relative to runtimeBase (reset, styles, fonts). */
  readonly stylesheets: readonly string[];
  /** 128 random bits in hex, new per run. */
  readonly nonce: string;
  readonly token: string;
  readonly run: number;
  /** Edited Angular code compiled in the frame (JIT): adds 'unsafe-eval'. */
  readonly jit?: boolean;
}

export interface ModulesDocumentInput extends FrameDocumentInput {
  /** Runtime import map with absolute URLs (runtime-config.ts). */
  readonly imports: Readonly<Record<string, string>>;
}

/**
 * Escapes text placed inside a script or style element: '<' (so no '</script' or
 * '</style' can end the element early) and U+2028 / U+2029. The result is valid
 * JSON when the input is JSON, and a valid JavaScript expression when the input is one.
 */
export function escapeEmbedded(text: string): string {
  return text.replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** JSON for a script element. */
export function embedJson(value: unknown): string {
  return escapeEmbedded(JSON.stringify(value));
}

/** Function source of an in-frame script without a trailing semicolon. */
export function functionSource(source: string): string {
  return source.trim().replace(/;+$/, '');
}

/** Escapes an attribute value in double quotes. */
export function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Escapes text content of an element such as title. */
export function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A data: URL of a JavaScript module. */
export function moduleDataUrl(code: string): string {
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
}

/** The import map of a modules run: runtime entries, then hawiyah-project/<file> as data: URLs. */
export function frameImportMap(imports: Readonly<Record<string, string>>, modules: Readonly<Record<string, string>>): { imports: Record<string, string> } {
  const map: Record<string, string> = {};
  for (const specifier of Object.keys(imports).sort()) map[specifier] = imports[specifier] as string;
  for (const file of Object.keys(modules).sort()) map[`${EXAMPLE_PROJECT_PREFIX}${file}`] = moduleDataUrl(modules[file] as string);
  return { imports: map };
}

/** The two Content-Security-Policy values of a frame (editor.frame.csp). */
export function framePolicies(input: { runtimeBase: string; nonce: string; jit?: boolean; bundled?: boolean }): [string, string] {
  const rt = input.runtimeBase;
  const evaluation = input.jit ? " 'unsafe-eval'" : '';
  const data = input.bundled ? '' : ' data:';
  const p1 = [
    "default-src 'none'",
    `script-src 'nonce-${input.nonce}' ${rt}${data}${evaluation}`,
    `style-src 'unsafe-inline' ${rt}`,
    `img-src data: blob: ${rt}`,
    `font-src ${rt}`,
    "connect-src 'none'",
    "media-src 'none'",
    "frame-src 'none'",
    "child-src 'none'",
    "worker-src 'none'",
    "object-src 'none'",
    "manifest-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
  const p2 = `script-src 'unsafe-inline' ${rt}${data}${evaluation}`;
  return [p1, p2];
}

function head(input: FrameDocumentInput, scripts: string, bundled: boolean): string {
  const [p1, p2] = framePolicies({ runtimeBase: input.runtimeBase, nonce: input.nonce, jit: input.jit, bundled });
  const links = input.stylesheets.map((path) => `<link rel="stylesheet" href="${escapeAttribute(input.runtimeBase + path)}">`).join('');
  const style =
    `<style>html{color-scheme:${input.mode};background-color:var(--hw-color-canvas);color:var(--hw-color-text);font-family:var(--hw-font-sans)}` +
    `body{margin:0;padding:var(--hw-space-5)}#${MOUNT_ID}{display:flow-root;min-inline-size:0}</style>`;
  return (
    '<head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(p1)}">` +
    `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(p2)}">` +
    '<meta name="referrer" content="no-referrer">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    `<title>${escapeText(input.title)}</title>` +
    scripts +
    links +
    style +
    '</head>'
  );
}

function bootstrapCall(input: FrameDocumentInput, start: string, extra: Record<string, unknown>): string {
  const config = {
    channel: CHANNEL,
    version: PROTOCOL_VERSION,
    token: input.token,
    run: input.run,
    entry: `${EXAMPLE_PROJECT_PREFIX}${input.compiled.entry}`,
    ...extra,
  };
  return `(${functionSource(bootstrapSource)})(${embedJson(config)}, ${functionSource(start)});`;
}

function devModeScript(input: FrameDocumentInput): string {
  return input.framework === 'angular' && !input.jit ? `<script nonce="${input.nonce}">globalThis.ngDevMode=false;</script>` : '';
}

function documentOf(input: FrameDocumentInput, scripts: string, bundled: boolean): string {
  return (
    '<!doctype html>' +
    `<html lang="${input.lang}" dir="${input.dir}" data-hw-theme="dga" data-hw-mode="${input.mode}" data-hw-density="comfortable">` +
    head(input, scripts, bundled) +
    `<body><div id="${MOUNT_ID}">${input.compiled.host}</div></body></html>`
  );
}

/** The document of a run on the import-map strategy. */
export function modulesDocument(input: ModulesDocumentInput): string {
  const map = frameImportMap(input.imports, input.compiled.modules);
  const scripts =
    `<script type="importmap" nonce="${input.nonce}">${embedJson(map)}</script>` +
    devModeScript(input) +
    `<script nonce="${input.nonce}">${bootstrapCall(input, startModulesSource, {})}</script>`;
  return documentOf(input, scripts, false);
}

/** The document of a run on the bundled runtime (editor.fallback.document). */
export function bundledDocument(input: FrameDocumentInput): string {
  const scripts =
    devModeScript(input) +
    `<script nonce="${input.nonce}" src="${escapeAttribute(`${input.runtimeBase}bundles/${input.framework}.js`)}"></script>` +
    `<script nonce="${input.nonce}">${bootstrapCall(input, startBundledSource, { classic: input.compiled.classic })}</script>`;
  return documentOf(input, scripts, true);
}
