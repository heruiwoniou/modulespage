<template>
	<div class="control-container">
		<control-lib-bar :type="component.type" :majorkey="component.majorkey" :title="component.title" :main-id="component.id"></control-lib-bar>
		<div class="control-content">
			<div class="control-preview GradeQuestion">
                <div class="operate star-panel" v-if="component.xtype==0">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="operate letter-panel" v-if="component.xtype==1">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span>D</span>
                    <span>E</span>
                </div>
                <div class="operate char-panel" v-if="component.xtype==2">
                    <span>优</span>
                    <span>良</span>
                    <span>中</span>
                    <span>及格</span>
                    <span>差</span>
                </div>
                <div class="operate slider-panel" v-if="component.xtype==3">
                    <div class="containment">
                        <div class="arrow">
                            <div class="pointer">
                                <div class="number">0</div>
                            </div>
                        </div>
                        <div class="bar"></div>
                    </div>
                </div>
                <div class="operate choose-panel" v-if="component.xtype==4">
                    <span v-for="n in limitRange">{{n}}</span>
                </div>
                <div class="operate input-panel" v-if="component.xtype==5">
                    <input type="text" onkeyup="this.value=this.value.replace(/\D/g,'')" onafterpaste="this.value=this.value.replace(/\D/g,'')">
                </div>
			</div>
			<p><span>来自</span><b :title="component.from">{{component.from}}</b><i>{{component.used}}次使用</i></p>
		</div>
	</div>
</template>
<script>
	import './common/ControlLibBar'
	export default{
		props:{
			component:{
				type:Object
			}
		},
		computed:{
			limitRange:function(){
				var arr = [];
                for(var i = this.component.range.min ; i <= this.component.range.max ; i++ )
                    arr.push(i);
                return arr;
			}
		}
	}
</script>