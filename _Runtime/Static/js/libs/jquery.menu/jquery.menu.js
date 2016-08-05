;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['Static/js/libs/jquery.easing/jquery.easing'], factory);
    } else {
        factory();
    }
}(this, function(){

	var supset = function($sup){
		$sup.find('li').each(function(){
			var $this = $(this);
			if($this.find('ul').length !== 0)
				supset($this.addClass('sup'));
		})
	};

	var clearopen = function($root){
		$root.siblings('.sup.open').each(function(){
			var $this = $(this);
			$this.find('ul').slideUp(400,'easeOutCirc',function(){
				$this.removeClass('open').find('.sup').removeClass('open');
			});
		})
	};

	var clearselect = function($root){
		$root.find('.select').removeClass('select');
	};

	var behaviorset = function($root){
		var $sups = $root.find('.sup');
		var $normals = $root.find("li").not($sups);
		$sups.bind('click',function(event){
			event.stopPropagation();
			var $this = $(this);
			if(!$this.hasClass('open')){
				clearopen($this);
				$this.addClass('open').find('>ul').slideDown(400,'easeOutCirc');
			}
			return false;
		});
		$normals.bind('click',function(event){
			event.stopPropagation();
			var $this = $(this);
			clearselect($root);
			$this.addClass('select');
			return false;
		})
	};

	$.fn.menuInit = function(){
		return this.each(function(){
			var $menu = $(this);
			//设置sup
			supset($menu);
			//设置动作
			behaviorset($menu);
		});
	}
}))