define(function(){
    return {
        addList:function(e){

        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
            $(li).bind('click',this.addList)
            WebApi.addList()
        }
    }
});

