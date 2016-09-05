define(function(){
	//code here
	console.log('刷新列表操作请写在这里')
	$('.list tbody tr :checkbox').each(function(){
		var $this = $(this);
		$this.closest('td,th').on('click',function(e){
			e.stopPropagation();
		});
	})
	$(document).on('click','.list tbody tr',function(){
		var paths = window.location.pathname.split('/');
		var toPage = paths[paths.length - 1];
		var module = toPage.substring(0, toPage.indexOf('.'));
		window.location = "appeal-detail.html?module=" + module;
	});

	var $checkbox_all = $('.list thead :checkbox');
	var $checkbox_other = $('.list tbody :checkbox')

	$checkbox_all.on('click', function(){
		var checked = this.checked;
		$checkbox_other.each(function(){
			$(this).data('Control.CheckBox').SetCheck(checked);
		})
	});

	$checkbox_other.on('click', function(){
		var checked = $checkbox_other.length == $checkbox_other.filter(':checked').length;
		$checkbox_all.data('Control.CheckBox').SetCheck(checked);
	})
})

