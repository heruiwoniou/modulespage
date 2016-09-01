require([
	'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
	],function(application){
	application.init();
	var $window = $(window);
	var $main = $('.main');
	var resizeTimer = null;
	var $frameLeft = $('.frame-left')

	var initialized = false;
	var initialize = function(first){
		$main.hide();
		var timeout = function(){

			//框架计算
			var h = $window.height();
			$frameLeft.css({ minHeight: h - 85 * 2 - 100 });
			$main.show();

			//第一次加载
			if ( initialized === false && first === true )
			{
				$(".scroll-bar").scrollBar({
					scrollInertia: 400,
					advanced:{ autoScrollOnFocus: false },
					autoHideScrollbar:true,
					scrollButtons:{enable:false},
					advanced:{ updateOnImageLoad: false }
				});
				/**
				 * [图片加载]
				 */
				$.loadImage();

				//设置加载完成
				initialized = true;
			}
			else if(initialized === true && first !== true)
			{
				//重新计算高宽
			}
		};
		if(initialized && first !== true)
		{
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(timeout, 200);
		} else if(!initialized && first === true) timeout();
		return arguments.callee
	}
	$window.resize(initialize(true));
})