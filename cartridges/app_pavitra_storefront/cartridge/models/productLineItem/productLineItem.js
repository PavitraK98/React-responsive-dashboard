'use strict';
var base = module.superModule;

var productDecorators = require('*/cartridge/models/product/decorators/index');
var productLineItemDecorators = require('*/cartridge/models/productLineItem/decorators/index');


module.exports = function productLineItem(product, apiProduct, options) {
    base.call(this, product, apiProduct, options);
    productLineItemDecorators.donation(product, options.lineItem);
    return product;
};
