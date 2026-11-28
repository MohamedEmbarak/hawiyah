function hawiyahStartBundled(run) {
  // Start of the bundle fallback: runtime/bundles/<framework>.js has defined
  // globalThis.HawiyahRuntime; one classic script with the example's bundled form
  // (compiled.classic) runs against it.
  if (!globalThis.HawiyahRuntime || !globalThis.HawiyahRuntime.modules) {
    throw new Error('The bundled runtime did not load');
  }
  var failure = null;
  var listener = function (event) {
    failure = event.error || new Error(event.message || 'Error');
  };
  window.addEventListener('error', listener);
  var script = run.document.createElement('script');
  script.nonce = run.nonce;
  script.textContent = run.classic;
  run.document.body.appendChild(script);
  window.removeEventListener('error', listener);
  if (failure) throw failure;
}
