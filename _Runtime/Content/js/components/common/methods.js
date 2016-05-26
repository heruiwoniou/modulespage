define(function(){
	function Methods (){ }
	var prototype=Methods.prototype;
	/**
	 * [setindex description]
	 * @param  {Function} callback [如果当前焦点为该对象,进行的操作]
	 * @return {[type]}            [description]
	 */
	prototype.setindex=function(callback){
		return function(){
			//如果焦点不在该对象上,先设置焦点
			if(this.iscurrent)
			{
				if(typeof callback == 'function') callback.apply(this)
			}
			else
				this.$dispatch("selectchange",this.index);
		}
	}
	/**
	 * [removecontrol 移除控件]
	 * @return {[type]} [description]
	 */
	prototype.removecontrol=function(){
		this.$dispatch("removeItem",this.index);
	}
	return new Methods();
})