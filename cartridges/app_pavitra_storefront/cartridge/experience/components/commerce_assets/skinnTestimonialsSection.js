'use strict';

/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var carouselBuilder = require('*/cartridge/scripts/experience/utilities/carouselBuilder.js');

/**
 * Render logic for storefront.carousel layout.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    model.reviewsList =  [
        {
          date: "02/14/25",
          name: "Aarav S.",
          verifiedBuyer: true,
          rating: 5,
          title: "Excellent quality and fast delivery!",
          description: "Excellent quality and fast delivery!"
        },
        {
          date: "03/02/25",
          name: "Meera T.",
          verifiedBuyer: true,
          rating: 5,
          title: "Lovely packaging, smells amazing!",
          description: "Lovely packaging, smells amazing!"
        },
        {
          date: "01/19/25",
          name: "Karan P.",
          verifiedBuyer: true,
          rating: 5,
          title: "Highly recommend this product",
          description: "Highly recommend this product"
        },
        {
          date: "04/05/25",
          name: "Divya M.",
          verifiedBuyer: true,
          rating: 5,
          title: "Will definitely purchase again!",
          description: "Will definitely purchase again!"
        },
        {
          date: "12/31/24",
          name: "Rohan G.",
          verifiedBuyer: true,
          rating: 5,
          title: "Perfect gift for any occasion",
          description: "Perfect gift for any occasion"
        }
      ];
    model.heading = content.headline;
    model.subHeadline = content.subHeadline;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/skinnTestimonialsSection').render(model).text;
};