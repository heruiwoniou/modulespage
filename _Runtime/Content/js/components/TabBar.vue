<template>
	<div class="control-static">
    	<div :class="['control-item','TabBar',iscurrent?'select':'']" @click.stop="setindex">
    		<div class="tab-header">标签</div>
    		<div class="tab-body">
    			<div class="tab-scroll-left" @mousedown="mousedown($event,1)"></div>
    			<div class="tab-content" v-el:tab-content>
    				<div  v-for="index in 5" :class="['tab-item',index==0?'select':'']">选项卡{{index}}<i></i></div>
    				<div class="tab-item new"><i></i>添加新标签</div>
    			</div>
    			<div class="tab-scroll-right" @mousedown="mousedown($event,-1)"></div>
    		</div>
    	</div>
    </div>
</template>
<script>
	import {
	    fullindex,iscurrent
	} from './common/computed';

	import props from './common/props';

	import {
	    setdefault
	} from './common/events';

	import {
	    setindex
	} from './common/methods';

	let scrolltimer=null;

	export default {
		data () {
			return {}
		},
		props:props,
		computed: {
			fullindex,
            iscurrent
        },
        ready(){
        	$(document).on("mouseup",()=>{
        		clearTimeout(scrolltimer)
        		scrolltimer = null;
        	});
        },
        methods:{
        	mousedown($event,direction){
        		clearTimeout(scrolltimer)
        		scrolltimer = null;
        		var $content = $(this.$els.tabContent);
        		var scroll = ()=>{
        			$content.scrollLeft( $content.scrollLeft() + direction * 10 );
        			scrolltimer=setTimeout(scroll, 20)
        		};
        		scrolltimer=setTimeout(scroll, 20)
        	},
        	setindex : setindex(function() {
            })
        },
        events: {
            setdefault: setdefault(function() {
            })
        }
	}
</script>