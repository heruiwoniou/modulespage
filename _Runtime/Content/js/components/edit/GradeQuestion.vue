<template>
	<div class="control" data-index="{{paths + index}}">
	    <div :class="['control-item','GradeQuestion',iscurrent?'select':'']" @click.stop="setindex">
	        <h2 class="control-title" v-show="!iscurrent">评分题</h2>
	        <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
	            <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
	            <span class="split"></span>
	            <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
                <a href="javascript:;" :class="['icon-five']">五分制</a>
                <span class="split"></span>
                <a href="javascript:;" :class="['icon-self']">自填分</a>
                <span class="split"></span>
	            <div class="inline-container">
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-must',component.must ? 'select':'']" @click="setMust">必答题</a>
	                <span class="split"></span>
	                <a href="javascript:;" class="delete" @click="removecontrol"></a>
	            </div>
                <div class="control-panel-sub">
                    <a href="javascript:;" class="no-icon no-hover">选项:</a>
                    <span class="split"></span>
                    <a href="javascript:;" class="icon-star select">星星</a>
                    <span class="split"></span>
                    <a href="javascript:;" class="icon-letter">字母</a>
                    <span class="split"></span>
                    <a href="javascript:;" class="icon-char">汉字</a>
                    <span class="split"></span>
                </div>
	        </div>
	        <div class="content-area">
	        	<div v-show="edittitling" class="edittitle" @click.stop="">
	        	    <input type="text" :style="styleExport" v-model="component.title" @focusout="closetitle" v-el:title-input>
	        	</div>
	        	<h1 v-show="!edittitling" :style="styleExport" @click.stop="edittitle">{{ component.title || titletip }}</h1>
            </div>
        </div>
        <div class="accept" data-index="{{paths + ( index + 1 )}}"><b></b></div>
	</div>
</template>
<script>

	import './../common/transition/fadeInOut';

	import props from './../common/props';

	import { setindex, removecontrol, showColorPicker, setBold, setMust} from './../common/methods';

	import { setdefault } from './../common/events';

	import { prefixpath, fullindex, iscurrent, colorPanel, styleExport } from './../common/computed';

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
        	styleExport
        },
        methods: {
            showColorPicker,
            setBold,
            setMust,
            edittitle() {
                if (this.iscurrent) {
                    this.edittitling = true;
                    this.$nextTick(() => {
                        this.$els.titleInput.focus();
                        this.$els.titleInput.select();
                    })
                } else //stop 冒泡,手动触发
                    this.setindex();
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
                this.closetitle()
            })
        }
	}
</script>