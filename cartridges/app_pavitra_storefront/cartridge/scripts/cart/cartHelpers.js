"use strict";

var base = module.superModule;
var ProductMgr = require("dw/catalog/ProductMgr");
var Resource = require("dw/web/Resource");
var Transaction = require("dw/system/Transaction");
var URLUtils = require("dw/web/URLUtils");

var collections = require("*/cartridge/scripts/util/collections");
var ShippingHelpers = require("*/cartridge/scripts/checkout/shippingHelpers");
var productHelper = require("*/cartridge/scripts/helpers/productHelpers");
var arrayHelper = require("*/cartridge/scripts/util/array");
var BONUS_PRODUCTS_PAGE_SIZE = base.BONUS_PRODUCTS_PAGE_SIZE;

var updateBundleProducts = base.updateBundleProducts;
var getNewBonusDiscountLineItem = base.getNewBonusDiscountLineItem;
var hasSameOptions = base.hasSameOptions;
var allBundleItemsSame = base.allBundleItemsSame;
var excludeUuid = base.excludeUuid;
var getQtyAlreadyInCart = base.getQtyAlreadyInCart;
var getMatchingProducts = base.getMatchingProducts;
var getExistingProductLineItemInCart = base.getExistingProductLineItemInCart;
var getExistingProductLineItemsInCart = base.getExistingProductLineItemsInCart;
var checkBundledProductCanBeAdded = base.checkBundledProductCanBeAdded;
var ensureAllShipmentsHaveMethods = base.ensureAllShipmentsHaveMethods;
var getReportingUrlAddToCart = base.getReportingUrlAddToCart;

function addLineItem(
  currentBasket,
  product,
  quantity,
  childProducts,
  optionModel,
  defaultShipment,
  donationUserDetails
) {
  var productLineItem = currentBasket.createProductLineItem(
    product,
    optionModel,
    defaultShipment
  );

  if (product.ID === "donation_p") {
    Transaction.wrap(function () {
      if (donationUserDetails) {
        productLineItem.custom.donationFirstNameP =
          donationUserDetails.firstName;
        productLineItem.custom.donationLastNameP = donationUserDetails.lastName;
        productLineItem.custom.donationEmailP = donationUserDetails.email;
        productLineItem.custom.donationAmountP = parseInt(donationUserDetails.amount);
        productLineItem.custom.isDonationAddedP = true;
        productLineItem.custom.donationProductID =
          donationUserDetails.productId;
      }
    });
  }

  if (product.bundle && childProducts.length) {
    updateBundleProducts(productLineItem, childProducts);
  } else if (product.ID !== "donation_p") {
    productLineItem.setQuantityValue(quantity);
  }
  return productLineItem;
}

function addProductToCart(
  currentBasket,
  productId,
  quantity,
  childProducts,
  options,
  donationUserDetails
) {
  var availableToSell;
  var defaultShipment = currentBasket.defaultShipment;
  var perpetual;
  var product = ProductMgr.getProduct(productId);
  var productInCart;
  var productLineItems = currentBasket.productLineItems;
  var productQuantityInCart;
  var quantityToSet;
  var optionModel = productHelper.getCurrentOptionModel(
    product.optionModel,
    options
  );
  var result = {
    error: false,
    message: Resource.msg("text.alert.addedtobasket", "product", null),
  };
  var totalQtyRequested = 0;
  var canBeAdded = false;

  if (product.bundle) {
    canBeAdded = checkBundledProductCanBeAdded(
      childProducts,
      productLineItems,
      quantity
    );
  } else {
    totalQtyRequested =
      quantity + getQtyAlreadyInCart(productId, productLineItems);
    perpetual = product.availabilityModel.inventoryRecord.perpetual;
    canBeAdded =
      perpetual ||
      totalQtyRequested <= product.availabilityModel.inventoryRecord.ATS.value;
  }

  if (!canBeAdded) {
    result.error = true;
    result.message = Resource.msgf(
      "error.alert.selected.quantity.cannot.be.added.for",
      "product",
      null,
      product.availabilityModel.inventoryRecord.ATS.value,
      product.name
    );
    return result;
  }

  productInCart = getExistingProductLineItemInCart(
    product,
    productId,
    productLineItems,
    childProducts,
    options
  );

  if (productInCart) {
    productQuantityInCart = productInCart.quantity.value;
    quantityToSet = quantity
      ? quantity + productQuantityInCart
      : productQuantityInCart + 1;
    availableToSell =
      productInCart.product.availabilityModel.inventoryRecord.ATS.value;

    if (availableToSell >= quantityToSet || perpetual) {
      productInCart.setQuantityValue(quantityToSet);
      result.uuid = productInCart.UUID;
    } else {
      result.error = true;
      result.message =
        availableToSell === productQuantityInCart
          ? Resource.msg("error.alert.max.quantity.in.cart", "product", null)
          : Resource.msg(
              "error.alert.selected.quantity.cannot.be.added",
              "product",
              null
            );
    }
  } else {
    var productLineItem;
    productLineItem = addLineItem(
      currentBasket,
      product,
      quantity,
      childProducts,
      optionModel,
      defaultShipment,
      donationUserDetails
    );
    result.uuid = productLineItem.UUID;
  }
  return result;
}

module.exports = {
  addLineItem: addLineItem,
  addProductToCart: addProductToCart,
  checkBundledProductCanBeAdded: checkBundledProductCanBeAdded,
  ensureAllShipmentsHaveMethods: ensureAllShipmentsHaveMethods,
  getQtyAlreadyInCart: getQtyAlreadyInCart,
  getNewBonusDiscountLineItem: getNewBonusDiscountLineItem,
  getExistingProductLineItemInCart: getExistingProductLineItemInCart,
  getExistingProductLineItemsInCart: getExistingProductLineItemsInCart,
  getMatchingProducts: getMatchingProducts,
  allBundleItemsSame: allBundleItemsSame,
  hasSameOptions: hasSameOptions,
  BONUS_PRODUCTS_PAGE_SIZE: BONUS_PRODUCTS_PAGE_SIZE,
  updateBundleProducts: updateBundleProducts,
  getReportingUrlAddToCart: getReportingUrlAddToCart,
};
