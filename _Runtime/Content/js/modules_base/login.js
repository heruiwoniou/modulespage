require([
    'Static/js/application'
], function(application) {
    application.init();

    var $main = $('body');
    var $window = $(window);
    var $swbanners = $('#swbanner');
    var $aphorism = $('.aphorism')
    var resizeTimer = null;
    var aphorismToggleTimer = null;
    var aphorismStop = function(){
    	window.clearInterval(aphorismToggleTimer);
    }
   	var aphorismPlay = function(speed){
   		//警句切换
   		window.clearInterval(aphorismToggleTimer);
   		aphorismToggleTimer = window.setInterval(function(){
   			$aphorism.fadeOut(function(){
   				if($aphorism.hasClass('aphorism-1'))
   					$aphorism.removeClass('aphorism-1').addClass('aphorism-2').fadeIn();
   				else
   					$aphorism.removeClass('aphorism-2').addClass('aphorism-1').fadeIn();

   			})
   		}, speed);
   	}
	/**
	 * [initialize 页面初始化函数 及 页面重绘后重新计算]
	 * @param  {[type]} resize [是否是计算高度]
	 * @return {[type]}        [函数本身]
	 */
	var initialize = function(resize){
		$main.hide();
		var cb = function() {};
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(function(){

			var h = $window.height() - 200 - 100 - 35;
			$swbanners.css({ height: h < 285 ? 285 : h });
			//第一次加载
			if(resize === false)
			{
				$swbanners.swbanner({
					speed: 5000,
					control2: true,
					defaultWidth: $window.width(),
					played:function(speed){
						aphorismPlay(speed);
					},
					stoped:function(){
						aphorismStop()
					}
				});
				$.loadImage();

				cb = function(){
					$(".login-panel:first").addClass('forward-in');
				}

				$('.login-panel .toggle').click(function(){
					var $this = $(this).closest('.login-panel');
					var $other = $this.siblings();
					$this.addClass('forward-out');
					window.setTimeout(function(){
						$this.removeClass('forward-in forward-out');
						$other.addClass('forward-in');
					},150)
				});

				$('.input').click(function(){
					$(this).find('input').focus()
				})
			}else
			{
				//重新计算高宽
				$swbanners.each(function(){
					var $bannerContainer = $(this);
					var $images = $bannerContainer.data('images');
					var width = $window.width();
					var height = $bannerContainer.height();
					$images.each(function(i, el){
						WebApi.computed(el.src, width, height).done(function(w, h, horizontal){
							var $el = $(el);
							if (horizontal)
								$el.css({ left:'0', top :'50%', width: '100%',height: 'auto',  marginTop: h / -2 + 'px', marginLeft: 0 });
					 		else
								$el.css({ left:'50%', top :'0', width: 'auto',height: '100%', marginLeft: w / -2 + 'px', marginTop: 0 });
						})
					});
				});
			}

			$main.fadeIn(cb);
		}, 200);
		return arguments.callee
	}

	$window.resize(initialize(false));
});

