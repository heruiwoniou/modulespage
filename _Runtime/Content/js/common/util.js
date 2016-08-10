define(function(Responder){
	//这里定义全局方法与属性
    window.globalFileReaderUrl = '/server/uploadimages'
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
        showUploading:function(){
            WebApi.modal('uploading',{content:'<div class="custom-uploading"><i class="icon-coffee color-5"></i>导入数据可能需要几分钟,先喝杯咖啡</div>',width:500,height:150,title:false})
        },
        closeUploading:function(){
            WebApi.close({name:'uploading'});
        },
        initControl: function(parent){
        	var $parent = parent && parent.length != 0 ? $(parent) : $(document);
        	$parent.find(':checkbox[cs-control]').CheckBoxInit();
        	$parent.find(':radio[cs-control]').RadioBoxInit();
        	$parent.find('select[cs-control]').SingleComboxInit();
        	$parent.find('input[type*=text][cs-control*=ButtonTextBox],input[type*=password][cs-control*=ButtonTextBox]').ButtonTextBoxInit();
            $parent.find('input[type*=text][cs-control*=DataPicker]').DataPickerInit();
            $parent.find('input[cs-control][type*=file]').ProtoUploadInit();
        },
        
        //这里是加载完所有js后执行的公用接口
		_init_:function(){
			//滚动条初始化
			this.scrollReplace();
			//初始化控件
			this.initControl();
			//这里添加页面加载完成后公用的初始化功能
			//初始化左侧菜单
			//$(".menu-root").menuInit();
		}
	}
})