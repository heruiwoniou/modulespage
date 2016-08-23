/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
define(function(){
    var Async={
        ClearAsync:function(type){
            var Timers=Async.AsyncTimerController(type);
            for(var i in Timers.length) {
                window.clearTimeout(Timers[i]);
                Timers[i]=null;
            }
            Async.AsyncTimerController(type,new Array());
        },
        SetAsync:function(fn,type,interval){
            interval=interval||0;
            var Timers=Async.AsyncTimerController(type);
            Timers.push(window.setTimeout(fn,interval));
        },
        AsyncTimerController:function(type,value){
            type=type||"Default";
            if(value)
                Async.AsyncTimer[type]=value;
            else
                return Async.AsyncTimer[type]?Async.AsyncTimer[type]:(Async.AsyncTimer[type]=new Array())
        },
        AsyncTimer:{}
    }

    return Async
})