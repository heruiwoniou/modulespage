<template>
	<input :id="id" :name="name" :maxlength="maxlength" :data-key = "dataKey" :data-rule=" !rule ? '' : 'required'" type="text" v-model="controlValue" number/>
</template>
<script>
	import Guid from 'Guid';
	import { toString } from './../../common/util';
	import Bumper from 'common/client/Bumper';

	var bumper = Bumper.create();
	var foucs = function(self){
		self = self || this;
		self.setAttribute('data-cursorpos', getCursortPosition(self));
		self.setAttribute('data-ctrl', false);
	}
	var keyup = function(self){
		self = self || this;
		var k = event.keyCode;
		var lst = self.getAttribute('data-cursorpos');
		if(/[^0-9]/.test(self.value))
		{
			self.value = self.value.replace(/[^0-9]/ig,'');
			setCaretPosition(self, lst);
		}
		var cust = getCursortPosition(self);
		self.setAttribute('data-cursorpos', cust);
	}
	var keydown = function(self){
		self = self || this;
		var index = ~~self.getAttribute('data-cursorpos'), id = self.getAttribute('data-id'), ctrl = self.getAttribute('data-ctrl') ==='true', k = event.keyCode, arr = self.value.split(''), re;
		if (k == 9 || k == 13 || (k == 35)
			|| (k == 36)
			|| (k >= 112 && k <= 123)
			|| (k >= 37 && k <= 40))
			{
				return true;
			}
			else if(ctrl)
			{
				if(k == 88 && k == 67)
				{
					return true;
				}
				return true;
			}
			else if(k == 17)
			{
				self.setAttribute('data-ctrl', true);
				$(document).off('.numberCtrlUp' + id).on('keyup.numberCtrlUp' + id ,'input[data-id=' + id + ']', function(e){
					if(e.keyCode == 17)
					{
						self.setAttribute('data-ctrl', false);
					}
				})
			}
			//BackSpace 键入
			else if (k == 8)
			{
				arr.splice(index - 1, 1);
				re = arr.join('');
				if(re == '' || re === '0' ||/^[1-9]\d*$/.test(arr.join(''))) return true;
				return false;
			}
			//Del 键入
			else if (k == 46)
			{
				arr.splice(index, 1);
				re = arr.join('');
				if(re == '' || re === '0' || /^[1-9]\d*$/.test()) return true;
				return false;
			}
			//数字 键入
			else if ((k >= 48 && k <= 57) || (k >= 96 && k <= 105))
			{
				arr.splice(index, 0, getChar(k));
				re = arr.join('');
				if(/^[1-9]\d*$/.test(re) || re === '0') return true;
				return false;
			}
			else
				return false;
	}
	var getChar = function(keyCode){
		if( keyCode >= 96 && keyCode <= 105 )
			return keyCode - 96;
		else if( keyCode >= 48 && keyCode <= 57 )
			return keyCode - 48;
	}
	var getCursortPosition = function(ctrl) {
		//获取光标位置函数
		var CaretPos = 0;
		// IE Support
		if (document.selection) {
			ctrl.focus ();
			var Sel = document.selection.createRange ();
			Sel.moveStart ('character', -ctrl.value.length);
			CaretPos = Sel.text.length;
		} // Firefox support
		else if (ctrl.selectionStart || ctrl.selectionStart == '0')
			CaretPos = ctrl.selectionStart;
		return (CaretPos);
	}
	var setCaretPosition = function(ctrl, pos){
		//设置光标位置函数
		if(ctrl.setSelectionRange) {
			ctrl.focus();
			ctrl.setSelectionRange(pos,pos);
		}
		else if (ctrl.createTextRange) {
			var range = ctrl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	};

	export default {
		data(){
			return {
				dataKey : Guid.NewGuid().ToString("D"),
				controlValue : -1,

				watchKey: true
			}
		},
		props:{
			value:{
				type:Number,
				default:'-1'
			},
			name:{
				type:String,
				default:''
			},
			id:{
				type:String,
				default:''
			},
			maxlength:Number,
			rule:{
				type:Boolean,
				default:false
			}
		},
		watch:{
			'controlValue':function(_new_,_old_){
				if(this.watchKey)
				{
					var that = this;
					if(toString(_new_) === '[object String]')
					{
						this.controlValue = _old_;
					}else
					{
						bumper.trigger(function(){
							that.$emit('changeBefore',that.controlValue,that.value)
							that.value = that.controlValue ;
							that.$emit('changeAfter')
						},500);
					}
				}
			}
		},
		methods:{
			setValue(value){
				this.watchKey = false;
				this.$el.value = value;
				this.controlValue = value;
				this.$nextTick(() => this.watchKey = true);
			}
		},
		ready(){
			var self = this.$el;
			this.$el.onmouseup = function() {  return foucs(self); };
			this.$el.onfocus = function() {  return foucs(self); };
			this.$el.onkeydown = function() { return keydown(self); };
			this.$el.onkeyup = function() { return keyup(self); };

			this.watchKey = false;
			this.controlValue =  this.value;
			this.$nextTick(() => this.watchKey = true);
		}
	}
</script>