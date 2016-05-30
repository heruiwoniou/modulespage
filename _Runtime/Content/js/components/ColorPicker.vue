<template>
	<div class="colorpicker"></div>
</template>
<script>
	import jscolor from './common/jscolor';
	let instance = null;
	export default {
		data(){
			return {}
		},
		ready(){
			instance = new jscolor.color(this.$el,this.$el);
			instance.showPicker(this.$el)
		},
	}
</script>