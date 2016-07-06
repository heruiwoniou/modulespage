

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
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
        data(){
            return {
                disabled:true,
            }
        },
        props: props,
        computed: {
            styleExport
        },
        ready(){
            this.disabled = false;
        },
        events:{
            trigger
        }
    }

</script>
