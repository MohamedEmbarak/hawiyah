// Types of the content model (contentPipeline.model). Build step 20
// (scripts/content/) writes the data that these types describe:
//   src/generated/content/pages/<id>.<lang>.json   ContentPage
//   src/generated/content/manifest.json            ContentManifest (build time only)
//   src/generated/content/navigation.json          NavigationIndex
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

/**
 * A key element, written <kbd>Enter</kbd> in the Markdown (5a.7). The renderer
 * writes kbd.hw-kbd; a Latin key name (latin true) also gets dir="ltr" and
 * translate="no", an Arabic arrow name neither.
 */
export interface KbdInline {
  readonly type: 'kbd';
  readonly value: string;
  readonly latin: boolean;
}

export type Inline = TextInline | EmphasisInline | StrongInline | InlineCodeInline | LinkInline | BreakInline | KbdInline;

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
  /** The code values of the caption paragraph, read by the vocabulary pass of step 30 only (the caption renders as text). */
  readonly captionCodes?: readonly string[];
  /** The keyboard table of the Accessibility section (5a.8); the brief view shows it under the example. */
  readonly keyboard?: true;
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
  /** frame on the html block (5a.9): the Angular result is rendered in the sandboxed frame too. */
  readonly frame?: true;
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
  /**
   * A section id of the fixed h2 set of a component page; on a template also
   * 'composition', on a guide the GitHub slug of its English h2, on a page generated
   * from the packages its own id.
   */
  readonly id: SectionId | (string & {});
  readonly level: 2;
  readonly title: readonly Inline[];
  readonly blocks: readonly Block[];
}

/** One evidence entry of components.json (English text). */
export interface EvidenceEntry {
  readonly adapter: string;
  readonly kind: string;
  readonly tests: readonly string[];
  readonly scope: string;
  readonly command: string;
  readonly result: string;
  readonly date: string;
  /** Repository path of the test file; shown as a path, never as a link. */
  readonly source: string;
}

/** A documented difference of step 80 (scripts/equivalence/known-differences.json). */
export interface DifferenceItem {
  readonly kind: 'difference';
  readonly id: string;
  readonly aspect: string;
  readonly text: readonly Inline[];
}

/**
 * What is open for a component: a Known defects entry of CHANGELOG.md, with the
 * documented differences that cite it, or a documented difference that cites no
 * entry of the page.
 */
export type OpenItem =
  | { readonly kind: 'defect'; readonly text: readonly Inline[]; readonly differences: readonly DifferenceItem[] }
  | DifferenceItem
  | KeyboardItem;

/**
 * The keyboard outcomes of the component are not checked: an entry of
 * scripts/equivalence/keyboard-exceptions.json leaves them out of step 80, and the
 * keyboard table is written from the package READMEs. The panel states it in the
 * page's language (evidenceTexts.keyboardUnchecked).
 */
export interface KeyboardItem {
  readonly kind: 'keyboard';
}

/** A kind of evidence that some built adapters have and these built adapters do not. */
export interface EvidenceGap {
  readonly kind: string;
  readonly adapters: readonly string[];
}

/** The evidence panel of a page (5a.11), generated by step 20 (scripts/content/evidence.mjs). */
export interface PageEvidence {
  /** The components.json name. */
  readonly name: string;
  readonly built: readonly string[];
  readonly verified: readonly string[];
  readonly entries: readonly EvidenceEntry[];
  /** The kinds of evidence some built adapters have and others do not (G23 of the 5a fix round). */
  readonly gaps: readonly EvidenceGap[];
  /** The notes of components.json (English). */
  readonly notes: readonly string[];
  /** The pinned version whose Known defects section is read. */
  readonly version: string;
  readonly open: readonly OpenItem[];
}

/** src/generated/content/pages/<id>.<lang>.json */
export interface ContentPage {
  /** The key of the page: the component id, guide:<id> or template:<id>. */
  readonly id: string;
  /** A guide or a template (absent on a component page). */
  readonly kind?: 'guide' | 'template';
  /** The id of a guide or a template inside its kind. */
  readonly slug?: string;
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
  /** The evidence panel after the section Platforms Code reference; its two h3 are the last headings. */
  readonly evidence?: PageEvidence;
}

// --------------------------------------------------------------- manifest

export interface ManifestLiveGroup {
  readonly example: string;
  /** Id of the heading the group stands under: 'example', or the id of its h3 in Variants and states. */
  readonly section: string;
  readonly frameworks: 4;
  /** One interaction check or several, comma-separated. */
  readonly check?: string;
  /** The group is compared at rest only (it names no check). */
  readonly static?: true;
  readonly differences?: string;
  /** The Angular result is rendered in the sandboxed frame (5a.9). */
  readonly frame?: true;
  /** The second width of the equivalence screenshots of a framed group. */
  readonly width?: '390';
}

/** One row of a keyboard table: the keys (key ids of KEY_NAMES, a chord joined by '+') and the action text. */
export interface KeyboardRow {
  readonly keys: readonly string[];
  readonly action: string;
}

/** The keyboard table of a page in one language (5a.8). */
export interface KeyboardTable {
  readonly caption: string;
  /** Line of the table in the Markdown file. */
  readonly line: number;
  readonly rows: readonly KeyboardRow[];
}

export interface ManifestPage {
  readonly id: string;
  readonly langs: readonly ContentLang[];
  readonly title: Readonly<Record<ContentLang, string>>;
  readonly summaryText: Readonly<Record<ContentLang, string>>;
  readonly headings: Readonly<Record<ContentLang, readonly ContentHeading[]>>;
  readonly liveGroups: readonly ManifestLiveGroup[];
  /** The keyboard table of each language, null where the page has none; step 80 binds its keys (HWE-KEYS). */
  readonly keyboard: Readonly<Partial<Record<ContentLang, KeyboardTable | null>>>;
}

/** src/generated/content/manifest.json */
export interface ContentManifest {
  readonly pages: readonly ManifestPage[];
  /** Guide-relative path of the live groups file, '.cache/content/live-groups.json' in the build. */
  readonly liveGroupsFile: string;
}

// ------------------------------------------------------- navigation index

/** One live group in the navigation index. */
export interface NavigationExample {
  readonly example: string;
  /** Id of the heading the group stands under: 'example', or the id of its h3 in Variants and states. */
  readonly section: string;
  /** The text of that heading when it is the group's own heading (an h3), in each language. */
  readonly title?: Readonly<Record<ContentLang, string>>;
}

/** One built component page in the navigation index. */
export interface NavigationPage {
  readonly id: string;
  readonly langs: readonly ContentLang[];
  /** Category id of components.json. */
  readonly category: string;
  /** The h1: components.json name (en) and labelAr (ar). */
  readonly title: Readonly<Record<ContentLang, string>>;
  /** The Markdown summary as plain text. */
  readonly summary: Readonly<Record<ContentLang, string>>;
  readonly examples: readonly NavigationExample[];
}

/**
 * src/generated/content/navigation.json (step 20): the built pages in category order,
 * then in components.json order; categories lists the category ids that have a page.
 * The catalogue, the side navigation, the drawer and the editor read it from lazy
 * chunks; the content manifest stays a build-time file.
 */
export interface NavigationIndex {
  readonly categories: readonly string[];
  readonly pages: readonly NavigationPage[];
  /** The built guides (docs/guides), in the order of their index.json. */
  readonly guides?: readonly NavigationDocument[];
  /** The built templates (docs/templates), in the order of their index.json. */
  readonly templates?: readonly NavigationDocument[];
}

/** One built guide or template in the navigation index. */
export interface NavigationDocument {
  /** The key of the page: guide:<id> or template:<id>. */
  readonly id: string;
  /** The id inside the kind, the last segment of its address. */
  readonly slug: string;
  readonly langs: readonly ContentLang[];
  /** The h1 of each language. */
  readonly title: Readonly<Record<ContentLang, string>>;
  readonly summary: Readonly<Record<ContentLang, string>>;
  readonly examples: readonly NavigationExample[];
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
  /** One interaction check or several, comma-separated. */
  readonly check?: string;
  /** The group is compared at rest only (it names no check). */
  readonly static?: true;
  readonly differences?: string;
  readonly frame?: true;
  readonly width?: '390';
  readonly blocks: Readonly<Record<Framework, LiveSource>>;
}
