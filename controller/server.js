var fs = require('fs');
var Guid = require('./../_Runtime/Static/js/common/core/Guid.js');
var serverController = {
	uploadimages:function(querystring,form,files){
		var that = this;
		fs.readFile(files.file[0].path, function (err, bitmap) {
			if (err) throw err;
			var content = new Buffer(bitmap).toString('base64');
			var data ="data:"+ files.file[0].headers['content-type'] +";base64," + content;
			that.response.writeHead(200, {'Content-Type': 'text/plain'});
			that.response.write(data);
			that.response.end();
		});
	},
	uploadimage2s:function(querystring,form,files){
		var that = this;
		fs.readFile(files.file[0].path, function (err, bitmap) {
			if (err) throw err;
			var content = new Buffer(bitmap);
			var d = new Date();
			var fullname = 'Upload/'
			+ Guid.NewGuid().ToString("N") + '.' + files.file[0].path.split('.').pop();
			fs.writeFile('Runtime/' + fullname, content, function (err) {
				if (err) throw err;
				that.response.writeHead(200, {'Content-Type': 'text/plain'});
				that.response.write(fullname);
				that.response.end();
			});
		});
	}
}

module.exports = serverController;