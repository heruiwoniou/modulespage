define(['text!./template.html'],function(tpl){
	Vue.component('treeNode',{
		template: tpl,
		props:{
			node:Object
		},
		computed:{
			rootNode:function(){
				if(this.node === null) return {}
				return this.node;
			}
		},
		methods:{
			view:function(node){
				return  ( !node.children || node.children.length === 0 );
			},
			toggle:function(e, data){
				var $el = $(e.target).closest('li');
				var $siblings = $el.siblings('li');
				this.$dispatch('before')
				if(!$el.hasClass('open'))
				{
					$siblings.removeClass('open');
					$el.addClass('open');
				}
				$el.find('ul li').removeClass('open');
				this.$dispatch('after', data)
			}
		}
	})
})