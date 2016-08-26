require([
	'Static/js/application'
	],function(application){
	application.init();
	var $window = $(window);
	var resizeTimer = null;

	var initialized = false;
	var initialize = function(first){
		var timeout = function(){
			//第一次加载
			if ( initialized === false && first === true )
			{
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