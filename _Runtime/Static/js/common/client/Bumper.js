/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(function(){

	var BumperCore=function(){
		this.timer=null;
	}

	BumperCore.prototype={
		constructor:BumperCore,
		trigger:function(fn,interval){
            interval=interval||500;
            window.clearTimeout(this.timer);
            this.timer=window.setTimeout(fn,interval)
        },
        clear:function(){
        	window.clearTimeout(this.timer);
        }
	}

	Bumper={
		instance:null,
		create:function(){
			return new BumperCore();
		},
		trigger:function(fn,interval){
			if(!this.instance)
				this.instance=new BumperCore();
			this.instance.trigger(fn,interval);
		}
	}


    return Bumper;
})
