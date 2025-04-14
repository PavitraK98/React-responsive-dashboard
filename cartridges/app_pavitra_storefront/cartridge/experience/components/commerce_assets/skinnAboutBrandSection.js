
'use strict';

/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

/**
 * Render logic for storefront.imageAndText component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    model.originalHeading = content.originalHeading ? content.originalHeading : null;
    model.originalImg = ImageTransformation.getScaledImage(content.originalImg);
    model.originalText = content.originalText ? content.originalText : null;

    model.returnHeading = content.returnHeading ? content.returnHeading : null;
    model.returnImg = ImageTransformation.getScaledImage(content.returnImg);
    model.returnText = content.returnText ? content.returnText : null;

    model.shippingHeading = content.shippingHeading ? content.shippingHeading : null;
    model.shippingImg = ImageTransformation.getScaledImage(content.shippingImg);
    model.shippingText = content.shippingText ? content.shippingText : null;

    model.aboutHeading = content.aboutHeading ? content.aboutHeading : null;
    model.aboutParagraph1 = content.aboutParagraph1 ? content.aboutParagraph1 : null;
    model.aboutParagraph2 = content.aboutParagraph2 ? content.aboutParagraph2 : null;
    model.aboutButtonText = content.aboutButtonText ? content.aboutButtonText : null;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/skinnAboutSection').render(model).text;
};
