'use strict';

var productMgr = require("dw/catalog/ProductMgr");
var product = require("dw/catalog/Product");
var Site = require('dw/system/Site');

function getSitePreference(siteValue){
    var currentSite = Site.getCurrent();
    var currentCustomPreference = currentSite.getCustomPreferenceValue(siteValue);

    return currentCustomPreference;
}

module.exports = {
    getSitePreference
}