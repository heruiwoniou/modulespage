/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        "comsys/base/Window",
        "comsys/base/Dialog",
        "comsys/base/ResizeWindow",
        "common/client/Bumper"
    ],
    function(w, d, rw, Bumper) {
        var bumper = Bumper.create();
        var Win = {
            type: {
                dialog: "dialog",
                window: "window",
                resizewindow: "resizewindow"
            },
            button: {
                "OK": [{ text: "确认", command: "sure" }],
                "OKANDCANCEL": [{ text: "确认", command: "sure" }, { text: "取消", command: "cancel" }]
            },
            icon: {
                info: "info",
                error: "error",
                question: "question",
                talk: "talk"
            },
            _dialog: d,
            _window: w,
            _resizewindow: rw,
            dialog: [],
            window: [],
            resizewindow: [],
            maxindex:0,
            otherZIndexLength:0,
            resetindex: function() {
                var me = this,current = this.setting.zindex,max = current,i,c
                for (i = 0; i < Win.window.length; i++) {
                    c = Win.window[i].window;
                    if(max < c.setting.zindex) max = c.setting.zindex;
                }
                for (i = 0; i < Win.dialog.length; i++) {
                    c = Win.dialog[i].window;
                    if(max < c.setting.zindex) max = c.setting.zindex;
                }
                for (i = 0; i < Win.resizewindow.length; i++) {
                    c = Win.resizewindow[i].window;
                    if(max < c.setting.zindex) max = c.setting.zindex;
                }
                Win.maxindex=max + 1;
                this.setindex(max + 1);
            },
            getZIndex:function(){
                return 2 * ( this.window.length + this.resizewindow.length + this.dialog.length + this.otherZIndexLength);
            },
            clear: function(type, name) {
                if (type === undefined) {
                    this.clearItem(this.type.window, name);
                    this.clearItem(this.type.resizewindow, name);
                } else {
                    this.clearItem(type, name);
                }
            },
            clearItem: function(type, name) {
                var _w = this[type];
                this[type] = $.grep(_w, function(n, i) {
                    if (name === undefined) {
                        if (!n.window.status) {
                            n.window.destory();
                            return false;
                        } else return true;
                    } else {
                        if (n.name === name) {
                            n.window.destory();
                            return false;
                        }
                        return true;
                    }
                });
            },
            /**
             * 关闭窗体
             * @param  {[type]} type    [关闭的类型]
             * @param  {[type]} name    [窗体名称]
             * @param  {[type]} command [关闭动作名称]
             * @return {[type]}         [如果没有关闭到窗体返回false]
             */
            close: function(type, name, command) {
                var hasClose = false;
                if (type === undefined) {
                    hasClose = this.closeItem(this.type.window, name, command);
                    hasClose = this.closeItem(this.type.resizewindow, name, command);
                } else {
                    hasClose = this.closeItem(type, name, command);
                }
                return hasClose;
            },
            closeItem: function(type, name, command) {
                var hasItem = false;
                var _w = this[type];
                $.each(_w, function() {
                    if (name === undefined) {
                        this.window.close(command);
                        hasItem = true;
                    } else {
                        if (this.name === name) {
                            this.window.close(command);
                            hasItem = true;
                        }
                    }
                });
                return hasItem;
            },
            create: function(type, name) {
                name = name || "unname";
                var _w = this[type];
                if (_w.length == 0 || _w.length != 0 && _w[0].window.status)
                    _w.push({ name: name, window: new this['_' + type]().initialize() });
                return _w[_w.length - 1].window;
            },
            /**
             * [show description]
             * @param  {[type]} name    [description]
             * @param  {[type]} setting [description]
             * @param  {[type]} type    [description]
             *
             * @param  {[type]} setting [description]
             * @param  {[type]} type    [description]
             *
             * @param  {[type]} setting [description]
             */
            show: function() {
                var setting, name = '',
                    type, $win = $(window),
                    maxheight = $win.height() - 20,
                    maxwidth = $win.width() - 40;
                if (arguments.length == 3) {
                    name = arguments[0];
                    setting = arguments[1];
                    type = arguments[2];
                } else if (arguments.length == 2) {
                    setting = arguments[0];
                    type = arguments[1];
                } else if (arguments.length == 1) {
                    setting = arguments[0];
                    type = Win.type.dialog;
                } else return;
                var _win;
                setting = setting || {};
                setting.type = type;
                setting.buttons = setting.buttons || Win.button.OK;
                switch (setting.type) {
                    case this.type.dialog:
                        setting.title = setting.title || "消息";
                        setting.content = setting.content || "";
                        setting.ajax = false;
                        setting.width = setting.width || 300;
                        setting.height = setting.height || 130;
                        setting.callback = setting.callback;
                        setting.icon = setting.icon || this.icon.info;
                        setting.buttons = setting.buttons || this.button.OK;
                        setting.maxHeight = setting.maxHeight || maxheight;
                        break;
                    case this.type.resizewindow:
                        setting.full =
                            (typeof setting.full == "boolean" ? setting.full : false);
                    case this.type.window:
                        setting.title = setting.title || "";
                        setting.src = setting.src || "";
                        setting.ajax = typeof setting.ajax === 'boolean' && setting.ajax === true ? true : false;
                        setting.width = setting.width || maxwidth;
                        setting.height = setting.height || maxheight;
                        setting.content = setting.content || '';
                        setting.callback = setting.callback;
                        setting.maxHeight = setting.maxHeight || setting.height;
                        break;
                }
                _win = this.create(setting.type, name);
                setting.zindex = this.getZIndex();
                Win.maxindex = setting.zindex;
                //setting.headmousedown=this.resetindex;
                _win.show(setting);
                _win.then(
                    function(_type_) {
                        return function(state) {
                            bumper.trigger(function() {
                                Win.clear(_type_, undefined, false);
                            });
                            return state;
                        }
                    }(setting.type)
                );
                return _win;
            }
        }

        return Win;
    }
)
