define(['Static/js/common/client/Request',],function(request){
	//code here
	return {
		//mothod here
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			$(".menu-min li:has(a[href*='" + request['module'] + "'])").addClass('select');
		}
	}
})

