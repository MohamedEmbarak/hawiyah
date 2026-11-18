import { Component, TemplateRef, ViewChild, computed, inject, input } from '@angular/core';
import { HwTableColumn, HwTableComponent } from '@hawiyah/angular';
import { LocaleService } from '../core/locale';
import { pick } from '../i18n/text';
import { contentTexts } from './i18n';
import { InlineContent, inlineText } from './inline';
import type { ColumnAlign, Inline, TableBlock } from './model';

type Row = Readonly<Record<string, readonly Inline[]>>;

interface CellContext {
  readonly $implicit: Row;
  readonly index: number;
  readonly column: HwTableColumn<Row>;
}

/**
 * A Markdown table as hw-table: the caption names the table and its scroll region,
 * column labels are plain text, and every cell renders its inline content through a
 * cell template. Column alignment applies to the content of each cell.
 */
@Component({
  selector: 'guide-table',
  imports: [HwTableComponent, InlineContent],
  template: `<hw-table [caption]="block().caption" [columns]="columns()" [rows]="block().rows" [rowKey]="rowKey" [emptyMessage]="t().emptyTable" size="sm" /><ng-template #cell let-row let-column="column"><span [class]="alignClass(column.key)"><guide-inline [inlines]="cellOf(row, column.key)" /></span></ng-template>`,
  styleUrl: './table.css',
})
export class TableContent {
  readonly block = input.required<TableBlock>();
  @ViewChild('cell', { static: true }) private cell?: TemplateRef<CellContext>;

  private readonly locale = inject(LocaleService);
  protected readonly t = computed(() => pick(contentTexts, this.locale.lang()));
  protected readonly columns = computed<readonly HwTableColumn<Row>[]>(() =>
    this.block().columns.map((column) => ({ key: column.key, label: inlineText(column.label), cell: this.cell })),
  );
  private readonly aligns = computed(() => new Map(this.block().columns.map((column) => [column.key, column.align])));

  protected readonly rowKey = (_row: Row, index: number): number => index;

  protected cellOf(row: Row, key: string): readonly Inline[] {
    return row[key] ?? [];
  }

  protected alignClass(key: string): string {
    const align: ColumnAlign = this.aligns().get(key) ?? null;
    return align ? `cell align-${align}` : 'cell';
  }
}
