"use strict";

var server = require("server");
var UUIDUtils = require("dw/util/UUIDUtils");
var Logger = require("dw/system/Logger");
var customObjectMgr = require("dw/object/CustomObjectMgr");
var Transaction = require("dw/system/Transaction");

server.post("Submit", function (req, res, next) {
  var getValue = {
    customerUUID: UUIDUtils.createUUID(),
    productID: req.form.productID,
    emailID: req.form.emailAddress,
  };

  var isExistingObject = customObjectMgr.getCustomObject(
    "NotifyBINS_p",
    getValue.customerUUID
  );

  try {
    if (!isExistingObject) {
      Transaction.wrap(function () {
        var newObject = customObjectMgr.createCustomObject(
          "NotifyBINS_p",
          getValue.customerUUID
        );
        newObject.custom.customerUUID = getValue.customerUUID;
        newObject.custom.emailAddress = getValue.emailID;
        newObject.custom.productID = getValue.productID;
      });

      res.json({
        success: true,
        message: "Thank you for subscribing. We will notify you when product is available."
      });
    } else {
      res.json({
        success: false,
        message: "You are already subscribed for notifications!"
      });
    }
  } catch (e) {
    Logger.error("Error in ProductBINS-Submit: " + e.message);
    res.json({
      success: false,
      message: "An error occurred. Please try again later."
    });
  }

  next();
});

module.exports = server.exports();
