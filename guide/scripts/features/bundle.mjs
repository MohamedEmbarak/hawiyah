// The content manifest stays out of the browser (5a.2): no output of the browser build
// may have src/generated/content/manifest.json among its inputs. The catalogue, the
// side navigation, the drawer and the editor read the navigation index
// (navigation.json) from lazy chunks, the route matcher the ids of routes.json.
import { existsSync, readFileSync } from "node:fs";

/** The input that no browser output may contain. */
export const BUILD_TIME_ONLY = ["src/generated/content/manifest.json"];

/**
 * Browser outputs of an esbuild metafile (browser-stats.json) whose inputs include a
 * build-time-only file: [{ output, entryPoint, input, bytes }].
 */
export function buildTimeInputs(stats, inputs = BUILD_TIME_ONLY) {
  const found = [];
  for (const [output, entry] of Object.entries(stats?.outputs ?? {})) {
    for (const [input, info] of Object.entries(entry.inputs ?? {})) {
      const path = input.split("\\").join("/");
      if (inputs.some((name) => path === name || path.endsWith(`/${name}`))) found.push({ output, entryPoint: entry.entryPoint ?? null, input: path, bytes: info.bytesInOutput ?? 0 });
    }
  }
  return found;
}

/** Throws when a browser output of the build in <outDir> has a build-time-only input. */
export function checkBrowserStats(statsFile) {
  if (!existsSync(statsFile)) throw new Error(`features: ${statsFile} does not exist; ng build --stats-json writes it`);
  const found = buildTimeInputs(JSON.parse(readFileSync(statsFile, "utf8")));
  if (found.length > 0) {
    throw new Error(`features: the content manifest is part of the browser build: ${found.map((item) => `${item.output}${item.entryPoint ? ` (entry ${item.entryPoint})` : ""} has ${item.input}, ${item.bytes} bytes`).join("; ")}`);
  }
  return { outputs: Object.keys(JSON.parse(readFileSync(statsFile, "utf8")).outputs ?? {}).length };
}
