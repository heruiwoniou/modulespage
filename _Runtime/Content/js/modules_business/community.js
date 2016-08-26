define(function(){
	//code here
	return {
		//mothod here
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			$('#filter').click(function(){
				var $this = $(this);
				if($this.hasClass('on'))
				{
					$this.removeClass('on').addClass('off');
				}else
				{
					$this.removeClass('off').addClass('on');
				}
			})
		}
	}
})

