<template>
    <div class="control" data-index="{{paths + index}}">
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
                <div class="images-container">
                    <template v-for="item in component.items">
                        <div class="image item"  @click.stop="edititem($index,$event)">
                            <label v-show = "edititemindex!==$index">
                                <div class="imageViewer">
                                    <img :src="item.image" alt="" :wdth="item.w" :height="item.h">
                                </div>
                                <input type="{{component.single?'radio':'checkbox'}}" :name="component.id" :value="item.text"><div class="span-text">{{item.text}}</div>
                            </label>
                            <div class="edit-item" v-show = "edititeming&&edititemindex==$index" @click.stop="">
                                <div class="cmd">
                                    <div class="toleft" v-if = "$index !== 0" @click.stop="toleftitem($index)">向左</div>
                                    <div class="close" @click.stop="removeitem($index)">移除</div>
                                    <div class="toright" v-if = "$index !== component.items.length - 1" @click.stop="torightitem($index)">向右</div>
                                </div>
                                <div class="imageViewer">
                                    <b v-if="item.image===''"></b>
                                    <img v-else :src="item.image" :width="item.w" :height="item.h" v-el:image alt="">
                                </div>
                                <form enctype="multipart/form-data" method="POST">
                                    <input type="file" name="file" @change="fileschange($event,$index)" @keydown.enter="validate($event,$index)" @keydown.tab="validate($event,$index)">
                                </form>
                                <input type="text" v-model="item.text" :maxlength="component.itemWordLength" @keydown.enter="validate($event,$index)" @keydown.tab="validate($event,$index)">
                            </div>
                        </div>
                    </template>
                    <div class="image add" v-show="!editcacheiteming&&component.items.length < component.maxItems" @click.stop="editcacheitem">
                        <div class="imageViewer">
                            <b v-if="itemcache.image===''"></b>
                            <img v-else :src="itemcache.image" alt="" :width="itemcache.w" :height="itemcache.h">
                        </div>
                         <div class="span-text">{{itemcache.text || itemtip}}</div>
                    </div>
                    <div class="image add edit-item" v-show="editcacheiteming&&component.items.length < component.maxItems" @click.stop="">
                        <div class="imageViewer">
                            <b v-show="itemcache.image===''"></b>
                            <img v-show="itemcache.image!==''" :src="itemcache.image" :width="itemcache.w" :height="itemcache.h" v-el:item-image alt="">
                        </div>
                        <form enctype="multipart/form-data" method="POST">
                            <input type="file" v-el:file @change="fileschange($event)" name="file" @keydown.enter="validate($event)" @keydown.tab="validate($event)">
                        </form>
                        <input type="text" v-model="itemcache.text" :maxlength="component.itemWordLength" @keydown.enter="validate($event)" @keydown.tab="validate($event)" v-el:item-text>
                    </div>
                </div>
            </div>
        </div>
        <Accept :index="paths + ( index + 1 )" :isnextaccept="isNextAccept"></Accept>
    </div>
</template>

<script>
    import ComsysFileReader from './../common/filereader';

    import XImage from 'common/client/XImage';

    import Bumper from 'common/client/Bumper';

    import './../common/transition/fadeInOut';

    import props from './../common/props';
    import {
        setindex, removecontrol, showColorPicker, setBold, setMust, resize
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

    var filereader=new ComsysFileReader();

    var bumper = Bumper.create();

    export default {
        data() {
            return {
                titletip: '标题(点击编辑)',
                itemtip: '添加选项(点击编辑)',
                edittitling: false,
                editcacheiteming: false,
                edititeming:false,
                edititemindex:-1,
                itemcache:{
                    text:"",
                    image:"",
                    w:"",
                    h:""
                },
                items:{},

                oldedit:''
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
            componentwatch:function(type,index){
                switch (type) {
                    case 'edit':
                        this.$root.logic.filter(o => o.from == this.component.id && o.option !== 999 && index === o.option).forEach(o => o.value.option = this.component.items[index].text);
                        break;
                    case 'remove':
                        for(var i = this.$root.logic.length - 1 ; i >= 0 ; i -- )
                        {
                            var logic = this.$root.logic[i];
                            if(logic.from == this.component.id && logic.option == index)
                                this.$root.logic.splice( i , 1 );
                            if(logic.from == this.component.id && logic.option > index)
                                logic.option -- ;
                        }
                        break;
                    case 'left':
                        for(var i = this.$root.logic.length - 1 ; i >= 0 ; i -- )
                        {
                            var logic = this.$root.logic[i];
                            if(logic.from == this.component.id && logic.option == index);
                                logic.option --;
                            if(logic.from == this.component.id && logic.option == index - 1);
                                logic.option ++;
                        }
                        break;
                    case 'right':
                        for(var i = this.$root.logic.length - 1 ; i >= 0 ; i -- )
                        {
                            var logic = this.$root.logic[i];
                            if(logic.from == this.component.id && logic.option == index);
                                logic.option ++;
                            if(logic.from == this.component.id && logic.option == index + 1);
                                logic.option --;
                        }
                        break;
                    default:
                        // statements_def
                        break;
                }
            },
            setmodel(issingle) {
                this.component.single = issingle;
            },
            resize,
            fileschange($event,index){
                var that=this;
                var itemedit = index !== undefined;
                var $parent = $($event.target).closest(".edit-item");
                var targetImage = itemedit ? $parent.find("img").get(0):that.$els.itemImage
                var targetItem = itemedit?that.component.items[index]:that.itemcache;
                filereader.read($event.target).then(function(image){
                    that.resize( image , 134 , 134 ).then((w,h)=>{
                        targetItem.image = image;
                        targetItem.w = w;
                        targetItem.h = h;
                        that.validate({target:$parent });
                    }).fail(function(){
                        targetItem.image = XImage.prototype.errorImageCode
                        targetItem.w = 80;
                        targetItem.h = 25;
                    });
                }).fail(function(message){
                    WebApi.alert(message);
                });
            },
            edititem(index,$event){
                this.edititemindex = index;
                this.edititeming = true;
                this.edittitling = false;
                this.editcacheiteming = false;
                this.oldedit = this.component.items[index].text;
                this.$nextTick(() => {
                    $($event.target).closest(".item").find(":text").focus().select();
                })
                if (!this.iscurrent) this.setindex();
            },
            closeitem() {
                this.componentwatch('edit',this.edititemindex);
                this.oldedit = '';
                this.edititeming = false;
                this.edititemindex = -1;
            },
            edittitle() {
                this.edititeming = false;
                this.edititemindex = -1;
                this.edittitling = true;
                this.editcacheiteming = false;
                this.$nextTick(() => {
                    this.$els.titleInput.focus();
                    this.$els.titleInput.select();
                })
                if (!this.iscurrent) this.setindex();
            },
            closetitle() {
                this.edittitling = false;
            },
            editcacheitem(){
                this.edititeming = false;
                this.edititemindex = -1;
                if(this.component.items.length < this.component.maxItems){
                    this.edittitling = false;
                    this.editcacheiteming = true;
                    this.$nextTick(() => {
                        this.$els.itemText.focus();
                    })
                }
                if (!this.iscurrent) this.setindex();
            },
            closecacheitem(){
                this.validate({target:$(this.$el).find('.add.edit-item')});
                this.editcacheiteming = false;
            },
            validate:function($event,index){
                if(!this.edititeming&&!this.editcacheiteming) return;
                var edititem = index !== undefined;
                var $parent = $($event.target).closest(".edit-item");
                var file=$parent.find(":file");
                var itemText=$parent.find(":text");
                var targetViewModel = edititem ? this.component.items[index] : this.itemcache
                if(targetViewModel.image!==''&&targetViewModel.text!=='')
                {
                    if(edititem)
                    {
                        if( targetViewModel.text === '' || this.component.items.slice(0,index).concat(this.component.items.slice(index +1)).filter(o=>o.text === targetViewModel.text).length > 0)
                        {
                            itemText.val(this.oldedit);
                            itemText.trigger('change');
                        }
                        if(this.edititemindex + 1 < this.component.items.length)
                        {
                            this.componentwatch('edit',this.edititemindex);
                            this.edititemindex += 1;
                            this.oldedit = this.component.items[this.edititemindex].text;
                            this.$nextTick(()=>$parent.closest(".images-container").find(".item:eq("+ this.edititemindex +")").find(":text").focus().select())
                        }
                        else
                        {
                            this.componentwatch('edit',this.edititemindex);
                            this.editcacheitem()
                        }

                        this.component.items[index].text = this.component.items[index].text.replace(/\|/g,'｜');
                    }
                    else
                    {
                        this.component.items.push({
                            text : targetViewModel.text.replace(/\|/g,'｜'),
                            image: targetViewModel.image,
                            w    : targetViewModel.w,h:targetViewModel.h
                        });
                        this.componentwatch('edit',this.component.items.length - 1);
                        this.$nextTick(()=>this.clear())
                    }
                }
                else if(targetViewModel.image===''&&targetViewModel.text!=='')
                {
                    if( this.component.items.filter(o => o.text === targetViewModel.text).length > 0 )
                    {
                        itemText.val(this.oldedit);
                        itemText.trigger('change');
                    }else
                    {
                        file.click();
                    }
                }
                else if(targetViewModel.image!==''&&targetViewModel.text==='')
                    itemText.focus();

                if($event&&$event.keyCode===9)
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                    return false;
                }
            },
            clear:function(){
                this.itemcache.text="";
                this.itemcache.image="";
                this.itemcache.w = "";
                this.itemcache.h = "";
                this.$nextTick(()=>this.$els.itemText.focus())
            },
            removeitem(index){
                this.component.items.splice(index,1);
                this.componentwatch('remove',index);
                if(this.edititemindex >= this.component.items.length)
                    this.closeitem();
            },
            toleftitem(index){
                var t = this.component.items.splice(index , 1);
                this.edititemindex -- ;
                this.component.items.splice(index - 1 , 0 , t[0] );
                this.$nextTick(()=>$(this.$el).find(".item:eq("+ this.edititemindex +")").find(":text").focus().select());
                this.componentwatch('left',index);
            },
            torightitem(index){
                var t = this.component.items.splice(index , 1);
                this.edititemindex ++;
                this.component.items.splice(index , 0 , t[0] );
                this.$nextTick(()=>$(this.$el).find(".item:eq("+ this.edititemindex +")").find(":text").focus().select());
                this.componentwatch('right',index);
            },
            //移除控件
            removecontrol,
            //设置是否当前选择项及取消编辑
            setindex: setindex(function() {
                if (this.edittitling)
                    this.closetitle();
                if (this.editcacheiteming)
                    this.closecacheitem();
                if (this.edititeming)
                    this.closeitem();
            })
        },
        events: {
            setdefault: setdefault(function() {
                this.closetitle();
                this.closecacheitem();
                this.closeitem();
            })
        }
    }

</script>
