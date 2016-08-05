/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame wrap upload input
*/

define(
    [
        'Core',
        'Class',
        "comsys/base/Base"
    ], function (Core, Class, Base) {
        var ClassName = "Control.ProtoUpload";

        var ProtoUpload=Class(ClassName, {
            constructor: function (args) {
                this.callParent(args);
                this.$element = $(args.element);
            },
            initialize: function () {
                var $this = this.$element;
                if ($this.data(ClassName) == undefined) {
                    var $wrap = $("<div class=\"comsys-base comsys-ProtoUpload\"><div></div><span></span></div>");
                    $this.before($wrap).appendTo($wrap);

                    $this.off(".ProtoUploadChangeEvent").on("change.ProtoUploadChangeEvent", function () {
                        $wrap.find("div").html($this.val());
                    });

                    $this.data(ClassName, this);
                }
            }
        }, Base);

        $.fn.extend({
            ProtoUploadInit: function () {
                return this.each(function () {
                    new ProtoUpload({ element: this }).initialize();
                });
            }});

        return ProtoUpload;

    });