"use strict";

var ArrayList = require("dw/util/ArrayList");
var collections = require("*/cartridge/scripts/util/collections");

function getRefinementsForFolder(folderId, refinements, refinementDefinitions) {
  var refineValues = [];
  collections.forEach(refinementDefinitions, function (definition) {
    var refinementValues = refinements.getAllRefinementValues(definition);
    var valuesList = [];

    for (var j = 0; j < refinementValues.length; j++) {
      var refVal = refinementValues[j];

      valuesList.push({
        value: refVal.value,
        displayValue: refVal.displayValue,
        hitCount: refVal.hitCount,
      });
    }

    refineValues.push({
      refinementID: definition.attributeID,
      refinementDisplayName: definition.displayName,
      values: valuesList,
    });
  });

  return refineValues;
}

function searchContentByFolder(fdid, apiContentSearchModel, req) {
    var contentList = new ArrayList(apiContentSearchModel.getContent());
    var contents = [];

    var eventNameFilter = req.querystring.galleryEvent;
    var eventYearFilter = req.querystring.galleryEventYear;
    var categoryFilter = req.querystring.galleryCategory;
    var shouldFilter = eventNameFilter || eventYearFilter || categoryFilter;

    collections.forEach(contentList, function(content) {
        var parsedImages = null;
        var parsedVideos = null;

        if (content.custom.galleryImgVid !== null) {
            try {
                var parsedContent = JSON.parse(content.custom.galleryImgVid);
                parsedImages = parsedContent.images;
                parsedVideos = parsedContent.videos;
            } catch (e) {
                parsedImages = null;
                parsedVideos = null;
            }
        }

        if (!shouldFilter) {
            contents.push(createContentObject(content, parsedImages, parsedVideos));
            return;
        }

        var matchesFilters = true;

        if (eventNameFilter && content.custom.galleryEvent !== eventNameFilter) {
            matchesFilters = false;
        }

        if (eventYearFilter && content.custom.galleryEventYear !== eventYearFilter) {
            matchesFilters = false;
        }

        if (categoryFilter && content.custom.galleryCategory !== categoryFilter) {
            matchesFilters = false;
        }

        if (matchesFilters) {
            contents.push(createContentObject(content, parsedImages, parsedVideos));
        }
    });

    return contents;
}

function createContentObject(content, parsedImages, parsedVideos) {
    return {
        id: content.ID,
        eventName: content.custom.galleryEvent,
        eventContentImages: parsedImages,
        eventContentVideos: parsedVideos,
        eventCategory: content.custom.galleryCategory,
        eventYear: content.custom.galleryEventYear
    };
}

function gallerySearch(req, res, folderId) {
  var ContentSearchModel = require("dw/content/ContentSearchModel");
  var URLUtils = require("dw/web/URLUtils");

  var apiContentSearchModel = new ContentSearchModel();
  var maxSlots = 4;
  var canonicalUrl = URLUtils.url("Gallery-Show");

  apiContentSearchModel.setFilteredByFolder(true);
  apiContentSearchModel.setFolderID(folderId);
  apiContentSearchModel.search();

  var folderContents = [];
  if (folderId) {
    var contentSearchResult = searchContentByFolder(
      folderId,
      apiContentSearchModel,
      req
    );
    folderContents.push({ contents: contentSearchResult });
    var refinementsOfFolder = getRefinementsForFolder(
      folderId,
      apiContentSearchModel.refinements,
      apiContentSearchModel.refinements.refinementDefinitions
    );
    folderContents.push({ refinements: refinementsOfFolder });
  }

  var result = {
    folderContents: folderContents,
    ContentSearchModel: apiContentSearchModel,
    maxSlots: maxSlots,
    canonicalUrl: canonicalUrl,
  };
  return result;
}

module.exports = gallerySearch;
