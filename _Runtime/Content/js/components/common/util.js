define(function(){
	return {
		isArray:Array.isArray,
		toString:function(object){ return ({}).toString.call(object); }
	}
})