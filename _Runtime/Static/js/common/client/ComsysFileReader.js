define(function(){
	function ComsysFileReader(url){
		this.url = window.globalFileReaderUrl || url;
	}
	ComsysFileReader.prototype=
	{
		constructor:ComsysFileReader,
		read:function(file){
			var that=this;
			that.deferred = new $.Deferred();
            that.deferred.promise(that);
            var $file = $(file);

			var $form = $file.closest('form');
			if($file.val() === '') return;
			$form.ajaxSubmit({
				type:'POST',
				url: that.url,//'/server/uploadimages',
				dataType:'text',
				success:function(retData){
					that.deferred.resolve(retData);
				},
				error:function(e){
					$file.val("");
					that.deferred.reject(e.responseText);
				}
			});
			return this;
		}
	}

	return ComsysFileReader;
})