define(
    [
        'vue',
        './setting',
        'jquery.ui/ui/draggable',

        //引用控件
        './components/StaticHeader',
        './components/ChoiceQuestion',
        './components/SectionGroup',
        './components/Perview'
    ],
    function(
        Vue,
        setting,
        draggable,
        StaticHeader,
        ChoiceQuestion,
        SectionGroup,
        Perview
    ) {
        var viewModel,//数据模型
        droppables,//可填充对象坐标信息
        droppablescrollbar,//滚动范围对象
        droppablescrolltop,//开始拖动时的滚动条位置信息
        droppablecache;//当前选中的可填充对象信息
        return {
            $Preview:new Perview(),
            init: function() {
                this.vue();
                return false;
            },
            //计算容器所在坐标
            countdroppables: function($target) {
                droppables = null;
                var arr = [];
                droppables = [];
                droppablecache = {};
                $target.each(function(i, el) {
                    var $el = $(el);
                    arr.push({
                        top: $el.offset().top,
                        el: el
                    });
                });
                arr.sort(function(a, b) {
                    return a.top - b.top
                });
                arr.forEach(function(o, index) {
                        droppables.push({
                            left: 200,
                            top: (index == 0 ? -9999999999 : (o.top - (o.top - arr[index - 1].top) / 2)),
                            bottom: ((index == arr.length - 1) ? 9999999999 : (o.top + (arr[index + 1].top - o.top) / 2)),
                            el: o.el
                        })
                    })
                //标识颜色
                $(".right:first").addClass('begin');
                //获取scrolltop信息
                $droppablescrollbar = $target.first().closest('.mCSB_container');
                droppablescrolltop = $droppablescrollbar.css('top').replace('px','')*1;
            },
            drag: function(event, ui) {
                var scrolldistance = $droppablescrollbar.css('top').replace('px','')*1 - droppablescrolltop;
                var y = event.pageY - scrolldistance;
                var x = event.pageX;
                if (droppablecache.y !== undefined && y > droppablecache.top && y < droppablecache.bottom && x > droppablecache.left) return;
                for (var i = 0; i < droppables.length; i++) {
                    var pos = droppables[i],
                        $el = $(pos.el);
                    if (y > pos.top && y < pos.bottom && x > pos.left) {
                        if (droppablecache.$el !== undefined && droppablecache.$el.length != 0) droppablecache.$el.removeClass('draging');
                        droppablecache.left = pos.left;
                        droppablecache.top = pos.top;
                        droppablecache.bottom = pos.bottom;
                        droppablecache.$el = $el.addClass('draging');
                        return;
                    }
                }
                if (droppablecache.$el !== undefined && droppablecache.$el.length != 0) droppablecache.$el.removeClass('draging');
                droppablecache = {};
            },
            drop: function(ui) {
                try {
                    // statements
                    $(".right:first").removeClass('begin')
                    if (droppablecache.$el === undefined || droppablecache.$el.length === 0) {
                        return;
                    }
                    //取消标识颜色
                    droppablecache.$el.removeClass('draging');
                    var $this = droppablecache.$el;
                    var type = ui.helper.data('type');
                    var component;
                    var path, toPaths = $this.attr("data-index").split('-'),
                        insertIndex = ~~toPaths.pop(),
                        toPathStr = toPaths.join('');
                    var fromPaths, fromPathStr, fromIndex, target = viewModel,
                        index;
                    if (type) {
                        component = setting(ui.helper.data('type'));
                        if (component !== null) {
                            while (path = toPaths.shift()) {
                                target = target.children[~~path];
                            }
                            target.children.splice(insertIndex, 0, component)
                        } else {
                            WebApi.error('尚未定义！请联系管理员！')
                        }
                    } else {
                        var fromTarget = viewModel;
                        fromPaths = ui.helper.attr("data-index").split('-');
                        fromIndex = ~~fromPaths.pop();
                        fromPathStr = fromPaths.join('');
                        while (path = fromPaths.shift())
                            fromTarget = fromTarget.children[~~path];
                        component = fromTarget.children.splice(fromIndex, 1, null);
                        while (path = toPaths.shift()) {
                            target = target.children[~~path];
                        }
                        target.children.splice(insertIndex, 0, component[0])
                        fromTarget.children.splice((fromPathStr == toPathStr && fromIndex >= insertIndex ? (fromIndex + 1) : fromIndex), 1);
                    };
                    viewModel.$nextTick(function() {
                        WebApi.bindaccept();
                    });
                } catch (e) {
                   console.log(e);
                }
            },
            bindaccept: function() {
                $(".control:not([draggable])").draggable({
                    addClasses: true,
                    distance: 10,
                    appendTo: "body",
                    opacity: 0.8,
                    revertDuration: 200,
                    start: function(event, ui) {
                        viewModel.setindex();
                        ui.helper.css({ zIndex: 100 });
                        viewModel.dragging = true;
                        WebApi.countdroppables($(".accept").not(ui.helper.find('.accept')));
                    },
                    drag: this.drag,
                    stop: function(event, ui) {
                        WebApi.drop(ui);
                        ui.helper.attr("style", "position: relative");
                        viewModel.selectindex = "";
                        window.setTimeout(function() {
                            viewModel.dragging = false;
                        })
                    }
                }).attr("draggable", "")
            },
            vue: function() {
                viewModel = new Vue({
                    el: 'body',
                    data: (function() {
                        if (localStorage.data && localStorage.data !== "null" && localStorage.data !== "undefined") {
                            return JSON.parse(localStorage.data);
                        } else
                            return {
                                preview: false,
                                dragging: false,
                                selectindex: "",
                                header: function() {
                                    return setting('StaticHeader') }(),
                                children: []
                            };
                    }()),
                    ready: function() {
                        $(".control-small").draggable({
                            distance: 10,
                            appendTo: "body",
                            helper: "clone",
                            opacity: 0.8,
                            start: function(event, ui) {
                                viewModel.setindex();
                                WebApi.countdroppables($(".accept").not(ui.helper.find('.accept')));
                            },
                            drag: WebApi.drag,
                            stop: function(event, ui) {
                                WebApi.drop(ui);
                            }
                        });
                        WebApi.bindaccept();
                        //挂载预览框
                        WebApi.$Preview.$mount("#Perview");
                        //绑定滚动条
                        WebApi.scrollReplace();
                    },
                    watch:{
                        //通过改变状态来获取预览表单
                        "preview":function(_new_){
                            var that=this;
                            if(!_new_) this.$nextTick(function() { WebApi.bindaccept(); });
                            else
                            {
                                this.$nextTick(function() {
                                    WebApi.$Preview.show({html:document.querySelector('.right-control-container').outerHTML})
                                    that.preview = !that.preview;
                                    that.$nextTick(function() {
                                        WebApi.bindaccept();
                                    })
                                });
                            }
                        }
                    },
                    methods: {
                        save: function() {
                            var str = JSON.stringify(this.$data);
                            localStorage.data = str;
                        },
                        toggle: function() {
                            this.preview = true;
                        },
                        setindex: function() {
                            this.selectindex = "";
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault", this.selectindex);
                        },
                        alert: function(index) {
                            alert(index)
                        }
                    },
                    events: {
                        selectchange: function(fullindex) {
                            if (this.dragging) return;
                            this.selectindex = fullindex;
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault", this.selectindex);
                        },
                        removeItem: function(index) {
                            this.children.splice(index, 1);
                        }
                    }
                })
            }
        }
    })
