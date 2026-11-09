import * as ts from "typescript";
export type ProjectFramework = "vanilla" | "react" | "vue" | "angular";
export type ProjectLanguage = "javascript" | "typescript";
export type ProjectFiles = Record<string, string>;

/** Compile only; edited application code executes exclusively inside the sandbox. */
export async function compileProject(
  files: ProjectFiles,
  entry: string,
): Promise<{ script: string; css: string }> {
  const modules: string[] = [];
  let css = "";
  for (const [name, original] of Object.entries(files)) {
    if (name.endsWith(".css")) {
      css +=
        original.replace(
          /@import\s+['"]@hawiyah\/styles\/styles\.css['"]\s*;/g,
          "",
        ) + "\n";
      continue;
    }
    if (!/\.(?:[jt]sx?|vue)$/.test(name)) continue;
    let source = original;
    if (name.endsWith(".vue")) {
      const { parse, compileScript, compileStyle } =
        await import("vue/compiler-sfc");
      const parsed = parse(source, { filename: name });
      if (parsed.errors.length)
        throw new Error(parsed.errors.map(String).join("\n"));
      let hash = 0;
      for (const char of name)
        hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
      const scope = hash.toString(16);
      const component = compileScript(parsed.descriptor, {
        id: scope,
        inlineTemplate: true,
        genDefaultAs: "__hawiyah_component",
      });
      source =
        component.content +
        `\n${parsed.descriptor.styles.some((style) => style.scoped) ? `__hawiyah_component.__scopeId = 'data-v-${scope}';` : ""}\nexport default __hawiyah_component;`;
      for (const style of parsed.descriptor.styles) {
        if (style.lang || style.src)
          throw new Error("Use local plain CSS in this preview.");
        const result = compileStyle({
          source: style.content,
          filename: name,
          id: `data-v-${scope}`,
          scoped: style.scoped,
        });
        if (result.errors.length)
          throw new Error(result.errors.map(String).join("\n"));
        css += result.code + "\n";
      }
    }
    const result = ts.transpileModule(source, {
      fileName: name.endsWith(".vue") ? name + ".ts" : name,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        experimentalDecorators: true,
        esModuleInterop: true,
      },
    });
    const errors =
      result.diagnostics?.filter(
        (d) => d.category === ts.DiagnosticCategory.Error,
      ) ?? [];
    if (errors.length)
      throw new Error(
        errors
          .map(
            (d) =>
              `${name}: ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`,
          )
          .join("\n"),
      );
    modules.push(
      `${JSON.stringify(name)}:function(module,exports,require){\n${result.outputText}\n}`,
    );
  }
  return {
    css,
    script: `(() => {
const sources={${modules.join(",\n")}};
const cache={};
function load(id,from='') {
  if(id.endsWith('.css')) return {};
  if(Object.prototype.hasOwnProperty.call(HawiyahProjectRuntime.modules,id))return HawiyahProjectRuntime.modules[id];
  if(id.startsWith('.')) {
    const parts=(from.split('/').slice(0,-1).join('/')+'/'+id).split('/');const clean=[];
    for(const part of parts){if(part==='..')clean.pop();else if(part&&part!=='.')clean.push(part);}id=clean.join('/');
  }
  const name=[id,id+'.ts',id+'.tsx',id+'.js',id+'.jsx',id+'.vue'].find(key=>Object.prototype.hasOwnProperty.call(sources,key));
  if(!name)throw new Error('Unsupported preview import: '+id);
  if(cache[name])return cache[name].exports;
  const module={exports:{}};cache[name]=module;sources[name](module,module.exports,next=>load(next,name));return module.exports;
}
load(${JSON.stringify(entry)});
})();`,
  };
}
