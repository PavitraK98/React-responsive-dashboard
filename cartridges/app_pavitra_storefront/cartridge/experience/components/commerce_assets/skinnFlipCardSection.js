
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

    model.cardImage1 = ImageTransformation.getScaledImage(content.cardImage1);
    model.cardHeading1 = content.cardHeading1 ? content.cardHeading1 : null;
    model.cardText1 = content.cardText1 ? content.cardText1 : null;
    model.cardImage2 = ImageTransformation.getScaledImage(content.cardImage2);
    model.cardHeading2 = content.cardHeading2 ? content.cardHeading2 : null;
    model.cardText2 = content.cardText2 ? content.cardText2 : null;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/skinnFlipCardSection').render(model).text;
};
