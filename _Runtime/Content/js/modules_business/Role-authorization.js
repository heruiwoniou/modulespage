define(function(){
    return {
        addList:function(){
            $("#Plant-Names").append("<li class='Plant-Names-list'>名称</li>")
        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
        }
    }
});