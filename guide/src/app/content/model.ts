// Types of the content model (contentPipeline.model). Build step 20
// (scripts/content/) writes the data that these types describe:
//   src/generated/content/pages/<id>.<lang>.json   ContentPage
//   src/generated/content/manifest.json            ContentManifest
//   src/generated/content/loaders.ts               ContentLoaders
//   .cache/content/live-groups.json                LiveGroupEntry[] (read by step 25)
// Keep these types in step with scripts/content/model.mjs and manifest.mjs.

export type ContentLang = 'ar' | 'en';
export type ContentDir = 'rtl' | 'ltr';

/** Syntax roles of hw-code-token-<role>. */
export type CodeRole =
  | 'comment'
  | 'punctuation'
  | 'keyword'
  | 'property'
  | 'string'
  | 'constant'
  | 'attribute'
  | 'tag'
  | 'type'
  | 'function';

/** GitHub alert kinds; the renderer maps them to hw-alert tones. */
export type AlertKind = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/** Logical column alignment of a table (from :--, :-: and --: in Markdown). */
export type ColumnAlign = 'start' | 'center' | 'end' | null;

export type Framework = 'vanilla' | 'react' | 'vue' | 'angular';

// ---------------------------------------------------------------- inlines

export interface TextInline {
  readonly type: 'text';
  readonly value: string;
}

export interface EmphasisInline {
  readonly type: 'emphasis';
  readonly children: readonly Inline[];
}

export interface StrongInline {
  readonly type: 'strong';
  readonly children: readonly Inline[];
}

export interface InlineCodeInline {
  readonly type: 'inlineCode';
  readonly value: string;
}

/**
 * A link. Guide pages have base-relative hrefs ('en/components/button/reference/#api')
 * with internal true; GitHub and other https addresses have external true.
 */
export interface LinkInline {
  readonly type: 'link';
  readonly href: string;
  readonly internal: boolean;
  readonly external: boolean;
  readonly children: readonly Inline[];
}

export interface BreakInline {
  readonly type: 'break';
}

export type Inline = TextInline | EmphasisInline | StrongInline | InlineCodeInline | LinkInline | BreakInline;

// ----------------------------------------------------------------- blocks

/** h3 or h4 inside a section; the renderer writes id and tabindex="-1". */
export interface HeadingBlock {
  readonly type: 'heading';
  readonly level: 3 | 4;
  readonly id: string;
  readonly children: readonly Inline[];
}

export interface ParagraphBlock {
  readonly type: 'paragraph';
  readonly children: readonly Inline[];
}

export interface ListBlock {
  readonly type: 'list';
  readonly ordered: boolean;
  /** First number of an ordered list; null for an unordered list. */
  readonly start: number | null;
  /** Each item is a list of blocks. */
  readonly items: readonly (readonly Block[])[];
}

export interface BlockquoteBlock {
  readonly type: 'blockquote';
  readonly blocks: readonly Block[];
}

export interface AlertBlock {
  readonly type: 'alert';
  readonly kind: AlertKind;
  readonly blocks: readonly Block[];
}

export interface TableColumn {
  /** 'c0', 'c1', ... in column order; the same keys in both languages. */
  readonly key: string;
  readonly label: readonly Inline[];
  readonly align: ColumnAlign;
}

export interface TableBlock {
  readonly type: 'table';
  /** Text of the 'Table: ' / 'جدول: ' paragraph after the prefix. */
  readonly caption: string;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly Readonly<Record<string, readonly Inline[]>>[];
}

/** A run of highlighted code; r is absent for text without a role. */
export interface CodeRun {
  readonly t: string;
  readonly r?: CodeRole;
}

export interface CodeBlock {
  readonly type: 'code';
  /** First word of the info string, or null. */
  readonly lang: string | null;
  /** title="..." of the info string, else the language name; null falls back to the 'Code listing' text. */
  readonly title: string | null;
  readonly text: string;
  /** One entry per source line, each a list of runs; an empty line is []. */
  readonly lines: readonly (readonly CodeRun[])[];
}

/** Position of a live group; its sources are in the live groups file and the compiled examples. */
export interface LiveBlock {
  readonly type: 'live';
  readonly example: string;
}

export interface ThematicBreakBlock {
  readonly type: 'thematicBreak';
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | BlockquoteBlock
  | AlertBlock
  | TableBlock
  | CodeBlock
  | LiveBlock
  | ThematicBreakBlock;

// ------------------------------------------------------------------- page

/** Section ids of the fixed h2 set, in order. */
export type SectionId =
  | 'example'
  | 'variants-and-states'
  | 'api'
  | 'accessibility'
  | 'rtl-and-localisation'
  | 'platforms-code-reference';

export interface ContentHeading {
  readonly id: string;
  readonly level: 2 | 3 | 4;
  readonly text: string;
}

export interface ContentSection {
  readonly id: SectionId;
  readonly level: 2;
  readonly title: readonly Inline[];
  readonly blocks: readonly Block[];
}

/** src/generated/content/pages/<id>.<lang>.json */
export interface ContentPage {
  readonly id: string;
  readonly lang: ContentLang;
  readonly dir: ContentDir;
  /** The h1: components.json name (en) or labelAr (ar). */
  readonly title: string;
  readonly summary: readonly Inline[];
  /** Every h2, h3 and h4 in document order; Arabic headings carry the English ids. */
  readonly headings: readonly ContentHeading[];
  readonly sections: readonly ContentSection[];
  /** Example names of the live groups in document order. */
  readonly liveGroups: readonly string[];
  /** Repository path of the Markdown source, 'docs/components/<file>'. */
  readonly sourcePath: string;
  /** https://github.com/MohamedEmbarak/hawiyah/blob/main/<sourcePath> */
  readonly githubUrl: string;
}

// --------------------------------------------------------------- manifest

export interface ManifestLiveGroup {
  readonly example: string;
  /** Id of the heading the group stands under: 'example', or the id of its h3 in Variants and states. */
  readonly section: string;
  readonly frameworks: 4;
  readonly check?: string;
  readonly differences?: string;
}

export interface ManifestPage {
  readonly id: string;
  readonly langs: readonly ContentLang[];
  readonly title: Readonly<Record<ContentLang, string>>;
  readonly summaryText: Readonly<Record<ContentLang, string>>;
  readonly headings: Readonly<Record<ContentLang, readonly ContentHeading[]>>;
  readonly liveGroups: readonly ManifestLiveGroup[];
}

/** src/generated/content/manifest.json */
export interface ContentManifest {
  readonly pages: readonly ManifestPage[];
  /** Guide-relative path of the live groups file, '.cache/content/live-groups.json' in the build. */
  readonly liveGroupsFile: string;
}

/** src/generated/content/loaders.ts: { '<id>/<lang>': () => import('./pages/<id>.<lang>.json') } */
export type ContentLoaders = Readonly<Record<string, () => Promise<{ default: ContentPage }>>>;

// ------------------------------------------------------------ live groups

export interface LiveSource {
  /** Info-string language: html, tsx, jsx, vue or ts. */
  readonly lang: 'html' | 'tsx' | 'jsx' | 'vue' | 'ts';
  /** Fragment form (wrapped by step 25) or module form (used as written). */
  readonly form: 'fragment' | 'module';
  readonly code: string;
  /** 1-based line of the opening fence in the Markdown file; step 25 reports findings from it. */
  readonly line?: number;
}

/** One entry of .cache/content/live-groups.json: the contract between steps 20 and 25. */
export interface LiveGroupEntry {
  readonly id: string;
  readonly lang: ContentLang;
  readonly example: string;
  readonly check?: string;
  readonly differences?: string;
  readonly blocks: Readonly<Record<Framework, LiveSource>>;
}
