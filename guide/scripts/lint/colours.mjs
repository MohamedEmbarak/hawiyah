// Raw colour detector shared by the CSS, template and source linters.
// findColours(text) returns [{ value, index, kind }] for hex colours, colour
// functions, the CSS named colours and the CSS system colours. Callers decide
// where system colours are allowed (inside @media (forced-colors: active)).

export const NAMED_COLOURS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue',
  'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
  'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
  'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
  'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
  'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
  'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
  'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
  'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
  'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
  'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
  'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  'yellowgreen',
]);

export const SYSTEM_COLOURS = new Set([
  'canvas', 'canvastext', 'highlight', 'highlighttext', 'linktext', 'buttontext', 'buttonface', 'graytext', 'field', 'fieldtext',
]);

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g;
const FUNCTIONS = /(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color|device-cmyk)\s*\(/gi;
const IDENTIFIER = /(?<![\w$#.@-])([a-zA-Z][a-zA-Z]*)(?![\w(-])/g;

export function findColours(text, { identifiers = true } = {}) {
  const found = [];
  for (const match of text.matchAll(HEX)) found.push({ value: match[0], index: match.index, kind: 'hex' });
  for (const match of text.matchAll(FUNCTIONS)) found.push({ value: `${match[1]}()`, index: match.index, kind: 'function' });
  if (identifiers) {
    for (const match of text.matchAll(IDENTIFIER)) {
      const lower = match[1].toLowerCase();
      if (NAMED_COLOURS.has(lower)) found.push({ value: match[1], index: match.index, kind: 'named' });
      else if (SYSTEM_COLOURS.has(lower)) found.push({ value: match[1], index: match.index, kind: 'system' });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

// Removes var(--name) references (and their fallbacks are kept) so that a
// custom property name such as --hw-color-red is never read as a colour.
export function stripVarNames(value) {
  return value.replace(/var\(\s*--[\w-]+/g, (match) => ' '.repeat(match.length));
}
