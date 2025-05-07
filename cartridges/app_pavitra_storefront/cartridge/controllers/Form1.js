"use strict";

var server = require("server");
var URLUtils = require("dw/web/URLUtils");
var productMgr = require("dw/catalog/ProductMgr");
var csrfProtection = require("*/cartridge/scripts/middleware/csrf");

// The root is - /Form1-Show1
server.get("Show1", function (req, res, next) {
  server.forms.getForm("userDetails").clear();
  var userDetailsMetaData = server.forms.getForm("userDetails");
  var submitURL = URLUtils.url("Form1-Submit1");

  res.render("Form/detailsForm", {
    submitURL: submitURL,
    userDetailsMeta: userDetailsMetaData,
  });
  next();
});

// The root is - /Form1-Submit1
server.post("Submit1", function (req, res, next) {
  var userDetailsMeta = server.forms.getForm("userDetails");

  var userDetails = {
    firstName: userDetailsMeta.user.firstname.value,
    lastName: userDetailsMeta.user.lastname.value,
    email: userDetailsMeta.user.email.value,
    phone: userDetailsMeta.user.phone.value,
    address: userDetailsMeta.user.add.address.value,
  };

  if (userDetailsMeta.valid) {
    res.render("Form/formOutput", {
      userDetails: userDetails,
    });
  }
  return next();
});

// The root is - /Form1-Show2
server.get("Show2", function (req, res, next) {
  var submitURL = URLUtils.url("Form1-Submit2");

  res.render("Form/productStockForm", { submitURL: submitURL });
  next();
});

// The root is - /Form1-Submit2
server.post("Submit2", function (req, res, next) {
  var productID = req.form.productID;
  var quantity = parseInt(req.form.quantity, 10);
  var product = productMgr.getProduct(productID);
  var stat = false;

  if (product) {
    var availableStock = product.availabilityModel.inventoryRecord
      ? product.availabilityModel.inventoryRecord.ATS.value
      : 0;

    if (availableStock === quantity) {
      stat = true;
    }
  }

  res.render("Form/displayStockMsg", {
    productID: productID,
    quantity: quantity,
    status: {
      In_Stock: stat,
    },
  });

  return next();
});

// The root is - /Form1-Show3
server.get("Show3", function (req, res, next) {
  var submitURL = URLUtils.url("Form1-Submit3");

  res.render("Form/subscribeForm", { submitURL: submitURL });
  next();
});

// The root is - /Form1-Submit3
server.post("Submit3", function (req, res, next) {
  var Logger = require("dw/system/Logger");
  var customObjectHelper = require("../scripts/customObjectHelper");
  var triggerEmailHelper = require("../scripts/triggerSendEmail");

  var userDetails = {
    firstName: req.form.firstName,
    lastName: req.form.lastName,
    email: req.form.email,
    isSubscribedForEmailAlerts: req.form.subscribe ? true : false,
  };

  try {
    var result = customObjectHelper.createCustomObject(
      "EmailSubscription_p",
      userDetails.email,
      userDetails
    );

    if (result.objectType === "newObject") {
      if (
        result.createdOrUpdatedObject.custom.sendPromotionalUpdates === true
      ) {
        var emailTemplate = "components/emailContainer";
        triggerEmailHelper.triggerSendEmail(userDetails, emailTemplate);
      }
    } else {
      Logger.warn(
        "Requesting subscription policy for a user with existing email-id: " +
          userDetails.email
      );
    }

    res.render("Form/displaySubscribeMsg", {
      message:
        "Thank you " +
        userDetails.firstName +
        " " +
        userDetails.lastName +
        " for submitting details",
    });
  } catch (e) {
    Logger.error("Error in subscription policy: " + e.message);
    res.render("error", { error: e.message });
  }
  next();
});

// The root is - /Form1-Show4
server.get("Show4", csrfProtection.generateToken, function (req, res, next) {
  var submitURL = URLUtils.url("Form1-Submit4");
  var userDetailsMetaData = server.forms.getForm("userDetails");
  userDetailsMetaData.clear();

  res.setViewData({
    submitURL: submitURL,
    userDetailsMeta: userDetailsMetaData,
  });
  res.render("Form/assign28Form");
  next();
});

//The root is - /Form1-Submit4
server.post(
  "Submit4",
  csrfProtection.validateAjaxRequest,
  function (req, res, next) {
    var userDetailsMeta = server.forms.getForm("userDetails");
    var triggerEmailHelper = require("../scripts/triggerSendEmail");

    var catWomensValue = userDetailsMeta.user.icWomens.value !== null ? userDetailsMeta.user.icWomens.value : '';
    var catMensValue = userDetailsMeta.user.icMens.value !== null ? userDetailsMeta.user.icMens.value : '';
    var catElectronicsValue = userDetailsMeta.user.icElectronics.value !== null ? userDetailsMeta.user.icElectronics.value : '';

    var userDetails = {
      firstName: userDetailsMeta.user.firstname.value,
      lastName: userDetailsMeta.user.lastname.value,
      email: userDetailsMeta.user.email.value,
      dob: new Date(userDetailsMeta.user.dateofbirth.value),
      age: userDetailsMeta.user.age.value,
      gender: userDetailsMeta.user.gender.value,
      interestedcategories: [catWomensValue, catMensValue, catElectronicsValue].filter(item => item !== ''),
    };

    this.on("route:BeforeComplete", function (req, res) {
      var customUserObjectHelper = require("../scripts/customUserObjectHelper");
      var objectResult;

      var validateCustomObj = customUserObjectHelper.createCustomObject(
        "EmailSubscription2_p",
        userDetails.email,
        userDetails
      );

      if (validateCustomObj.objectType === "newObject") {
        var emailTemplate = "Form/emailTemplate";
        triggerEmailHelper.triggerSendEmail(userDetails, emailTemplate);
        var objectResult = {
          object : validateCustomObj,
          check: true,
          message:
            "Thank you " +
            userDetails.firstName +
            " " +
            userDetails.lastName +
            " for submitting details",
        };
      } else {
        var objectResult = {
          object : validateCustomObj,
          check: false,
          message:
            "A record already exists with given email ID " + userDetails.email,
        };
      }
      res.json({objectResult: objectResult});
      // res.setViewData({objectResult: objectResult});
      // res.render("Form/confirmationMsgSlot");
    });
    next();
  }
);

module.exports = server.exports();
