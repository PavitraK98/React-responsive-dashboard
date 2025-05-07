"use strict";

var server = require("server");
var HTTPClient = require("dw/net/HTTPClient");
var Status = require("dw/system/Status");

// The root is - /RestCall-Show
server.get("Show", function (req, res, next) {
  var productHelper = require("../scripts/modules1");
  var productID = req.querystring.pid;

  if (!productID || productID === "" || productID === null) {
    res.json({
      Error: "Something wrong with pid / product ID not found."
    });
    return next();
  }
  var product = productHelper.getProductDetails(productID);
  res.json({ product });
  next();
});

// The root is - /RestCall-Service
server.get("Service", function (req, res, next) {
  var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
  var svc = LocalServiceRegistry.createService("app_pavitra_storefront.https.product.get",
    {
      createRequest: function (svc, params) {
        svc = svc.setRequestMethod("GET");
        // svc = svc.addParam('pid', param.pid);
        svc.setURL(svc.getURL() + "?pid=" + params.pid);
        return "";
      },
      parseResponse: function (svc, response) {
        return response;
      },
    }
  );
  var result = svc.call({ pid: req.querystring.pid });
  if (result.isOk()) {
    var resultObj = result.object.getText();
    res.render("Third/productTable", {
      data: JSON.parse(resultObj),
    });
  } else {
    res.json({
      Error: result.getErrorMessage(),
    });
  }
  next();
});

module.exports = server.exports();
