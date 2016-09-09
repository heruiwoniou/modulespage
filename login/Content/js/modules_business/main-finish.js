define(function(){
	//code here
	return {
		//mothod here
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			$(".tab-control").each(function(){
				var $this = $(this)
				var $navs = $this.find('.tab-head li');
				var $contents= $this.find('.tab-body .tab-content');
				$navs.bind('click',function(){
					var $nav = $(this);
					if($nav.hasClass('select')) return ;
					var index= $nav.index();
					$navs.removeClass('select');
					$nav.addClass('select')
					$contents.hide().removeClass('select').eq(index).show()
				})
			});

			$('#datapicker-panel').datepicker($.datepicker.regional[ "zh-CN" ])
		}
	}
})