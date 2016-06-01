define(function(){
	function ComsysFileReader(){
		if(typeof FileReader != 'undefined')
			this.reader=new FileReader();
		else this.reader = null;
		this.deferred = null;
	}
	ComsysFileReader.prototype=
	{
		constructor:ComsysFileReader,
		read:function(file){

			var that=this;
			that.deferred = new $.Deferred();
            that.deferred.promise(that);
			if(that.reader)
			{
				that.reader.readAsDataURL(file.files[0]);
    			that.reader.onload=function(e){
        			that.deferred.resolve(this.result);
    			}
			}else {

				var $form = $(file).closest('form');
				$form.ajaxSubmit({
					type:'POST',
					url:'http://localhost:8800/Home/base64',
					dataType:'text',
					success:function(base64){
						that.deferred.resolve(base64);
					},
					error:function(e){
						that.deferred.reject(e.responseText);
					}
				});
			}
			return this;
		}
	}

	return ComsysFileReader;
})