

<template>
    <div class="ChoiceQuestion">
        <h1 :style="styleExport">{{ component.title }}</h1>
        <table v-if="!edititemsing&&children.length!=0">
            <tr v-for="row in Math.ceil(children.length / columns)">
                <td v-for="col in columns" v-if="( row * columns + col ) <= children.length - 1">
                    <label>
                        <input type="{{component.single?'radio':'checkbox'}}" name="{{component.id}}" value="{{ children[row * columns + col] }}">{{ children[row * columns + col] }}
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
            children() {
                return this.component.items.split('\n').filter(o => o !== '');
            },
            columns() {
                return Math.ceil(this.children.length / this.maxrows);
            },
            styleExport
        }
    }

</script>
