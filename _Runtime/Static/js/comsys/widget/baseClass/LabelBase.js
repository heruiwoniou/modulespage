/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */
define([
    "Class",
    "./WidgetBase",
    "common/setting"
],function(Class,WidgetBase,Setting){
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
                var location = this.$BaseEl.attr('cs-label-location') || "right";
                if ($parent[0].nodeName != "LABEL") {
                    var i = 0, nodes = $parent[0].childNodes, o;
                    do {
                    } while ((o = nodes[i++]) && o != this.$BaseEl[0]);
                    this.$BaseEl.after(this.$LabelContainer).appendTo(this.$LabelContainer);
                    this.$LabelText = Setting.LabelSetting.getNode(nodes[i]);

                    this.$BaseEl.attr("data-label", $.trim(Setting.LabelSetting.get(this.$LabelText)));
                }
                else {
                    if($parent[0].childNodes.length>=2)
                    {
                        this.$BaseEl.attr("data-label", $.trim(Setting.LabelSetting.get($parent[0].childNodes[1])));
                        this.$LabelText=Setting.LabelSetting.getNode($parent[0].childNodes[1])
                    }else {
                        this.$LabelText=document.createTextNode('');
                    }
                    this.$LabelContainer = $parent;

                }

                if(location === "left")
                    this.$LabelContainer.prepend(this.$LabelText);
                else
                    this.$LabelContainer.append(this.$LabelText);
                this.$LabelContainer.addClass("location-" + location);

                //如果含有cs-label-on/cs-label-off则替换内容
                this.label=this.$BaseEl.attr("cs-label") || $.trim(Setting.LabelSetting.get(this.$LabelText));
                this.on = this.$BaseEl.attr("cs-label-on");
                this.off=this.$BaseEl.attr("cs-label-off");
                if(this.label||this.on||this.off)
                {
                    if(this.$BaseEl.is(":checked"))
                        Setting.LabelSetting.set(this.$LabelText,this.on || this.label)
                    else
                        Setting.LabelSetting.set(this.$LabelText,this.off || this.label)
                }

                return this;
            }else return data;
        }
    },WidgetBase)
})