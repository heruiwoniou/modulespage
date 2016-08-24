define(function(){
	function ComsysFileReader(){
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
			if( file.files !== undefined && (file.files[0].size)/1024/1024>10){
				that.deferred.reject("背景图片大小不超过10M!");
				$file.val("");
				return this;
			}
			$form.ajaxSubmit({
				type:'POST',
				url:'/server/uploadimages',
				dataType:'text',
				success:function(retData){
					var ret = JSON.parse(retData);
					if(ret.valid){
						that.deferred.resolve(ret.data);
					}else{
						$(file).val("");
						that.deferred.reject(ret.error);
					}
				},
				error:function(e){
					$(file).val("");
					that.deferred.reject(e.responseText);
				}
			});
			return this;
		}
	}

	return ComsysFileReader;
})