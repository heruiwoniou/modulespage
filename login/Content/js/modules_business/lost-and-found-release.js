define(function(){
	//code here
	return {
		//mothod here
		onUploaded:function(isNew, image){
			if(isNew&&image)
			{
				$('#picturebox').prepend('<input type="file" name="file" cs-control cs-onuploaded="WebApi.onUploaded">')
				$('#picturebox').find('input[cs-control][type*=file]').ProtoUploadInit();
			}
		},
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
		}
	}
})