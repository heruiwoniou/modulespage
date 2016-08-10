define(function(){
    return {
        setPermission:function(){
            WebApi.modal({
                content:$("#testmodal1"),
                width:850,
                height:380,
                title:"ÉèÖÃÈ¨ÏÞ"
            }).then(function(status){
                alert("µ¯HTML¹Ø±Õºó»Øµ÷ÐÅÏ¢:"+ status);
            });
        },
        init:function(){
            //³õÊ¼»¯Ò³ÃæÄÚÈÝ
            //·µ»ØÖµtrue/false¾ö¶¨ÊÇ·ñÖ´ÐÐutil.jsÏÂµÄ_init_·½·¨
        }
    }
})

