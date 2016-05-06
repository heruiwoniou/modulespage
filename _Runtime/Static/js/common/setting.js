/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application setting
*/


define(function() {

    var u = /MSIE (\d*).0|Chrome|Firefox/i.exec(window.navigator.userAgent);

    return {
        layerSetting: {
            type: 0
        },
        LabelSetting: {
            check: function (node) {
                return this.getNode(node) !== undefined;
            },
            get: function (node) {
                node = this.getNode(node);
                if (node.nodeValue && !/^\s*$/.test(node.nodeValue))
                    return node.nodeValue;
                else if (!node.nodeValue && node.nodeName == "SPAN")
                    return node.innerHTML;
                else return "";
            },
            getNode: function (node) {
                if (node === undefined)
                    return undefined;
                else if (node.nodeValue && !/^\s*$/.test(node.nodeValue) || !node.nodeValue && node.nodeName == "SPAN")
                    return node;
                else return node.nextSibling && (node.nextSibling.nodeName == "SPAN" || node.nextSibling.nodeName == "#text") ? arguments.callee(node.nextSibling) : undefined;
            }
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
});