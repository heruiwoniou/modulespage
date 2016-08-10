define(function(){
    return {
        addNew:function(){
            WebApi.modal({
                src:"school-manage-add.html",
                ajax:true,
                width:600,
                height:340,
                success:function(){
                    WebApi.initControl(this.$BoxBaseContent)
                }
            }).then(function(cmd){
                console.log(cmd)
            })
        },
        init:function(){
            //初始化页面内容
            //返回值true/false决定是否执行util.js下的_init_方法
            WebApi.setMinHeight($('#mybody'));
        }
    }
})

