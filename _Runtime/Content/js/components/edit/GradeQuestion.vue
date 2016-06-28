<template>
	<div class="control" data-index="{{paths + index}}">
	    <div :class="['control-item','GradeQuestion',iscurrent?'select':'']" @click.stop="setindex">
	        <h2 class="control-title" v-show="!iscurrent">评分题</h2>
	        <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
	            <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
	            <span class="split"></span>
	            <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
                <a href="javascript:;" :class="['icon-five',component.self?'':'select']" @click="toggleMode(false)">五分制</a>
                <span class="split"></span>
                <a href="javascript:;" :class="['icon-self',component.self?'select':'']" @click="toggleMode(true)">自填分</a>
                <span class="split"></span>
	            <div class="inline-container">
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-must',component.must ? 'select':'']" @click="setMust">必答题</a>
	                <span class="split"></span>
	                <a href="javascript:;" class="delete" @click="removecontrol"></a>
	            </div>
                <div class="control-panel-sub"  v-show="!component.self">
                    <a href="javascript:;" class="no-icon no-hover">选项:</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-star',component.xtype==0 ?'select':'']" @click="toggleXtype(0)">星星</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-letter',component.xtype==1 ?'select':'']" @click="toggleXtype(1)">字母</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-char',component.xtype==2 ?'select':'']" @click="toggleXtype(2)">汉字</a>
                    <span class="split"></span>
                </div>
                <div class="control-panel-sub" v-show="component.self">
                    <a href="javascript:;" class="no-icon no-hover">选项:</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-slider',component.xtype==3 ?'select':'']" @click="toggleXtype(3)">滑条</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-choose',component.xtype==4 ?'select':'']" @click="toggleXtype(4)">选择分数</a>
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-input',component.xtype==5 ?'select':'']" @click="toggleXtype(5)">填分</a>
                    <span class="split"></span>
                    <a href="javascriptp:;" class="no-icon no-hover">
                    分值:<input type="text" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')"
                     v-model="component.range.min" number lazy>到<input type="text" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')" v-model="component.range.max" number lazy>
                    </a>
                </div>
	        </div>
	        <div class="content-area">
	        	<div v-show="edittitling" class="edittitle" @click.stop="">
	        	    <input type="text" :style="styleExport" v-model="component.title" @focusout="closetitle" v-el:title-input>
	        	</div>
	        	<h1 v-show="!edittitling" :style="styleExport" @click.stop="edittitle"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title || titletip }}</h1>
                <div class="operate star-panel" v-if="component.xtype==0">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="operate letter-panel" v-if="component.xtype==1">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span>D</span>
                    <span>E</span>
                </div>
                <div class="operate char-panel" v-if="component.xtype==2">
                    <span>优</span>
                    <span>良</span>
                    <span>中</span>
                    <span>及格</span>
                    <span>差</span>
                </div>
                <div class="operate slider-panel" v-if="component.xtype==3">
                    <div class="containment">
                        <div class="arrow">
                            <div class="pointer">
                                <div class="number">0</div>
                            </div>
                        </div>
                        <div class="bar"></div>
                    </div>
                </div>
                <div class="operate choose-panel" v-if="component.xtype==4">
                    <span v-for="n in limitRange">{{n}}</span>
                </div>
                <div class="operate input-panel" v-if="component.xtype==5">
                    <input type="text" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')">
                </div>
            </div>
        </div>
        <div class="accept" data-index="{{paths + ( index + 1 )}}"><b></b></div>
	</div>
</template>
<script>

	import './../common/transition/fadeInOut';

    import Bumper from 'common/client/Bumper';

	import props from './../common/props';

	import { setindex, removecontrol, showColorPicker, setBold, setMust, closeColorPicker} from './../common/methods';

	import { setdefault } from './../common/events';

	import { prefixpath, fullindex, iscurrent, colorPanel, styleExport } from './../common/computed';

    var bumper = Bumper.create();

	export default {
		data() {
	        return {
	            titletip: '标题(点击编辑)',
	            edittitling: false,
            }
        },
        props: props,
        computed:{
        	prefixpath,
        	fullindex,
        	iscurrent,
        	colorPanel,
        	styleExport,
            limitRange:function(){
                var arr = [];
                for(var i = this.component.range.min ; i <= this.component.range.max ; i++ )
                    arr.push(i);
                return arr;
            }
        },
        watch:{
            'component.range.min':function(_new_,_old_){
                if(_new_=="") this.component.range.min = 0;
                if(_new_.toString().length > this.component.range.charlength)
                    this.component.range.min = 1*this.component.range.min.toString().substr(0,this.component.range.charlength)
            },
            'component.range.max':function(_new_,_old_){
                if(_new_=="") this.component.range.max = 0;
                if(_new_.toString().length > this.component.range.charlength)
                    this.component.range.max = 1*this.component.range.max.toString().substr(0,this.component.range.charlength)
            },
            'component.title':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o =>o.value.from ='Q' + this.component.qindex + ":" + _new_);
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to = 'Q' + this.component.qindex + ":" + _new_);
                });
            },
            'component.qindex':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o => o.value.from = o.value.from.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to = o.value.to.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                });
            }
        },
        methods: {
            showColorPicker,
            setBold,
            setMust,
            toggleMode(status){
                this.component.self = status;
                closeColorPicker();
            },
            toggleXtype(xtype){
                this.component.xtype = xtype;
                closeColorPicker();
            },
            edittitle() {
                this.edittitling = true;
                this.$nextTick(() => {
                    this.$els.titleInput.focus();
                    this.$els.titleInput.select();
                })
                if (!this.iscurrent) this.setindex();
            },
            closetitle() {
                this.edittitling = false;
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.edittitling)
                    this.closetitle();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closetitle();
            })
        }
	}
</script>