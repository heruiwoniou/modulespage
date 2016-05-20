define(['vue'],function(vue){
	var vm=new vue({
		el:"#article",
		data:{
			articles:function(){
				var arr=[]
				for(var i=0;i<10;i++)
					arr.push({
								title:"关于XXXX的问卷调查",
								content:"我们正在进行一项关于学生消费观的调查，想邀请您用几分钟时间帮忙填答这份问卷。本问卷实行匿名制，所有数据只用于统计分析， 请您放心填写。题目选项无对错之分，请您按自己的实际情况填写。谢谢您的帮助。",
								info:"发起者：XX学生会 截止：2016年3月15日 （同学们纷纷参与）"
							});
				return arr;
			}()
		}
	})
})