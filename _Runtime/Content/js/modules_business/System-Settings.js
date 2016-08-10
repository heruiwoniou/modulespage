define(function(){
    return {
        setPermission:function(){
            WebApi.modal({
                content:$("#testmodal1"),
                width:850,
                height:380,
                title:"设置权限"
            }).then(function(status){
                alert("弹HTML关闭后回调信息:"+ status);
            });
        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
            WebApi.setMinHeight($('#mybody'));
        }
    }
})

