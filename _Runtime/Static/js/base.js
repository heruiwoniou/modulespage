var WebApi = {};
define([
    'Content/js/common/util',
    'comsys/layout/MaskLayer',
    'common/setting',
    'widget/Window',
    'Static/js/common/client/WinResizeResponder',

    'css',
    'text',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar',
    'Static/js/libs/jquery.menu/jquery.menu',
    'widget/CheckBox',
    'widget/RadioBox',
    'widget/SingleCombox',
    'widget/ButtonTextBox',
    'widget/DataPicker',
    'widget/ProtoUpload'
], function(util, MaskLayer, CommonSetting, Win, Responder) {
    var layer = new MaskLayer(CommonSetting.layerSetting);
    var concatArg=function(arg,arr){ return [].splice.call(arg,0).concat(arr); }
    $.extend(WebApi, {
        //图层控制
        progress:function(setting){
            layer.upload(setting);
        },
        showlayer:function(text,setting){
            layer.show(text,setting);
        },
        hidelayer:function(){
            layer.hide();
        },

        //弹出框
        __confirm:function(message){
            return Win.show({content:message,buttons:Win.button.OKANDCANCEL,icon:Win.icon.question})
        },
        __alert:function(message){
            return Win.show({content:message,buttons:Win.button.OK,icon:Win.icon.info})
        },
        __error:function(message){
            return Win.show({content:message,buttons:Win.button.OK,icon:Win.icon.error})
        },
        _confirm:function(message){
            self.confirm(message);
        },
        _alert:function(message){
            self.alert(message);
        },
        _error:function(message){
            self.error(message);
        },
        confirm:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi.__confirm.apply(parent,arguments);
        },
        alert:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi.__alert.apply(parent,arguments);
        },
        error:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi.__error.apply(parent,arguments);
        },
        /**
         * [modal 本身frame弹出窗口]
         * @param  {[type]} name    [窗体标识(可选)]
         * @param  {[type]} setting [设置]
         */
        _modal:function(){
            return Win.show.apply(Win,concatArg(arguments,['window']));
        },
        /**
         * [modal 顶级frame弹出窗口(建议使用)]
         * @param  {[type]} name    [窗体标识(可选)]
         * @param  {[type]} setting [设置]
         */
        modal:function(){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi._modal.apply(parent,arguments);
        },
        /**
         * [window 窗口(已同modal一样,弃用)]
         * @param  {[type]} name    [窗体标识(可选)]
         * @param  {[type]} setting [设置]
         */
        _window:function(){
            return Win.show.apply(Win,concatArg(arguments,['resizewindow']));
        },
        window:function(){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi._window.apply(parent,arguments);
        },

        /**
         * [invoke 反射父亲frame的第一个的对象的方法]
         * @param  {[type]} objectName [对象名称]
         * @param  {[type]} action     [方法名称]
         * @return {[type]}            [Promise Object]
         */
        invoke:function(objectName,action){
            var parent=window;
            while(parent!=parent.parent&&parent.WebApi&&!parent.WebApi[objectName])
                parent=parent.parent;
            if(parent.WebApi&&parent.WebApi[objectName]) return parent.WebApi[objectName][action].apply(parent.WebApi,[].slice.call(arguments,2));
        },
        /**
         * [invoke 反射父亲frame的第一个的对象]
         * @param  {[type]} objectName [对象名称]
         * @param  {[type]} action     [方法名称]
         * @return {[type]}            [Promise Object]
         */
        invokeObject:function(objectName)
        {
            var parent=window;
            while(parent!=parent.parent&&parent.WebApi&&!parent.WebApi[objectName]) parent=parent.parent;
            if(parent.WebApi&&parent.WebApi[objectName]) return parent.WebApi[objectName];
        },
        /**
         * [close 关闭弹出窗口(如带name将找到第一个同名的关闭,如不带名称将会关闭所有)]
         * @param  {[type]} setting [description]
         * @return {[type]}         [description]
         */
        close:function(setting){
            setting=setting||{};
            //如果没在当前页面找到相关的内容尝试查找上级
            if(!Win.close(undefined,setting.name,setting.command)&&window.parent&&window.parent.WebApi&&window.parent!=window)
                window.parent.WebApi.close({name:setting.name,command:setting.command});
        },

        setMinHeight:function($control){
            Responder.resize(function(wh){
                $control.css({minHeight:wh - 185 + 'px'})
            })
        }
    }, util);
    return {
        interface: function(action) {
            if (action) {
                $.extend(WebApi, action);
                if (WebApi.init() !== false) util._init_();
            } else util._init_();
        },
        init: function() {
            var scripts = document.getElementsByTagName("script"),
                l = scripts.length,
                main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("data-business"))) break;
            if (main)
                require(["Content/js/modules_business/" + main], this.interface);
            else util._init_();
        }
    }
})