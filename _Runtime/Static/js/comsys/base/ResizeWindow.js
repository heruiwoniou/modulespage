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
        'common/client/Bumper',
        'comsys/base/Window'
    ],
    function ($,Class,Bumper, Window) {
        var ClassName = "Control.ResizeWindow";
        var ResizeWindow=
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.windowState=this.WindowStatus.Normal;
                },
                WindowStatus:{
                    Full:"Full",
                    Normal:"Normal"
                },
                initialize: function () {
                    var me=this;
                    this.callParent();
                    this.$BoxBaseEl.addClass("comsys-box-resize-window");
                    this.$BoxBaseFull=$("<div class=\"comsys-box-full\"></div>");
                    this.$BoxBaseNormal=$("<div class=\"comsys-box-normal\"></div>");
                    this.$BoxBaseClose.before(this.$BoxBaseFull);
                    this.$BoxBaseClose.before(this.$BoxBaseNormal);

                    this.$BoxBaseFull.off(".BoxBaseFullHandler").on("click.BoxBaseFullHandler",
                        function(){return me.BoxBaseFullHandler.apply(me,arguments);});

                    this.$BoxBaseNormal.off(".BoxBaseNormalHandler").on("click.BoxBaseNormalHandler",
                        function(){return me.BoxBaseNormalHandler.apply(me,arguments);})
                    return this;
                },
                BindResize:function(){
                    var me=this;
                    $(window).on("resize.ResizeWindowResize",function(){
                        Bumper.trigger(function(){
                            me.WindowResizeHandler();
                        },500);
                    })
                },
                UnBindResize:function(){
                    $(window).off("resize.ResizeWindowResize");
                },
                WindowResizeHandler:function(){
                    this.BoxBaseFullHandler(null,true);
                },
                CachePosition:null,
                BoxBaseFullHandler:function(e,state/*no animate*/){
                    var me=this;
                    if(!state) {
                        this.CachePosition =
                        {
                            width: this.$BoxBaseEl.css("width"),
                            height:this.$BoxBaseEl.height(),
                            left: this.$BoxBaseEl.css("left"),
                            top: this.$BoxBaseEl.css("top")
                        }
                    }

                    var ch = document.documentElement.offsetHeight * 0.99 - this.setting.titleHeight;

                    if(state)
                    {
                        this.$BoxBaseEl.css({
                            width: "99%",height: "99%",top: "0.5%",left: "0.5%"
                        });
                        this.$BoxBaseFull.hide();
                        this.$BoxBaseNormal.show();
                        this.removeMoveBehavior();
                        me.windowState = me.WindowStatus.Full;
                        if (this.windowLoadType == this.WindowLoadType.iframe) {
                            this.$BoxBaseFrame.css({height: ch});
                        }
                        else this.$BoxBaseContent.css({height: ch});
                    }else {
                        this.$BoxBaseEl.animate({
                            width: "99%",height: "99%",top: "0.5%",left: "0.5%"
                        }, "fast", function () {
                            me.$BoxBaseFull.hide();
                            me.$BoxBaseNormal.show();
                            me.removeMoveBehavior();
                            me.windowState = me.WindowStatus.Full;
                        });
                        if (this.windowLoadType == this.WindowLoadType.iframe) {
                            this.$BoxBaseFrame.animate({height: ch}, "fast");
                        }
                        else this.$BoxBaseContent.animate({height: ch}, "fast");
                    }

                    this.BindResize();
                },
                BoxBaseNormalHandler:function(){
                    var me=this;
                    var cache=this.CachePosition;
                    if(!cache)
                    {
                        var $win=$(window);
                        var gh =$win.height();
                        var gw = $win.width();

                        var top=(gh - me.fullsetting.height) / 2 - ((gh - me.fullsetting.height) / 2) * 2 / 5;
                        cache=this.CachePosition={
                            width: me.fullsetting.width,
                            height:me.fullsetting.height,
                            left: (gw - me.fullsetting.width) / 2,
                            top: top<0?0:top
                        }
                    }

                    this.$BoxBaseEl.animate(cache,"fast",function(){
                        me.$BoxBaseEl.css({height:"auto"});
                        me.$BoxBaseFull.show();
                        me.$BoxBaseNormal.hide();
                        me.addMoveBehavior();
                        me.resize(me.fullsetting.height||600);
                        me.windowState=me.WindowStatus.Normal;
                        me.UnBindResize();
                    })
                },
                show:function(setting){
                    var me=this;
                    this.callParent.call(this, setting);
                    me.fullsetting=setting;
                    if(setting.full) {
                        this.BoxBaseFullHandler(null,true);
                        this.BindResize();
                    }else{
                        me.$BoxBaseFull.show();
                        me.$BoxBaseNormal.hide();
                    }
                    return this;
                },
                close:function(){
                    this.callParent.apply(this,arguments);
                    this.UnBindResize();
                }
            }, Window);

        return ResizeWindow;

    });