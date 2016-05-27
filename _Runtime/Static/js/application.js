/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application config
 */
var WebApi = {};
define([
    'jquery',
    'common/setting',
    'comsys/layout/MaskLayer',
    'widget/Window',
    '../../Content/js/util/common',
    'common/client/XImage',
    'common/client/Sync',

    //缓存内容
    'vue',
    'widget/TextBox',
    'widget/TipTextBox',
    'widget/ButtonTextBox',
    'widget/CheckBox',
    'widget/RadioBox',
    'widget/SingleCombox',
    'widget/MulCombox',
    'libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function($,CommonSetting,MaskLayer,Win,common,XImage,Sync) {
    var layer = new MaskLayer(CommonSetting.layerSetting);
    var concatArg=function(arg,arr){ return [].splice.call(arg,0).concat(arr); }
    $.extend(WebApi,{
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
        _confirm:function(message){
            return Win.show({content:message,buttons:Win.button.OKANDCANCEL,icon:Win.icon.question})
        },
        _alert:function(message){
            return Win.show({content:message,buttons:Win.button.OK,icon:Win.icon.info})
        },
        _error:function(message){
            return Win.show({content:message,buttons:Win.button.OK,icon:Win.icon.error})
        },
        confirm:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi._confirm.apply(parent,arguments);
        },
        alert:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi._alert.apply(parent,arguments);
        },
        error:function(message){
            var parent=window.parent
            while(parent!=window.parent) parent=parent.parent
            return parent.WebApi._error.apply(parent,arguments);
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
            return Win.show.apply(Win,concatArg(arguments,['window']));
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


        initControl: function(parent) {
            var $parent = parent ? $(parent) : $(document);
            $parent.find("input[tip-title]").TipTextBoxInit();
            $parent.find("select").SingleComboxInit();
            $parent.find("input[type='text']").TextBoxInit();
            $parent.find(":radio").RadioBoxInit();
            $parent.find(":checkbox").CheckBoxInit();
        },
        imageViewerInit: function() {
            Sync.ClearAsync("ImageLoad");
            $("div.imageViewer[bind-width][bind-height][bind-src]").each(function(i) {
                var $this = $(this);
                Sync.SetAsync(function() {
                    var width = $this.attr("bind-width"),
                        height = $this.attr("bind-height"),
                        src = $this.attr("bind-src"),
                        after = function() { $(this.re).fadeIn() },
                        before = function() { $(this.re).hide() };
                    $this.css({ lineHeight: height + "px" }).removeAttr("bind-width").removeAttr("bind-height").removeAttr("bind-src")
                        .prepend(new XImage(src, width, height, after, after, before, before));
                }, "ImageLoad", i * 50)
            })
        }
    },common);

    return {
        interface: function(action) {
            if (action)
            {
                $.extend(WebApi, action);
                if(WebApi.init()!== false) common.init();
            } else common.init();
        },
        initialize: function() {
            var browser=CommonSetting.Browser();
            document.getElementsByTagName('HTML').item(0).className=browser;
            this.load();
        },
        load: function() {
            var scripts = document.getElementsByTagName("script"),
                l = scripts.length,
                main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("main"))) break;
            if (main)
                require(["../../Content/js/" + main], this.interface);
            else common.init();
        }
    };
});
