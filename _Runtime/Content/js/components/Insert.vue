<template>
	<div class="insert-modal" v-show="insert_visible" transition="right-to-center">
		<div class="insert-close" @click="hide"></div>
		<div class="insert-top">
			<div class="insert-top-container">
				<div class="row">
					<div class="col-6">
						<select tip-title="所有模板库和题库" v-model="classify" v-el:classify>
							<option value=""></option>
							<option v-for="item in dropsource" :value="item.value">{{item.text}}</option>
						</select>
					</div>
					<div class="col-6">
						<div class="comsys-base comsys-ButtonTextBox-layout">
							<div class="comsys-ButtonTextBox-input">
								<div class="comsys-base comsys-TextBox">
									<input type="text" placeholder="搜索素材" v-model="search" v-el:search>
								</div>
							</div>
							<div class="comsys-ButtonTextBox-button search" @click="searchMethod"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="insert-bottom">
			<ul>
				<li :class="[islibs?'select':'']"><a href="javascript:;" @click="toggleTab(true)">题库</a></li>
				<li :class="[islibs?'':'select']"><a href="javascript:;" @click="toggleTab(false)">模板库</a></li>
			</ul>
			<div class="insert-line-result">
				共<i>{{ islibs ? subjects.length : tpls.length }}</i>个结果
			</div>
			<div class="insert-content insert-mCustomScrollbar" v-show="islibs">
				<div class="liblist">
					<div class="inline-container" v-if="subjects.length !== 0">
						<button :class='["button",select_array.length ===0 ? "gray" : "p","smaller"]' @click="addSelected">使用选中的题</button>
					</div>
					<component  v-for="sub in subjects"
	                    :is="sub.type + 'Insert'"
	                    :component="sub"
	                ></component>
                </div>
			</div>
			<div class="insert-content insert-mCustomScrollbar" v-else>
				<div class="tpllist" v-if="tplSelectIndex === -1">
					<div class="lib-container" v-for="lib in tpls">
						<div class="lib" @click="detail($index)">
							<b></b>
							<div class="topic">{{lib.header.title}}</div><div class="description">共<i>{{lib.number}}</i>题</div>
						</div>
					</div>
				</div>
				<div class="tpltemplate" v-else>
					<div class="lib-container">
						<div class="lib">
							<b @click="backtpllist"></b>
							<div class="topic">{{tpl.header.title}}</div><div class="description"></div>
						</div>
						<div class="lib-title">
							<div class="inline-container">
								<button :class='["button",select_array.length ===0 ? "gray" : "p","smaller"]' @click="addSelected">使用选中的题</button>
								<button class="button g smaller" @click="addall">使用整个模板</button>
							</div>
							<div class="lib-info">
								共<i>{{tpl.number}}</i>题,被使用<i>{{tpl.used}}</i>次
							</div>
						</div>
						<div class="lib-content">
							<component  v-for="sub in tplcontent"
								:is="sub.type + 'Insert'"
								:component="sub"
							></component>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import './common/transition/rightToCenter';
	import Guid from 'Guid';

	var dispose = function(c , title){
		if( !c.majorkey ) c.majorkey = Guid.NewGuid().ToString("D");
		if( !c.from ) c.from = title;

		return c;
	}

	var recursion = function(o , c , ret){
		c.children.forEach(child => {
			if(child.children)
			{
				recursion( o , child , ret );
			}
			else
			{
				if( child.qindex !== undefined )
					ret.push( dispose( child , o.header.title ) );
			}
		})
	}

	var statistics = function(c , number){
		number = number !== undefined ? number : 0;
		c.children.forEach(o=>{
			if(o.children)
			{
				number = statistics(o,number);
			}
			else
				if(o.qindex !== undefined) number ++;
		});
		return number;
	}

	export default {
		data(){
			return {
				insert_visible:false,

				check_all:false,
				select_array : [],

				islibs : true,
				tplSelectIndex : -1,

				classify:"",
				search:"",

				quote:[],
				dropsource:[]
			}
		},
		watch:{
			'quote':function(){
				WebApi.binddraggle($(this.$el).width());
			}
		},
		computed:{
			subjects:function(){
				var arr = [];
				this.quote.forEach(o=>recursion(o , o , arr));
				return arr;
			},
			tpls:function(){
				var arr = [];
				this.quote.forEach( o => {
					var number = statistics(o);
					o.number = number;
					arr.push(o);
				});
				return arr;
			},
			tpl:function(){
				if(this.tplSelectIndex === -1) return null;
				return this.tpls[this.tplSelectIndex];
			},
			tplcontent:function(){
				if(this.tplSelectIndex === -1 ) return [];
				var arr = [];
				var tpl = this.tpl;
				recursion(tpl , tpl , arr)
				return arr;
			}
		},
		ready(){
			$(this.$els.classify).SingleComboxInit();
			$('.insert-mCustomScrollbar').mCustomScrollbar({
                theme: "dark",
                scrollInertia: 400,
                advanced:{ autoScrollOnFocus: false },
                autoHideScrollbar:true,
                alwaysShowScrollbar:2,
                scrollButtons:{enable:false}
            });
		},
		methods:{
			hide(){
				this.insert_visible = false;
				this.tplSelectIndex = -1;
				this.select_array = [];
			},
			toggle(){
				this.insert_visible = !this.insert_visible;
				if(this.insert_visible)
				{
					this.select_array = [];
					this.islibs = true
				}
			},
			toggleTab(state)
			{
				if(this.islibs === state) return ;
				this.islibs = state;
				this.tplSelectIndex = -1;
				this.select_array = [];
			},
			detail($index){
				this.tplSelectIndex = $index;
				this.select_array = [];
				this.$nextTick(()=>{
					WebApi.binddraggle($(this.$el).width());
				})
			},
			backtpllist(){
				this.tplSelectIndex = -1;
			},
			addSelected(){
				if(this.select_array.length == 0) return;
				var arr = [];
				this.select_array.forEach(majorkey => {
					var object;
					if((object = this.subjects.find( sub => sub.majorkey === majorkey)) !== undefined)
						arr.push(object);
				});
				this.$dispatch('addSelected',arr);
				this.select_array = [];
			},
			addall(){
				if( this.tplSelectIndex == -1 ) return;
				this.$dispatch('addall',this.tpl);
			},
			searchMethod(){
				WebApi.InsertSearch(this.classify,this.search);
				this.islibs = true;
				this.tplSelectIndex = -1;
				this.select_array = [];
			}
		},
		events:{
			SelectArrayChange(majorkey){
				var i;
				if((i = this.select_array.indexOf(majorkey)) === -1)
					this.select_array.push(majorkey);
				else
					this.select_array.splice( i , 1 );
			}
		}
	}
</script>