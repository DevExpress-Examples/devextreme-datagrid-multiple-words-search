$(() => {
    const url = "https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi";
    let words;

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
        let res = null;
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
        if (!dataGrid.option("searchPanel.text")) {
            container.append($('<span>').html(options.text.toString()));
        } else {
            container.append($('<span>').html(arr ? arr.join('').toString() : options.text.toString()));
        }
    }

    let dataGrid = $("#grid").dxDataGrid({
        dataSource: DevExpress.data.AspNet.createStore({
            key: "OrderID",
            loadUrl: url + "/Orders",
            insertUrl: url + "/InsertOrder",
            updateUrl: url + "/UpdateOrder",
            deleteUrl: url + "/DeleteOrder",
            onBeforeSend: function (method, ajaxOptions) {
                ajaxOptions.xhrFields = {withCredentials: true};
            }
        }),
        columnAutoWidth: true,
        searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Search..."
        },
        remoteOperations: true,
        columns: ["ShipName", "ShipAddress", "ShipCity"],
        filterRow: {
            visible: true
        },
        headerFilter: {
            visible: true
        },
        height: 600,
        showBorders: true,
        customizeColumns: function (columns) {
            columns.forEach((column) => {
                column.calculateFilterExpression = customCalculateFilterExpression.bind(column);
                column.cellTemplate = customCellTemplate.bind(column);
            })
        }
    }).dxDataGrid("instance");
})
