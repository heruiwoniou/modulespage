define(
    [
        'vue',
        'common/client/Request',
        //引用控件
        './../components/preview/TabBar',
        './../components/preview/StaticHeader',
        './../components/preview/ChoiceQuestion',
        './../components/preview/PicChoiceQuestion',
        './../components/preview/SectionGroup',
        './../components/preview/UnmixedText',
        './../components/preview/QuestionResponse',
        './../components/preview/GradeQuestion',
        './../components/preview/MatrixChoiceQuestion',

        'validator'
    ],
    function(Vue,Request) {
        var viewModel;//数据模型
        var find = function(c,arr){
            if(c.children && c.children.length !== 0)
            {
                c.children.forEach(function(o){
                    find(o,arr);
                })
            }else
            {
                if( c.type.indexOf('Question') !== -1)
                {
                    arr.push(c)
                }
            }
        };
        return {
            init: function() {
                this.vue();
            },
            vue: function() {
                viewModel = new Vue({
                    el: 'body',
                    data: (function() {
                        var datastring=WebApi.invokeObject("$Preview").data;
                        return JSON.parse(datastring);
                    }()),
                    ready:function(){
                        this.$emit( 'tofilter' , this.questions[0], null, null)
                    },
                    events:{
                        /**
                         * [tofilter description]
                         * @param  {[type]} type        [description]
                         * @param  {[type]} limitStart  [开始位置]
                         * @param  {[type]} limitEnd    [最近的结束位置]
                         * @param  {[type]} limitMaxEnd [存在的最远结束位置]
                         * @return {[type]}             [description]
                         */
                        tofilter:function(limitStart , limitEnd , limitMaxEnd ){
                            var that = this;
                            var start = false;
                            var end = false;
                            var maxEnd = false;
                            var disabledRange =  {
                                begin:undefined,
                                end:undefined
                            }
                            that.questions.forEach(function(o){
                                if(o.id == limitStart.id && start === false)
                                {
                                    start = true;
                                } else
                                {
                                    if(start)
                                    {
                                        //显示
                                        if(limitEnd == null)
                                        {
                                            if(disabledRange.begin === undefined)
                                            {
                                                disabledRange.begin = that.logic.find(function(item){ return item.from === o.id && item.option === 999 });
                                                that.$broadcast( 'trigger' , o.id , false);
                                            }else {
                                                if(disabledRange.end === undefined)
                                                {
                                                    disabledRange.end = disabledRange.begin.to === o.id ? null : undefined;
                                                    that.$broadcast( 'trigger' , o.id , true);
                                                }

                                                if(disabledRange.end !== undefined)
                                                {
                                                    disabledRange.begin = undefined;
                                                    that.$broadcast( 'trigger' , o.id , false);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            if( o.id !== limitEnd.id && end === false)
                                            {
                                                if(disabledRange.begin === undefined)
                                                {
                                                    disabledRange.begin = that.logic.find(function(item){ return item.from === o.id && item.option === 999 });
                                                    that.$broadcast( 'trigger' , o.id , true);
                                                }else {
                                                    if(disabledRange.end === undefined)
                                                    {
                                                        disabledRange.end = disabledRange.begin.to === o.id ? null : undefined;
                                                        that.$broadcast( 'trigger' , o.id , true);
                                                    }

                                                    if(disabledRange.end !== undefined)
                                                    {
                                                        disabledRange.begin = undefined;
                                                        that.$broadcast( 'trigger' , o.id , true);
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                if(end === false)
                                                {
                                                    end = true ;
                                                }
                                                if(end === true && o.id !== limitMaxEnd.id && maxEnd === false)
                                                {
                                                    that.$broadcast( 'trigger' , o.id , false);
                                                }else {
                                                    maxEnd = true;
                                                    start = false;
                                                    that.$broadcast( 'trigger' , o.id , false);
                                                }
                                            }
                                        }
                                    }
                                }
                            })
                        }
                    },
                    computed:{
                        exportStyle:function(){
                            return {
                                background:this.header&&this.header.src?"#ffffff url(" + this.header.src + ') repeat fixed' : "#fff"
                            }
                        },
                        questions:function(){
                            var arr = [];
                            find(this,arr);
                            return arr;
                        }
                    }
                })
            }
        }
    })
