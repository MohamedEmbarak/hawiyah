/** The heading of a PortalHeader branch that is, or contains, `target`: a summary whose parent is
 * `details[data-hw-portal-branch]` inside `scope`. Null for anything else, so a press on a branch
 * heading can be told apart from a press that should close the open branch. */
export function getPortalBranchSummary(target: EventTarget | null, scope: Element | null | undefined): HTMLElement | null {
  const node = target as Partial<Node> | null;
  const element = node?.nodeType === 1 ? node as Element : node?.nodeType === 3 ? node.parentElement ?? null : null;
  const summary = typeof element?.closest === 'function' ? element.closest<HTMLElement>('summary') : null;
  if (!summary || !scope?.contains(summary)) return null;
  const branch = summary.parentElement;
  return branch?.localName === 'details' && branch.hasAttribute('data-hw-portal-branch') ? summary : null;
}
