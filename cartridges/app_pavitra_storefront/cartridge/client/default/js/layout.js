"use strict";

$(document).ready(function () {
  // Using event delegation in case the element is dynamically added
  $(document).on("click", ".header1-cancal-btn", function () {
    console.log("button clicked");
    $(".custom-header-1").hide();
  });

  $("#hamburger-btn").click(function () {
    $(".nav-links").toggleClass("nav-active");
  });
});
