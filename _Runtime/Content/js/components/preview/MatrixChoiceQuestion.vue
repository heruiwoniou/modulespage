<template>
<div :class="['MatrixChoiceQuestion',disabled?'gray':'']">
    <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
    <div class='m-c' @click="behavior">
        <div class="m-top">
            <table>
                <tr>
                    <th class="nh">&nbsp;&nbsp;&nbsp;</th>
                    <th class="cell" v-for="index in component.cells.length">
                        <span>{{component.cells[index]}}</span>
                    </th>
                </tr>
                <tr v-for="index in component.rows.length">
                    <th class="row">
                        <span>{{component.rows[index]}}</span>
                    </th>
                    <td v-for="i in component.cells.length">
                        <input :type="component.single?'radio':'checkbox'" :name="component.id + component.rows[index]" :value="component.cells[i]" v-model="component.value[index]">
                    </td>
                </tr>
            </table>
            <input type="hidden" :name="component.id" :value="component.value | json">
        </div>
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
            disabled: false,
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
    },
    events:{
        trigger
    }
}

</script>
