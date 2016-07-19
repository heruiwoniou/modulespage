

<template>
    <div :class="['ChoiceQuestion',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}<span class="msg-box" :for="component.id"></span></h1>
        <table v-if="!edititemsing&&component.items.length!=0" @click="behavior">
            <tr v-for="row in Math.ceil(component.items.length / columns)">
                <td v-for="col in columns" v-if="( row * columns + col ) <= component.items.length - 1">
                    <label v-if="(row * columns + col) === 0">
                        <input :data-rule="disabled||!component.must?'':'checked'" :type="component.single?'radio':'checkbox'" :name="component.id" :value="component.items[row * columns + col]" v-model="component.value">{{ component.items[row * columns + col] }}
                    </label>
                    <label v-else>
                        <input :type="component.single?'radio':'checkbox'"  :name="component.id" :value="component.items[row * columns + col]" v-model="component.value">{{ component.items[row * columns + col] }}
                    </label>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import props from './../common/props';
    import watch from './../common/watch';
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
        data() {
            return {
                disabled : true ,

                maxrows: 10
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
