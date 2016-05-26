define(function(){
	function Events (){ }
	var prototype=Events.prototype;

	prototype.setdefault=function(callback){
		return function(index){
			if(this.index == index) return
			if(typeof callback == 'function') callback.apply(this,arguments)
		}
	}
	return new Events();
})