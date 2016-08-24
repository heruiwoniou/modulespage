

<template>
    <div :class="['PicChoiceQuestion',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}
          <msg-control v-ref:msg :must="component.must"></msg-control>
        </h1>
        <div class="images-container">
            <div class="image item" v-for="item in component.items" @click="behavior">
               <label :title="item.text">
                   <div class="imageViewer">
                       <img :src="item.image" alt="" :width="item.w" :height="item.h">
                   </div>
                   <template v-if="$index === 0">
                     <input :type="component.single?'radio':'checkbox'" :data-rule="disabled||!component.must?'':'checked'" data-isdocumentbind='true' :name="component.id" :value="item.text" v-model="component.value"><div class="span-text">{{item.text}}</div>
                   </template>
                   <template v-else>
                     <input :type="component.single?'radio':'checkbox'" data-isdocumentbind='true' :name="component.id" :value="item.text" v-model="component.value"><div class="span-text">{{item.text}}</div>
                   </template>
               </label>
           </div>
        </div>
    </div>
</template>

<script>
    import props from './../common/props';
    import watch from './../common/watch';
    import { styleExport } from './../common/computed';
    import { trigger, toValidator } from './../common/events';
    import { start , stop } from './../common/methods';
    export default {
      data(){
        return {
            disabled : true,
            doing : true
          }
      },
      watch: watch,
      props: props,
      computed: {
          styleExport
      },
      ready(){
        this.disabled = false;
      },
      events:{
        toValidator,
      	trigger
      },
      methods:{
        start,
        stop,
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
