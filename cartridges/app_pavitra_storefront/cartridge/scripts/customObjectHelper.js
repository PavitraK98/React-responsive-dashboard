"use strict";

var customObjectMgr = require("dw/object/CustomObjectMgr");
var Transaction = require("dw/system/Transaction");


function createCustomObject(objID, keyValue, userDetails) {
  var createdOrUpdatedObject;
  var objectType;

  Transaction.wrap(function () {
    var existingObject = customObjectMgr.getCustomObject(objID, keyValue);

    if (!existingObject) {
      var newObject = customObjectMgr.createCustomObject(objID, keyValue);
      newObject.custom.firstName = userDetails.firstName;
      newObject.custom.lastName = userDetails.lastName;
      newObject.custom.sendPromotionalUpdates =
        userDetails.isSubscribedForEmailAlerts;

      createdOrUpdatedObject = newObject;
      objectType = "newObject";
    } else {
      existingObject.custom.firstName = userDetails.firstName;
      existingObject.custom.lastName = userDetails.lastName;
      existingObject.custom.sendPromotionalUpdates =
        userDetails.isSubscribedForEmailAlerts;

      createdOrUpdatedObject = existingObject;
      objectType = "existingObject";
    }
  });

  return {
    createdOrUpdatedObject: createdOrUpdatedObject,
    objectType: objectType,
  };
}

module.exports = {
  createCustomObject: createCustomObject,
};