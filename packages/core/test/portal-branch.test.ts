import { afterEach, expect, it } from 'vitest';
import { getPortalBranchSummary } from '../src/index.js';

afterEach(() => { document.body.replaceChildren(); });

it('[PORTAL-00] finds the heading of a portal branch inside the scope and nothing else', () => {
  document.body.innerHTML = `<header id="scope"><nav>
    <details data-hw-portal-branch id="branch"><summary id="heading"><span id="inner">Services</span></summary><a href="/a" id="link">A</a></details>
    <details id="plain"><summary id="other">More</summary></details></nav></header>
    <details data-hw-portal-branch><summary id="outside">Outside</summary></details>`;
  const scope = document.getElementById('scope')!; const heading = document.getElementById('heading')!;
  expect(getPortalBranchSummary(heading, scope)).toBe(heading);
  expect(getPortalBranchSummary(document.getElementById('inner'), scope)).toBe(heading);
  expect(getPortalBranchSummary(document.getElementById('inner')!.firstChild, scope)).toBe(heading);
  expect(getPortalBranchSummary(document.getElementById('link'), scope)).toBeNull();
  expect(getPortalBranchSummary(document.getElementById('branch'), scope)).toBeNull();
  expect(getPortalBranchSummary(document.getElementById('other'), scope)).toBeNull();
  expect(getPortalBranchSummary(document.getElementById('outside'), scope)).toBeNull();
  expect(getPortalBranchSummary(document.getElementById('outside'), document.body)).toBe(document.getElementById('outside'));
  expect(getPortalBranchSummary(heading, null)).toBeNull(); expect(getPortalBranchSummary(heading, undefined)).toBeNull();
  expect(getPortalBranchSummary(null, scope)).toBeNull();
  expect(getPortalBranchSummary(document.createTextNode('detached'), scope)).toBeNull();
  expect(getPortalBranchSummary(document, scope)).toBeNull(); expect(getPortalBranchSummary(window, scope)).toBeNull();
});
