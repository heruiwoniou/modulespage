define(['Guid'],function(guid){
	var color = '#2a2727';
	var setting={
		//外部公用
		TabBar:function(){
			return {
				type : "TabBar" ,
				id:guid.NewGuid().ToString("D"),

				items:[]
			}
		},
		StaticHeader: function () {
			return {
				type : "StaticHeader" ,
				id:guid.NewGuid().ToString("D"),

				title:'',
				comment:'',
				src:'',
				default:'/Upload/images/preview-background.jpg',

				bold:false,
				color: color
			}
		},
		SectionGroup:function(){
			return {
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),

				title:'',
				children:[],

				bold:false,
				color: color
			}
		},
		UnmixedText:function(){
			return {
				type : "UnmixedText" ,
				id:guid.NewGuid().ToString("D"),

				content:'',

				bold:false,
				color: color
			}
		},

		//以下为含编号的控件
		GradeQuestion:function(name){
			return {
				type : "GradeQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',
				logic:[],

				//是否自填分
				self : false,
				//填分类型
				//0:星,1:字母,2:汉字,3:滑条,4:选择分数,5:填分
				xtype : 0,
				range : {
					min : 0,
					max : 100
				},

				bold : false,
				color : color,
				must : false,

				value : "",
			}
		},
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',
				logic:[],

				single : true,
				title : '',
				items : [],

				bold : false,
				color : color,
				must : false,

				value: []
			}
		},
		PicChoiceQuestion:function(){
			return {
				type : "PicChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',
				logic:[],

				title : "",
				items : [],
				single : true,

				bold : false,
				color : color,
				must : false,

				value:[]
			}
		},
		QuestionResponse:function(){
			return {
				type : "QuestionResponse" ,
				id:guid.NewGuid().ToString("D"),
				qindex:'',
				logic:[],

				title:'',
				single:true,

				bold:false,
				color: color,
				must : false,

				value:'',
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})