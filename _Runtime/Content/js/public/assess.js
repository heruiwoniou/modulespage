define([
    'vue',
    './../manage/components/ViewTable/index'
], function(Vue, Responder) {
    var _Vm_;
    return {
        init: function() {
            var that = this;
            _Vm_ = new Vue({
                el: 'body',
                data: {
                    chooseTeach:{id:0,name:'测试老师1'},
                    teacherList:[
                        {id:0,name:'测试老师1'},
                        {id:1,name:'测试老师2'},
                        {id:2,name:'测试老师3'},
                        {id:3,name:'测试老师4'}
                    ],

                    toggleInfo:false,
                    treeData: [
                        {id:'1',pId:'',name:'评价指标'},
                            {id:'11',pId:'1',name:'评价指标',description:'11'},
                                {id:'111',pId:'11',name:'教学目标',description:'111'},
                                    {id:'1111',pId:'111',name:'数学数学',description:'1111'},
                                    {id:'1112',pId:'111',name:'语文',description:'1112'},
                                        {id:'11121', value:"0" ,pId:'1112',name:'文言文',description:'语文科目中的难中之难'},
                                        {id:'11122', value:'3' ,pId:'1112',name:'现代文',description:'语文科目中的难中之难'},
                                {id:'112',pId:'11',name:'教学内容',description:'112'},
                                {id:'113',pId:'11',name:'教学策略',description:'113'},
                            {id:'12',pId:'1',name:'教学过程',description:'12'},
                            {id:'13',pId:'1',name:'教学效果',description:'13'}
                    ],
                    rateData: [
                        {id:'0',text:'完全达到优',value:'100'},
                        {id:'1',text:'大部分达到',value:'85'},
                        {id:'2',text:'中等',value:'75'},
                        {id:'3',text:'较差',value:'60'},
                        {id:'4',text:'极差',value:'60'}
                     ]
                },
                methods:{
                    toggle:function(){
                        this.toggleInfo = !this.toggleInfo;
                    },
                    choosePerson:function(){
                        WebApi.window({title:"选择你要评价的老师",content:$("#person-list") ,width:250,height:300})
                    }
                }
            });
            WebApi.scrollReplace();
            WebApi.initControl($("#person-list"))
            return false;
        }
    }
})