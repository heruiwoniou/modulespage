/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
define([
    "jquery",
    "Class",
    "./WidgetBase",
    "common/setting"
],function($,Class,WidgetBase,Setting){
    var ClassName = "Control.LabelBase";
    return Class(ClassName,{
        constructor: function (args) {
            this.callParent(args);
        },
        initialize: function () {
            this.callParent();
            var id=this.$BaseEl.attr("id");
            this.$LabelText=null;
            if(id&&this.$BaseEl.parent().find("label[for="+id+"]").length!=0) {
                this.$LabelContainer = this.$BaseEl.parent().find("label[for=" + id + "]");
                return this.moveLabel();
            }
            else {
                this.$LabelContainer = $("<label for=\"" + this.$BaseEl.attr("id") + "\"></label>");
                return this.wrapLabel();
            }
        },
        moveLabel:function(){
            var data=this.$BaseEl.data(ClassName);
            if ( data== undefined) {
                this.$BaseEl.after(this.$LabelContainer).appendTo(this.$LabelContainer);
            }else return data;
        },
        wrapLabel:function(){
            var $parent=this.$BaseEl.parent();
            var data=this.$BaseEl.data(ClassName);
            if ( data== undefined) {
                if ($parent[0].nodeName != "LABEL") {
                    var i = 0, nodes = $parent[0].childNodes, o;
                    do {
                    } while ((o = nodes[i++]) && o != this.$BaseEl[0]);
                    this.$BaseEl.after(this.$LabelContainer).appendTo(this.$LabelContainer);
                    this.$LabelText=Setting.LabelSetting.getNode(nodes[i]);

                    //如果含有data-label-on/data-label-off则替换内容
                    this.label=this.$BaseEl.data("label") || $.trim(Setting.LabelSetting.get(this.$LabelText));
                    this.on = this.$BaseEl.data("label-on");
                    this.off=this.$BaseEl.data("label-off");
                    if(this.label||this.on||this.off)
                    {
                        if(this.$BaseEl.is(":checked"))
                            Setting.LabelSetting.set(this.$LabelText,this.on || this.label)
                        else
                            Setting.LabelSetting.set(this.$LabelText,this.off || this.label)
                    }

                    this.$BaseEl.attr("data-label", $.trim(Setting.LabelSetting.get(this.$LabelText)));
                    this.$LabelContainer.append(this.$LabelText);
                }
                else {
                    if($parent[0].childNodes.length>=2)
                        this.$BaseEl.attr("data-label", $.trim(Setting.LabelSetting.get($parent[0].childNodes[1])));
                    this.$LabelContainer = $parent;
                }
                return this;
            }else return data;
        }
    },WidgetBase)
})