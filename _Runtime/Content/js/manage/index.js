define(['vue','./../widget/FullScreenModal','./../util/filter/nameSplit'], function(Vue,FullScreenModal) {
    var vm,modal;Modal=Vue.extend(FullScreenModal);
    return {
        init: function() {
            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });
            this.dataInit();
            this.modalInit();
        },
        modalInit:function(){
            modal=new Modal();
            modal.$mount('modal');
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
                    view:function(status){
                        modal.viewsrc="state-viewer.html";
                        if(status=="已结束")
                            modal.analyzesrc="state-analyze.html";
                        modal.show=true;
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
