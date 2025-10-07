"use strict";

var page = require("plugin_wishlists/cartridge/controllers/Wishlist");
var server = require("server");
server.extend(page);
var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');

/**
 * Add product to wishlist and set custom attribute iswishlisted = true
 */
server.append("AddProduct", function (req, res, next) {
    var viewData = res.getViewData();

    if(viewData.success){
        var productId = req.form.productId;
        var product = ProductMgr.getProduct(productId);
        if (product) {
            Transaction.wrap(function () {
                product.custom.iswishlisted = true;
            });
        }
    }
    next();
});

/**
 * Remove product from wishlist and set custom attribute iswishlisted = false
 */
server.append("RemoveProduct",function (req, res, next) {
    var viewData = res.getViewData();

    if(viewData.success){
        if (typeof productId === 'string') {
            var productId = req.form.productId;
            var product = ProductMgr.getProduct(productId);
            if (product) {
                Transaction.wrap(function () {
                    product.custom.iswishlisted = false;
                });
            }
        }
    }
    next();
});

module.exports = server.exports();
