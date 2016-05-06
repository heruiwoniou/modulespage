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
                    var node=Setting.LabelSetting.getNode(nodes[i]);
                    if (Setting.LabelSetting.check(node)) {
                        this.$BaseEl.attr("data-label", $.trim(Setting.LabelSetting.get(node)));
                        this.$LabelContainer.append(node);
                    }
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