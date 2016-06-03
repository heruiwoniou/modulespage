var fs=require('fs');
var serverController = {
	base64:function(querystring,form,files){
		var that = this;
		fs.readFile(files.file[0].path, function (err, bitmap) {
			if (err) throw err;
			var content = new Buffer(bitmap).toString('base64');
			var data ="data:"+ files.file[0].headers['content-type'] +";base64," + content;
			that.response.writeHead(200, {'Content-Type': 'text/plain'});
			that.response.write(data);
			that.response.end();
		});
	}
}

module.exports = serverController;