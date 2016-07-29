require.config({
    baseUrl: "./"
});
var WebApi = {};
define([
    'jquery',
    'Content/js/common/util',

    'css',
    'text',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function($, util) {
    $.extend(WebApi, util);
    return {
        interface: function(action) {
            if (action) {
                $.extend(WebApi, action);
                if (WebApi.init() !== false) util._init_();
            } else util._init_();
        },
        init: function() {
            var scripts = document.getElementsByTagName("script"),
                l = scripts.length,
                main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("data-business"))) break;
            if (main)
                require(["Content/js/modules_business/" + main], this.interface);
            else util._init_();
        }
    }
})
