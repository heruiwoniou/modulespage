ScrollStart=function(){}
define(function(){
	//这里定义全局方法

	window.globalFileReaderUrl = '/server/uploadimages'
	/**
	 * [LoadImage description]
	 * 图片加载
	 */
	$.loadImage = function(){
		return $(".img-container").each(function(i){
			var $this = $(this);
			var img = document.createElement('img');
			$this.append(img)
			window.setTimeout(function() {
				img.onload = function() {
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
		})
	}

	/**
	 * [swbanner description]
	 * 轮播控件
	 * @param  {[type]} 
	 * option {
	 * speed : 2000,
	 * control1: true,
	 * control2: false,
	 * defaultWidth: 1000 ,
	 * played:callback,
	 * stoped:callback,
	 * showed:callback
	 * }
	 * @return {[type]}        [description]
	 */
	$.fn.swbanner = function(option){
		var setting = {
			speed : 2000,
			control1: true,
			control2: false,
			played:function(){},
			stoped: function(){},
			showed:function(){}
		}
		$.extend(setting, option);
		return this.each(function(){
			var $bannerContainer = $(this);
			var $bannerControl = $("<div class='swbanner-control'></div>");
			var $bannerLeft = $('<div class="swbanner-left"><i class="icon-11"></i></div>');
			var $bannerRight = $('<div class="swbanner-right"><i class="icon-12"></i></div>')
			var $images = $bannerContainer.find('>img');
			var $navs,timer,len = $images.length;
			var width = setting.defaultWidth ? setting.defaultWidth : $bannerContainer.width();
			var height = $bannerContainer.height();
			var show = function(i){
				setting.showed.call($bannerContainer,i);
				$images.stop();
				$images.removeClass('active').fadeOut();
				$images.eq(i).addClass('active').stop().fadeIn();
				$navs.removeClass('current').eq(i).addClass('current');
			}
			for(var i = 0 ; i < len ; i++ )
				$bannerControl.append("<a href='javascript:;'></a>");
			if(len > 1)
			{
				if(setting.control1) $bannerContainer.append($bannerControl);
				if(setting.control2) $bannerContainer.append($bannerLeft);
				if(setting.control2) $bannerContainer.append($bannerRight);
			}
			$navs = $bannerControl.find('a');
			$navs.first().addClass('current');
			$images.each(function(i, el){
				WebApi.computed(el.src, width, height).done(function(w, h, horizontal){
					var $el = $(el);
					if (horizontal)
						$el.css({ left:'0', top :'50%', width: '100%',height: 'auto',  marginTop: h / -2 + 'px', marginLeft: 0 });
			 		else
						$el.css({ left:'50%', top :'0', width: 'auto',height: '100%', marginLeft: w / -2 + 'px', marginTop: 0 });
				})
			})
			$images.first().addClass('active').show();
			$navs.mouseenter(function(){
				stop();
				show($(this).index())
				play();
			});
			$bannerLeft.click(function(){
				play();
				var index = ($navs.filter('.current').index() - 1 );
				show( index < 0 ? len - 1 : index );
			})
			$bannerRight.click(function(){
				play()
				show(($navs.filter('.current').index() + 1 ) % len)
			})
			var stop = function(status){
				if(!status) setting.stoped();
				window.clearTimeout(timer);
			}
			var play = function(){
				if(len <= 1) return
				stop(true);
				setting.played(setting.speed);
				timer = window.setInterval(function(){
					show(($navs.filter('.current').index() + 1 ) % len)
				}, setting.speed);
			}

			$bannerContainer.on('mouseenter',function(){
				stop();
			})
			$bannerContainer.on('mouseout',function(){
				play();
			})
			play();
			$bannerContainer.data('images', $images);
		});
	}
	return {
		//这里定义WebApi方法
		/**
		 * 重新计算图片
		 * @return {[type]} [description]
		 */
		computed:function(src, viewWidth, viewHeight){
			var deferred = new $.Deferred();
			var cache = new Image();
			cache.onload = function() {
				var ratio = 1;
				var w = cache.width;
				var h = cache.height;
				var wRatio = viewWidth / w;
				var hRatio = viewHeight / h;
				var horizontal = wRatio >= hRatio

				ratio = (!horizontal ? hRatio : wRatio);
				w = w * ratio;
				h = h * ratio;

				deferred.resolve(w, h, horizontal, cache );
			}
			cache.src = src;
			return deferred;
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
        onScrollStart:function(){
        	ScrollStart();
        },
		init:function(){
			//这里添加页面加载完成后公用的初始化功能
			this.initControl();

			/*颜色调用函数*/
			try{
				$("#current_style").html(parent.getBestColor());
			}catch(e){

			}

			window.setBestColor =  function (str){
				$("#current_style").html(str);
			}
		}
	}
})