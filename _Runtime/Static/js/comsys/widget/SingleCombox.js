/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame combox
*/

define(
    [
        "jquery",
        'Class',
        "TPLEngine",
        "./baseClass/HiddenBase"
    ],
    function ($,Class, TPLEngine, HiddenBase) {
        var ClassName = "Control.SingleCombox";

        var SingleCombox=
            Class(ClassName,
                {
                    constructor: function (args) {
                        this.callParent(args);
                        var element = args.element;
                        if (element.nodeName && element.nodeName.toLowerCase() != "select") throw new Error("this is not a select");
                        this.element = element;
                        this.$element = $(element);
                        this.appendTo = args.appendTo || document.body;
                        this.setting = {
                            dropLength: this.setting.dropLength || 5
                        };
                        this.element.style.display = "none";
                        this.OnOptionChange = args.onChange || this.element.onchange || function () { };
                        this.Timer = null;
                        var u = /MSIE (\d*).0|Chrome|Firefox/i.exec(window.navigator.userAgent);
                        this.LowIEOrNoIE = u != null && ~~u[1] < 8;
                    },
                    initialize: function () {
                        var $this = $(this.element);
                        if ($this.data(ClassName) == undefined) {
                            this.generate();
                            $(this.element).data(ClassName, this);
                            this.$TipTextBoxEl = this.$input;
                            this.callParent();
                        }else{
                            $(this.element).trigger("reload");
                        }
                        return this;
                    },
                    TPL: {
                        layout: "<div class='comsys-base comsys-SingleCombox-layout' id='SingleCombox-<%= this.classids%>'>@{layout}@</div>",
                        main: "@{layout:this.TPL.layout,this}@<div class='comsys-SingleCombox-input'><input type='text' readonly placeholder='<%=$(this.element).attr(\"placeholder\")?$(this.element).attr(\"placeholder\"):\"\"%>' value='<%=this.element.options.length==0 || this.element.selectedIndex == -1?'':this.element.options[this.element.selectedIndex].text%>'/></div><div class='comsys-SingleCombox-button'></div>@{section:this.TPL.drop,this}@",
                        drop: "<div class='comsys-combox-base comsys-SingleCombox-drop' id='SingleCombox-drop-<%= this.classids%>'><%for(var i=0;i<this.element.options.length;i++){%>@{section:this.TPL.option,this.element.options[i]}@<%}%></div>",
                        option: "<div class='comsys-base comsys-SingleCombox-option<%=this.selected?\' selected\':\'\'%>' data-index='<%=this.index%>'><%=this.text%></div>"
                    },
                    addPlaceHolderAfter:function(){
                        this.$controller.prepend(this.$HiddenBaseElContainer);
                        this.$HiddenBaseElContainer.append(this.element);
                    },
                    keyCode: {
                        SPACE: 32,
                        ENTER: 13,
                        DOWN: 40,
                        UP: 38,
                        SHOW: 540
                    },
                    generate: function () {
                        var THIS = this;
                        THIS.state = false;
                        THIS.$controller = $(TPLEngine.render(this.TPL.main, this));
                        this.options=this.element.options.length;
                        $(this.element.parentNode).append(THIS.$controller);
                        THIS.$drop = THIS.$controller.find(".comsys-SingleCombox-drop");
                        THIS.$input = THIS.$controller.find("input");
                        if(this.fixed())
                            THIS.$drop.css({position:"fixed"});
                        $(this.appendTo).append(THIS.$drop);

                        $(this.element).on("rebind",function(){return THIS.ReBind.apply(THIS,arguments);})
                            .on("reload",function(){return THIS.ReLoad.apply(THIS,arguments);})
                        THIS.$drop.on("mousedown", function () { return THIS.OnDropClick.apply(THIS, arguments); });
                        THIS.$drop.bind("otherhide",function(){return THIS.OnOtherClick.apply(THIS,arguments);});
                        //THIS.$controller.delegate(".comsys-SingleCombox-button", "click", function () { return THIS.OnButtonClick.apply(THIS, arguments); });
                        THIS.$controller.on("click", function () { return THIS.OnButtonClick.apply(THIS, arguments); });
                        THIS.$controller.delegate(".comsys-SingleCombox-input input", "keydown", function () { return THIS.OnKeyDown.apply(THIS, arguments); });
                        THIS.$drop.get(0).onmousewheel = function (e) { return THIS.OnMouseWheel.call(THIS, e, THIS.$drop.get(0)); }
                        THIS.$input.off(".SingleComboxFocus").on("focus.SingleComboxFocus",function(){
                            THIS.$controller.addClass('focus-outerline');
                        })
                        THIS.$input.off(".SingleComboxFocusOut").on("focusout.SingleComboxFocusOut", function () { 
                            THIS.$controller.removeClass('focus-outerline');
                            return THIS.OnFocusOut.apply(THIS, arguments); });
                        THIS.$drop.delegate(".comsys-SingleCombox-option", "click", function () { return THIS.OnOptionClick.apply(THIS, [arguments[0], this]); });
                    },
                    //获取定位模式
                    fixed:function(){
                        var node=this.element;
                        do{
                            if($(node).css("position").indexOf('fixed')>-1)
                                return true;
                        }while(node=node.parentElement);
                        return false;
                    },
                    ReBind:function(){
                        var THIS = this;
                        THIS.state=true;
                        THIS.SelectedIndex(THIS.SelectedIndex());
                    },
                    ReLoad:function(){
                        var THIS=this;
                        THIS.$drop.html($(TPLEngine.render(this.TPL.drop, this)).html());
                        this.options=this.element.options.length;
                        this.ReBind();
                    },
                    OnOtherClick:function(){
                        this.state=false;
                    },
                    OnMouseWheel: function (e,scroller) {
                        var THIS = this;
                        var k = e.wheelDelta ? e.wheelDelta / 120 * THIS.$controller.outerHeight() : -e.detail;
                        scroller.scrollTop = scroller.scrollTop - k;
                        return false;
                    },
                    OnOptionClick: function (e, t) {
                        var THIS = this;
                        THIS.element.selectedIndex = $(t).attr("data-index");
                        THIS.$input.val(THIS.element.options[THIS.element.selectedIndex].text);
                        THIS.element.options[THIS.element.selectedIndex].selected = true;
                        THIS.DropHide();
                    },
                    OnDropClick: function (e) {
                        var THIS = this;
                        var p= e.currentTarget|| e.delegateTarget;
                        var c= e.target|| e.toElement;
                        THIS.cancelFocusOut = true;
                        window.clearTimeout(THIS.Timer);
                        THIS.Timer = null;
                        var d=THIS.$drop.get(0);
                        if(p.id== c.id&& d.scrollHeight< d.offsetHeight) THIS.DropHide();
                    },
                    OnFocusOut: function () {
                        var THIS = this;
                        if (!THIS.cancelFocusOut) {
                            THIS.Timer = window.setTimeout(function () { THIS.DropHide(); }, 10);
                        }
                        THIS.cancelFocusOut = false;
                    },
                    DropHide: function () {
                        var THIS = this;
                        if(!THIS.state) return;
                        window.clearTimeout(THIS.Timer);
                        THIS.Timer = null;
                        THIS.$drop.hide();
                        THIS.state = false;
                        if (THIS.element.selectedIndex != -1) {
                            THIS.$input.val(THIS.element.options[THIS.element.selectedIndex].text);
                            THIS.element.options[THIS.element.selectedIndex].selected = true;
                        } else THIS.$input.val("");
                        THIS.cancelFocusOut = true;
                        if (THIS.LastKey != THIS.element.value) {
                            THIS.OnOptionChange.apply(this.element);
                            $(THIS.element).trigger("vuechange");
                            THIS.LastKey = THIS.element.value;
                        }
                        THIS.cancelFocusOut = false;
                        THIS.$input.trigger("focusout.TipChangeEvent");
                        $(document).off(".outerClickListener")
                    },
                    SelectedIndex: function () {
                        var THIS = this;
                        if (arguments.length === 0)
                            return THIS.element.selectedIndex;
                        else {
                            THIS.element.selectedIndex = arguments[0];
                            THIS.DropHide();
                        }
                    },
                    Value: function () {
                        var THIS = this;
                        if (arguments.length === 0)
                            return THIS.element.options[THIS.element.selectedIndex].value;
                        else {
                            for (var i = 0; i < THIS.element.options.length; i++) {
                                var option = THIS.element.options[i];
                                if (option.value === arguments[0]) {
                                    THIS.SelectedIndex(option.index);
                                    break;
                                }
                            }
                        }
                    },
                    OnOtherAreaClick:function(e){
                        var THIS=this;
                        var $t=$(e.target|| e.toElement),
                            $d=$t.closest(".comsys-SingleCombox-drop"),
                            $l=$t.closest(".comsys-SingleCombox-layout"),
                            $did=$d.attr("id"),
                            $tdid="SingleCombox-drop-"+THIS.classids,
                            $lid=$l.attr("id"),
                            $tlid="SingleCombox-"+THIS.classids;

                        if($d.length==0&&$l.length==0||($d.length!=0&&$did!=$tdid)||($l.length!=0&&$lid!=$tlid))
                        {
                            THIS.DropHide();
                            return;
                        }
                        THIS.cancelFocusOut=true;
                    },
                    OnButtonClick: function (e, isFilter, type, isRange) {
                        var THIS = this;
                        window.clearTimeout(THIS.Timer);
                        THIS.Timer = null;
                        if(this.element.disabled) return ;
                        if(this.options!=this.element.options.length) this.ReLoad();

                        var offset = THIS.Offset(THIS.$controller.get(0));//THIS.$controller.offset();//
                        if (!THIS.state) {
                            THIS.$input.focus();
                            $("div.comsys-combox-base:visible").hide().trigger("otherhide");
                            if(THIS.element.options.length==0) return false;
                            THIS.$drop.css({
                                left: -99999,
                                maxHeight: THIS.$controller.outerHeight() * THIS.setting.dropLength
                            }).appendTo(document.body).show();
                            THIS.$drop.css({
                                minWidth: THIS.$controller.innerWidth() + 2 - (THIS.LowIEOrNoIE || (THIS.$drop.get(0).scrollHeight < THIS.$drop.get(0).offsetHeight) ? 0 : 17),
                                left: offset.left,
                                top: offset.top + THIS.$controller.outerHeight() + 6
                            });
                            THIS.state = true;
                            $(document).off(".outerClickListener").on("mousedown.outerClickListener",function(){return THIS.OnOtherAreaClick.apply(THIS,arguments);});
                        }
                        else if(!isFilter&&THIS.state){
                            THIS.DropHide();
                        }

                        if (THIS.element.selectedIndex !== -1) {
                            THIS.$drop.find(".selected").removeClass("selected").end().find("div.comsys-SingleCombox-option:eq(" + THIS.element.selectedIndex + ")").addClass("selected");
                        } else {
                            THIS.$drop.find(".selected").removeClass("selected");
                        }

                        THIS.OptionPosition(!isFilter&THIS.state ? THIS.keyCode.SHOW : type, isRange);
                    },
                    OptionPosition: function (type, isRange) {
                        var THIS = this;
                        var obj = THIS.$drop.find(".selected").get(0);
                        var drop = THIS.$drop.get(0);
                        if (!obj) { drop.scrollTop = 0; return; }
                        var top = obj.offsetTop;
                        switch (type) {
                            case THIS.keyCode.DOWN:
                                if (isRange) drop.scrollTop = 0;
                                else {
                                    if (drop.scrollTop + drop.offsetHeight - 2 <= top) drop.scrollTop = top - drop.offsetHeight + obj.offsetHeight;
                                }
                                break;
                            case THIS.keyCode.UP:
                                if (isRange) drop.scrollTop = drop.scrollHeight;
                                else {
                                    if (drop.scrollTop > top) drop.scrollTop = top;
                                }
                                break;
                            case THIS.keyCode.SHOW:
                            default:
                                drop.scrollTop = top;
                                break;
                        }

                        if (THIS.element.selectedIndex !== -1) {
                            THIS.$drop.find(".selected").removeClass("selected").end().find("div.comsys-SingleCombox-option:eq(" + THIS.element.selectedIndex + ")").addClass("selected");
                        } else {
                            THIS.$drop.find(".selected").removeClass("selected");
                        }

                    },
                    OnKeyDown: function (e) {
                        var THIS = this;
                        var isRange = false;
                        switch (e.keyCode) {
                            case THIS.keyCode.DOWN:
                                if (THIS.state) {
                                    isRange = THIS.element.selectedIndex === THIS.element.options.length - 1;
                                    isRange ? THIS.element.selectedIndex = 0 : THIS.element.selectedIndex += 1;
                                }
                                //THIS.OptionPosition(e.keyCode, isRange);
                                THIS.$controller.find(".comsys-SingleCombox-button").trigger("click", [true, e.keyCode, isRange]);
                                e.stopPropagation();
                                return false;
                            case THIS.keyCode.UP:
                                if (THIS.state) {
                                    isRange = THIS.element.selectedIndex === 0;
                                    isRange ? THIS.element.selectedIndex = THIS.element.options.length - 1 : THIS.element.selectedIndex -= 1;
                                }
                                //THIS.OptionPosition(e.keyCode, isRange);
                                THIS.$controller.find(".comsys-SingleCombox-button").trigger("click", [true, e.keyCode, isRange]);
                                e.stopPropagation();
                                return false;
                            case THIS.keyCode.ENTER:
                                var index = THIS.$drop.find(".selected").attr("data-index");
                                THIS.element.selectedIndex = index == undefined ? -1 : index;
                                THIS.DropHide();
                                e.stopPropagation();
                                return false;
                            default:
                                THIS.FTimer = window.setTimeout(function () {
                                    if (THIS.LastKey != THIS.element.value) {
                                        THIS.Search(THIS.$input.val());
                                        THIS.LastKey = THIS.element.value;
                                    }
                                });
                                break;
                        }
                    },
                    Search: function (key) {
                        var index = -1;
                        var THIS = this;
                        if (key !== "") {
                            var options = $(THIS.element).find("option:contains('" + $.trim(key) + "')");
                            if (options.length != 0) {
                                index = options[0].index;
                            }
                        }
                        THIS.element.selectedIndex = index;
                        THIS.$controller.find(".comsys-SingleCombox-button").trigger("click", [true, THIS.keyCode.SHOW, false]);
                    },
                    Offset: function (obj) {
                        var THIS = this,
                            o = obj,
                            re = { left: 0, top: 0 },
                            pos, outer = false;

                        do {
                            re.left += o.offsetLeft;
                            re.top += o.offsetTop;
                            o = o.offsetParent;

                            if (!o) break;
                            outer = !outer ? THIS.appendTo === o : true;
                            pos = $(o).css("position");
                        } while ((outer && pos !== "absolute" && pos !== "relative") || outer === false);


                        return re;
                    }
                }, HiddenBase);


        $.fn.extend({
            SingleComboxInit: function (setting) {
                setting=setting || {};
                return this.each(function () {
                    new SingleCombox({ element: this , onChange : setting.onChange }).initialize();
                });
            }});

        return SingleCombox;

    });