

<template>
    <div :class="['PicChoiceQuestion',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <div class="images-container">
            <div class="image item" v-for="item in component.items" @click="behavior">
               <label>
                   <div class="imageViewer">
                       <img :src="item.image" alt="" :width="item.w" :height="item.h">
                   </div>
                   <input type="{{component.single?'radio':'checkbox'}}" :name="component.id" :value="item.text" v-model="component.value"><div class="span-text">{{item.text}}</div>
               </label>
           </div>
        </div>
    </div>
</template>

<script>
    import props from './../common/props';
    import watch from './../common/watch';
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
      data(){
        return { disabled : false }
      },
      watch: watch,
      props: props,
      computed: {
          styleExport
      },
      ready(){
      	this.disabled = this.$root.logic.filter(o=>o.to == this.component.id).length !== 0;
      },
      events:{
      	trigger
      },
      methods:{
      	behavior(e){
      		if(this.disabled)
      		{
      			e.stopPropagation();
      			if ( e && e.preventDefault )
      				e.preventDefault();
      			else
      				window.event.returnValue = false;
      			return false;
      		}
      	}
      }
    }

</script>
