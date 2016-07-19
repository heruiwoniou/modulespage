<template>
	<div class="control-container">
		<control-lib-bar :type="component.type" :majorkey="component.majorkey" :title="component.title" :main-id="component.id"></control-lib-bar>
		<div class="control-content">
			<div class="control-preview PicChoiceQuestion">
				<div class="option" v-for="i in component.items.length">
					<div class="imageViewer">
						<img :src="component.items[i].image" :width = "component.items[i].w < 50 ? component.items[i].w : 0.37 * component.items[i].w" :height = "component.items[i].h < 50 ? component.items[i].h : 0.37 * component.items[i].h" alt="">
					</div>
					<div class="text" :title="component.items[i].text">{{component.items[i].text}}</div>
				</div>
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