import React from 'react';

import 'devextreme/dist/css/dx.light.css';

import {
  Column,
  DataGrid,
  SearchPanel,
  FilterRow,
  HeaderFilter
} from 'devextreme-react/data-grid';

import {createStore} from 'devextreme-aspnet-data-nojquery';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
let words;
let grid;

function splitWithoutDeleting(string, substring) {
  let index = string.toLowerCase().indexOf(substring.toLowerCase());
  let startIndex = index;
  let endIndex = index + substring.length;
  if (startIndex === -1) return [string]
  let arr = [string.substring(0, startIndex), string.substring(startIndex, endIndex), string.substring(endIndex, string.length)];
  if (startIndex === 0) arr.shift();
  if (endIndex === string.length) arr.pop();
  return arr;
}

function customCalculateFilterExpression(filterValue, selectedFilterOperation, target) {
  if (target !== 'search' || typeof filterValue !== "string") {
    return this.defaultCalculateFilterExpression.apply(this, arguments);
  }
  if (target === 'search') {
    if (filterValue.trim().length > 0) {
      words = filterValue.split(' ').filter(k => k !== '');
      let filter = [];
      words.forEach((word) => {
        filter.push([this.dataField, 'contains', word]);
        filter.push('or');
      });
      filter.pop();
      return filter;
    } else {
      return this.defaultCalculateFilterExpression.apply(this, arguments);
    }
  }
}

function customCellTemplate(container, options) {
  let arr = [options.text];
  if (words) {
    words.forEach(word => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase().includes(word.toLowerCase())) {
          arr.splice(i, 1, ...splitWithoutDeleting(arr[i], word))
        }
      }
    });
    for (let i = 0; i < arr.length; i++) {
      arr[i] = {string: arr[i], highlight: 0}
      words.forEach(word => {
        if (arr[i].string.toLowerCase().includes(word.toLowerCase())) {
          arr[i].highlight = 1;
        }
      })
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].highlight) {
        let highlightArray = ['<span class="highlighted">', arr[i].string, '</span>'];
        arr.splice(i, 1, ...highlightArray)
      } else if (arr[i].string) {
        arr[i] = arr[i].string;
      }
    }
  }
  if (!grid.option("searchPanel.text")) {
    let el = document.createElement('span');
    el.innerHTML = options.text.toString();
    container.append(el);
  } else {
    let el = document.createElement('span');
    el.innerHTML = arr ? arr.join('').toString() : options.text.toString();
    container.append(el);
  }
}

const dataSource = createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = {withCredentials: true};
  }
});

function customizeColumns(columns) {
  columns.forEach((column) => {
    column.calculateFilterExpression = customCalculateFilterExpression.bind(column);
    column.cellTemplate = customCellTemplate.bind(column);
  })
}

function onInitialized(e) {
  grid = e.component;
}

export default function App() {
  return (
    <DataGrid
      dataSource={dataSource}
      showBorders
      columnAutoWidth
      height={600}
      width={800}
      remoteOperations
      customizeColumns={customizeColumns}
      onInitialized={onInitialized}
    >
      <SearchPanel visible width={240} placeholder="Search"/>
      <FilterRow visible/>
      <HeaderFilter visible/>
      <Column dataField="ShipName" dataType="string"/>
      <Column dataField="ShipAddress" dataType="string"/>
      <Column dataField="ShipCity" dataType="string"/>
    </DataGrid>
  );
}
