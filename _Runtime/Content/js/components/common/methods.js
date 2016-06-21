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
				if(typeof callback == 'function') callback.apply(this);
			}
			else
			{
				//公用的隐藏colorpicker
				if(WebApi.$ColorPicker.visible) WebApi.$ColorPicker.close();
				this.$dispatch("selectchange",this.fullindex);
			}
		}
	}
	/**
	 * [removecontrol 移除控件]
	 * @return {[type]} [description]
	 */
	prototype.removecontrol=function(){
		this.$parent.$emit("removeItem",this.index);
	}

	prototype.closeColorPicker=function(){
		if(WebApi.$ColorPicker.visible) WebApi.$ColorPicker.close();
	}

	prototype.setBold=function(){
		this.component.bold = !this.component.bold;
		if(WebApi.$ColorPicker.visible) WebApi.$ColorPicker.close();
	}
	prototype.showColorPicker=function(e){
		var that=this;
        WebApi.$ColorPicker.show({
            target:e.target,
            color:this.component.color,
            time:function(color){
                that.component.color=color;
            },
            sure:function(color){
                that.component.color=color;
            },
            close:function(color){
                that.component.color=color;
            }
        });
    }
    prototype.setMust = function(){
    	this.component.must = !this.component.must;
    };
	return new Methods();
})