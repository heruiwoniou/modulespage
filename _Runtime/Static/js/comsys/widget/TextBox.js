/**
 * Created by Administrator on 2016/2/17.
 */

/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame TextBox
 */

define(
    [
        "jquery",
        'Core',
        'Class',
        './baseClass/HiddenBase'
    ],
    function ($,Core, Class, HiddenBase) {
        var ClassName = "Control.TextBox";

        var TextBox=Class(ClassName, {
            constructor: function (args) {
                this.callParent(args);
                this.$TextBoxEl = $(args.element);
            },
            initialize: function () {
                var $this = this.$TextBoxEl;
                var elName=$this.get(0).type.toLocaleLowerCase();
                if(elName!="text"&&elName!="password"&&elName!="number") return this;
                if($this.attr("noTextBox")!=undefined) return this;
                if ($this.data(ClassName) == undefined) {
                    this.$TextBoxControl = $('<div class="comsys-base comsys-TextBox"></div>');
                    $this.before(this.$TextBoxControl).appendTo(this.$TextBoxControl);
                    $this.data(ClassName, this);
                    this.callParent();
                    this.addPlaceHolder(this.$TextBoxControl);
                }
                return this;
            }
        }, HiddenBase);

        $.fn.extend({
            TextBoxInit: function () {
                return this.each(function () {
                    new TextBox({element: this}).initialize();
                });
            }
        });

        return TextBox;

    });
