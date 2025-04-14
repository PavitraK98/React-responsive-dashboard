"use strict";

var server = require('server');
var ArrayList = require("dw/util/ArrayList");

// The root is - /GetProductDetails-Show
server.get("Show", function(req, res, next){
    // Item No. 25502608M
    var productDetails = new ArrayList();
    var productHelper = require('../scripts/modules1');
    var productID = req.querystring.pid;
    var product = productHelper.getProductDetails(productID);
    productDetails.push(product);

    if(productID.length > 0){
        res.render("Product123/invokePDP", {ProductDetails: productDetails});
    }else{
        res.render("Home/homePage");
    }
    next();
})

module.exports = server.exports();