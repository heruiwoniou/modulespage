/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        "jquery",
        'Class',
        './WidgetBase'
    ],function($,Class,WidgetBase){
        return Class("Control.HiddenBase",{
            constructor: function (args) {
                this.callParent(args);
                this.$HiddenBaseElContainer=$("<div class=\"comsys-hidden-container\"></div>");
            },
            initialize: function () {
                this.callParent();
                return this;
            },
            addPlaceHolderBefore:function(){
                if(this.setting.addPlaceHolderBefore) this.setting.addPlaceHolderBefore.call(this);
            },
            addPlaceHolderAfter:function(){
                if(this.setting.addPlaceHolderAfter) this.setting.addPlaceHolderAfter.call(this);
            },
            addPlaceHolder:function(target){
                this.addPlaceHolderBefore();
                target.append(this.$HiddenBaseElContainer);
                this.addPlaceHolderAfter();
            }
        },WidgetBase)
    });