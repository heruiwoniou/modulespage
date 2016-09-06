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
require(['Static/js/application'], function (application) {
    application.init();
    var $main = $('body');
    var $window = $(window);
    var $swbanners = $('#swbanner');
    var $aphorism = $('.aphorism');
    var resizeTimer = null;
    var aphorismToggleTimer = null;
    var aphorismStop = function () {
        window.clearInterval(aphorismToggleTimer);
    };
    var aphorismPlay = function (speed) {
        window.clearInterval(aphorismToggleTimer);
        aphorismToggleTimer = window.setInterval(function () {
            $aphorism.fadeOut(function () {
                if ($aphorism.hasClass('aphorism-1'))
                    $aphorism.removeClass('aphorism-1').addClass('aphorism-2').fadeIn();
                else
                    $aphorism.removeClass('aphorism-2').addClass('aphorism-1').fadeIn();
            });
        }, speed);
    };
    var initialize = function (resize) {
        $main.hide();
        var cb = function () {
        };
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
            var h = $window.height() - 200 - 100 - 35;
            $swbanners.css({ height: h < 285 ? 285 : h });
            if (resize === false) {
                $swbanners.swbanner({
                    speed: 5000,
                    control2: true,
                    defaultWidth: $window.width(),
                    played: function (speed) {
                        aphorismPlay(speed);
                    },
                    stoped: function () {
                        aphorismStop();
                    }
                });
                $.loadImage();
                cb = function () {
                    $('.login-panel:first').addClass('forward-in');
                };
                $('.login-panel .toggle').click(function () {
                    var $this = $(this).closest('.login-panel');
                    var $other = $this.siblings();
                    $this.addClass('forward-out');
                    window.setTimeout(function () {
                        $this.removeClass('forward-in forward-out');
                        $other.addClass('forward-in');
                    }, 150);
                });
                $('.input').click(function () {
                    $(this).find('input').focus();
                });
            } else {
                $swbanners.each(function () {
                    var $bannerContainer = $(this);
                    var $images = $bannerContainer.data('images');
                    var width = $window.width();
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
            $main.fadeIn(cb);
        }, 200);
        return arguments.callee;
    };
    $window.resize(initialize(false));
});
define('Content/js/modules_base/login', ['Static/js/application'], function () {
    return;
});