<template>
	<div class="control" data-index="{{paths + index}}">
		<div :class="['control-item','ChoiceQuestion',iscurrent?'select':'']" @click.stop="setindex">
			<h2 class="control-title"  v-show="!iscurrent">选择题控件</h2>
			<div class="control-panel" v-show="iscurrent" transition="fadeInOut">
				<a href="javascript:;" class="icon-bold">加粗</a>
				<span class="split"></span>
				<a href="javascript:;" class="icon-color">颜色</a>
				<span class="split"></span>
				<a href="javascript:;" class="icon-radio">单选</a>
				<span class="split"></span>
				<a href="javascript:;" class="icon-check">多选</a>
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
				<div v-show="!edititemsing&&children.length==0" @click.stop="edititems" class="edititems-tip">
					内容(点击编辑)
				</div>
				<div v-show="edititemsing" class="edititems"  @click.stop="">
					<textarea cols="30" rows="{{textarearow}}" v-model="component.items" v-el:items-textarea></textarea>
				</div>
				<table v-if="!edititemsing&&children.length!=0" @click.stop="edititems">
					<tr v-for="row in Math.ceil(children.length / columns)">
						<td v-for="col in columns" v-if="( row * columns + col ) <= children.length - 1">
							<label><input type="checkbox" name="{{component.id}}" value="{{row * columns + col}}">{{  children[row * columns + col] }}</label>
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div class="accept" data-index="{{paths + ( index + 1 )}}"><b></b></div>
	</div>
</template>
<script>
	import './common/transition/fadeInOut';

	import props from './common/props';
	import { setindex ,removecontrol } from './common/methods';
	import { setdefault } from './common/events';
	import { prefixpath , fullindex , iscurrent } from './common/computed';

	export default {
		data(){
			return {
				titletip:'',
				edittitling:false,
				edititemsing:false,
				maxrows:10
			}
		},
		props:props,
		watch:{
			'component.title':function(_new_,_old_){
				if(_new_ ==='') this.component.title = this.titletip;
			}
		},
		computed:{
			textarearow(){
				var l=this.component.items.split('\n').length;
				return l > this.maxrows ? this.maxrows : l;
			},
			children(){
				return this.component.items.split('\n').filter(o=>o!=='');
			},
			columns(){
				return Math.ceil( this.children.length / this.maxrows );
			},
			prefixpath,
			fullindex,
			iscurrent
		},
		ready(){
			this.titletip = this.component.title;
		},
		methods:{
			edititems(){
				if(this.iscurrent)
				{
					this.edititemsing = true;
					this.edittitling = false;
					this.$nextTick(()=>{
						this.$els.itemsTextarea.focus();
					})
				}
				else //stop 冒泡,手动触发
					this.setindex();
			},
			closeedititems(){
				this.edititemsing = false;
			},
			edittitle(){
				if(this.iscurrent)
				{
					this.edittitling = true;
					this.edititemsing = false;
					this.$nextTick(()=>{
						this.$els.titleInput.focus();
						this.$els.titleInput.select();
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
				if(this.edititemsing)
					this.closeedititems();
			})
		},
		events:{
			setdefault:setdefault(function(){
				this.closeedittitle()
				this.closeedititems();
			})
		}
	}
</script>