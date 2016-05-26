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
    map: {
        '*': {
            'css': 'libs/require-css/css.min' // or whatever the path to require-css is
        }
    },
    paths: {
        "jquery.ui": "libs/jquery-ui",
        "Class": "common/core/Class",
        "Core": "common/core/Core",
        "Guid": "common/core/Guid",
        "TPLEngine": "common/engine/tplEngine",
        "widget": "comsys/widget",
        "client": "common/client",

        "echarts": "libs/echarts/echarts",
        "jquery": "libs/jquery/dist/jquery.min",
        "vue": "libs/vue/dist/vue",
        "ztree": "libs/ztree/jquery.ztree",
        "system": "../../Content",
    }
});

require(['jquery', 'application'], function($, application) {
    application.initialize();
});
