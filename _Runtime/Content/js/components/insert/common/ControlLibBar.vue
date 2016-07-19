<template>
	<div :class="['control-small','control-libs',isSelected(majorkey) ? 'select' : '']" :data-type="type" :data-majorkey="majorkey" :data-main-id="mainId">
		<div class="insert-control-title" @click="toggleSelect(majorkey)">{{title}}</div>
		<b @click="toggleVisible($event)"></b>
	</div>
</template>
<script>
	var toggleVisible = function(e){
    	var $this = $(e.target);
    	var $content = $this.closest('.control-container').find('.control-content');
    	if($content.is(":visible"))
    		$content.hide();
    	else {
    		$this.closest('.insert-content').find('.control-content').not($content).hide();
    		$content.show();
    	}
    };
    var toggleSelect = function(majorkey){
        this.$dispatch("SelectArrayChange",majorkey);
    };
    var isSelected = function(majorkey){
    	return this.$parent.$parent.select_array.indexOf(majorkey) !== -1
    }
	export default{
		props:{
			type:{
				type:String
			},
			mainId:String,
			majorkey:{
				type:String
			},
			title:{
				type:String
			}
		},
		methods:{
			toggleVisible,
			toggleSelect,
			isSelected
		}
	}
</script>