// Selector matching for Angular fragments: the template is parsed with
// parseTemplate from @angular/compiler and every element is matched with
// SelectorMatcher against the selectors of the exported standalone components and
// directives of the installed @hawiyah/angular. Exactly the matched classes are
// imported, so the extended diagnostic for unused standalone imports cannot fire.
import {
  CssSelector, SelectorMatcher, TmplAstElement, TmplAstTemplate, TmplAstRecursiveVisitor,
  createCssSelectorFromNode, parseTemplate,
} from '@angular/compiler';
import { angularDeclarations } from './exports.mjs';

/** Every element and ng-template node of a parsed template, depth first. */
export function templateElements(nodes) {
  const found = [];
  class Collector extends TmplAstRecursiveVisitor {
    visitElement(element) {
      found.push(element);
      super.visitElement(element);
    }
    visitTemplate(template) {
      found.push(template);
      super.visitTemplate(template);
    }
  }
  const collector = new Collector();
  for (const node of nodes) node.visit(collector);
  return found;
}

/** Parses an Angular template; returns { nodes, errors: [{ message, line }] } (line is 1-based within the template). */
export function parseAngularTemplate(template, url = 'example.html') {
  const parsed = parseTemplate(template, url, { preserveWhitespaces: false });
  const errors = (parsed.errors ?? []).map((error) => ({ message: error.msg, line: (error.span?.start?.line ?? 0) + 1 }));
  return { nodes: parsed.nodes, errors };
}

/**
 * Classes of @hawiyah/angular selected by the template.
 * Returns { classes: string[] (sorted), unknown: [{ tag, line }] (hw- elements matching no component), errors }.
 */
export function angularImports(template, fromDir) {
  const { nodes, errors } = parseAngularTemplate(template);
  const matcher = new SelectorMatcher();
  const declarations = angularDeclarations(fromDir);
  for (const declaration of declarations) matcher.addSelectables(CssSelector.parse(declaration.selector), declaration);
  const classes = new Set();
  const unknown = [];
  for (const node of templateElements(nodes)) {
    const tag = node instanceof TmplAstElement ? node.name : node instanceof TmplAstTemplate ? node.tagName : null;
    let component = false;
    matcher.match(createCssSelectorFromNode(node), (_selector, declaration) => {
      classes.add(declaration.className);
      if (declaration.kind === 'component') component = true;
    });
    if (tag && /^hw-/.test(tag) && !component) unknown.push({ tag, line: (node.startSourceSpan?.start?.line ?? 0) + 1 });
  }
  return { classes: [...classes].sort(), unknown, errors };
}
