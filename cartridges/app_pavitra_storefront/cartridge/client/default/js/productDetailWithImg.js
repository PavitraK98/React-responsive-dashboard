'use strict';

$(document).ready(function () {
  $('.product-card').on('click', function () {
    $(this).css('cursor', 'pointer');
    // $(".product-card").attr("data-product-card-action-url")
    // var actionURL = $('.product-card').data('product-card-action-url');
    var $this = $(this);
    var redirectUrl = $this.data('product-card-action-url');

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      console.log('error redirecting page')
    }
  });


  $('.test-btn').on('click', function () {
    $.ajax({
      url: $(this).data('test'),
      type: 'GET',
      success: function() {
        console.log('success')
      },
      error: function (errr) {
        console.log(errr)
      }
    })
  });
});
