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
        if (data?.objectResult?.check === true) {
          $(".slot-container").html(`
            <isslot id="new-email-confirmation"
                    description="Displaying confirmation message to newly created emails."
                    context="global"></isslot>
        `);
          $(".msg").text(data.objectResult.message);
        } else if (data?.objectResult?.check === false) {
          $(".slot-container").html(`
            <isslot id="existing-email-message"
                    description="This slot is to display messages to an existing email."
                    context="global"></isslot>
          `);
          $(".msg").text(data.objectResult.message);
        }
      },
      error: function (xhr, status, error) {
        console.log("Error:", status, error);
        alert("Error submitting form. Please try again.");
      },
    });
  });
});
