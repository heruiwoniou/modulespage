define(['./util'],function(util){
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
		/**
		 * trigger_disabled
		 * @param  {[type]} id    [description]
		 * @param  {[type]} state [description]
		 * @return {[type]}       [description]
		 */
		toValidator:function(current){
			if(util.toString(current) === '[object Number]')
			{
				this.$children[current].show( ( util.isArray(this.component.value[current]) && this.component.value[current].length === 0 || !util.isArray(this.component.value[current]) && this.component.value[current] === '' ) );
			}
			else
			{
				if(this.$refs.msg)
				{
					if(this.component.type === 'GradeQuestion' && this.component.xtype === 5)
					{
						var isEmpty =  ( this.component.value === '' );
						if( !isEmpty )
						{
							if(!/^[1-9]\d+$|^\d{1,1}$/.test(this.component.value))
							{
								this.$refs.msg.show(true, '该项必须为数字!');
							}else
							{
								if(this.component.value > this.component.range.max || this.component.value < this.component.range.min)
									this.$refs.msg.show(true, '结果超出了范围!');
								else this.$refs.msg.show(false);
							}
						}
						else this.$refs.msg.show(true);
					}
					else
						this.$refs.msg.show( ( util.isArray(this.component.value) && this.component.value.length === 0 || !util.isArray(this.component.value) && this.component.value === '' ) );
				}
				else
				{
					for(var i = 0 ; i < this.component.value.length ; i ++)
					{
						this.$children[i].show( ( util.isArray(this.component.value[i]) && this.component.value[i].length === 0 || !util.isArray(this.component.value[i]) && this.component.value[i] === '' ) )
					}
				}
			}
		},
		trigger:function( id , state ){
			if(this.component.id == id)
			{
				this.disabled = state;
				if(this.$refs.msg)
				{
					this.$refs.msg.setDisabled( state );
				}
				else
				{
					this.$children.forEach(function(msg, i){
						msg.setDisabled( state );
					});
				}
			}
			if(this.disabled && this.component.value !=[] && this.component.value !== '')
			{
				if(util.isArray(this.component.value) && this.component.value.length === 0 || !util.isArray(this.component.value) && this.component.value === '')
					return true;
				var that = this;
				this.$refs.msg.stop();
				this.stop();
				this.component.value = Array.isArray(this.component.value) ? [] : '' ;
				this.$nextTick(function(){
					this.start();
					that.$refs.msg.start();
					switch (that.component.type) {
						case 'PicChoiceQuestion':
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
			return true;
		}
	}

	return new Events();
})