"use strict";

var page = require("app_storefront_base/cartridge/controllers/Cart");
var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var csrfProtection = require("*/cartridge/scripts/middleware/csrf");
var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
var UUIDUtils = require("dw/util/UUIDUtils");
var server = require("server");
server.extend(page);

server.replace("AddProduct", server.middleware.post, function (req, res, next) {
  var BasketMgr = require("dw/order/BasketMgr");
  var Resource = require("dw/web/Resource");
  var URLUtils = require("dw/web/URLUtils");
  var Transaction = require("dw/system/Transaction");
  var CartModel = require("*/cartridge/models/cart");
  var ProductLineItemsModel = require("*/cartridge/models/productLineItems");
  var cartHelper = require("*/cartridge/scripts/cart/cartHelpers");
  var basketCalculationHelpers = require("*/cartridge/scripts/helpers/basketCalculationHelpers");

  var currentBasket = BasketMgr.getCurrentOrNewBasket();
  var previousBonusDiscountLineItems =
    currentBasket.getBonusDiscountLineItems();
  var productId = req.form.pid;
  var childProducts = Object.hasOwnProperty.call(req.form, "childProducts")
    ? JSON.parse(req.form.childProducts)
    : [];
  var options = req.form.options ? JSON.parse(req.form.options) : [];
  var quantity;
  var result;
  var pidsObj;

  var getDonationUserDetailsMetaData = server.forms.getForm(
    "donationUserDetails"
  );
  var donationUserDetails = {
    firstName: getDonationUserDetailsMetaData.user.firstname.value,
    lastName: getDonationUserDetailsMetaData.user.lastname.value,
    email: getDonationUserDetailsMetaData.user.email.value,
    amount: getDonationUserDetailsMetaData.user.amount.value,
    productId: req.form.pid,
    userUUID: UUIDUtils.createUUID(),
  };

  if (currentBasket) {
    var existingDonationPLI = null;
    var allProductLineItems = currentBasket.getProductLineItems();

    // Check if donation_p is already in the cart
    var collections = require("*/cartridge/scripts/util/collections");
    collections.forEach(allProductLineItems, function (pli) {
      if (pli.productID === "donation_p") {
        existingDonationPLI = pli;
      }
    });

    // If donation_p already exists in the cart and quantity is more than 0
    if (
      productId === "donation_p" &&
      existingDonationPLI &&
      existingDonationPLI.quantity.value > 0
    ) {
      res.json({
        error: true,
        message: "Product already present in cart",
        quantityTotal: ProductLineItemsModel.getTotalQuantity(
          currentBasket.productLineItems
        ),
      });
      return next();
    }

    Transaction.wrap(function () {
      if (!req.form.pidsObj) {
        if (productId === "donation_p") {
          var isExistingDonationUserObject = CustomObjectMgr.getCustomObject(
            "donationUser_P",
            donationUserDetails.userUUID
          );
          if (!isExistingDonationUserObject) {
            var donationUserObject = CustomObjectMgr.createCustomObject(
              "donationUser_P",
              donationUserDetails.userUUID
            );
            donationUserObject.custom.userFirstname =
              donationUserDetails.firstName;
            donationUserObject.custom.userLastname =
              donationUserDetails.lastName;
            donationUserObject.custom.userEmail = donationUserDetails.email;
            donationUserObject.custom.userDonationAmount =
              donationUserDetails.amount;
          } else {
            Logger.error(
              "Error in creating donation user details : " + e.message
            );
          }
          quantity = 1;
          result = cartHelper.addProductToCart(
            currentBasket,
            productId,
            quantity,
            childProducts,
            options,
            donationUserDetails
          );
        } else {
          quantity = parseInt(req.form.quantity, 10);
          result = cartHelper.addProductToCart(
            currentBasket,
            productId,
            quantity,
            childProducts,
            options,
            donationUserDetails
          );
        }
      } else {
        // product set
        pidsObj = JSON.parse(req.form.pidsObj);
        result = {
          error: false,
          message: Resource.msg("text.alert.addedtobasket", "product", null),
        };

        pidsObj.forEach(function (PIDObj) {
          quantity = parseInt(PIDObj.qty, 10);
          var pidOptions = PIDObj.options ? JSON.parse(PIDObj.options) : {};
          var PIDObjResult = cartHelper.addProductToCart(
            currentBasket,
            PIDObj.pid,
            quantity,
            childProducts,
            pidOptions,
            donationUserDetails
          );
          if (PIDObjResult.error) {
            result.error = PIDObjResult.error;
            result.message = PIDObjResult.message;
          }
        });
      }
      if (!result.error) {
        cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
        basketCalculationHelpers.calculateTotals(currentBasket);
      }
    });
  }

  var quantityTotal = ProductLineItemsModel.getTotalQuantity(
    currentBasket.productLineItems
  );
  var cartModel = new CartModel(currentBasket);

  var urlObject = {
    url: URLUtils.url("Cart-ChooseBonusProducts").toString(),
    configureProductstUrl: URLUtils.url("Product-ShowBonusProducts").toString(),
    addToCartUrl: URLUtils.url("Cart-AddBonusProducts").toString(),
  };

  var newBonusDiscountLineItem = cartHelper.getNewBonusDiscountLineItem(
    currentBasket,
    previousBonusDiscountLineItems,
    urlObject,
    result.uuid
  );

  if (newBonusDiscountLineItem) {
    var allLineItems = currentBasket.allProductLineItems;
    var collections = require("*/cartridge/scripts/util/collections");
    collections.forEach(allLineItems, function (pli) {
      if (pli.UUID === result.uuid) {
        Transaction.wrap(function () {
          pli.custom.bonusProductLineItemUUID = "bonus"; // eslint-disable-line no-param-reassign
          pli.custom.preOrderUUID = pli.UUID; // eslint-disable-line no-param-reassign
        });
      }
    });
  }

  var reportingURL = cartHelper.getReportingUrlAddToCart(
    currentBasket,
    result.error
  );

  res.json({
    reportingURL: reportingURL,
    quantityTotal: quantityTotal,
    message: result.message,
    cart: cartModel,
    newBonusDiscountLineItem: newBonusDiscountLineItem || {},
    error: result.error,
    pliUUID: result.uuid,
    minicartCountOfItems: Resource.msgf(
      "minicart.count",
      "common",
      null,
      quantityTotal
    ),
  });
  next();
});

module.exports = server.exports();
