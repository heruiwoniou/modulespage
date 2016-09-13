require([
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
    // 'Static/js/libs/jquery.scrollbar/jquery.img_silder'
    // 'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar.concat'
],function(application){
    application.init();
    /**
     * [图片加载]
     */
    $.loadImage();

    $(".scroll-bar").scrollBar({
        scrollInertia: 400,
        advanced:{ autoScrollOnFocus: false },
        autoHideScrollbar:true,
        scrollButtons:{enable:false},
        advanced:{ updateOnImageLoad: false }
    });



    $(function(){
        $('.school_news_l_t .school_news_l_t_nav span').click(function(){
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            $(this).parent().parent().next().children().hide().eq($(this).index()).show();
        });
        /*轮播 start==========================*/
        //判断图片居中位置
        var wrap = $('.silder_list'),
            _active = $('.active_list');

        var silder_list_left = wrap.width() - 1920;
        wrap.css('left' , silder_list_left + 'px');
        /*只显示第一张图片*/
        wrap.children('li').children('img').hide().eq(0).show();
        var _index = 0;
        //添加下方点击btn
        for(var i = 0 ;i<wrap.children().size();i++){
            _active.append("<span></span>");
        }
        //判断点击btn位置居中
        _active.children('span').eq(0).addClass('active');
        _active.css('left', (wrap.width() - _active.width())/2 + 'px');
        /*btn点击切换高亮*/
        _active.children('span').click(function(){
            var _that = this;
            var _thatIndex = $(_that).index();
            /*执行图片切换函数*/
            if(_index !== _thatIndex ) {
                // clearInterval(next);
                fade(_thatIndex);
            }else{}
        });
        function fade(_thatIndex){
            // console.log('index='+_index + ';;;this.index=='+ _thatIndex);
            _active.children('span').removeClass('active');
            _active.children('span').eq(_thatIndex).addClass('active');
            /*轮播执行代码*/
            wrap.children('li').children('img').fadeOut();
            wrap.children('li').children('img').eq(_thatIndex).fadeIn();
            _index = _thatIndex;
        }
        var next = setInterval(function(){
            if(_index + 1 == wrap.children().size())_index = 0;
            else _index ++;
            fade(_index);
        },5000);
        /*==================================轮播 end*/
    })

});