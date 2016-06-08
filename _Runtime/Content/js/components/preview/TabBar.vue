<template>
    <div class="TabBar">
        <div class="tab-item">标签:</div><div v-for="item in component.items" class="tab-item">{{item}}</div>
    </div>
</template>
<script>
	import props from './../common/props';
	export default {
		props:props
	}
</script>