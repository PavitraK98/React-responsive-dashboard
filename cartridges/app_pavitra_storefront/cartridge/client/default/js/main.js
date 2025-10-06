"use strict";

window.jQuery = require("jquery");
window.$ = require("jquery");
var processInclude = require("base/util");

$(document).ready(function () {
  processInclude(require("base/components/menu"));
  processInclude(require("base/components/cookie"));
  processInclude(require("base/components/consentTracking"));
  processInclude(require("base/components/footer"));
  processInclude(require("base/components/miniCart"));
  processInclude(require("base/components/collapsibleItem"));
  processInclude(require("base/components/search"));
  processInclude(require("base/components/clientSideValidation"));
  processInclude(require("base/components/countrySelector"));
  processInclude(require("base/components/toolTip"));
  processInclude(require("plugin_wishlishts/productDetail"));
  processInclude(require("plugin_wishlists/productTile"));
  processInclude(require("plugin_wishlists/wishlist"));
  processInclude(require("plugin_wishlists/search"));
  processInclude(require("base/header"));
  processInclude(require("./gallery"));
});

require("base/thirdParty/bootstrap");
require("base/components/spinner");
require("slick-carousel");

$(document).ready(function () {
  $(".imge-container").slick({
    slidesToShow: 2.3,
    slidesToScroll: 1,
  });
});

//------------------skinn main banner with slick------//
$(document).ready(function () {
  $(".skinnBannerWithSlick-container").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    dotsClass: 'skinnBanner-slick-dots',
    autoplay: true,
    autoplaySpeed: 9000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
});
//----------------------trending products vertical slider-----//

$(document).ready(function () {
  $(".products-list-container").slick({
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnFocus: false,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
});

//---------------------flip card-----------------------//

$(document).ready(function () {
  let currentCard = 0;
  const totalCards = 2;

  // Function to update card display
  function updateCard() {
    const frontImage = $(".flip-card-front .flip-card-img");
    const frontDesc = $(".flip-card-front .flip-desc");
    const backImage = $(".flip-card-back .flip-card-img");
    const backDesc = $(".flip-card-back .flip-desc");
    const indicators = $(".indicator");

    if (currentCard === 0) {
      // Show front content
      frontImage.css("transform", "rotateY(0deg)");
      frontDesc.css("transform", "rotateY(0deg)");
      backImage.css("transform", "rotateY(180deg)");
      backDesc.css("transform", "rotateY(180deg)");
    } else {
      // Show back content
      frontImage.css("transform", "rotateY(180deg)");
      frontDesc.css("transform", "rotateY(180deg)");
      backImage.css("transform", "rotateY(0deg)");
      backDesc.css("transform", "rotateY(0deg)");
    }

    // Update indicators
    indicators.removeClass("active");
    indicators.eq(currentCard).addClass("active");
  }

  // Arrow click handlers
  $(".card-control-next").click(function () {
    currentCard = (currentCard + 1) % totalCards;
    updateCard();
  });

  $(".card-control-prev").click(function () {
    currentCard = (currentCard - 1 + totalCards) % totalCards;
    updateCard();
  });

  // Indicator click handlers
  $(".indicator").click(function () {
    currentCard = parseInt($(this).data("index"));
    updateCard();
  });

  // Initialize
  updateCard();
});

//----------------------testimonials----------//

$(document).ready(function () {
  $(".testimonial-card-content-container").slick({
    slidesToShow: 2,
    slidesToScroll: 2,
    dots: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
});

//------------------BSIN fetaure notification---------//
$(document).ready(function () {
  $(".product-bins-form").submit(function (e) {
    e.preventDefault();

    var $this = $(this);
    var url = $this.attr("action");

    var $button = $this.find("button[type='submit']");
    $button.prop("disabled", true);

    $.ajax({
      url: url,
      type: "POST",
      dataType: "json",
      data: $this.serialize(),
      success: function (response) {
        console.log(response, "---------BSIN res");
        $this[0].reset();
        if (response.success) {
          $this
            .find(".successPopUp")
            .text(response.message)
            .removeClass("d-none")
            .show();
          setTimeout(function () {
            $this.find(".successPopUp").fadeOut("slow", function () {
              $(this).addClass("d-none").show();
            });
          }, 10000);
        } else if (response.success === false) {
          $this
            .find(".infoPopup")
            .text(response.message)
            .removeClass("d-none")
            .show();
          setTimeout(function () {
            $this.find(".infoPopup").fadeOut("slow", function () {
              $(this).addClass("d-none").show();
            });
          }, 10000);
        }
        $button.prop("disabled", false);
      },
      error: function (xhr, status, error) {
        console.log(
          xhr,
          "--------",
          status,
          "----------",
          error,
          "---------BSIN"
        );
        $this
          .find(".errorPopUp")
          .text(xhr.responseJSON?.message || "Failed to submit.")
          .removeClass("d-none")
          .show();
        setTimeout(function () {
          $this.find(".errorPopUp").fadeOut("slow", function () {
            $(this).addClass("d-none").show();
          });
        }, 10000);
      },
    });
  });
});
