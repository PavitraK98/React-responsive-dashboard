"use strict";

var File = require("dw/io/File");
var Status = require("dw/system/Status");
var Logger = require("dw/system/Logger");

function moveFile(args) {
  // catalog file old path = "/sftp/data/Pavitra_storefront_catalog.xml"
  // sale pricebook file old path = "/sftp/data/pavi-pricebook-sale-prices.xml"
  // list pricebook file old path = "/sftp/data/pavi-pricebook-list-prices.xml"
  // inventory file old path = "/sftp/data/pavi-inventory-m.xml"

  // catalog file new path = "/src/data/Pavitra_storefront_catalog.xml"
  // sale pricebook file new path = "/src/data/pavi-pricebook-sale-prices.xml"
  // list pricebook file new path = "/src/data/pavi-pricebook-list-prices.xml"
  // inventory file new path = "/src/data/pavi-inventory-m.xml"
  var catalogOldPath = args.CatalogFileOldPath;
  var listPriceBookOldPath = args.ListPriceBookFileOldPath;
  var salePriceBookOldPath = args.SalePriceBookFileOldPath;
  var inventoryOldPath = args.InventoryFileOldPath;

  var catalogNewPath = args.CatalogFileNewPath;
  var listPriceBookNewPath = args.ListPriceBookFileNewPath;
  var salePriceBookNewPath = args.SalePriceBookFileNewPath;
  var inventoryNewPath = args.InventoryFileNewPath;

  try {
    var folder = new File(File.IMPEX + "/src/data");
    if (!folder.exists()) {
      folder.mkdirs();
    }

    // Catalog
    var catalogFile = new File(File.IMPEX + catalogOldPath);
    if (!catalogFile.exists()) {
      Logger.error("Catalog file does not exist at path: " + catalogOldPath);
    } else {
      var catalogNewFileLoc = new File(File.IMPEX + catalogNewPath);
      var renameCatalogFile = catalogFile.renameTo(catalogNewFileLoc);
      if (!renameCatalogFile) {
        Logger.error(
          "Failed to rename Catalog file from " +
            catalogOldPath +
            " to " +
            catalogNewPath
        );
      } else {
        Logger.info("Catalog file moved successfully to: " + catalogNewPath);
      }
    }

    // List Price Book
    var listPriceBookFile = new File(File.IMPEX + listPriceBookOldPath);
    if (!listPriceBookFile.exists()) {
      Logger.error(
        "List Price Book file does not exist at path: " + listPriceBookOldPath
      );
    } else {
      var listPriceBookNewFileLoc = new File(File.IMPEX + listPriceBookNewPath);
      var renameListPriceBook = listPriceBookFile.renameTo(listPriceBookNewFileLoc)
      if (!renameListPriceBook) {
        Logger.error(
          "Failed to rename List Price Book file from " +
            listPriceBookOldPath +
            " to " +
            listPriceBookNewPath
        );
      } else {
        Logger.info(
          "List Price Book file moved successfully to: " + listPriceBookNewPath
        );
      }
    }

    // Sale Price Book
    var salePriceBookFile = new File(File.IMPEX + salePriceBookOldPath);
    if (!salePriceBookFile.exists()) {
      Logger.error(
        "Sale Price Book file does not exist at path: " + salePriceBookOldPath
      );
    } else {
      var salePriceBookNewFileLoc = new File(File.IMPEX + salePriceBookNewPath);
      var renameSalePriceBook = salePriceBookFile.renameTo(salePriceBookNewFileLoc)
      if (!renameSalePriceBook) {
        Logger.error(
          "Failed to rename Sale Price Book file from " +
            salePriceBookOldPath +
            " to " +
            salePriceBookNewPath
        );
      } else {
        Logger.info(
          "Sale Price Book file moved successfully to: " + salePriceBookNewPath
        );
      }
    }

    // Inventory
    var inventoryFile = new File(File.IMPEX + inventoryOldPath);
    if (!inventoryFile.exists()) {
      Logger.error(
        "Inventory file does not exist at path: " + inventoryOldPath
      );
    } else {
      var inventoryNewFileLoc = new File(File.IMPEX + inventoryNewPath);
      var renameInventoryFile = inventoryFile.renameTo(inventoryNewFileLoc)
      if (!renameInventoryFile) {
        Logger.error(
          "Failed to rename Inventory file from " +
            inventoryOldPath +
            " to " +
            inventoryNewPath
        );
      } else {
        Logger.info(
          "Inventory file moved successfully to: " + inventoryNewPath
        );
      }
    }

    return new Status(
      Status.OK,
      "OK",
      "File move process completed. Check logs for individual results."
    );
  } catch (e) {
    Logger.error("Error during file move process: " + e.toString());
    return new Status(
      Status.ERROR,
      "ERROR",
      "Exception occurred while moving files: " + e.message
    );
  }
}

module.exports.moveFile = moveFile;
