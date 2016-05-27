define(function(){
	function Props(){
		return {
			component:{
				type:Object
			},
			index:{
				type:Number
			},
			paths:{
				type:String,
				default:''
			},
			selectindex:{
				type:String,
				default:''
			}
		}
	}
	return new Props();
})