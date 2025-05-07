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
        $('.form-container').hide();
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
