/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        'Class',
        'common/client/Bumper',
        'comsys/base/Window'
    ],
    function (Class,Bumper, Window) {
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

                    this.$BoxBaseTitle.off(".BoxBaseTitleDoubleClick").on("dblclick.BoxBaseTitleDoubleClick",
                        function(){return me.BoxBaseTitleDoubleClick.apply(me,arguments);})

                    return this;
                },
                BindResize:function(){
                    var me=this;
                    $(window).on("resize.ResizeWindowResize",function(){
                        me.hideContent('box-moving');
                        Bumper.trigger(function(){
                            me.WindowResizeHandler();
                        },200);
                    })
                },
                UnBindResize:function(){
                    $(window).off("resize.ResizeWindowResize");
                },
                WindowResizeHandler:function(){
                    this.BoxBaseFullHandler(null,true);
                },
                CachePosition:null,
                BoxBaseTitleDoubleClick:function(e){
                    var me=this;
                    if(me.windowState==me.WindowStatus.Normal)
                    {
                        me.$BoxBaseFull.trigger('click.BoxBaseFullHandler');
                    }else {
                        me.$BoxBaseNormal.trigger('click.BoxBaseNormalHandler');
                    }
                },
                BoxBaseFullHandler:function(e,state/*no animate*/){
                    var that = this;
                    this.hideContent('box-moving')
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

                    var $win = $(window);
                    var gh = $win.height();

                    var ch = gh - this.setting.titleHeight;
                    if(state)
                    {
                        this.$BoxBaseEl.css({
                            width: "100%",height: "100%",top:0,left:0
                        });
                        this.$BoxBaseFull.hide();
                        this.$BoxBaseNormal.show();
                        this.removeMoveBehavior();
                        me.windowState = me.WindowStatus.Full;
                        if (this.windowLoadType == this.WindowLoadType.iframe) {
                            this.$BoxBaseFrame.css({height: ch});
                        }
                        else this.$BoxBaseContent.css({height: ch , maxHeight: ch });
                        that.showContent('box-moving');
                    }else {
                        this.$BoxBaseEl.animate({
                            width: "100%",height: "100%",top: 0,left: 0
                        }, "fast", function () {
                            me.$BoxBaseFull.hide();
                            me.$BoxBaseNormal.show();
                            me.removeMoveBehavior();
                            me.windowState = me.WindowStatus.Full;
                        });
                        if (this.windowLoadType == this.WindowLoadType.iframe) {
                            this.$BoxBaseFrame.animate({height: ch}, "fast", function(){
                                that.showContent('box-moving');
                            });
                        }
                        else this.$BoxBaseContent.animate({height: ch , maxHeight: ch }, "fast", function(){
                                that.showContent('box-moving');
                            });
                    }

                    this.BindResize();
                },
                BoxBaseNormalHandler:function(){
                    var me=this;
                    this.hideContent('box-moving')
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
                        me.showContent('box-moving');
                    })
                },
                show:function(setting){
                    var me=this;
                    var $win = $(window);
                    var gh = $win.height();
                    var gw = $win.width();
                    if(gh<setting.height||gw<setting.width) setting.full=true;
                    this.callParent.call(this, setting);
                    me.fullsetting=setting;
                    if(setting.full||setting.alwaysfull) {
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
                },
                destory:function(){
                    this.$BoxBaseFull.off(".BoxBaseFullHandler");
                    this.$BoxBaseNormal.off(".BoxBaseNormalHandler");
                    this.$BoxBaseTitle.off(".BoxBaseTitleDoubleClick");
                    this.UnBindResize();
                    this.callParent();
                }
            }, Window);

        return ResizeWindow;

    });