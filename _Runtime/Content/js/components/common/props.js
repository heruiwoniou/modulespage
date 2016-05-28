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
			},
			preview:{
				type:Boolean,
				default:false
			}
		}
	}
	return new Props();
})