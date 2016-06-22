define(function(){
	function Events (){ }
	Events.prototype={
		constructor:Events,
		setdefault:function(callback){
			return function(selectindex){
				if(selectindex === this.fullindex) return true;
				this.selectchild = (new RegExp("^"+ this.fullindex + '-','i')).test(selectindex);
				if(typeof callback == 'function')
					callback.apply(this,arguments)
				return true;
			}
		},
		removeItem:function(index){
			this.component.children.splice(index, 1);
		},
		trigger:function( tos , rets , type , ...arg ){
			if(tos.indexOf(this.component.id) !== -1)
			{
				switch (type) {
					case 'choice':
						this.disabled = rets.indexOf(this.component.id) == -1;
						break;
					case 'display':
						this.disabled = arg[0];
						break;
					default:
						// statements_def
						break;
				}
				if(this.disabled)
				{
					this.component.value = Array.isArray(this.component.value)?[]:'';
					this.$nextTick(()=>{
						switch (this.component.type) {
							case 'ChoiceQuestion':
								if(this.component.single)
									$(this.$el).find(':radio').RadioBoxInit();
								else
									$(this.$el).find(':checkbox').CheckBoxInit();
								break;
							case 'GradeQuestion':
								$(this.$el).find('.select').removeClass('select');
								break;
							default:
								// statements_def
								break;
						}
					})
				}
			}
			return true;
		}
	}

	return new Events();
})