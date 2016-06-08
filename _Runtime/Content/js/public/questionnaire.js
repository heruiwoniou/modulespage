define(
    [
        'vue',
        //引用控件
        './../components/preview/TabBar',
        './../components/preview/StaticHeader',
        './../components/preview/ChoiceQuestion',
        './../components/preview/PicChoiceQuestion',
        './../components/preview/SectionGroup',
        './../components/preview/UnmixedText',
        './../components/preview/QuestionResponse'
    ],
    function(Vue) {
        var viewModel;//数据模型
        return {
            init: function() {
                this.vue();
            },
            vue: function() {
                viewModel = new Vue({
                    el: 'body',
                    data: (function() {
                        if (localStorage.data && localStorage.data !== "null" && localStorage.data !== "undefined") {
                            data=JSON.parse(localStorage.data);
                            return data;
                        }
                    }()),
                    computed:{
                        exportStyle:function(){
                            return {
                                background:"#ffffff url(" + this.header.src + ') repeat fixed'
                            }
                        }
                    }
                })
            }
        }
    })
