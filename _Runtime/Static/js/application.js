require.config({
    baseUrl: "./"
});
var WebApi = {};
define([
    'Content/js/common/util',
    'Static/js/common/client/Request',
    'css',
    'text',
    'Static/js/libs/jquery.easing/jquery.easing',
    'widget/CheckBox',
    'widget/RadioBox',
    'widget/SingleCombox',
    'widget/ButtonTextBox',
    'widget/DataPicker',
    'widget/ProtoUpload'
], function(util) {
    $.extend(WebApi, util);
    return {
        interface: function(action) {
            if (action) {
                $.extend(WebApi, action);
                if (WebApi.init() !== false) util.init();
            } else util.init();
        },
        init: function() {
            var scripts = document.getElementsByTagName("script"),
                l = scripts.length,
                main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("data-business"))) break;
            if (main)
                require(["Content/js/modules_business/" + main], this.interface);
            else util.init();
        }
    }
})
