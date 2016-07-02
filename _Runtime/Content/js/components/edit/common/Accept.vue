<template>
	<div class="border-top" v-if="isnextaccept"></div>
	<div class="accept" :data-index="index">
	<div class="pointer">
		<div class="add"></div>
		<div class="inner-border-top"></div>
	</div>
	<b></b>
	</div>
</template>
<script>
	export default {
		props:{
			index : {
				type:String
			},
			isnextaccept : {
				type:Boolean
			}
		}
	}
</script>