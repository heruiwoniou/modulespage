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
		if(WebApi.$ColorPicker.visible) WebApi.$ColorPicker.close();
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
    prototype.resize = function ( src , mw , mh ){
        var temp =new Image();
        var deferred = new $.Deferred();
        temp.onload=function(){
            var ratio = 1, w = temp.width, h = temp.height, maxWidth = mw, maxHeight = mh, wRatio = maxWidth / w, hRatio = maxHeight / h;
            if (maxWidth == 0 && maxHeight == 0) {
                ratio = 1;
            } else if (maxWidth == 0) {
                if (hRatio < 1) ratio = hRatio;
            } else if (maxHeight == 0) {
                if (wRatio < 1) ratio = wRatio;
            } else if (wRatio < 1 || hRatio < 1) {
                ratio = (wRatio <= hRatio ? wRatio : hRatio);
            }
            if (ratio < 1) {
                w = w * ratio;
                h = h * ratio;
            }

            deferred.resolve(w,h);
        }
        temp.onerror = function(){
            deferred.reject('加载错误!');
        }
        temp.src = src;
        return deferred;
    }
    prototype.start = function(){
        this.doing = true;
    }
    prototype.stop = function(){
        this.doing = false;
    }
	return new Methods();
})