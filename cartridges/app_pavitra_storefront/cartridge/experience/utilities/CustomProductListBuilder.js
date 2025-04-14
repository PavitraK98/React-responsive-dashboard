'use strict';

/**
 * Custom Product List Builder
 * Prepares the model for the Page Designer component to render dynamic product lists.
 */

/**
 * Gets products per device configuration
 * @param {Object} content - Content object from Page Designer
 * @returns {Object} - Products per device mapping
 */
function getProductsPerDevice(content) {
    return {
        mobile: content.mobileProductsToDisplay || 1,
        tablet: content.tabletProductsToDisplay || 2,
        desktop: content.desktopProductsToDisplay || 3
    };
}

/**
 * Gets the product data
 * @param {Object} content - Content object from Page Designer
 * @returns {Array} - List of products
 */
function getProductData(content) {
    if (!content.products || !content.products.length) {
        return [];
    }

    return content.products.map(function (product) {
        return {
            id: product.productID || '',
            image: product.image || '',
            title: product.title || '',
            price: product.price || ''
        };
    });
}

/**
 * Initializes the component model
 * @param {Object} model - Model object to populate
 * @param {Object} context - Context object from Page Designer
 * @returns {Object} - Updated model
 */
function init(model, context) {
    var content = context.content || {};

    var productsPerDevice = getProductsPerDevice(content);
    var products = getProductData(content);
    var numberOfProducts = products.length;

    var insufficientNumberOfProducts = numberOfProducts === 0;

    // Prepare the regions for Page Designer
    var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    var regions = PageRenderHelper.getRegionModelRegistry(context.component);

    model.regions = regions;
    model.id = context.component.getID();
    model.productsPerDevice = productsPerDevice;
    model.products = products;
    model.numberOfProducts = numberOfProducts;
    model.insufficientNumberOfProducts = insufficientNumberOfProducts;
    model.title = content.title || '';

    return model;
}

module.exports = {
    init: init
};
