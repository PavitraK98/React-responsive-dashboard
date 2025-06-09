"use strict";

var server = require("server");

// The root is - /Trate-Show
server.get("Show", function (req, res, next) {

  res.render("trateCheckout/checkout1");
  next();
});

module.exports = server.exports();
