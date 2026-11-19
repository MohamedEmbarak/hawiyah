// Failure message templates of the registry check, keyed by an identifier and
// carrying their rule code. Placeholders are written <name> and replaced by
// format(); every message starts with 'registry-check HWREG-Rn:'.

export const REGISTRY_URL = 'https://registry.npmjs.org/';

export const NAMES = Object.freeze(['tokens', 'styles', 'core', 'vanilla', 'react', 'vue', 'angular']);

export const MESSAGES = Object.freeze({
  // HWREG-R1: dependencies of package.json.
  r1Missing: ['HWREG-R1', '@hawiyah/<name> is missing from dependencies'],
  r1NotExact: ['HWREG-R1', '@hawiyah/<name> is "<value>"; expected an exact version such as 0.3.0'],
  r1Differ: ['HWREG-R1', 'versions differ: <list>; all seven share one pin'],
  r1Section: ['HWREG-R1', '@hawiyah/<name> must be in dependencies only, found in <section>'],
  r1Unknown: ['HWREG-R1', '@hawiyah/<name> is not one of the seven packages'],
  r1NoPin: ['HWREG-R1', 'no @hawiyah dependency has an exact version; the pin cannot be determined'],
  r1Preview: ['HWREG-R1', '@hawiyah/<name> is "<value>"; a preview build expects file:<dir>/hawiyah-<name>-<version>.tgz'],

  // HWREG-R2: specifiers and override keys.
  r2Specifier: ['HWREG-R2', '<name> uses "<value>"; only exact registry versions are allowed'],
  r2Alias: ['HWREG-R2', '<name> is an alias ("<value>"); aliases are not allowed'],
  r2Key: ['HWREG-R2', 'package.json has "<key>"; overrides and resolutions are not allowed'],

  // HWREG-R3: package-lock.json.
  r3Version: ['HWREG-R3', 'lockfileVersion <n>; expected 3'],
  r3Outside: ['HWREG-R3', 'lock entry "<key>" is outside node_modules (workspace or link)'],
  r3Resolved: ['HWREG-R3', '@hawiyah/<name> resolved from "<resolved>"; expected <expected>'],
  r3Link: ['HWREG-R3', '@hawiyah/<name> is a link in the lockfile'],
  r3Nested: ['HWREG-R3', 'nested copy of @hawiyah/<name> at <key>'],
  r3Alias: ['HWREG-R3', '<key> is an alias of <name>'],
  r3Root: ['HWREG-R3', 'package-lock.json root <section> differ from package.json: <list>'],
  r3MissingEntry: ['HWREG-R3', 'package-lock.json has no entry node_modules/@hawiyah/<name>'],
  r3EntryVersion: ['HWREG-R3', 'lock entry of @hawiyah/<name> has version <value>; expected <pin>'],
  r3Integrity: ['HWREG-R3', 'lock entry of @hawiyah/<name> has integrity "<value>"; expected a sha512- integrity'],
  r3Field: ['HWREG-R3', 'lock entry of @hawiyah/<name> has the field "<field>"'],
  r3Unreadable: ['HWREG-R3', '<file> cannot be read (<error>)'],
  r3EntryResolved: ['HWREG-R3', 'lock entry "<key>" resolved from "<resolved>"; expected <expected>'],
  r3EntryIntegrity: ['HWREG-R3', 'lock entry "<key>" has integrity "<value>"; expected a sha512- integrity'],
  r3EntryLink: ['HWREG-R3', 'lock entry "<key>" is a link'],

  // HWREG-R4: registry metadata and tarballs.
  r4Integrity: ['HWREG-R4', '@hawiyah/<name>@<pin>: lock integrity <a> differs from registry <b>'],
  r4Tarball: ['HWREG-R4', '@hawiyah/<name>@<pin>: tarball sha512 <c> differs from registry <b>'],
  r4TarballUrl: ['HWREG-R4', '@hawiyah/<name>@<pin>: registry tarball URL <value> differs from <expected>'],
  r4Unreachable: ['HWREG-R4', '<host> could not be reached (<error>); the check cannot pass offline'],
  r4PreviewMissing: ['HWREG-R4', '<file> is missing; a preview build needs all seven tarballs'],
  r4PreviewIntegrity: ['HWREG-R4', '@hawiyah/<name>@<pin>: lock integrity <a> differs from <file> (<b>)'],
  r4NotPublished: ['HWREG-R4', '@hawiyah/<name>@<pin> is not on the registry (<error>)'],

  // HWREG-R5: installed tree.
  r5Symlink: ['HWREG-R5', 'node_modules/@hawiyah/<name> is a symbolic link to <target>'],
  r5Differs: ['HWREG-R5', 'node_modules/@hawiyah/<name>/<file> differs from the published tarball'],
  r5Extra: ['HWREG-R5', 'node_modules/@hawiyah/<name>/<file> is not in the published tarball'],
  r5Missing: ['HWREG-R5', 'node_modules/@hawiyah/<name>/<file> from the published tarball is missing'],
  r5Version: ['HWREG-R5', 'installed version <v> of @hawiyah/<name>; expected <pin>'],
  r5Name: ['HWREG-R5', 'node_modules/@hawiyah/<name>/package.json has the name "<value>"'],
  r5NotInstalled: ['HWREG-R5', 'node_modules/@hawiyah/<name> is not installed'],
  r5Realpath: ['HWREG-R5', 'node_modules/@hawiyah/<name> resolves to <target>, not to itself'],
  r5NestedModules: ['HWREG-R5', 'node_modules/@hawiyah/<name>/<file> is a nested node_modules directory'],
  r5Foreign: ['HWREG-R5', '<path> is installed as <value>; a @hawiyah package may be installed only at node_modules/@hawiyah/<seven>'],
  r5HiddenLock: ['HWREG-R5', 'node_modules/.package-lock.json records integrity <a> for @hawiyah/<name>; package-lock.json has <b>'],

  // HWREG-R6: path imports and aliases.
  r6Import: ['HWREG-R6', '<file>:<line> imports "<value>"; the guide must use the installed package'],
  r6Outside: ['HWREG-R6', '<file>:<line> resolves "<value>" outside guide/ to <target>, which is not an allowed content path'],
  r6Alias: ['HWREG-R6', '<file> defines a path alias for @hawiyah'],
  r6TsconfigOption: ['HWREG-R6', '<file> sets compilerOptions.<key>; path mapping is not allowed'],
  r6AngularParent: ['HWREG-R6', 'angular.json value "<value>" leaves guide/'],
  r6AngularAsset: ['HWREG-R6', 'angular.json asset input "<value>" names @hawiyah outside node_modules/@hawiyah/'],
  r6RemoteHawiyah: ['HWREG-R6', '<file>:<line> names "<value>", a @hawiyah address on another host'],
  r6RemoteLoad: ['HWREG-R6', '<file>:<line> loads <kind> from "<value>"; scripts and styles come only from the origin of the guide'],
  r6StyleLanguage: ['HWREG-R6', '<file> is a style file other than .css; the styles of the guide are plain CSS'],
  r6AngularKey: ['HWREG-R6', 'angular.json has "<key>"; file replacements are not allowed'],
  r6AngularStyle: ['HWREG-R6', 'angular.json <key> entry "<value>" lies outside src/'],
  r6PackageImports: ['HWREG-R6', 'package.json has "imports"; subpath imports are not allowed'],
  r6NodeModules: ['HWREG-R6', '<dir> is a node_modules directory below guide/; only guide/node_modules is allowed'],
  r6TsconfigUnreadable: ['HWREG-R6', '<file> cannot be read (<error>)'],
  r6Metafile: ['HWREG-R6', 'build metafile <file> cannot be read (<error>)'],
  r6ResolvedOutside: ['HWREG-R6', '<file>: the build read <input>, outside guide/'],
  r6ResolvedModules: ['HWREG-R6', '<file>: the build read <input> from a node_modules directory other than guide/node_modules'],
  r6ResolvedHawiyah: ['HWREG-R6', '<file>: the build read <input>, a @hawiyah file outside node_modules/@hawiyah/<seven>/'],
  r6ResolvedImport: ['HWREG-R6', '<file>: <input> imports "<specifier>", resolved to <target> instead of the installed package'],

  // HWREG-R7: npm configuration.
  r7Registry: ['HWREG-R7', 'the npm registry is <value>; expected https://registry.npmjs.org/'],
  r7Scope: ['HWREG-R7', '@hawiyah:registry is set to <value>'],
  r7Line: ['HWREG-R7', 'guide/.npmrc line "<line>" is not allowed'],
  r7MissingLine: ['HWREG-R7', 'guide/.npmrc lacks the line "<line>"'],

  // HWREG-R8: dist runtime files.
  r8Differs: ['HWREG-R8', 'runtime/<path> differs from the installed published file'],
  r8Unlisted: ['HWREG-R8', 'runtime/<path> is not listed in runtime/manifest.json'],
  r8Listed: ['HWREG-R8', 'runtime/manifest.json lists <path>, which is missing or has another sha256'],
  r8Derived: ['HWREG-R8', '<path> was derived from <pkg>@<v> with integrity <a>; the lock has <b>'],
  r8Missing: ['HWREG-R8', 'runtime/manifest.json is missing'],
  r8Invalid: ['HWREG-R8', 'runtime/manifest.json entry <path> is invalid (<error>)'],
  r8Derive: ['HWREG-R8', 'the runtime could not be derived again from the verified packages (<error>)'],
  r8DerivedDiffers: ['HWREG-R8', 'runtime/<path> differs from the file derived again from the verified packages'],
  r8NotDerived: ['HWREG-R8', 'runtime/<path> is not a file derived from the verified packages'],
  r8DerivedMissing: ['HWREG-R8', 'runtime/<path> is derived from the verified packages but missing from the output'],
  r8ImportMap: ['HWREG-R8', 'runtime/import-map.json maps "<specifier>" to "<value>": <reason>'],

  // HWREG-R9: workspace globs.
  r9Glob: ['HWREG-R9', 'pnpm-workspace.yaml glob "<glob>" matches guide/; the guide must stay outside the workspace'],
});

export function format(key, params = {}) {
  const entry = MESSAGES[key];
  if (!entry) throw new Error(`registry-check: unknown message ${key}`);
  const [code, template] = entry;
  const text = template.replace(/<([a-z]+)>/g, (whole, name) => (name in params ? String(params[name]) : whole));
  return { code, message: `registry-check ${code}: ${text}` };
}
