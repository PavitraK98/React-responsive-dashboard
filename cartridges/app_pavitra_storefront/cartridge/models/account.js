'use strict';

var AddressModel = require('*/cartridge/models/address');
var Customer = require('dw/customer/Customer');

var base = module.superModule;

function getProfile(profile) {
    var result;
    if (profile) {
        result = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            companyName: customer.profile.companyName,
            phone: Object.prototype.hasOwnProperty.call(profile, 'phone') ? profile.phone : profile.phoneHome,
            password: '********',
        };
    } else {
        result = null;
    }
    return result;
}

function account(currentCustomer, addressModel, orderModel) {
    base.call(this, currentCustomer, addressModel, orderModel);
    this.profile = getProfile(currentCustomer.profile);
}

module.exports = account;
