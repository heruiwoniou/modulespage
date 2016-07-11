define(['vue', 'text!./tableItem.html'], function(Vue, tpl) {
	var computedRowSpan = function( data , c ){
		var n = 1;
		var filterlist = data.filter (function( fo ){ return fo.pId === c.id });
		if ( filterlist.length == 0 ); return n;
		for(var i = 0 ; i < filterlist.length ; i++)
			n += computedRowSpan(data , filterlist[i], deep);
		return n;
	}

    Vue.component('tableItem', {
        template: tpl,
        props:{
        	currentDeep:{
        		type:Number,
        		default: 0
        	},
            self:Boolean,
        	deep:Number,
        	deepWidth:Number,
        	treeData:Array,
        	rateData:Array,
        	rateWidth:Number,
        	model:Object
        },
        computed:{
        	noChildren:function(){
        		return this.gChildren(this.model).length === 0
        	},
        	colspan:function(){
        		var col = ( this.noChildren ? this.deep - this.currentDeep : 0 );
        		col = col === 0 ? 1 : col;
        		return col * this.deepWidth + col - 1;
        	}
        },
        methods:{
        	gChildren:function(node){
        		var that = this;
        		var ret = this.treeData.filter(function(o){
        			return o.pId ==  node.id
        		}).map(function(o){
        			if( o.rowspan === undefined ) o.rowspan = computedRowSpan(that.treeData , o );
        			return o;
        		});

        		return ret;
        	}
        }
    });
});
