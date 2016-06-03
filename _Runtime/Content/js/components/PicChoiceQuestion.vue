

<template>
    <div>
        <div v-if="preview" class="PicChoiceQuestion">
            <h1 :style="styleExport">{{ component.title }}</h1>
        </div>
        <div class="control" data-index="{{paths + index}}" v-else>
            <div :class="['control-item','PicChoiceQuestion',iscurrent?'select':'']" @click.stop="setindex">
                <h2 class="control-title" v-show="!iscurrent">图片选择题</h2>
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
                    <div class="images-container">
                        <div class="image item"></div>
                        <div class="image add"></div>
                    </div>
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
            edittitle() {
                if (this.iscurrent) {
                    this.edittitling = true;
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
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closetitle()
            })
        }
}

</script>
