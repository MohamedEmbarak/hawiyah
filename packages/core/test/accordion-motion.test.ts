import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAccordionMotion } from '../src/accordion-motion.js';

const cleanups: (() => void)[] = [];
afterEach(() => { cleanups.splice(0).reverse().forEach(cleanup => cleanup()); document.body.replaceChildren(); vi.restoreAllMocks(); });

function fixture(open = false, name?: string) {
  const details = document.createElement('details');
  details.open = open; if (name) details.setAttribute('name', name);
  details.style.setProperty('--nq-duration-accordion', '300ms');
  details.style.setProperty('--nq-ease-accordion', 'cubic-bezier(.42,0,.58,1)');
  details.innerHTML = '<summary>Heading</summary><div><button>Action</button></div>';
  document.body.append(details);
  const summary = details.querySelector('summary')!;
  const content = details.querySelector('div')!;
  let naturalHeight = 256;
  let frame: number | undefined;
  vi.spyOn(details, 'getBoundingClientRect').mockImplementation(() => ({ top: 0, bottom: frame ?? (details.open ? naturalHeight : 56), height: frame ?? (details.open ? naturalHeight : 56) } as DOMRect));
  vi.spyOn(summary, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 56, height: 56 } as DOMRect);
  const animations: { onfinish: (() => void) | null; oncancel: (() => void) | null; cancel: ReturnType<typeof vi.fn>; keyframes: Keyframe[]; options: KeyframeAnimationOptions }[] = [];
  details.animate = vi.fn((keyframes, options) => {
    const animation = { onfinish: null as (() => void) | null, oncancel: null as (() => void) | null, cancel: vi.fn(() => { frame = undefined; }), keyframes: keyframes as Keyframe[], options: options as KeyframeAnimationOptions };
    animations.push(animation); return animation as unknown as Animation;
  });
  return { details, content, summary, animations, setFrame(value: number) { frame = value; }, setHeight(value: number) { naturalHeight = value; } };
}

describe('accordion motion lifecycle', () => {
  it('animates both directions, disables closing content immediately and returns focus', () => {
    const f = fixture();
    const controller = createAccordionMotion(f.details, f.content); cleanups.push(() => controller.destroy());
    controller.setOpen(true);
    expect(f.animations[0]!.keyframes.map(frame => frame.height)).toEqual(['56px', '256px']);
    expect(f.animations[0]!.options).toMatchObject({ duration: 300, easing: 'cubic-bezier(.42,0,.58,1)' });
    f.animations[0]!.onfinish!();
    f.content.querySelector('button')!.focus(); controller.setOpen(false);
    expect(f.details.open).toBe(true);
    expect(f.summary.getAttribute('aria-expanded')).toBe('false');
    expect(f.content.hasAttribute('inert')).toBe(true);
    expect(f.content.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(f.summary);
    expect(f.animations[1]!.keyframes.map(frame => frame.height)).toEqual(['256px', '56px']);
    f.animations[1]!.onfinish!();
    expect(f.details.open).toBe(false); expect(f.details.style.overflow).toBe('');
  });

  it('reverses from the current frame and cannot be completed by a stale animation', () => {
    const f = fixture(); const controller = createAccordionMotion(f.details, f.content); cleanups.push(() => controller.destroy());
    controller.setOpen(true); f.setFrame(140); controller.setOpen(false);
    expect(f.animations[0]!.cancel).toHaveBeenCalledOnce(); expect(f.animations[0]!.onfinish).toBeNull();
    expect(f.animations[1]!.keyframes[0]!.height).toBe('140px');
    f.setFrame(96); controller.setOpen(true);
    expect(f.animations[2]!.keyframes.map(frame => frame.height)).toEqual(['96px', '256px']);
    expect(f.content.hasAttribute('inert')).toBe(false);
    f.animations[2]!.onfinish!(); expect(f.details.open).toBe(true);
  });

  it('settles immediately when reduced motion is enabled mid-flight and removes its listener', () => {
    const media = new EventTarget() as EventTarget & { matches: boolean };
    media.matches = false;
    const remove = vi.spyOn(media, 'removeEventListener');
    vi.stubGlobal('matchMedia', () => media); cleanups.push(() => vi.unstubAllGlobals());
    const f = fixture(true); const controller = createAccordionMotion(f.details, f.content);
    controller.setOpen(false); media.matches = true; media.dispatchEvent(new Event('change'));
    expect(f.details.open).toBe(false); expect(f.animations[0]!.cancel).toHaveBeenCalledOnce();
    controller.setOpen(true); expect(f.animations).toHaveLength(1);
    controller.destroy(); expect(remove).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('retargets opening motion for a content resize then restores natural layout', () => {
    let resized: (() => void) | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resized = callback; } observe() {} disconnect = disconnect; });
    cleanups.push(() => vi.unstubAllGlobals());
    const f = fixture(); const controller = createAccordionMotion(f.details, f.content);
    controller.setOpen(true); f.setFrame(120); f.setHeight(400); resized!();
    expect(f.animations[1]!.keyframes.map(frame => frame.height)).toEqual(['120px', '400px']);
    f.animations[1]!.onfinish!(); f.setHeight(500);
    expect(f.details.getBoundingClientRect().height).toBe(500);
    controller.destroy(); expect(disconnect).toHaveBeenCalledOnce();
  });

  it('coordinates exclusive peers and restores native grouping on cleanup', () => {
    const one = fixture(true, 'group'); const two = fixture(false, 'group');
    const first = createAccordionMotion(one.details, one.content); const second = createAccordionMotion(two.details, two.content);
    second.setOpen(true);
    expect(first.open).toBe(false); expect(second.open).toBe(true);
    expect(one.content.hasAttribute('inert')).toBe(true);
    expect(one.details.hasAttribute('name')).toBe(false);
    first.destroy(); second.destroy();
    expect(one.details.getAttribute('name')).toBe('group'); expect(two.details.getAttribute('name')).toBe('group');
    expect(one.details.open).toBe(false); expect(two.details.open).toBe(true);
    expect(one.summary.hasAttribute('aria-expanded')).toBe(false);
  });

  it('scopes identical group names to their own shadow roots', () => {
    const one = fixture(true, 'group'); const two = fixture(false, 'group');
    const firstHost = document.createElement('div'); const secondHost = document.createElement('div');
    document.body.append(firstHost, secondHost);
    firstHost.attachShadow({ mode: 'open' }).append(one.details);
    secondHost.attachShadow({ mode: 'open' }).append(two.details);
    const first = createAccordionMotion(one.details, one.content); const second = createAccordionMotion(two.details, two.content);
    cleanups.push(() => first.destroy(), () => second.destroy());
    second.setOpen(true);
    expect(first.open).toBe(true); expect(second.open).toBe(true);
    expect(one.content.hasAttribute('inert')).toBe(false);
  });

  it('returns shadow-root focus before applying inert or aria-hidden to closing content', () => {
    const f = fixture(true);
    const host = document.createElement('div'); document.body.append(host);
    const tree = host.attachShadow({ mode: 'open' }); tree.append(f.details);
    const controller = createAccordionMotion(f.details, f.content); cleanups.push(() => controller.destroy());
    f.content.querySelector('button')!.focus();
    expect(tree.activeElement).toBe(f.content.querySelector('button'));
    const toggleAttribute = f.content.toggleAttribute.bind(f.content);
    const toggle = vi.spyOn(f.content, 'toggleAttribute').mockImplementation((name, force) => {
      if (name === 'inert' && force) {
        expect(tree.activeElement).toBe(f.summary);
        expect(f.content.getAttribute('aria-hidden')).not.toBe('true');
      }
      return toggleAttribute(name, force);
    });
    controller.setOpen(false);
    expect(tree.activeElement).toBe(f.summary);
    expect(f.content.hasAttribute('inert')).toBe(true);
    toggle.mockRestore();
  });

  it('keeps controlled requests separate from commits and ignores its own native toggle events', () => {
    const f = fixture(); const change = vi.fn();
    const controller = createAccordionMotion(f.details, f.content, change); cleanups.push(() => controller.destroy());
    controller.request(true); expect(change).toHaveBeenCalledExactlyOnceWith(true); expect(f.details.open).toBe(false);
    f.details.open = true; controller.nativeToggle();
    expect(f.details.open).toBe(false); expect(change).toHaveBeenCalledTimes(2);
    change.mockClear();
    controller.setOpen(true); controller.nativeToggle();
    controller.setOpen(false); controller.nativeToggle(); f.animations.at(-1)!.onfinish!(); controller.nativeToggle();
    expect(change).not.toHaveBeenCalled();
  });

  it.each(['zero duration', 'missing WAAPI'])('preserves immediate disclosure with %s', reason => {
    const f = fixture();
    if (reason === 'zero duration') f.details.style.setProperty('--nq-duration-accordion', '0ms');
    else Object.defineProperty(f.details, 'animate', { value: undefined });
    const controller = createAccordionMotion(f.details, f.content); cleanups.push(() => controller.destroy());
    vi.mocked(f.details.getBoundingClientRect).mockImplementation(() => { throw new Error('No layout engine'); });
    controller.setOpen(true); expect(f.details.open).toBe(true);
    controller.setOpen(false); expect(f.details.open).toBe(false); expect(f.animations).toHaveLength(0);
  });
});
