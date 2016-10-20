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
        "./baseClass/WidgetBase",
        "client/ComsysFileReader",
        'Static/js/libs/jquery.form/jquery.form'
    ],
    function(Core, Class, WidgetBase, FileReader) {
        var ClassName = "Control.ProtoUpload";

        var ProtoUpload = Class(ClassName, {
            constructor: function(args) {
                this.callParent(args);
                this.$element = $(args.element);
            },
            initialize: function() {
                var that = this;
                var $this = this.$element;
                if ($this.data(ClassName) == undefined) {
                    this.callParent();
                    var $wrap = this.$wrap = $("<div class=\"comsys-base comsys-ProtoUpload empty\"></div>");
                    var $close = this.$close = $("<a href='javascript:;'>x</a>");
                    $wrap.css({
                        height: that.setting.height,
                        width: that.setting.width,
                        lineHeight: that.setting.height + 'px'
                    })
                    var $form = $('<form enctype=\"multipart/form-data\" method=\"POST\"></form>');
                    $close.appendTo($wrap);
                    $form.appendTo($wrap)
                    $this.before($wrap).appendTo($form);

                    $this.off(".ProtoUploadfocus").on('focus', function() {
                        $wrap.addClass('focus-outerline');
                    }).on('focusout.ProtoUploadfocus', function() {
                        $wrap.removeClass('focus-outerline');
                    })
                    $close.on('click', function() {
                        that.empty();
                    })
                    $this.off(".ProtoUploadChangeEvent").on("change.ProtoUploadChangeEvent", function() {
                        $this.trigger('loadimage', false);
                    });
                    $this.on('loadimage', function(e, status) {
                        that.loadimage(status);
                    })

                    $this.data(ClassName, this);
                    that.loadimage(true)
                } else {
                    that.$element.trigger('loadimage', true);
                }
            },
            loadimage: function(status) {
                var that = this;
                var $this = this.$element;
                var $wrap = that.$wrap;
                var $target = that.setting.target ? $('#' + that.setting.target) : null;
                var path = status && $target ? $target.val() : "";
                var callback = that.setting.onuploaded ? new Function('isNew', 'image', 'if(' + that.setting.onuploaded + ') ' + that.setting.onuploaded + '.call(this,isNew, image);') : function() {}
                var isNew = ($wrap.find('img').length == 0);
                var fileReader = new FileReader();
                var load = function(src) {
                    var o = new Image();
                    var $img = $(o);
                    var cw = $wrap.width();
                    var ch = $wrap.height();
                    var c = cw / ch;
                    o.onload = function() {
                        $wrap.find('img').remove()
                        var rh = o.naturalHeight || o.height;
                        var rw = o.naturalWidth || o.width;
                        var r = rw / rh;
                        if (that.setting.full === '0') {
                            if (c > r) {
                                $img.attr("height", "100%");
                            } else {
                                $img.attr("width", "100%");
                            }
                        } else {
                            $wrap.css({
                                position: 'relative',
                                overflow: 'hidden'
                            });
                            if (c == r) {
                                $img.attr({ width: '100%' });
                                $img.css({
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                })
                            } else if (c > r) {
                                $img.attr({ width: '100%' })
                                var realheight = cw * rh / rw
                                $img.css({
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    marginTop: -1 * realheight / 2 + 'px'
                                })
                            } else if (c < r) {
                                $img.attr({ height: '100%' })
                                var realwidth = rw * ch / rh;
                                $img.css({
                                    position: 'absolute',
                                    left: '50%',
                                    top: 0,
                                    marginLeft: -1 * realwidth / 2 + 'px'
                                })
                            }
                        }
                        $wrap.append(o).removeClass('empty');
                    };
                    o.src = src;
                }
                if (path) {
                    load(path);
                } else {
                    if (!$this.get(0).value) return;
                    fileReader.read($this.get(0)).then(function(image) {
                        load(image);
                        if ($target) $target.val(image);
                        callback.call($this, isNew, image);
                    }).fail(function(message) {
                        if ($target) $target.val('');
                        callback.call($this, isNew, '')
                    });
                }
            },
            empty: function() {
                var $target = this.setting.target ? $('#' + this.setting.target) : null;
                if ($target) $target.val('');
                this.$element.val('');
                this.$wrap.addClass('empty').find('img').remove();
            }
        }, WidgetBase);

        $.fn.extend({
            ProtoUploadInit: function() {
                return this.each(function() {
                    var $this = $(this);
                    new ProtoUpload({
                        element: this,
                        setting: {
                            width: ~~$this.attr('cs-width') || 100,
                            height: ~~$this.attr('cs-height') || 100,
                            target: $this.attr('cs-target') || '',
                            onuploaded: $this.attr('cs-onuploaded') || '',
                            full: $this.attr('cs-full') || ''
                        }
                    }).initialize();
                }).removeAttr('cs-control');;
            }
        });

        return ProtoUpload;

    });