define(
    [
        'vue',
        './../components/setting',
        //公用组件
        './../components/Perview',
        './../components/ColorPicker',
        './../components/Logic',
        //引用控件
        './../components/edit/TabBar',
        './../components/edit/StaticHeader',
        './../components/edit/ChoiceQuestion',
        './../components/edit/PicChoiceQuestion',
        './../components/edit/SectionGroup',
        './../components/edit/UnmixedText',
        './../components/edit/QuestionResponse',
        './../components/edit/GradeQuestion',
        './../components/edit/MatrixChoiceQuestion'
    ],
    function(
        Vue,
        setting,
        Perview,
        ColorPicker,
        Logic
    ) {
        var viewModel,//数据模型
        droppables,//可填充对象坐标信息
        droppablescrollbar,//滚动范围对象
        droppablescrolltop,//开始拖动时的滚动条位置信息
        droppablecache;//当前选中的可填充对象信息
        return {
            $Preview:new Perview(),
            $ColorPicker:new ColorPicker(),
            init: function() {
                this.vue();
                return false;
            },
            test:function(){
                debugger;
                WebApi.alert('123123');
            },
            showLogic:function(){
                WebApi.modal({content:$('#Logic'),title:"逻辑设置",width:800,height:425})
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
                    if(toPaths.length > 2 && type === 'SectionGroup') {
                        WebApi._error('[段落]最多进行三次嵌套!');
                        return;
                    }
                    if (type) {
                        component = setting(ui.helper.data('type'));
                        if (component !== null) {
                            while (path = toPaths.shift()) {
                                target = target.children[~~path];
                            }
                            target.children.splice(insertIndex, 0, component)
                        } else {
                            WebApi._error('尚未定义！请联系管理员！')
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
                    viewModel.setQuestionIndex();
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
                        if($(".accept:visible").length==0) return false;
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
                                dragging: false,
                                selectindex: "",
                                header: function() {
                                    return setting('StaticHeader');
                                }(),
                                tab:function(){
                                    return setting('TabBar');
                                }(),
                                logic:[],
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
                                if($(".accept:visible").length==0) return false;
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
                        //挂载颜色选择框
                        WebApi.$ColorPicker.$mount("#ColorPicker");
                        //绑定滚动条
                        WebApi.scrollReplace();
                    },
                    methods: {
                        save: function() {
                            var str = JSON.stringify(this.$data);
                            localStorage.data = str;
                            WebApi.invoke('$ModalWin','close')
                        },
                        toggle: function() {
                            WebApi.$Preview.show(JSON.stringify(this.$data))
                        },
                        setindex: function() {
                            if(WebApi.$ColorPicker.visible) return ;
                            this.selectindex = "";
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault", this.selectindex);
                        },
                        setQuestionIndex:function(){
                            var that = this,i = 1;
                            var fn = function(c,index){
                                var j = 0;
                                while(j < c.length)
                                {
                                    var child = c[j++];
                                    if(child.type.indexOf('Question') == -1){
                                        if(child.type=='SectionGroup'&&child.children&&child.children.length!=0)
                                            index = fn(child.children,index);
                                        continue;
                                    }
                                    child.qindex = index ++ ;
                                    if(child.children&&child.children.length!=0)
                                        index = fn(child.children,index);
                                }
                                return index;
                            }
                            fn( that.children , i );
                        }
                    },
                    events: {
                        removeItem:function(index){
                            this.children.splice(index, 1);
                            this.$root.setQuestionIndex();
                        },
                        selectchange: function(fullindex) {
                            if (this.dragging) return;
                            this.selectindex = fullindex;
                            //广播所有的对象都进入非编辑模式
                            this.$broadcast("setdefault", this.selectindex);
                        }
                    }
                })
            }
        }
    })
