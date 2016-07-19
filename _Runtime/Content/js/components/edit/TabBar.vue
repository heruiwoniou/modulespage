<template>
    <div class="control-static">
        <div :class="['control-item','TabBar',iscurrent?'select':'']" @click.stop="setindex">
            <div class="tab-header">标签</div>
            <div class="tab-body">
                <div class="tab-scroll-left" @mousedown="mousedown($event,1)"></div>
                <div class="tab-content" v-el:tab-content>
                    <div v-for="(index,item) in component.items" class="tab-item-container">
                        <div v-show="!editing||$index!=editindex" class="tab-item" @click.stop="goeditmodel($event,$index)">
                            <i @click.stop="removeitem($index)"></i>
                            <div class="text-wrap">{{item}}</div>
                        </div>
                        <div v-show="editing&&$index==editindex" class="tab-item" @click.stop="">
                            <input type="text" v-model="item" maxlength="100" @focusout="validate($event,index)" @keydown.tab.enter="toNext($event , true)">
                        </div>
                    </div>
                    <div v-show="!addnewing" class="tab-item new" @click.stop="goaddmodel"><i></i>添加新标签</div>
                    <div v-show="addnewing" class="tab-item new" @click.stop=""><input type="text" v-model="newcache" maxlength="100" @focusout="validate($event)" @keydown.enter.tab="toNext($event , false)" v-el:new-item></div>
                </div>
                <div class="tab-scroll-right" @mousedown="mousedown($event,-1)"></div>
            </div>
        </div>
    </div>
</template>
<script>
	import setting from './../setting'
	import {
	    fullindex, iscurrent,
	} from './../common/computed';

	import props from './../common/props';

	import {
	    setdefault
	} from './../common/events';

	import {
	    setindex
	} from './../common/methods';

	let scrolltimer=null;

    let editCache = {
        status:false,
        old:''
    }

	export default {
		data () {
			return {
				addnewing:false,
				editing:false,
                oldedit:'',
                editindex:-1,
				newcache:'',
			}
		},
		props:props,
		computed: {
			fullindex,
            iscurrent
        },
        ready(){
        	$(document).on("mouseup",()=>{
        		clearTimeout(scrolltimer)
        		scrolltimer = null;
        	});
        },
        methods:{
        	goaddmodel(){
        		this.addnewing = true;
                this.editing = false;
                this.editindex = -1;
        		this.$nextTick(()=>this.$els.newItem.focus())
                if (!this.iscurrent) this.setindex();
        	},
        	closeaddmodel(){
        		this.addnewing = false;
        		this.newcache = '';
        	},
        	goeditmodel($event,index){
        		this.editing=true;
                this.editindex = index;
                this.oldedit = this.component.items[index];
                this.$nextTick(()=>$($event.target).closest('.tab-item').next().find(":text").focus().select())
                if (!this.iscurrent) this.setindex();
        	},
        	closeeditmodel(){
        		this.editing=false;
                this.oldedit = '';
                this.editindex = -1;
        	},
        	mousedown($event,direction){
        		clearTimeout(scrolltimer)
        		scrolltimer = null;
        		var $content = $(this.$els.tabContent);
        		var scroll = ()=>{
        			$content.scrollLeft( $content.scrollLeft() + direction * 10 );
        			scrolltimer=setTimeout(scroll, 20)
        		};
        		scrolltimer=setTimeout(scroll, 20)
        	},
            toNext(e , isItem){
                editCache.status = true;
                editCache.old = this.oldedit;
                var input = isItem ? $(e.target).closest(".tab-item").find("input").get(0):this.$els.newItem;
                if(isItem)
                {
                    if(this.editindex + 1 < this.component.items.length)
                    {
                        this.goeditmodel({target:$(input).closest('.tab-item-container').next().find('.tab-item:first')},this.editindex + 1);
                    }
                    else
                    {
                        this.closeeditmodel();
                        this.goaddmodel();
                    }
                }else
                {
                    //找到了相同项则清空a
                    var newv = this.newcache.trim();
                    if(newv === '' || this.component.items.indexOf(newv) > -1)
                    {
                        this.newcache = '';
                        input.focus();
                    }
                    else
                    {
                        this.component.items.push(this.newcache);
                        this.newcache = '';
                        input.focus();
                    }
                }
                if(e && e.keyCode===9)
                {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            },
        	validate(e,index){
                var old = editCache.status?editCache.old:this.oldedit;
                var isItem = index !==undefined;
                var input = isItem ? $(e.target).closest(".tab-item").find("input").get(0):this.$els.newItem;

                //如果是编辑选项
                if(isItem)
                {
                    //找到了相同项就返回原来的默认值
                    var newv = this.component.items[index].trim();
                    if( newv==='' || this.component.items.slice(0,index).concat(this.component.items.slice(index +1)).indexOf(newv) > -1)
                    {
                        input.value = old;
                        $(input).trigger('change');
                    }
                }else
                {
                    if(!editCache.status)
                    {
                        //找到了相同项则清空a
                        var newv = this.newcache.trim();
                        if(newv === '' || this.component.items.indexOf(newv) > -1)
                        {
                            this.newcache = '';
                        }
                        else
                        {
                            this.component.items.push(this.newcache);
                            this.newcache = '';
                        }
                    }
                }

                editCache.status = false;
        	},
        	removeitem:function(index){
        		this.component.items.splice(index,1);
        	},
        	setindex : setindex(function() {
                if(this.editing)
                    this.closeeditmodel();
                if(this.addnewing)
                    this.closeaddmodel();
            })
        },
        events: {
            setdefault: setdefault(function() {
            	this.closeaddmodel();
            	this.closeeditmodel();
            })
        }
	}
</script>