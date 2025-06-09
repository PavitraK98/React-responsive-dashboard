"use strict";

var server = require("server");
var ProductMgr = require("dw/catalog/ProductMgr");

server.get("Show", function (req, res, next) {
  var productID = req.querystring.pid;
  var product = ProductMgr.getProduct(productID);

  if (product) {
    var productDetails = {
      "ProductID": product.getID(),
      "Product Name": product.getName(),
      "Availability": product.availabilityModel.inventoryRecord.ATS.value,
      "List Price": product.priceModel.price.value,
    };
  }

  res.json({productDetails: productDetails});
  next();
});

module.exports = server.exports();
