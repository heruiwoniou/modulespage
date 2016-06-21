

<template>
    <div class="ChoiceQuestion">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <table v-if="!edititemsing&&component.items.length!=0">
            <tr v-for="row in Math.ceil(component.items.length / columns)">
                <td v-for="col in columns" v-if="( row * columns + col ) <= component.items.length - 1">
                    <label>
                        <input type="{{component.single?'radio':'checkbox'}}" name="{{component.id}}" value="{{ component.items[row * columns + col] }}" v-model="component.value">{{ component.items[row * columns + col] }}
                    </label>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import props from './../common/props';
    import { styleExport } from './../common/computed';
    export default {
        data() {
            return {
                maxrows: 10
            }
        },
        props: props,
        computed: {
            columns() {
                return Math.ceil(this.component.items.length / this.maxrows);
            },
            styleExport
        }
    }

</script>
