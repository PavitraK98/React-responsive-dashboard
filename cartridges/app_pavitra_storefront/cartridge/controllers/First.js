"use strict";

var server = require("server");

var ArrayList = require("dw/util/ArrayList");
var productMgr = require("dw/catalog/ProductMgr");
var catalogMgr = require("dw/catalog/CatalogMgr");
var request = require("dw/system/Request");
var Cookie = require("dw/web/Cookie");


// The root is - /First-Test1
server.get("Test1", function (req, res, next) {
  var productDetails = new ArrayList();
  productDetails.push(productMgr.getProduct("abc001"));

  //can render to path both productCards and productTable
  res.render("First/productCards", { productDetails: productDetails });
  next();
});

// The root is - /First-Test2
server.get("Test2", function (req, res, next) {
  var productDetails = new ArrayList();
  var productListHelper = require('../scripts/modules1');
  const productIDs = productListHelper.getProductList();
  var product = productIDs.map((a) => productMgr.getProduct(a));
  productDetails.push(product);

  //can render to path both productCards and productTable
  res.render("First/productTable", { productDetails });
  next();
});

// The root is - /First-Test3
server.get("Test3", function (req, res, next) {
  var catagoryDetails = new ArrayList();
  var cat1 = catalogMgr.getCategory("MyCollection");
  catagoryDetails.push(cat1);

  res.render("First/catalogDetails", { catagoryDetails: catagoryDetails });
  next();
});

// The root is /First-Test4
server.get("Test4", function (req, res, next) {
  var productDetails = new ArrayList();
  var productListHelper = require('../scripts/modules1');
  const productIDs = productListHelper.getProductList();

  for (var i = 0; i < productIDs.length; i++) {
    var product = productMgr.getProduct(productIDs[i]);
    if (product) {
      var productData = {
        id: product.getID(),
        name: product.getName(),
        brand: product.getBrand(),
        price: product.priceModel.price.value,
      };
      productDetails.add(productData);
    }
  }

  res.render("First/invokeCustomTag", { productDetails: productDetails });
  next();
});

// The root is /First-Test5
server.get("Test5", function (req, res, next) {
  res.render("First/invokeRedirect");
  next();
});

// The root is /First-Test6
server.get("Test6", function (req, res, next) {
  res.render("First/invokeInclude");
  next();
});

// The root is /First-Test7
server.get("Test7", function (req, res, next) {
  var productDetails = new ArrayList();
  var productListHelper = require('../scripts/modules1');
  const productIDs = productListHelper.getProductList();
  productDetails.push(productIDs.map((a) => productListHelper.getProductDetails(a)));

  res.render("First/productDetails1", { productDetails: productDetails });
  next();
})

// The root is /First-Test8
server.get("Test8", function (req, res, next) {
  var productDetails = new ArrayList();
  var productListHelper = require('../scripts/modules1');
  var productIDs =['perfume1', 'perfume2', 'perfume3', 'perfume4', 'perfume5', 'perfume6', 'perfume7', 'perfume8'];
  var pd = req.querystring.productIdsList;
  productDetails.push(productIDs.map((a) => productListHelper.getProductDetails(a)));

// var productTailUrl =  URLUtils.url('Product-Show').toString() + '?pid=' + readCookieValue.toString()
  res.setViewData({productDetails});
  res.render("Product123/invokeProductMiniCards");
  next();
})




module.exports = server.exports();
