<template>
	<div class="preview-modal" v-show="visible" transition="translate-from-right" :style="exportStyle">
		<div class="preview-close" @click="close"></div>
		<div class="preview-container mCustomScrollbar">
			<div class="preview-content" v-el:content></div>
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
				background:''
			}
		},
		computed:{
			exportStyle(){
				return {
					background:"#ffffff url(" + this.background + ') repeat fixed'
				}
			}
		},
		watch:{
			'visible':function(_new_){
				if(_new_) this.$nextTick(()=>{
					WebApi.scrollReplace();
					WebApi.initControl($(this.$els.content))
				})
			}
		},
		methods:{
			show({html,background}){
				this.$els.content.innerHTML = html;
				this.visible = true;
				this.background=background;
			},
			close(){
				this.visible = false;
				this.$els.content.innerHTML = ""
			}
		}
	}
</script>