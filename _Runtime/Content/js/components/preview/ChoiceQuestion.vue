

<template>
    <div :class="['ChoiceQuestion',disabled?'gray':'']">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <table v-if="!edititemsing&&component.items.length!=0" @click="behavior">
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
    import { trigger } from './../common/events';

    import { isArray } from './../common/util';

    export default {
        data() {
            return {
                disabled : false ,

                maxrows: 10
            }
        },
        props: props,
        watch:{
            'component.value':function(_new_,_old_){
                var source,tos,ret;

                source = this.$root.logic.filter(o=>o.from == this.component.id && o.option !== 999);
                tos = source.map(o=>{ return o.to });

                if(isArray(_new_))
                    ret = source.filter(o=>_new_.indexOf(o.value.option) !== -1).map(o=>{ return o.to });
                else
                    ret = source.filter(o=>o.value.option == _new_).map(o=>{ return o.to });

                this.$root.$broadcast( 'trigger' , tos , ret , 'choice' );
            },
            'disabled':function(_new_,_old_){
                var source,tos,ret;
                source = this.$root.logic.filter(o=>o.from == this.component.id && o.option === 999);
                tos = source.map(o=>{ return o.to });
                ret = source.filter(o=>o.option === 999).map(o=>{ return o.to });
                this.$root.$broadcast( 'trigger' , tos , ret , 'display' ,_new_);
            }
        },
        ready(){
            this.disabled = this.$root.logic.filter(o=>o.to == this.component.id).length !== 0;
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
