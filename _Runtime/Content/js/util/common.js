define(function() {
        //to define something
        //
        var library = {}
        var common = {
            scrollReplace: function(parent) {
                var $parent = parent&&parent.length!=0 ? $(parent) : $(".mCustomScrollbar");
                $parent.mCustomScrollbar({
                    theme: "dark",
                    scrollInertia: 400,
                    alwaysShowScrollbar: 2
                });
            },
            init: function() {
                //init controls
                WebApi.initControl();
                //LoadImage
                WebApi.imageViewerInit();
                //Scroll init
                WebApi.scrollReplace();
                //to do something
            }
        }
        $.extend(WebApi, library);
        return common;
    })