import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DxDataGridModule],
})
export class AppComponent {
  dataSource: AspNetData.CustomStore;

  searchText = '';

  url = 'https://js.devexpress.com/Demos/NetCore/api/DataGridWebApi';

  words: string[] = [];

  customCalculateFilterExpression?: ((this: DxDataGridTypes.Column, filterValue: any, selectedFilterOperation: string | null, target: string) => string | any[] | Function) | undefined;

  constructor() {
    let self = this;
    this.customizeColumns = this.customizeColumns.bind(this);

    this.dataSource = AspNetData.createStore({
      key: 'OrderID',
      loadUrl: `${this.url}/Orders`,
      onBeforeSend(method: string, ajaxOptions: any) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });

    this.customCalculateFilterExpression = function (filterValue: any, selectedFilterOperation: string | null, target: string):
    (string | any[] | Function) {
      const column = this;
      if (target === 'search') {
        if (filterValue.trim().length > 0 && typeof filterValue === 'string') {
          self.words = filterValue.split(' ').filter((k) => k !== '');
          const filter: ([string | undefined, 'contains', string] | string)[] = [];
          self.words.forEach((word) => {
            filter.push([column.dataField, 'contains', word]);
            filter.push('or');
          });
          filter.pop();
          return filter;
        }
      }
      return column.defaultCalculateFilterExpression?.call(column, filterValue, selectedFilterOperation, target) ?? '';
    };
  }

  splitWithoutDeleting(string: string, substring: string): string[] {
    let index = string.toLowerCase().indexOf(substring.toLowerCase());
    let startIndex = index;
    let endIndex = index + substring.length;
    if (startIndex === -1) return [string];
    let arr = [string.substring(0, startIndex), string.substring(startIndex, endIndex), string.substring(endIndex, string.length)];
    if (startIndex === 0) arr.shift();
    if (endIndex === string.length) arr.pop();
    return arr;
  }

  customCellTemplate(container: HTMLElement, options: DxDataGridTypes.ColumnCellTemplateData): void {
    const matches: string[] = [options.text];
    const textParts: { string: string; highlight: boolean }[] = [];
    if (this.words) {
      this.words.forEach((word) => {
        for (let i = 0; i < matches.length; i++) {
          if (matches[i].toLowerCase().includes(word.toLowerCase())) {
            matches.splice(i, 1, ...this.splitWithoutDeleting(matches[i], word));
          }
        }
      });

      for (let i = 0; i < matches.length; i++) {
        textParts.push({ string: matches[i], highlight: false });
        this.words.forEach((word) => {
          if (textParts[i].string.toLowerCase().includes(word.toLowerCase())) {
            textParts[i].highlight = true;
          }
        });
      }

      textParts.forEach((tp) => {
        if (tp.highlight) tp.string = ['<span class="highlighted">', tp.string, '</span>'].join('');
      });
    }
    const el = document.createElement('span');
    el.innerHTML = this.searchText ? textParts.map((tp) => tp.string).join('') : options.text.toString();
    container.append(el);
  }

  customizeColumns(columns: DxDataGridTypes.Column[]): void {
    columns.forEach((column: DxDataGridTypes.Column) => {
      column.calculateFilterExpression = this.customCalculateFilterExpression?.bind(column);
      column.cellTemplate = this.customCellTemplate.bind(this);
    });
  }
}
