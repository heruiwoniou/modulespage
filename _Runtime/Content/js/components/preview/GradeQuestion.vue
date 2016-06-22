<template>
    <div :class="['GradeQuestion',disabled?'gray':'']">
        <h1 :style="styleExport" ><span class="qindex">Q{{component.qindex}}:</span>{{ component.title }}</h1>
        <div class="operate star-panel" v-if="component.xtype==0">
            <span :class="[select == 4 || component.value == 5 ? 'select':'']" @click="setStar(4)"></span>
            <span :class="[select == 3 || component.value == 4 ? 'select':'']" @click="setStar(3)"></span>
            <span :class="[select == 2 || component.value == 3 ? 'select':'']" @click="setStar(2)"></span>
            <span :class="[select == 1 || component.value == 2 ? 'select':'']" @click="setStar(1)"></span>
            <span :class="[select == 0 || component.value == 1 ? 'select':'']" @click="setStar(0)"></span>
        </div>
        <div class="operate letter-panel" v-if="component.xtype==1">
            <span :class="[select == 0 || component.value == 'A' ? 'select' : '']" @click="setLetter(0,'A')">A</span>
            <span :class="[select == 1 || component.value == 'B' ? 'select' : '']" @click="setLetter(1,'B')">B</span>
            <span :class="[select == 2 || component.value == 'C' ? 'select' : '']" @click="setLetter(2,'C')">C</span>
            <span :class="[select == 3 || component.value == 'D' ? 'select' : '']" @click="setLetter(3,'D')">D</span>
            <span :class="[select == 4 || component.value == 'E' ? 'select' : '']" @click="setLetter(4,'E')">E</span>
        </div>
        <div class="operate char-panel" v-if="component.xtype==2">
            <span :class="[select == 0  || component.value == '优' ? 'select' : '']" @click="setChar(0,'优')">优</span>
            <span :class="[select == 1  || component.value == '良' ? 'select' : '']" @click="setChar(1,'良')">良</span>
            <span :class="[select == 2  || component.value == '中' ? 'select' : '']" @click="setChar(2,'中')">中</span>
            <span :class="[select == 3  || component.value == '及格' ? 'select' : '']" @click="setChar(3,'及格')">及格</span>
            <span :class="[select == 4  || component.value == '差' ? 'select' : '']" @click="setChar(4,'差')">差</span>
        </div>
        <div class="operate slider-panel" v-if="component.xtype==3">
            <div class="containment">
                <div class="arrow" v-el:arraw>
                    <div class="pointer">
                        <div class="number">{{ component.value }}</div>
                    </div>
                </div>
                <div class="bar"></div>
            </div>
        </div>
        <div class="operate choose-panel" v-if="component.xtype==4">
            <template v-for="n in limitRange">
                <span :class="[select === n || component.value === n ? 'select' : '']" @click="setChoose(n)">{{n}}</span>
            </template>
        </div>
        <div class="operate input-panel" v-if="component.xtype==5">
            <input type="text" :disabled="disabled" v-model="component.value" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')" number lazy>
        </div>
        <input type="hidden" :name="component.id" :value="component.value">
    </div>
</template>
<script>
    import props from './../common/props';
    import { styleExport } from './../common/computed';
    import { trigger } from './../common/events';
    export default {
        data() {
            return {
                disabled : false,

                select : -1,
            }
        },
        props: props,
        computed:{
            styleExport,
            limitRange:function(){
                var arr = [];
                for(var i = this.component.range.min ; i <= this.component.range.max ; i++ )
                    arr.push(i);
                return arr;
            }
        },
        ready(){
            var that = this;
            if(this.component.xtype == 3)
            {
                //this.component.value = this.component.value == 0 || this.component.value == '' ? this.component.range.min : this.component.value;
                $(this.$el).find(".arrow").draggable(
                    {
                        axis : "x",
                        containment : ".containment",
                        grid : [ 300.00 / (this.component.range.max - this.component.range.min) , 0 ],
                        drag( event, {helper , position ,offset } ){
                            if(that.disabled) return false;
                            that.component.value = that.component.range.min + position.left * (that.component.range.max - that.component.range.min) / 300
                        },
                        create(event){
                            $(that.$els.arraw).css({left: (that.component.value - that.component.range.min) * 300 / (that.component.range.max - that.component.range.min) + 'px'})
                        }
                    })
            }
            if(this.component.xtype == 5)
            {
                this.$watch("component.value",(_new_, _old_)=>{
                    if(_new_>this.component.range.max||_new_<this.component.range.min) this.component.value = _old_;
                })
            }

            this.disabled = this.$root.logic.filter(o=>o.to == this.component.id).length !== 0;
        },
        methods:{
            setStar(index){
                if(this.disabled) return;
                this.select = index;
                this.component.value = (index + 1)
            },
            setLetter(index,letter){
                if(this.disabled) return;
                 this.select = index;
                 this.component.value = letter
            },
            setChar(index,char){
                if(this.disabled) return;
                 this.select = index;
                 this.component.value = char
            },
            setChoose(index)
            {
                if(this.disabled) return;
                this.select = index;
                this.component.value = index
            }
        },
        watch:{
            'disabled':function(_new_,_old_){
                var source,tos,ret;
                source = this.$root.logic.filter(o=>o.from == this.component.id && o.option === 999);
                tos = source.map(o=>{ return o.to });
                ret = source.filter(o=>o.option == '999').map(o=>{ return o.to });
                this.$root.$broadcast( 'trigger' , tos , ret , 'display' ,_new_);
            }
        },
        events:{
            trigger
        }
    }
</script>