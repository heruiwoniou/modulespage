define(['vue', 'text!./viewTable.html' , './tableItem'], function(Vue, tpl) {

	var computedRowSpan = function( data , c ){
		var n = 1;
		var filterlist = data.filter (function( fo ){ return fo.pId === c.id });
		if ( filterlist.length == 0 ); return n;
		for(var i = 0 ; i < filterlist.length ; i++)
			n += computedRowSpan(data , filterlist[i], deep);
		return n;
	}

    Vue.component('viewTable', {
        template: tpl,
        data:function(){
        	return {
        		deepWidth:70,
        		rateWidth:80
        	}
        },
        props: {
            self:Boolean,
            treeData: {
            	type:Array,
            	default:function(){ return [] ;}
            },
            rateData: {
            	type:Array,
            	default:function(){ return [] ;}
            }
        },
        computed:{
        	pNode: function(){
        		 return this.treeData.find(function(o){ return o.pId === undefined || o.pId ==='' || o.pId === null ;});
        	},
        	deep : function(){
        		var that = this;
        		var computedDeep = function(data,deep){
					deep = deep || 1;
					var filterdata = that.treeData.filter(function(o){
        				return o.pId == data.id
        			})
        			if(filterdata.length == 0 )
        				return 0;
        			filterdata.forEach(function(o){
        				var d = computedDeep(o,deep + 1);
        				deep = d > deep ? d : deep;
        			});
        			return deep
				}
				return computedDeep(this.pNode);
        	}
        },
        methods:{
        	gIndex:function(i){
        		var arr= ["一","二","三","四","五","六","七","八","九","十"];
        		return arr[i];
        	},
        	gChildren:function(node){
        		var pId = (node ? node.id :this.pNode.id);
        		var that = this;
        		var ret = this.treeData.filter(function(o){
        			return o.pId == pId
        		}).map(function(o){
        			if( o.rowspan === undefined ) o.rowspan = computedRowSpan(that.treeData , o );
        			return o;
        		});

        		return ret;
        	}
        }
    });
})
