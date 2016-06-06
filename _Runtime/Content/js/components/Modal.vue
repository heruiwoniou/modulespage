

<template>

<div class="full-screen-modal" v-if="showframe" transition="fadeInOutDown">
    <div class="modal-frame">
        <div class="modal-menu" v-if="!iscustom">
            <div class="back" @click="close"><i></i></div>
            <a v-if="defaultsrc !== 'about:blank' && isview" href="javascript:;" :class="{'view':true,'select':isview }"><i></i><b>概览</b></a>
            <a v-if="defaultsrc !== 'about:blank' && !isview" @click="seturl(true,$event)" href="javascript:;" :class="{'view':true,'select':isview }"><i></i><b>概览</b></a>
            <a v-if="analyzesrc !== 'about:blank' && isview" @click="seturl(false,$event)" href="javascript:;" :class="{'analyze':true,'select':!isview}"><i></i><b>分析</b></a>
            <a v-if="analyzesrc !== 'about:blank' && !isview" href="javascript:;" :class="{'analyze':true,'select':!isview}"><i></i><b>分析</b></a>
        </div>
        <div v-else class="back" @click="close"><i></i></div>
        <div :class="['modal-right-frame',iscustom?'custom':'']">
            <div class="modal-body">
                <div class="modal-content">
                    <iframe :src="showframe&&animated?geturl():'about:blank'" frameborder="0" height="100%" width="100%"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<script>

import './common/transition/fadeInOutDown';
var callback = function() {};
export default {
    data() {
            return {
                //样式是否自动义
                iscustom: false,
                isview: true,
                //控制是否显示框架
                showframe: false,
                defaultsrc: "about:blank",
                analyzesrc: "about:blank",
                animated: false
            }
        },
        watch: {
            'showframe': function(_new_, _old_) {
                if (_new_) {
                    $(document.documentElement).addClass('scroll-hide')
                    window.setTimeout(() => {
                        this.animated = true;
                    }, 200)
                } else
                    $(document.documentElement).removeClass('scroll-hide')
            }
        },
        methods: {
            show({
                    defaultsrc = "about:blank",
                    analyzesrc = "about:blank",
                    custom = false,
                    callback = function() {}
                }) {
                    this.deferred = new $.Deferred();
                    this.deferred.promise(this);

                    this.showframe = true;
                    this.defaultsrc = defaultsrc;
                    this.analyzesrc = analyzesrc;
                    this.iscustom = custom;
                    this.isview = true;
                    this.then((cmd) => {
                        callback.call(this, cmd);
                        return cmd;
                    });

                    return this;
                },
                close() {
                    this.animated = false;
                    this.$nextTick(function() {
                        this.showframe = false;
                        this.defaultsrc = "about:blank";
                        this.analyzesrc = "about:blank";
                        this.iscustom = false;
                        this.animated = false;
                        this.deferred.resolve("close");
                        this.isview=false;
                    })
                },
                seturl(isview, $event) {
                    this.isview = isview;
                    $($event.currentTarget).closest('.modal-menu').find('a.select').removeClass('select')
                        .end().end().addClass('select');
                },
                geturl() {
                    return this.isview ? this.defaultsrc : this.analyzesrc;
                }
        }
}

</script>
