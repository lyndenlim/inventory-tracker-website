var inv_table = $("#inventory").DataTable({
    "paging": false,
    "order": [[1, "asc"], [2, "asc"], [5, "asc"], [4, "asc"], [7, "asc"]],
    "ajax": "api/inventory",
    "preDrawCallback": function (settings) {
        pageScrollPos = $('div.dataTables_scrollBody').scrollTop();
    },
    "drawCallback": function (settings) {
        $('div.dataTables_scrollBody').scrollTop(pageScrollPos);
    },
    "columns": [
        { "data": "_id" },
        { "data": "item" },
        { "data": "purchased_from" },
        { "data": "purchase_price", render: $.fn.dataTable.render.number(',', '.', 2, '$') },
        { "data": "color" },
        { "data": "size" },
        { "data": "quantity" },
        { "data": "purchase_date" },
        { "data": "currentSpent" }
    ],
    "columnDefs": [        
        {
            "targets": [0],
            "visible": false,
            "searchable": false
        },
        {
            "targets": [8],
            "visible": false,
            "searchable": false
        }
    ],
    "info": true,
    "rowId": "_id",
    "select": { style: "single" },
    "responsive": true,
    "scrollY": 600,
    "deferRender": true,
    "scroller": true,
    "autoWidth": false,
    "language": {
        "emptyTable": "<div><img src='https://ouch-cdn.icons8.com/preview/959/94ded397-fd13-4b9c-9e6d-5ab45154d716.png' style='height:480px; weight:250px;'><div style='height: 95px;'>There are currently no items in your inventory.</div></div>"
    },
    "footerCallback": function (row, data, start, end, display) {
        var api = this.api(), data;
        var intVal = function (i) {
            return typeof i === 'string' ?
                i.replace(/[\$,]/g, '') * 1 :
                typeof i === 'number' ?
                    i : 0;
        };
        current_spent = api
            .column(8, { search: 'applied' })
            .data()
            .reduce(function (a, b) {
                return intVal(a) + intVal(b);
            }, 0);
        $('div.dataTables_scrollFoot #currentSpent').html("<strong>Current Amount Spent: " + accounting.formatMoney(current_spent) + "</strong>");
    }
});

$("#inventoryForm").on("submit", function (e) {
    e.preventDefault();
    var data = {
        inventoryItem: $(".inventoryItem").val(),
        inventoryPurchasedFrom: $(".inventoryPurchasedFrom").val(),
        inventoryPurchasePrice: $(".inventoryPurchasePrice").val(),
        inventoryColor: $(".inventoryColor").val(),
        inventorySize: $(".inventorySize").val(),
        inventoryQuantity: $(".inventoryQuantity").val(),
        inventoryPurchaseDate: $(".inventoryPurchaseDate").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./inventory",
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (e) {
            $('#inventoryAddModal').modal('toggle');
            $("#inventoryForm").trigger('reset');
            $('#inventory').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

inv_table
    .on('select', function (e, dt, type, indexes) {
        var data = inv_table.rows(indexes).data().toArray()[0];
        var id = data._id;
        $(".inventoryID").val(id)
        $(".editInventoryItem").val(data.item)
        $(".editInventoryPurchasedFrom").val(data.purchased_from)
        $(".editInventoryPurchasePrice").val(data.purchase_price)
        $(".editInventoryColor").val(data.color)
        $(".editInventorySize").val(data.size)
        $(".editInventoryQuantity").val(data.quantity)
        $(".editInventoryPurchaseDate").val(data.purchase_date)
        $("#duplicateInventory").val(id);
        $(".soldID").val(id);
        $("#inventoryDeleteButton").val(id)
    })
    .on('deselect', function (e, dt, type, indexes) {
        $(".inventoryID").val("")
        $(".editInventoryItem").val("")
        $(".editInventoryPurchasedFrom").val("")
        $(".editInventoryPurchasePrice").val("")
        $(".editInventoryColor").val("")
        $(".editInventorySize").val("")
        $(".editInventoryQuantity").val("")
        $(".editInventoryPurchaseDate").val("")
        $("#duplicateInventory").val("");
        $(".soldID").val("");
        $("#inventoryDeleteButton").val("");
    });

$("#inventoryEditButton").on("click", function () {
    $("#inventoryEditModal").modal("show"); 
});

$("#inventoryEditForm").on("submit", function (e) {
    e.preventDefault();
    var user_data = {
        inventoryID: $(".inventoryID").val(),
        editInventoryItem: $(".editInventoryItem").val(),
        editInventoryPurchasedFrom: $(".editInventoryPurchasedFrom").val(),
        editInventoryPurchasePrice: $(".editInventoryPurchasePrice").val(),
        editInventoryColor: $(".editInventoryColor").val(),
        editInventorySize: $(".editInventorySize").val(),
        editInventoryQuantity: $(".editInventoryQuantity").val(),
        editInventoryPurchaseDate: $(".editInventoryPurchaseDate").val()
    };
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./inventory-edit",
        data: JSON.stringify(user_data),
        dataType: 'json',
        success: function (e) {
            $('#inventoryEditModal').modal('toggle');
            $("#inventoryEditForm").trigger('reset');
            $('#inventory').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});


$("#duplicateInventory").on("click", function () {
    var duplicate_data = {
        duplicateInventory: $("#duplicateInventory").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./duplicate-inventory",
        data: JSON.stringify(duplicate_data),
        dataType: 'json',
        success: function (e) {
            $('#inventory').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

$(".markSold").on("click", function () {
    if($(".inventoryID").val() !== ""){
        $("#markSold").modal("show");
    }
});  

$("#sold").on("submit", function (e) {
    e.preventDefault();
    var data = {
        soldID: $(".soldID").val(),
        markSoldPrice: $(".markSoldPrice").val(),
        markSoldDate: $(".markSoldDate").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./sold",
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (e) {
            $('#markSold').modal('toggle');
            $("#markSold").trigger('reset');
            $('#inventory').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});


$("#inventoryDeleteButton").on("click", function () {
    var delete_id = { inventoryDeleteButton: $("#inventoryDeleteButton").val() }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./delete-inventory",
        data: JSON.stringify(delete_id),
        dataType: 'json',
        success: function (e) {
            $('#inventory').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

var sales_table = $("#sales").DataTable({
    "paging": false,
    "order": [[1, "asc"], [2, "asc"], [5, "asc"], [4, "asc"], [8, "asc"]],
    "ajax": "api/sales",
    "preDrawCallback": function (settings) {
        pageScrollPos = $('div.dataTables_scrollBody').scrollTop();
    },
    "drawCallback": function (settings) {
        $('div.dataTables_scrollBody').scrollTop(pageScrollPos);
    },
    "columns": [
        { "data": "_id" },
        { "data": "item" },
        { "data": "purchased_from" },
        { "data": "purchase_price", render: $.fn.dataTable.render.number(',', '.', 2, '$') },
        { "data": "color" },
        { "data": "size" },
        { "data": "quantity" },
        { "data": "purchase_date" },
        { "data": "sold_date" },
        { "data": "sold_price", render: $.fn.dataTable.render.number(',', '.', 2, '$') },
        { "data": "profit", render: $.fn.dataTable.render.number(',', '.', 2, '$') },
        { "data": "currentSpent" }
    ],
    "columnDefs": [
        {
            "targets": [0],
            "visible": false,
            "searchable": false
        },
        {
            "targets": [11],
            "visible": false,
            "searchable": false
        }
    ],
    "info": true,
    "rowId": "_id",
    "select": { style: "single" },
    "responsive": true,
    "scrollY": 600,
    "deferRender": true,
    "scroller": true,
    "autoWidth": false,
    "language": {
        "emptyTable": "<div><img src='https://ouch-cdn.icons8.com/preview/959/94ded397-fd13-4b9c-9e6d-5ab45154d716.png' style='height:480px; weight:250px;'><div style='height: 95px;'>There are currently no items in your sales.</div></div>"
    },
    "footerCallback": function (row, data, start, end, display) {
        var api = this.api(), data;
        var intVal = function (i) {
            return typeof i === 'string' ?
                i.replace(/[\$,]/g, '') * 1 :
                typeof i === 'number' ?
                    i : 0;
        };
        total_profit = api
            .column(10, { search: 'applied' })
            .data()
            .reduce(function (a, b) {
                return intVal(a) + intVal(b);
            }, 0);
        $('div.dataTables_scrollFoot #totalProfit').html("<strong>Total Profit: <span style='color:green'>" + accounting.formatMoney(total_profit) + "</span></strong>");
    }
});

$("#salesForm").on("submit", function (e) {
    e.preventDefault();
    var data = {
        salesItem: $(".salesItem").val(),
        salesPurchasedFrom: $(".salesPurchasedFrom").val(),
        salesPurchasePrice: $(".salesPurchasePrice").val(),
        salesColor: $(".salesColor").val(),
        salesSize: $(".salesSize").val(),
        salesQuantity: $(".salesQuantity").val(),
        salesPurchaseDate: $(".salesPurchaseDate").val(),
        salesSoldDate: $(".salesSoldDate").val(),
        salesSoldPrice: $(".salesSoldPrice").val(),
        profit: $(".salesSoldPrice").val() - $(".salesPurchasePrice").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./sales",
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (e) {
            $('#salesAddModal').modal('toggle');
            $("#salesForm").trigger('reset');
            $('#sales').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});


sales_table
    .on('select', function (e, dt, type, indexes) {
        var data = sales_table.rows(indexes).data().toArray()[0];
        var id = data._id;
        $(".salesID").val(id);
        $(".editSalesItem").val(data.item);
        $(".editSalesPurchasedFrom").val(data.purchased_from);
        $(".editSalesPurchasePrice").val(data.purchase_price);
        $(".editSalesColor").val(data.color);
        $(".editSalesSize").val(data.size);
        $(".editSalesQuantity").val(data.quantity);
        $(".editSalesPurchaseDate").val(data.purchase_date);
        $(".editSalesSoldDate").val(data.sold_date);
        $(".editSalesSoldPrice").val(data.sold_price);
        $("#salesDeleteButton").val(id);
        $(".unsold").val(id);
        $(".duplicateSales").val(id);
    })
    .on('deselect', function (e, dt, type, indexes) {
        $(".salesID").val("");
        $(".editSalesItem").val("");
        $(".editSalesPurchasedFrom").val("");
        $(".editSalesPurchasePrice").val("");
        $(".editSalesColor").val("");
        $(".editSalesSize").val("");
        $(".editSalesQuantity").val("");
        $(".editSalesPurchaseDate").val("");
        $(".editSalesSoldDate").val("");
        $(".editSalesSoldPrice").val("");
        $("#salesDeleteButton").val("");
        $(".unsold").val("");
        $(".duplicateSales").val("");
    });

$("#salesEditButton").on("click", function () {
    $("#salesEditModal").modal("show");
});

$("#salesEditForm").on("submit", function (e) {
    e.preventDefault();
    var user_data = {
        salesID: $(".salesID").val(),
        editSalesItem: $(".editSalesItem").val(),
        editSalesPurchasedFrom: $(".editSalesPurchasedFrom").val(),
        editSalesPurchasePrice: $(".editSalesPurchasePrice").val(),
        editSalesColor: $(".editSalesColor").val(),
        editSalesSize: $(".editSalesSize").val(),
        editSalesQuantity: $(".editSalesQuantity").val(),
        editSalesPurchaseDate: $(".editSalesPurchaseDate").val(),
        editSalesSoldDate: $(".editSalesSoldDate").val(),
        editSalesSoldPrice: $(".editSalesSoldPrice").val()
    };
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./sales-edit",
        data: JSON.stringify(user_data),
        dataType: 'json',
        success: function (e) {
            $('#salesEditModal').modal('toggle');
            $("#salesEditForm").trigger('reset');
            $('#sales').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

$("#salesDeleteButton").on("click", function () {
    var delete_id = { salesDeleteButton: $("#salesDeleteButton").val() }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./delete-sales",
        data: JSON.stringify(delete_id),
        dataType: 'json',
        success: function (e) {
            $('#sales').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

$(".duplicateSales").on("click", function () {
    var duplicate_data = {
        duplicateSales: $(".duplicateSales").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./duplicate-sales",
        data: JSON.stringify(duplicate_data),
        dataType: 'json',
        success: function (e) {
            $('#sales').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })

});
$(".unsold").on("click", function () {
    var data = {
        unsold: $(".unsold").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./unsold",
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (e) {
            $('#sales').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});

var expenses_table = $("#expenses").DataTable({
    "paging": false,
    "order": [[1, "asc"], [2, "asc"]],
    "ajax": "api/expenses",
    "preDrawCallback": function (settings) {
        pageScrollPos = $('div.dataTables_scrollBody').scrollTop();
    },
    "drawCallback": function (settings) {
        $('div.dataTables_scrollBody').scrollTop(pageScrollPos);
    },
    "columns": [
        { "data": "_id" },
        { "data": "item" },
        { "data": "purchased_from" },
        { "data": "purchase_price", render: $.fn.dataTable.render.number(',', '.', 2, '$') },
        { "data": "purchase_date" }
    ],
    "columnDefs": [
        {
            "targets": [0],
            "visible": false,
            "searchable": false
        }
    ],
    "info": true,
    "rowId": "_id",
    "select": { style: "single" },
    "responsive": true,
    "retrieve": true,
    "scrollY": 600,
    "deferRender": true,
    "scroller": true,
    "autoWidth": false,
    "language": {
        "emptyTable": "<div><img src='https://ouch-cdn.icons8.com/preview/959/94ded397-fd13-4b9c-9e6d-5ab45154d716.png' style='height:480px; weight:250px;'><div style='height: 95px;'>There are currently no items in your expenses.</div></div>"
    },
    "footerCallback": function (row, data, start, end, display) {
        var api = this.api(), data;
        var intVal = function (i) {
            return typeof i === 'string' ?
                i.replace(/[\$,]/g, '') * 1 :
                typeof i === 'number' ?
                    i : 0;
        };
        total_expenses = api
            .column(3, { search: 'applied' })
            .data()
            .reduce(function (a, b) {
                return intVal(a) + intVal(b);
            }, 0);

        $('div.dataTables_scrollFoot #totalExpenses').html("<strong>Total Expenses: <span style='color:red'>" + accounting.formatMoney(total_expenses) + "</span></strong>");
    }
});

$("#expensesForm").on("submit", function (e) {
    e.preventDefault();
    var data = {
        expenseItem: $(".expenseItem").val(),
        expensePurchasedFrom: $(".expensePurchasedFrom").val(),
        expensePurchasePrice: $(".expensePurchasePrice").val(),
        expensePurchaseDate: $(".expensePurchaseDate").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./expenses",
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (e) {
            $('#expensesAddModal').modal('toggle');
            $("#expensesForm").trigger('reset');
            $('#expenses').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
})

expenses_table
    .on('select', function (e, dt, type, indexes) {
        var data = expenses_table.rows(indexes).data().toArray()[0];
        var id = data._id;
        $(".expensesID").val(id);
        $(".editExpensesItem").val(data.item);
        $(".editExpensesPurchasedFrom").val(data.purchased_from);
        $(".editExpensesPurchasePrice").val(data.purchase_price);
        $(".editExpensesPurchaseDate").val(data.purchase_date);
        $(".expensesDeleteButton").val(id);
        $(".duplicateExpenses").val(id);
    })
    .on('deselect', function (e, dt, type, indexes) {
        $(".expensesID").val("");
        $(".editExpensesItem").val("");
        $(".editExpensesPurchasedFrom").val("");
        $(".editExpensesPurchasePrice").val("");
        $(".editExpensesPurchaseDate").val("");
        $(".expensesDeleteButton").val("");
        $(".duplicateExpenses").val("");
    });

$("#expensesEditButton").on("click", function () {
    $("#expensesEditModal").modal("show");
});

$("#expensesEditForm").on("submit", function (e) {
    e.preventDefault();
    var user_data = {
        expensesID: $(".expensesID").val(),
        editExpensesItem: $(".editExpensesItem").val(),
        editExpensesPurchasedFrom: $(".editExpensesPurchasedFrom").val(),
        editExpensesPurchasePrice: $(".editExpensesPurchasePrice").val(),
        editExpensesPurchaseDate: $(".editExpensesPurchaseDate").val()
    };
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./expenses-edit",
        data: JSON.stringify(user_data),
        dataType: 'json',
        success: function (e) {
            $('#expensesEditModal').modal('toggle');
            $("#expensesEditForm").trigger('reset');
            $('#expenses').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});


$(".expensesDeleteButton").on("click", function () {
    var delete_id = {
        expensesDeleteButton: $(".expensesDeleteButton").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./delete-expenses",
        data: JSON.stringify(delete_id),
        dataType: 'json',
        success: function (e) {
            $('#expenses').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});
$(".duplicateExpenses").on("click", function () {
    var duplicate_data = {
        duplicateExpenses: $(".duplicateExpenses").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "./duplicate-expenses",
        data: JSON.stringify(duplicate_data),
        dataType: 'json',
        success: function (e) {
            $('#expenses').DataTable().ajax.reload();
        },
        error: function (request, status, error) {
            console.log(error);
        }
    })
});


//Redraws column width when tabs are clicked
$(document).ready(function () {
    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
    });
});


$('.nav-pills a').click(function (e) {
    $(this).tab('show');
});

$("#inventoryAddModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#inventoryEditModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#salesAddModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#salesEditModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#expensesAddModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#expensesEditModal").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});

$("#markSold").on("shown.bs.modal", function () {
    $(this).find('[autofocus]').focus();
});


$('#inventoryPurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#editInventoryPurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#markSoldDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#salesPurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#salesSoldDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#editSalesPurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#editSalesSoldDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#expensePurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#editExpensesPurchaseDate').datetimepicker({
    format: 'L',
    keyBinds: {
        enter: false,
        t: false
    }
});

$('#inventoryAddModal').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
});


$('#markSold').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
});

$('#salesAddModal').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
});

$('#expensesAddModal').on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
});


