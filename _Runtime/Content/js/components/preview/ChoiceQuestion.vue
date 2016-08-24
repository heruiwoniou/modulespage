

<template>
    <div :class="['ChoiceQuestion',disabled?'gray':'']">
        <h1 :style="styleExport">
            <span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}
            <msg-control v-ref:msg :must="component.must"></msg-control>
        </h1>
        <table v-if="!edititemsing&&component.items.length!=0" @click="behavior">
            <tr v-for="row in Math.ceil(component.items.length / columns)">
                <td v-for="col in columns" v-if="( row * columns + col ) <= component.items.length - 1">
                    <label v-if="(row * columns + col) === 0">
                        <input :data-rule="disabled||!component.must?'':'checked'" :type="component.single?'radio':'checkbox'" data-isdocumentbind='true' :name="component.id" :value="component.items[row * columns + col]" v-model="component.value">{{ component.items[row * columns + col] }}
                    </label>
                    <label v-else>
                        <input :type="component.single?'radio':'checkbox'" data-isdocumentbind='true'  :name="component.id" :value="component.items[row * columns + col]" v-model="component.value">{{ component.items[row * columns + col] }}
                    </label>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import './common/MsgControl';
    import props from './../common/props';
    import watch from './../common/watch';
    import { styleExport } from './../common/computed';
    import { trigger, toValidator } from './../common/events';
    import { start , stop } from './../common/methods';
    var doing = true;
    export default {
        data() {
            return {
                disabled : true ,

                maxrows: 10,

                doing : true
            }
        },
        props: props ,
        watch: watch ,
        ready(){
            this.disabled = false;
        },
        computed: {
            columns() {
                return Math.ceil(this.component.items.length / this.maxrows);
            },
            styleExport
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
