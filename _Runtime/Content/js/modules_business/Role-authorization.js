define(function(){
    return {
        addList:function(){
            $("#Plant-Names").append("<li class='Plant-Names-list'><input type=\"text\">" +
                "<span class='compile-edit'>"+
                "<a href='javascriptp:;'><i class='icon-sure color-3'></i></a>"+
                "<a href='javascript:;' ><i class='icon-cancel color-2'></i></a>"+
                "</span>"+
                "</li>")
        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
            $("#Plant-Names").on("click","li",function(){
                $("#Plant-Names li.select").removeClass('select');
                $(this).addClass('select');
            })
        }
    }
});