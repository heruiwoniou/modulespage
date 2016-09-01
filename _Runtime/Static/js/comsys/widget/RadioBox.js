/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        'Class',
        './baseClass/LabelBase'
    ],
    function (Class, LabelBase) {
        var ClassName = "Control.RadioBox";

        var RadioBox = Class(ClassName, {
            constructor: function (args) {
                this.callParent(args);
                this.$RadioBoxEl = $(args.element);
                this.$group = $("input[name=" + this.$RadioBoxEl.attr("name") + "]");
            },
            initialize: function () {
                var that = this;
                var $this = this.$RadioBoxEl;
                if ($this.data(ClassName) == undefined) {

                    this.callParent();
                    var id=$this.attr("id");

                    this.$RadioBoxControl = $('<div class="comsys-radiobox' + ($this.get(0).checked ? " radiobox-checked" : "") + ( $this.is(":disabled") ? ' disabled' : '') + '"></div>');
                    var $wrap = this.$RadioBoxControl;
                    $this.before($wrap).appendTo($wrap);

                    var $parent=$wrap.parent();
                    if($parent.get(0).nodeName=="LABEL") {
                        $parent.addClass("comsys-checkbox-label").attr("for", id);
                    }

                    var $group = $("input[name=" + $this.attr("name") + "]");

                    if(this.setting.isDocumentBind)
                    {
                        $(document).on("click.RadioBoxClickHandler" + id, "#" + id, function (e, state) {
                            if (this.checked)
                                $($wrap).addClass("radiobox-checked");
                            else $($wrap).removeClass("radiobox-checked");
                            if (!state)
                                that.$group.not(this).trigger("radioChange");
                        });
                    }
                    else
                    {
                        $this.off('click.RadioBoxClickHandler').on('click.RadioBoxClickHandler',function(e, state){
                            if (this.checked)
                                $($wrap).addClass("radiobox-checked");
                            else $($wrap).removeClass("radiobox-checked");
                            if (!state)
                                that.$group.not(this).trigger("radioChange");
                        })
                    }
                    $this.on("radioChange", function () {
                        if (this.checked)
                            $($wrap).addClass("radiobox-checked");
                        else $($wrap).removeClass("radiobox-checked");
                    });

                    $this.data(ClassName, this);
                }else
                {
                    var that = $this.data(ClassName);
                    if($this.is(":checked"))
                        that.$RadioBoxControl.addClass("radiobox-checked");
                    else
                        that.$RadioBoxControl.removeClass("radiobox-checked");
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
                    this.$RadioBoxControl.removeClass('radiobox-checked').addClass("radiobox-checked");
                }
                else
                {
                    this.$BaseEl.get(0).checked = false;
                    this.$RadioBoxControl.removeClass("radiobox-checked");
                }
                this.$group.not(this.$BaseEl).trigger("radioChange");
            },
            destory:function(){
                $(document).off(".RadioBoxClickHandler"+this.$RadioBoxEl.attr("id"));
                this.$RadioBoxControl.parent().removeAttr("style");
                this.$RadioBoxControl.after(this.$RadioBoxEl);
                this.$RadioBoxControl.remove();
            }
        }, LabelBase);

        $.fn.extend({
            RadioBoxInit: function () {
                return this.each(function () {
                    var setting = { buttontype: $(this).attr('data-buttontype') || '' ,isDocumentBind: $(this).attr('data-isdocumentbind') || false  }
                    new RadioBox({element: this , setting : setting}).initialize();
                }).removeAttr('cs-control');
            }
        });

        return RadioBox;
    }
)