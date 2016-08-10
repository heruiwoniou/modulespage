define(function(){
	return {
		addNewTeacher:function(){
			WebApi.modal({
				src:"teacher-manage-add.html",
				ajax:true,
				width:600,
				height:580,
				success:function(){
					WebApi.initControl(this.$BoxBaseContent)
				}
			}).then(function(cmd){
				console.log(cmd)
			})
		},
		showUploadExcel:function(){
			WebApi.modal('UploadExcel',{content:$('#uploadexcel'),width:500,height:185,title:false})
		},
		addPostInfo:function(){
			var element = ['<tr>',
							'<th class="center" style="width:26px">在</th>',
							'<td>',
								'<select cs-control>',
									'<option value="0">研发</option>',
									'<option value="1">产品</option>',
								'</select>',
							'</td>',
							'<th class="right" style="width: 60px;">部门担任</th>',
							'<td>',
								'<select cs-control>',
									'<option value="0">开发</option>',
									'<option value="1">开发组长</option>',
									'<option value="2">开发经理</option>',
									'<option value="3">开发总监</option>',
								'</select>',
							'</td>',
							'<th class="right" style="width: 35px;">一职</th>',
						'</tr>']
			var $new = $(element.join(""));
			WebApi.initControl($new.insertBefore($("#addRow")));
		},
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			WebApi.setMinHeight($('#mybody'));
		}
	}
})

