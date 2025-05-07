"use strict";

var Status = require("dw/system/Status");
var ProductMgr = require("dw/catalog/ProductMgr");
var File = require("dw/io/File");
var FileWriter = require("dw/io/FileWriter");
var Logger = require("dw/system/Logger");
var CSVStreamWriter = require("dw/io/CSVStreamWriter");

function createFile() {
  try {
    var folder = new File(File.IMPEX + "/src/Pavitra");
    if (!folder.exists()) {
      folder.mkdirs();
    }

    var catalogFile = new File(File.IMPEX + "/src/Pavitra/catalogData.csv");
    if (!catalogFile.exists()) {
      catalogFile.createNewFile();
    }

    var writeCatalogFile = new FileWriter(catalogFile);
    var writeCSVCatalogFile = new CSVStreamWriter(writeCatalogFile);

    writeCSVCatalogFile.writeNext([
      "Product ID",
      "Product Name",
      "Price",
      "Inventory",
      "Primary Category",
      "Brand",
    ]);

    var allProducts = ProductMgr.queryAllSiteProducts();

    try {
      while (allProducts.hasNext()) {
        var product = allProducts.next();

        if (!product.online && !product.searchable && product.isMaster()) {
          continue;
        }

        var productID = product.getID();
        var productName = product.getName();
        var brand = product.brand ? product.brand : "";
        var price = product.getPriceModel().price.value || 0;
        var inventoryQty = product.availabilityModel.availability || 0;

        var primaryCategory = product.getPrimaryCategory()
          ? product.getPrimaryCategory().displayName
          : "null";

        writeCSVCatalogFile.writeNext([
          productID,
          productName,
          price,
          inventoryQty,
          primaryCategory,
          brand,
        ]);
      }
    } finally {
      allProducts.close();
    }

    writeCSVCatalogFile.close();
    return new Status(Status.OK, "OK", "Catalog feed generated successfully");
  } catch (e) {
    Logger.error("Error generating catalog feed: " + e.toString());
    return new Status(
      Status.ERROR,
      "ERROR",
      "Error generating catalog feed: " + e.message
    );
  }
}

module.exports.createFile = createFile;
