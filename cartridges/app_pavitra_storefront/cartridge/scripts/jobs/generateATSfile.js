"use strict";

var Status = require("dw/system/Status");
var Logger = require("dw/system/Logger");
var ProductMgr = require("dw/catalog/ProductMgr");
var File = require("dw/io/File");
var FileWriter = require("dw/io/FileWriter");
var XMLStreamWriter = require("dw/io/XMLStreamWriter");

function generateATSfile(args) {
    try {
        var folder = new File(File.IMPEX + "/src/catalog");
        if (!folder.exists()) {
            folder.mkdirs();
        }

        var xmlFile = new File(folder, "atsUpdatedProducts.xml");
        if (xmlFile.exists()) {
            xmlFile.remove();
        }
        xmlFile.createNewFile();

        var writer = new FileWriter(xmlFile, "UTF-8");
        var xmlWriter = new XMLStreamWriter(writer);

        xmlWriter.writeStartDocument("UTF-8", "1.0");

        xmlWriter.writeStartElement("catalog");
        xmlWriter.writeAttribute("catalog-id", "Pavitra-storefront-catalog");
        xmlWriter.writeNamespace("","http://www.demandware.com/xml/impex/catalog/2006-10-31");

        var allProducts = ProductMgr.queryAllSiteProducts();
        try {
            while (allProducts.hasNext()) {
                var product = allProducts.next();

                var ats = product.availabilityModel.availability;
                var availabilityMsg = ats > 0 ? "IN STOCK" : "OUT OF STOCK";

                xmlWriter.writeStartElement("product");
                xmlWriter.writeAttribute("product-id", product.ID);
                xmlWriter.writeStartElement("custom-attributes");

                xmlWriter.writeStartElement("custom-attribute");
                xmlWriter.writeAttribute("attribute-id", "availabilityMessage");
                xmlWriter.writeCharacters(availabilityMsg);
                xmlWriter.writeEndElement(); // custom-attribute
                xmlWriter.writeEndElement(); // custom-attribute
                xmlWriter.writeEndElement(); // product
            }
        } finally {
            allProducts.close();
        }

        xmlWriter.writeEndElement(); // catalog
        xmlWriter.writeEndDocument();
        xmlWriter.close();
        writer.close();

        return new Status(Status.OK, "OK", "XML generated successfully.");
    } catch (e) {
        Logger.error("Error generating ATS XML: " + e.message);
        return new Status(Status.ERROR, "ERROR", "Error generating ATS XML: " + e.message);
    }
}

module.exports.generateATSfile = generateATSfile;
