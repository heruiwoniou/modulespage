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
                    <th class="empty"></th>
                </tr>
                <tr v-for="index in component.rows.length">
                    <th class="row">
                        <span>{{component.rows[index]}}</span>
                    </th>
                    <td v-for="i in component.cells.length">
                        <template v-if="i === 0">
                            <input :type="component.single?'radio':'checkbox'" :data-rule="disabled||!component.must?'':'checked'" :name="component.id + component.rows[index]" :value="component.cells[i]" v-model="component.value[index]">
                        </template>
                        <template v-else>
                            <input :type="component.single?'radio':'checkbox'" :name="component.id + component.rows[index]" :value="component.cells[i]" v-model="component.value[index]">
                        </template>
                    </td>
                    <td class="empty"><span class="msg-box" :for="component.id + component.rows[index]"></span></td>
                </tr>
            </table>
            <input type="hidden" :name="component.id" :value="component.value | json">
        </div>
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
            disabled: true,
        }
    },
    props: props,
    computed: {
        styleExport
    },
    ready(){
        this.disabled = false;
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
