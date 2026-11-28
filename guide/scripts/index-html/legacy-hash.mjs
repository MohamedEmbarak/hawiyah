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
  { old: ["#foundations"], target: "'<lang>/foundations/' when the build has the foundations page, else home" },
  { old: ["#brand"], target: "'<lang>/brand/' when the build has the brand page, else home" },
  { old: ["#layouts"], target: "home" },
  { old: ["#docs", "#docs/<topic>"], target: "'<lang>/guides/<topic>/' when the guide <topic> is built, else the guides page when the build has it, else home" },
  { old: ["#templates", "#templates/<id>"], target: "'<lang>/templates/<id>/' when the template <id> is built, else the templates page when the build has it, else home" },
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
 * @param {{ components: string[], landing: boolean, guides?: string[], templates?: string[], guideIndex?: boolean,
 *           templateIndex?: boolean, brand?: boolean, foundations?: boolean }} available What the build prerendered:
 *   the ids of the built guides and templates, and whether the guides page, the templates page, the brand
 *   page and the foundations page exist.
 * @returns {string}
 */
export function mapLegacyHash(hash, lang, available) {
  var components = available && available.components ? available.components : [];
  var guides = available && available.guides ? available.guides : [];
  var templates = available && available.templates ? available.templates : [];
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
    // Two components of the previous guide were renamed: upload is FileUpload, empty is EmptyState.
    if (id === "upload") id = "file-upload";
    if (id === "empty") id = "empty-state";
    for (var i = 0; i < components.length; i += 1) {
      if (components[i] === id) return lang + "/components/" + id + "/";
    }
    return catalogue;
  }
  if (head === "inputs") return catalogue;
  if (head === "docs" || head === "templates") {
    var ids = head === "docs" ? guides : templates;
    var route = head === "docs" ? "guides" : "templates";
    // The bare #docs of the previous guide opened Getting started.
    var page = parts[1] || (head === "docs" ? "getting-started" : "");
    for (var j = 0; j < ids.length; j += 1) {
      if (page !== "" && ids[j] === page) return lang + "/" + route + "/" + page + "/";
    }
    var index = head === "docs" ? available && available.guideIndex : available && available.templateIndex;
    return index ? lang + "/" + route + "/" : home;
  }
  if (head === "foundations" && available && available.foundations) return lang + "/foundations/";
  if (head === "brand" && available && available.brand) return lang + "/brand/";
  return home;
}
