define(['Guid'],function(guid){
	var color = '#2a2727';
	var maxItems = 15;
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
		SectionGroup:function(data){
			return data?{
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),

				title:data.title,
				children:function(){
					var children = [];
					data.children.forEach(function(o){
						var scope = setting[o.type];
						if(scope)
							children.push(scope.call( scope , o ));
					});
					return children;
				}(),

				bold: data.bold,
				color: data.color
			}:{
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),

				title:'',
				children:[],

				bold:false,
				color: color
			}
		},
		UnmixedText:function(data){
			return data ? {
				type : "UnmixedText" ,
				id:guid.NewGuid().ToString("D"),

				content : data.content,

				bold : data.bold,
				color : data.color
			}:{
				type : "UnmixedText" ,
				id:guid.NewGuid().ToString("D"),

				content:'',

				bold:false,
				color: color
			}
		},

		//以下为含编号的控件
		GradeQuestion:function(data){
			return data ?
				{
					type : "GradeQuestion" ,
					id : guid.NewGuid().ToString("D") ,
					qindex:'' ,

					title : data.title,
					//是否自填分
					self : data.self ,
					//填分类型
					//0:星,1:字母,2:汉字,3:滑条,4:选择分数,5:填分
					xtype : data.xtype ,
					range : {
						min : data.range.min ,
						max : data.range.max ,
						charlength : data.range.charlength
					},

					bold : data.bold ,
					color : data.color ,
					must : data.must ,

					value : ""
				}
				:
				{
					type : "GradeQuestion" ,
					id : guid.NewGuid().ToString("D"),
					qindex:'',

					title : '',
					//是否自填分
					self : false,
					//填分类型
					//0:星,1:字母,2:汉字,3:滑条,4:选择分数,5:填分
					xtype : 0,
					range : {
						min : 0,
						max : 100,
						charlength:5
					},

					bold : false,
					color : color,
					must : false,

					value : ""
				};
		},
		ChoiceQuestion: function (data) {
			return data ?
			{
				type : "ChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex : '',

				single : data.single ,
				title : data.title ,
				items : data.items ,

				bold : data.bold ,
				color : data.color ,
				must : data.must ,

				maxItems : maxItems,

				value: []
			}
			:
			{
				type : "ChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',

				single : true,
				title : '',
				items : [],

				bold : false,
				color : color,
				must : false,

				maxItems : maxItems,

				value: []
			}
		},
		PicChoiceQuestion:function(data){
			return data ?
			{
				type : "PicChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',

				title : data.title ,
				items : data.items ,
				single : data.single ,

				bold : data.bold ,
				color : data.color ,
				must : data.must ,

				maxItems:maxItems,

				value:[]
			}
			:
			{
				type : "PicChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				qindex:'',

				title : "",
				items : [],
				single : true,

				bold : false,
				color : color,
				must : false,

				maxItems:maxItems,

				value:[]
			}
		},
		QuestionResponse:function(data){
			return data?
			{
				type : "QuestionResponse" ,
				id:guid.NewGuid().ToString("D"),
				qindex:'',

				title:data.title,
				single:data.single,

				bold : data.bold,
				color: data.color,
				must : data.must,

				value:''
			}
			:
			{
				type : "QuestionResponse" ,
				id:guid.NewGuid().ToString("D"),
				qindex:'',

				title:'',
				single:true,

				bold:false,
				color: color,
				must : false,

				value:''
			}
		},
		MatrixChoiceQuestion:function(data){
			return data?
			{
				type: 'MatrixChoiceQuestion',
				id:guid.NewGuid().ToString("D"),
				qindex:'',

				title:data.title,
				single:data.single,
				rows:data.rows,
				cells:data.cells,

				bold:data.bold,
				color: data.color,
				must : data.must,

				maxRowItems:maxItems,
				maxColItems:maxItems,

				value:[]
			}
			:
			{
				type: 'MatrixChoiceQuestion',
				id:guid.NewGuid().ToString("D"),
				qindex:'',

				title:'',
				single:true,
				rows:[],
				cells:[],

				bold:false,
				color: color,
				must : false,

				maxRowItems:maxItems,
				maxColItems:maxItems,

				value:[]
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,([]).slice.call(arguments,1));
	}
})