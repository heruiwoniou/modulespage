<template>
	<div class="preview-modal" v-show="visible" transition="translate-from-right">
		<div class="preview-close" @click="close"></div>
		<div class="preview-container">
			<iframe :src="data?'questionnaire-preview.html?data='+ data:'about:blank'" frameborder="0"></iframe>
		</div>
	</div>
</template>
<script>
	Vue.transition('translate-from-right', {
        css: false,
        enter(el, done) {
        	var $el=$(el);
        	var width = $el.width();
            $el.css({ right: -1 * width }).animate({ right: 0 }, 200,done)
        },
        leave(el, done) {
        	var $el=$(el);
        	var width = $el.width();
            $el.css({ right: 0 }).animate({ right: -1 * width }, 200, done)
        }
    });
	export default {
		data(){
			return {
				visible:false,
				data:''
			}
		},
		methods:{
			show(data){
				this.data = encodeURIComponent(data);
				this.visible = true;
			},
			close(){
				this.visible = false;
			}
		}
	}
</script>