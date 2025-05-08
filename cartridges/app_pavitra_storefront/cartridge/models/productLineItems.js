'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var ProductFactory = require('*/cartridge/scripts/factories/product');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');


function createProductLineItemsObject(allLineItems, view) {
    base.call(this, allLineItems, view);
    var lineItems = [];

    collections.forEach(allLineItems, function (item) {
        // when item's category is unassigned, return a lineItem with limited attributes
        if (!item.product) {
            lineItems.push({
                id: item.productID,
                quantity: item.quantity.value,
                productName: item.productName,
                UUID: item.UUID,
                noProduct: true,
                donationUser: item.productLineItem,
                images:
                {
                    small: [
                        {
                            url: URLUtils.staticURL('/images/noimagelarge.png'),
                            alt: Resource.msgf('msg.no.image', 'common', null),
                            title: Resource.msgf('msg.no.image', 'common', null)
                        }
                    ]

                }

            });
            return;
        }
        var options = collections.map(item.optionProductLineItems, function (optionItem) {
            return {
                optionId: optionItem.optionID,
                selectedValueId: optionItem.optionValueID
            };
        });

        var bonusProducts = null;

        if (!item.bonusProductLineItem
                && item.custom.bonusProductLineItemUUID
                && item.custom.preOrderUUID) {
            bonusProducts = [];
            collections.forEach(allLineItems, function (bonusItem) {
                if (!!item.custom.preOrderUUID && bonusItem.custom.bonusProductLineItemUUID === item.custom.preOrderUUID) {
                    var bpliOptions = collections.map(bonusItem.optionProductLineItems, function (boptionItem) {
                        return {
                            optionId: boptionItem.optionID,
                            selectedValueId: boptionItem.optionValueID
                        };
                    });
                    var params = {
                        pid: bonusItem.product.ID,
                        quantity: bonusItem.quantity.value,
                        variables: null,
                        pview: 'bonusProductLineItem',
                        containerView: view,
                        lineItem: bonusItem,
                        options: bpliOptions,
                        donationUser: item.productLineItem,
                    };

                    bonusProducts.push(ProductFactory.get(params));
                }
            });
        }

        var params = {
            pid: item.product.ID,
            quantity: item.quantity.value,
            variables: null,
            pview: 'productLineItem',
            containerView: view,
            lineItem: item,
            options: options,
            donationUser: item.productLineItem,
        };
        var newLineItem = ProductFactory.get(params);
        newLineItem.bonusProducts = bonusProducts;
        if (newLineItem.bonusProductLineItemUUID === 'bonus' || !newLineItem.bonusProductLineItemUUID) {
            lineItems.push(newLineItem);
        }
    });
    return lineItems;
}

function getTotalQuantity(items) {
    base.call(this, items);
}

function ProductLineItems(productLineItems, view) {
    base.call(this, productLineItems, view);
}

ProductLineItems.getTotalQuantity = getTotalQuantity;

module.exports = ProductLineItems;
