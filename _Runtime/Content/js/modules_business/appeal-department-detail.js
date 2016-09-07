define(function(){
	//code here
	return {
		//mothod here
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			new Vue({
				el:'#department-control',
				data:{
					current: {
						school: null,
						department: null
					},

					from:[
						{
							id:'1',
							name:'长春中医药大学',
							children:[
								{
									id: '1-1', name: '教务部',
									children: [
										{ id:'1-1-1',name:'李老师' },
										{ id:'1-1-2',name:'王老师' },
										{ id:'1-1-3',name:'赵老师' }
									]
								},
								{
									id: '1-2', name: '学工部',
									children: [
										{ id:'1-2-1',name:'何老师' },
										{ id:'1-2-2',name:'欧阳老师' },
										{ id:'1-2-3',name:'莫老师' }
									]
								},
								{
									id: '1-3', name: '后勤部',
									children: [
										{ id:'1-3-1',name:'李老师' },
										{ id:'1-3-2',name:'王老师' }
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
									children: [
										{id:'2-1-1',name:'何老师' }
									]
								},
								{
									id: '2-2', name: '体育部',
									children: [
										{id:'2-2-1',name:'何老师' },
										{id:'2-2-2',name:'欧阳老师' }
									]
								},
								{
									id: '2-3', name: '艺体部',
									children: [
										{id:'2-3-1',name:'莫老师' }
									]
								}
							]
						}
					],
					to:[
					]
				},
				computed:{
					teachers:function(){
						var teachers = []
						if( this.current.school === null && this.current.department === null ) return teachers;
						if( this.current.department === null)
						{
							for(var i in this.current.school.children)
							{
								var  department = this.current.school.children[i];
								teachers = teachers.concat(department.children.filter(function(o){ return !o.checked}));
							}
							return teachers;
						}

						teachers = teachers.concat(this.current.department.children.filter(function(o){ return !o.checked}));
						return teachers
					}
				},
				methods:{
					_restore:function(){
						$(this.$els.stayTeachers).find(':checkbox').each(function(){
							var $this = $(this)
							var control = $this.data('Control.CheckBox');
							if( control ) control.destory();
							$this.attr('cs-control',"");
						});
					},
					_wrap:function(){
						this.$nextTick(function(){
							$(this.$els.stayTeachers).find(':checkbox[cs-control]').CheckBoxInit();
						})
					},
					toggle:function(e, type, d1){
						var $el = $(e.target).closest('li');
						var $siblings = $el.siblings('li');

						this._restore();
						if(!$el.hasClass('select'))
						{
							this._restore();
							$siblings.removeClass('select');
							$el.addClass('select');
						}
						$el.find('ul li').removeClass('select');

						this.current.school = d1;
						this.current.department = null;
						this._wrap();

					},
					view:function(e, type, d1, d2){
						var $el = $(e.target).closest('li');
						var $siblings = $el.siblings('li');

						this._restore();
						if(!$el.hasClass('select'))
						{
							$siblings.removeClass('select');
							$el.addClass('select');
						}

						this.current.school = d1;
						this.current.department = d2;
						this._wrap();
					}
				}
			});
		}
	}
})