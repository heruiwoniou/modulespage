<template>
	<div class="control-container">
		<control-lib-bar :type="component.type" :majorkey="component.majorkey" :title="component.title"></control-lib-bar>
		<div class="control-content">
			<div class="control-preview PicChoiceQuestion">
				<div class="option" v-for="item in component.items">
					<div class="imageViewer">
						<img :src="item.image" :width = "item.w < 50 ? item.w : 0.37 * item.w" :height = "item.h < 50 ? item.h : 0.37 * item.h" alt="">
					</div>
					<div class="text" :title="item.text">{{item.text}}</div>
				</div>
			</div>
			<p><span>来自</span><b :title="component.from">{{component.from}}</b><i>2344次使用</i></p>
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