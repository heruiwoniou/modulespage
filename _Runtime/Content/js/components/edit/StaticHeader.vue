<template>
    <div class="control-static">
        <div :class="['control-item','StaticHeader',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">标题</h2>
            <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
                <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
                <span class="split"></span>
                <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
            </div>
            <div class="content-area">
                <div class="background" v-el:background>
                    <div class="imageViewer" v-el:image-container>
                        <img :src="component.src" v-el:image :width="image.w" :width="image.h" alt="">
                    </div>
                    <div class="filecommand">
                        <form enctype="multipart/form-data" method="POST">
                        <div class="filecommand-background"></div>
                        <a href="javascript:;" class="upload"><input type="file" v-el:file @change="fileschange" name="file"></a>
                        <a href="javascript:;" v-if="component.src != component.default" class="delete" @click="removeImage"></a>
                        </form>
                    </div>
                </div>
                <div class="text-content">
                    <div class="content">
                        <div v-show="edittitling" class="edittitle" @click.stop="">
                            <input type="text" :style="styleExport" v-model="component.title" @focusout="closettitle" v-el:title-input>
                        </div>
                        <h1 v-show="!edittitling" :style="styleExport" @click.stop="edittitle">{{ component.title || titletip }}</h1>
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

    import './../common/transition/fadeInOut';

    import ComsysFileReader from './../common/filereader.js';

    import XImage from 'common/client/XImage';

    import props from './../common/props';
    import {
        setindex, showColorPicker, setBold
    }
    from './../common/methods';
    import {
        setdefault
    }
    from './../common/events';
    import {
        fullindex,iscurrent, colorPanel, styleExport
    }
    from './../common/computed';

    var filereader=new ComsysFileReader();

    export default {
        data() {
                return {
                    titletip: '问卷调查标题(点击编辑)',
                    commenttip: '问卷调查标注(点击编辑)',
                    edittitling: false,
                    editcommenting: false,
                    image:{
                        w:0,
                        h:0
                    }
                }
        },
        watch:{
            "component.src":function(src){
                var that = this;
                var ret = new XImage(src, 163, 163,function(){
                     that.image.w = ret.width
                     that.image.h = ret.height
                });
            }
        },
        ready(){
            var that = this;
            if(this.component.src === '')
                this.component.src = this.component.default;
            else
            {
                var ret = new XImage(this.component.src, 163, 163,function(){
                     that.image.w = ret.width
                     that.image.h = ret.height
                });
            }
        },
        props: props,
        computed: {
            fullindex,
            iscurrent,
            colorPanel,
            styleExport
        },
        methods: {
            showColorPicker,
            setBold,
            removeImage(){
                this.component.src = this.component.default;
            },
            fileschange(){
                var that=this;
                filereader.read(this.$els.file).then(function(image){
                    that.component.src=image;
                }).fail(function(message){
                    that.image.w = 80;
                    that.component.src=XImage.prototype.errorImageCode
                });
                that.image.w = 16;
                that.component.src=XImage.prototype.loadingImageCode
            },
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
