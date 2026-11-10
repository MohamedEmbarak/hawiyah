// Server-renders every scenario with hydration enabled and prints the pages as JSON.
// Run by hydration.test.ts in its own process: the server and the browser platform
// share one DOM adapter per process, so the two halves cannot run side by side.
import '@angular/compiler';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { createHost, hydrationDocument, scenarios } from './scenarios.ts';

const errors: string[] = [];
const record = (...values: unknown[]) => { errors.push(values.map(value => value instanceof Error ? value.stack ?? value.message : String(value)).join(' ')); };
console.error = record;
// Standard output carries only the JSON result; Angular announces development mode there.
console.log = console.info = () => {};
process.on('uncaughtException', record); process.on('unhandledRejection', record);

const pages: Array<{ name: string; html: string; errors: string[] }> = [];
for (const scenario of scenarios) {
  errors.length = 0;
  let html = '';
  try {
    html = await renderApplication(context => bootstrapApplication(createHost(scenario, 5), { providers: [provideServerRendering(), provideClientHydration()] }, context), { document: hydrationDocument, url: 'http://localhost/', allowedHosts: ['localhost'] });
  } catch (error) { record(error); }
  await new Promise(resolve => setTimeout(resolve, 5));
  pages.push({ name: scenario.name, html, errors: [...errors] });
}
process.stdout.write(JSON.stringify(pages));
