// Post-build file moves (build step 70): the prerendered 404 route becomes 404.html,
// which GitHub Pages serves for every missing path; index.csr.html (the client-only
// shell of the '**' route) is removed; preview builds receive preview.json and
// robots.txt.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Moves <browserDir>/404/index.html to <browserDir>/404.html and asserts the move. */
export function moveNotFound(browserDir) {
  const from = join(browserDir, "404", "index.html");
  const to = join(browserDir, "404.html");
  if (!existsSync(from)) throw new Error("postbuild: 404/index.html was not prerendered");
  renameSync(from, to);
  const folder = join(browserDir, "404");
  if (readdirSync(folder).length > 0) throw new Error("postbuild: 404/ holds files besides index.html");
  rmdirSync(folder);
  if (!existsSync(to) || existsSync(folder)) throw new Error("postbuild: moving 404/index.html to 404.html failed");
  return to;
}

export const ROOT_NOSCRIPT = '<noscript><meta http-equiv="refresh" content="0; url=ar/"></noscript>';

/**
 * Readers of the root document without script go to the default language. The
 * element is written into the prerendered index.html only (after the pre-paint
 * script): an application that inserted it at run time would trigger the refresh
 * in the browser too.
 */
export function addRootNoscript(browserDir) {
  const file = join(browserDir, "index.html");
  const html = readFileSync(file, "utf8");
  if (html.includes(ROOT_NOSCRIPT)) return file;
  const at = html.indexOf("</script>");
  if (at < 0 || at > html.indexOf("</head>")) throw new Error("postbuild: index.html has no pre-paint script in its head");
  const end = at + "</script>".length;
  writeFileSync(file, html.slice(0, end) + ROOT_NOSCRIPT + html.slice(end));
  return file;
}

/** Deletes index.csr.html; it is not served. */
export function removeClientShell(browserDir) {
  const file = join(browserDir, "index.csr.html");
  const existed = existsSync(file);
  rmSync(file, { force: true });
  return existed;
}

/**
 * Preview builds only: preview.json names the commit and the tarballs, robots.txt
 * keeps crawlers away.
 * @param {string} browserDir
 * @param {{ commit: string, tarballsDir: string }} preview
 * @param {Record<string, string>} versions Package name to version, from package.json.
 */
export function writePreviewFiles(browserDir, preview, versions) {
  const packages = {};
  for (const [name, version] of Object.entries(versions)) {
    const file = join(preview.tarballsDir, `${name.replace(/^@/, "").replace("/", "-")}-${version}.tgz`);
    if (!existsSync(file)) throw new Error(`postbuild: preview tarball ${file} is missing`);
    packages[name] = { version, tarballSha512: createHash("sha512").update(readFileSync(file)).digest("base64") };
  }
  const json = { commit: preview.commit, builtAt: new Date().toISOString(), packages };
  writeFileSync(join(browserDir, "preview.json"), `${JSON.stringify(json, null, 2)}\n`);
  writeFileSync(join(browserDir, "robots.txt"), "User-agent: *\nDisallow: /\n");
  return json;
}
