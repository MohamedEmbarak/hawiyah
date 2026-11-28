// Runtime configuration of the example frames (editor.runtimeFiles.importMap):
// loads runtime/import-map.json and runtime/manifest.json from the guide's own
// origin and makes the runtime URLs absolute (<origin><base>runtime/...), since
// the frame document has an opaque origin and no base of its own.

/** Paths written by build step 60, relative to the base. */
export const IMPORT_MAP_PATH = 'runtime/import-map.json';
export const MANIFEST_PATH = 'runtime/manifest.json';

export interface RuntimeConfig {
  /** <origin><base>runtime/ */
  readonly runtimeBase: string;
  /** Specifier to absolute URL. */
  readonly imports: Readonly<Record<string, string>>;
  /** Stylesheets of the frame relative to runtimeBase. */
  readonly stylesheets: readonly string[];
}

export interface RuntimeManifestEntry {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly source: 'published' | 'linked' | 'bundled';
  readonly package: string;
  readonly version: string;
  readonly packageIntegrity: string;
  readonly file?: string;
  readonly tool?: string;
}

type Fetch = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** The frame stylesheets of @hawiyah/styles at the pinned version, relative to runtime/. */
export function frameStylesheets(pin: string): string[] {
  return ['reset.css', 'styles.css', 'fonts.css'].map((name) => `npm/@hawiyah/styles@${pin}/dist/${name}`);
}

/** Turns the base-relative paths of runtime/import-map.json into absolute URLs. */
export function absoluteImports(map: unknown, baseUri: string): Record<string, string> {
  const imports = (map as { imports?: unknown } | null)?.imports;
  if (!imports || typeof imports !== 'object') throw new Error(`${IMPORT_MAP_PATH} has no imports`);
  const out: Record<string, string> = {};
  for (const [specifier, path] of Object.entries(imports as Record<string, unknown>)) {
    if (typeof path !== 'string' || !path.startsWith('runtime/')) throw new Error(`${IMPORT_MAP_PATH}: ${specifier} is not a runtime path`);
    out[specifier] = new URL(path, baseUri).href;
  }
  return out;
}

async function getJson(fetcher: Fetch, url: string): Promise<unknown> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

let cached: { key: string; value: Promise<RuntimeConfig> } | null = null;

/** Loads the runtime configuration once per document base. */
export function loadRuntimeConfig(baseUri: string, pin: string, fetcher: Fetch): Promise<RuntimeConfig> {
  if (cached && cached.key === baseUri) return cached.value;
  const value = getJson(fetcher, new URL(IMPORT_MAP_PATH, baseUri).href).then((map) => ({
    runtimeBase: new URL('runtime/', baseUri).href,
    imports: absoluteImports(map, baseUri),
    stylesheets: frameStylesheets(pin),
  }));
  value.catch(() => {
    if (cached?.value === value) cached = null;
  });
  cached = { key: baseUri, value };
  return value;
}

/** Loads runtime/manifest.json (the editor's integrity status). */
export async function loadRuntimeManifest(baseUri: string, fetcher: Fetch): Promise<readonly RuntimeManifestEntry[]> {
  const manifest = (await getJson(fetcher, new URL(MANIFEST_PATH, baseUri).href)) as { entries?: unknown };
  if (!Array.isArray(manifest?.entries)) throw new Error(`${MANIFEST_PATH} has no entries`);
  return manifest.entries as RuntimeManifestEntry[];
}
