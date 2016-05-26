define(['Guid'],function(guid){
	var setting={
		//外部公用
		ChoiceQuestion: function () {
			return {
				type : "ChoiceQuestion" ,
				id:guid.NewGuid().ToString("D"),
				title:'标题(点击编辑)',
				items:''
			}
		},
		Group:function(){
			return {
				type : "Group" ,
				id:guid.NewGuid().ToString("D"),
				title:'段落描述(点击编辑)',
				children:[]
			}
		}
	}
	return function(type){
		var scope=setting[type];
		return scope.apply(scope,[].slice.call(arguments,1));
	}
})