define(['vue','system/js/components/common/transition/toggleAnimate' , 'ztree'],function(Vue){
	var viewModel;
	return {
		init:function(){
			this.vue();
			this.tree();
		},
		//页面方法
		next:function(){
			viewModel.currentStep += 1;
		},
		last:function(){
			viewModel.currentStep -= 1;
		},
		test:function(){
			WebApi.modal({content:"123123123",width:400,height:300})
		},
		save:function(){
			WebApi.close({command:'savesuccess'})
		},
		addQuestionnaire:function(){
			WebApi.invoke('$ModalWin','show',{
				defaultsrc:"questionnaire.html",
				custom:true,
				title:'新增问卷'
			}).then(function(arg){
				alert(arg);
			})
		},
		//设置是否匿名
		setisanonymous:function(){
			viewModel.isanonymous=!viewModel.isanonymous;
		},
		//到设置人页面
		gopersontoggle:function(){
			viewModel.issetpersonpanel = !viewModel.issetpersonpanel
		},
		ready:function(){
			var $win=$(window),h=$win.height();
			$(".section").css({height:h});
			$("#isanonymous,#isonce").bind('click', function() {
                var id = this.id;
                var $node = $(this).data("Control.CheckBox").$LabelText;
                $node.textContent = ($node.textContent == "开启" ? '关闭' : '开启')
            });
            $(":checkbox[name*=groups]").MulComboxInit()
			$("#search").ButtonTextBoxInit({ ButtonClass: "search" });
		},
		tree: function() {
            var setting = {
                data: {
                    simpleData: {
                        enable: true
                    }
                }
            };

            var zNodes = [
                { id: 1, pId: 0, name: "父节点1 - 展开", open: true },
                { id: 11, pId: 1, name: "父节点11 - 折叠" },
                { id: 111, pId: 11, name: "叶子节点111" },
                { id: 112, pId: 11, name: "叶子节点112" },
                { id: 113, pId: 11, name: "叶子节点113" },
                { id: 114, pId: 11, name: "叶子节点114" },
                { id: 12, pId: 1, name: "父节点12 - 折叠" },
                { id: 121, pId: 12, name: "叶子节点121" },
                { id: 122, pId: 12, name: "叶子节点122" },
                { id: 123, pId: 12, name: "叶子节点123" },
                { id: 124, pId: 12, name: "叶子节点124" },
                { id: 13, pId: 1, name: "父节点13 - 没有子节点", isParent: true },
                { id: 2, pId: 0, name: "父节点2 - 折叠" },
                { id: 21, pId: 2, name: "父节点21 - 展开", open: true },
                { id: 211, pId: 21, name: "叶子节点211" },
                { id: 212, pId: 21, name: "叶子节点212" },
                { id: 213, pId: 21, name: "叶子节点213" },
                { id: 214, pId: 21, name: "叶子节点214" },
                { id: 22, pId: 2, name: "父节点22 - 折叠" },
                { id: 221, pId: 22, name: "叶子节点221" },
                { id: 222, pId: 22, name: "叶子节点222" },
                { id: 223, pId: 22, name: "叶子节点223" },
                { id: 224, pId: 22, name: "叶子节点224" },
                { id: 23, pId: 2, name: "父节点23 - 折叠" },
                { id: 231, pId: 23, name: "叶子节点231" },
                { id: 232, pId: 23, name: "叶子节点232" },
                { id: 233, pId: 23, name: "叶子节点233" },
                { id: 234, pId: 23, name: "叶子节点234" },
                { id: 3, pId: 0, name: "父节点3 - 没有子节点", isParent: true, open: true }
            ];
            $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        },
		//渲染模板
		vue:function(){
			viewModel = new Vue({
				el:'body',
				data:{
					issetpersonpanel:false,
					isanonymous: false,
					currentStep:0
				},
				ready:WebApi.ready,
				methods:{
					last:WebApi.last,
					next:WebApi.next,
					save:WebApi.save,
					setisanonymous: WebApi.setisanonymous,
                    gopersontoggle:WebApi.gopersontoggle
				}
			})
		}
	}
})