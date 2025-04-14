"use strict";

var server = require("server");
var URLUtils = require("dw/web/URLUtils");
var ArrayList = require("dw/util/ArrayList");
var HookManager = require('dw/system/HookMgr');


//The root is -/Second-Show1
server.get("Show1", function (req, res, next) {
  var productDetails = new ArrayList();
  var productDetailsNon = new ArrayList();
  var productListHelper = require("../scripts/modules1");

  var productIDs = [
    "women_product02",
    "satya_product_bundle-1",
    "SpringLooksM",
    "25502683M",
    "nikon-d60-wlensM",
    "sony-kdl-46xbr8M",
    "apple-ipod-nano-purple-8gM",
  ];

  var products = productIDs.map((id) =>
    productListHelper.getProductDetails(id)
  );

  products.forEach((item) => {
    if (item.online === true && item.searchable === true) {
      productDetails.push(item);
    } else if (item.online === false || item.searchable === false) {
      productDetailsNon.push(item);
    }
  });

  if (productDetailsNon.length > 0) {
    res.render("Product123/errorProduct", { productDetailsNon });
  } else {
    res.render("Product123/availableProducts", { productDetails });
  }
  next();
});

//The root is -/Second-Show2
server.get("Show2", function (req, res, next) {
  var customObjectMgr = require("dw/object/CustomObjectMgr");
  var systemObjectMgr = require("dw/object/SystemObjectMgr");
  var txn = require("dw/system/Transaction");

  txn.wrap(function () {
    var obj1 = customObjectMgr.getCustomObject(
      "EmailSubscription_p",
      "pavitra111@gmail.com"
    );
    if (!obj1) {
      // var updateObj = customObjectMgr.createCustomObject('EmailSubscription_p', 'pavitra111@gmail.com');
      obj1.custom.firstName = "Pavitraaa";
      obj1.custom.lastName = "Kkk";
      obj1.custom.gender = "Female";
      obj1.custom.sendPromotionalUpdates = true;
    }
    return "error";
  });

  const emailObject1 = customObjectMgr.getCustomObject(
    "EmailSubscription_p",
    "pavitra111@gmail.com"
  );
  const emailObject2 = customObjectMgr.getCustomObject(
    "EmailSubscription_p",
    "user124332@gmail.com"
  );

  res.json({
    emailObject1,
    emailObject2,
  });
  next();
});

//The root is -/Second-SiteShow
server.get("SiteShow", function (req, res, next) {
  var productsList = new ArrayList();
  var productListHelper = require("../scripts/modules1");
  var sitePreferenceHelper = require("../scripts/getSitePreferenceHelper");
  var currentSiteProductList = sitePreferenceHelper.getSitePreference("productsList_p");

  var products = currentSiteProductList.map((id) =>
    productListHelper.getProductDetails(id)
  );

  var result = products.forEach((item) => {
    if (item.online === true) {
      var detail = {
        "ID": item.id,
        "Name": item.name,
        "Color": item.color
      }
      return productsList.push(detail);
    } else{
      return null;
    }
  });

  res.render('Product123/availableSitePreferenceProducts', { productsList: productsList });
  // res.json({currentSiteProductList, productsList});
  next();
});

//The root is -/Second-Assign27
server.get("Assign27", function (req, res, next) {
  res.render('components/Assign27PidCookie');
  next();
});


server.get("Show3", function(req, res, next){
  var readCookieValue = request.httpCookies['ProductID'].getValue();
  var validateHook = HookManager.hasHook("dw.system.request.OnSession");

  if(validateHook){
    var resHook = HookManager.callHook("dw.system.request.OnSession", "OnSession", readCookieValue);
  }

  if(resHook.status === 'success'){
    res.redirect(URLUtils.url('Product-Show').toString() + '?pid=' + readCookieValue.toString());
  }else{
    res.redirect(URLUtils.url('error/notFound').toString());
  }
  next();
});

module.exports = server.exports();
