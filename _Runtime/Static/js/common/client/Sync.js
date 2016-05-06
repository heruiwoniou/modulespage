/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
define(function(){
    var Sync={
        ClearAsync:function(type){
            var Timers=Sync.AsyncTimerController(type);
            for(var i in Timers.length) {
                window.clearTimeout(Timers[i]);
                Timers[i]=null;
            }
            Sync.AsyncTimerController(type,new Array());
        },
        SetAsync:function(fn,type,interval){
            interval=interval||0;
            var Timers=Sync.AsyncTimerController(type);
            Timers.push(window.setTimeout(fn,interval));
        },
        AsyncTimerController:function(type,value){
            type=type||"Default";
            if(value)
                Sync.AsyncTimer[type]=value;
            else
                return Sync.AsyncTimer[type]?Sync.AsyncTimer[type]:(Sync.AsyncTimer[type]=new Array())
        },
        AsyncTimer:{}
    }

    return Sync
})