define(['Guid'],function(guid){
	var defaultfontcolor = '#2a2727';
	var setting={
		//外部公用
		StaticHeader: function () {
			return {
				type : "StaticHeader" ,
				id:guid.NewGuid().ToString("D"),
				title:'',
				comment:'',
				bold:false,
				src:'',
				default:'/Upload/images/preview-background.jpg',
				color: defaultfontcolor,
			}
		},
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id:guid.NewGuid().ToString("D"),
				single:true,
				title:'',
				items:'',
				bold:false,
				color: defaultfontcolor
			}
		},
		SectionGroup:function(){
			return {
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),
				title:'',
				bold:false,
				color: defaultfontcolor,
				children:[]
			}
		},
		UnmixedText:function(){
			return {
				type : "UnmixedText" ,
				id:guid.NewGuid().ToString("D"),
				content:'',
				bold:false,
				color: defaultfontcolor
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})