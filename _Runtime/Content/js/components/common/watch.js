define(['./util'],function(util){
	return {
		'component.value':function(_new_,_old_){
            var source,tos,ret,that=this;

            source = this.$root.logic.filter(function(o){ return o.from == that.component.id && o.option !== 999 });
            tos = source.map(function(o){ return o.to });

            if(util.isArray(_new_))
                ret = source.filter(function(o){ return _new_.indexOf(o.value.option) !== -1 }).map(function(o){ return o.to });
            else
                ret = source.filter(function(o){ return o.value.option == _new_ }).map(function(o){ return o.to });

            this.$root.$broadcast( 'trigger' , tos , ret , 'choice' );
        },
        'disabled':function(_new_,_old_){
            var source,tos,ret,that=this;
            source = this.$root.logic.filter(function(o){ return o.from == that.component.id && o.option === 999 });
            tos = source.map(function(o){ return  o.to });
            ret = source.filter(function(o){ return o.option === 999 }).map(function(o){ return o.to });
            this.$root.$broadcast( 'trigger' , tos , ret , 'display' ,_new_);
        }
	}
})