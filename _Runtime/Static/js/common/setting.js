/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application setting
*/

(function(factory){

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.commonsetting=factory();
    }

})(function() {

    var u = /MSIE (\d*).0|Chrome|Firefox/i.exec(window.navigator.userAgent);

    return {
        layerSetting: {
            type: 1,
            debug:true
        },
        LabelSetting: {
            set:function(node,text){
                if (node.nodeName == "#text")
                    node.nodeValue = text;
                else if (node.nodeName == "SPAN")
                    node.innerHTML = text;
            },
            get: function (node) {
                node = this.getNode(node);
                if(node == undefined) return "";
                if (node.nodeValue && !/^\s*$/.test(node.nodeValue))
                    return node.nodeValue;
                else if (!node.nodeValue && node.nodeName == "SPAN")
                    return node.innerHTML;
                else return "";
            },
            getNode: function (node) {
                if (node === undefined)
                    return document.createTextNode("");
                else if (node.nodeValue && !/^\s*$/.test(node.nodeValue) || !node.nodeValue && node.nodeName == "SPAN")
                    return node;
                else return node.nextSibling && (node.nextSibling.nodeName == "SPAN" || node.nextSibling.nodeName == "#text") ? arguments.callee(node.nextSibling) : document.createTextNode("");
            }
        },
        Browser:function(){
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera||userAgent.indexOf('Trident')>-1&&userAgent.indexOf('rv:')>-1; //判断是否IE浏览器
            var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
            var isSafari = userAgent.indexOf("Safari") > -1&&userAgent.indexOf("Chrome")==-1&&userAgent.indexOf('Edge')==-1; //判断是否Safari浏览器
            var isChrome=userAgent.indexOf("Chrome") > -1&&userAgent.indexOf('Edge')==-1;
            var isEdge=userAgent.indexOf('Edge')>-1;
            if (isIE) {
                /MSIE (\d+\.\d+);|rv:(\d+\.\d+)/.test(userAgent);
                var IEVersion = parseInt(RegExp.$1||RegExp.$2);
                if(IEVersion) return 'IE' + IEVersion
                else return ''
            }
            if (isFF)
                return "FF";
            if (isOpera)
                return "Opera";
            if (isSafari)
                return "Safari";
            if(isChrome)
                return "Chrome";
            if(isEdge)
                return "Edge"
        },
        Navigator: {
            LowIEOrNoIE: function () {
                return u !== null && ~~u[1] < 8;
            }(),
            IsIE8:function(){
                return u === null ?false:~~u[1] == 8;
            }(),
            IsBackCompat:document.compatMode=="BackCompat"
        }
    }
})
