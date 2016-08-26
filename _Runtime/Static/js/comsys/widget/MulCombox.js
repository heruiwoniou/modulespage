/**
 * Author:Herui;
 * CreateDate:2016/2/15
 *
 * Describe:
 */
define([
    'Class',
    './baseClass/HiddenBase',
    './baseClass/LabelBase',
    "TPLEngine",
    'jquery.ui/ui/draggable',
    'common/setting'

],function(Class,HiddenBase,LabelBase,TPLEngine,Draggable,Setting){
    var ClassName = "Controll.MulCombox";
    var MulCombox= Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            this.options=[];
            this.$GroupInputs=args.element;
            this.setting.lineHeight= this.setting.lineHeight || 27;
            this.setting.dropLength=  this.setting.dropLength || 4
            for(var i=0;i<this.$GroupInputs.length;i++) {
                var data=$(this.$GroupInputs[i]).data("Control.CheckBox");
                if(data!=undefined) data.destory();
                var option=new LabelBase({element: this.$GroupInputs[i],setting:{ index:i } });
                option.$BaseEl.data("index",i);
                option.initialize();
                this.options.push(option);
            }
        },
        TPL:{
            layout:'<div class="comsys-base comsys-MulCombox-layout" id="MulCombox-<%= this.classids%>">@{layout}@</div>',
            main:'@{layout:this.TPL.layout,this}@'+
                        '<div class="comsys-MulCombox-input">'+
                            '<div class="comsys-MulCombox-drag">' +
                                '<%for(var i=0;i<this.options.length;i++){%>'+
                                    '<%if(this.options[i].$BaseEl[0].checked){%>'+
                                        '@{section:this.TPL.labelOption,this.options[i]}@'+
                                    '<%}%>'+
                                '<%}%>'+
                            '</div><input type="text" readonly noTextBox/>'+
                        '</div>'+
                        '<div class="comsys-MulCombox-button"></div>'+
                    '@{section:this.TPL.drop,this}@',
            drop:'<div class="comsys-combox-base comsys-MulCombox-drop" id="MulCombox-drop-<%= this.classids%>"><%for(var i=0;i<this.options.length;i++){%>@{section:this.TPL.option,this.options[i]}@<%}%></div>',
            labelOption:'<span data-index="<%=this.setting.index%>"><%=this.$BaseEl.attr("data-label")%><b></b></span>',
            option:'<div class="comsys-base comsys-MulCombox-option<%=this.$BaseEl[0].checked?" selected":""%>" data-index="<%=this.setting.index%>"><div class="before"></div><%=this.$BaseEl.attr("data-label")%></div>'
        },
        keyCode: {
            ESC:27,
            TAB:9,

            SPACE: 32,
            DOWN: 40,
            ENTER: 13,
            UP: 38,
            SHOW: 540
        },
        initialize: function () {
            var me=this;
            this.state=false;
            this.$MulComboxController=$(TPLEngine.render(this.TPL.main, this));
            if(this.$GroupInputs.length!==0)
                this.options[this.options.length-1].$LabelContainer.after(this.$MulComboxController);
            this.draggable=null;

            this.$MulComboxDrag=this.$MulComboxController.find(".comsys-MulCombox-drag");
            this.$MulComboxDrop=this.$MulComboxController.find(".comsys-MulCombox-drop");
            this.$MulComboxButton=this.$MulComboxController.find(".comsys-MulCombox-button");
            this.$MulComboxFocusInput=this.$MulComboxController.find("input:text");
            $(document.body).append(this.$MulComboxDrop);

            if(Setting.Navigator.IsBackCompat)
            {
                this.$MulComboxDrag.css({paddingTop:"2px"});
            }

            this.$MulComboxFocusInput.on("keydown",function(e){  return me._OnKeyDown.apply(me,arguments); });
            this.$MulComboxDrag.on("mousedown.ToFocusInput",function(){ me.$MulComboxFocusInput.focus();});
            this.$MulComboxDrag.on("click.OnLabelOptionClose","span b",function(){ return me._OnLabelOptionClose.apply(me,[this].concat(Array.prototype.slice.call(arguments,0))); })
            this.$MulComboxButton.on('click.OnButtonClick',function(){ return me._OnButtonClick.apply(me,arguments)});
            this.$MulComboxDrop.bind("otherhide",function(){return me._OnOtherClick.apply(me,arguments);});
            this.$MulComboxDrop.get(0).onmousewheel = function () { return me._OnMouseWheel.apply(me, Array.prototype.slice.call(arguments,0).concat(this)); }
            this.$HiddenBaseElContainer
            .off(".mulComboxChange")
            .on("combox-change.mulComboxChange","input:checkbox",function(){return me._ComboxChange.apply(me,Array.prototype.slice.call(arguments,0).concat(this));});
            this.$HiddenBaseElContainer.off("checked").on("check","input:checkbox",function(){
                return me._check.apply(me,Array.prototype.slice.call(arguments,0).concat(this));
            });
            this.$HiddenBaseElContainer.off("uncheck").on("uncheck","input:checkbox",function(){
                return me._uncheck.apply(me,Array.prototype.slice.call(arguments,0).concat(this));
            });
            this.$MulComboxDrop.on("click.OnOptionClick",".comsys-MulCombox-option",function(){
                return me._OnOptionClick.apply(me,Array.prototype.slice.call(arguments,0).concat(this));})

            this._AddMouseBehavior();
            this.addPlaceHolder(this.$MulComboxController);
        },

        addPlaceHolderBefore:function(){
            for(var i=0;i<this.options.length;i++)
                this.$HiddenBaseElContainer.append(this.options[i].$LabelContainer);
        },
        _check:function(e,el){
            var $el=$(el),
            index=$el.data("index");
            if(!el.checked){
                this.$MulComboxDrop.find(".comsys-MulCombox-option:eq('"+ index +"')").addClass("selected");
                $el.trigger("combox-change.mulComboxChange",["Option" , index , true]);
            }
        },
        _uncheck:function(e,el){
            var $el=$(el),
            index=$el.data("index");
            if(el.checked) {
                this.$MulComboxDrop.find(".comsys-MulCombox-option:eq('"+ index +"')").removeClass("selected");
                $el.trigger("combox-change.mulComboxChange",["Option",index,false]);
            }
        },
        _OnOptionClick:function(e,el){
            var $option=$(el),state=false;
            var index=$option.attr("data-index");
            this.$MulComboxDrop.find(".hover").removeClass("hover");
            if($option.hasClass("selected"))
            {
                state=false;
                $option.removeClass("selected");
            }
            else
            {
                state=true;
                $option.addClass("selected");
            }
            $option.addClass("hover");
            var $input= this.options[index].$BaseEl;
            $input.trigger("combox-change.mulComboxChange",["Option",index,state]);
            this.$MulComboxFocusInput.focus();
        },
        _ComboxChange:function(e,type,index,state,el){
            $(el).trigger("click");
            switch(type)
            {
                case "Option":
                    if(el.checked)
                        this._AddLabelOption(el.getAttribute("data-label"),index);
                    else
                        this.$MulComboxDrag.find("span[data-index=" + index + "] b").trigger("click.OnLabelOptionClose",true);
                    break;
                case "Label":
                    this.$MulComboxDrop.find("div.comsys-MulCombox-option[data-index=" + index + "]").removeClass("selected");
                    break;
            }
        },
        _AddLabelOption:function(name,index){
            if(this.$MulComboxDrag.find("span[data-index='"+index+"']:contains('"+name+"')").length==0)
                this.$MulComboxDrag.append('<span data-index="'+index+'">'+name+'<b></b></span>');
            this._Scroll(this._GetUI(),true);
        },
        _DropHide: function () {
            var me = this;
            if(!me.state) return;
            me.$MulComboxDrop.hide();
            me.state = false;
            me.$MulComboxDrop.find(".hover").removeClass("hover");
            $(document).off(".outerClickListener");
        },
        _OnOtherClick:function(){
            this.state=false;
        },
        _OnOtherAreaClick:function(e){
            var me=this;
            var $t=$(e.target|| e.toElement),
                $d=$t.closest(".comsys-combox-base"),
                $b=$t.closest(".comsys-MulCombox-button"),
                $did=$d.attr("id"),
                $tdid="MulCombox-drop-"+me.classids;

            if($d.length==0&&$b.length==0||($d.length!=0&&$did!=$tdid)||$b.length!=0&&$b[0]!=me.$MulComboxButton[0])
            {
                me._DropHide();
                return;
            }
        },
        _OnButtonClick:function(e,isFilter,type){
            var me=this;
            var offset = me.$MulComboxController.offset();
            var isfirstShow=false;
            if(!this.state)
            {
                me.$MulComboxFocusInput.focus();
                $("div.comsys-combox-base:visible").hide().trigger("otherhide");
                me.$MulComboxDrop.css({
                    left: -99999,
                    maxHeight: me.setting.lineHeight * me.setting.dropLength
                }).show();
                me.$MulComboxDrop.css({
                    minWidth: me.$MulComboxController.width() + 2 - (Setting.Navigator.LowIEOrNoIE || (me.$MulComboxDrop.get(0).scrollHeight < me.$MulComboxDrop.get(0).offsetHeight) ? 0 : 17),
                    left: offset.left,
                    top: offset.top + me.$MulComboxController.height() + 4
                });
                me.state = true;
                isfirstShow=true;
                $(document).off(".outerClickListener").on("mousedown.outerClickListener",function(){return me._OnOtherAreaClick.apply(me,arguments);});
            }
            else if(!isFilter&&this.state)
            {
                me._DropHide();
            }
            me._OptionPosition(!isFilter&me.state || isFilter&&isfirstShow ? me.keyCode.SHOW : type);
        },
        _OptionPosition:function(type){
            var me = this,next;
            var obj = (me.$MulComboxDrop.find(".hover:first").length==0?
                me.$MulComboxDrop.find(".selected:first").length==0?
                    me.$MulComboxDrop.find(".comsys-MulCombox-option:first"):
                    me.$MulComboxDrop.find(".selected:first"):
                me.$MulComboxDrop.find(".hover:first")).get(0);
            var drop = me.$MulComboxDrop.get(0);
            if (!obj) { drop.scrollTop = 0; return; }
            var top = obj.offsetTop;
            switch (type) {
                case me.keyCode.DOWN:
                    next=me.$MulComboxDrop.find(".hover").removeClass("hover").next();
                    if (next.length!=0) {
                        if (drop.scrollTop + drop.offsetHeight - 2 <= top + obj.offsetHeight) drop.scrollTop = top - drop.offsetHeight + 2 * obj.offsetHeight;
                    }
                    else {
                        drop.scrollTop = 0;
                        next=me.$MulComboxDrop.find('.comsys-MulCombox-option:first');
                    }
                    next.addClass("hover");
                    break;
                case me.keyCode.UP:
                    next=me.$MulComboxDrop.find(".hover").removeClass("hover").prev();
                    if (next.length!=0) {
                        if (drop.scrollTop + 2 > top) drop.scrollTop = top - obj.offsetHeight;
                    }
                    else {
                        drop.scrollTop = drop.scrollHeight;
                        next=me.$MulComboxDrop.find('.comsys-MulCombox-option:last');
                    }
                    next.addClass("hover");
                    break;
                case me.keyCode.SHOW:
                default:
                    drop.scrollTop = top;
                    $(obj).addClass("hover");
                    break;
            }
        },
        _OnMouseWheel: function (e,scroller) {
            var me = this;
            var k = e.wheelDelta ? e.wheelDelta / 120 * me.setting.lineHeight : -e.detail;
            scroller.scrollTop = scroller.scrollTop - k;
            return false;
        },
        _OnKeyDown:function(e){
            switch (e.keyCode) {
                case this.keyCode.DOWN:
                case this.keyCode.UP:
                    this.$MulComboxButton.trigger("click.OnButtonClick",[true,e.keyCode, false]);
                    e.stopPropagation();
                    e.cancelBubble = true;
                    return false;
                    break;
                case this.keyCode.SPACE:
                case this.keyCode.ENTER:
                    this.$MulComboxDrop.find(".hover").trigger("click.OnOptionClick");
                    e.stopPropagation();
                    e.cancelBubble = true;
                    return false;
                case this.keyCode.ESC:
                    this._DropHide();
                    e.stopPropagation();
                    e.cancelBubble = true;
                    return false;
                case this.keyCode.TAB:
                    this._DropHide();
                    return true;
            }
        },
        _OnLabelOptionClose:function(el,e,istrigger){
            var me=this;
            var $this=$(el),$span=$this.closest('span');
            if(!istrigger)
            {
                var index=$span.attr("data-index")
                this.options[index].$BaseEl.trigger("combox-change.mulComboxChange",["Label",index,false]);
            }
            if(this.setting.animate) {
                $this.hide();
                $span.addClass("label-option-remove").hide(function () {
                    $span.remove();
                    me._Scroll(me._GetUI());
                });
            }else{
                $span.remove();
                me._Scroll(me._GetUI());
            }
        },
        _GetUI:function(){
            return {
                helper: this.$MulComboxDrag,
                position: this.$MulComboxDrag.position()
            }
        },
        _Scroll:function(ui,append){
            if(ui.helper.is(":animated"))ui.helper.finish();
            var scw = ui.helper[0].scrollWidth;
            var pw = ui.helper.parent().width();
            var w=ui.helper.width();
            var split= - ( scw - pw );

            if(append&&scw > pw||ui.position.left< split && scw > pw)
                ui.helper.animate({ left: split });
            else if(ui.position.left > 0 || w < pw) ui.helper.animate({ left:0 });
        },
        _AddMouseBehavior:function()
        {
            this.draggable=Draggable({
                axis:"x",
                distance:"5",
                stop: function( event, ui ) {
                    var scw = ui.helper[0].scrollWidth;
                    var w=ui.helper.width();
                    var pw = ui.helper.parent().width();
                    var split= - ( scw - pw );
                    if(ui.position.left< split && scw > pw)
                        ui.helper.animate({ left: split });
                    else if(ui.position.left > 0 || w < pw) ui.helper.animate({ left:0 });
                }
            }, this.$MulComboxDrag);
        }
    }, HiddenBase);

    $.fn.extend({
        MulComboxInit: function () {
            new MulCombox({ element: this,setting:{animate:false} }).initialize();
        }});

    return MulCombox;
})