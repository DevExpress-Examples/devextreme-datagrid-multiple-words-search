$(() => {
  const url = 'https://js.devexpress.com/Demos/NetCore/api/DataGridWebApi';
  let words;

  function splitWithoutDeleting(string, substring) {
    const index = string.toLowerCase().indexOf(substring.toLowerCase());
    const startIndex = index;
    const endIndex = index + substring.length;
    if (startIndex === -1) return [string];
    const arr = [
      string.substring(0, startIndex),
      string.substring(startIndex, endIndex),
      string.substring(endIndex, string.length),
    ];
    if (startIndex === 0) arr.shift();
    if (endIndex === string.length) arr.pop();
    return arr;
  }

  function customCalculateFilterExpression(filterValue, selectedFilterOperation, target) {
    if (target === 'search' && typeof filterValue === 'string') {
      if (filterValue.trim().length > 0) {
        words = filterValue.split(' ').filter((k) => k !== '');
        const filter = [];
        words.forEach((word) => {
          filter.push([this.dataField, 'contains', word]);
          filter.push('or');
        });
        filter.pop();
        return filter;
      }
    }
    return this.defaultCalculateFilterExpression.apply(
      this,
      filterValue,
      selectedFilterOperation,
      target,
    );
  }

  function customCellTemplate(container, options) {
    const arr = [options.text];
    if (words) {
      words.forEach((word) => {
        for (let i = 0; i < arr.length; i += 1) {
          if (arr[i].toLowerCase().includes(word.toLowerCase())) {
            arr.splice(i, 1, ...splitWithoutDeleting(arr[i], word));
          }
        }
      });
      for (let i = 0; i < arr.length; i += 1) {
        arr[i] = { string: arr[i], highlight: 0 };
        words.forEach((word) => {
          if (arr[i].string.toLowerCase().includes(word.toLowerCase())) {
            arr[i].highlight = 1;
          }
        });
      }
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i].highlight) {
          const highlightArray = ['<span class="highlighted">', arr[i].string, '</span>'];
          arr.splice(i, 1, ...highlightArray);
        } else
          if (arr[i].string) {
            arr[i] = arr[i].string;
          }
      }
    }
    if (!dataGrid.option('searchPanel.text')) {
      container.append($('<span>').html(options.text.toString()));
    } else {
      container.append($('<span>').html(arr ? arr.join('').toString() : options.text.toString()));
    }
  }

  let dataGrid = $('#grid').dxDataGrid({
    dataSource: DevExpress.data.AspNet.createStore({
      key: 'OrderID',
      loadUrl: `${url}/Orders`,
      insertUrl: `${url}/InsertOrder`,
      updateUrl: `${url}/UpdateOrder`,
      deleteUrl: `${url}/DeleteOrder`,
      onBeforeSend: (method, ajaxOptions) => {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    }),
    columnAutoWidth: true,
    searchPanel: {
      visible: true,
      width: 240,
      placeholder: 'Search...',
    },
    remoteOperations: true,
    columns: ['ShipName', 'ShipAddress', 'ShipCity'],
    filterRow: {
      visible: true,
    },
    headerFilter: {
      visible: true,
    },
    height: 600,
    showBorders: true,
    customizeColumns: (columns) => {
      columns.forEach((column) => {
        column.calculateFilterExpression = customCalculateFilterExpression.bind(column);
        column.cellTemplate = customCellTemplate.bind(column);
      });
    },
  }).dxDataGrid('instance');
});
