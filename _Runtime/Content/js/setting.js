define(['Guid'],function(guid){
	var setting={
		//外部公用
		StaticHeader: function () {
			return {
				type : "StaticHeader" ,
				id:guid.NewGuid().ToString("D"),
				title:'问卷调查标题(点击编辑)',
				comment:'问卷调查标注(点击编辑)'
			}
		},
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id:guid.NewGuid().ToString("D"),
				single:true,
				title:'标题(点击编辑)',
				items:''
			}
		},
		SectionGroup:function(){
			return {
				type : "SectionGroup" ,
				id:guid.NewGuid().ToString("D"),
				title:'段落描述(点击编辑)',
				children:[]
			}
		}
	}
	return function(type){
		var scope=setting[type];
		if(!scope) return null;
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})