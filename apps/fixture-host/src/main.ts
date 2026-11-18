// Fixture host entry: ?case=<id>&lang=ar|en&dir=rtl|ltr&mode=light|dark&adapters=vanilla,react,vue,angular
import '@hawiyah/styles/styles.css';
import './host.css';
import { ADAPTERS, type Adapter, type FixtureCase, type FixtureContext, type Teardown } from './host';

const cases = import.meta.glob<FixtureCase>('./cases/*.ts', { import: 'default' });
const adapterNames: Record<Adapter, string> = { vanilla: 'Vanilla', react: 'React', vue: 'Vue', angular: 'Angular' };

async function start(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const id = params.get('case') ?? '';
  const lang = params.get('lang') === 'ar' ? 'ar' : 'en';
  const dir = (params.get('dir') ?? (lang === 'ar' ? 'rtl' : 'ltr')) === 'rtl' ? 'rtl' : 'ltr';
  const mode = params.get('mode') === 'dark' ? 'dark' : 'light';
  const requested = (params.get('adapters') ?? ADAPTERS.join(','))
    .split(',')
    .filter((name): name is Adapter => (ADAPTERS as readonly string[]).includes(name));
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  const main = document.getElementById('fixture');
  if (!main) throw new Error('The fixture host page has no main#fixture element.');
  const load = cases[`./cases/${id}.ts`];
  if (!load) throw new Error(`Unknown fixture case "${id}".`);
  const fixture = await load();
  const teardowns: Teardown[] = [];
  for (const adapter of requested) {
    const mount = fixture[adapter];
    if (!mount) continue;
    const section = document.createElement('section');
    section.dataset.adapter = adapter;
    section.lang = lang;
    section.dir = dir;
    section.dataset.hwTheme = 'dga';
    section.dataset.hwMode = mode;
    section.dataset.hwDensity = 'comfortable';
    section.setAttribute('aria-labelledby', `fixture-${adapter}-title`);
    const heading = document.createElement('h2');
    heading.id = `fixture-${adapter}-title`;
    heading.className = 'fixture-heading';
    heading.textContent = adapterNames[adapter];
    const root = document.createElement('div');
    root.className = 'fixture-root';
    section.append(heading, root);
    main.append(section);
    const context: FixtureContext = {
      lang,
      dir,
      mode,
      adapter,
      params,
      t: (en, ar) => (lang === 'ar' ? ar : en),
    };
    teardowns.push(await mount(root, context));
  }
  (window as unknown as { __fixtureTeardown?: () => void }).__fixtureTeardown = () => teardowns.splice(0).forEach((stop) => stop());
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  document.body.dataset.fixtureReady = 'true';
}

start().catch((error: unknown) => {
  document.body.dataset.fixtureError = error instanceof Error ? error.message : String(error);
  console.error(error);
});
