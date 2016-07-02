define(function(){
	function Computed (){ }
	Computed.prototype =
	{
		constructor:Computed,
		prefixpath:function(){
			return this.paths + this.index + '-';
		},
		fullindex:function(){
			return this.paths + this.index;
		},
		iscurrent:function(){
			return this.fullindex === this.selectindex;
		},
		isNextAccept:function(){
			if(this.selectindex==='') return false;
			var reg = (new RegExp("^("+ this.paths + ')(\\d*)$','i')).exec(this.selectindex);
			return reg ? (new RegExp('^' + this.paths + (~~reg[2] + 1))).test(this.fullindex) : false ;
		},
		colorPanel:function(){
            return {
                background:this.component.color
            }
         },
        styleExport:function(){
            return {
            	fontWeight:this.component.bold?"bold":"normal",
                color:this.component.color
            }
        }
	}
	return new Computed();
})