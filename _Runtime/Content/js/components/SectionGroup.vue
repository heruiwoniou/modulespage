

<template>

<div>
    <div v-if="preview" class="SectionGroup">
        <h1 :style="styleExport">{{ component.title }}</h1>
        <component v-for="item in component.children" v-if="item!=null" :is="item.type" :component="item" :index="$index" :paths="prefixpath" :preview='preview'></component>
    </div>
    <div class="control" data-index="{{paths + index}}" v-else>
        <div :class="['control-item','SectionGroup',iscurrent||selectchild?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">段落</h2>
            <div class="control-panel" v-show="iscurrent||selectchild" transition="fadeInOut">
                <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
                <span class="split"></span>
                <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
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
                <div class="accept" data-index="{{paths +  index + '-0'}}"><b></b></div>
                <component v-for="item in component.children" v-if="item!=null" :is="item.type" :component="item" :index="$index" :paths="prefixpath" :selectindex='selectindex' :preview='preview' transition="fadeInOut"></component>
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
        setindex, removecontrol,showColorPicker, setBold
    }
    from './common/methods';
    import {
        setdefault, removeItem
    }
    from './common/events';
    import {
        prefixpath, fullindex, iscurrent, colorPanel, styleExport
    }
    from './common/computed';

    export default {
        data() {
            return {
                titletip: '段落描述(点击编辑)',
                edittitling: false,
                selectchild: false
            }
        },
        props: props,
        computed: {
            prefixpath,
            fullindex,
            iscurrent,
            colorPanel,
            styleExport
        },
        methods: {
            showColorPicker,
            setBold,
            edittitle() {
                if (this.iscurrent) {
                    this.edittitling = true;
                    this.$nextTick(() => {
                        this.$els.titleInput.focus();
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
                this.closetitle();
            }),
            removeItem
        }
    }

</script>
