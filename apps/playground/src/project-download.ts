import type { IDEFiles } from "./component-ide";
import type {
  ProjectFramework,
  ProjectLanguage,
  ProjectFiles,
} from "./project-compiler";
import type { ProjectExample } from "./project-examples";

export function projectDownloadFiles(
  example: ProjectExample,
  edited: IDEFiles,
  framework: ProjectFramework,
  language: ProjectLanguage,
): ProjectFiles {
  const files = Object.fromEntries(
    Object.entries(edited).map(([id, source]) => [
      example.names[id as keyof IDEFiles],
      source,
    ]),
  );
  const body =
    framework === "vanilla"
      ? `<div id="app">${edited.html}</div>`
      : example.host;
  files["index.html"] =
    `<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nasaq example</title></head><body>${body}<script type="module" src="./${example.entry}"></script></body></html>\n`;
  if (framework === "vanilla" && /<html[\s>]/i.test(edited.html))
    files["index.html"] = edited.html;
  const deps: Record<string, string> = {};
  for (const name of new Set(["tokens", "styles", "core", framework]))
    deps[`@nasaq/${name}`] = `file:../packages/nasaq-${name}-0.1.0.tgz`;
  const dev: Record<string, string> = { vite: "8.3.5", typescript: "~6.0.0" };
  if (framework === "react") {
    Object.assign(deps, { react: "19.3.1", "react-dom": "19.3.1" });
    Object.assign(dev, {
      "@vitejs/plugin-react": "6.1.2",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
    });
  }
  if (framework === "vue") {
    deps.vue = "3.5.44";
    dev["@vitejs/plugin-vue"] = "6.0.10";
  }
  if (framework === "angular") {
    for (const pkg of [
      "core",
      "common",
      "forms",
      "compiler",
      "platform-browser",
    ])
      deps[`@angular/${pkg}`] = "22.2.3";
    Object.assign(deps, { rxjs: "^7.8.2", tslib: "^2.8.1" });
  }
  files["package.json"] =
    JSON.stringify(
      {
        name: "nasaq-component-example",
        private: true,
        type: "module",
        scripts: { dev: "vite", build: "vite build" },
        dependencies: deps,
        devDependencies: dev,
      },
      null,
      2,
    ) + "\n";
  const plugin =
    framework === "react" ? "react" : framework === "vue" ? "vue" : undefined;
  files["vite.config.js"] =
    `import { defineConfig } from 'vite';\n${plugin ? `import ${plugin} from '@vitejs/plugin-${plugin}';\n` : ""}export default defineConfig({${plugin ? `plugins: [${plugin}()],` : ""}${framework === "angular" ? "esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } } }, resolve: { dedupe: ['@angular/core','@angular/common','@angular/forms','@angular/compiler','rxjs'] }" : ""}});\n`;
  files["tsconfig.json"] =
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          jsx: "react-jsx",
          experimentalDecorators: true,
          useDefineForClassFields: false,
          skipLibCheck: true,
          allowJs: language === "javascript",
          noEmit: true,
          lib: ["ES2022", "DOM", "DOM.Iterable"],
        },
        include: ["*.ts", "*.tsx", "*.js", "*.jsx", "*.vue"],
      },
      null,
      2,
    ) + "\n";
  files["env.d.ts"] = '/// <reference types="vite/client" />\n' + (framework === 'vue' ? '\ndeclare module "*.vue" {\n  import type { DefineComponent } from "vue";\n  const component: DefineComponent;\n  export default component;\n}\n' : '');
  files["README.md"] =
    `# Nasaq ${framework} example\n\nThese are the edited project files, with real package imports and application entry points.\n\nNasaq is currently a private source preview, not an npm release. Clone MohamedEmbarak/nasaq, run corepack pnpm build:packages and corepack pnpm check:packages, then copy the required nasaq-*.tgz files from .artifacts/package-check to a packages directory beside this extracted project. The package.json file dependencies point there. Run npm install, then npm run dev.\n\nFramework and compiler versions match the guide's installed consumers. Angular uses a standalone JIT Vite example; production Angular projects should use their normal CLI/AOT pipeline. The in-browser editor transpiles syntax; it does not replace a project's full type-checker.\n\nPreview navigation is contained by the guide. Downloaded application links and forms follow normal browser behavior; connect your own routes and handlers.\n`;
  return files;
}

/** Small standards-based ZIP writer: UTF-8 filenames, stored entries, no runtime dependency. */
export function projectZip(files: ProjectFiles): Blob {
  const encoder = new TextEncoder(),
    parts: Uint8Array<ArrayBuffer>[] = [],
    directory: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;
  const header = (size: number) => new Uint8Array(size);
  const crc = (bytes: Uint8Array) => {
    let value = 0xffffffff;
    for (const byte of bytes) {
      value ^= byte;
      for (let bit = 0; bit < 8; bit++)
        value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    }
    return (value ^ 0xffffffff) >>> 0;
  };
  for (const [filename, source] of Object.entries(files)) {
    const name = encoder.encode(filename),
      data = encoder.encode(source),
      checksum = crc(data);
    const local = header(30 + name.length),
      view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(12, 33, true);
    view.setUint32(14, checksum, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    const central = header(46 + name.length),
      cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 33, true);
    cv.setUint32(16, checksum, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    parts.push(local, data);
    directory.push(central);
    offset += local.length + data.length;
  }
  const directorySize = directory.reduce((sum, part) => sum + part.length, 0),
    end = header(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, directory.length, true);
  ev.setUint16(10, directory.length, true);
  ev.setUint32(12, directorySize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: "application/zip" });
}
