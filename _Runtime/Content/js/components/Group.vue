<template>
	<div class="control" data-index="{{paths + index}}">
		<div :class="['control-item','Group',iscurrent?'select':'',component.children.length==0?'no-children':'']" @click.stop="setindex">
			<h2 class="control-title">段落控件</h2>
			<div class="control-panel" v-show="iscurrent">
				<div class="inline-container">
					<span class="split"></span>
					<button @click="removecontrol">删除</button>
				</div>
			</div>
			<div class="content-area">
				<div v-show="edittitling"  class="edittitle" @click.stop="">
					<input type="text" v-model="component.title" v-el:title-input>
				</div>
				<h1 v-show="!edittitling" @click.stop="edittitle">{{ component.title }}</h1>
				<div class="accept" data-index="{{paths +  index + '-0'}}"></div>
				<component  v-for="item in component.children"
					:is = "item.type"
					:component = "item"
					:index = "$index"
					:iscurrent = "$index == selectindex"
					:paths = "prefixpath"
					transition = "fadeInOut"
					></component>
			</div>
		</div>
		<div class="accept" data-index="{{paths + ( index + 1 )}}"></div>
	</div>
</template>
<script>
	import props from './common/props';
	import { setindex ,removecontrol } from './common/methods';
	import { setdefault } from './common/events';
	import { prefixpath , currentpath } from './common/computed';

	export default {
		data(){
			return {
				titletip:'',
				edittitling:false,
				dragging: false,
                selectindex: -1,
                children: []
			}
		},
		props : props ,
		computed:{
			prefixpath
		},
		watch:{
			'component.title':function(_new_,_old_){
				if(_new_ ==='') this.component.title = this.titletip;
			}
		},
		ready(){
			this.titletip = this.component.title;
		},
		methods:{
			edittitle(){
				if(this.iscurrent)
				{
					this.edittitling = true;
					this.edititemsing = false;
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
			setindex: function(){
				if(!this.iscurrent) this.$parent.$emit('selectchange',this.index) ;
				else
				{
					if(this.edittitling)
						this.closeedittitle()
				}
				this.selectindex = -1;
				//广播所有的对象都进入非编辑模式
				this.$broadcast("setdefault",this.selectindex);
			}
		},
		events:{
			setdefault:setdefault(function(){
				this.closeedittitle();
				this.selectindex = -1;
				this.$broadcast("setdefault",this.selectindex);
			}),
			selectchange: function(index) {
			    if (this.dragging) return;
			    if (!this.iscurrent)  this.$parent.$emit('selectchange',this.index) ;
			    this.selectindex = index;
			    //广播所有的对象都进入非编辑模式
			    this.$broadcast("setdefault",this.selectindex);
			},
			removeItem: function(index) {
			    this.component.children.splice(index, 1);
			}
		}
	}
</script>