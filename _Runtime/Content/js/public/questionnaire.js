define(
    [
        'vue',
        //引用控件
        './../components/StaticHeader',
        './../components/ChoiceQuestion',
        './../components/SectionGroup'
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
                            data.preview = true;
                            return data;
                        }
                    }())
                })
            }
        }
    })
