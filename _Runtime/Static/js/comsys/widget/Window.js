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
        var bumper=Bumper.create();
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
                        if (i === 0) return true;
                        if (!n.window.status) {
                            n.window.destory();
                            return false;
                        } else return true;
                    } else {
                        if (i === 0) return true;
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
                var hasClose=false;
                if (type === undefined) {
                    hasClose=this.closeItem(this.type.window, name, command);
                    hasClose=this.closeItem(this.type.resizewindow, name, command);
                } else {
                    hasClose=this.closeItem(type, name, command);
                }
                return hasClose;
            },
            closeItem: function(type, name, command) {
                var hasItem=false;
                var _w = this[type];
                $.each(_w, function() {
                    if (name === undefined) {
                        this.window.close(command);
                        hasItem=true;
                    } else {
                        if (this.name === name)
                        {
                            this.window.close(command);
                            hasItem=true;
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
            show: function() {
                var setting, name;
                if (arguments.length == 2) {
                    name = arguments[0];
                    setting = arguments[1];
                } else if (arguments.length == 1)
                    setting = arguments[0];
                else return;
                var _win;
                setting = setting || {};
                setting.type = setting.type || Win.type.dialog;
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
                        break;
                    case this.type.resizewindow:
                        setting.full =
                            (typeof setting.full == "boolean" ? setting.full : false);
                    case this.type.window:
                        setting.title = setting.title || "";
                        setting.src = setting.src || "";
                        setting.ajax = typeof setting.ajax === 'boolean' && setting.ajax === true ? true : false;
                        setting.width = setting.width || 800;
                        setting.height = setting.height || 600;
                        setting.content = setting.content || '';
                        setting.callback = setting.callback;
                        break;
                }
                _win = this.create(setting.type, name);
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
