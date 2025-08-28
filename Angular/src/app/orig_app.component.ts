import {Component} from '@angular/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  dataSource: any;
  searchText: string;
  url: string;
  words: Array<any>;
  customCalculateFilterExpression: any;

  constructor() {
    this.url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
    this.searchText = '';
    this.words = [];
    let self = this;
    this.customizeColumns = this.customizeColumns.bind(this);

    this.dataSource = AspNetData.createStore({
      key: 'OrderID',
      loadUrl: `${this.url}/Orders`,
      onBeforeSend(method, ajaxOptions) {
        ajaxOptions.xhrFields = {withCredentials: true};
      },
    });

    this.customCalculateFilterExpression = function(filterValue: any, selectedFilterOperation: any, target: string) {
      const column = this as any;
      if (target !== 'search' || typeof filterValue !== "string") {
        return column.defaultCalculateFilterExpression.apply(column, arguments);
      }
          if (target === 'search') {
            if (filterValue.trim().length > 0) {
              self.words = filterValue.split(' ').filter(k => k !== '');
              let filter: Array<any> = [];
              self.words.forEach((word) => {
                filter.push([column.dataField, 'contains', word]);
                filter.push('or');
              });
              filter.pop();
              return filter;
            } else {
              return column.defaultCalculateFilterExpression.apply(column, arguments);
            }
          }
    }
  }

  splitWithoutDeleting(string: string, substring: string) {
    let index = string.toLowerCase().indexOf(substring.toLowerCase());
    let startIndex = index;
    let endIndex = index + substring.length;
    if (startIndex === -1) return [string]
    let arr = [string.substring(0, startIndex), string.substring(startIndex, endIndex), string.substring(endIndex, string.length)];
    if (startIndex === 0) arr.shift();
    if (endIndex === string.length) arr.pop();
    return arr;
  }

  customCellTemplate(container: any, options: any) {
    let arr = [options.text];
    if (this.words) {
      this.words.forEach(word => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].toLowerCase().includes(word.toLowerCase())) {
            arr.splice(i, 1, ...this.splitWithoutDeleting(arr[i], word))
          }
        }
      });
      for (let i = 0; i < arr.length; i++) {
        arr[i] = {string: arr[i], highlight: 0}
        this.words.forEach(word => {
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
    let el = document.createElement('span');
    el.innerHTML = this.searchText ? (arr ? arr.join('').toString() : options.text.toString()) : options.text.toString()
    container.append(el);
  }

  customizeColumns(columns: Array<any>) {
    columns.forEach((column: any) => {
      column.calculateFilterExpression = this.customCalculateFilterExpression.bind(column);
      column.cellTemplate = this.customCellTemplate.bind(this);
    })
  }
}
