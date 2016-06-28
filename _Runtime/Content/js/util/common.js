define(function() {
        //to define something
        //
        var library = {}
        var common = {
            scrollReplace: function(parent) {
                var $parent = parent&&parent.length!=0 ? $(parent) : $(".mCustomScrollbar");
                $parent.mCustomScrollbar({
                    theme: "dark",//"inset-dark"//"inset-2-dark",//minimal-dark//dark-3//"dark-2",
                    scrollInertia: 400,
                    advanced:{ autoScrollOnFocus: false },
                    autoHideScrollbar:true,
                    scrollButtons:{enable:false}
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
