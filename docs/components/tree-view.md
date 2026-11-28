# TreeView

TreeView is a single-selection tree of nested items, such as the folders and documents of a case file, that a reader moves through by keyboard and expands or collapses level by level. The tree is one flat list of tree items in every adapter, and the application names the toggle of each branch.

## Example

The tree has a name that states what it lists. The application supplies the names of the expand and collapse toggles, so a screen reader announces which branch a toggle opens. The example starts with both branches expanded and one item selected.

```html live example=basic static differences=tree-view-adapter-markup
<ul class="hw-tree-view" data-hw="tree-view" aria-label="Case file folders" data-hw-expand-label="Expand {label}" data-hw-collapse-label="Collapse {label}">
  <li class="hw-tree-item" role="treeitem" aria-level="1" aria-expanded="true" data-hw-value="documents"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle><span class="hw-icon" data-size="sm" aria-hidden="true" data-icon="minus-sign"></span></button><span data-hw-tree-label>Documents</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" aria-selected="true" data-hw-value="application-form"><span data-hw-tree-label>Application form</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" data-hw-value="supporting-letter"><span data-hw-tree-label>Supporting letter</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="1" aria-expanded="true" data-hw-value="messages"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle><span class="hw-icon" data-size="sm" aria-hidden="true" data-icon="minus-sign"></span></button><span data-hw-tree-label>Messages</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" data-hw-value="decision-notice"><span data-hw-tree-label>Decision notice</span></li>
</ul>
```

```tsx live example=basic
<TreeView
  label="Case file folders"
  items={[
    { id: 'documents', label: 'Documents', children: [
      { id: 'application-form', label: 'Application form' },
      { id: 'supporting-letter', label: 'Supporting letter' },
    ] },
    { id: 'messages', label: 'Messages', children: [
      { id: 'decision-notice', label: 'Decision notice' },
    ] },
  ]}
  defaultExpanded={['documents', 'messages']}
  defaultValue="application-form"
  getExpandLabel={(node) => `Expand ${node.label}`}
  getCollapseLabel={(node) => `Collapse ${node.label}`}
/>
```

```vue live example=basic
<TreeView
  label="Case file folders"
  :items="[
    { id: 'documents', label: 'Documents', children: [
      { id: 'application-form', label: 'Application form' },
      { id: 'supporting-letter', label: 'Supporting letter' },
    ] },
    { id: 'messages', label: 'Messages', children: [
      { id: 'decision-notice', label: 'Decision notice' },
    ] },
  ]"
  :default-expanded="['documents', 'messages']"
  default-value="application-form"
  :get-expand-label="(node) => `Expand ${node.label}`"
  :get-collapse-label="(node) => `Collapse ${node.label}`"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwTreeViewComponent, type HwTreeNode } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwTreeViewComponent],
  template: `<hw-tree-view
    label="Case file folders"
    [items]="items"
    [expanded]="['documents', 'messages']"
    value="application-form"
    [getExpandLabel]="expandLabel"
    [getCollapseLabel]="collapseLabel"
  />`,
})
export class BasicExample {
  items: HwTreeNode[] = [
    { id: 'documents', label: 'Documents', children: [
      { id: 'application-form', label: 'Application form' },
      { id: 'supporting-letter', label: 'Supporting letter' },
    ] },
    { id: 'messages', label: 'Messages', children: [
      { id: 'decision-notice', label: 'Decision notice' },
    ] },
  ];
  expandLabel = (node: HwTreeNode) => `Expand ${node.label}`;
  collapseLabel = (node: HwTreeNode) => `Collapse ${node.label}`;
}
```

## API

### JavaScript

Table: Options of createTreeView

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `expanded` | `readonly string[]` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onExpandedChange` | `(expanded: string[]) => void` | `false` | — |
| `getExpandLabel` | `(node: TreeViewNode) => string` | `false` | — |
| `getCollapseLabel` | `(node: TreeViewNode) => string` | `false` | — |

`createTreeView(root, options)` enhances an element with `data-hw="tree-view"`, which `enhance()` does for every such element, and returns a controller with `value`, `expanded`, `select(value)`, `toggle(value)`, `focus(value)` and `destroy()`. The markup is one flat list: each item is an `li` with `role="treeitem"`, the class `hw-tree-item`, a unique `data-hw-value` and an `aria-level`, written parent first; an item never contains its child items, and the controller throws when it does. A branch holds a `button` with the class `hw-tree-toggle` and the attribute `data-hw-tree-toggle`, then the label in an element with `data-hw-tree-label`, which names the item. The controller sets `aria-level`, `aria-posinset`, `aria-setsize`, `aria-selected`, `--hw-tree-depth` and the `hidden` attribute of the rows of a collapsed branch, and it takes the toggle out of the tab order. Name the tree with `aria-label` on the root. Name each toggle with `getExpandLabel` and `getCollapseLabel`, or with the attributes `data-hw-expand-label` and `data-hw-collapse-label` on the root, in which `{label}` stands for the label of the item. The `value` and `expanded` options set the initial selection and the initial expanded branches; without them the controller reads `data-hw-value` on the root, or else the item with `aria-selected="true"`, and `aria-expanded="true"` on the branches. `onValueChange` and `onExpandedChange` receive each change, which the root also reports as the `hw:change` event.

### React

Table: Props of TreeView

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly TreeNode[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `expanded` | `readonly string[]` | `false` | — |
| `defaultExpanded` | `readonly string[]` | `false` | `[]` |
| `onExpandedChange` | `(expanded: string[]) => void` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `getExpandLabel` | `(node: TreeNode) => string` | `true` | — |
| `getCollapseLabel` | `(node: TreeNode) => string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`items` is the tree; each `TreeNode` has an `id`, a `label` that is renderable content, an optional `disabled` and optional `children`. Use `value` with `onValueChange` for a controlled selection and `defaultValue` for an uncontrolled one, and `expanded` with `onExpandedChange` for controlled branches and `defaultExpanded` for uncontrolled ones. The selection is the `id` of one item, and an empty string selects nothing. `getExpandLabel` and `getCollapseLabel` are required and name the toggle of each branch. The tree needs a name from `label`, `aria-label` or `aria-labelledby`. `disabled` disables every item. The tree does not submit a value with a native form.

### Vue

Table: Props, events and slots of TreeView

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TreeNode[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `expanded` | prop | `readonly string[]` | `false` | — |
| `defaultExpanded` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `getExpandLabel` | prop | `(node: TreeNode) => string` | `true` | — |
| `getCollapseLabel` | prop | `(node: TreeNode) => string` | `true` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:expanded` | event | `(value: readonly string[]) => void` | `false` | — |

`v-model` binds the id of the selected item, and the `expanded` prop with the `update:expanded` event binds the ids of the expanded branches; `defaultValue` and `defaultExpanded` set the initial state of an uncontrolled tree. The default of `defaultExpanded` is an empty array that the build creates for each component, so its Default is an em dash. Each `TreeNode` has an `id`, a string `label`, an optional `disabled` and optional `children`. `getExpandLabel` and `getCollapseLabel` are required and name the toggles. The tree needs a name from `label`, or from `aria-label` or `aria-labelledby`, which reach the tree. `disabled` disables every item. The component declares no slot.

### Angular

Table: Inputs, outputs and content of hw-tree-view

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `string` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `getExpandLabel` | input | `(node: HwTreeNode) => string` | `true` | — |
| `getCollapseLabel` | input | `(node: HwTreeNode) => string` | `true` | — |
| `items` | input | `readonly HwTreeNode[]` | `false` | `[]` |
| `expanded` | input | `readonly string[]` | `false` | `[]` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `expandedChange` | output | `readonly string[]` | `false` | — |

`HwTreeViewComponent` (`hw-tree-view`) takes `items`, each an `HwTreeNode` with an `id`, a `label`, an optional `disabled` and optional `children`. `[(value)]` binds the id of the selected item and `[(expanded)]` the ids of the expanded branches; a value written once is the initial state. `getExpandLabel` and `getCollapseLabel` are required and name the toggles. The tree needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-tree-view`, or the label of a surrounding `hw-field`. `direction` sets the direction of the rendered tree, written as `dir` on the list, and with it the reading direction of the arrow keys. `readOnly` keeps the tree focusable and leaves its selection unchanged, and the toggles still work. `name`, `form`, `readOnly`, `hint` and `error` exist in Angular only in 0.3.0.

## Accessibility

The tree has `role="tree"` and each item `role="treeitem"`, with its level, its position and its size in the set, so a screen reader announces where the item stands. Each item is named by its label alone, and the toggle is not part of that name. The toggle of a branch is a native `button` named by `getExpandLabel` or `getCollapseLabel`. It is outside the tab order and exists for pointer and screen-reader activation: it expands or collapses the branch without selecting the item, and focus stays on the tree item.

Only one item is in the tab order at a time, and the arrow keys move focus between the visible items. Items of a collapsed branch are not visible and are skipped. Disabled items are skipped by the arrow keys, <kbd>Home</kbd> and <kbd>End</kbd>. At the last item <kbd>Down Arrow</kbd> and at the first item <kbd>Up Arrow</kbd> differ: vanilla, Vue and Angular wrap to the other end, and React stays on the item.

Table: Keyboard interaction of TreeView

| Key | Action |
| --- | --- |
| <kbd>Down Arrow</kbd> | Moves focus to the next enabled visible item. |
| <kbd>Up Arrow</kbd> | Moves focus to the previous enabled visible item. |
| <kbd>Home</kbd>, <kbd>End</kbd> | Moves focus to the first or the last enabled visible item. |
| <kbd>Right Arrow</kbd> | In left-to-right text, expands a collapsed branch, moves focus from an expanded branch to its first enabled child, and does nothing on an item without children. |
| <kbd>Left Arrow</kbd> | In left-to-right text, collapses an expanded branch, and otherwise moves focus to the parent item. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Selects the focused item. |

In right-to-left text the two horizontal arrow keys swap their actions: <kbd>Left Arrow</kbd> expands and moves into a branch, and <kbd>Right Arrow</kbd> collapses it or moves to the parent. A printable character moves focus to the next visible item whose label starts with it, as in Menu. Type-ahead ignores a key pressed with <kbd>Ctrl</kbd>, <kbd>Alt</kbd> or the Meta key in every adapter. For the other keys the adapters differ in 0.3.0: vanilla and Angular leave every modified shortcut to the browser, while React and Vue also act on <kbd>Ctrl</kbd> with an arrow key, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> and prevent the browser default.

### Selection

Selecting an item sets `aria-selected` on it and reports its `id`. A click on an item selects it; a click on a toggle only expands or collapses the branch. The tree selects one item at a time.

## RTL and localisation

TreeView has no built-in text. The label of the tree, the labels of the items and the names of the toggles are written by the application in the language of the page. The names of the toggles are functions of the node, so each can include the label of its item in the language of the reader.

- The tree follows the direction of the page, or of the subtree that sets `dir`, and the indentation and the toggle use logical properties.
- The horizontal arrow keys follow the direction: in right-to-left text the arrow that points toward the end of the line expands a branch, and the one that points toward the start collapses it.
- Type-ahead compares the typed character with the start of each visible label, so the typed text and the labels need to use the same script.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of TreeView; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- TreeView is listed in the [coverage notes](../coverage.md) in the group of additional interaction components, and among the interactive components, those for which Hawiyah implements state, keyboard behaviour or lifecycle of its own.
