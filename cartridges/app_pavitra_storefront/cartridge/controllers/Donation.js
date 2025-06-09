"use strict";

var server = require("server");
var URLUtils = require("dw/web/URLUtils");


// The root is - /Donation-Show
server.get("Show", function (req, res, next) {
  server.forms.getForm("donationUserDetails").clear();
  var userDetailsMetaData = server.forms.getForm("donationUserDetails");
  var sitePreferenceHelper = require("../scripts/getSitePreferenceHelper");
  var currentSiteDonationProductID = sitePreferenceHelper.getSitePreference("donationProductID");
  var redirectURL = URLUtils.url('Cart-Show');
  var addToCartUrl = URLUtils.url('Cart-AddProduct');

  res.render("Donation/form", {
    addToCartUrl: addToCartUrl,
    redirectURL: redirectURL,
    userDetailsMeta: userDetailsMetaData,
    productID: currentSiteDonationProductID,
  });
  next();
});

module.exports = server.exports();
