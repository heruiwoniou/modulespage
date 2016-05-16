/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: Application config
 */
var WebApi = {};
define([
    'common/setting',
    'comsys/layout/MaskLayer',
    'widget/Window',
    'widget/TextBox',
    'widget/TipTextBox',
    'widget/CheckBox',
    'widget/RadioBox',
    'widget/SingleCombox',
], function(CommonSetting,MaskLayer,DialogBox) {
    var layer = new MaskLayer(CommonSetting.layerSetting);
    WebApi={
        //图层控制
        showlayer:function(){
            layer.show();
        },
        hidelayer:function(){
            layer.hide();
        },

        //弹出框
        confirm:function(message){
            return DialogBox.show({content:message,buttons:DialogBox.button.OKANDCANCEL,icon:DialogBox.icon.question})
        },
        alert:function(message){
            return DialogBox.show({content:message,buttons:DialogBox.button.OK,icon:DialogBox.icon.info})
        },
        error:function(message){
            return DialogBox.show({content:message,buttons:DialogBox.button.OK,icon:DialogBox.icon.error})
        },

        //弹出窗口
        modal:function(setting){
            return DialogBox.show($.extend({type:'window'},setting)).then(function(state){
                WebApi.initControl();
                return state
            })
        },
        window:function(setting){
            return DialogBox.show($.extend({type:'resizewindow'},setting)).then(function(state){
                WebApi.initControl();
                return state
            })
        },

        //页面调用初始化功能
        initControl:function(parent){
            var $parent=parent?$(parent):$(document);
            $parent.find("input[tip-title]").TipTextBoxInit();
            $parent.find("select").SingleComboxInit();
            $parent.find("input[type='text']").TextBoxInit();
            $parent.find(":radio").RadioBoxInit();
            $parent.find(":checkbox").CheckBoxInit();
        }
    };
    return {
        interface: function(action) {
            if (!action) return;
            $.extend(WebApi, action);
            WebApi.init();
            WebApi.initControl();
        },
        initialize: function() {
            this.load();
        },
        load: function() {
            var scripts = document.getElementsByTagName("script"),
                l = scripts.length,
                main;
            for (var i = 0; i < l; i++)
                if ((main = scripts[i].getAttribute("main"))) break;
            if (!main) return;
            require(["../../Content/js/" + main], this.interface);

        }
    };
});
