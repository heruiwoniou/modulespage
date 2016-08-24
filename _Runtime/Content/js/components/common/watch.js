define(['./util'],function(util){
	return {
		'component.value':function(_new_,_old_){
            if(!this.doing) return;
            var that = this;
            var ret ;
            var source = this.$root.logic.filter(function(o){ return o.from == that.component.id && o.option !== 999 });
            if(util.isArray(_new_))
                ret = source.filter(function(o){ return _new_.indexOf(o.value.option) !== -1 })
            else
                ret = source.filter(function(o){ return o.value.option == _new_ });
            var min = 999;
            var max = 0;
            var limitStart = that.$root.questions.find(function(o){ return o.id == that.component.id });
            var limitEnd = null;
            var limitMaxEnd = null;

            ret.forEach(function(re){
                var item ;
                if((item = that.$root.questions.find(function(o){ return o.id == re.to ;})) !== undefined && item.qindex < min)
                {
                    min = item.qindex ;
                    limitEnd = item ;
                }
                if(item.qindex > max)
                {
                    max = item.qindex ;
                    limitMaxEnd = item;
                }
            });
            this.$root.$emit( 'tofilter' , limitStart , limitEnd , limitMaxEnd );
            this.$emit( 'toValidator' );
        }
	}
})