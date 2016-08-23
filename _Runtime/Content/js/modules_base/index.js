require([
	'Static/js/application',
	'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function(application) {
	application.init();

	var back = new Image();
	back.onload = function() {
		$(document.body).css({
			backgroundImage: 'url(\"Content/style/images/background-image.jpg\")'
		}).addClass('loadedImage')
	}
	back.src = 'Content/style/images/background-image.jpg';

	$('.img-container').each(function(i) {
		var $this = $(this);
		var img = new Image();
		$this.append(img)
		window.setTimeout(function() {
			img.onload = function() {
				delete img.width
				delete img.height
				if($this.data('model') === 'min')
				{
					if (img.width > img.height)
						img.style.width = '100%'
					else
						img.style.height = '100%'
				}else
				{
					if (img.width > img.height)
						img.style.height = '100%'
					else
						img.style.width = '100%'
				}
				$this.addClass('loaded')
			};
			img.src = $this.data('src');
		}, i * 10)
	});

	$(".horizontal-scroll-bar").scrollBar({
		theme: "dark",//"inset-dark"//"inset-2-dark",//minimal-dark//dark-3//"dark-2",
		scrollInertia: 400,
		axis:'x',
		advanced:{ autoScrollOnFocus: false },
		autoHideScrollbar:true,
		scrollButtons:{enable:false}
	});

	$("#news-tab-control").each(function(){
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

	var $document = $(document)
	var $sysmenu = $("#system-menu");
	var $userpanel = $("#user-panel");
	var top = -124;
	$sysmenu.css({ top :  top + $document.scrollTop() + 'px' })
	$userpanel.css({top : $document.scrollTop() + 'px'})
	$document.on('scroll',function(){
		$sysmenu.css({ top :  top + $document.scrollTop() + 'px' })
		$userpanel.css({top : $document.scrollTop() + 'px'})
	});
})
