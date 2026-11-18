// Equivalence harness page (contentPipeline.equivalence.environment). Bundled by
// esbuild at run time into .cache/equivalence/harness/ and served at
// <base>__harness/ by scripts/equivalence/run.mjs only; never part of dist.
//
// Query: ?id=<page>&lang=<ar|en>&example=<name>&pin=<version>[&frameworks=a,b]
// It loads the compiled payloads that step 45 wrote, builds each frame document
// with the guide's own modulesDocument() (light mode, the page language and
// direction) and runs the four results side by side in sandboxed frames 720 CSS
// px wide. The state of every frame is published on window.__harness for the
// runner: loading, ready (after the frame's ready message) or failed.
import { FRAME_REFERRER_POLICY, FRAME_SANDBOX, modulesDocument } from '../../../src/app/examples/frame/document';
import { FRAME_FRAMEWORK_NAMES, frameTexts } from '../../../src/app/examples/frame/i18n';
import { MessageBudget, READY_TIMEOUT_MS, acceptMessage, randomHex128 } from '../../../src/app/examples/frame/protocol';
import { loadRuntimeConfig } from '../../../src/app/examples/frame/runtime-config';
import { EXAMPLE_FRAMEWORKS, examplePayloadPath, type ExampleFramework, type ExampleLanguage, type ExamplePayload } from '../../../src/app/examples/payload';

export const FRAME_WIDTH = 720;

interface FrameState {
  state: 'loading' | 'ready' | 'failed';
  message?: string;
  /** Errors and console messages of level warn or error that the frame reported. */
  log: string[];
  height: number;
}

interface HarnessState {
  done: boolean;
  error?: string;
  frames: Partial<Record<ExampleFramework, FrameState>>;
}

const state: HarnessState = { done: false, frames: {} };
(window as unknown as { __harness: HarnessState }).__harness = state;

function settle(): void {
  const frames = Object.values(state.frames);
  if (frames.length > 0 && frames.every((frame) => frame && frame.state !== 'loading')) state.done = true;
}

function fail(message: string): void {
  state.error = message;
  state.done = true;
}

async function main(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const id = params.get('id') ?? '';
  const lang = params.get('lang') as ExampleLanguage;
  const example = params.get('example') ?? '';
  const pin = params.get('pin') ?? '';
  const requested = (params.get('frameworks') ?? EXAMPLE_FRAMEWORKS.join(',')).split(',') as ExampleFramework[];
  const frameworks = EXAMPLE_FRAMEWORKS.filter((framework) => requested.includes(framework));
  if (!id || (lang !== 'ar' && lang !== 'en') || !example || !pin || frameworks.length === 0) {
    fail('harness: id, lang, example, pin and at least one framework are required');
    return;
  }
  const config = await loadRuntimeConfig(document.baseURI, pin, (url) => fetch(url));
  const main = document.getElementById('harness');
  if (!main) throw new Error('harness: no #harness element');
  const runs = new Map<Window, { framework: ExampleFramework; token: string; run: number; budget: MessageBudget; frame: HTMLIFrameElement }>();

  window.addEventListener('message', (event) => {
    for (const [source, entry] of runs) {
      if (event.source !== source) continue;
      const message = acceptMessage(event, { source, token: entry.token, run: entry.run });
      const frame = state.frames[entry.framework];
      if (!message || !frame || !entry.budget.take()) return;
      switch (message.type) {
        case 'ready':
          if (frame.state === 'loading') frame.state = 'ready';
          break;
        case 'error':
          frame.log.push(`error: ${message.text}`);
          if (frame.state === 'loading') {
            frame.state = 'failed';
            frame.message = message.text;
          }
          break;
        case 'console':
          if (message.level === 'warn' || message.level === 'error') frame.log.push(`console.${message.level}: ${message.text}`);
          break;
        case 'height':
          frame.height = message.height;
          entry.frame.style.blockSize = `${message.height}px`;
          break;
        case 'navigation':
          frame.log.push(`navigation: ${message.href}`);
          break;
        case 'submit':
          frame.log.push('submit');
          break;
      }
      settle();
      return;
    }
  });

  let run = 0;
  for (const framework of frameworks) {
    const response = await fetch(new URL(examplePayloadPath(id, lang, example, framework), document.baseURI).href);
    if (!response.ok) {
      fail(`harness: ${examplePayloadPath(id, lang, example, framework)} answered ${response.status}`);
      return;
    }
    const payload = (await response.json()) as ExamplePayload;
    run += 1;
    const token = randomHex128(crypto);
    const html = modulesDocument({
      framework,
      lang: payload.lang,
      dir: payload.dir,
      mode: 'light',
      title: frameTexts[payload.lang].frameTitle(FRAME_FRAMEWORK_NAMES[framework]),
      compiled: payload.compiled,
      runtimeBase: config.runtimeBase,
      stylesheets: config.stylesheets,
      imports: config.imports,
      nonce: randomHex128(crypto),
      token,
      run,
    });
    const section = document.createElement('section');
    section.className = 'result';
    const heading = document.createElement('h2');
    heading.textContent = framework;
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', FRAME_SANDBOX);
    frame.setAttribute('referrerpolicy', FRAME_REFERRER_POLICY);
    frame.setAttribute('title', `${framework} result`);
    frame.dataset['framework'] = framework;
    frame.style.inlineSize = `${FRAME_WIDTH}px`;
    section.append(heading, frame);
    main.append(section);
    state.frames[framework] = { state: 'loading', log: [], height: 0 };
    const window = frame.contentWindow;
    if (!window) throw new Error('harness: the frame has no window');
    runs.set(window, { framework, token, run, budget: new MessageBudget(), frame });
    frame.srcdoc = html;
    setTimeout(() => {
      const current = state.frames[framework];
      if (current && current.state === 'loading') {
        current.state = 'failed';
        current.message = `not ready within ${READY_TIMEOUT_MS} ms`;
        settle();
      }
    }, READY_TIMEOUT_MS);
  }
}

main().catch((error: unknown) => fail(`harness: ${error instanceof Error ? error.message : String(error)}`));
