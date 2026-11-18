// Source of the inline pre-paint script that step 35 writes into the head of every
// document, after <base> and before the stylesheet. It sets the colour mode on the
// html element before the first paint and, on the root document only, chooses the
// language and replaces the address with the matching page.
import { mapLegacyHash } from "./legacy-hash.mjs";

/* The function below runs in the browser as written: no imports, no globals
   besides window, document, location and navigator, every storage access guarded. */
function prepaint(available, mapLegacyHash) {
  var root = document.documentElement;
  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  var mode = read("hawiyah-guide-mode");
  if (mode !== "light" && mode !== "dark") mode = read("hawiyah-mode");
  if (mode !== "light" && mode !== "dark") {
    var dark = false;
    try {
      dark = Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (error) {
      dark = false;
    }
    mode = dark ? "dark" : "light";
  }
  root.setAttribute("data-hw-mode", mode);

  var base = "/";
  try {
    base = new URL(document.baseURI).pathname.replace(/[^/]*$/, "");
  } catch (error) {
    base = "/";
  }
  var path = location.pathname;
  if (path !== base && path !== base + "index.html") return;

  var lang = read("hawiyah-guide-lang");
  if (lang !== "ar" && lang !== "en") lang = read("hawiyah-locale");
  if (lang !== "ar" && lang !== "en") {
    lang = "ar";
    var list = [];
    try {
      list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    } catch (error) {
      list = [];
    }
    for (var i = 0; i < list.length; i += 1) {
      var primary = String(list[i] || "").toLowerCase().split("-")[0];
      if (primary === "ar" || primary === "en") {
        lang = primary;
        break;
      }
    }
  }
  location.replace(base + mapLegacyHash(location.hash, lang, available));
}

/**
 * Returns the script body (without the script element).
 * @param {{ components: string[], landing: boolean }} available
 */
export function prepaintScript(available) {
  const data = JSON.stringify({
    components: [...(available.components ?? [])],
    landing: Boolean(available.landing),
  }).replace(/</g, "\\u003c");
  return `(${prepaint.toString()})(${data}, ${mapLegacyHash.toString()});`;
}
