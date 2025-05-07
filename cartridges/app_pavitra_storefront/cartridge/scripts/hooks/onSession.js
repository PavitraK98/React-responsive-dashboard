// "use strict";
// var Status = require('dw/system/Status');
// var productListHelper = require("../modules1");

// function OnSession(cookieValue) {
//     var result = { message: null, status: null };
//     if(cookieValue){
//         var product = productListHelper.getProductDetails(cookieValue);
//         if(product){
//             result.message = 'product found';
//             result.status = 'success';
//             // return new Status(Status.OK, 200, 'cookie found', cookieValue);
//             return result;
//         }
//         result.message = 'product not found';
//         result.status = 'success';
//     }
//     result.message = 'cookie not found';
//     result.status = 'failed';
//     // return new Status(Status.ERROR, 404, 'cookie not found', cookieValue);
//     return result;
// }

// module.exports.OnSession = OnSession;
