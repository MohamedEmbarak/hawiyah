// Local, lazy-loaded native runtimes for the unique-origin documentation sandbox.
import { build } from "vite";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const generated = new URL("../apps/playground/src/generated/", import.meta.url);
await mkdir(generated, { recursive: true });
for (const framework of ["react", "vue", "angular"]) {
  const aliases = Object.fromEntries(
    ["core", "react", "vue", "angular"].map((name) => [
      `@nasaq/${name}`,
      `${root}packages/${name}/dist/${name === "angular" ? "fesm2022/nasaq-angular.mjs" : "index.js"}`,
    ]),
  );
  const output = await build({
    configFile: false,
    root,
    logLevel: "error",
    resolve: { alias: aliases },
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      write: false,
      minify: true,
      lib: {
        entry: `${root}scripts/preview-entries/${framework}.ts`,
        name: "NasaqProjectRuntime",
        formats: ["iife"],
      },
    },
  });
  const files = (Array.isArray(output) ? output : [output]).flatMap(
    (result) => result.output,
  );
  const runtime = files
    .filter((file) => file.type === "chunk")
    .map((file) => file.code)
    .join("\n");
  const source = `// Generated native ${framework} preview runtime.\nexport default ${JSON.stringify(runtime)};\n`;
  const dest = new URL(`project-${framework}-runtime.ts`, generated);
  let previous;
  try {
    previous = await readFile(dest, "utf8");
  } catch {}
  if (previous !== source) await writeFile(dest, source);
  console.log(`Built ${framework} project preview runtime.`);
}
