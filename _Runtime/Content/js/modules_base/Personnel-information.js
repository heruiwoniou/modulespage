require([
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
    // 'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar.concat'
],function(application){
    application.init();
    /**
     * [图片加载]
     */
    $.loadImage();

    $(".scroll-bar").scrollBar({
        //theme:
        //"dark",
        //"inset-dark"
        //"inset-2-dark",
        //minimal-dark
        //dark-3
        //"dark-2",
        scrollInertia: 400,
        advanced:{ autoScrollOnFocus: false },
        autoHideScrollbar:true,
        scrollButtons:{enable:false},
        advanced:{ updateOnImageLoad: false }
    });
    /*点击滚动条*/
    $(function(){
        $('.information_nav ul li').click(function () {
            var ind = $('.information_nav ul li').index(this) + 1;
            $(".main").scrollBar('scrollTo', $('#float0' + ind),{callbacks:{onScroll:function(){
                console.log(123);
            }}});
            $('.information_nav ul li').removeClass('active');
            $(this).addClass('active');
        });
        $('.up_btn').click(function(){
            $(".main").scrollBar('scrollTo', 0)});
        })

});