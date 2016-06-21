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
        './baseClass/LabelBase',
        'common/setting'
    ],
    function($, Class, LabelBase,Setting) {
        var ClassName = "Control.CheckBox";

        var CheckBox = Class(ClassName, {
            constructor: function(args) {
                this.callParent(args);
                this.$CheckBoxEl = $(args.element);
            },
            initialize: function() {
                var that = this;
                var $this = this.$CheckBoxEl;
                if ($this.data(ClassName) == undefined) {
                    this.callParent();
                    var id = $this.attr("id");
                    var buttontype=(this.setting.buttontype? " " + this.setting.buttontype + " ":"")
                    this.$CheckBoxControl = $('<div class="comsys-checkbox' + buttontype + ($this.get(0).checked ? " checkbox-checked" : "") + '"></div>');
                    var $wrap = this.$CheckBoxControl;
                    $this.before($wrap).appendTo($wrap);

                    var $parent = $wrap.parent();
                    if ($parent.get(0).nodeName == "LABEL") {
                        $parent.addClass("comsys-checkbox-label").attr("for", id);
                    }

                    $(document).on("click.CheckBoxClickHandler" + id, "#" + id, function() {
                        that.checkedChange(this);
                    })
                    $this.data(ClassName, this);
                }else
                {
                    that = $this.data(ClassName);
                    this.checkedChange.apply(that,$this);
                }
                return this;
            },
            checkedChange:function(el){
                var that=this;
                if($(el).is(":checked"))
                {
                    that.$CheckBoxControl.addClass("checkbox-checked");
                    Setting.LabelSetting.set(that.$LabelText,that.on || that.label)
                }
                else
                {
                    that.$CheckBoxControl.removeClass("checkbox-checked");
                    Setting.LabelSetting.set(that.$LabelText,that.off || that.label)
                }
            },
            destory: function() {
                $(document).off(".CheckBoxClickHandler" + this.$CheckBoxEl.attr("id"));
                this.$CheckBoxControl.parent().removeAttr("style");
                this.$CheckBoxControl.after(this.$CheckBoxEl);
                this.$CheckBoxControl.remove();
                this.$CheckBoxEl.removeData(ClassName);
            }
        }, LabelBase);

        $.fn.extend({
            CheckBoxInit: function() {
                return this.each(function() {
                    $(this).attr('data-button-type')
                    var setting = { buttontype: $(this).attr('data-buttontype') || '' }
                    new CheckBox({ element: this, setting: setting }).initialize();
                });
            }
        });

        return CheckBox;
    }
)
