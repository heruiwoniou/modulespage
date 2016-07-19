<template>
	<div class="preview-modal" v-show="visible" transition="translate-from-right">
		<div class="preview-close" @click="close"></div>
		<div class="preview-container">
			<iframe :src="data?(url + loadParam) : 'about:blank'" frameborder="0"></iframe>
		</div>
	</div>
</template>
<script>
	Vue.transition('translate-from-right', {
        css: false,
        enter(el, done) {
        	var $el=$(el);
        	var width = $el.width();
            $el.css({ right: -1 * width }).animate({ right: 0 }, 200 , 'easeOutExpo' ,done)
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
				data:'',
				type:0,
				loadParam:''
			}
		},
		computed:{
			url:function(){
				switch (this.type) {
					case 0:
						return 'questionnaire-preview.html';
					case 1:
						return 'assess-preview.html';
					default:
						// statements_def
						break;
				}
			}
		},
		methods:{
			show(data,type = 0,urlParam = ''){
				this.data = data;
				this.loadParam = ( '?cache = ' + new Date().getTime() + '&') + urlParam ;
				this.type = type;
				this.visible = true;
			},
			close(){
				this.data = '';
				this.type = 0;
				this.visible = false;
			}
		}
	}
</script>