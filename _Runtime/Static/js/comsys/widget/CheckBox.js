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
        './baseClass/LabelBase'
    ],
    function($, Class, LabelBase) {
        var ClassName = "Control.CheckBox";

        var CheckBox = Class(ClassName, {
            constructor: function(args) {
                this.callParent(args);
                this.$CheckBoxEl = $(args.element);
            },
            initialize: function() {
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
                        if (this.checked)
                            $($wrap).addClass("checkbox-checked");
                        else $($wrap).removeClass("checkbox-checked");
                    })

                    $this.data(ClassName, this);
                    $this.attr("data-binded",true)
                }
                return this;
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
                return this.filter(":not([data-binded])").each(function() {
                    $(this).attr('data-button-type')
                    var setting = { buttontype: $(this).attr('data-buttontype') || '' }
                    new CheckBox({ element: this, setting: setting }).initialize();
                });
            }
        });

        return CheckBox;
    }
)
