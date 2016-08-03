require(['Static/js/application'],function(application){
	application.init();
	$(':checkbox[cs-control]').CheckBoxInit();
	$(':radio[cs-control]').RadioBoxInit();
	$('select[cs-control]').SingleComboxInit();
	$('input[type*=text][cs-control],input[type*=password][cs-control]').ButtonTextBoxInit();
})