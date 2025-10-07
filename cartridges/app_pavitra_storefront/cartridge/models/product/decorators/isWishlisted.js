'use strict';

/**
 * Decorator to add isWishlist property to product model
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 */

module.exports = function isWishlist(product, apiProduct) {
    Object.defineProperty(product, 'isWishlist', {
        enumerable: true,
        value: product.custom.isWishlisted || false
    });
};