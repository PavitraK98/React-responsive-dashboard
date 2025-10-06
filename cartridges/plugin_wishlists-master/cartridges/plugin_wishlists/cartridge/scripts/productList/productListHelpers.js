/* Copied from lib_productlist-master for Wishlist controller use */
'use strict';

/**
 * Retrieve the list of the customer
 * @param {Object} addressObj - object representing a address
 * @param {dw.customer.ProductList} list - target productList
 * @param {Object} preEvent - object representing a address shipping address
 * @param {dw.customer.Customer} customer - current customer
 * */
function addShippingAddress(addressObj, list, preEvent, customer) {
    var addressBook = customer.getAddressBook();
    var address;
    if (addressObj.newAddress) {
        address = addressBook.createAddress(addressObj.addressId);
        address.setFirstName(addressObj.firstName);
        address.setLastName(addressObj.lastName);
        address.setAddress1(addressObj.address1);
        if (addressObj.address2) {
            address.setAddress2(addressObj.address2);
        }
        address.setCity(addressObj.city);
        address.setStateCode(addressObj.stateCode);
        address.setPostalCode(addressObj.postalCode);
        address.setPhone(addressObj.phone);
        address.setCountryCode(addressObj.country);
    } else {
        address = addressBook.getAddress(addressObj.addressId);
    }

    if (preEvent) {
        list.setShippingAddress(address);
    } else {
        list.setPostEventShippingAddress(address);
    }
}

function addEventInfo(eventInfo, list) {
    list.setName(eventInfo.eventName);
    list.setEventCountry(eventInfo.eventCountry);
    list.setEventState(eventInfo.eventState);
    list.setEventCity(eventInfo.eventCity);
    var dateSplit = eventInfo.eventDate.split('/');
    var eventDate = new Date(
        parseInt(dateSplit[2], 10),
        (parseInt(dateSplit[0], 10) - 1),
        parseInt(dateSplit[1], 10)
    );

    list.setEventDate(new Date(eventDate));
}

function addRegistrantInfo(registrant, list, coRegistrant) {
    var newRegistrant;
    if (coRegistrant) {
        newRegistrant = list.createCoRegistrant();
    } else {
        newRegistrant = list.createRegistrant();
    }
    newRegistrant.setEmail(registrant.email);
    newRegistrant.setFirstName(registrant.firstName);
    newRegistrant.setLastName(registrant.lastName);
    newRegistrant.setRole(registrant.role);
}

function createList(customer, config) {
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var list;

    if (config.type === 10) {
        Transaction.wrap(function () {
            list = ProductListMgr.createProductList(customer, config.type);
        });
    }

    if (config.type === 11) {
        Transaction.wrap(function () {
            list = ProductListMgr.createProductList(customer, config.type);

            addEventInfo(config.formData.eventInfo, list);

            addRegistrantInfo(config.formData.registrant, list, false);
            if (config.formData.coRegistrant) {
                addRegistrantInfo(config.formData.coRegistrant, list, true);
            }
            addShippingAddress(config.formData.preEventAddress, list, true, customer);
            if (config.formData.postEventAddress) {
                addShippingAddress(config.formData.postEventAddress, list, false, customer);
            }
        });
    }
    return list;
}

function getList(customer, config) {
    var productListMgr = require('dw/customer/ProductListMgr');
    var type = config.type;
    var list;
    if (type === 10) {
        var productLists = productListMgr.getProductLists(customer, type);
        list = productLists.length > 0
            ? productLists[0]
            : null;
    } else if (type === 11) {
        list = productListMgr.getProductList(config.id);
    } else {
        list = null;
    }
    return list;
}

function getCurrentOrNewList(customer, config) {
    var type = config.type;
    var list = getList(customer, config);
    if (list === null && type === 10) {
        list = createList(customer, { type: type });
    }
    return list;
}

function updateWishlistPrivacyCache(customer, req, config) {
    var collections = require('*/cartridge/scripts/util/collections');
    var list = getCurrentOrNewList(customer, { type: config.type });
    var listOfIds = collections.map(list.items, function (item) {
        return item.productID;
    });
    req.session.privacyCache.set('wishlist', listOfIds.toString());
}

function removeList(customer, list, config) {
    var Transaction = require('dw/system/Transaction');
    if (customer || config.mergeList) {
        var ProductListMgr = require('dw/customer/ProductListMgr');
        Transaction.wrap(function () {
            ProductListMgr.removeProductList(list);
        });
    }
}

function itemExists(list, pid, config) {
    var listItems = list.items.toArray();
    var found = false;
    listItems.forEach(function (item) {
        if (item.productID === pid) {
            found = item;
        }
    });
    if (found && found.productOptionModel && config.optionId && config.optionValue) {
        var optionModel = found.productOptionModel;
        var option = optionModel.getOption(config.optionId);
        var optionValue = optionModel.getSelectedOptionValue(option);
        if (optionValue.ID !== config.optionValue) {
            var Transaction = require('dw/system/Transaction');
            try {
                Transaction.wrap(function () {
                    list.removeItem(found);
                });
            } catch (e) {
                return found;
            }
            found = false;
        }
    }
    return found;
}

function addItem(list, pid, config) {
    var Transaction = require('dw/system/Transaction');

    if (!list) { return false; }

    var itemExist = itemExists(list, pid, config);

    if (!itemExist) {
        var ProductMgr = require('dw/catalog/ProductMgr');

        var apiProduct = ProductMgr.getProduct(pid);

        if (apiProduct.variationGroup) { return false; }

        if (apiProduct && list && config.qty) {
            try {
                Transaction.wrap(function () {
                    var productlistItem = list.createProductItem(apiProduct);

                    if (apiProduct.optionProduct) {
                        var optionModel = apiProduct.getOptionModel();
                        var option = optionModel.getOption(config.optionId);
                        var optionValue = optionModel.getOptionValue(option, config.optionValue);

                        optionModel.setSelectedOptionValue(option, optionValue);
                        productlistItem.setProductOptionModel(optionModel);
                    }

                    if (apiProduct.master) {
                        productlistItem.setPublic(false);
                    }

                    productlistItem.setQuantityValue(config.qty);
                });
            } catch (e) {
                return false;
            }
        }

        if (config.type === 10) {
            updateWishlistPrivacyCache(config.req.currentCustomer.raw, config.req, config);
        }

        return true;
    }

    if (itemExist && config.type === 11) {
        Transaction.wrap(function () {
            itemExist.setQuantityValue(itemExist.quantityValue + config.qty);
        });

        return true;
    }

    return false;
}

function mergelists(listTo, listFrom, req, configObj) {
    var config;
    var pid;
    var addedItems = [];
    if (listTo && listFrom) {
        listFrom.items.toArray().forEach(function (item) {
            config = {
                optionId: null,
                optionValue: null,
                qty: item.quantityValue,
                req: req,
                type: configObj.type
            };
            if (item.product.optionProduct) {
                var optionModel = item.product.getOptionModel();
                var options = optionModel.getOptions().toArray();
                var option;
                options.forEach(function (optionObj) {
                    option = optionObj;
                });

                var apiOption = optionModel.getOption(option.ID);
                var optionValue = optionModel.getSelectedOptionValue(apiOption);
                config.optionId = apiOption.ID;
                config.optionValue = optionValue.ID;
            }

            pid = item.productID;
            if (!itemExists(listTo, pid, config)) {
                addItem(listTo, pid, config);
                addedItems.push(pid);
            }
        });
        removeList(null, listFrom, { mergeList: true });
    }
    return addedItems;
}

function removeItem(customer, pid, config) {
    var Resource = require('dw/web/Resource');
    var list = getCurrentOrNewList(customer, config);
    var item = itemExists(list, pid, config);
    var result = {};
    if (item) {
        var Transaction = require('dw/system/Transaction');
        try {
            Transaction.wrap(function () {
                list.removeItem(item);
            });
        } catch (e) {
            result.error = true;
            result.msg = Resource.msg('remove.item.failure.msg', 'productlist', null);
            result.prodList = null;
            return result;
        }
        result.error = false;
        result.prodList = list;

        if (config.type === 10) {
            updateWishlistPrivacyCache(customer, config.req, config);
        }
    }
    return result;
}

function getItemFromList(list, pid) {
    var collections = require('*/cartridge/scripts/util/collections');
    var listItem = collections.find(list.items, function (item) {
        return item.productID === pid;
    });
    return listItem;
}

function toggleStatus(customer, itemID, listID) {
    var result = {};
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var Resource = require('dw/web/Resource');
    var apiList;
    if (!customer || !listID) {
        result.error = true;
        result.msg = Resource.msg('list.togglepublic.error.msg', 'productlist', null);
        return result;
    }

    apiList = ProductListMgr.getProductList(listID);
    if (apiList && apiList.owner.ID !== customer.ID) {
        result.error = true;
        result.msg = Resource.msg('list.togglepublic.error.msg', 'productlist', null);
        return result;
    }

    if (!itemID && apiList) {
        try {
            Transaction.wrap(function () {
                apiList.setPublic(!apiList.isPublic());
            });
        } catch (e) {
            result.error = true;
            result.msg = Resource.msg('list.togglepublic.error.msg', 'productlist', null);
            return result;
        }
        result.success = true;
        result.msg = Resource.msg('list.togglepublic.success.msg', 'productlist', null);
    }

    if (itemID && apiList) {
        var item = apiList.getItem(itemID);

        if (item && item.product.master) {
            result.error = true;
            result.msg = Resource.msg('list.togglepublic.main.error.msg', 'productlist', null);
            return result;
        }

        try {
            Transaction.wrap(function () {
                item.setPublic(!item.isPublic());
            });
        } catch (e) {
            result.error = true;
            result.msg = Resource.msg('list.togglepublic.error.msg', 'productlist', null);
            return result;
        }
        result.success = true;
        result.msg = Resource.msg('listitem.togglepublic.success.msg', 'productlist', null);
    }
    return result;
}

module.exports = {
    getList: getList,
    updateWishlistPrivacyCache: updateWishlistPrivacyCache,
    addItem: addItem,
    removeItem: removeItem,
    createList: createList,
    removeList: removeList,
    itemExists: itemExists,
    mergelists: mergelists,
    getItemFromList: getItemFromList,
    toggleStatus: toggleStatus,
    getCurrentOrNewList: getCurrentOrNewList
};
