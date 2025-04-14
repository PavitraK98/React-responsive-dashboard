"use strict";

var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");
var Logger = require("dw/system/Logger");

//this is to send email
function triggerSendEmail(userDetails, emailTemplate) {
    var emailDetails = {
        to: userDetails.email,
        from: "pavitrakarlyz1805@gmail.com",
        subject: "Email triggers for" + userDetails.firstName,
    };
    var emailContext = {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
    };
    Logger.info("An email is triggered to send to a new user");
    //emailHelpers.sendEmail(emailObj, 'account/password/passwordChangedEmail', objectForEmail);
    emailHelpers.sendEmail(emailDetails, emailTemplate, emailContext);
}

module.exports = {
    triggerSendEmail
};
