"use strict";

var server = require("server");
var Status = require("dw/system/Status");
var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var Transaction = require("dw/system/Transaction");
var Logger = require('dw/system/Logger');

function isCardExpired(expMonth, expYear) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  return expYear === currentYear && expMonth < currentMonth;
}

// The root is - /CheckCardDetails-Show
server.post("Show", function (req, res, next) {
  var paymentDetails = JSON.parse(req.body);
  var allObjects = CustomObjectMgr.getAllCustomObjects("CCAccountsPavitra");

  try {
    while (allObjects.hasNext()) {
      var walletObject = allObjects.next();

      var checkCardNum =  walletObject.custom.ccNumber.toString().slice(-4) ===
      paymentDetails.cardNumber;
      var checkExpMonth =  walletObject.custom.ccExpMonth === paymentDetails.expirationMonth;
      var checkExpYear =  walletObject.custom.ccExpYear === paymentDetails.expirationYear;


      if (checkCardNum && checkExpMonth && checkExpYear) {
        var checkExpiry =  isCardExpired(paymentDetails.expirationMonth, paymentDetails.expirationYear)
        if (!checkExpiry) {
          if(walletObject.custom.ccBalance > paymentDetails.paymentAmount){
            Transaction.wrap(function () {
              walletObject.custom.ccBalance = walletObject.custom.ccBalance - paymentDetails.paymentAmount;
              res.json({
                success: true,
                message: "Amount deducted from CO wallat",
              });
              return next();
            });
          }
          res.json({
            success: false,
            message:
              "Insufficient balance",
          });
          return next();
        }
        res.json({
          success: false,
          message:"Card expired.",
        });
      }
      Logger.error("Error in CO wallet details not matching: " + e.message);
      res.json({
        success: false,
        message:
          "An error occurred. Error in CO wallet details not matching. Please try again later.",
      });
      return next();
    }
  } catch (e) {
    Logger.error("Error in transaction using CO wallet details: " + e.message);
    res.json({
      success: false,
      message: "Error in transaction using CO wallet details.",
    });
    return next();
  }
  return next();
});

module.exports = server.exports();
