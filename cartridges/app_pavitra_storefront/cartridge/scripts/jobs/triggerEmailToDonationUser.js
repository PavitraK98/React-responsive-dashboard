"use strict";
var Status = require("dw/system/Status");
var customObjectMgr = require("dw/object/CustomObjectMgr");
var Logger = require("dw/system/Logger");
var Resource = require("dw/web/Resource");

function triggerEmailToDonationUser() {
  var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");
  try {
    var allExistingRecordsOfObject =
      customObjectMgr.getAllCustomObjects("donationUser_P");

      try{
        while (allExistingRecordsOfObject.hasNext()) {
          var record = allExistingRecordsOfObject.next();
          var userUUID = record.custom.userUUID;
          var userEmail = record.custom.userEmail;
          var userFirstName = record.custom.userFirstname;
          var userLastName = record.custom.userLastname;
          var amountOfDonation = record.custom.userDonationAmount;

          if (!userUUID || !userEmail) {
            Logger.warn(
              "Skipping record with missing UUID or email for record: {0}",
              record.custom.userUUID
            );
            continue;
          }

          try {
            var emailDetails = {
              to: userEmail,
              from: "noreply@yourdomain.com",
              subject:
                Resource.msg("email.donation.thankyou.subject", "donation", null) +
                " $" +
                amountOfDonation,
            };

            var emailContext = {
              FirstName: userFirstName,
              LastName: userLastName,
              Amount: amountOfDonation,
            };

            var templatePath = "Donation/donationEmailTemplate";

            emailHelpers.sendEmail(emailDetails, templatePath, emailContext);
            customObjectMgr.remove(record);
            Logger.info("Successfully sent donation email to: {0}", userEmail);
          } catch (e) {
            Logger.error(
              "Failed to send email to {0}: {1}",
              userEmail,
              e.toString() + "\n" + e.stack
            );
          }
        }
      }finally{
        allExistingRecordsOfObject.close();
      }
  } catch (e) {
    Logger.error("Error in triggering emails job: " + e.message);
    return new Status(
      Status.ERROR,
      "ERROR",
      "Error in triggering emails job: " + e.message
    );
  }
}

exports.triggerEmailToDonationUser = triggerEmailToDonationUser;
