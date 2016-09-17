require([
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function(application) {
    application.init();
    var $main = $('.main');
    var $sections = $(".section");
    var $pageControls = $(".nav-page-control");
    var $swbanners = $('.swbanner');
    var $window = $(window);
    var resizeTimer = null;

    /**
     * [initialize 页面初始化函数 及 页面重绘后重新计算]
     * @param  {[type]} resize [是否是计算高度]
     * @return {[type]}        [函数本身]
     */
    var initialized = false;
    var initialize = function(first) {
        $main.hide();
        var timeout = function() {
            //框架计算
            var h = $window.height();
            $sections.css({ minHeight: h > 890 ? (h < 940 ? h : 940) : 890 });
            $main.show();

            //分页控制计算
            $pageControls.each(function() {
                var $pageControl = $(this)
                var $pageContainer = $pageControl.prev('.nav-page');
                var $pageContent = $pageContainer.find('ul');
                var $pageItems;

                var pageViewHeight = $pageContainer.height();
                var pageOffsetHeight = $pageContent.height();
                var totalPage = pageOffsetHeight / pageViewHeight;
                //清空翻页标签
                $pageControl.html("");
                for (var i = 0; i < totalPage; i++)
                    $pageControl.append("<a href='javascript:;'></a>");
                $pageItems = $pageControl.find("a");

                //设置到第一页
                $pageItems.first().addClass('current');
                $pageContainer.stop().scrollTop(0);
                $pageItems.mouseenter(function() {
                    var $this = $(this);
                    var index = $this.index();
                    $pageItems.removeClass('current');
                    $this.addClass('current')
                    $pageContainer.stop().animate({ scrollTop: index * pageViewHeight });
                })
            });

            //第一次加载
            if (initialized === false && first === true) {
                $(".scroll-bar").scrollBar({
                    scrollInertia: 400,
                    autoHideScrollbar: true,
                    scrollButtons: { enable: false },
                    advanced: { updateOnImageLoad: false }
                });

                //轮播控件生成
                //第一生成按钮
                $swbanners.swbanner({
                    speed: 2000,
                    control2: true,
                    showed: function(i) {
                        if (i === 0)
                            this.find('.text-wraper').fadeIn()
                        else
                            this.find('.text-wraper').fadeOut()
                    }
                });

                /**
                 * [图片加载]
                 */
                $.loadImage();

                //设置加载完成
                initialized = true;
            } else if (initialized === true && first !== true) {
                //重新计算高宽
                $swbanners.each(function() {
                    var $bannerContainer = $(this);
                    var $images = $bannerContainer.data('images');
                    var width = $bannerContainer.width();
                    var height = $bannerContainer.height();
                    $images.each(function(i, el) {
                        WebApi.computed(el.src, width, height).done(function(w, h, horizontal) {
                            var $el = $(el);
                            if (horizontal)
                                $el.css({ left: '0', top: '50%', width: '100%', height: 'auto', marginTop: h / -2 + 'px', marginLeft: 0 });
                            else
                                $el.css({ left: '50%', top: '0', width: 'auto', height: '100%', marginLeft: w / -2 + 'px', marginTop: 0 });
                        })
                    });
                });
            }
        };
        if (initialized && first !== true) {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(timeout, 200);
        } else if (!initialized && first === true) timeout();
        return arguments.callee
    }

    $window.resize(initialize(true));
});