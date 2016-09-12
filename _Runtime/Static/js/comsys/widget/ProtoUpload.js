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
        'Static/js/libs/jquery.form/jquery.form'
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
                var $target = that.setting.target ? $('#'+that.setting.target) : null;
                var callback = that.setting.onuploaded ? new Function('isNew','image','if(' + that.setting.onuploaded + ') ' + that.setting.onuploaded + '(isNew, image);'):function(){ }
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
                        var isNew = ( $wrap.find('img').length == 0 );
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
                            if($target) $target.val(image);
                            callback(isNew,image);
                        }).fail(function(message){
                            if($target) $target.val('');
                            callback(isNew,'')
                        });
                    });

                    $this.data(ClassName, this);
                }
            }
        }, Base);

        $.fn.extend({
            ProtoUploadInit: function () {
                return this.each(function () {
                    new ProtoUpload({ element: this ,setting: { target : $(this).attr('cs-target') || '', onuploaded: $(this).attr('cs-onuploaded') || '' }}).initialize();
                }).removeAttr('cs-control');;
            }});

        return ProtoUpload;

    });