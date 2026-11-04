import { bindToastDemos } from './toast-demo';
import { bindSearchDemos } from './search-demo';
import { bindCopyActionDemos } from './copy-action-demo';
/** Guide-only containment. Production components retain normal link/form semantics. */
const previewSelector = '.component-preview, [data-demo-preview]';

export function bindDemoPreviews(root: HTMLElement, locale: 'ar' | 'en') {
  const scope = new AbortController();
  bindCopyActionDemos(root, locale, scope.signal);
  bindToastDemos(root, scope.signal);
  const disposeSearch = bindSearchDemos(root);
  const showResult = (preview: HTMLElement, label: string) => {
    let status = preview.querySelector<HTMLElement>(':scope > [data-demo-result]');
    if (!status) {
      status = document.createElement('p');
      status.className = 'nq-hint demo-result';
      status.dataset.demoResult = '';
      status.setAttribute('role', 'status');
      preview.append(status);
    }
    status.textContent = locale === 'ar' ? `معاينة الإجراء: ${label}` : `Preview action: ${label}`;
  };
  const onLink = (event: Event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    const preview = target?.closest<HTMLElement>(previewSelector);
    if (!target || !preview || !root.contains(preview)) return;
    // Let the section controller handle its own bounded scroll before the
    // bubble-phase fallback blocks an unenhanced demo link's hash navigation.
    const click = event as MouseEvent;
    if (event.type === 'click' && target.matches('.nq-content-nav-link[data-nq-section]') &&
        target.closest('.nq-content-nav') && target.getAttribute('href')?.startsWith('#') &&
        click.button === 0 && !click.altKey && !click.ctrlKey && !click.metaKey && !click.shiftKey) return;
    event.preventDefault();
    // A skip/section link may focus content inside this preview without changing
    // the guide route. Never resolve a demo fragment against the whole document.
    const href = target.getAttribute('href') ?? '';
    const destination = href.startsWith('#') ? [...preview.querySelectorAll<HTMLElement>('[id]')].find(node => `#${node.id}` === href) : undefined;
    if (destination && event.type === 'click') destination.focus({ preventScroll: true });
    showResult(preview, target.getAttribute('aria-label') || target.textContent?.trim() || href);
  };
  root.addEventListener('click', onLink, { capture: true, signal: scope.signal });
  root.addEventListener('auxclick', onLink, { capture: true, signal: scope.signal });
  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('.nq-content-nav-link[data-nq-section]') : null;
    if (target?.closest(previewSelector)) event.preventDefault();
  }, { signal: scope.signal });
  root.addEventListener('submit', event => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const preview = form?.closest<HTMLElement>(previewSelector);
    if (!form || !preview) return;
    event.preventDefault();
    if (form.matches('[data-search-demo-form]')) return;
    showResult(preview, locale === 'ar' ? 'إرسال النموذج' : 'Submit form');
  }, { capture: true, signal: scope.signal });
  return () => { scope.abort(); disposeSearch(); };
}
