define(function(){
	//这里定义全局方法
	return {
		initControl: function(parent){
        	var $parent = parent && parent.length != 0 ? $(parent) : $(document);
        	$parent.find(':checkbox[cs-control]').CheckBoxInit();
        	$parent.find(':radio[cs-control]').RadioBoxInit();
        	$parent.find('select[cs-control]').SingleComboxInit();
        	$parent.find('input[type*=text][cs-control*=ButtonTextBox],input[type*=password][cs-control*=ButtonTextBox]').ButtonTextBoxInit();
            $parent.find('input[type*=text][cs-control*=DataPicker]').DataPickerInit();
            $parent.find('input[cs-control][type*=file]').ProtoUploadInit();
        },
		_init_:function(){
			//这里添加页面加载完成后公用的初始化功能
			this.initControl()
		}
	}
})