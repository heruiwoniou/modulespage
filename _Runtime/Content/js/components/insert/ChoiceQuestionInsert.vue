<template>
	<div class="control-container">
		<control-lib-bar :type="component.type" :majorkey="component.majorkey" :title="component.title"></control-lib-bar>
		<div class="control-content">
			<div class="control-preview ChoiceQuestion">
				<div class="option" v-for="item in component.items">{{item}}</div>
			</div>
			<p><span>来自</span><b :title="component.from">{{component.from}}</b><i>{{component.used}}次使用</i></p>
		</div>
	</div>
</template>
<script>
	import './common/ControlLibBar'
	export default{
		props:{
			component:{
				type:Object
			}
		}
	}
</script>