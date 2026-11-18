// Shared types and mount helpers of the fixture host. A case module exports one
// mount function per adapter it covers; each returns a teardown.
import '@angular/compiler';
import { createApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, type Type } from '@angular/core';
import { createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, type Component as VueComponent } from 'vue';

export type Adapter = 'vanilla' | 'react' | 'vue' | 'angular';
export const ADAPTERS: readonly Adapter[] = ['vanilla', 'react', 'vue', 'angular'];

export interface FixtureContext {
  readonly lang: 'ar' | 'en';
  readonly dir: 'rtl' | 'ltr';
  readonly mode: 'light' | 'dark';
  readonly adapter: Adapter;
  readonly params: URLSearchParams;
  /** Picks the English or the Arabic text: the packages ship no built-in strings. */
  t(en: string, ar: string): string;
}

export type Teardown = () => void;
export type Mount = (root: HTMLElement, context: FixtureContext) => Teardown | Promise<Teardown>;
export type FixtureCase = Partial<Record<Adapter, Mount>>;

/** Renders a React element into root. */
export function mountReact(root: HTMLElement, element: ReactNode): Teardown {
  const reactRoot = createRoot(root);
  reactRoot.render(element);
  return () => reactRoot.unmount();
}

/** Mounts a Vue component (render function) into root. */
export function mountVue(root: HTMLElement, component: VueComponent): Teardown {
  const app = createApp(component);
  app.mount(root);
  return () => app.unmount();
}

/** Bootstraps a standalone Angular component (JIT) into a host element inside root. */
export async function mountAngular(root: HTMLElement, component: Type<unknown>): Promise<Teardown> {
  const host = document.createElement('div');
  host.className = 'fixture-angular-root';
  root.append(host);
  const app = await createApplication({ providers: [provideZonelessChangeDetection()] });
  const ref = app.bootstrap(component, host);
  app.tick();
  await app.whenStable();
  return () => {
    ref.destroy();
    app.destroy();
  };
}

/** Parses an HTML string into root (vanilla fixtures are static package markup). */
export function html(root: HTMLElement, markup: string): HTMLElement {
  root.insertAdjacentHTML('beforeend', markup);
  return root;
}

export { createElement as h };
