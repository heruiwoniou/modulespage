<template>
    <div class="control" data-index="{{paths + index}}">
        <div :class="['control-item','QuestionResponse',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">问答题</h2>
            <div class="control-panel" v-show="iscurrent" transition="fadeInOut">
                <a href="javascript:;" :class="['icon-bold',component.bold?'select':'']" @click="setBold">加粗</a>
                <span class="split"></span>
                <a href="javascript:;" class="icon-color" @click="showColorPicker($event)">颜色<b v-el:color-panel :style="colorPanel"></b></a>
                <span class="split"></span>
                <a href="javascript:;" v-if="component.single" class="single-line select">单行</a>
                <a href="javascript:;" v-else class="single-line" @click="setmodel(true)">单行</a>
                <span class="split"></span>
                <a href="javascript:;" v-if="!component.single" class="multi-line select">多行</a>
                <a href="javascript:;" v-else class="multi-line" @click="setmodel(false)">多行</a>
                <span class="split"></span>
                <div class="inline-container">
                    <span class="split"></span>
                    <a href="javascript:;" :class="['icon-must',component.must ? 'select':'']" @click="setMust">必答题</a>
                    <span class="split"></span>
                    <a href="javascript:;" class="delete" @click.stop="removecontrol"></a>
                </div>
            </div>
            <div class="content-area">
                <div v-show="editquestioning" class="edittitle" @click.stop="">
                    <input type="text" :style="styleExport" maxlength="600" v-model="component.title" @focusout="closequestion" v-el:question-input>
                </div>
                <h1 v-show="!editquestioning" :style="styleExport" @click.stop="editquestion"><span class="qindex">Q{{component.qindex}}:</span>{{ component.title || questiontip }}</h1>
                <div v-show="editanswering" class="editanswer" @click.stop="">
                    <input type="text" v-model="component.value" @focusout="closeanswer" v-el:answer-input />
                </div>
                <p v-show="!editanswering" @click.stop="editanswer">{{ component.value || answertip }}</p>
            </div>
        </div>
        <Accept :index="paths + ( index + 1 )" :isnextaccept="isNextAccept"></Accept>
    </div>
</template>

<script>

    import './../common/transition/fadeInOut';

    import Bumper from 'common/client/Bumper';

    import props from './../common/props';
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
                    questiontip: '文本内容(点击编辑)',
                    answertip:'预留文字(点击编辑)',
                    editquestioning: false,
                    editanswering:false
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
        watch:{
            'component.title':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o =>o.value.from ='Q' + this.component.qindex + ":" + _new_);
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to ='Q' + this.component.qindex + ":" + _new_);
                });
            },
            'component.qindex':function(_new_,_old_){
                bumper.trigger(()=>{
                    this.$root.logic.filter(o => o.from == this.component.id).forEach(o => o.value.from = o.value.from.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                    this.$root.logic.filter(o => o.to == this.component.id).forEach(o => o.value.to = o.value.to.replace(/^Q\d*:/,'Q' + _new_ + ':'));
                });
            }
        },
        methods: {
            showColorPicker,
            setBold,
            setMust,
            setmodel(issingle) {
                this.component.single = issingle;
            },
            editquestion() {
                this.editquestioning = true;
                this.$nextTick(() => {
                    this.$els.questionInput.focus();
                })
                if (!this.iscurrent) this.setindex();
            },
            closequestion() {
                this.editquestioning = false;
            },
            editanswer() {
                this.editanswering = true;
                this.$nextTick(() => {
                    this.$els.answerInput.focus();
                })
                if (!this.iscurrent) this.setindex();
            },
            closeanswer() {
                this.editanswering = false;
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.editquestioning)
                    this.closequestion();
                if (this.editanswering)
                    this.closeanswer();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closequestion();
                this.closeanswer();
            })
        }
    }

</script>
