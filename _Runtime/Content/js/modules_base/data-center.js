require([
	'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
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


})