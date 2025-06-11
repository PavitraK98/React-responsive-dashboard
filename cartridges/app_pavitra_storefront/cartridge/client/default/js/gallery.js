'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./gallery/baseGallery'));
    processInclude(require('./gallery/galleryModal'));
});
