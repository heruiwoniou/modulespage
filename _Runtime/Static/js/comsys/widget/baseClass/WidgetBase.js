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
        'comsys/base/Base'
    ],function($,Class,Base){
        return Class("Control.WidgetBase",{
            constructor: function (args) {
                this.callParent(args);
                this.$BaseEl = $(args.element);
            },
            initialize: function () {
                if(!this.$BaseEl.attr("id")) this.$BaseEl.attr("id",this.classids);
                return this;
            }
        },Base)
    });