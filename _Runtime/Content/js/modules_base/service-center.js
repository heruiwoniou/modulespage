require(['Static/js/application','Static/js/common/client/WinResizeResponder'],function(application, responder){
	application.init();
	$(".mCustomScrollbar").mCustomScrollbar({
		theme: "dark",
		scrollInertia: 400,
		advanced:{ autoScrollOnFocus: false },
		autoHideScrollbar:true,
		scrollButtons:{enable:false}
	});
	var $content = $("#search-result")
	responder.resize(function(wh){
		$content.height(wh - 335);
	});

	var $link_words = $("#word-key-panel a");
	$link_words.click(function(){
		var $this = $(this);
		var key = $this.html();
		var $target = $content.find('.section-title:contains('+ key +')');
		if($target.length!==0)
		{
			$content.mCustomScrollbar("scrollTo",$target);
			$link_words.removeClass('select');
			$this.addClass('select');
		}
	})
})