import {
  mountComponentIDE,
  type IDEFiles,
  type IDEProject,
} from "./component-ide";
import { projectExample, nativeProjectComponents } from "./project-examples";
import type { ProjectFramework, ProjectLanguage } from "./project-compiler";
import { icon, type Locale } from "./data";
import { previewRuntime } from "./generated/preview-runtime";
import { frameworkIcon } from "./framework-icons";
import { projectDownloadFiles, projectZip } from "./project-download";

export type ProjectDraft = {
  framework: ProjectFramework;
  language: ProjectLanguage;
  drafts: Record<string, IDEFiles>;
};
export function mountProjectEditor(
  host: HTMLElement,
  options: {
    id: string;
    html: string;
    title: string;
    locale: Locale;
    draft?: ProjectDraft;
    onDraftChange(draft: ProjectDraft): void;
  },
): () => void {
  const state = options.draft ?? {
    framework: "vanilla",
    language: "javascript",
    drafts: {},
  };
  const ar = options.locale === "ar";
  const toolbar = document.createElement("div");
  toolbar.className = "hw-project-subheader";
  toolbar.innerHTML = `<label class="hw-field">${ar ? "إطار العمل" : "Framework"}<select class="hw-select" data-project-framework><option value="vanilla">JavaScript</option><option value="react">React</option><option value="vue">Vue</option><option value="angular">Angular</option></select></label><label class="hw-field">${ar ? "اللغة" : "Language"}<select class="hw-select" data-project-language><option value="javascript">JavaScript / JSX</option><option value="typescript">TypeScript / TSX</option></select></label>`;
  const workspace = document.createElement("div");
  host.replaceChildren(toolbar, workspace);
  host.classList.add("hw-project-editor");
  for (const label of toolbar.querySelectorAll("label")) {
    label.className = "hw-project-select";
    const select = label.querySelector("select")!;
    const field = document.createElement("span");
    field.className = "hw-project-select-control";
    select.before(field);
    field.append(select);
    field.insertAdjacentHTML(
      "afterbegin",
      '<span class="hw-project-selection-icon" aria-hidden="true"></span>',
    );
  }
  const framework = toolbar.querySelector<HTMLSelectElement>(
    "[data-project-framework]",
  )!;
  const language = toolbar.querySelector<HTMLSelectElement>(
    "[data-project-language]",
  )!;
  const download = document.createElement("button");
  download.type = "button";
  download.className = "hw-button hw-project-download";
  download.dataset.variant = "secondary";
  download.dataset.projectDownload = "";
  download.innerHTML = `${icon("download", 18)}<span>${ar ? "تنزيل المشروع" : "Download project"}</span>`;
  toolbar.append(download);
  framework.value = state.framework;
  language.value = state.language;
  let dispose: (() => void) | undefined;
  const render = () => {
    dispose?.();
    if (framework.value === "angular") language.value = "typescript";
    language.disabled = framework.value === "angular";
    language.options[0]!.textContent =
      framework.value === "react" ? "JavaScript · JSX" : "JavaScript";
    language.options[1]!.textContent =
      framework.value === "react" ? "TypeScript · TSX" : "TypeScript";
    state.framework = framework.value as ProjectFramework;
    state.language = language.value as ProjectLanguage;
    framework.parentElement!.querySelector(
      ".hw-project-selection-icon",
    )!.innerHTML = frameworkIcon(state.framework);
    language.parentElement!.querySelector(
      ".hw-project-selection-icon",
    )!.innerHTML = frameworkIcon(state.language);
    options.onDraftChange(state);
    download.disabled =
      state.framework !== "vanilla" && !nativeProjectComponents.has(options.id);
    if (
      state.framework !== "vanilla" &&
      !nativeProjectComponents.has(options.id)
    ) {
      workspace.textContent = ar
        ? "مثال المشروع الأصلي لهذا المكوّن قيد الإعداد. مثال JavaScript متاح؛ لا تمثّل معاينته تنفيذ إطار آخر."
        : "This component’s native project recipe is still being prepared. JavaScript is available; its preview does not represent another framework.";
      return;
    }
    const selectedFramework = state.framework;
    const example = projectExample(
      options.id,
      selectedFramework,
      state.language,
      options.locale,
      options.html,
    );
    const key = `${selectedFramework}:${state.language}`;
    const project: IDEProject = {
      framework: selectedFramework,
      names: example.names,
      initial: example.files,
      async compile(content) {
        const { compileProject } = await import("./project-compiler");
        const compiled = await compileProject(
          Object.fromEntries(
            Object.entries(content).map(([id, value]) => [
              example.names[id as keyof IDEFiles],
              value,
            ]),
          ),
          example.entry,
        );
        const runtime =
          selectedFramework === "vanilla"
            ? previewRuntime +
              '\nvar HawiyahProjectRuntime={modules:{"@hawiyah/vanilla":HawiyahVanilla,"@hawiyah/core":HawiyahVanilla.core}};'
            : selectedFramework === "react"
              ? (await import("./generated/project-react-runtime")).default
              : selectedFramework === "vue"
                ? (await import("./generated/project-vue-runtime")).default
                : (await import("./generated/project-angular-runtime")).default;
        const markup = document.createElement("template");
        markup.innerHTML = content.html;
        return {
          html:
            selectedFramework === "vanilla"
              ? markup.content.querySelector("#app")
                ? content.html
                : `<div id="app">${content.html}</div>`
              : example.host,
          css: compiled.css,
          js: compiled.script,
          runtime,
          angular: selectedFramework === "angular",
        };
      },
    };
    dispose = mountComponentIDE(workspace, {
      html: options.html,
      locale: options.locale,
      title: options.title,
      project,
      draft: state.drafts[key],
      onDraftChange(draft) {
        state.drafts[key] = draft;
        options.onDraftChange(state);
      },
    });
  };
  const save = () => {
    const example = projectExample(
      options.id,
      state.framework,
      state.language,
      options.locale,
      options.html,
    );
    const edited =
      state.drafts[`${state.framework}:${state.language}`] ?? example.files;
    const url = URL.createObjectURL(
      projectZip(
        projectDownloadFiles(example, edited, state.framework, state.language, options.locale),
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `hawiyah-${options.id}-${state.framework}-${state.language}.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  download.addEventListener("click", save);
  framework.addEventListener("change", render);
  language.addEventListener("change", render);
  render();
  return () => {
    dispose?.();
    framework.removeEventListener("change", render);
    language.removeEventListener("change", render);
    download.removeEventListener("click", save);
    host.replaceChildren();
  };
}
