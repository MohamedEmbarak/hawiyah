import info from '../../generated/build-info.json';

/** Set by the build: '' except in preview builds, where it is the commit sha. */
declare const HAWIYAH_PREVIEW_COMMIT: string;

export interface BuildInfo {
  /** The exact version of the seven @hawiyah packages. */
  readonly pin: string;
  readonly packages: Readonly<Record<string, { readonly version: string; readonly integrity: string }>>;
  /** HAWIYAH_BASE_PATH, starting and ending with '/'. */
  readonly basePath: string;
  /** Origin of the deployed guide, without a trailing slash. */
  readonly siteOrigin: string;
  /** The commit of a preview build, else null. */
  readonly preview: { readonly commit: string } | null;
}

const commit = HAWIYAH_PREVIEW_COMMIT;

export const buildInfo: BuildInfo = {
  pin: info.pin,
  packages: info.packages,
  basePath: info.basePath,
  siteOrigin: info.siteOrigin,
  preview: commit ? { commit } : null,
};
