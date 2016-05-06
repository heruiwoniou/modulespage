/**
 * Author:Herui;
 * CreateDate:2016/2/15
 *
 * Describe: Drop down menu
 */

define(
    [
        "jquery",
        'Class',
        "jquery.ui/ui/menu",
        "comsys/base/Base"
    ],
    function($,Class,Menu,Base){
        var ClassName = "Control.DropMenus";

        var DropMenus= Class(ClassName,{
            constructor:function(args){
                this.callParent(args);
                this.$DropMenusEl = $(args.element);
                this.$DropMenuEl=$(args.menu);
            },
            initialize:function(){
                if (this.$DropMenusEl.data(ClassName) == undefined) {
                    var $menu = this.$DropMenuEl;
                    this.$DropMenusEl.off(".DropMenusClickHandler").on("click.DropMenusClickHandler", function (e) {
                        var $this = $(this);
                        var menu = $this.data("menu") || Menu({
                                select:function(event,ui) {
                                    if (ui.item.find("ul").length !== 0) return true;
                                    menu.collapseAll(null,true);
                                    window.setTimeout(function() {
                                        $menu.hide();
                                        $(document).off(".DropMenusGlobalClickHandler");
                                    }, menu.delay + 1);
                                    return false;
                                }
                            }, $menu);
                        menu.delay=0;

                        var position = $this.position();
                        $menu.css({
                            left: position.left - 5, top: position.top + $this.height() + 5
                        });
                        if (!$menu.is(":visible")) {
                            menu.collapseAll(null,true);
                            $menu.show();
                            e.stopPropagation();
                            $(document).off(".DropMenusGlobalClickHandler").on("click.DropMenusGlobalClickHandler",function(ex){
                                if($(ex.target).closest(".comsys-menu").length!=0) return true;
                                menu.collapseAll(null,true);
                                $menu.hide();
                                $(document).off(".DropMenusGlobalClickHandler");
                            });
                        } else {
                            $menu.hide();
                            $(document).off(".DropMenusGlobalClickHandler");
                        }
                    });

                    this.$DropMenusEl.data(ClassName, this);
                }
                return this;
            }
        },Base)


        $.fn.extend({
            MenusInit:function(){
                return this.each(function () {
                    var $this=$(this);
                    new DropMenus({ element: this, menu: $("#"+$this.attr("menu-id")) }).initialize();
                });
            }
        })

        return DropMenus;
    });