

<template>
    <div :class="['QuestionResponse',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <div class="response-container">
            <input v-if="component.single" :disabled="disabled" type="text" :name="component.id" v-model="component.value" lazy>
            <textarea v-else :disabled="disabled" cols="30" rows="5" v-model="component.value" lazy></textarea>
        </div>
    </div>
</template>

<script>
    import props from './../common/props';
    import { disabled } from './../common/watch';
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
        data(){
            return {
                disabled:false,
            }
        },
        props: props,
        computed: {
            styleExport
        },
        watch:{
            disabled
        },
        ready(){
            this.disabled = this.$root.logic.filter(o=>o.to == this.component.id).length !== 0;
        },
        events:{
            trigger
        }
    }

</script>
