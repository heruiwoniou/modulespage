<template>
    <div :class="['QuestionResponse',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}
            <msg-control v-ref:msg :must="component.must"></msg-control>
        </h1>
        <div class="response-container">
            <input v-if="component.single" :maxlength="component.wordlength" :disabled="disabled" type="text" :placeholder="tip" :id="component.id" :name="component.id" v-model="component.value">
            <textarea v-else :disabled="disabled" cols="30" :maxlength="component.wordlength" rows="5" :placeholder="tip" :name="component.id" v-model="component.value"></textarea>
        </div>
    </div>
</template>

<script>
    import props from './../common/props';
    import { styleExport } from './../common/computed';
    import { trigger, toValidator } from './../common/events';
    import { start , stop } from './../common/methods';
    var beginValidate = false;
    export default {
        data(){
            return {
                disabled:true,
                tip:'',
                doing:true
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
                this.component.value = "";
                this.$nextTick(function(){
                    beginValidate = true;
                })
            }
        },
        watch:{
            'component.value':function(){
                if(beginValidate)
                {
                    if(!this.doing) return;
                    this.$emit( 'toValidator' );
                }
            }
        },
        methods:{
            start,
            stop
        },
        events:{
            toValidator,
            trigger
        }
    }

</script>
