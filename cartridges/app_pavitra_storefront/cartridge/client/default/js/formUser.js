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

//---------donation form-------//
// $(document).ready(function() {
//   $('.user-donation-form').submit(function(e) {
//       e.preventDefault();

//       var $this = $(this);
//       var addToCartUrl = $this.attr("action");
//       var redirectUrl = $this.attr("redirect");

//       $.ajax({
//         url: addToCartUrl,
//         type: 'POST',
//         data: $this.serialize(),
//         dataType: 'json',
//         success: function(res) {
//           console.log("Success:-----", res);
//             if (res) {
//                 alert('Donation added to cart successfully!');
//             } else {
//                 alert('Error: ' + (res || 'Unable to add donation to cart'));
//             }
//           },
//           error: function(status) {
//             console.log("Error:", status);
//               alert('An error occurred: ' + status);
//           }
//       });
//   });
// });