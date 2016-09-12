/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame combox
 */

define(
    [
        'Class',
        "TPLEngine",
        './baseClass/HiddenBase'
    ],
    function (Class, TPLEngine, HiddenBase) {
        var ClassName = "Control.ButtonTextBox";

        var ButtonTextBox=
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.$ButtonTextBoxEl = $(args.element);
                    this.setting.ButtonClass = this.$ButtonTextBoxEl.attr('cs-button-type') || "";
                    this.setting.location = this.$ButtonTextBoxEl.attr('cs-label-location') || "right";
                },
                initialize: function () {
                    var that = this;
                    if (this.$ButtonTextBoxEl.data(ClassName) == undefined) {
                        this.$ButtonTextBoxController = $(TPLEngine.render(this.TPL.main, this));
                        this.$ButtonTextBoxEl.before(this.$ButtonTextBoxController);
                        this.$ButtonTextBoxController.find(".comsys-ButtonTextBox-input").append(this.$ButtonTextBoxEl);
                        this.$ButtonTextBoxEl.on("focus",function(){
                            that.$ButtonTextBoxController.addClass('focus-outerline')
                        }).on("focusout",function(){
                            that.$ButtonTextBoxController.removeClass('focus-outerline')
                        })
                        this.$ButtonTextBoxEl.data(ClassName, this);
                        this.callParent();
                        this.addPlaceHolder(this.$ButtonTextBoxController);
                    }
                    return this;
                },
                TPL: {
                    layout: "<div class='comsys-base comsys-ButtonTextBox-layout<%=' ' + this.setting.ButtonClass + ' location-'+ this.setting.location%>' id='<%= this.classids%>'>@{layout}@</div>",
                    main: "@{layout:this.TPL.layout,this}@<div class='comsys-ButtonTextBox-input'></div><div class='comsys-ButtonTextBox-button'></div>"
                }

            }, HiddenBase);

        $.fn.extend({
            ButtonTextBoxInit: function (setting) {
                return this.each(function () {
                    new ButtonTextBox({ element: this, setting: setting }).initialize();
                }).removeAttr('cs-control');
            }
        });

        return ButtonTextBox;

    });