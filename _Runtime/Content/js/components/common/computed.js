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