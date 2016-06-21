

<template>
    <div class="PicChoiceQuestion">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <div class="images-container">
            <div class="image item" v-for="item in component.items">
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
    export default {
        props: props,
        computed: {
            styleExport
        }
    }

</script>
