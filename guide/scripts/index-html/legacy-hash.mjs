// Old guide addresses (hash routing of the previous guide) and where they lead in the
// new guide. mapLegacyHash is pure and self-contained: step 35 inlines its source
// into the pre-paint script of every document, so it may not reference anything
// outside its own body.

/**
 * The table of old hash forms, for documentation and tests. `target` names the
 * destination: home is '<lang>/' when the landing exists and '<lang>/components/'
 * before it; page is '<lang>/components/<id>/' when that page was built.
 */
export const LEGACY_FORMS = Object.freeze([
  { old: ["", "#", "#overview", "#main"], target: "home" },
  { old: ["#components", "#components/<anything>"], target: "page when <anything> is a built page, else catalogue" },
  { old: ["#component/<id>"], target: "page when <id> is built, else catalogue" },
  { old: ["#inputs"], target: "catalogue" },
  { old: ["#foundations", "#brand", "#layouts"], target: "home" },
  { old: ["#docs", "#docs/<topic>"], target: "home" },
  { old: ["#templates", "#templates/<id>"], target: "home" },
  { old: ["#discover", "#apply", "#workspace"], target: "home" },
  { old: ["any other hash"], target: "home" },
]);

/** Old documentation topics and template ids, listed so the tests cover every form. */
export const LEGACY_DOC_TOPICS = Object.freeze([
  "getting-started", "vanilla", "react", "vue", "angular", "theming", "layouts",
  "lifecycle", "calendars", "accessibility", "extending", "alignment",
]);
export const LEGACY_TEMPLATES = Object.freeze([
  "home", "home-information", "search", "service", "form", "contact", "support", "faq",
  "sitemap", "404", "rating", "chatbot", "content", "cookies", "participation", "about",
  "feedback", "life-journeys",
]);

/**
 * Maps an old hash to a base-relative path ending in '/'.
 * @param {string} hash location.hash of the old address ('' or '#...').
 * @param {'ar' | 'en'} lang The chosen language.
 * @param {{ components: string[], landing: boolean }} available What the build prerendered.
 * @returns {string}
 */
export function mapLegacyHash(hash, lang, available) {
  var components = available && available.components ? available.components : [];
  var home = available && available.landing ? lang + "/" : lang + "/components/";
  var catalogue = lang + "/components/";
  var raw = String(hash || "");
  if (raw.charAt(0) === "#") raw = raw.slice(1);
  try {
    raw = decodeURIComponent(raw);
  } catch (error) {
    return home;
  }
  var query = raw.indexOf("?");
  if (query >= 0) raw = raw.slice(0, query);
  raw = raw.replace(/^\/+|\/+$/g, "");
  var parts = raw.split("/");
  var head = parts[0];
  if (head === "components" || head === "component") {
    var id = parts[1] || "";
    for (var i = 0; i < components.length; i += 1) {
      if (components[i] === id) return lang + "/components/" + id + "/";
    }
    return catalogue;
  }
  if (head === "inputs") return catalogue;
  return home;
}
