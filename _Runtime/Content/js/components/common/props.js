define(function(){
	function Props(){
		return {
			component:{
				type:Object
			},
			iscurrent:{
				type:Boolean,
				default:false
			},
			index:{
				type:Number
			},
			paths:{
				type:String,
				default:''
			}
		}
	}
	return new Props();
})