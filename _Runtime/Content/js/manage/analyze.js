define(['vue','libs/echarts/echarts','common/client/Bumper','./../util/filter/date'], function(Vue,echarts,Bumper) {
    var vm,colors=['c1','c2','c3']
    return {
        init: function() {
            this.vue();
            this.echarts();
            this.echartsQuestions();

            //此页面有两种呈现方式,
            //1:选择问题后生成图片
            //2:图表全部一次生成加载
        },
        vue:function(){
            vm = new Vue({
                el: 'body',
                data: {
                    current: 0,
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
                ready:function(){
                    var $win=$(window),height=$win.height();
                    $(this.$els.panelControl1)
                    .add(this.$els.panelControl2)
                    .add(this.$els.panelControl3)
                    .css({minHeight:height -54 - 40 + 'px'})
                    $(this.$els.frameRightContent).css({minHeight:height -54 - 40 - 45 - 20 + 'px'})
                },
                methods: {
                    getColor:function(){
                        return 'c'+Math.ceil(Math.random()*3);
                    },
                    setIndex: function(index) {
                        this.current = index;
                    },
                    togglecommand:function($event){
                        var $el=$($event.currentTarget).closest('.rows')
                        if($el.hasClass('setting'))
                            $el.removeClass('setting');
                        else{
                            $el.closest('.table-grid').find('.rows').removeClass('setting');
                            $el.addClass('setting');
                        }
                    }
                }
            })
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
            var bumper=Bumper.create();
            $(window).resize(function(){
                bumper.trigger(function(){
                    myChart.resize()
                })
            })
        }
        ,echartsQuestions:function(){

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
                var bumper=Bumper.create();
                $(window).resize(function(){
                    bumper.trigger(function(){
                        $mychart.resize()
                    })
                })

            })
        }
    }
});
