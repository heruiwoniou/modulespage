define('css', [], function () {
    if (typeof window == 'undefined')
        return {
            load: function (n, r, load) {
                load();
            }
        };
    var head = document.getElementsByTagName('head')[0];
    var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;
    var useImportLoad = false;
    var useOnload = true;
    if (engine[1] || engine[7])
        useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
    else if (engine[2] || engine[8])
        useOnload = false;
    else if (engine[4])
        useImportLoad = parseInt(engine[4]) < 18;
    var cssAPI = {};
    cssAPI.pluginBuilder = './css-builder';
    var curStyle, curSheet;
    var createStyle = function () {
        curStyle = document.createElement('style');
        head.appendChild(curStyle);
        curSheet = curStyle.styleSheet || curStyle.sheet;
    };
    var ieCnt = 0;
    var ieLoads = [];
    var ieCurCallback;
    var createIeLoad = function (url) {
        curSheet.addImport(url);
        curStyle.onload = function () {
            processIeLoad();
        };
        ieCnt++;
        if (ieCnt == 31) {
            createStyle();
            ieCnt = 0;
        }
    };
    var processIeLoad = function () {
        ieCurCallback();
        var nextLoad = ieLoads.shift();
        if (!nextLoad) {
            ieCurCallback = null;
            return;
        }
        ieCurCallback = nextLoad[1];
        createIeLoad(nextLoad[0]);
    };
    var importLoad = function (url, callback) {
        if (!curSheet || !curSheet.addImport)
            createStyle();
        if (curSheet && curSheet.addImport) {
            if (ieCurCallback) {
                ieLoads.push([
                    url,
                    callback
                ]);
            } else {
                createIeLoad(url);
                ieCurCallback = callback;
            }
        } else {
            curStyle.textContent = '@import "' + url + '";';
            var loadInterval = setInterval(function () {
                try {
                    curStyle.sheet.cssRules;
                    clearInterval(loadInterval);
                    callback();
                } catch (e) {
                }
            }, 10);
        }
    };
    var linkLoad = function (url, callback) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        if (useOnload)
            link.onload = function () {
                link.onload = function () {
                };
                setTimeout(callback, 7);
            };
        else
            var loadInterval = setInterval(function () {
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var sheet = document.styleSheets[i];
                    if (sheet.href == link.href) {
                        clearInterval(loadInterval);
                        return callback();
                    }
                }
            }, 10);
        link.href = url;
        head.appendChild(link);
    };
    cssAPI.normalize = function (name, normalize) {
        if (name.substr(name.length - 4, 4) == '.css')
            name = name.substr(0, name.length - 4);
        return normalize(name);
    };
    cssAPI.load = function (cssId, req, load, config) {
        (useImportLoad ? importLoad : linkLoad)(req.toUrl(cssId + '.css'), load);
    };
    return cssAPI;
});
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('Static/js/libs/jquery.easing/jquery.easing', [], factory);
    } else {
        factory(root.jQuery || root.Zepto);
    }
}(this, function () {
    $.extend($.easing, {
        def: 'easeOutQuad',
        swing: function (x, t, b, c, d) {
            return $.easing[$.easing.def](x, t, b, c, d);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t + b;
            return -c / 2 * (--t * (t - 2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t == 0)
                return b;
            if (t == d)
                return b + c;
            if ((t /= d / 2) < 1)
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1)
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (!p)
                p = d * 0.3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (!p)
                p = d * 0.3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0)
                return b;
            if ((t /= d / 2) == 2)
                return b + c;
            if (!p)
                p = d * (0.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1)
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined)
                s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined)
                s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined)
                s = 1.70158;
            if ((t /= d / 2) < 1)
                return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * (7.5625 * t * t) + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d / 2)
                return $.easing.easeInBounce(x, t * 2, 0, c, d) * 0.5 + b;
            return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    });
}));
require.config({ baseUrl: './' });
var WebApi = {};
define('Static/js/application', [
    'Content/js/common/util',
    'css',
    'Static/js/libs/jquery.easing/jquery.easing'
], function (util) {
    $.extend(WebApi, util);
    return {
        interface: function (action) {
            if (action) {
                $.extend(WebApi, action);
                if (WebApi.init() !== false)
                    util.init();
            } else
                util.init();
        },
        init: function () {
            var scripts = document.getElementsByTagName('script'), l = scripts.length, main;
            for (var i = 0; i < l; i++)
                if (main = scripts[i].getAttribute('data-business'))
                    break;
            if (main)
                require(['Content/js/modules_business/' + main], this.interface);
            else
                util.init();
        }
    };
});
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('Static/js/libs/jquery.mousewheel/jquery.mousewheel', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        factory();
    }
}(function () {
    var toFix = [
            'wheel',
            'mousewheel',
            'DOMMouseScroll',
            'MozMousePixelScroll'
        ], toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : [
            'mousewheel',
            'DomMouseScroll',
            'MozMousePixelScroll'
        ], slice = Array.prototype.slice, nullLowestDeltaTimeout, lowestDelta;
    if ($.event.fixHooks) {
        for (var i = toFix.length; i;) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }
    var special = $.event.special.mousewheel = {
        version: '3.1.12',
        setup: function () {
            if (this.addEventListener) {
                for (var i = toBind.length; i;) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },
        teardown: function () {
            if (this.removeEventListener) {
                for (var i = toBind.length; i;) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },
        getLineHeight: function (elem) {
            var $elem = $(elem), $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },
        getPageHeight: function (elem) {
            return $(elem).height();
        },
        settings: {
            adjustOldDeltas: true,
            normalizeOffset: true
        }
    };
    $.fn.extend({
        mousewheel: function (fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },
        unmousewheel: function (fn) {
            return this.unbind('mousewheel', fn);
        }
    });
    function handler(event) {
        var orgEvent = event || window.event, args = slice.call(arguments, 1), delta = 0, deltaX = 0, deltaY = 0, absDelta = 0, offsetX = 0, offsetY = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';
        if ('detail' in orgEvent) {
            deltaY = orgEvent.detail * -1;
        }
        if ('wheelDelta' in orgEvent) {
            deltaY = orgEvent.wheelDelta;
        }
        if ('wheelDeltaY' in orgEvent) {
            deltaY = orgEvent.wheelDeltaY;
        }
        if ('wheelDeltaX' in orgEvent) {
            deltaX = orgEvent.wheelDeltaX * -1;
        }
        if ('axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }
        delta = deltaY === 0 ? deltaX : deltaY;
        if ('deltaY' in orgEvent) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if ('deltaX' in orgEvent) {
            deltaX = orgEvent.deltaX;
            if (deltaY === 0) {
                delta = deltaX * -1;
            }
        }
        if (deltaY === 0 && deltaX === 0) {
            return;
        }
        if (orgEvent.deltaMode === 1) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if (orgEvent.deltaMode === 2) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }
        absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;
            if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                lowestDelta /= 40;
            }
        }
        if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
            delta /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }
        delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
        deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
        deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);
        if (special.settings.normalizeOffset && this.getBoundingClientRect) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        event.deltaMode = 0;
        args.unshift(event, delta, deltaX, deltaY);
        if (nullLowestDeltaTimeout) {
            clearTimeout(nullLowestDeltaTimeout);
        }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);
        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
    function nullLowestDelta() {
        lowestDelta = null;
    }
    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }
}));
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar', [
            'Static/js/libs/jquery.mousewheel/jquery.mousewheel',
            'css!Content/style/common/jquery.scrollbar/jquery.mCustomScrollbar'
        ], function () {
            factory();
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory;
    } else {
        factory(jQuery, window, document);
    }
}(function () {
    (function (init) {
        init();
    }(function () {
        var pluginNS = 'scrollBar', pluginPfx = 'mCS', defaultSelector = '.scroll-bar', defaults = {
                setTop: 0,
                setLeft: 0,
                axis: 'y',
                scrollbarPosition: 'inside',
                scrollInertia: 950,
                autoDraggerLength: true,
                alwaysShowScrollbar: 0,
                snapOffset: 0,
                mouseWheel: {
                    enable: true,
                    scrollAmount: 'auto',
                    axis: 'y',
                    deltaFactor: 'auto',
                    disableOver: [
                        'select',
                        'option',
                        'keygen',
                        'datalist',
                        'textarea'
                    ]
                },
                scrollButtons: {
                    scrollType: 'stepless',
                    scrollAmount: 'auto'
                },
                keyboard: {
                    enable: true,
                    scrollType: 'stepless',
                    scrollAmount: 'auto'
                },
                contentTouchScroll: 25,
                documentTouchScroll: true,
                advanced: {
                    autoScrollOnFocus: 'input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable=\'true\']',
                    updateOnContentResize: true,
                    updateOnImageLoad: 'auto',
                    autoUpdateTimeout: 60
                },
                theme: 'light',
                callbacks: {
                    onTotalScrollOffset: 0,
                    onTotalScrollBackOffset: 0,
                    alwaysTriggerOffsets: true
                }
            }, totalInstances = 0, liveTimers = {}, oldIE = window.attachEvent && !window.addEventListener ? 1 : 0, touchActive = false, touchable, classes = [
                'mCSB_dragger_onDrag',
                'mCSB_scrollTools_onDrag',
                'mCS_img_loaded',
                'mCS_disabled',
                'mCS_destroyed',
                'mCS_no_scrollbar',
                'mCS-autoHide',
                'mCS-dir-rtl',
                'mCS_no_scrollbar_y',
                'mCS_no_scrollbar_x',
                'mCS_y_hidden',
                'mCS_x_hidden',
                'mCSB_draggerContainer',
                'mCSB_buttonUp',
                'mCSB_buttonDown',
                'mCSB_buttonLeft',
                'mCSB_buttonRight'
            ], methods = {
                init: function (options) {
                    var options = $.extend(true, {}, defaults, options), selector = _selector.call(this);
                    if (options.live) {
                        var liveSelector = options.liveSelector || this.selector || defaultSelector, $liveSelector = $(liveSelector);
                        if (options.live === 'off') {
                            removeLiveTimers(liveSelector);
                            return;
                        }
                        liveTimers[liveSelector] = setTimeout(function () {
                            $liveSelector.mCustomScrollbar(options);
                            if (options.live === 'once' && $liveSelector.length) {
                                removeLiveTimers(liveSelector);
                            }
                        }, 500);
                    } else {
                        removeLiveTimers(liveSelector);
                    }
                    options.setWidth = options.set_width ? options.set_width : options.setWidth;
                    options.setHeight = options.set_height ? options.set_height : options.setHeight;
                    options.axis = options.horizontalScroll ? 'x' : _findAxis(options.axis);
                    options.scrollInertia = options.scrollInertia > 0 && options.scrollInertia < 17 ? 17 : options.scrollInertia;
                    if (typeof options.mouseWheel !== 'object' && options.mouseWheel == true) {
                        options.mouseWheel = {
                            enable: true,
                            scrollAmount: 'auto',
                            axis: 'y',
                            preventDefault: false,
                            deltaFactor: 'auto',
                            normalizeDelta: false,
                            invert: false
                        };
                    }
                    options.mouseWheel.scrollAmount = !options.mouseWheelPixels ? options.mouseWheel.scrollAmount : options.mouseWheelPixels;
                    options.mouseWheel.normalizeDelta = !options.advanced.normalizeMouseWheelDelta ? options.mouseWheel.normalizeDelta : options.advanced.normalizeMouseWheelDelta;
                    options.scrollButtons.scrollType = _findScrollButtonsType(options.scrollButtons.scrollType);
                    _theme(options);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if (!$this.data(pluginPfx)) {
                            $this.data(pluginPfx, {
                                idx: ++totalInstances,
                                opt: options,
                                scrollRatio: {
                                    y: null,
                                    x: null
                                },
                                overflowed: null,
                                contentReset: {
                                    y: null,
                                    x: null
                                },
                                bindEvents: false,
                                tweenRunning: false,
                                sequential: {},
                                langDir: $this.css('direction'),
                                cbOffsets: null,
                                trigger: null,
                                poll: {
                                    size: {
                                        o: 0,
                                        n: 0
                                    },
                                    img: {
                                        o: 0,
                                        n: 0
                                    },
                                    change: {
                                        o: 0,
                                        n: 0
                                    }
                                }
                            });
                            var d = $this.data(pluginPfx), o = d.opt, htmlDataAxis = $this.data('mcs-axis'), htmlDataSbPos = $this.data('mcs-scrollbar-position'), htmlDataTheme = $this.data('mcs-theme');
                            if (htmlDataAxis) {
                                o.axis = htmlDataAxis;
                            }
                            if (htmlDataSbPos) {
                                o.scrollbarPosition = htmlDataSbPos;
                            }
                            if (htmlDataTheme) {
                                o.theme = htmlDataTheme;
                                _theme(o);
                            }
                            _pluginMarkup.call(this);
                            if (d && o.callbacks.onCreate && typeof o.callbacks.onCreate === 'function') {
                                o.callbacks.onCreate.call(this);
                            }
                            $('#mCSB_' + d.idx + '_container img:not(.' + classes[2] + ')').addClass(classes[2]);
                            methods.update.call(null, $this);
                        }
                    });
                },
                update: function (el, cb) {
                    var selector = el || _selector.call(this);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if ($this.data(pluginPfx)) {
                            var d = $this.data(pluginPfx), o = d.opt, mCSB_container = $('#mCSB_' + d.idx + '_container'), mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_dragger = [
                                    $('#mCSB_' + d.idx + '_dragger_vertical'),
                                    $('#mCSB_' + d.idx + '_dragger_horizontal')
                                ];
                            if (!mCSB_container.length) {
                                return;
                            }
                            if (d.tweenRunning) {
                                _stop($this);
                            }
                            if (cb && d && o.callbacks.onBeforeUpdate && typeof o.callbacks.onBeforeUpdate === 'function') {
                                o.callbacks.onBeforeUpdate.call(this);
                            }
                            if ($this.hasClass(classes[3])) {
                                $this.removeClass(classes[3]);
                            }
                            if ($this.hasClass(classes[4])) {
                                $this.removeClass(classes[4]);
                            }
                            mCustomScrollBox.css('max-height', 'none');
                            if (mCustomScrollBox.height() !== $this.height()) {
                                mCustomScrollBox.css('max-height', $this.height());
                            }
                            _expandContentHorizontally.call(this);
                            if (o.axis !== 'y' && !o.advanced.autoExpandHorizontalScroll) {
                                mCSB_container.css('width', _contentWidth(mCSB_container));
                            }
                            d.overflowed = _overflowed.call(this);
                            _scrollbarVisibility.call(this);
                            if (o.autoDraggerLength) {
                                _setDraggerLength.call(this);
                            }
                            _scrollRatio.call(this);
                            _bindEvents.call(this);
                            var to = [
                                Math.abs(mCSB_container[0].offsetTop),
                                Math.abs(mCSB_container[0].offsetLeft)
                            ];
                            if (o.axis !== 'x') {
                                if (!d.overflowed[0]) {
                                    _resetContentPosition.call(this);
                                    if (o.axis === 'y') {
                                        _unbindEvents.call(this);
                                    } else if (o.axis === 'yx' && d.overflowed[1]) {
                                        _scrollTo($this, to[1].toString(), {
                                            dir: 'x',
                                            dur: 0,
                                            overwrite: 'none'
                                        });
                                    }
                                } else if (mCSB_dragger[0].height() > mCSB_dragger[0].parent().height()) {
                                    _resetContentPosition.call(this);
                                } else {
                                    _scrollTo($this, to[0].toString(), {
                                        dir: 'y',
                                        dur: 0,
                                        overwrite: 'none'
                                    });
                                    d.contentReset.y = null;
                                }
                            }
                            if (o.axis !== 'y') {
                                if (!d.overflowed[1]) {
                                    _resetContentPosition.call(this);
                                    if (o.axis === 'x') {
                                        _unbindEvents.call(this);
                                    } else if (o.axis === 'yx' && d.overflowed[0]) {
                                        _scrollTo($this, to[0].toString(), {
                                            dir: 'y',
                                            dur: 0,
                                            overwrite: 'none'
                                        });
                                    }
                                } else if (mCSB_dragger[1].width() > mCSB_dragger[1].parent().width()) {
                                    _resetContentPosition.call(this);
                                } else {
                                    _scrollTo($this, to[1].toString(), {
                                        dir: 'x',
                                        dur: 0,
                                        overwrite: 'none'
                                    });
                                    d.contentReset.x = null;
                                }
                            }
                            if (cb && d) {
                                if (cb === 2 && o.callbacks.onImageLoad && typeof o.callbacks.onImageLoad === 'function') {
                                    o.callbacks.onImageLoad.call(this);
                                } else if (cb === 3 && o.callbacks.onSelectorChange && typeof o.callbacks.onSelectorChange === 'function') {
                                    o.callbacks.onSelectorChange.call(this);
                                } else if (o.callbacks.onUpdate && typeof o.callbacks.onUpdate === 'function') {
                                    o.callbacks.onUpdate.call(this);
                                }
                            }
                            _autoUpdate.call(this);
                        }
                    });
                },
                scrollTo: function (val, options) {
                    if (typeof val == 'undefined' || val == null) {
                        return;
                    }
                    var selector = _selector.call(this);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if ($this.data(pluginPfx)) {
                            var d = $this.data(pluginPfx), o = d.opt, methodDefaults = {
                                    trigger: 'external',
                                    scrollInertia: o.scrollInertia,
                                    scrollEasing: 'mcsEaseInOut',
                                    moveDragger: false,
                                    timeout: 60,
                                    callbacks: true,
                                    onStart: true,
                                    onUpdate: true,
                                    onComplete: true
                                }, methodOptions = $.extend(true, {}, methodDefaults, options), to = _arr.call(this, val), dur = methodOptions.scrollInertia > 0 && methodOptions.scrollInertia < 17 ? 17 : methodOptions.scrollInertia;
                            to[0] = _to.call(this, to[0], 'y');
                            to[1] = _to.call(this, to[1], 'x');
                            if (methodOptions.moveDragger) {
                                to[0] *= d.scrollRatio.y;
                                to[1] *= d.scrollRatio.x;
                            }
                            methodOptions.dur = _isTabHidden() ? 0 : dur;
                            setTimeout(function () {
                                if (to[0] !== null && typeof to[0] !== 'undefined' && o.axis !== 'x' && d.overflowed[0]) {
                                    methodOptions.dir = 'y';
                                    methodOptions.overwrite = 'all';
                                    _scrollTo($this, to[0].toString(), methodOptions);
                                }
                                if (to[1] !== null && typeof to[1] !== 'undefined' && o.axis !== 'y' && d.overflowed[1]) {
                                    methodOptions.dir = 'x';
                                    methodOptions.overwrite = 'none';
                                    _scrollTo($this, to[1].toString(), methodOptions);
                                }
                            }, methodOptions.timeout);
                        }
                    });
                },
                stop: function () {
                    var selector = _selector.call(this);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if ($this.data(pluginPfx)) {
                            _stop($this);
                        }
                    });
                },
                disable: function (r) {
                    var selector = _selector.call(this);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if ($this.data(pluginPfx)) {
                            var d = $this.data(pluginPfx);
                            _autoUpdate.call(this, 'remove');
                            _unbindEvents.call(this);
                            if (r) {
                                _resetContentPosition.call(this);
                            }
                            _scrollbarVisibility.call(this, true);
                            $this.addClass(classes[3]);
                        }
                    });
                },
                destroy: function () {
                    var selector = _selector.call(this);
                    return $(selector).each(function () {
                        var $this = $(this);
                        if ($this.data(pluginPfx)) {
                            var d = $this.data(pluginPfx), o = d.opt, mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), scrollbar = $('.mCSB_' + d.idx + '_scrollbar');
                            if (o.live) {
                                removeLiveTimers(o.liveSelector || $(selector).selector);
                            }
                            _autoUpdate.call(this, 'remove');
                            _unbindEvents.call(this);
                            _resetContentPosition.call(this);
                            $this.removeData(pluginPfx);
                            _delete(this, 'mcs');
                            scrollbar.remove();
                            mCSB_container.find('img.' + classes[2]).removeClass(classes[2]);
                            mCustomScrollBox.replaceWith(mCSB_container.contents());
                            $this.removeClass(pluginNS + ' _' + pluginPfx + '_' + d.idx + ' ' + classes[6] + ' ' + classes[7] + ' ' + classes[5] + ' ' + classes[3]).addClass(classes[4]);
                        }
                    });
                }
            }, _selector = function () {
                return typeof $(this) !== 'object' || $(this).length < 1 ? defaultSelector : this;
            }, _theme = function (obj) {
                var fixedSizeScrollbarThemes = [
                        'rounded',
                        'rounded-dark',
                        'rounded-dots',
                        'rounded-dots-dark'
                    ], nonExpandedScrollbarThemes = [
                        'rounded-dots',
                        'rounded-dots-dark',
                        '3d',
                        '3d-dark',
                        '3d-thick',
                        '3d-thick-dark',
                        'inset',
                        'inset-dark',
                        'inset-2',
                        'inset-2-dark',
                        'inset-3',
                        'inset-3-dark'
                    ], disabledScrollButtonsThemes = [
                        'minimal',
                        'minimal-dark'
                    ], enabledAutoHideScrollbarThemes = [
                        'minimal',
                        'minimal-dark'
                    ], scrollbarPositionOutsideThemes = [
                        'minimal',
                        'minimal-dark'
                    ];
                obj.autoDraggerLength = $.inArray(obj.theme, fixedSizeScrollbarThemes) > -1 ? false : obj.autoDraggerLength;
                obj.autoExpandScrollbar = $.inArray(obj.theme, nonExpandedScrollbarThemes) > -1 ? false : obj.autoExpandScrollbar;
                obj.scrollButtons.enable = $.inArray(obj.theme, disabledScrollButtonsThemes) > -1 ? false : obj.scrollButtons.enable;
                obj.autoHideScrollbar = $.inArray(obj.theme, enabledAutoHideScrollbarThemes) > -1 ? true : obj.autoHideScrollbar;
                obj.scrollbarPosition = $.inArray(obj.theme, scrollbarPositionOutsideThemes) > -1 ? 'outside' : obj.scrollbarPosition;
            }, removeLiveTimers = function (selector) {
                if (liveTimers[selector]) {
                    clearTimeout(liveTimers[selector]);
                    _delete(liveTimers, selector);
                }
            }, _findAxis = function (val) {
                return val === 'yx' || val === 'xy' || val === 'auto' ? 'yx' : val === 'x' || val === 'horizontal' ? 'x' : 'y';
            }, _findScrollButtonsType = function (val) {
                return val === 'stepped' || val === 'pixels' || val === 'step' || val === 'click' ? 'stepped' : 'stepless';
            }, _pluginMarkup = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, expandClass = o.autoExpandScrollbar ? ' ' + classes[1] + '_expand' : '', scrollbar = [
                        '<div id=\'mCSB_' + d.idx + '_scrollbar_vertical\' class=\'mCSB_scrollTools mCSB_' + d.idx + '_scrollbar mCS-' + o.theme + ' mCSB_scrollTools_vertical' + expandClass + '\'><div class=\'' + classes[12] + '\'><div id=\'mCSB_' + d.idx + '_dragger_vertical\' class=\'mCSB_dragger\' style=\'position:absolute;\' oncontextmenu=\'return false;\'><div class=\'mCSB_dragger_bar\' /></div><div class=\'mCSB_draggerRail\' /></div></div>',
                        '<div id=\'mCSB_' + d.idx + '_scrollbar_horizontal\' class=\'mCSB_scrollTools mCSB_' + d.idx + '_scrollbar mCS-' + o.theme + ' mCSB_scrollTools_horizontal' + expandClass + '\'><div class=\'' + classes[12] + '\'><div id=\'mCSB_' + d.idx + '_dragger_horizontal\' class=\'mCSB_dragger\' style=\'position:absolute;\' oncontextmenu=\'return false;\'><div class=\'mCSB_dragger_bar\' /></div><div class=\'mCSB_draggerRail\' /></div></div>'
                    ], wrapperClass = o.axis === 'yx' ? 'mCSB_vertical_horizontal' : o.axis === 'x' ? 'mCSB_horizontal' : 'mCSB_vertical', scrollbars = o.axis === 'yx' ? scrollbar[0] + scrollbar[1] : o.axis === 'x' ? scrollbar[1] : scrollbar[0], contentWrapper = o.axis === 'yx' ? '<div id=\'mCSB_' + d.idx + '_container_wrapper\' class=\'mCSB_container_wrapper\' />' : '', autoHideClass = o.autoHideScrollbar ? ' ' + classes[6] : '', scrollbarDirClass = o.axis !== 'x' && d.langDir === 'rtl' ? ' ' + classes[7] : '';
                if (o.setWidth) {
                    $this.css('width', o.setWidth);
                }
                if (o.setHeight) {
                    $this.css('height', o.setHeight);
                }
                o.setLeft = o.axis !== 'y' && d.langDir === 'rtl' ? '989999px' : o.setLeft;
                $this.addClass(pluginNS + ' _' + pluginPfx + '_' + d.idx + autoHideClass + scrollbarDirClass).wrapInner('<div id=\'mCSB_' + d.idx + '\' class=\'mCustomScrollBox mCS-' + o.theme + ' ' + wrapperClass + '\'><div id=\'mCSB_' + d.idx + '_container\' class=\'mCSB_container\' style=\'position:relative; top:' + o.setTop + '; left:' + o.setLeft + ';\' dir=' + d.langDir + ' /></div>');
                var mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container');
                if (o.axis !== 'y' && !o.advanced.autoExpandHorizontalScroll) {
                    mCSB_container.css('width', _contentWidth(mCSB_container));
                }
                if (o.scrollbarPosition === 'outside') {
                    if ($this.css('position') === 'static') {
                        $this.css('position', 'relative');
                    }
                    $this.css('overflow', 'visible');
                    mCustomScrollBox.addClass('mCSB_outside').after(scrollbars);
                } else {
                    mCustomScrollBox.addClass('mCSB_inside').append(scrollbars);
                    mCSB_container.wrap(contentWrapper);
                }
                _scrollButtons.call(this);
                var mCSB_dragger = [
                    $('#mCSB_' + d.idx + '_dragger_vertical'),
                    $('#mCSB_' + d.idx + '_dragger_horizontal')
                ];
                mCSB_dragger[0].css('min-height', mCSB_dragger[0].height());
                mCSB_dragger[1].css('min-width', mCSB_dragger[1].width());
            }, _contentWidth = function (el) {
                var val = [
                        el[0].scrollWidth,
                        Math.max.apply(Math, el.children().map(function () {
                            return $(this).outerWidth(true);
                        }).get())
                    ], w = el.parent().width();
                return val[0] > w ? val[0] : val[1] > w ? val[1] : '100%';
            }, _expandContentHorizontally = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, mCSB_container = $('#mCSB_' + d.idx + '_container');
                if (o.advanced.autoExpandHorizontalScroll && o.axis !== 'y') {
                    mCSB_container.css({
                        'width': 'auto',
                        'min-width': 0,
                        'overflow-x': 'scroll'
                    });
                    var w = Math.ceil(mCSB_container[0].scrollWidth);
                    if (o.advanced.autoExpandHorizontalScroll === 3 || o.advanced.autoExpandHorizontalScroll !== 2 && w > mCSB_container.parent().width()) {
                        mCSB_container.css({
                            'width': w,
                            'min-width': '100%',
                            'overflow-x': 'inherit'
                        });
                    } else {
                        mCSB_container.css({
                            'overflow-x': 'inherit',
                            'position': 'absolute'
                        }).wrap('<div class=\'mCSB_h_wrapper\' style=\'position:relative; left:0; width:999999px;\' />').css({
                            'width': Math.ceil(mCSB_container[0].getBoundingClientRect().right + 0.4) - Math.floor(mCSB_container[0].getBoundingClientRect().left),
                            'min-width': '100%',
                            'position': 'relative'
                        }).unwrap();
                    }
                }
            }, _scrollButtons = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, mCSB_scrollTools = $('.mCSB_' + d.idx + '_scrollbar:first'), tabindex = !_isNumeric(o.scrollButtons.tabindex) ? '' : 'tabindex=\'' + o.scrollButtons.tabindex + '\'', btnHTML = [
                        '<a href=\'#\' class=\'' + classes[13] + '\' oncontextmenu=\'return false;\' ' + tabindex + ' />',
                        '<a href=\'#\' class=\'' + classes[14] + '\' oncontextmenu=\'return false;\' ' + tabindex + ' />',
                        '<a href=\'#\' class=\'' + classes[15] + '\' oncontextmenu=\'return false;\' ' + tabindex + ' />',
                        '<a href=\'#\' class=\'' + classes[16] + '\' oncontextmenu=\'return false;\' ' + tabindex + ' />'
                    ], btn = [
                        o.axis === 'x' ? btnHTML[2] : btnHTML[0],
                        o.axis === 'x' ? btnHTML[3] : btnHTML[1],
                        btnHTML[2],
                        btnHTML[3]
                    ];
                if (o.scrollButtons.enable) {
                    mCSB_scrollTools.prepend(btn[0]).append(btn[1]).next('.mCSB_scrollTools').prepend(btn[2]).append(btn[3]);
                }
            }, _setDraggerLength = function () {
                var $this = $(this), d = $this.data(pluginPfx), mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), mCSB_dragger = [
                        $('#mCSB_' + d.idx + '_dragger_vertical'),
                        $('#mCSB_' + d.idx + '_dragger_horizontal')
                    ], ratio = [
                        mCustomScrollBox.height() / mCSB_container.outerHeight(false),
                        mCustomScrollBox.width() / mCSB_container.outerWidth(false)
                    ], l = [
                        parseInt(mCSB_dragger[0].css('min-height')),
                        Math.round(ratio[0] * mCSB_dragger[0].parent().height()),
                        parseInt(mCSB_dragger[1].css('min-width')),
                        Math.round(ratio[1] * mCSB_dragger[1].parent().width())
                    ], h = oldIE && l[1] < l[0] ? l[0] : l[1], w = oldIE && l[3] < l[2] ? l[2] : l[3];
                mCSB_dragger[0].css({
                    'height': h,
                    'max-height': mCSB_dragger[0].parent().height() - 10
                }).find('.mCSB_dragger_bar').css({ 'line-height': l[0] + 'px' });
                mCSB_dragger[1].css({
                    'width': w,
                    'max-width': mCSB_dragger[1].parent().width() - 10
                });
            }, _scrollRatio = function () {
                var $this = $(this), d = $this.data(pluginPfx), mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), mCSB_dragger = [
                        $('#mCSB_' + d.idx + '_dragger_vertical'),
                        $('#mCSB_' + d.idx + '_dragger_horizontal')
                    ], scrollAmount = [
                        mCSB_container.outerHeight(false) - mCustomScrollBox.height(),
                        mCSB_container.outerWidth(false) - mCustomScrollBox.width()
                    ], ratio = [
                        scrollAmount[0] / (mCSB_dragger[0].parent().height() - mCSB_dragger[0].height()),
                        scrollAmount[1] / (mCSB_dragger[1].parent().width() - mCSB_dragger[1].width())
                    ];
                d.scrollRatio = {
                    y: ratio[0],
                    x: ratio[1]
                };
            }, _onDragClasses = function (el, action, xpnd) {
                var expandClass = xpnd ? classes[0] + '_expanded' : '', scrollbar = el.closest('.mCSB_scrollTools');
                if (action === 'active') {
                    el.toggleClass(classes[0] + ' ' + expandClass);
                    scrollbar.toggleClass(classes[1]);
                    el[0]._draggable = el[0]._draggable ? 0 : 1;
                } else {
                    if (!el[0]._draggable) {
                        if (action === 'hide') {
                            el.removeClass(classes[0]);
                            scrollbar.removeClass(classes[1]);
                        } else {
                            el.addClass(classes[0]);
                            scrollbar.addClass(classes[1]);
                        }
                    }
                }
            }, _overflowed = function () {
                var $this = $(this), d = $this.data(pluginPfx), mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), contentHeight = d.overflowed == null ? mCSB_container.height() : mCSB_container.outerHeight(false), contentWidth = d.overflowed == null ? mCSB_container.width() : mCSB_container.outerWidth(false), h = mCSB_container[0].scrollHeight, w = mCSB_container[0].scrollWidth;
                if (h > contentHeight) {
                    contentHeight = h;
                }
                if (w > contentWidth) {
                    contentWidth = w;
                }
                return [
                    contentHeight > mCustomScrollBox.height(),
                    contentWidth > mCustomScrollBox.width()
                ];
            }, _resetContentPosition = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), mCSB_dragger = [
                        $('#mCSB_' + d.idx + '_dragger_vertical'),
                        $('#mCSB_' + d.idx + '_dragger_horizontal')
                    ];
                _stop($this);
                if (o.axis !== 'x' && !d.overflowed[0] || o.axis === 'y' && d.overflowed[0]) {
                    mCSB_dragger[0].add(mCSB_container).css('top', 0);
                    _scrollTo($this, '_resetY');
                }
                if (o.axis !== 'y' && !d.overflowed[1] || o.axis === 'x' && d.overflowed[1]) {
                    var cx = dx = 0;
                    if (d.langDir === 'rtl') {
                        cx = mCustomScrollBox.width() - mCSB_container.outerWidth(false);
                        dx = Math.abs(cx / d.scrollRatio.x);
                    }
                    mCSB_container.css('left', cx);
                    mCSB_dragger[1].css('left', dx);
                    _scrollTo($this, '_resetX');
                }
            }, _bindEvents = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt;
                if (!d.bindEvents) {
                    _draggable.call(this);
                    if (o.contentTouchScroll) {
                        _contentDraggable.call(this);
                    }
                    _selectable.call(this);
                    if (o.mouseWheel.enable) {
                        function _mwt() {
                            mousewheelTimeout = setTimeout(function () {
                                if (!$.event.special.mousewheel) {
                                    _mwt();
                                } else {
                                    clearTimeout(mousewheelTimeout);
                                    _mousewheel.call($this[0]);
                                }
                            }, 100);
                        }
                        var mousewheelTimeout;
                        _mwt();
                    }
                    _draggerRail.call(this);
                    _wrapperScroll.call(this);
                    if (o.advanced.autoScrollOnFocus) {
                        _focus.call(this);
                    }
                    if (o.scrollButtons.enable) {
                        _buttons.call(this);
                    }
                    if (o.keyboard.enable) {
                        _keyboard.call(this);
                    }
                    d.bindEvents = true;
                }
            }, _unbindEvents = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, namespace = pluginPfx + '_' + d.idx, sb = '.mCSB_' + d.idx + '_scrollbar', sel = $('#mCSB_' + d.idx + ',#mCSB_' + d.idx + '_container,#mCSB_' + d.idx + '_container_wrapper,' + sb + ' .' + classes[12] + ',#mCSB_' + d.idx + '_dragger_vertical,#mCSB_' + d.idx + '_dragger_horizontal,' + sb + '>a'), mCSB_container = $('#mCSB_' + d.idx + '_container');
                if (o.advanced.releaseDraggableSelectors) {
                    sel.add($(o.advanced.releaseDraggableSelectors));
                }
                if (o.advanced.extraDraggableSelectors) {
                    sel.add($(o.advanced.extraDraggableSelectors));
                }
                if (d.bindEvents) {
                    $(document).add($(!_canAccessIFrame() || top.document)).unbind('.' + namespace);
                    sel.each(function () {
                        $(this).unbind('.' + namespace);
                    });
                    clearTimeout($this[0]._focusTimeout);
                    _delete($this[0], '_focusTimeout');
                    clearTimeout(d.sequential.step);
                    _delete(d.sequential, 'step');
                    clearTimeout(mCSB_container[0].onCompleteTimeout);
                    _delete(mCSB_container[0], 'onCompleteTimeout');
                    d.bindEvents = false;
                }
            }, _scrollbarVisibility = function (disabled) {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, contentWrapper = $('#mCSB_' + d.idx + '_container_wrapper'), content = contentWrapper.length ? contentWrapper : $('#mCSB_' + d.idx + '_container'), scrollbar = [
                        $('#mCSB_' + d.idx + '_scrollbar_vertical'),
                        $('#mCSB_' + d.idx + '_scrollbar_horizontal')
                    ], mCSB_dragger = [
                        scrollbar[0].find('.mCSB_dragger'),
                        scrollbar[1].find('.mCSB_dragger')
                    ];
                if (o.axis !== 'x') {
                    if (d.overflowed[0] && !disabled) {
                        scrollbar[0].add(mCSB_dragger[0]).add(scrollbar[0].children('a')).css('display', 'block');
                        content.removeClass(classes[8] + ' ' + classes[10]);
                    } else {
                        if (o.alwaysShowScrollbar) {
                            if (o.alwaysShowScrollbar !== 2) {
                                mCSB_dragger[0].css('display', 'none');
                            }
                            content.removeClass(classes[10]);
                        } else {
                            scrollbar[0].css('display', 'none');
                            content.addClass(classes[10]);
                        }
                        content.addClass(classes[8]);
                    }
                }
                if (o.axis !== 'y') {
                    if (d.overflowed[1] && !disabled) {
                        scrollbar[1].add(mCSB_dragger[1]).add(scrollbar[1].children('a')).css('display', 'block');
                        content.removeClass(classes[9] + ' ' + classes[11]);
                    } else {
                        if (o.alwaysShowScrollbar) {
                            if (o.alwaysShowScrollbar !== 2) {
                                mCSB_dragger[1].css('display', 'none');
                            }
                            content.removeClass(classes[11]);
                        } else {
                            scrollbar[1].css('display', 'none');
                            content.addClass(classes[11]);
                        }
                        content.addClass(classes[9]);
                    }
                }
                if (!d.overflowed[0] && !d.overflowed[1]) {
                    $this.addClass(classes[5]);
                } else {
                    $this.removeClass(classes[5]);
                }
            }, _coordinates = function (e) {
                var t = e.type, o = e.target.ownerDocument !== document ? [
                        $(frameElement).offset().top,
                        $(frameElement).offset().left
                    ] : null, io = _canAccessIFrame() && e.target.ownerDocument !== top.document ? [
                        $(e.view.frameElement).offset().top,
                        $(e.view.frameElement).offset().left
                    ] : [
                        0,
                        0
                    ];
                switch (t) {
                case 'pointerdown':
                case 'MSPointerDown':
                case 'pointermove':
                case 'MSPointerMove':
                case 'pointerup':
                case 'MSPointerUp':
                    return o ? [
                        e.originalEvent.pageY - o[0] + io[0],
                        e.originalEvent.pageX - o[1] + io[1],
                        false
                    ] : [
                        e.originalEvent.pageY,
                        e.originalEvent.pageX,
                        false
                    ];
                    break;
                case 'touchstart':
                case 'touchmove':
                case 'touchend':
                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0], touches = e.originalEvent.touches.length || e.originalEvent.changedTouches.length;
                    return e.target.ownerDocument !== document ? [
                        touch.screenY,
                        touch.screenX,
                        touches > 1
                    ] : [
                        touch.pageY,
                        touch.pageX,
                        touches > 1
                    ];
                    break;
                default:
                    return o ? [
                        e.pageY - o[0] + io[0],
                        e.pageX - o[1] + io[1],
                        false
                    ] : [
                        e.pageY,
                        e.pageX,
                        false
                    ];
                }
            }, _draggable = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, namespace = pluginPfx + '_' + d.idx, draggerId = [
                        'mCSB_' + d.idx + '_dragger_vertical',
                        'mCSB_' + d.idx + '_dragger_horizontal'
                    ], mCSB_container = $('#mCSB_' + d.idx + '_container'), mCSB_dragger = $('#' + draggerId[0] + ',#' + draggerId[1]), draggable, dragY, dragX, rds = o.advanced.releaseDraggableSelectors ? mCSB_dragger.add($(o.advanced.releaseDraggableSelectors)) : mCSB_dragger, eds = o.advanced.extraDraggableSelectors ? $(!_canAccessIFrame() || top.document).add($(o.advanced.extraDraggableSelectors)) : $(!_canAccessIFrame() || top.document);
                mCSB_dragger.bind('mousedown.' + namespace + ' touchstart.' + namespace + ' pointerdown.' + namespace + ' MSPointerDown.' + namespace, function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    if (!_mouseBtnLeft(e)) {
                        return;
                    }
                    touchActive = true;
                    if (oldIE) {
                        document.onselectstart = function () {
                            return false;
                        };
                    }
                    _iframe(false);
                    _stop($this);
                    draggable = $(this);
                    var offset = draggable.offset(), y = _coordinates(e)[0] - offset.top, x = _coordinates(e)[1] - offset.left, h = draggable.height() + offset.top, w = draggable.width() + offset.left;
                    if (y < h && y > 0 && x < w && x > 0) {
                        dragY = y;
                        dragX = x;
                    }
                    _onDragClasses(draggable, 'active', o.autoExpandScrollbar);
                }).bind('touchmove.' + namespace, function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    var offset = draggable.offset(), y = _coordinates(e)[0] - offset.top, x = _coordinates(e)[1] - offset.left;
                    _drag(dragY, dragX, y, x);
                });
                $(document).add(eds).bind('mousemove.' + namespace + ' pointermove.' + namespace + ' MSPointerMove.' + namespace, function (e) {
                    if (draggable) {
                        var offset = draggable.offset(), y = _coordinates(e)[0] - offset.top, x = _coordinates(e)[1] - offset.left;
                        if (dragY === y && dragX === x) {
                            return;
                        }
                        _drag(dragY, dragX, y, x);
                    }
                }).add(rds).bind('mouseup.' + namespace + ' touchend.' + namespace + ' pointerup.' + namespace + ' MSPointerUp.' + namespace, function (e) {
                    if (draggable) {
                        _onDragClasses(draggable, 'active', o.autoExpandScrollbar);
                        draggable = null;
                    }
                    touchActive = false;
                    if (oldIE) {
                        document.onselectstart = null;
                    }
                    _iframe(true);
                });
                function _iframe(evt) {
                    var el = mCSB_container.find('iframe');
                    if (!el.length) {
                        return;
                    }
                    var val = !evt ? 'none' : 'auto';
                    el.css('pointer-events', val);
                }
                function _drag(dragY, dragX, y, x) {
                    mCSB_container[0].idleTimer = o.scrollInertia < 233 ? 250 : 0;
                    if (draggable.attr('id') === draggerId[1]) {
                        var dir = 'x', to = (draggable[0].offsetLeft - dragX + x) * d.scrollRatio.x;
                    } else {
                        var dir = 'y', to = (draggable[0].offsetTop - dragY + y) * d.scrollRatio.y;
                    }
                    _scrollTo($this, to.toString(), {
                        dir: dir,
                        drag: true
                    });
                }
            }, _contentDraggable = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, namespace = pluginPfx + '_' + d.idx, mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), mCSB_dragger = [
                        $('#mCSB_' + d.idx + '_dragger_vertical'),
                        $('#mCSB_' + d.idx + '_dragger_horizontal')
                    ], draggable, dragY, dragX, touchStartY, touchStartX, touchMoveY = [], touchMoveX = [], startTime, runningTime, endTime, distance, speed, amount, durA = 0, durB, overwrite = o.axis === 'yx' ? 'none' : 'all', touchIntent = [], touchDrag, docDrag, iframe = mCSB_container.find('iframe'), events = [
                        'touchstart.' + namespace + ' pointerdown.' + namespace + ' MSPointerDown.' + namespace,
                        'touchmove.' + namespace + ' pointermove.' + namespace + ' MSPointerMove.' + namespace,
                        'touchend.' + namespace + ' pointerup.' + namespace + ' MSPointerUp.' + namespace
                    ], touchAction = document.body.style.touchAction !== undefined;
                mCSB_container.bind(events[0], function (e) {
                    _onTouchstart(e);
                }).bind(events[1], function (e) {
                    _onTouchmove(e);
                });
                mCustomScrollBox.bind(events[0], function (e) {
                    _onTouchstart2(e);
                }).bind(events[2], function (e) {
                    _onTouchend(e);
                });
                if (iframe.length) {
                    iframe.each(function () {
                        $(this).load(function () {
                            if (_canAccessIFrame(this)) {
                                $(this.contentDocument || this.contentWindow.document).bind(events[0], function (e) {
                                    _onTouchstart(e);
                                    _onTouchstart2(e);
                                }).bind(events[1], function (e) {
                                    _onTouchmove(e);
                                }).bind(events[2], function (e) {
                                    _onTouchend(e);
                                });
                            }
                        });
                    });
                }
                function _onTouchstart(e) {
                    if (!_pointerTouch(e) || touchActive || _coordinates(e)[2]) {
                        touchable = 0;
                        return;
                    }
                    touchable = 1;
                    touchDrag = 0;
                    docDrag = 0;
                    draggable = 1;
                    $this.removeClass('mCS_touch_action');
                    var offset = mCSB_container.offset();
                    dragY = _coordinates(e)[0] - offset.top;
                    dragX = _coordinates(e)[1] - offset.left;
                    touchIntent = [
                        _coordinates(e)[0],
                        _coordinates(e)[1]
                    ];
                }
                function _onTouchmove(e) {
                    if (!_pointerTouch(e) || touchActive || _coordinates(e)[2]) {
                        return;
                    }
                    if (!o.documentTouchScroll) {
                        e.preventDefault();
                    }
                    e.stopImmediatePropagation();
                    if (docDrag && !touchDrag) {
                        return;
                    }
                    if (draggable) {
                        runningTime = _getTime();
                        var offset = mCustomScrollBox.offset(), y = _coordinates(e)[0] - offset.top, x = _coordinates(e)[1] - offset.left, easing = 'mcsLinearOut';
                        touchMoveY.push(y);
                        touchMoveX.push(x);
                        touchIntent[2] = Math.abs(_coordinates(e)[0] - touchIntent[0]);
                        touchIntent[3] = Math.abs(_coordinates(e)[1] - touchIntent[1]);
                        if (d.overflowed[0]) {
                            var limit = mCSB_dragger[0].parent().height() - mCSB_dragger[0].height(), prevent = dragY - y > 0 && y - dragY > -(limit * d.scrollRatio.y) && (touchIntent[3] * 2 < touchIntent[2] || o.axis === 'yx');
                        }
                        if (d.overflowed[1]) {
                            var limitX = mCSB_dragger[1].parent().width() - mCSB_dragger[1].width(), preventX = dragX - x > 0 && x - dragX > -(limitX * d.scrollRatio.x) && (touchIntent[2] * 2 < touchIntent[3] || o.axis === 'yx');
                        }
                        if (prevent || preventX) {
                            if (!touchAction) {
                                e.preventDefault();
                            }
                            touchDrag = 1;
                        } else {
                            docDrag = 1;
                            $this.addClass('mCS_touch_action');
                        }
                        if (touchAction) {
                            e.preventDefault();
                        }
                        amount = o.axis === 'yx' ? [
                            dragY - y,
                            dragX - x
                        ] : o.axis === 'x' ? [
                            null,
                            dragX - x
                        ] : [
                            dragY - y,
                            null
                        ];
                        mCSB_container[0].idleTimer = 250;
                        if (d.overflowed[0]) {
                            _drag(amount[0], durA, easing, 'y', 'all', true);
                        }
                        if (d.overflowed[1]) {
                            _drag(amount[1], durA, easing, 'x', overwrite, true);
                        }
                    }
                }
                function _onTouchstart2(e) {
                    if (!_pointerTouch(e) || touchActive || _coordinates(e)[2]) {
                        touchable = 0;
                        return;
                    }
                    touchable = 1;
                    e.stopImmediatePropagation();
                    _stop($this);
                    startTime = _getTime();
                    var offset = mCustomScrollBox.offset();
                    touchStartY = _coordinates(e)[0] - offset.top;
                    touchStartX = _coordinates(e)[1] - offset.left;
                    touchMoveY = [];
                    touchMoveX = [];
                }
                function _onTouchend(e) {
                    if (!_pointerTouch(e) || touchActive || _coordinates(e)[2]) {
                        return;
                    }
                    draggable = 0;
                    e.stopImmediatePropagation();
                    touchDrag = 0;
                    docDrag = 0;
                    endTime = _getTime();
                    var offset = mCustomScrollBox.offset(), y = _coordinates(e)[0] - offset.top, x = _coordinates(e)[1] - offset.left;
                    if (endTime - runningTime > 30) {
                        return;
                    }
                    speed = 1000 / (endTime - startTime);
                    var easing = 'mcsEaseOut', slow = speed < 2.5, diff = slow ? [
                            touchMoveY[touchMoveY.length - 2],
                            touchMoveX[touchMoveX.length - 2]
                        ] : [
                            0,
                            0
                        ];
                    distance = slow ? [
                        y - diff[0],
                        x - diff[1]
                    ] : [
                        y - touchStartY,
                        x - touchStartX
                    ];
                    var absDistance = [
                        Math.abs(distance[0]),
                        Math.abs(distance[1])
                    ];
                    speed = slow ? [
                        Math.abs(distance[0] / 4),
                        Math.abs(distance[1] / 4)
                    ] : [
                        speed,
                        speed
                    ];
                    var a = [
                        Math.abs(mCSB_container[0].offsetTop) - distance[0] * _m(absDistance[0] / speed[0], speed[0]),
                        Math.abs(mCSB_container[0].offsetLeft) - distance[1] * _m(absDistance[1] / speed[1], speed[1])
                    ];
                    amount = o.axis === 'yx' ? [
                        a[0],
                        a[1]
                    ] : o.axis === 'x' ? [
                        null,
                        a[1]
                    ] : [
                        a[0],
                        null
                    ];
                    durB = [
                        absDistance[0] * 4 + o.scrollInertia,
                        absDistance[1] * 4 + o.scrollInertia
                    ];
                    var md = parseInt(o.contentTouchScroll) || 0;
                    amount[0] = absDistance[0] > md ? amount[0] : 0;
                    amount[1] = absDistance[1] > md ? amount[1] : 0;
                    if (d.overflowed[0]) {
                        _drag(amount[0], durB[0], easing, 'y', overwrite, false);
                    }
                    if (d.overflowed[1]) {
                        _drag(amount[1], durB[1], easing, 'x', overwrite, false);
                    }
                }
                function _m(ds, s) {
                    var r = [
                        s * 1.5,
                        s * 2,
                        s / 1.5,
                        s / 2
                    ];
                    if (ds > 90) {
                        return s > 4 ? r[0] : r[3];
                    } else if (ds > 60) {
                        return s > 3 ? r[3] : r[2];
                    } else if (ds > 30) {
                        return s > 8 ? r[1] : s > 6 ? r[0] : s > 4 ? s : r[2];
                    } else {
                        return s > 8 ? s : r[3];
                    }
                }
                function _drag(amount, dur, easing, dir, overwrite, drag) {
                    if (!amount) {
                        return;
                    }
                    _scrollTo($this, amount.toString(), {
                        dur: dur,
                        scrollEasing: easing,
                        dir: dir,
                        overwrite: overwrite,
                        drag: drag
                    });
                }
            }, _selectable = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, seq = d.sequential, namespace = pluginPfx + '_' + d.idx, mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent(), action;
                mCSB_container.bind('mousedown.' + namespace, function (e) {
                    if (touchable) {
                        return;
                    }
                    if (!action) {
                        action = 1;
                        touchActive = true;
                    }
                }).add(document).bind('mousemove.' + namespace, function (e) {
                    if (!touchable && action && _sel()) {
                        var offset = mCSB_container.offset(), y = _coordinates(e)[0] - offset.top + mCSB_container[0].offsetTop, x = _coordinates(e)[1] - offset.left + mCSB_container[0].offsetLeft;
                        if (y > 0 && y < wrapper.height() && x > 0 && x < wrapper.width()) {
                            if (seq.step) {
                                _seq('off', null, 'stepped');
                            }
                        } else {
                            if (o.axis !== 'x' && d.overflowed[0]) {
                                if (y < 0) {
                                    _seq('on', 38);
                                } else if (y > wrapper.height()) {
                                    _seq('on', 40);
                                }
                            }
                            if (o.axis !== 'y' && d.overflowed[1]) {
                                if (x < 0) {
                                    _seq('on', 37);
                                } else if (x > wrapper.width()) {
                                    _seq('on', 39);
                                }
                            }
                        }
                    }
                }).bind('mouseup.' + namespace + ' dragend.' + namespace, function (e) {
                    if (touchable) {
                        return;
                    }
                    if (action) {
                        action = 0;
                        _seq('off', null);
                    }
                    touchActive = false;
                });
                function _sel() {
                    return window.getSelection ? window.getSelection().toString() : document.selection && document.selection.type != 'Control' ? document.selection.createRange().text : 0;
                }
                function _seq(a, c, s) {
                    seq.type = s && action ? 'stepped' : 'stepless';
                    seq.scrollAmount = 10;
                    _sequentialScroll($this, a, c, 'mcsLinearOut', s ? 60 : null);
                }
            }, _mousewheel = function () {
                if (!$(this).data(pluginPfx)) {
                    return;
                }
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, namespace = pluginPfx + '_' + d.idx, mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_dragger = [
                        $('#mCSB_' + d.idx + '_dragger_vertical'),
                        $('#mCSB_' + d.idx + '_dragger_horizontal')
                    ], iframe = $('#mCSB_' + d.idx + '_container').find('iframe');
                if (iframe.length) {
                    iframe.each(function () {
                        $(this).load(function () {
                            if (_canAccessIFrame(this)) {
                                $(this.contentDocument || this.contentWindow.document).bind('mousewheel.' + namespace, function (e, delta) {
                                    _onMousewheel(e, delta);
                                });
                            }
                        });
                    });
                }
                mCustomScrollBox.bind('mousewheel.' + namespace, function (e, delta) {
                    _onMousewheel(e, delta);
                });
                function _onMousewheel(e, delta) {
                    _stop($this);
                    if (_disableMousewheel($this, e.target)) {
                        return;
                    }
                    var deltaFactor = o.mouseWheel.deltaFactor !== 'auto' ? parseInt(o.mouseWheel.deltaFactor) : oldIE && e.deltaFactor < 100 ? 100 : e.deltaFactor || 100, dur = o.scrollInertia;
                    if (o.axis === 'x' || o.mouseWheel.axis === 'x') {
                        var dir = 'x', px = [
                                Math.round(deltaFactor * d.scrollRatio.x),
                                parseInt(o.mouseWheel.scrollAmount)
                            ], amount = o.mouseWheel.scrollAmount !== 'auto' ? px[1] : px[0] >= mCustomScrollBox.width() ? mCustomScrollBox.width() * 0.9 : px[0], contentPos = Math.abs($('#mCSB_' + d.idx + '_container')[0].offsetLeft), draggerPos = mCSB_dragger[1][0].offsetLeft, limit = mCSB_dragger[1].parent().width() - mCSB_dragger[1].width(), dlt = e.deltaX || e.deltaY || delta;
                    } else {
                        var dir = 'y', px = [
                                Math.round(deltaFactor * d.scrollRatio.y),
                                parseInt(o.mouseWheel.scrollAmount)
                            ], amount = o.mouseWheel.scrollAmount !== 'auto' ? px[1] : px[0] >= mCustomScrollBox.height() ? mCustomScrollBox.height() * 0.9 : px[0], contentPos = Math.abs($('#mCSB_' + d.idx + '_container')[0].offsetTop), draggerPos = mCSB_dragger[0][0].offsetTop, limit = mCSB_dragger[0].parent().height() - mCSB_dragger[0].height(), dlt = e.deltaY || delta;
                    }
                    if (dir === 'y' && !d.overflowed[0] || dir === 'x' && !d.overflowed[1]) {
                        return;
                    }
                    if (o.mouseWheel.invert || e.webkitDirectionInvertedFromDevice) {
                        dlt = -dlt;
                    }
                    if (o.mouseWheel.normalizeDelta) {
                        dlt = dlt < 0 ? -1 : 1;
                    }
                    if (dlt > 0 && draggerPos !== 0 || dlt < 0 && draggerPos !== limit || o.mouseWheel.preventDefault) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                    if (e.deltaFactor < 2 && !o.mouseWheel.normalizeDelta) {
                        amount = e.deltaFactor;
                        dur = 17;
                    }
                    _scrollTo($this, (contentPos - dlt * amount).toString(), {
                        dir: dir,
                        dur: dur
                    });
                }
            }, _canAccessIFrame = function (iframe) {
                var html = null;
                if (!iframe) {
                    try {
                        var doc = top.document;
                        html = doc.body.innerHTML;
                    } catch (err) {
                    }
                    return html !== null;
                } else {
                    try {
                        var doc = iframe.contentDocument || iframe.contentWindow.document;
                        html = doc.body.innerHTML;
                    } catch (err) {
                    }
                    return html !== null;
                }
            }, _disableMousewheel = function (el, target) {
                var tag = target.nodeName.toLowerCase(), tags = el.data(pluginPfx).opt.mouseWheel.disableOver, focusTags = [
                        'select',
                        'textarea'
                    ];
                return $.inArray(tag, tags) > -1 && !($.inArray(tag, focusTags) > -1 && !$(target).is(':focus'));
            }, _draggerRail = function () {
                var $this = $(this), d = $this.data(pluginPfx), namespace = pluginPfx + '_' + d.idx, mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent(), mCSB_draggerContainer = $('.mCSB_' + d.idx + '_scrollbar .' + classes[12]), clickable;
                mCSB_draggerContainer.bind('mousedown.' + namespace + ' touchstart.' + namespace + ' pointerdown.' + namespace + ' MSPointerDown.' + namespace, function (e) {
                    touchActive = true;
                    if (!$(e.target).hasClass('mCSB_dragger')) {
                        clickable = 1;
                    }
                }).bind('touchend.' + namespace + ' pointerup.' + namespace + ' MSPointerUp.' + namespace, function (e) {
                    touchActive = false;
                }).bind('click.' + namespace, function (e) {
                    if (!clickable) {
                        return;
                    }
                    clickable = 0;
                    if ($(e.target).hasClass(classes[12]) || $(e.target).hasClass('mCSB_draggerRail')) {
                        _stop($this);
                        var el = $(this), mCSB_dragger = el.find('.mCSB_dragger');
                        if (el.parent('.mCSB_scrollTools_horizontal').length > 0) {
                            if (!d.overflowed[1]) {
                                return;
                            }
                            var dir = 'x', clickDir = e.pageX > mCSB_dragger.offset().left ? -1 : 1, to = Math.abs(mCSB_container[0].offsetLeft) - clickDir * (wrapper.width() * 0.9);
                        } else {
                            if (!d.overflowed[0]) {
                                return;
                            }
                            var dir = 'y', clickDir = e.pageY > mCSB_dragger.offset().top ? -1 : 1, to = Math.abs(mCSB_container[0].offsetTop) - clickDir * (wrapper.height() * 0.9);
                        }
                        _scrollTo($this, to.toString(), {
                            dir: dir,
                            scrollEasing: 'mcsEaseInOut'
                        });
                    }
                });
            }, _focus = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, namespace = pluginPfx + '_' + d.idx, mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent();
                mCSB_container.bind('focusin.' + namespace, function (e) {
                    var el = $(document.activeElement), nested = mCSB_container.find('.mCustomScrollBox').length, dur = 0;
                    if (!el.is(o.advanced.autoScrollOnFocus)) {
                        return;
                    }
                    _stop($this);
                    clearTimeout($this[0]._focusTimeout);
                    $this[0]._focusTimer = nested ? (dur + 17) * nested : 0;
                    $this[0]._focusTimeout = setTimeout(function () {
                        var to = [
                                _childPos(el)[0],
                                _childPos(el)[1]
                            ], contentPos = [
                                mCSB_container[0].offsetTop,
                                mCSB_container[0].offsetLeft
                            ], isVisible = [
                                contentPos[0] + to[0] >= 0 && contentPos[0] + to[0] < wrapper.height() - el.outerHeight(false),
                                contentPos[1] + to[1] >= 0 && contentPos[0] + to[1] < wrapper.width() - el.outerWidth(false)
                            ], overwrite = o.axis === 'yx' && !isVisible[0] && !isVisible[1] ? 'none' : 'all';
                        if (o.axis !== 'x' && !isVisible[0]) {
                            _scrollTo($this, to[0].toString(), {
                                dir: 'y',
                                scrollEasing: 'mcsEaseInOut',
                                overwrite: overwrite,
                                dur: dur
                            });
                        }
                        if (o.axis !== 'y' && !isVisible[1]) {
                            _scrollTo($this, to[1].toString(), {
                                dir: 'x',
                                scrollEasing: 'mcsEaseInOut',
                                overwrite: overwrite,
                                dur: dur
                            });
                        }
                    }, $this[0]._focusTimer);
                });
            }, _wrapperScroll = function () {
                var $this = $(this), d = $this.data(pluginPfx), namespace = pluginPfx + '_' + d.idx, wrapper = $('#mCSB_' + d.idx + '_container').parent();
                wrapper.bind('scroll.' + namespace, function (e) {
                    if (wrapper.scrollTop() !== 0 || wrapper.scrollLeft() !== 0) {
                        $('.mCSB_' + d.idx + '_scrollbar').css('visibility', 'hidden');
                    }
                });
            }, _buttons = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, seq = d.sequential, namespace = pluginPfx + '_' + d.idx, sel = '.mCSB_' + d.idx + '_scrollbar', btn = $(sel + '>a');
                btn.bind('mousedown.' + namespace + ' touchstart.' + namespace + ' pointerdown.' + namespace + ' MSPointerDown.' + namespace + ' mouseup.' + namespace + ' touchend.' + namespace + ' pointerup.' + namespace + ' MSPointerUp.' + namespace + ' mouseout.' + namespace + ' pointerout.' + namespace + ' MSPointerOut.' + namespace + ' click.' + namespace, function (e) {
                    e.preventDefault();
                    if (!_mouseBtnLeft(e)) {
                        return;
                    }
                    var btnClass = $(this).attr('class');
                    seq.type = o.scrollButtons.scrollType;
                    switch (e.type) {
                    case 'mousedown':
                    case 'touchstart':
                    case 'pointerdown':
                    case 'MSPointerDown':
                        if (seq.type === 'stepped') {
                            return;
                        }
                        touchActive = true;
                        d.tweenRunning = false;
                        _seq('on', btnClass);
                        break;
                    case 'mouseup':
                    case 'touchend':
                    case 'pointerup':
                    case 'MSPointerUp':
                    case 'mouseout':
                    case 'pointerout':
                    case 'MSPointerOut':
                        if (seq.type === 'stepped') {
                            return;
                        }
                        touchActive = false;
                        if (seq.dir) {
                            _seq('off', btnClass);
                        }
                        break;
                    case 'click':
                        if (seq.type !== 'stepped' || d.tweenRunning) {
                            return;
                        }
                        _seq('on', btnClass);
                        break;
                    }
                    function _seq(a, c) {
                        seq.scrollAmount = o.scrollButtons.scrollAmount;
                        _sequentialScroll($this, a, c);
                    }
                });
            }, _keyboard = function () {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, seq = d.sequential, namespace = pluginPfx + '_' + d.idx, mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent(), editables = 'input,textarea,select,datalist,keygen,[contenteditable=\'true\']', iframe = mCSB_container.find('iframe'), events = ['blur.' + namespace + ' keydown.' + namespace + ' keyup.' + namespace];
                if (iframe.length) {
                    iframe.each(function () {
                        $(this).load(function () {
                            if (_canAccessIFrame(this)) {
                                $(this.contentDocument || this.contentWindow.document).bind(events[0], function (e) {
                                    _onKeyboard(e);
                                });
                            }
                        });
                    });
                }
                mCustomScrollBox.attr('tabindex', '0').bind(events[0], function (e) {
                    _onKeyboard(e);
                });
                function _onKeyboard(e) {
                    switch (e.type) {
                    case 'blur':
                        if (d.tweenRunning && seq.dir) {
                            _seq('off', null);
                        }
                        break;
                    case 'keydown':
                    case 'keyup':
                        var code = e.keyCode ? e.keyCode : e.which, action = 'on';
                        if (o.axis !== 'x' && (code === 38 || code === 40) || o.axis !== 'y' && (code === 37 || code === 39)) {
                            if ((code === 38 || code === 40) && !d.overflowed[0] || (code === 37 || code === 39) && !d.overflowed[1]) {
                                return;
                            }
                            if (e.type === 'keyup') {
                                action = 'off';
                            }
                            if (!$(document.activeElement).is(editables)) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                _seq(action, code);
                            }
                        } else if (code === 33 || code === 34) {
                            if (d.overflowed[0] || d.overflowed[1]) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                            }
                            if (e.type === 'keyup') {
                                _stop($this);
                                var keyboardDir = code === 34 ? -1 : 1;
                                if (o.axis === 'x' || o.axis === 'yx' && d.overflowed[1] && !d.overflowed[0]) {
                                    var dir = 'x', to = Math.abs(mCSB_container[0].offsetLeft) - keyboardDir * (wrapper.width() * 0.9);
                                } else {
                                    var dir = 'y', to = Math.abs(mCSB_container[0].offsetTop) - keyboardDir * (wrapper.height() * 0.9);
                                }
                                _scrollTo($this, to.toString(), {
                                    dir: dir,
                                    scrollEasing: 'mcsEaseInOut'
                                });
                            }
                        } else if (code === 35 || code === 36) {
                            if (!$(document.activeElement).is(editables)) {
                                if (d.overflowed[0] || d.overflowed[1]) {
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                }
                                if (e.type === 'keyup') {
                                    if (o.axis === 'x' || o.axis === 'yx' && d.overflowed[1] && !d.overflowed[0]) {
                                        var dir = 'x', to = code === 35 ? Math.abs(wrapper.width() - mCSB_container.outerWidth(false)) : 0;
                                    } else {
                                        var dir = 'y', to = code === 35 ? Math.abs(wrapper.height() - mCSB_container.outerHeight(false)) : 0;
                                    }
                                    _scrollTo($this, to.toString(), {
                                        dir: dir,
                                        scrollEasing: 'mcsEaseInOut'
                                    });
                                }
                            }
                        }
                        break;
                    }
                    function _seq(a, c) {
                        seq.type = o.keyboard.scrollType;
                        seq.scrollAmount = o.keyboard.scrollAmount;
                        if (seq.type === 'stepped' && d.tweenRunning) {
                            return;
                        }
                        _sequentialScroll($this, a, c);
                    }
                }
            }, _sequentialScroll = function (el, action, trigger, e, s) {
                var d = el.data(pluginPfx), o = d.opt, seq = d.sequential, mCSB_container = $('#mCSB_' + d.idx + '_container'), once = seq.type === 'stepped' ? true : false, steplessSpeed = o.scrollInertia < 26 ? 26 : o.scrollInertia, steppedSpeed = o.scrollInertia < 1 ? 17 : o.scrollInertia;
                switch (action) {
                case 'on':
                    seq.dir = [
                        trigger === classes[16] || trigger === classes[15] || trigger === 39 || trigger === 37 ? 'x' : 'y',
                        trigger === classes[13] || trigger === classes[15] || trigger === 38 || trigger === 37 ? -1 : 1
                    ];
                    _stop(el);
                    if (_isNumeric(trigger) && seq.type === 'stepped') {
                        return;
                    }
                    _on(once);
                    break;
                case 'off':
                    _off();
                    if (once || d.tweenRunning && seq.dir) {
                        _on(true);
                    }
                    break;
                }
                function _on(once) {
                    if (o.snapAmount) {
                        seq.scrollAmount = !(o.snapAmount instanceof Array) ? o.snapAmount : seq.dir[0] === 'x' ? o.snapAmount[1] : o.snapAmount[0];
                    }
                    var c = seq.type !== 'stepped', t = s ? s : !once ? 1000 / 60 : c ? steplessSpeed / 1.5 : steppedSpeed, m = !once ? 2.5 : c ? 7.5 : 40, contentPos = [
                            Math.abs(mCSB_container[0].offsetTop),
                            Math.abs(mCSB_container[0].offsetLeft)
                        ], ratio = [
                            d.scrollRatio.y > 10 ? 10 : d.scrollRatio.y,
                            d.scrollRatio.x > 10 ? 10 : d.scrollRatio.x
                        ], amount = seq.dir[0] === 'x' ? contentPos[1] + seq.dir[1] * (ratio[1] * m) : contentPos[0] + seq.dir[1] * (ratio[0] * m), px = seq.dir[0] === 'x' ? contentPos[1] + seq.dir[1] * parseInt(seq.scrollAmount) : contentPos[0] + seq.dir[1] * parseInt(seq.scrollAmount), to = seq.scrollAmount !== 'auto' ? px : amount, easing = e ? e : !once ? 'mcsLinear' : c ? 'mcsLinearOut' : 'mcsEaseInOut', onComplete = !once ? false : true;
                    if (once && t < 17) {
                        to = seq.dir[0] === 'x' ? contentPos[1] : contentPos[0];
                    }
                    _scrollTo(el, to.toString(), {
                        dir: seq.dir[0],
                        scrollEasing: easing,
                        dur: t,
                        onComplete: onComplete
                    });
                    if (once) {
                        seq.dir = false;
                        return;
                    }
                    clearTimeout(seq.step);
                    seq.step = setTimeout(function () {
                        _on();
                    }, t);
                }
                function _off() {
                    clearTimeout(seq.step);
                    _delete(seq, 'step');
                    _stop(el);
                }
            }, _arr = function (val) {
                var o = $(this).data(pluginPfx).opt, vals = [];
                if (typeof val === 'function') {
                    val = val();
                }
                if (!(val instanceof Array)) {
                    vals[0] = val.y ? val.y : val.x || o.axis === 'x' ? null : val;
                    vals[1] = val.x ? val.x : val.y || o.axis === 'y' ? null : val;
                } else {
                    vals = val.length > 1 ? [
                        val[0],
                        val[1]
                    ] : o.axis === 'x' ? [
                        null,
                        val[0]
                    ] : [
                        val[0],
                        null
                    ];
                }
                if (typeof vals[0] === 'function') {
                    vals[0] = vals[0]();
                }
                if (typeof vals[1] === 'function') {
                    vals[1] = vals[1]();
                }
                return vals;
            }, _to = function (val, dir) {
                if (val == null || typeof val == 'undefined') {
                    return;
                }
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent(), t = typeof val;
                if (!dir) {
                    dir = o.axis === 'x' ? 'x' : 'y';
                }
                var contentLength = dir === 'x' ? mCSB_container.outerWidth(false) : mCSB_container.outerHeight(false), contentPos = dir === 'x' ? mCSB_container[0].offsetLeft : mCSB_container[0].offsetTop, cssProp = dir === 'x' ? 'left' : 'top';
                switch (t) {
                case 'function':
                    return val();
                    break;
                case 'object':
                    var obj = val.jquery ? val : $(val);
                    if (!obj.length) {
                        return;
                    }
                    return dir === 'x' ? _childPos(obj)[1] : _childPos(obj)[0];
                    break;
                case 'string':
                case 'number':
                    if (_isNumeric(val)) {
                        return Math.abs(val);
                    } else if (val.indexOf('%') !== -1) {
                        return Math.abs(contentLength * parseInt(val) / 100);
                    } else if (val.indexOf('-=') !== -1) {
                        return Math.abs(contentPos - parseInt(val.split('-=')[1]));
                    } else if (val.indexOf('+=') !== -1) {
                        var p = contentPos + parseInt(val.split('+=')[1]);
                        return p >= 0 ? 0 : Math.abs(p);
                    } else if (val.indexOf('px') !== -1 && _isNumeric(val.split('px')[0])) {
                        return Math.abs(val.split('px')[0]);
                    } else {
                        if (val === 'top' || val === 'left') {
                            return 0;
                        } else if (val === 'bottom') {
                            return Math.abs(wrapper.height() - mCSB_container.outerHeight(false));
                        } else if (val === 'right') {
                            return Math.abs(wrapper.width() - mCSB_container.outerWidth(false));
                        } else if (val === 'first' || val === 'last') {
                            var obj = mCSB_container.find(':' + val);
                            return dir === 'x' ? _childPos(obj)[1] : _childPos(obj)[0];
                        } else {
                            if ($(val).length) {
                                return dir === 'x' ? _childPos($(val))[1] : _childPos($(val))[0];
                            } else {
                                mCSB_container.css(cssProp, val);
                                methods.update.call(null, $this[0]);
                                return;
                            }
                        }
                    }
                    break;
                }
            }, _autoUpdate = function (rem) {
                var $this = $(this), d = $this.data(pluginPfx), o = d.opt, mCSB_container = $('#mCSB_' + d.idx + '_container');
                if (rem) {
                    clearTimeout(mCSB_container[0].autoUpdate);
                    _delete(mCSB_container[0], 'autoUpdate');
                    return;
                }
                upd();
                function upd() {
                    clearTimeout(mCSB_container[0].autoUpdate);
                    if ($this.parents('html').length === 0) {
                        $this = null;
                        return;
                    }
                    mCSB_container[0].autoUpdate = setTimeout(function () {
                        if (o.advanced.updateOnSelectorChange) {
                            d.poll.change.n = sizesSum();
                            if (d.poll.change.n !== d.poll.change.o) {
                                d.poll.change.o = d.poll.change.n;
                                doUpd(3);
                                return;
                            }
                        }
                        if (o.advanced.updateOnContentResize) {
                            d.poll.size.n = $this[0].scrollHeight + $this[0].scrollWidth + mCSB_container[0].offsetHeight + $this[0].offsetHeight + $this[0].offsetWidth;
                            if (d.poll.size.n !== d.poll.size.o) {
                                d.poll.size.o = d.poll.size.n;
                                doUpd(1);
                                return;
                            }
                        }
                        if (o.advanced.updateOnImageLoad) {
                            if (!(o.advanced.updateOnImageLoad === 'auto' && o.axis === 'y')) {
                                d.poll.img.n = mCSB_container.find('img').length;
                                if (d.poll.img.n !== d.poll.img.o) {
                                    d.poll.img.o = d.poll.img.n;
                                    mCSB_container.find('img').each(function () {
                                        imgLoader(this);
                                    });
                                    return;
                                }
                            }
                        }
                        if (o.advanced.updateOnSelectorChange || o.advanced.updateOnContentResize || o.advanced.updateOnImageLoad) {
                            upd();
                        }
                    }, o.advanced.autoUpdateTimeout);
                }
                function imgLoader(el) {
                    if ($(el).hasClass(classes[2])) {
                        doUpd();
                        return;
                    }
                    var img = new Image();
                    function createDelegate(contextObject, delegateMethod) {
                        return function () {
                            return delegateMethod.apply(contextObject, arguments);
                        };
                    }
                    function imgOnLoad() {
                        this.onload = null;
                        $(el).addClass(classes[2]);
                        doUpd(2);
                    }
                    img.onload = createDelegate(img, imgOnLoad);
                    img.src = el.src;
                }
                function sizesSum() {
                    if (o.advanced.updateOnSelectorChange === true) {
                        o.advanced.updateOnSelectorChange = '*';
                    }
                    var total = 0, sel = mCSB_container.find(o.advanced.updateOnSelectorChange);
                    if (o.advanced.updateOnSelectorChange && sel.length > 0) {
                        sel.each(function () {
                            total += this.offsetHeight + this.offsetWidth;
                        });
                    }
                    return total;
                }
                function doUpd(cb) {
                    clearTimeout(mCSB_container[0].autoUpdate);
                    methods.update.call(null, $this[0], cb);
                }
            }, _snapAmount = function (to, amount, offset) {
                return Math.round(to / amount) * amount - offset;
            }, _stop = function (el) {
                var d = el.data(pluginPfx), sel = $('#mCSB_' + d.idx + '_container,#mCSB_' + d.idx + '_container_wrapper,#mCSB_' + d.idx + '_dragger_vertical,#mCSB_' + d.idx + '_dragger_horizontal');
                sel.each(function () {
                    _stopTween.call(this);
                });
            }, _scrollTo = function (el, to, options) {
                var d = el.data(pluginPfx), o = d.opt, defaults = {
                        trigger: 'internal',
                        dir: 'y',
                        scrollEasing: 'mcsEaseOut',
                        drag: false,
                        dur: o.scrollInertia,
                        overwrite: 'all',
                        callbacks: true,
                        onStart: true,
                        onUpdate: true,
                        onComplete: true
                    }, options = $.extend(defaults, options), dur = [
                        options.dur,
                        options.drag ? 0 : options.dur
                    ], mCustomScrollBox = $('#mCSB_' + d.idx), mCSB_container = $('#mCSB_' + d.idx + '_container'), wrapper = mCSB_container.parent(), totalScrollOffsets = o.callbacks.onTotalScrollOffset ? _arr.call(el, o.callbacks.onTotalScrollOffset) : [
                        0,
                        0
                    ], totalScrollBackOffsets = o.callbacks.onTotalScrollBackOffset ? _arr.call(el, o.callbacks.onTotalScrollBackOffset) : [
                        0,
                        0
                    ];
                d.trigger = options.trigger;
                if (wrapper.scrollTop() !== 0 || wrapper.scrollLeft() !== 0) {
                    $('.mCSB_' + d.idx + '_scrollbar').css('visibility', 'visible');
                    wrapper.scrollTop(0).scrollLeft(0);
                }
                if (to === '_resetY' && !d.contentReset.y) {
                    if (_cb('onOverflowYNone')) {
                        o.callbacks.onOverflowYNone.call(el[0]);
                    }
                    d.contentReset.y = 1;
                }
                if (to === '_resetX' && !d.contentReset.x) {
                    if (_cb('onOverflowXNone')) {
                        o.callbacks.onOverflowXNone.call(el[0]);
                    }
                    d.contentReset.x = 1;
                }
                if (to === '_resetY' || to === '_resetX') {
                    return;
                }
                if ((d.contentReset.y || !el[0].mcs) && d.overflowed[0]) {
                    if (_cb('onOverflowY')) {
                        o.callbacks.onOverflowY.call(el[0]);
                    }
                    d.contentReset.x = null;
                }
                if ((d.contentReset.x || !el[0].mcs) && d.overflowed[1]) {
                    if (_cb('onOverflowX')) {
                        o.callbacks.onOverflowX.call(el[0]);
                    }
                    d.contentReset.x = null;
                }
                if (o.snapAmount) {
                    var snapAmount = !(o.snapAmount instanceof Array) ? o.snapAmount : options.dir === 'x' ? o.snapAmount[1] : o.snapAmount[0];
                    to = _snapAmount(to, snapAmount, o.snapOffset);
                }
                switch (options.dir) {
                case 'x':
                    var mCSB_dragger = $('#mCSB_' + d.idx + '_dragger_horizontal'), property = 'left', contentPos = mCSB_container[0].offsetLeft, limit = [
                            mCustomScrollBox.width() - mCSB_container.outerWidth(false),
                            mCSB_dragger.parent().width() - mCSB_dragger.width()
                        ], scrollTo = [
                            to,
                            to === 0 ? 0 : to / d.scrollRatio.x
                        ], tso = totalScrollOffsets[1], tsbo = totalScrollBackOffsets[1], totalScrollOffset = tso > 0 ? tso / d.scrollRatio.x : 0, totalScrollBackOffset = tsbo > 0 ? tsbo / d.scrollRatio.x : 0;
                    break;
                case 'y':
                    var mCSB_dragger = $('#mCSB_' + d.idx + '_dragger_vertical'), property = 'top', contentPos = mCSB_container[0].offsetTop, limit = [
                            mCustomScrollBox.height() - mCSB_container.outerHeight(false),
                            mCSB_dragger.parent().height() - mCSB_dragger.height()
                        ], scrollTo = [
                            to,
                            to === 0 ? 0 : to / d.scrollRatio.y
                        ], tso = totalScrollOffsets[0], tsbo = totalScrollBackOffsets[0], totalScrollOffset = tso > 0 ? tso / d.scrollRatio.y : 0, totalScrollBackOffset = tsbo > 0 ? tsbo / d.scrollRatio.y : 0;
                    break;
                }
                if (scrollTo[1] < 0 || scrollTo[0] === 0 && scrollTo[1] === 0) {
                    scrollTo = [
                        0,
                        0
                    ];
                } else if (scrollTo[1] >= limit[1]) {
                    scrollTo = [
                        limit[0],
                        limit[1]
                    ];
                } else {
                    scrollTo[0] = -scrollTo[0];
                }
                if (!el[0].mcs) {
                    _mcs();
                    if (_cb('onInit')) {
                        o.callbacks.onInit.call(el[0]);
                    }
                }
                clearTimeout(mCSB_container[0].onCompleteTimeout);
                _tweenTo(mCSB_dragger[0], property, Math.round(scrollTo[1]), dur[1], options.scrollEasing);
                if (!d.tweenRunning && (contentPos === 0 && scrollTo[0] >= 0 || contentPos === limit[0] && scrollTo[0] <= limit[0])) {
                    return;
                }
                _tweenTo(mCSB_container[0], property, Math.round(scrollTo[0]), dur[0], options.scrollEasing, options.overwrite, {
                    onStart: function () {
                        if (options.callbacks && options.onStart && !d.tweenRunning) {
                            if (_cb('onScrollStart')) {
                                _mcs();
                                o.callbacks.onScrollStart.call(el[0]);
                            }
                            d.tweenRunning = true;
                            _onDragClasses(mCSB_dragger);
                            d.cbOffsets = _cbOffsets();
                        }
                    },
                    onUpdate: function () {
                        if (options.callbacks && options.onUpdate) {
                            if (_cb('whileScrolling')) {
                                _mcs();
                                o.callbacks.whileScrolling.call(el[0]);
                            }
                        }
                    },
                    onComplete: function () {
                        if (options.callbacks && options.onComplete) {
                            if (o.axis === 'yx') {
                                clearTimeout(mCSB_container[0].onCompleteTimeout);
                            }
                            var t = mCSB_container[0].idleTimer || 0;
                            mCSB_container[0].onCompleteTimeout = setTimeout(function () {
                                if (_cb('onScroll')) {
                                    _mcs();
                                    o.callbacks.onScroll.call(el[0]);
                                }
                                if (_cb('onTotalScroll') && scrollTo[1] >= limit[1] - totalScrollOffset && d.cbOffsets[0]) {
                                    _mcs();
                                    o.callbacks.onTotalScroll.call(el[0]);
                                }
                                if (_cb('onTotalScrollBack') && scrollTo[1] <= totalScrollBackOffset && d.cbOffsets[1]) {
                                    _mcs();
                                    o.callbacks.onTotalScrollBack.call(el[0]);
                                }
                                d.tweenRunning = false;
                                mCSB_container[0].idleTimer = 0;
                                _onDragClasses(mCSB_dragger, 'hide');
                            }, t);
                        }
                    }
                });
                function _cb(cb) {
                    return d && o.callbacks[cb] && typeof o.callbacks[cb] === 'function';
                }
                function _cbOffsets() {
                    return [
                        o.callbacks.alwaysTriggerOffsets || contentPos >= limit[0] + tso,
                        o.callbacks.alwaysTriggerOffsets || contentPos <= -tsbo
                    ];
                }
                function _mcs() {
                    var cp = [
                            mCSB_container[0].offsetTop,
                            mCSB_container[0].offsetLeft
                        ], dp = [
                            mCSB_dragger[0].offsetTop,
                            mCSB_dragger[0].offsetLeft
                        ], cl = [
                            mCSB_container.outerHeight(false),
                            mCSB_container.outerWidth(false)
                        ], pl = [
                            mCustomScrollBox.height(),
                            mCustomScrollBox.width()
                        ];
                    el[0].mcs = {
                        content: mCSB_container,
                        top: cp[0],
                        left: cp[1],
                        draggerTop: dp[0],
                        draggerLeft: dp[1],
                        topPct: Math.round(100 * Math.abs(cp[0]) / (Math.abs(cl[0]) - pl[0])),
                        leftPct: Math.round(100 * Math.abs(cp[1]) / (Math.abs(cl[1]) - pl[1])),
                        direction: options.dir
                    };
                }
            }, _tweenTo = function (el, prop, to, duration, easing, overwrite, callbacks) {
                if (!el._mTween) {
                    el._mTween = {
                        top: {},
                        left: {}
                    };
                }
                var callbacks = callbacks || {}, onStart = callbacks.onStart || function () {
                    }, onUpdate = callbacks.onUpdate || function () {
                    }, onComplete = callbacks.onComplete || function () {
                    }, startTime = _getTime(), _delay, progress = 0, from = el.offsetTop, elStyle = el.style, _request, tobj = el._mTween[prop];
                if (prop === 'left') {
                    from = el.offsetLeft;
                }
                var diff = to - from;
                tobj.stop = 0;
                if (overwrite !== 'none') {
                    _cancelTween();
                }
                _startTween();
                function _step() {
                    if (tobj.stop) {
                        return;
                    }
                    if (!progress) {
                        onStart.call();
                    }
                    progress = _getTime() - startTime;
                    _tween();
                    if (progress >= tobj.time) {
                        tobj.time = progress > tobj.time ? progress + _delay - (progress - tobj.time) : progress + _delay - 1;
                        if (tobj.time < progress + 1) {
                            tobj.time = progress + 1;
                        }
                    }
                    if (tobj.time < duration) {
                        tobj.id = _request(_step);
                    } else {
                        onComplete.call();
                    }
                }
                function _tween() {
                    if (duration > 0) {
                        tobj.currVal = _ease(tobj.time, from, diff, duration, easing);
                        elStyle[prop] = Math.round(tobj.currVal) + 'px';
                    } else {
                        elStyle[prop] = to + 'px';
                    }
                    onUpdate.call();
                }
                function _startTween() {
                    _delay = 1000 / 60;
                    tobj.time = progress + _delay;
                    _request = !window.requestAnimationFrame ? function (f) {
                        _tween();
                        return setTimeout(f, 0.01);
                    } : window.requestAnimationFrame;
                    tobj.id = _request(_step);
                }
                function _cancelTween() {
                    if (tobj.id == null) {
                        return;
                    }
                    if (!window.requestAnimationFrame) {
                        clearTimeout(tobj.id);
                    } else {
                        window.cancelAnimationFrame(tobj.id);
                    }
                    tobj.id = null;
                }
                function _ease(t, b, c, d, type) {
                    switch (type) {
                    case 'linear':
                    case 'mcsLinear':
                        return c * t / d + b;
                        break;
                    case 'mcsLinearOut':
                        t /= d;
                        t--;
                        return c * Math.sqrt(1 - t * t) + b;
                        break;
                    case 'easeInOutSmooth':
                        t /= d / 2;
                        if (t < 1)
                            return c / 2 * t * t + b;
                        t--;
                        return -c / 2 * (t * (t - 2) - 1) + b;
                        break;
                    case 'easeInOutStrong':
                        t /= d / 2;
                        if (t < 1)
                            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                        t--;
                        return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
                        break;
                    case 'easeInOut':
                    case 'mcsEaseInOut':
                        t /= d / 2;
                        if (t < 1)
                            return c / 2 * t * t * t + b;
                        t -= 2;
                        return c / 2 * (t * t * t + 2) + b;
                        break;
                    case 'easeOutSmooth':
                        t /= d;
                        t--;
                        return -c * (t * t * t * t - 1) + b;
                        break;
                    case 'easeOutStrong':
                        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
                        break;
                    case 'easeOut':
                    case 'mcsEaseOut':
                    default:
                        var ts = (t /= d) * t, tc = ts * t;
                        return b + c * (0.499999999999997 * tc * ts + -2.5 * ts * ts + 5.5 * tc + -6.5 * ts + 4 * t);
                    }
                }
            }, _getTime = function () {
                if (window.performance && window.performance.now) {
                    return window.performance.now();
                } else {
                    if (window.performance && window.performance.webkitNow) {
                        return window.performance.webkitNow();
                    } else {
                        if (Date.now) {
                            return Date.now();
                        } else {
                            return new Date().getTime();
                        }
                    }
                }
            }, _stopTween = function () {
                var el = this;
                if (!el._mTween) {
                    el._mTween = {
                        top: {},
                        left: {}
                    };
                }
                var props = [
                    'top',
                    'left'
                ];
                for (var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    if (el._mTween[prop].id) {
                        if (!window.requestAnimationFrame) {
                            clearTimeout(el._mTween[prop].id);
                        } else {
                            window.cancelAnimationFrame(el._mTween[prop].id);
                        }
                        el._mTween[prop].id = null;
                        el._mTween[prop].stop = 1;
                    }
                }
            }, _delete = function (c, m) {
                try {
                    delete c[m];
                } catch (e) {
                    c[m] = null;
                }
            }, _mouseBtnLeft = function (e) {
                return !(e.which && e.which !== 1);
            }, _pointerTouch = function (e) {
                var t = e.originalEvent.pointerType;
                return !(t && t !== 'touch' && t !== 2);
            }, _isNumeric = function (val) {
                return !isNaN(parseFloat(val)) && isFinite(val);
            }, _childPos = function (el) {
                var p = el.parents('.mCSB_container');
                return [
                    el.offset().top - p.offset().top,
                    el.offset().left - p.offset().left
                ];
            }, _isTabHidden = function () {
                var prop = _getHiddenProp();
                if (!prop)
                    return false;
                return document[prop];
                function _getHiddenProp() {
                    var pfx = [
                        'webkit',
                        'moz',
                        'ms',
                        'o'
                    ];
                    if ('hidden' in document)
                        return 'hidden';
                    for (var i = 0; i < pfx.length; i++) {
                        if (pfx[i] + 'Hidden' in document)
                            return pfx[i] + 'Hidden';
                    }
                    return null;
                }
            };
        $.fn[pluginNS] = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist');
            }
        };
        $[pluginNS] = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist');
            }
        };
        $[pluginNS].defaults = defaults;
        window[pluginNS] = true;
        $(window).load(function () {
            $(defaultSelector)[pluginNS]();
            $.extend($.expr[':'], {
                mcsInView: $.expr[':'].mcsInView || function (el) {
                    var $el = $(el), content = $el.parents('.mCSB_container'), wrapper, cPos;
                    if (!content.length) {
                        return;
                    }
                    wrapper = content.parent();
                    cPos = [
                        content[0].offsetTop,
                        content[0].offsetLeft
                    ];
                    return cPos[0] + _childPos($el)[0] >= 0 && cPos[0] + _childPos($el)[0] < wrapper.height() - $el.outerHeight(false) && cPos[1] + _childPos($el)[1] >= 0 && cPos[1] + _childPos($el)[1] < wrapper.width() - $el.outerWidth(false);
                },
                mcsOverflow: $.expr[':'].mcsOverflow || function (el) {
                    var d = $(el).data(pluginPfx);
                    if (!d) {
                        return;
                    }
                    return d.overflowed[0] || d.overflowed[1];
                }
            });
        });
    }));
}));
require([
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function (application) {
    application.init();
    var $main = $('.main');
    var $sections = $('.section');
    var $pageControls = $('.nav-page-control');
    var $swbanners = $('.swbanner');
    var $window = $(window);
    var resizeTimer = null;
    var initialize = function (resize) {
        $main.hide();
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
            var h = $window.height();
            $sections.css({ minHeight: h > 890 ? h < 940 ? h : 940 : 890 });
            $main.show();
            $pageControls.each(function () {
                var $pageControl = $(this);
                var $pageContainer = $pageControl.prev('.nav-page');
                var $pageContent = $pageContainer.find('ul');
                var $pageItems;
                var pageViewHeight = $pageContainer.height();
                var pageOffsetHeight = $pageContent.height();
                var totalPage = pageOffsetHeight / pageViewHeight;
                $pageControl.html('');
                for (var i = 0; i < totalPage; i++)
                    $pageControl.append('<a href=\'javascript:;\'></a>');
                $pageItems = $pageControl.find('a');
                $pageItems.first().addClass('current');
                $pageContainer.stop().scrollTop(0);
                $pageItems.mouseenter(function () {
                    var $this = $(this);
                    var index = $this.index();
                    $pageItems.removeClass('current');
                    $this.addClass('current');
                    $pageContainer.stop().animate({ scrollTop: index * pageViewHeight });
                });
            });
            if (resize === false) {
                $swbanners.swbanner({
                    speed: 2000,
                    control2: true
                });
            } else {
                $swbanners.each(function () {
                    var $bannerContainer = $(this);
                    var $images = $bannerContainer.data('images');
                    var width = $bannerContainer.width();
                    var height = $bannerContainer.height();
                    $images.each(function (i, el) {
                        WebApi.computed(el.src, width, height).done(function (w, h, horizontal) {
                            var $el = $(el);
                            if (horizontal)
                                $el.css({
                                    left: '0',
                                    top: '50%',
                                    width: '100%',
                                    height: 'auto',
                                    marginTop: h / -2 + 'px',
                                    marginLeft: 0
                                });
                            else
                                $el.css({
                                    left: '50%',
                                    top: '0',
                                    width: 'auto',
                                    height: '100%',
                                    marginLeft: w / -2 + 'px',
                                    marginTop: 0
                                });
                        });
                    });
                });
            }
            if (resize === false) {
                $('.main.scroll-bar').scrollBar({
                    theme: 'light',
                    scrollInertia: 400,
                    advanced: { autoScrollOnFocus: false },
                    autoHideScrollbar: true,
                    scrollbarPosition: 'outside',
                    scrollButtons: { enable: false },
                    advanced: { updateOnImageLoad: false }
                });
                $.loadImage();
            }
        }, 200);
        return arguments.callee;
    };
    $window.resize(initialize(false));
});
define('Content/js/modules_base/main', [
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function () {
    return;
});