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
                horizontalScrolling: false,
                verticalOffset: 40
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
                WebApi.window("model1",{title:"12323",width:800,height:600,full:false,src:"index.html"}).then(function(state){
                    alert(state);
                });

                WebApi.window("model2",{title:"12323",width:800,height:600,full:false,src:"index.html"}).then(function(state){
                    alert(state);
                });

                WebApi.window("model3",{title:"12323",width:800,height:600,full:false,src:"index.html"}).then(function(state){
                    alert(state);
                });

                WebApi.window("model4",{title:"12323",width:800,height:600,full:false,src:"index.html"}).then(function(state){
                    alert(state);
                });


                //消息框弹出
                //
                //
                WebApi.confirm("测试消息").then(function(state){
                   console.log(state);
                });
                // WebApi.error("测试消息").then(function(state){
                //     console.log(state);
                // });
                // WebApi.alert("测试消息").then(function(state){
                //     console.log(state);
                // });


            })
        }
    };
    return Pager;
})