define([
    'vue',
    'common/client/WinResizeResponder',
    //公用组件
    './../components/Perview',
], function(Vue, Responder, Perview) {
    var _LRCMain_ = $('#LRCMain');
    var _Vm_;
    return {
        $Preview: new Perview(),
        resize: function(wh) {
            _LRCMain_.css({ height: wh - 100, marginTop: '10px' }).show();
        },
        init: function() {
            var that = this;
            Responder.resize(this.resize);
            _Vm_ = new Vue({
                el: 'body',
                data: {
                    filter:{
                        self:false,
                        key:""
                    },
                    total: function(){
                        return 12;
                    }(),
                    select:function() {
                        var arr = []
                        for (var i = 0; i < 5; i++)
                            arr.push({
                                title: "大学生消费问卷调查大学生消费问卷调查大学生消费问卷调查大学生消费问卷调查",
                                qnumber: "80个问题80个问题80个问题80个问题80个问题80个问题80个问题80个问题",
                                info: "作者：ASD     被引用次数：23444次",
                                describe: "请您先了解目前相关【定位】资料【游戏背景】： 明朝宦官叛乱年间 官场黑暗 武林混乱 暗杀不断 人心惶恐【游戏关键词】：锦衣卫 电影氛围 暗黑色彩 时尚设计 酷炫精美"
                            });
                        return arr;
                    }(),
                    results: function() {
                        var arr = []
                        for (var i = 0; i < 12; i++)
                            arr.push({
                                title: "大学生消费问卷调查",
                                qnumber: "80个问题",
                                info: "作者：ASD     被引用次数：23444次",
                                describe: "请您先了解目前相关【定位】资料【游戏背景】： 明朝宦官叛乱年间 官场黑暗 武林混乱 暗杀不断 人心惶恐【游戏关键词】：锦衣卫 电影氛围 暗黑色彩 时尚设计 酷炫精美"
                            });
                        return arr;
                    }()
                },
                ready: function() {
                    //挂载预览框
                    WebApi.$Preview.$mount("#Perview");
                },
                methods:{
                    ViewModel:function(){
                        WebApi.$Preview.show( localStorage.data , 1)
                    }
                }
            });

            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });
        }
    }
})
