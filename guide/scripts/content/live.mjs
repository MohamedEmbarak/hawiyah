// Live block extraction and grouping (contentPipeline.liveBlocks).
//
// Info string: <lang> live example=<name> [framework=<framework>] [check=<check>] [differences=<id>]
// A group is four consecutive live blocks with the same example name, in the
// order vanilla (html), react (tsx or jsx), vue (vue), angular (ts framework=angular),
// separated only by blank lines. Wrapping, auto-imports and the rules on the
// code itself (HWC-LIVE4 to HWC-LIVE6) belong to step 25.

import { FRAMEWORKS, LIVE_KEYS, LIVE_LANGS, LIVE_NAME, finding } from './config.mjs';

const lineOf = (node) => node.position?.start.line ?? 1;

/** Whether a code node is a live block (its meta starts with or contains the word 'live'). */
export function isLive(node) {
  return node.type === 'code' && typeof node.meta === 'string' && node.meta.split(/\s+/).includes('live');
}

/**
 * Parses the info string of a live block.
 * @returns {{ lang: string, framework: string | null, example: string | null, check?: string, differences?: string, errors: string[] }}
 */
export function parseInfo(node) {
  const lang = node.lang ?? '';
  const words = (node.meta ?? '').split(/\s+/).filter(Boolean);
  const errors = [];
  const values = {};
  if (words[0] !== 'live') errors.push(`'live' must directly follow the language in "${lang} ${node.meta}"`);
  for (const word of words.slice(words[0] === 'live' ? 1 : 0)) {
    if (word === 'live') continue;
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
    else if (!LIVE_NAME.test(values[key])) errors.push(`the ${key} value "${values[key]}" must match ${LIVE_NAME}`);
  }
  const info = { lang, framework, example: values.example ?? null, errors };
  if (values.check !== undefined) info.check = values.check;
  if (values.differences !== undefined) info.differences = values.differences;
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
 * @returns {{ groups: any[], groupOf: Map<any, any>, findings: any[] }}
 *   groupOf maps each live node to its group (or to null when it is in no valid group).
 */
export function groupLive(nodes, file) {
  const findings = [];
  const groups = [];
  const groupOf = new Map();
  const partitions = [];
  let run = [];
  const closeRun = () => {
    let current = null;
    for (const node of run) {
      const info = parseInfo(node);
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
    if (head.check !== undefined) group.check = head.check;
    if (head.differences !== undefined) group.differences = head.differences;
    for (const { node, info } of partition.items) {
      group.blocks[info.framework] = { lang: info.lang, form: formOf(info.framework, node.value), code: node.value, line: lineOf(node) };
      groupOf.set(node, group);
    }
    groups.push(group);
  }
  return { groups, groupOf, findings };
}
