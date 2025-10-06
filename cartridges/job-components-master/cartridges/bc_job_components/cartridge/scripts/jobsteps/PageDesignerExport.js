'use strict';

let Status = require('dw/system/Status');

let pageDesignerPageExtractor = require('../util/jobs/pageDesignerPageExtractor');

/**
 * Exports either all or only given (based on the job step parameter "PDPageIDs") page designer pages of the current site's library
 * @param {Object} args - job parameters object
 * @param {Object} stepExecution - object containing the information about the job execution and the context
 */
function exportPageDesignerPages(args, stepExecution) {
    if (args['isDisabled'] === true) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it ...');
    }

    let libraryName = args['LibraryName'];
    let sourcePath = args['SourcePath'];
    let sourceFileName = args['SourceFileName'];
    let targetPath = args['TargetPath'];
    let targetFileName = args['TargetFileName'];

    if (empty(sourcePath) || empty(sourceFileName) || empty(targetPath) || empty(targetFileName) || empty(libraryName)) {
        return new Status(Status.ERROR, 'ERROR', 'One of the job parameters "SourcePath", "SourceFileName", "TargetPath", "TargetFileName" or "LibraryName" is not set.');
    }

    // if no leading slash has been entered to source path, add it
    if (sourcePath[0] !== '/') {
        sourcePath = '/' + sourcePath;
    }

    // if no ending slash has been entered to source path, add it
    if (sourcePath[sourcePath.length - 1] !== '/') {
        sourcePath += '/';
    }

    // if no file extension has been entered to input file name, add it
    if (sourceFileName.indexOf('.xml') === -1) {
        sourceFileName += '.xml';
    }

    // if no leading slash has been entered to target path, add it
    if (targetPath[0] !== '/') {
        targetPath = '/' + targetPath;
    }

    // if no ending slash has been entered to target path, add it
    if (targetPath[targetPath.length - 1] !== '/') {
        targetPath += '/';
    }

    // if no file extension has been entered to output file name, add it
    if (targetFileName.indexOf('.xml') === -1) {
        targetFileName += '.xml';
    }

    if ('PDPageIDs' in args && !empty(args['PDPageIDs'])) {
        // transform page designer page IDs to array
        let PDPageIDsParam = args['PDPageIDs'];
        let PDPageIDs = PDPageIDsParam.split(',');

        PDPageIDs.forEach((pageID, i) => {
            PDPageIDs[i] = pageID.trim();
        });

        // export only specific page designer pages, based on given ID(s)
        return pageDesignerPageExtractor.getSpecificPageDesignerPages(libraryName, sourcePath, sourceFileName, targetPath, targetFileName, PDPageIDs);
    } else {
        // export all page designer pages
        return pageDesignerPageExtractor.getAllPageDesignerPages(libraryName, sourcePath, sourceFileName, targetPath, targetFileName);
    }
}

module.exports = {
    exportPageDesignerPages
};
