/**
 * Job Step Type that backups category rules.
 */
const StringUtils = require('dw/util/StringUtils');

'use strict';

var Logger = require('dw/system/Logger').getLogger('cs.job.BackupCategoryRules');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var File = require('dw/io/File');
var Calendar = require('dw/util/Calendar');
var FileWriter = require('dw/io/FileWriter');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');

var scapiService = require('*/cartridge/scripts/services/scapi.js');
var amTokenDate = new Date(0);
var sfCatalog = CatalogMgr.getSiteCatalog();
var config;

/**
 * Gets current Bearer Token from Account Manager 
 * @returns {string} the bearer token provided by Account manager
 */
function getAccountManagerToken() {
    // assume token validity of 15 mins
    var amToken;
    if (!amToken || amTokenDate.getTime() > (Date.now() - 15 * 60 * 1000)) {
        var amResponse = scapiService.getAuthToken(config.AMServiceId).call({tenant: config.TenantId, scopes: 'sfcc.catalogs'});
        amToken = amResponse.object;
        amTokenDate = new Date();
    }

    return amToken;
}

/**
 * Handles the category rule backup. 
 * @param {dw.catalog.Catalog} category the category which we backup the categorization rule for (if it exists)
 */
function handleCategory(category) {
    category.subCategories.toArray().forEach(function(subCategory) {
        handleCategory(subCategory);
    });

    var token = getAccountManagerToken();
    var scapiResponse =scapiService.getService(config.ScapiServiceId).call({
        method: 'GET', 
        apiFamily: 'product/catalogs', 
        apiDetails: 'catalogs/' + sfCatalog.ID + '/categories/' + category.ID + '/rules', 
        body: null, 
        bearer: token
    });

    if (scapiResponse.object.total > 0) {
        var folder = new File(config.WorkingFolder + '/' + StringUtils.formatCalendar(new Calendar(), "yyyy-MM-dd") + '/')
        folder.mkdirs();
        var file = new File(folder.getFullPath() + '/' + category.ID + '.json');
        if (!file.exists()) {
            file.createNewFile();
        }

        var writer = new FileWriter(file);
        writer.write(JSON.stringify(scapiResponse.object));
        writer.flush();
        writer.close();
    }
}

/**
 * Bootstrap function for the Job
 *
 * @return {dw.system.Status} Exit status for a job run
 */
var run = function (args) {
    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }
    config = args;
    var rootCategory = sfCatalog.root;
    // recursively traverse the category tree
    handleCategory(rootCategory);
};

exports.Run = run;
