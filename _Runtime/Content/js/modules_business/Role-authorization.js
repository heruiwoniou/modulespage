define(function(){
    return {
        addList:function(e){

        },
        init:function(){
            //��ʼ��ҳ������
            //����ֵtrue/false�����Ƿ�ִ��util.js�µ�_init_����
            $(li).bind('click',this.addList)
            WebApi.addList()
        }
    }
});

