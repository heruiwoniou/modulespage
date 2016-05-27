<template>
	<div class="control" data-index="{{paths + index}}">
		<div :class="['control-item','SectionGroup',iscurrent||selectchild?'select':'',component.children.length==0?'no-children':'']" @click.stop="setindex">
			<h2 class="control-title"  v-show="!iscurrent">段落控件</h2>
			<div class="control-panel" v-show="iscurrent||selectchild" transition="fadeInOut">
				<a href="javascript:;" class="icon-bold">加粗</a>
				<span class="split"></span>
				<a href="javascript:;" class="icon-color">颜色</a>
				<div class="inline-container">
					<span class="split"></span>
					<a href="javascript:;" class="delete" @click="removecontrol"></a>
				</div>
			</div>
			<div class="content-area">
				<div v-show="edittitling"  class="edittitle" @click.stop="">
					<input type="text" v-model="component.title" v-el:title-input>
				</div>
				<h1 v-show="!edittitling" @click.stop="edittitle">{{ component.title }}</h1>
				<div class="accept" data-index="{{paths +  index + '-0'}}"><b></b></div>
				<component  v-for="item in component.children" v-if="item!=null"
					:is = "item.type"
					:component = "item"
					:index = "$index"
					:paths = "prefixpath"
					:selectindex = 'selectindex'
					transition = "fadeInOut"
					></component>
			</div>
		</div>
		<div class="accept" data-index="{{paths + ( index + 1 )}}"><b></b></div>
	</div>
</template>
<script>
	import './common/transition/fadeInOut';

	import props from './common/props';
	import { setindex , removecontrol } from './common/methods';
	import { setdefault , removeItem } from './common/events';
	import { prefixpath , fullindex , iscurrent } from './common/computed';

	export default {
		data(){
			return {
				titletip:'',
				edittitling:false,
				selectchild:false
			}
		},
		props : props ,
		watch:{
			'component.title':function(_new_,_old_){
				if(_new_ ==='') this.component.title = this.titletip;
			}
		},
		computed:{
			prefixpath,
			fullindex,
			iscurrent
		},
		ready(){
			this.titletip = this.component.title;
		},
		methods:{
			edittitle(){
				if(this.iscurrent)
				{
					this.edittitling = true;
					this.$nextTick(()=>{
						this.$els.titleInput.focus();
					})
				}
				else //stop 冒泡,手动触发
					this.setindex();
			},
			closeedittitle(){
				this.edittitling = false;
			},
			//移除控件
			removecontrol,
			//设置是否当前选择项及取消编辑
			setindex : setindex (function(){
				if(this.edittitling)
					this.closeedittitle();
			})
		},
		events:{
			setdefault:setdefault(function(){
				this.closeedittitle();
			}),
			removeItem
		}
	}
</script>