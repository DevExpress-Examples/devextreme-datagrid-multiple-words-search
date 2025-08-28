<template>
  <DxDataGrid
      ref="gridRef"
      :show-borders="true"
      :data-source="dataSource"
      :remote-operations="true"
      :height="600"
      :width="800"
      :column-auto-width="true"
      :customize-columns="customizeColumns"
  >
    <DxColumn data-field="ShipName" data-type="string" />
    <DxColumn data-field="ShipAddress" data-type="string" />
    <DxColumn data-field="ShipCity" data-type="string" />

    <DxFilterRow :visible="true"/>
    <DxHeaderFilter :visible="true"/>
    <DxSearchPanel :visible="true" :width="240" placeholder="Search"/>

  </DxDataGrid>
</template>
<script>
import {
  DxDataGrid,
  DxColumn,
  DxFilterRow,
  DxHeaderFilter,
  DxSearchPanel,
} from 'devextreme-vue/data-grid';

import { createStore } from 'devextreme-aspnet-data-nojquery';

const url = "https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi";
let words;

const dataSource = createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend: (method, ajaxOptions) => {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function splitWithoutDeleting(string, substring){
  let index = string.toLowerCase().indexOf(substring.toLowerCase());
  let startIndex = index;
  let endIndex = index + substring.length;
  if(startIndex === -1) return [string]
  let arr = [string.substring(0, startIndex), string.substring(startIndex, endIndex), string.substring(endIndex, string.length)];
  if(startIndex === 0) arr.shift();
  if(endIndex === string.length) arr.pop();
  return arr;
}

function customCalculateFilterExpression(filterValue, selectedFilterOperation, target) {
  if (target !== 'search' || typeof filterValue !== "string") {
    return this.defaultCalculateFilterExpression.apply(this, arguments);
  }
  if (target === 'search') {
    if(filterValue.trim().length > 0){
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
  if(words) {
    words.forEach(word => {
      for(let i = 0; i<arr.length; i++){
        if(arr[i].toLowerCase().includes(word.toLowerCase())){
          arr.splice(i, 1, ...splitWithoutDeleting(arr[i], word))
        }
      }
    });
    for(let i = 0; i<arr.length; i++){
      arr[i] = {string: arr[i], highlight: 0}
      words.forEach(word => {
        if(arr[i].string.toLowerCase().includes(word.toLowerCase())){
          arr[i].highlight = 1;
        }
      })
    }
    for(let i = 0; i<arr.length; i++){
      if(arr[i].highlight){
        let highlightArray = ['<span class="highlighted">', arr[i].string, '</span>'];
        arr.splice(i, 1, ...highlightArray)
      } else
      if(arr[i].string){
        arr[i] = arr[i].string;
      }
    }
  }
  if (!this.$refs.gridRef.instance.option("searchPanel.text")) {
    let el = document.createElement('span');
    el.innerHTML = options.text.toString();
    container.append(el);
  } else {
    let el = document.createElement('span');
    el.innerHTML = arr ? arr.join('').toString() : options.text.toString();
    container.append(el);
  }
}

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxFilterRow,
    DxHeaderFilter,
    DxSearchPanel,
  },
  data() {
    return {
      url,
      dataSource,
    };
  },
  methods: {
    customizeColumns(columns){
      columns.forEach((column) => {
        column.calculateFilterExpression = customCalculateFilterExpression.bind(column);
        column.cellTemplate = customCellTemplate.bind(this);
      })
    }
  }
};
</script>
<style>
.highlighted {
  color: #fff;
  background-color: #337ab7;
}
</style>
