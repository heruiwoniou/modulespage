/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame combox
 */

define(
    [
        "jquery",
        'Class',
        "TPLEngine",
        "./TipTextBox"
    ],
    function ($,Class, TPLEngine, TipTextBox) {
        var ClassName = "Control.ButtonTextBox";

        var ButtonTextBox=
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.setting.ButtonClass = this.setting.ButtonClass || "comsys-ButtonTextBox-button-icon";
                    this.$ButtonTextBoxEl = $(args.element);
                    this.ButtonTextBoxRightClickHandler = this.setting.ClickHandler || args.element.onclick || function () { };
                    args.element.onclick = null;
                },
                initialize: function () {

                    var $ElememControl=this.$ButtonTextBoxEl;
                    var oData=this;
                    if(this.$ButtonTextBoxEl.data('Control.TipTextBox')!= undefined||this.$ButtonTextBoxEl.data('Control.TextBox')!= undefined) {
                        oData = this.$ButtonTextBoxEl.data('Control.TextBox')||this.$ButtonTextBoxEl.data('Control.TipTextBox');
                        $ElememControl =
                            oData.$TipTextBoxControl?oData.$TipTextBoxControl:(oData.$TextBoxControl?oData.$TextBoxControl:this.$ButtonTextBoxEl);
                    }


                    if (this.$ButtonTextBoxEl.data(ClassName) == undefined) {
                        this.$ButtonTextBoxController = $(TPLEngine.render(this.TPL.main, this));
                        $ElememControl.parent().append(this.$ButtonTextBoxController);
                        this.$ButtonTextBoxController.find(".comsys-ButtonTextBox-input").append(oData?$ElememControl:this.$ButtonTextBoxEl);
                        this.$ButtonTextBoxController.find(".comsys-ButtonTextBox-button").off(".ButtonTextBoxRightClickHandler").on("click.ButtonTextBoxRightClickHandler", this.ButtonTextBoxRightClickHandler);
                        this.$ButtonTextBoxEl.data(ClassName, this);
                        this.$TipTextBoxEl = this.$ButtonTextBoxEl;
                        this.callParent();
                        this.$ButtonTextBoxController.append(oData.$HiddenBaseElContainer);
                    }

                    return this;
                },
                TPL: {
                    layout: "<div class='comsys-base comsys-ButtonTextBox-layout' id='<%= this.classids%>'>@{layout}@</div>",
                    main: "@{layout:this.TPL.layout,this}@<div class='comsys-ButtonTextBox-input'></div><div class='comsys-ButtonTextBox-button <%=this.setting.ButtonClass%>'></div>"
                }

            }, TipTextBox);

        $.fn.extend({
            ButtonTextBoxInit: function (setting) {
                return this.each(function () {
                    new ButtonTextBox({ element: this, setting: setting }).initialize();
                });
            }
        });

        return ButtonTextBox;

    });