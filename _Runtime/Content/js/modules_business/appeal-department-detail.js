define(['./components/treeNode/index'],function(){
	//code here
	return {
		//mothod here
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			//
			var Vm,
				toString = Object.prototype.toString,
				stayTree,
				selectedTree;
			//递归取得nodes
			var r = function(node, isto){
				var result = [],i;
				node = node;
				if ( toString.apply( node.nodes ) === '[object Array]' )
					for ( i = 0 ; i < node.nodes.length ; i ++)
					{
						if( ( !isto && !node.nodes[i].checked ) || ( isto && !node.nodes[i].invisible ))
							result.push( node.nodes[i] );
					}
				if( node.children )
					for ( i = 0 ; i < node.children.length ; i ++)
					{
						result = result.concat( arguments.callee(node.children[i], isto) )
					}
				return result;
			}
			//处理from数据添加到to数据
			var disposefrom = function(to,from){
				var i,status = false;
				if ( toString.apply( to.nodes ) === '[object Array]' )
				{
					for ( i = to.nodes.length - 1 ; i >= 0 ; i --)
					{
						if(to.nodes[i].stay === true || to.nodes[i].checked === true)
						{
							from.nodes[i].checked = true;
							delete from.nodes[i].stay;
							delete to.nodes[i].stay;
							status = true;
						}else
							to.nodes[i].invisible = true
					}
				}
				if( to.children )
				{
					var innerStatus = false;
					for ( i = to.children.length - 1 ; i >= 0  ; i --)
					{
						var s = arguments.callee( to.children[i] ,from.children[i]).status;
						if( !s ) to.children[i].invisible = true;
						innerStatus = s || innerStatus;
					}
				}
				return { data: to, status: status || innerStatus };
			}
			//循环to数据处理from数据
			var disposeto = function(to, from){
				var i,status = false;
				if ( toString.apply( to.nodes ) === '[object Array]' )
					for ( i = to.nodes.length - 1 ; i >= 0 ; i --)
					{
						from.nodes[i].stay = false;
						if( to.nodes[i].stay === true )
							from.nodes[i].checked = false;
					}
				if( to.children )
					for ( i = to.children.length - 1 ; i >= 0  ; i --)
						arguments.callee( to.children[i] ,from.children[i]);
				return { data: to, status: status };
			}

			Vm = new Vue({
				el:'#department-control',
				data:{
					staycurrent: null,
					selectedcurrent: null,

					from: {
						children:[
							{
								id:'1',
								name:'长春中医药大学',
								children:[
									{
										id: '1-1', name: '教务部',
										children: [
											{
												id:'1-1-1',name:'教务部A区',
												nodes:[
													{ id:'1-1-1-1',name:'何老师', checked: false },
													{ id:'1-1-1-2',name:'欧阳老师', checked: false },
													{ id:'1-1-1-3',name:'莫老师', checked: false }
												]
											},
											{ id:'1-1-2',name:'教务部B区' },
											{ id:'1-1-3',name:'教务部C区' }
										]
									},
									{
										id: '1-2', name: '学工部',
										nodes: [
											{ id:'1-2-1',name:'何老师', checked: false },
											{ id:'1-2-2',name:'欧阳老师', checked: false },
											{ id:'1-2-3',name:'莫老师', checked: false }
										]
									},
									{
										id: '1-3', name: '后勤部',
										nodes: [
											{ id:'1-3-1',name:'李老师', checked: false },
											{ id:'1-3-2',name:'王老师', checked: false }
										]
									}
								]
							},
							{
								id:'2',
								name:'清华大学',
								children:[
									{
										id: '2-1', name: '教务处',
										nodes: [
											{id:'2-1-1',name:'何老师', checked: false }
										]
									},
									{
										id: '2-2', name: '体育部',
										nodes: [
											{id:'2-2-1',name:'何老师', checked: false },
											{id:'2-2-2',name:'欧阳老师', checked: false }
										]
									},
									{
										id: '2-3', name: '艺体部',
										nodes: [
											{id:'2-3-1',name:'莫老师', checked: false }
										]
									}
								]
							}
						]
					},
					to: {
						children:[]
					}
				},
				ready:function(){
					stayTree = this.$refs.stayTree;
					selectedTree = this.$refs.selectedTree;
					stayTree.$on('before', $.proxy( this.frombefore, this ));
					stayTree.$on('after', $.proxy( this.fromafter, this ));
					selectedTree.$on('before', $.proxy( this.tobefore, this ));
					selectedTree.$on('after', $.proxy( this.toafter, this ));
				},
				computed: {
					stayTeachers: function(){
						if( !this.staycurrent ) return [];
						return r(this.staycurrent, false)
					},
					selectedTeachers:function(){
						if( !this.selectedcurrent ) return [];
						return r(this.selectedcurrent, true);
					},
				},
				methods:{
					frombefore:function(){
						$(this.$els.stayTeachersEl).find(':checkbox').each(function(){
							var $this = $(this)
							var control = $this.data('Control.CheckBox');
							if( control ) control.destory();
							$this.attr('cs-control',"");
						});
					},
					fromafter:function(data){
						if(data) this.staycurrent = data;
						this.$nextTick(function(){
							$(this.$els.stayTeachersEl).find(':checkbox[cs-control]').CheckBoxInit();
						})
					},
					tobefore:function(){
						$(this.$els.selectedTeachersEl).find(':checkbox').each(function(){
							var $this = $(this)
							var control = $this.data('Control.CheckBox');
							if( control ) control.destory();
							$this.attr('cs-control',"");
						});
					},
					toafter:function(data){
						this.selectedcurrent = data || this.to;
						this.$nextTick(function(){
							$(this.$els.selectedTeachersEl).find(':checkbox[cs-control]').CheckBoxInit();
						})
					},

					moveto:function(){
						this.frombefore()
						this.tobefore();
						this.to = disposefrom(JSON.parse(JSON.stringify(this.from)), this.from).data ;
						this.$nextTick(function(){
							this.fromafter()
							this.toafter();
							$(this.$els.selecetdTreeNode).find('.open').removeClass('open')
						})
					},
					movefrom:function(){
						if(this.to.children.length === 0) return;
						this.frombefore()
						this.tobefore();
						disposeto(this.to, this.from) ;
						this.$nextTick(function(){
							this.to = disposefrom(JSON.parse(JSON.stringify(this.from)), this.from).data ;
							this.$nextTick(function(){
								this.fromafter()
								this.toafter();
								$(this.$els.selecetdTreeNode).find('.open').removeClass('open')
							});
						})
					},

					getChooseNodes:function(){
						return r(this.from, false, true);
					}
				}
			});
		}
	}
})