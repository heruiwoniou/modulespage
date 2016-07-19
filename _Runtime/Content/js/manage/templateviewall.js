define(['vue','common/client/WinResizeResponder'],function(Vue,Responder){
	var _Vm_,
	$Frame=$("#Frame");
	return {
		resize: function(wh,dh){
			var fh = wh - 245;
			$Frame.height(fh);
		},
		init:function(){
			//Responder.resize(this.resize);
            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });
            $(".section-search-input").ButtonTextBoxInit({ ButtonClass: "search" });
			_Vm_ = new Vue({
				el:'body',
				data:{
					selectindex : 0,
					listW:function() {
                        var arr = []
                        for (var i = 0; i < 12; i++)
                            arr.push({
                                title: "大学生消费问卷调查",
                                qnumber: "80个问题",
                                info: "作者：ASD     被引用次数：23444次",
                                describe: "请您先了解目前相关【定位】资料【游戏背景】： 明朝宦官叛乱年间 官场黑暗 武林混乱 暗杀不断 人心惶恐【游戏关键词】：锦衣卫 电影氛围 暗黑色彩 时尚设计 酷炫精美"
                            });
                        return arr;
                    }(),
					listP:function() {
                        var arr = []
                        for (var i = 0; i < 2; i++)
                            arr.push({
                                title: "大学生消费问卷调查",
                                qnumber: "80个问题",
                                info: "作者：ASD     被引用次数：23444次",
                                describe: "请您先了解目前相关【定位】资料【游戏背景】： 明朝宦官叛乱年间 官场黑暗 武林混乱 暗杀不断 人心惶恐【游戏关键词】：锦衣卫 电影氛围 暗黑色彩 时尚设计 酷炫精美"
                            });
                        return arr;
                    }()
				},
				methods:{
					showSection:function(index){
						this.selectindex = index;
					}
				}
			})
		}
	}
});