<template>
    <div :class="['QuestionResponse',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <div class="response-container">
            <input v-if="component.single" data-rule="qqq:required" :disabled="disabled" type="text" :placeholder="tip" :name="component.id" v-model="component.value" lazy>
            <textarea v-else :disabled="disabled" data-rule="required;" cols="30" rows="5" :placeholder="tip" :name="component.id" v-model="component.value" lazy></textarea>
        </div>
    </div>
</template>

<script>
    import props from './../common/props';
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
        data(){
            return {
                disabled:true,
                tip:''
            }
        },
        props: props,
        computed: {
            styleExport
        },
        ready(){
            this.disabled = false;
            if(this.component.value !== '')
            {
                this.tip = this.component.value;
                this.component.value = ""
            }
        },
        events:{
            trigger
        }
    }

</script>
