define( [
        'libs/jquery-extend/jquery.scroll-column',
        'libs/jquery-extend/jquery.stellar'
    ], function () {

    var Pager=
    {
        CloseNameParent:function(){
            WebApi.close({name:"model2",command:"from child"});
        },
        CloseAllParent:function(){
            WebApi.close({command:"from child"});
        },
        init: function () {
            $('.scroll-column').ScrollColumnInit();
            $.stellar({
                horizontalScrolling: false
            });
            $(".login").click(function(){
                //窗体弹出
                //
                //
                //WebApi.modal({title:"12323",ajax:true,src:"index.html"})
                //WebApi.modal({title:"12323",src:"index.html"})
                //WebApi.modal({title:"12323",content:$("#test")})
                //WebApi.window({title:"12323",ajax:true,src:"index.html"})
                //WebApi.window({title:"12323",content:$("#test")});
                WebApi.window({title:"登陆页面",src:"progress.html",height:600,width:800}).then(function(state){
                    console.log(state);
                });
                //消息框弹出
                //
                //
                // WebApi.error("测试消息").then(function(state){
                //     console.log(state);
                // });
                // WebApi.confirm("测试消息").then(function(state){
                //     console.log(state);
                // });


            })
        }
    };
    return Pager;
})
