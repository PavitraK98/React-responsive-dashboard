"use strict";

var server = require("server");

server.get("WebService", function (req, res, next) {
    var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
    var Logger = require("dw/system/Logger");
    var svc = LocalServiceRegistry.createService("app_custom_sriram.http.employee.get",{
        createRequest: function (svc, params) {
          svc = svc.setRequestMethod("GET");
          svc.setURL(svc.getURL() + "?pid=" + params.pid);
          return '';
        },
        parseResponse: function (svc, response) {
          return response;
        }
      }
    );

    try {
      var result = svc.call({ pid: req.querystring.pid });
      if (result.isOk()) {
        var responseObj = result.object.getText();
        res.json(JSON.parse(responseObj));
      } else {
        Logger.error("Service call failed: " + result.getErrorMessage());
        res.json({
          error: true,
          message: result.getErrorMessage(),
          status: result.status,
        });
      }
    } catch (e) {
      Logger.error("Unexpected error during service call: " + e.message);
      res.json({
        error: true,
        message: e.message,
      });
    }

    next();
  });

  module.exports = server.exports();
