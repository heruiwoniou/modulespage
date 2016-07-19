define(['vue','common/client/WinResizeResponder','ztree'],function(Vue,Responder){
	var _Vm_,
	$Frame=$("#Frame");
	return {
		resize: function(wh,dh){
			var fh = wh - 245;
			$Frame.height(fh);
		},
		init:function(){
			Responder.resize(this.resize);
            $("#search").ButtonTextBoxInit({ ButtonClass: "search" });

            $(".section-search-input").ButtonTextBoxInit({ ButtonClass: "search" });
			_Vm_ = new Vue({
				el:'body',
				data:{
					selectindex : 1,
					list:[
						{name:'企业员工满意度调查问卷企业员工满意度调查问卷企业员工满意度调查问卷企业员工满意度调查问卷企业员工满意度调查问卷',type:'问卷',data:'2016年5月1日'},
						{name:'2015年年度教学评审',type:'评教',data:'2016年5月1日'},
						{name:'系统',type:'文件夹',data:'2016年5月1日'},
						{name:'视频',type:'文件夹',data:'2016年5月1日'},
						{name:'图片',type:'文件夹',data:'2016年5月1日'}
					]
				},
				watch:{
					'selectindex':function(_new_,_old_){
						if(_new_!==_old_)
							this.$nextTick(()=>{
								$(this.$els.selectItem).stop().animate({top:_new_*60 + 'px'},200);
							});
					}
				},
				methods:{
					gicon:function(type){
						switch (type) {
							case '问卷': return 'w';
							case '评教': return 'p';
							case '文件夹': return 'f';
						}
					},
					showSection:function(index){
						this.selectindex = index;
					}
				}
			})
		}
	}
});