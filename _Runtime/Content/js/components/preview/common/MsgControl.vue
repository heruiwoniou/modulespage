<template>
	<span v-if="visible" class="msg-box" transition="msgfadein">
		<span class="msg-wrap">
			<span class="n-arrow"><b>◆</b><i>◆</i></span>
			<span class="n-icon"></span>
			<span class="n-msg">{{ message || '该项为必填'}}</span>
		</span>
	</span>
</template>
<script>
	var doing = true;
	export default {
		props:{
			visibility:Boolean,
			disabled:Boolean,
			message:'',
			must:{
				type:Boolean,
				default:false
			}
		},
		computed:{
			visible:function(){
				return !this.disabled && this.visibility && this.must;
			}
		},
		methods:{
			start(){
				doing = true;
			},
			stop(){
				doing = false;
			},
			show(status,message){
				if(doing)
				{
					this.visibility = status;
					this.message = message ? message : '';
				}
			},
			setDisabled(status){
				if(status === true) this.visibility = false;
				this.disabled = status;
				this.message = '';
			}
		}
	}
</script>