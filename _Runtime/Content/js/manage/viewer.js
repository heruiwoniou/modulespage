define(['libs/echarts/echarts'], function(echarts) {
    return {
        init: function() {
            $("input[id*=search]").ButtonTextBoxInit({ ButtonClass: "search" });
            this.echarts();
        },
        echarts: function() {

            var myChart = echarts.init(document.getElementById('main'));
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

            $(window).resize(function(){
                myChart.resize()
            })
        },


        //其他方法
        publish:function(){
            // WebApi.invokeObject('$ModalWin').analyzesrc = "";
            // WebApi.invokeObject('$ModalWin').defaultsrc = "";
            WebApi.modal('publishwindow',{title:"发布活动",src:"publish.html",height:500,width:810});
        }
    }
})