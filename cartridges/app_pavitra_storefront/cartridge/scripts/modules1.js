'use strict';

var ArrayList = require("dw/util/ArrayList");
var productMgr = require("dw/catalog/ProductMgr");
var product = require("dw/catalog/Product");
var convertStringHelper = require("./convertString");

function getProductList() {
    return [
        "abc002VariationBase",
        "abc004BlackJacket",
        "abc012Watch1",
        "abc013Book1",
        "abc016iqoo",
        "abc005YellowJacket",
        "abc006BlueJacket"
    ];
}

function getImages(product, viewType, numImages) {
    var images = [];
    for (var i = 1; i <= numImages; i++) {
        var image = product.getImage(viewType, i);
        if (image) {
            images.push({
                id: i,
                URL: image.getImageURL({ scaleWidth: 100, format: 'jpg' }),
                viewType: viewType
            });
        }
    }
    return images;
}


function getProductDetails(productID) {
    var product = productMgr.getProduct(productID);
    if (!product) {
        // Return null if the product is not found
        return null;
    }
    var productData = {
        id: product.getID(),
        name: product.getName(),
        manufacturer: product.getManufacturerName(),
        online: product.isOnline(),
        searchable: product.isSearchable(),
        price: product.priceModel.price.value || null,
        stockStatus: convertStringHelper.formatString(product.availabilityModel.availabilityStatus),
        stockUnits: product.availabilityModel.availability || null,
        shortDiscription: product.getShortDescription().markup || null,
        longDiscription: product.getLongDescription().markup || null,
        onSale: product.custom.isSale,
        newArrival: product.custom.isNewtest,
        color: product.variants && product.variants.length > 0 ? product.variants[0].custom.color : null,
        images: product.getImage('large', 0).getImageURL({ scaleWidth: 200, format: 'jpg' }),
    };
    return productData;
}

module.exports = {
    getProductList,
    getProductDetails,
}