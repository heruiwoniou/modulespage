define(function(){
	function Events (){ }
	var prototype=Events.prototype;

	prototype.setdefault=function(callback){
		return function(selectindex){
			if(selectindex === this.fullindex) return true;
			this.selectchild = (new RegExp("^"+ this.fullindex + '-','i')).test(selectindex);
			if(typeof callback == 'function')
				callback.apply(this,arguments)
			return true;
		}
	}

	prototype.removeItem=function(index) {
		this.component.children.splice(index, 1);
	}
	return new Events();
})