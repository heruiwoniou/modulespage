define(function(){
	function Computed (){ }
	var prototype=Computed.prototype;

	prototype.prefixpath=function(){
		return this.paths + this.index + '-';
	}
	prototype.fullindex=function(){
		return this.paths + this.index;
	}
	prototype.iscurrent=function(){
		return this.fullindex === this.selectindex;
	}
	return new Computed();
})