define(function(){
	//这里定义全局方法
	return {
		//这里定义WebApi方法
		scrollReplace: function(parent) {
            var $parent = parent && parent.length != 0 ? $(parent) : $(".scroll-bar");
            $parent.scrollBar({
                theme: "dark",//"inset-dark"//"inset-2-dark",//minimal-dark//dark-3//"dark-2",
                scrollInertia: 400,
                advanced:{ autoScrollOnFocus: false },
                autoHideScrollbar:true,
                scrollButtons:{enable:false}
            });
        },
        //这里是加载完所有js后执行的公用接口
		_init_:function(){
			//滚动条初始化
			this.scrollReplace()
			//这里添加页面加载完成后公用的初始化功能
		}
	}
})