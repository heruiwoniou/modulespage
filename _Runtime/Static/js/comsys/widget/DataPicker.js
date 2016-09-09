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
        "./ButtonTextBox",
        "Static/js/libs/wdate.picker/WdatePicker"
    ],
    function (Class, TPLEngine, ButtonTextBox) {
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
                        WdatePicker($.extend({position:{top:4}},that.setting));
                        that.RuntimeBind();
                    });
                    return this;
                },
                RuntimeBind:function(){
                    var THIS = this;
                    var $scrollBar = this.$BaseEl.closest('.scroll-bar');
                    if($scrollBar.length == 0)
                    {
                        $(document).off(".wdatepickermousewheelhide").on('mousewheel.wdatepickermousewheelhide',function(){
                            $dp.hide()
                        })
                    }
                    else
                    {
                        ScrollStart=function(){
                            $dp.hide();
                            ScrollStart=function(){}
                        }
                    }
                }

            }, ButtonTextBox);

        $.fn.extend({
            DataPickerInit: function (setting) {
                return this.each(function () {
                    var oset = $(this).attr('cs-options');
                    var clone= $.extend({},setting);
                    if(oset)
                    {
                        clone = $.extend(clone,eval("(" + oset + ")"));
                    }
                    new DataPicker({ element: this, setting: clone }).initialize();
                }).removeAttr('cs-control');
            }
        });

        return DataPicker;

    });