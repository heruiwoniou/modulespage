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
					current:null,

					from:[
						{
							id:'1',
							name:'长春中医药大学',
							children:[
								{ id: '1-1', name: '教务部', children: [ {id:'1-1-1',name:'李老师', checked: false}, {id:'1-1-2',name:'王老师', checked: false}, {id:'1-1-3',name:'赵老师', checked: false} ] },
								{ id: '1-2', name: '学工部', children: [ {id:'1-2-1',name:'何老师', checked: false}, {id:'1-2-2',name:'欧阳老师', checked: false}, {id:'1-2-3',name:'莫老师', checked: false} ] },
								{ id: '1-3', name: '后勤部', children: [ {id:'1-3-1',name:'李老师', checked: false}, {id:'1-3-2',name:'王老师', checked: false}　] },
							]
						},
						{
							id:'2',
							name:'清华大学',
							children:[
								{ id: '2-1', name: '教务处', children: [ {id:'2-1-1',name:'何老师', checked: false} ] },
								{ id: '2-2', name: '体育部', children: [ {id:'2-2-1',name:'何老师', checked: false}, {id:'2-2-2',name:'欧阳老师', checked: false} ] },
								{ id: '2-3', name: '艺体部', children: [ {id:'2-3-1',name:'莫老师', checked: false} ] }
							]
						}
					],
					to:[
					]
				},
				computed:{
					teacher:function(){
						if(this.current == null)
							return [];

					}
				},
				methods:{
					_getTeacher:function(_data_){
						_data_ = _data_ || this.current;
					},
					toggle:function(e, data){
						var $el = $(e.target).closest('li');
						var $siblings = $el.siblings('li');
						if(!$el.hasClass('select'))
						{
							$siblings.removeClass('select');
							$el.addClass('select');
						}
					}
				}
			});
		}
	}
})