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
        "comsys/base/Base",
        "client/ComsysFileReader",
        'libs/jquery.form/jquery.form'
    ], function (Core, Class, Base, FileReader) {
        var ClassName = "Control.ProtoUpload";

        var ProtoUpload=Class(ClassName, {
            constructor: function (args) {
                this.callParent(args);
                this.$element = $(args.element);
            },
            initialize: function () {
                var that = this;
                var $this = this.$element;
                var fileReader = new FileReader()
                var $target = $('#'+that.setting.target)
                if ($this.data(ClassName) == undefined) {
                    var $wrap = this.$wrap = $("<div class=\"comsys-base comsys-ProtoUpload\"></div>");
                    var $form = $('<form enctype=\"multipart/form-data\" method=\"POST\"></form>');
                    $form.appendTo($wrap)
                    $this.before($wrap).appendTo($form);

                    $this.off(".ProtoUploadfocus").on('focus',function(){
                        $wrap.addClass('focus-outerline');
                    }).on('focusout.ProtoUploadfocus',function(){
                        $wrap.removeClass('focus-outerline');
                    })
                    $this.off(".ProtoUploadChangeEvent").on("change.ProtoUploadChangeEvent", function () {
                        fileReader.read($this.get(0)).then(function(image){
                            var o = new Image();
                            o.onload=function(){
                                $wrap.find('img').remove()
                                if(o.width>o.height)
                                {
                                    o.style.width="100%"
                                }else {
                                    o.style.height="100%";
                                }
                                $wrap.append(o);
                            };
                            o.src = image;
                            $target.val(image);
                        }).fail(function(message){
                            $target.val('');
                        });
                    });

                    $this.data(ClassName, this);
                }
            }
        }, Base);

        $.fn.extend({
            ProtoUploadInit: function () {
                return this.each(function () {
                    new ProtoUpload({ element: this ,setting: { target : $(this).attr('cs-target')}}).initialize();
                }).removeAttr('cs-control');;
            }});

        return ProtoUpload;

    });