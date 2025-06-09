"use strict";

$(document).ready(function () {
  $(".user-login-form").submit(function (e) {
    e.preventDefault();

    var $this = $(this);
    var url = $this.attr("action");

    $.ajax({
      url: url,
      type: "POST",
      dataType: "json",
      data: $this.serialize(),
      success: function (data) {
        console.log("Success:-----", data);
        $(".form-container").hide();
        if (data?.objectResult?.check === true) {
          $(".new-email-confirmation").show();
          $(".msg").text(data.objectResult.message);
        } else if (data?.objectResult?.check === false) {
          $(".existing-email-message").show();
          $(".msg").text(data.objectResult.message);
        }
      },
      error: function (status) {
        console.log("Error:", status, status.responseJSON.message);
        alert("Error submitting form. Please try again.");
      },
    });
  });
});

function handlePostCartAdd(response) {
  $(".minicart").trigger("count:update", response);
  var messageType = response.error ? "alert-danger" : "alert-success";
  if (
    response.newBonusDiscountLineItem &&
    Object.keys(response.newBonusDiscountLineItem).length !== 0
  ) {
    chooseBonusProducts(response.newBonusDiscountLineItem);
  } else {
    if ($(".add-to-cart-messages").length === 0) {
      $("body").append('<div class="add-to-cart-messages"></div>');
    }

    $(".add-to-cart-messages").append(
      '<div class="alert ' +
        messageType +
        ' add-to-basket-alert text-center" role="alert">' +
        response.message +
        "</div>"
    );

    setTimeout(function () {
      $(".add-to-basket-alert").remove();
    }, 5000);
  }
}

function miniCartReportingUrl(url) {
  if (url) {
    $.ajax({
      url: url,
      method: "GET",
      success: function () {
        // reporting urls hit on the server
      },
      error: function () {
        // no reporting urls hit on the server
      },
    });
  }
}

//---------donation form-------//
$(document).ready(function () {
  $(".user-donation-form").on("submit", function (e) {
    e.preventDefault();

    var $form = $(this);
    var $donateButton = $form.find("#donateButton");
    var url = $donateButton.data("url");
    var formData = $form.serialize();

    $.spinner().start();
    $donateButton.prop("disabled", true);

    $.ajax({
      url: url,
      type: "POST",
      data: formData,
      success: function (res) {
        if (res) {
          $form[0].reset();
          $('.minicart-quantity').empty().append(res.quantityTotal);
          // $("body").trigger("product:afterAddToCart", res);
          miniCartReportingUrl(res.reportingURL);
          handlePostCartAdd(res);

          $donateButton.prop("disabled", false);
          $.spinner().stop();
        }
      },
      error: function (error) {
        console.log("Error:", error);
        $.spinner().stop();
        $donateButton.prop("disabled", false);
      },
    });
  });
});
