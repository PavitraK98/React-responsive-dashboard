'use strict';

module.exports = function (object, lineItem) {
    Object.defineProperty(object, 'isDonationProduct', {
        enumerable: true,
        value: lineItem
    });
};
