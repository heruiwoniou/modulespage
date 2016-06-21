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
        './../components/preview/QuestionResponse',
        './../components/preview/GradeQuestion'
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
                        var datastring=WebApi.invokeObject("$Preview").data;
                        var json=JSON.parse(datastring);
                        return json;
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
