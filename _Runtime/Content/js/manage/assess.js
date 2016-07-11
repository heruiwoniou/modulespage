define([
    'vue',
    'common/client/WinResizeResponder',
    './components/ViewTable/index',
    'ztree'
], function(Vue, Responder) {
    var _LRCMain_ = $('#LRCMain');
    var _Vm_;
    return {
        resize: function(wh) {
            _LRCMain_.height(wh - 80).show();
        },
        init: function() {
            var that = this;

            Responder.resize(this.resize);

            _Vm_ = new Vue({
                el: 'body',
                data: {
                    labelNavIndex: 0,
                    //这里是控制是否为自填分
                    self:false,
                    //这里的数据是右侧预览的模拟数据(层级结构)
                    treeData: [
                        {id:'1',pId:'',name:'评价指标'},
                            {id:'11',pId:'1',name:'评价指标',description:'11'},
                                {id:'111',pId:'11',name:'教学目标',description:'111'},
                                    {id:'1111',pId:'111',name:'数学数学',description:'1111'},
                                    {id:'1112',pId:'111',name:'语文',description:'1112'},
                                        {id:'11121',pId:'1112',name:'文言文',description:'语文科目中的难中之难'},
                                        {id:'11122',pId:'1112',name:'现代文',description:'语文科目中的难中之难'},
                                {id:'112',pId:'11',name:'教学内容',description:'112'},
                                {id:'113',pId:'11',name:'教学策略',description:'113'},
                            {id:'12',pId:'1',name:'教学过程',description:'12'},
                            {id:'13',pId:'1',name:'教学效果',description:'13'}
                    ],
                    //这里的数据是右侧预览的模拟数据(选项/自填分)
                    rateData: [
                        {id:'0',text:'完全达到优',value:'100'},
                        {id:'1',text:'大部分达到',value:'85'},
                        {id:'2',text:'中等',value:'75'},
                        {id:'3',text:'较差',value:'60'},
                        {id:'4',text:'极差',value:'60'}
                     ]
                },
                ready: function() {
                    $(".x-scroll-mCustomScrollbar").mCustomScrollbar({
                        theme: "dark",
                        axis: "x",
                        scrollInertia: 400,
                        advanced: { autoScrollOnFocus: false },
                        autoHideScrollbar: true,
                        scrollButtons: { enable: false },
                        mouseWheel: { enable: false }
                    });
                    $(".preview-mCustomScrollbar").mCustomScrollbar({
                        theme: "dark",
                        axis: "xy",
                        scrollInertia: 400,
                        advanced: { autoScrollOnFocus: false },
                        autoHideScrollbar: true,
                        scrollButtons: { enable: false }
                    });
                },
                methods: {
                    toggleLabelNav: function(index) {
                        if (this.labelNavIndex !== index)
                            this.labelNavIndex = index;
                    }
                }
            });
            this.ztree();
            this.draggle();
            WebApi.initControl(_LRCMain_.find('.FrameLeft:first'));
            WebApi.scrollReplace();
            return false;
        },
        draggle: function() {
            var start = 0;
            var _DRAG_ = $("#draggle");
            var _LEFT_ = _DRAG_.prev();
            var _RIGHT_ = _DRAG_.next();
            var minWidth = 500;
            _DRAG_.draggable({
                distance: 10,
                axis: "x",
                start: function(event, ui) {
                    start = ui.position.left;
                },
                stop: function(event, ui) {
                    var dis = start - ui.position.left;
                    var w = _LEFT_.width() - dis;
                    var rw = _RIGHT_.width();
                    if (w > minWidth) {
                        _LEFT_.css({ width: _LEFT_.width() - dis });
                        _RIGHT_.css({ marginLeft: 1 * _RIGHT_.css('marginLeft').replace('px', '') - dis + 'px' })
                    } else {
                        _DRAG_.css({ left: minWidth })
                        _LEFT_.css({ width: minWidth });
                        _RIGHT_.css({ marginLeft: minWidth + 10 +'px' })
                    }
                }
            });
        },
        ztree: function() {
            var setting = {
                data: {
                    simpleData: {
                        enable: true
                    }
                }
            };
            $.fn.zTree.init($("#ztree"), setting, _Vm_.treeData);
        }
    }
})
