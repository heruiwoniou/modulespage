/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application config
 */
var WebApi = {};
define(function () {
    return {
        interface: function (action) {
            if (!action) return;
            $.extend(WebApi, action);
            WebApi.init();
        },
        initialize: function () {
            this.load();
        },
        load: function () {
            var scripts = document.getElementsByTagName("script"),l = scripts.length,main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("main"))) break;
            if (!main) return;
            require(["../../Content/js/" + main], this.interface);

        }
    };
});