<template>
    <div class="control" data-index="{{paths + index}}">
        <div :class="['control-item','MatrixChoiceQuestion',iscurrent?'select':'']" @click.stop="setindex">
            <h2 class="control-title" v-show="!iscurrent">矩阵选择题</h2>
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
                <div class='m-c'>
                    <div class="m-top" style="overflow-x:auto">
                        {{ component.value | json }}
                        <table>
                            <tr>
                                <th class="nh">&nbsp;&nbsp;&nbsp;</th>
                                <th class="cell" v-for="index in component.cells.length">
                                    <b @click.stop="deletecell(index)" v-show="editcelling && index == editcellindex">&#x4d;</b>
                                    <input v-show="editcelling && index == editcellindex" type="text" v-model="component.cells[index]" @click.stop="" @keydown.enter.tab="validatecell($event,$index)" @focusout="closeeditcell" :maxlength="component.itemWordLength" lazy>
                                    <span @click.stop="editcell($event,index)" :class="[editcelling && index == editcellindex?'transparent':'']" :title="component.cells[index]">{{component.cells[index]}}</span>
                                </th>
                                <th class="nh ctp ctp-cell">
                                    <a v-if="component.maxColItems > component.cells.length" href="javascript:;" class="addcell" @click.stop="addcell">&#x50;</a>
                                </th>
                            </tr>
                            <tr v-for="index in component.rows.length">
                                <th class="row">
                                    <b @click.stop="deleterow(index)" v-show="editrowing && index == editrowindex">&#x4d;</b>
                                    <input v-show="editrowing && index == editrowindex" type="text" v-model="component.rows[index]" @click.stop="" @keydown.enter.tab="validaterow($event,$index)" @focusout="closeeditrow" :maxlength="component.itemWordLength" lazy>
                                    <span @click.stop="editrow($event,index)" :title="component.rows[index]">{{component.rows[index]}}</span>
                                </th>
                                <td v-for="i in component.cells.length"><input :type="component.single?'radio':'checkbox'" :name="component.rows[index]"></td>
                            </tr>
                            <tr>
                                <th class="nh ctp ctp-row">
                                    <a  v-if="component.maxRowItems > component.rows.length" href="javascript:;" class="addrow" @click.stop="addrow">&#x50;</a>
                                </th>
                            </tr>
                        </table>
                    </div>
                </div>
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

var isvalidate = false;

var cachecell = "";
var cacherow = "";

var watchcontroll = null;

var getMaxItem = function(arr,key){
    var max = 0;
    arr.forEach(o=>{
        var u,e = RegExp(key + "(\\d*)$");
        if((u=e.exec(o)))
        {
            var n = ~~u[1];
            if(n > max) max = n;
        }
    });
    return key + (max + 1);
}

export default {
    data() {
            return {
                titletip: '标题(点击编辑)',
                edittitling: false,

                editrowing: false,
                editrowindex:-1,

                editcelling: false,
                editcellindex:-1
            }
        },
        props: props,
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
        computed: {
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
            edittitle() {
                this.edittitling = true;
                this.$nextTick(() => {
                    this.$els.titleInput.focus();
                    this.$els.titleInput.select();
                })
                //冒泡,手动触发
                if (!this.iscurrent) this.setindex();
            },
            closetitle() {
                this.edittitling = false;
            },
            editcell($event,$index){
                isvalidate = true;
                this.editrowing = false;
                this.editrowindex = -1;
                this.editcelling = true;
                this.editcellindex = $index;
                this.$nextTick(()=>{
                    $($event.target).closest('th').find('input').focus().select();
                });
                //冒泡,手动触发
                if (!this.iscurrent) this.setindex();

                window.setTimeout(()=>isvalidate = false, 100);
            },
            closeeditcell(){
                if(!isvalidate)
                {
                    this.editcelling = false;
                    this.editcellindex = -1;
                }
                var l = this.component.cells.length;
                for(var i = this.component.cells.length - 1; i >= 0 ; i --)
                    if(this.component.cells.slice( 0 , i ).concat(this.component.cells.slice(i + 1)).indexOf(this.component.cells[i]) !== -1 || this.component.cells[i] == '')
                    {
                        this.component.cells.splice( i , 1 );
                        if(this.editcellindex != -1)
                        {
                            this.editcellindex --;
                            this.$nextTick(()=>$(this.$el).find(".m-c .cell:eq(" + this.editcellindex + ") :text").focus().select())
                        }
                    }
            },
            editrow($event,$index){
                isvalidate = true;
                this.editrowing = true;
                this.editrowindex = $index;
                this.editcelling = false;
                this.editcellindex = -1;
                this.$nextTick(()=>{
                    $($event.target).closest('th').find('input').focus().select();
                });
                //冒泡,手动触发
                if (!this.iscurrent) this.setindex();

                window.setTimeout(()=>isvalidate = false, 100);
            },
            closeeditrow(){
                if(!isvalidate)
                {
                    this.editrowing = false;
                    this.editrowindex = -1;
                }

                var l = this.component.rows.length;
                for(var i = this.component.rows.length - 1; i >= 0 ; i --)
                    if(this.component.rows.slice( 0 , i ).concat(this.component.rows.slice(i + 1)).indexOf(this.component.rows[i]) !== -1  || this.component.rows[i] == '')
                    {
                        this.component.rows.splice( i , 1 );
                        this.component.value.splice( i , 1 )
                        if(this.editrowindex != -1)
                        {
                            this.editrowindex --;
                            this.$nextTick(()=>$(this.$el).find(".m-c .row:eq(" + this.editrowindex + ") :text").focus().select())
                        }
                    }
            },
            addrow(){
                if(this.editcelling)
                    this.editcelling = false;
                this.component.rows.push(getMaxItem( this.component.rows , '矩阵行' ));
                this.component.value.push([]);
                //冒泡,手动触发
                if (!this.iscurrent) this.setindex();
            },
            deleterow(index){
                isvalidate = true;
                this.component.rows.splice( index , 1 );
                this.component.value.splice( index , 1 )
                if(this.editrowing)
                    if(this.editrowindex >= this.component.rows.length)
                        this.editrowindex = this.component.rows.length - 1;
                this.$nextTick(()=>{
                    $(this.$el).find("table .row:eq(" + this.editrowindex + ") :text").focus().select();
                     isvalidate = false
                })
            },
            addcell(){
                if(this.editrowing)
                    this.editrowing = false;
                this.component.cells.push(getMaxItem( this.component.cells , '选项' ));
                //冒泡,手动触发
                if (!this.iscurrent) this.setindex();
            },
            deletecell(index){
                isvalidate = true;
                this.component.cells.splice( index , 1 );
                if(this.editcelling)
                    if(this.editcellindex >= this.component.cells.length)
                        this.editcellindex = this.component.cells.length - 1;
                this.$nextTick(()=>{
                    $(this.$el).find("table tr .cell:eq(" + this.editcellindex + ") :text").focus().select();
                    isvalidate = false
                });
            },
            validatecell($event,index){
                isvalidate = true;
                var $parent = $($event.target).parent();
                var $input = $parent.find("input");
                var v = $input.val().trim();
                if(v!=="")
                {
                    if(this.component.cells.slice(0,index).concat(this.component.cells.slice(index + 1)).indexOf(v) !== -1)
                    {
                        if(this.editcellindex + 1 >= this.component.cells.length)
                        {
                            $event.stopPropagation();
                            $event.preventDefault();
                            return false;
                        }
                    }

                    if(this.editcellindex + 1 >= this.component.cells.length && this.component.cells.length < this.component.maxColItems) this.addcell()
                    if(this.component.cells.length <= this.component.maxColItems)
                    {
                        this.editcellindex  += 1;
                        this.$nextTick(()=>$parent.closest("tr").find(".cell:eq("+ (this.editcellindex) +")").find(":text").focus().select())
                    }
                    else
                    {
                        this.editcelling = false;
                        this.editcellindex  = -1;
                    }
                }

                window.setTimeout(function(){
                    isvalidate = false
                },100);

                if($event&&$event.keyCode===9)
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                    return false;
                }
            },
            validaterow($event,index){
                isvalidate = true;
                var $parent = $($event.target).parent();
                var $input = $parent.find("input");
                var v = $input.val().trim();
                if(v!=="")
                {
                    if(this.component.rows.slice(0,index).concat(this.component.rows.slice(index + 1)).indexOf(v) !== -1)
                    {
                        if(this.editrowindex + 1 >= this.component.rows.length)
                        {
                            $event.stopPropagation();
                            $event.preventDefault();
                            return false;
                        }
                    }
                    if(this.editrowindex + 1 >= this.component.rows.length && this.component.rows.length < this.component.maxRowItems) this.addrow()
                    if(this.component.rows.length <= this.component.maxRowItems)
                    {
                        this.editrowindex  += 1;
                        this.$nextTick(()=>$parent.closest("table").find(".row:eq("+ (this.editrowindex) +")").find(":text").focus().select())
                    }
                    else
                    {
                        this.editrowing = false;
                        this.editrowindex  = -1;
                    }
                }

                window.setTimeout(function(){
                    isvalidate = false
                },100);

                if($event&&$event.keyCode===9)
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                    return false;
                }
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.edittitling)
                    this.closetitle();
                if (this.editcelling)
                {
                    isvalidate = false;
                    this.closeeditcell();
                }
                if (this.editrowing)
                {
                    isvalidate = false;
                    this.closeeditrow();
                }
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closetitle();
                this.closeeditcell();
                this.closeeditrow();
            })
        }
}

</script>
