/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(function(){
    var Bumper={
        timer:null,
        trigger:function(fn,interval){
            interval=interval||500;
            window.clearTimeout(this.timer);
            this.timer=window.setTimeout(fn,interval)
        }
    }
    return Bumper;
})
