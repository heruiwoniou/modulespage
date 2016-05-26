define(function(){
	function Computed (){ }
	var prototype=Computed.prototype;

	prototype.prefixpath=function(){
		return this.paths + this.index + '-';
	}
	return new Computed();
})