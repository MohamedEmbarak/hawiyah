// The page side of the compile worker (editor.fullEditor.run): requests and answers,
// and the client that creates the module worker on first use. The worker loads the
// compilers from runtime/compilers/ only when a request needs them.
import type { CompiledExample, ExampleFramework } from '../../examples/payload';
import type { EditorLanguage } from './editor-store';

export interface CompileRequestBase {
  /** <origin><base>runtime/compilers/ */
  readonly compilersBase: string;
}

/** Compile the files of an edited project to modules and the classic form. */
export interface CompileRunRequest extends CompileRequestBase {
  readonly kind: 'compile';
  readonly framework: ExampleFramework;
  readonly language: EditorLanguage;
  readonly files: Readonly<Record<string, string>>;
  /** Bare specifiers the frame's import map serves. */
  readonly available: readonly string[];
  /** Message of the loop guard in the page language. */
  readonly loopMessage: string;
  /** Scope id of a Vue example (stable per example). */
  readonly scope: string;
}

/** Convert the TypeScript files of a React or Vue example to JavaScript (language js). */
export interface CompileConvertRequest extends CompileRequestBase {
  readonly kind: 'convert';
  readonly framework: ExampleFramework;
  readonly files: Readonly<Record<string, string>>;
}

export type CompileRequest = CompileRunRequest | CompileConvertRequest;

export interface CompileDiagnostic {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly message: string;
  /** Problems the guide words itself: an import the editor does not serve. */
  readonly code?: 'unknownModule' | 'unknownFile';
  readonly specifier?: string;
}

export type CompileResponse =
  | {
      readonly ok: true;
      readonly kind: 'compile';
      readonly compiled: Pick<CompiledExample, 'host' | 'entry' | 'modules' | 'classic'>;
      /** Angular: the frame compiles the templates (JIT) and needs 'unsafe-eval'. */
      readonly jit: boolean;
      /** Compilers loaded for this request (for the log). */
      readonly loaded: readonly string[];
    }
  | { readonly ok: true; readonly kind: 'convert'; readonly files: Readonly<Record<string, string>>; readonly loaded: readonly string[] }
  | { readonly ok: false; readonly diagnostics: readonly CompileDiagnostic[]; readonly loaded: readonly string[] }
  | { readonly ok: false; readonly loadError: string; readonly loaded: readonly string[] };

/** Envelope of the worker messages. */
export interface WorkerEnvelope<T> {
  readonly id: number;
  readonly body: T;
}

export type WorkerFactory = () => Worker;

/** The worker of the editor, bundled by the Angular builder. */
export const createCompileWorker: WorkerFactory = () => new Worker(new URL('./compile.worker', import.meta.url), { type: 'module' });

/** Sends requests to one worker, created on the first request; answers arrive in order of their ids. */
export class CompileClient {
  private worker: Worker | null = null;
  private counter = 0;
  private readonly pending = new Map<number, (response: CompileResponse) => void>();

  constructor(private readonly factory: WorkerFactory = createCompileWorker) {}

  request(body: CompileRequest): Promise<CompileResponse> {
    const worker = this.ensure();
    const id = ++this.counter;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      worker.postMessage({ id, body } satisfies WorkerEnvelope<CompileRequest>);
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const resolve of this.pending.values()) resolve({ ok: false, loadError: 'The compile worker was stopped.', loaded: [] });
    this.pending.clear();
  }

  private ensure(): Worker {
    if (this.worker) return this.worker;
    const worker = this.factory();
    worker.addEventListener('message', (event: MessageEvent<WorkerEnvelope<CompileResponse>>) => {
      const resolve = this.pending.get(event.data?.id);
      if (!resolve) return;
      this.pending.delete(event.data.id);
      resolve(event.data.body);
    });
    worker.addEventListener('error', (event: ErrorEvent) => {
      const message = event.message || 'The compile worker failed.';
      for (const resolve of this.pending.values()) resolve({ ok: false, loadError: message, loaded: [] });
      this.pending.clear();
      this.worker?.terminate();
      this.worker = null;
    });
    this.worker = worker;
    return worker;
  }
}
