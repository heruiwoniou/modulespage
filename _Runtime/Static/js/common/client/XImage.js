/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(function(){
    function XImage(src, w, h, loaded, errored) {
        var me = this;
        me.w = w || 0;
        me.h = h || 0;
        me.onloaded = loaded || function () { },
            me.onerrored = errored || function () { },
            me.t = new Image();
        this.re = new Image();
        this.re.csid = (Math.random() * 1e10).toFixed(0);
        this.re.src = this.loadingImageCode;
        me.t.onload = function () {
            me.onload();
            me.onloaded();
        }
        this.t.onerror = function () {
            me.onerror();
            me.onerrored();
        }
        this.t.src = src;
        return this.re;
    };
    XImage.prototype = {
        constructor: XImage,
        loadingImageCode: "data:image/gif;base64,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",
        errorImageCode: "data:image/gif;base64,R0lGODlhUAAZAPIHAL+/v8fHx+Pj4+jo6Ovr6/n5+f7+/v///yH5BAAAAAAALAAAAABQABkAAAPWeLrc/jDKSau9OOvNu/9gKI7kUghBGghF6VKDKgeEBFS3cucOb18EmUJWg/gegGTykPM1e8pnpTAbylpIRrTBO+q+3MXugpqZBdCtNMpeittippw9MVuF2Tl4Lw/zvztdFHYHhD2AYHBjfF5ji14NVFWFk4d6fZeZflp6UhKEhn6Pb0qZbXSOfZANZSp3KSx5o5xxWUepixOSrpQqWJuzpIi0mLV/EjG8REZxW0ylgE6bl7kUQWY0zM+JorVuXLnf37qtK78v6Lrp6+zt7u/w8fLz9PULCQA7",
        /**
         * 重新计算高宽
         * @returns {}
         */
        resize: function () {
            var me = this, img = me.t, ratio = 1, w = img.width, h = img.height, maxWidth = me.w, maxHeight = me.h, wRatio = maxWidth / w, hRatio = maxHeight / h;
            if (maxWidth == 0 && maxHeight == 0) {
                ratio = 1;
            } else if (maxWidth == 0) {
                if (hRatio < 1) ratio = hRatio;
            } else if (maxHeight == 0) {
                if (wRatio < 1) ratio = wRatio;
            } else if (wRatio < 1 || hRatio < 1) {
                ratio = (wRatio <= hRatio ? wRatio : hRatio);
            }
            if (ratio < 1) {
                w = w * ratio;
                h = h * ratio;
            }
            me.re.src = me.t.src;
            me.re.width = w;
            me.re.height = h;
        },
        /**
         * 加载事件
         * @returns {}
         */
        onload: function () {
            var me = this;
            me.t.onload = null;
            me.resize();
            me.t = null;
        },
        /**
         * 错误事件
         * @returns {}
         */
        onerror: function () {
            var me = this;
            me.t.onerror = null;
            var htmlImageElement = new XImage(me.errorImageCode, 0, 0, function () {
                me.re.src = this.re.src;
                me.re.width = this.re.width;
                me.re.height = this.re.height;
            });
        }
    }

    return XImage;
})

