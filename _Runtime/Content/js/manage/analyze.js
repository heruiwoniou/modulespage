define([
        'vue',
        'echarts',
        'common/client/Bumper',
        'common/client/WinResizeResponder',
        './../util/filter/date'
    ],
    function(Vue,echarts,Bumper,WinResizeResponder) {
        var vm,colors=['c1','c2','c3'],charts = [],reportcharts = [];
        Vue.filter('QIndexItem', function(object) {
            return "Q" + object.qindex + ':' + object.value;
        });
        Vue.filter('QIndexTip', function(object) {
            return "Q" + object.qindex + ':' + object.title;
        })
        var emptydata = {
                            title:"",
                            comment:"",
                            rowsource:[],
                            cellsource:[]
                        };
        var serverdata =
        [
            {
                title:"图表1",
                comment:"测试信息",
                rowsource:[
                    {
                        id:"",
                        value:""
                    }
                ],
                cellsource:[
                    {
                        id:"1",
                        value:"选项1"
                    }
                ]
            }
        ];
        var page = {
            init: function() {
                var me=this;
                this.vue();
            },
            vue:function(){
                vm = new Vue({
                    el: 'body',
                    data: {
                        current: 0,
                        isadd:false,
                        //用于切换最外层的添加报告与进来后的返回
                        isview:false,
                        //用于切换最外层的查看报告与进来后的返回
                        addnewmode:false,
                        editmode:false,
                        editindex:-1,
                        currentdata:{},

                        //这里是报告的数据结构
                        reportdata:[],

                        questionsLibray:[
                            { qindex:1 , id:"1" , title : '你认为什么是教育？',items:['学习','生活','游戏'] },
                            { qindex:2 , id:"2" , title : '你认为什么是素质教育？',items:['自觉','品味','德行'] },
                            { qindex:3 , id:"3" , title : '你最希望在学校学到什么东西？',items:['电脑','数学','语文'] },
                            { qindex:4 , id:"4" , title : '中学生上网情况问卷调查问卷调查',items:['1小时','2小时','三小时'] }
                        ],

                        questions:[
                            {question:"你认为什么是教育？"},
                            {question:"你认为什么是素质教育？"},
                            {question:"你最希望在学校学到什么东西？"}
                        ],
                        analyzes:[
                            {title:'中学生上网情况问卷调查问卷调查',date:'2016-6-21'},
                            {title:'中学生上网情况问卷调查问卷调查',date:'2016-6-21'},
                            {title:'中学生上网情况问卷调查问卷调查',date:'2016-6-21'},
                            {title:'中学生上网情况问卷调查问卷调查',date:'2016-6-21'},
                            {title:'中学生上网情况问卷调查问卷调查',date:'2016-6-21'}
                        ]
                    },
                    computed:{
                        rows:function(){
                            var that=this;
                            if(!this.currentdata.rowsource)return [];
                            var ret = this.currentdata.rowsource.filter(function(o){
                                return o.value!=="";
                            }).map(function(o){
                                o.qindex = that.questionsLibray.find(function(q){return q.id == o.id}).qindex;
                                return o;
                            });

                            return ret;
                        },
                        cells:function(){
                            if(!this.currentdata.cellsource)return [];
                            return this.currentdata.cellsource.filter(function(o){
                                return o.value!=="";
                            });
                        }
                    },
                    ready:function(){
                        var that = this;
                        charts.push(page.echarts());
                        charts.push(page.echartsQuestions());
                        var $panles = $(this.$els.panelControl1).add(this.$els.panelControl2).add(this.$els.panelControl3);
                        var $frameRightContent = $(that.$els.frameRightContent);
                        var $addNewReport = $(that.$els.addNewReport);
                        WinResizeResponder.resize(function(height){
                            var height = height - 98 - 87;
                            $frameRightContent.css({minHeight:height - 65 + 'px'});
                            $panles.css({minHeight:height + 'px'})
                            $addNewReport.css({height: height - 95 + 'px'})
                                .find('.FrameRight .no-m-container').css({height: height - 95 + 'px'})
                            charts.forEach(chart=>Array.isArray(chart)?chart.forEach(o=>o.resize()):chart.resize());
                            reportcharts.forEach(function(c){ c.resize(); });
                        })
                    },
                    methods: {
                        scrollTo:function(index){
                            $(".mCustomScrollbar").mCustomScrollbar('scrollTo',$('.question-item:eq(' + index + ')'))
                        },
                        getColor:function(){
                            return 'c'+Math.ceil(Math.random()*3);
                        },
                        setIndex: function(index) {
                            if(this.current == index) return;
                            this.current = index;
                            this.isadd = false;
                            this.addnewmode = false;
                            this.isview =false;
                        },
                        togglecommand:function($event){
                            var $el=$($event.currentTarget).closest('.rows')
                            if($el.hasClass('setting'))
                                $el.removeClass('setting');
                            else{
                                $el.closest('.table-grid').find('.rows').removeClass('setting');
                                $el.addClass('setting');
                            }
                        },
                        hasChooseOption:function(id){
                            return this.questionsLibray.filter(function(o){ return o.id == id }).length == 1;
                        },
                        setoption:function(item,option){
                            debugger;
                            item.value = option;
                        },
                        newviewtoggle:function(s1,s2){
                            this.isadd = s1
                            this.isview = s2
                            this.addnewmode = false;
                            this.editmode = false;
                            this.eidtindex = -1;

                            this.currentdata = emptydata;

                            if(s1)
                            {
                                this.reportdata = [];
                            }
                            if(s2)
                            {
                                this.reportdata = serverdata;
                            }

                            this.$nextTick(function(){
                                WebApi.initControl($("#reportmain"));
                                WebApi.gPresentationLayer();
                            });

                        },
                        addfilter:function($event,source){
                            source.push({
                                id:"",
                                value:""
                            });
                            this.$nextTick(function(){
                                $($event.target).closest(".PanelControl").find("select").SingleComboxInit();
                            })
                        },
                        addnewmodeltoggle:function(s){
                            if(s === this.addnewmode) return
                            var that = this;
                            this.addnewmode = s;
                            this.editmode = false;
                            this.currentdata = emptydata;
                            this.editindex = -1;
                        }
                    }
                })
            },
            selectchange:function(source,target){
                            target.options = source.items;
             },
            echarts: function() {

                var myChart = echarts.init(document.getElementById('chart0'));
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: 'ECharts 入门示例'
                    },
                    tooltip: {},
                    legend: {
                        data: ['销量']
                    },
                    xAxis: {
                        data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
                    },
                    yAxis: {},
                    series: [{
                        name: '销量',
                        type: 'bar',
                        data: [5, 20, 36, 10, 10, 20]
                    }]
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);
                return myChart;
            }
            ,echartsQuestions:function(){
                var charts = [];
                //渲染除全部选项外的其它图标
                $('div[id*=chart]:not(#chart0)').each(function(){
                    var $mychart=echarts.init(this);

                    //这里可以根据问题的不同用ajax从服务器取出具体数据,也可以使用提前取好了的数据
                    var option = {
                        title : {
                            text: '某站点用户访问来源',
                            subtext: '纯属虚构',
                            x:'center'
                        },
                        tooltip : {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left',
                            data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
                        },
                        series : [
                            {
                                name: '访问来源',
                                type: 'pie',
                                radius : '55%',
                                center: ['50%', '60%'],
                                data:[
                                    {value:335, name:'直接访问'},
                                    {value:310, name:'邮件营销'},
                                    {value:234, name:'联盟广告'},
                                    {value:135, name:'视频广告'},
                                    {value:1548, name:'搜索引擎'}
                                ],
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    $mychart.setOption(option);
                    charts.push($mychart);
                });

                return charts;
            },

            //以下为生成综合情况的页面
            gPresentationLayer:function(){
                reportcharts = [];
                $('div[id^=PresentationLayer]').each(function(){
                    var $mychart=echarts.init(this);
                    //这里可以根据问题的不同用ajax从服务器取出具体数据,也可以使用提前取好了的数据
                    var option = {
                        xAxis: {
                            data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
                        },
                        yAxis: {},
                        series: [{
                            name: '销量',
                            type: 'bar',
                            data: [5, 20, 36, 10, 10, 20]
                        }]
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    $mychart.setOption(option);
                    reportcharts.push($mychart);
                });
            }
        }
        return page;
    }
);
