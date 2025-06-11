'use strict';

var server = require("server");

var cache = require("*/cartridge/scripts/middleware/cache");
var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
var pageMetaData = require("*/cartridge/scripts/middleware/pageMetaData");

//route -> Gallery-Show to read contentAssets of a folder + read folder refinements//
server.get(
  "Show",
  cache.applyShortPromotionSensitiveCache,
  consentTracking.consent,
  function (req, res, next) {
    var gallerySearch = require("../scripts/helpers/galleryHelper");
    var gallerySearch;

    gallerySearch = new gallerySearch(
      req,
      res,
      "gallery"
    );
    var result = {
      folderSearch: gallerySearch,
    };

    var template = "gallery/listingPage";
    res.render(template, {
      folderSearch: result.folderSearch,
      maxSlots: result.maxSlots,
      result: result,
    });

    return next();
  },
  pageMetaData.computedPageMetaData
);

//route -> Gallery-Content follwed by contentID to read content items//
server.get("Content", function (req, res, next) {
  var ContentMgr = require("dw/content/ContentMgr");
  var contentAsset = ContentMgr.getContent(req.querystring.contentId);
  if (contentAsset) {
    if (contentAsset.custom.galleryImgVid !== null) {
      var parsedContent = JSON.parse(contentAsset.custom.galleryImgVid);
      var parsedImages = parsedContent.images;
      var parsedVideos = parsedContent.videos;
    }
    var contentDetails = {
      id: contentAsset.ID,
      eventName: contentAsset.custom.galleryEvent,
      eventContentImages: parsedImages || null,
      eventContentVideos: parsedVideos || null,
    };
  } else {
    return "content not found";
  }
  res.render("gallery/album", { contentDetails: contentDetails });
  next();
});

module.exports = server.exports();
