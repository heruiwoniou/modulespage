/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        'Class',
        'TPLEngine',
        'comsys/base/Window'
    ],
    function (Class, TPLEngine,Window) {
        var ClassName = "Control.Dialog";
        var Dialog=
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.setting.dragoption.cancel= ".comsys-box-content,.comsys-box-buttons,iframe";
                },
                initialize: function () {
                    var me=this;
                    this.callParent();
                    this.$BoxBaseEl.addClass("comsys-box-dialog");
                    this.$BoxBaseButtons=$("<div class='comsys-box-buttons'></div>");
                    this.$BoxBaseEl.append(this.$BoxBaseButtons)


                    this.$BoxBaseButtons.on("click.buttonsClikHanler keyup.buttonsKeyUpHanler","a", function(e){return me.OnButtonsClikHanler.apply(me,Array.prototype.slice.call(arguments,0).concat($(this)));})
                    return this;
                },
                DialogTPL:{
                    button:
                    "<%if(this.length==0)return '';%>"+
                    "<%for(var i=0;i<this.length;i++){%>"+
                    "<a href='javascript:;' class='<%=this[i].class? this[i].class : \"comsys-box-button\"%>' command='<%=this[i].command%>'><%=this[i].text%></a>"+
                    "<%}%>"
                },
                hideContent:function(){
                    return;
                },
                showContent:function(){
                    return;
                },
                OnButtonsClikHanler:function(e,$button){
                    if(e.type=='keyup')
                    {
                        //ESC
                        if(e.keyCode==27)
                        {
                            if(this.$BoxBaseButtons.find('a').length == 1)
                                this.close('close');
                            else
                                this.$BoxBaseButtons.find('a:last').trigger('click.buttonsClikHanler');
                        }
                        //空格
                        else if(e.keyCode==32)
                            $button.trigger('click.buttonsClikHanler');
                        e.stopPropagation();
                    }
                    else
                    {
                        var command=$button.attr("command")||"uncommand";
                        this.close(command);
                    }
                },
                show:function(setting){
                    this.setting.buttons=(setting||{buttons:[]}).buttons||[];
                    this.callParent.call(this, setting);
                    this.$BoxBaseContent.removeAttr("class");
                    this.$BoxBaseContent.addClass("comsys-box-content "+(setting.icon||"info"))
                    this.$BoxBaseButtons.find('a:first').focus();
                    return this;
                },
                resize:function(height){
                    height=height||this.$BoxBaseEl.height();
                    var buttonString=TPLEngine.render(this.DialogTPL.button,this.setting.buttons);
                    if(buttonString)
                    {
                        height -= ( this.setting.titleHeight + this.setting.borderWidth );
                        this.$BoxBaseButtons.html(buttonString).show();
                    }else
                        this.$BoxBaseButtons.empty().hide();
                    var ch = height - this.setting.titleHeight;
                    this.$BoxBaseContent.css({ minHeight: ch });
                    this.$BoxBaseFrame.css({ height: ch });
                },
                destory:function(){
                    this.$BoxBaseButtons.off("click.buttonsClikHanler");
                    this.callParent();
                }
            }, Window);

        return Dialog;

    });