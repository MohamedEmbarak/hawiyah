import type { Block, ContentDir, ContentHeading, ContentLang, ContentSection, Inline } from '../content/model';

/**
 * A page generated from the installed packages (build step 32,
 * scripts/package-pages/generate.mjs): src/generated/package-pages/<id>.<lang>.json.
 * Its headings and introduction are the guide's text (src/app/i18n/package-pages.json);
 * everything else is read from the installed packages.
 */
export interface PackagePageModel {
  readonly id: 'brand' | 'foundations';
  readonly lang: ContentLang;
  readonly dir: ContentDir;
  readonly title: string;
  /** The introduction paragraph. */
  readonly summary: readonly Inline[];
  readonly headings: readonly ContentHeading[];
  readonly sections: readonly ContentSection[];
}

/** A wordmark file of @hawiyah/styles and its address under the base. */
export interface ArtworkFile {
  readonly file: string;
  readonly src: string;
}

export interface BrandPageModel extends PackagePageModel {
  readonly id: 'brand';
  readonly brand: {
    /** The wordmark files for light surfaces (the plain and the mono file) and for dark surfaces (reverse, white). */
    readonly wordmarks: Readonly<Record<'light' | 'dark', readonly ArtworkFile[]>>;
    /** The loader of each colour mode: the animated file and the static wordmark shown under reduced motion. */
    readonly loader: Readonly<Record<'light' | 'dark', { readonly motion: string; readonly still: string }>>;
    /** The README section on the branding assets, in English as the README writes it. */
    readonly notes: readonly Block[];
    readonly source: { readonly package: string; readonly version: string; readonly section: string };
    readonly labels: Readonly<Record<'light' | 'dark' | 'artwork' | 'loaderCaption' | 'source', string>>;
  };
}

export interface FoundationsPageModel extends PackagePageModel {
  readonly id: 'foundations';
  /** The icons of @hawiyah/styles by name. */
  readonly icons: { readonly label: string; readonly names: readonly string[] };
  readonly counts: Readonly<Record<string, number>>;
}
