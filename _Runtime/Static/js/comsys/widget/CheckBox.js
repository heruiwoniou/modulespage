/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        'Class',
        './baseClass/LabelBase',
        'common/setting'
    ],
    function(Class, LabelBase,Setting) {
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
                    this.$CheckBoxControl = $('<div class="comsys-checkbox' + buttontype + ($this.get(0).checked ? " checkbox-checked" : "") + ( $this.is(":disabled") ? ' disabled' : '') + '"></div>');
                    var $wrap = this.$CheckBoxControl;
                    $this.before($wrap).appendTo($wrap);

                    var $parent = $wrap.parent();
                    if ($parent.get(0).nodeName == "LABEL") {
                        $parent.addClass("comsys-checkbox-label").attr("for", id);
                    }
                    if(this.setting.isDocumentBind)
                    {
                        $(document).on("click.CheckBoxClickHandler"+id,"#" + id,function(){
                            that.checkedChange(this);
                        })
                    }else
                    {
                        $this.off('click.CheckBoxClickHandler').on('click.CheckBoxClickHandler',function(e, state){
                            that.checkedChange(this);
                        })
                    }
                    $this.data(ClassName, this);
                }else
                {
                    that = $this.data(ClassName);
                    this.checkedChange.apply(that,$this);
                }
                return this;
            },
            SetDisabled:function(status){
                if(status)
                {
                    this.$BaseEl.attr("disabled",true);
                    this.$CheckBoxControl.addClass('disabled');
                }
                else{
                    this.$BaseEl.removeAttr('disabled');
                    this.$CheckBoxControl.removeClass('disabled');
                }
            },
            SetCheck:function(status){
                if(status)
                {
                    this.$BaseEl.get(0).checked = true;
                    this.$CheckBoxControl.removeClass('checkbox-checked').addClass("checkbox-checked");
                }
                else
                {
                    this.$BaseEl.get(0).checked = false;
                    this.$CheckBoxControl.removeClass("checkbox-checked");
                }
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
                    var setting = { buttontype: $(this).attr('cs-button-type') || '' ,isDocumentBind: $(this).attr('cs-isdocumentbind') === 'true' }
                    new CheckBox({ element: this, setting: setting }).initialize();
                }).removeAttr('cs-control');
            }
        });

        return CheckBox;
    }
)
