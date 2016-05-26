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
            WebApi.initControl();

            //Scroll init
            this.scrollReplace();

            //to do something
        }
    }

    $.extend(WebApi, library);

    return common;
})
