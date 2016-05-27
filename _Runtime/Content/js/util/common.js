define(function() {
        //to define something
        //
        var library = {}
        var common = {
            scrollReplace: function() {
                $(".mCustomScrollbar").mCustomScrollbar({
                    theme: "dark",
                    scrollInertia: 400
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
