

<template>
    <div class="PicChoiceQuestion">
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
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';

    import { isArray } from './../common/util';

    export default {
      data(){
        disabled : false
      },
      watch:{
      	'component.value':function(_new_,_old_){
      		var source,tos,ret;
      		source = this.$root.logic.filter(o=>o.from == this.component.id && o.option !== 999);
      		tos = source.map(o=>{ return o.to });

      		if(isArray(_new_))
      			ret = source.filter(o=>_new_.indexOf(o.value.option) !== -1).map(o=>{ return o.to });
      		else
      			ret = source.filter(o=>o.value.option == _new_).map(o=>{ return o.to });

      		this.$root.$broadcast( 'trigger' , tos , ret , 'choice' );
      	},
      	'disabled':function(_new_,_old_){
      		var source,tos,ret;
      		source = this.$root.logic.filter(o=>o.from == this.component.id && o.option === 999);
      		tos = source.map(o=>{ return o.to });
      		ret = source.filter(o=>o.option === 999).map(o=>{ return o.to });
      		this.$root.$broadcast( 'trigger' , tos , ret , 'display' ,_new_);
      	}
      },
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
