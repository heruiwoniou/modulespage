<template>
    <div class="control-static">
        <div :class="['control-item','TabBar',iscurrent?'select':'']" @click.stop="setindex">
            <div class="tab-header">标签</div>
            <div class="tab-body">
                <div class="tab-scroll-left" @mousedown="mousedown($event,1)"></div>
                <div class="tab-content" v-el:tab-content>
                    <div v-for="(index,item) in component.items" class="tab-item-container">
                        <div v-show="!editing||$index!=editindex" class="tab-item" @click.stop="goeditmodel($event,$index)">{{item}}<i @click.stop="removeitem($index)"></i></div>
                        <div v-show="editing&&$index==editindex" class="tab-item" @click.stop="">
                            <input type="text" v-model="item" maxlength="100" @keydown.enter.tab="validate($event,$index)" v-el:new-item>
                        </div>
                    </div>
                    <div v-show="!addnewing" class="tab-item new" @click.stop="goaddmodel"><i></i>添加新标签</div>
                    <div v-show="addnewing" class="tab-item new" @click.stop=""><input type="text" v-model="newcache" maxlength="100" @focusout="closeaddmodel" @keydown.enter.tab="validate($event)" v-el:new-item></div>
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
                this.$nextTick(()=>$($event.target).next().find(":text").focus().select())
                if (!this.iscurrent) this.setindex();
        	},
        	closeeditmodel(){
                if(this.editindex!=-1&&this.editindex<this.component.items.length)
                {
                    var newv=this.component.items[this.editindex].trim();
                    if((newv===''||this.component.items.indexOf(newv)>-1))
                        this.component.items[this.editindex] = this.oldedit;
                }
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
        	validate($event,index){
        		var isedit = index !==undefined;
        		var item = isedit ? this.component.items[index] : this.newcache;
        		var target = isedit ? $($event.target).closest(".tab-item").find("input").get(0):this.$els.newItem;
        		if(target.value.trim()!=="")
        		{
        			if(isedit)
        			{
                        if(this.editindex + 1 < this.component.items.length)
                        {
                            this.goeditmodel({target:$(target).closest('.tab-item-container').next().find('.tab-item:first')},this.editindex + 1)
                        }else
                            this.closeeditmodel();
        			}
        			else
        			{
                        if(this.component.items.indexOf(this.newcache)==-1)
        				    this.component.items.push(this.newcache);
        				this.newcache = '';
        				target.focus();
        			}
        		}
        		else{
        			isedit ? this.closeaddmodel() : this.closeeditmodel();
        		}

        		if($event&&$event.keyCode===9)
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                    return false;
                }
        	},
        	removeitem:function(index){
        		this.component.items.splice(index,1);
        	},
        	setindex : setindex(function() {
                if(this.editing)
                    this.closeeditmodel();
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