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
        "comsys/base/ResizeWindow"
    ],
    function(w,d,rw){
        var DialogBox={
            type:{
                dialog:"dialog",
                window:"window",
                resizewindow:"resizewindow"
            },
            button:{
                "OK":[{text:"确认",command:"sure"}],
                "OKANDCANCEL":[{text:"确认",command:"sure"},{text:"取消",command:"cancel"}]
            },
            icon:{
                info:"info",
                error:"error",
                question:"question",
                talk:"talk"
            },

            _dialog:null,
            _window:null,
            _resizewindow:null,

            show:function(setting){
                var _win;
                setting=setting||{};
                setting.type=setting.type||DialogBox.type.dialog;
                setting.buttons=setting.buttons||DialogBox.button.OK;
                switch (setting.type)
                {
                    case this.type.dialog:
                        setting = {
                            title: setting.title || "消息",
                            content: setting.content || "",
                            ajax: false,
                            width: setting.width || 300,
                            height: setting.height || 130,
                            callback:setting.callback,
                            icon:setting.icon||this.icon.info,
                            buttons:setting.buttons||this.button.OK
                        };
                        (_win=(this._dialog||(this._dialog=new d().initialize()))).show(setting);
                        break;
                    case this.type.window:
                        setting = {
                            title: setting.title || "",
                            src: setting.src || "",
                            ajax: typeof setting.ajax === 'boolean' && setting.ajax === true ? true : false,
                            width: setting.width || 900,
                            height: setting.height || 500,
                            content: setting.content || '',
                            callback:setting.callback
                        };
                        (_win=(this._window||(this._window=new w().initialize()))).show(setting);
                        break;
                    case this.type.resizewindow:
                        setting = {
                            title: setting.title || "",
                            src: setting.src || "",
                            ajax: typeof setting.ajax === 'boolean' && setting.ajax === true ? true : false,
                            width: setting.width || 800,
                            height: setting.height || 600,
                            content: setting.content || '',
                            callback:setting.callback,
                            full:(typeof setting.full=="boolean"?setting.full:false)
                        };
                        (_win=(this._resizewindow||(this._resizewindow=new rw().initialize()))).show(setting);
                        break;
                }
                return _win;
            }
        }

        return DialogBox;
    }
)