function getCookie(name){
	var c = name+"=";
	var ca = document.cookie.split(";");
	for(var i=0;i<ca.length;i++){
		var c1 = ca[i];
		while(c1.charAt(0)==' ')c1=c1.substring(1);
		if(c1.indexOf(c)!=-1) return c.substring(c.length,c1.length);
	}
	return "";
}
function isIE() {  
    if (!!window.ActiveXObject || "ActiveXObject" in window)  
        return true;  
    else  
        return false;  
} 
function isChrome() {
	return navigator.appVersion.indexOf("Chrome")>0;
}
var doWinJS = true;
if(navigator.appVersion.indexOf("MSIE 9.0")>0||navigator.appVersion.indexOf("MSIE 8.0")>0||navigator.appVersion.indexOf("MSIE 7.0")>0){
	doWinJS=false;
}else{
//	$.cachedScript("/js/winjs/js/ui.min.js");
}

(function($){
	$.getScriptS = function(url, callback, cache) {
		$.ajax({type: 'GET', url: url, success: callback, dataType: 'script', ifModified: true, cache: cache});
	};
})(jQuery);

jQuery.docReady = function(func){
	if(!(navigator.appVersion.indexOf("MSIE 9.0")>0||navigator.appVersion.indexOf("MSIE 8.0")>0||navigator.appVersion.indexOf("MSIE 7.0")>0)){
		$.getScriptS("/js/winjs/js/base.js",function(){$.getScriptS("/js/winjs/js/ui.min.js",function(){$(func);},true);},true)
	}else{
		setTimeout(function(){$(func);},200);
	}
}


