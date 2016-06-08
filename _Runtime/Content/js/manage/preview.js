define(
    [
        'vue',
        'common/client/Request',
        //引用控件
        './../components/preview/TabBar',
        './../components/preview/StaticHeader',
        './../components/preview/ChoiceQuestion',
        './../components/preview/PicChoiceQuestion',
        './../components/preview/SectionGroup',
        './../components/preview/UnmixedText',
        './../components/preview/QuestionResponse'
    ],
    function(Vue,Request) {
        var viewModel;//数据模型
        return {
            init: function() {
                this.vue();
            },
            vue: function() {
                viewModel = new Vue({
                    el: 'body',
                    data: (function() {
                        var data=decodeURIComponent(Request['data'])
                        if (data && data !== "null" && data !== "undefined") {
                            var json=JSON.parse(data);
                            return json;
                        }
                    }()),
                    computed:{
                        exportStyle:function(){
                            return {
                                background:this.header&&this.header.src?"#ffffff url(" + this.header.src + ') repeat fixed' : "#fff"
                            }
                        }
                    }
                })
            }
        }
    })
