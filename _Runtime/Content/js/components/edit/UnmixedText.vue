<template>
    <div class="control" data-index="{{paths + index}}">
        <div :class="['control-item','UnmixedText',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">纯文本</h2>
            <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
                <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
                <span class="split"></span>
                <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
                <div class="inline-container">
                    <span class="split"></span>
                    <a href="javascript:;" class="delete" @click.stop="removecontrol"></a>
                </div>
            </div>
            <div class="content-area">
                <div v-show="editcontenting" class="editcomment" @click.stop="">
                    <textarea :style="styleExport" cols="30" rows="6" v-model="component.content" @focusout="closecontent" v-el:content-input></textarea>
                </div>
                <p :style="styleExport" v-show="!editcontenting" @click.stop="editcontent">{{ component.content || contenttip }}</p>
            </div>
        </div>
        <Accept :index="paths + ( index + 1 )" :isnextaccept="isNextAccept"></Accept>
    </div>
</template>

<script>

    import './../common/transition/fadeInOut';

    import props from './../common/props';
    import {
        setindex, removecontrol, showColorPicker, setBold
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

    export default {
        data() {
                return {
                    contenttip: '文本内容(点击编辑)',
                    editcontenting: false
                }
        },
        props: props,
        computed: {
            fullindex,
            iscurrent,
            colorPanel,
            styleExport,
            isNextAccept
        },
        methods: {
            showColorPicker,
            setBold,
            editcontent() {
                this.editcontenting = true;
                this.$nextTick(() => {
                    this.$els.contentInput.focus();
                })
                if (!this.iscurrent) this.setindex();
            },
            closecontent() {
                this.editcontenting = false;
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.editcontenting)
                    this.closecontent();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closecontent();
            })
        }
    }

</script>
