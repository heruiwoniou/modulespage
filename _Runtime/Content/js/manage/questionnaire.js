define(
    [
        'vue',
        './../components/setting',
        //公用组件
        './../components/Perview',
        './../components/ColorPicker',
        './../components/Logic',
        './../components/Insert',
        //引用控件
        './../components/edit/TabBar',
        './../components/edit/StaticHeader',
        './../components/edit/ChoiceQuestion',
        './../components/edit/PicChoiceQuestion',
        './../components/edit/SectionGroup',
        './../components/edit/UnmixedText',
        './../components/edit/QuestionResponse',
        './../components/edit/GradeQuestion',
        './../components/edit/MatrixChoiceQuestion',

        //引用插件预览
        './../components/insert/ChoiceQuestionInsert',
        './../components/insert/PicChoiceQuestionInsert',
        './../components/insert/GradeQuestionInsert',
        './../components/insert/MatrixChoiceQuestionInsert',
        './../components/insert/QuestionResponseInsert'
    ],
    function(
        Vue,
        setting,
        Perview,
        ColorPicker,
        Logic,
        Insert
    ) {
        var viewModel,//数据模型
        droppables,//可填充对象坐标信息
        droppablescrollbar,//滚动范围对象
        droppablescrolltop,//开始拖动时的滚动条位置信息
        droppablecache;//当前选中的可填充对象信息
        return {
            $Preview: new Perview(),
            $ColorPicker: new ColorPicker(),
            init: function() {
                this.vue();
                return false;
            },
            insert:function(e){
                e = e || event;
                var that = this;
                viewModel.$refs.insert.toggle();
                viewModel.$nextTick(function(){
                    if(that.$Preview) that.$Preview.close();
                });
                if ( e && e.stopPropagation ) e.stopPropagation();
                else window.event.cancelBubble = true;
                if ( e && e.preventDefault ) e.preventDefault();
                else window.event.returnValue = false;
                return false;
            },
            InsertSearch:function(classify,search){
                var str = JSON.stringify(viewModel.$data);
                viewModel.$refs.insert.$set('quote' , [JSON.parse(str)]);
            },
            showLogic:function(){
                WebApi.modal({content:$('#Logic'),title:"逻辑设置",width:800,height:425})
            },
            //计算容器所在坐标
            countdroppables: function($target,left) {
                left = left || 200;
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
                            left: left,
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
            template: function( children , key ){
                var template;
                for( var i = 0 ; i < children.length ; i++ )
                {
                    if( children[ i ].children)
                    {
                        if((template = arguments.callee(children[ i ].children , key)) !== undefined) return template;
                    }
                    else
                    {
                        if( children[ i ].majorkey == key )
                            if((template = children[ i ]) !== undefined) return template;
                    }
                }
                return template;
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
                    var majorkey = ui.helper.data('majorkey');
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
                        if(majorkey)
                        {
                            var data = WebApi.template( viewModel.$refs.insert.quote , majorkey );
                            component = setting( type , data);
                        }
                        else
                            component = setting(type);
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
            binddraggle:function(left){
                $(".control-small:not([draggable])").draggable({
                    distance: 10,
                    appendTo: "body",
                    helper: "clone",
                    opacity: 0.8,
                    start: function(event, ui) {
                        ui.helper.css({ width : $(event.target).width() });
                        viewModel.setindex();
                        if($(".accept:visible").length==0) return false;
                        WebApi.countdroppables($(".accept").not(ui.helper.find('.accept')),left);
                    },
                    drag: WebApi.drag,
                    stop: function(event, ui) {
                        WebApi.drop(ui);
                    }
                }).attr("draggable", "");
            },
            bindaccept: function() {
                $(".control:not([draggable])").draggable({
                    addClasses: true,
                    distance: 10,
                    appendTo: "body",
                    opacity: 0.8,
                    revertDuration: 200,
                    start: function(event, ui) {
                        ui.helper.css({ width : $(event.target).width() });
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
                        var source ={};
                        if (localStorage.data && localStorage.data !== "null" && localStorage.data !== "undefined") {
                            source = JSON.parse(localStorage.data);
                        } else {
                            source = {
                                header: function() {
                                    return setting('StaticHeader');
                                }(),
                                tab:function(){
                                    return setting('TabBar');
                                }(),
                                logic:[],
                                children: []
                            };
                        }
                        return $.extend(source,{
                            dragging: false,
                            selectindex: ""
                        })
                    }()),
                    ready: function() {
                        WebApi.binddraggle();

                        WebApi.bindaccept();
                        //挂载预览框
                        WebApi.$Preview.$mount("#Perview");
                        //挂载颜色选择框
                        WebApi.$ColorPicker.$mount("#ColorPicker");
                        //绑定滚动条
                        WebApi.scrollReplace();

                        $('.edit-mCustomScrollbar').mCustomScrollbar({
                            theme: "dark",
                            scrollInertia: 400,
                            advanced:{ autoScrollOnFocus: false },
                            autoHideScrollbar:true,
                            alwaysShowScrollbar:2,
                            scrollButtons:{enable:false}
                        });


                        this.$refs.insert.dropsource=[
                            {value:"1",text:"模板1"},
                            {value:"1",text:"模板2"},
                            {value:"1",text:"模板3"}
                        ];

                    },
                    methods: {
                        save: function() {
                            var str = JSON.stringify(this.$data);
                            localStorage.data = str;
                            WebApi.invoke('$ModalWin','close');
                            //this.quote = [JSON.parse(str)];
                        },
                        toggle: function() {
                            this.$refs.insert.hide();
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
                        },
                        addSelected:function(objects){
                            //添加到指定路径
                            var component,target = this;
                            if(this.selectindex !=='' && this.selectindex !== '99' && this.selectindex !== '98')
                            {
                                var path_array = this.selectindex.split('-');
                                var index = ~~path_array.pop(),path
                                while (path = path_array.shift()) {
                                    target = target.children[~~path];
                                }
                                objects.forEach(function(o){
                                    component = setting( o.type , o );
                                    target.children.splice(++index, 0, component)
                                });
                            }else
                            {
                                //添加到最后
                                objects.forEach(function(o){
                                    component = setting( o.type , o );
                                    target.children.push( component );
                                });
                            }
                            this.$nextTick(function() {
                                WebApi.bindaccept();
                            });
                        },
                        addall:function(tpl){
                            var component,that=this;
                            tpl.children.forEach(function(o){
                                component = setting( o.type , o );
                                that.children.push( component );
                            });
                            this.setQuestionIndex();
                            this.$nextTick(function() {
                                WebApi.bindaccept();
                            });
                        }
                    }
                })
            }
        }
    })
