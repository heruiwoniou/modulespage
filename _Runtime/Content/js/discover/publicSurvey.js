define(['vue','libs/jquery-extend/jquery.stellar'],
	function(vue) {
		var vm;
		return {
			tbcontrollHandler:function(tab){
				if(tab=='tab1')
				{
					vm.items[1].items=function(){
				        			var arr=[]
				        			for(var i=0;i<1;i++)
				        				arr.push({
					        				title:"企业员工满意度调查",
					        				date:"2016年3月20日",
					        				info:"分类： | 作者：问卷网 | 被引用次数：5732",
					        				describe:"员工满意度调查收集员工对企业管理各个方面满意程度的信息，然后通过后续专业、科学的数据统计和分析，真实的反映公司经营管理现状，为企业管理者决策提供客观的参考依据。员工满意度调查还有助于培养员工对企业的认同感、归属感，不断增强员工对企业的向心力和凝聚力。员工满意度调查活动使员工在民主管理的基础上树立以企"
				        				});
				        			return arr;
				        		}()
				}
			},

			search:function(){
				vm.items=[
				        	{
				        		tab:"最新发布",
				        		items:function(){
				        			var arr=[]
				        			for(var i=0;i<2;i++)
				        				arr.push({
					        				title:"企业员工满意度调查",
					        				date:"2016年3月20日",
					        				info:"分类： | 作者：问卷网 | 被引用次数：5732",
					        				describe:"员工满意度调查收集员工对企业管理各个方面满意程度的信息，然后通过后续专业、科学的数据统计和分析，真实的反映公司经营管理现状，为企业管理者决策提供客观的参考依据。员工满意度调查还有助于培养员工对企业的认同感、归属感，不断增强员工对企业的向心力和凝聚力。员工满意度调查活动使员工在民主管理的基础上树立以企"
				        				});
				        			return arr;
				        		}()
				        	}
				        ];
			},
			init:function(){
				$.stellar({
				    horizontalScrolling: false,
				    hideElement: function($elem) { $elem.hide(); },
  					showElement: function($elem) { $elem.show(); }
				});
				$("#search").ButtonTextBoxInit({ButtonClass:"search"});

				vm=new vue({
				        el: "#TBControl",
				        data:{
				        	items:[
						        	{
						        		tab:"最新发布",
						        		items:[{
							        				title:"企业员工满意度调查",
							        				date:"2016年3月20日",
							        				info:"分类： | 作者：问卷网 | 被引用次数：5732",
							        				describe:"员工满意度调查收集员工对企业管理各个方面满意程度的信息，然后通过后续专业、科学的数据统计和分析，真实的反映公司经营管理现状，为企业管理者决策提供客观的参考依据。员工满意度调查还有助于培养员工对企业的认同感、归属感，不断增强员工对企业的向心力和凝聚力。员工满意度调查活动使员工在民主管理的基础上树立以企"
						        				},
						        				{
							        				title:"企业员工满意度调查",
							        				date:"2016年3月20日",
							        				info:"分类： | 作者：问卷网 | 被引用次数：5732",
							        				describe:"员工满意度调查收集员工对企业管理各个方面满意程度的信息，然后通过后续专业、科学的数据统计和分析，真实的反映公司经营管理现状，为企业管理者决策提供客观的参考依据。员工满意度调查还有助于培养员工对企业的认同感、归属感，不断增强员工对企业的向心力和凝聚力。员工满意度调查活动使员工在民主管理的基础上树立以企"
						        				}]
						        	},
						        	{
						        		tab:"人气",
						        		items:[]
						        	}
				        	]
				        }
				})
			}
		}
	}
);
