/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application config
*/

//set config
require.config({
    // urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl: "Static/js",
    paths: {
        "css": 'libs/require-css/css.min',
        "jquery": "libs/jquery/dist/jquery.min",
        "jquery.ui": "libs/jquery-ui",
        "Class": "common/core/Class",
        "Core": "common/core/Core",
        "Guid": "common/core/Guid",
        "TPLEngine": "common/engine/tplEngine",
        "widget":"comsys/widget",
        "client":"common/client",
        "vue":"libs/vue/dist/vue"
    }
});

require(['jquery', 'application'], function ($, application) {
    application.initialize();
});
