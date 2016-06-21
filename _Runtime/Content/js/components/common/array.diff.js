define(function(){
	/**
	 * 返回须要处理的数据
	 * @param  {[type]} arr1 [原数组]
	 * @param  {[type]} arr2 [新数组]
	 * @return {[type]}      [description]
	 */
	return { 
		diff : function diff(arr1,arr2){
			//数据只会一条条更新的情况下
			//修改判断
			if(arr1.length == arr2.length)
			{
				for(var i = 0 ; i < arr1.length ; i ++)
				{
					if(arr1[i] != arr2[i])
					{
						return {type:'m',index:i,_new_:arr2[i],_old_:arr1[i]}
					}
				}
			}
			//判断新增
			else if(arr1.length < arr2.length)
			{
				for(var i = 0 ; i < arr2.length ; i ++)
				{
					if(arr1[i] != arr2[i])
					{
						return {type:'a',index:i,_new_:arr2[i],_old_:null}
					}
				}
			}
			//判断删除
			else if(arr1.length > arr2.length)
			{
				for(var i = 0 ; i < arr1.length ; i ++)
				{
					if(arr1[i] != arr2[i])
					{
						return {type:'d',index:i,_new_:null,_old_:null}
					}
				}
			}
		},
		parser:function  parser(arr,sequence,a,m,d)
		{
			a = a || function(source,index,value){
				source.splice(index,0,value);
			};
			m = m || function(source,index,value)
			{
				source[index] = value;
			};
			d = d || function(source,index){
				source.splice(index,1);
			};
			for(var i in sequence)
			{
				var action = sequence [i];
				switch (action.type) {
					case 'a': a(arr,action.index,action._new_); break;
					case 'm': m(arr,action.index,action._new_); break;
					case 'd': d(arr,action.index); break;
					default:
						// statements_def
						break;
				}
			}
			return arr;
		}
	}
})