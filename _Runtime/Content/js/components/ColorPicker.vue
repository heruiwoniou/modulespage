<template>
	<div class="colorpicker-container" v-show="visible" :style="pos"></div>
</template>
<script>
	import './common/transition/fadeInOut';
	import jscolor from './common/jscolor';
	let instance = null;
	export default {
		data(){
			return {
				visible:false,
				x:0,
				y:0
			}
		},
		computed:{
			pos:function(){
				return {
					left : this.x + 'px' ,
					top  : this.y + 'px'
				}
			}
		},
		methods:{
			show({
					target,
					color,
					time=function(){},
					sure=function(){},
					close=function(){}
				} = {}){
				if(!target||!color) return
				this.visible = true;
				var targetpos= jscolor.getElementPos(target,function(node){ return !$(node).hasClass('mCSB_container') });
				this.x = targetpos[0];
				this.y = targetpos[1] + target.offsetHeight + 3	;
				this.$nextTick(()=>{
					if(!instance) instance = new jscolor.color(this.$el);
					instance.fromString(color)
					instance.showPicker(this.$el,time,sure,()=>{
						this.close();
						close(color);
					});
				});
			},
			close(){
				this.visible = false;
			}
		}
	}
</script>