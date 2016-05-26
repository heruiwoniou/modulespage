define(
    [
        'vue',
        './setting',
        'jquery.ui/ui/draggable',
        'jquery.ui/ui/droppable',

        //引用控件
        './components/ChoiceQuestion',
        './components/Group',

        //引用效果
        'system/js/util/transition/fadeInOut'
    ],
    function(Vue, setting, draggable, droppable) {
        var viewModel;
        return {
            init: function() {
                this.vue();
            },
            bindaccept: function() {
                $(".accept:not([droppable])")
                    .droppable({
                        tolerance: "touch",
                        activeClass: "begin",
                        hoverClass: "draging",
                        drop: function(event, ui) {
                            var $this = $(this);
                            var type = ui.helper.data('type');
                            var component;
                            var path,toPaths = $this.attr("data-index").split('-'),insertIndex = toPaths.pop();
                            var fromPaths,fromIndex,target=viewModel,$target=viewModel,index;
                            if (type) {
                                component = setting(ui.helper.data('type'));
                                while(path=toPaths.shift())
                                {
                                    index = ~~path;
                                    target=target.children[index];
                                    $target=$target.$children[index]
                                }
                                target.children.splice(insertIndex, 0, component)
                            } else {
                                var fromTarget=viewModel;
                                fromPaths = ui.helper.attr("data-index").split('-');
                                fromIndex = fromPaths.pop();
                                while(path=fromPaths.shift())
                                    fromTarget=fromTarget.children[~~path];
                                component = fromTarget.children.splice(fromIndex, 1);
                                while(path=toPaths.shift())
                                {
                                    index = ~~path;
                                    target=target.children[index];
                                    $target=$target.$children[index]
                                }
                                target.children.splice(fromIndex >= insertIndex ? insertIndex : insertIndex - 1, 0, component[0])

                            };
                            $target.$nextTick(function() {
                                    WebApi.bindaccept();
                            });
                        }
                    }).attr('droppable', '');
                $(".control:not([draggable])").draggable({
                    addClasses: true,
                    distance: 10,
                    appendTo: "body",
                    opacity: 0.5,
                    revert: "invalid",
                    revertDuration: 200,
                    start: function(event, ui) {
                        ui.helper.css({zIndex:100}).find(".accept").droppable("disable");
                        viewModel.dragging = true;
                    },
                    stop: function(event, ui) {
                        ui.helper.find(".accept").droppable("enable").end().attr("style", "position: relative");
                        viewModel.selectindex = -1;
                        window.setTimeout(function() {
                            viewModel.dragging = false;
                        })
                    }
                }).attr("draggable", "")
            },
            vue: function() {
                viewModel = new Vue({
                    el: 'body',
                    data: {
                        dragging: false,
                        selectindex: -1,
                        children: []
                    },
                    ready: function() {
                        $(".control-small").draggable({ distance: 10 ,appendTo: "body", helper: "clone", opacity: 0.5 });
                        WebApi.bindaccept();
                    },
                    methods: {
                        setindex: function() {
                            this.selectindex = -1;
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault",this.selectindex);
                        },
                        alert:function(index){
                            alert(index)
                        }
                    },
                    events: {
                        selectchange: function(index) {
                            if (this.dragging) return;
                            this.selectindex = index;
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault",this.selectindex);
                        },
                        removeItem: function(index) {
                            this.children.splice(index, 1);
                        }
                    }
                })
            }
        }
    })
