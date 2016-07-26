require(['Static/js/application','Static/js/libs/jquery.stellar/jquery.stellar'],function(application){
	application.init();
	$(".small-nav-button").click(function(){
		var $this = $(this);
		var $parent = $this.parent();
		var $uls = $parent.find('.small-nav-menu ul');
		if( $uls.length > 1)
		{
			var $current = $uls.filter('.current').first();
			var $next = $current.next();
			if($next.length === 0) $next = $uls.first();
			$next.removeClass('last')
			window.setTimeout(function(){
				$next.addClass('current');
				$current.removeClass('current').addClass('last');
			},300);
		}
	});

	$.stellar({ horizontalScrolling: false });
})