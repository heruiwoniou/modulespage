define(function(){
    return {
        setPermission:function(){
            WebApi.modal({
                content:$("#testmodal1"),
                width:850,
                height:380,
                title:"����Ȩ��"
            }).then(function(status){
                alert("��HTML�رպ�ص���Ϣ:"+ status);
            });
        },
        init:function(){
            //��ʼ��ҳ������
            //����ֵtrue/false�����Ƿ�ִ��util.js�µ�_init_����
        }
    }
})

