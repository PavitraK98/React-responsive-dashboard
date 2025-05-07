"use strict";

var base = module.superModule;

var PaymentInstrument = require("dw/order/PaymentInstrument");
var Resource = require("dw/web/Resource");
var Transaction = require("dw/system/Transaction");
var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var Logger = require("dw/system/Logger");


function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
  var serverErrors = [];
  var fieldErrors = {};
  var error = false;

  var svc = LocalServiceRegistry.createService(
    "app_pavitra_storefront.http.cardDetails.post",
    {
      createRequest: function (svc, params) {
        svc = svc.setRequestMethod("POST");
        // svc = svc.addParam('paymentDetails', params.paymentDetails);
        return JSON.stringify(params.paymentDetails);
      },
      parseResponse: function (svc, response) {
        return response;
      },
    }
  );
  var paymentDetails = {
    cardNumber: paymentInstrument.creditCardNumber.toString().slice(-4),
    expirationMonth: paymentInstrument.creditCardExpirationMonth,
    expirationYear: paymentInstrument.creditCardExpirationYear,
    paymentAmount: paymentInstrument.paymentTransaction.amount.value,
  };

  var result = svc.call({
    paymentDetails: paymentDetails,
  });
  Logger.error("Payment Service Call Result: {0}", JSON.stringify(result));

  if (result.isOk() && result.object) {
    var resultObj = JSON.parse(result.object.getText());
    if (resultObj) {
      try {
        Transaction.wrap(function () {
          paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
          paymentInstrument.paymentTransaction.setPaymentProcessor(
            paymentProcessor
          );
        });
      } catch (e) {
        error = true;
        serverErrors.push(Resource.msg("error.technical", "checkout", null));
      }
    }
  } else {
    error = true;
    serverErrors.push(
      result.getErrorMessage() || "Service call failed with no response."
    );
  }

  return {
    fieldErrors: fieldErrors,
    serverErrors: serverErrors,
    error: error,
  };
}

exports.Handle = base.Handle;
exports.createToken = base.createToken;
exports.Authorize = Authorize;
