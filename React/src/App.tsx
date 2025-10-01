import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DataGrid, {
  SearchPanel, FilterRow, HeaderFilter, Column, type DataGridTypes,
} from 'devextreme-react/data-grid';
import { createStore } from 'devextreme-aspnet-data-nojquery';

const url = 'https://js.devexpress.com/Demos/NetCore/api/DataGridWebApi';
let words: string[] = [];

function splitWithoutDeleting(string: string, substring: string): string[] {
  let index = string.toLowerCase().indexOf(substring.toLowerCase());
  let startIndex = index;
  let endIndex = index + substring.length;
  if (startIndex === -1) return [string];
  let arr = [string.substring(0, startIndex), string.substring(startIndex, endIndex), string.substring(endIndex, string.length)];
  if (startIndex === 0) arr.shift();
  if (endIndex === string.length) arr.pop();
  return arr;
}

function customCalculateFilterExpression(this: DataGridTypes.Column, filterValue: any, selectedFilterOperation: string | null, target: string):
(string | any[] | Function) {
  const column = this;
  if (target === 'search') {
    if (filterValue.trim().length > 0 && typeof filterValue === 'string') {
      words = filterValue.split(' ').filter((k) => k !== '');
      const filter: ([string | undefined, 'contains', string] | string)[] = [];
      words.forEach((word) => {
        filter.push([column.dataField, 'contains', word]);
        filter.push('or');
      });
      filter.pop();
      return filter;
    }
  }
  return column.defaultCalculateFilterExpression?.call(column, filterValue, selectedFilterOperation, target) ?? '';
}

function customCellTemplate(container: HTMLElement, options: DataGridTypes.ColumnCellTemplateData): void {
  const matches: string[] = [options.text];
  const textParts: { string: string; highlight: boolean }[] = [];
  if (words) {
    words.forEach((word) => {
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].toLowerCase().includes(word.toLowerCase())) {
          matches.splice(i, 1, ...splitWithoutDeleting(matches[i], word));
        }
      }
    });

    for (let i = 0; i < matches.length; i++) {
      textParts.push({ string: matches[i], highlight: false });
      words.forEach((word) => {
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
  const searchText = options.component.option('searchPanel.text');
  el.innerHTML = searchText ? textParts.map((tp) => tp.string).join('') : options.text.toString();
  container.append(el);
}

const dataSource = createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend: (_: string, ajaxOptions: any) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function customizeColumns(columns: DataGridTypes.Column[]): void {
  columns.forEach((column) => {
    column.calculateFilterExpression = customCalculateFilterExpression.bind(column);
    column.cellTemplate = customCellTemplate.bind(column);
  });
}

function App(): JSX.Element {
  return (
    <DataGrid
      dataSource={dataSource}
      showBorders
      columnAutoWidth
      height={600}
      width={800}
      remoteOperations
      customizeColumns={customizeColumns}
    >
      <SearchPanel visible width={240} placeholder="Search" />
      <FilterRow visible />
      <HeaderFilter visible />
      <Column dataField="ShipName" dataType="string" />
      <Column dataField="ShipAddress" dataType="string" />
      <Column dataField="ShipCity" dataType="string" />
    </DataGrid>
  );
}

export default App;
