'use strict';

let File = require('dw/io/File');
let FileReader = require('dw/io/FileReader');
let FileWriter = require('dw/io/FileWriter');
let XMLStreamReader = require('dw/io/XMLStreamReader');
let XMLStreamWriter = require('dw/io/XMLStreamWriter');
let XMLStreamConstants = require('dw/io/XMLStreamConstants');
let Logger = require('dw/system/Logger');
let Status = require('dw/system/Status');
let ArrayList = require('dw/util/ArrayList');

const typesToInclude = ['page', 'component'];

/**
 * Get all page designer pages from a given library file.
 *
 * @param {String} libraryName - the name of the library to use in the export file
 * @param {String} sourcePath - the folder path, where the source file (given in parameter "sourceFileName") is located. It's relative to IMPEX/src.
 * @param {String} sourceFileName - the name of the source file, including extension.
 * @param {String} targetPath - the folder path, in which the target file (given in parameter "targetFileName") will be placed. It's relative to IMPEX/src.
 * @param {String} targetFileName - the name of the target file, including extension.
 */
function getAllPageDesignerPages(libraryName, sourcePath, sourceFileName, targetPath, targetFileName) {
    // get the File representation of the input file
    let inputFile;
    try {
        inputFile = getInputFile(sourcePath, sourceFileName);
    } catch (e) {
        Logger.error('Error: ' + e.message);
        return new Status(Status.ERROR, 'ERROR', 'Something went wrong with the source file!');
    }

    if (!empty(inputFile)) {
        // get the File representation of the input file
        let outputFile;
        try {
            outputFile = getOutputFile(targetPath, targetFileName);
        } catch (e) {
            Logger.error('Error: ' + e.message);
            return new Status(Status.ERROR, 'ERROR', 'Something went wrong with the output file!');
        }

        if (!empty(outputFile)) {
            // read the source library file
            let fileReader = new FileReader(inputFile, 'UTF-8');
            let xmlStreamReader = new XMLStreamReader(fileReader);

            // open the xml stream writer to write the output library file
            let fileWriter = new FileWriter(outputFile, 'UTF-8');
            let xmlStreamWriter = new XMLStreamWriter(fileWriter);

            xmlStreamWriter.writeStartDocument('UTF-8', '1.0');
            xmlStreamWriter.writeRaw(`<library xmlns="http://www.demandware.com/xml/impex/library/2006-10-31" library-id="${libraryName}">`);

            while (xmlStreamReader.hasNext()) {
                if (xmlStreamReader.next() === XMLStreamConstants.START_ELEMENT) {
                    let localElementName = xmlStreamReader.getLocalName();

                    // add all folders to output library file
                    if (localElementName === "folder") {
                        let folderXML = xmlStreamReader.readXMLObject();

                        xmlStreamWriter.writeRaw(folderXML);
                    }

                    // find all content blocks
                    if (localElementName === "content") {
                        let contentXML = xmlStreamReader.readXMLObject();

                        let parsedXMLObject = parseXML(contentXML);

                        // check if the type of the parsed xml object starts either with "page" or "component" (see variable typesToInclude), only if it is one of those types it can be added to the output library file
                        let isPageOrComponent = typesToInclude.some((typeToInclude) => {
                            return parsedXMLObject.type && parsedXMLObject.type.indexOf(typeToInclude) > -1;
                        });

                        if (!empty(isPageOrComponent) && isPageOrComponent) {
                            // add complete content xml string to output xml file
                            xmlStreamWriter.writeRaw(contentXML);
                        }
                    }
                }
            }

            xmlStreamWriter.writeRaw('</library>');

            xmlStreamReader.close();
            fileReader.close();

            xmlStreamWriter.close();
            fileWriter.close();
        }
    }

    return new Status(Status.OK);
}

/**
 * Get all page designer pages from a given library file.
 *
 * @param {String} libraryName - the name of the library to use in the export file
 * @param {String} sourcePath - the folder path, where the source file (given in parameter "sourceFileName") is located. It's relative to IMPEX/src.
 * @param {String} sourceFileName - the name of the source file, including extension.
 * @param {String} targetPath - the folder path, in which the target file (given in parameter "targetFileName") will be placed. It's relative to IMPEX/src.
 * @param {String} targetFileName - the name of the target file, including extension.
 * @param {Array[String]} PDPageIDs - contains the page designer page ID(s)
 */
function getSpecificPageDesignerPages(libraryName, sourcePath, sourceFileName, targetPath, targetFileName, PDPageIDs) {
    // get the File representation of the input file
    let inputFile;
    try {
        inputFile = getInputFile(sourcePath, sourceFileName);
    } catch (e) {
        Logger.error('Error: ' + e.message);
        return new Status(Status.ERROR, 'ERROR', 'Something went wrong with the source file!');
    }

    if (!empty(inputFile)) {
        // get the File representation of the input file
        let outputFile;
        try {
            outputFile = getOutputFile(targetPath, targetFileName);
        } catch (e) {
            Logger.error('Error: ' + e.message);
            return new Status(Status.ERROR, 'ERROR', 'Something went wrong with the output file!');
        }

        if (!empty(outputFile)) {
            // read the source library file
            let fileReader = new FileReader(inputFile, 'UTF-8');
            let xmlStreamReader = new XMLStreamReader(fileReader);

            // open the xml stream writer to write the output library file
            let fileWriter = new FileWriter(outputFile, 'UTF-8');
            let xmlStreamWriter = new XMLStreamWriter(fileWriter);

            let subPDPages = new ArrayList();

            xmlStreamWriter.writeStartDocument('UTF-8', '1.0');
            xmlStreamWriter.writeRaw(`<library xmlns="http://www.demandware.com/xml/impex/library/2006-10-31" library-id="${libraryName}">`);

            while (xmlStreamReader.hasNext()) {
                if (xmlStreamReader.next() === XMLStreamConstants.START_ELEMENT) {
                    let localElementName = xmlStreamReader.getLocalName();

                    // add all folders to output library file
                    if (localElementName === "folder") {
                        let folderXML = xmlStreamReader.readXMLObject();

                        xmlStreamWriter.writeRaw(folderXML);
                    }

                    // find all content blocks
                    if (localElementName === "content") {
                        let contentXML = xmlStreamReader.readXMLObject();

                        let parsedXMLObject = parseXML(contentXML);

                        // check if the type of the parsed xml object starts either with "page" or "component" (see variable typesToInclude), only if it is one of those types it can be added to the output library file
                        let isPageOrComponent = typesToInclude.some((typeToInclude) => {
                            return parsedXMLObject.type && parsedXMLObject.type.indexOf(typeToInclude) > -1;
                        });

                        // check that ID of current content is one of the requested content IDs
                        let isRelevantPageID = PDPageIDs.some((pageID) => {
                            return parsedXMLObject.id && parsedXMLObject.id === pageID;
                        });

                        // only when content is a page (or component) and the content ID is one of PDPageIDs, then write content to output file
                        // and check for sub pages
                        if (!empty(isPageOrComponent) && isPageOrComponent && !empty(isRelevantPageID) && isRelevantPageID) {
                            // if current page contains regions and/or components, add them to the ArrayList subPDPages, as these sub pages also need to be extracted
                            if (parsedXMLObject.contentLinks.length > 0) {
                                subPDPages.add(parsedXMLObject.contentLinks);
                            }

                            // add complete content xml string to output xml file
                            xmlStreamWriter.writeRaw(contentXML);
                        }
                    }
                }
            }

            xmlStreamReader.close();
            fileReader.close();

            if (!subPDPages.isEmpty()) {
                // get all sub pages of requested page designer pages
                let allSubPages = getAllSubPages(subPDPages, inputFile);

                // write all relevant sub pages to output xml file
                writeSubPages(allSubPages, xmlStreamWriter, inputFile);
            }

            xmlStreamWriter.writeRaw('</library>');

            xmlStreamWriter.close();
            fileWriter.close();
        }
    }
}

/**
 * Get a list of sub pages of given pages
 *
 * @param {dw.util.ArrayList} subPDPages - array of page designer pages, which will be checked for sub pages
 * @param {dw.io.File} inputFile - source file, which will be used to get information about sub pages
 * @returns {dw.util.ArrayList<String>} - array of all subsequent page designer pages for all given page designer pages
 */
function getAllSubPages(subPDPages, inputFile) {
    var allSubPages = new ArrayList(subPDPages);

    let subPDPagesIterator = subPDPages.iterator();
    while (subPDPagesIterator.hasNext()) {
        let subPDPageID = subPDPagesIterator.next();
        checkPageID(subPDPageID, inputFile, allSubPages);
    }

    return allSubPages;
}

/**
 * Checks one specific page designer page ID and all sub-pages of that specific page
 *
 * @param {string} pageID - page designer page ID, which needs to be checked
 * @param {dw.io.File} inputFile - source file, which will be used to get information about sub pages
 * @param {dw.util.ArrayList<String>} allSubPages - array of all subsequent page designer pages for all given page designer pages
 */
function checkPageID(pageID, inputFile, allSubPages) {
    let fileReaderForSubPDPages = new FileReader(inputFile, 'UTF-8');
    let xmlStreamReaderForSubPDPages = new XMLStreamReader(fileReaderForSubPDPages);

    while (xmlStreamReaderForSubPDPages.hasNext()) {
        if (xmlStreamReaderForSubPDPages.next() === XMLStreamConstants.START_ELEMENT) {
            let localElementName = xmlStreamReaderForSubPDPages.getLocalName();

            if (localElementName === "content") {
                let contentXML = xmlStreamReaderForSubPDPages.readXMLObject();
                let parsedXMLObject = parseXML(contentXML);

                // content is in subPDPages and content has sub-pages, write sub pages to array
                if (parsedXMLObject.id === pageID && parsedXMLObject.contentLinks.length > 0) {
                    allSubPages.add(parsedXMLObject.contentLinks);
                    for (let i = 0; i < parsedXMLObject.contentLinks.length; i++) {
                        checkPageID(parsedXMLObject.contentLinks[i], inputFile, allSubPages);
                    }

                }
            }
        }
    }

    xmlStreamReaderForSubPDPages.close();
    fileReaderForSubPDPages.close();
}

/**
 * Writes all given page designer pages to the output xml file
 *
 * @param {dw.util.ArrayList} subPDPages - array of page designer pages, which will be checked for sub pages
 * @param {dw.io.XMLStreamWriter} xmlStreamWriter - xml stream writer used to write all content to the same xml file
 * @param {dw.io.File} inputFile - source file, which will be used to get information about sub pages
 */
function writeSubPages(subPDPages, xmlStreamWriter, inputFile) {
    let subPDPagesIterator = subPDPages.iterator();
    // loop through all collected sub page designer pages and retrieve them from the file
    // to retrieve those sub pages it is required to go again through the input file
    while (subPDPagesIterator.hasNext()) {
        let subPDPageID = subPDPagesIterator.next();
        let fileReaderForSubPDPages = new FileReader(inputFile, 'UTF-8');
        let xmlStreamReaderForSubPDPages = new XMLStreamReader(fileReaderForSubPDPages);

        while (xmlStreamReaderForSubPDPages.hasNext()) {
            if (xmlStreamReaderForSubPDPages.next() === XMLStreamConstants.START_ELEMENT) {
                let localElementName = xmlStreamReaderForSubPDPages.getLocalName();

                if (localElementName === "content") {
                    let contentXML = xmlStreamReaderForSubPDPages.readXMLObject();
                    let parsedXMLObject = parseXML(contentXML);

                    // check that ID of current content is one of the requested content IDs
                    let isRelevantPageID = (parsedXMLObject.id === subPDPageID);

                    if (!empty(isRelevantPageID) && isRelevantPageID) {
                        xmlStreamWriter.writeRaw(contentXML);
                    }
                }
            }
        }

        xmlStreamReaderForSubPDPages.close();
        fileReaderForSubPDPages.close();
    }
}

/**
 * Returns the source library file.
 *
 * @throws Error when file is not available
 * @param {String} sourcePath - the folder path, where the source file is located.
 * @param {String} sourceFileName - the name of the source file, including extension.
 * @returns {dw.io.File} - the source library file
 */
function getInputFile(sourcePath, sourceFileName) {
    let inputFileName = File.IMPEX + '/src/' + sourcePath + sourceFileName;
    let inputFile = new File(inputFileName);

    if (!inputFile.exists()) {
        throw new Error(`Library file not found under: ${inputFileName}`);
    }

    return inputFile;
}

/**
 * Returns the output library file. It creates the directories (if required) and the output file (if required).
 *
 * @param {String} targetPath - the folder path, in which the target file will be placed.
 * @param {String} targetFileName - the name of the target file, including extension.
 * @returns {dw.io.File} - the output library file
 */
function getOutputFile(targetPath, targetFileName) {
    let outputFilePath = File.IMPEX + '/src/' + targetPath;
    let outputFilePathAsFile = new File(outputFilePath);

    if (!outputFilePathAsFile.isDirectory()) {
        let status = outputFilePathAsFile.mkdirs();
        if (!status) {
            throw new Error(`File path ${outputFilePathAsFile.getFullPath()} could not be created!`);
        }
    }

    let outputFileName = outputFilePathAsFile.getFullPath() + targetFileName;
    let outputFile = new File(outputFileName);

    if (!outputFile.exists()) {
        let status = outputFile.createNewFile();
        if (!status) {
            throw new Error(`File ${outputFile.getFullPath()} could not be created!`);
        }
    }

    return outputFile;
}

/**
 * Parses a given content XML snippet and finds the id, type and contentLinks in it.
 *
 * @param {XML} xmlToParse - the xml snippet, from which certain data need to be extracted.
 * @returns {object} result - object with extracted data
 * @returns {string} result.id - id of the content snippet.
 * @returns {string} result.type - type of the content snippet.
 * @returns {Array[string]} result.contentLinks - array, which holds the ID(s) of all child content.
 */
function parseXML(xmlToParse) {
    let result = {};

    let contentIdXMLAttribute = xmlToParse.attribute('content-id');
    let contentIdValue = contentIdXMLAttribute.toString();

    result['id'] = contentIdValue;
    result['contentLinks'] = [];

    const childNodes = xmlToParse.children();
    for (let i in childNodes) {
        let inInnerSearchElement = childNodes[i];
        let attr = inInnerSearchElement.localName();
        if (attr === 'type') {
            result[attr] = inInnerSearchElement.toString();
        } else if (attr === 'content-links') {
            const contentLinksChildren = inInnerSearchElement.children();
            for (let j in contentLinksChildren) {
                let contentLink = contentLinksChildren[j];
                const contentLinkID = contentLink.attribute('content-id').toString();
                if (!empty(contentLinkID)) {
                    result['contentLinks'].push(contentLinkID);
                }
            }

        }
    }

    return result;
}

module.exports = {
    getAllPageDesignerPages,
    getSpecificPageDesignerPages
};
