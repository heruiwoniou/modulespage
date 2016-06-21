/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame Control Box Base
 */

define(
    [
        'jquery',
        'Class',
        'TPLEngine',
        './Base',
        'comsys/layout/MaskLayer',
        'jquery.ui/ui/draggable',
        'common/setting'
    ],
    function ($, Class, TPLEngine, Base, MaskLayer, draggable, CommonSetting) {
        var ClassName = "Control.Window";
        var layer = new MaskLayer(CommonSetting.layerSetting);
        var Window =
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.$BoxBaseEl = $(TPLEngine.render(this.TPL.main, this));
                    this.$BoxBaseAppend = $(this.setting.append || document.body);
                    this.$BoxBaseHead = this.$BoxBaseEl.find(".comsys-box-head");
                    this.$BoxBaseTitle = this.$BoxBaseEl.find(".comsys-box-title");
                    this.$BoxBaseClose = this.$BoxBaseEl.find(".comsys-box-close");
                    this.$BoxBaseContent = this.$BoxBaseEl.find(".comsys-box-content");
                    this.$BoxBaseFrame = this.$BoxBaseEl.find("iframe");

                    this.setting.titleHeight = 50;
                    this.setting.borderWidth = 0;
                    this.setting.zindex=0;
                    this.setting.callback = function () {
                    };
                    this.setting.headmousedown=function(){
                    }

                    this.windowLoadType = null;
                    this.placeholder = null;
                    this.deferred = new $.Deferred();
                    this.color=""
                    this.status=false;
                    this.setting.dragoption = {
                        cancel: ".comsys-box-content,iframe",
                        containment: "window",
                        addClasses: false,
                        iframeFix: this.$BoxBaseFrame,
                        scroll: true,
                        drag: function (event, ui) {
                            if (ui.position.top < 0) {
                                ui.helper.css({top: 0});
                                return false;
                            }
                        }
                    };
                },
                TPL: {
                    main: "<div id='<%=this.classids%>' class='comsys-box-base <%=this.getColor()%>'>" +
                    "<div class='comsys-box-head'>" +
                    "<div class='comsys-box-title'>标题处</div>" +
                    "<div class='comsys-box-close'></div>" +
                    "</div>" +
                    "<iframe src='about:blank' width='100%' height='100%' marginheight='0' marginwidth='0' scrolling='auto' frameborder='0' style='width: 100%; height: 100%; border: 0px;'></iframe>" +
                    "<div class='comsys-box-content'></div>" +
                    "</div>"
                },
                initialize: function () {
                    var me = this;
                    this.$BoxBaseEl.addClass("comsys-box-window");
                    this.$BoxBaseClose.off(".BoxBaseCloseHandler").on("click.BoxBaseCloseHandler", function () {
                        return me.close.call(me);
                    });
                    this.$BoxBaseHead.get(0).onselectstart = function () {
                        return false;
                    };
                    this.$BoxBaseHead.off('.BoxHeadMouseDownHandler').on('mousedown.BoxHeadMouseDownHandler',function(){
                        me.setting.headmousedown.apply(me,arguments);
                    })
                    this.addMoveBehavior();
                    this.deferred.promise(this);
                    return this;
                },
                getColor:function(){
                    this.color='boxColor'+ Math.ceil(Math.random()*9);
                    return this.color;
                },
                addMoveBehavior: function () {
                    this.drapObject = draggable(this.setting.dragoption, this.$BoxBaseEl);
                },
                removeMoveBehavior: function () {
                    this.drapObject.destroy();
                },
                WindowLoadType: {
                    "iframe": "iframe",
                    "content": "content",
                    "ajax": "ajax"
                },
                show: function (setting) {
                    this.status=true;
                    this.deferred = new $.Deferred();
                    this.deferred.promise(this);
                    var me = this;
                    setting = setting || {};
                    setting.title = setting.title || "";
                    setting.content = setting.content || "";
                    setting.src = setting.src || "";
                    setting.ajax = typeof setting.ajax === 'boolean' && setting.ajax === true ? true : false;
                    setting.width = setting.width || 800;
                    setting.height = setting.height || 600;
                    setting.callback = setting.callback || function () {};
                    setting.maxHeight = setting.maxHeight ||null;
                    setting.headmousedown = setting.headmousedown || me.setting.headmousedown;
                    setting.zindex=setting.zindex||me.setting.zindex

                    //重新设置zindex
                    me.setting.headmousedown=setting.headmousedown;
                    me.setting.zindex=setting.zindex;

                    this.$BoxBaseEl.removeClass(this.color);
                    this.$BoxBaseEl.addClass(this.getColor());

                    this.then(function () {
                        setting.callback.apply(me, arguments);
                    });

                    if (!document.getElementById(this.classids)) {
                        this.$BoxBaseAppend.append(this.$BoxBaseEl);
                    }

                    var $win = $(window);
                    var gh = $win.height();
                    var gw = $win.width();

                    setting.width=(gw>setting.width?setting.width:gw*0.99);
                    setting.height=(gh>setting.height?setting.height:gh*0.99);

                    var top = (gh - setting.height) / 2 - ((gh - setting.height) / 2) * 2 / 5;
                    this.$BoxBaseEl.css({
                        zIndex:950 + setting.zindex,
                        position: "fixed",
                        width: setting.width,
                        height: "auto",
                        left: (gw - setting.width) / 2,
                        top: top < 0 ? 0 : top
                    }).hide();

                    this.resize(setting.height,setting.maxHeight);
                    this.$BoxBaseTitle.html(setting.title);

                    this.$BoxBaseContent.empty();
                    if (setting.content) {
                        var content = null;
                        this.windowLoadType = this.WindowLoadType.content;
                        if(typeof setting.content !== 'string')
                        {
                            this.placeholder = $("<div id='placeholder"+ this.classids +"'></div>");
                            $(setting.content).before(this.placeholder).show()
                        }
                        this.$BoxBaseFrame.hide();
                        this.$BoxBaseContent.append(setting.content).show();
                    } else {
                        if (setting.src) {
                            if (setting.ajax) {
                                this.$BoxBaseFrame.hide();
                                $.ajax({
                                    url: setting.src,
                                    success: function (html) {
                                        me.$BoxBaseContent.append(html).show();
                                    }
                                });
                                this.windowLoadType = this.WindowLoadType.ajax;
                            } else {
                                this.$BoxBaseContent.hide();
                                this.$BoxBaseFrame.attr("src", setting.src).show();
                                this.windowLoadType = this.WindowLoadType.iframe;
                            }
                        } else {
                            return;
                        }
                    }

                    this.$BoxBaseEl.fadeIn();
                    layer.mask(function(e){
                        me.$BoxBaseContent.stop().animate({scrollTop:me.$BoxBaseContent.scrollTop()  - 2 * e.wheelDelta})
                        return false;
                    },950 + this.setting.zindex);
                    return this;
                },
                close: function (command) {
                    if(!this.status) return ;
                    this.$BoxBaseEl.hide();
                    var cmd = command;
                    this.$BoxBaseFrame.attr("src", "about:blank");
                    layer.hide();
                    if(command instanceof Function){
                        this.then(function(){command.apply(null,arguments);});
                        cmd="close";
                    }
                    if(this.placeholder !== null)
                    {
                        this.placeholder.replaceWith(this.$BoxBaseContent.children().first());
                        this.placeholder = null;
                    }
                    this.status=false;
                    this.deferred.resolve(cmd||"close");
                },
                setindex:function(zindex){
                    var me=this;
                    this.setting.zindex=zindex
                     this.$BoxBaseEl.css({
                        zIndex:950 + me.setting.zindex
                    });
                },
                resize: function (height,maxHeight) {
                    height = height || this.$BoxBaseEl.height();
                    var ch = height - this.setting.titleHeight;
                    this.$BoxBaseContent.css({height:'auto',minHeight: ch+'px'});
                    if(maxHeight&&maxHeight>=height)
                        this.$BoxBaseContent.css({maxHeight: (maxHeight-this.setting.titleHeight)+'px'});
                    this.$BoxBaseFrame.css({height: ch});
                },
                destory:function(){
                    this.drapObject.destroy();
                    this.$BoxBaseClose.off(".BoxBaseCloseHandler");
                    this.$BoxBaseEl.remove();
                }

            }, Base);

        return Window;
    });