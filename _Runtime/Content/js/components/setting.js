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
		GradeQuestion:function(name){
			return {
				type : "GradeQuestion" ,
				id : guid.NewGuid().ToString("D"),

				self : false,
				range : [],
				value : "",

				bold : false,
				color : color,
				must : false
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
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),

				single : true,
				title : '',
				items : [],

				bold : false,
				color : color,
				must : false
			}
		},
		PicChoiceQuestion:function(){
			return {
				type : "PicChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),

				title : "",
				items : [],
				single : true,

				bold : false,
				color : color,
				must : false
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
				color: color,
				must : false
			}
		},
		QuestionResponse:function(){
			return {
				type : "QuestionResponse" ,
				id:guid.NewGuid().ToString("D"),

				question:'',
				answer:'',
				single:true,

				bold:false,
				color: color,
				must : false
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})