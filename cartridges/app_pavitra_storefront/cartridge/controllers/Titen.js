"use strict";

var server = require("server");
var customObjectMgr = require("dw/object/CustomObjectMgr");
var Site = require("dw/system/Site");

// The root is /Titen-Test1
server.get("Test1", function (req, res, next) {
    var currentSite = Site.getCurrent();
    var currentCustomPreference = currentSite.getCustomPreferenceValue("Listfofproduct");

    var allObjects = customObjectMgr.getAllCustomObjects("titan_practice");
    var isMatch = false;
    var objMatch = [];
    while (allObjects.hasNext()) {
        var eachAtt = allObjects.next();
        var textVal = eachAtt.custom.practiceText1;
        if (currentCustomPreference.includes(textVal)) {
            objMatch.push({ objVal: textVal, status: true });
            isMatch = true;
        }
    }
    
    if(isMatch){
        // res.setStatusCode(404);
        res.json({
            "message": "match found",
            "status": false,
        });
        next();
    }else{
        // res.setStatusCode(500);
        res.json({
            "message": "match not found",
            "status": true,
        })
        next();
    }
});

module.exports = server.exports();
