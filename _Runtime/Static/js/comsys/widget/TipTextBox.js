/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame tip
*/

define(
    [
        'Core',
        'Class',
        './TextBox'
    ],
    function (Core, Class, TextBox) {
        var ClassName = "Control.TipTextBox";

        var TipTextBox =Class(ClassName, {
            constructor: function (args) {
                this.callParent(args);
                this.$TipTextBoxEl = $(args.element);
            },
            initialize: function () {
                var me=this;
                var $this = this.$TipTextBoxEl;

                var NoBindTextBox=$this.data('Control.TextBox') == undefined;

                if (NoBindTextBox) {
                    this.$TextBoxEl = this.$TipTextBoxEl;
                    this.callParent();
                }

                var title = $this.attr("tip-title");
                if (title && $this.data(ClassName) == undefined) {

                    this.$TipTextBoxControl = NoBindTextBox?this.$TextBoxControl:$this.data('Control.TextBox').$TextBoxControl;
                    this.$TipTextBoxControl.addClass("comsys-TipTextBox")
                        .append('<span class="comsys-tip-span">' + $this.attr("tip-title") + '</span>');

                    var $wrap = this.$TipTextBoxControl;

                    var oldvalue=null;

                    if ($this.val()) $wrap.find("span").hide(); else $wrap.find("span.comsys-tip-span").show();
                    this.$TipTextBoxControl.off(".TipClick").on("click.TipClick",'span.comsys-tip-span',function(){
                        me.$TipTextBoxEl.focus()
                    })
                    $this.off(".TipFocusEvent").on("focus.TipFocusEvent",function(){
                        $wrap.find("span.comsys-tip-span").hide();
                    })
                    $this.off(".TipChangeEvent").on("focusout.TipChangeEvent change.TipChangeEvent keyup.TipChangeEvent", function (e) {
                        var v = $this.val();
                        if(e.type=="keydown"&&oldvalue==v) return ;
                        if (v) $wrap.find("span.comsys-tip-span").hide(); else $wrap.find("span.comsys-tip-span").show();
                        oldvalue=v;
                    });
                    $this.removeAttr("tip-title");
                    $this.data(ClassName, this);
                }
                return this;
            }
        }, TextBox);

        $.fn.extend({
            TipTextBoxInit: function () {
                return this.each(function () {
                    new TipTextBox({element: this}).initialize();
                });
            }
        });

        return TipTextBox;
    });