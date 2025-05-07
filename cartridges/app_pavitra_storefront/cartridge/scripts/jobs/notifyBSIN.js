"use strict";
var Status = require("dw/system/Status");
var Transaction = require("dw/system/Transaction");
var customObjectMgr = require("dw/object/CustomObjectMgr");
var ProductInventoryMgr = require("dw/catalog/ProductInventoryMgr");

function notifyBSIN(args) {
  var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");

  var inventoryThreshold = args.InventoryThreshold;
  var allExistingRecordsOfObject =
    customObjectMgr.getAllCustomObjects("NotifyBINS_p");

  while (allExistingRecordsOfObject.hasNext()) {
    var record = allExistingRecordsOfObject.next();
    var productID = record.custom.productID;

    var inventoryRecord =
      ProductInventoryMgr.getInventoryList("inventory_m").getRecord(productID);

    if (inventoryRecord.ATS.value > inventoryThreshold) {
      try {
        var emailDetails = {
          to: record.custom.emailAddress,
          from: "noreply@yourdomain.com",
          subject: "Item Back In Stock: " + productID,
        };
        var emailContext = {
          ProductID: productID,
        };
        var emailTemplate = 'Product123/emailTemplateBSIN';
        //emailHelpers.sendEmail(emailObj, 'account/password/passwordChangedEmail', objectForEmail);
        emailHelpers.sendEmail(emailDetails, emailTemplate, emailContext);
        customObjectMgr.remove(record);
      } catch (e) {
        Logger.info(
          "Email send failed for product ID {0}: {1}",
          productID,
          e.message
        );
        return new Status(Status.ERROR);
      }
    }
  }
  return new Status(Status.OK);
}

module.exports.notifyBSIN = notifyBSIN;
