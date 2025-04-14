"use strict";

var server = require("server");
var Cookie = require("dw/web/Cookie");
var productMgr = require("dw/catalog/ProductMgr");
var ArrayList = require("dw/util/ArrayList");

// The Route is /Cookie-Display
server.get("Display", function (req, res, next) {
    // fetch cookie value by id
    var product = new ArrayList();
    var getProductCookie = request.httpCookies['Product-ID'].getValue();
    product.push(productMgr.getProduct(getProductCookie));

    res.render('Components/productCookie', { product });
    next();
});

module.exports = server.exports();
