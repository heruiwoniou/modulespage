

<template>

<div>
    <div v-if="preview" class="ChoiceQuestion">
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
    <div class="control" data-index="{{paths + index}}" v-else>
        <div :class="['control-item','ChoiceQuestion',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">选择题控件</h2>
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
                    <a href="javascript:;" class="delete" @click="removecontrol"></a>
                </div>
            </div>
            <div class="content-area">
                <div v-show="edittitling" class="edittitle" @click.stop="">
                    <input type="text" :style="styleExport" v-model="component.title" @focusout="closetitle" v-el:title-input>
                </div>
                <h1 v-show="!edittitling" :style="styleExport" @click.stop="edittitle">{{ component.title || titletip }}</h1>
                <div v-show="!edititemsing&&children.length==0" @click.stop="edititems" class="edititems-tip">
                    内容(点击编辑)
                </div>
                <div v-show="edititemsing" class="edititems" @click.stop="">
                    <textarea cols="30" rows="{{textarearow}}" @focusout="closeitems" v-model="component.items" v-el:items-textarea></textarea>
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
        <div class="accept" data-index="{{paths + ( index + 1 )}}"><b></b></div>
    </div>
</div>

</template>

<script>

import './common/transition/fadeInOut';

import props from './common/props';
import {
    setindex, removecontrol, showColorPicker, setBold
}
from './common/methods';
import {
    setdefault
}
from './common/events';
import {
    prefixpath, fullindex, iscurrent, colorPanel, styleExport
}
from './common/computed';

export default {
    data() {
            return {
                titletip: '标题(点击编辑)',
                edittitling: false,
                edititemsing: false,
                maxrows: 10
            }
        },
        props: props,
        computed: {
            textarearow() {
                    var l = this.component.items.split('\n').length;
                    return l > this.maxrows ? this.maxrows : l;
            },
            children() {
                return this.component.items.split('\n').filter(o => o !== '');
            },
            columns() {
                return Math.ceil(this.children.length / this.maxrows);
            },
            prefixpath,
            fullindex,
            iscurrent,
            colorPanel,
            styleExport
        },
        methods: {
            showColorPicker,
            setBold,
            setmodel(issingle) {
                    this.component.single = issingle;
            },
            edititems() {
                if (this.iscurrent) {
                    this.edititemsing = true;
                    this.edittitling = false;
                    this.$nextTick(() => {
                        this.$els.itemsTextarea.focus();
                    })
                } else //stop 冒泡,手动触发
                    this.setindex();
            },
            closeitems() {
                this.edititemsing = false;
            },
            edittitle() {
                if (this.iscurrent) {
                    this.edittitling = true;
                    this.edititemsing = false;
                    this.$nextTick(() => {
                        this.$els.titleInput.focus();
                        this.$els.titleInput.select();
                    })
                } else //stop 冒泡,手动触发
                    this.setindex();
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
