define(['vue','./../components/Modal','./../util/filter/nameSplit'], function(Vue,Modal) {
    var vm,$ModalWin;
    return {
        $ModalWin:new Modal(),
        init: function() {
            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });
            this.dataInit();
            this.modalInit();
        },
        addQuestionnaire:function(){
            WebApi.invoke('$ModalWin','show',{
                defaultsrc:"questionnaire.html",
                custom:true,
                title:'新增问卷'
            }).then(function(){
                alert('add success !');
            })
        },
        modalInit:function(){
            this.$ModalWin.$mount('modal');
        },
        dataInit: function() {
            vm = new Vue({
                el: "#viewPanel",
                data: {
                    tableView: true,
                    list: function() {
                        var arr = [];
                        arr.push(["中学生上网情况问卷调查问卷调查", '未开始', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '未开始', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '进行中', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '已暂停', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '已暂停', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '进行中', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '已结束', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '已结束', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        arr.push(["中学生上网情况问卷调查问卷调查", '已结束', '电子科技大学附属第二实验小学', '2016-03-12', '2016-06-12', '200121']);
                        return arr
                    }()
                },
                methods: {
                    addnew:function(){
                        WebApi.modal('addnewwindow',{title:"新的活动",src:"new-activity.html",height:500,width:810})
                        .then(function(command){
                            alert(command)
                        });
                    },
                    view:function(status,title){
                        var option={
                            defaultsrc:"state-viewer.html",
                            title:title
                        }
                        if(status=="已结束")
                            option.analyzesrc="state-analyze.html";
                        WebApi.$ModalWin.show(option);
                    },
                    togglecommand:function($event){
                        var $el=$($event.currentTarget).closest('.rows')
                        if($el.hasClass('setting'))
                            $el.removeClass('setting');
                        else{
                            $el.closest('.table-grid').find('.rows').removeClass('setting');
                            $el.addClass('setting');
                        }
                    },
                    status: function(index) {
                        if (index == -1) return ""
                        switch (this.list[index][1]) {
                            case "未开始":
                                return "before";
                            case "进行中":
                                return "doing";
                            case "已暂停":
                                return "pause";
                            case "已结束":
                                return "finish";
                        }
                    },
                    togglelist: function(value) {
                        this.tableView = value
                    }
                }
            })
        }
    }
})
