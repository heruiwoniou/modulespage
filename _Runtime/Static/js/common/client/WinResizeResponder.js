define(['jquery','./Bumper'],function($,Bumper){
	var bumper=Bumper.create(),
	$win=$(window),
	$doc=$(document);
	var wrap=function(fn){
		return function(){
			return fn.call(this,$win.height(),$doc.height());
		}
	}
	return {
		resize:function(fn){
			$doc.ready(wrap(fn));
			$win.resize(bumper.proxy(wrap(fn)));
			$doc.resize(bumper.proxy(wrap(fn)));
		}
	}
});