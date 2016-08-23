/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(
    [
        'Class',
        './baseClass/WidgetBase'
    ],
    function (Class, WidgetBase) {
        var ClassName = "Control.Tree";

        var Tree =
            Class(ClassName, {
                constructor: function (args) {
                    this.callParent(args);
                    this.$TreeContainer=$(args.element);
                },
                initialize: function () {
                    var self=this;
                    this.callParent();
                    var tree=[];
                    this.setting.deep=0;
                    this.cache={};
                    this.create($.grep(this.setting.data,function(item){ return item.hasOwnProperty("pid") },true),tree,this.setting.deep)
                    this.$TreeContainer.append($.map(tree,function(n,i){
                        var last=n[0]==self.setting.deep,
                            head= (last ?"<li data-index=\""+i+"\" data-end><a href=\"javascript:;\">":"<li class=\"close\" data-index=\""+i+"\"><i></i>"),
                            footer=(last?"</a></li>":"</li>"),node=n[2];
                        self.cache[i]=node;
                        switch(n[1]){
                            case self.NodeType.HC:
                                return head+node.name+"<ul>"+footer;
                            case self.NodeType.HCE:
                                return "</li></ul>"
                            case self.NodeType.NC:
                                return head+node.name+footer;
                        }
                    }).join(""));
                    this.$TreeContainer.on("toggle.onItemToggle","li,li",function(e){
                        var $this=$(this);
                        if($(this).hasClass("open")) {
                            $this.removeClass("open").addClass("close").find("ul:first").hide();
                        }
                        else if($(this).hasClass("close")) {
                            $this.removeClass("close").addClass("open").find("ul:first").show();
                        }
                        e.stopPropagation();
                    });
                    this.$TreeContainer.off("click.onItemClick").on("click.onItemClick","li",function(e){
                        var $this=$(this),index=$this.attr("data-index");
                        $this.trigger("toggle.onItemToggle");
                        if($.isFunction(self.setting.onItemClick)) self.setting.onItemClick.call(self,e,self.cache[index],self.$BaseEl.attr("id"));
                        e.stopPropagation();
                    })
                },
                NodeType:{
                    HC:"haschild",
                    NC:"nochild",
                    HCE:"haschildend"
                },
                create:function(nodes,arr,deep){
                    this.setting.deep=deep;
                    for(var i=0;i<nodes.length;i++)
                    {
                        var node=nodes[i],cnodes;
                        if((cnodes=$.grep(this.setting.data,function(item){ return item.pid==node.id })).length!=0)
                        {
                            arr.push([deep,this.NodeType.HC,node])
                            arguments.callee.call(this,cnodes,arr,deep+1);
                            arr.push([deep,this.NodeType.HCE]);
                        }
                        else
                        {
                            arr.push([deep,this.NodeType.NC,node]);
                        }
                    }
                }
            }, WidgetBase);

        $.fn.extend({
            TreeInit: function (option) {
                return this.each(function(){
                    new Tree({element: this, setting: option}).initialize();;
                })
            }
        })

        return Tree;
    });