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
		TabContent:function(name){
			return {
				type : "TabContent" ,
				name : name,
				id:guid.NewGuid().ToString("D"),
				children:[]
			}
		},
		StaticHeader: function () {
			return {
				type : "StaticHeader" ,
				id:guid.NewGuid().ToString("D"),
				title:'',
				comment:'',
				bold:false,
				src:'',
				default:'/Upload/images/preview-background.jpg',
				color: color,
			}
		},
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id : guid.NewGuid().ToString("D"),
				single : true,
				title : '',
				items : '',
				bold : false,
				color : color
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
				color : color
			}
		},
		SectionGroup:function(){
			return {
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),
				title:'',
				bold:false,
				color: color,
				children:[]
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
		QuestionResponse:function(){
			return {
				type : "QuestionResponse" ,
				id:guid.NewGuid().ToString("D"),
				question:'',
				answer:'',
				single:true,
				bold:false,
				color: color
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})