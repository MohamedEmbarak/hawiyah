// Template fragments shared by hw-table and hw-data-table. Internal: not exported from public-api.ts.
import { TemplateRef } from '@angular/core';

/** The cell template of a column. A `cell` that is not a template, such as the render function a column array
 * shared with another adapter carries, is ignored: the row value is printed as text. */
export const cellTemplate = (column: {cell?: unknown}): TemplateRef<unknown> | null => column.cell instanceof TemplateRef ? column.cell : null;
/** The cell of a row: the template of its column, else the row value as text. Shared by hw-table and hw-data-table. */
export const tableCells = `@for (column of columns; track column.key) {@if (column.rowHeader) {<th scope="row"><ng-container [ngTemplateOutlet]="cell" [ngTemplateOutletContext]="{$implicit: row, index: index, column: column}" /></th>} @else {<td><ng-container [ngTemplateOutlet]="cell" [ngTemplateOutletContext]="{$implicit: row, index: index, column: column}" /></td>}}`;
export const tableCell = `<ng-template #cell let-row let-index="index" let-column="column">@if (cellTemplate(column); as template) {<ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{$implicit: row, index: index, column: column}" />} @else {<ng-container>{{ row[column.key] }}</ng-container>}</ng-template>`;
