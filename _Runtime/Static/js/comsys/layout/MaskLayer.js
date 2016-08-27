/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame layout MaskLayer
 */


define(
    [
        "comsys/base/Base",
        "./TextCalulate"
    ],
    function(Base, TextCalulate) {
        var ClassName = "MaskLayer";

        var MaskLayer = function(opt, ft) {
            opt = opt || { type: 0 };
            this.c = null; //容器
            this.t = null; //通明遮罩
            this.w = null; //文字
            this.m = null; //图片
            this.f = null; //iframe遮罩
            this.b = null; //内容框
            this.classids = ClassName;
            this.font = ft || { "fontFamily": "宋体,Lucida Grande, Lucida Sans, Arial, sans-serif", "fontSize": "14px" }; //字体
            this.options = {
                loading: opt.loading || MaskLayer.LOADING[typeof opt.type == "number" ? opt.type % MaskLayer.LOADING.length : 0].loading,
                width: opt.width || MaskLayer.LOADING[typeof opt.type == "number" ? opt.type % MaskLayer.LOADING.length : 0].width,
                height: opt.height || MaskLayer.LOADING[typeof opt.type == "number" ? opt.type % MaskLayer.LOADING.length : 0].height,
                color: "black",
                zindex :[950],
                defaultText: typeof opt.defaultText == "string" ? opt.defaultText : MaskLayer.LOADING[typeof opt.type == "number" ? opt.type % MaskLayer.LOADING.length : 0].defaultText
            }
            this.status = false;
            this.debug = opt.debug || false;
            return this.init();
        }

        //默认两种加载配置
        MaskLayer.LOADING = [{
            loading: "data:image/gif;base64,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",
            height: 32,
            width: 32,
            defaultText: "正在加载"
        }, {
            loading: "data:image/gif;base64,R0lGODlhvgAOAOYAAP///8nJyQEaS5OTk4qOknNycyB05zWU6CqC6DiW5g1RwgQtgQg9ihho3hxu0ESe+GOo5Fqx+HDK+G7D+HDK9TOM7ojN74+vzgszbGrF9DOO6AtIqWe99zSO6FOs9xtZkS+I2tTU1BlqzoXL7kGa9hRIc2ar5KWkpLy7vFel66bD1QUoYRdo3il53MTExI/N+2K67Clxs5GbpDuJtgc7ikaZ6onV+JuirRlgqzCJ7YmKiz6X9mfD9i6G65vX9gg7lhJdyKje90RRYpOSkrbj+MrJyZubm4qOkZWUlAEZRoqPkgEUPMnIyAIeVI2RlWFhYQEaSkN9oZKVl5STk8zLy83NzQEWRFVgbQIbTbKysmbC7wMeSbCytD2T6jOB6juO6n3N+E6s4DON7jeV53Cw53eUv0qP5lWZ7a2trkuZ3h92xRNb0TFlmHDC6z+Z5l+l4mWs7YKjy4nA7QQxhwg5fnu9+Vy26UKf0n7A+mqx8AAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQEAAAAACwAAAAAvgAOAAAH/4AAACFGQ0MDiImKi4yNjo+QkZKTlJWWl5iNSEZoVYIAOk8FOkcEpqeoqaqrrK2ur7CxsrO0tbarSk5SUygAJ08XQT4WxMXGFiYQysvMECYjx8fJzc3P0dHT1MvW18bZ2s7Q3cXf2tzjyODb4ujl1NYjbWFcIQUyREFg+vv7GRkJAAMKDCihoMGDEgYqBEihocOHDhcqhEixocSBFSleFJgR4saAHR9+ZOhQy50oKAqoCGIDTMZ/I3l0hPlRZkiaG23OHJlA50uePivivBiU4lCJPrXM+JBypQ2EBjMcmEq1KlUeUKNa3ToVa1atXK16/SpBatiqY7+aPduVbMG1bP/TZoV7Vi6MGSWa+gAzoa/fCRw6dNBAeHDhwR04/F0cGDHhx4cVL2ZsWLBgDZcJS57sNzDkw5gHb+YM2PBn0xpGc/aMOvRl1ZM9Y4aMGvbdvCpfcIjAu7cHBMCDCw/uobdx3r+HK0dQ/Pjx5MuFN3fuO/rw6dQjQLfOPHt17sCxU99uXTzvFDFwq8Dj4YF79yQMyJ9Pf/6O9/jh198v/37+/PHxV59//70XoID2FYjfgQgaQKCCDCL4YIERCjjhe13EgEFKF+RRgxgVhJhDAyQ2wEKJKDbQQwUgghiiiCmeGGMPYrjIYog1VjDiiTKmSCKNNr5444glsiBjjyri+GLujizu6COKLAB545JNPomkijm62CKMVqK44pZCtvDBCijoEEcNLTigpggKtOnmm26KoOacdLIJ550KyEnnng7YieebevI5p59/thmooH0WCiiigyoaJ6NrOmoooyLgQIcVLmRxAxAbMMAADQuEKuqootLg6amogkrqqguYiuqrn7K6qquwnqqqrKXWmiquo9KqKwO85vqrp8GG6iusdGBghRAhAIDCDRg0gYUA1FZr7bXYZqvtttx26+234IYr7rjkZgtFEktc4cInIbjgAhMBxCvvvPTWa++9+Oar77789uvvvwAHbG8RRVDRLACBAAAh+QQEAAAAACwBAAIAvAAKAAAH/4BPF3JkJhAQJiMWi4yNi4aHkZKIio6NkJOSiZaWmJmHm5yXn5qVoo+kkaGnFp6fq6eukW9pIGgycim6uhS9vr++CcLDxMPAx8XJwsfMysnMyM7E0MDS09TB1svYvdpjalEXeSluwjzcGdrm1Onq59jt2u/s6gkZ6PXz0PHW+sz8ysZomPFBXI0xB3hIWMiwoYQMByJKnChRoUOGEClqTHjRYcaNEy12XPgRZESRI0uaRNlRJUiWF11utDOjxAU4NTpwmMCzp88JHDpo6EBUg9GjQnf+7BnUqFCiT6EqXcq0qFOhQ7NOpQoU69WrSblW9XrUqdGtVINCzYr0rFieTf+9WpUKo+aFFF88RNjLt28EDwgCCx4sWK9fvoAJK0Zg+DDixYobO/4LmbBkx4krB758OLNmzn49V9abIkaJOGdSPFjNuvUDEgZiy54te4fr1rBp6zZg+zbu3bp7+16dG3jt4ayLG+eNnPjy482VG+/dJQaGODjFiKlQQTt37TkasGhAXnx58ix6bOfe/Xv48/DRq2/vvfv29+fHw+/Bnn5//PqVFyB/69n3n4AInsdfewba916A+ZFHIIP9ifFghAqy18IHK8RRQwsOhCiiiCIoYOKJKJ4owogslpjiiwqsyGKLML4o44wk1pjijTg64KKOJvKI449ACjkjkTreKAJCDnRscQMQGzAg5ZRS0rDAlVhmiSUNVHZppZZgLsBll2SGCeaYZFJpppZopsnAl2te2WaacMY5J5l1rtkmHRhsIUQgACH5BAQAAAAALAEAAgC8AAoAAAf/gE8qcmQmEIeIiCYjFo2Oj42GiZMQi5CQkpSKjJeYmomWnY+Zn6GikZ+bp46kmqanhm9pIGgycikpCbq7vBS+v8C/vMO9wcHEyMbKyMTKxszDzsfQu9LA1NXWwrpjamwXeSlu0DzaGdi65c7n6OrS7Nju6+gJ8srw1PbG+OTmvGMacJQAV2PMgYMID/KQwLChQwkZEkpMuPBhw4gTJ1a0eDGjRo4OMXpEuBGkyJEHSnI8OVKlRZYHQODAcAFOjQ4dNGjImZPDhJ9Ag07ggBPnzpw7dXbwKRQo0aRGdR5d2lToU6RTjVKt6hSrV6RbuQ4FK7WoUaZiryY9ChUtV6I8/4/KpJniC4K7eBF4iMC3r98IHvIKzrv3b9/AgwcXNnw4sWLGfhE7xrsYsuTJeiE3xny3MuPLeVvMjHPGi4HTqHc8WM269QMSqGPLNqDaNWvYs2fXtn07t27erXH7Tg2893DixV8fR15c+OwGG1bEMdOigXXrPcRU0F6h+/btOa6LH9+gh3ftYtJXCD+eRQP37st3T89dvRj24lnEfy+/vvr57O1HXnncnefdevxdF99+5m2HnoH4kQdff/VB2J517gHxQxNltLCGAiAqIIIDJJZoogMihKjiiiKeaGKKLLI4oosvxigjjTXaqOKMOKKo4449kgjjjy0GOaSN0W1xwz0GP8yxwAI0MCDllFQyQMOTWGaZZZRVTnmllmBC2WWVX4a55ZhVmqkll2haqeaZbbr55pNsolmmmitsIUQgACH5BAQAAAAALAEAAgC8AAoAAAf/gE8qQT4WhhYmEIqLjBAmI4eRkomNjY+Sk5WWkJiZmouXnZGUn46cooakn6GoiKWKrJIjbWFcN0QUubkJvL2+vbrBwhS/xbzDwsbFyMPKv8zJzsDQutLT1MTWCdhad2yDNmAUGdoJPNjk2ufM6dbr0O3S7+zl88jxzvbD+Mr6wjA4SoCTkOGAwYMID/KQwLChQ4IJIxpc+LBhQYkJKVa0iDHjRocXO078yFHkSJIQTR7Q+DEDCBwYVPgAw6GDhps2b+K0yWGCz59AJ9TMSdSm0Z5Bfw7FqVNDh6cdkCZV+tSp0ao5pU4VmtNqUZ5bqRJ1uvOm1qlDr1bVGTWsz5ov/2O+4ICgrt27dj1E2Mu3bwQPeAPX1euXL2DBeAkXNow48eK+hxsPfsxY8mTKfy1fpny4BUwVdbwYGE269OgdD1KrXv2AhOnXp1mvdg3bNGrZs2vbxp1bN+nbvFv7/h08Ne3hwHkfb7BhxQUzLRpIny6dhfQeFcRUyK69e4Uc1BtYp24d+3bu28WAtz4+fHnt6c+nBx9++ngW2MXozy7/e/X61OXXnX7wqQdgfT3Ax9+C/rnX3nX87VeggdMB8UMTZbSwhgIcduihCA6EKOKIDojg4YkfkjiiiSiiCKKKK7boIowxypgijSGyaCOHL+Ko44490vijAs1ZccMGP8yxwDeSTC5JAwNQRiklAzQ0aWWTT04ZZZVXXpmlllt26SWYU4pp5Zdkcmmmk2SGuSabbVJ55QpWCBEIADs=",
            height: 14,
            width: 190,
            defaultText: "正在加载"
        }];

        MaskLayer.prototype = {
            constructor: MaskLayer,
            init: function() {
                var me = this;
                var u = /MSIE (\d*).0/i.exec(window.navigator.appVersion);
                me.LowIE = u != null && ~~u[1] < 8;
                if ($("#" + this.classids).length !== 0) {
                    return $("#" + this.classids).data(ClassName);
                } else {
                    me.layoutCount = 0;
                    me.b = $(document.createElement("div"));
                    me.c = $(document.createElement("div"));
                    me.t = $(document.createElement("div"));
                    me.w = $(document.createElement("span"));
                    me.m = $(document.createElement("img"));
                    me.f = $(document.createElement("iframe"));
                    me.l = $('<div class="progress"><span class="green bar" style="width: 0%;"><span class="txt">0%</span></span></div>').css({ position: "absolute", left: "50%", top: "40%" });
                    me.bar = me.l.find('.bar');
                    me.txt = me.l.find('.txt');
                    me.b.css({ position: "absolute", left: "50%", top: "40%", marginTop: -5, background: "rgba(0,168,255,.3)", borderRadius: "4px", boxShadow: "1px 1px 3px black", filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=3, Direction=135, color=black)" });
                    if (me.LowIE)
                        me.c.css({ width: "100%", height: "100%", display: "none", position: "absolute", left: 0, top: 0, zIndex: 950 });
                    else
                        me.c.css({ width: "100%", height: "100%", display: "none", position: "fixed", left: 0, top: 0, zIndex: 950 });
                    me.t.css({ width: "100%", height: "100%", filter: "alpha(opacity=50)", opacity: 0.5, position: "absolute", background: me.options.color, left: 0, top: 0 });
                    me.w.css({ position: "absolute", left: "50%", top: "40%", marginTop: me.options.height + 5 }).css(me.font);
                    me.m.css({ position: "absolute", left: "50%", top: "40%", marginLeft: -me.options.width / 2 - 2 }).attr({ src: me.options.loading, width: me.options.width, height: me.options.height });
                    me.f.css({ width: "100%", height: "100%", overflow: "hidden", position: "absolute", zIndex: "-2", filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=0)", opacity: 0, left: 0, top: 0 }).attr({ frameborder: 0, scrolling: "no" });

                    me.c.append(me.t);
                    me.c.append(me.f);
                    me.c.append(me.b);
                    me.c.append(me.l);
                    me.c.append(me.m);
                    me.c.append(me.w);
                    me.c.attr("id", this.classids);
                    $(document.body).append(me.c);
                    me.c.bind("mousewheel", function() {
                        return false;
                    });
                    me.c.data(ClassName, this);
                }
                return this;
            },
            bind: function(mousewheel) {
                mousewheel = mousewheel || function() {
                    return false;
                };
                this.onmousewheel = document.body.onmousewheel;
                document.body.onmousewheel = mousewheel;
            },
            unbind: function() {
                document.body.onmousewheel = this.onmousewheel;
            },
            mask: function(mousewheel,zindex) {
                this.status = true;
                var me = this;
                if(zindex !== undefined )
                    me.options.zindex.push(me.options.zindex[0] + zindex);
                me.c.css({zIndex:me.options.zindex[me.options.zindex.length-1] - 1});
                if (++me.layoutCount !== 1) return;
                if (me.LowIE) {
                    if (me.c.attr("scroll-bind") !== "true") {
                        document.body.onscroll = function() {
                            me.c.css({ top: document.body.scrollTop });
                        };
                        me.c.attr("scroll-bind", "true");
                    };
                    $(document.body).css({ overFlow: "hidden" });
                }
                me.l.hide();
                me.m.hide();
                me.b.hide();
                me.w.hide();
                me.c.show().css({zIndex:me.options.zindex[me.options.zindex.length-1] - 1});
                this.bind(mousewheel);
            },
            setprogress: function(percent, src, delay, completeTxt, errorTxt, width, height) {
                var timeoutID = null,
                    me = this,
                    delay = delay || 500,
                    temp = percent,
                    disposeSrc = function(s) {
                        return s + (s.indexOf("?") > -1 ? "&" : "?") + "cache=" + new Date().getTime();
                    },
                    success = function(p) {
                        if (typeof(1 * p) == 'number') {
                            me.bar.css({ width: p + "%" });
                            me.txt.html(p + "%");
                            if (p == 100 || p == "100") {
                                me.setTxt("<b style='color:green'>" + completeTxt + "</b>", width, height);
                                window.setTimeout(function() {
                                    me.deferred.resolve("success");
                                    me.hide('fast');
                                }, 500);
                                window.clearTimeout(timeoutID);
                            } else
                                timeoutID = window.setTimeout(progress, delay)
                        } else
                            me.setTxt("<b style='color:red'>" + errorTxt + "</b>", width, height);
                    },
                    error = function() {
                        me.setTxt("<b style='color:red'>" + errorTxt + "</b>", width, height);
                        window.setTimeout(function() {
                            me.deferred.resolve("success");
                            me.hide('fast');
                        }, 1000);
                        window.clearTimeout(timeoutID);
                    },
                    progress = function() {
                        if (me.debug) {
                            window.setTimeout(function() {
                                temp += 10;
                                me.bar.css({ width: temp + "%" });
                                me.txt.html(temp + "%");
                                if (temp == 100 || temp == "100") {
                                    me.setTxt("<b style='color:green'>" + completeTxt + "</b>", width, height);
                                    window.setTimeout(function() {
                                        me.deferred.resolve("success");
                                        me.hide('fast');
                                    }, 500);
                                    window.clearTimeout(timeoutID);
                                } else
                                    timeoutID = window.setTimeout(progress, delay);
                            }, delay);
                        } else {
                            $.ajax({
                                type: "GET",
                                url: disposeSrc(src),
                                success: success,
                                error: error
                            })
                        }
                    };
                me.bar.css({ width: temp + "%" });
                me.txt.html(temp + "%");
                timeoutID = window.setTimeout(progress, delay);
            },
            upload: function(setting) {
                this.deferred = new $.Deferred();
                this.deferred.promise(this);
                setting = setting || {};
                var me = this;
                this.status = true;
                if (++me.layoutCount !== 1) return;
                if (me.LowIE) {
                    if (me.c.attr("scroll-bind") != "true") {
                        document.body.onscroll = function() {
                            me.c.css({ top: document.body.scrollTop });
                        };
                        me.c.attr("scroll-bind", "true");
                    };
                    $(document.body).css({ overFlow: "hidden" });
                }
                var progressingTxt = setting.txt || "正在上传";
                var completeTxt = setting.complete || "上传成功";
                var error = setting.complete || "服务器错误";
                var width = setting.width || 400,
                    height = setting.height || 20
                me.w.css({ marginTop: height + 5 });
                me.l.css({ marginLeft: -width / 2 - 2, width: width, height: height });
                me.m.hide();
                me.l.show();
                me.b.show();
                me.w.show();
                me.setTxt(progressingTxt, width, height);
                $(me.c).css({ top: me.LowIE ? document.body.scrollTop : 0 }).show();

                this.bind();
                this.setprogress(0, setting.src, setting.delay, completeTxt, error, width, height);
                return this;
            },
            setTxt: function(txt, width, height) {
                var me = this;
                me.w.html(txt);
                //取得文本相对应字体字号的高宽
                var opt = TextCalulate.getOption(txt, me.font);
                me.w.css({ marginLeft: -opt.width / 2 });
                me.b.css({
                    width: opt.width < width + 10 ? width + 10 : opt.width + 10,
                    height: opt.height + height + 15,
                    marginLeft: -(opt.width < width + 10 ? width : opt.width) / 2 - 7
                });
            },
            show: function(txt, setting) {
                var me = this;
                this.status = true;
                if (++me.layoutCount !== 1) return;
                if (me.LowIE) {
                    if (me.c.attr("scroll-bind") != "true") {
                        document.body.onscroll = function() {
                            me.c.css({ top: document.body.scrollTop });
                        };
                        me.c.attr("scroll-bind", "true");
                    };
                    $(document.body).css({ overFlow: "hidden" });
                }
                txt = txt || (setting ? MaskLayer.LOADING[setting.type].defaultText : me.options.defaultText);
                var width = setting ? MaskLayer.LOADING[setting.type].width : me.options.width,
                    height = setting ? MaskLayer.LOADING[setting.type].height : me.options.height,
                    src = setting ? MaskLayer.LOADING[setting.type].loading : me.options.loading;
                me.w.css({ marginTop: height + 5 })
                me.m.css({ marginLeft: -width / 2 - 2 }).attr({ src: src, width: width, height: height });
                me.l.hide();
                me.m.show();
                me.b.show();
                me.w.show();
                if (txt) {
                    me.w.html(txt);
                    //取得文本相对应字体字号的高宽
                    var opt = TextCalulate.getOption(txt, me.font);
                    me.w.css({ marginLeft: -opt.width / 2 });

                    me.b.css({
                        width: opt.width < width + 10 ? width + 10 : opt.width + 10,
                        height: opt.height + height + 15,
                        marginLeft: -(opt.width < width + 10 ? width : opt.width) / 2 - 7
                    });
                    $(me.c).css({ top: me.LowIE ? document.body.scrollTop : 0 }).show();
                } else {
                    me.b.css({ width: width + 10, height: height + 10, marginLeft: -width / 2 - 7 });
                    $(me.c).show();
                }
                this.bind();
            },
            hide: function(animate,zIndex) {
                var me = this;
                if(zIndex!== undefined)
                {
                    if(me.options.zindex[me.options.zindex.length-1]===me.options.zindex[0]+zIndex)
                    {
                        if(me.options.zindex.length > 1)
                            me.options.zindex.pop();
                        me.c.css({zIndex:me.options.zindex[me.options.zindex.length-1]});
                    }else
                    {
                        for(var i = me.options.zindex.length - 1; i >= 0 ; i--)
                        {
                            if(me.options.zindex[i]===me.options.zindex[0]+zIndex)
                            {
                                me.options.zindex.splice(i,1)
                                break;
                            }
                        }
                    }
                }
                else
                {
                    if(me.options.zindex.length > 1)
                        me.options.zindex.pop();
                    me.c.css({zIndex:me.options.zindex[me.options.zindex.length-1]});
                }

                if (--me.layoutCount !== 0) return;
                this.status = false;
                if (animate)
                    $(me.c).fadeOut(animate);
                else
                    $(me.c).hide();
                if (me.LowIE) {
                    $(document.body).css({ overFlow: "auto" });
                }
                this.unbind();
            },
            forcehide: function(animate) {
                this.status = false;
                if (animate)
                    $(this.c).fadeOut(animate);
                else
                    $(this.c).hide();
                if (this.LowIE) {
                    $(document.body).css({ overFlow: "auto" });
                }
                this.layoutCount = 0;
                this.unbind();
            }
        }

        return MaskLayer;
    });
