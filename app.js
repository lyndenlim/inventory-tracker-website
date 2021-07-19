require("dotenv").config();
const express = require("express");
const app = express();
const body_parser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passport_local_mongoose = require("passport-local-mongoose");
const accounting = require("./public/js/accounting")

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static("public"));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin:uaW22jH48pbmMzFy@cluster0.kblbc.mongodb.net/trackerDB", { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('returnOriginal', false);
mongoose.set("useCreateIndex", true);

const user_schema = new mongoose.Schema({
    email: String,
    password: String
});

user_schema.plugin(passport_local_mongoose);

const inventorysales_schema = {
    user: String,
    item: String,
    purchased_from: String,
    purchase_price: {
        type: Number,
        min: 0
    },
    color: String,
    size: String,
    quantity: {
        type: Number,
        min: 0
    },
    purchase_date: String,
    sold_date: String,
    sold_price: {
        type: Number,
        min: 0
    },
    profit: Number,
    currentSpent: Number

};

const expenses_schema = {
    user: String,
    item: String,
    purchased_from: String,
    purchase_price: {
        type: Number,
        min: 0
    },
    purchase_date: String
};


const Inventory = mongoose.model("inventory", inventorysales_schema);
const Sales = mongoose.model("sale", inventorysales_schema);
const Expenses = mongoose.model("expense", expenses_schema);
const User = mongoose.model("user", user_schema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(process.env.PORT || 3000, function () {
    console.log("Server successfully launched");
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", function (req, res) {
    res.render("landing.html")
})

app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, total: { $sum: { $multiply: ["$purchase_price", "$quantity"] } } } }
        ], function (err, math) {
            if (math.length < 1) {
                Expenses.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, purchase_price: { $sum: "$purchase_price" } } }
                ], function (err, result) {
                    if (result.length < 1) {
                        Sales.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, profit: { $sum: "$profit" } } }
                        ], function (err, data) {
                            if (data.length < 1) {
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: "$0.00", expenses: "$0.00", currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });
                                        });

                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: "$0.00", expenses: "$0.00", currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });
                                        });


                                    }
                                });
                            } else {
                                var profit = data[0].profit.toFixed(2)
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: "$0.00", currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: "$0.00", currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });

                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        var expenses = result[0].purchase_price.toFixed(2)
                        Sales.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, profit: { $sum: "$profit" } } }
                        ], function (err, data) {
                            if (data.length < 1) {
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: "$0.00", expenses: accounting.formatMoney(expenses), currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: "$0.00", expenses: accounting.formatMoney(expenses), currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });

                                        });

                                    }
                                });
                            } else {
                                var profit = data[0].profit.toFixed(2)
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: accounting.formatMoney(expenses), currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });

                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: accounting.formatMoney(expenses), currentSpent: "$0.00", sItems: sItems, graphExpenses: result });
                                            });
                                        });

                                    }
                                });

                            }

                        });
                    }
                });
            } else {
                var currentSpent = math[0].total.toFixed(2)
                Expenses.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, purchase_price: { $sum: "$purchase_price" } } }
                ], function (err, result) {
                    if (result.length < 1) {
                        Sales.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, profit: { $sum: "$profit" } } }
                        ], function (err, data) {
                            if (data.length < 1) {
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: "$0.00", expenses: "$0.00", currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: "$0.00", expenses: "$0.00", currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });

                                    }
                                });
                            } else {
                                var profit = data[0].profit.toFixed(2)
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: "$0.00", currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: "$0.00", currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        var expenses = result[0].purchase_price.toFixed(2)
                        Sales.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, profit: { $sum: "$profit" } } }
                        ], function (err, data) {
                            if (data.length < 1) {
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: "$0.00", expenses: accounting.formatMoney(expenses), currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: "$0.00", expenses: accounting.formatMoney(expenses), currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    }
                                });
                            } else {
                                var profit = data[0].profit.toFixed(2)
                                Inventory.aggregate([{$match :{user:`${req.user._id}`}}, { $group: { _id: null, quantity: { $sum: "$quantity" } } }
                                ], function (err, iItems) {
                                    if (iItems.length < 1) {
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: "0", sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: accounting.formatMoney(expenses), currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    } else {
                                        var iCount = iItems[0].quantity
                                        Sales.find({user: req.user._id}, function (err, sItems) {
                                            Expenses.find({user: req.user._id}, function (err, result) {
                                                res.render("dashboard.html", { iCount: iCount, sCount: sItems.length, profit: accounting.formatMoney(profit), expenses: accounting.formatMoney(expenses), currentSpent: accounting.formatMoney(currentSpent), sItems: sItems, graphExpenses: result });
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }


        });

    } else {
        res.redirect("/login")
    }
});

app.get("/inventory", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("inventory.html");
    } else {
        res.redirect("/login")
    }
});

app.get("/api/inventory", function (req, res) {
    if (req.isAuthenticated()) {
        Inventory.find({ user: req.user._id }, function (err, iItems) {
            res.json({ data: iItems });
        });
    } else {
        res.redirect("/login")
    }
});

app.get("/sales", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("sales.html")
    } else {
        res.redirect("/login")
    }
});

app.get("/api/sales", function (req, res) {
    if (req.isAuthenticated()) {
        Sales.find({ user: req.user._id }, function (err, sItems) {
            res.json({ data: sItems });
        });
    } else {
        res.redirect("/login")
    }
});

app.get("/expenses", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("expenses.html");
    } else {
        res.redirect("/login")
    }
});

app.get("/api/expenses", function (req, res) {
    if (req.isAuthenticated()) {
        Expenses.find({ user: req.user._id }, function (err, eItems) {
            res.json({ data: eItems });
        });
    } else {
        res.redirect("/login")
    }
});

app.get("/feecalculator", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("feecalculator.html");
    } else {
        res.redirect("/login")
    }
});


app.get("/register", function (req, res) {
    res.render("register.html");
});

app.get("/login", function (req, res) {
    res.render("login.html");
});

app.post("/inventory", function (req, res) {
    var inventory_item = req.body.inventoryItem.trim()
    var inventory_purchased_from = req.body.inventoryPurchasedFrom.trim()
    var inventory_purchase_price = Number(req.body.inventoryPurchasePrice).toFixed(2)
    var inventory_color = req.body.inventoryColor.trim()
    var inventory_size = req.body.inventorySize
    var inventory_quantity = Number(req.body.inventoryQuantity)
    var inventory_purchase_date = req.body.inventoryPurchaseDate.trim()
    var totalSpent = inventory_quantity * inventory_purchase_price
    var profit = 0 - totalSpent.toFixed(2)

    const inventoryItem = new Inventory({
        user: req.user._id,
        item: inventory_item,
        purchased_from: inventory_purchased_from,
        purchase_price: inventory_purchase_price,
        color: inventory_color,
        size: inventory_size,
        quantity: inventory_quantity,
        purchase_date: inventory_purchase_date,
        sold_date: "",
        sold_price: 0,
        profit: profit,
        currentSpent: totalSpent

    });

    inventoryItem.save();
    res.status(200).json("Success");
});

app.post("/sales", function (req, res) {
    var sales_item = req.body.salesItem.trim()
    var sales_purchased_from = req.body.salesPurchasedFrom.trim()
    var sales_purchase_price = Number(req.body.salesPurchasePrice).toFixed(2)
    var sales_color = req.body.salesColor.trim()
    var sales_size = req.body.salesSize
    var sales_quantity = req.body.salesQuantity
    var sales_purchase_total = (sales_purchase_price * sales_quantity).toFixed(2)
    var sales_purchase_date = req.body.salesPurchaseDate.trim()
    var sales_sold_date = req.body.salesSoldDate.trim()
    var sales_sold_price = Number(req.body.salesSoldPrice).toFixed(2)
    var sales_profit = (sales_sold_price - sales_purchase_total).toFixed(2)

    const salesItem = new Sales({
        user: req.user._id,
        item: sales_item,
        purchased_from: sales_purchased_from,
        purchase_price: sales_purchase_price,
        color: sales_color,
        size: sales_size,
        quantity: sales_quantity,
        purchase_date: sales_purchase_date,
        sold_date: sales_sold_date,
        sold_price: sales_sold_price,
        profit: sales_profit,
        currentSpent: sales_purchase_total
    });

    salesItem.save();
    res.status(200).json("Success");
});

app.post("/expenses", function (req, res) {
    var expense_item = req.body.expenseItem.trim()
    var expense_purchased_from = req.body.expensePurchasedFrom.trim()
    var expense_purchase_price = Number(req.body.expensePurchasePrice).toFixed(2)
    var expense_purchase_date = req.body.expensePurchaseDate.trim()

    const expenseItem = new Expenses({
        user: req.user._id,
        item: expense_item,
        purchased_from: expense_purchased_from,
        purchase_price: expense_purchase_price,
        purchase_date: expense_purchase_date
    });

    expenseItem.save();
    res.status(200).json("Success");
})


app.post("/inventory-edit", function (req, res) {
    var id = req.body.inventoryID
    var edit_item = req.body.editInventoryItem.trim()
    var edit_purchased_from = req.body.editInventoryPurchasedFrom.trim()
    var edit_price = Number(parseFloat(req.body.editInventoryPurchasePrice)).toFixed(2)
    var edit_color = req.body.editInventoryColor.trim()
    var edit_size = req.body.editInventorySize
    var edit_quantity = Number(req.body.editInventoryQuantity)
    var edit_purchase_date = req.body.editInventoryPurchaseDate.trim()
    var edit_total_price = (edit_price * edit_quantity).toFixed(2)

    Inventory.findOneAndUpdate({ _id: id }, {
        item: edit_item, purchased_from: edit_purchased_from, purchase_price: edit_price,
        color: edit_color, size: edit_size, quantity: edit_quantity, purchase_date: edit_purchase_date, currentSpent: edit_total_price
    }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});

app.post("/sales-edit", function (req, res) {
    var id = req.body.salesID
    var edit_item = req.body.editSalesItem.trim()
    var edit_purchased_from = req.body.editSalesPurchasedFrom.trim()
    var edit_price = Number(parseFloat(req.body.editSalesPurchasePrice)).toFixed(2)
    var edit_color = req.body.editSalesColor.trim()
    var edit_size = req.body.editSalesSize
    var edit_quantity = Number(req.body.editSalesQuantity)
    var edit_total_price = edit_price * edit_quantity
    var edit_purchase_date = req.body.editSalesPurchaseDate.trim()
    var edit_sold_date = req.body.editSalesSoldDate.trim()
    var edit_sold_price = Number(parseFloat(req.body.editSalesSoldPrice)).toFixed(2)
    var edit_profit = (edit_sold_price - edit_total_price).toFixed(2)

    Sales.findOneAndUpdate({ _id: id }, {
        item: edit_item, purchased_from: edit_purchased_from, purchase_price: edit_price,
        color: edit_color, size: edit_size, quantity: edit_quantity, purchase_date: edit_purchase_date, sold_date: edit_sold_date,
        sold_price: edit_sold_price, profit: edit_profit, currentSpent: edit_total_price
    }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});

app.post("/expenses-edit", function (req, res) {
    var id = req.body.expensesID
    var edit_item = req.body.editExpensesItem.trim()
    var edit_purchased_from = req.body.editExpensesPurchasedFrom.trim()
    var edit_price = Number(parseFloat(req.body.editExpensesPurchasePrice)).toFixed(2)
    var edit_purchase_date = req.body.editExpensesPurchaseDate.trim()

    Expenses.findOneAndUpdate({ _id: id }, {
        item: edit_item, purchased_from: edit_purchased_from, purchase_price: edit_price,
        purchase_date: edit_purchase_date
    }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});


app.post("/delete-inventory", function (req, res) {
    var selected = req.body.inventoryDeleteButton;
    Inventory.findOneAndDelete({ _id: selected }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});

app.post("/delete-sales", function (req, res) {
    var selected = req.body.salesDeleteButton;
    Sales.findOneAndDelete({ _id: selected }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});

app.post("/delete-expenses", function (req, res) {
    var selected = req.body.expensesDeleteButton;
    Expenses.findOneAndDelete({ _id: selected }, function (err, data) {
        if (!err) {
            res.status(200).json("Success");
        }
    });
});


app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard");
            })
        }
    })
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function () {

                res.redirect("/dashboard");
            });
        }
    });
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})

app.post("/sold", function (req, res) {
    var selected = req.body.soldID
    var sold_price = Number(req.body.markSoldPrice).toFixed(2)
    var sold_date = req.body.markSoldDate
    Inventory.findById(selected, function (err, foundItem) {        
        if (err) {
            console.log(err);
        } else {
            var profit = sold_price - (foundItem.purchase_price * foundItem.quantity).toFixed(2)
            Sales.findOneAndUpdate({ _id: selected }, {user: req.user._id,
                item: foundItem.item, purchased_from: foundItem.purchased_from,
                purchase_price: foundItem.purchase_price, color: foundItem.color, size: foundItem.size, quantity: foundItem.quantity,
                purchase_date: foundItem.purchase_date, sold_date: sold_date, sold_price: sold_price,
                profit: profit, currentSpent: foundItem.currentSpent
            }, { upsert: true, returnNewDocument: true }, function (err) {
                Inventory.findOneAndDelete({ _id: selected }, function (err, data) {
                    if (!err) {
                        res.status(200).json("Success");
                    } else {
                        console.log(err)
                    }
                });
            });
        }
    });
});

app.post("/unsold", function (req, res) {
    var selected = req.body.unsold
    Sales.findById(selected, function (err, foundItem) {
        if (err) {
            console.log(err);
        } else {
            var profit = 0 - (foundItem.quantity * foundItem.purchase_price).toFixed(2)
            Inventory.findOneAndUpdate({ _id: selected }, {user: req.user._id,
                item: foundItem.item, purchased_from: foundItem.purchased_from,
                purchase_price: foundItem.purchase_price, color: foundItem.color, size: foundItem.size, quantity: foundItem.quantity,
                purchase_date: foundItem.purchase_date, sold_date: "", sold_price: 0,
                profit: profit, currentSpent: foundItem.currentSpent
            }, { upsert: true, returnNewDocument: true }, function (err) {
                Sales.findOneAndDelete({ _id: selected }, function (err, data) {
                    if (!err) {
                        res.status(200).json("Success");
                    } else {
                        console.log(err)
                    }
                });
            });
        }
    });
});

app.post("/duplicate-inventory", function (req, res) {
    var selected = req.body.duplicateInventory
    Inventory.findById(selected, function (err, foundItem) {
        if (err) {
            console.log(err)
        } else {
            var profit = 0 - (foundItem.quantity * foundItem.purchase_price)
            var total_spent = foundItem.quantity * foundItem.purchase_price
            const inventoryItem = new Inventory({
                user: foundItem.user,
                item: foundItem.item,
                purchased_from: foundItem.purchased_from,
                purchase_price: foundItem.purchase_price,
                color: foundItem.color,
                size: foundItem.size,
                quantity: foundItem.quantity,
                purchase_date: foundItem.purchase_date,
                sold_date: "",
                sold_price: 0,
                profit: profit,
                currentSpent: total_spent
            });

            inventoryItem.save();
            res.status(200).json("Success");
        }
    })
})

app.post("/duplicate-sales", function (req, res) {
    var selected = req.body.duplicateSales
    Sales.findById(selected, function (err, foundItem) {
        if (err) {
            console.log(err)
        } else {
            var total_spent = foundItem.quantity * foundItem.purchase_price
            const salesItem = new Sales({
                user: foundItem.user,
                item: foundItem.item,
                purchased_from: foundItem.purchased_from,
                purchase_price: foundItem.purchase_price,
                color: foundItem.color,
                size: foundItem.size,
                quantity: foundItem.quantity,
                purchase_date: foundItem.purchase_date,
                sold_date: foundItem.sold_date,
                sold_price: foundItem.sold_price,
                profit: foundItem.profit,
                currentSpent: total_spent
            });

            salesItem.save();
            res.status(200).json("Success");
        }
    })
})

app.post("/duplicate-expenses", function (req, res) {
    var selected = req.body.duplicateExpenses
    Expenses.findById(selected, function (err, foundItem) {
        if (err) {
            console.log(err)
        } else {
            const expensesItem = new Expenses({
                user: foundItem.user,
                item: foundItem.item,
                purchased_from: foundItem.purchased_from,
                purchase_price: foundItem.purchase_price,
                purchase_date: foundItem.purchase_date
            });

            expensesItem.save();
            res.status(200).json("Success");
        }
    })
})

