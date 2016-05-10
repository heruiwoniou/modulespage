define( [
        'libs/jquery-extend/jquery.scroll-column',
        'libs/jquery-extend/jquery.stellar'
    ], function () {
    return {
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
                WebApi.window({title:"12323",src:"index.html"})
                //WebApi.window({title:"12323",content:$("#test")})
                .then(function(state){
                    console.log(state);
                });


                //消息框弹出
                //
                //
                //WebApi.confirm("测试消息").then(function(state){
                //    console.log(state);
                //});
                // WebApi.error("测试消息").then(function(state){
                //     console.log(state);
                // });
                // WebApi.alert("测试消息").then(function(state){
                //     console.log(state);
                // });


            })
        }
    };
})