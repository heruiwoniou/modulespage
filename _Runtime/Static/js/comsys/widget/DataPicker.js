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
        "./ButtonTextBox",
        "Static/js/libs/wdate.picker/WdatePicker"
    ],
    function ($,Class, TPLEngine, ButtonTextBox) {
        var ClassName = "Control.DataPicker";

        var DataPicker=
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                },
                initialize: function () {
                    var that = this;
                    this.callParent();
                    this.$BaseEl.on("focus",function(){
                        WdatePicker({position:{top:4}});
                    });
                    return this;
                }

            }, ButtonTextBox);

        $.fn.extend({
            DataPickerInit: function (setting) {
                return this.each(function () {
                    new DataPicker({ element: this, setting: setting }).initialize();
                }).removeAttr('cs-control');
            }
        });

        return DataPicker;

    });