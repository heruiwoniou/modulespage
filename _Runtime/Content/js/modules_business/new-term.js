/**
 * Created by Administrator on 2016/8/10.
 */
define(function(){
    return {
        addNewTerm:function(){
            WebApi.modal({
                src:"addNewTerm.html",
                ajax:true,
                width:570,
                height:290,
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

