define(['vue'], function(Vue) {
    var vm;
    return {
        init: function() {
            this.vue();
            $("#isanonymous,#isonce").bind('click', function() {
                var id = this.id;
                var $node = $(this).data("Control.CheckBox").$LabelText;
                $node.textContent = ($node.textContent == "开启" ? '关闭' : '开启')
            });
            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });
        },
        vue: function() {
            this.transition();
            vm = new Vue({
                el: 'body',
                data: {
                    isanonymous: true,
                    isonce: true,
                    ispartone: true
                },
                methods: {
                    gonext: function() {
                        this.ispartone = !this.ispartone;
                    },
                    setisanonymous: function() {
                        this.isanonymous = !this.isanonymous;
                    }
                }
            });
        },
        transition: function() {
            Vue.transition('part-scroll', {
                css: false,
                enter: function(el, done) {
                    $(el).css('left', "-100%").animate({ left: "0" }, 200, done)
                },
                leave: function(el, done) {
                    $(el).css('left', "0").animate({ left: "-100%" }, 200, done)
                }
            })
        }
    }
})
