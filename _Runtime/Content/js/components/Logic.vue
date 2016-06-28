<template>
	<div class="logic">
		<template v-for="pageindex in totalPage">
			<div class="logic-page" v-show='currentpage==pageindex'>
				<h1>已设置跳转条件({{logic.length}})
				<div class="inline-container">
					<i>每页{{pagesize}}条</i><i>当前第{{pageindex + 1}}页</i>
					<template v-if="pageindex==0">
						<a class="button disabled smaller empty" href="javascript:;">上一页</a>
					</template>
					<template v-else>
						<a class="button g smaller empty" href="javascript:;" @click="last">上一页</a>
					</template>
					<template v-if="pageindex == totalPage - 1">
						<a class="button disabled smaller empty" href="javascript:;">下一页</a>
					</template>
					<template v-else>
						<a class="button g smaller empty" href="javascript:;" @click="next">下一页</a>
					</template>
				</div>
				</h1>
				<table>
					<tr class="oldrow" v-for="item in logic | limitBy pagesize pageindex*pagesize">
						<td class="label-1">如果</td>
						<td>
							<select disabled="disabled">
								<option :value="item.from">{{item.value.from}}</option>
							</select>
						</td>
						<td class="label-2" v-if="item.choice">选择了</td>
						<td class="label-2" v-else></td>
						<td>
							<select disabled="disabled">
								<option :value="item.option">{{item.value.option}}</option>
							</select>
						</td>
						<td class="label-3">则跳转到</td>
						<td>
							<select disabled="disabled">
								<option :value="item.to">{{item.value.to}}</option>
							</select>
						</td>
						<td class="label-4" @click="removerow(pageindex*pagesize + $index)"><a href="javascript:;">&#x4f;</a></td>
					</tr>
				</table>
			</div>
		</template>
		<template v-if="logic.length == 0">
			<h1>已设置跳转条件(0)</h1>
		</template>
		<table>
			<tr class="newrow" v-show="edit">
				<td class="label-1">如果</td>
				<td>
					<select v-model="cache.from" v-el:from-control>
						<option value=''>-请选择题目-</option>
						<template v-for="item in fromquestions">
							<option :value="item.id">Q{{item.qindex}}:{{item.title}}</option>
						</template>
					</select>
				</td>
				<td class="label-2" v-if="cache.choice">选择了</td>
				<td class="label-2" v-else></td>
				<td>
					<select v-model="cache.option" v-el:option-control>
						<option value=''>-请选择选项-</option>
						<template v-for="option in options">
							<option :value="option.index">{{option.value}}</option>
						</template>
					</select>
				</td>
				<td class="label-3">则跳转到</td>
				<td>
					<select v-model="cache.to" v-el:to-control>
						<option value=''>-请选择题目-</option>
						<template v-for="item in toquestion">
							<option :value="item.id">Q{{item.qindex}}:{{item.title}}</option>
						</template>
					</select>
				</td>
				<td class="label-4" @click="removenew"><a href="javascript:;">&#x4f;</a></td>
			</tr>
			<tr class="addrow" v-else><td colspan="2" @click="addrow"><a href="javascriptp:;">&#x50;</a></td><td colspan="5"></td></tr>
		</table>
	</div>
</template>
<script>
	import { toString } from './common/util';

	const filterArray = function(arr){
		var result = [];
		for(var i = 0 ; i < arr.length ; i ++)
		{
			var item = arr[i];
			if(item.type == 'SectionGroup')
				result = result.concat(filterArray(item.children));
			if(item.type == 'ChoiceQuestion' || item.type =='PicChoiceQuestion' || item.type == 'GradeQuestion' || item.type == 'QuestionResponse' || item.type == 'MatrixChoiceQuestion')
				result.push(item);
		}
		return result ;
	}

	const validate = function(){
		var {choice,from,option,to} = this.cache;
		if(from !== '' && option !== '' && to !== '')
		{
			if(this.logic.filter(o=>o.from === from && o.option === option && o.to===to ).length == 0)
			{
				this.logic.push({
					choice,
					from,
					option,
					to,
					value:{
						from:this.$els.fromControl.options[this.$els.fromControl.selectedIndex].text,
						option:this.$els.optionControl.options[this.$els.optionControl.selectedIndex].text,
						to:this.$els.toControl.options[this.$els.toControl.selectedIndex].text
					}
				});
			}
		}
		else return;
		this.currentpage = this.totalPage - 1;
		this.edit = false;
	}

	export default {
		data(){
			return {
				edit:false,
				currentpage:0,
				pagesize:10,
				cache:{
					choice:true,
					from:'',
					option:'',
					to:''
				}
			}
		},
		props:{
			logic:{
				type:Array,
				default:function(){return [];}
			},
			children:[]
		},
		watch:{
			'cache.from' : validate,
			'cache.option' : validate,
			'cache.to':validate
		},
		ready(){
			this.currentpage = this.totalPage - 1
		},
		computed:{
			totalPage(){
				return Math.ceil(this.logic.length/this.pagesize);
			},
			fromquestions(){
				//再次过滤已经有了的
				var original =  filterArray(this.children);
				return original;
				// return original.filter(o => {
				// 	var c = this.logic.filter(m => m.from == o.id);
				// 	if (o.type == 'PicChoiceQuestion' || o.type == 'ChoiceQuestion')
				// 		return c.length != o.items.length;
				// 	else if ( o.type == 'GradeQuestion' || o.type == 'QuestionResponse' || o.type == 'MatrixChoiceQuestion')
				// 		return c.length == 0;
				// });
			},
			options(){
				this.cache.choice = true;
				if(this.cache.from=='')
					return []
				else
				{
					var item = this.fromquestions.filter(o=>o.id == this.cache.from)[0];
					if(item === undefined) return [];
					if(item.type == 'ChoiceQuestion' || item.type == 'PicChoiceQuestion')
					{
						var history = this.logic.filter(o=>o.from == this.cache.from);
						var ret = item.items
						//这里是过滤掉已经选过的对象
						//.filter((o,i)=>history.filter(m => m.option === i).length === 0)
						.map(o => { return { index:item.items.indexOf(o),value: (toString(o) == '[object String]' ? o : o.text) };});
						ret.push({index:999,value:"显示"});
						return ret;
					}
					else if ( item.type == 'GradeQuestion' || item.type == 'QuestionResponse' || item.type == 'MatrixChoiceQuestion')
					{
						this.cache.choice = false;
						return [{index:999,value:"显示"}];
					}
				}
			},
			toquestion(){
				var cindex = -1, i;
				var arr = this.fromquestions;
				var  { from , option , to , choice} = this.cache;
				if(from === '' || option === '') return [];

				//获取本身的索引
				for(i = 0; i < arr.length ; i++)
					if(arr[i].id == this.cache.from){
						cindex = i;
						break;
					}
				if(cindex === -1) return [];
				//通过索引过滤出源题以下选项
				//arr = arr.filter((o,index)=>index > cindex );
				//通过索引过滤掉本身
				arr = arr.filter((o,index)=>index !== cindex );

				//剔除已经使用过的
				this.cache.choice = false;
				var used = this.logic.filter(o => o.from===from && o.option === option);
				arr = arr.filter(o=>{
					return used.filter(m => m.to === o.id ).length == 0;
				});

				return arr;
			}
		},
		methods:{
			addrow(){
				this.cache = {
					choice:true,
					from:'',
					option:'',
					to:''
				}
				this.edit =  true;
			},
			removerow(index){
				this.logic.splice(index,1);
				this.currentpage = this.totalPage - 1;
			},
			removenew(){
				this.edit =  false;
			},
			last(){
				this.currentpage -- ;
			},
			next(){
				this.currentpage ++ ;
			}
		}
	}
</script>