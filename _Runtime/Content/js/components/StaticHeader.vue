

<template>

<div v-if="preview" class="StaticHeader">
    <h1>{{ component.title }}</h1>
    <p>{{ component.comment }}</p>
</div>
<div v-else class="control-static">
    <div :class="['control-item','StaticHeader',iscurrent?'select':'']" @click.stop="setindex">
        <h2 class="control-title" v-show="!iscurrent">标题控件</h2>
        <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
            <a href="javascript:;" class="icon-bold">加粗</a>
            <span class="split"></span>
            <a href="javascript:;" class="icon-color">颜色</a>
            <span class="split"></span>
        </div>
        <div class="content-area">
            <div class="background">
            </div>
            <div class="text-content">
                <div class="content">
                    <div v-show="edittitling" class="edittitle" @click.stop="">
                        <input type="text" v-model="component.title" @focusout="closettitle" v-el:title-input>
                    </div>
                    <h1 v-show="!edittitling" @click.stop="edittitle">{{ component.title || titletip }}</h1>
                    <div v-show="editcommenting" class="editcomment" @click.stop="">
                        <textarea cols="30" rows="6" v-model="component.comment" @focusout="closecomment" v-el:comment-input></textarea>
                    </div>
                    <p v-show="!editcommenting" @click.stop="editcomment">{{ component.comment || commenttip }}</p>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<script>

import './common/transition/fadeInOut';

import props from './common/props';
import {
    setindex, removecontrol
}
from './common/methods';
import {
    setdefault
}
from './common/events';
import {
    prefixpath, fullindex, iscurrent
}
from './common/computed';

export default {
    data() {
            return {
                titletip: '问卷调查标题(点击编辑)',
                commenttip: '问卷调查标注(点击编辑)',
                edittitling: false,
                editcommenting: false
            }
        },
        props: props,
        computed: {
            fullindex,
            iscurrent
        },
        methods: {
            edittitle() {
                    if (this.iscurrent) {
                        this.edittitling = true;
                        this.$nextTick(() => {
                            this.$els.titleInput.focus();
                        })
                    } else //stop 冒泡,手动触发
                        this.setindex();
            },
            closettitle() {
                this.edittitling = false;
            },
            editcomment() {
                if (this.iscurrent) {
                    this.editcommenting = true;
                    this.$nextTick(() => {
                        this.$els.commentInput.focus();
                    })
                } else //stop 冒泡,手动触发
                    this.setindex();
            },
            closecomment() {
                this.editcommenting = false;
            },
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.edittitling)
                    this.closettitle();
                if (this.editcommenting)
                    this.closecomment();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closettitle();
                this.closecomment();
            })
        }
}

</script>
