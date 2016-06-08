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
			tabselect:{
				type:Number,
				default:-1
			}
		}
	}
	return new Props();
})