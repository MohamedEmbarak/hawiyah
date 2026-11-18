function hawiyahStartModules(run) {
  // Start of the import-map strategy: the document's import map maps the runtime
  // specifiers to <origin><base>runtime/ files and hawiyah-project/<file> to the
  // example's modules; importing the entry runs the example.
  return import(run.entry);
}
