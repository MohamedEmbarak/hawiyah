// Live block extraction and grouping (contentPipeline.liveBlocks).
//
// Info string: <lang> live example=<name> [framework=<framework>] [check=<check>[,<check>...] | static] [differences=<id>] [frame [width=390]]
// A group is four consecutive live blocks with the same example name, in the
// order vanilla (html), react (tsx or jsx), vue (vue), angular (ts framework=angular),
// separated only by blank lines. Wrapping, auto-imports and the rules on the
// code itself (HWC-LIVE4 to HWC-LIVE6) belong to step 25.

import { FRAMED_COMPONENTS, FRAME_WIDTHS, FRAMEWORKS, LIVE_KEYS, LIVE_LANGS, LIVE_NAME, finding } from './config.mjs';

const lineOf = (node) => node.position?.start.line ?? 1;

/** Whether a code node is a live block (its meta starts with or contains the word 'live'). */
export function isLive(node) {
  return node.type === 'code' && typeof node.meta === 'string' && node.meta.split(/\s+/).includes('live');
}

/**
 * Parses the info string of a live block.
 * @param {{ id?: string, kind?: 'component' | 'template' }} [page] The page: frame is allowed only for
 *   the components of FRAMED_COMPONENTS and for templates (5a.9, leadAmendments A12).
 * @returns {{ lang: string, framework: string | null, example: string | null, check?: string, checks?: string[], static?: true, differences?: string, frame?: true, width?: string, errors: string[] }}
 */
export function parseInfo(node, page = {}) {
  const lang = node.lang ?? '';
  const words = (node.meta ?? '').split(/\s+/).filter(Boolean);
  const errors = [];
  const values = {};
  if (words[0] !== 'live') errors.push(`'live' must directly follow the language in "${lang} ${node.meta}"`);
  let isStatic = false;
  let framed = false;
  for (const word of words.slice(words[0] === 'live' ? 1 : 0)) {
    if (word === 'live') continue;
    if (word === 'frame') {
      // The Angular result of the group is rendered in the sandboxed frame (5a.9).
      if (framed) errors.push('the word "frame" is repeated');
      framed = true;
      continue;
    }
    if (word === 'static') {
      // The group declares that it is compared at rest only.
      if (isStatic) errors.push('the word "static" is repeated');
      isStatic = true;
      continue;
    }
    const match = /^([a-z]+)=(.*)$/.exec(word);
    if (!match) {
      errors.push(`"${word}" is not a key=value pair`);
      continue;
    }
    const [, key, value] = match;
    if (!LIVE_KEYS.includes(key)) errors.push(`unknown key "${key}"; allowed keys are ${LIVE_KEYS.join(', ')}`);
    else if (key in values) errors.push(`the key "${key}" is repeated`);
    else values[key] = value;
  }
  if (!(lang in LIVE_LANGS)) errors.push(`the language "${lang}" cannot be live; use html, tsx, jsx, vue or ts`);
  const inferred = LIVE_LANGS[lang];
  let framework = inferred ?? null;
  if (lang === 'ts') {
    if (values.framework !== 'angular') errors.push('a ts live block needs framework=angular');
    else framework = 'angular';
  } else if (values.framework !== undefined && values.framework !== inferred) {
    errors.push(`framework=${values.framework} does not match the language ${lang} (${inferred ?? 'none'})`);
  }
  if (values.example === undefined) errors.push('the key example=<name> is required');
  else if (!LIVE_NAME.test(values.example)) errors.push(`the example name "${values.example}" must match ${LIVE_NAME}`);
  for (const key of ['check', 'differences']) {
    if (values[key] === undefined) continue;
    if (lang !== 'html') errors.push(`${key}= is allowed only on the html block, the first of the group`);
    else if (key === 'differences' && !LIVE_NAME.test(values[key])) errors.push(`the ${key} value "${values[key]}" must match ${LIVE_NAME}`);
  }
  // check=<a>[,<b>...]: one or more interaction checks, each named once.
  const checks = values.check === undefined ? [] : values.check.split(',');
  if (lang === 'html') {
    for (const name of checks) if (!LIVE_NAME.test(name)) errors.push(`the check value "${name}" must match ${LIVE_NAME}`);
    if (new Set(checks).size !== checks.length) errors.push(`check=${values.check} names a check more than once`);
  }
  if (isStatic && lang !== 'html') errors.push('static is allowed only on the html block, the first of the group');
  else if (isStatic && checks.length > 0) errors.push('a group is either static or names checks, not both');
  if (framed && lang !== 'html') errors.push('frame is allowed only on the html block, the first of the group');
  else if (framed && page.kind !== 'template' && !FRAMED_COMPONENTS.includes(page.id)) {
    errors.push(`frame is allowed only for the page-level components ${FRAMED_COMPONENTS.join(', ')} and for template groups (FRAMED_COMPONENTS of scripts/content/config.mjs); ${page.id ?? 'this page'} renders in the guide page`);
  }
  if (values.width !== undefined) {
    if (lang !== 'html') errors.push('width= is allowed only on the html block, the first of the group');
    else if (!framed) errors.push('width= is allowed only on a group with frame');
    else if (!FRAME_WIDTHS.includes(values.width)) errors.push(`width=${values.width} is not one of ${FRAME_WIDTHS.join(', ')}`);
  }
  const info = { lang, framework, example: values.example ?? null, errors };
  if (values.check !== undefined) {
    info.check = values.check;
    info.checks = checks;
  }
  if (isStatic) info.static = true;
  if (values.differences !== undefined) info.differences = values.differences;
  if (framed) info.frame = true;
  if (values.width !== undefined) info.width = values.width;
  return info;
}

/** Fragment or module form of a live block (contentPipeline.liveBlocks.forms). */
export function formOf(framework, code) {
  if (framework === 'react') return /export\s+default\s+function/.test(code) ? 'module' : 'fragment';
  if (framework === 'vue') return /^<template[\s>]/m.test(code) ? 'module' : 'fragment';
  if (framework === 'angular') return code.includes('@Component(') && /export\s+class/.test(code) ? 'module' : 'fragment';
  return 'fragment';
}

/**
 * Groups the live blocks among the top-level nodes of a page.
 * @param {any[]} nodes Top-level mdast nodes in order.
 * @param {string} file For messages.
 * @param {{ id?: string, kind?: 'component' | 'template' }} [page] The page (for frame).
 * @returns {{ groups: any[], groupOf: Map<any, any>, findings: any[] }}
 *   groupOf maps each live node to its group (or to null when it is in no valid group).
 */
export function groupLive(nodes, file, page = {}) {
  const findings = [];
  const groups = [];
  const groupOf = new Map();
  const partitions = [];
  let run = [];
  const closeRun = () => {
    let current = null;
    for (const node of run) {
      const info = parseInfo(node, page);
      if (current && info.example === current.example && info.example !== null) current.items.push({ node, info });
      else {
        current = { example: info.example, items: [{ node, info }] };
        partitions.push(current);
      }
    }
    run = [];
  };
  for (const node of nodes) {
    if (isLive(node)) run.push(node);
    else if (run.length) closeRun();
  }
  if (run.length) closeRun();

  const seen = new Map();
  for (const partition of partitions) {
    const first = partition.items[0].node;
    let broken = false;
    for (const { node, info } of partition.items) {
      groupOf.set(node, null);
      for (const error of info.errors) {
        findings.push(finding('HWC-LIVE1', file, lineOf(node), error));
        broken = true;
      }
    }
    if (broken) continue;
    const order = partition.items.map((item) => item.info.framework);
    const complete = order.length === FRAMEWORKS.length && order.every((fw, index) => fw === FRAMEWORKS[index]);
    const previous = seen.get(partition.example);
    if (!complete) {
      const message = previous && !previous.complete
        ? `the blocks of example "${partition.example}" are separated by other content; a group is four consecutive live blocks`
        : `example "${partition.example}" has the frameworks ${order.join(', ')}; a group is exactly vanilla (html), react (tsx or jsx), vue (vue), angular (ts framework=angular), in that order`;
      findings.push(finding('HWC-LIVE2', file, lineOf(first), message));
      if (!previous) seen.set(partition.example, { complete: false });
      continue;
    }
    if (previous) {
      findings.push(finding('HWC-LIVE3', file, lineOf(first), `the example name "${partition.example}" is used more than once in this file`));
      continue;
    }
    seen.set(partition.example, { complete: true });
    const head = partition.items[0].info;
    const group = { example: partition.example, line: lineOf(first), first, nodes: partition.items.map((item) => item.node), blocks: {} };
    if (head.check !== undefined) {
      group.check = head.check;
      group.checks = head.checks;
    }
    if (head.static) group.static = true;
    if (head.differences !== undefined) group.differences = head.differences;
    if (head.frame) group.frame = true;
    if (head.width !== undefined) group.width = head.width;
    for (const { node, info } of partition.items) {
      group.blocks[info.framework] = { lang: info.lang, form: formOf(info.framework, node.value), code: node.value, line: lineOf(node) };
      groupOf.set(node, group);
    }
    groups.push(group);
  }
  return { groups, groupOf, findings };
}
