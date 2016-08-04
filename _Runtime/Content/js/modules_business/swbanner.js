var BumperCore = function() {
	this.timer = null;
}
BumperCore.prototype = {
	constructor: BumperCore,
	trigger: function(fn, interval) {
		interval = interval || 500;
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(fn, interval)
	},
	proxy: function(fn, ctx, interval) {
		interval = interval || 100;
		var that = this;
		return function bumperProxy() {
			window.clearTimeout(that.timer);
			that.timer = setTimeout(function() {
				fn.apply(ctx, arguments);
			}, interval);
		}
	},
	clear: function() {
		window.clearTimeout(this.timer);
	}
}

var Bumper = {
	instance: null,
	create: function() {
		return new BumperCore();
	},
	trigger: function(fn, interval) {
		if (!this.instance)
			this.instance = new BumperCore();
		this.instance.trigger(fn, interval);
	},
	proxy: function(fn, ctx, interval) {
		if (!this.instance)
			this.instance = new BumperCore();
		return this.instance.proxy(fn, ctx, interval);
	}
}

var bumper = Bumper.create(),
	$win = $(window),
	$doc = $(document);
var wrap = function(fn) {
	return function() {
		return fn.call(this, $win.height(), $doc.height());
	}
};
var Responder =  {
	resize: function(fn) {
		$doc.ready(wrap(fn));
		$win.resize(bumper.proxy(wrap(fn)));
		$doc.resize(bumper.proxy(wrap(fn)));
	}
};

var resize = function(src, viewWidth, viewHeight, index) {
	var deferred = new $.Deferred();
	var cache = new Image();
	cache.onload = function() {
		var ratio = 1;
		var w = cache.width;
		var h = cache.height;
		var wRatio = viewWidth / w;
		var hRatio = viewHeight / h;
		var horizontal = wRatio <= hRatio
		ratio = (horizontal ? hRatio : wRatio);
		w = w * ratio;
		h = h * ratio;

		deferred.resolve(w, h, horizontal, index, cache );
	}
	cache.src = src;
	return deferred;
};

var center = function(el, w, h, horizontal) {
	var $el = $(el);
	if (horizontal)
		$el.removeClass('vertical').addClass('horizontal')
		.css({ marginLeft: w / -2 + 'px', marginTop: 0 });
	else
		$el.removeClass('horizontal').addClass('vertical')
		.css({ marginTop: h / -2 + 'px', marginLeft: 0 });
}

define(function() {
	return {
		init: function() {
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			var $sw = $(".swbanner-control");
			var $swView = $sw.find(".swbanner-view");
			var $swBanner = $sw.find(".swbanner-banner");

			var $swShrunkenWrap = $sw.find(".swbanner-shrunken-container");
			var $swMessage = $sw.find('.swbanner-message')
			var initialized = false;
			var caches = {};
			var $images = $swView.find("img");
			var len = $images.length;
			var loaded = 0;
			var compute = function(){
				var svWidth = $swView.width();
				var svHeight = $swView.height();

				$swView.find("img").each(function(i, el) {
					var $el = $(el);
					resize(el.src, svWidth, svHeight, i).done(function(w, h, horizontal, index, cache ) {
						center(el, w, h, horizontal)
						if(!caches['shrunken' + index])
						{
							resize(cache.src, 180, 130, index).done(function(_w, _h, _horizontal, _index){
								loaded ++ ;
								caches['shrunken' + _index] = cache;
								center(cache, _w, _h, _horizontal);
								var $item = $("<div class='swbanner-shrunken-item'></div>").append(cache);
								$swShrunkenWrap.append($item);
								if(len === loaded) initialize();
							});
						}
					});
				});
			};

			var initialize = function(options){
				var defaults = {
					animateTime: 3000,
					delayTime: 2000
				}
				var setting=$.extend({},defaults,options);
				var $nav  = $swShrunkenWrap.find(".swbanner-shrunken-item");
				var index = 0;
				var timer;
				function show ( n ) {
					var $target = $images.eq(n);
					var mes = $target.attr('alt') || "";
					$target.addClass("active").siblings().removeClass("active");
					$nav.eq(n).addClass("current").siblings().removeClass("current");
					if(mes)
						$swMessage.addClass('display')
					else
						$swMessage.removeClass('display')
					$swMessage.html(mes)
				}

				function player(){
					clearInterval(timer);
					timer = setInterval(
						function(){
							show( ($swShrunkenWrap.find(".current").index() + 1) % len);
						},setting.delayTime)
				}

				$nav.click(function(){
					if(!$images.is(":animated")){
						clearInterval(timer);
						show($(this).index());
					}
				});

				$images.hover(
					function(){ clearInterval(timer); },
					function(){ player(); });

				show ( 0 );
				player();
				$sw.addClass('created')
			}

			Responder.resize(compute);
		}
	}
})
