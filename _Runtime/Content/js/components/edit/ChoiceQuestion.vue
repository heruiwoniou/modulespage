<template>
    <div class="control" data-index="{{paths + index}}">
        <div :class="['control-item','ChoiceQuestion',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">选择题</h2>
            <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
                <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
                <span class="split"></span>
                <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
                <a href="javascript:;" v-if="component.single" class="icon-radio select">单选</a>
                <a href="javascript:;" v-else class="icon-radio" @click="setmodel(true)">单选</a>
                <span class="split"></span>
                <a href="javascript:;" v-if="!component.single" class="icon-check select">多选</a>
                <a href="javascript:;" v-else class="icon-check" @click="setmodel(false)">多选</a>
                <span class="split"></span>
                <div class="inline-container">
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-must',component.must ? 'select':'']" @click="setMust">必答题</a>
                    <span class="split"></span>
                    <a href="javascript:;" class="delete" @click.stop="removecontrol"></a>
                </div>
            </div>
            <div class="content-area">
                <div v-show="edittitling" class="edittitle" @click.stop="">
                    <input type="text" :style="styleExport" maxlength="600" v-model="component.title" @focusout="closetitle" v-el:title-input>
                </div>
                <h1 v-show="!edittitling" :style="styleExport" @click.stop="edittitle"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title || titletip }}</h1>
                <div v-show="!edititemsing&&children.length==0" @click.stop="edititems" class="edititems-tip">
                    内容(点击编辑)
                </div>
                <div v-show="edititemsing" class="edititems" @click.stop="">
                    <textarea cols="30" :rows="textarearow" @focusout="closeitems" v-model="itemstring" v-el:items-textarea></textarea>
                </div>
                <table v-if="!edititemsing&&children.length!=0" @click.stop="edititems">
                    <tr v-for="row in Math.ceil(children.length / columns)">
                        <td v-for="col in columns" v-if="( row * columns + col ) <= children.length - 1">
                            <label>
                                <input type="{{component.single?'radio':'checkbox'}}" name="{{component.id}}" value="{{ children[row * columns + col] }}">{{ children[row * columns + col] }}
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <Accept :index="paths + ( index + 1 )" :isnextaccept="isNextAccept"></Accept>
    </div>
</template>

<script>

import './../common/transition/fadeInOut';
import props from './../common/props';
import Bumper from 'common/client/Bumper';
import {
    setindex, removecontrol, showColorPicker, setBold, setMust
}
from './../common/methods';
import {
    setdefault
}
from './../common/events';
import {
    prefixpath, fullindex, iscurrent, colorPanel, styleExport, isNextAccept
}
from './../common/computed';

import './common/Accept';

var bumper = Bumper.create();

export default {
    data() {
            return {
                titletip: '标题(点击编辑)',
                edittitling: false,
                edititemsing: false,
                itemstring:''
            }
        },
        props: props,
        ready(){
            this.itemstring = this.component.items.join('\n');
        },
        watch:{
            'itemstring':function(_new_,_old_){
                var arr = _new_.split('\n');
                if(_new_.indexOf('|') != -1)
                {
                    this.itemstring = _new_.replace(/\|/g,'｜');
                    return;
                }
                if(arr.filter(o => o !== '').length > this.component.maxItems) {
                    this.itemstring = _old_ ;
                    return;
                }
                var re ;
                if((re = arr.filter(o => o!=='' && o.length > this.component.itemWordLength)).length > 0 || arr.length !== arr.filter(o => o !== '').length )
                {
                    var a = _new_.split('\n').filter(o => o!=='').map(o => o.substr(0, this.component.itemWordLength)).join('\n');
                    this.itemstring = a;
                    return;
                }
                bumper.trigger(()=>{
                    this.component.items = _new_.split('\n').filter(o => o !== '');
                    var source = this.$root.logic.filter(o => o.from == this.component.id && o.option !== 999);
                    if(source.length > this.component.items.length)
                    {
                        //设置该数据源可用数据
                        source = source.sort((a,b)=>a.option > b.option) ;
                        var dret = source.splice(this.component.items.length);
                        //清除所在原始数据源
                        dret.forEach(o => {
                            for(var i = this.$root.logic.length - 1 ;i >= 0;i --)
                            {
                                var {from,option} = this.$root.logic[i];
                                if(from === o.from && option === o.option && option !== 999)
                                    this.$root.logic.splice( i , 1 );
                            }
                        })
                    }
                    //更改选项
                    source.forEach(o=>{
                    for(var i = 0 ; i < this.component.items.length ; i ++)
                    {
                        if(i !== o.option) continue;
                        var option = this.component.items[i];
                        o.value.option = option;
                    }
                    })
               })
            },
            'component.title':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o =>o.value.from ='Q' + this.component.qindex + ":" + _new_);
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to ='Q' + this.component.qindex + ":" +     _new_);
                });
            },
            'component.qindex':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o => o.value.from = o.value.from.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to = o.value.to.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                });
            }
        },
        computed: {
            textarearow() {
                var l = this.itemstring.split('\n').length;
                return l > this.component.maxItems ? this.component.maxItems : l;
            },
            children() {
                return this.itemstring.split('\n').filter(o => o !== '');
            },
            columns() {
                return Math.ceil(this.children.length / this.component.maxItems);
            },
            prefixpath,
            fullindex,
            iscurrent,
            colorPanel,
            styleExport,
            isNextAccept
        },
        methods: {
            showColorPicker,
            setBold,
            setMust,
            setmodel(issingle) {
                this.component.single = issingle;
            },
            edititems() {
                this.edititemsing = true;
                this.edittitling = false;
                this.$nextTick(() => {
                    this.$els.itemsTextarea.focus();
                })
                if (!this.iscurrent) this.setindex();
            },
            closeitems() {
                this.edititemsing = false;
            },
            edittitle() {
                this.edittitling = true;
                this.edititemsing = false;
                this.$nextTick(() => {
                    this.$els.titleInput.focus();
                    this.$els.titleInput.select();
                })
                if (!this.iscurrent) this.setindex();
            },
            closetitle() {
                this.edittitling = false;
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.edittitling)
                    this.closetitle();
                if (this.edititemsing)
                    this.closeitems();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closetitle()
                this.closeitems();
            })
        }
}

</script>
