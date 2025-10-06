var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/**
 * executes an arbitrary scapi request
 * @param {string} serviceId optional service Id, in case an scapi service is already configured
 * @returns {Object} scapi result
 */
module.exports.getService = function getService(serviceId) {
        /**
         * 
         * @param {dw.svc.Service} service initialized by the plattform. it assumes the url is maintained in service credentials including the following placeholders
         * https://abcedf.api.commercecloud.salesforce.com/{apiFamily}/v1/organizations/abcd_stg/{apiDetails}
         * 
         * @param {Object} args the option arguments
         * @param {String} args.apiFamily the api family - the first to elements of the scapi path
         * @param {String} args.apiDetails the api detail - the last elements of the scapi path and the query string
         * @returns {String} the request body, the platform should send
         */
    return LocalServiceRegistry.createService(serviceId || 'scapi.internal', {
        createRequest: function (service, args) {
            var urlPattern = service.configuration.credential.URL;
            var url = urlPattern.replace('{apiFamily}',args.apiFamily).replace('{apiDetails}', args.apiDetails)

            if (args.bearer) {
                service.addHeader('Authorization', 'Bearer ' + args.bearer);
            }

            service.setURL(url);
            service.setRequestMethod(args.method);

            return args.body;
        },
        parseResponse: function (service, result) {
            var returns = result.text;
            try {
                returns = JSON.parse(result.text);
            } catch (e) {
                var Logger = require('dw/system/Logger');
                Logger.warn('Scapi Service unable to parse JSON to Object return string instead {0}', e)
            }
            return returns || result;
        }
    });
};

/**
 * Gets an account manager admin token to be used with SCAPI admin apis
 * @param {string} serviceId optional service Id, in case an account manager service is already configured
 * @returns {string} Bearer token for SCAPI
 */
module.exports.getAuthToken = function getAuthToken(serviceId) {
    return LocalServiceRegistry.createService(serviceId || 'am.auth', {
        /**
         * 
         * @param {dw.svc.Service} service initialized by the plattform
         * @param {Object} args the option arguments
         * @param {String} args.tenant the tenant id of the instance the bearer should work for. i.e. abcd_stg
         * @param {String} args.scopes the scapi scopes the bearer should work for
         * @returns {String} the request body, the platform should send
         */
        createRequest: function (service, args) {
            var cred = service.getConfiguration().getCredential();
            var StringUtils = require('dw/util/StringUtils');
            service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
            service.setRequestMethod('POST');
            var data = 'grant_type=client_credentials&';
            data += encodeURI('scope=SALESFORCE_COMMERCE_API:' + args.tenant + ' ' + args.scopes);
            return data;
        },
        parseResponse: function (service, result) {
            return JSON.parse(result.text).access_token;
        }
    });
};
