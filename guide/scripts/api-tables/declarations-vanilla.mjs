// Vanilla members of a page: the options of the create<Name> controller, read
// through the TypeScript checker from the parameter named options (else the
// second parameter). A component without a controller is checked against the
// stylesheet contract instead (stylesheet-contract.mjs and exclusions.json).
import { resolveExport } from './program.mjs';

/** Whether @hawiyah/vanilla exports create<Name>. */
export function hasController(context, name) {
  return resolveExport(context, 'vanilla', name) !== null;
}

/** Names and requiredness of the options of create<Name>. */
export function vanillaMembers(context, name) {
  const { ts, checker } = context;
  const symbol = resolveExport(context, 'vanilla', name);
  if (!symbol) return { members: [], problems: [`@hawiyah/vanilla exports no ${name}`] };
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  const parameters = signature?.getParameters() ?? [];
  const options = parameters.find((item) => item.name === 'options') ?? parameters[1];
  if (!options) return { members: [], problems: [`${name} of @hawiyah/vanilla has no options parameter`] };
  let optionsType = checker.getTypeOfSymbolAtLocation(options, options.valueDeclaration ?? declaration);
  optionsType = checker.getNonNullableType(optionsType);
  const members = checker.getPropertiesOfType(optionsType).map((property) => ({
    name: property.name,
    kind: 'option',
    required: (property.flags & ts.SymbolFlags.Optional) === 0,
  }));
  return { members, problems: [] };
}
