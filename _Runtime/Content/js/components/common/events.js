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
			if( this.component.children.length == 0 )
				this.selectchild = false
			this.$root.setQuestionIndex();
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
					var that = this;
					this.component.value = Array.isArray(this.component.value)?[]:'';
					this.$nextTick(function(){
						switch (that.component.type) {
							case 'ChoiceQuestion':
								if(that.component.single)
									$(that.$el).find(':radio').RadioBoxInit();
								else
									$(that.$el).find(':checkbox').CheckBoxInit();
								break;
							case 'GradeQuestion':
								$(that.$el).find('.select').removeClass('select');
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