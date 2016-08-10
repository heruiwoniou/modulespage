define(function(){
    return {
        addList:function(){
            $("#Plant-Names").append("<li class='Plant-Names-list'>名称" +
                "<span class='compile-edit'>"+
                "<a href='javascriptp:;'><i class='icon-edit color-3'></i>修改</a>"+
                "<a href='javascript:;' ><i class='icon-delete color-2'></i>删除</a>"+
                "</span>"+
                "</li>")
        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
        }
    }
});