define('Static/js/common/client/Request', [], function () {
    var request = {};
    var ps = window.location.search;
    if (!ps)
        return request;
    var reg = /[?&]*([^=]+)=([^&=]+)/gi, m;
    while (m = reg.exec(ps)) {
        request[m[1]] = m[2];
    }
    return request;
});
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
define('text', ['module'], function (module) {
    'use strict';
    var text, fs, Cc, Ci, xpcIsWindows, progIds = [
            'Msxml2.XMLHTTP',
            'Microsoft.XMLHTTP',
            'Msxml2.XMLHTTP.4.0'
        ], xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im, hasLocation = typeof location !== 'undefined' && location.href, defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''), defaultHostName = hasLocation && location.hostname, defaultPort = hasLocation && (location.port || undefined), buildMap = {}, masterConfig = module.config && module.config() || {};
    text = {
        version: '2.0.12',
        strip: function (content) {
            if (content) {
                content = content.replace(xmlRegExp, '');
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = '';
            }
            return content;
        },
        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1').replace(/[\f]/g, '\\f').replace(/[\b]/g, '\\b').replace(/[\n]/g, '\\n').replace(/[\t]/g, '\\t').replace(/[\r]/g, '\\r').replace(/[\u2028]/g, '\\u2028').replace(/[\u2029]/g, '\\u2029');
        },
        createXhr: masterConfig.createXhr || function () {
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== 'undefined') {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== 'undefined') {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {
                    }
                    if (xhr) {
                        progIds = [progId];
                        break;
                    }
                }
            }
            return xhr;
        },
        parseName: function (name) {
            var modName, ext, temp, strip = false, index = name.indexOf('.'), isRelative = name.indexOf('./') === 0 || name.indexOf('../') === 0;
            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }
            temp = ext || modName;
            index = temp.indexOf('!');
            if (index !== -1) {
                strip = temp.substring(index + 1) === 'strip';
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }
            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },
        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort, match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];
            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];
            return (!uProtocol || uProtocol === protocol) && (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) && (!uPort && !uHostName || uPort === port);
        },
        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },
        load: function (name, req, onLoad, config) {
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }
            masterConfig.isBuild = config && config.isBuild;
            var parsed = text.parseName(name), nonStripName = parsed.moduleName + (parsed.ext ? '.' + parsed.ext : ''), url = req.toUrl(nonStripName), useXhr = masterConfig.useXhr || text.useXhr;
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext, parsed.strip, content, onLoad);
                });
            }
        },
        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + '!' + moduleName, 'define(function () { return \'' + content + '\';});\n');
            }
        },
        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName), extPart = parsed.ext ? '.' + parsed.ext : '', nonStripName = parsed.moduleName + extPart, fileName = req.toUrl(parsed.moduleName + extPart) + '.js';
            text.load(nonStripName, req, function (value) {
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };
                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };
    if (masterConfig.env === 'node' || !masterConfig.env && typeof process !== 'undefined' && process.versions && !!process.versions.node && !process.versions['node-webkit']) {
        fs = require.nodeRequire('fs');
        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || !masterConfig.env && text.createXhr()) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }
            xhr.onreadystatechange = function (evt) {
                var status, err;
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }
                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || !masterConfig.env && typeof Packages !== 'undefined' && typeof java !== 'undefined') {
        text.get = function (url, callback) {
            var stringBuffer, line, encoding = 'utf-8', file = new java.io.File(url), lineSeparator = java.lang.System.getProperty('line.separator'), input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)), content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();
                if (line && line.length() && line.charAt(0) === 65279) {
                    line = line.substring(1);
                }
                if (line !== null) {
                    stringBuffer.append(line);
                }
                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                content = String(stringBuffer.toString());
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || !masterConfig.env && typeof Components !== 'undefined' && Components.classes && Components.interfaces) {
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = '@mozilla.org/windows-registry-key;1' in Cc;
        text.get = function (url, callback) {
            var inStream, convertStream, fileObj, readData = {};
            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }
            fileObj = new FileUtils.File(url);
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);
                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, 'utf-8', inStream.available(), Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
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
define('Class', [], function () {
    var ClassLibrary = {
        Classes: {},
        _callParent: function () {
            return arguments.callee.caller && arguments.callee.caller.fn ? arguments.callee.caller.fn.apply(this, arguments) : null;
        },
        _isDontEnum: function () {
            for (var key in { constructor: 1 })
                if (key == 'constructor')
                    return false;
            return true;
        },
        _extend: function (b, e, isRecursion) {
            b = b || {};
            for (var k in e) {
                var current = e[k];
                var ctype = Object.prototype.toString.apply(current);
                if (ctype == '[object Function]') {
                    var fn;
                    if (Object.prototype.toString.apply(b[k]) == '[object Function]')
                        fn = b[k];
                    b[k] = current;
                    if (fn)
                        b[k].fn = fn;
                } else if (ctype == '[object Object]') {
                    if (!b[k])
                        b[k] = {};
                    arguments.callee(b[k], e[k], true);
                } else
                    b[k] = current;
            }
            if (!isRecursion && ClassLibrary._isDontEnum() && b.constructor) {
                var constructor = b.constructor;
                b.constructor = e.constructor;
                b.constructor.fn = constructor;
            }
        },
        Class: function (sub, method, sup, area) {
            sup = sup || Object;
            area = area || ClassLibrary.Classes;
            var name;
            var space = sub.split('.');
            space.reverse();
            sub = space.shift();
            while ((name = space.pop()) != null) {
                if (!area[name])
                    area[name] = {};
                area = area[name];
            }
            var subclassProto = Object.create ? Object.create(sup.prototype) : function () {
                var Super = function () {
                };
                Super.prototype = sup.prototype;
                return new Super();
            }();
            ClassLibrary._extend(subclassProto, method);
            sub = area[sub] = subclassProto.constructor;
            sub.prototype = subclassProto;
            sub.prototype.constructor = sub;
            sub.prototype.callParent = ClassLibrary._callParent;
            return sub;
        }
    };
    window.ClassLibrary = ClassLibrary;
    return ClassLibrary.Class;
});
define('Core', [], function () {
    var core = function () {
        this.versions = '1.0';
    };
    var de = [
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toLocaleString',
            'toString',
            'valueOf'
        ], except = function (k) {
            for (var i = 0; i < de.length; i++) {
                if (de[i] === k)
                    return false;
            }
            return true;
        };
    core.prototype = {
        constructor: core,
        extend: function (o, b, inner) {
            b = b || this;
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    var obj = o[k], fn = null;
                    if (!except(k))
                        continue;
                    if (!inner && typeof b[k] == 'function' && typeof obj == 'function')
                        fn = b[k];
                    b[k] = o[k];
                    if (fn)
                        b[k].fn = fn;
                }
            }
            return b;
        }
    };
    core.classes = {};
    return function () {
        var c = new core();
        c.sup = core;
        return c;
    };
});
(function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define('Guid', [], factory);
    }
}(function () {
    function Guid(g) {
        var arr = new Array();
        if (typeof g == 'string') {
            InitByString(arr, g);
        } else {
            InitByOther(arr);
        }
        this.Equals = function (o) {
            if (o && o.IsGuid) {
                return this.ToString() == o.ToString();
            } else {
                return false;
            }
        };
        this.IsGuid = function () {
        };
        this.ToString = function (format) {
            if (typeof format == 'string') {
                if (format == 'N' || format == 'D' || format == 'B' || format == 'P') {
                    return ToStringWithFormat(arr, format);
                } else {
                    return ToStringWithFormat(arr, 'D');
                }
            } else {
                return ToStringWithFormat(arr, 'D');
            }
        };
        function InitByString(arr, g) {
            g = g.replace(/\{|\(|\)|\}|-/g, '');
            g = g.toLowerCase();
            if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {
                InitByOther(arr);
            } else {
                for (var i = 0; i < g.length; i++) {
                    arr.push(g[i]);
                }
            }
        }
        function InitByOther(arr) {
            var i = 32;
            while (i--) {
                arr.push('0');
            }
        }
        function ToStringWithFormat(arr, format) {
            switch (format) {
            case 'N':
                return arr.toString().replace(/,/g, '');
            case 'D':
                var str = arr.slice(0, 8) + '-' + arr.slice(8, 12) + '-' + arr.slice(12, 16) + '-' + arr.slice(16, 20) + '-' + arr.slice(20, 32);
                str = str.replace(/,/g, '');
                return str;
            case 'B':
                var str = ToStringWithFormat(arr, 'D');
                str = '{' + str + '}';
                return str;
            case 'P':
                var str = ToStringWithFormat(arr, 'D');
                str = '(' + str + ')';
                return str;
            default:
                return new Guid();
            }
        }
    }
    Guid.Empty = new Guid();
    Guid.NewGuid = function () {
        var g = '';
        var i = 32;
        while (i--) {
            g += Math.floor(Math.random() * 16).toString(16);
        }
        return new Guid(g);
    };
    return Guid;
}));
define('Static/js/comsys/base/Base', [
    'Core',
    'Class',
    'Guid'
], function (Core, Class, Guid) {
    var ClassName = 'Controll.Base';
    return Class(ClassName, {
        constructor: function (args) {
            args = args || {};
            this.callParent(args);
            this.setting = {};
            if (args.setting)
                this.setting = $.extend({}, args.setting);
            this.classids = Guid.NewGuid().ToString('D');
        },
        initialize: function () {
            return this;
        }
    }, Core);
});
define('Static/js/comsys/widget/baseClass/WidgetBase', [
    'Class',
    'Static/js/comsys/base/Base'
], function (Class, Base) {
    return Class('Control.WidgetBase', {
        constructor: function (args) {
            this.callParent(args);
            this.$BaseEl = $(args.element);
        },
        initialize: function () {
            if (!this.$BaseEl.attr('id'))
                this.$BaseEl.attr('id', this.classids);
            return this;
        }
    }, Base);
});
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('Static/js/common/setting', [], factory);
    } else {
        window.commonsetting = factory();
    }
}(function () {
    var u = /MSIE (\d*).0|Chrome|Firefox/i.exec(window.navigator.userAgent);
    return {
        layerSetting: {
            type: 0,
            debug: true
        },
        LabelSetting: {
            set: function (node, text) {
                if (node.nodeName == '#text')
                    node.nodeValue = text;
                else if (node.nodeName == 'SPAN')
                    node.innerHTML = text;
            },
            get: function (node) {
                node = this.getNode(node);
                if (node == undefined)
                    return '';
                if (node.nodeValue && !/^\s*$/.test(node.nodeValue))
                    return node.nodeValue;
                else if (!node.nodeValue && node.nodeName == 'SPAN')
                    return node.innerHTML;
                else
                    return '';
            },
            getNode: function (node) {
                if (node === undefined)
                    return document.createTextNode('');
                else if (node.nodeValue && !/^\s*$/.test(node.nodeValue) || !node.nodeValue && node.nodeName == 'SPAN')
                    return node;
                else
                    return node.nextSibling && (node.nextSibling.nodeName == 'SPAN' || node.nextSibling.nodeName == '#text') ? arguments.callee(node.nextSibling) : document.createTextNode('');
            }
        },
        Effect: { window: 'forward' },
        Browser: function () {
            var userAgent = navigator.userAgent;
            var isOpera = userAgent.indexOf('Opera') > -1;
            var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera || userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:') > -1;
            var isFF = userAgent.indexOf('Firefox') > -1;
            var isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1 && userAgent.indexOf('Edge') == -1;
            var isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edge') == -1;
            var isEdge = userAgent.indexOf('Edge') > -1;
            if (isIE) {
                /MSIE (\d+\.\d+);|rv:(\d+\.\d+)/.test(userAgent);
                var IEVersion = parseInt(RegExp.$1 || RegExp.$2);
                if (IEVersion)
                    return 'IE' + IEVersion;
                else
                    return '';
            }
            if (isFF)
                return 'FF';
            if (isOpera)
                return 'Opera';
            if (isSafari)
                return 'Safari';
            if (isChrome)
                return 'Chrome';
            if (isEdge)
                return 'Edge';
        },
        Navigator: {
            LowIEOrNoIE: function () {
                return u !== null && ~~u[1] < 8;
            }(),
            IsIE8: function () {
                return u === null ? false : ~~u[1] == 8;
            }(),
            IsBackCompat: document.compatMode == 'BackCompat'
        }
    };
}));
define('Static/js/comsys/widget/baseClass/LabelBase', [
    'Class',
    'Static/js/comsys/widget/baseClass/WidgetBase',
    'Static/js/common/setting'
], function (Class, WidgetBase, Setting) {
    var ClassName = 'Control.LabelBase';
    return Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
        },
        initialize: function () {
            this.callParent();
            var id = this.$BaseEl.attr('id');
            this.$LabelText = null;
            if (id && this.$BaseEl.parent().find('label[for=' + id + ']').length != 0) {
                this.$LabelContainer = this.$BaseEl.parent().find('label[for=' + id + ']');
                return this.moveLabel();
            } else {
                this.$LabelContainer = $('<label for="' + this.$BaseEl.attr('id') + '"></label>');
                return this.wrapLabel();
            }
        },
        moveLabel: function () {
            var data = this.$BaseEl.data(ClassName);
            if (data == undefined) {
                this.$BaseEl.after(this.$LabelContainer).appendTo(this.$LabelContainer);
            } else
                return data;
        },
        wrapLabel: function () {
            var $parent = this.$BaseEl.parent();
            var data = this.$BaseEl.data(ClassName);
            if (data == undefined) {
                var location = this.$BaseEl.attr('cs-label-location') || 'right';
                if ($parent[0].nodeName != 'LABEL') {
                    var i = 0, nodes = $parent[0].childNodes, o;
                    do {
                    } while ((o = nodes[i++]) && o != this.$BaseEl[0]);
                    this.$BaseEl.after(this.$LabelContainer).appendTo(this.$LabelContainer);
                    this.$LabelText = Setting.LabelSetting.getNode(nodes[i]);
                    this.$BaseEl.attr('data-label', $.trim(Setting.LabelSetting.get(this.$LabelText)));
                } else {
                    if ($parent[0].childNodes.length >= 2) {
                        this.$BaseEl.attr('data-label', $.trim(Setting.LabelSetting.get($parent[0].childNodes[1])));
                        this.$LabelText = Setting.LabelSetting.getNode($parent[0].childNodes[1]);
                    } else {
                        this.$LabelText = document.createTextNode('');
                    }
                    this.$LabelContainer = $parent;
                }
                if (location === 'left')
                    this.$LabelContainer.prepend(this.$LabelText);
                else
                    this.$LabelContainer.append(this.$LabelText);
                this.$LabelContainer.addClass('location-' + location);
                this.label = this.$BaseEl.attr('cs-label') || $.trim(Setting.LabelSetting.get(this.$LabelText));
                this.on = this.$BaseEl.attr('cs-label-on');
                this.off = this.$BaseEl.attr('cs-label-off');
                if (this.label || this.on || this.off) {
                    if (this.$BaseEl.is(':checked'))
                        Setting.LabelSetting.set(this.$LabelText, this.on || this.label);
                    else
                        Setting.LabelSetting.set(this.$LabelText, this.off || this.label);
                }
                return this;
            } else
                return data;
        }
    }, WidgetBase);
});
define('Static/js/comsys/widget/CheckBox', [
    'Class',
    'Static/js/comsys/widget/baseClass/LabelBase',
    'Static/js/common/setting'
], function (Class, LabelBase, Setting) {
    var ClassName = 'Control.CheckBox';
    var CheckBox = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            this.$CheckBoxEl = $(args.element);
        },
        initialize: function () {
            var that = this;
            var $this = this.$CheckBoxEl;
            if ($this.data(ClassName) == undefined) {
                this.callParent();
                var id = $this.attr('id');
                var buttontype = this.setting.buttontype ? ' ' + this.setting.buttontype + ' ' : '';
                this.$CheckBoxControl = $('<div class="comsys-checkbox' + buttontype + ($this.get(0).checked ? ' checkbox-checked' : '') + ($this.is(':disabled') ? ' disabled' : '') + '"></div>');
                var $wrap = this.$CheckBoxControl;
                $this.before($wrap).appendTo($wrap);
                var $parent = $wrap.parent();
                if ($parent.get(0).nodeName == 'LABEL') {
                    $parent.addClass('comsys-checkbox-label').attr('for', id);
                }
                if (this.setting.isDocumentBind) {
                    $(document).on('click.CheckBoxClickHandler' + id, '#' + id, function () {
                        that.checkedChange(this);
                    });
                } else {
                    $this.off('click.CheckBoxClickHandler').on('click.CheckBoxClickHandler', function (e, state) {
                        that.checkedChange(this);
                    });
                }
                $this.data(ClassName, this);
            } else {
                that = $this.data(ClassName);
                this.checkedChange.apply(that, $this);
            }
            return this;
        },
        SetDisabled: function (status) {
            if (status) {
                this.$BaseEl.attr('disabled', true);
                this.$CheckBoxControl.addClass('disabled');
            } else {
                this.$BaseEl.removeAttr('disabled');
                this.$CheckBoxControl.removeClass('disabled');
            }
        },
        SetCheck: function (status) {
            if (status) {
                this.$BaseEl.get(0).checked = true;
                this.$CheckBoxControl.removeClass('checkbox-checked').addClass('checkbox-checked');
            } else {
                this.$BaseEl.get(0).checked = false;
                this.$CheckBoxControl.removeClass('checkbox-checked');
            }
        },
        checkedChange: function (el) {
            var that = this;
            if ($(el).is(':checked')) {
                that.$CheckBoxControl.addClass('checkbox-checked');
                Setting.LabelSetting.set(that.$LabelText, that.on || that.label);
            } else {
                that.$CheckBoxControl.removeClass('checkbox-checked');
                Setting.LabelSetting.set(that.$LabelText, that.off || that.label);
            }
        },
        destory: function () {
            $(document).off('.CheckBoxClickHandler' + this.$CheckBoxEl.attr('id'));
            this.$BaseEl.off('click.CheckBoxClickHandler');
            this.$CheckBoxControl.parent().removeAttr('style');
            this.$CheckBoxControl.after(this.$CheckBoxEl);
            this.$CheckBoxControl.remove();
            this.$CheckBoxEl.removeData(ClassName);
        }
    }, LabelBase);
    $.fn.extend({
        CheckBoxInit: function () {
            return this.each(function () {
                var setting = {
                    buttontype: $(this).attr('cs-button-type') || '',
                    isDocumentBind: $(this).attr('cs-isdocumentbind') === 'true'
                };
                new CheckBox({
                    element: this,
                    setting: setting
                }).initialize();
            }).removeAttr('cs-control');
        }
    });
    return CheckBox;
});
define('Static/js/comsys/widget/RadioBox', [
    'Class',
    'Static/js/comsys/widget/baseClass/LabelBase'
], function (Class, LabelBase) {
    var ClassName = 'Control.RadioBox';
    var RadioBox = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            this.$RadioBoxEl = $(args.element);
            this.$group = $('input[name=' + this.$RadioBoxEl.attr('name') + ']');
        },
        initialize: function () {
            var that = this;
            var $this = this.$RadioBoxEl;
            if ($this.data(ClassName) == undefined) {
                this.callParent();
                var id = $this.attr('id');
                this.$RadioBoxControl = $('<div class="comsys-radiobox' + ($this.get(0).checked ? ' radiobox-checked' : '') + ($this.is(':disabled') ? ' disabled' : '') + '"></div>');
                var $wrap = this.$RadioBoxControl;
                $this.before($wrap).appendTo($wrap);
                var $parent = $wrap.parent();
                if ($parent.get(0).nodeName == 'LABEL') {
                    $parent.addClass('comsys-checkbox-label').attr('for', id);
                }
                var $group = $('input[name=' + $this.attr('name') + ']');
                if (this.setting.isDocumentBind) {
                    $(document).on('click.RadioBoxClickHandler' + id, '#' + id, function (e, state) {
                        if (this.checked)
                            $($wrap).addClass('radiobox-checked');
                        else
                            $($wrap).removeClass('radiobox-checked');
                        if (!state)
                            that.$group.not(this).trigger('radioChange');
                    });
                } else {
                    $this.off('click.RadioBoxClickHandler').on('click.RadioBoxClickHandler', function (e, state) {
                        if (this.checked)
                            $($wrap).addClass('radiobox-checked');
                        else
                            $($wrap).removeClass('radiobox-checked');
                        if (!state)
                            that.$group.not(this).trigger('radioChange');
                    });
                }
                $this.on('radioChange', function () {
                    if (this.checked)
                        $($wrap).addClass('radiobox-checked');
                    else
                        $($wrap).removeClass('radiobox-checked');
                });
                $this.data(ClassName, this);
            } else {
                var that = $this.data(ClassName);
                if ($this.is(':checked'))
                    that.$RadioBoxControl.addClass('radiobox-checked');
                else
                    that.$RadioBoxControl.removeClass('radiobox-checked');
            }
            return this;
        },
        SetDisabled: function (status) {
            if (status) {
                this.$BaseEl.attr('disabled', true);
                this.$CheckBoxControl.addClass('disabled');
            } else {
                this.$BaseEl.removeAttr('disabled');
                this.$CheckBoxControl.removeClass('disabled');
            }
        },
        SetCheck: function (status) {
            if (status) {
                this.$BaseEl.get(0).checked = true;
                this.$RadioBoxControl.removeClass('radiobox-checked').addClass('radiobox-checked');
            } else {
                this.$BaseEl.get(0).checked = false;
                this.$RadioBoxControl.removeClass('radiobox-checked');
            }
            this.$group.not(this.$BaseEl).trigger('radioChange');
        },
        destory: function () {
            $(document).off('.RadioBoxClickHandler' + this.$RadioBoxEl.attr('id'));
            this.$RadioBoxControl.parent().removeAttr('style');
            this.$RadioBoxControl.after(this.$RadioBoxEl);
            this.$RadioBoxControl.remove();
        }
    }, LabelBase);
    $.fn.extend({
        RadioBoxInit: function () {
            return this.each(function () {
                var setting = {
                    buttontype: $(this).attr('data-buttontype') || '',
                    isDocumentBind: $(this).attr('data-isdocumentbind') || false
                };
                new RadioBox({
                    element: this,
                    setting: setting
                }).initialize();
            }).removeAttr('cs-control');
        }
    });
    return RadioBox;
});
define('TPLEngine', [], function () {
    var TPLEngine;
    TPLEngine = {
        render: function (tpl, data) {
            return this.draw(tpl, data);
        },
        drawlayout: function (tpl, data) {
            var reg = /@\{layout:([\s\S]*?)\}@/g, regRender = /@\{layout\}@/, match;
            if (match = reg.exec(tpl)) {
                var code = 'var r=[];\n';
                var param = match[1].split(',');
                code += 'r.push(TPLEngine.draw(' + param[0] + ',' + param[1] + '));\n';
                code += 'return r.join("");';
                var part = new Function('TPLEngine', code.replace(/[\r\t\n]/g, '')).apply(data, [TPLEngine]);
                return part.replace(regRender, tpl.slice(match[0].length));
            }
            return false;
        },
        draw: function (tpl, data, $parent) {
            $parent = $parent || data;
            var content = tpl;
            (content = this.drawlayout(content, data)) !== false ? tpl = content : undefined;
            var reg = /<%([\s\S]*?)%>|@\{section:([\s\S]*?)\}@/g, regOut = /^\s*=\s*([\s\S]*)$/, code = 'var r=[];\n', cursor = 0, match, e, line;
            var add = function (match, js) {
                var section = match[1] === undefined || match[1] === '';
                line = typeof match == 'string' ? match : section ? match[2] : match[1];
                if (js) {
                    if (section) {
                        var param = line.split(',');
                        var item = param.shift();
                        var param = param.join(',');
                        code += 'this.$parent=$parent;r.push(TPLEngine.draw(' + item + ',' + param + ',this));\n';
                    } else {
                        if ((e = regOut.exec(line)) == null) {
                            code += line + '\n';
                        } else {
                            code += 'r.push(' + e[1] + ');\n';
                        }
                    }
                } else {
                    if (line != '')
                        code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
                }
                return add;
            };
            while (match = reg.exec(tpl)) {
                add(tpl.slice(cursor, match.index))(match, true);
                cursor = match.index + match[0].length;
            }
            add(tpl.substr(cursor, tpl.length - cursor));
            code += 'return r.join("");';
            return new Function('$parent', 'TPLEngine', code.replace(/[\r\t\n]/g, '')).apply(data, [
                $parent,
                TPLEngine
            ]);
        }
    };
    return TPLEngine;
});
define('Static/js/comsys/widget/baseClass/HiddenBase', [
    'Class',
    'Static/js/comsys/widget/baseClass/WidgetBase'
], function (Class, WidgetBase) {
    return Class('Control.HiddenBase', {
        constructor: function (args) {
            this.callParent(args);
            this.$HiddenBaseElContainer = $('<div class="comsys-hidden-container"></div>');
        },
        initialize: function () {
            this.callParent();
            return this;
        },
        addPlaceHolderBefore: function () {
            if (this.setting.addPlaceHolderBefore)
                this.setting.addPlaceHolderBefore.call(this);
        },
        addPlaceHolderAfter: function () {
            if (this.setting.addPlaceHolderAfter)
                this.setting.addPlaceHolderAfter.call(this);
        },
        addPlaceHolder: function (target) {
            this.addPlaceHolderBefore();
            target.append(this.$HiddenBaseElContainer);
            this.addPlaceHolderAfter();
        }
    }, WidgetBase);
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
define('Static/js/comsys/widget/SingleCombox', [
    'Class',
    'TPLEngine',
    'Static/js/comsys/widget/baseClass/HiddenBase',
    'Static/js/libs/jquery.mousewheel/jquery.mousewheel'
], function (Class, TPLEngine, HiddenBase) {
    var ClassName = 'Control.SingleCombox';
    var SingleCombox = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            var element = args.element;
            if (element.nodeName && element.nodeName.toLowerCase() != 'select')
                throw new Error('this is not a select');
            this.element = element;
            this.$element = $(element);
            this.appendTo = args.appendTo || document.body;
            this.setting = { dropLength: this.setting.dropLength || 5 };
            this.element.style.display = 'none';
            this.OnOptionChange = args.onChange || this.element.onchange || function () {
            };
            this.Timer = null;
            var u = /MSIE (\d*).0|Chrome|Firefox/i.exec(window.navigator.userAgent);
            this.LowIEOrNoIE = u != null && ~~u[1] < 8;
            this.isInnerMouseWheel = false;
        },
        initialize: function () {
            var $this = $(this.element);
            if ($this.data(ClassName) == undefined) {
                this.generate();
                $(this.element).data(ClassName, this);
                this.callParent();
                this.addPlaceHolder(this.$controller);
            } else {
                $(this.element).trigger('reload');
            }
            return this;
        },
        TPL: {
            layout: '<div class=\'comsys-base comsys-SingleCombox-layout\' id=\'SingleCombox-<%= this.classids%>\'>@{layout}@</div>',
            main: '@{layout:this.TPL.layout,this}@<div class=\'comsys-SingleCombox-input\'><input type=\'text\' readonly placeholder=\'<%=$(this.element).attr("placeholder")?$(this.element).attr("placeholder"):""%>\' value=\'<%=this.element.options.length==0 || this.element.selectedIndex == -1?\'\':this.element.options[this.element.selectedIndex].text%>\'/></div><div class=\'comsys-SingleCombox-button\'></div>@{section:this.TPL.drop,this}@',
            drop: '<div class=\'comsys-combox-base comsys-SingleCombox-drop\' id=\'SingleCombox-drop-<%= this.classids%>\'><%for(var i=0;i<this.element.options.length;i++){%>@{section:this.TPL.option,this.element.options[i]}@<%}%></div>',
            option: '<div class=\'comsys-base comsys-SingleCombox-option<%=this.selected?\' selected\':\'\'%>\' data-index=\'<%=this.index%>\'><%=this.text%></div>'
        },
        addPlaceHolderAfter: function () {
            this.$controller.prepend(this.$HiddenBaseElContainer);
            this.$HiddenBaseElContainer.append(this.element);
        },
        keyCode: {
            SPACE: 32,
            ENTER: 13,
            DOWN: 40,
            UP: 38,
            SHOW: 540
        },
        generate: function () {
            var THIS = this;
            THIS.state = false;
            THIS.$controller = $(TPLEngine.render(this.TPL.main, this));
            this.options = this.element.options.length;
            $(this.element.parentNode).append(THIS.$controller);
            THIS.$drop = THIS.$controller.find('.comsys-SingleCombox-drop');
            THIS.$input = THIS.$controller.find('input');
            if (this.fixed())
                THIS.$drop.css({ position: 'fixed' });
            $(this.element.parentNode).append(THIS.$drop);
            $(this.element).on('rebind', function () {
                return THIS.ReBind.apply(THIS, arguments);
            }).on('reload', function () {
                return THIS.ReLoad.apply(THIS, arguments);
            });
            THIS.$drop.on('mousedown', function () {
                return THIS.OnDropClick.apply(THIS, arguments);
            });
            THIS.$drop.bind('otherhide', function () {
                return THIS.OnOtherClick.apply(THIS, arguments);
            });
            THIS.$controller.on('click', function () {
                return THIS.OnButtonClick.apply(THIS, arguments);
            });
            THIS.$controller.delegate('.comsys-SingleCombox-input input', 'keydown', function () {
                return THIS.OnKeyDown.apply(THIS, arguments);
            });
            THIS.$drop.get(0).onmousewheel = function (e) {
                return THIS.OnMouseWheel.call(THIS, e || window.event, THIS.$drop.get(0));
            };
            THIS.$input.off('.SingleComboxFocus').on('focus.SingleComboxFocus', function () {
                THIS.$controller.addClass('focus-outerline');
            });
            THIS.$input.off('.SingleComboxFocusOut').on('focusout.SingleComboxFocusOut', function () {
                THIS.$controller.removeClass('focus-outerline');
                return THIS.OnFocusOut.apply(THIS, arguments);
            });
            THIS.$drop.delegate('.comsys-SingleCombox-option', 'click', function () {
                return THIS.OnOptionClick.apply(THIS, [
                    arguments[0],
                    this
                ]);
            });
        },
        fixed: function () {
            var node = this.element;
            do {
                if ($(node).css('position').indexOf('fixed') > -1)
                    return true;
            } while (node = node.parentElement);
            return false;
        },
        ReBind: function () {
            var THIS = this;
            THIS.state = true;
            THIS.SelectedIndex(THIS.SelectedIndex());
        },
        ReLoad: function () {
            var THIS = this;
            THIS.$drop.html($(TPLEngine.render(this.TPL.drop, this)).html());
            this.options = this.element.options.length;
            this.ReBind();
        },
        OnOtherClick: function () {
            this.state = false;
        },
        OnMouseWheel: function (e, scroller) {
            var THIS = this;
            e.stopPropagation();
            var k = e.wheelDelta ? e.wheelDelta / 120 * THIS.$controller.outerHeight() : -e.detail;
            scroller.scrollTop = scroller.scrollTop - k;
            return false;
        },
        OnOptionClick: function (e, t) {
            var THIS = this;
            THIS.element.selectedIndex = $(t).attr('data-index');
            THIS.$input.val(THIS.element.options[THIS.element.selectedIndex].text);
            THIS.element.options[THIS.element.selectedIndex].selected = true;
            THIS.DropHide();
        },
        OnDropClick: function (e) {
            var THIS = this;
            var p = e.currentTarget || e.delegateTarget;
            var c = e.target || e.toElement;
            THIS.cancelFocusOut = true;
            window.clearTimeout(THIS.Timer);
            THIS.Timer = null;
            var d = THIS.$drop.get(0);
            if (p.id == c.id && d.scrollHeight < d.offsetHeight)
                THIS.DropHide();
        },
        OnFocusOut: function () {
            var THIS = this;
            if (!THIS.cancelFocusOut) {
                THIS.Timer = window.setTimeout(function () {
                    THIS.DropHide();
                }, 10);
            }
            THIS.cancelFocusOut = false;
        },
        DropHide: function () {
            var THIS = this;
            if (!THIS.state)
                return;
            window.clearTimeout(THIS.Timer);
            THIS.Timer = null;
            THIS.$drop.hide();
            THIS.state = false;
            if (THIS.element.selectedIndex != -1) {
                THIS.$input.val(THIS.element.options[THIS.element.selectedIndex].text);
                THIS.element.options[THIS.element.selectedIndex].selected = true;
            } else
                THIS.$input.val('');
            THIS.cancelFocusOut = true;
            if (THIS.LastKey != THIS.element.value) {
                THIS.OnOptionChange.apply(this.element);
                $(THIS.element).trigger('vuechange');
                THIS.LastKey = THIS.element.value;
            }
            THIS.cancelFocusOut = false;
            THIS.$input.trigger('focusout.TipChangeEvent');
            THIS.UnRuntimeBindScroll();
            if (this.placeholder !== null) {
                this.placeholder.replaceWith(this.$drop);
                this.placeholder = null;
            }
        },
        SelectedIndex: function () {
            var THIS = this;
            if (arguments.length === 0)
                return THIS.element.selectedIndex;
            else {
                THIS.element.selectedIndex = arguments[0];
                THIS.DropHide();
            }
        },
        Value: function () {
            var THIS = this;
            if (arguments.length === 0)
                return THIS.element.options[THIS.element.selectedIndex].value;
            else {
                for (var i = 0; i < THIS.element.options.length; i++) {
                    var option = THIS.element.options[i];
                    if (option.value === arguments[0]) {
                        THIS.SelectedIndex(option.index);
                        break;
                    }
                }
            }
        },
        OnOtherAreaClick: function (e) {
            var THIS = this;
            var $t = $(e.target || e.toElement), $d = $t.closest('.comsys-SingleCombox-drop'), $l = $t.closest('.comsys-SingleCombox-layout'), $did = $d.attr('id'), $tdid = 'SingleCombox-drop-' + THIS.classids, $lid = $l.attr('id'), $tlid = 'SingleCombox-' + THIS.classids;
            if ($d.length == 0 && $l.length == 0 || $d.length != 0 && $did != $tdid || $l.length != 0 && $lid != $tlid) {
                THIS.DropHide();
                return;
            }
            THIS.cancelFocusOut = true;
        },
        SetPosition: function () {
            var offset = this.Offset(this.$controller.get(0));
            this.placeholder = $('<div id=\'placeholder' + this.classids + '\'></div>');
            this.$drop.before(this.placeholder);
            var controlHeight = this.$controller.outerHeight();
            var controlWidth = this.$controller.outerWidth();
            var winHeight = $(window).height();
            var winWidth = $(window).width();
            var dropHeight = controlHeight * this.setting.dropLength;
            var runtimedropHeight = controlHeight * (this.element.options.length < this.setting.dropLength ? this.element.options.length : this.setting.dropLength);
            var isbottom = winHeight - (runtimedropHeight + offset.top + controlHeight + 6) > 0;
            $(this.appendTo).append(this.$drop);
            this.$drop.css({
                left: -99999,
                maxHeight: dropHeight
            }).appendTo(document.body).show();
            this.$drop.css({
                minWidth: controlWidth,
                maxWidth: winWidth - offset.left - 10,
                left: offset.left,
                top: isbottom ? offset.top + controlHeight + 6 : offset.top - runtimedropHeight - 6
            });
        },
        RuntimeBind: function () {
            var THIS = this;
            $(document).off('.dropmousewheelhide').on('mousewheel.dropmousewheelhide', function () {
                THIS.DropHide();
            });
            $(document).off('.outerClickListener').on('mousedown.outerClickListener', function () {
                return THIS.OnOtherAreaClick.apply(THIS, arguments);
            });
        },
        UnRuntimeBindScroll: function () {
            $(document).off('.dropmousewheelhide');
            $(document).off('.outerClickListener');
        },
        OnButtonClick: function (e, isFilter, type, isRange) {
            var THIS = this;
            window.clearTimeout(THIS.Timer);
            THIS.Timer = null;
            if (this.element.disabled)
                return;
            if (this.options != this.element.options.length)
                this.ReLoad();
            if (!this.state) {
                this.$input.focus();
                $('div.comsys-combox-base:visible').hide().trigger('otherhide');
                if (this.element.options.length == 0)
                    return false;
                this.SetPosition();
                this.state = true;
                this.RuntimeBind();
            } else if (!isFilter && this.state) {
                this.DropHide();
            }
            if (this.element.selectedIndex !== -1) {
                this.$drop.find('.selected').removeClass('selected').end().find('div.comsys-SingleCombox-option:eq(' + this.element.selectedIndex + ')').addClass('selected');
            } else {
                this.$drop.find('.selected').removeClass('selected');
            }
            this.OptionPosition(!isFilter & THIS.state ? this.keyCode.SHOW : type, isRange);
        },
        OptionPosition: function (type, isRange) {
            var THIS = this;
            var obj = THIS.$drop.find('.selected').get(0);
            var drop = THIS.$drop.get(0);
            if (!obj) {
                drop.scrollTop = 0;
                return;
            }
            var top = obj.offsetTop;
            switch (type) {
            case THIS.keyCode.DOWN:
                if (isRange)
                    drop.scrollTop = 0;
                else {
                    if (drop.scrollTop + drop.offsetHeight - 2 <= top)
                        drop.scrollTop = top - drop.offsetHeight + obj.offsetHeight;
                }
                break;
            case THIS.keyCode.UP:
                if (isRange)
                    drop.scrollTop = drop.scrollHeight;
                else {
                    if (drop.scrollTop > top)
                        drop.scrollTop = top;
                }
                break;
            case THIS.keyCode.SHOW:
            default:
                drop.scrollTop = top;
                break;
            }
            if (THIS.element.selectedIndex !== -1) {
                THIS.$drop.find('.selected').removeClass('selected').end().find('div.comsys-SingleCombox-option:eq(' + THIS.element.selectedIndex + ')').addClass('selected');
            } else {
                THIS.$drop.find('.selected').removeClass('selected');
            }
        },
        OnKeyDown: function (e) {
            var THIS = this;
            var isRange = false;
            switch (e.keyCode) {
            case THIS.keyCode.DOWN:
                if (THIS.state) {
                    isRange = THIS.element.selectedIndex === THIS.element.options.length - 1;
                    isRange ? THIS.element.selectedIndex = 0 : THIS.element.selectedIndex += 1;
                }
                THIS.$controller.find('.comsys-SingleCombox-button').trigger('click', [
                    true,
                    e.keyCode,
                    isRange
                ]);
                e.stopPropagation();
                return false;
            case THIS.keyCode.UP:
                if (THIS.state) {
                    isRange = THIS.element.selectedIndex === 0;
                    isRange ? THIS.element.selectedIndex = THIS.element.options.length - 1 : THIS.element.selectedIndex -= 1;
                }
                THIS.$controller.find('.comsys-SingleCombox-button').trigger('click', [
                    true,
                    e.keyCode,
                    isRange
                ]);
                e.stopPropagation();
                return false;
            case THIS.keyCode.ENTER:
                var index = THIS.$drop.find('.selected').attr('data-index');
                THIS.element.selectedIndex = index == undefined ? -1 : index;
                THIS.DropHide();
                e.stopPropagation();
                return false;
            default:
                THIS.FTimer = window.setTimeout(function () {
                    if (THIS.LastKey != THIS.element.value) {
                        THIS.Search(THIS.$input.val());
                        THIS.LastKey = THIS.element.value;
                    }
                });
                break;
            }
        },
        Search: function (key) {
            var index = -1;
            var THIS = this;
            if (key !== '') {
                var options = $(THIS.element).find('option:contains(\'' + $.trim(key) + '\')');
                if (options.length != 0) {
                    index = options[0].index;
                }
            }
            THIS.element.selectedIndex = index;
            THIS.$controller.find('.comsys-SingleCombox-button').trigger('click', [
                true,
                THIS.keyCode.SHOW,
                false
            ]);
        },
        Offset: function (obj) {
            var $obj = $(obj);
            var re = $obj.offset();
            return re;
        }
    }, HiddenBase);
    $.fn.extend({
        SingleComboxInit: function (setting) {
            setting = setting || {};
            return this.each(function () {
                new SingleCombox({
                    element: this,
                    onChange: setting.onChange
                }).initialize();
            });
        }
    });
    return SingleCombox;
});
define('Static/js/comsys/widget/ButtonTextBox', [
    'Class',
    'TPLEngine',
    'Static/js/comsys/widget/baseClass/HiddenBase'
], function (Class, TPLEngine, HiddenBase) {
    var ClassName = 'Control.ButtonTextBox';
    var ButtonTextBox = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            this.$ButtonTextBoxEl = $(args.element);
            this.setting.ButtonClass = this.$ButtonTextBoxEl.attr('cs-button-type') || '';
            this.setting.location = this.$ButtonTextBoxEl.attr('cs-label-location') || 'right';
        },
        initialize: function () {
            var that = this;
            if (this.$ButtonTextBoxEl.data(ClassName) == undefined) {
                this.$ButtonTextBoxController = $(TPLEngine.render(this.TPL.main, this));
                this.$ButtonTextBoxEl.before(this.$ButtonTextBoxController);
                this.$ButtonTextBoxController.find('.comsys-ButtonTextBox-input').append(this.$ButtonTextBoxEl);
                this.$ButtonTextBoxEl.on('focus', function () {
                    that.$ButtonTextBoxController.addClass('focus-outerline');
                }).on('focusout', function () {
                    that.$ButtonTextBoxController.removeClass('focus-outerline');
                });
                this.$ButtonTextBoxEl.data(ClassName, this);
                this.callParent();
                this.addPlaceHolder(this.$ButtonTextBoxController);
            }
            return this;
        },
        TPL: {
            layout: '<div class=\'comsys-base comsys-ButtonTextBox-layout<%=\' \' + this.setting.ButtonClass + \' location-\'+ this.setting.location%>\' id=\'<%= this.classids%>\'>@{layout}@</div>',
            main: '@{layout:this.TPL.layout,this}@<div class=\'comsys-ButtonTextBox-input\'></div><div class=\'comsys-ButtonTextBox-button\'></div>'
        }
    }, HiddenBase);
    $.fn.extend({
        ButtonTextBoxInit: function (setting) {
            return this.each(function () {
                new ButtonTextBox({
                    element: this,
                    setting: setting
                }).initialize();
            }).removeAttr('cs-control');
        }
    });
    return ButtonTextBox;
});
var $dp, WdatePicker;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('Static/js/libs/wdate.picker/WdatePicker', [], factory);
    } else {
        factory();
    }
}(function () {
    var $ = {
        $langList: [
            {
                name: 'en',
                charset: 'UTF-8'
            },
            {
                name: 'zh-cn',
                charset: 'gb2312'
            },
            {
                name: 'zh-tw',
                charset: 'GBK'
            }
        ],
        $skinList: [
            {
                name: 'default',
                charset: 'gb2312'
            },
            {
                name: 'whyGreen',
                charset: 'gb2312'
            },
            {
                name: 'blue',
                charset: 'gb2312'
            },
            {
                name: 'green',
                charset: 'gb2312'
            },
            {
                name: 'simple',
                charset: 'gb2312'
            },
            {
                name: 'ext',
                charset: 'gb2312'
            },
            {
                name: 'blueFresh',
                charset: 'gb2312'
            },
            {
                name: 'twoer',
                charset: 'gb2312'
            },
            {
                name: 'YcloudRed',
                charset: 'gb2312'
            }
        ],
        $wdate: true,
        $crossFrame: true,
        $preLoad: false,
        $dpPath: '',
        doubleCalendar: false,
        enableKeyboard: true,
        enableInputMask: true,
        autoUpdateOnChanged: null,
        weekMethod: 'ISO8601',
        position: {},
        lang: 'auto',
        skin: 'default',
        dateFmt: 'yyyy-MM-dd',
        realDateFmt: 'yyyy-MM-dd',
        realTimeFmt: 'HH:mm:ss',
        realFullFmt: '%Date %Time',
        minDate: '1900-01-01 00:00:00',
        maxDate: '2099-12-31 23:59:59',
        startDate: '',
        alwaysUseStartDate: false,
        yearOffset: 1911,
        firstDayOfWeek: 0,
        isShowWeek: false,
        highLineWeekDay: true,
        isShowClear: true,
        isShowToday: true,
        isShowOK: true,
        isShowOthers: true,
        readOnly: false,
        errDealMode: 0,
        autoPickDate: null,
        qsEnabled: true,
        autoShowQS: false,
        opposite: false,
        hmsMenuCfg: {
            H: [
                1,
                6
            ],
            m: [
                5,
                6
            ],
            s: [
                15,
                4
            ]
        },
        opposite: false,
        specialDates: null,
        specialDays: null,
        disabledDates: null,
        disabledDays: null,
        onpicking: null,
        onpicked: null,
        onclearing: null,
        oncleared: null,
        ychanging: null,
        ychanged: null,
        Mchanging: null,
        Mchanged: null,
        dchanging: null,
        dchanged: null,
        Hchanging: null,
        Hchanged: null,
        mchanging: null,
        mchanged: null,
        schanging: null,
        schanged: null,
        eCont: null,
        vel: null,
        elProp: '',
        errMsg: '',
        quickSel: [],
        has: {},
        getRealLang: function () {
            var _ = $.$langList;
            for (var A = 0; A < _.length; A++)
                if (_[A].name == this.lang)
                    return _[A];
            return _[0];
        }
    };
    WdatePicker = U;
    var Y = window, T = { innerHTML: '' }, N = 'document', H = 'documentElement', C = 'getElementsByTagName', V, A, S, G, c, X = navigator.appName;
    if (X == 'Microsoft Internet Explorer')
        S = true;
    else if (X == 'Opera')
        c = true;
    else
        G = true;
    A = $.$dpPath || J();
    V = Y;
    if ($.$crossFrame) {
        try {
            while (V.parent != V && V.parent[N][C]('frameset').length == 0)
                V = V.parent;
        } catch (O) {
        }
    }
    if (!V.$dp)
        V.$dp = {
            ff: G,
            ie: S,
            opera: c,
            status: 0,
            defMinDate: $.minDate,
            defMaxDate: $.maxDate
        };
    B();
    if ($.$preLoad && $dp.status == 0)
        E(Y, 'onload', function () {
            U(null, true);
        });
    if (!Y[N].docMD) {
        E(Y[N], 'onmousedown', D, true);
        Y[N].docMD = true;
    }
    if (!V[N].docMD) {
        E(V[N], 'onmousedown', D, true);
        V[N].docMD = true;
    }
    E(Y, 'onunload', function () {
        if ($dp.dd)
            P($dp.dd, 'none');
    });
    function B() {
        try {
            V[N], V.$dp = V.$dp || {};
        } catch ($) {
            V = Y;
            $dp = $dp || {};
        }
        var A = {
            win: Y,
            $: function ($) {
                return typeof $ == 'string' ? Y[N].getElementById($) : $;
            },
            $D: function ($, _) {
                return this.$DV(this.$($).value, _);
            },
            $DV: function (_, $) {
                if (_ != '') {
                    this.dt = $dp.cal.splitDate(_, $dp.cal.dateFmt);
                    if ($)
                        for (var B in $)
                            if (this.dt[B] === undefined)
                                this.errMsg = 'invalid property:' + B;
                            else {
                                this.dt[B] += $[B];
                                if (B == 'M') {
                                    var C = $['M'] > 0 ? 1 : 0, A = new Date(this.dt['y'], this.dt['M'], 0).getDate();
                                    this.dt['d'] = Math.min(A + C, this.dt['d']);
                                }
                            }
                    if (this.dt.refresh())
                        return this.dt;
                }
                return '';
            },
            show: function () {
                var A = V[N].getElementsByTagName('div'), $ = 100000;
                for (var B = 0; B < A.length; B++) {
                    var _ = parseInt(A[B].style.zIndex);
                    if (_ > $)
                        $ = _;
                }
                this.dd.style.zIndex = $ + 2;
                P(this.dd, 'block');
                P(this.dd.firstChild, '');
            },
            unbind: function ($) {
                $ = this.$($);
                if ($.initcfg) {
                    L($, 'onclick', function () {
                        U($.initcfg);
                    });
                    L($, 'onfocus', function () {
                        U($.initcfg);
                    });
                }
            },
            hide: function () {
                P(this.dd, 'none');
            },
            attachEvent: E
        };
        for (var _ in A)
            V.$dp[_] = A[_];
        $dp = V.$dp;
    }
    function E(B, _, A, $) {
        if (B.addEventListener) {
            var C = _.replace(/on/, '');
            A._ieEmuEventHandler = function ($) {
                return A($);
            };
            B.addEventListener(C, A._ieEmuEventHandler, $);
        } else
            B.attachEvent(_, A);
    }
    function L(A, $, _) {
        if (A.removeEventListener) {
            var B = $.replace(/on/, '');
            _._ieEmuEventHandler = function ($) {
                return _($);
            };
            A.removeEventListener(B, _._ieEmuEventHandler, false);
        } else
            A.detachEvent($, _);
    }
    function a(_, $, A) {
        if (typeof _ != typeof $)
            return false;
        if (typeof _ == 'object') {
            if (!A)
                for (var B in _) {
                    if (typeof $[B] == 'undefined')
                        return false;
                    if (!a(_[B], $[B], true))
                        return false;
                }
            return true;
        } else if (typeof _ == 'function' && typeof $ == 'function')
            return _.toString() == $.toString();
        else
            return _ == $;
    }
    function J() {
        var _, A, $ = Y[N][C]('script');
        for (var B = 0; B < $.length; B++) {
            _ = $[B].getAttribute('src') || '';
            _ = _.substr(0, _.toLowerCase().indexOf('wdatepicker.js'));
            A = _.lastIndexOf('/');
            if (A > 0)
                _ = _.substring(0, A + 1);
            if (_)
                break;
        }
        return _;
    }
    function K(A, $, B) {
        var D = Y[N][C]('HEAD').item(0), _ = Y[N].createElement('link');
        if (D) {
            _.href = A;
            _.rel = 'stylesheet';
            _.type = 'text/css';
            if ($)
                _.title = $;
            if (B)
                _.charset = B;
            D.appendChild(_);
        }
    }
    function F($) {
        $ = $ || V;
        var A = 0, _ = 0;
        while ($ != V) {
            var D = $.parent[N][C]('iframe');
            for (var F = 0; F < D.length; F++) {
                try {
                    if (D[F].contentWindow == $) {
                        var E = W(D[F]);
                        A += E.left;
                        _ += E.top;
                        break;
                    }
                } catch (B) {
                }
            }
            $ = $.parent;
        }
        return {
            'leftM': A,
            'topM': _
        };
    }
    function W(G, F) {
        if (G.getBoundingClientRect)
            return G.getBoundingClientRect();
        else {
            var A = {
                    ROOT_TAG: /^body|html$/i,
                    OP_SCROLL: /^(?:inline|table-row)$/i
                }, E = false, I = null, _ = G.offsetTop, H = G.offsetLeft, D = G.offsetWidth, B = G.offsetHeight, C = G.offsetParent;
            if (C != G)
                while (C) {
                    H += C.offsetLeft;
                    _ += C.offsetTop;
                    if (R(C, 'position').toLowerCase() == 'fixed')
                        E = true;
                    else if (C.tagName.toLowerCase() == 'body')
                        I = C.ownerDocument.defaultView;
                    C = C.offsetParent;
                }
            C = G.parentNode;
            while (C.tagName && !A.ROOT_TAG.test(C.tagName)) {
                if (C.scrollTop || C.scrollLeft)
                    if (!A.OP_SCROLL.test(P(C)))
                        if (!c || C.style.overflow !== 'visible') {
                            H -= C.scrollLeft;
                            _ -= C.scrollTop;
                        }
                C = C.parentNode;
            }
            if (!E) {
                var $ = b(I);
                H -= $.left;
                _ -= $.top;
            }
            D += H;
            B += _;
            return {
                'left': H,
                'top': _,
                'right': D,
                'bottom': B
            };
        }
    }
    function M($) {
        $ = $ || V;
        var B = $[N], A = $.innerWidth ? $.innerWidth : B[H] && B[H].clientWidth ? B[H].clientWidth : B.body.offsetWidth, _ = $.innerHeight ? $.innerHeight : B[H] && B[H].clientHeight ? B[H].clientHeight : B.body.offsetHeight;
        return {
            'width': A,
            'height': _
        };
    }
    function b($) {
        $ = $ || V;
        var B = $[N], A = B[H], _ = B.body;
        B = A && A.scrollTop != null && (A.scrollTop > _.scrollTop || A.scrollLeft > _.scrollLeft) ? A : _;
        return {
            'top': B.scrollTop,
            'left': B.scrollLeft
        };
    }
    function D($) {
        try {
            var _ = $ ? $.srcElement || $.target : null;
            if ($dp.cal && !$dp.eCont && $dp.dd && _ != $dp.el && $dp.dd.style.display == 'block')
                $dp.cal.close();
        } catch ($) {
        }
    }
    function Z() {
        $dp.status = 2;
    }
    var Q, _;
    function U(K, C) {
        if (!$dp)
            return;
        B();
        var L = {};
        for (var H in K)
            L[H] = K[H];
        for (H in $)
            if (H.substring(0, 1) != '$' && L[H] === undefined)
                L[H] = $[H];
        if (C) {
            if (!J()) {
                _ = _ || setInterval(function () {
                    if (V[N].readyState == 'complete')
                        clearInterval(_);
                    U(null, true);
                }, 50);
                return;
            }
            if ($dp.status == 0) {
                $dp.status = 1;
                L.el = T;
                I(L, true);
            } else
                return;
        } else if (L.eCont) {
            L.eCont = $dp.$(L.eCont);
            L.el = T;
            L.autoPickDate = true;
            L.qsEnabled = false;
            I(L);
        } else {
            if ($.$preLoad && $dp.status != 2)
                return;
            var F = D();
            if (Y.event === F || F) {
                L.srcEl = F.srcElement || F.target;
                F.cancelBubble = true;
            }
            L.el = L.el = $dp.$(L.el || L.srcEl);
            if (!L.el || L.el['My97Mark'] === true || L.el.disabled || $dp.dd && P($dp.dd) != 'none' && $dp.dd.style.left != '-970px') {
                try {
                    if (L.el['My97Mark'])
                        L.el['My97Mark'] = false;
                } catch (A) {
                }
                return;
            }
            if (F && L.el.nodeType == 1 && !a(L.el.initcfg, K)) {
                $dp.unbind(L.el);
                E(L.el, F.type == 'focus' ? 'onclick' : 'onfocus', function () {
                    U(K);
                });
                L.el.initcfg = K;
            }
            I(L);
        }
        function J() {
            if (S && V != Y && V[N].readyState != 'complete')
                return false;
            return true;
        }
        function D() {
            if (G) {
                func = D.caller;
                while (func != null) {
                    var $ = func.arguments[0];
                    if ($ && ($ + '').indexOf('Event') >= 0)
                        return $;
                    func = func.caller;
                }
                return null;
            }
            return event;
        }
    }
    function R(_, $) {
        return _.currentStyle ? _.currentStyle[$] : document.defaultView.getComputedStyle(_, false)[$];
    }
    function P(_, $) {
        if (_)
            if ($ != null)
                _.style.display = $;
            else
                return R(_, 'display');
    }
    function I(G, _) {
        var D = G.el ? G.el.nodeName : 'INPUT';
        if (_ || G.eCont || new RegExp(/input|textarea|div|span|p|a/gi).test(D))
            G.elProp = D == 'INPUT' ? 'value' : 'innerHTML';
        else
            return;
        if (G.lang == 'auto')
            G.lang = S ? navigator.browserLanguage.toLowerCase() : navigator.language.toLowerCase();
        if (!G.eCont)
            for (var C in G)
                $dp[C] = G[C];
        if (!$dp.dd || G.eCont || $dp.dd && (G.getRealLang().name != $dp.dd.lang || G.skin != $dp.dd.skin)) {
            if (G.eCont)
                E(G.eCont, G);
            else {
                $dp.dd = V[N].createElement('DIV');
                $dp.dd.style.cssText = 'position:absolute';
                V[N].body.appendChild($dp.dd);
                E($dp.dd, G);
                if (_)
                    $dp.dd.style.left = $dp.dd.style.top = '-970px';
                else {
                    $dp.show();
                    B($dp);
                }
            }
        } else if ($dp.cal) {
            $dp.show();
            $dp.cal.init();
            if (!$dp.eCont)
                B($dp);
        }
        function E(K, J) {
            var I = V[N].domain, F = false, G = '<iframe hideFocus=true width=9 height=7 frameborder=0 border=0 scrolling=no src="about:blank"></iframe>';
            K.innerHTML = G;
            var _ = $.$langList, D = $.$skinList, H;
            try {
                H = K.lastChild.contentWindow[N];
            } catch (E) {
                F = true;
                K.removeChild(K.lastChild);
                var L = V[N].createElement('iframe');
                L.hideFocus = true;
                L.frameBorder = 0;
                L.scrolling = 'no';
                L.src = 'javascript:(function(){var d=document;d.open();d.domain=\'' + I + '\';})()';
                K.appendChild(L);
                setTimeout(function () {
                    H = K.lastChild.contentWindow[N];
                    C();
                }, 97);
                return;
            }
            C();
            function C() {
                var _ = J.getRealLang();
                K.lang = _.name;
                K.skin = J.skin;
                var $ = [
                    '<head><script>',
                    '',
                    'var doc=document, $d, $dp, $cfg=doc.cfg, $pdp = parent.$dp, $dt, $tdt, $sdt, $lastInput, $IE=$pdp.ie, $FF = $pdp.ff,$OPERA=$pdp.opera, $ny, $cMark = false;',
                    'if($cfg.eCont){$dp = {};for(var p in $pdp)$dp[p]=$pdp[p];}else{$dp=$pdp;};for(var p in $cfg){$dp[p]=$cfg[p];}',
                    'doc.oncontextmenu=function(){try{$c._fillQS(!$dp.has.d,1);showB($d.qsDivSel);}catch(e){};return false;};',
                    '</script><script charset=',
                    _.charset,
                    '>',
                    'var $lang = {errAlertMsg: \'不合法的日期格式或者日期超出限定范围,需要撤销吗?\',aWeekStr: [\'周\',\'日\',\'一\',\'二\',\'三\',\'四\',\'五\',\'六\'],aLongWeekStr:[\'周\',\'星期日\',\'星期一\',\'星期二\',\'星期三\',\'星期四\',\'星期五\',\'星期六\'],aMonStr: [\'一月\',\'二月\',\'三月\',\'四月\',\'五月\',\'六月\',\'七月\',\'八月\',\'九月\',\'十月\',\'十一\',\'十二\'],aLongMonStr: [\'一月\',\'二月\',\'三月\',\'四月\',\'五月\',\'六月\',\'七月\',\'八月\',\'九月\',\'十月\',\'十一月\',\'十二月\'],clearStr: \'清空\',todayStr: \'今天\',okStr: \'确定\',updateStr: \'确定\',timeStr: \'时间\',quickStr: \'快速选择\',err_1: \'最小日期不能大于最大日期!\'}',
                    '</script>'
                ];
                if (F)
                    $[1] = 'document.domain="' + I + '";';
                $.push('<link rel="stylesheet" type="text/css" href="/Content/style/common/datepicker/datepicker.css" charset="utf-8"/>');
                $.push('<script>');
                $.push(decodeURIComponent('if(%24cfg.eCont)%7B%24dp%3D%7B%7D%3Bfor(var%20p%20in%20%24pdp)if(typeof%20%24pdp%5Bp%5D%3D%3D%22object%22)%7B%24dp%5Bp%5D%3D%7B%7D%3Bfor(var%20pp%20in%20%24pdp%5Bp%5D)%24dp%5Bp%5D%5Bpp%5D%3D%24pdp%5Bp%5D%5Bpp%5D%7Delse%20%24dp%5Bp%5D%3D%24pdp%5Bp%5D%7Delse%20%24dp%3D%24pdp%3Bfor(p%20in%20%24cfg)%24dp%5Bp%5D%3D%24cfg%5Bp%5D%3Bvar%20%24c%3Bif(%24FF)%7BEvent.prototype.__defineSetter__(%22returnValue%22%2Cfunction(%24)%7Bif(!%24)this.preventDefault()%3Breturn%20%24%7D)%3BEvent.prototype.__defineGetter__(%22srcElement%22%2Cfunction()%7Bvar%20%24%3Dthis.target%3Bwhile(%24.nodeType!%3D1)%24%3D%24.parentNode%3Breturn%20%24%7D)%7Dfunction%20My97DP()%7B%24c%3Dthis%3Bthis.QS%3D%5B%5D%3B%24d%3Ddocument.createElement(%22div%22)%3B%24d.className%3D%22WdateDiv%22%3B%24d.innerHTML%3D%22%3Cdiv%20id%3DdpTitle%3E%3Cdiv%20class%3D%5C%22navImg%20NavImgll%5C%22%3E%3Ca%3E%3C%2Fa%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%5C%22navImg%20NavImgl%5C%22%3E%3Ca%3E%3C%2Fa%3E%3C%2Fdiv%3E%3Cdiv%20style%3D%5C%22float%3Aleft%5C%22%3E%3Cdiv%20class%3D%5C%22menuSel%20MMenu%5C%22%3E%3C%2Fdiv%3E%3Cinput%20class%3Dyminput%3E%3C%2Fdiv%3E%3Cdiv%20style%3D%5C%22float%3Aleft%5C%22%3E%3Cdiv%20class%3D%5C%22menuSel%20YMenu%5C%22%3E%3C%2Fdiv%3E%3Cinput%20class%3Dyminput%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%5C%22navImg%20NavImgrr%5C%22%3E%3Ca%3E%3C%2Fa%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%5C%22navImg%20NavImgr%5C%22%3E%3Ca%3E%3C%2Fa%3E%3C%2Fdiv%3E%3Cdiv%20style%3D%5C%22float%3Aright%5C%22%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3Cdiv%20style%3D%5C%22position%3Aabsolute%3Boverflow%3Ahidden%5C%22%3E%3C%2Fdiv%3E%3Cdiv%3E%3C%2Fdiv%3E%3Cdiv%20id%3DdpTime%3E%3Cdiv%20class%3D%5C%22menuSel%20hhMenu%5C%22%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%5C%22menuSel%20mmMenu%5C%22%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%5C%22menuSel%20ssMenu%5C%22%3E%3C%2Fdiv%3E%3Ctable%20cellspacing%3D0%20cellpadding%3D0%20border%3D0%3E%3Ctr%3E%3Ctd%20rowspan%3D2%3E%3Cspan%20id%3DdpTimeStr%3E%3C%2Fspan%3E%26nbsp%3B%3Cinput%20class%3DtB%20maxlength%3D2%3E%3Cinput%20value%3D%5C%22%3A%5C%22%20class%3Dtm%20readonly%3E%3Cinput%20class%3DtE%20maxlength%3D2%3E%3Cinput%20value%3D%5C%22%3A%5C%22%20class%3Dtm%20readonly%3E%3Cinput%20class%3DtE%20maxlength%3D2%3E%3C%2Ftd%3E%3Ctd%3E%3Cbutton%20id%3DdpTimeUp%3E%3C%2Fbutton%3E%3C%2Ftd%3E%3C%2Ftr%3E%3Ctr%3E%3Ctd%3E%3Cbutton%20id%3DdpTimeDown%3E%3C%2Fbutton%3E%3C%2Ftd%3E%3C%2Ftr%3E%3C%2Ftable%3E%3C%2Fdiv%3E%3Cdiv%20id%3DdpQS%3E%3C%2Fdiv%3E%3Cdiv%20id%3DdpControl%3E%3Cinput%20class%3DdpButton%20id%3DdpClearInput%20type%3Dbutton%3E%3Cinput%20class%3DdpButton%20id%3DdpTodayInput%20type%3Dbutton%3E%3Cinput%20class%3DdpButton%20id%3DdpOkInput%20type%3Dbutton%3E%3C%2Fdiv%3E%22%3BattachTabEvent(%24d%2Cfunction()%7BhideSel()%7D)%3BA()%3Bthis.init()%3B%24dp.focusArr%3D%5Bdocument%2C%24d.MI%2C%24d.yI%2C%24d.HI%2C%24d.mI%2C%24d.sI%2C%24d.clearI%2C%24d.todayI%2C%24d.okI%5D%3Bfor(var%20B%3D0%3BB%3C%24dp.focusArr.length%3BB%2B%2B)%7Bvar%20_%3D%24dp.focusArr%5BB%5D%3B_.nextCtrl%3DB%3D%3D%24dp.focusArr.length-1%3F%24dp.focusArr%5B1%5D%3A%24dp.focusArr%5BB%2B1%5D%3B%24dp.attachEvent(_%2C%22onkeydown%22%2C_tab)%7D%24()%3B_inputBindEvent(%22y%2CM%2CH%2Cm%2Cs%22)%3B%24d.upButton.onclick%3Dfunction()%7BupdownEvent(1)%7D%3B%24d.downButton.onclick%3Dfunction()%7BupdownEvent(-1)%7D%3B%24d.qsDiv.onclick%3Dfunction()%7Bif(%24d.qsDivSel.style.display!%3D%22block%22)%7B%24c._fillQS()%3BshowB(%24d.qsDivSel)%7Delse%20hide(%24d.qsDivSel)%7D%3Bdocument.body.appendChild(%24d)%3Bfunction%20A()%7Bvar%20_%3D%24(%22a%22)%3Bdivs%3D%24(%22div%22)%2Cipts%3D%24(%22input%22)%2Cbtns%3D%24(%22button%22)%2Cspans%3D%24(%22span%22)%3B%24d.navLeftImg%3D_%5B0%5D%3B%24d.leftImg%3D_%5B1%5D%3B%24d.rightImg%3D_%5B3%5D%3B%24d.navRightImg%3D_%5B2%5D%3B%24d.rMD%3Ddivs%5B9%5D%3B%24d.MI%3Dipts%5B0%5D%3B%24d.yI%3Dipts%5B1%5D%3B%24d.titleDiv%3Ddivs%5B0%5D%3B%24d.MD%3Ddivs%5B4%5D%3B%24d.yD%3Ddivs%5B6%5D%3B%24d.qsDivSel%3Ddivs%5B10%5D%3B%24d.dDiv%3Ddivs%5B11%5D%3B%24d.tDiv%3Ddivs%5B12%5D%3B%24d.HD%3Ddivs%5B13%5D%3B%24d.mD%3Ddivs%5B14%5D%3B%24d.sD%3Ddivs%5B15%5D%3B%24d.qsDiv%3Ddivs%5B16%5D%3B%24d.bDiv%3Ddivs%5B17%5D%3B%24d.HI%3Dipts%5B2%5D%3B%24d.mI%3Dipts%5B4%5D%3B%24d.sI%3Dipts%5B6%5D%3B%24d.clearI%3Dipts%5B7%5D%3B%24d.todayI%3Dipts%5B8%5D%3B%24d.okI%3Dipts%5B9%5D%3B%24d.upButton%3Dbtns%5B0%5D%3B%24d.downButton%3Dbtns%5B1%5D%3B%24d.timeSpan%3Dspans%5B0%5D%3Bfunction%20%24(%24)%7Breturn%20%24d.getElementsByTagName(%24)%7D%7Dfunction%20%24()%7B%24d.navLeftImg.onclick%3Dfunction()%7B%24ny%3D%24ny%3C%3D0%3F%24ny-1%3A-1%3Bif(%24ny%255%3D%3D0)%7B%24d.yI.focus()%3Breturn%7D%24d.yI.value%3D%24dt.y-1%3B%24d.yI.onblur()%7D%3B%24d.leftImg.onclick%3Dfunction()%7B%24dt.attr(%22M%22%2C-1)%3B%24d.MI.onblur()%7D%3B%24d.rightImg.onclick%3Dfunction()%7B%24dt.attr(%22M%22%2C1)%3B%24d.MI.onblur()%7D%3B%24d.navRightImg.onclick%3Dfunction()%7B%24ny%3D%24ny%3E%3D0%3F%24ny%2B1%3A1%3Bif(%24ny%255%3D%3D0)%7B%24d.yI.focus()%3Breturn%7D%24d.yI.value%3D%24dt.y%2B1%3B%24d.yI.onblur()%7D%7D%7DMy97DP.prototype%3D%7Binit%3Afunction()%7B%24ny%3D0%3B%24dp.cal%3Dthis%3Bif(%24dp.readOnly%26%26%24dp.el.readOnly!%3Dnull)%7B%24dp.el.readOnly%3Dtrue%3B%24dp.el.blur()%7Dthis._dealFmt()%3B%24dt%3Dthis.newdate%3Dnew%20DPDate()%3B%24tdt%3Dnew%20DPDate()%3B%24sdt%3Dthis.date%3Dnew%20DPDate()%3B%24dp.valueEdited%3D0%3Bthis.dateFmt%3Dthis.doExp(%24dp.dateFmt)%3Bthis.autoPickDate%3D%24dp.autoPickDate%3D%3Dnull%3F(%24dp.has.st%26%26%24dp.has.st%3Ffalse%3Atrue)%3A%24dp.autoPickDate%3B%24dp.autoUpdateOnChanged%3D%24dp.autoUpdateOnChanged%3D%3Dnull%3F(%24dp.isShowOK%26%26%24dp.has.d%3Ffalse%3Atrue)%3A%24dp.autoUpdateOnChanged%3Bthis.ddateRe%3Dthis._initRe(%22disabledDates%22)%3Bthis.ddayRe%3Dthis._initRe(%22disabledDays%22)%3Bthis.sdateRe%3Dthis._initRe(%22specialDates%22)%3Bthis.sdayRe%3Dthis._initRe(%22specialDays%22)%3Bthis.minDate%3Dthis.doCustomDate(%24dp.minDate%2C%24dp.minDate!%3D%24dp.defMinDate%3F%24dp.realFmt%3A%24dp.realFullFmt%2C%24dp.defMinDate)%3Bthis.maxDate%3Dthis.doCustomDate(%24dp.maxDate%2C%24dp.maxDate!%3D%24dp.defMaxDate%3F%24dp.realFmt%3A%24dp.realFullFmt%2C%24dp.defMaxDate)%3Bif(this.minDate.compareWith(this.maxDate)%3E0)%24dp.errMsg%3D%24lang.err_1%3Bif(this.loadDate())%7Bthis._makeDateInRange()%3Bthis.oldValue%3D%24dp.el%5B%24dp.elProp%5D%7Delse%20this.mark(false%2C2)%3B_setAll(%24dt)%3B%24d.timeSpan.innerHTML%3D%24lang.timeStr%3B%24d.clearI.value%3D%24lang.clearStr%3B%24d.todayI.value%3D%24lang.todayStr%3B%24d.okI.value%3D%24lang.okStr%3B%24d.okI.disabled%3D!%24c.checkValid(%24sdt)%3Bthis.initShowAndHide()%3Bthis.initBtn()%3Bif(%24dp.errMsg)alert(%24dp.errMsg)%3Bthis.draw()%3Bif(%24dp.el.nodeType%3D%3D1%26%26%24dp.el%5B%22My97Mark%22%5D%3D%3D%3Dundefined)%7B%24dp.attachEvent(%24dp.el%2C%22onkeydown%22%2C_tab)%3B%24dp.attachEvent(%24dp.el%2C%22onblur%22%2Cfunction()%7Bif(%24dp%26%26%24dp.dd.style.display%3D%3D%22none%22)%7B%24c.close()%3Bif(!%24dp.valueEdited%26%26%24dp.cal.oldValue!%3D%24dp.el%5B%24dp.elProp%5D%26%26%24dp.el.onchange)fireEvent(%24dp.el%2C%22change%22)%7D%7D)%3B%24dp.el%5B%22My97Mark%22%5D%3Dfalse%7D%24c.currFocus%3D%24dp.el%3BhideSel()%7D%2C_makeDateInRange%3Afunction()%7Bvar%20_%3Dthis.checkRange()%3Bif(_!%3D0)%7Bvar%20%24%3Bif(_%3E0)%24%3Dthis.maxDate%3Belse%20%24%3Dthis.minDate%3Bif(%24dp.has.sd)%7B%24dt.y%3D%24.y%3B%24dt.M%3D%24.M%3B%24dt.d%3D%24.d%7Dif(%24dp.has.st)%7B%24dt.H%3D%24.H%3B%24dt.m%3D%24.m%3B%24dt.s%3D%24.s%7D%7D%7D%2CsplitDate%3Afunction(K%2CC%2CR%2CF%2CB%2CH%2CG%2CL%2CM)%7Bvar%20%24%3Bif(K%26%26K.loadDate)%24%3DK%3Belse%7B%24%3Dnew%20DPDate()%3Bif(K!%3D%22%22)%7BC%3DC%7C%7C%24dp.dateFmt%3Bvar%20I%2CD%2CQ%3D0%2CP%2CA%3D%2Fyyyy%7Cyyy%7Cyy%7Cy%7CMMMM%7CMMM%7CMM%7CM%7Cdd%7Cd%7C%25ld%7CHH%7CH%7Cmm%7Cm%7Css%7Cs%7CDD%7CD%7CWW%7CW%7Cw%2Fg%2C_%3DC.match(A)%3BA.lastIndex%3D0%3Bif(M)P%3DK.split(%2F%5CW%2B%2F)%3Belse%7Bvar%20E%3D0%2CN%3D%22%5E%22%3Bwhile((P%3DA.exec(C))!%3D%3Dnull)%7Bif(E%3E%3D0)%7BD%3DC.substring(E%2CP.index)%3Bif(D%26%26%22-%2F%5C%5C%22.indexOf(D)%3E%3D0)D%3D%22%5B%5C%5C-%2F%5D%22%3BN%2B%3DD%7DE%3DA.lastIndex%3Bswitch(P%5B0%5D)%7Bcase%22yyyy%22%3AN%2B%3D%22(%5C%5Cd%7B4%7D)%22%3Bbreak%3Bcase%22yyy%22%3AN%2B%3D%22(%5C%5Cd%7B3%7D)%22%3Bbreak%3Bcase%22MMMM%22%3Acase%22MMM%22%3Acase%22DD%22%3Acase%22D%22%3AN%2B%3D%22(%5C%5CD%2B)%22%3Bbreak%3Bdefault%3AN%2B%3D%22(%5C%5Cd%5C%5Cd%3F)%22%3Bbreak%7D%7DN%2B%3D%22.*%24%22%3BP%3Dnew%20RegExp(N).exec(K)%3BQ%3D1%7Dif(P)%7Bfor(I%3D0%3BI%3C_.length%3BI%2B%2B)%7Bvar%20J%3DP%5BI%2BQ%5D%3Bif(J)switch(_%5BI%5D)%7Bcase%22MMMM%22%3Acase%22MMM%22%3A%24.M%3DO(_%5BI%5D%2CJ)%3Bbreak%3Bcase%22y%22%3Acase%22yy%22%3AJ%3DpInt2(J%2C0)%3Bif(J%3C50)J%2B%3D2000%3Belse%20J%2B%3D1900%3B%24.y%3DJ%3Bbreak%3Bcase%22yyy%22%3A%24.y%3DpInt2(J%2C0)%2B%24dp.yearOffset%3Bbreak%3Bdefault%3A%24%5B_%5BI%5D.slice(-1)%5D%3DJ%3Bbreak%7D%7D%7Delse%20%24.d%3D32%7D%7D%24.coverDate(R%2CF%2CB%2CH%2CG%2CL)%3Breturn%20%24%3Bfunction%20O(A%2C%24)%7Bvar%20_%3DA%3D%3D%22MMMM%22%3F%24lang.aLongMonStr%3A%24lang.aMonStr%3Bfor(var%20B%3D0%3BB%3C12%3BB%2B%2B)if(_%5BB%5D.toLowerCase()%3D%3D%24.substr(0%2C_%5BB%5D.length).toLowerCase())return%20B%2B1%3Breturn-1%7D%7D%2C_initRe%3Afunction(_)%7Bvar%20B%2C%24%3D%24dp%5B_%5D%2CA%3D%22%22%3Bif(%24%26%26%24.length%3E0)%7Bfor(B%3D0%3BB%3C%24.length%3BB%2B%2B)%7BA%2B%3Dthis.doExp(%24%5BB%5D)%3Bif(B!%3D%24.length-1)A%2B%3D%22%7C%22%7DA%3DA%3Fnew%20RegExp(%22(%3F%3A%22%2BA%2B%22)%22)%3Anull%7Delse%20A%3Dnull%3Breturn%20A%7D%2Cupdate%3Afunction(%24)%7Bif(%24%3D%3D%3Dundefined)%24%3Dthis.getNewDateStr()%3Bif(%24dp.el%5B%24dp.elProp%5D!%3D%24)%24dp.el%5B%24dp.elProp%5D%3D%24%3Bthis.setRealValue()%7D%2CsetRealValue%3Afunction(%24)%7Bvar%20_%3D%24dp.%24(%24dp.vel)%2C%24%3Drtn(%24%2Cthis.getNewDateStr(%24dp.realFmt))%3Bif(_)_.value%3D%24%3B%24dp.el%5B%22realValue%22%5D%3D%24%7D%2CdoExp%3Afunction(s)%7Bvar%20ps%3D%22yMdHms%22%2Carr%2CtmpEval%2Cre%3D%2F%23%3F%5C%7B(.*%3F)%5C%7D%2F%3Bs%3Ds%2B%22%22%3Bfor(var%20i%3D0%3Bi%3Cps.length%3Bi%2B%2B)s%3Ds.replace(%22%25%22%2Bps.charAt(i)%2Cthis.getP(ps.charAt(i)%2Cnull%2C%24tdt))%3Bif(s.substring(0%2C3)%3D%3D%22%23F%7B%22)%7Bs%3Ds.substring(3%2Cs.length-1)%3Bif(s.indexOf(%22return%20%22)%3C0)s%3D%22return%20%22%2Bs%3Bs%3D%24dp.win.eval(%22new%20Function(%5C%22%22%2Bs%2B%22%5C%22)%3B%22)%3Bs%3Ds()%7Dwhile((arr%3Dre.exec(s))!%3Dnull)%7Barr.lastIndex%3Darr.index%2Barr%5B1%5D.length%2Barr%5B0%5D.length-arr%5B1%5D.length-1%3BtmpEval%3DpInt(eval(arr%5B1%5D))%3Bif(tmpEval%3C0)tmpEval%3D%229700%22%2B(-tmpEval)%3Bs%3Ds.substring(0%2Carr.index)%2BtmpEval%2Bs.substring(arr.lastIndex%2B1)%7Dreturn%20s%7D%2CdoCustomDate%3Afunction(A%2CB%2C_)%7Bvar%20%24%3BA%3Dthis.doExp(A)%3Bif(!A%7C%7CA%3D%3D%22%22)A%3D_%3Bif(typeof%20A%3D%3D%22object%22)%24%3DA%3Belse%7B%24%3Dthis.splitDate(A%2CB%2Cnull%2Cnull%2C1%2C0%2C0%2C0%2Ctrue)%3B%24.y%3D(%22%22%2B%24.y).replace(%2F%5E9700%2F%2C%22-%22)%3B%24.M%3D(%22%22%2B%24.M).replace(%2F%5E9700%2F%2C%22-%22)%3B%24.d%3D(%22%22%2B%24.d).replace(%2F%5E9700%2F%2C%22-%22)%3B%24.H%3D(%22%22%2B%24.H).replace(%2F%5E9700%2F%2C%22-%22)%3B%24.m%3D(%22%22%2B%24.m).replace(%2F%5E9700%2F%2C%22-%22)%3B%24.s%3D(%22%22%2B%24.s).replace(%2F%5E9700%2F%2C%22-%22)%3Bif(A.indexOf(%22%25ld%22)%3E%3D0)%7BA%3DA.replace(%2F%25ld%2Fg%2C%220%22)%3B%24.d%3D0%3B%24.M%3DpInt(%24.M)%2B1%7D%24.refresh()%7Dreturn%20%24%7D%2CloadDate%3Afunction()%7Bvar%20A%3D%24dp.el%5B%24dp.elProp%5D%2C%24%3Dthis.dateFmt%2C_%3D%24dp.has%3Bif(%24dp.alwaysUseStartDate%7C%7C(%24dp.startDate!%3D%22%22%26%26A%3D%3D%22%22))%7BA%3Dthis.doExp(%24dp.startDate)%3B%24%3D%24dp.realFmt%7D%24dt.loadFromDate(this.splitDate(A%2C%24))%3Bif(A!%3D%22%22)%7Bvar%20B%3D1%3Bif(_.sd%26%26!this.isDate(%24dt))%7B%24dt.y%3D%24tdt.y%3B%24dt.M%3D%24tdt.M%3B%24dt.d%3D%24tdt.d%3BB%3D0%7Dif(_.st%26%26!this.isTime(%24dt))%7B%24dt.H%3D%24tdt.H%3B%24dt.m%3D%24tdt.m%3B%24dt.s%3D%24tdt.s%3BB%3D0%7Dreturn%20B%26%26this.checkValid(%24dt)%7Dif(!_.H)%24dt.H%3D0%3Bif(!_.m)%24dt.m%3D0%3Bif(!_.s)%24dt.s%3D0%3Breturn%201%7D%2CisDate%3Afunction(%24)%7Bif(%24.y!%3Dnull)%24%3DdoStr(%24.y%2C4)%2B%22-%22%2B%24.M%2B%22-%22%2B%24.d%3Breturn%20%24.match(%2F%5E((%5Cd%7B2%7D((%5B02468%5D%5B048%5D)%7C(%5B13579%5D%5B26%5D))%5B%5C-%5C%2F%5Cs%5D%3F((((0%3F%5B13578%5D)%7C(1%5B02%5D))%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(%5B1-2%5D%5B0-9%5D)%7C(3%5B01%5D)))%7C(((0%3F%5B469%5D)%7C(11))%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(%5B1-2%5D%5B0-9%5D)%7C(30)))%7C(0%3F2%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(%5B1-2%5D%5B0-9%5D)))))%7C(%5Cd%7B2%7D((%5B02468%5D%5B1235679%5D)%7C(%5B13579%5D%5B01345789%5D))%5B%5C-%5C%2F%5Cs%5D%3F((((0%3F%5B13578%5D)%7C(1%5B02%5D))%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(%5B1-2%5D%5B0-9%5D)%7C(3%5B01%5D)))%7C(((0%3F%5B469%5D)%7C(11))%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(%5B1-2%5D%5B0-9%5D)%7C(30)))%7C(0%3F2%5B%5C-%5C%2F%5Cs%5D%3F((0%3F%5B1-9%5D)%7C(1%5B0-9%5D)%7C(2%5B0-8%5D))))))(%5Cs(((0%3F%5B0-9%5D)%7C(%5B1-2%5D%5B0-3%5D))%5C%3A(%5B0-5%5D%3F%5B0-9%5D)((%5Cs)%7C(%5C%3A(%5B0-5%5D%3F%5B0-9%5D)))))%3F%24%2F)%7D%2CisTime%3Afunction(%24)%7Bif(%24.H!%3Dnull)%24%3D%24.H%2B%22%3A%22%2B%24.m%2B%22%3A%22%2B%24.s%3Breturn%20%24.match(%2F%5E(%5B0-9%5D%7C(%5B0-1%5D%5B0-9%5D)%7C(%5B2%5D%5B0-3%5D))%3A(%5B0-9%5D%7C(%5B0-5%5D%5B0-9%5D))%3A(%5B0-9%5D%7C(%5B0-5%5D%5B0-9%5D))%24%2F)%7D%2CcheckRange%3Afunction(%24%2CA)%7B%24%3D%24%7C%7C%24dt%3Bvar%20_%3D%24.compareWith(this.minDate%2CA)%3Bif(_%3E0)%7B_%3D%24.compareWith(this.maxDate%2CA)%3Bif(_%3C0)_%3D0%7Dreturn%20_%7D%2CcheckValid%3Afunction(%24%2CA%2CB)%7BA%3DA%7C%7C%24dp.has.minUnit%3Bvar%20_%3Dthis.checkRange(%24%2CA)%3Bif(_%3D%3D0)%7B_%3D1%3Bif(A%3D%3D%22d%22%26%26B%3D%3Dnull)B%3DMath.abs((new%20Date(%24.y%2C%24.M-1%2C%24.d).getDay()-%24dp.firstDayOfWeek%2B7)%257)%3B_%3D!this.testDisDay(B)%26%26!this.testDisDate(%24%2CA)%7Delse%20_%3D0%3Breturn%20_%7D%2CcheckAndUpdate%3Afunction()%7Bvar%20_%3D%24dp.el%2CA%3Dthis%2C%24%3D%24dp.el%5B%24dp.elProp%5D%3Bif(%24dp.errDealMode%3E%3D0%26%26%24dp.errDealMode%3C%3D2%26%26%24!%3Dnull)%7Bif(%24!%3D%22%22)A.date.loadFromDate(A.splitDate(%24%2C%24dp.dateFmt))%3Bif(%24%3D%3D%22%22%7C%7C(A.isDate(A.date)%26%26A.isTime(A.date)%26%26A.checkValid(A.date)))%7Bif(%24!%3D%22%22)%7BA.newdate.loadFromDate(A.date)%3BA.update()%7Delse%20A.setRealValue(%22%22)%7Delse%20return%20false%7Dreturn%20true%7D%2Cclose%3Afunction(%24)%7BhideSel()%3Bif(this.checkAndUpdate())%7Bthis.mark(true)%3B%24dp.hide()%7Delse%7Bif(%24)%7B_cancelKey(%24)%3Bthis.mark(false%2C2)%7Delse%20this.mark(false)%3B%24dp.show()%7D%7D%2C_fd%3Afunction()%7Bvar%20E%2CC%2CD%2CK%2CA%2CH%3Dnew%20sb()%2CF%3D%24lang.aWeekStr%2CG%3D%24dp.firstDayOfWeek%2CI%3D%22%22%2C%24%3D%22%22%2C_%3Dnew%20DPDate(%24dt.y%2C%24dt.M%2C%24dt.d%2C2%2C0%2C0)%2CJ%3D_.y%2CB%3D_.M%3BA%3D1-new%20Date(J%2CB-1%2C1).getDay()%2BG%3Bif(A%3E1)A-%3D7%3BH.a(%22%3Ctable%20class%3DWdayTable%20width%3D100%25%20border%3D0%20cellspacing%3D0%20cellpadding%3D0%3E%22)%3BH.a(%22%3Ctr%20class%3DMTitle%20align%3Dcenter%3E%22)%3Bif(%24dp.isShowWeek)H.a(%22%3Ctd%3E%22%2BF%5B0%5D%2B%22%3C%2Ftd%3E%22)%3Bfor(E%3D0%3BE%3C7%3BE%2B%2B)H.a(%22%3Ctd%3E%22%2BF%5B(G%2BE)%257%2B1%5D%2B%22%3C%2Ftd%3E%22)%3BH.a(%22%3C%2Ftr%3E%22)%3Bfor(E%3D1%2CC%3DA%3BE%3C7%3BE%2B%2B)%7BH.a(%22%3Ctr%3E%22)%3Bfor(D%3D0%3BD%3C7%3BD%2B%2B)%7B_.loadDate(J%2CB%2CC%2B%2B)%3B_.refresh()%3Bif(_.M%3D%3DB)%7BK%3Dtrue%3Bif(_.compareWith(%24sdt%2C%22d%22)%3D%3D0)I%3D%22Wselday%22%3Belse%20if(_.compareWith(%24tdt%2C%22d%22)%3D%3D0)I%3D%22Wtoday%22%3Belse%20I%3D(%24dp.highLineWeekDay%26%26(0%3D%3D(G%2BD)%257%7C%7C6%3D%3D(G%2BD)%257)%3F%22Wwday%22%3A%22Wday%22)%3B%24%3D(%24dp.highLineWeekDay%26%26(0%3D%3D(G%2BD)%257%7C%7C6%3D%3D(G%2BD)%257)%3F%22WwdayOn%22%3A%22WdayOn%22)%7Delse%20if(%24dp.isShowOthers)%7BK%3Dtrue%3BI%3D%22WotherDay%22%3B%24%3D%22WotherDayOn%22%7Delse%20K%3Dfalse%3Bif(%24dp.isShowWeek%26%26D%3D%3D0%26%26(E%3C4%7C%7CK))H.a(%22%3Ctd%20class%3DWweek%3E%22%2BgetWeek(_%2C%24dp.firstDayOfWeek%3D%3D0%3F1%3A0)%2B%22%3C%2Ftd%3E%22)%3BH.a(%22%3Ctd%20%22)%3Bif(K)%7Bif(this.checkValid(_%2C%22d%22%2CD))%7Bif(this.testSpeDay(Math.abs((new%20Date(_.y%2C_.M-1%2C_.d).getDay()-%24dp.firstDayOfWeek%2B7)%257))%7C%7Cthis.testSpeDate(_))I%3D%22WspecialDay%22%3BH.a(%22onclick%3D%5C%22day_Click(%22%2B_.y%2B%22%2C%22%2B_.M%2B%22%2C%22%2B_.d%2B%22)%3B%5C%22%20%22)%3BH.a(%22onmouseover%3D%5C%22this.className%3D\'%22%2B%24%2B%22\'%5C%22%20%22)%3BH.a(%22onmouseout%3D%5C%22this.className%3D\'%22%2BI%2B%22\'%5C%22%20%22)%7Delse%20I%3D%22WinvalidDay%22%3BH.a(%22class%3D%22%2BI)%3BH.a(%22%3E%22%2B_.d%2B%22%3C%2Ftd%3E%22)%7Delse%20H.a(%22%3E%3C%2Ftd%3E%22)%7DH.a(%22%3C%2Ftr%3E%22)%7DH.a(%22%3C%2Ftable%3E%22)%3Breturn%20H.j()%7D%2CtestDisDate%3Afunction(_%2CA)%7Bvar%20%24%3Dthis.testDate(_%2Cthis.ddateRe%2CA)%3Breturn(this.ddateRe%26%26%24dp.opposite)%3F!%24%3A%24%7D%2CtestDisDay%3Afunction(%24)%7Breturn%20this.testDay(%24%2Cthis.ddayRe)%7D%2CtestSpeDate%3Afunction(%24)%7Breturn%20this.testDate(%24%2Cthis.sdateRe)%7D%2CtestSpeDay%3Afunction(%24)%7Breturn%20this.testDay(%24%2Cthis.sdayRe)%7D%2CtestDate%3Afunction(%24%2CC%2CA)%7Bvar%20_%3DA%3D%3D%22d%22%3F%24dp.realDateFmt%3A%24dp.realFmt%3Bif(A%3D%3D%22d%22%26%26%24dp.has.d%26%26%24dp.opposite)%7BC%3D(C%2B%22%22).replace(%2F%5E%5C%2F%5C(%5C%3F%3A(.*)%5C)%5C%2F.*%2F%2C%22%241%22)%3Bvar%20B%3DC.indexOf(%24dp.dateSplitStr)%3Bif(B%3E%3D0)C%3DC.substr(0%2CB)%3BC%3Dnew%20RegExp(C)%7Dreturn%20C%3FC.test(this.getDateStr(_%2C%24))%3A0%7D%2CtestDay%3Afunction(_%2C%24)%7Breturn%20%24%3F%24.test(_)%3A0%7D%2C_f%3Afunction(p%2Cmax%2Cc%2Cr%2Ce%2CisR)%7Bvar%20s%3Dnew%20sb()%2Cfp%3DisR%3F%22r%22%2Bp%3Ap%3Bif(isR)%24dt.attr(%22M%22%2C1)%3Bbak%3D%24dt%5Bp%5D%3Bs.a(%22%3Ctable%20cellspacing%3D0%20cellpadding%3D3%20border%3D0%22)%3Bfor(var%20i%3D0%3Bi%3Cr%3Bi%2B%2B)%7Bs.a(%22%3Ctr%20nowrap%3D%5C%22nowrap%5C%22%3E%22)%3Bfor(var%20j%3D0%3Bj%3Cc%3Bj%2B%2B)%7Bs.a(%22%3Ctd%20nowrap%20%22)%3B%24dt%5Bp%5D%3Deval(e)%3Bif(%24dt%5Bp%5D%3Emax)s.a(%22class%3D\'menu\'%22)%3Belse%20if(this.checkValid(%24dt%2Cp)%7C%7C(%24dp.opposite%26%26%22Hms%22.indexOf(p)%3D%3D-1%26%26this.checkRange(%24dt%2Cp)%3D%3D0))%7Bs.a(%22class%3D\'menu\'%20onmouseover%3D%5C%22this.className%3D\'menuOn\'%5C%22%20onmouseout%3D%5C%22this.className%3D\'menu\'%5C%22%20onmousedown%3D%5C%22%22)%3Bs.a(%22hide(%24d.%22%2Bp%2B%22D)%3B%24d.%22%2Bfp%2B%22I.value%3D%22%2B%24dt%5Bp%5D%2B%22%3B%24d.%22%2Bfp%2B%22I.blur()%3B%5C%22%22)%7Delse%20s.a(%22class%3D\'invalidMenu\'%22)%3Bs.a(%22%3E%22)%3Bif(%24dt%5Bp%5D%3C%3Dmax)s.a(p%3D%3D%22M%22%3F%24lang.aMonStr%5B%24dt%5Bp%5D-1%5D%3A%24dt%5Bp%5D)%3Bs.a(%22%3C%2Ftd%3E%22)%7Ds.a(%22%3C%2Ftr%3E%22)%7Ds.a(%22%3C%2Ftable%3E%22)%3B%24dt%5Bp%5D%3Dbak%3Bif(isR)%24dt.attr(%22M%22%2C-1)%3Breturn%20s.j()%7D%2C_fMyPos%3Afunction(%24%2C_)%7Bif(%24)%7Bvar%20A%3D%24.offsetLeft%3Bif(%24IE)A%3D%24.getBoundingClientRect().left%3B_.style.left%3DA%7D%7D%2C_fM%3Afunction(%24)%7Bthis._fMyPos(%24%2C%24d.MD)%3B%24d.MD.innerHTML%3Dthis._f(%22M%22%2C12%2C2%2C6%2C%22i%2Bj*6%2B1%22%2C%24%3D%3D%24d.rMI)%7D%2C_fy%3Afunction(_%2CB%2CA)%7Bvar%20%24%3Dnew%20sb()%3BA%3DA%7C%7C_%3D%3D%24d.ryI%3BB%3Drtn(B%2C%24dt.y-5)%3B%24.a(this._f(%22y%22%2C9999%2C2%2C5%2CB%2B%22%2Bi%2Bj*5%22%2CA))%3B%24.a(%22%3Ctable%20cellspacing%3D0%20cellpadding%3D3%20border%3D0%20align%3Dcenter%3E%3Ctr%3E%3Ctd%20%22)%3B%24.a(this.minDate.y%3CB%3F%22class%3D\'menu\'%20onmouseover%3D%5C%22this.className%3D\'menuOn\'%5C%22%20onmouseout%3D%5C%22this.className%3D\'menu\'%5C%22%20onmousedown%3D\'if(event.preventDefault)event.preventDefault()%3Bevent.cancelBubble%3Dtrue%3B%24c._fy(0%2C%22%2B(B-10)%2B%22%2C%22%2BA%2B%22)\'%22%3A%22class%3D\'invalidMenu\'%22)%3B%24.a(%22%3E%5Cu2190%3C%2Ftd%3E%3Ctd%20class%3D\'menu\'%20onmouseover%3D%5C%22this.className%3D\'menuOn\'%5C%22%20onmouseout%3D%5C%22this.className%3D\'menu\'%5C%22%20onmousedown%3D%5C%22hide(%24d.yD)%3B%24d.yI.blur()%3B%5C%22%3E%5Cxd7%3C%2Ftd%3E%3Ctd%20%22)%3B%24.a(this.maxDate.y%3E%3DB%2B10%3F%22class%3D\'menu\'%20onmouseover%3D%5C%22this.className%3D\'menuOn\'%5C%22%20onmouseout%3D%5C%22this.className%3D\'menu\'%5C%22%20onmousedown%3D\'if(event.preventDefault)event.preventDefault()%3Bevent.cancelBubble%3Dtrue%3B%24c._fy(0%2C%22%2B(B%2B10)%2B%22%2C%22%2BA%2B%22)\'%22%3A%22class%3D\'invalidMenu\'%22)%3B%24.a(%22%3E%5Cu2192%3C%2Ftd%3E%3C%2Ftr%3E%3C%2Ftable%3E%22)%3Bthis._fMyPos(_%2C%24d.yD)%3B%24d.yD.innerHTML%3D%24.j()%7D%2C_fHMS%3Afunction(A%2C%24)%7Bvar%20B%3D%24dp.hmsMenuCfg%5BA%5D%2CC%3DB%5B0%5D%2C_%3DB%5B1%5D%3B%24d%5BA%2B%22D%22%5D.innerHTML%3Dthis._f(A%2C%24-1%2C_%2CMath.ceil(%24%2FC%2F_)%2C%22i*%22%2B_%2B%22*%22%2BC%2B%22%2Bj*%22%2BC)%7D%2C_fH%3Afunction()%7Bthis._fHMS(%22H%22%2C24)%7D%2C_fm%3Afunction()%7Bthis._fHMS(%22m%22%2C60)%7D%2C_fs%3Afunction()%7Bthis._fHMS(%22s%22%2C60)%7D%2C_fillQS%3Afunction(C%2CA)%7Bthis.initQS()%3Bvar%20%24%3DA%3F%5B%22%3Ea%2F%3Crekci%22%2C%22PetaD%2079y%22%2C%22M%3Eknalb_%3Dtegrat%20%5C%22eulb%3Aroloc%5C%22%3Delyts%20%5C%22ten.79ym.w%22%2C%22ww%2F%2F%3Aptth%5C%22%3Dferh%20a%3C%22%5D.join(%22%22).split(%22%22).reverse().join(%22%22)%3A%24lang.quickStr%2CB%3Dthis.QS%2CE%3DB.style%2C_%3Dnew%20sb()%3B_.a(%22%3Ctable%20class%3DWdayTable%20width%3D100%25%20height%3D100%25%20border%3D0%20cellspacing%3D0%20cellpadding%3D0%3E%22)%3B_.a(%22%3Ctr%20class%3DMTitle%3E%3Ctd%3E%3Cdiv%20style%3D%5C%22float%3Aleft%5C%22%3E%22%2B%24%2B%22%3C%2Fdiv%3E%22)%3Bif(!C)_.a(%22%3Cdiv%20style%3D%5C%22float%3Aright%3Bcursor%3Apointer%5C%22%20onclick%3D%5C%22hide(%24d.qsDivSel)%3B%5C%22%3EX%26nbsp%3B%3C%2Fdiv%3E%22)%3B_.a(%22%3C%2Ftd%3E%3C%2Ftr%3E%22)%3Bfor(var%20D%3D0%3BD%3CB.length%3BD%2B%2B)if(B%5BD%5D)%7B_.a(%22%3Ctr%3E%3Ctd%20style%3D\'text-align%3Aleft\'%20nowrap%3D\'nowrap\'%20class%3D\'menu\'%20onmouseover%3D%5C%22this.className%3D\'menuOn\'%5C%22%20onmouseout%3D%5C%22this.className%3D\'menu\'%5C%22%20onclick%3D%5C%22%22)%3B_.a(%22day_Click(%22%2BB%5BD%5D.y%2B%22%2C%20%22%2BB%5BD%5D.M%2B%22%2C%20%22%2BB%5BD%5D.d%2B%22%2C%22%2BB%5BD%5D.H%2B%22%2C%22%2BB%5BD%5D.m%2B%22%2C%22%2BB%5BD%5D.s%2B%22)%3B%5C%22%3E%22)%3B_.a(%22%26nbsp%3B%22%2Bthis.getDateStr(null%2CB%5BD%5D))%3B_.a(%22%3C%2Ftd%3E%3C%2Ftr%3E%22)%7Delse%20_.a(%22%3Ctr%3E%3Ctd%20class%3D\'menu\'%3E%26nbsp%3B%3C%2Ftd%3E%3C%2Ftr%3E%22)%3B_.a(%22%3C%2Ftable%3E%22)%3B%24d.qsDivSel.innerHTML%3D_.j()%7D%2C_dealFmt%3Afunction()%7B_(%2Fw%2F)%3B_(%2FWW%7CW%2F)%3B_(%2FDD%7CD%2F)%3B_(%2Fyyyy%7Cyyy%7Cyy%7Cy%2F)%3B_(%2FMMMM%7CMMM%7CMM%7CM%2F)%3B_(%2Fdd%7Cd%2F)%3B_(%2FHH%7CH%2F)%3B_(%2Fmm%7Cm%2F)%3B_(%2Fss%7Cs%2F)%3B%24dp.has.sd%3D(%24dp.has.y%7C%7C%24dp.has.M%7C%7C%24dp.has.d)%3Ftrue%3Afalse%3B%24dp.has.st%3D(%24dp.has.H%7C%7C%24dp.has.m%7C%7C%24dp.has.s)%3Ftrue%3Afalse%3Bvar%20%24%3D%24dp.realFullFmt.match(%2F%25Date(.*)%25Time%2F)%3B%24dp.dateSplitStr%3D%24%3F%24%5B1%5D%3A%22%20%22%3B%24dp.realFullFmt%3D%24dp.realFullFmt.replace(%2F%25Date%2F%2C%24dp.realDateFmt).replace(%2F%25Time%2F%2C%24dp.realTimeFmt)%3Bif(%24dp.has.sd)%7Bif(%24dp.has.st)%24dp.realFmt%3D%24dp.realFullFmt%3Belse%20%24dp.realFmt%3D%24dp.realDateFmt%7Delse%20%24dp.realFmt%3D%24dp.realTimeFmt%3Bfunction%20_(_)%7Bvar%20%24%3D(_%2B%22%22).slice(1%2C2)%3B%24dp.has%5B%24%5D%3D_.exec(%24dp.dateFmt)%3F(%24dp.has.minUnit%3D%24%2Ctrue)%3Afalse%7D%7D%2CinitShowAndHide%3Afunction()%7Bvar%20%24%3D0%3B%24dp.has.y%3F(%24%3D1%2Cshow(%24d.yI%2C%24d.navLeftImg%2C%24d.navRightImg))%3Ahide(%24d.yI%2C%24d.navLeftImg%2C%24d.navRightImg)%3B%24dp.has.M%3F(%24%3D1%2Cshow(%24d.MI%2C%24d.leftImg%2C%24d.rightImg))%3Ahide(%24d.MI%2C%24d.leftImg%2C%24d.rightImg)%3B%24%3Fshow(%24d.titleDiv)%3Ahide(%24d.titleDiv)%3Bif(%24dp.has.st)%7Bshow(%24d.tDiv)%3BdisHMS(%24d.HI%2C%24dp.has.H)%3BdisHMS(%24d.mI%2C%24dp.has.m)%3BdisHMS(%24d.sI%2C%24dp.has.s)%7Delse%20hide(%24d.tDiv)%3BshorH(%24d.clearI%2C%24dp.isShowClear)%3BshorH(%24d.todayI%2C%24dp.isShowToday)%3BshorH(%24d.okI%2C%24dp.isShowOK)%3BshorH(%24d.qsDiv%2C!%24dp.doubleCalendar%26%26%24dp.has.d%26%26%24dp.qsEnabled)%3Bif(%24dp.eCont%7C%7C!(%24dp.isShowClear%7C%7C%24dp.isShowToday%7C%7C%24dp.isShowOK))hide(%24d.bDiv)%3Belse%20show(%24d.bDiv)%7D%2Cmark%3Afunction(B%2CD)%7Bvar%20A%3D%24dp.el%2C_%3D%24FF%3F%22class%22%3A%22className%22%3Bif(%24dp.errDealMode%3D%3D-1)return%3Belse%20if(B)C(A)%3Belse%7Bif(D%3D%3Dnull)D%3D%24dp.errDealMode%3Bswitch(D)%7Bcase%200%3Aif(confirm(%24lang.errAlertMsg))%7BA%5B%24dp.elProp%5D%3Dthis.oldValue%7C%7C%22%22%3BC(A)%7Delse%20%24(A)%3Bbreak%3Bcase%201%3AA%5B%24dp.elProp%5D%3Dthis.oldValue%7C%7C%22%22%3BC(A)%3Bbreak%3Bcase%202%3A%24(A)%3Bbreak%7D%7Dfunction%20C(A)%7Bvar%20B%3DA.className%3Bif(B)%7Bvar%20%24%3DB.replace(%2FWdateFmtErr%2Fg%2C%22%22)%3Bif(B!%3D%24)A.setAttribute(_%2C%24)%7D%7Dfunction%20%24(%24)%7B%24.setAttribute(_%2C%24.className%2B%22%20WdateFmtErr%22)%7D%7D%2CgetP%3Afunction(D%2C_%2C%24)%7B%24%3D%24%7C%7C%24sdt%3Bvar%20H%2CC%3D%5BD%2BD%2CD%5D%2CE%2CA%3D%24%5BD%5D%2CF%3Dfunction(%24)%7Breturn%20doStr(A%2C%24.length)%7D%3Bswitch(D)%7Bcase%22w%22%3AA%3DgetDay(%24)%3Bbreak%3Bcase%22D%22%3Avar%20G%3DgetDay(%24)%2B1%3BF%3Dfunction(%24)%7Breturn%20%24.length%3D%3D2%3F%24lang.aLongWeekStr%5BG%5D%3A%24lang.aWeekStr%5BG%5D%7D%3Bbreak%3Bcase%22W%22%3AA%3DgetWeek(%24)%3Bbreak%3Bcase%22y%22%3AC%3D%5B%22yyyy%22%2C%22yyy%22%2C%22yy%22%2C%22y%22%5D%3B_%3D_%7C%7CC%5B0%5D%3BF%3Dfunction(_)%7Breturn%20doStr((_.length%3C4)%3F(_.length%3C3%3F%24.y%25100%3A(%24.y%2B2000-%24dp.yearOffset)%251000)%3AA%2C_.length)%7D%3Bbreak%3Bcase%22M%22%3AC%3D%5B%22MMMM%22%2C%22MMM%22%2C%22MM%22%2C%22M%22%5D%3BF%3Dfunction(%24)%7Breturn(%24.length%3D%3D4)%3F%24lang.aLongMonStr%5BA-1%5D%3A(%24.length%3D%3D3)%3F%24lang.aMonStr%5BA-1%5D%3AdoStr(A%2C%24.length)%7D%3Bbreak%7D_%3D_%7C%7CD%2BD%3Bif(%22yMdHms%22.indexOf(D)%3E-1%26%26D!%3D%22y%22%26%26!%24dp.has%5BD%5D)if(%22Hms%22.indexOf(D)%3E-1)A%3D0%3Belse%20A%3D1%3Bvar%20B%3D%5B%5D%3Bfor(H%3D0%3BH%3CC.length%3BH%2B%2B)%7BE%3DC%5BH%5D%3Bif(_.indexOf(E)%3E%3D0)%7BB%5BH%5D%3DF(E)%3B_%3D_.replace(new%20RegExp(E%2C%22g%22)%2C%22%7B%22%2BH%2B%22%7D%22)%7D%7Dfor(H%3D0%3BH%3CB.length%3BH%2B%2B)_%3D_.replace(new%20RegExp(%22%5C%5C%7B%22%2BH%2B%22%5C%5C%7D%22%2C%22g%22)%2CB%5BH%5D)%3Breturn%20_%7D%2CgetDateStr%3Afunction(_%2C%24)%7B%24%3D%24%7C%7Cthis.splitDate(%24dp.el%5B%24dp.elProp%5D%2Cthis.dateFmt)%7C%7C%24sdt%3B_%3D_%7C%7Cthis.dateFmt%3Bif(_.indexOf(%22%25ld%22)%3E%3D0)%7Bvar%20A%3Dnew%20DPDate()%3BA.loadFromDate(%24)%3BA.d%3D0%3BA.M%3DpInt(A.M)%2B1%3BA.refresh()%3B_%3D_.replace(%2F%25ld%2Fg%2CA.d)%7Dvar%20B%3D%22ydHmswW%22%3Bfor(var%20D%3D0%3BD%3CB.length%3BD%2B%2B)%7Bvar%20C%3DB.charAt(D)%3B_%3Dthis.getP(C%2C_%2C%24)%7Dif(_.indexOf(%22D%22)%3E%3D0)%7B_%3D_.replace(%2FDD%2Fg%2C%22%25dd%22).replace(%2FD%2Fg%2C%22%25d%22)%3B_%3Dthis.getP(%22M%22%2C_%2C%24)%3B_%3D_.replace(%2F%5C%25dd%2Fg%2Cthis.getP(%22D%22%2C%22DD%22)).replace(%2F%5C%25d%2Fg%2Cthis.getP(%22D%22%2C%22D%22))%7Delse%20_%3Dthis.getP(%22M%22%2C_%2C%24)%3Breturn%20_%7D%2CgetNewP%3Afunction(_%2C%24)%7Breturn%20this.getP(_%2C%24%2C%24dt)%7D%2CgetNewDateStr%3Afunction(%24)%7Breturn%20this.getDateStr(%24%2Cthis.newdate)%7D%2Cdraw%3Afunction()%7B%24c._dealFmt()%3B%24d.rMD.innerHTML%3D%22%22%3Bif(%24dp.doubleCalendar)%7B%24c.autoPickDate%3Dtrue%3B%24dp.isShowOthers%3Dfalse%3B%24d.className%3D%22WdateDiv%20WdateDiv2%22%3Bvar%20%24%3Dnew%20sb()%3B%24.a(%22%3Ctable%20class%3DWdayTable2%20width%3D100%25%20cellspacing%3D0%20cellpadding%3D0%20border%3D1%3E%3Ctr%3E%3Ctd%20valign%3Dtop%3E%22)%3B%24.a(this._fd())%3B%24.a(%22%3C%2Ftd%3E%3Ctd%20valign%3Dtop%3E%22)%3B%24dt.attr(%22M%22%2C1)%3B%24.a(this._fd())%3B%24d.rMI%3D%24d.MI.cloneNode(true)%3B%24d.ryI%3D%24d.yI.cloneNode(true)%3B%24d.rMD.appendChild(%24d.rMI)%3B%24d.rMD.appendChild(%24d.ryI)%3B%24d.rMI.value%3D%24lang.aMonStr%5B%24dt.M-1%5D%3B%24d.rMI%5B%22realValue%22%5D%3D%24dt.M%3B%24d.ryI.value%3D%24dt.y%3B_inputBindEvent(%22rM%2Cry%22)%3B%24d.rMI.className%3D%24d.ryI.className%3D%22yminput%22%3B%24dt.attr(%22M%22%2C-1)%3B%24.a(%22%3C%2Ftd%3E%3C%2Ftr%3E%3C%2Ftable%3E%22)%3B%24d.dDiv.innerHTML%3D%24.j()%7Delse%7B%24d.className%3D%22WdateDiv%22%3B%24d.dDiv.innerHTML%3Dthis._fd()%7Dif(!%24dp.has.d%7C%7C%24dp.autoShowQS)%7Bthis._fillQS(true)%3BshowB(%24d.qsDivSel)%7Delse%20hide(%24d.qsDivSel)%3Bthis.autoSize()%7D%2CautoSize%3Afunction()%7Bvar%20_%3Dparent.document.getElementsByTagName(%22iframe%22)%3Bfor(var%20C%3D0%3BC%3C_.length%3BC%2B%2B)%7Bvar%20%24%3D%24d.style.height%3B%24d.style.height%3D%22%22%3Bvar%20A%3D%24d.offsetHeight%3Bif(_%5BC%5D.contentWindow%3D%3Dwindow%26%26A)%7B_%5BC%5D.style.width%3D%24d.offsetWidth%2B%22px%22%3Bvar%20B%3D%24d.tDiv.offsetHeight%3Bif(B%26%26%24d.bDiv.style.display%3D%3D%22none%22%26%26%24d.tDiv.style.display!%3D%22none%22%26%26document.body.scrollHeight-A%3E%3DB)%7BA%2B%3DB%3B%24d.style.height%3DA%7Delse%20%24d.style.height%3D%24%3B_%5BC%5D.style.height%3DMath.max(A%2C%24d.offsetHeight)%2B%22px%22%7D%7D%24d.qsDivSel.style.width%3D%24d.dDiv.offsetWidth%3B%24d.qsDivSel.style.height%3D%24d.dDiv.offsetHeight%7D%2CpickDate%3Afunction()%7B%24dt.d%3DMath.min(new%20Date(%24dt.y%2C%24dt.M%2C0).getDate()%2C%24dt.d)%3B%24sdt.loadFromDate(%24dt)%3B%24dp.valueEdited%3D0%3Bthis.update()%3Bif(!%24dp.eCont)if(this.checkValid(%24dt))%7BelFocus()%3Bhide(%24dp.dd)%7Dif(%24dp.onpicked)callFunc(%22onpicked%22)%7D%2CinitBtn%3Afunction()%7B%24d.clearI.onclick%3Dfunction()%7Bif(!callFunc(%22onclearing%22))%7B%24dp.valueEdited%3D0%3B%24c.update(%22%22)%3BelFocus()%3Bhide(%24dp.dd)%3Bif(%24dp.oncleared)callFunc(%22oncleared%22)%7D%7D%3B%24d.okI.onclick%3Dfunction()%7Bday_Click()%7D%3Bif(this.checkValid(%24tdt))%7B%24d.todayI.disabled%3Dfalse%3B%24d.todayI.onclick%3Dfunction()%7B%24dt.loadFromDate(%24tdt)%3Bday_Click()%7D%7Delse%20%24d.todayI.disabled%3Dtrue%7D%2CinitQS%3Afunction()%7Bvar%20H%2CG%2CA%2CF%2CC%3D%5B%5D%2C%24%3D5%2CE%3D%24dp.quickSel.length%2C_%3D%24dp.has.minUnit%3Bif(E%3E%24)E%3D%24%3Belse%20if(_%3D%3D%22m%22%7C%7C_%3D%3D%22s%22)C%3D%5B-60%2C-30%2C0%2C30%2C60%2C-15%2C15%2C-45%2C45%5D%3Belse%20for(H%3D0%3BH%3C%24%2B9%3BH%2B%2B)C%5BH%5D%3D%24dt%5B_%5D-2%2BH%3Bfor(H%3DG%3D0%3BH%3CE%3BH%2B%2B)%7BA%3Dthis.doCustomDate(%24dp.quickSel%5BH%5D)%3Bif(this.checkValid(A))this.QS%5BG%2B%2B%5D%3DA%7Dvar%20B%3D%22yMdHms%22%2CD%3D%5B1%2C1%2C1%2C0%2C0%2C0%5D%3Bfor(H%3D0%3BH%3C%3DB.indexOf(_)%3BH%2B%2B)D%5BH%5D%3D%24dt%5BB.charAt(H)%5D%3Bfor(H%3D0%3BG%3C%24%3BH%2B%2B)if(H%3CC.length)%7BA%3Dnew%20DPDate(D%5B0%5D%2CD%5B1%5D%2CD%5B2%5D%2CD%5B3%5D%2CD%5B4%5D%2CD%5B5%5D)%3BA%5B_%5D%3DC%5BH%5D%3BA.refresh()%3Bif(this.checkValid(A))this.QS%5BG%2B%2B%5D%3DA%7Delse%20this.QS%5BG%2B%2B%5D%3Dnull%7D%7D%3Bfunction%20elFocus()%7Bvar%20_%3D%24dp.el%3Btry%7Bif(_.style.display!%3D%22none%22%26%26_.type!%3D%22hidden%22%26%26(_.nodeName.toLowerCase()%3D%3D%22input%22%7C%7C_.nodeName.toLowerCase()%3D%3D%22textarea%22))%7B_%5B%22My97Mark%22%5D%3Dtrue%3B_.focus()%7D%7Dcatch(%24)%7B%7DsetTimeout(function()%7B_%5B%22My97Mark%22%5D%3Dfalse%7D%2C197)%7Dfunction%20sb()%7Bthis.s%3Dnew%20Array()%3Bthis.i%3D0%3Bthis.a%3Dfunction(%24)%7Bthis.s%5Bthis.i%2B%2B%5D%3D%24%7D%3Bthis.j%3Dfunction()%7Breturn%20this.s.join(%22%22)%7D%7Dfunction%20getWeek(%24%2CC)%7BC%3DC%7C%7C0%3Bvar%20A%3Dnew%20Date(%24.y%2C%24.M-1%2C%24.d%2BC)%3Bif(%24dp.weekMethod%3D%3D%22ISO8601%22)%7BA.setDate(A.getDate()-(A.getDay()%2B6)%257%2B3)%3Bvar%20B%3DA.valueOf()%3BA.setMonth(0)%3BA.setDate(4)%3Breturn%20Math.round((B-A.valueOf())%2F(7*86400000))%2B1%7Delse%7Bvar%20_%3Dnew%20Date(%24.y%2C0%2C1)%3BA%3DMath.round((A.valueOf()-_.valueOf())%2F86400000)%3Breturn%20Math.ceil((A%2B(_.getDay()%2B1))%2F7)%7D%7Dfunction%20getDay(%24)%7Bvar%20_%3Dnew%20Date(%24.y%2C%24.M-1%2C%24.d)%3Breturn%20_.getDay()%7Dfunction%20show()%7BsetDisp(arguments%2C%22%22)%7Dfunction%20showB()%7BsetDisp(arguments%2C%22block%22)%7Dfunction%20hide()%7BsetDisp(arguments%2C%22none%22)%7Dfunction%20setDisp(_%2C%24)%7Bfor(i%3D0%3Bi%3C_.length%3Bi%2B%2B)_%5Bi%5D.style.display%3D%24%7Dfunction%20shorH(_%2C%24)%7B%24%3Fshow(_)%3Ahide(_)%7Dfunction%20disHMS(_%2C%24)%7Bif(%24)_.disabled%3Dfalse%3Belse%7B_.disabled%3Dtrue%3B_.value%3D%2200%22%7D%7Dfunction%20c(_%2CA)%7Bvar%20%24%3DA%3Bif(_%3D%3D%22M%22)%24%3DmakeInRange(A%2C1%2C12)%3Belse%20if(_%3D%3D%22H%22)%24%3DmakeInRange(A%2C0%2C23)%3Belse%20if(%22ms%22.indexOf(_)%3E%3D0)%24%3DmakeInRange(A%2C0%2C59)%3Bif(A%3D%3D%24%2B1)%24%3D%24sdt%5B_%5D%3Bif(%24sdt%5B_%5D!%3D%24%26%26!callFunc(_%2B%22changing%22))%7Bvar%20B%3D%24c.checkRange()%3Bif(B%3D%3D0)sv(_%2C%24)%3Belse%20if(B%3C0)_setAll(%24c.minDate)%3Belse%20if(B%3E0)_setAll(%24c.maxDate)%3B%24d.okI.disabled%3D!%24c.checkValid(%24sdt)%3Bif(%22yMd%22.indexOf(_)%3E%3D0)%24c.draw()%3BcallFunc(_%2B%22changed%22)%7D%7Dfunction%20_setAll(%24)%7Bsv(%22y%22%2C%24.y)%3Bsv(%22M%22%2C%24.M)%3Bsv(%22d%22%2C%24.d)%3Bsv(%22H%22%2C%24.H)%3Bsv(%22m%22%2C%24.m)%3Bsv(%22s%22%2C%24.s)%7Dfunction%20day_Click(F%2CB%2C_%2CD%2CC%2CA)%7Bvar%20%24%3Dnew%20DPDate(%24dt.y%2C%24dt.M%2C%24dt.d%2C%24dt.H%2C%24dt.m%2C%24dt.s)%3B%24dt.loadDate(F%2CB%2C_%2CD%2CC%2CA)%3Bif(!callFunc(%22onpicking%22))%7Bvar%20E%3D%24.y%3D%3DF%26%26%24.M%3D%3DB%26%26%24.d%3D%3D_%3Bif(!E%26%26arguments.length!%3D0)%7Bc(%22y%22%2CF)%3Bc(%22M%22%2CB)%3Bc(%22d%22%2C_)%3B%24c.currFocus%3D%24dp.el%3BdealAutoUpdate()%7Dif(%24c.autoPickDate%7C%7CE%7C%7Carguments.length%3D%3D0)%24c.pickDate()%7Delse%20%24dt%3D%24%7Dfunction%20dealAutoUpdate()%7Bif(%24dp.autoUpdateOnChanged)%7B%24c.update()%3B%24dp.el.focus()%7D%7Dfunction%20callFunc(%24)%7Bvar%20_%3Bif(%24dp%5B%24%5D)_%3D%24dp%5B%24%5D.call(%24dp.el%2C%24dp)%3Breturn%20_%7Dfunction%20sv(_%2C%24)%7Bif(%24%3D%3Dnull)%24%3D%24dt%5B_%5D%3B%24sdt%5B_%5D%3D%24dt%5B_%5D%3D%24%3Bif(%22yHms%22.indexOf(_)%3E%3D0)%24d%5B_%2B%22I%22%5D.value%3D%24%3Bif(_%3D%3D%22M%22)%7B%24d.MI%5B%22realValue%22%5D%3D%24%3B%24d.MI.value%3D%24lang.aMonStr%5B%24-1%5D%7D%7Dfunction%20makeInRange(_%2C%24%2CA)%7Bif(_%3C%24)_%3D%24%3Belse%20if(_%3EA)_%3DA%3Breturn%20_%7Dfunction%20attachTabEvent(%24%2C_)%7B%24dp.attachEvent(%24%2C%22onkeydown%22%2Cfunction(%24)%7B%24%3D%24%7C%7Cevent%2Ck%3D(%24.which%3D%3Dundefined)%3F%24.keyCode%3A%24.which%3Bif(k%3D%3D9)_()%7D)%7Dfunction%20doStr(%24%2C_)%7B%24%3D%24%2B%22%22%3Bwhile(%24.length%3C_)%24%3D%220%22%2B%24%3Breturn%20%24%7Dfunction%20hideSel()%7Bhide(%24d.yD%2C%24d.MD%2C%24d.HD%2C%24d.mD%2C%24d.sD)%7Dfunction%20updownEvent(_)%7Bvar%20A%3D%24c.currFocus%2C%24%3D%24dp.hmsMenuCfg%3Bif(A!%3D%24d.HI%26%26A!%3D%24d.mI%26%26A!%3D%24d.sI)A%3D%24d.HI%3Bswitch(A)%7Bcase%20%24d.HI%3Ac(%22H%22%2C%24dt.H%2B_*%24.H%5B0%5D)%3Bbreak%3Bcase%20%24d.mI%3Ac(%22m%22%2C%24dt.m%2B_*%24.m%5B0%5D)%3Bbreak%3Bcase%20%24d.sI%3Ac(%22s%22%2C%24dt.s%2B_*%24.s%5B0%5D)%3Bbreak%7DdealAutoUpdate()%7Dfunction%20DPDate(D%2CA%2C%24%2CC%2CB%2C_)%7Bthis.loadDate(D%2CA%2C%24%2CC%2CB%2C_)%7DDPDate.prototype%3D%7BloadDate%3Afunction(E%2CB%2C_%2CD%2CC%2CA)%7Bvar%20%24%3Dnew%20Date()%3Bthis.y%3DpInt3(E%2Cthis.y%2C%24.getFullYear())%3Bthis.M%3DpInt3(B%2Cthis.M%2C%24.getMonth()%2B1)%3Bthis.d%3D%24dp.has.d%3FpInt3(_%2Cthis.d%2C%24.getDate())%3A1%3Bthis.H%3DpInt3(D%2Cthis.H%2C%24.getHours())%3Bthis.m%3DpInt3(C%2Cthis.m%2C%24.getMinutes())%3Bthis.s%3DpInt3(A%2Cthis.s%2C%24.getSeconds())%7D%2CloadFromDate%3Afunction(%24)%7Bif(%24)this.loadDate(%24.y%2C%24.M%2C%24.d%2C%24.H%2C%24.m%2C%24.s)%7D%2CcoverDate%3Afunction(E%2CB%2C_%2CD%2CC%2CA)%7Bvar%20%24%3Dnew%20Date()%3Bthis.y%3DpInt3(this.y%2CE%2C%24.getFullYear())%3Bthis.M%3DpInt3(this.M%2CB%2C%24.getMonth()%2B1)%3Bthis.d%3D%24dp.has.d%3FpInt3(this.d%2C_%2C%24.getDate())%3A1%3Bthis.H%3DpInt3(this.H%2CD%2C%24.getHours())%3Bthis.m%3DpInt3(this.m%2CC%2C%24.getMinutes())%3Bthis.s%3DpInt3(this.s%2CA%2C%24.getSeconds())%7D%2CcompareWith%3Afunction(%24%2CC)%7Bvar%20A%3D%22yMdHms%22%2C_%2CB%3BC%3DA.indexOf(C)%3BC%3DC%3E%3D0%3FC%3A5%3Bfor(var%20D%3D0%3BD%3C%3DC%3BD%2B%2B)%7BB%3DA.charAt(D)%3B_%3Dthis%5BB%5D-%24%5BB%5D%3Bif(_%3E0)return%201%3Belse%20if(_%3C0)return-1%7Dreturn%200%7D%2Crefresh%3Afunction()%7Bvar%20%24%3Dnew%20Date(this.y%2Cthis.M-1%2Cthis.d%2Cthis.H%2Cthis.m%2Cthis.s)%3Bthis.y%3D%24.getFullYear()%3Bthis.M%3D%24.getMonth()%2B1%3Bthis.d%3D%24.getDate()%3Bthis.H%3D%24.getHours()%3Bthis.m%3D%24.getMinutes()%3Bthis.s%3D%24.getSeconds()%3Breturn!isNaN(this.y)%7D%2Cattr%3Afunction(_%2C%24)%7Bif(%22yMdHms%22.indexOf(_)%3E%3D0)%7Bvar%20A%3Dthis.d%3Bif(_%3D%3D%22M%22)this.d%3D1%3Bthis%5B_%5D%2B%3D%24%3Bthis.refresh()%3Bthis.d%3DA%7D%7D%7D%3Bfunction%20pInt(%24)%7Breturn%20parseInt(%24%2C10)%7Dfunction%20pInt2(%24%2C_)%7Breturn%20rtn(pInt(%24)%2C_)%7Dfunction%20pInt3(%24%2CA%2C_)%7Breturn%20pInt2(%24%2Crtn(A%2C_))%7Dfunction%20rtn(%24%2C_)%7Breturn%20%24%3D%3Dnull%7C%7CisNaN(%24)%3F_%3A%24%7Dfunction%20fireEvent(A%2C%24)%7Bif(%24IE)A.fireEvent(%22on%22%2B%24)%3Belse%7Bvar%20_%3Ddocument.createEvent(%22HTMLEvents%22)%3B_.initEvent(%24%2Ctrue%2Ctrue)%3BA.dispatchEvent(_)%7D%7Dfunction%20_foundInput(%24)%7Bvar%20A%2CB%2C_%3D%22y%2CM%2CH%2Cm%2Cs%2Cry%2CrM%22.split(%22%2C%22)%3Bfor(B%3D0%3BB%3C_.length%3BB%2B%2B)%7BA%3D_%5BB%5D%3Bif(%24d%5BA%2B%22I%22%5D%3D%3D%24)return%20A.slice(A.length-1%2CA.length)%7Dreturn%200%7Dfunction%20_focus(%24)%7Bvar%20A%3D_foundInput(this)%2C_%3D%24d%5BA%2B%22D%22%5D%3Bif(!A)return%3B%24c.currFocus%3Dthis%3Bif(A%3D%3D%22y%22)this.className%3D%22yminputfocus%22%3Belse%20if(A%3D%3D%22M%22)%7Bthis.className%3D%22yminputfocus%22%3Bthis.value%3Dthis%5B%22realValue%22%5D%7Dtry%7Bthis.select()%7Dcatch(%24)%7B%7D%24c%5B%22_f%22%2BA%5D(this)%3BshowB(_)%3Bif(%22Hms%22.indexOf(A)%3E%3D0)%7B_.style.marginLeft%3DMath.min(this.offsetLeft%2C%24d.sI.offsetLeft%2B60-_.offsetWidth)%3B_.style.marginTop%3Dthis.offsetTop-_.offsetHeight-2%7D%7Dfunction%20_blur(showDiv)%7Bvar%20p%3D_foundInput(this)%2CisR%2CmStr%2Cv%3Dthis.value%2Coldv%3D%24dt%5Bp%5D%3Bif(p%3D%3D0)return%3B%24dt%5Bp%5D%3DNumber(v)%3E%3D0%3FNumber(v)%3A%24dt%5Bp%5D%3Bif(p%3D%3D%22y%22)%7BisR%3Dthis%3D%3D%24d.ryI%3Bif(isR%26%26%24dt.M%3D%3D12)%24dt.y-%3D1%7Delse%20if(p%3D%3D%22M%22)%7BisR%3Dthis%3D%3D%24d.rMI%3Bif(isR)%7BmStr%3D%24lang.aMonStr%5B%24dt%5Bp%5D-1%5D%3Bif(oldv%3D%3D12)%24dt.y%2B%3D1%3B%24dt.attr(%22M%22%2C-1)%7Dif(%24sdt.M%3D%3D%24dt.M)this.value%3DmStr%7C%7C%24lang.aMonStr%5B%24dt%5Bp%5D-1%5D%3Bif((%24sdt.y!%3D%24dt.y))c(%22y%22%2C%24dt.y)%7Deval(%22c(%5C%22%22%2Bp%2B%22%5C%22%2C%22%2B%24dt%5Bp%5D%2B%22)%22)%3Bif(showDiv!%3D%3Dtrue)%7Bif(p%3D%3D%22y%22%7C%7Cp%3D%3D%22M%22)this.className%3D%22yminput%22%3Bhide(%24d%5Bp%2B%22D%22%5D)%7DdealAutoUpdate()%7Dfunction%20_cancelKey(%24)%7Bif(%24.preventDefault)%7B%24.preventDefault()%3B%24.stopPropagation()%7Delse%7B%24.cancelBubble%3Dtrue%3B%24.returnValue%3Dfalse%7Dif(%24OPERA)%24.keyCode%3D0%7Dfunction%20_inputBindEvent(%24)%7Bvar%20A%3D%24.split(%22%2C%22)%3Bfor(var%20B%3D0%3BB%3CA.length%3BB%2B%2B)%7Bvar%20_%3DA%5BB%5D%2B%22I%22%3B%24d%5B_%5D.onfocus%3D_focus%3B%24d%5B_%5D.onblur%3D_blur%7D%7Dfunction%20_tab(M)%7Bvar%20H%3DM.srcElement%7C%7CM.target%2CQ%3DM.which%7C%7CM.keyCode%3BisShow%3D%24dp.eCont%3Ftrue%3A%24dp.dd.style.display!%3D%22none%22%3B%24dp.valueEdited%3D1%3Bif(Q%3E%3D96%26%26Q%3C%3D105)Q-%3D48%3Bif(%24dp.enableKeyboard%26%26isShow)%7Bif(!H.nextCtrl)%7BH.nextCtrl%3D%24dp.focusArr%5B1%5D%3B%24c.currFocus%3D%24dp.el%7Dif(H%3D%3D%24dp.el)%24c.currFocus%3D%24dp.el%3Bif(Q%3D%3D27)if(H%3D%3D%24dp.el)%7B%24c.close()%3Breturn%7Delse%20%24dp.el.focus()%3Bif(Q%3E%3D37%26%26Q%3C%3D40)%7Bvar%20U%3Bif(%24c.currFocus%3D%3D%24dp.el%7C%7C%24c.currFocus%3D%3D%24d.okI)if(%24dp.has.d)%7BU%3D%22d%22%3Bif(Q%3D%3D38)%24dt%5BU%5D-%3D7%3Belse%20if(Q%3D%3D39)%24dt%5BU%5D%2B%3D1%3Belse%20if(Q%3D%3D37)%24dt%5BU%5D-%3D1%3Belse%20%24dt%5BU%5D%2B%3D7%3B%24dt.refresh()%3Bc(%22y%22%2C%24dt%5B%22y%22%5D)%3Bc(%22M%22%2C%24dt%5B%22M%22%5D)%3Bc(%22d%22%2C%24dt%5BU%5D)%3B_cancelKey(M)%3Breturn%7Delse%7BU%3D%24dp.has.minUnit%3B%24d%5BU%2B%22I%22%5D.focus()%7DU%3DU%7C%7C_foundInput(%24c.currFocus)%3Bif(U)%7Bif(Q%3D%3D38%7C%7CQ%3D%3D39)%24dt%5BU%5D%2B%3D1%3Belse%20%24dt%5BU%5D-%3D1%3B%24dt.refresh()%3B%24c.currFocus.value%3D%24dt%5BU%5D%3B_blur.call(%24c.currFocus%2Ctrue)%3B%24c.currFocus.select()%7D%7Delse%20if(Q%3D%3D9)%7Bvar%20D%3DH.nextCtrl%3Bfor(var%20R%3D0%3BR%3C%24dp.focusArr.length%3BR%2B%2B)if(D.disabled%3D%3Dtrue%7C%7CD.offsetHeight%3D%3D0)D%3DD.nextCtrl%3Belse%20break%3Bif(%24c.currFocus!%3DD)%7B%24c.currFocus%3DD%3BD.focus()%7D%7Delse%20if(Q%3D%3D13)%7B_blur.call(%24c.currFocus)%3Bif(%24c.currFocus.type%3D%3D%22button%22)%24c.currFocus.click()%3Belse%20if(%24dp.cal.oldValue%3D%3D%24dp.el%5B%24dp.elProp%5D)%24c.pickDate()%3Belse%20%24c.close()%3B%24c.currFocus%3D%24dp.el%7D%7Delse%20if(Q%3D%3D9%26%26H%3D%3D%24dp.el)%24c.close()%3Bif(%24dp.enableInputMask%26%26!%24OPERA%26%26!%24dp.readOnly%26%26%24c.currFocus%3D%3D%24dp.el%26%26(Q%3E%3D48%26%26Q%3C%3D57))%7Bvar%20T%3D%24dp.el%2CS%3DT.value%2CF%3DE(T)%2CI%3D%7Bstr%3A%22%22%2Carr%3A%5B%5D%7D%2CR%3D0%2CK%2CN%3D0%2CX%3D0%2CO%3D0%2CJ%2C_%3D%2Fyyyy%7Cyyy%7Cyy%7Cy%7CMM%7CM%7Cdd%7Cd%7C%25ld%7CHH%7CH%7Cmm%7Cm%7Css%7Cs%7CWW%7CW%7Cw%2Fg%2CL%3D%24dp.dateFmt.match(_)%2CB%2CA%2C%24%2CV%2CW%2CG%2CJ%3D0%3Bif(S!%3D%22%22)%7BO%3DS.match(%2F%5B0-9%5D%2Fg)%3BO%3DO%3D%3Dnull%3F0%3AO.length%3Bfor(R%3D0%3BR%3CL.length%3BR%2B%2B)O-%3DMath.max(L%5BR%5D.length%2C2)%3BO%3DO%3E%3D0%3F1%3A0%3Bif(O%3D%3D1%26%26F%3E%3DS.length)F%3DS.length-1%7DS%3DS.substring(0%2CF)%2BString.fromCharCode(Q)%2BS.substring(F%2BO)%3BF%2B%2B%3Bfor(R%3D0%3BR%3CS.length%3BR%2B%2B)%7Bvar%20C%3DS.charAt(R)%3Bif(%2F%5B0-9%5D%2F.test(C))I.str%2B%3DC%3Belse%20I.arr%5BR%5D%3D1%7DS%3D%22%22%3B_.lastIndex%3D0%3Bwhile((K%3D_.exec(%24dp.dateFmt))!%3D%3Dnull)%7BX%3DK.index-(K%5B0%5D%3D%3D%22%25ld%22%3F1%3A0)%3Bif(N%3E%3D0)%7BS%2B%3D%24dp.dateFmt.substring(N%2CX)%3Bif(F%3E%3DN%2BJ%26%26F%3C%3DX%2BJ)F%2B%3DX-N%7DN%3D_.lastIndex%3BG%3DN-X%3BB%3DI.str.substring(0%2CG)%3BA%3DK%5B0%5D.charAt(0)%3B%24%3DpInt(B.charAt(0))%3Bif(I.str.length%3E1)%7BV%3DI.str.charAt(1)%3BW%3D%24*10%2BpInt(V)%7Delse%7BV%3D%22%22%3BW%3D%24%7Dif(I.arr%5BX%2B1%5D%7C%7CA%3D%3D%22M%22%26%26W%3E12%7C%7CA%3D%3D%22d%22%26%26W%3E31%7C%7CA%3D%3D%22H%22%26%26W%3E23%7C%7C%22ms%22.indexOf(A)%3E%3D0%26%26W%3E59)%7Bif(K%5B0%5D.length%3D%3D2)B%3D%220%22%2B%24%3Belse%20B%3D%24%3BF%2B%2B%7Delse%20if(G%3D%3D1)%7BB%3DW%3BG%2B%2B%3BJ%2B%2B%7DS%2B%3DB%3BI.str%3DI.str.substring(G)%3Bif(I.str%3D%3D%22%22)break%7DT.value%3DS%3BP(T%2CF)%3B_cancelKey(M)%7Dif(isShow%26%26%24c.currFocus!%3D%24dp.el%26%26!((Q%3E%3D48%26%26Q%3C%3D57)%7C%7CQ%3D%3D8%7C%7CQ%3D%3D46))_cancelKey(M)%3Bfunction%20E(A)%7Bvar%20_%3D0%3Bif(%24dp.win.document.selection)%7Bvar%20B%3D%24dp.win.document.selection.createRange()%2C%24%3DB.text.length%3BB.moveStart(%22character%22%2C-A.value.length)%3B_%3DB.text.length-%24%7Delse%20if(A.selectionStart%7C%7CA.selectionStart%3D%3D%220%22)_%3DA.selectionStart%3Breturn%20_%7Dfunction%20P(_%2CA)%7Bif(_.setSelectionRange)%7B_.focus()%3B_.setSelectionRange(A%2CA)%7Delse%20if(_.createTextRange)%7Bvar%20%24%3D_.createTextRange()%3B%24.collapse(true)%3B%24.moveEnd(%22character%22%2CA)%3B%24.moveStart(%22character%22%2CA)%3B%24.select()%7D%7D%7Ddocument.ready%3D1'));
                $.push('</script>');
                $.push('</head><body leftmargin="0" topmargin="0" tabindex=0></body></html>');
                $.push('<script>var t;t=t||setInterval(function(){if(doc.ready){new My97DP();$cfg.onload();$c.autoSize();$cfg.setPos($dp);clearInterval(t);}},20);</script>');
                J.setPos = B;
                J.onload = Z;
                H.write('<html>');
                H.cfg = J;
                H.write($.join(''));
                H.close();
            }
        }
        function B(J) {
            var H = J.position.left, C = J.position.top, D = J.el;
            if (D == T)
                return;
            if (D != J.srcEl && (P(D) == 'none' || D.type == 'hidden'))
                D = J.srcEl;
            var I = W(D), $ = F(Y), E = M(V), B = b(V), G = $dp.dd.offsetHeight, A = $dp.dd.offsetWidth;
            if (isNaN(C))
                C = 0;
            if ($.topM + I.bottom + G > E.height && $.topM + I.top - G > 0)
                C += B.top + $.topM + I.top - G - 2;
            else {
                C += B.top + $.topM + I.bottom;
                var _ = C - B.top + G - E.height;
                if (_ > 0)
                    C -= _;
            }
            if (isNaN(H))
                H = 0;
            H += B.left + Math.min($.leftM + I.left, E.width - A - 5) - (S ? 2 : 0);
            J.dd.style.top = C + 'px';
            J.dd.style.left = H + 'px';
        }
    }
}));
define('Static/js/comsys/widget/DataPicker', [
    'Class',
    'TPLEngine',
    'Static/js/comsys/widget/ButtonTextBox',
    'Static/js/libs/wdate.picker/WdatePicker'
], function (Class, TPLEngine, ButtonTextBox) {
    var ClassName = 'Control.DataPicker';
    var DataPicker = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
        },
        initialize: function () {
            var that = this;
            this.callParent();
            this.$BaseEl.on('focus', function () {
                WdatePicker($.extend({ position: { top: 4 } }, that.setting));
                that.RuntimeBind();
            });
            return this;
        },
        RuntimeBind: function () {
            var THIS = this;
            var $scrollBar = this.$BaseEl.closest('.scroll-bar');
            if ($scrollBar.length == 0) {
                $(document).off('.wdatepickermousewheelhide').on('mousewheel.wdatepickermousewheelhide', function () {
                    $dp.hide();
                });
            } else {
                ScrollStart = function () {
                    $dp.hide();
                    ScrollStart = function () {
                    };
                };
            }
        }
    }, ButtonTextBox);
    $.fn.extend({
        DataPickerInit: function (setting) {
            return this.each(function () {
                var oset = $(this).attr('cs-options');
                var clone = $.extend({}, setting);
                if (oset) {
                    clone = $.extend(clone, eval('(' + oset + ')'));
                }
                new DataPicker({
                    element: this,
                    setting: clone
                }).initialize();
            }).removeAttr('cs-control');
        }
    });
    return DataPicker;
});
define('Static/js/common/client/ComsysFileReader', [], function () {
    function ComsysFileReader(url) {
        this.url = window.globalFileReaderUrl || url;
    }
    ComsysFileReader.prototype = {
        constructor: ComsysFileReader,
        read: function (file) {
            var that = this;
            that.deferred = new $.Deferred();
            that.deferred.promise(that);
            var $file = $(file);
            var $form = $file.closest('form');
            if ($file.val() === '')
                return;
            $form.ajaxSubmit({
                type: 'POST',
                url: that.url,
                dataType: 'text',
                success: function (retData) {
                    that.deferred.resolve(retData);
                },
                error: function (e) {
                    $file.val('');
                    that.deferred.reject(e.responseText);
                }
            });
            return this;
        }
    };
    return ComsysFileReader;
});
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('Static/js/libs/jquery.form/jquery.form', [], factory);
    } else {
        factory(typeof jQuery != 'undefined' ? jQuery : window.Zepto);
    }
}(function () {
    'use strict';
    var feature = {};
    feature.fileapi = $('<input type=\'file\'/>').get(0).files !== undefined;
    feature.formdata = window.FormData !== undefined;
    var hasProp = !!$.fn.prop;
    $.fn.attr2 = function () {
        if (!hasProp) {
            return this.attr.apply(this, arguments);
        }
        var val = this.prop.apply(this, arguments);
        if (val && val.jquery || typeof val === 'string') {
            return val;
        }
        return this.attr.apply(this, arguments);
    };
    $.fn.ajaxSubmit = function (options) {
        if (!this.length) {
            log('ajaxSubmit: skipping submit process - no element selected');
            return this;
        }
        var method, action, url, $form = this;
        if (typeof options == 'function') {
            options = { success: options };
        } else if (options === undefined) {
            options = {};
        }
        method = options.type || this.attr2('method');
        action = options.url || this.attr2('action');
        url = typeof action === 'string' ? $.trim(action) : '';
        url = url || window.location.href || '';
        if (url) {
            url = (url.match(/^([^#]+)/) || [])[1];
        }
        options = $.extend(true, {
            url: url,
            success: $.ajaxSettings.success,
            type: method || $.ajaxSettings.type,
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
        }, options);
        var veto = {};
        this.trigger('form-pre-serialize', [
            this,
            options,
            veto
        ]);
        if (veto.veto) {
            log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
            return this;
        }
        if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
            log('ajaxSubmit: submit aborted via beforeSerialize callback');
            return this;
        }
        var traditional = options.traditional;
        if (traditional === undefined) {
            traditional = $.ajaxSettings.traditional;
        }
        var elements = [];
        var qx, a = this.formToArray(options.semantic, elements);
        if (options.data) {
            options.extraData = options.data;
            qx = $.param(options.data, traditional);
        }
        if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
            log('ajaxSubmit: submit aborted via beforeSubmit callback');
            return this;
        }
        this.trigger('form-submit-validate', [
            a,
            this,
            options,
            veto
        ]);
        if (veto.veto) {
            log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
            return this;
        }
        var q = $.param(a, traditional);
        if (qx) {
            q = q ? q + '&' + qx : qx;
        }
        if (options.type.toUpperCase() == 'GET') {
            options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
            options.data = null;
        } else {
            options.data = q;
        }
        var callbacks = [];
        if (options.resetForm) {
            callbacks.push(function () {
                $form.resetForm();
            });
        }
        if (options.clearForm) {
            callbacks.push(function () {
                $form.clearForm(options.includeHidden);
            });
        }
        if (!options.dataType && options.target) {
            var oldSuccess = options.success || function () {
            };
            callbacks.push(function (data) {
                var fn = options.replaceTarget ? 'replaceWith' : 'html';
                $(options.target)[fn](data).each(oldSuccess, arguments);
            });
        } else if (options.success) {
            callbacks.push(options.success);
        }
        options.success = function (data, status, xhr) {
            var context = options.context || this;
            for (var i = 0, max = callbacks.length; i < max; i++) {
                callbacks[i].apply(context, [
                    data,
                    status,
                    xhr || $form,
                    $form
                ]);
            }
        };
        if (options.error) {
            var oldError = options.error;
            options.error = function (xhr, status, error) {
                var context = options.context || this;
                oldError.apply(context, [
                    xhr,
                    status,
                    error,
                    $form
                ]);
            };
        }
        if (options.complete) {
            var oldComplete = options.complete;
            options.complete = function (xhr, status) {
                var context = options.context || this;
                oldComplete.apply(context, [
                    xhr,
                    status,
                    $form
                ]);
            };
        }
        var fileInputs = $('input[type=file]:enabled', this).filter(function () {
            return $(this).val() !== '';
        });
        var hasFileInputs = fileInputs.length > 0;
        var mp = 'multipart/form-data';
        var multipart = $form.attr('enctype') == mp || $form.attr('encoding') == mp;
        var fileAPI = feature.fileapi && feature.formdata;
        log('fileAPI :' + fileAPI);
        var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;
        var jqxhr;
        if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
            if (options.closeKeepAlive) {
                $.get(options.closeKeepAlive, function () {
                    jqxhr = fileUploadIframe(a);
                });
            } else {
                jqxhr = fileUploadIframe(a);
            }
        } else if ((hasFileInputs || multipart) && fileAPI) {
            jqxhr = fileUploadXhr(a);
        } else {
            jqxhr = $.ajax(options);
        }
        $form.removeData('jqxhr').data('jqxhr', jqxhr);
        for (var k = 0; k < elements.length; k++) {
            elements[k] = null;
        }
        this.trigger('form-submit-notify', [
            this,
            options
        ]);
        return this;
        function deepSerialize(extraData) {
            var serialized = $.param(extraData, options.traditional).split('&');
            var len = serialized.length;
            var result = [];
            var i, part;
            for (i = 0; i < len; i++) {
                serialized[i] = serialized[i].replace(/\+/g, ' ');
                part = serialized[i].split('=');
                result.push([
                    decodeURIComponent(part[0]),
                    decodeURIComponent(part[1])
                ]);
            }
            return result;
        }
        function fileUploadXhr(a) {
            var formdata = new FormData();
            for (var i = 0; i < a.length; i++) {
                formdata.append(a[i].name, a[i].value);
            }
            if (options.extraData) {
                var serializedData = deepSerialize(options.extraData);
                for (i = 0; i < serializedData.length; i++) {
                    if (serializedData[i]) {
                        formdata.append(serializedData[i][0], serializedData[i][1]);
                    }
                }
            }
            options.data = null;
            var s = $.extend(true, {}, $.ajaxSettings, options, {
                contentType: false,
                processData: false,
                cache: false,
                type: method || 'POST'
            });
            if (options.uploadProgress) {
                s.xhr = function () {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            options.uploadProgress(event, position, total, percent);
                        }, false);
                    }
                    return xhr;
                };
            }
            s.data = null;
            var beforeSend = s.beforeSend;
            s.beforeSend = function (xhr, o) {
                if (options.formData) {
                    o.data = options.formData;
                } else {
                    o.data = formdata;
                }
                if (beforeSend) {
                    beforeSend.call(this, xhr, o);
                }
            };
            return $.ajax(s);
        }
        function fileUploadIframe(a) {
            var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
            var deferred = $.Deferred();
            deferred.abort = function (status) {
                xhr.abort(status);
            };
            if (a) {
                for (i = 0; i < elements.length; i++) {
                    el = $(elements[i]);
                    if (hasProp) {
                        el.prop('disabled', false);
                    } else {
                        el.removeAttr('disabled');
                    }
                }
            }
            s = $.extend(true, {}, $.ajaxSettings, options);
            s.context = s.context || s;
            id = 'jqFormIO' + new Date().getTime();
            if (s.iframeTarget) {
                $io = $(s.iframeTarget);
                n = $io.attr2('name');
                if (!n) {
                    $io.attr2('name', id);
                } else {
                    id = n;
                }
            } else {
                $io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />');
                $io.css({
                    position: 'absolute',
                    top: '-1000px',
                    left: '-1000px'
                });
            }
            io = $io[0];
            xhr = {
                aborted: 0,
                responseText: null,
                responseXML: null,
                status: 0,
                statusText: 'n/a',
                getAllResponseHeaders: function () {
                },
                getResponseHeader: function () {
                },
                setRequestHeader: function () {
                },
                abort: function (status) {
                    var e = status === 'timeout' ? 'timeout' : 'aborted';
                    log('aborting upload... ' + e);
                    this.aborted = 1;
                    try {
                        if (io.contentWindow.document.execCommand) {
                            io.contentWindow.document.execCommand('Stop');
                        }
                    } catch (ignore) {
                    }
                    $io.attr('src', s.iframeSrc);
                    xhr.error = e;
                    if (s.error) {
                        s.error.call(s.context, xhr, e, status);
                    }
                    if (g) {
                        $.event.trigger('ajaxError', [
                            xhr,
                            s,
                            e
                        ]);
                    }
                    if (s.complete) {
                        s.complete.call(s.context, xhr, e);
                    }
                }
            };
            g = s.global;
            if (g && 0 === $.active++) {
                $.event.trigger('ajaxStart');
            }
            if (g) {
                $.event.trigger('ajaxSend', [
                    xhr,
                    s
                ]);
            }
            if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
                if (s.global) {
                    $.active--;
                }
                deferred.reject();
                return deferred;
            }
            if (xhr.aborted) {
                deferred.reject();
                return deferred;
            }
            sub = form.clk;
            if (sub) {
                n = sub.name;
                if (n && !sub.disabled) {
                    s.extraData = s.extraData || {};
                    s.extraData[n] = sub.value;
                    if (sub.type == 'image') {
                        s.extraData[n + '.x'] = form.clk_x;
                        s.extraData[n + '.y'] = form.clk_y;
                    }
                }
            }
            var CLIENT_TIMEOUT_ABORT = 1;
            var SERVER_ABORT = 2;
            function getDoc(frame) {
                var doc = null;
                try {
                    if (frame.contentWindow) {
                        doc = frame.contentWindow.document;
                    }
                } catch (err) {
                    log('cannot get iframe.contentWindow document: ' + err);
                }
                if (doc) {
                    return doc;
                }
                try {
                    doc = frame.contentDocument ? frame.contentDocument : frame.document;
                } catch (err) {
                    log('cannot get iframe.contentDocument: ' + err);
                    doc = frame.document;
                }
                return doc;
            }
            var csrf_token = $('meta[name=csrf-token]').attr('content');
            var csrf_param = $('meta[name=csrf-param]').attr('content');
            if (csrf_param && csrf_token) {
                s.extraData = s.extraData || {};
                s.extraData[csrf_param] = csrf_token;
            }
            function doSubmit() {
                var t = $form.attr2('target'), a = $form.attr2('action'), mp = 'multipart/form-data', et = $form.attr('enctype') || $form.attr('encoding') || mp;
                form.setAttribute('target', id);
                if (!method || /post/i.test(method)) {
                    form.setAttribute('method', 'POST');
                }
                if (a != s.url) {
                    form.setAttribute('action', s.url);
                }
                if (!s.skipEncodingOverride && (!method || /post/i.test(method))) {
                    $form.attr({
                        encoding: 'multipart/form-data',
                        enctype: 'multipart/form-data'
                    });
                }
                if (s.timeout) {
                    timeoutHandle = setTimeout(function () {
                        timedOut = true;
                        cb(CLIENT_TIMEOUT_ABORT);
                    }, s.timeout);
                }
                function checkState() {
                    try {
                        var state = getDoc(io).readyState;
                        log('state = ' + state);
                        if (state && state.toLowerCase() == 'uninitialized') {
                            setTimeout(checkState, 50);
                        }
                    } catch (e) {
                        log('Server abort: ', e, ' (', e.name, ')');
                        cb(SERVER_ABORT);
                        if (timeoutHandle) {
                            clearTimeout(timeoutHandle);
                        }
                        timeoutHandle = undefined;
                    }
                }
                var extraInputs = [];
                try {
                    if (s.extraData) {
                        for (var n in s.extraData) {
                            if (s.extraData.hasOwnProperty(n)) {
                                if ($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
                                    extraInputs.push($('<input type="hidden" name="' + s.extraData[n].name + '">').val(s.extraData[n].value).appendTo(form)[0]);
                                } else {
                                    extraInputs.push($('<input type="hidden" name="' + n + '">').val(s.extraData[n]).appendTo(form)[0]);
                                }
                            }
                        }
                    }
                    if (!s.iframeTarget) {
                        $io.appendTo('body');
                    }
                    if (io.attachEvent) {
                        io.attachEvent('onload', cb);
                    } else {
                        io.addEventListener('load', cb, false);
                    }
                    setTimeout(checkState, 15);
                    try {
                        form.submit();
                    } catch (err) {
                        var submitFn = document.createElement('form').submit;
                        submitFn.apply(form);
                    }
                } finally {
                    form.setAttribute('action', a);
                    form.setAttribute('enctype', et);
                    if (t) {
                        form.setAttribute('target', t);
                    } else {
                        $form.removeAttr('target');
                    }
                    $(extraInputs).remove();
                }
            }
            if (s.forceSync) {
                doSubmit();
            } else {
                setTimeout(doSubmit, 10);
            }
            var data, doc, domCheckCount = 50, callbackProcessed;
            function cb(e) {
                if (xhr.aborted || callbackProcessed) {
                    return;
                }
                doc = getDoc(io);
                if (!doc) {
                    log('cannot access response document');
                    e = SERVER_ABORT;
                }
                if (e === CLIENT_TIMEOUT_ABORT && xhr) {
                    xhr.abort('timeout');
                    deferred.reject(xhr, 'timeout');
                    return;
                } else if (e == SERVER_ABORT && xhr) {
                    xhr.abort('server abort');
                    deferred.reject(xhr, 'error', 'server abort');
                    return;
                }
                if (!doc || doc.location.href == s.iframeSrc) {
                    if (!timedOut) {
                        return;
                    }
                }
                if (io.detachEvent) {
                    io.detachEvent('onload', cb);
                } else {
                    io.removeEventListener('load', cb, false);
                }
                var status = 'success', errMsg;
                try {
                    if (timedOut) {
                        throw 'timeout';
                    }
                    var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
                    log('isXml=' + isXml);
                    if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
                        if (--domCheckCount) {
                            log('requeing onLoad callback, DOM not available');
                            setTimeout(cb, 250);
                            return;
                        }
                    }
                    var docRoot = doc.body ? doc.body : doc.documentElement;
                    xhr.responseText = docRoot ? docRoot.innerHTML : null;
                    xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                    if (isXml) {
                        s.dataType = 'xml';
                    }
                    xhr.getResponseHeader = function (header) {
                        var headers = { 'content-type': s.dataType };
                        return headers[header.toLowerCase()];
                    };
                    if (docRoot) {
                        xhr.status = Number(docRoot.getAttribute('status')) || xhr.status;
                        xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
                    }
                    var dt = (s.dataType || '').toLowerCase();
                    var scr = /(json|script|text)/.test(dt);
                    if (scr || s.textarea) {
                        var ta = doc.getElementsByTagName('textarea')[0];
                        if (ta) {
                            xhr.responseText = ta.value;
                            xhr.status = Number(ta.getAttribute('status')) || xhr.status;
                            xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;
                        } else if (scr) {
                            var pre = doc.getElementsByTagName('pre')[0];
                            var b = doc.getElementsByTagName('body')[0];
                            if (pre) {
                                xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
                            } else if (b) {
                                xhr.responseText = b.textContent ? b.textContent : b.innerText;
                            }
                        }
                    } else if (dt == 'xml' && !xhr.responseXML && xhr.responseText) {
                        xhr.responseXML = toXml(xhr.responseText);
                    }
                    try {
                        data = httpData(xhr, dt, s);
                    } catch (err) {
                        status = 'parsererror';
                        xhr.error = errMsg = err || status;
                    }
                } catch (err) {
                    log('error caught: ', err);
                    status = 'error';
                    xhr.error = errMsg = err || status;
                }
                if (xhr.aborted) {
                    log('upload aborted');
                    status = null;
                }
                if (xhr.status) {
                    status = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ? 'success' : 'error';
                }
                if (status === 'success') {
                    if (s.success) {
                        s.success.call(s.context, data, 'success', xhr);
                    }
                    deferred.resolve(xhr.responseText, 'success', xhr);
                    if (g) {
                        $.event.trigger('ajaxSuccess', [
                            xhr,
                            s
                        ]);
                    }
                } else if (status) {
                    if (errMsg === undefined) {
                        errMsg = xhr.statusText;
                    }
                    if (s.error) {
                        s.error.call(s.context, xhr, status, errMsg);
                    }
                    deferred.reject(xhr, 'error', errMsg);
                    if (g) {
                        $.event.trigger('ajaxError', [
                            xhr,
                            s,
                            errMsg
                        ]);
                    }
                }
                if (g) {
                    $.event.trigger('ajaxComplete', [
                        xhr,
                        s
                    ]);
                }
                if (g && !--$.active) {
                    $.event.trigger('ajaxStop');
                }
                if (s.complete) {
                    s.complete.call(s.context, xhr, status);
                }
                callbackProcessed = true;
                if (s.timeout) {
                    clearTimeout(timeoutHandle);
                }
                setTimeout(function () {
                    if (!s.iframeTarget) {
                        $io.remove();
                    } else {
                        $io.attr('src', s.iframeSrc);
                    }
                    xhr.responseXML = null;
                }, 100);
            }
            var toXml = $.parseXML || function (s, doc) {
                if (window.ActiveXObject) {
                    doc = new ActiveXObject('Microsoft.XMLDOM');
                    doc.async = 'false';
                    doc.loadXML(s);
                } else {
                    doc = new DOMParser().parseFromString(s, 'text/xml');
                }
                return doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror' ? doc : null;
            };
            var parseJSON = $.parseJSON || function (s) {
                return window['eval']('(' + s + ')');
            };
            var httpData = function (xhr, type, s) {
                var ct = xhr.getResponseHeader('content-type') || '', xml = type === 'xml' || !type && ct.indexOf('xml') >= 0, data = xml ? xhr.responseXML : xhr.responseText;
                if (xml && data.documentElement.nodeName === 'parsererror') {
                    if ($.error) {
                        $.error('parsererror');
                    }
                }
                if (s && s.dataFilter) {
                    data = s.dataFilter(data, type);
                }
                if (typeof data === 'string') {
                    if (type === 'json' || !type && ct.indexOf('json') >= 0) {
                        data = parseJSON(data);
                    } else if (type === 'script' || !type && ct.indexOf('javascript') >= 0) {
                        $.globalEval(data);
                    }
                }
                return data;
            };
            return deferred;
        }
    };
    $.fn.ajaxForm = function (options) {
        options = options || {};
        options.delegation = options.delegation && $.isFunction($.fn.on);
        if (!options.delegation && this.length === 0) {
            var o = {
                s: this.selector,
                c: this.context
            };
            if (!$.isReady && o.s) {
                log('DOM not ready, queuing ajaxForm');
                $(function () {
                    $(o.s, o.c).ajaxForm(options);
                });
                return this;
            }
            log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
            return this;
        }
        if (options.delegation) {
            $(document).off('submit.form-plugin', this.selector, doAjaxSubmit).off('click.form-plugin', this.selector, captureSubmittingElement).on('submit.form-plugin', this.selector, options, doAjaxSubmit).on('click.form-plugin', this.selector, options, captureSubmittingElement);
            return this;
        }
        return this.ajaxFormUnbind().bind('submit.form-plugin', options, doAjaxSubmit).bind('click.form-plugin', options, captureSubmittingElement);
    };
    function doAjaxSubmit(e) {
        var options = e.data;
        if (!e.isDefaultPrevented()) {
            e.preventDefault();
            $(e.target).ajaxSubmit(options);
        }
    }
    function captureSubmittingElement(e) {
        var target = e.target;
        var $el = $(target);
        if (!$el.is('[type=submit],[type=image]')) {
            var t = $el.closest('[type=submit]');
            if (t.length === 0) {
                return;
            }
            target = t[0];
        }
        var form = this;
        form.clk = target;
        if (target.type == 'image') {
            if (e.offsetX !== undefined) {
                form.clk_x = e.offsetX;
                form.clk_y = e.offsetY;
            } else if (typeof $.fn.offset == 'function') {
                var offset = $el.offset();
                form.clk_x = e.pageX - offset.left;
                form.clk_y = e.pageY - offset.top;
            } else {
                form.clk_x = e.pageX - target.offsetLeft;
                form.clk_y = e.pageY - target.offsetTop;
            }
        }
        setTimeout(function () {
            form.clk = form.clk_x = form.clk_y = null;
        }, 100);
    }
    $.fn.ajaxFormUnbind = function () {
        return this.unbind('submit.form-plugin click.form-plugin');
    };
    $.fn.formToArray = function (semantic, elements) {
        var a = [];
        if (this.length === 0) {
            return a;
        }
        var form = this[0];
        var formId = this.attr('id');
        var els = semantic ? form.getElementsByTagName('*') : form.elements;
        var els2;
        if (els && !/MSIE [678]/.test(navigator.userAgent)) {
            els = $(els).get();
        }
        if (formId) {
            els2 = $(':input[form="' + formId + '"]').get();
            if (els2.length) {
                els = (els || []).concat(els2);
            }
        }
        if (!els || !els.length) {
            return a;
        }
        var i, j, n, v, el, max, jmax;
        for (i = 0, max = els.length; i < max; i++) {
            el = els[i];
            n = el.name;
            if (!n || el.disabled) {
                continue;
            }
            if (semantic && form.clk && el.type == 'image') {
                if (form.clk == el) {
                    a.push({
                        name: n,
                        value: $(el).val(),
                        type: el.type
                    });
                    a.push({
                        name: n + '.x',
                        value: form.clk_x
                    }, {
                        name: n + '.y',
                        value: form.clk_y
                    });
                }
                continue;
            }
            v = $.fieldValue(el, true);
            if (v && v.constructor == Array) {
                if (elements) {
                    elements.push(el);
                }
                for (j = 0, jmax = v.length; j < jmax; j++) {
                    a.push({
                        name: n,
                        value: v[j]
                    });
                }
            } else if (feature.fileapi && el.type == 'file') {
                if (elements) {
                    elements.push(el);
                }
                var files = el.files;
                if (files.length) {
                    for (j = 0; j < files.length; j++) {
                        a.push({
                            name: n,
                            value: files[j],
                            type: el.type
                        });
                    }
                } else {
                    a.push({
                        name: n,
                        value: '',
                        type: el.type
                    });
                }
            } else if (v !== null && typeof v != 'undefined') {
                if (elements) {
                    elements.push(el);
                }
                a.push({
                    name: n,
                    value: v,
                    type: el.type,
                    required: el.required
                });
            }
        }
        if (!semantic && form.clk) {
            var $input = $(form.clk), input = $input[0];
            n = input.name;
            if (n && !input.disabled && input.type == 'image') {
                a.push({
                    name: n,
                    value: $input.val()
                });
                a.push({
                    name: n + '.x',
                    value: form.clk_x
                }, {
                    name: n + '.y',
                    value: form.clk_y
                });
            }
        }
        return a;
    };
    $.fn.formSerialize = function (semantic) {
        return $.param(this.formToArray(semantic));
    };
    $.fn.fieldSerialize = function (successful) {
        var a = [];
        this.each(function () {
            var n = this.name;
            if (!n) {
                return;
            }
            var v = $.fieldValue(this, successful);
            if (v && v.constructor == Array) {
                for (var i = 0, max = v.length; i < max; i++) {
                    a.push({
                        name: n,
                        value: v[i]
                    });
                }
            } else if (v !== null && typeof v != 'undefined') {
                a.push({
                    name: this.name,
                    value: v
                });
            }
        });
        return $.param(a);
    };
    $.fn.fieldValue = function (successful) {
        for (var val = [], i = 0, max = this.length; i < max; i++) {
            var el = this[i];
            var v = $.fieldValue(el, successful);
            if (v === null || typeof v == 'undefined' || v.constructor == Array && !v.length) {
                continue;
            }
            if (v.constructor == Array) {
                $.merge(val, v);
            } else {
                val.push(v);
            }
        }
        return val;
    };
    $.fieldValue = function (el, successful) {
        var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
        if (successful === undefined) {
            successful = true;
        }
        if (successful && (!n || el.disabled || t == 'reset' || t == 'button' || (t == 'checkbox' || t == 'radio') && !el.checked || (t == 'submit' || t == 'image') && el.form && el.form.clk != el || tag == 'select' && el.selectedIndex == -1)) {
            return null;
        }
        if (tag == 'select') {
            var index = el.selectedIndex;
            if (index < 0) {
                return null;
            }
            var a = [], ops = el.options;
            var one = t == 'select-one';
            var max = one ? index + 1 : ops.length;
            for (var i = one ? index : 0; i < max; i++) {
                var op = ops[i];
                if (op.selected) {
                    var v = op.value;
                    if (!v) {
                        v = op.attributes && op.attributes.value && !op.attributes.value.specified ? op.text : op.value;
                    }
                    if (one) {
                        return v;
                    }
                    a.push(v);
                }
            }
            return a;
        }
        return $(el).val();
    };
    $.fn.clearForm = function (includeHidden) {
        return this.each(function () {
            $('input,select,textarea', this).clearFields(includeHidden);
        });
    };
    $.fn.clearFields = $.fn.clearInputs = function (includeHidden) {
        var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;
        return this.each(function () {
            var t = this.type, tag = this.tagName.toLowerCase();
            if (re.test(t) || tag == 'textarea') {
                this.value = '';
            } else if (t == 'checkbox' || t == 'radio') {
                this.checked = false;
            } else if (tag == 'select') {
                this.selectedIndex = -1;
            } else if (t == 'file') {
                if (/MSIE/.test(navigator.userAgent)) {
                    $(this).replaceWith($(this).clone(true));
                } else {
                    $(this).val('');
                }
            } else if (includeHidden) {
                if (includeHidden === true && /hidden/.test(t) || typeof includeHidden == 'string' && $(this).is(includeHidden)) {
                    this.value = '';
                }
            }
        });
    };
    $.fn.resetForm = function () {
        return this.each(function () {
            if (typeof this.reset == 'function' || typeof this.reset == 'object' && !this.reset.nodeType) {
                this.reset();
            }
        });
    };
    $.fn.enable = function (b) {
        if (b === undefined) {
            b = true;
        }
        return this.each(function () {
            this.disabled = !b;
        });
    };
    $.fn.selected = function (select) {
        if (select === undefined) {
            select = true;
        }
        return this.each(function () {
            var t = this.type;
            if (t == 'checkbox' || t == 'radio') {
                this.checked = select;
            } else if (this.tagName.toLowerCase() == 'option') {
                var $sel = $(this).parent('select');
                if (select && $sel[0] && $sel[0].type == 'select-one') {
                    $sel.find('option').selected(false);
                }
                this.selected = select;
            }
        });
    };
    $.fn.ajaxSubmit.debug = false;
    function log() {
        if (!$.fn.ajaxSubmit.debug) {
            return;
        }
        var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');
        if (window.console && window.console.log) {
            window.console.log(msg);
        } else if (window.opera && window.opera.postError) {
            window.opera.postError(msg);
        }
    }
}));
define('Static/js/comsys/widget/ProtoUpload', [
    'Core',
    'Class',
    'Static/js/comsys/base/Base',
    'Static/js/common/client/ComsysFileReader',
    'Static/js/libs/jquery.form/jquery.form'
], function (Core, Class, Base, FileReader) {
    var ClassName = 'Control.ProtoUpload';
    var ProtoUpload = Class(ClassName, {
        constructor: function (args) {
            this.callParent(args);
            this.$element = $(args.element);
        },
        initialize: function () {
            var that = this;
            var $this = this.$element;
            var fileReader = new FileReader();
            var $target = that.setting.target ? $('#' + that.setting.target) : null;
            var callback = that.setting.onuploaded ? new Function('isNew', 'image', 'if(' + that.setting.onuploaded + ') ' + that.setting.onuploaded + '(isNew, image);') : function () {
            };
            if ($this.data(ClassName) == undefined) {
                var $wrap = this.$wrap = $('<div class="comsys-base comsys-ProtoUpload"></div>');
                var $form = $('<form enctype="multipart/form-data" method="POST"></form>');
                $form.appendTo($wrap);
                $this.before($wrap).appendTo($form);
                $this.off('.ProtoUploadfocus').on('focus', function () {
                    $wrap.addClass('focus-outerline');
                }).on('focusout.ProtoUploadfocus', function () {
                    $wrap.removeClass('focus-outerline');
                });
                $this.off('.ProtoUploadChangeEvent').on('change.ProtoUploadChangeEvent', function () {
                    var isNew = $wrap.find('img').length == 0;
                    fileReader.read($this.get(0)).then(function (image) {
                        var o = new Image();
                        o.onload = function () {
                            $wrap.find('img').remove();
                            if (o.width > o.height) {
                                o.style.width = '100%';
                            } else {
                                o.style.height = '100%';
                            }
                            $wrap.append(o);
                        };
                        o.src = image;
                        if ($target)
                            $target.val(image);
                        callback(isNew, image);
                    }).fail(function (message) {
                        if ($target)
                            $target.val('');
                        callback(isNew, '');
                    });
                });
                $this.data(ClassName, this);
            }
        }
    }, Base);
    $.fn.extend({
        ProtoUploadInit: function () {
            return this.each(function () {
                new ProtoUpload({
                    element: this,
                    setting: {
                        target: $(this).attr('cs-target') || '',
                        onuploaded: $(this).attr('cs-onuploaded') || ''
                    }
                }).initialize();
            }).removeAttr('cs-control');
            ;
        }
    });
    return ProtoUpload;
});
require.config({ baseUrl: './' });
var WebApi = {};
define('Static/js/application', [
    'Content/js/common/util',
    'Static/js/common/client/Request',
    'css',
    'text',
    'Static/js/libs/jquery.easing/jquery.easing',
    'Static/js/comsys/widget/CheckBox',
    'Static/js/comsys/widget/RadioBox',
    'Static/js/comsys/widget/SingleCombox',
    'Static/js/comsys/widget/ButtonTextBox',
    'Static/js/comsys/widget/DataPicker',
    'Static/js/comsys/widget/ProtoUpload'
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
    var resizeTimer = null;
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
                    },
                    stoped: function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXRpYy9qcy9jb21tb24vY2xpZW50L1JlcXVlc3QuanMiLCJTdGF0aWMvanMvbGlicy9yZXF1aXJlLWNzcy9jc3MuanMiLCJTdGF0aWMvanMvbGlicy9yZXF1aXJlLXRleHQvdGV4dC5qcyIsIlN0YXRpYy9qcy9saWJzL2pxdWVyeS5lYXNpbmcvanF1ZXJ5LmVhc2luZy5qcyIsIlN0YXRpYy9qcy9jb21tb24vY29yZS9DbGFzcy5qcyIsIlN0YXRpYy9qcy9jb21tb24vY29yZS9Db3JlLmpzIiwiU3RhdGljL2pzL2NvbW1vbi9jb3JlL0d1aWQuanMiLCJTdGF0aWMvanMvY29tc3lzL2Jhc2UvQmFzZS5qcyIsIlN0YXRpYy9qcy9jb21zeXMvd2lkZ2V0L2Jhc2VDbGFzcy9XaWRnZXRCYXNlLmpzIiwiU3RhdGljL2pzL2NvbW1vbi9zZXR0aW5nLmpzIiwiU3RhdGljL2pzL2NvbXN5cy93aWRnZXQvYmFzZUNsYXNzL0xhYmVsQmFzZS5qcyIsIlN0YXRpYy9qcy9jb21zeXMvd2lkZ2V0L0NoZWNrQm94LmpzIiwiU3RhdGljL2pzL2NvbXN5cy93aWRnZXQvUmFkaW9Cb3guanMiLCJTdGF0aWMvanMvY29tbW9uL2VuZ2luZS90cGxFbmdpbmUuanMiLCJTdGF0aWMvanMvY29tc3lzL3dpZGdldC9iYXNlQ2xhc3MvSGlkZGVuQmFzZS5qcyIsIlN0YXRpYy9qcy9saWJzL2pxdWVyeS5tb3VzZXdoZWVsL2pxdWVyeS5tb3VzZXdoZWVsLmpzIiwiU3RhdGljL2pzL2NvbXN5cy93aWRnZXQvU2luZ2xlQ29tYm94LmpzIiwiU3RhdGljL2pzL2NvbXN5cy93aWRnZXQvQnV0dG9uVGV4dEJveC5qcyIsIlN0YXRpYy9qcy9saWJzL3dkYXRlLnBpY2tlci9XZGF0ZVBpY2tlci5qcyIsIlN0YXRpYy9qcy9jb21zeXMvd2lkZ2V0L0RhdGFQaWNrZXIuanMiLCJTdGF0aWMvanMvY29tbW9uL2NsaWVudC9Db21zeXNGaWxlUmVhZGVyLmpzIiwiU3RhdGljL2pzL2xpYnMvanF1ZXJ5LmZvcm0vanF1ZXJ5LmZvcm0uanMiLCJTdGF0aWMvanMvY29tc3lzL3dpZGdldC9Qcm90b1VwbG9hZC5qcyIsIlN0YXRpYy9qcy9hcHBsaWNhdGlvbi5qcyIsIkNvbnRlbnQvanMvbW9kdWxlc19iYXNlL2xvZ2luLmpzIl0sIm5hbWVzIjpbImRlZmluZSIsInJlcXVlc3QiLCJwcyIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwicmVnIiwibSIsImV4ZWMiLCJsb2FkIiwibiIsInIiLCJoZWFkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImVuZ2luZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwidXNlSW1wb3J0TG9hZCIsInVzZU9ubG9hZCIsInBhcnNlSW50IiwiY3NzQVBJIiwicGx1Z2luQnVpbGRlciIsImN1clN0eWxlIiwiY3VyU2hlZXQiLCJjcmVhdGVTdHlsZSIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsInN0eWxlU2hlZXQiLCJzaGVldCIsImllQ250IiwiaWVMb2FkcyIsImllQ3VyQ2FsbGJhY2siLCJjcmVhdGVJZUxvYWQiLCJ1cmwiLCJhZGRJbXBvcnQiLCJvbmxvYWQiLCJwcm9jZXNzSWVMb2FkIiwibmV4dExvYWQiLCJzaGlmdCIsImltcG9ydExvYWQiLCJjYWxsYmFjayIsInB1c2giLCJ0ZXh0Q29udGVudCIsImxvYWRJbnRlcnZhbCIsInNldEludGVydmFsIiwiY3NzUnVsZXMiLCJjbGVhckludGVydmFsIiwiZSIsImxpbmtMb2FkIiwibGluayIsInR5cGUiLCJyZWwiLCJzZXRUaW1lb3V0IiwiaSIsInN0eWxlU2hlZXRzIiwibGVuZ3RoIiwiaHJlZiIsIm5vcm1hbGl6ZSIsIm5hbWUiLCJzdWJzdHIiLCJjc3NJZCIsInJlcSIsImNvbmZpZyIsInRvVXJsIiwibW9kdWxlIiwidGV4dCIsImZzIiwiQ2MiLCJDaSIsInhwY0lzV2luZG93cyIsInByb2dJZHMiLCJ4bWxSZWdFeHAiLCJib2R5UmVnRXhwIiwiaGFzTG9jYXRpb24iLCJkZWZhdWx0UHJvdG9jb2wiLCJwcm90b2NvbCIsInJlcGxhY2UiLCJkZWZhdWx0SG9zdE5hbWUiLCJob3N0bmFtZSIsImRlZmF1bHRQb3J0IiwicG9ydCIsInVuZGVmaW5lZCIsImJ1aWxkTWFwIiwibWFzdGVyQ29uZmlnIiwidmVyc2lvbiIsInN0cmlwIiwiY29udGVudCIsIm1hdGNoZXMiLCJqc0VzY2FwZSIsImNyZWF0ZVhociIsInhociIsInByb2dJZCIsIlhNTEh0dHBSZXF1ZXN0IiwiQWN0aXZlWE9iamVjdCIsInBhcnNlTmFtZSIsIm1vZE5hbWUiLCJleHQiLCJ0ZW1wIiwiaW5kZXgiLCJpbmRleE9mIiwiaXNSZWxhdGl2ZSIsInN1YnN0cmluZyIsIm1vZHVsZU5hbWUiLCJ4ZFJlZ0V4cCIsInVzZVhociIsInVQcm90b2NvbCIsInVIb3N0TmFtZSIsInVQb3J0Iiwic3BsaXQiLCJ0b0xvd2VyQ2FzZSIsImZpbmlzaExvYWQiLCJvbkxvYWQiLCJpc0J1aWxkIiwiaW5saW5lVGV4dCIsInBhcnNlZCIsIm5vblN0cmlwTmFtZSIsImdldCIsImVyciIsImVycm9yIiwid3JpdGUiLCJwbHVnaW5OYW1lIiwiaGFzT3duUHJvcGVydHkiLCJhc01vZHVsZSIsIndyaXRlRmlsZSIsImV4dFBhcnQiLCJmaWxlTmFtZSIsInZhbHVlIiwidGV4dFdyaXRlIiwiY29udGVudHMiLCJlbnYiLCJwcm9jZXNzIiwidmVyc2lvbnMiLCJub2RlIiwicmVxdWlyZSIsIm5vZGVSZXF1aXJlIiwiZXJyYmFjayIsImZpbGUiLCJyZWFkRmlsZVN5bmMiLCJoZWFkZXJzIiwiaGVhZGVyIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJvblhociIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsImV2dCIsInN0YXR1cyIsInJlYWR5U3RhdGUiLCJFcnJvciIsInJlc3BvbnNlVGV4dCIsIm9uWGhyQ29tcGxldGUiLCJzZW5kIiwiUGFja2FnZXMiLCJqYXZhIiwic3RyaW5nQnVmZmVyIiwibGluZSIsImVuY29kaW5nIiwiaW8iLCJGaWxlIiwibGluZVNlcGFyYXRvciIsImxhbmciLCJTeXN0ZW0iLCJnZXRQcm9wZXJ0eSIsImlucHV0IiwiQnVmZmVyZWRSZWFkZXIiLCJJbnB1dFN0cmVhbVJlYWRlciIsIkZpbGVJbnB1dFN0cmVhbSIsIlN0cmluZ0J1ZmZlciIsInJlYWRMaW5lIiwiY2hhckF0IiwiYXBwZW5kIiwiU3RyaW5nIiwidG9TdHJpbmciLCJjbG9zZSIsIkNvbXBvbmVudHMiLCJjbGFzc2VzIiwiaW50ZXJmYWNlcyIsInV0aWxzIiwiaW5TdHJlYW0iLCJjb252ZXJ0U3RyZWFtIiwiZmlsZU9iaiIsInJlYWREYXRhIiwiRmlsZVV0aWxzIiwiY3JlYXRlSW5zdGFuY2UiLCJuc0lGaWxlSW5wdXRTdHJlYW0iLCJpbml0IiwibnNJQ29udmVydGVySW5wdXRTdHJlYW0iLCJhdmFpbGFibGUiLCJERUZBVUxUX1JFUExBQ0VNRU5UX0NIQVJBQ1RFUiIsInJlYWRTdHJpbmciLCJwYXRoIiwicm9vdCIsImZhY3RvcnkiLCJhbWQiLCJqUXVlcnkiLCJaZXB0byIsIiQiLCJleHRlbmQiLCJlYXNpbmciLCJkZWYiLCJzd2luZyIsIngiLCJ0IiwiYiIsImMiLCJkIiwiZWFzZUluUXVhZCIsImVhc2VPdXRRdWFkIiwiZWFzZUluT3V0UXVhZCIsImVhc2VJbkN1YmljIiwiZWFzZU91dEN1YmljIiwiZWFzZUluT3V0Q3ViaWMiLCJlYXNlSW5RdWFydCIsImVhc2VPdXRRdWFydCIsImVhc2VJbk91dFF1YXJ0IiwiZWFzZUluUXVpbnQiLCJlYXNlT3V0UXVpbnQiLCJlYXNlSW5PdXRRdWludCIsImVhc2VJblNpbmUiLCJNYXRoIiwiY29zIiwiUEkiLCJlYXNlT3V0U2luZSIsInNpbiIsImVhc2VJbk91dFNpbmUiLCJlYXNlSW5FeHBvIiwicG93IiwiZWFzZU91dEV4cG8iLCJlYXNlSW5PdXRFeHBvIiwiZWFzZUluQ2lyYyIsInNxcnQiLCJlYXNlT3V0Q2lyYyIsImVhc2VJbk91dENpcmMiLCJlYXNlSW5FbGFzdGljIiwicyIsInAiLCJhIiwiYWJzIiwiYXNpbiIsImVhc2VPdXRFbGFzdGljIiwiZWFzZUluT3V0RWxhc3RpYyIsImVhc2VJbkJhY2siLCJlYXNlT3V0QmFjayIsImVhc2VJbk91dEJhY2siLCJlYXNlSW5Cb3VuY2UiLCJlYXNlT3V0Qm91bmNlIiwiZWFzZUluT3V0Qm91bmNlIiwiQ2xhc3NMaWJyYXJ5IiwiQ2xhc3NlcyIsIl9jYWxsUGFyZW50IiwiYXJndW1lbnRzIiwiY2FsbGVlIiwiY2FsbGVyIiwiZm4iLCJhcHBseSIsIl9pc0RvbnRFbnVtIiwia2V5IiwiY29uc3RydWN0b3IiLCJfZXh0ZW5kIiwiaXNSZWN1cnNpb24iLCJrIiwiY3VycmVudCIsImN0eXBlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiQ2xhc3MiLCJzdWIiLCJtZXRob2QiLCJzdXAiLCJhcmVhIiwic3BhY2UiLCJyZXZlcnNlIiwicG9wIiwic3ViY2xhc3NQcm90byIsImNyZWF0ZSIsIlN1cGVyIiwiY2FsbFBhcmVudCIsImNvcmUiLCJkZSIsImV4Y2VwdCIsIm8iLCJpbm5lciIsIm9iaiIsImV4cG9ydHMiLCJHdWlkIiwiZyIsImFyciIsIkFycmF5IiwiSW5pdEJ5U3RyaW5nIiwiSW5pdEJ5T3RoZXIiLCJFcXVhbHMiLCJJc0d1aWQiLCJUb1N0cmluZyIsImZvcm1hdCIsIlRvU3RyaW5nV2l0aEZvcm1hdCIsInN0ciIsInNsaWNlIiwiRW1wdHkiLCJOZXdHdWlkIiwiZmxvb3IiLCJyYW5kb20iLCJDb3JlIiwiQ2xhc3NOYW1lIiwiYXJncyIsInNldHRpbmciLCJjbGFzc2lkcyIsImluaXRpYWxpemUiLCJCYXNlIiwiJEJhc2VFbCIsImVsZW1lbnQiLCJhdHRyIiwiY29tbW9uc2V0dGluZyIsInUiLCJsYXllclNldHRpbmciLCJkZWJ1ZyIsIkxhYmVsU2V0dGluZyIsInNldCIsIm5vZGVOYW1lIiwibm9kZVZhbHVlIiwiaW5uZXJIVE1MIiwiZ2V0Tm9kZSIsInRlc3QiLCJjcmVhdGVUZXh0Tm9kZSIsIm5leHRTaWJsaW5nIiwiRWZmZWN0IiwiQnJvd3NlciIsImlzT3BlcmEiLCJpc0lFIiwiaXNGRiIsImlzU2FmYXJpIiwiaXNDaHJvbWUiLCJpc0VkZ2UiLCJJRVZlcnNpb24iLCJSZWdFeHAiLCIkMSIsIiQyIiwiTmF2aWdhdG9yIiwiTG93SUVPck5vSUUiLCJJc0lFOCIsIklzQmFja0NvbXBhdCIsImNvbXBhdE1vZGUiLCJXaWRnZXRCYXNlIiwiU2V0dGluZyIsImlkIiwiJExhYmVsVGV4dCIsInBhcmVudCIsImZpbmQiLCIkTGFiZWxDb250YWluZXIiLCJtb3ZlTGFiZWwiLCJ3cmFwTGFiZWwiLCJkYXRhIiwiYWZ0ZXIiLCJhcHBlbmRUbyIsIiRwYXJlbnQiLCJub2RlcyIsImNoaWxkTm9kZXMiLCJ0cmltIiwicHJlcGVuZCIsImFkZENsYXNzIiwibGFiZWwiLCJvbiIsIm9mZiIsImlzIiwiTGFiZWxCYXNlIiwiQ2hlY2tCb3giLCIkQ2hlY2tCb3hFbCIsInRoYXQiLCIkdGhpcyIsImJ1dHRvbnR5cGUiLCIkQ2hlY2tCb3hDb250cm9sIiwiY2hlY2tlZCIsIiR3cmFwIiwiYmVmb3JlIiwiaXNEb2N1bWVudEJpbmQiLCJjaGVja2VkQ2hhbmdlIiwic3RhdGUiLCJTZXREaXNhYmxlZCIsInJlbW92ZUF0dHIiLCJyZW1vdmVDbGFzcyIsIlNldENoZWNrIiwiZWwiLCJkZXN0b3J5IiwicmVtb3ZlIiwicmVtb3ZlRGF0YSIsIkNoZWNrQm94SW5pdCIsImVhY2giLCJSYWRpb0JveCIsIiRSYWRpb0JveEVsIiwiJGdyb3VwIiwiJFJhZGlvQm94Q29udHJvbCIsIm5vdCIsInRyaWdnZXIiLCJSYWRpb0JveEluaXQiLCJUUExFbmdpbmUiLCJyZW5kZXIiLCJ0cGwiLCJkcmF3IiwiZHJhd2xheW91dCIsInJlZ1JlbmRlciIsImNvZGUiLCJwYXJhbSIsInBhcnQiLCJGdW5jdGlvbiIsInJlZ091dCIsImN1cnNvciIsImFkZCIsImpzIiwic2VjdGlvbiIsIml0ZW0iLCJqb2luIiwiJEhpZGRlbkJhc2VFbENvbnRhaW5lciIsImFkZFBsYWNlSG9sZGVyQmVmb3JlIiwiY2FsbCIsImFkZFBsYWNlSG9sZGVyQWZ0ZXIiLCJhZGRQbGFjZUhvbGRlciIsInRhcmdldCIsInRvRml4IiwidG9CaW5kIiwiZG9jdW1lbnRNb2RlIiwibnVsbExvd2VzdERlbHRhVGltZW91dCIsImxvd2VzdERlbHRhIiwiZXZlbnQiLCJmaXhIb29rcyIsIm1vdXNlSG9va3MiLCJzcGVjaWFsIiwibW91c2V3aGVlbCIsInNldHVwIiwiYWRkRXZlbnRMaXN0ZW5lciIsImhhbmRsZXIiLCJvbm1vdXNld2hlZWwiLCJnZXRMaW5lSGVpZ2h0IiwiZ2V0UGFnZUhlaWdodCIsInRlYXJkb3duIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImVsZW0iLCIkZWxlbSIsImNzcyIsImhlaWdodCIsInNldHRpbmdzIiwiYWRqdXN0T2xkRGVsdGFzIiwibm9ybWFsaXplT2Zmc2V0IiwiYmluZCIsInVubW91c2V3aGVlbCIsInVuYmluZCIsIm9yZ0V2ZW50IiwiZGVsdGEiLCJkZWx0YVgiLCJkZWx0YVkiLCJhYnNEZWx0YSIsIm9mZnNldFgiLCJvZmZzZXRZIiwiZml4IiwiZGV0YWlsIiwid2hlZWxEZWx0YSIsIndoZWVsRGVsdGFZIiwid2hlZWxEZWx0YVgiLCJheGlzIiwiSE9SSVpPTlRBTF9BWElTIiwiZGVsdGFNb2RlIiwibGluZUhlaWdodCIsInBhZ2VIZWlnaHQiLCJtYXgiLCJzaG91bGRBZGp1c3RPbGREZWx0YXMiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJib3VuZGluZ1JlY3QiLCJjbGllbnRYIiwibGVmdCIsImNsaWVudFkiLCJ0b3AiLCJkZWx0YUZhY3RvciIsInVuc2hpZnQiLCJjbGVhclRpbWVvdXQiLCJudWxsTG93ZXN0RGVsdGEiLCJkaXNwYXRjaCIsImhhbmRsZSIsIkhpZGRlbkJhc2UiLCJTaW5nbGVDb21ib3giLCIkZWxlbWVudCIsImJvZHkiLCJkcm9wTGVuZ3RoIiwic3R5bGUiLCJkaXNwbGF5IiwiT25PcHRpb25DaGFuZ2UiLCJvbkNoYW5nZSIsIm9uY2hhbmdlIiwiVGltZXIiLCJpc0lubmVyTW91c2VXaGVlbCIsImdlbmVyYXRlIiwiJGNvbnRyb2xsZXIiLCJUUEwiLCJsYXlvdXQiLCJtYWluIiwiZHJvcCIsIm9wdGlvbiIsImtleUNvZGUiLCJTUEFDRSIsIkVOVEVSIiwiRE9XTiIsIlVQIiwiU0hPVyIsIlRISVMiLCJvcHRpb25zIiwicGFyZW50Tm9kZSIsIiRkcm9wIiwiJGlucHV0IiwiZml4ZWQiLCJwb3NpdGlvbiIsIlJlQmluZCIsIlJlTG9hZCIsIk9uRHJvcENsaWNrIiwiT25PdGhlckNsaWNrIiwiT25CdXR0b25DbGljayIsImRlbGVnYXRlIiwiT25LZXlEb3duIiwiT25Nb3VzZVdoZWVsIiwiT25Gb2N1c091dCIsIk9uT3B0aW9uQ2xpY2siLCJwYXJlbnRFbGVtZW50IiwiU2VsZWN0ZWRJbmRleCIsImh0bWwiLCJzY3JvbGxlciIsInN0b3BQcm9wYWdhdGlvbiIsIm91dGVySGVpZ2h0Iiwic2Nyb2xsVG9wIiwic2VsZWN0ZWRJbmRleCIsInZhbCIsInNlbGVjdGVkIiwiRHJvcEhpZGUiLCJjdXJyZW50VGFyZ2V0IiwiZGVsZWdhdGVUYXJnZXQiLCJ0b0VsZW1lbnQiLCJjYW5jZWxGb2N1c091dCIsInNjcm9sbEhlaWdodCIsIm9mZnNldEhlaWdodCIsImhpZGUiLCJMYXN0S2V5IiwiVW5SdW50aW1lQmluZFNjcm9sbCIsInBsYWNlaG9sZGVyIiwicmVwbGFjZVdpdGgiLCJWYWx1ZSIsIk9uT3RoZXJBcmVhQ2xpY2siLCIkdCIsIiRkIiwiY2xvc2VzdCIsIiRsIiwiJGRpZCIsIiR0ZGlkIiwiJGxpZCIsIiR0bGlkIiwiU2V0UG9zaXRpb24iLCJvZmZzZXQiLCJPZmZzZXQiLCJjb250cm9sSGVpZ2h0IiwiY29udHJvbFdpZHRoIiwib3V0ZXJXaWR0aCIsIndpbkhlaWdodCIsIndpbldpZHRoIiwid2lkdGgiLCJkcm9wSGVpZ2h0IiwicnVudGltZWRyb3BIZWlnaHQiLCJpc2JvdHRvbSIsIm1heEhlaWdodCIsInNob3ciLCJtaW5XaWR0aCIsIm1heFdpZHRoIiwiUnVudGltZUJpbmQiLCJpc0ZpbHRlciIsImlzUmFuZ2UiLCJkaXNhYmxlZCIsImZvY3VzIiwiZW5kIiwiT3B0aW9uUG9zaXRpb24iLCJvZmZzZXRUb3AiLCJGVGltZXIiLCJTZWFyY2giLCIkb2JqIiwicmUiLCJTaW5nbGVDb21ib3hJbml0IiwiQnV0dG9uVGV4dEJveCIsIiRCdXR0b25UZXh0Qm94RWwiLCJCdXR0b25DbGFzcyIsIiRCdXR0b25UZXh0Qm94Q29udHJvbGxlciIsIkJ1dHRvblRleHRCb3hJbml0IiwiJGRwIiwiV2RhdGVQaWNrZXIiLCIkbGFuZ0xpc3QiLCJjaGFyc2V0IiwiJHNraW5MaXN0IiwiJHdkYXRlIiwiJGNyb3NzRnJhbWUiLCIkcHJlTG9hZCIsIiRkcFBhdGgiLCJkb3VibGVDYWxlbmRhciIsImVuYWJsZUtleWJvYXJkIiwiZW5hYmxlSW5wdXRNYXNrIiwiYXV0b1VwZGF0ZU9uQ2hhbmdlZCIsIndlZWtNZXRob2QiLCJza2luIiwiZGF0ZUZtdCIsInJlYWxEYXRlRm10IiwicmVhbFRpbWVGbXQiLCJyZWFsRnVsbEZtdCIsIm1pbkRhdGUiLCJtYXhEYXRlIiwic3RhcnREYXRlIiwiYWx3YXlzVXNlU3RhcnREYXRlIiwieWVhck9mZnNldCIsImZpcnN0RGF5T2ZXZWVrIiwiaXNTaG93V2VlayIsImhpZ2hMaW5lV2Vla0RheSIsImlzU2hvd0NsZWFyIiwiaXNTaG93VG9kYXkiLCJpc1Nob3dPSyIsImlzU2hvd090aGVycyIsInJlYWRPbmx5IiwiZXJyRGVhbE1vZGUiLCJhdXRvUGlja0RhdGUiLCJxc0VuYWJsZWQiLCJhdXRvU2hvd1FTIiwib3Bwb3NpdGUiLCJobXNNZW51Q2ZnIiwiSCIsInNwZWNpYWxEYXRlcyIsInNwZWNpYWxEYXlzIiwiZGlzYWJsZWREYXRlcyIsImRpc2FibGVkRGF5cyIsIm9ucGlja2luZyIsIm9ucGlja2VkIiwib25jbGVhcmluZyIsIm9uY2xlYXJlZCIsInljaGFuZ2luZyIsInljaGFuZ2VkIiwiTWNoYW5naW5nIiwiTWNoYW5nZWQiLCJkY2hhbmdpbmciLCJkY2hhbmdlZCIsIkhjaGFuZ2luZyIsIkhjaGFuZ2VkIiwibWNoYW5naW5nIiwibWNoYW5nZWQiLCJzY2hhbmdpbmciLCJzY2hhbmdlZCIsImVDb250IiwidmVsIiwiZWxQcm9wIiwiZXJyTXNnIiwicXVpY2tTZWwiLCJoYXMiLCJnZXRSZWFsTGFuZyIsIl8iLCJBIiwiVSIsIlkiLCJUIiwiTiIsIkMiLCJWIiwiUyIsIkciLCJYIiwiYXBwTmFtZSIsIkoiLCJPIiwiZmYiLCJpZSIsIm9wZXJhIiwiZGVmTWluRGF0ZSIsImRlZk1heERhdGUiLCJCIiwiRSIsImRvY01EIiwiRCIsImRkIiwiUCIsIndpbiIsImdldEVsZW1lbnRCeUlkIiwiJEQiLCIkRFYiLCJkdCIsImNhbCIsInNwbGl0RGF0ZSIsIkRhdGUiLCJnZXREYXRlIiwibWluIiwicmVmcmVzaCIsInpJbmRleCIsImZpcnN0Q2hpbGQiLCJpbml0Y2ZnIiwiTCIsImF0dGFjaEV2ZW50IiwiX2llRW11RXZlbnRIYW5kbGVyIiwiZGV0YWNoRXZlbnQiLCJnZXRBdHRyaWJ1dGUiLCJsYXN0SW5kZXhPZiIsIksiLCJ0aXRsZSIsIkYiLCJjb250ZW50V2luZG93IiwiVyIsIlJPT1RfVEFHIiwiT1BfU0NST0xMIiwiSSIsIm9mZnNldExlZnQiLCJvZmZzZXRXaWR0aCIsIm9mZnNldFBhcmVudCIsIlIiLCJ0YWdOYW1lIiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3Iiwic2Nyb2xsTGVmdCIsIm92ZXJmbG93IiwiTSIsImlubmVyV2lkdGgiLCJjbGllbnRXaWR0aCIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwic3JjRWxlbWVudCIsIloiLCJRIiwic3JjRWwiLCJjYW5jZWxCdWJibGUiLCJub2RlVHlwZSIsImZ1bmMiLCJjdXJyZW50U3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwiYnJvd3Nlckxhbmd1YWdlIiwibGFuZ3VhZ2UiLCJjc3NUZXh0IiwiZG9tYWluIiwibGFzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJoaWRlRm9jdXMiLCJmcmFtZUJvcmRlciIsInNjcm9sbGluZyIsInNyYyIsImRlY29kZVVSSUNvbXBvbmVudCIsInNldFBvcyIsImNmZyIsImlzTmFOIiwidG9wTSIsImJvdHRvbSIsImxlZnRNIiwiRGF0YVBpY2tlciIsIiRzY3JvbGxCYXIiLCJTY3JvbGxTdGFydCIsIkRhdGFQaWNrZXJJbml0Iiwib3NldCIsImNsb25lIiwiZXZhbCIsIkNvbXN5c0ZpbGVSZWFkZXIiLCJnbG9iYWxGaWxlUmVhZGVyVXJsIiwicmVhZCIsImRlZmVycmVkIiwiRGVmZXJyZWQiLCJwcm9taXNlIiwiJGZpbGUiLCIkZm9ybSIsImFqYXhTdWJtaXQiLCJkYXRhVHlwZSIsInN1Y2Nlc3MiLCJyZXREYXRhIiwicmVzb2x2ZSIsInJlamVjdCIsImZlYXR1cmUiLCJmaWxlYXBpIiwiZmlsZXMiLCJmb3JtZGF0YSIsIkZvcm1EYXRhIiwiaGFzUHJvcCIsInByb3AiLCJhdHRyMiIsImpxdWVyeSIsImxvZyIsImFjdGlvbiIsImFqYXhTZXR0aW5ncyIsImlmcmFtZVNyYyIsInZldG8iLCJiZWZvcmVTZXJpYWxpemUiLCJ0cmFkaXRpb25hbCIsImVsZW1lbnRzIiwicXgiLCJmb3JtVG9BcnJheSIsInNlbWFudGljIiwiZXh0cmFEYXRhIiwiYmVmb3JlU3VibWl0IiwicSIsInRvVXBwZXJDYXNlIiwiY2FsbGJhY2tzIiwicmVzZXRGb3JtIiwiY2xlYXJGb3JtIiwiaW5jbHVkZUhpZGRlbiIsIm9sZFN1Y2Nlc3MiLCJyZXBsYWNlVGFyZ2V0IiwiY29udGV4dCIsIm9sZEVycm9yIiwiY29tcGxldGUiLCJvbGRDb21wbGV0ZSIsImZpbGVJbnB1dHMiLCJmaWx0ZXIiLCJoYXNGaWxlSW5wdXRzIiwibXAiLCJtdWx0aXBhcnQiLCJmaWxlQVBJIiwic2hvdWxkVXNlRnJhbWUiLCJqcXhociIsImlmcmFtZSIsImNsb3NlS2VlcEFsaXZlIiwiZmlsZVVwbG9hZElmcmFtZSIsImZpbGVVcGxvYWRYaHIiLCJhamF4IiwiZGVlcFNlcmlhbGl6ZSIsInNlcmlhbGl6ZWQiLCJsZW4iLCJyZXN1bHQiLCJzZXJpYWxpemVkRGF0YSIsImNvbnRlbnRUeXBlIiwicHJvY2Vzc0RhdGEiLCJjYWNoZSIsInVwbG9hZFByb2dyZXNzIiwidXBsb2FkIiwicGVyY2VudCIsImxvYWRlZCIsInRvdGFsIiwibGVuZ3RoQ29tcHV0YWJsZSIsImNlaWwiLCJiZWZvcmVTZW5kIiwiZm9ybURhdGEiLCJmb3JtIiwiJGlvIiwidGltZWRPdXQiLCJ0aW1lb3V0SGFuZGxlIiwiYWJvcnQiLCJnZXRUaW1lIiwiaWZyYW1lVGFyZ2V0IiwiYWJvcnRlZCIsInJlc3BvbnNlWE1MIiwic3RhdHVzVGV4dCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwiZXhlY0NvbW1hbmQiLCJpZ25vcmUiLCJnbG9iYWwiLCJhY3RpdmUiLCJjbGsiLCJjbGtfeCIsImNsa195IiwiQ0xJRU5UX1RJTUVPVVRfQUJPUlQiLCJTRVJWRVJfQUJPUlQiLCJnZXREb2MiLCJmcmFtZSIsImRvYyIsImNvbnRlbnREb2N1bWVudCIsImNzcmZfdG9rZW4iLCJjc3JmX3BhcmFtIiwiZG9TdWJtaXQiLCJldCIsInNldEF0dHJpYnV0ZSIsInNraXBFbmNvZGluZ092ZXJyaWRlIiwiZW5jdHlwZSIsInRpbWVvdXQiLCJjYiIsImNoZWNrU3RhdGUiLCJleHRyYUlucHV0cyIsImlzUGxhaW5PYmplY3QiLCJzdWJtaXQiLCJzdWJtaXRGbiIsImZvcmNlU3luYyIsImRvbUNoZWNrQ291bnQiLCJjYWxsYmFja1Byb2Nlc3NlZCIsImlzWG1sIiwiWE1MRG9jdW1lbnQiLCJpc1hNTERvYyIsImRvY1Jvb3QiLCJkb2N1bWVudEVsZW1lbnQiLCJOdW1iZXIiLCJzY3IiLCJ0ZXh0YXJlYSIsInRhIiwicHJlIiwiaW5uZXJUZXh0IiwidG9YbWwiLCJodHRwRGF0YSIsInBhcnNlWE1MIiwiYXN5bmMiLCJsb2FkWE1MIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwicGFyc2VKU09OIiwiY3QiLCJ4bWwiLCJkYXRhRmlsdGVyIiwiZ2xvYmFsRXZhbCIsImFqYXhGb3JtIiwiZGVsZWdhdGlvbiIsImlzRnVuY3Rpb24iLCJzZWxlY3RvciIsImlzUmVhZHkiLCJkb0FqYXhTdWJtaXQiLCJjYXB0dXJlU3VibWl0dGluZ0VsZW1lbnQiLCJhamF4Rm9ybVVuYmluZCIsImlzRGVmYXVsdFByZXZlbnRlZCIsInByZXZlbnREZWZhdWx0IiwiJGVsIiwicGFnZVgiLCJwYWdlWSIsImZvcm1JZCIsImVscyIsImVsczIiLCJjb25jYXQiLCJqIiwidiIsImptYXgiLCJmaWVsZFZhbHVlIiwicmVxdWlyZWQiLCJmb3JtU2VyaWFsaXplIiwiZmllbGRTZXJpYWxpemUiLCJzdWNjZXNzZnVsIiwibWVyZ2UiLCJ0YWciLCJvcHMiLCJvbmUiLCJvcCIsImF0dHJpYnV0ZXMiLCJzcGVjaWZpZWQiLCJjbGVhckZpZWxkcyIsImNsZWFySW5wdXRzIiwicmVzZXQiLCJlbmFibGUiLCJzZWxlY3QiLCIkc2VsIiwibXNnIiwiY29uc29sZSIsInBvc3RFcnJvciIsIkZpbGVSZWFkZXIiLCJQcm90b1VwbG9hZCIsImZpbGVSZWFkZXIiLCIkdGFyZ2V0Iiwib251cGxvYWRlZCIsImlzTmV3IiwidGhlbiIsImltYWdlIiwiSW1hZ2UiLCJmYWlsIiwibWVzc2FnZSIsIlByb3RvVXBsb2FkSW5pdCIsImJhc2VVcmwiLCJXZWJBcGkiLCJ1dGlsIiwiaW50ZXJmYWNlIiwic2NyaXB0cyIsImwiLCJhcHBsaWNhdGlvbiIsIiRtYWluIiwiJHdpbmRvdyIsIiRzd2Jhbm5lcnMiLCJyZXNpemVUaW1lciIsInJlc2l6ZSIsImgiLCJzd2Jhbm5lciIsInNwZWVkIiwiY29udHJvbDIiLCJkZWZhdWx0V2lkdGgiLCJwbGF5ZWQiLCJzdG9wZWQiLCJsb2FkSW1hZ2UiLCJjbGljayIsIiRvdGhlciIsInNpYmxpbmdzIiwiJGJhbm5lckNvbnRhaW5lciIsIiRpbWFnZXMiLCJjb21wdXRlZCIsImRvbmUiLCJ3IiwiaG9yaXpvbnRhbCIsIm1hcmdpblRvcCIsIm1hcmdpbkxlZnQiLCJmYWRlSW4i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QixFQUx5QjtBQUFBLGlCQUExQixFQUZEO0FBQUEsYUF0Q3lDO0FBQUEsWUF5RHpDdEIsS0FBQSxDQUFNd0IsTUFBTixDQUFhcEgsRUFBYixFQXpEeUM7QUFBQSxTQUE1QixFQTBEWCxHQTFEVyxDQUFkLENBSmdDO0FBQUEsUUErRGhDLE9BQU9sbUIsU0FBQSxDQUFVQyxNQUFqQixDQS9EZ0M7QUFBQSxLQUFqQyxDQTlCd0I7QUFBQSxJQWdHeEI4ckIsT0FBQSxDQUFRRyxNQUFSLENBQWUxb0IsVUFBQSxDQUFXLEtBQVgsQ0FBZixFQWhHd0I7QUFBQSxDQUZ6QiIsImZpbGUiOiJsb2dpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBBdXRob3I6SGVydWkvQWRtaW5pc3RyYXRvcjtcclxuICogQ3JlYXRlRGF0ZToyMDE2LzIvMTZcclxuICpcclxuICogRGVzY3JpYmU6XHJcbiAqL1xyXG5cclxuZGVmaW5lKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJlcXVlc3QgPSB7fTtcclxuICAgIHZhciBwcyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICBpZiAoIXBzKSByZXR1cm4gcmVxdWVzdDtcclxuICAgIHZhciByZWcgPSAvWz8mXSooW149XSspPShbXiY9XSspL2lnLCBtXHJcbiAgICB3aGlsZSAoKG0gPSByZWcuZXhlYyhwcykpKVxyXG4gICAge1xyXG4gICAgICAgIHJlcXVlc3RbbVsxXV09bVsyXTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXF1ZXN0O1xyXG59KSIsIi8qXHJcbiAqIFJlcXVpcmUtQ1NTIFJlcXVpcmVKUyBjc3MhIGxvYWRlciBwbHVnaW5cclxuICogMC4xLjhcclxuICogR3V5IEJlZGZvcmQgMjAxNFxyXG4gKiBNSVRcclxuICovXHJcblxyXG4vKlxyXG4gKlxyXG4gKiBVc2FnZTpcclxuICogIHJlcXVpcmUoWydjc3MhLi9teWNzc0ZpbGUnXSk7XHJcbiAqXHJcbiAqIFRlc3RlZCBhbmQgd29ya2luZyBpbiAodXAgdG8gbGF0ZXN0IHZlcnNpb25zIGFzIG9mIE1hcmNoIDIwMTMpOlxyXG4gKiBBbmRyb2lkXHJcbiAqIGlPUyA2XHJcbiAqIElFIDYgLSAxMFxyXG4gKiBDaG9tZSAzIC0gMjZcclxuICogRmlyZWZveCAzLjUgLSAxOVxyXG4gKiBPcGVyYSAxMCAtIDEyXHJcbiAqIFxyXG4gKiBicm93c2VybGluZy5jb20gdXNlZCBmb3IgdmlydHVhbCB0ZXN0aW5nIGVudmlyb25tZW50XHJcbiAqXHJcbiAqIENyZWRpdCB0byBCIENhdmFsaWVyICYgSiBIYW5uIGZvciB0aGUgSUUgNiAtIDkgbWV0aG9kLFxyXG4gKiByZWZpbmVkIHdpdGggaGVscCBmcm9tIE1hcnRpbiBDZXJtYWtcclxuICogXHJcbiAqIFNvdXJjZXMgdGhhdCBoZWxwZWQgYWxvbmcgdGhlIHdheTpcclxuICogLSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0Jyb3dzZXJfZGV0ZWN0aW9uX3VzaW5nX3RoZV91c2VyX2FnZW50XHJcbiAqIC0gaHR0cDovL3d3dy5waHBpZWQuY29tL3doZW4taXMtYS1zdHlsZXNoZWV0LXJlYWxseS1sb2FkZWQvXHJcbiAqIC0gaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy9jdXJsL2Jsb2IvbWFzdGVyL3NyYy9jdXJsL3BsdWdpbi9jc3MuanNcclxuICpcclxuICovXHJcblxyXG5kZWZpbmUoZnVuY3Rpb24oKSB7XHJcbi8vPj5leGNsdWRlU3RhcnQoJ2V4Y2x1ZGVSZXF1aXJlQ3NzJywgcHJhZ21hcy5leGNsdWRlUmVxdWlyZUNzcylcclxuICBpZiAodHlwZW9mIHdpbmRvdyA9PSAndW5kZWZpbmVkJylcclxuICAgIHJldHVybiB7IGxvYWQ6IGZ1bmN0aW9uKG4sIHIsIGxvYWQpeyBsb2FkKCkgfSB9O1xyXG5cclxuICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcblxyXG4gIHZhciBlbmdpbmUgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVHJpZGVudFxcLyhbXiA7XSopfEFwcGxlV2ViS2l0XFwvKFteIDtdKil8T3BlcmFcXC8oW14gO10qKXxydlxcOihbXiA7XSopKC4qPylHZWNrb1xcLyhbXiA7XSopfE1TSUVcXHMoW14gO10qKXxBbmRyb2lkV2ViS2l0XFwvKFteIDtdKikvKSB8fCAwO1xyXG5cclxuICAvLyB1c2UgPHN0eWxlPiBAaW1wb3J0IGxvYWQgbWV0aG9kIChJRSA8IDksIEZpcmVmb3ggPCAxOClcclxuICB2YXIgdXNlSW1wb3J0TG9hZCA9IGZhbHNlO1xyXG4gIFxyXG4gIC8vIHNldCB0byBmYWxzZSBmb3IgZXhwbGljaXQgPGxpbms+IGxvYWQgY2hlY2tpbmcgd2hlbiBvbmxvYWQgZG9lc24ndCB3b3JrIHBlcmZlY3RseSAod2Via2l0KVxyXG4gIHZhciB1c2VPbmxvYWQgPSB0cnVlO1xyXG5cclxuICAvLyB0cmlkZW50IC8gbXNpZVxyXG4gIGlmIChlbmdpbmVbMV0gfHwgZW5naW5lWzddKVxyXG4gICAgdXNlSW1wb3J0TG9hZCA9IHBhcnNlSW50KGVuZ2luZVsxXSkgPCA2IHx8IHBhcnNlSW50KGVuZ2luZVs3XSkgPD0gOTtcclxuICAvLyB3ZWJraXRcclxuICBlbHNlIGlmIChlbmdpbmVbMl0gfHwgZW5naW5lWzhdKVxyXG4gICAgdXNlT25sb2FkID0gZmFsc2U7XHJcbiAgLy8gZ2Vja29cclxuICBlbHNlIGlmIChlbmdpbmVbNF0pXHJcbiAgICB1c2VJbXBvcnRMb2FkID0gcGFyc2VJbnQoZW5naW5lWzRdKSA8IDE4O1xyXG5cclxuLy8+PmV4Y2x1ZGVFbmQoJ2V4Y2x1ZGVSZXF1aXJlQ3NzJylcclxuICAvL21haW4gYXBpIG9iamVjdFxyXG4gIHZhciBjc3NBUEkgPSB7fTtcclxuXHJcbi8vPj5leGNsdWRlU3RhcnQoJ2V4Y2x1ZGVSZXF1aXJlQ3NzJywgcHJhZ21hcy5leGNsdWRlUmVxdWlyZUNzcylcclxuICBjc3NBUEkucGx1Z2luQnVpbGRlciA9ICcuL2Nzcy1idWlsZGVyJztcclxuXHJcbiAgLy8gPHN0eWxlPiBAaW1wb3J0IGxvYWQgbWV0aG9kXHJcbiAgdmFyIGN1clN0eWxlLCBjdXJTaGVldDtcclxuICB2YXIgY3JlYXRlU3R5bGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjdXJTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICBoZWFkLmFwcGVuZENoaWxkKGN1clN0eWxlKTtcclxuICAgIGN1clNoZWV0ID0gY3VyU3R5bGUuc3R5bGVTaGVldCB8fCBjdXJTdHlsZS5zaGVldDtcclxuICB9XHJcbiAgdmFyIGllQ250ID0gMDtcclxuICB2YXIgaWVMb2FkcyA9IFtdO1xyXG4gIHZhciBpZUN1ckNhbGxiYWNrO1xyXG4gIFxyXG4gIHZhciBjcmVhdGVJZUxvYWQgPSBmdW5jdGlvbih1cmwpIHtcclxuICAgIGN1clNoZWV0LmFkZEltcG9ydCh1cmwpO1xyXG4gICAgY3VyU3R5bGUub25sb2FkID0gZnVuY3Rpb24oKXsgcHJvY2Vzc0llTG9hZCgpIH07XHJcbiAgICBcclxuICAgIGllQ250Kys7XHJcbiAgICBpZiAoaWVDbnQgPT0gMzEpIHtcclxuICAgICAgY3JlYXRlU3R5bGUoKTtcclxuICAgICAgaWVDbnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuICB2YXIgcHJvY2Vzc0llTG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWVDdXJDYWxsYmFjaygpO1xyXG4gXHJcbiAgICB2YXIgbmV4dExvYWQgPSBpZUxvYWRzLnNoaWZ0KCk7XHJcbiBcclxuICAgIGlmICghbmV4dExvYWQpIHtcclxuICAgICAgaWVDdXJDYWxsYmFjayA9IG51bGw7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuIFxyXG4gICAgaWVDdXJDYWxsYmFjayA9IG5leHRMb2FkWzFdO1xyXG4gICAgY3JlYXRlSWVMb2FkKG5leHRMb2FkWzBdKTtcclxuICB9XHJcbiAgdmFyIGltcG9ydExvYWQgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoIWN1clNoZWV0IHx8ICFjdXJTaGVldC5hZGRJbXBvcnQpXHJcbiAgICAgIGNyZWF0ZVN0eWxlKCk7XHJcblxyXG4gICAgaWYgKGN1clNoZWV0ICYmIGN1clNoZWV0LmFkZEltcG9ydCkge1xyXG4gICAgICAvLyBvbGQgSUVcclxuICAgICAgaWYgKGllQ3VyQ2FsbGJhY2spIHtcclxuICAgICAgICBpZUxvYWRzLnB1c2goW3VybCwgY2FsbGJhY2tdKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjcmVhdGVJZUxvYWQodXJsKTtcclxuICAgICAgICBpZUN1ckNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBvbGQgRmlyZWZveFxyXG4gICAgICBjdXJTdHlsZS50ZXh0Q29udGVudCA9ICdAaW1wb3J0IFwiJyArIHVybCArICdcIjsnO1xyXG5cclxuICAgICAgdmFyIGxvYWRJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjdXJTdHlsZS5zaGVldC5jc3NSdWxlcztcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwobG9hZEludGVydmFsKTtcclxuICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBjYXRjaChlKSB7fVxyXG4gICAgICB9LCAxMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA8bGluaz4gbG9hZCBtZXRob2RcclxuICB2YXIgbGlua0xvYWQgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuICAgIGxpbmsudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuICAgIGlmICh1c2VPbmxvYWQpXHJcbiAgICAgIGxpbmsub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGluay5vbmxvYWQgPSBmdW5jdGlvbigpIHt9O1xyXG4gICAgICAgIC8vIGZvciBzdHlsZSBkaW1lbnNpb25zIHF1ZXJpZXMsIGEgc2hvcnQgZGVsYXkgY2FuIHN0aWxsIGJlIG5lY2Vzc2FyeVxyXG4gICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDcpO1xyXG4gICAgICB9XHJcbiAgICBlbHNlXHJcbiAgICAgIHZhciBsb2FkSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvY3VtZW50LnN0eWxlU2hlZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgc2hlZXQgPSBkb2N1bWVudC5zdHlsZVNoZWV0c1tpXTtcclxuICAgICAgICAgIGlmIChzaGVldC5ocmVmID09IGxpbmsuaHJlZikge1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGxvYWRJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgMTApO1xyXG4gICAgbGluay5ocmVmID0gdXJsO1xyXG4gICAgaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcclxuICB9XHJcblxyXG4vLz4+ZXhjbHVkZUVuZCgnZXhjbHVkZVJlcXVpcmVDc3MnKVxyXG4gIGNzc0FQSS5ub3JtYWxpemUgPSBmdW5jdGlvbihuYW1lLCBub3JtYWxpemUpIHtcclxuICAgIGlmIChuYW1lLnN1YnN0cihuYW1lLmxlbmd0aCAtIDQsIDQpID09ICcuY3NzJylcclxuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDAsIG5hbWUubGVuZ3RoIC0gNCk7XHJcblxyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShuYW1lKTtcclxuICB9XHJcblxyXG4vLz4+ZXhjbHVkZVN0YXJ0KCdleGNsdWRlUmVxdWlyZUNzcycsIHByYWdtYXMuZXhjbHVkZVJlcXVpcmVDc3MpXHJcbiAgY3NzQVBJLmxvYWQgPSBmdW5jdGlvbihjc3NJZCwgcmVxLCBsb2FkLCBjb25maWcpIHtcclxuXHJcbiAgICAodXNlSW1wb3J0TG9hZCA/IGltcG9ydExvYWQgOiBsaW5rTG9hZCkocmVxLnRvVXJsKGNzc0lkICsgJy5jc3MnKSwgbG9hZCk7XHJcblxyXG4gIH1cclxuXHJcbi8vPj5leGNsdWRlRW5kKCdleGNsdWRlUmVxdWlyZUNzcycpXHJcbiAgcmV0dXJuIGNzc0FQSTtcclxufSk7XHJcbiIsIi8qKlxyXG4gKiBAbGljZW5zZSBSZXF1aXJlSlMgdGV4dCAyLjAuMTIgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTQsIFRoZSBEb2pvIEZvdW5kYXRpb24gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICogQXZhaWxhYmxlIHZpYSB0aGUgTUlUIG9yIG5ldyBCU0QgbGljZW5zZS5cclxuICogc2VlOiBodHRwOi8vZ2l0aHViLmNvbS9yZXF1aXJlanMvdGV4dCBmb3IgZGV0YWlsc1xyXG4gKi9cclxuLypqc2xpbnQgcmVnZXhwOiB0cnVlICovXHJcbi8qZ2xvYmFsIHJlcXVpcmUsIFhNTEh0dHBSZXF1ZXN0LCBBY3RpdmVYT2JqZWN0LFxyXG4gIGRlZmluZSwgd2luZG93LCBwcm9jZXNzLCBQYWNrYWdlcyxcclxuICBqYXZhLCBsb2NhdGlvbiwgQ29tcG9uZW50cywgRmlsZVV0aWxzICovXHJcblxyXG5kZWZpbmUoWydtb2R1bGUnXSwgZnVuY3Rpb24gKG1vZHVsZSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciB0ZXh0LCBmcywgQ2MsIENpLCB4cGNJc1dpbmRvd3MsXHJcbiAgICBwcm9nSWRzID0gWydNc3htbDIuWE1MSFRUUCcsICdNaWNyb3NvZnQuWE1MSFRUUCcsICdNc3htbDIuWE1MSFRUUC40LjAnXSxcclxuICAgIHhtbFJlZ0V4cCA9IC9eXFxzKjxcXD94bWwoXFxzKSt2ZXJzaW9uPVtcXCdcXFwiXShcXGQpKi4oXFxkKSpbXFwnXFxcIl0oXFxzKSpcXD8+L2ltLFxyXG4gICAgYm9keVJlZ0V4cCA9IC88Ym9keVtePl0qPlxccyooW1xcc1xcU10rKVxccyo8XFwvYm9keT4vaW0sXHJcbiAgICBoYXNMb2NhdGlvbiA9IHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYXRpb24uaHJlZixcclxuICAgIGRlZmF1bHRQcm90b2NvbCA9IGhhc0xvY2F0aW9uICYmIGxvY2F0aW9uLnByb3RvY29sICYmIGxvY2F0aW9uLnByb3RvY29sLnJlcGxhY2UoL1xcOi8sICcnKSxcclxuICAgIGRlZmF1bHRIb3N0TmFtZSA9IGhhc0xvY2F0aW9uICYmIGxvY2F0aW9uLmhvc3RuYW1lLFxyXG4gICAgZGVmYXVsdFBvcnQgPSBoYXNMb2NhdGlvbiAmJiAobG9jYXRpb24ucG9ydCB8fCB1bmRlZmluZWQpLFxyXG4gICAgYnVpbGRNYXAgPSB7fSxcclxuICAgIG1hc3RlckNvbmZpZyA9IChtb2R1bGUuY29uZmlnICYmIG1vZHVsZS5jb25maWcoKSkgfHwge307XHJcblxyXG4gICAgdGV4dCA9IHtcclxuICAgICAgICB2ZXJzaW9uOiAnMi4wLjEyJyxcclxuXHJcbiAgICAgICAgc3RyaXA6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgIC8vU3RyaXBzIDw/eG1sIC4uLj8+IGRlY2xhcmF0aW9ucyBzbyB0aGF0IGV4dGVybmFsIFNWRyBhbmQgWE1MXHJcbiAgICAgICAgICAgIC8vZG9jdW1lbnRzIGNhbiBiZSBhZGRlZCB0byBhIGRvY3VtZW50IHdpdGhvdXQgd29ycnkuIEFsc28sIGlmIHRoZSBzdHJpbmdcclxuICAgICAgICAgICAgLy9pcyBhbiBIVE1MIGRvY3VtZW50LCBvbmx5IHRoZSBwYXJ0IGluc2lkZSB0aGUgYm9keSB0YWcgaXMgcmV0dXJuZWQuXHJcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHhtbFJlZ0V4cCwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGNvbnRlbnQubWF0Y2goYm9keVJlZ0V4cCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBtYXRjaGVzWzFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganNFc2NhcGU6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50LnJlcGxhY2UoLyhbJ1xcXFxdKS9nLCAnXFxcXCQxJylcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFxmXS9nLCBcIlxcXFxmXCIpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW1xcYl0vZywgXCJcXFxcYlwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXG5dL2csIFwiXFxcXG5cIilcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx0XS9nLCBcIlxcXFx0XCIpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW1xccl0vZywgXCJcXFxcclwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHUyMDI4XS9nLCBcIlxcXFx1MjAyOFwiKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHUyMDI5XS9nLCBcIlxcXFx1MjAyOVwiKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVYaHI6IG1hc3RlckNvbmZpZy5jcmVhdGVYaHIgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvL1dvdWxkIGxvdmUgdG8gZHVtcCB0aGUgQWN0aXZlWCBjcmFwIGluIGhlcmUuIE5lZWQgSUUgNiB0byBkaWUgZmlyc3QuXHJcbiAgICAgICAgICAgIHZhciB4aHIsIGksIHByb2dJZDtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBBY3RpdmVYT2JqZWN0ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvZ0lkID0gcHJvZ0lkc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBuZXcgQWN0aXZlWE9iamVjdChwcm9nSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ0lkcyA9IFtwcm9nSWRdOyAgLy8gc28gZmFzdGVyIG5leHQgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB4aHI7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGFyc2VzIGEgcmVzb3VyY2UgbmFtZSBpbnRvIGl0cyBjb21wb25lbnQgcGFydHMuIFJlc291cmNlIG5hbWVzXHJcbiAgICAgICAgICogbG9vayBsaWtlOiBtb2R1bGUvbmFtZS5leHQhc3RyaXAsIHdoZXJlIHRoZSAhc3RyaXAgcGFydCBpc1xyXG4gICAgICAgICAqIG9wdGlvbmFsLlxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIHRoZSByZXNvdXJjZSBuYW1lXHJcbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gd2l0aCBwcm9wZXJ0aWVzIFwibW9kdWxlTmFtZVwiLCBcImV4dFwiIGFuZCBcInN0cmlwXCJcclxuICAgICAgICAgKiB3aGVyZSBzdHJpcCBpcyBhIGJvb2xlYW4uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGFyc2VOYW1lOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgbW9kTmFtZSwgZXh0LCB0ZW1wLFxyXG4gICAgICAgICAgICBzdHJpcCA9IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmRleCA9IG5hbWUuaW5kZXhPZihcIi5cIiksXHJcbiAgICAgICAgICAgIGlzUmVsYXRpdmUgPSBuYW1lLmluZGV4T2YoJy4vJykgPT09IDAgfHxcclxuICAgICAgICAgICAgICAgIG5hbWUuaW5kZXhPZignLi4vJykgPT09IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xICYmICghaXNSZWxhdGl2ZSB8fCBpbmRleCA+IDEpKSB7XHJcbiAgICAgICAgICAgICAgICBtb2ROYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHJpbmcoaW5kZXggKyAxLCBuYW1lLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtb2ROYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGVtcCA9IGV4dCB8fCBtb2ROYW1lO1xyXG4gICAgICAgICAgICBpbmRleCA9IHRlbXAuaW5kZXhPZihcIiFcIik7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vUHVsbCBvZmYgdGhlIHN0cmlwIGFyZy5cclxuICAgICAgICAgICAgICAgIHN0cmlwID0gdGVtcC5zdWJzdHJpbmcoaW5kZXggKyAxKSA9PT0gXCJzdHJpcFwiO1xyXG4gICAgICAgICAgICAgICAgdGVtcCA9IHRlbXAuc3Vic3RyaW5nKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlmIChleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHQgPSB0ZW1wO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2ROYW1lID0gdGVtcDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6IG1vZE5hbWUsXHJcbiAgICAgICAgICAgICAgICBleHQ6IGV4dCxcclxuICAgICAgICAgICAgICAgIHN0cmlwOiBzdHJpcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHhkUmVnRXhwOiAvXigoXFx3KylcXDopP1xcL1xcLyhbXlxcL1xcXFxdKykvLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJcyBhbiBVUkwgb24gYW5vdGhlciBkb21haW4uIE9ubHkgd29ya3MgZm9yIGJyb3dzZXIgdXNlLCByZXR1cm5zXHJcbiAgICAgICAgICogZmFsc2UgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRzLiBPbmx5IHVzZWQgdG8ga25vdyBpZiBhblxyXG4gICAgICAgICAqIG9wdGltaXplZCAuanMgdmVyc2lvbiBvZiBhIHRleHQgcmVzb3VyY2Ugc2hvdWxkIGJlIGxvYWRlZFxyXG4gICAgICAgICAqIGluc3RlYWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxyXG4gICAgICAgICAqIEByZXR1cm5zIEJvb2xlYW5cclxuICAgICAgICAgKi9cclxuICAgICAgICB1c2VYaHI6IGZ1bmN0aW9uICh1cmwsIHByb3RvY29sLCBob3N0bmFtZSwgcG9ydCkge1xyXG4gICAgICAgICAgICB2YXIgdVByb3RvY29sLCB1SG9zdE5hbWUsIHVQb3J0LFxyXG4gICAgICAgICAgICBtYXRjaCA9IHRleHQueGRSZWdFeHAuZXhlYyh1cmwpO1xyXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1UHJvdG9jb2wgPSBtYXRjaFsyXTtcclxuICAgICAgICAgICAgdUhvc3ROYW1lID0gbWF0Y2hbM107XHJcblxyXG4gICAgICAgICAgICB1SG9zdE5hbWUgPSB1SG9zdE5hbWUuc3BsaXQoJzonKTtcclxuICAgICAgICAgICAgdVBvcnQgPSB1SG9zdE5hbWVbMV07XHJcbiAgICAgICAgICAgIHVIb3N0TmFtZSA9IHVIb3N0TmFtZVswXTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoIXVQcm90b2NvbCB8fCB1UHJvdG9jb2wgPT09IHByb3RvY29sKSAmJlxyXG4gICAgICAgICAgICAgICAgKCF1SG9zdE5hbWUgfHwgdUhvc3ROYW1lLnRvTG93ZXJDYXNlKCkgPT09IGhvc3RuYW1lLnRvTG93ZXJDYXNlKCkpICYmXHJcbiAgICAgICAgICAgICAgICAoKCF1UG9ydCAmJiAhdUhvc3ROYW1lKSB8fCB1UG9ydCA9PT0gcG9ydCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmluaXNoTG9hZDogZnVuY3Rpb24gKG5hbWUsIHN0cmlwLCBjb250ZW50LCBvbkxvYWQpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHN0cmlwID8gdGV4dC5zdHJpcChjb250ZW50KSA6IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIGlmIChtYXN0ZXJDb25maWcuaXNCdWlsZCkge1xyXG4gICAgICAgICAgICAgICAgYnVpbGRNYXBbbmFtZV0gPSBjb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9uTG9hZChjb250ZW50KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBsb2FkOiBmdW5jdGlvbiAobmFtZSwgcmVxLCBvbkxvYWQsIGNvbmZpZykge1xyXG4gICAgICAgICAgICAvL05hbWUgaGFzIGZvcm1hdDogc29tZS5tb2R1bGUuZmlsZXh0IXN0cmlwXHJcbiAgICAgICAgICAgIC8vVGhlIHN0cmlwIHBhcnQgaXMgb3B0aW9uYWwuXHJcbiAgICAgICAgICAgIC8vaWYgc3RyaXAgaXMgcHJlc2VudCwgdGhlbiB0aGF0IG1lYW5zIG9ubHkgZ2V0IHRoZSBzdHJpbmcgY29udGVudHNcclxuICAgICAgICAgICAgLy9pbnNpZGUgYSBib2R5IHRhZyBpbiBhbiBIVE1MIHN0cmluZy4gRm9yIFhNTC9TVkcgY29udGVudCBpdCBtZWFuc1xyXG4gICAgICAgICAgICAvL3JlbW92aW5nIHRoZSA8P3htbCAuLi4/PiBkZWNsYXJhdGlvbnMgc28gdGhlIGNvbnRlbnQgY2FuIGJlIGluc2VydGVkXHJcbiAgICAgICAgICAgIC8vaW50byB0aGUgY3VycmVudCBkb2Mgd2l0aG91dCBwcm9ibGVtcy5cclxuXHJcbiAgICAgICAgICAgIC8vIERvIG5vdCBib3RoZXIgd2l0aCB0aGUgd29yayBpZiBhIGJ1aWxkIGFuZCB0ZXh0IHdpbGxcclxuICAgICAgICAgICAgLy8gbm90IGJlIGlubGluZWQuXHJcbiAgICAgICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmlzQnVpbGQgJiYgIWNvbmZpZy5pbmxpbmVUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBvbkxvYWQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWFzdGVyQ29uZmlnLmlzQnVpbGQgPSBjb25maWcgJiYgY29uZmlnLmlzQnVpbGQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyc2VkID0gdGV4dC5wYXJzZU5hbWUobmFtZSksXHJcbiAgICAgICAgICAgICAgICBub25TdHJpcE5hbWUgPSBwYXJzZWQubW9kdWxlTmFtZSArXHJcbiAgICAgICAgICAgICAgICAocGFyc2VkLmV4dCA/ICcuJyArIHBhcnNlZC5leHQgOiAnJyksXHJcbiAgICAgICAgICAgIHVybCA9IHJlcS50b1VybChub25TdHJpcE5hbWUpLFxyXG4gICAgICAgICAgICB1c2VYaHIgPSAobWFzdGVyQ29uZmlnLnVzZVhocikgfHxcclxuICAgICAgICAgICAgICAgIHRleHQudXNlWGhyO1xyXG5cclxuICAgICAgICAgICAgLy8gRG8gbm90IGxvYWQgaWYgaXQgaXMgYW4gZW1wdHk6IHVybFxyXG4gICAgICAgICAgICBpZiAodXJsLmluZGV4T2YoJ2VtcHR5OicpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBvbkxvYWQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9Mb2FkIHRoZSB0ZXh0LiBVc2UgWEhSIGlmIHBvc3NpYmxlIGFuZCBpbiBhIGJyb3dzZXIuXHJcbiAgICAgICAgICAgIGlmICghaGFzTG9jYXRpb24gfHwgdXNlWGhyKHVybCwgZGVmYXVsdFByb3RvY29sLCBkZWZhdWx0SG9zdE5hbWUsIGRlZmF1bHRQb3J0KSkge1xyXG4gICAgICAgICAgICAgICAgdGV4dC5nZXQodXJsLCBmdW5jdGlvbiAoY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQuZmluaXNoTG9hZChuYW1lLCBwYXJzZWQuc3RyaXAsIGNvbnRlbnQsIG9uTG9hZCk7XHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uTG9hZC5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vTmVlZCB0byBmZXRjaCB0aGUgcmVzb3VyY2UgYWNyb3NzIGRvbWFpbnMuIEFzc3VtZVxyXG4gICAgICAgICAgICAgICAgLy90aGUgcmVzb3VyY2UgaGFzIGJlZW4gb3B0aW1pemVkIGludG8gYSBKUyBtb2R1bGUuIEZldGNoXHJcbiAgICAgICAgICAgICAgICAvL2J5IHRoZSBtb2R1bGUgbmFtZSArIGV4dGVuc2lvbiwgYnV0IGRvIG5vdCBpbmNsdWRlIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8hc3RyaXAgcGFydCB0byBhdm9pZCBmaWxlIHN5c3RlbSBpc3N1ZXMuXHJcbiAgICAgICAgICAgICAgICByZXEoW25vblN0cmlwTmFtZV0sIGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC5maW5pc2hMb2FkKHBhcnNlZC5tb2R1bGVOYW1lICsgJy4nICsgcGFyc2VkLmV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkLnN0cmlwLCBjb250ZW50LCBvbkxvYWQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB3cml0ZTogZnVuY3Rpb24gKHBsdWdpbk5hbWUsIG1vZHVsZU5hbWUsIHdyaXRlLCBjb25maWcpIHtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkTWFwLmhhc093blByb3BlcnR5KG1vZHVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudCA9IHRleHQuanNFc2NhcGUoYnVpbGRNYXBbbW9kdWxlTmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgd3JpdGUuYXNNb2R1bGUocGx1Z2luTmFtZSArIFwiIVwiICsgbW9kdWxlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuICdcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIic7fSk7XFxuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgd3JpdGVGaWxlOiBmdW5jdGlvbiAocGx1Z2luTmFtZSwgbW9kdWxlTmFtZSwgcmVxLCB3cml0ZSwgY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSB0ZXh0LnBhcnNlTmFtZShtb2R1bGVOYW1lKSxcclxuICAgICAgICAgICAgZXh0UGFydCA9IHBhcnNlZC5leHQgPyAnLicgKyBwYXJzZWQuZXh0IDogJycsXHJcbiAgICAgICAgICAgIG5vblN0cmlwTmFtZSA9IHBhcnNlZC5tb2R1bGVOYW1lICsgZXh0UGFydCxcclxuICAgICAgICAgICAgICAgIC8vVXNlIGEgJy5qcycgZmlsZSBuYW1lIHNvIHRoYXQgaXQgaW5kaWNhdGVzIGl0IGlzIGFcclxuICAgICAgICAgICAgICAgIC8vc2NyaXB0IHRoYXQgY2FuIGJlIGxvYWRlZCBhY3Jvc3MgZG9tYWlucy5cclxuICAgICAgICAgICAgZmlsZU5hbWUgPSByZXEudG9VcmwocGFyc2VkLm1vZHVsZU5hbWUgKyBleHRQYXJ0KSArICcuanMnO1xyXG5cclxuICAgICAgICAgICAgLy9MZXZlcmFnZSBvd24gbG9hZCgpIG1ldGhvZCB0byBsb2FkIHBsdWdpbiB2YWx1ZSwgYnV0IG9ubHlcclxuICAgICAgICAgICAgLy93cml0ZSBvdXQgdmFsdWVzIHRoYXQgZG8gbm90IGhhdmUgdGhlIHN0cmlwIGFyZ3VtZW50LFxyXG4gICAgICAgICAgICAvL3RvIGF2b2lkIGFueSBwb3RlbnRpYWwgaXNzdWVzIHdpdGggISBpbiBmaWxlIG5hbWVzLlxyXG4gICAgICAgICAgICB0ZXh0LmxvYWQobm9uU3RyaXBOYW1lLCByZXEsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgLy9Vc2Ugb3duIHdyaXRlKCkgbWV0aG9kIHRvIGNvbnN0cnVjdCBmdWxsIG1vZHVsZSB2YWx1ZS5cclxuICAgICAgICAgICAgICAgIC8vQnV0IG5lZWQgdG8gY3JlYXRlIHNoZWxsIHRoYXQgdHJhbnNsYXRlcyB3cml0ZUZpbGUnc1xyXG4gICAgICAgICAgICAgICAgLy93cml0ZSgpIHRvIHRoZSByaWdodCBpbnRlcmZhY2UuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGV4dFdyaXRlID0gZnVuY3Rpb24gKGNvbnRlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdyaXRlKGZpbGVOYW1lLCBjb250ZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGV4dFdyaXRlLmFzTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZU5hbWUsIGNvbnRlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdyaXRlLmFzTW9kdWxlKG1vZHVsZU5hbWUsIGZpbGVOYW1lLCBjb250ZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHRleHQud3JpdGUocGx1Z2luTmFtZSwgbm9uU3RyaXBOYW1lLCB0ZXh0V3JpdGUsIGNvbmZpZyk7XHJcbiAgICAgICAgICAgIH0sIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobWFzdGVyQ29uZmlnLmVudiA9PT0gJ25vZGUnIHx8ICghbWFzdGVyQ29uZmlnLmVudiAmJlxyXG4gICAgICAgICAgICB0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJlxyXG4gICAgICAgICAgICBwcm9jZXNzLnZlcnNpb25zICYmXHJcbiAgICAgICAgICAgICEhcHJvY2Vzcy52ZXJzaW9ucy5ub2RlICYmXHJcblx0XHRcdFx0XHQhcHJvY2Vzcy52ZXJzaW9uc1snbm9kZS13ZWJraXQnXSkpIHtcclxuICAgICAgICAvL1VzaW5nIHNwZWNpYWwgcmVxdWlyZS5ub2RlUmVxdWlyZSwgc29tZXRoaW5nIGFkZGVkIGJ5IHIuanMuXHJcbiAgICAgICAgZnMgPSByZXF1aXJlLm5vZGVSZXF1aXJlKCdmcycpO1xyXG5cclxuICAgICAgICB0ZXh0LmdldCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrLCBlcnJiYWNrKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyh1cmwsICd1dGY4Jyk7XHJcbiAgICAgICAgICAgICAgICAvL1JlbW92ZSBCT00gKEJ5dGUgTWFyayBPcmRlcikgZnJvbSB1dGY4IGZpbGVzIGlmIGl0IGlzIHRoZXJlLlxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUuaW5kZXhPZignXFx1RkVGRicpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZSA9IGZpbGUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyYmFjayhlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKG1hc3RlckNvbmZpZy5lbnYgPT09ICd4aHInIHx8ICghbWFzdGVyQ29uZmlnLmVudiAmJlxyXG5cdFx0XHRcdFx0ICAgICAgdGV4dC5jcmVhdGVYaHIoKSkpIHtcclxuICAgICAgICB0ZXh0LmdldCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrLCBlcnJiYWNrLCBoZWFkZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciB4aHIgPSB0ZXh0LmNyZWF0ZVhocigpLCBoZWFkZXI7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy9BbGxvdyBwbHVnaW5zIGRpcmVjdCBhY2Nlc3MgdG8geGhyIGhlYWRlcnNcclxuICAgICAgICAgICAgaWYgKGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaGVhZGVyIGluIGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShoZWFkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlci50b0xvd2VyQ2FzZSgpLCBoZWFkZXJzW2hlYWRlcl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9BbGxvdyBvdmVycmlkZXMgc3BlY2lmaWVkIGluIGNvbmZpZ1xyXG4gICAgICAgICAgICBpZiAobWFzdGVyQ29uZmlnLm9uWGhyKSB7XHJcbiAgICAgICAgICAgICAgICBtYXN0ZXJDb25maWcub25YaHIoeGhyLCB1cmwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cywgZXJyO1xyXG4gICAgICAgICAgICAgICAgLy9EbyBub3QgZXhwbGljaXRseSBoYW5kbGUgZXJyb3JzLCB0aG9zZSBzaG91bGQgYmVcclxuICAgICAgICAgICAgICAgIC8vdmlzaWJsZSB2aWEgY29uc29sZSBvdXRwdXQgaW4gdGhlIGJyb3dzZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSB4aHIuc3RhdHVzIHx8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA+IDM5OSAmJiBzdGF0dXMgPCA2MDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9BbiBodHRwIDR4eCBvciA1eHggZXJyb3IuIFNpZ25hbCBhbiBlcnJvci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKHVybCArICcgSFRUUCBzdGF0dXM6ICcgKyBzdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIueGhyID0geGhyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyYmFjayhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzdGVyQ29uZmlnLm9uWGhyQ29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzdGVyQ29uZmlnLm9uWGhyQ29tcGxldGUoeGhyLCB1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAobWFzdGVyQ29uZmlnLmVudiA9PT0gJ3JoaW5vJyB8fCAoIW1hc3RlckNvbmZpZy5lbnYgJiZcclxuXHRcdFx0XHRcdFx0dHlwZW9mIFBhY2thZ2VzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgamF2YSAhPT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgLy9XaHkgSmF2YSwgd2h5IGlzIHRoaXMgc28gYXdrd2FyZD9cclxuICAgICAgICB0ZXh0LmdldCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHJpbmdCdWZmZXIsIGxpbmUsXHJcbiAgICAgICAgICAgIGVuY29kaW5nID0gXCJ1dGYtOFwiLFxyXG4gICAgICAgICAgICBmaWxlID0gbmV3IGphdmEuaW8uRmlsZSh1cmwpLFxyXG4gICAgICAgICAgICBsaW5lU2VwYXJhdG9yID0gamF2YS5sYW5nLlN5c3RlbS5nZXRQcm9wZXJ0eShcImxpbmUuc2VwYXJhdG9yXCIpLFxyXG4gICAgICAgICAgICBpbnB1dCA9IG5ldyBqYXZhLmlvLkJ1ZmZlcmVkUmVhZGVyKG5ldyBqYXZhLmlvLklucHV0U3RyZWFtUmVhZGVyKG5ldyBqYXZhLmlvLkZpbGVJbnB1dFN0cmVhbShmaWxlKSwgZW5jb2RpbmcpKSxcclxuICAgICAgICAgICAgY29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nQnVmZmVyID0gbmV3IGphdmEubGFuZy5TdHJpbmdCdWZmZXIoKTtcclxuICAgICAgICAgICAgICAgIGxpbmUgPSBpbnB1dC5yZWFkTGluZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEJ5dGUgT3JkZXIgTWFyayAoQk9NKSAtIFRoZSBVbmljb2RlIFN0YW5kYXJkLCB2ZXJzaW9uIDMuMCwgcGFnZSAzMjRcclxuICAgICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cudW5pY29kZS5vcmcvZmFxL3V0Zl9ib20uaHRtbFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB3aGVuIHdlIHVzZSB1dGYtOCwgdGhlIEJPTSBzaG91bGQgYXBwZWFyIGFzIFwiRUYgQkIgQkZcIiwgYnV0IGl0IGRvZXNuJ3QgZHVlIHRvIHRoaXMgYnVnIGluIHRoZSBKREs6XHJcbiAgICAgICAgICAgICAgICAvLyBodHRwOi8vYnVncy5zdW4uY29tL2J1Z2RhdGFiYXNlL3ZpZXdfYnVnLmRvP2J1Z19pZD00NTA4MDU4XHJcbiAgICAgICAgICAgICAgICBpZiAobGluZSAmJiBsaW5lLmxlbmd0aCgpICYmIGxpbmUuY2hhckF0KDApID09PSAweGZlZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBFYXQgdGhlIEJPTSwgc2luY2Ugd2UndmUgYWxyZWFkeSBmb3VuZCB0aGUgZW5jb2Rpbmcgb24gdGhpcyBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCB3ZSBwbGFuIHRvIGNvbmNhdGVuYXRpbmcgdGhpcyBidWZmZXIgd2l0aCBvdGhlcnM7IHRoZSBCT00gc2hvdWxkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBhcHBlYXIgYXQgdGhlIHRvcCBvZiBhIGZpbGUuXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsaW5lICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nQnVmZmVyLmFwcGVuZChsaW5lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKGxpbmUgPSBpbnB1dC5yZWFkTGluZSgpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ0J1ZmZlci5hcHBlbmQobGluZVNlcGFyYXRvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nQnVmZmVyLmFwcGVuZChsaW5lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vTWFrZSBzdXJlIHdlIHJldHVybiBhIEphdmFTY3JpcHQgc3RyaW5nIGFuZCBub3QgYSBKYXZhIHN0cmluZy5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBTdHJpbmcoc3RyaW5nQnVmZmVyLnRvU3RyaW5nKCkpOyAvL1N0cmluZ1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYWxsYmFjayhjb250ZW50KTtcclxuICAgICAgICB9O1xyXG4gICAgfSBlbHNlIGlmIChtYXN0ZXJDb25maWcuZW52ID09PSAneHBjb25uZWN0JyB8fCAoIW1hc3RlckNvbmZpZy5lbnYgJiZcclxuICAgICAgICAgICAgdHlwZW9mIENvbXBvbmVudHMgIT09ICd1bmRlZmluZWQnICYmIENvbXBvbmVudHMuY2xhc3NlcyAmJlxyXG5cdFx0XHRcdFx0XHQgICAgQ29tcG9uZW50cy5pbnRlcmZhY2VzKSkge1xyXG4gICAgICAgIC8vQXZlcnQgeW91ciBnYXplIVxyXG4gICAgICAgIENjID0gQ29tcG9uZW50cy5jbGFzc2VzO1xyXG4gICAgICAgIENpID0gQ29tcG9uZW50cy5pbnRlcmZhY2VzO1xyXG4gICAgICAgIENvbXBvbmVudHMudXRpbHNbJ2ltcG9ydCddKCdyZXNvdXJjZTovL2dyZS9tb2R1bGVzL0ZpbGVVdGlscy5qc20nKTtcclxuICAgICAgICB4cGNJc1dpbmRvd3MgPSAoJ0Btb3ppbGxhLm9yZy93aW5kb3dzLXJlZ2lzdHJ5LWtleTsxJyBpbiBDYyk7XHJcblxyXG4gICAgICAgIHRleHQuZ2V0ID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdmFyIGluU3RyZWFtLCBjb252ZXJ0U3RyZWFtLCBmaWxlT2JqLFxyXG4gICAgICAgICAgICByZWFkRGF0YSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHhwY0lzV2luZG93cykge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoL1xcLy9nLCAnXFxcXCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaWxlT2JqID0gbmV3IEZpbGVVdGlscy5GaWxlKHVybCk7XHJcblxyXG4gICAgICAgICAgICAvL1hQQ09NLCB5b3Ugc28gY3JhenlcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGluU3RyZWFtID0gQ2NbJ0Btb3ppbGxhLm9yZy9uZXR3b3JrL2ZpbGUtaW5wdXQtc3RyZWFtOzEnXVxyXG4gICAgICAgICAgICAgICAgICAgIC5jcmVhdGVJbnN0YW5jZShDaS5uc0lGaWxlSW5wdXRTdHJlYW0pO1xyXG4gICAgICAgICAgICAgICAgaW5TdHJlYW0uaW5pdChmaWxlT2JqLCAxLCAwLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udmVydFN0cmVhbSA9IENjWydAbW96aWxsYS5vcmcvaW50bC9jb252ZXJ0ZXItaW5wdXQtc3RyZWFtOzEnXVxyXG4gICAgICAgICAgICAgICAgICAgIC5jcmVhdGVJbnN0YW5jZShDaS5uc0lDb252ZXJ0ZXJJbnB1dFN0cmVhbSk7XHJcbiAgICAgICAgICAgICAgICBjb252ZXJ0U3RyZWFtLmluaXQoaW5TdHJlYW0sIFwidXRmLThcIiwgaW5TdHJlYW0uYXZhaWxhYmxlKCksXHJcblx0XHRcdFx0ICAgQ2kubnNJQ29udmVydGVySW5wdXRTdHJlYW0uREVGQVVMVF9SRVBMQUNFTUVOVF9DSEFSQUNURVIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnZlcnRTdHJlYW0ucmVhZFN0cmluZyhpblN0cmVhbS5hdmFpbGFibGUoKSwgcmVhZERhdGEpO1xyXG4gICAgICAgICAgICAgICAgY29udmVydFN0cmVhbS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgaW5TdHJlYW0uY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlYWREYXRhLnZhbHVlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKChmaWxlT2JqICYmIGZpbGVPYmoucGF0aCB8fCAnJykgKyAnOiAnICsgZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRleHQ7XHJcbn0pOyIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZhY3Rvcnkocm9vdC5qUXVlcnkgfHwgcm9vdC5aZXB0byk7XHJcbiAgICB9XHJcbn0odGhpcywgZnVuY3Rpb24oKXtcclxuICAgICQuZXh0ZW5kKCAkLmVhc2luZyxcclxuICAgIHtcclxuICAgICAgICBkZWY6ICdlYXNlT3V0UXVhZCcsXHJcbiAgICAgICAgc3dpbmc6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIC8vYWxlcnQoalF1ZXJ5LmVhc2luZy5kZWZhdWx0KTtcclxuICAgICAgICAgICAgcmV0dXJuICQuZWFzaW5nWyQuZWFzaW5nLmRlZl0oeCwgdCwgYiwgYywgZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYyoodC89ZCkqdCArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC1jICoodC89ZCkqKHQtMikgKyBiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQgKyBiO1xyXG4gICAgICAgICAgICByZXR1cm4gLWMvMiAqICgoLS10KSoodC0yKSAtIDEpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYyoodC89ZCkqdCp0ICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMqKCh0PXQvZC0xKSp0KnQgKyAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCArIGI7XHJcbiAgICAgICAgICAgIHJldHVybiBjLzIqKCh0LT0yKSp0KnQgKyAyKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMqKHQvPWQpKnQqdCp0ICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC1jICogKCh0PXQvZC0xKSp0KnQqdCAtIDEpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKnQqdCp0KnQgKyBiO1xyXG4gICAgICAgICAgICByZXR1cm4gLWMvMiAqICgodC09MikqdCp0KnQgLSAyKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMqKHQvPWQpKnQqdCp0KnQgKyBiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYyooKHQ9dC9kLTEpKnQqdCp0KnQgKyAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCp0KnQgKyBiO1xyXG4gICAgICAgICAgICByZXR1cm4gYy8yKigodC09MikqdCp0KnQqdCArIDIpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJblNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtYyAqIE1hdGguY29zKHQvZCAqIChNYXRoLlBJLzIpKSArIGMgKyBiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFzZU91dFNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjICogTWF0aC5zaW4odC9kICogKE1hdGguUEkvMikpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJbk91dFNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtYy8yICogKE1hdGguY29zKE1hdGguUEkqdC9kKSAtIDEpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJbkV4cG86IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodD09MCkgPyBiIDogYyAqIE1hdGgucG93KDIsIDEwICogKHQvZCAtIDEpKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlT3V0RXhwbzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0PT1kKSA/IGIrYyA6IGMgKiAoLU1hdGgucG93KDIsIC0xMCAqIHQvZCkgKyAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRFeHBvOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICBpZiAodD09MCkgcmV0dXJuIGI7XHJcbiAgICAgICAgICAgIGlmICh0PT1kKSByZXR1cm4gYitjO1xyXG4gICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKSArIGI7XHJcbiAgICAgICAgICAgIHJldHVybiBjLzIgKiAoLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5DaXJjOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLWMgKiAoTWF0aC5zcXJ0KDEgLSAodC89ZCkqdCkgLSAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlT3V0Q2lyYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMgKiBNYXRoLnNxcnQoMSAtICh0PXQvZC0xKSp0KSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRDaXJjOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gLWMvMiAqIChNYXRoLnNxcnQoMSAtIHQqdCkgLSAxKSArIGI7XHJcbiAgICAgICAgICAgIHJldHVybiBjLzIgKiAoTWF0aC5zcXJ0KDEgLSAodC09MikqdCkgKyAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5FbGFzdGljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICB2YXIgcz0xLjcwMTU4O3ZhciBwPTA7dmFyIGE9YztcclxuICAgICAgICAgICAgaWYgKHQ9PTApIHJldHVybiBiOyAgaWYgKCh0Lz1kKT09MSkgcmV0dXJuIGIrYzsgIGlmICghcCkgcD1kKi4zO1xyXG4gICAgICAgICAgICBpZiAoYSA8IE1hdGguYWJzKGMpKSB7IGE9YzsgdmFyIHM9cC80OyB9XHJcbiAgICAgICAgICAgIGVsc2UgdmFyIHMgPSBwLygyKk1hdGguUEkpICogTWF0aC5hc2luIChjL2EpO1xyXG4gICAgICAgICAgICByZXR1cm4gLShhKk1hdGgucG93KDIsMTAqKHQtPTEpKSAqIE1hdGguc2luKCAodCpkLXMpKigyKk1hdGguUEkpL3AgKSkgKyBiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFzZU91dEVsYXN0aWM6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIHZhciBzPTEuNzAxNTg7dmFyIHA9MDt2YXIgYT1jO1xyXG4gICAgICAgICAgICBpZiAodD09MCkgcmV0dXJuIGI7ICBpZiAoKHQvPWQpPT0xKSByZXR1cm4gYitjOyAgaWYgKCFwKSBwPWQqLjM7XHJcbiAgICAgICAgICAgIGlmIChhIDwgTWF0aC5hYnMoYykpIHsgYT1jOyB2YXIgcz1wLzQ7IH1cclxuICAgICAgICAgICAgZWxzZSB2YXIgcyA9IHAvKDIqTWF0aC5QSSkgKiBNYXRoLmFzaW4gKGMvYSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhKk1hdGgucG93KDIsLTEwKnQpICogTWF0aC5zaW4oICh0KmQtcykqKDIqTWF0aC5QSSkvcCApICsgYyArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRFbGFzdGljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xyXG4gICAgICAgICAgICB2YXIgcz0xLjcwMTU4O3ZhciBwPTA7dmFyIGE9YztcclxuICAgICAgICAgICAgaWYgKHQ9PTApIHJldHVybiBiOyAgaWYgKCh0Lz1kLzIpPT0yKSByZXR1cm4gYitjOyAgaWYgKCFwKSBwPWQqKC4zKjEuNSk7XHJcbiAgICAgICAgICAgIGlmIChhIDwgTWF0aC5hYnMoYykpIHsgYT1jOyB2YXIgcz1wLzQ7IH1cclxuICAgICAgICAgICAgZWxzZSB2YXIgcyA9IHAvKDIqTWF0aC5QSSkgKiBNYXRoLmFzaW4gKGMvYSk7XHJcbiAgICAgICAgICAgIGlmICh0IDwgMSkgcmV0dXJuIC0uNSooYSpNYXRoLnBvdygyLDEwKih0LT0xKSkgKiBNYXRoLnNpbiggKHQqZC1zKSooMipNYXRoLlBJKS9wICkpICsgYjtcclxuICAgICAgICAgICAgcmV0dXJuIGEqTWF0aC5wb3coMiwtMTAqKHQtPTEpKSAqIE1hdGguc2luKCAodCpkLXMpKigyKk1hdGguUEkpL3AgKSouNSArIGMgKyBiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFzZUluQmFjazogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQsIHMpIHtcclxuICAgICAgICAgICAgaWYgKHMgPT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcclxuICAgICAgICAgICAgcmV0dXJuIGMqKHQvPWQpKnQqKChzKzEpKnQgLSBzKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlT3V0QmFjazogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQsIHMpIHtcclxuICAgICAgICAgICAgaWYgKHMgPT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcclxuICAgICAgICAgICAgcmV0dXJuIGMqKCh0PXQvZC0xKSp0KigocysxKSp0ICsgcykgKyAxKSArIGI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRCYWNrOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCwgcykge1xyXG4gICAgICAgICAgICBpZiAocyA9PSB1bmRlZmluZWQpIHMgPSAxLjcwMTU4O1xyXG4gICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKih0KnQqKCgocyo9KDEuNTI1KSkrMSkqdCAtIHMpKSArIGI7XHJcbiAgICAgICAgICAgIHJldHVybiBjLzIqKCh0LT0yKSp0KigoKHMqPSgxLjUyNSkpKzEpKnQgKyBzKSArIDIpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VJbkJvdW5jZTogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGMgLSAkLmVhc2luZy5lYXNlT3V0Qm91bmNlICh4LCBkLXQsIDAsIGMsIGQpICsgYjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIGlmICgodC89ZCkgPCAoMS8yLjc1KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGMqKDcuNTYyNSp0KnQpICsgYjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0IDwgKDIvMi43NSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjKig3LjU2MjUqKHQtPSgxLjUvMi43NSkpKnQgKyAuNzUpICsgYjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0IDwgKDIuNS8yLjc1KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDIuMjUvMi43NSkpKnQgKyAuOTM3NSkgKyBiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDIuNjI1LzIuNzUpKSp0ICsgLjk4NDM3NSkgKyBiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlYXNlSW5PdXRCb3VuY2U6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgICAgIGlmICh0IDwgZC8yKSByZXR1cm4gJC5lYXNpbmcuZWFzZUluQm91bmNlICh4LCB0KjIsIDAsIGMsIGQpICogLjUgKyBiO1xyXG4gICAgICAgICAgICByZXR1cm4gJC5lYXNpbmcuZWFzZU91dEJvdW5jZSAoeCwgdCoyLWQsIDAsIGMsIGQpICogLjUgKyBjKi41ICsgYjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSkpO1xyXG5cclxuIiwiZGVmaW5lKFxyXG4gICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBDbGFzc0xpYnJhcnk9e1xyXG4gICAgICAgICAgICBDbGFzc2VzOnt9LFxyXG4gICAgICAgICAgICBfY2FsbFBhcmVudDpmdW5jdGlvbiAoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJndW1lbnRzLmNhbGxlZS5jYWxsZXIgJiYgYXJndW1lbnRzLmNhbGxlZS5jYWxsZXIuZm4gPyBhcmd1bWVudHMuY2FsbGVlLmNhbGxlci5mbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogbnVsbDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgX2lzRG9udEVudW06ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHtjb25zdHJ1Y3RvcjoxfSkgaWYoa2V5PT1cImNvbnN0cnVjdG9yXCIpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBfZXh0ZW5kOmZ1bmN0aW9uKGIsZSxpc1JlY3Vyc2lvbil7XHJcbiAgICAgICAgICAgICAgICBiID0gYnx8e307XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudD1lW2tdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdHlwZT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHlwZT09XCJbb2JqZWN0IEZ1bmN0aW9uXVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkoYltrXSk9PVwiW29iamVjdCBGdW5jdGlvbl1cIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuID0gYltrXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYltrXSA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbikgYltrXS5mbiA9IGZuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKGN0eXBlPT1cIltvYmplY3QgT2JqZWN0XVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWJba10pIGJba109e31cclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmNhbGxlZShiW2tdLGVba10sdHJ1ZSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgYltrXT1jdXJyZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoIWlzUmVjdXJzaW9uJiZDbGFzc0xpYnJhcnkuX2lzRG9udEVudW0oKSYmIGIuY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29uc3RydWN0b3IgPSBiLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuY29uc3RydWN0b3IgPSBlLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuY29uc3RydWN0b3IuZm4gPSBjb25zdHJ1Y3RvcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgQ2xhc3M6ZnVuY3Rpb24oc3ViLCBtZXRob2QsIHN1cCwgYXJlYSl7XHJcbiAgICAgICAgICAgICAgICBzdXA9c3VwIHx8IE9iamVjdDtcclxuXHJcbiAgICAgICAgICAgICAgICBhcmVhID0gYXJlYSB8fCBDbGFzc0xpYnJhcnkuQ2xhc3NlcztcclxuICAgICAgICAgICAgICAgIHZhciBuYW1lO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNwYWNlID0gc3ViLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgICAgICBzcGFjZS5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICBzdWIgPSBzcGFjZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChuYW1lID0gc3BhY2UucG9wKCkpICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZWFbbmFtZV0pIGFyZWFbbmFtZV0gPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICBhcmVhID0gYXJlYVtuYW1lXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3ViY2xhc3NQcm90bz1cclxuICAgICAgICAgICAgICAgIE9iamVjdC5jcmVhdGU/XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmNyZWF0ZShzdXAucHJvdG90eXBlKTpcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgU3VwZXIgPSBmdW5jdGlvbiAoKSB7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFN1cGVyLnByb3RvdHlwZSA9IHN1cC5wcm90b3R5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU3VwZXIoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBDbGFzc0xpYnJhcnkuX2V4dGVuZChzdWJjbGFzc1Byb3RvLCBtZXRob2QpO1xyXG5cclxuICAgICAgICAgICAgICAgIHN1YiA9IGFyZWFbc3ViXSA9IHN1YmNsYXNzUHJvdG8uY29uc3RydWN0b3I7XHJcbiAgICAgICAgICAgICAgICBzdWIucHJvdG90eXBlID0gc3ViY2xhc3NQcm90bztcclxuICAgICAgICAgICAgICAgIHN1Yi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWI7XHJcbiAgICAgICAgICAgICAgICBzdWIucHJvdG90eXBlLmNhbGxQYXJlbnQgPSBDbGFzc0xpYnJhcnkuX2NhbGxQYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LkNsYXNzTGlicmFyeT1DbGFzc0xpYnJhcnk7XHJcbiAgICAgICAgcmV0dXJuIENsYXNzTGlicmFyeS5DbGFzcztcclxuICAgIH0pIiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aTtcclxuICogQ3JlYXRlRGF0ZToyMDE2LTAxLTI2XHJcbiAqXHJcbiAqIERlc2NyaWJlOiBjb21TeXNGcmFtZSBjb3JlIGxpYmFyeVxyXG4qL1xyXG5cclxuZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgIC8vQ29yZSBPYmplY3RcclxuICAgIHZhciBjb3JlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudmVyc2lvbnMgPSBcIjEuMFwiO1xyXG4gICAgfTtcclxuICAgIC8vRXhjZXB0IE1ldGhvZHNcclxuICAgIHZhciBkZSA9IFtcclxuICAgICAgICBcImhhc093blByb3BlcnR5XCIsXHJcbiAgICAgICAgXCJpc1Byb3RvdHlwZU9mXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0eUlzRW51bWVyYWJsZVwiLFxyXG4gICAgICAgIFwidG9Mb2NhbGVTdHJpbmdcIixcclxuICAgICAgICBcInRvU3RyaW5nXCIsXHJcbiAgICAgICAgXCJ2YWx1ZU9mXCJcclxuICAgIF0sXHJcblxyXG4gICAgLy9DaGVjayBFeGNlcHQgTWV0aG9kc1xyXG4gICAgZXhjZXB0ID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChkZVtpXSA9PT0gaykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvL0NvcmUgT2JqZWN0IEJhc2VkIE1ldGhvZHNcclxuICAgIGNvcmUucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBjb3JlLFxyXG4gICAgICAgIGV4dGVuZDogZnVuY3Rpb24gKG8sIGIsIGlubmVyKSB7XHJcbiAgICAgICAgICAgIGIgPSBiIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaykpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gb1trXSwgZm49bnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4Y2VwdChrKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbm5lciAmJiB0eXBlb2YgYltrXSA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIG9iaiA9PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuID0gYltrXTtcclxuICAgICAgICAgICAgICAgICAgICBiW2tdID0gb1trXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm4pIGJba10uZm4gPSBmbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29yZS5jbGFzc2VzID0ge307XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYyA9IG5ldyBjb3JlKCk7XHJcbiAgICAgICAgYy5zdXAgPSBjb3JlOyByZXR1cm4gYztcclxuICAgIH1cclxufSkiLCIvKipcclxuICogQXV0aG9yOkhlcnVpL0FkbWluaXN0cmF0b3I7XHJcbiAqIENyZWF0ZURhdGU6MjAxNi8yLzE2XHJcbiAqXHJcbiAqIERlc2NyaWJlOlxyXG4gKi9cclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcclxuICAgIH1cclxufShmdW5jdGlvbigpe1xyXG4gICAgZnVuY3Rpb24gR3VpZChnKSB7XHJcbiAgICAgICAgdmFyIGFyciA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YoZykgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBJbml0QnlTdHJpbmcoYXJyLCBnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIEluaXRCeU90aGVyKGFycik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuRXF1YWxzID0gZnVuY3Rpb24gKG8pIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgby5Jc0d1aWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLlRvU3RyaW5nKCkgPT0gby5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuSXNHdWlkID0gZnVuY3Rpb24gKCkge31cclxuICAgICAgICB0aGlzLlRvU3RyaW5nID0gZnVuY3Rpb24gKGZvcm1hdCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mKGZvcm1hdCkgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcm1hdCA9PSBcIk5cIiB8fCBmb3JtYXQgPT0gXCJEXCIgfHwgZm9ybWF0ID09IFwiQlwiIHx8IGZvcm1hdCA9PSBcIlBcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUb1N0cmluZ1dpdGhGb3JtYXQoYXJyLCBmb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRvU3RyaW5nV2l0aEZvcm1hdChhcnIsIFwiRFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUb1N0cmluZ1dpdGhGb3JtYXQoYXJyLCBcIkRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gSW5pdEJ5U3RyaW5nKGFyciwgZykge1xyXG4gICAgICAgICAgICBnID0gZy5yZXBsYWNlKC9cXHt8XFwofFxcKXxcXH18LS9nLCBcIlwiKTtcclxuICAgICAgICAgICAgZyA9IGcudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKGcubGVuZ3RoICE9IDMyIHx8IGcuc2VhcmNoKC9bXjAtOSxhLWZdL2kpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBJbml0QnlPdGhlcihhcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goZ1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gSW5pdEJ5T3RoZXIoYXJyKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gMzI7XHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIGFyci5wdXNoKFwiMFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBUb1N0cmluZ1dpdGhGb3JtYXQoYXJyLCBmb3JtYXQpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJOXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyci50b1N0cmluZygpLnJlcGxhY2UoLywvZywgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiRFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBhcnIuc2xpY2UoMCwgOCkgKyBcIi1cIiArIGFyci5zbGljZSg4LCAxMikgKyBcIi1cIiArIGFyci5zbGljZSgxMiwgMTYpICsgXCItXCIgKyBhcnIuc2xpY2UoMTYsIDIwKSArIFwiLVwiICsgYXJyLnNsaWNlKDIwLCAzMik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLywvZywgXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJCXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ciA9IFRvU3RyaW5nV2l0aEZvcm1hdChhcnIsIFwiRFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBcIntcIiArIHN0ciArIFwifVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiUFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBUb1N0cmluZ1dpdGhGb3JtYXQoYXJyLCBcIkRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gXCIoXCIgKyBzdHIgKyBcIilcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEd1aWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEd1aWQuRW1wdHkgPSBuZXcgR3VpZCgpO1xyXG4gICAgR3VpZC5OZXdHdWlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBnID0gXCJcIjtcclxuICAgICAgICB2YXIgaSA9IDMyO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgZyArPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNi4wKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgR3VpZChnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBHdWlkO1xyXG59KSk7IiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aTtcclxuICogQ3JlYXRlRGF0ZToyMDE2LTAxLTI2XHJcbiAqXHJcbiAqIERlc2NyaWJlOiBjb21TeXNGcmFtZSBDb250cm9sIEJhc2VcclxuKi9cclxuXHJcbmRlZmluZShcclxuICAgIFtcclxuICAgICAgICAnQ29yZScsXHJcbiAgICAgICAgJ0NsYXNzJyxcclxuICAgICAgICAnR3VpZCdcclxuICAgIF0sXHJcbiAgICBmdW5jdGlvbiAoQ29yZSwgQ2xhc3MsR3VpZCkge1xyXG4gICAgICAgIHZhciBDbGFzc05hbWUgPSBcIkNvbnRyb2xsLkJhc2VcIjtcclxuICAgICAgICByZXR1cm4gQ2xhc3MoQ2xhc3NOYW1lLCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3MgfHwge307XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJncyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmcgPSB7fTtcclxuICAgICAgICAgICAgICAgIGlmKGFyZ3Muc2V0dGluZylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmc9JC5leHRlbmQoe30sYXJncy5zZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NpZHMgPSBHdWlkLk5ld0d1aWQoKS5Ub1N0cmluZyhcIkRcIik7Ly9cImNsYXNzaWRzXCIgKyAoTWF0aC5yYW5kb20oKSAqIDFlKzEwKS50b0ZpeGVkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgQ29yZSk7XHJcbiAgICB9KTtcclxuIiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aS9BZG1pbmlzdHJhdG9yO1xyXG4gKiBDcmVhdGVEYXRlOjIwMTYvMi8xNlxyXG4gKlxyXG4gKiBEZXNjcmliZTpcclxuICovXHJcblxyXG5kZWZpbmUoXHJcbiAgICBbXHJcbiAgICAgICAgJ0NsYXNzJyxcclxuICAgICAgICAnY29tc3lzL2Jhc2UvQmFzZSdcclxuICAgIF0sZnVuY3Rpb24oQ2xhc3MsQmFzZSl7XHJcbiAgICAgICAgcmV0dXJuIENsYXNzKFwiQ29udHJvbC5XaWRnZXRCYXNlXCIse1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmdzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbCA9ICQoYXJncy5lbGVtZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuJEJhc2VFbC5hdHRyKFwiaWRcIikpIHRoaXMuJEJhc2VFbC5hdHRyKFwiaWRcIix0aGlzLmNsYXNzaWRzKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxCYXNlKVxyXG4gICAgfSk7IiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aTtcclxuICogQ3JlYXRlRGF0ZToyMDE2LTAxLTI2XHJcbiAqXHJcbiAqIERlc2NyaWJlOiBBcHBsaWNhdGlvbiBzZXR0aW5nXHJcbiovXHJcblxyXG4oZnVuY3Rpb24oZmFjdG9yeSl7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93LmNvbW1vbnNldHRpbmc9ZmFjdG9yeSgpO1xyXG4gICAgfVxyXG5cclxufSkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIHUgPSAvTVNJRSAoXFxkKikuMHxDaHJvbWV8RmlyZWZveC9pLmV4ZWMod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbGF5ZXJTZXR0aW5nOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IDAsXHJcbiAgICAgICAgICAgIGRlYnVnOnRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIExhYmVsU2V0dGluZzoge1xyXG4gICAgICAgICAgICBzZXQ6ZnVuY3Rpb24obm9kZSx0ZXh0KXtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09IFwiI3RleHRcIilcclxuICAgICAgICAgICAgICAgICAgICBub2RlLm5vZGVWYWx1ZSA9IHRleHQ7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVOYW1lID09IFwiU1BBTlwiKVxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHRoaXMuZ2V0Tm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUgPT0gdW5kZWZpbmVkKSByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVWYWx1ZSAmJiAhL15cXHMqJC8udGVzdChub2RlLm5vZGVWYWx1ZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZVZhbHVlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIW5vZGUubm9kZVZhbHVlICYmIG5vZGUubm9kZU5hbWUgPT0gXCJTUEFOXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0Tm9kZTogZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVmFsdWUgJiYgIS9eXFxzKiQvLnRlc3Qobm9kZS5ub2RlVmFsdWUpIHx8ICFub2RlLm5vZGVWYWx1ZSAmJiBub2RlLm5vZGVOYW1lID09IFwiU1BBTlwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gbm9kZS5uZXh0U2libGluZyAmJiAobm9kZS5uZXh0U2libGluZy5ub2RlTmFtZSA9PSBcIlNQQU5cIiB8fCBub2RlLm5leHRTaWJsaW5nLm5vZGVOYW1lID09IFwiI3RleHRcIikgPyBhcmd1bWVudHMuY2FsbGVlKG5vZGUubmV4dFNpYmxpbmcpIDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIEVmZmVjdDp7XHJcbiAgICAgICAgICAgIHdpbmRvdzpcImZvcndhcmRcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgQnJvd3NlcjpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDsgLy/lj5blvpfmtY/op4jlmajnmoR1c2VyQWdlbnTlrZfnrKbkuLJcclxuICAgICAgICAgICAgdmFyIGlzT3BlcmEgPSB1c2VyQWdlbnQuaW5kZXhPZihcIk9wZXJhXCIpID4gLTE7IC8v5Yik5pat5piv5ZCmT3BlcmHmtY/op4jlmahcclxuICAgICAgICAgICAgdmFyIGlzSUUgPSB1c2VyQWdlbnQuaW5kZXhPZihcImNvbXBhdGlibGVcIikgPiAtMSAmJiB1c2VyQWdlbnQuaW5kZXhPZihcIk1TSUVcIikgPiAtMSAmJiAhaXNPcGVyYXx8dXNlckFnZW50LmluZGV4T2YoJ1RyaWRlbnQnKT4tMSYmdXNlckFnZW50LmluZGV4T2YoJ3J2OicpPi0xOyAvL+WIpOaWreaYr+WQpklF5rWP6KeI5ZmoXHJcbiAgICAgICAgICAgIHZhciBpc0ZGID0gdXNlckFnZW50LmluZGV4T2YoXCJGaXJlZm94XCIpID4gLTE7IC8v5Yik5pat5piv5ZCmRmlyZWZveOa1j+iniOWZqFxyXG4gICAgICAgICAgICB2YXIgaXNTYWZhcmkgPSB1c2VyQWdlbnQuaW5kZXhPZihcIlNhZmFyaVwiKSA+IC0xJiZ1c2VyQWdlbnQuaW5kZXhPZihcIkNocm9tZVwiKT09LTEmJnVzZXJBZ2VudC5pbmRleE9mKCdFZGdlJyk9PS0xOyAvL+WIpOaWreaYr+WQplNhZmFyaea1j+iniOWZqFxyXG4gICAgICAgICAgICB2YXIgaXNDaHJvbWU9dXNlckFnZW50LmluZGV4T2YoXCJDaHJvbWVcIikgPiAtMSYmdXNlckFnZW50LmluZGV4T2YoJ0VkZ2UnKT09LTE7XHJcbiAgICAgICAgICAgIHZhciBpc0VkZ2U9dXNlckFnZW50LmluZGV4T2YoJ0VkZ2UnKT4tMTtcclxuICAgICAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgICAgICAgIC9NU0lFIChcXGQrXFwuXFxkKyk7fHJ2OihcXGQrXFwuXFxkKykvLnRlc3QodXNlckFnZW50KTtcclxuICAgICAgICAgICAgICAgIHZhciBJRVZlcnNpb24gPSBwYXJzZUludChSZWdFeHAuJDF8fFJlZ0V4cC4kMik7XHJcbiAgICAgICAgICAgICAgICBpZihJRVZlcnNpb24pIHJldHVybiAnSUUnICsgSUVWZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiAnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0ZGKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiRkZcIjtcclxuICAgICAgICAgICAgaWYgKGlzT3BlcmEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJPcGVyYVwiO1xyXG4gICAgICAgICAgICBpZiAoaXNTYWZhcmkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJTYWZhcmlcIjtcclxuICAgICAgICAgICAgaWYoaXNDaHJvbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJDaHJvbWVcIjtcclxuICAgICAgICAgICAgaWYoaXNFZGdlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiRWRnZVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBOYXZpZ2F0b3I6IHtcclxuICAgICAgICAgICAgTG93SUVPck5vSUU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1ICE9PSBudWxsICYmIH5+dVsxXSA8IDg7XHJcbiAgICAgICAgICAgIH0oKSxcclxuICAgICAgICAgICAgSXNJRTg6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1ID09PSBudWxsID9mYWxzZTp+fnVbMV0gPT0gODtcclxuICAgICAgICAgICAgfSgpLFxyXG4gICAgICAgICAgICBJc0JhY2tDb21wYXQ6ZG9jdW1lbnQuY29tcGF0TW9kZT09XCJCYWNrQ29tcGF0XCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pXHJcbiIsIi8qKlxyXG4gKiBBdXRob3I6SGVydWkvQWRtaW5pc3RyYXRvcjtcclxuICogQ3JlYXRlRGF0ZToyMDE2LzIvMTZcclxuICpcclxuICogRGVzY3JpYmU6XHJcbiAqL1xyXG5kZWZpbmUoW1xyXG4gICAgXCJDbGFzc1wiLFxyXG4gICAgXCIuL1dpZGdldEJhc2VcIixcclxuICAgIFwiY29tbW9uL3NldHRpbmdcIlxyXG5dLGZ1bmN0aW9uKENsYXNzLFdpZGdldEJhc2UsU2V0dGluZyl7XHJcbiAgICB2YXIgQ2xhc3NOYW1lID0gXCJDb250cm9sLkxhYmVsQmFzZVwiO1xyXG4gICAgcmV0dXJuIENsYXNzKENsYXNzTmFtZSx7XHJcbiAgICAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChhcmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmdzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsUGFyZW50KCk7XHJcbiAgICAgICAgICAgIHZhciBpZD10aGlzLiRCYXNlRWwuYXR0cihcImlkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLiRMYWJlbFRleHQ9bnVsbDtcclxuICAgICAgICAgICAgaWYoaWQmJnRoaXMuJEJhc2VFbC5wYXJlbnQoKS5maW5kKFwibGFiZWxbZm9yPVwiK2lkK1wiXVwiKS5sZW5ndGghPTApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsQ29udGFpbmVyID0gdGhpcy4kQmFzZUVsLnBhcmVudCgpLmZpbmQoXCJsYWJlbFtmb3I9XCIgKyBpZCArIFwiXVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVMYWJlbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kTGFiZWxDb250YWluZXIgPSAkKFwiPGxhYmVsIGZvcj1cXFwiXCIgKyB0aGlzLiRCYXNlRWwuYXR0cihcImlkXCIpICsgXCJcXFwiPjwvbGFiZWw+XCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JhcExhYmVsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vdmVMYWJlbDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgZGF0YT10aGlzLiRCYXNlRWwuZGF0YShDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIGRhdGE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5hZnRlcih0aGlzLiRMYWJlbENvbnRhaW5lcikuYXBwZW5kVG8odGhpcy4kTGFiZWxDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9ZWxzZSByZXR1cm4gZGF0YTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdyYXBMYWJlbDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgJHBhcmVudD10aGlzLiRCYXNlRWwucGFyZW50KCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhPXRoaXMuJEJhc2VFbC5kYXRhKENsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICggZGF0YT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gdGhpcy4kQmFzZUVsLmF0dHIoJ2NzLWxhYmVsLWxvY2F0aW9uJykgfHwgXCJyaWdodFwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRwYXJlbnRbMF0ubm9kZU5hbWUgIT0gXCJMQUJFTFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSAwLCBub2RlcyA9ICRwYXJlbnRbMF0uY2hpbGROb2RlcywgbztcclxuICAgICAgICAgICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoKG8gPSBub2Rlc1tpKytdKSAmJiBvICE9IHRoaXMuJEJhc2VFbFswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kQmFzZUVsLmFmdGVyKHRoaXMuJExhYmVsQ29udGFpbmVyKS5hcHBlbmRUbyh0aGlzLiRMYWJlbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kTGFiZWxUZXh0ID0gU2V0dGluZy5MYWJlbFNldHRpbmcuZ2V0Tm9kZShub2Rlc1tpXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5hdHRyKFwiZGF0YS1sYWJlbFwiLCAkLnRyaW0oU2V0dGluZy5MYWJlbFNldHRpbmcuZ2V0KHRoaXMuJExhYmVsVGV4dCkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCRwYXJlbnRbMF0uY2hpbGROb2Rlcy5sZW5ndGg+PTIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwuYXR0cihcImRhdGEtbGFiZWxcIiwgJC50cmltKFNldHRpbmcuTGFiZWxTZXR0aW5nLmdldCgkcGFyZW50WzBdLmNoaWxkTm9kZXNbMV0pKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsVGV4dD1TZXR0aW5nLkxhYmVsU2V0dGluZy5nZXROb2RlKCRwYXJlbnRbMF0uY2hpbGROb2Rlc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsVGV4dD1kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsQ29udGFpbmVyID0gJHBhcmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYobG9jYXRpb24gPT09IFwibGVmdFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsQ29udGFpbmVyLnByZXBlbmQodGhpcy4kTGFiZWxUZXh0KTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRMYWJlbENvbnRhaW5lci5hcHBlbmQodGhpcy4kTGFiZWxUZXh0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJExhYmVsQ29udGFpbmVyLmFkZENsYXNzKFwibG9jYXRpb24tXCIgKyBsb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy/lpoLmnpzlkKvmnIljcy1sYWJlbC1vbi9jcy1sYWJlbC1vZmbliJnmm7/mjaLlhoXlrrlcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWw9dGhpcy4kQmFzZUVsLmF0dHIoXCJjcy1sYWJlbFwiKSB8fCAkLnRyaW0oU2V0dGluZy5MYWJlbFNldHRpbmcuZ2V0KHRoaXMuJExhYmVsVGV4dCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbiA9IHRoaXMuJEJhc2VFbC5hdHRyKFwiY3MtbGFiZWwtb25cIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9mZj10aGlzLiRCYXNlRWwuYXR0cihcImNzLWxhYmVsLW9mZlwiKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubGFiZWx8fHRoaXMub258fHRoaXMub2ZmKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuJEJhc2VFbC5pcyhcIjpjaGVja2VkXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBTZXR0aW5nLkxhYmVsU2V0dGluZy5zZXQodGhpcy4kTGFiZWxUZXh0LHRoaXMub24gfHwgdGhpcy5sYWJlbClcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNldHRpbmcuTGFiZWxTZXR0aW5nLnNldCh0aGlzLiRMYWJlbFRleHQsdGhpcy5vZmYgfHwgdGhpcy5sYWJlbClcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfWVsc2UgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgfSxXaWRnZXRCYXNlKVxyXG59KSIsIi8qKlxyXG4gKiBBdXRob3I6SGVydWkvQWRtaW5pc3RyYXRvcjtcclxuICogQ3JlYXRlRGF0ZToyMDE2LzIvMTZcclxuICpcclxuICogRGVzY3JpYmU6XHJcbiAqL1xyXG5cclxuZGVmaW5lKFxyXG4gICAgW1xyXG4gICAgICAgICdDbGFzcycsXHJcbiAgICAgICAgJy4vYmFzZUNsYXNzL0xhYmVsQmFzZScsXHJcbiAgICAgICAgJ2NvbW1vbi9zZXR0aW5nJ1xyXG4gICAgXSxcclxuICAgIGZ1bmN0aW9uKENsYXNzLCBMYWJlbEJhc2UsU2V0dGluZykge1xyXG4gICAgICAgIHZhciBDbGFzc05hbWUgPSBcIkNvbnRyb2wuQ2hlY2tCb3hcIjtcclxuXHJcbiAgICAgICAgdmFyIENoZWNrQm94ID0gQ2xhc3MoQ2xhc3NOYW1lLCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJncyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRDaGVja0JveEVsID0gJChhcmdzLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9IHRoaXMuJENoZWNrQm94RWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShDbGFzc05hbWUpID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCA9ICR0aGlzLmF0dHIoXCJpZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9udHlwZT0odGhpcy5zZXR0aW5nLmJ1dHRvbnR5cGU/IFwiIFwiICsgdGhpcy5zZXR0aW5nLmJ1dHRvbnR5cGUgKyBcIiBcIjpcIlwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbCA9ICQoJzxkaXYgY2xhc3M9XCJjb21zeXMtY2hlY2tib3gnICsgYnV0dG9udHlwZSArICgkdGhpcy5nZXQoMCkuY2hlY2tlZCA/IFwiIGNoZWNrYm94LWNoZWNrZWRcIiA6IFwiXCIpICsgKCAkdGhpcy5pcyhcIjpkaXNhYmxlZFwiKSA/ICcgZGlzYWJsZWQnIDogJycpICsgJ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkd3JhcCA9IHRoaXMuJENoZWNrQm94Q29udHJvbDtcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5iZWZvcmUoJHdyYXApLmFwcGVuZFRvKCR3cmFwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkd3JhcC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHBhcmVudC5nZXQoMCkubm9kZU5hbWUgPT0gXCJMQUJFTFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRwYXJlbnQuYWRkQ2xhc3MoXCJjb21zeXMtY2hlY2tib3gtbGFiZWxcIikuYXR0cihcImZvclwiLCBpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2V0dGluZy5pc0RvY3VtZW50QmluZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2suQ2hlY2tCb3hDbGlja0hhbmRsZXJcIitpZCxcIiNcIiArIGlkLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNoZWNrZWRDaGFuZ2UodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLm9mZignY2xpY2suQ2hlY2tCb3hDbGlja0hhbmRsZXInKS5vbignY2xpY2suQ2hlY2tCb3hDbGlja0hhbmRsZXInLGZ1bmN0aW9uKGUsIHN0YXRlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2hlY2tlZENoYW5nZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YShDbGFzc05hbWUsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0ID0gJHRoaXMuZGF0YShDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tlZENoYW5nZS5hcHBseSh0aGF0LCR0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBTZXREaXNhYmxlZDpmdW5jdGlvbihzdGF0dXMpe1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhdHVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5hdHRyKFwiZGlzYWJsZWRcIix0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRDaGVja0JveENvbnRyb2wuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgU2V0Q2hlY2s6ZnVuY3Rpb24oc3RhdHVzKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0YXR1cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwuZ2V0KDApLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbC5yZW1vdmVDbGFzcygnY2hlY2tib3gtY2hlY2tlZCcpLmFkZENsYXNzKFwiY2hlY2tib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwuZ2V0KDApLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRDaGVja0JveENvbnRyb2wucmVtb3ZlQ2xhc3MoXCJjaGVja2JveC1jaGVja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjaGVja2VkQ2hhbmdlOmZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgICAgIHZhciB0aGF0PXRoaXM7XHJcbiAgICAgICAgICAgICAgICBpZigkKGVsKS5pcyhcIjpjaGVja2VkXCIpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJENoZWNrQm94Q29udHJvbC5hZGRDbGFzcyhcImNoZWNrYm94LWNoZWNrZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZy5MYWJlbFNldHRpbmcuc2V0KHRoYXQuJExhYmVsVGV4dCx0aGF0Lm9uIHx8IHRoYXQubGFiZWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC4kQ2hlY2tCb3hDb250cm9sLnJlbW92ZUNsYXNzKFwiY2hlY2tib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBTZXR0aW5nLkxhYmVsU2V0dGluZy5zZXQodGhhdC4kTGFiZWxUZXh0LHRoYXQub2ZmIHx8IHRoYXQubGFiZWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc3Rvcnk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKFwiLkNoZWNrQm94Q2xpY2tIYW5kbGVyXCIgKyB0aGlzLiRDaGVja0JveEVsLmF0dHIoXCJpZFwiKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwub2ZmKCdjbGljay5DaGVja0JveENsaWNrSGFuZGxlcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kQ2hlY2tCb3hDb250cm9sLnBhcmVudCgpLnJlbW92ZUF0dHIoXCJzdHlsZVwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbC5hZnRlcih0aGlzLiRDaGVja0JveEVsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94RWwucmVtb3ZlRGF0YShDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgTGFiZWxCYXNlKTtcclxuXHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBDaGVja0JveEluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2V0dGluZyA9IHsgYnV0dG9udHlwZTogJCh0aGlzKS5hdHRyKCdjcy1idXR0b24tdHlwZScpIHx8ICcnICxpc0RvY3VtZW50QmluZDogJCh0aGlzKS5hdHRyKCdjcy1pc2RvY3VtZW50YmluZCcpID09PSAndHJ1ZScgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDaGVja0JveCh7IGVsZW1lbnQ6IHRoaXMsIHNldHRpbmc6IHNldHRpbmcgfSkuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSkucmVtb3ZlQXR0cignY3MtY29udHJvbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBDaGVja0JveDtcclxuICAgIH1cclxuKVxyXG4iLCIvKipcclxuICogQXV0aG9yOkhlcnVpL0FkbWluaXN0cmF0b3I7XHJcbiAqIENyZWF0ZURhdGU6MjAxNi8yLzE2XHJcbiAqXHJcbiAqIERlc2NyaWJlOlxyXG4gKi9cclxuXHJcbmRlZmluZShcclxuICAgIFtcclxuICAgICAgICAnQ2xhc3MnLFxyXG4gICAgICAgICcuL2Jhc2VDbGFzcy9MYWJlbEJhc2UnXHJcbiAgICBdLFxyXG4gICAgZnVuY3Rpb24gKENsYXNzLCBMYWJlbEJhc2UpIHtcclxuICAgICAgICB2YXIgQ2xhc3NOYW1lID0gXCJDb250cm9sLlJhZGlvQm94XCI7XHJcblxyXG4gICAgICAgIHZhciBSYWRpb0JveCA9IENsYXNzKENsYXNzTmFtZSwge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmdzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJFJhZGlvQm94RWwgPSAkKGFyZ3MuZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRncm91cCA9ICQoXCJpbnB1dFtuYW1lPVwiICsgdGhpcy4kUmFkaW9Cb3hFbC5hdHRyKFwibmFtZVwiKSArIFwiXVwiKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gdGhpcy4kUmFkaW9Cb3hFbDtcclxuICAgICAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKENsYXNzTmFtZSkgPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZD0kdGhpcy5hdHRyKFwiaWRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJFJhZGlvQm94Q29udHJvbCA9ICQoJzxkaXYgY2xhc3M9XCJjb21zeXMtcmFkaW9ib3gnICsgKCR0aGlzLmdldCgwKS5jaGVja2VkID8gXCIgcmFkaW9ib3gtY2hlY2tlZFwiIDogXCJcIikgKyAoICR0aGlzLmlzKFwiOmRpc2FibGVkXCIpID8gJyBkaXNhYmxlZCcgOiAnJykgKyAnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR3cmFwID0gdGhpcy4kUmFkaW9Cb3hDb250cm9sO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmJlZm9yZSgkd3JhcCkuYXBwZW5kVG8oJHdyYXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudD0kd3JhcC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkcGFyZW50LmdldCgwKS5ub2RlTmFtZT09XCJMQUJFTFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRwYXJlbnQuYWRkQ2xhc3MoXCJjb21zeXMtY2hlY2tib3gtbGFiZWxcIikuYXR0cihcImZvclwiLCBpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgJGdyb3VwID0gJChcImlucHV0W25hbWU9XCIgKyAkdGhpcy5hdHRyKFwibmFtZVwiKSArIFwiXVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zZXR0aW5nLmlzRG9jdW1lbnRCaW5kKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGljay5SYWRpb0JveENsaWNrSGFuZGxlclwiICsgaWQsIFwiI1wiICsgaWQsIGZ1bmN0aW9uIChlLCBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCR3cmFwKS5hZGRDbGFzcyhcInJhZGlvYm94LWNoZWNrZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICQoJHdyYXApLnJlbW92ZUNsYXNzKFwicmFkaW9ib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC4kZ3JvdXAubm90KHRoaXMpLnRyaWdnZXIoXCJyYWRpb0NoYW5nZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLm9mZignY2xpY2suUmFkaW9Cb3hDbGlja0hhbmRsZXInKS5vbignY2xpY2suUmFkaW9Cb3hDbGlja0hhbmRsZXInLGZ1bmN0aW9uKGUsIHN0YXRlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgkd3JhcCkuYWRkQ2xhc3MoXCJyYWRpb2JveC1jaGVja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSAkKCR3cmFwKS5yZW1vdmVDbGFzcyhcInJhZGlvYm94LWNoZWNrZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJGdyb3VwLm5vdCh0aGlzKS50cmlnZ2VyKFwicmFkaW9DaGFuZ2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLm9uKFwicmFkaW9DaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgkd3JhcCkuYWRkQ2xhc3MoXCJyYWRpb2JveC1jaGVja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlICQoJHdyYXApLnJlbW92ZUNsYXNzKFwicmFkaW9ib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YShDbGFzc05hbWUsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhhdCA9ICR0aGlzLmRhdGEoQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5pcyhcIjpjaGVja2VkXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LiRSYWRpb0JveENvbnRyb2wuYWRkQ2xhc3MoXCJyYWRpb2JveC1jaGVja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC4kUmFkaW9Cb3hDb250cm9sLnJlbW92ZUNsYXNzKFwicmFkaW9ib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBTZXREaXNhYmxlZDpmdW5jdGlvbihzdGF0dXMpe1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhdHVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5hdHRyKFwiZGlzYWJsZWRcIix0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRDaGVja0JveENvbnRyb2wuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJENoZWNrQm94Q29udHJvbC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgU2V0Q2hlY2s6ZnVuY3Rpb24oc3RhdHVzKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0YXR1cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwuZ2V0KDApLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJFJhZGlvQm94Q29udHJvbC5yZW1vdmVDbGFzcygncmFkaW9ib3gtY2hlY2tlZCcpLmFkZENsYXNzKFwicmFkaW9ib3gtY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRCYXNlRWwuZ2V0KDApLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRSYWRpb0JveENvbnRyb2wucmVtb3ZlQ2xhc3MoXCJyYWRpb2JveC1jaGVja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kZ3JvdXAubm90KHRoaXMuJEJhc2VFbCkudHJpZ2dlcihcInJhZGlvQ2hhbmdlXCIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXN0b3J5OmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCIuUmFkaW9Cb3hDbGlja0hhbmRsZXJcIit0aGlzLiRSYWRpb0JveEVsLmF0dHIoXCJpZFwiKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRSYWRpb0JveENvbnRyb2wucGFyZW50KCkucmVtb3ZlQXR0cihcInN0eWxlXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kUmFkaW9Cb3hDb250cm9sLmFmdGVyKHRoaXMuJFJhZGlvQm94RWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kUmFkaW9Cb3hDb250cm9sLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgTGFiZWxCYXNlKTtcclxuXHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBSYWRpb0JveEluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXR0aW5nID0geyBidXR0b250eXBlOiAkKHRoaXMpLmF0dHIoJ2RhdGEtYnV0dG9udHlwZScpIHx8ICcnICxpc0RvY3VtZW50QmluZDogJCh0aGlzKS5hdHRyKCdkYXRhLWlzZG9jdW1lbnRiaW5kJykgfHwgZmFsc2UgIH1cclxuICAgICAgICAgICAgICAgICAgICBuZXcgUmFkaW9Cb3goe2VsZW1lbnQ6IHRoaXMgLCBzZXR0aW5nIDogc2V0dGluZ30pLmluaXRpYWxpemUoKTtcclxuICAgICAgICAgICAgICAgIH0pLnJlbW92ZUF0dHIoJ2NzLWNvbnRyb2wnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gUmFkaW9Cb3g7XHJcbiAgICB9XHJcbikiLCIvKipcclxuICogQXV0aG9yOkhlcnVpO1xyXG4gKiBDcmVhdGVEYXRlOjIwMTYtMDEtMjZcclxuICpcclxuICogRGVzY3JpYmU6IGNvbVN5c0ZyYW1lIGpzIHRlbXBsZXRlIGVuZ2luZVxyXG4qL1xyXG5cclxuZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgVFBMRW5naW5lO1xyXG5cclxuICAgIFRQTEVuZ2luZSA9IHtcclxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICh0cGwsIGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZHJhdyh0cGwsIGRhdGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhd2xheW91dDogZnVuY3Rpb24gKHRwbCwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcmVnID0gL0BcXHtsYXlvdXQ6KFtcXHNcXFNdKj8pXFx9QC9nLCByZWdSZW5kZXIgPSAvQFxce2xheW91dFxcfUAvLCBtYXRjaDtcclxuICAgICAgICAgICAgaWYgKChtYXRjaCA9IHJlZy5leGVjKHRwbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29kZSA9IFwidmFyIHI9W107XFxuXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBtYXRjaFsxXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgY29kZSArPSBcInIucHVzaChUUExFbmdpbmUuZHJhdyhcIiArIHBhcmFtWzBdICsgXCIsXCIgKyBwYXJhbVsxXSArIFwiKSk7XFxuXCI7XHJcbiAgICAgICAgICAgICAgICBjb2RlICs9ICdyZXR1cm4gci5qb2luKFwiXCIpOyc7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFydCA9IG5ldyBGdW5jdGlvbihcIlRQTEVuZ2luZVwiLCBjb2RlLnJlcGxhY2UoL1tcXHJcXHRcXG5dL2csICcnKSkuYXBwbHkoZGF0YSwgW1RQTEVuZ2luZV0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnQucmVwbGFjZShyZWdSZW5kZXIsIHRwbC5zbGljZShtYXRjaFswXS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OiBmdW5jdGlvbiAodHBsLCBkYXRhLCAkcGFyZW50KSB7XHJcbiAgICAgICAgICAgICRwYXJlbnQgPSAkcGFyZW50IHx8IGRhdGE7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdHBsO1xyXG4gICAgICAgICAgICAoKGNvbnRlbnQgPSB0aGlzLmRyYXdsYXlvdXQoY29udGVudCwgZGF0YSkpICE9PSBmYWxzZSkgPyB0cGwgPSBjb250ZW50IDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB2YXIgcmVnID0gLzwlKFtcXHNcXFNdKj8pJT58QFxce3NlY3Rpb246KFtcXHNcXFNdKj8pXFx9QC9nLFxyXG5cdFx0XHRcdHJlZ091dCA9IC9eXFxzKj1cXHMqKFtcXHNcXFNdKikkLyxcclxuXHRcdFx0XHRjb2RlID0gJ3ZhciByPVtdO1xcbicsXHJcblx0XHRcdFx0Y3Vyc29yID0gMCxcclxuXHRcdFx0XHRtYXRjaCwgZSwgbGluZTtcclxuICAgICAgICAgICAgdmFyIGFkZCA9IGZ1bmN0aW9uIChtYXRjaCwganMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWN0aW9uID0gKG1hdGNoWzFdID09PSB1bmRlZmluZWQgfHwgbWF0Y2hbMV0gPT09IFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgbGluZSA9ICh0eXBlb2YgbWF0Y2ggPT0gJ3N0cmluZycgPyBtYXRjaCA6IChzZWN0aW9uID8gbWF0Y2hbMl0gOiBtYXRjaFsxXSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gbGluZS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHBhcmFtLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtLmpvaW4oXCIsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9IFwidGhpcy4kcGFyZW50PSRwYXJlbnQ7ci5wdXNoKFRQTEVuZ2luZS5kcmF3KFwiICsgaXRlbSArIFwiLFwiICsgcGFyYW0gKyBcIix0aGlzKSk7XFxuXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGUgPSByZWdPdXQuZXhlYyhsaW5lKSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSArPSBsaW5lICsgJ1xcbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9ICdyLnB1c2goJyArIGVbMV0gKyAnKTtcXG4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmUgIT0gJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgKz0gJ3IucHVzaChcIicgKyBsaW5lLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIik7XFxuJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBhZGQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHJlZy5leGVjKHRwbCkpKSB7XHJcbiAgICAgICAgICAgICAgICBhZGQodHBsLnNsaWNlKGN1cnNvciwgbWF0Y2guaW5kZXgpKShtYXRjaCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBjdXJzb3IgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGQodHBsLnN1YnN0cihjdXJzb3IsIHRwbC5sZW5ndGggLSBjdXJzb3IpKTtcclxuICAgICAgICAgICAgY29kZSArPSAncmV0dXJuIHIuam9pbihcIlwiKTsnO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiJHBhcmVudFwiLCBcIlRQTEVuZ2luZVwiLCBjb2RlLnJlcGxhY2UoL1tcXHJcXHRcXG5dL2csICcnKSkuYXBwbHkoZGF0YSwgWyRwYXJlbnQsIFRQTEVuZ2luZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gVFBMRW5naW5lO1xyXG5cclxufSk7IiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aS9BZG1pbmlzdHJhdG9yO1xyXG4gKiBDcmVhdGVEYXRlOjIwMTYvMi8xNlxyXG4gKlxyXG4gKiBEZXNjcmliZTpcclxuICovXHJcblxyXG5kZWZpbmUoXHJcbiAgICBbXHJcbiAgICAgICAgJ0NsYXNzJyxcclxuICAgICAgICAnLi9XaWRnZXRCYXNlJ1xyXG4gICAgXSxmdW5jdGlvbihDbGFzcyxXaWRnZXRCYXNlKXtcclxuICAgICAgICByZXR1cm4gQ2xhc3MoXCJDb250cm9sLkhpZGRlbkJhc2VcIix7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsUGFyZW50KGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kSGlkZGVuQmFzZUVsQ29udGFpbmVyPSQoXCI8ZGl2IGNsYXNzPVxcXCJjb21zeXMtaGlkZGVuLWNvbnRhaW5lclxcXCI+PC9kaXY+XCIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRQbGFjZUhvbGRlckJlZm9yZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5zZXR0aW5nLmFkZFBsYWNlSG9sZGVyQmVmb3JlKSB0aGlzLnNldHRpbmcuYWRkUGxhY2VIb2xkZXJCZWZvcmUuY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkUGxhY2VIb2xkZXJBZnRlcjpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5zZXR0aW5nLmFkZFBsYWNlSG9sZGVyQWZ0ZXIpIHRoaXMuc2V0dGluZy5hZGRQbGFjZUhvbGRlckFmdGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFkZFBsYWNlSG9sZGVyOmZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBsYWNlSG9sZGVyQmVmb3JlKCk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYXBwZW5kKHRoaXMuJEhpZGRlbkJhc2VFbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBsYWNlSG9sZGVyQWZ0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sV2lkZ2V0QmFzZSlcclxuICAgIH0pOyIsIi8qIVxyXG4gKiBqUXVlcnkgTW91c2V3aGVlbCAzLjEuMTNcclxuICpcclxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcclxuICovXHJcblxyXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcclxuICAgIGlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIC8vIE5vZGUvQ29tbW9uSlMgc3R5bGUgZm9yIEJyb3dzZXJpZnlcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xyXG4gICAgICAgIGZhY3RvcnkoKTtcclxuICAgIH1cclxufShmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIHRvRml4ICA9IFsnd2hlZWwnLCAnbW91c2V3aGVlbCcsICdET01Nb3VzZVNjcm9sbCcsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJ10sXHJcbiAgICAgICAgdG9CaW5kID0gKCAnb253aGVlbCcgaW4gZG9jdW1lbnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID49IDkgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgWyd3aGVlbCddIDogWydtb3VzZXdoZWVsJywgJ0RvbU1vdXNlU2Nyb2xsJywgJ01vek1vdXNlUGl4ZWxTY3JvbGwnXSxcclxuICAgICAgICBzbGljZSAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXHJcbiAgICAgICAgbnVsbExvd2VzdERlbHRhVGltZW91dCwgbG93ZXN0RGVsdGE7XHJcblxyXG4gICAgaWYgKCAkLmV2ZW50LmZpeEhvb2tzICkge1xyXG4gICAgICAgIGZvciAoIHZhciBpID0gdG9GaXgubGVuZ3RoOyBpOyApIHtcclxuICAgICAgICAgICAgJC5ldmVudC5maXhIb29rc1sgdG9GaXhbLS1pXSBdID0gJC5ldmVudC5tb3VzZUhvb2tzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3BlY2lhbCA9ICQuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsID0ge1xyXG4gICAgICAgIHZlcnNpb246ICczLjEuMTInLFxyXG5cclxuICAgICAgICBzZXR1cDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICggdGhpcy5hZGRFdmVudExpc3RlbmVyICkge1xyXG4gICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSB0b0JpbmQubGVuZ3RoOyBpOyApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoIHRvQmluZFstLWldLCBoYW5kbGVyLCBmYWxzZSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbm1vdXNld2hlZWwgPSBoYW5kbGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBsaW5lIGhlaWdodCBhbmQgcGFnZSBoZWlnaHQgZm9yIHRoaXMgcGFydGljdWxhciBlbGVtZW50XHJcbiAgICAgICAgICAgICQuZGF0YSh0aGlzLCAnbW91c2V3aGVlbC1saW5lLWhlaWdodCcsIHNwZWNpYWwuZ2V0TGluZUhlaWdodCh0aGlzKSk7XHJcbiAgICAgICAgICAgICQuZGF0YSh0aGlzLCAnbW91c2V3aGVlbC1wYWdlLWhlaWdodCcsIHNwZWNpYWwuZ2V0UGFnZUhlaWdodCh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdGVhcmRvd246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciApIHtcclxuICAgICAgICAgICAgICAgIGZvciAoIHZhciBpID0gdG9CaW5kLmxlbmd0aDsgaTsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCB0b0JpbmRbLS1pXSwgaGFuZGxlciwgZmFsc2UgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25tb3VzZXdoZWVsID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgZGF0YSB3ZSBhZGRlZCB0byB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgICAkLnJlbW92ZURhdGEodGhpcywgJ21vdXNld2hlZWwtbGluZS1oZWlnaHQnKTtcclxuICAgICAgICAgICAgJC5yZW1vdmVEYXRhKHRoaXMsICdtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0Jyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0TGluZUhlaWdodDogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLFxyXG4gICAgICAgICAgICAgICAgJHBhcmVudCA9ICRlbGVtWydvZmZzZXRQYXJlbnQnIGluICQuZm4gPyAnb2Zmc2V0UGFyZW50JyA6ICdwYXJlbnQnXSgpO1xyXG4gICAgICAgICAgICBpZiAoISRwYXJlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkcGFyZW50ID0gJCgnYm9keScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCgkcGFyZW50LmNzcygnZm9udFNpemUnKSwgMTApIHx8IHBhcnNlSW50KCRlbGVtLmNzcygnZm9udFNpemUnKSwgMTApIHx8IDE2O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFBhZ2VIZWlnaHQ6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoZWxlbSkuaGVpZ2h0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgYWRqdXN0T2xkRGVsdGFzOiB0cnVlLCAvLyBzZWUgc2hvdWxkQWRqdXN0T2xkRGVsdGFzKCkgYmVsb3dcclxuICAgICAgICAgICAgbm9ybWFsaXplT2Zmc2V0OiB0cnVlICAvLyBjYWxscyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgZm9yIGVhY2ggZXZlbnRcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm4uZXh0ZW5kKHtcclxuICAgICAgICBtb3VzZXdoZWVsOiBmdW5jdGlvbihmbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZm4gPyB0aGlzLmJpbmQoJ21vdXNld2hlZWwnLCBmbikgOiB0aGlzLnRyaWdnZXIoJ21vdXNld2hlZWwnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1bm1vdXNld2hlZWw6IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVuYmluZCgnbW91c2V3aGVlbCcsIGZuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlcihldmVudCkge1xyXG4gICAgICAgIHZhciBvcmdFdmVudCAgID0gZXZlbnQgfHwgd2luZG93LmV2ZW50LFxyXG4gICAgICAgICAgICBhcmdzICAgICAgID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxyXG4gICAgICAgICAgICBkZWx0YSAgICAgID0gMCxcclxuICAgICAgICAgICAgZGVsdGFYICAgICA9IDAsXHJcbiAgICAgICAgICAgIGRlbHRhWSAgICAgPSAwLFxyXG4gICAgICAgICAgICBhYnNEZWx0YSAgID0gMCxcclxuICAgICAgICAgICAgb2Zmc2V0WCAgICA9IDAsXHJcbiAgICAgICAgICAgIG9mZnNldFkgICAgPSAwO1xyXG4gICAgICAgIGV2ZW50ID0gJC5ldmVudC5maXgob3JnRXZlbnQpO1xyXG4gICAgICAgIGV2ZW50LnR5cGUgPSAnbW91c2V3aGVlbCc7XHJcblxyXG4gICAgICAgIC8vIE9sZCBzY2hvb2wgc2Nyb2xsd2hlZWwgZGVsdGFcclxuICAgICAgICBpZiAoICdkZXRhaWwnICAgICAgaW4gb3JnRXZlbnQgKSB7IGRlbHRhWSA9IG9yZ0V2ZW50LmRldGFpbCAqIC0xOyAgICAgIH1cclxuICAgICAgICBpZiAoICd3aGVlbERlbHRhJyAgaW4gb3JnRXZlbnQgKSB7IGRlbHRhWSA9IG9yZ0V2ZW50LndoZWVsRGVsdGE7ICAgICAgIH1cclxuICAgICAgICBpZiAoICd3aGVlbERlbHRhWScgaW4gb3JnRXZlbnQgKSB7IGRlbHRhWSA9IG9yZ0V2ZW50LndoZWVsRGVsdGFZOyAgICAgIH1cclxuICAgICAgICBpZiAoICd3aGVlbERlbHRhWCcgaW4gb3JnRXZlbnQgKSB7IGRlbHRhWCA9IG9yZ0V2ZW50LndoZWVsRGVsdGFYICogLTE7IH1cclxuXHJcbiAgICAgICAgLy8gRmlyZWZveCA8IDE3IGhvcml6b250YWwgc2Nyb2xsaW5nIHJlbGF0ZWQgdG8gRE9NTW91c2VTY3JvbGwgZXZlbnRcclxuICAgICAgICBpZiAoICdheGlzJyBpbiBvcmdFdmVudCAmJiBvcmdFdmVudC5heGlzID09PSBvcmdFdmVudC5IT1JJWk9OVEFMX0FYSVMgKSB7XHJcbiAgICAgICAgICAgIGRlbHRhWCA9IGRlbHRhWSAqIC0xO1xyXG4gICAgICAgICAgICBkZWx0YVkgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IGRlbHRhIHRvIGJlIGRlbHRhWSBvciBkZWx0YVggaWYgZGVsdGFZIGlzIDAgZm9yIGJhY2t3YXJkcyBjb21wYXRhYmlsaXRpeVxyXG4gICAgICAgIGRlbHRhID0gZGVsdGFZID09PSAwID8gZGVsdGFYIDogZGVsdGFZO1xyXG5cclxuICAgICAgICAvLyBOZXcgc2Nob29sIHdoZWVsIGRlbHRhICh3aGVlbCBldmVudClcclxuICAgICAgICBpZiAoICdkZWx0YVknIGluIG9yZ0V2ZW50ICkge1xyXG4gICAgICAgICAgICBkZWx0YVkgPSBvcmdFdmVudC5kZWx0YVkgKiAtMTtcclxuICAgICAgICAgICAgZGVsdGEgID0gZGVsdGFZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICdkZWx0YVgnIGluIG9yZ0V2ZW50ICkge1xyXG4gICAgICAgICAgICBkZWx0YVggPSBvcmdFdmVudC5kZWx0YVg7XHJcbiAgICAgICAgICAgIGlmICggZGVsdGFZID09PSAwICkgeyBkZWx0YSAgPSBkZWx0YVggKiAtMTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gY2hhbmdlIGFjdHVhbGx5IGhhcHBlbmVkLCBubyByZWFzb24gdG8gZ28gYW55IGZ1cnRoZXJcclxuICAgICAgICBpZiAoIGRlbHRhWSA9PT0gMCAmJiBkZWx0YVggPT09IDAgKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAvLyBOZWVkIHRvIGNvbnZlcnQgbGluZXMgYW5kIHBhZ2VzIHRvIHBpeGVscyBpZiB3ZSBhcmVuJ3QgYWxyZWFkeSBpbiBwaXhlbHNcclxuICAgICAgICAvLyBUaGVyZSBhcmUgdGhyZWUgZGVsdGEgbW9kZXM6XHJcbiAgICAgICAgLy8gICAqIGRlbHRhTW9kZSAwIGlzIGJ5IHBpeGVscywgbm90aGluZyB0byBkb1xyXG4gICAgICAgIC8vICAgKiBkZWx0YU1vZGUgMSBpcyBieSBsaW5lc1xyXG4gICAgICAgIC8vICAgKiBkZWx0YU1vZGUgMiBpcyBieSBwYWdlc1xyXG4gICAgICAgIGlmICggb3JnRXZlbnQuZGVsdGFNb2RlID09PSAxICkge1xyXG4gICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9ICQuZGF0YSh0aGlzLCAnbW91c2V3aGVlbC1saW5lLWhlaWdodCcpO1xyXG4gICAgICAgICAgICBkZWx0YSAgKj0gbGluZUhlaWdodDtcclxuICAgICAgICAgICAgZGVsdGFZICo9IGxpbmVIZWlnaHQ7XHJcbiAgICAgICAgICAgIGRlbHRhWCAqPSBsaW5lSGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIG9yZ0V2ZW50LmRlbHRhTW9kZSA9PT0gMiApIHtcclxuICAgICAgICAgICAgdmFyIHBhZ2VIZWlnaHQgPSAkLmRhdGEodGhpcywgJ21vdXNld2hlZWwtcGFnZS1oZWlnaHQnKTtcclxuICAgICAgICAgICAgZGVsdGEgICo9IHBhZ2VIZWlnaHQ7XHJcbiAgICAgICAgICAgIGRlbHRhWSAqPSBwYWdlSGVpZ2h0O1xyXG4gICAgICAgICAgICBkZWx0YVggKj0gcGFnZUhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIGxvd2VzdCBhYnNvbHV0ZSBkZWx0YSB0byBub3JtYWxpemUgdGhlIGRlbHRhIHZhbHVlc1xyXG4gICAgICAgIGFic0RlbHRhID0gTWF0aC5tYXgoIE1hdGguYWJzKGRlbHRhWSksIE1hdGguYWJzKGRlbHRhWCkgKTtcclxuXHJcbiAgICAgICAgaWYgKCAhbG93ZXN0RGVsdGEgfHwgYWJzRGVsdGEgPCBsb3dlc3REZWx0YSApIHtcclxuICAgICAgICAgICAgbG93ZXN0RGVsdGEgPSBhYnNEZWx0YTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBvbGRlciBkZWx0YXMgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmICggc2hvdWxkQWRqdXN0T2xkRGVsdGFzKG9yZ0V2ZW50LCBhYnNEZWx0YSkgKSB7XHJcbiAgICAgICAgICAgICAgICBsb3dlc3REZWx0YSAvPSA0MDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IG9sZGVyIGRlbHRhcyBpZiBuZWNlc3NhcnlcclxuICAgICAgICBpZiAoIHNob3VsZEFkanVzdE9sZERlbHRhcyhvcmdFdmVudCwgYWJzRGVsdGEpICkge1xyXG4gICAgICAgICAgICAvLyBEaXZpZGUgYWxsIHRoZSB0aGluZ3MgYnkgNDAhXHJcbiAgICAgICAgICAgIGRlbHRhICAvPSA0MDtcclxuICAgICAgICAgICAgZGVsdGFYIC89IDQwO1xyXG4gICAgICAgICAgICBkZWx0YVkgLz0gNDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZXQgYSB3aG9sZSwgbm9ybWFsaXplZCB2YWx1ZSBmb3IgdGhlIGRlbHRhc1xyXG4gICAgICAgIGRlbHRhICA9IE1hdGhbIGRlbHRhICA+PSAxID8gJ2Zsb29yJyA6ICdjZWlsJyBdKGRlbHRhICAvIGxvd2VzdERlbHRhKTtcclxuICAgICAgICBkZWx0YVggPSBNYXRoWyBkZWx0YVggPj0gMSA/ICdmbG9vcicgOiAnY2VpbCcgXShkZWx0YVggLyBsb3dlc3REZWx0YSk7XHJcbiAgICAgICAgZGVsdGFZID0gTWF0aFsgZGVsdGFZID49IDEgPyAnZmxvb3InIDogJ2NlaWwnIF0oZGVsdGFZIC8gbG93ZXN0RGVsdGEpO1xyXG5cclxuICAgICAgICAvLyBOb3JtYWxpc2Ugb2Zmc2V0WCBhbmQgb2Zmc2V0WSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgaWYgKCBzcGVjaWFsLnNldHRpbmdzLm5vcm1hbGl6ZU9mZnNldCAmJiB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCApIHtcclxuICAgICAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIG9mZnNldFggPSBldmVudC5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnQ7XHJcbiAgICAgICAgICAgIG9mZnNldFkgPSBldmVudC5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCBpbmZvcm1hdGlvbiB0byB0aGUgZXZlbnQgb2JqZWN0XHJcbiAgICAgICAgZXZlbnQuZGVsdGFYID0gZGVsdGFYO1xyXG4gICAgICAgIGV2ZW50LmRlbHRhWSA9IGRlbHRhWTtcclxuICAgICAgICBldmVudC5kZWx0YUZhY3RvciA9IGxvd2VzdERlbHRhO1xyXG4gICAgICAgIGV2ZW50Lm9mZnNldFggPSBvZmZzZXRYO1xyXG4gICAgICAgIGV2ZW50Lm9mZnNldFkgPSBvZmZzZXRZO1xyXG4gICAgICAgIC8vIEdvIGFoZWFkIGFuZCBzZXQgZGVsdGFNb2RlIHRvIDAgc2luY2Ugd2UgY29udmVydGVkIHRvIHBpeGVsc1xyXG4gICAgICAgIC8vIEFsdGhvdWdoIHRoaXMgaXMgYSBsaXR0bGUgb2RkIHNpbmNlIHdlIG92ZXJ3cml0ZSB0aGUgZGVsdGFYL1lcclxuICAgICAgICAvLyBwcm9wZXJ0aWVzIHdpdGggbm9ybWFsaXplZCBkZWx0YXMuXHJcbiAgICAgICAgZXZlbnQuZGVsdGFNb2RlID0gMDtcclxuXHJcbiAgICAgICAgLy8gQWRkIGV2ZW50IGFuZCBkZWx0YSB0byB0aGUgZnJvbnQgb2YgdGhlIGFyZ3VtZW50c1xyXG4gICAgICAgIGFyZ3MudW5zaGlmdChldmVudCwgZGVsdGEsIGRlbHRhWCwgZGVsdGFZKTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXJvdXQgbG93ZXN0RGVsdGEgYWZ0ZXIgc29tZXRpbWUgdG8gYmV0dGVyXHJcbiAgICAgICAgLy8gaGFuZGxlIG11bHRpcGxlIGRldmljZSB0eXBlcyB0aGF0IGdpdmUgZGlmZmVyZW50XHJcbiAgICAgICAgLy8gYSBkaWZmZXJlbnQgbG93ZXN0RGVsdGFcclxuICAgICAgICAvLyBFeDogdHJhY2twYWQgPSAzIGFuZCBtb3VzZSB3aGVlbCA9IDEyMFxyXG4gICAgICAgIGlmIChudWxsTG93ZXN0RGVsdGFUaW1lb3V0KSB7IGNsZWFyVGltZW91dChudWxsTG93ZXN0RGVsdGFUaW1lb3V0KTsgfVxyXG4gICAgICAgIG51bGxMb3dlc3REZWx0YVRpbWVvdXQgPSBzZXRUaW1lb3V0KG51bGxMb3dlc3REZWx0YSwgMjAwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgkLmV2ZW50LmRpc3BhdGNoIHx8ICQuZXZlbnQuaGFuZGxlKS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBudWxsTG93ZXN0RGVsdGEoKSB7XHJcbiAgICAgICAgbG93ZXN0RGVsdGEgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNob3VsZEFkanVzdE9sZERlbHRhcyhvcmdFdmVudCwgYWJzRGVsdGEpIHtcclxuICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIG9sZGVyIGV2ZW50IGFuZCB0aGUgZGVsdGEgaXMgZGl2aXNhYmxlIGJ5IDEyMCxcclxuICAgICAgICAvLyB0aGVuIHdlIGFyZSBhc3N1bWluZyB0aGF0IHRoZSBicm93c2VyIGlzIHRyZWF0aW5nIHRoaXMgYXMgYW5cclxuICAgICAgICAvLyBvbGRlciBtb3VzZSB3aGVlbCBldmVudCBhbmQgdGhhdCB3ZSBzaG91bGQgZGl2aWRlIHRoZSBkZWx0YXNcclxuICAgICAgICAvLyBieSA0MCB0byB0cnkgYW5kIGdldCBhIG1vcmUgdXNhYmxlIGRlbHRhRmFjdG9yLlxyXG4gICAgICAgIC8vIFNpZGUgbm90ZSwgdGhpcyBhY3R1YWxseSBpbXBhY3RzIHRoZSByZXBvcnRlZCBzY3JvbGwgZGlzdGFuY2VcclxuICAgICAgICAvLyBpbiBvbGRlciBicm93c2VycyBhbmQgY2FuIGNhdXNlIHNjcm9sbGluZyB0byBiZSBzbG93ZXIgdGhhbiBuYXRpdmUuXHJcbiAgICAgICAgLy8gVHVybiB0aGlzIG9mZiBieSBzZXR0aW5nICQuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsLnNldHRpbmdzLmFkanVzdE9sZERlbHRhcyB0byBmYWxzZS5cclxuICAgICAgICByZXR1cm4gc3BlY2lhbC5zZXR0aW5ncy5hZGp1c3RPbGREZWx0YXMgJiYgb3JnRXZlbnQudHlwZSA9PT0gJ21vdXNld2hlZWwnICYmIGFic0RlbHRhICUgMTIwID09PSAwO1xyXG4gICAgfVxyXG5cclxufSkpO1xyXG4iLCIvKipcclxuICogQXV0aG9yOkhlcnVpO1xyXG4gKiBDcmVhdGVEYXRlOjIwMTYtMDEtMjZcclxuICpcclxuICogRGVzY3JpYmU6IGNvbVN5c0ZyYW1lIGNvbWJveFxyXG4qL1xyXG5cclxuZGVmaW5lKFxyXG4gICAgW1xyXG4gICAgICAgICdDbGFzcycsXHJcbiAgICAgICAgXCJUUExFbmdpbmVcIixcclxuICAgICAgICBcIi4vYmFzZUNsYXNzL0hpZGRlbkJhc2VcIixcclxuICAgICAgICAnU3RhdGljL2pzL2xpYnMvanF1ZXJ5Lm1vdXNld2hlZWwvanF1ZXJ5Lm1vdXNld2hlZWwnXHJcbiAgICBdLFxyXG4gICAgZnVuY3Rpb24gKENsYXNzLCBUUExFbmdpbmUsIEhpZGRlbkJhc2UpIHtcclxuICAgICAgICB2YXIgQ2xhc3NOYW1lID0gXCJDb250cm9sLlNpbmdsZUNvbWJveFwiO1xyXG5cclxuICAgICAgICB2YXIgU2luZ2xlQ29tYm94PVxyXG4gICAgICAgICAgICBDbGFzcyhDbGFzc05hbWUsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBhcmdzLmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm5vZGVOYW1lICYmIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPSBcInNlbGVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJ0aGlzIGlzIG5vdCBhIHNlbGVjdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kVG8gPSBhcmdzLmFwcGVuZFRvIHx8IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyb3BMZW5ndGg6IHRoaXMuc2V0dGluZy5kcm9wTGVuZ3RoIHx8IDVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5Pbk9wdGlvbkNoYW5nZSA9IGFyZ3Mub25DaGFuZ2UgfHwgdGhpcy5lbGVtZW50Lm9uY2hhbmdlIHx8IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5UaW1lciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1ID0gL01TSUUgKFxcZCopLjB8Q2hyb21lfEZpcmVmb3gvaS5leGVjKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5Mb3dJRU9yTm9JRSA9IHUgIT0gbnVsbCAmJiB+fnVbMV0gPCA4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW5uZXJNb3VzZVdoZWVsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCR0aGlzLmRhdGEoQ2xhc3NOYW1lKSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcy5lbGVtZW50KS5kYXRhKENsYXNzTmFtZSwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUGxhY2VIb2xkZXIodGhpcy4kY29udHJvbGxlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoXCJyZWxvYWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBUUEw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiBcIjxkaXYgY2xhc3M9J2NvbXN5cy1iYXNlIGNvbXN5cy1TaW5nbGVDb21ib3gtbGF5b3V0JyBpZD0nU2luZ2xlQ29tYm94LTwlPSB0aGlzLmNsYXNzaWRzJT4nPkB7bGF5b3V0fUA8L2Rpdj5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbjogXCJAe2xheW91dDp0aGlzLlRQTC5sYXlvdXQsdGhpc31APGRpdiBjbGFzcz0nY29tc3lzLVNpbmdsZUNvbWJveC1pbnB1dCc+PGlucHV0IHR5cGU9J3RleHQnIHJlYWRvbmx5IHBsYWNlaG9sZGVyPSc8JT0kKHRoaXMuZWxlbWVudCkuYXR0cihcXFwicGxhY2Vob2xkZXJcXFwiKT8kKHRoaXMuZWxlbWVudCkuYXR0cihcXFwicGxhY2Vob2xkZXJcXFwiKTpcXFwiXFxcIiU+JyB2YWx1ZT0nPCU9dGhpcy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoPT0wIHx8IHRoaXMuZWxlbWVudC5zZWxlY3RlZEluZGV4ID09IC0xPycnOnRoaXMuZWxlbWVudC5vcHRpb25zW3RoaXMuZWxlbWVudC5zZWxlY3RlZEluZGV4XS50ZXh0JT4nLz48L2Rpdj48ZGl2IGNsYXNzPSdjb21zeXMtU2luZ2xlQ29tYm94LWJ1dHRvbic+PC9kaXY+QHtzZWN0aW9uOnRoaXMuVFBMLmRyb3AsdGhpc31AXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3A6IFwiPGRpdiBjbGFzcz0nY29tc3lzLWNvbWJveC1iYXNlIGNvbXN5cy1TaW5nbGVDb21ib3gtZHJvcCcgaWQ9J1NpbmdsZUNvbWJveC1kcm9wLTwlPSB0aGlzLmNsYXNzaWRzJT4nPjwlZm9yKHZhciBpPTA7aTx0aGlzLmVsZW1lbnQub3B0aW9ucy5sZW5ndGg7aSsrKXslPkB7c2VjdGlvbjp0aGlzLlRQTC5vcHRpb24sdGhpcy5lbGVtZW50Lm9wdGlvbnNbaV19QDwlfSU+PC9kaXY+XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogXCI8ZGl2IGNsYXNzPSdjb21zeXMtYmFzZSBjb21zeXMtU2luZ2xlQ29tYm94LW9wdGlvbjwlPXRoaXMuc2VsZWN0ZWQ/XFwnIHNlbGVjdGVkXFwnOlxcJ1xcJyU+JyBkYXRhLWluZGV4PSc8JT10aGlzLmluZGV4JT4nPjwlPXRoaXMudGV4dCU+PC9kaXY+XCJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFkZFBsYWNlSG9sZGVyQWZ0ZXI6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kY29udHJvbGxlci5wcmVwZW5kKHRoaXMuJEhpZGRlbkJhc2VFbENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJEhpZGRlbkJhc2VFbENvbnRhaW5lci5hcHBlbmQodGhpcy5lbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleUNvZGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU1BBQ0U6IDMyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFTlRFUjogMTMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERPV046IDQwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBVUDogMzgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNIT1c6IDU0MFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFRISVMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLnN0YXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGNvbnRyb2xsZXIgPSAkKFRQTEVuZ2luZS5yZW5kZXIodGhpcy5UUEwubWFpbiwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnM9dGhpcy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKS5hcHBlbmQoVEhJUy4kY29udHJvbGxlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGRyb3AgPSBUSElTLiRjb250cm9sbGVyLmZpbmQoXCIuY29tc3lzLVNpbmdsZUNvbWJveC1kcm9wXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRpbnB1dCA9IFRISVMuJGNvbnRyb2xsZXIuZmluZChcImlucHV0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZpeGVkKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRkcm9wLmNzcyh7cG9zaXRpb246XCJmaXhlZFwifSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vJCh0aGlzLmFwcGVuZFRvKS5hcHBlbmQoVEhJUy4kZHJvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcy5lbGVtZW50LnBhcmVudE5vZGUpLmFwcGVuZChUSElTLiRkcm9wKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcy5lbGVtZW50KS5vbihcInJlYmluZFwiLGZ1bmN0aW9uKCl7cmV0dXJuIFRISVMuUmVCaW5kLmFwcGx5KFRISVMsYXJndW1lbnRzKTt9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKFwicmVsb2FkXCIsZnVuY3Rpb24oKXtyZXR1cm4gVEhJUy5SZUxvYWQuYXBwbHkoVEhJUyxhcmd1bWVudHMpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGRyb3Aub24oXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gVEhJUy5PbkRyb3BDbGljay5hcHBseShUSElTLCBhcmd1bWVudHMpOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy4kZHJvcC5iaW5kKFwib3RoZXJoaWRlXCIsZnVuY3Rpb24oKXtyZXR1cm4gVEhJUy5Pbk90aGVyQ2xpY2suYXBwbHkoVEhJUyxhcmd1bWVudHMpO30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RISVMuJGNvbnRyb2xsZXIuZGVsZWdhdGUoXCIuY29tc3lzLVNpbmdsZUNvbWJveC1idXR0b25cIiwgXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBUSElTLk9uQnV0dG9uQ2xpY2suYXBwbHkoVEhJUywgYXJndW1lbnRzKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGNvbnRyb2xsZXIub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBUSElTLk9uQnV0dG9uQ2xpY2suYXBwbHkoVEhJUywgYXJndW1lbnRzKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGNvbnRyb2xsZXIuZGVsZWdhdGUoXCIuY29tc3lzLVNpbmdsZUNvbWJveC1pbnB1dCBpbnB1dFwiLCBcImtleWRvd25cIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gVEhJUy5PbktleURvd24uYXBwbHkoVEhJUywgYXJndW1lbnRzKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGRyb3AuZ2V0KDApLm9ubW91c2V3aGVlbCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBUSElTLk9uTW91c2VXaGVlbC5jYWxsKFRISVMsIGV8fHdpbmRvdy5ldmVudCwgVEhJUy4kZHJvcC5nZXQoMCkpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGlucHV0Lm9mZihcIi5TaW5nbGVDb21ib3hGb2N1c1wiKS5vbihcImZvY3VzLlNpbmdsZUNvbWJveEZvY3VzXCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGNvbnRyb2xsZXIuYWRkQ2xhc3MoJ2ZvY3VzLW91dGVybGluZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRpbnB1dC5vZmYoXCIuU2luZ2xlQ29tYm94Rm9jdXNPdXRcIikub24oXCJmb2N1c291dC5TaW5nbGVDb21ib3hGb2N1c091dFwiLCBmdW5jdGlvbiAoKSB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy4kY29udHJvbGxlci5yZW1vdmVDbGFzcygnZm9jdXMtb3V0ZXJsaW5lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEhJUy5PbkZvY3VzT3V0LmFwcGx5KFRISVMsIGFyZ3VtZW50cyk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRkcm9wLmRlbGVnYXRlKFwiLmNvbXN5cy1TaW5nbGVDb21ib3gtb3B0aW9uXCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gVEhJUy5Pbk9wdGlvbkNsaWNrLmFwcGx5KFRISVMsIFthcmd1bWVudHNbMF0sIHRoaXNdKTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAvL+iOt+WPluWumuS9jeaooeW8j1xyXG4gICAgICAgICAgICAgICAgICAgIGZpeGVkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlPXRoaXMuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG97XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkKG5vZGUpLmNzcyhcInBvc2l0aW9uXCIpLmluZGV4T2YoJ2ZpeGVkJyk+LTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH13aGlsZShub2RlPW5vZGUucGFyZW50RWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlQmluZDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuc3RhdGU9dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5TZWxlY3RlZEluZGV4KFRISVMuU2VsZWN0ZWRJbmRleCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlTG9hZDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUz10aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRkcm9wLmh0bWwoJChUUExFbmdpbmUucmVuZGVyKHRoaXMuVFBMLmRyb3AsIHRoaXMpKS5odG1sKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnM9dGhpcy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlJlQmluZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgT25PdGhlckNsaWNrOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGU9ZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBPbk1vdXNlV2hlZWw6IGZ1bmN0aW9uIChlLHNjcm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGsgPSBlLndoZWVsRGVsdGEgPyBlLndoZWVsRGVsdGEgLyAxMjAgKiBUSElTLiRjb250cm9sbGVyLm91dGVySGVpZ2h0KCkgOiAtZS5kZXRhaWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGVyLnNjcm9sbFRvcCA9IHNjcm9sbGVyLnNjcm9sbFRvcCAtIGs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIE9uT3B0aW9uQ2xpY2s6IGZ1bmN0aW9uIChlLCB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggPSAkKHQpLmF0dHIoXCJkYXRhLWluZGV4XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRpbnB1dC52YWwoVEhJUy5lbGVtZW50Lm9wdGlvbnNbVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXhdLnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLmVsZW1lbnQub3B0aW9uc1tUSElTLmVsZW1lbnQuc2VsZWN0ZWRJbmRleF0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLkRyb3BIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBPbkRyb3BDbGljazogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFRISVMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcD0gZS5jdXJyZW50VGFyZ2V0fHwgZS5kZWxlZ2F0ZVRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGM9IGUudGFyZ2V0fHwgZS50b0VsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuY2FuY2VsRm9jdXNPdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KFRISVMuVGltZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLlRpbWVyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQ9VEhJUy4kZHJvcC5nZXQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHAuaWQ9PSBjLmlkJiYgZC5zY3JvbGxIZWlnaHQ8IGQub2Zmc2V0SGVpZ2h0KSBUSElTLkRyb3BIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBPbkZvY3VzT3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFUSElTLmNhbmNlbEZvY3VzT3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLlRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBUSElTLkRyb3BIaWRlKCk7IH0sIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLmNhbmNlbEZvY3VzT3V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBEcm9wSGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFUSElTLnN0YXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoVEhJUy5UaW1lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRkcm9wLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5zdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGlucHV0LnZhbChUSElTLmVsZW1lbnQub3B0aW9uc1tUSElTLmVsZW1lbnQuc2VsZWN0ZWRJbmRleF0udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLmVsZW1lbnQub3B0aW9uc1tUSElTLmVsZW1lbnQuc2VsZWN0ZWRJbmRleF0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgVEhJUy4kaW5wdXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLmNhbmNlbEZvY3VzT3V0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRISVMuTGFzdEtleSAhPSBUSElTLmVsZW1lbnQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuT25PcHRpb25DaGFuZ2UuYXBwbHkodGhpcy5lbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoVEhJUy5lbGVtZW50KS50cmlnZ2VyKFwidnVlY2hhbmdlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5MYXN0S2V5ID0gVEhJUy5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuY2FuY2VsRm9jdXNPdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy4kaW5wdXQudHJpZ2dlcihcImZvY3Vzb3V0LlRpcENoYW5nZUV2ZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLlVuUnVudGltZUJpbmRTY3JvbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5wbGFjZWhvbGRlciAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlci5yZXBsYWNlV2l0aCh0aGlzLiRkcm9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBTZWxlY3RlZEluZGV4OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLkRyb3BIaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEhJUy5lbGVtZW50Lm9wdGlvbnNbVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVEhJUy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gVEhJUy5lbGVtZW50Lm9wdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gYXJndW1lbnRzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuU2VsZWN0ZWRJbmRleChvcHRpb24uaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIE9uT3RoZXJBcmVhQ2xpY2s6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBUSElTPXRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkdD0kKGUudGFyZ2V0fHwgZS50b0VsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGQ9JHQuY2xvc2VzdChcIi5jb21zeXMtU2luZ2xlQ29tYm94LWRyb3BcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbD0kdC5jbG9zZXN0KFwiLmNvbXN5cy1TaW5nbGVDb21ib3gtbGF5b3V0XCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRpZD0kZC5hdHRyKFwiaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGRpZD1cIlNpbmdsZUNvbWJveC1kcm9wLVwiK1RISVMuY2xhc3NpZHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbGlkPSRsLmF0dHIoXCJpZFwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0bGlkPVwiU2luZ2xlQ29tYm94LVwiK1RISVMuY2xhc3NpZHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZigkZC5sZW5ndGg9PTAmJiRsLmxlbmd0aD09MHx8KCRkLmxlbmd0aCE9MCYmJGRpZCE9JHRkaWQpfHwoJGwubGVuZ3RoIT0wJiYkbGlkIT0kdGxpZCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuRHJvcEhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUSElTLmNhbmNlbEZvY3VzT3V0PXRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBTZXRQb3NpdGlvbjpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5PZmZzZXQodGhpcy4kY29udHJvbGxlci5nZXQoMCkpOy8vXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSAkKFwiPGRpdiBpZD0ncGxhY2Vob2xkZXJcIisgdGhpcy5jbGFzc2lkcyArXCInPjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5iZWZvcmUodGhpcy5wbGFjZWhvbGRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250cm9sSGVpZ2h0ID0gdGhpcy4kY29udHJvbGxlci5vdXRlckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29udHJvbFdpZHRoID0gdGhpcy4kY29udHJvbGxlci5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aW5IZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aW5XaWR0aCA9ICQod2luZG93KS53aWR0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcm9wSGVpZ2h0ID0gY29udHJvbEhlaWdodCAqIHRoaXMuc2V0dGluZy5kcm9wTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVudGltZWRyb3BIZWlnaHQgPSBjb250cm9sSGVpZ2h0ICogKCB0aGlzLmVsZW1lbnQub3B0aW9ucy5sZW5ndGggPCB0aGlzLnNldHRpbmcuZHJvcExlbmd0aCA/IHRoaXMuZWxlbWVudC5vcHRpb25zLmxlbmd0aCA6IHRoaXMuc2V0dGluZy5kcm9wTGVuZ3RoIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzYm90dG9tID0gKCB3aW5IZWlnaHQgLSAoIHJ1bnRpbWVkcm9wSGVpZ2h0ICsgb2Zmc2V0LnRvcCArIGNvbnRyb2xIZWlnaHQgKyA2ICkgKSA+IDAgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMuYXBwZW5kVG8pLmFwcGVuZCh0aGlzLiRkcm9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogLTk5OTk5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiBkcm9wSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6IGNvbnRyb2xXaWR0aCwvLyAtIChUSElTLkxvd0lFT3JOb0lFIHx8IChUSElTLiRkcm9wLmdldCgwKS5zY3JvbGxIZWlnaHQgPCBUSElTLiRkcm9wLmdldCgwKS5vZmZzZXRIZWlnaHQpID8gMCA6IDE3KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiB3aW5XaWR0aCAtIG9mZnNldC5sZWZ0IC0gMTAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICggaXNib3R0b20gPyAoIG9mZnNldC50b3AgKyBjb250cm9sSGVpZ2h0ICsgNiApIDogKG9mZnNldC50b3AgLSBydW50aW1lZHJvcEhlaWdodCAtIDYgKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUnVudGltZUJpbmQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIFRISVMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCIuZHJvcG1vdXNld2hlZWxoaWRlXCIpLm9uKCdtb3VzZXdoZWVsLmRyb3Btb3VzZXdoZWVsaGlkZScsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5Ecm9wSGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXCIub3V0ZXJDbGlja0xpc3RlbmVyXCIpLm9uKFwibW91c2Vkb3duLm91dGVyQ2xpY2tMaXN0ZW5lclwiLGZ1bmN0aW9uKCl7cmV0dXJuIFRISVMuT25PdGhlckFyZWFDbGljay5hcHBseShUSElTLGFyZ3VtZW50cyk7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBVblJ1bnRpbWVCaW5kU2Nyb2xsOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcIi5kcm9wbW91c2V3aGVlbGhpZGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcIi5vdXRlckNsaWNrTGlzdGVuZXJcIilcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIE9uQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlLCBpc0ZpbHRlciwgdHlwZSwgaXNSYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoVEhJUy5UaW1lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmVsZW1lbnQuZGlzYWJsZWQpIHJldHVybiA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucyE9dGhpcy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoKSB0aGlzLlJlTG9hZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRpbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcImRpdi5jb21zeXMtY29tYm94LWJhc2U6dmlzaWJsZVwiKS5oaWRlKCkudHJpZ2dlcihcIm90aGVyaGlkZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZWxlbWVudC5vcHRpb25zLmxlbmd0aD09MCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlJ1bnRpbWVCaW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZighaXNGaWx0ZXImJnRoaXMuc3RhdGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5Ecm9wSGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50LnNlbGVjdGVkSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKS5lbmQoKS5maW5kKFwiZGl2LmNvbXN5cy1TaW5nbGVDb21ib3gtb3B0aW9uOmVxKFwiICsgdGhpcy5lbGVtZW50LnNlbGVjdGVkSW5kZXggKyBcIilcIikuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk9wdGlvblBvc2l0aW9uKCFpc0ZpbHRlciZUSElTLnN0YXRlID8gdGhpcy5rZXlDb2RlLlNIT1cgOiB0eXBlLCBpc1JhbmdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIE9wdGlvblBvc2l0aW9uOiBmdW5jdGlvbiAodHlwZSwgaXNSYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSBUSElTLiRkcm9wLmZpbmQoXCIuc2VsZWN0ZWRcIikuZ2V0KDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJvcCA9IFRISVMuJGRyb3AuZ2V0KDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9iaikgeyBkcm9wLnNjcm9sbFRvcCA9IDA7IHJldHVybjsgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9wID0gb2JqLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFRISVMua2V5Q29kZS5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1JhbmdlKSBkcm9wLnNjcm9sbFRvcCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcm9wLnNjcm9sbFRvcCArIGRyb3Aub2Zmc2V0SGVpZ2h0IC0gMiA8PSB0b3ApIGRyb3Auc2Nyb2xsVG9wID0gdG9wIC0gZHJvcC5vZmZzZXRIZWlnaHQgKyBvYmoub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgVEhJUy5rZXlDb2RlLlVQOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1JhbmdlKSBkcm9wLnNjcm9sbFRvcCA9IGRyb3Auc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJvcC5zY3JvbGxUb3AgPiB0b3ApIGRyb3Auc2Nyb2xsVG9wID0gdG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgVEhJUy5rZXlDb2RlLlNIT1c6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Auc2Nyb2xsVG9wID0gdG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLiRkcm9wLmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKS5lbmQoKS5maW5kKFwiZGl2LmNvbXN5cy1TaW5nbGVDb21ib3gtb3B0aW9uOmVxKFwiICsgVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggKyBcIilcIikuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGRyb3AuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgT25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc1JhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFRISVMua2V5Q29kZS5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUSElTLnN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmFuZ2UgPSBUSElTLmVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9PT0gVEhJUy5lbGVtZW50Lm9wdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSYW5nZSA/IFRISVMuZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gMCA6IFRISVMuZWxlbWVudC5zZWxlY3RlZEluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vVEhJUy5PcHRpb25Qb3NpdGlvbihlLmtleUNvZGUsIGlzUmFuZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuJGNvbnRyb2xsZXIuZmluZChcIi5jb21zeXMtU2luZ2xlQ29tYm94LWJ1dHRvblwiKS50cmlnZ2VyKFwiY2xpY2tcIiwgW3RydWUsIGUua2V5Q29kZSwgaXNSYW5nZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBUSElTLmtleUNvZGUuVVA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRISVMuc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSYW5nZSA9IFRISVMuZWxlbWVudC5zZWxlY3RlZEluZGV4ID09PSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JhbmdlID8gVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggPSBUSElTLmVsZW1lbnQub3B0aW9ucy5sZW5ndGggLSAxIDogVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9USElTLk9wdGlvblBvc2l0aW9uKGUua2V5Q29kZSwgaXNSYW5nZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy4kY29udHJvbGxlci5maW5kKFwiLmNvbXN5cy1TaW5nbGVDb21ib3gtYnV0dG9uXCIpLnRyaWdnZXIoXCJjbGlja1wiLCBbdHJ1ZSwgZS5rZXlDb2RlLCBpc1JhbmdlXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFRISVMua2V5Q29kZS5FTlRFUjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBUSElTLiRkcm9wLmZpbmQoXCIuc2VsZWN0ZWRcIikuYXR0cihcImRhdGEtaW5kZXhcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggPSBpbmRleCA9PSB1bmRlZmluZWQgPyAtMSA6IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRISVMuRHJvcEhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5GVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUSElTLkxhc3RLZXkgIT0gVEhJUy5lbGVtZW50LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLlNlYXJjaChUSElTLiRpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUSElTLkxhc3RLZXkgPSBUSElTLmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgU2VhcmNoOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0gJChUSElTLmVsZW1lbnQpLmZpbmQoXCJvcHRpb246Y29udGFpbnMoJ1wiICsgJC50cmltKGtleSkgKyBcIicpXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IG9wdGlvbnNbMF0uaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy5lbGVtZW50LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVEhJUy4kY29udHJvbGxlci5maW5kKFwiLmNvbXN5cy1TaW5nbGVDb21ib3gtYnV0dG9uXCIpLnRyaWdnZXIoXCJjbGlja1wiLCBbdHJ1ZSwgVEhJUy5rZXlDb2RlLlNIT1csIGZhbHNlXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBPZmZzZXQ6IGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICRvYmogPSAkKG9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZSA9ICRvYmogLm9mZnNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgSGlkZGVuQmFzZSk7XHJcblxyXG5cclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIFNpbmdsZUNvbWJveEluaXQ6IGZ1bmN0aW9uIChzZXR0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nPXNldHRpbmcgfHwge307XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2luZ2xlQ29tYm94KHsgZWxlbWVudDogdGhpcyAsIG9uQ2hhbmdlIDogc2V0dGluZy5vbkNoYW5nZSB9KS5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfX0pO1xyXG5cclxuICAgICAgICByZXR1cm4gU2luZ2xlQ29tYm94O1xyXG5cclxuICAgIH0pOyIsIi8qKlxyXG4gKiBBdXRob3I6SGVydWk7XHJcbiAqIENyZWF0ZURhdGU6MjAxNi0wMS0yNlxyXG4gKlxyXG4gKiBEZXNjcmliZTogY29tU3lzRnJhbWUgY29tYm94XHJcbiAqL1xyXG5cclxuZGVmaW5lKFxyXG4gICAgW1xyXG4gICAgICAgICdDbGFzcycsXHJcbiAgICAgICAgXCJUUExFbmdpbmVcIixcclxuICAgICAgICAnLi9iYXNlQ2xhc3MvSGlkZGVuQmFzZSdcclxuICAgIF0sXHJcbiAgICBmdW5jdGlvbiAoQ2xhc3MsIFRQTEVuZ2luZSwgSGlkZGVuQmFzZSkge1xyXG4gICAgICAgIHZhciBDbGFzc05hbWUgPSBcIkNvbnRyb2wuQnV0dG9uVGV4dEJveFwiO1xyXG5cclxuICAgICAgICB2YXIgQnV0dG9uVGV4dEJveD1cclxuICAgICAgICAgICAgQ2xhc3MoQ2xhc3NOYW1lLCB7XHJcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kQnV0dG9uVGV4dEJveEVsID0gJChhcmdzLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZy5CdXR0b25DbGFzcyA9IHRoaXMuJEJ1dHRvblRleHRCb3hFbC5hdHRyKCdjcy1idXR0b24tdHlwZScpIHx8IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nLmxvY2F0aW9uID0gdGhpcy4kQnV0dG9uVGV4dEJveEVsLmF0dHIoJ2NzLWxhYmVsLWxvY2F0aW9uJykgfHwgXCJyaWdodFwiO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuJEJ1dHRvblRleHRCb3hFbC5kYXRhKENsYXNzTmFtZSkgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJEJ1dHRvblRleHRCb3hDb250cm9sbGVyID0gJChUUExFbmdpbmUucmVuZGVyKHRoaXMuVFBMLm1haW4sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kQnV0dG9uVGV4dEJveEVsLmJlZm9yZSh0aGlzLiRCdXR0b25UZXh0Qm94Q29udHJvbGxlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJEJ1dHRvblRleHRCb3hDb250cm9sbGVyLmZpbmQoXCIuY29tc3lzLUJ1dHRvblRleHRCb3gtaW5wdXRcIikuYXBwZW5kKHRoaXMuJEJ1dHRvblRleHRCb3hFbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJEJ1dHRvblRleHRCb3hFbC5vbihcImZvY3VzXCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJEJ1dHRvblRleHRCb3hDb250cm9sbGVyLmFkZENsYXNzKCdmb2N1cy1vdXRlcmxpbmUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5vbihcImZvY3Vzb3V0XCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuJEJ1dHRvblRleHRCb3hDb250cm9sbGVyLnJlbW92ZUNsYXNzKCdmb2N1cy1vdXRlcmxpbmUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRCdXR0b25UZXh0Qm94RWwuZGF0YShDbGFzc05hbWUsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRQbGFjZUhvbGRlcih0aGlzLiRCdXR0b25UZXh0Qm94Q29udHJvbGxlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFRQTDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxheW91dDogXCI8ZGl2IGNsYXNzPSdjb21zeXMtYmFzZSBjb21zeXMtQnV0dG9uVGV4dEJveC1sYXlvdXQ8JT0nICcgKyB0aGlzLnNldHRpbmcuQnV0dG9uQ2xhc3MgKyAnIGxvY2F0aW9uLScrIHRoaXMuc2V0dGluZy5sb2NhdGlvbiU+JyBpZD0nPCU9IHRoaXMuY2xhc3NpZHMlPic+QHtsYXlvdXR9QDwvZGl2PlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIG1haW46IFwiQHtsYXlvdXQ6dGhpcy5UUEwubGF5b3V0LHRoaXN9QDxkaXYgY2xhc3M9J2NvbXN5cy1CdXR0b25UZXh0Qm94LWlucHV0Jz48L2Rpdj48ZGl2IGNsYXNzPSdjb21zeXMtQnV0dG9uVGV4dEJveC1idXR0b24nPjwvZGl2PlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9LCBIaWRkZW5CYXNlKTtcclxuXHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBCdXR0b25UZXh0Qm94SW5pdDogZnVuY3Rpb24gKHNldHRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBCdXR0b25UZXh0Qm94KHsgZWxlbWVudDogdGhpcywgc2V0dGluZzogc2V0dGluZyB9KS5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KS5yZW1vdmVBdHRyKCdjcy1jb250cm9sJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEJ1dHRvblRleHRCb3g7XHJcblxyXG4gICAgfSk7IiwiLypcclxuICogTXk5NyBEYXRlUGlja2VyIDQuOCBCZXRhNFxyXG4gKiBMaWNlbnNlOiBodHRwOi8vd3d3Lm15OTcubmV0L2RwL2xpY2Vuc2UuYXNwXHJcbiAqL1xyXG52YXIgJGRwLCBXZGF0ZVBpY2tlcjtcclxuXHJcbihmdW5jdGlvbihmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmYWN0b3J5KClcclxuICAgIH1cclxufSlcclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyICQgPSB7XHJcbiAgICAgICAgJGxhbmdMaXN0OiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogXCJlblwiLCBjaGFyc2V0OiBcIlVURi04XCIgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiBcInpoLWNuXCIsIGNoYXJzZXQ6IFwiZ2IyMzEyXCIgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiBcInpoLXR3XCIsIGNoYXJzZXQ6IFwiR0JLXCIgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgJHNraW5MaXN0OiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogXCJkZWZhdWx0XCIsIGNoYXJzZXQ6IFwiZ2IyMzEyXCIgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiBcIndoeUdyZWVuXCIsIGNoYXJzZXQ6IFwiZ2IyMzEyXCIgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiBcImJsdWVcIiwgY2hhcnNldDogXCJnYjIzMTJcIiB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6IFwiZ3JlZW5cIiwgY2hhcnNldDogXCJnYjIzMTJcIiB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6IFwic2ltcGxlXCIsIGNoYXJzZXQ6IFwiZ2IyMzEyXCIgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiBcImV4dFwiLCBjaGFyc2V0OiBcImdiMjMxMlwiIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogXCJibHVlRnJlc2hcIiwgY2hhcnNldDogXCJnYjIzMTJcIiB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6IFwidHdvZXJcIiwgY2hhcnNldDogXCJnYjIzMTJcIiB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6IFwiWWNsb3VkUmVkXCIsIGNoYXJzZXQ6IFwiZ2IyMzEyXCIgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgJHdkYXRlOiB0cnVlLFxyXG4gICAgICAgICRjcm9zc0ZyYW1lOiB0cnVlLFxyXG4gICAgICAgICRwcmVMb2FkOiBmYWxzZSxcclxuICAgICAgICAkZHBQYXRoOiBcIlwiLFxyXG4gICAgICAgIGRvdWJsZUNhbGVuZGFyOiBmYWxzZSxcclxuICAgICAgICBlbmFibGVLZXlib2FyZDogdHJ1ZSxcclxuICAgICAgICBlbmFibGVJbnB1dE1hc2s6IHRydWUsXHJcbiAgICAgICAgYXV0b1VwZGF0ZU9uQ2hhbmdlZDogbnVsbCxcclxuICAgICAgICB3ZWVrTWV0aG9kOiBcIklTTzg2MDFcIixcclxuICAgICAgICBwb3NpdGlvbjoge30sXHJcbiAgICAgICAgbGFuZzogXCJhdXRvXCIsXHJcbiAgICAgICAgc2tpbjogXCJkZWZhdWx0XCIsXHJcbiAgICAgICAgZGF0ZUZtdDogXCJ5eXl5LU1NLWRkXCIsXHJcbiAgICAgICAgcmVhbERhdGVGbXQ6IFwieXl5eS1NTS1kZFwiLFxyXG4gICAgICAgIHJlYWxUaW1lRm10OiBcIkhIOm1tOnNzXCIsXHJcbiAgICAgICAgcmVhbEZ1bGxGbXQ6IFwiJURhdGUgJVRpbWVcIixcclxuICAgICAgICBtaW5EYXRlOiBcIjE5MDAtMDEtMDEgMDA6MDA6MDBcIixcclxuICAgICAgICBtYXhEYXRlOiBcIjIwOTktMTItMzEgMjM6NTk6NTlcIixcclxuICAgICAgICBzdGFydERhdGU6IFwiXCIsXHJcbiAgICAgICAgYWx3YXlzVXNlU3RhcnREYXRlOiBmYWxzZSxcclxuICAgICAgICB5ZWFyT2Zmc2V0OiAxOTExLFxyXG4gICAgICAgIGZpcnN0RGF5T2ZXZWVrOiAwLFxyXG4gICAgICAgIGlzU2hvd1dlZWs6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2hMaW5lV2Vla0RheTogdHJ1ZSxcclxuICAgICAgICBpc1Nob3dDbGVhcjogdHJ1ZSxcclxuICAgICAgICBpc1Nob3dUb2RheTogdHJ1ZSxcclxuICAgICAgICBpc1Nob3dPSzogdHJ1ZSxcclxuICAgICAgICBpc1Nob3dPdGhlcnM6IHRydWUsXHJcbiAgICAgICAgcmVhZE9ubHk6IGZhbHNlLFxyXG4gICAgICAgIGVyckRlYWxNb2RlOiAwLFxyXG4gICAgICAgIGF1dG9QaWNrRGF0ZTogbnVsbCxcclxuICAgICAgICBxc0VuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgYXV0b1Nob3dRUzogZmFsc2UsXHJcbiAgICAgICAgb3Bwb3NpdGU6IGZhbHNlLFxyXG4gICAgICAgIGhtc01lbnVDZmc6IHsgSDogWzEsIDZdLCBtOiBbNSwgNl0sIHM6IFsxNSwgNF0gfSxcclxuICAgICAgICBvcHBvc2l0ZTogZmFsc2UsXHJcblxyXG4gICAgICAgIHNwZWNpYWxEYXRlczogbnVsbCxcclxuICAgICAgICBzcGVjaWFsRGF5czogbnVsbCxcclxuICAgICAgICBkaXNhYmxlZERhdGVzOiBudWxsLFxyXG4gICAgICAgIGRpc2FibGVkRGF5czogbnVsbCxcclxuICAgICAgICBvbnBpY2tpbmc6IG51bGwsXHJcbiAgICAgICAgb25waWNrZWQ6IG51bGwsXHJcbiAgICAgICAgb25jbGVhcmluZzogbnVsbCxcclxuICAgICAgICBvbmNsZWFyZWQ6IG51bGwsXHJcbiAgICAgICAgeWNoYW5naW5nOiBudWxsLFxyXG4gICAgICAgIHljaGFuZ2VkOiBudWxsLFxyXG4gICAgICAgIE1jaGFuZ2luZzogbnVsbCxcclxuICAgICAgICBNY2hhbmdlZDogbnVsbCxcclxuICAgICAgICBkY2hhbmdpbmc6IG51bGwsXHJcbiAgICAgICAgZGNoYW5nZWQ6IG51bGwsXHJcbiAgICAgICAgSGNoYW5naW5nOiBudWxsLFxyXG4gICAgICAgIEhjaGFuZ2VkOiBudWxsLFxyXG4gICAgICAgIG1jaGFuZ2luZzogbnVsbCxcclxuICAgICAgICBtY2hhbmdlZDogbnVsbCxcclxuICAgICAgICBzY2hhbmdpbmc6IG51bGwsXHJcbiAgICAgICAgc2NoYW5nZWQ6IG51bGwsXHJcbiAgICAgICAgZUNvbnQ6IG51bGwsXHJcbiAgICAgICAgdmVsOiBudWxsLFxyXG4gICAgICAgIGVsUHJvcDogXCJcIixcclxuICAgICAgICBlcnJNc2c6IFwiXCIsXHJcbiAgICAgICAgcXVpY2tTZWw6IFtdLFxyXG4gICAgICAgIGhhczoge30sXHJcbiAgICAgICAgZ2V0UmVhbExhbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgXyA9ICQuJGxhbmdMaXN0O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBBID0gMDsgQSA8IF8ubGVuZ3RoOyBBKyspXHJcbiAgICAgICAgICAgICAgICBpZiAoX1tBXS5uYW1lID09IHRoaXMubGFuZykgcmV0dXJuIF9bQV07XHJcbiAgICAgICAgICAgIHJldHVybiBfWzBdIH1cclxuICAgIH07XHJcbiAgICBXZGF0ZVBpY2tlciA9IFU7XHJcbiAgICB2YXIgWSA9IHdpbmRvdyxcclxuICAgICAgICBUID0geyBpbm5lckhUTUw6IFwiXCIgfSxcclxuICAgICAgICBOID0gXCJkb2N1bWVudFwiLFxyXG4gICAgICAgIEggPSBcImRvY3VtZW50RWxlbWVudFwiLFxyXG4gICAgICAgIEMgPSBcImdldEVsZW1lbnRzQnlUYWdOYW1lXCIsXHJcbiAgICAgICAgViwgQSwgUywgRywgYywgWCA9IG5hdmlnYXRvci5hcHBOYW1lO1xyXG4gICAgaWYgKFggPT0gXCJNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXJcIikgUyA9IHRydWU7XHJcbiAgICBlbHNlIGlmIChYID09IFwiT3BlcmFcIikgYyA9IHRydWU7XHJcbiAgICBlbHNlIEcgPSB0cnVlO1xyXG4gICAgQSA9ICQuJGRwUGF0aCB8fCBKKCk7XHJcbiAgICAvL2lmICgkLiR3ZGF0ZSkgSyhBICsgXCJza2luL1dkYXRlUGlja2VyLmNzc1wiKTtcclxuICAgIFYgPSBZO1xyXG4gICAgaWYgKCQuJGNyb3NzRnJhbWUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB3aGlsZSAoVi5wYXJlbnQgIT0gViAmJiBWLnBhcmVudFtOXVtDXShcImZyYW1lc2V0XCIpLmxlbmd0aCA9PSAwKSBWID0gVi5wYXJlbnQgfSBjYXRjaCAoTykge30gfVxyXG4gICAgaWYgKCFWLiRkcCkgVi4kZHAgPSB7IGZmOiBHLCBpZTogUywgb3BlcmE6IGMsIHN0YXR1czogMCwgZGVmTWluRGF0ZTogJC5taW5EYXRlLCBkZWZNYXhEYXRlOiAkLm1heERhdGUgfTtcclxuICAgIEIoKTtcclxuICAgIGlmICgkLiRwcmVMb2FkICYmICRkcC5zdGF0dXMgPT0gMCkgRShZLCBcIm9ubG9hZFwiLCBmdW5jdGlvbigpIHsgVShudWxsLCB0cnVlKSB9KTtcclxuICAgIGlmICghWVtOXS5kb2NNRCkgeyBFKFlbTl0sIFwib25tb3VzZWRvd25cIiwgRCwgdHJ1ZSk7XHJcbiAgICAgICAgWVtOXS5kb2NNRCA9IHRydWUgfVxyXG4gICAgaWYgKCFWW05dLmRvY01EKSB7IEUoVltOXSwgXCJvbm1vdXNlZG93blwiLCBELCB0cnVlKTtcclxuICAgICAgICBWW05dLmRvY01EID0gdHJ1ZSB9XHJcbiAgICBFKFksIFwib251bmxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRkcC5kZCkgUCgkZHAuZGQsIFwibm9uZVwiKSB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBCKCkge1xyXG4gICAgICAgIHRyeSB7IFZbTl0sIFYuJGRwID0gVi4kZHAgfHwge30gfSBjYXRjaCAoJCkgeyBWID0gWTtcclxuICAgICAgICAgICAgJGRwID0gJGRwIHx8IHt9IH1cclxuICAgICAgICB2YXIgQSA9IHsgd2luOiBZLCAkOiBmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiAkID09IFwic3RyaW5nXCIpID8gWVtOXS5nZXRFbGVtZW50QnlJZCgkKSA6ICQgfSwgJEQ6IGZ1bmN0aW9uKCQsIF8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiREVih0aGlzLiQoJCkudmFsdWUsIF8pIH0sICREVjogZnVuY3Rpb24oXywgJCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKF8gIT0gXCJcIikgeyB0aGlzLmR0ID0gJGRwLmNhbC5zcGxpdERhdGUoXywgJGRwLmNhbC5kYXRlRm10KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgQiBpbiAkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHRbQl0gPT09IHVuZGVmaW5lZCkgdGhpcy5lcnJNc2cgPSBcImludmFsaWQgcHJvcGVydHk6XCIgKyBCO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7IHRoaXMuZHRbQl0gKz0gJFtCXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoQiA9PSBcIk1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgQyA9ICRbXCJNXCJdID4gMCA/IDEgOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQSA9IG5ldyBEYXRlKHRoaXMuZHRbXCJ5XCJdLCB0aGlzLmR0W1wiTVwiXSwgMCkuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmR0W1wiZFwiXSA9IE1hdGgubWluKEEgKyBDLCB0aGlzLmR0W1wiZFwiXSkgfSB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHQucmVmcmVzaCgpKSByZXR1cm4gdGhpcy5kdCB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIiB9LCBzaG93OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBBID0gVltOXS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKSxcclxuICAgICAgICAgICAgICAgICAgICAkID0gMTAwMDAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgQiA9IDA7IEIgPCBBLmxlbmd0aDsgQisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF8gPSBwYXJzZUludChBW0JdLnN0eWxlLnpJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8gPiAkKSAkID0gXyB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRkLnN0eWxlLnpJbmRleCA9ICQgKyAyO1xyXG4gICAgICAgICAgICAgICAgUCh0aGlzLmRkLCBcImJsb2NrXCIpO1xyXG4gICAgICAgICAgICAgICAgUCh0aGlzLmRkLmZpcnN0Q2hpbGQsIFwiXCIpIH0sIHVuYmluZDogZnVuY3Rpb24oJCkgeyAkID0gdGhpcy4kKCQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaW5pdGNmZykgeyBMKCQsIFwib25jbGlja1wiLCBmdW5jdGlvbigpIHsgVSgkLmluaXRjZmcpIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIEwoJCwgXCJvbmZvY3VzXCIsIGZ1bmN0aW9uKCkgeyBVKCQuaW5pdGNmZykgfSkgfSB9LCBoaWRlOiBmdW5jdGlvbigpIHsgUCh0aGlzLmRkLCBcIm5vbmVcIikgfSwgYXR0YWNoRXZlbnQ6IEUgfTtcclxuICAgICAgICBmb3IgKHZhciBfIGluIEEpIFYuJGRwW19dID0gQVtfXTtcclxuICAgICAgICAkZHAgPSBWLiRkcCB9XHJcblxyXG4gICAgZnVuY3Rpb24gRShCLCBfLCBBLCAkKSB7XHJcbiAgICAgICAgaWYgKEIuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgQyA9IF8ucmVwbGFjZSgvb24vLCBcIlwiKTtcclxuICAgICAgICAgICAgQS5faWVFbXVFdmVudEhhbmRsZXIgPSBmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQSgkKSB9O1xyXG4gICAgICAgICAgICBCLmFkZEV2ZW50TGlzdGVuZXIoQywgQS5faWVFbXVFdmVudEhhbmRsZXIsICQpIH0gZWxzZSBCLmF0dGFjaEV2ZW50KF8sIEEpIH1cclxuXHJcbiAgICBmdW5jdGlvbiBMKEEsICQsIF8pIHtcclxuICAgICAgICBpZiAoQS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBCID0gJC5yZXBsYWNlKC9vbi8sIFwiXCIpO1xyXG4gICAgICAgICAgICBfLl9pZUVtdUV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKCQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfKCQpIH07XHJcbiAgICAgICAgICAgIEEucmVtb3ZlRXZlbnRMaXN0ZW5lcihCLCBfLl9pZUVtdUV2ZW50SGFuZGxlciwgZmFsc2UpIH0gZWxzZSBBLmRldGFjaEV2ZW50KCQsIF8pIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhKF8sICQsIEEpIHtcclxuICAgICAgICBpZiAodHlwZW9mIF8gIT0gdHlwZW9mICQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAodHlwZW9mIF8gPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBpZiAoIUEpXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBCIGluIF8pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICRbQl0gPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYShfW0JdLCAkW0JdLCB0cnVlKSkgcmV0dXJuIGZhbHNlIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWUgfSBlbHNlIGlmICh0eXBlb2YgXyA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mICQgPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gXy50b1N0cmluZygpID09ICQudG9TdHJpbmcoKTtcclxuICAgICAgICBlbHNlIHJldHVybiBfID09ICQgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEooKSB7XHJcbiAgICAgICAgdmFyIF8sIEEsICQgPSBZW05dW0NdKFwic2NyaXB0XCIpO1xyXG4gICAgICAgIGZvciAodmFyIEIgPSAwOyBCIDwgJC5sZW5ndGg7IEIrKykgeyBfID0gJFtCXS5nZXRBdHRyaWJ1dGUoXCJzcmNcIikgfHwgXCJcIjtcclxuICAgICAgICAgICAgXyA9IF8uc3Vic3RyKDAsIF8udG9Mb3dlckNhc2UoKS5pbmRleE9mKFwid2RhdGVwaWNrZXIuanNcIikpO1xyXG4gICAgICAgICAgICBBID0gXy5sYXN0SW5kZXhPZihcIi9cIik7XHJcbiAgICAgICAgICAgIGlmIChBID4gMCkgXyA9IF8uc3Vic3RyaW5nKDAsIEEgKyAxKTtcclxuICAgICAgICAgICAgaWYgKF8pIGJyZWFrIH1cclxuICAgICAgICByZXR1cm4gXyB9XHJcblxyXG4gICAgZnVuY3Rpb24gSyhBLCAkLCBCKSB7XHJcbiAgICAgICAgdmFyIEQgPSBZW05dW0NdKFwiSEVBRFwiKS5pdGVtKDApLFxyXG4gICAgICAgICAgICBfID0gWVtOXS5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcclxuICAgICAgICBpZiAoRCkgeyBfLmhyZWYgPSBBO1xyXG4gICAgICAgICAgICBfLnJlbCA9IFwic3R5bGVzaGVldFwiO1xyXG4gICAgICAgICAgICBfLnR5cGUgPSBcInRleHQvY3NzXCI7XHJcbiAgICAgICAgICAgIGlmICgkKSBfLnRpdGxlID0gJDtcclxuICAgICAgICAgICAgaWYgKEIpIF8uY2hhcnNldCA9IEI7XHJcbiAgICAgICAgICAgIEQuYXBwZW5kQ2hpbGQoXykgfSB9XHJcblxyXG4gICAgZnVuY3Rpb24gRigkKSB7ICQgPSAkIHx8IFY7XHJcbiAgICAgICAgdmFyIEEgPSAwLFxyXG4gICAgICAgICAgICBfID0gMDtcclxuICAgICAgICB3aGlsZSAoJCAhPSBWKSB7XHJcbiAgICAgICAgICAgIHZhciBEID0gJC5wYXJlbnRbTl1bQ10oXCJpZnJhbWVcIik7XHJcbiAgICAgICAgICAgIGZvciAodmFyIEYgPSAwOyBGIDwgRC5sZW5ndGg7IEYrKykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoRFtGXS5jb250ZW50V2luZG93ID09ICQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIEUgPSBXKERbRl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBBICs9IEUubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXyArPSBFLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgfSB9IGNhdGNoIChCKSB7fSB9XHJcbiAgICAgICAgICAgICQgPSAkLnBhcmVudCB9XHJcbiAgICAgICAgcmV0dXJuIHsgXCJsZWZ0TVwiOiBBLCBcInRvcE1cIjogXyB9IH1cclxuXHJcbiAgICBmdW5jdGlvbiBXKEcsIEYpIHtcclxuICAgICAgICBpZiAoRy5nZXRCb3VuZGluZ0NsaWVudFJlY3QpIHJldHVybiBHLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgQSA9IHsgUk9PVF9UQUc6IC9eYm9keXxodG1sJC9pLCBPUF9TQ1JPTEw6IC9eKD86aW5saW5lfHRhYmxlLXJvdykkL2kgfSxcclxuICAgICAgICAgICAgICAgIEUgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIEkgPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgXyA9IEcub2Zmc2V0VG9wLFxyXG4gICAgICAgICAgICAgICAgSCA9IEcub2Zmc2V0TGVmdCxcclxuICAgICAgICAgICAgICAgIEQgPSBHLm9mZnNldFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgQiA9IEcub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgQyA9IEcub2Zmc2V0UGFyZW50O1xyXG4gICAgICAgICAgICBpZiAoQyAhPSBHKVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKEMpIHsgSCArPSBDLm9mZnNldExlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgXyArPSBDLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoUihDLCBcInBvc2l0aW9uXCIpLnRvTG93ZXJDYXNlKCkgPT0gXCJmaXhlZFwiKSBFID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChDLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImJvZHlcIikgSSA9IEMub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcclxuICAgICAgICAgICAgICAgICAgICBDID0gQy5vZmZzZXRQYXJlbnQgfVxyXG4gICAgICAgICAgICBDID0gRy5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoQy50YWdOYW1lICYmICFBLlJPT1RfVEFHLnRlc3QoQy50YWdOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEMuc2Nyb2xsVG9wIHx8IEMuc2Nyb2xsTGVmdClcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUEuT1BfU0NST0xMLnRlc3QoUChDKSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYyB8fCBDLnN0eWxlLm92ZXJmbG93ICE9PSBcInZpc2libGVcIikgeyBIIC09IEMuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8gLT0gQy5zY3JvbGxUb3AgfVxyXG4gICAgICAgICAgICAgICAgQyA9IEMucGFyZW50Tm9kZSB9XHJcbiAgICAgICAgICAgIGlmICghRSkge1xyXG4gICAgICAgICAgICAgICAgdmFyICQgPSBiKEkpO1xyXG4gICAgICAgICAgICAgICAgSCAtPSAkLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICBfIC09ICQudG9wIH1cclxuICAgICAgICAgICAgRCArPSBIO1xyXG4gICAgICAgICAgICBCICs9IF87XHJcbiAgICAgICAgICAgIHJldHVybiB7IFwibGVmdFwiOiBILCBcInRvcFwiOiBfLCBcInJpZ2h0XCI6IEQsIFwiYm90dG9tXCI6IEIgfSB9IH1cclxuXHJcbiAgICBmdW5jdGlvbiBNKCQpIHsgJCA9ICQgfHwgVjtcclxuICAgICAgICB2YXIgQiA9ICRbTl0sXHJcbiAgICAgICAgICAgIEEgPSAoJC5pbm5lcldpZHRoKSA/ICQuaW5uZXJXaWR0aCA6IChCW0hdICYmIEJbSF0uY2xpZW50V2lkdGgpID8gQltIXS5jbGllbnRXaWR0aCA6IEIuYm9keS5vZmZzZXRXaWR0aCxcclxuICAgICAgICAgICAgXyA9ICgkLmlubmVySGVpZ2h0KSA/ICQuaW5uZXJIZWlnaHQgOiAoQltIXSAmJiBCW0hdLmNsaWVudEhlaWdodCkgPyBCW0hdLmNsaWVudEhlaWdodCA6IEIuYm9keS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIHsgXCJ3aWR0aFwiOiBBLCBcImhlaWdodFwiOiBfIH0gfVxyXG5cclxuICAgIGZ1bmN0aW9uIGIoJCkgeyAkID0gJCB8fCBWO1xyXG4gICAgICAgIHZhciBCID0gJFtOXSxcclxuICAgICAgICAgICAgQSA9IEJbSF0sXHJcbiAgICAgICAgICAgIF8gPSBCLmJvZHk7XHJcbiAgICAgICAgQiA9IChBICYmIEEuc2Nyb2xsVG9wICE9IG51bGwgJiYgKEEuc2Nyb2xsVG9wID4gXy5zY3JvbGxUb3AgfHwgQS5zY3JvbGxMZWZ0ID4gXy5zY3JvbGxMZWZ0KSkgPyBBIDogXztcclxuICAgICAgICByZXR1cm4geyBcInRvcFwiOiBCLnNjcm9sbFRvcCwgXCJsZWZ0XCI6IEIuc2Nyb2xsTGVmdCB9IH1cclxuXHJcbiAgICBmdW5jdGlvbiBEKCQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgXyA9ICQgPyAoJC5zcmNFbGVtZW50IHx8ICQudGFyZ2V0KSA6IG51bGw7XHJcbiAgICAgICAgICAgIGlmICgkZHAuY2FsICYmICEkZHAuZUNvbnQgJiYgJGRwLmRkICYmIF8gIT0gJGRwLmVsICYmICRkcC5kZC5zdHlsZS5kaXNwbGF5ID09IFwiYmxvY2tcIikgJGRwLmNhbC5jbG9zZSgpIH0gY2F0Y2ggKCQpIHt9IH1cclxuXHJcbiAgICBmdW5jdGlvbiBaKCkgeyAkZHAuc3RhdHVzID0gMiB9XHJcbiAgICB2YXIgUSwgXztcclxuXHJcbiAgICBmdW5jdGlvbiBVKEssIEMpIHtcclxuICAgICAgICBpZiAoISRkcCkgcmV0dXJuO1xyXG4gICAgICAgIEIoKTtcclxuICAgICAgICB2YXIgTCA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIEggaW4gSykgTFtIXSA9IEtbSF07XHJcbiAgICAgICAgZm9yIChIIGluICQpXHJcbiAgICAgICAgICAgIGlmIChILnN1YnN0cmluZygwLCAxKSAhPSBcIiRcIiAmJiBMW0hdID09PSB1bmRlZmluZWQpIExbSF0gPSAkW0hdO1xyXG4gICAgICAgIGlmIChDKSB7XHJcbiAgICAgICAgICAgIGlmICghSigpKSB7IF8gPSBfIHx8IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChWW05dLnJlYWR5U3RhdGUgPT0gXCJjb21wbGV0ZVwiKSBjbGVhckludGVydmFsKF8pO1xyXG4gICAgICAgICAgICAgICAgICAgIFUobnVsbCwgdHJ1ZSkgfSwgNTApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIH1cclxuICAgICAgICAgICAgaWYgKCRkcC5zdGF0dXMgPT0gMCkgeyAkZHAuc3RhdHVzID0gMTtcclxuICAgICAgICAgICAgICAgIEwuZWwgPSBUO1xyXG4gICAgICAgICAgICAgICAgSShMLCB0cnVlKSB9IGVsc2UgcmV0dXJuIH0gZWxzZSBpZiAoTC5lQ29udCkgeyBMLmVDb250ID0gJGRwLiQoTC5lQ29udCk7XHJcbiAgICAgICAgICAgIEwuZWwgPSBUO1xyXG4gICAgICAgICAgICBMLmF1dG9QaWNrRGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIEwucXNFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIEkoTCkgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCQuJHByZUxvYWQgJiYgJGRwLnN0YXR1cyAhPSAyKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBGID0gRCgpO1xyXG4gICAgICAgICAgICBpZiAoWS5ldmVudCA9PT0gRiB8fCBGKSB7IEwuc3JjRWwgPSBGLnNyY0VsZW1lbnQgfHwgRi50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBGLmNhbmNlbEJ1YmJsZSA9IHRydWUgfVxyXG4gICAgICAgICAgICBMLmVsID0gTC5lbCA9ICRkcC4kKEwuZWwgfHwgTC5zcmNFbCk7XHJcbiAgICAgICAgICAgIGlmICghTC5lbCB8fCBMLmVsW1wiTXk5N01hcmtcIl0gPT09IHRydWUgfHwgTC5lbC5kaXNhYmxlZCB8fCAoJGRwLmRkICYmIFAoJGRwLmRkKSAhPSBcIm5vbmVcIiAmJiAkZHAuZGQuc3R5bGUubGVmdCAhPSBcIi05NzBweFwiKSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTC5lbFtcIk15OTdNYXJrXCJdKSBMLmVsW1wiTXk5N01hcmtcIl0gPSBmYWxzZSB9IGNhdGNoIChBKSB7fVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIH1cclxuICAgICAgICAgICAgaWYgKEYgJiYgTC5lbC5ub2RlVHlwZSA9PSAxICYmICFhKEwuZWwuaW5pdGNmZywgSykpIHsgJGRwLnVuYmluZChMLmVsKTtcclxuICAgICAgICAgICAgICAgIEUoTC5lbCwgRi50eXBlID09IFwiZm9jdXNcIiA/IFwib25jbGlja1wiIDogXCJvbmZvY3VzXCIsIGZ1bmN0aW9uKCkgeyBVKEspIH0pO1xyXG4gICAgICAgICAgICAgICAgTC5lbC5pbml0Y2ZnID0gSyB9XHJcbiAgICAgICAgICAgIEkoTCkgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBKKCkge1xyXG4gICAgICAgICAgICBpZiAoUyAmJiBWICE9IFkgJiYgVltOXS5yZWFkeVN0YXRlICE9IFwiY29tcGxldGVcIikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEQoKSB7XHJcbiAgICAgICAgICAgIGlmIChHKSB7IGZ1bmMgPSBELmNhbGxlcjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChmdW5jICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJCA9IGZ1bmMuYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkICYmICgkICsgXCJcIikuaW5kZXhPZihcIkV2ZW50XCIpID49IDApIHJldHVybiAkO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmMgPSBmdW5jLmNhbGxlciB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbCB9XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudCB9IH1cclxuXHJcbiAgICBmdW5jdGlvbiBSKF8sICQpIHtcclxuICAgICAgICByZXR1cm4gXy5jdXJyZW50U3R5bGUgPyBfLmN1cnJlbnRTdHlsZVskXSA6IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoXywgZmFsc2UpWyRdIH1cclxuXHJcbiAgICBmdW5jdGlvbiBQKF8sICQpIHtcclxuICAgICAgICBpZiAoXylcclxuICAgICAgICAgICAgaWYgKCQgIT0gbnVsbCkgXy5zdHlsZS5kaXNwbGF5ID0gJDtcclxuICAgICAgICAgICAgZWxzZSByZXR1cm4gUihfLCBcImRpc3BsYXlcIikgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEkoRywgXykge1xyXG4gICAgICAgIHZhciBEID0gRy5lbCA/IEcuZWwubm9kZU5hbWUgOiBcIklOUFVUXCI7XHJcbiAgICAgICAgaWYgKF8gfHwgRy5lQ29udCB8fCBuZXcgUmVnRXhwKC9pbnB1dHx0ZXh0YXJlYXxkaXZ8c3BhbnxwfGEvaWcpLnRlc3QoRCkpIEcuZWxQcm9wID0gRCA9PSBcIklOUFVUXCIgPyBcInZhbHVlXCIgOiBcImlubmVySFRNTFwiO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuO1xyXG4gICAgICAgIGlmIChHLmxhbmcgPT0gXCJhdXRvXCIpIEcubGFuZyA9IFMgPyBuYXZpZ2F0b3IuYnJvd3Nlckxhbmd1YWdlLnRvTG93ZXJDYXNlKCkgOiBuYXZpZ2F0b3IubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoIUcuZUNvbnQpXHJcbiAgICAgICAgICAgIGZvciAodmFyIEMgaW4gRykgJGRwW0NdID0gR1tDXTtcclxuICAgICAgICBpZiAoISRkcC5kZCB8fCBHLmVDb250IHx8ICgkZHAuZGQgJiYgKEcuZ2V0UmVhbExhbmcoKS5uYW1lICE9ICRkcC5kZC5sYW5nIHx8IEcuc2tpbiAhPSAkZHAuZGQuc2tpbikpKSB7XHJcbiAgICAgICAgICAgIGlmIChHLmVDb250KSBFKEcuZUNvbnQsIEcpO1xyXG4gICAgICAgICAgICBlbHNlIHsgJGRwLmRkID0gVltOXS5jcmVhdGVFbGVtZW50KFwiRElWXCIpO1xyXG4gICAgICAgICAgICAgICAgJGRwLmRkLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlXCI7XHJcbiAgICAgICAgICAgICAgICBWW05dLmJvZHkuYXBwZW5kQ2hpbGQoJGRwLmRkKTtcclxuICAgICAgICAgICAgICAgIEUoJGRwLmRkLCBHKTtcclxuICAgICAgICAgICAgICAgIGlmIChfKSAkZHAuZGQuc3R5bGUubGVmdCA9ICRkcC5kZC5zdHlsZS50b3AgPSBcIi05NzBweFwiO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB7ICRkcC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgQigkZHApIH0gfSB9IGVsc2UgaWYgKCRkcC5jYWwpIHsgJGRwLnNob3coKTtcclxuICAgICAgICAgICAgJGRwLmNhbC5pbml0KCk7XHJcbiAgICAgICAgICAgIGlmICghJGRwLmVDb250KSBCKCRkcCkgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBFKEssIEopIHtcclxuICAgICAgICAgICAgdmFyIEkgPSBWW05dLmRvbWFpbixcclxuICAgICAgICAgICAgICAgIEYgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIEcgPSBcIjxpZnJhbWUgaGlkZUZvY3VzPXRydWUgd2lkdGg9OSBoZWlnaHQ9NyBmcmFtZWJvcmRlcj0wIGJvcmRlcj0wIHNjcm9sbGluZz1ubyBzcmM9XFxcImFib3V0OmJsYW5rXFxcIj48L2lmcmFtZT5cIjtcclxuICAgICAgICAgICAgSy5pbm5lckhUTUwgPSBHO1xyXG4gICAgICAgICAgICB2YXIgXyA9ICQuJGxhbmdMaXN0LFxyXG4gICAgICAgICAgICAgICAgRCA9ICQuJHNraW5MaXN0LFxyXG4gICAgICAgICAgICAgICAgSDtcclxuICAgICAgICAgICAgdHJ5IHsgSCA9IEsubGFzdENoaWxkLmNvbnRlbnRXaW5kb3dbTl0gfSBjYXRjaCAoRSkgeyBGID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIEsucmVtb3ZlQ2hpbGQoSy5sYXN0Q2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIEwgPSBWW05dLmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XHJcbiAgICAgICAgICAgICAgICBMLmhpZGVGb2N1cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBMLmZyYW1lQm9yZGVyID0gMDtcclxuICAgICAgICAgICAgICAgIEwuc2Nyb2xsaW5nID0gXCJub1wiO1xyXG4gICAgICAgICAgICAgICAgTC5zcmMgPSBcImphdmFzY3JpcHQ6KGZ1bmN0aW9uKCl7dmFyIGQ9ZG9jdW1lbnQ7ZC5vcGVuKCk7ZC5kb21haW49J1wiICsgSSArIFwiJzt9KSgpXCI7XHJcbiAgICAgICAgICAgICAgICBLLmFwcGVuZENoaWxkKEwpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgSCA9IEsubGFzdENoaWxkLmNvbnRlbnRXaW5kb3dbTl07XHJcbiAgICAgICAgICAgICAgICAgICAgQygpIH0sIDk3KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB9XHJcbiAgICAgICAgICAgIEMoKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIEMoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgXyA9IEouZ2V0UmVhbExhbmcoKTtcclxuICAgICAgICAgICAgICAgIEsubGFuZyA9IF8ubmFtZTtcclxuICAgICAgICAgICAgICAgIEsuc2tpbiA9IEouc2tpbjtcclxuICAgICAgICAgICAgICAgIHZhciAkID0gW1wiPGhlYWQ+PHNjcmlwdD5cIiwgXCJcIiwgXCJ2YXIgZG9jPWRvY3VtZW50LCAkZCwgJGRwLCAkY2ZnPWRvYy5jZmcsICRwZHAgPSBwYXJlbnQuJGRwLCAkZHQsICR0ZHQsICRzZHQsICRsYXN0SW5wdXQsICRJRT0kcGRwLmllLCAkRkYgPSAkcGRwLmZmLCRPUEVSQT0kcGRwLm9wZXJhLCAkbnksICRjTWFyayA9IGZhbHNlO1wiLCBcImlmKCRjZmcuZUNvbnQpeyRkcCA9IHt9O2Zvcih2YXIgcCBpbiAkcGRwKSRkcFtwXT0kcGRwW3BdO31lbHNleyRkcD0kcGRwO307Zm9yKHZhciBwIGluICRjZmcpeyRkcFtwXT0kY2ZnW3BdO31cIiwgXCJkb2Mub25jb250ZXh0bWVudT1mdW5jdGlvbigpe3RyeXskYy5fZmlsbFFTKCEkZHAuaGFzLmQsMSk7c2hvd0IoJGQucXNEaXZTZWwpO31jYXRjaChlKXt9O3JldHVybiBmYWxzZTt9O1wiLCBcIjwvc2NyaXB0PjxzY3JpcHQgY2hhcnNldD1cIiwgXy5jaGFyc2V0LCBcIj5cIixcInZhciAkbGFuZyA9IHtlcnJBbGVydE1zZzogJ1xcdTRFMERcXHU1NDA4XFx1NkNENVxcdTc2ODRcXHU2NUU1XFx1NjcxRlxcdTY4M0NcXHU1RjBGXFx1NjIxNlxcdTgwMDVcXHU2NUU1XFx1NjcxRlxcdThEODVcXHU1MUZBXFx1OTY1MFxcdTVCOUFcXHU4MzAzXFx1NTZGNCxcXHU5NzAwXFx1ODk4MVxcdTY0QTRcXHU5NTAwXFx1NTQxNz8nLGFXZWVrU3RyOiBbJ1xcdTU0NjgnLCdcXHU2NUU1JywnXFx1NEUwMCcsJ1xcdTRFOEMnLCdcXHU0RTA5JywnXFx1NTZEQicsJ1xcdTRFOTQnLCdcXHU1MTZEJ10sYUxvbmdXZWVrU3RyOlsnXFx1NTQ2OCcsJ1xcdTY2MUZcXHU2NzFGXFx1NjVFNScsJ1xcdTY2MUZcXHU2NzFGXFx1NEUwMCcsJ1xcdTY2MUZcXHU2NzFGXFx1NEU4QycsJ1xcdTY2MUZcXHU2NzFGXFx1NEUwOScsJ1xcdTY2MUZcXHU2NzFGXFx1NTZEQicsJ1xcdTY2MUZcXHU2NzFGXFx1NEU5NCcsJ1xcdTY2MUZcXHU2NzFGXFx1NTE2RCddLGFNb25TdHI6IFsnXFx1NEUwMFxcdTY3MDgnLCdcXHU0RThDXFx1NjcwOCcsJ1xcdTRFMDlcXHU2NzA4JywnXFx1NTZEQlxcdTY3MDgnLCdcXHU0RTk0XFx1NjcwOCcsJ1xcdTUxNkRcXHU2NzA4JywnXFx1NEUwM1xcdTY3MDgnLCdcXHU1MTZCXFx1NjcwOCcsJ1xcdTRFNURcXHU2NzA4JywnXFx1NTM0MVxcdTY3MDgnLCdcXHU1MzQxXFx1NEUwMCcsJ1xcdTUzNDFcXHU0RThDJ10sYUxvbmdNb25TdHI6IFsnXFx1NEUwMFxcdTY3MDgnLCdcXHU0RThDXFx1NjcwOCcsJ1xcdTRFMDlcXHU2NzA4JywnXFx1NTZEQlxcdTY3MDgnLCdcXHU0RTk0XFx1NjcwOCcsJ1xcdTUxNkRcXHU2NzA4JywnXFx1NEUwM1xcdTY3MDgnLCdcXHU1MTZCXFx1NjcwOCcsJ1xcdTRFNURcXHU2NzA4JywnXFx1NTM0MVxcdTY3MDgnLCdcXHU1MzQxXFx1NEUwMFxcdTY3MDgnLCdcXHU1MzQxXFx1NEU4Q1xcdTY3MDgnXSxjbGVhclN0cjogJ1xcdTZFMDVcXHU3QTdBJyx0b2RheVN0cjogJ1xcdTRFQ0FcXHU1OTI5Jyxva1N0cjogJ1xcdTc4NkVcXHU1QjlBJyx1cGRhdGVTdHI6ICdcXHU3ODZFXFx1NUI5QScsdGltZVN0cjogJ1xcdTY1RjZcXHU5NUY0JyxxdWlja1N0cjogJ1xcdTVGRUJcXHU5MDFGXFx1OTAwOVxcdTYyRTknLGVycl8xOiAnXFx1NjcwMFxcdTVDMEZcXHU2NUU1XFx1NjcxRlxcdTRFMERcXHU4MEZEXFx1NTkyN1xcdTRFOEVcXHU2NzAwXFx1NTkyN1xcdTY1RTVcXHU2NzFGISd9XCIsXCI8L3NjcmlwdD5cIl07XHJcbiAgICAgICAgICAgICAgICBpZiAoRikgJFsxXSA9IFwiZG9jdW1lbnQuZG9tYWluPVxcXCJcIiArIEkgKyBcIlxcXCI7XCI7XHJcbiAgICAgICAgICAgICAgICAvL2ZvciAodmFyIEMgPSAwOyBDIDwgRC5sZW5ndGg7IEMrKylcclxuICAgICAgICAgICAgICAgIC8vICAgIGlmIChEW0NdLm5hbWUgPT0gSi5za2luKSAkLnB1c2goXCI8bGluayByZWw9XFxcInN0eWxlc2hlZXRcXFwiIHR5cGU9XFxcInRleHQvY3NzXFxcIiBocmVmPVxcXCJcIiArIEEgKyBcInNraW4vXCIgKyBEW0NdLm5hbWUgKyBcIi9kYXRlcGlja2VyLmNzc1xcXCIgY2hhcnNldD1cXFwiXCIgKyBEW0NdLmNoYXJzZXQgKyBcIlxcXCIvPlwiKTtcclxuICAgICAgICAgICAgICAgIC8vJC5wdXNoKFwiPHN0eWxlPlwiKTtcclxuICAgICAgICAgICAgICAgIC8vJC5wdXNoKFwiLldkYXRlRGl2e3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjE5MHB4O2ZvbnQtc2l6ZToxMnB4O2NvbG9yOiMzMzM7Ym9yZGVyOnNvbGlkIDFweCAjREVERURFO2JhY2tncm91bmQtY29sb3I6I0YyRjBGMTtwYWRkaW5nOjVweDt9LldkYXRlRGl2Mnt3aWR0aDozNjBweDt9LldkYXRlRGl2IC5OYXZJbWcgYSwuV2RhdGVEaXYgLnltaW5wdXQsLldkYXRlRGl2IC55bWlucHV0Zm9jdXMsLldkYXRlRGl2ICNkcFFTe2JhY2tncm91bmQ6dXJsKGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEZBRElBTVFBQUh0N2UvLy8vOUxRMFpXVGxLV2xwYlN5cy9EdTc4WEZ4ZlR5ODk3YzNabVptYSt0cnM3Rnp2ZnY5NzY4dmViazVkalcxOHpNek5iTzFnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0g1QkFFSEFBRUFMQUFBQUFBVUFNZ0FBQVgvb0NFYXdBZ0VhS29HU0F1VTVMbXU3aHZMYzNxL2ZLN3l3SmN2aFFqMmhnRVI3NFpNS2dHMTVvaGthbHF2Mkt4Mnk4MU9sU0twb1ZXRVNjbExReE9kRmdmRFNGTWJTUzZiNDFPYkdwOXZkZitBZ1lLREtBaFVYMjR3STRtS2UwTlBlbzQra0M5K2VFQ0xsNUdTT1U5MUNHNmZvSVNrcGFhRGlvMU5lcFdXUTBzOHJqNUdsYXUwT0xPMG5ET3hjNjh3cmFPdkpuV254c2ZJdjBGWXkxbEhXcmpKMHRQVTFkWmR0TXhBMEVKYjBkZmc0ZUxqcENKa0VBSUNDZWF5aFMwT0EvSHhDZ0taS2dnUEJBTUtDZ2Y2OFE3ZzNDUEFqNStCQ0FVSFJOaDFZRi9CZ3dVTnpvaG9FR0ZFQVJNcEdvQ3dZQUZCQlE0eVJxenpnRjhCa1FVSldCUlkrVEhrQ29JRVlzYWtTRy9HQVFVeWMrYmNaZUNqem84TFp4aklsekxpQVlGRUREbWdTQUNDUFIyR1JFQ1l1bTRLdWF0WXMycmR5cldyMTY5Z3c0b2RTN2FzMmJObzA2cGR5N2F0MjdkdzQ4cWRTN2N1aWhBQU93PT0pIG5vLXJlcGVhdDt9LldkYXRlRGl2IC5OYXZJbWcgYXtmbG9hdDpsZWZ0O3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Y3Vyc29yOnBvaW50ZXI7fS5XZGF0ZURpdiAuTmF2SW1nbGwgYXtiYWNrZ3JvdW5kLXBvc2l0aW9uOjAgNXB4O30uV2RhdGVEaXYgLk5hdkltZ2wgYXtiYWNrZ3JvdW5kLXBvc2l0aW9uOjAgLTEwcHg7fS5XZGF0ZURpdiAuTmF2SW1nciBhe2JhY2tncm91bmQtcG9zaXRpb246MCAtMjVweDtmbG9hdDpyaWdodDt9LldkYXRlRGl2IC5OYXZJbWdyciBhe2JhY2tncm91bmQtcG9zaXRpb246MCAtNDBweDtmbG9hdDpyaWdodDt9LldkYXRlRGl2ICNkcFRpdGxle2xpbmUtaGVpZ2h0OjA7aGVpZ2h0OjIzcHg7cGFkZGluZzozcHggMCAwO30uV2RhdGVEaXYgLnltaW5wdXQsLldkYXRlRGl2IC55bWlucHV0Zm9jdXN7bWFyZ2luLWxlZnQ6M3B4O3dpZHRoOjUwcHg7aGVpZ2h0OjIwcHg7bGluZS1oZWlnaHQ6MTZweDtib3JkZXI6c29saWQgMXB4ICNGMkYwRjE7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZC1wb3NpdGlvbjozNXB4IC02OHB4O30uV2RhdGVEaXYgLnltaW5wdXRmb2N1c3tiYWNrZ3JvdW5kLWNvbG9yOiNmZmY7Ym9yZGVyOnNvbGlkIDFweCAjRDhEOEQ4O30uV2RhdGVEaXYgLm1lbnVTZWx7ei1pbmRleDoxO3Bvc2l0aW9uOmFic29sdXRlO2JhY2tncm91bmQtY29sb3I6I0ZGRjtib3JkZXI6I0EzQzZDOCAxcHggc29saWQ7ZGlzcGxheTpub25lO30uV2RhdGVEaXYgLm1lbnV7YmFja2dyb3VuZDojZmZmO30uV2RhdGVEaXYgLm1lbnVPbntjb2xvcjojZmZmO2JhY2tncm91bmQ6IzY0QTNGMzt9LldkYXRlRGl2IC5NTWVudSwuV2RhdGVEaXYgLllNZW51e21hcmdpbi10b3A6MjBweDttYXJnaW4tbGVmdDotMXB4O3dpZHRoOjY4cHg7Ym9yZGVyOnNvbGlkIDFweCAjRDlEOUQ5O3BhZGRpbmc6MnB4O30uV2RhdGVEaXYgLk1NZW51IHRhYmxlLC5XZGF0ZURpdiAuWU1lbnUgdGFibGV7d2lkdGg6MTAwJTt9LldkYXRlRGl2IC5NTWVudSB0YWJsZSB0ZCwuV2RhdGVEaXYgLllNZW51IHRhYmxlIHRke2xpbmUtaGVpZ2h0OjIwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEycHg7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowO30uV2RhdGVEaXYgLld3ZWVre3RleHQtYWxpZ246Y2VudGVyO2JhY2tncm91bmQ6I0RBRjNGNTtib3JkZXItcmlnaHQ6I0JERUJFRSAxcHggc29saWQ7fS5XZGF0ZURpdiB0ZHtsaW5lLWhlaWdodDoyMHB4O2ZvbnQtc2l6ZToxMnB4O2NvbG9yOiM5OTk7YmFja2dyb3VuZDojZmZmO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MXB4O30uV2RhdGVEaXYgLk1UaXRsZSB0ZHtsaW5lLWhlaWdodDoyNHB4O2NvbG9yOiM3RDdEN0Q7YmFja2dyb3VuZDojRjJGMEYxO2N1cnNvcjpkZWZhdWx0O30uV2RhdGVEaXYgLldkYXlUYWJsZTJ7Ym9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO2JvcmRlcjpncmF5IDFweCBzb2xpZDt9LldkYXRlRGl2IC5XZGF5VGFibGUyIHRhYmxle2JvcmRlcjowO30uV2RhdGVEaXYgLldkYXlUYWJsZXtsaW5lLWhlaWdodDoyMHB4O2NvbG9yOiMxMzc3N2U7YmFja2dyb3VuZC1jb2xvcjojZWRmYmZiO30uV2RhdGVEaXYgLldkYXlUYWJsZSB0ZHt0ZXh0LWFsaWduOmNlbnRlcjt9LldkYXRlRGl2IC5XZGF5e2NvbG9yOiMzMjMyMzI7fS5XZGF0ZURpdiAuV3dkYXl7Y29sb3I6IzY1QTRGMzt9LldkYXRlRGl2IC5XdG9kYXl7Y29sb3I6I0ZGNkQxMDtiYWNrZ3JvdW5kOiNFMEVERkU7fS5XZGF0ZURpdiAuV3NwZWNpYWxEYXl7YmFja2dyb3VuZC1jb2xvcjojNjZGNERGO30uV2RhdGVEaXYgLldvdGhlckRheXtjb2xvcjojRDRENEQ0O30uV2RhdGVEaXYgI2RwVGltZXtwb3NpdGlvbjpyZWxhdGl2ZTttYXJnaW4tdG9wOjVweDt9LldkYXRlRGl2ICNkcFRpbWUgI2RwVGltZVN0cntkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDozMHB4O2NvbG9yOiM3ZDdkN2Q7fS5XZGF0ZURpdiAjZHBUaW1lIGlucHV0e3dpZHRoOjI1cHg7aGVpZ2h0OjIwcHg7bGluZS1oZWlnaHQ6MjBweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjojMzMzO2JvcmRlcjojRDlEOUQ5IDFweCBzb2xpZDttYXJnaW46MDtwYWRkaW5nOjA7fS5XZGF0ZURpdiAjZHBUaW1lIC50bXt3aWR0aDo3cHg7Ym9yZGVyOm5vbmU7YmFja2dyb3VuZDojRjJGMEYxO30uV2RhdGVEaXYgI2RwUVN7ZmxvYXQ6bGVmdDttYXJnaW4tcmlnaHQ6M3B4O21hcmdpbi10b3A6NnB4O3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZC1wb3NpdGlvbjowIC05MHB4O30uV2RhdGVEaXYgI2RwQ29udHJvbHt0ZXh0LWFsaWduOnJpZ2h0O21hcmdpbi10b3A6M3B4O30uV2RhdGVEaXYgLmRwQnV0dG9ue21hcmdpbi1sZWZ0OjJweDtsaW5lLWhlaWdodDoxNnB4O3dpZHRoOjQ1cHg7YmFja2dyb3VuZC1jb2xvcjojNjRBM0YzO2NvbG9yOiNmZmY7Ym9yZGVyOm5vbmU7Y3Vyc29yOnBvaW50ZXI7fS5XZGF0ZURpdiAuZHBCdXR0b246aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojNjRBM0YzO30uV2RhdGVEaXYgLmhoTWVudSwuV2RhdGVEaXYgLm1tTWVudSwuV2RhdGVEaXYgLnNzTWVudXtwb3NpdGlvbjphYnNvbHV0ZTtmb250LXNpemU6MTJweDtjb2xvcjojMzMzO2JvcmRlcjpzb2xpZCAxcHggI0RFREVERTtiYWNrZ3JvdW5kLWNvbG9yOiNGMkYwRjE7cGFkZGluZzozcHg7fS5XZGF0ZURpdiAjZHBUaW1lIC5tZW51LC5XZGF0ZURpdiAjZHBUaW1lIC5tZW51T257d2lkdGg6MThweDtoZWlnaHQ6MThweDtsaW5lLWhlaWdodDoxOHB4O3RleHQtYWxpZ246Y2VudGVyO2JhY2tncm91bmQ6I2ZmZjt9LldkYXRlRGl2ICNkcFRpbWUgLm1lbnVPbntiYWNrZ3JvdW5kOiM2NUEyRjM7fS5XZGF0ZURpdiAjZHBUaW1lIHRke2JhY2tncm91bmQ6I0YyRjBGMTt9LldkYXRlRGl2IC5oaE1lbnV7dG9wOi04N3B4O2xlZnQ6MzJweDt9LldkYXRlRGl2IC5tbU1lbnV7dG9wOi00N3B4O2xlZnQ6MzJweDt9LldkYXRlRGl2IC5zc01lbnV7dG9wOi0yN3B4O2xlZnQ6MzJweDt9LldkYXRlRGl2IC5pbnZhbGlkTWVudSwuV2RhdGVEaXYgLldpbnZhbGlkRGF5e2NvbG9yOiNhYWE7fS5XZGF0ZURpdiAuV2RheU9uLC5XZGF0ZURpdiAuV3dkYXlPbiwuV2RhdGVEaXYgLldzZWxkYXksLldkYXRlRGl2IC5Xb3RoZXJEYXlPbntiYWNrZ3JvdW5kLWNvbG9yOiM2NUEyRjM7Y29sb3I6I2ZmZjt9LldkYXRlRGl2ICNkcFRpbWUgI2RwVGltZVVwLC5XZGF0ZURpdiAjZHBUaW1lICNkcFRpbWVEb3due2Rpc3BsYXk6bm9uZTt9XCIpO1xyXG4gICAgICAgICAgICAgICAgLy8kLnB1c2goXCI8L3N0eWxlPlwiKS9fUnVudGltZS9iYXNlL3N0eWxlL21vZHVsZXNfYnVzaW5lc3MvdHdvZXIuY3NzXHJcbiAgICAgICAgICAgICAgICAkLnB1c2goXCI8bGluayByZWw9XFxcInN0eWxlc2hlZXRcXFwiIHR5cGU9XFxcInRleHQvY3NzXFxcIiBocmVmPVxcXCIvQ29udGVudC9zdHlsZS9jb21tb24vZGF0ZXBpY2tlci9kYXRlcGlja2VyLmNzc1xcXCIgY2hhcnNldD1cXFwidXRmLThcXFwiLz5cIilcclxuICAgICAgICAgICAgICAgICQucHVzaChcIjxzY3JpcHQ+XCIpO1xyXG4gICAgICAgICAgICAgICAgJC5wdXNoKGRlY29kZVVSSUNvbXBvbmVudChcImlmKCUyNGNmZy5lQ29udCklN0IlMjRkcCUzRCU3QiU3RCUzQmZvcih2YXIlMjBwJTIwaW4lMjAlMjRwZHApaWYodHlwZW9mJTIwJTI0cGRwJTVCcCU1RCUzRCUzRCUyMm9iamVjdCUyMiklN0IlMjRkcCU1QnAlNUQlM0QlN0IlN0QlM0Jmb3IodmFyJTIwcHAlMjBpbiUyMCUyNHBkcCU1QnAlNUQpJTI0ZHAlNUJwJTVEJTVCcHAlNUQlM0QlMjRwZHAlNUJwJTVEJTVCcHAlNUQlN0RlbHNlJTIwJTI0ZHAlNUJwJTVEJTNEJTI0cGRwJTVCcCU1RCU3RGVsc2UlMjAlMjRkcCUzRCUyNHBkcCUzQmZvcihwJTIwaW4lMjAlMjRjZmcpJTI0ZHAlNUJwJTVEJTNEJTI0Y2ZnJTVCcCU1RCUzQnZhciUyMCUyNGMlM0JpZiglMjRGRiklN0JFdmVudC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXyglMjJyZXR1cm5WYWx1ZSUyMiUyQ2Z1bmN0aW9uKCUyNCklN0JpZighJTI0KXRoaXMucHJldmVudERlZmF1bHQoKSUzQnJldHVybiUyMCUyNCU3RCklM0JFdmVudC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXyglMjJzcmNFbGVtZW50JTIyJTJDZnVuY3Rpb24oKSU3QnZhciUyMCUyNCUzRHRoaXMudGFyZ2V0JTNCd2hpbGUoJTI0Lm5vZGVUeXBlISUzRDEpJTI0JTNEJTI0LnBhcmVudE5vZGUlM0JyZXR1cm4lMjAlMjQlN0QpJTdEZnVuY3Rpb24lMjBNeTk3RFAoKSU3QiUyNGMlM0R0aGlzJTNCdGhpcy5RUyUzRCU1QiU1RCUzQiUyNGQlM0Rkb2N1bWVudC5jcmVhdGVFbGVtZW50KCUyMmRpdiUyMiklM0IlMjRkLmNsYXNzTmFtZSUzRCUyMldkYXRlRGl2JTIyJTNCJTI0ZC5pbm5lckhUTUwlM0QlMjIlM0NkaXYlMjBpZCUzRGRwVGl0bGUlM0UlM0NkaXYlMjBjbGFzcyUzRCU1QyUyMm5hdkltZyUyME5hdkltZ2xsJTVDJTIyJTNFJTNDYSUzRSUzQyUyRmElM0UlM0MlMkZkaXYlM0UlM0NkaXYlMjBjbGFzcyUzRCU1QyUyMm5hdkltZyUyME5hdkltZ2wlNUMlMjIlM0UlM0NhJTNFJTNDJTJGYSUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMHN0eWxlJTNEJTVDJTIyZmxvYXQlM0FsZWZ0JTVDJTIyJTNFJTNDZGl2JTIwY2xhc3MlM0QlNUMlMjJtZW51U2VsJTIwTU1lbnUlNUMlMjIlM0UlM0MlMkZkaXYlM0UlM0NpbnB1dCUyMGNsYXNzJTNEeW1pbnB1dCUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMHN0eWxlJTNEJTVDJTIyZmxvYXQlM0FsZWZ0JTVDJTIyJTNFJTNDZGl2JTIwY2xhc3MlM0QlNUMlMjJtZW51U2VsJTIwWU1lbnUlNUMlMjIlM0UlM0MlMkZkaXYlM0UlM0NpbnB1dCUyMGNsYXNzJTNEeW1pbnB1dCUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMGNsYXNzJTNEJTVDJTIybmF2SW1nJTIwTmF2SW1ncnIlNUMlMjIlM0UlM0NhJTNFJTNDJTJGYSUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMGNsYXNzJTNEJTVDJTIybmF2SW1nJTIwTmF2SW1nciU1QyUyMiUzRSUzQ2ElM0UlM0MlMkZhJTNFJTNDJTJGZGl2JTNFJTNDZGl2JTIwc3R5bGUlM0QlNUMlMjJmbG9hdCUzQXJpZ2h0JTVDJTIyJTNFJTNDJTJGZGl2JTNFJTNDJTJGZGl2JTNFJTNDZGl2JTIwc3R5bGUlM0QlNUMlMjJwb3NpdGlvbiUzQWFic29sdXRlJTNCb3ZlcmZsb3clM0FoaWRkZW4lNUMlMjIlM0UlM0MlMkZkaXYlM0UlM0NkaXYlM0UlM0MlMkZkaXYlM0UlM0NkaXYlMjBpZCUzRGRwVGltZSUzRSUzQ2RpdiUyMGNsYXNzJTNEJTVDJTIybWVudVNlbCUyMGhoTWVudSU1QyUyMiUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMGNsYXNzJTNEJTVDJTIybWVudVNlbCUyMG1tTWVudSU1QyUyMiUzRSUzQyUyRmRpdiUzRSUzQ2RpdiUyMGNsYXNzJTNEJTVDJTIybWVudVNlbCUyMHNzTWVudSU1QyUyMiUzRSUzQyUyRmRpdiUzRSUzQ3RhYmxlJTIwY2VsbHNwYWNpbmclM0QwJTIwY2VsbHBhZGRpbmclM0QwJTIwYm9yZGVyJTNEMCUzRSUzQ3RyJTNFJTNDdGQlMjByb3dzcGFuJTNEMiUzRSUzQ3NwYW4lMjBpZCUzRGRwVGltZVN0ciUzRSUzQyUyRnNwYW4lM0UlMjZuYnNwJTNCJTNDaW5wdXQlMjBjbGFzcyUzRHRCJTIwbWF4bGVuZ3RoJTNEMiUzRSUzQ2lucHV0JTIwdmFsdWUlM0QlNUMlMjIlM0ElNUMlMjIlMjBjbGFzcyUzRHRtJTIwcmVhZG9ubHklM0UlM0NpbnB1dCUyMGNsYXNzJTNEdEUlMjBtYXhsZW5ndGglM0QyJTNFJTNDaW5wdXQlMjB2YWx1ZSUzRCU1QyUyMiUzQSU1QyUyMiUyMGNsYXNzJTNEdG0lMjByZWFkb25seSUzRSUzQ2lucHV0JTIwY2xhc3MlM0R0RSUyMG1heGxlbmd0aCUzRDIlM0UlM0MlMkZ0ZCUzRSUzQ3RkJTNFJTNDYnV0dG9uJTIwaWQlM0RkcFRpbWVVcCUzRSUzQyUyRmJ1dHRvbiUzRSUzQyUyRnRkJTNFJTNDJTJGdHIlM0UlM0N0ciUzRSUzQ3RkJTNFJTNDYnV0dG9uJTIwaWQlM0RkcFRpbWVEb3duJTNFJTNDJTJGYnV0dG9uJTNFJTNDJTJGdGQlM0UlM0MlMkZ0ciUzRSUzQyUyRnRhYmxlJTNFJTNDJTJGZGl2JTNFJTNDZGl2JTIwaWQlM0RkcFFTJTNFJTNDJTJGZGl2JTNFJTNDZGl2JTIwaWQlM0RkcENvbnRyb2wlM0UlM0NpbnB1dCUyMGNsYXNzJTNEZHBCdXR0b24lMjBpZCUzRGRwQ2xlYXJJbnB1dCUyMHR5cGUlM0RidXR0b24lM0UlM0NpbnB1dCUyMGNsYXNzJTNEZHBCdXR0b24lMjBpZCUzRGRwVG9kYXlJbnB1dCUyMHR5cGUlM0RidXR0b24lM0UlM0NpbnB1dCUyMGNsYXNzJTNEZHBCdXR0b24lMjBpZCUzRGRwT2tJbnB1dCUyMHR5cGUlM0RidXR0b24lM0UlM0MlMkZkaXYlM0UlMjIlM0JhdHRhY2hUYWJFdmVudCglMjRkJTJDZnVuY3Rpb24oKSU3QmhpZGVTZWwoKSU3RCklM0JBKCklM0J0aGlzLmluaXQoKSUzQiUyNGRwLmZvY3VzQXJyJTNEJTVCZG9jdW1lbnQlMkMlMjRkLk1JJTJDJTI0ZC55SSUyQyUyNGQuSEklMkMlMjRkLm1JJTJDJTI0ZC5zSSUyQyUyNGQuY2xlYXJJJTJDJTI0ZC50b2RheUklMkMlMjRkLm9rSSU1RCUzQmZvcih2YXIlMjBCJTNEMCUzQkIlM0MlMjRkcC5mb2N1c0Fyci5sZW5ndGglM0JCJTJCJTJCKSU3QnZhciUyMF8lM0QlMjRkcC5mb2N1c0FyciU1QkIlNUQlM0JfLm5leHRDdHJsJTNEQiUzRCUzRCUyNGRwLmZvY3VzQXJyLmxlbmd0aC0xJTNGJTI0ZHAuZm9jdXNBcnIlNUIxJTVEJTNBJTI0ZHAuZm9jdXNBcnIlNUJCJTJCMSU1RCUzQiUyNGRwLmF0dGFjaEV2ZW50KF8lMkMlMjJvbmtleWRvd24lMjIlMkNfdGFiKSU3RCUyNCgpJTNCX2lucHV0QmluZEV2ZW50KCUyMnklMkNNJTJDSCUyQ20lMkNzJTIyKSUzQiUyNGQudXBCdXR0b24ub25jbGljayUzRGZ1bmN0aW9uKCklN0J1cGRvd25FdmVudCgxKSU3RCUzQiUyNGQuZG93bkJ1dHRvbi5vbmNsaWNrJTNEZnVuY3Rpb24oKSU3QnVwZG93bkV2ZW50KC0xKSU3RCUzQiUyNGQucXNEaXYub25jbGljayUzRGZ1bmN0aW9uKCklN0JpZiglMjRkLnFzRGl2U2VsLnN0eWxlLmRpc3BsYXkhJTNEJTIyYmxvY2slMjIpJTdCJTI0Yy5fZmlsbFFTKCklM0JzaG93QiglMjRkLnFzRGl2U2VsKSU3RGVsc2UlMjBoaWRlKCUyNGQucXNEaXZTZWwpJTdEJTNCZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCglMjRkKSUzQmZ1bmN0aW9uJTIwQSgpJTdCdmFyJTIwXyUzRCUyNCglMjJhJTIyKSUzQmRpdnMlM0QlMjQoJTIyZGl2JTIyKSUyQ2lwdHMlM0QlMjQoJTIyaW5wdXQlMjIpJTJDYnRucyUzRCUyNCglMjJidXR0b24lMjIpJTJDc3BhbnMlM0QlMjQoJTIyc3BhbiUyMiklM0IlMjRkLm5hdkxlZnRJbWclM0RfJTVCMCU1RCUzQiUyNGQubGVmdEltZyUzRF8lNUIxJTVEJTNCJTI0ZC5yaWdodEltZyUzRF8lNUIzJTVEJTNCJTI0ZC5uYXZSaWdodEltZyUzRF8lNUIyJTVEJTNCJTI0ZC5yTUQlM0RkaXZzJTVCOSU1RCUzQiUyNGQuTUklM0RpcHRzJTVCMCU1RCUzQiUyNGQueUklM0RpcHRzJTVCMSU1RCUzQiUyNGQudGl0bGVEaXYlM0RkaXZzJTVCMCU1RCUzQiUyNGQuTUQlM0RkaXZzJTVCNCU1RCUzQiUyNGQueUQlM0RkaXZzJTVCNiU1RCUzQiUyNGQucXNEaXZTZWwlM0RkaXZzJTVCMTAlNUQlM0IlMjRkLmREaXYlM0RkaXZzJTVCMTElNUQlM0IlMjRkLnREaXYlM0RkaXZzJTVCMTIlNUQlM0IlMjRkLkhEJTNEZGl2cyU1QjEzJTVEJTNCJTI0ZC5tRCUzRGRpdnMlNUIxNCU1RCUzQiUyNGQuc0QlM0RkaXZzJTVCMTUlNUQlM0IlMjRkLnFzRGl2JTNEZGl2cyU1QjE2JTVEJTNCJTI0ZC5iRGl2JTNEZGl2cyU1QjE3JTVEJTNCJTI0ZC5ISSUzRGlwdHMlNUIyJTVEJTNCJTI0ZC5tSSUzRGlwdHMlNUI0JTVEJTNCJTI0ZC5zSSUzRGlwdHMlNUI2JTVEJTNCJTI0ZC5jbGVhckklM0RpcHRzJTVCNyU1RCUzQiUyNGQudG9kYXlJJTNEaXB0cyU1QjglNUQlM0IlMjRkLm9rSSUzRGlwdHMlNUI5JTVEJTNCJTI0ZC51cEJ1dHRvbiUzRGJ0bnMlNUIwJTVEJTNCJTI0ZC5kb3duQnV0dG9uJTNEYnRucyU1QjElNUQlM0IlMjRkLnRpbWVTcGFuJTNEc3BhbnMlNUIwJTVEJTNCZnVuY3Rpb24lMjAlMjQoJTI0KSU3QnJldHVybiUyMCUyNGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJTI0KSU3RCU3RGZ1bmN0aW9uJTIwJTI0KCklN0IlMjRkLm5hdkxlZnRJbWcub25jbGljayUzRGZ1bmN0aW9uKCklN0IlMjRueSUzRCUyNG55JTNDJTNEMCUzRiUyNG55LTElM0EtMSUzQmlmKCUyNG55JTI1NSUzRCUzRDApJTdCJTI0ZC55SS5mb2N1cygpJTNCcmV0dXJuJTdEJTI0ZC55SS52YWx1ZSUzRCUyNGR0LnktMSUzQiUyNGQueUkub25ibHVyKCklN0QlM0IlMjRkLmxlZnRJbWcub25jbGljayUzRGZ1bmN0aW9uKCklN0IlMjRkdC5hdHRyKCUyMk0lMjIlMkMtMSklM0IlMjRkLk1JLm9uYmx1cigpJTdEJTNCJTI0ZC5yaWdodEltZy5vbmNsaWNrJTNEZnVuY3Rpb24oKSU3QiUyNGR0LmF0dHIoJTIyTSUyMiUyQzEpJTNCJTI0ZC5NSS5vbmJsdXIoKSU3RCUzQiUyNGQubmF2UmlnaHRJbWcub25jbGljayUzRGZ1bmN0aW9uKCklN0IlMjRueSUzRCUyNG55JTNFJTNEMCUzRiUyNG55JTJCMSUzQTElM0JpZiglMjRueSUyNTUlM0QlM0QwKSU3QiUyNGQueUkuZm9jdXMoKSUzQnJldHVybiU3RCUyNGQueUkudmFsdWUlM0QlMjRkdC55JTJCMSUzQiUyNGQueUkub25ibHVyKCklN0QlN0QlN0RNeTk3RFAucHJvdG90eXBlJTNEJTdCaW5pdCUzQWZ1bmN0aW9uKCklN0IlMjRueSUzRDAlM0IlMjRkcC5jYWwlM0R0aGlzJTNCaWYoJTI0ZHAucmVhZE9ubHklMjYlMjYlMjRkcC5lbC5yZWFkT25seSElM0RudWxsKSU3QiUyNGRwLmVsLnJlYWRPbmx5JTNEdHJ1ZSUzQiUyNGRwLmVsLmJsdXIoKSU3RHRoaXMuX2RlYWxGbXQoKSUzQiUyNGR0JTNEdGhpcy5uZXdkYXRlJTNEbmV3JTIwRFBEYXRlKCklM0IlMjR0ZHQlM0RuZXclMjBEUERhdGUoKSUzQiUyNHNkdCUzRHRoaXMuZGF0ZSUzRG5ldyUyMERQRGF0ZSgpJTNCJTI0ZHAudmFsdWVFZGl0ZWQlM0QwJTNCdGhpcy5kYXRlRm10JTNEdGhpcy5kb0V4cCglMjRkcC5kYXRlRm10KSUzQnRoaXMuYXV0b1BpY2tEYXRlJTNEJTI0ZHAuYXV0b1BpY2tEYXRlJTNEJTNEbnVsbCUzRiglMjRkcC5oYXMuc3QlMjYlMjYlMjRkcC5oYXMuc3QlM0ZmYWxzZSUzQXRydWUpJTNBJTI0ZHAuYXV0b1BpY2tEYXRlJTNCJTI0ZHAuYXV0b1VwZGF0ZU9uQ2hhbmdlZCUzRCUyNGRwLmF1dG9VcGRhdGVPbkNoYW5nZWQlM0QlM0RudWxsJTNGKCUyNGRwLmlzU2hvd09LJTI2JTI2JTI0ZHAuaGFzLmQlM0ZmYWxzZSUzQXRydWUpJTNBJTI0ZHAuYXV0b1VwZGF0ZU9uQ2hhbmdlZCUzQnRoaXMuZGRhdGVSZSUzRHRoaXMuX2luaXRSZSglMjJkaXNhYmxlZERhdGVzJTIyKSUzQnRoaXMuZGRheVJlJTNEdGhpcy5faW5pdFJlKCUyMmRpc2FibGVkRGF5cyUyMiklM0J0aGlzLnNkYXRlUmUlM0R0aGlzLl9pbml0UmUoJTIyc3BlY2lhbERhdGVzJTIyKSUzQnRoaXMuc2RheVJlJTNEdGhpcy5faW5pdFJlKCUyMnNwZWNpYWxEYXlzJTIyKSUzQnRoaXMubWluRGF0ZSUzRHRoaXMuZG9DdXN0b21EYXRlKCUyNGRwLm1pbkRhdGUlMkMlMjRkcC5taW5EYXRlISUzRCUyNGRwLmRlZk1pbkRhdGUlM0YlMjRkcC5yZWFsRm10JTNBJTI0ZHAucmVhbEZ1bGxGbXQlMkMlMjRkcC5kZWZNaW5EYXRlKSUzQnRoaXMubWF4RGF0ZSUzRHRoaXMuZG9DdXN0b21EYXRlKCUyNGRwLm1heERhdGUlMkMlMjRkcC5tYXhEYXRlISUzRCUyNGRwLmRlZk1heERhdGUlM0YlMjRkcC5yZWFsRm10JTNBJTI0ZHAucmVhbEZ1bGxGbXQlMkMlMjRkcC5kZWZNYXhEYXRlKSUzQmlmKHRoaXMubWluRGF0ZS5jb21wYXJlV2l0aCh0aGlzLm1heERhdGUpJTNFMCklMjRkcC5lcnJNc2clM0QlMjRsYW5nLmVycl8xJTNCaWYodGhpcy5sb2FkRGF0ZSgpKSU3QnRoaXMuX21ha2VEYXRlSW5SYW5nZSgpJTNCdGhpcy5vbGRWYWx1ZSUzRCUyNGRwLmVsJTVCJTI0ZHAuZWxQcm9wJTVEJTdEZWxzZSUyMHRoaXMubWFyayhmYWxzZSUyQzIpJTNCX3NldEFsbCglMjRkdCklM0IlMjRkLnRpbWVTcGFuLmlubmVySFRNTCUzRCUyNGxhbmcudGltZVN0ciUzQiUyNGQuY2xlYXJJLnZhbHVlJTNEJTI0bGFuZy5jbGVhclN0ciUzQiUyNGQudG9kYXlJLnZhbHVlJTNEJTI0bGFuZy50b2RheVN0ciUzQiUyNGQub2tJLnZhbHVlJTNEJTI0bGFuZy5va1N0ciUzQiUyNGQub2tJLmRpc2FibGVkJTNEISUyNGMuY2hlY2tWYWxpZCglMjRzZHQpJTNCdGhpcy5pbml0U2hvd0FuZEhpZGUoKSUzQnRoaXMuaW5pdEJ0bigpJTNCaWYoJTI0ZHAuZXJyTXNnKWFsZXJ0KCUyNGRwLmVyck1zZyklM0J0aGlzLmRyYXcoKSUzQmlmKCUyNGRwLmVsLm5vZGVUeXBlJTNEJTNEMSUyNiUyNiUyNGRwLmVsJTVCJTIyTXk5N01hcmslMjIlNUQlM0QlM0QlM0R1bmRlZmluZWQpJTdCJTI0ZHAuYXR0YWNoRXZlbnQoJTI0ZHAuZWwlMkMlMjJvbmtleWRvd24lMjIlMkNfdGFiKSUzQiUyNGRwLmF0dGFjaEV2ZW50KCUyNGRwLmVsJTJDJTIyb25ibHVyJTIyJTJDZnVuY3Rpb24oKSU3QmlmKCUyNGRwJTI2JTI2JTI0ZHAuZGQuc3R5bGUuZGlzcGxheSUzRCUzRCUyMm5vbmUlMjIpJTdCJTI0Yy5jbG9zZSgpJTNCaWYoISUyNGRwLnZhbHVlRWRpdGVkJTI2JTI2JTI0ZHAuY2FsLm9sZFZhbHVlISUzRCUyNGRwLmVsJTVCJTI0ZHAuZWxQcm9wJTVEJTI2JTI2JTI0ZHAuZWwub25jaGFuZ2UpZmlyZUV2ZW50KCUyNGRwLmVsJTJDJTIyY2hhbmdlJTIyKSU3RCU3RCklM0IlMjRkcC5lbCU1QiUyMk15OTdNYXJrJTIyJTVEJTNEZmFsc2UlN0QlMjRjLmN1cnJGb2N1cyUzRCUyNGRwLmVsJTNCaGlkZVNlbCgpJTdEJTJDX21ha2VEYXRlSW5SYW5nZSUzQWZ1bmN0aW9uKCklN0J2YXIlMjBfJTNEdGhpcy5jaGVja1JhbmdlKCklM0JpZihfISUzRDApJTdCdmFyJTIwJTI0JTNCaWYoXyUzRTApJTI0JTNEdGhpcy5tYXhEYXRlJTNCZWxzZSUyMCUyNCUzRHRoaXMubWluRGF0ZSUzQmlmKCUyNGRwLmhhcy5zZCklN0IlMjRkdC55JTNEJTI0LnklM0IlMjRkdC5NJTNEJTI0Lk0lM0IlMjRkdC5kJTNEJTI0LmQlN0RpZiglMjRkcC5oYXMuc3QpJTdCJTI0ZHQuSCUzRCUyNC5IJTNCJTI0ZHQubSUzRCUyNC5tJTNCJTI0ZHQucyUzRCUyNC5zJTdEJTdEJTdEJTJDc3BsaXREYXRlJTNBZnVuY3Rpb24oSyUyQ0MlMkNSJTJDRiUyQ0IlMkNIJTJDRyUyQ0wlMkNNKSU3QnZhciUyMCUyNCUzQmlmKEslMjYlMjZLLmxvYWREYXRlKSUyNCUzREslM0JlbHNlJTdCJTI0JTNEbmV3JTIwRFBEYXRlKCklM0JpZihLISUzRCUyMiUyMiklN0JDJTNEQyU3QyU3QyUyNGRwLmRhdGVGbXQlM0J2YXIlMjBJJTJDRCUyQ1ElM0QwJTJDUCUyQ0ElM0QlMkZ5eXl5JTdDeXl5JTdDeXklN0N5JTdDTU1NTSU3Q01NTSU3Q01NJTdDTSU3Q2RkJTdDZCU3QyUyNWxkJTdDSEglN0NIJTdDbW0lN0NtJTdDc3MlN0NzJTdDREQlN0NEJTdDV1clN0NXJTdDdyUyRmclMkNfJTNEQy5tYXRjaChBKSUzQkEubGFzdEluZGV4JTNEMCUzQmlmKE0pUCUzREsuc3BsaXQoJTJGJTVDVyUyQiUyRiklM0JlbHNlJTdCdmFyJTIwRSUzRDAlMkNOJTNEJTIyJTVFJTIyJTNCd2hpbGUoKFAlM0RBLmV4ZWMoQykpISUzRCUzRG51bGwpJTdCaWYoRSUzRSUzRDApJTdCRCUzREMuc3Vic3RyaW5nKEUlMkNQLmluZGV4KSUzQmlmKEQlMjYlMjYlMjItJTJGJTVDJTVDJTIyLmluZGV4T2YoRCklM0UlM0QwKUQlM0QlMjIlNUIlNUMlNUMtJTJGJTVEJTIyJTNCTiUyQiUzREQlN0RFJTNEQS5sYXN0SW5kZXglM0Jzd2l0Y2goUCU1QjAlNUQpJTdCY2FzZSUyMnl5eXklMjIlM0FOJTJCJTNEJTIyKCU1QyU1Q2QlN0I0JTdEKSUyMiUzQmJyZWFrJTNCY2FzZSUyMnl5eSUyMiUzQU4lMkIlM0QlMjIoJTVDJTVDZCU3QjMlN0QpJTIyJTNCYnJlYWslM0JjYXNlJTIyTU1NTSUyMiUzQWNhc2UlMjJNTU0lMjIlM0FjYXNlJTIyREQlMjIlM0FjYXNlJTIyRCUyMiUzQU4lMkIlM0QlMjIoJTVDJTVDRCUyQiklMjIlM0JicmVhayUzQmRlZmF1bHQlM0FOJTJCJTNEJTIyKCU1QyU1Q2QlNUMlNUNkJTNGKSUyMiUzQmJyZWFrJTdEJTdETiUyQiUzRCUyMi4qJTI0JTIyJTNCUCUzRG5ldyUyMFJlZ0V4cChOKS5leGVjKEspJTNCUSUzRDElN0RpZihQKSU3QmZvcihJJTNEMCUzQkklM0NfLmxlbmd0aCUzQkklMkIlMkIpJTdCdmFyJTIwSiUzRFAlNUJJJTJCUSU1RCUzQmlmKEopc3dpdGNoKF8lNUJJJTVEKSU3QmNhc2UlMjJNTU1NJTIyJTNBY2FzZSUyMk1NTSUyMiUzQSUyNC5NJTNETyhfJTVCSSU1RCUyQ0opJTNCYnJlYWslM0JjYXNlJTIyeSUyMiUzQWNhc2UlMjJ5eSUyMiUzQUolM0RwSW50MihKJTJDMCklM0JpZihKJTNDNTApSiUyQiUzRDIwMDAlM0JlbHNlJTIwSiUyQiUzRDE5MDAlM0IlMjQueSUzREolM0JicmVhayUzQmNhc2UlMjJ5eXklMjIlM0ElMjQueSUzRHBJbnQyKEolMkMwKSUyQiUyNGRwLnllYXJPZmZzZXQlM0JicmVhayUzQmRlZmF1bHQlM0ElMjQlNUJfJTVCSSU1RC5zbGljZSgtMSklNUQlM0RKJTNCYnJlYWslN0QlN0QlN0RlbHNlJTIwJTI0LmQlM0QzMiU3RCU3RCUyNC5jb3ZlckRhdGUoUiUyQ0YlMkNCJTJDSCUyQ0clMkNMKSUzQnJldHVybiUyMCUyNCUzQmZ1bmN0aW9uJTIwTyhBJTJDJTI0KSU3QnZhciUyMF8lM0RBJTNEJTNEJTIyTU1NTSUyMiUzRiUyNGxhbmcuYUxvbmdNb25TdHIlM0ElMjRsYW5nLmFNb25TdHIlM0Jmb3IodmFyJTIwQiUzRDAlM0JCJTNDMTIlM0JCJTJCJTJCKWlmKF8lNUJCJTVELnRvTG93ZXJDYXNlKCklM0QlM0QlMjQuc3Vic3RyKDAlMkNfJTVCQiU1RC5sZW5ndGgpLnRvTG93ZXJDYXNlKCkpcmV0dXJuJTIwQiUyQjElM0JyZXR1cm4tMSU3RCU3RCUyQ19pbml0UmUlM0FmdW5jdGlvbihfKSU3QnZhciUyMEIlMkMlMjQlM0QlMjRkcCU1Ql8lNUQlMkNBJTNEJTIyJTIyJTNCaWYoJTI0JTI2JTI2JTI0Lmxlbmd0aCUzRTApJTdCZm9yKEIlM0QwJTNCQiUzQyUyNC5sZW5ndGglM0JCJTJCJTJCKSU3QkElMkIlM0R0aGlzLmRvRXhwKCUyNCU1QkIlNUQpJTNCaWYoQiElM0QlMjQubGVuZ3RoLTEpQSUyQiUzRCUyMiU3QyUyMiU3REElM0RBJTNGbmV3JTIwUmVnRXhwKCUyMiglM0YlM0ElMjIlMkJBJTJCJTIyKSUyMiklM0FudWxsJTdEZWxzZSUyMEElM0RudWxsJTNCcmV0dXJuJTIwQSU3RCUyQ3VwZGF0ZSUzQWZ1bmN0aW9uKCUyNCklN0JpZiglMjQlM0QlM0QlM0R1bmRlZmluZWQpJTI0JTNEdGhpcy5nZXROZXdEYXRlU3RyKCklM0JpZiglMjRkcC5lbCU1QiUyNGRwLmVsUHJvcCU1RCElM0QlMjQpJTI0ZHAuZWwlNUIlMjRkcC5lbFByb3AlNUQlM0QlMjQlM0J0aGlzLnNldFJlYWxWYWx1ZSgpJTdEJTJDc2V0UmVhbFZhbHVlJTNBZnVuY3Rpb24oJTI0KSU3QnZhciUyMF8lM0QlMjRkcC4lMjQoJTI0ZHAudmVsKSUyQyUyNCUzRHJ0biglMjQlMkN0aGlzLmdldE5ld0RhdGVTdHIoJTI0ZHAucmVhbEZtdCkpJTNCaWYoXylfLnZhbHVlJTNEJTI0JTNCJTI0ZHAuZWwlNUIlMjJyZWFsVmFsdWUlMjIlNUQlM0QlMjQlN0QlMkNkb0V4cCUzQWZ1bmN0aW9uKHMpJTdCdmFyJTIwcHMlM0QlMjJ5TWRIbXMlMjIlMkNhcnIlMkN0bXBFdmFsJTJDcmUlM0QlMkYlMjMlM0YlNUMlN0IoLiolM0YpJTVDJTdEJTJGJTNCcyUzRHMlMkIlMjIlMjIlM0Jmb3IodmFyJTIwaSUzRDAlM0JpJTNDcHMubGVuZ3RoJTNCaSUyQiUyQilzJTNEcy5yZXBsYWNlKCUyMiUyNSUyMiUyQnBzLmNoYXJBdChpKSUyQ3RoaXMuZ2V0UChwcy5jaGFyQXQoaSklMkNudWxsJTJDJTI0dGR0KSklM0JpZihzLnN1YnN0cmluZygwJTJDMyklM0QlM0QlMjIlMjNGJTdCJTIyKSU3QnMlM0RzLnN1YnN0cmluZygzJTJDcy5sZW5ndGgtMSklM0JpZihzLmluZGV4T2YoJTIycmV0dXJuJTIwJTIyKSUzQzApcyUzRCUyMnJldHVybiUyMCUyMiUyQnMlM0JzJTNEJTI0ZHAud2luLmV2YWwoJTIybmV3JTIwRnVuY3Rpb24oJTVDJTIyJTIyJTJCcyUyQiUyMiU1QyUyMiklM0IlMjIpJTNCcyUzRHMoKSU3RHdoaWxlKChhcnIlM0RyZS5leGVjKHMpKSElM0RudWxsKSU3QmFyci5sYXN0SW5kZXglM0RhcnIuaW5kZXglMkJhcnIlNUIxJTVELmxlbmd0aCUyQmFyciU1QjAlNUQubGVuZ3RoLWFyciU1QjElNUQubGVuZ3RoLTElM0J0bXBFdmFsJTNEcEludChldmFsKGFyciU1QjElNUQpKSUzQmlmKHRtcEV2YWwlM0MwKXRtcEV2YWwlM0QlMjI5NzAwJTIyJTJCKC10bXBFdmFsKSUzQnMlM0RzLnN1YnN0cmluZygwJTJDYXJyLmluZGV4KSUyQnRtcEV2YWwlMkJzLnN1YnN0cmluZyhhcnIubGFzdEluZGV4JTJCMSklN0RyZXR1cm4lMjBzJTdEJTJDZG9DdXN0b21EYXRlJTNBZnVuY3Rpb24oQSUyQ0IlMkNfKSU3QnZhciUyMCUyNCUzQkElM0R0aGlzLmRvRXhwKEEpJTNCaWYoIUElN0MlN0NBJTNEJTNEJTIyJTIyKUElM0RfJTNCaWYodHlwZW9mJTIwQSUzRCUzRCUyMm9iamVjdCUyMiklMjQlM0RBJTNCZWxzZSU3QiUyNCUzRHRoaXMuc3BsaXREYXRlKEElMkNCJTJDbnVsbCUyQ251bGwlMkMxJTJDMCUyQzAlMkMwJTJDdHJ1ZSklM0IlMjQueSUzRCglMjIlMjIlMkIlMjQueSkucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0IlMjQuTSUzRCglMjIlMjIlMkIlMjQuTSkucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0IlMjQuZCUzRCglMjIlMjIlMkIlMjQuZCkucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0IlMjQuSCUzRCglMjIlMjIlMkIlMjQuSCkucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0IlMjQubSUzRCglMjIlMjIlMkIlMjQubSkucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0IlMjQucyUzRCglMjIlMjIlMkIlMjQucykucmVwbGFjZSglMkYlNUU5NzAwJTJGJTJDJTIyLSUyMiklM0JpZihBLmluZGV4T2YoJTIyJTI1bGQlMjIpJTNFJTNEMCklN0JBJTNEQS5yZXBsYWNlKCUyRiUyNWxkJTJGZyUyQyUyMjAlMjIpJTNCJTI0LmQlM0QwJTNCJTI0Lk0lM0RwSW50KCUyNC5NKSUyQjElN0QlMjQucmVmcmVzaCgpJTdEcmV0dXJuJTIwJTI0JTdEJTJDbG9hZERhdGUlM0FmdW5jdGlvbigpJTdCdmFyJTIwQSUzRCUyNGRwLmVsJTVCJTI0ZHAuZWxQcm9wJTVEJTJDJTI0JTNEdGhpcy5kYXRlRm10JTJDXyUzRCUyNGRwLmhhcyUzQmlmKCUyNGRwLmFsd2F5c1VzZVN0YXJ0RGF0ZSU3QyU3QyglMjRkcC5zdGFydERhdGUhJTNEJTIyJTIyJTI2JTI2QSUzRCUzRCUyMiUyMikpJTdCQSUzRHRoaXMuZG9FeHAoJTI0ZHAuc3RhcnREYXRlKSUzQiUyNCUzRCUyNGRwLnJlYWxGbXQlN0QlMjRkdC5sb2FkRnJvbURhdGUodGhpcy5zcGxpdERhdGUoQSUyQyUyNCkpJTNCaWYoQSElM0QlMjIlMjIpJTdCdmFyJTIwQiUzRDElM0JpZihfLnNkJTI2JTI2IXRoaXMuaXNEYXRlKCUyNGR0KSklN0IlMjRkdC55JTNEJTI0dGR0LnklM0IlMjRkdC5NJTNEJTI0dGR0Lk0lM0IlMjRkdC5kJTNEJTI0dGR0LmQlM0JCJTNEMCU3RGlmKF8uc3QlMjYlMjYhdGhpcy5pc1RpbWUoJTI0ZHQpKSU3QiUyNGR0LkglM0QlMjR0ZHQuSCUzQiUyNGR0Lm0lM0QlMjR0ZHQubSUzQiUyNGR0LnMlM0QlMjR0ZHQucyUzQkIlM0QwJTdEcmV0dXJuJTIwQiUyNiUyNnRoaXMuY2hlY2tWYWxpZCglMjRkdCklN0RpZighXy5IKSUyNGR0LkglM0QwJTNCaWYoIV8ubSklMjRkdC5tJTNEMCUzQmlmKCFfLnMpJTI0ZHQucyUzRDAlM0JyZXR1cm4lMjAxJTdEJTJDaXNEYXRlJTNBZnVuY3Rpb24oJTI0KSU3QmlmKCUyNC55ISUzRG51bGwpJTI0JTNEZG9TdHIoJTI0LnklMkM0KSUyQiUyMi0lMjIlMkIlMjQuTSUyQiUyMi0lMjIlMkIlMjQuZCUzQnJldHVybiUyMCUyNC5tYXRjaCglMkYlNUUoKCU1Q2QlN0IyJTdEKCglNUIwMjQ2OCU1RCU1QjA0OCU1RCklN0MoJTVCMTM1NzklNUQlNUIyNiU1RCkpJTVCJTVDLSU1QyUyRiU1Q3MlNUQlM0YoKCgoMCUzRiU1QjEzNTc4JTVEKSU3QygxJTVCMDIlNUQpKSU1QiU1Qy0lNUMlMkYlNUNzJTVEJTNGKCgwJTNGJTVCMS05JTVEKSU3QyglNUIxLTIlNUQlNUIwLTklNUQpJTdDKDMlNUIwMSU1RCkpKSU3QygoKDAlM0YlNUI0NjklNUQpJTdDKDExKSklNUIlNUMtJTVDJTJGJTVDcyU1RCUzRigoMCUzRiU1QjEtOSU1RCklN0MoJTVCMS0yJTVEJTVCMC05JTVEKSU3QygzMCkpKSU3QygwJTNGMiU1QiU1Qy0lNUMlMkYlNUNzJTVEJTNGKCgwJTNGJTVCMS05JTVEKSU3QyglNUIxLTIlNUQlNUIwLTklNUQpKSkpKSU3QyglNUNkJTdCMiU3RCgoJTVCMDI0NjglNUQlNUIxMjM1Njc5JTVEKSU3QyglNUIxMzU3OSU1RCU1QjAxMzQ1Nzg5JTVEKSklNUIlNUMtJTVDJTJGJTVDcyU1RCUzRigoKCgwJTNGJTVCMTM1NzglNUQpJTdDKDElNUIwMiU1RCkpJTVCJTVDLSU1QyUyRiU1Q3MlNUQlM0YoKDAlM0YlNUIxLTklNUQpJTdDKCU1QjEtMiU1RCU1QjAtOSU1RCklN0MoMyU1QjAxJTVEKSkpJTdDKCgoMCUzRiU1QjQ2OSU1RCklN0MoMTEpKSU1QiU1Qy0lNUMlMkYlNUNzJTVEJTNGKCgwJTNGJTVCMS05JTVEKSU3QyglNUIxLTIlNUQlNUIwLTklNUQpJTdDKDMwKSkpJTdDKDAlM0YyJTVCJTVDLSU1QyUyRiU1Q3MlNUQlM0YoKDAlM0YlNUIxLTklNUQpJTdDKDElNUIwLTklNUQpJTdDKDIlNUIwLTglNUQpKSkpKSkoJTVDcygoKDAlM0YlNUIwLTklNUQpJTdDKCU1QjEtMiU1RCU1QjAtMyU1RCkpJTVDJTNBKCU1QjAtNSU1RCUzRiU1QjAtOSU1RCkoKCU1Q3MpJTdDKCU1QyUzQSglNUIwLTUlNUQlM0YlNUIwLTklNUQpKSkpKSUzRiUyNCUyRiklN0QlMkNpc1RpbWUlM0FmdW5jdGlvbiglMjQpJTdCaWYoJTI0LkghJTNEbnVsbCklMjQlM0QlMjQuSCUyQiUyMiUzQSUyMiUyQiUyNC5tJTJCJTIyJTNBJTIyJTJCJTI0LnMlM0JyZXR1cm4lMjAlMjQubWF0Y2goJTJGJTVFKCU1QjAtOSU1RCU3QyglNUIwLTElNUQlNUIwLTklNUQpJTdDKCU1QjIlNUQlNUIwLTMlNUQpKSUzQSglNUIwLTklNUQlN0MoJTVCMC01JTVEJTVCMC05JTVEKSklM0EoJTVCMC05JTVEJTdDKCU1QjAtNSU1RCU1QjAtOSU1RCkpJTI0JTJGKSU3RCUyQ2NoZWNrUmFuZ2UlM0FmdW5jdGlvbiglMjQlMkNBKSU3QiUyNCUzRCUyNCU3QyU3QyUyNGR0JTNCdmFyJTIwXyUzRCUyNC5jb21wYXJlV2l0aCh0aGlzLm1pbkRhdGUlMkNBKSUzQmlmKF8lM0UwKSU3Ql8lM0QlMjQuY29tcGFyZVdpdGgodGhpcy5tYXhEYXRlJTJDQSklM0JpZihfJTNDMClfJTNEMCU3RHJldHVybiUyMF8lN0QlMkNjaGVja1ZhbGlkJTNBZnVuY3Rpb24oJTI0JTJDQSUyQ0IpJTdCQSUzREElN0MlN0MlMjRkcC5oYXMubWluVW5pdCUzQnZhciUyMF8lM0R0aGlzLmNoZWNrUmFuZ2UoJTI0JTJDQSklM0JpZihfJTNEJTNEMCklN0JfJTNEMSUzQmlmKEElM0QlM0QlMjJkJTIyJTI2JTI2QiUzRCUzRG51bGwpQiUzRE1hdGguYWJzKChuZXclMjBEYXRlKCUyNC55JTJDJTI0Lk0tMSUyQyUyNC5kKS5nZXREYXkoKS0lMjRkcC5maXJzdERheU9mV2VlayUyQjcpJTI1NyklM0JfJTNEIXRoaXMudGVzdERpc0RheShCKSUyNiUyNiF0aGlzLnRlc3REaXNEYXRlKCUyNCUyQ0EpJTdEZWxzZSUyMF8lM0QwJTNCcmV0dXJuJTIwXyU3RCUyQ2NoZWNrQW5kVXBkYXRlJTNBZnVuY3Rpb24oKSU3QnZhciUyMF8lM0QlMjRkcC5lbCUyQ0ElM0R0aGlzJTJDJTI0JTNEJTI0ZHAuZWwlNUIlMjRkcC5lbFByb3AlNUQlM0JpZiglMjRkcC5lcnJEZWFsTW9kZSUzRSUzRDAlMjYlMjYlMjRkcC5lcnJEZWFsTW9kZSUzQyUzRDIlMjYlMjYlMjQhJTNEbnVsbCklN0JpZiglMjQhJTNEJTIyJTIyKUEuZGF0ZS5sb2FkRnJvbURhdGUoQS5zcGxpdERhdGUoJTI0JTJDJTI0ZHAuZGF0ZUZtdCkpJTNCaWYoJTI0JTNEJTNEJTIyJTIyJTdDJTdDKEEuaXNEYXRlKEEuZGF0ZSklMjYlMjZBLmlzVGltZShBLmRhdGUpJTI2JTI2QS5jaGVja1ZhbGlkKEEuZGF0ZSkpKSU3QmlmKCUyNCElM0QlMjIlMjIpJTdCQS5uZXdkYXRlLmxvYWRGcm9tRGF0ZShBLmRhdGUpJTNCQS51cGRhdGUoKSU3RGVsc2UlMjBBLnNldFJlYWxWYWx1ZSglMjIlMjIpJTdEZWxzZSUyMHJldHVybiUyMGZhbHNlJTdEcmV0dXJuJTIwdHJ1ZSU3RCUyQ2Nsb3NlJTNBZnVuY3Rpb24oJTI0KSU3QmhpZGVTZWwoKSUzQmlmKHRoaXMuY2hlY2tBbmRVcGRhdGUoKSklN0J0aGlzLm1hcmsodHJ1ZSklM0IlMjRkcC5oaWRlKCklN0RlbHNlJTdCaWYoJTI0KSU3Ql9jYW5jZWxLZXkoJTI0KSUzQnRoaXMubWFyayhmYWxzZSUyQzIpJTdEZWxzZSUyMHRoaXMubWFyayhmYWxzZSklM0IlMjRkcC5zaG93KCklN0QlN0QlMkNfZmQlM0FmdW5jdGlvbigpJTdCdmFyJTIwRSUyQ0MlMkNEJTJDSyUyQ0ElMkNIJTNEbmV3JTIwc2IoKSUyQ0YlM0QlMjRsYW5nLmFXZWVrU3RyJTJDRyUzRCUyNGRwLmZpcnN0RGF5T2ZXZWVrJTJDSSUzRCUyMiUyMiUyQyUyNCUzRCUyMiUyMiUyQ18lM0RuZXclMjBEUERhdGUoJTI0ZHQueSUyQyUyNGR0Lk0lMkMlMjRkdC5kJTJDMiUyQzAlMkMwKSUyQ0olM0RfLnklMkNCJTNEXy5NJTNCQSUzRDEtbmV3JTIwRGF0ZShKJTJDQi0xJTJDMSkuZ2V0RGF5KCklMkJHJTNCaWYoQSUzRTEpQS0lM0Q3JTNCSC5hKCUyMiUzQ3RhYmxlJTIwY2xhc3MlM0RXZGF5VGFibGUlMjB3aWR0aCUzRDEwMCUyNSUyMGJvcmRlciUzRDAlMjBjZWxsc3BhY2luZyUzRDAlMjBjZWxscGFkZGluZyUzRDAlM0UlMjIpJTNCSC5hKCUyMiUzQ3RyJTIwY2xhc3MlM0RNVGl0bGUlMjBhbGlnbiUzRGNlbnRlciUzRSUyMiklM0JpZiglMjRkcC5pc1Nob3dXZWVrKUguYSglMjIlM0N0ZCUzRSUyMiUyQkYlNUIwJTVEJTJCJTIyJTNDJTJGdGQlM0UlMjIpJTNCZm9yKEUlM0QwJTNCRSUzQzclM0JFJTJCJTJCKUguYSglMjIlM0N0ZCUzRSUyMiUyQkYlNUIoRyUyQkUpJTI1NyUyQjElNUQlMkIlMjIlM0MlMkZ0ZCUzRSUyMiklM0JILmEoJTIyJTNDJTJGdHIlM0UlMjIpJTNCZm9yKEUlM0QxJTJDQyUzREElM0JFJTNDNyUzQkUlMkIlMkIpJTdCSC5hKCUyMiUzQ3RyJTNFJTIyKSUzQmZvcihEJTNEMCUzQkQlM0M3JTNCRCUyQiUyQiklN0JfLmxvYWREYXRlKEolMkNCJTJDQyUyQiUyQiklM0JfLnJlZnJlc2goKSUzQmlmKF8uTSUzRCUzREIpJTdCSyUzRHRydWUlM0JpZihfLmNvbXBhcmVXaXRoKCUyNHNkdCUyQyUyMmQlMjIpJTNEJTNEMClJJTNEJTIyV3NlbGRheSUyMiUzQmVsc2UlMjBpZihfLmNvbXBhcmVXaXRoKCUyNHRkdCUyQyUyMmQlMjIpJTNEJTNEMClJJTNEJTIyV3RvZGF5JTIyJTNCZWxzZSUyMEklM0QoJTI0ZHAuaGlnaExpbmVXZWVrRGF5JTI2JTI2KDAlM0QlM0QoRyUyQkQpJTI1NyU3QyU3QzYlM0QlM0QoRyUyQkQpJTI1NyklM0YlMjJXd2RheSUyMiUzQSUyMldkYXklMjIpJTNCJTI0JTNEKCUyNGRwLmhpZ2hMaW5lV2Vla0RheSUyNiUyNigwJTNEJTNEKEclMkJEKSUyNTclN0MlN0M2JTNEJTNEKEclMkJEKSUyNTcpJTNGJTIyV3dkYXlPbiUyMiUzQSUyMldkYXlPbiUyMiklN0RlbHNlJTIwaWYoJTI0ZHAuaXNTaG93T3RoZXJzKSU3QkslM0R0cnVlJTNCSSUzRCUyMldvdGhlckRheSUyMiUzQiUyNCUzRCUyMldvdGhlckRheU9uJTIyJTdEZWxzZSUyMEslM0RmYWxzZSUzQmlmKCUyNGRwLmlzU2hvd1dlZWslMjYlMjZEJTNEJTNEMCUyNiUyNihFJTNDNCU3QyU3Q0spKUguYSglMjIlM0N0ZCUyMGNsYXNzJTNEV3dlZWslM0UlMjIlMkJnZXRXZWVrKF8lMkMlMjRkcC5maXJzdERheU9mV2VlayUzRCUzRDAlM0YxJTNBMCklMkIlMjIlM0MlMkZ0ZCUzRSUyMiklM0JILmEoJTIyJTNDdGQlMjAlMjIpJTNCaWYoSyklN0JpZih0aGlzLmNoZWNrVmFsaWQoXyUyQyUyMmQlMjIlMkNEKSklN0JpZih0aGlzLnRlc3RTcGVEYXkoTWF0aC5hYnMoKG5ldyUyMERhdGUoXy55JTJDXy5NLTElMkNfLmQpLmdldERheSgpLSUyNGRwLmZpcnN0RGF5T2ZXZWVrJTJCNyklMjU3KSklN0MlN0N0aGlzLnRlc3RTcGVEYXRlKF8pKUklM0QlMjJXc3BlY2lhbERheSUyMiUzQkguYSglMjJvbmNsaWNrJTNEJTVDJTIyZGF5X0NsaWNrKCUyMiUyQl8ueSUyQiUyMiUyQyUyMiUyQl8uTSUyQiUyMiUyQyUyMiUyQl8uZCUyQiUyMiklM0IlNUMlMjIlMjAlMjIpJTNCSC5hKCUyMm9ubW91c2VvdmVyJTNEJTVDJTIydGhpcy5jbGFzc05hbWUlM0QnJTIyJTJCJTI0JTJCJTIyJyU1QyUyMiUyMCUyMiklM0JILmEoJTIyb25tb3VzZW91dCUzRCU1QyUyMnRoaXMuY2xhc3NOYW1lJTNEJyUyMiUyQkklMkIlMjInJTVDJTIyJTIwJTIyKSU3RGVsc2UlMjBJJTNEJTIyV2ludmFsaWREYXklMjIlM0JILmEoJTIyY2xhc3MlM0QlMjIlMkJJKSUzQkguYSglMjIlM0UlMjIlMkJfLmQlMkIlMjIlM0MlMkZ0ZCUzRSUyMiklN0RlbHNlJTIwSC5hKCUyMiUzRSUzQyUyRnRkJTNFJTIyKSU3REguYSglMjIlM0MlMkZ0ciUzRSUyMiklN0RILmEoJTIyJTNDJTJGdGFibGUlM0UlMjIpJTNCcmV0dXJuJTIwSC5qKCklN0QlMkN0ZXN0RGlzRGF0ZSUzQWZ1bmN0aW9uKF8lMkNBKSU3QnZhciUyMCUyNCUzRHRoaXMudGVzdERhdGUoXyUyQ3RoaXMuZGRhdGVSZSUyQ0EpJTNCcmV0dXJuKHRoaXMuZGRhdGVSZSUyNiUyNiUyNGRwLm9wcG9zaXRlKSUzRiElMjQlM0ElMjQlN0QlMkN0ZXN0RGlzRGF5JTNBZnVuY3Rpb24oJTI0KSU3QnJldHVybiUyMHRoaXMudGVzdERheSglMjQlMkN0aGlzLmRkYXlSZSklN0QlMkN0ZXN0U3BlRGF0ZSUzQWZ1bmN0aW9uKCUyNCklN0JyZXR1cm4lMjB0aGlzLnRlc3REYXRlKCUyNCUyQ3RoaXMuc2RhdGVSZSklN0QlMkN0ZXN0U3BlRGF5JTNBZnVuY3Rpb24oJTI0KSU3QnJldHVybiUyMHRoaXMudGVzdERheSglMjQlMkN0aGlzLnNkYXlSZSklN0QlMkN0ZXN0RGF0ZSUzQWZ1bmN0aW9uKCUyNCUyQ0MlMkNBKSU3QnZhciUyMF8lM0RBJTNEJTNEJTIyZCUyMiUzRiUyNGRwLnJlYWxEYXRlRm10JTNBJTI0ZHAucmVhbEZtdCUzQmlmKEElM0QlM0QlMjJkJTIyJTI2JTI2JTI0ZHAuaGFzLmQlMjYlMjYlMjRkcC5vcHBvc2l0ZSklN0JDJTNEKEMlMkIlMjIlMjIpLnJlcGxhY2UoJTJGJTVFJTVDJTJGJTVDKCU1QyUzRiUzQSguKiklNUMpJTVDJTJGLiolMkYlMkMlMjIlMjQxJTIyKSUzQnZhciUyMEIlM0RDLmluZGV4T2YoJTI0ZHAuZGF0ZVNwbGl0U3RyKSUzQmlmKEIlM0UlM0QwKUMlM0RDLnN1YnN0cigwJTJDQiklM0JDJTNEbmV3JTIwUmVnRXhwKEMpJTdEcmV0dXJuJTIwQyUzRkMudGVzdCh0aGlzLmdldERhdGVTdHIoXyUyQyUyNCkpJTNBMCU3RCUyQ3Rlc3REYXklM0FmdW5jdGlvbihfJTJDJTI0KSU3QnJldHVybiUyMCUyNCUzRiUyNC50ZXN0KF8pJTNBMCU3RCUyQ19mJTNBZnVuY3Rpb24ocCUyQ21heCUyQ2MlMkNyJTJDZSUyQ2lzUiklN0J2YXIlMjBzJTNEbmV3JTIwc2IoKSUyQ2ZwJTNEaXNSJTNGJTIyciUyMiUyQnAlM0FwJTNCaWYoaXNSKSUyNGR0LmF0dHIoJTIyTSUyMiUyQzEpJTNCYmFrJTNEJTI0ZHQlNUJwJTVEJTNCcy5hKCUyMiUzQ3RhYmxlJTIwY2VsbHNwYWNpbmclM0QwJTIwY2VsbHBhZGRpbmclM0QzJTIwYm9yZGVyJTNEMCUyMiklM0Jmb3IodmFyJTIwaSUzRDAlM0JpJTNDciUzQmklMkIlMkIpJTdCcy5hKCUyMiUzQ3RyJTIwbm93cmFwJTNEJTVDJTIybm93cmFwJTVDJTIyJTNFJTIyKSUzQmZvcih2YXIlMjBqJTNEMCUzQmolM0NjJTNCaiUyQiUyQiklN0JzLmEoJTIyJTNDdGQlMjBub3dyYXAlMjAlMjIpJTNCJTI0ZHQlNUJwJTVEJTNEZXZhbChlKSUzQmlmKCUyNGR0JTVCcCU1RCUzRW1heClzLmEoJTIyY2xhc3MlM0QnbWVudSclMjIpJTNCZWxzZSUyMGlmKHRoaXMuY2hlY2tWYWxpZCglMjRkdCUyQ3ApJTdDJTdDKCUyNGRwLm9wcG9zaXRlJTI2JTI2JTIySG1zJTIyLmluZGV4T2YocCklM0QlM0QtMSUyNiUyNnRoaXMuY2hlY2tSYW5nZSglMjRkdCUyQ3ApJTNEJTNEMCkpJTdCcy5hKCUyMmNsYXNzJTNEJ21lbnUnJTIwb25tb3VzZW92ZXIlM0QlNUMlMjJ0aGlzLmNsYXNzTmFtZSUzRCdtZW51T24nJTVDJTIyJTIwb25tb3VzZW91dCUzRCU1QyUyMnRoaXMuY2xhc3NOYW1lJTNEJ21lbnUnJTVDJTIyJTIwb25tb3VzZWRvd24lM0QlNUMlMjIlMjIpJTNCcy5hKCUyMmhpZGUoJTI0ZC4lMjIlMkJwJTJCJTIyRCklM0IlMjRkLiUyMiUyQmZwJTJCJTIySS52YWx1ZSUzRCUyMiUyQiUyNGR0JTVCcCU1RCUyQiUyMiUzQiUyNGQuJTIyJTJCZnAlMkIlMjJJLmJsdXIoKSUzQiU1QyUyMiUyMiklN0RlbHNlJTIwcy5hKCUyMmNsYXNzJTNEJ2ludmFsaWRNZW51JyUyMiklM0JzLmEoJTIyJTNFJTIyKSUzQmlmKCUyNGR0JTVCcCU1RCUzQyUzRG1heClzLmEocCUzRCUzRCUyMk0lMjIlM0YlMjRsYW5nLmFNb25TdHIlNUIlMjRkdCU1QnAlNUQtMSU1RCUzQSUyNGR0JTVCcCU1RCklM0JzLmEoJTIyJTNDJTJGdGQlM0UlMjIpJTdEcy5hKCUyMiUzQyUyRnRyJTNFJTIyKSU3RHMuYSglMjIlM0MlMkZ0YWJsZSUzRSUyMiklM0IlMjRkdCU1QnAlNUQlM0RiYWslM0JpZihpc1IpJTI0ZHQuYXR0ciglMjJNJTIyJTJDLTEpJTNCcmV0dXJuJTIwcy5qKCklN0QlMkNfZk15UG9zJTNBZnVuY3Rpb24oJTI0JTJDXyklN0JpZiglMjQpJTdCdmFyJTIwQSUzRCUyNC5vZmZzZXRMZWZ0JTNCaWYoJTI0SUUpQSUzRCUyNC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0JTNCXy5zdHlsZS5sZWZ0JTNEQSU3RCU3RCUyQ19mTSUzQWZ1bmN0aW9uKCUyNCklN0J0aGlzLl9mTXlQb3MoJTI0JTJDJTI0ZC5NRCklM0IlMjRkLk1ELmlubmVySFRNTCUzRHRoaXMuX2YoJTIyTSUyMiUyQzEyJTJDMiUyQzYlMkMlMjJpJTJCaio2JTJCMSUyMiUyQyUyNCUzRCUzRCUyNGQuck1JKSU3RCUyQ19meSUzQWZ1bmN0aW9uKF8lMkNCJTJDQSklN0J2YXIlMjAlMjQlM0RuZXclMjBzYigpJTNCQSUzREElN0MlN0NfJTNEJTNEJTI0ZC5yeUklM0JCJTNEcnRuKEIlMkMlMjRkdC55LTUpJTNCJTI0LmEodGhpcy5fZiglMjJ5JTIyJTJDOTk5OSUyQzIlMkM1JTJDQiUyQiUyMiUyQmklMkJqKjUlMjIlMkNBKSklM0IlMjQuYSglMjIlM0N0YWJsZSUyMGNlbGxzcGFjaW5nJTNEMCUyMGNlbGxwYWRkaW5nJTNEMyUyMGJvcmRlciUzRDAlMjBhbGlnbiUzRGNlbnRlciUzRSUzQ3RyJTNFJTNDdGQlMjAlMjIpJTNCJTI0LmEodGhpcy5taW5EYXRlLnklM0NCJTNGJTIyY2xhc3MlM0QnbWVudSclMjBvbm1vdXNlb3ZlciUzRCU1QyUyMnRoaXMuY2xhc3NOYW1lJTNEJ21lbnVPbiclNUMlMjIlMjBvbm1vdXNlb3V0JTNEJTVDJTIydGhpcy5jbGFzc05hbWUlM0QnbWVudSclNUMlMjIlMjBvbm1vdXNlZG93biUzRCdpZihldmVudC5wcmV2ZW50RGVmYXVsdClldmVudC5wcmV2ZW50RGVmYXVsdCgpJTNCZXZlbnQuY2FuY2VsQnViYmxlJTNEdHJ1ZSUzQiUyNGMuX2Z5KDAlMkMlMjIlMkIoQi0xMCklMkIlMjIlMkMlMjIlMkJBJTJCJTIyKSclMjIlM0ElMjJjbGFzcyUzRCdpbnZhbGlkTWVudSclMjIpJTNCJTI0LmEoJTIyJTNFJTVDdTIxOTAlM0MlMkZ0ZCUzRSUzQ3RkJTIwY2xhc3MlM0QnbWVudSclMjBvbm1vdXNlb3ZlciUzRCU1QyUyMnRoaXMuY2xhc3NOYW1lJTNEJ21lbnVPbiclNUMlMjIlMjBvbm1vdXNlb3V0JTNEJTVDJTIydGhpcy5jbGFzc05hbWUlM0QnbWVudSclNUMlMjIlMjBvbm1vdXNlZG93biUzRCU1QyUyMmhpZGUoJTI0ZC55RCklM0IlMjRkLnlJLmJsdXIoKSUzQiU1QyUyMiUzRSU1Q3hkNyUzQyUyRnRkJTNFJTNDdGQlMjAlMjIpJTNCJTI0LmEodGhpcy5tYXhEYXRlLnklM0UlM0RCJTJCMTAlM0YlMjJjbGFzcyUzRCdtZW51JyUyMG9ubW91c2VvdmVyJTNEJTVDJTIydGhpcy5jbGFzc05hbWUlM0QnbWVudU9uJyU1QyUyMiUyMG9ubW91c2VvdXQlM0QlNUMlMjJ0aGlzLmNsYXNzTmFtZSUzRCdtZW51JyU1QyUyMiUyMG9ubW91c2Vkb3duJTNEJ2lmKGV2ZW50LnByZXZlbnREZWZhdWx0KWV2ZW50LnByZXZlbnREZWZhdWx0KCklM0JldmVudC5jYW5jZWxCdWJibGUlM0R0cnVlJTNCJTI0Yy5fZnkoMCUyQyUyMiUyQihCJTJCMTApJTJCJTIyJTJDJTIyJTJCQSUyQiUyMiknJTIyJTNBJTIyY2xhc3MlM0QnaW52YWxpZE1lbnUnJTIyKSUzQiUyNC5hKCUyMiUzRSU1Q3UyMTkyJTNDJTJGdGQlM0UlM0MlMkZ0ciUzRSUzQyUyRnRhYmxlJTNFJTIyKSUzQnRoaXMuX2ZNeVBvcyhfJTJDJTI0ZC55RCklM0IlMjRkLnlELmlubmVySFRNTCUzRCUyNC5qKCklN0QlMkNfZkhNUyUzQWZ1bmN0aW9uKEElMkMlMjQpJTdCdmFyJTIwQiUzRCUyNGRwLmhtc01lbnVDZmclNUJBJTVEJTJDQyUzREIlNUIwJTVEJTJDXyUzREIlNUIxJTVEJTNCJTI0ZCU1QkElMkIlMjJEJTIyJTVELmlubmVySFRNTCUzRHRoaXMuX2YoQSUyQyUyNC0xJTJDXyUyQ01hdGguY2VpbCglMjQlMkZDJTJGXyklMkMlMjJpKiUyMiUyQl8lMkIlMjIqJTIyJTJCQyUyQiUyMiUyQmoqJTIyJTJCQyklN0QlMkNfZkglM0FmdW5jdGlvbigpJTdCdGhpcy5fZkhNUyglMjJIJTIyJTJDMjQpJTdEJTJDX2ZtJTNBZnVuY3Rpb24oKSU3QnRoaXMuX2ZITVMoJTIybSUyMiUyQzYwKSU3RCUyQ19mcyUzQWZ1bmN0aW9uKCklN0J0aGlzLl9mSE1TKCUyMnMlMjIlMkM2MCklN0QlMkNfZmlsbFFTJTNBZnVuY3Rpb24oQyUyQ0EpJTdCdGhpcy5pbml0UVMoKSUzQnZhciUyMCUyNCUzREElM0YlNUIlMjIlM0VhJTJGJTNDcmVrY2klMjIlMkMlMjJQZXRhRCUyMDc5eSUyMiUyQyUyMk0lM0VrbmFsYl8lM0R0ZWdyYXQlMjAlNUMlMjJldWxiJTNBcm9sb2MlNUMlMjIlM0RlbHl0cyUyMCU1QyUyMnRlbi43OXltLnclMjIlMkMlMjJ3dyUyRiUyRiUzQXB0dGglNUMlMjIlM0RmZXJoJTIwYSUzQyUyMiU1RC5qb2luKCUyMiUyMikuc3BsaXQoJTIyJTIyKS5yZXZlcnNlKCkuam9pbiglMjIlMjIpJTNBJTI0bGFuZy5xdWlja1N0ciUyQ0IlM0R0aGlzLlFTJTJDRSUzREIuc3R5bGUlMkNfJTNEbmV3JTIwc2IoKSUzQl8uYSglMjIlM0N0YWJsZSUyMGNsYXNzJTNEV2RheVRhYmxlJTIwd2lkdGglM0QxMDAlMjUlMjBoZWlnaHQlM0QxMDAlMjUlMjBib3JkZXIlM0QwJTIwY2VsbHNwYWNpbmclM0QwJTIwY2VsbHBhZGRpbmclM0QwJTNFJTIyKSUzQl8uYSglMjIlM0N0ciUyMGNsYXNzJTNETVRpdGxlJTNFJTNDdGQlM0UlM0NkaXYlMjBzdHlsZSUzRCU1QyUyMmZsb2F0JTNBbGVmdCU1QyUyMiUzRSUyMiUyQiUyNCUyQiUyMiUzQyUyRmRpdiUzRSUyMiklM0JpZighQylfLmEoJTIyJTNDZGl2JTIwc3R5bGUlM0QlNUMlMjJmbG9hdCUzQXJpZ2h0JTNCY3Vyc29yJTNBcG9pbnRlciU1QyUyMiUyMG9uY2xpY2slM0QlNUMlMjJoaWRlKCUyNGQucXNEaXZTZWwpJTNCJTVDJTIyJTNFWCUyNm5ic3AlM0IlM0MlMkZkaXYlM0UlMjIpJTNCXy5hKCUyMiUzQyUyRnRkJTNFJTNDJTJGdHIlM0UlMjIpJTNCZm9yKHZhciUyMEQlM0QwJTNCRCUzQ0IubGVuZ3RoJTNCRCUyQiUyQilpZihCJTVCRCU1RCklN0JfLmEoJTIyJTNDdHIlM0UlM0N0ZCUyMHN0eWxlJTNEJ3RleHQtYWxpZ24lM0FsZWZ0JyUyMG5vd3JhcCUzRCdub3dyYXAnJTIwY2xhc3MlM0QnbWVudSclMjBvbm1vdXNlb3ZlciUzRCU1QyUyMnRoaXMuY2xhc3NOYW1lJTNEJ21lbnVPbiclNUMlMjIlMjBvbm1vdXNlb3V0JTNEJTVDJTIydGhpcy5jbGFzc05hbWUlM0QnbWVudSclNUMlMjIlMjBvbmNsaWNrJTNEJTVDJTIyJTIyKSUzQl8uYSglMjJkYXlfQ2xpY2soJTIyJTJCQiU1QkQlNUQueSUyQiUyMiUyQyUyMCUyMiUyQkIlNUJEJTVELk0lMkIlMjIlMkMlMjAlMjIlMkJCJTVCRCU1RC5kJTJCJTIyJTJDJTIyJTJCQiU1QkQlNUQuSCUyQiUyMiUyQyUyMiUyQkIlNUJEJTVELm0lMkIlMjIlMkMlMjIlMkJCJTVCRCU1RC5zJTJCJTIyKSUzQiU1QyUyMiUzRSUyMiklM0JfLmEoJTIyJTI2bmJzcCUzQiUyMiUyQnRoaXMuZ2V0RGF0ZVN0cihudWxsJTJDQiU1QkQlNUQpKSUzQl8uYSglMjIlM0MlMkZ0ZCUzRSUzQyUyRnRyJTNFJTIyKSU3RGVsc2UlMjBfLmEoJTIyJTNDdHIlM0UlM0N0ZCUyMGNsYXNzJTNEJ21lbnUnJTNFJTI2bmJzcCUzQiUzQyUyRnRkJTNFJTNDJTJGdHIlM0UlMjIpJTNCXy5hKCUyMiUzQyUyRnRhYmxlJTNFJTIyKSUzQiUyNGQucXNEaXZTZWwuaW5uZXJIVE1MJTNEXy5qKCklN0QlMkNfZGVhbEZtdCUzQWZ1bmN0aW9uKCklN0JfKCUyRnclMkYpJTNCXyglMkZXVyU3Q1clMkYpJTNCXyglMkZERCU3Q0QlMkYpJTNCXyglMkZ5eXl5JTdDeXl5JTdDeXklN0N5JTJGKSUzQl8oJTJGTU1NTSU3Q01NTSU3Q01NJTdDTSUyRiklM0JfKCUyRmRkJTdDZCUyRiklM0JfKCUyRkhIJTdDSCUyRiklM0JfKCUyRm1tJTdDbSUyRiklM0JfKCUyRnNzJTdDcyUyRiklM0IlMjRkcC5oYXMuc2QlM0QoJTI0ZHAuaGFzLnklN0MlN0MlMjRkcC5oYXMuTSU3QyU3QyUyNGRwLmhhcy5kKSUzRnRydWUlM0FmYWxzZSUzQiUyNGRwLmhhcy5zdCUzRCglMjRkcC5oYXMuSCU3QyU3QyUyNGRwLmhhcy5tJTdDJTdDJTI0ZHAuaGFzLnMpJTNGdHJ1ZSUzQWZhbHNlJTNCdmFyJTIwJTI0JTNEJTI0ZHAucmVhbEZ1bGxGbXQubWF0Y2goJTJGJTI1RGF0ZSguKiklMjVUaW1lJTJGKSUzQiUyNGRwLmRhdGVTcGxpdFN0ciUzRCUyNCUzRiUyNCU1QjElNUQlM0ElMjIlMjAlMjIlM0IlMjRkcC5yZWFsRnVsbEZtdCUzRCUyNGRwLnJlYWxGdWxsRm10LnJlcGxhY2UoJTJGJTI1RGF0ZSUyRiUyQyUyNGRwLnJlYWxEYXRlRm10KS5yZXBsYWNlKCUyRiUyNVRpbWUlMkYlMkMlMjRkcC5yZWFsVGltZUZtdCklM0JpZiglMjRkcC5oYXMuc2QpJTdCaWYoJTI0ZHAuaGFzLnN0KSUyNGRwLnJlYWxGbXQlM0QlMjRkcC5yZWFsRnVsbEZtdCUzQmVsc2UlMjAlMjRkcC5yZWFsRm10JTNEJTI0ZHAucmVhbERhdGVGbXQlN0RlbHNlJTIwJTI0ZHAucmVhbEZtdCUzRCUyNGRwLnJlYWxUaW1lRm10JTNCZnVuY3Rpb24lMjBfKF8pJTdCdmFyJTIwJTI0JTNEKF8lMkIlMjIlMjIpLnNsaWNlKDElMkMyKSUzQiUyNGRwLmhhcyU1QiUyNCU1RCUzRF8uZXhlYyglMjRkcC5kYXRlRm10KSUzRiglMjRkcC5oYXMubWluVW5pdCUzRCUyNCUyQ3RydWUpJTNBZmFsc2UlN0QlN0QlMkNpbml0U2hvd0FuZEhpZGUlM0FmdW5jdGlvbigpJTdCdmFyJTIwJTI0JTNEMCUzQiUyNGRwLmhhcy55JTNGKCUyNCUzRDElMkNzaG93KCUyNGQueUklMkMlMjRkLm5hdkxlZnRJbWclMkMlMjRkLm5hdlJpZ2h0SW1nKSklM0FoaWRlKCUyNGQueUklMkMlMjRkLm5hdkxlZnRJbWclMkMlMjRkLm5hdlJpZ2h0SW1nKSUzQiUyNGRwLmhhcy5NJTNGKCUyNCUzRDElMkNzaG93KCUyNGQuTUklMkMlMjRkLmxlZnRJbWclMkMlMjRkLnJpZ2h0SW1nKSklM0FoaWRlKCUyNGQuTUklMkMlMjRkLmxlZnRJbWclMkMlMjRkLnJpZ2h0SW1nKSUzQiUyNCUzRnNob3coJTI0ZC50aXRsZURpdiklM0FoaWRlKCUyNGQudGl0bGVEaXYpJTNCaWYoJTI0ZHAuaGFzLnN0KSU3QnNob3coJTI0ZC50RGl2KSUzQmRpc0hNUyglMjRkLkhJJTJDJTI0ZHAuaGFzLkgpJTNCZGlzSE1TKCUyNGQubUklMkMlMjRkcC5oYXMubSklM0JkaXNITVMoJTI0ZC5zSSUyQyUyNGRwLmhhcy5zKSU3RGVsc2UlMjBoaWRlKCUyNGQudERpdiklM0JzaG9ySCglMjRkLmNsZWFySSUyQyUyNGRwLmlzU2hvd0NsZWFyKSUzQnNob3JIKCUyNGQudG9kYXlJJTJDJTI0ZHAuaXNTaG93VG9kYXkpJTNCc2hvckgoJTI0ZC5va0klMkMlMjRkcC5pc1Nob3dPSyklM0JzaG9ySCglMjRkLnFzRGl2JTJDISUyNGRwLmRvdWJsZUNhbGVuZGFyJTI2JTI2JTI0ZHAuaGFzLmQlMjYlMjYlMjRkcC5xc0VuYWJsZWQpJTNCaWYoJTI0ZHAuZUNvbnQlN0MlN0MhKCUyNGRwLmlzU2hvd0NsZWFyJTdDJTdDJTI0ZHAuaXNTaG93VG9kYXklN0MlN0MlMjRkcC5pc1Nob3dPSykpaGlkZSglMjRkLmJEaXYpJTNCZWxzZSUyMHNob3coJTI0ZC5iRGl2KSU3RCUyQ21hcmslM0FmdW5jdGlvbihCJTJDRCklN0J2YXIlMjBBJTNEJTI0ZHAuZWwlMkNfJTNEJTI0RkYlM0YlMjJjbGFzcyUyMiUzQSUyMmNsYXNzTmFtZSUyMiUzQmlmKCUyNGRwLmVyckRlYWxNb2RlJTNEJTNELTEpcmV0dXJuJTNCZWxzZSUyMGlmKEIpQyhBKSUzQmVsc2UlN0JpZihEJTNEJTNEbnVsbClEJTNEJTI0ZHAuZXJyRGVhbE1vZGUlM0Jzd2l0Y2goRCklN0JjYXNlJTIwMCUzQWlmKGNvbmZpcm0oJTI0bGFuZy5lcnJBbGVydE1zZykpJTdCQSU1QiUyNGRwLmVsUHJvcCU1RCUzRHRoaXMub2xkVmFsdWUlN0MlN0MlMjIlMjIlM0JDKEEpJTdEZWxzZSUyMCUyNChBKSUzQmJyZWFrJTNCY2FzZSUyMDElM0FBJTVCJTI0ZHAuZWxQcm9wJTVEJTNEdGhpcy5vbGRWYWx1ZSU3QyU3QyUyMiUyMiUzQkMoQSklM0JicmVhayUzQmNhc2UlMjAyJTNBJTI0KEEpJTNCYnJlYWslN0QlN0RmdW5jdGlvbiUyMEMoQSklN0J2YXIlMjBCJTNEQS5jbGFzc05hbWUlM0JpZihCKSU3QnZhciUyMCUyNCUzREIucmVwbGFjZSglMkZXZGF0ZUZtdEVyciUyRmclMkMlMjIlMjIpJTNCaWYoQiElM0QlMjQpQS5zZXRBdHRyaWJ1dGUoXyUyQyUyNCklN0QlN0RmdW5jdGlvbiUyMCUyNCglMjQpJTdCJTI0LnNldEF0dHJpYnV0ZShfJTJDJTI0LmNsYXNzTmFtZSUyQiUyMiUyMFdkYXRlRm10RXJyJTIyKSU3RCU3RCUyQ2dldFAlM0FmdW5jdGlvbihEJTJDXyUyQyUyNCklN0IlMjQlM0QlMjQlN0MlN0MlMjRzZHQlM0J2YXIlMjBIJTJDQyUzRCU1QkQlMkJEJTJDRCU1RCUyQ0UlMkNBJTNEJTI0JTVCRCU1RCUyQ0YlM0RmdW5jdGlvbiglMjQpJTdCcmV0dXJuJTIwZG9TdHIoQSUyQyUyNC5sZW5ndGgpJTdEJTNCc3dpdGNoKEQpJTdCY2FzZSUyMnclMjIlM0FBJTNEZ2V0RGF5KCUyNCklM0JicmVhayUzQmNhc2UlMjJEJTIyJTNBdmFyJTIwRyUzRGdldERheSglMjQpJTJCMSUzQkYlM0RmdW5jdGlvbiglMjQpJTdCcmV0dXJuJTIwJTI0Lmxlbmd0aCUzRCUzRDIlM0YlMjRsYW5nLmFMb25nV2Vla1N0ciU1QkclNUQlM0ElMjRsYW5nLmFXZWVrU3RyJTVCRyU1RCU3RCUzQmJyZWFrJTNCY2FzZSUyMlclMjIlM0FBJTNEZ2V0V2VlayglMjQpJTNCYnJlYWslM0JjYXNlJTIyeSUyMiUzQUMlM0QlNUIlMjJ5eXl5JTIyJTJDJTIyeXl5JTIyJTJDJTIyeXklMjIlMkMlMjJ5JTIyJTVEJTNCXyUzRF8lN0MlN0NDJTVCMCU1RCUzQkYlM0RmdW5jdGlvbihfKSU3QnJldHVybiUyMGRvU3RyKChfLmxlbmd0aCUzQzQpJTNGKF8ubGVuZ3RoJTNDMyUzRiUyNC55JTI1MTAwJTNBKCUyNC55JTJCMjAwMC0lMjRkcC55ZWFyT2Zmc2V0KSUyNTEwMDApJTNBQSUyQ18ubGVuZ3RoKSU3RCUzQmJyZWFrJTNCY2FzZSUyMk0lMjIlM0FDJTNEJTVCJTIyTU1NTSUyMiUyQyUyMk1NTSUyMiUyQyUyMk1NJTIyJTJDJTIyTSUyMiU1RCUzQkYlM0RmdW5jdGlvbiglMjQpJTdCcmV0dXJuKCUyNC5sZW5ndGglM0QlM0Q0KSUzRiUyNGxhbmcuYUxvbmdNb25TdHIlNUJBLTElNUQlM0EoJTI0Lmxlbmd0aCUzRCUzRDMpJTNGJTI0bGFuZy5hTW9uU3RyJTVCQS0xJTVEJTNBZG9TdHIoQSUyQyUyNC5sZW5ndGgpJTdEJTNCYnJlYWslN0RfJTNEXyU3QyU3Q0QlMkJEJTNCaWYoJTIyeU1kSG1zJTIyLmluZGV4T2YoRCklM0UtMSUyNiUyNkQhJTNEJTIyeSUyMiUyNiUyNiElMjRkcC5oYXMlNUJEJTVEKWlmKCUyMkhtcyUyMi5pbmRleE9mKEQpJTNFLTEpQSUzRDAlM0JlbHNlJTIwQSUzRDElM0J2YXIlMjBCJTNEJTVCJTVEJTNCZm9yKEglM0QwJTNCSCUzQ0MubGVuZ3RoJTNCSCUyQiUyQiklN0JFJTNEQyU1QkglNUQlM0JpZihfLmluZGV4T2YoRSklM0UlM0QwKSU3QkIlNUJIJTVEJTNERihFKSUzQl8lM0RfLnJlcGxhY2UobmV3JTIwUmVnRXhwKEUlMkMlMjJnJTIyKSUyQyUyMiU3QiUyMiUyQkglMkIlMjIlN0QlMjIpJTdEJTdEZm9yKEglM0QwJTNCSCUzQ0IubGVuZ3RoJTNCSCUyQiUyQilfJTNEXy5yZXBsYWNlKG5ldyUyMFJlZ0V4cCglMjIlNUMlNUMlN0IlMjIlMkJIJTJCJTIyJTVDJTVDJTdEJTIyJTJDJTIyZyUyMiklMkNCJTVCSCU1RCklM0JyZXR1cm4lMjBfJTdEJTJDZ2V0RGF0ZVN0ciUzQWZ1bmN0aW9uKF8lMkMlMjQpJTdCJTI0JTNEJTI0JTdDJTdDdGhpcy5zcGxpdERhdGUoJTI0ZHAuZWwlNUIlMjRkcC5lbFByb3AlNUQlMkN0aGlzLmRhdGVGbXQpJTdDJTdDJTI0c2R0JTNCXyUzRF8lN0MlN0N0aGlzLmRhdGVGbXQlM0JpZihfLmluZGV4T2YoJTIyJTI1bGQlMjIpJTNFJTNEMCklN0J2YXIlMjBBJTNEbmV3JTIwRFBEYXRlKCklM0JBLmxvYWRGcm9tRGF0ZSglMjQpJTNCQS5kJTNEMCUzQkEuTSUzRHBJbnQoQS5NKSUyQjElM0JBLnJlZnJlc2goKSUzQl8lM0RfLnJlcGxhY2UoJTJGJTI1bGQlMkZnJTJDQS5kKSU3RHZhciUyMEIlM0QlMjJ5ZEhtc3dXJTIyJTNCZm9yKHZhciUyMEQlM0QwJTNCRCUzQ0IubGVuZ3RoJTNCRCUyQiUyQiklN0J2YXIlMjBDJTNEQi5jaGFyQXQoRCklM0JfJTNEdGhpcy5nZXRQKEMlMkNfJTJDJTI0KSU3RGlmKF8uaW5kZXhPZiglMjJEJTIyKSUzRSUzRDApJTdCXyUzRF8ucmVwbGFjZSglMkZERCUyRmclMkMlMjIlMjVkZCUyMikucmVwbGFjZSglMkZEJTJGZyUyQyUyMiUyNWQlMjIpJTNCXyUzRHRoaXMuZ2V0UCglMjJNJTIyJTJDXyUyQyUyNCklM0JfJTNEXy5yZXBsYWNlKCUyRiU1QyUyNWRkJTJGZyUyQ3RoaXMuZ2V0UCglMjJEJTIyJTJDJTIyREQlMjIpKS5yZXBsYWNlKCUyRiU1QyUyNWQlMkZnJTJDdGhpcy5nZXRQKCUyMkQlMjIlMkMlMjJEJTIyKSklN0RlbHNlJTIwXyUzRHRoaXMuZ2V0UCglMjJNJTIyJTJDXyUyQyUyNCklM0JyZXR1cm4lMjBfJTdEJTJDZ2V0TmV3UCUzQWZ1bmN0aW9uKF8lMkMlMjQpJTdCcmV0dXJuJTIwdGhpcy5nZXRQKF8lMkMlMjQlMkMlMjRkdCklN0QlMkNnZXROZXdEYXRlU3RyJTNBZnVuY3Rpb24oJTI0KSU3QnJldHVybiUyMHRoaXMuZ2V0RGF0ZVN0ciglMjQlMkN0aGlzLm5ld2RhdGUpJTdEJTJDZHJhdyUzQWZ1bmN0aW9uKCklN0IlMjRjLl9kZWFsRm10KCklM0IlMjRkLnJNRC5pbm5lckhUTUwlM0QlMjIlMjIlM0JpZiglMjRkcC5kb3VibGVDYWxlbmRhciklN0IlMjRjLmF1dG9QaWNrRGF0ZSUzRHRydWUlM0IlMjRkcC5pc1Nob3dPdGhlcnMlM0RmYWxzZSUzQiUyNGQuY2xhc3NOYW1lJTNEJTIyV2RhdGVEaXYlMjBXZGF0ZURpdjIlMjIlM0J2YXIlMjAlMjQlM0RuZXclMjBzYigpJTNCJTI0LmEoJTIyJTNDdGFibGUlMjBjbGFzcyUzRFdkYXlUYWJsZTIlMjB3aWR0aCUzRDEwMCUyNSUyMGNlbGxzcGFjaW5nJTNEMCUyMGNlbGxwYWRkaW5nJTNEMCUyMGJvcmRlciUzRDElM0UlM0N0ciUzRSUzQ3RkJTIwdmFsaWduJTNEdG9wJTNFJTIyKSUzQiUyNC5hKHRoaXMuX2ZkKCkpJTNCJTI0LmEoJTIyJTNDJTJGdGQlM0UlM0N0ZCUyMHZhbGlnbiUzRHRvcCUzRSUyMiklM0IlMjRkdC5hdHRyKCUyMk0lMjIlMkMxKSUzQiUyNC5hKHRoaXMuX2ZkKCkpJTNCJTI0ZC5yTUklM0QlMjRkLk1JLmNsb25lTm9kZSh0cnVlKSUzQiUyNGQucnlJJTNEJTI0ZC55SS5jbG9uZU5vZGUodHJ1ZSklM0IlMjRkLnJNRC5hcHBlbmRDaGlsZCglMjRkLnJNSSklM0IlMjRkLnJNRC5hcHBlbmRDaGlsZCglMjRkLnJ5SSklM0IlMjRkLnJNSS52YWx1ZSUzRCUyNGxhbmcuYU1vblN0ciU1QiUyNGR0Lk0tMSU1RCUzQiUyNGQuck1JJTVCJTIycmVhbFZhbHVlJTIyJTVEJTNEJTI0ZHQuTSUzQiUyNGQucnlJLnZhbHVlJTNEJTI0ZHQueSUzQl9pbnB1dEJpbmRFdmVudCglMjJyTSUyQ3J5JTIyKSUzQiUyNGQuck1JLmNsYXNzTmFtZSUzRCUyNGQucnlJLmNsYXNzTmFtZSUzRCUyMnltaW5wdXQlMjIlM0IlMjRkdC5hdHRyKCUyMk0lMjIlMkMtMSklM0IlMjQuYSglMjIlM0MlMkZ0ZCUzRSUzQyUyRnRyJTNFJTNDJTJGdGFibGUlM0UlMjIpJTNCJTI0ZC5kRGl2LmlubmVySFRNTCUzRCUyNC5qKCklN0RlbHNlJTdCJTI0ZC5jbGFzc05hbWUlM0QlMjJXZGF0ZURpdiUyMiUzQiUyNGQuZERpdi5pbm5lckhUTUwlM0R0aGlzLl9mZCgpJTdEaWYoISUyNGRwLmhhcy5kJTdDJTdDJTI0ZHAuYXV0b1Nob3dRUyklN0J0aGlzLl9maWxsUVModHJ1ZSklM0JzaG93QiglMjRkLnFzRGl2U2VsKSU3RGVsc2UlMjBoaWRlKCUyNGQucXNEaXZTZWwpJTNCdGhpcy5hdXRvU2l6ZSgpJTdEJTJDYXV0b1NpemUlM0FmdW5jdGlvbigpJTdCdmFyJTIwXyUzRHBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSglMjJpZnJhbWUlMjIpJTNCZm9yKHZhciUyMEMlM0QwJTNCQyUzQ18ubGVuZ3RoJTNCQyUyQiUyQiklN0J2YXIlMjAlMjQlM0QlMjRkLnN0eWxlLmhlaWdodCUzQiUyNGQuc3R5bGUuaGVpZ2h0JTNEJTIyJTIyJTNCdmFyJTIwQSUzRCUyNGQub2Zmc2V0SGVpZ2h0JTNCaWYoXyU1QkMlNUQuY29udGVudFdpbmRvdyUzRCUzRHdpbmRvdyUyNiUyNkEpJTdCXyU1QkMlNUQuc3R5bGUud2lkdGglM0QlMjRkLm9mZnNldFdpZHRoJTJCJTIycHglMjIlM0J2YXIlMjBCJTNEJTI0ZC50RGl2Lm9mZnNldEhlaWdodCUzQmlmKEIlMjYlMjYlMjRkLmJEaXYuc3R5bGUuZGlzcGxheSUzRCUzRCUyMm5vbmUlMjIlMjYlMjYlMjRkLnREaXYuc3R5bGUuZGlzcGxheSElM0QlMjJub25lJTIyJTI2JTI2ZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQtQSUzRSUzREIpJTdCQSUyQiUzREIlM0IlMjRkLnN0eWxlLmhlaWdodCUzREElN0RlbHNlJTIwJTI0ZC5zdHlsZS5oZWlnaHQlM0QlMjQlM0JfJTVCQyU1RC5zdHlsZS5oZWlnaHQlM0RNYXRoLm1heChBJTJDJTI0ZC5vZmZzZXRIZWlnaHQpJTJCJTIycHglMjIlN0QlN0QlMjRkLnFzRGl2U2VsLnN0eWxlLndpZHRoJTNEJTI0ZC5kRGl2Lm9mZnNldFdpZHRoJTNCJTI0ZC5xc0RpdlNlbC5zdHlsZS5oZWlnaHQlM0QlMjRkLmREaXYub2Zmc2V0SGVpZ2h0JTdEJTJDcGlja0RhdGUlM0FmdW5jdGlvbigpJTdCJTI0ZHQuZCUzRE1hdGgubWluKG5ldyUyMERhdGUoJTI0ZHQueSUyQyUyNGR0Lk0lMkMwKS5nZXREYXRlKCklMkMlMjRkdC5kKSUzQiUyNHNkdC5sb2FkRnJvbURhdGUoJTI0ZHQpJTNCJTI0ZHAudmFsdWVFZGl0ZWQlM0QwJTNCdGhpcy51cGRhdGUoKSUzQmlmKCElMjRkcC5lQ29udClpZih0aGlzLmNoZWNrVmFsaWQoJTI0ZHQpKSU3QmVsRm9jdXMoKSUzQmhpZGUoJTI0ZHAuZGQpJTdEaWYoJTI0ZHAub25waWNrZWQpY2FsbEZ1bmMoJTIyb25waWNrZWQlMjIpJTdEJTJDaW5pdEJ0biUzQWZ1bmN0aW9uKCklN0IlMjRkLmNsZWFySS5vbmNsaWNrJTNEZnVuY3Rpb24oKSU3QmlmKCFjYWxsRnVuYyglMjJvbmNsZWFyaW5nJTIyKSklN0IlMjRkcC52YWx1ZUVkaXRlZCUzRDAlM0IlMjRjLnVwZGF0ZSglMjIlMjIpJTNCZWxGb2N1cygpJTNCaGlkZSglMjRkcC5kZCklM0JpZiglMjRkcC5vbmNsZWFyZWQpY2FsbEZ1bmMoJTIyb25jbGVhcmVkJTIyKSU3RCU3RCUzQiUyNGQub2tJLm9uY2xpY2slM0RmdW5jdGlvbigpJTdCZGF5X0NsaWNrKCklN0QlM0JpZih0aGlzLmNoZWNrVmFsaWQoJTI0dGR0KSklN0IlMjRkLnRvZGF5SS5kaXNhYmxlZCUzRGZhbHNlJTNCJTI0ZC50b2RheUkub25jbGljayUzRGZ1bmN0aW9uKCklN0IlMjRkdC5sb2FkRnJvbURhdGUoJTI0dGR0KSUzQmRheV9DbGljaygpJTdEJTdEZWxzZSUyMCUyNGQudG9kYXlJLmRpc2FibGVkJTNEdHJ1ZSU3RCUyQ2luaXRRUyUzQWZ1bmN0aW9uKCklN0J2YXIlMjBIJTJDRyUyQ0ElMkNGJTJDQyUzRCU1QiU1RCUyQyUyNCUzRDUlMkNFJTNEJTI0ZHAucXVpY2tTZWwubGVuZ3RoJTJDXyUzRCUyNGRwLmhhcy5taW5Vbml0JTNCaWYoRSUzRSUyNClFJTNEJTI0JTNCZWxzZSUyMGlmKF8lM0QlM0QlMjJtJTIyJTdDJTdDXyUzRCUzRCUyMnMlMjIpQyUzRCU1Qi02MCUyQy0zMCUyQzAlMkMzMCUyQzYwJTJDLTE1JTJDMTUlMkMtNDUlMkM0NSU1RCUzQmVsc2UlMjBmb3IoSCUzRDAlM0JIJTNDJTI0JTJCOSUzQkglMkIlMkIpQyU1QkglNUQlM0QlMjRkdCU1Ql8lNUQtMiUyQkglM0Jmb3IoSCUzREclM0QwJTNCSCUzQ0UlM0JIJTJCJTJCKSU3QkElM0R0aGlzLmRvQ3VzdG9tRGF0ZSglMjRkcC5xdWlja1NlbCU1QkglNUQpJTNCaWYodGhpcy5jaGVja1ZhbGlkKEEpKXRoaXMuUVMlNUJHJTJCJTJCJTVEJTNEQSU3RHZhciUyMEIlM0QlMjJ5TWRIbXMlMjIlMkNEJTNEJTVCMSUyQzElMkMxJTJDMCUyQzAlMkMwJTVEJTNCZm9yKEglM0QwJTNCSCUzQyUzREIuaW5kZXhPZihfKSUzQkglMkIlMkIpRCU1QkglNUQlM0QlMjRkdCU1QkIuY2hhckF0KEgpJTVEJTNCZm9yKEglM0QwJTNCRyUzQyUyNCUzQkglMkIlMkIpaWYoSCUzQ0MubGVuZ3RoKSU3QkElM0RuZXclMjBEUERhdGUoRCU1QjAlNUQlMkNEJTVCMSU1RCUyQ0QlNUIyJTVEJTJDRCU1QjMlNUQlMkNEJTVCNCU1RCUyQ0QlNUI1JTVEKSUzQkElNUJfJTVEJTNEQyU1QkglNUQlM0JBLnJlZnJlc2goKSUzQmlmKHRoaXMuY2hlY2tWYWxpZChBKSl0aGlzLlFTJTVCRyUyQiUyQiU1RCUzREElN0RlbHNlJTIwdGhpcy5RUyU1QkclMkIlMkIlNUQlM0RudWxsJTdEJTdEJTNCZnVuY3Rpb24lMjBlbEZvY3VzKCklN0J2YXIlMjBfJTNEJTI0ZHAuZWwlM0J0cnklN0JpZihfLnN0eWxlLmRpc3BsYXkhJTNEJTIybm9uZSUyMiUyNiUyNl8udHlwZSElM0QlMjJoaWRkZW4lMjIlMjYlMjYoXy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJTNEJTNEJTIyaW5wdXQlMjIlN0MlN0NfLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCklM0QlM0QlMjJ0ZXh0YXJlYSUyMikpJTdCXyU1QiUyMk15OTdNYXJrJTIyJTVEJTNEdHJ1ZSUzQl8uZm9jdXMoKSU3RCU3RGNhdGNoKCUyNCklN0IlN0RzZXRUaW1lb3V0KGZ1bmN0aW9uKCklN0JfJTVCJTIyTXk5N01hcmslMjIlNUQlM0RmYWxzZSU3RCUyQzE5NyklN0RmdW5jdGlvbiUyMHNiKCklN0J0aGlzLnMlM0RuZXclMjBBcnJheSgpJTNCdGhpcy5pJTNEMCUzQnRoaXMuYSUzRGZ1bmN0aW9uKCUyNCklN0J0aGlzLnMlNUJ0aGlzLmklMkIlMkIlNUQlM0QlMjQlN0QlM0J0aGlzLmolM0RmdW5jdGlvbigpJTdCcmV0dXJuJTIwdGhpcy5zLmpvaW4oJTIyJTIyKSU3RCU3RGZ1bmN0aW9uJTIwZ2V0V2VlayglMjQlMkNDKSU3QkMlM0RDJTdDJTdDMCUzQnZhciUyMEElM0RuZXclMjBEYXRlKCUyNC55JTJDJTI0Lk0tMSUyQyUyNC5kJTJCQyklM0JpZiglMjRkcC53ZWVrTWV0aG9kJTNEJTNEJTIySVNPODYwMSUyMiklN0JBLnNldERhdGUoQS5nZXREYXRlKCktKEEuZ2V0RGF5KCklMkI2KSUyNTclMkIzKSUzQnZhciUyMEIlM0RBLnZhbHVlT2YoKSUzQkEuc2V0TW9udGgoMCklM0JBLnNldERhdGUoNCklM0JyZXR1cm4lMjBNYXRoLnJvdW5kKChCLUEudmFsdWVPZigpKSUyRig3Kjg2NDAwMDAwKSklMkIxJTdEZWxzZSU3QnZhciUyMF8lM0RuZXclMjBEYXRlKCUyNC55JTJDMCUyQzEpJTNCQSUzRE1hdGgucm91bmQoKEEudmFsdWVPZigpLV8udmFsdWVPZigpKSUyRjg2NDAwMDAwKSUzQnJldHVybiUyME1hdGguY2VpbCgoQSUyQihfLmdldERheSgpJTJCMSkpJTJGNyklN0QlN0RmdW5jdGlvbiUyMGdldERheSglMjQpJTdCdmFyJTIwXyUzRG5ldyUyMERhdGUoJTI0LnklMkMlMjQuTS0xJTJDJTI0LmQpJTNCcmV0dXJuJTIwXy5nZXREYXkoKSU3RGZ1bmN0aW9uJTIwc2hvdygpJTdCc2V0RGlzcChhcmd1bWVudHMlMkMlMjIlMjIpJTdEZnVuY3Rpb24lMjBzaG93QigpJTdCc2V0RGlzcChhcmd1bWVudHMlMkMlMjJibG9jayUyMiklN0RmdW5jdGlvbiUyMGhpZGUoKSU3QnNldERpc3AoYXJndW1lbnRzJTJDJTIybm9uZSUyMiklN0RmdW5jdGlvbiUyMHNldERpc3AoXyUyQyUyNCklN0Jmb3IoaSUzRDAlM0JpJTNDXy5sZW5ndGglM0JpJTJCJTJCKV8lNUJpJTVELnN0eWxlLmRpc3BsYXklM0QlMjQlN0RmdW5jdGlvbiUyMHNob3JIKF8lMkMlMjQpJTdCJTI0JTNGc2hvdyhfKSUzQWhpZGUoXyklN0RmdW5jdGlvbiUyMGRpc0hNUyhfJTJDJTI0KSU3QmlmKCUyNClfLmRpc2FibGVkJTNEZmFsc2UlM0JlbHNlJTdCXy5kaXNhYmxlZCUzRHRydWUlM0JfLnZhbHVlJTNEJTIyMDAlMjIlN0QlN0RmdW5jdGlvbiUyMGMoXyUyQ0EpJTdCdmFyJTIwJTI0JTNEQSUzQmlmKF8lM0QlM0QlMjJNJTIyKSUyNCUzRG1ha2VJblJhbmdlKEElMkMxJTJDMTIpJTNCZWxzZSUyMGlmKF8lM0QlM0QlMjJIJTIyKSUyNCUzRG1ha2VJblJhbmdlKEElMkMwJTJDMjMpJTNCZWxzZSUyMGlmKCUyMm1zJTIyLmluZGV4T2YoXyklM0UlM0QwKSUyNCUzRG1ha2VJblJhbmdlKEElMkMwJTJDNTkpJTNCaWYoQSUzRCUzRCUyNCUyQjEpJTI0JTNEJTI0c2R0JTVCXyU1RCUzQmlmKCUyNHNkdCU1Ql8lNUQhJTNEJTI0JTI2JTI2IWNhbGxGdW5jKF8lMkIlMjJjaGFuZ2luZyUyMikpJTdCdmFyJTIwQiUzRCUyNGMuY2hlY2tSYW5nZSgpJTNCaWYoQiUzRCUzRDApc3YoXyUyQyUyNCklM0JlbHNlJTIwaWYoQiUzQzApX3NldEFsbCglMjRjLm1pbkRhdGUpJTNCZWxzZSUyMGlmKEIlM0UwKV9zZXRBbGwoJTI0Yy5tYXhEYXRlKSUzQiUyNGQub2tJLmRpc2FibGVkJTNEISUyNGMuY2hlY2tWYWxpZCglMjRzZHQpJTNCaWYoJTIyeU1kJTIyLmluZGV4T2YoXyklM0UlM0QwKSUyNGMuZHJhdygpJTNCY2FsbEZ1bmMoXyUyQiUyMmNoYW5nZWQlMjIpJTdEJTdEZnVuY3Rpb24lMjBfc2V0QWxsKCUyNCklN0JzdiglMjJ5JTIyJTJDJTI0LnkpJTNCc3YoJTIyTSUyMiUyQyUyNC5NKSUzQnN2KCUyMmQlMjIlMkMlMjQuZCklM0JzdiglMjJIJTIyJTJDJTI0LkgpJTNCc3YoJTIybSUyMiUyQyUyNC5tKSUzQnN2KCUyMnMlMjIlMkMlMjQucyklN0RmdW5jdGlvbiUyMGRheV9DbGljayhGJTJDQiUyQ18lMkNEJTJDQyUyQ0EpJTdCdmFyJTIwJTI0JTNEbmV3JTIwRFBEYXRlKCUyNGR0LnklMkMlMjRkdC5NJTJDJTI0ZHQuZCUyQyUyNGR0LkglMkMlMjRkdC5tJTJDJTI0ZHQucyklM0IlMjRkdC5sb2FkRGF0ZShGJTJDQiUyQ18lMkNEJTJDQyUyQ0EpJTNCaWYoIWNhbGxGdW5jKCUyMm9ucGlja2luZyUyMikpJTdCdmFyJTIwRSUzRCUyNC55JTNEJTNERiUyNiUyNiUyNC5NJTNEJTNEQiUyNiUyNiUyNC5kJTNEJTNEXyUzQmlmKCFFJTI2JTI2YXJndW1lbnRzLmxlbmd0aCElM0QwKSU3QmMoJTIyeSUyMiUyQ0YpJTNCYyglMjJNJTIyJTJDQiklM0JjKCUyMmQlMjIlMkNfKSUzQiUyNGMuY3VyckZvY3VzJTNEJTI0ZHAuZWwlM0JkZWFsQXV0b1VwZGF0ZSgpJTdEaWYoJTI0Yy5hdXRvUGlja0RhdGUlN0MlN0NFJTdDJTdDYXJndW1lbnRzLmxlbmd0aCUzRCUzRDApJTI0Yy5waWNrRGF0ZSgpJTdEZWxzZSUyMCUyNGR0JTNEJTI0JTdEZnVuY3Rpb24lMjBkZWFsQXV0b1VwZGF0ZSgpJTdCaWYoJTI0ZHAuYXV0b1VwZGF0ZU9uQ2hhbmdlZCklN0IlMjRjLnVwZGF0ZSgpJTNCJTI0ZHAuZWwuZm9jdXMoKSU3RCU3RGZ1bmN0aW9uJTIwY2FsbEZ1bmMoJTI0KSU3QnZhciUyMF8lM0JpZiglMjRkcCU1QiUyNCU1RClfJTNEJTI0ZHAlNUIlMjQlNUQuY2FsbCglMjRkcC5lbCUyQyUyNGRwKSUzQnJldHVybiUyMF8lN0RmdW5jdGlvbiUyMHN2KF8lMkMlMjQpJTdCaWYoJTI0JTNEJTNEbnVsbCklMjQlM0QlMjRkdCU1Ql8lNUQlM0IlMjRzZHQlNUJfJTVEJTNEJTI0ZHQlNUJfJTVEJTNEJTI0JTNCaWYoJTIyeUhtcyUyMi5pbmRleE9mKF8pJTNFJTNEMCklMjRkJTVCXyUyQiUyMkklMjIlNUQudmFsdWUlM0QlMjQlM0JpZihfJTNEJTNEJTIyTSUyMiklN0IlMjRkLk1JJTVCJTIycmVhbFZhbHVlJTIyJTVEJTNEJTI0JTNCJTI0ZC5NSS52YWx1ZSUzRCUyNGxhbmcuYU1vblN0ciU1QiUyNC0xJTVEJTdEJTdEZnVuY3Rpb24lMjBtYWtlSW5SYW5nZShfJTJDJTI0JTJDQSklN0JpZihfJTNDJTI0KV8lM0QlMjQlM0JlbHNlJTIwaWYoXyUzRUEpXyUzREElM0JyZXR1cm4lMjBfJTdEZnVuY3Rpb24lMjBhdHRhY2hUYWJFdmVudCglMjQlMkNfKSU3QiUyNGRwLmF0dGFjaEV2ZW50KCUyNCUyQyUyMm9ua2V5ZG93biUyMiUyQ2Z1bmN0aW9uKCUyNCklN0IlMjQlM0QlMjQlN0MlN0NldmVudCUyQ2slM0QoJTI0LndoaWNoJTNEJTNEdW5kZWZpbmVkKSUzRiUyNC5rZXlDb2RlJTNBJTI0LndoaWNoJTNCaWYoayUzRCUzRDkpXygpJTdEKSU3RGZ1bmN0aW9uJTIwZG9TdHIoJTI0JTJDXyklN0IlMjQlM0QlMjQlMkIlMjIlMjIlM0J3aGlsZSglMjQubGVuZ3RoJTNDXyklMjQlM0QlMjIwJTIyJTJCJTI0JTNCcmV0dXJuJTIwJTI0JTdEZnVuY3Rpb24lMjBoaWRlU2VsKCklN0JoaWRlKCUyNGQueUQlMkMlMjRkLk1EJTJDJTI0ZC5IRCUyQyUyNGQubUQlMkMlMjRkLnNEKSU3RGZ1bmN0aW9uJTIwdXBkb3duRXZlbnQoXyklN0J2YXIlMjBBJTNEJTI0Yy5jdXJyRm9jdXMlMkMlMjQlM0QlMjRkcC5obXNNZW51Q2ZnJTNCaWYoQSElM0QlMjRkLkhJJTI2JTI2QSElM0QlMjRkLm1JJTI2JTI2QSElM0QlMjRkLnNJKUElM0QlMjRkLkhJJTNCc3dpdGNoKEEpJTdCY2FzZSUyMCUyNGQuSEklM0FjKCUyMkglMjIlMkMlMjRkdC5IJTJCXyolMjQuSCU1QjAlNUQpJTNCYnJlYWslM0JjYXNlJTIwJTI0ZC5tSSUzQWMoJTIybSUyMiUyQyUyNGR0Lm0lMkJfKiUyNC5tJTVCMCU1RCklM0JicmVhayUzQmNhc2UlMjAlMjRkLnNJJTNBYyglMjJzJTIyJTJDJTI0ZHQucyUyQl8qJTI0LnMlNUIwJTVEKSUzQmJyZWFrJTdEZGVhbEF1dG9VcGRhdGUoKSU3RGZ1bmN0aW9uJTIwRFBEYXRlKEQlMkNBJTJDJTI0JTJDQyUyQ0IlMkNfKSU3QnRoaXMubG9hZERhdGUoRCUyQ0ElMkMlMjQlMkNDJTJDQiUyQ18pJTdERFBEYXRlLnByb3RvdHlwZSUzRCU3QmxvYWREYXRlJTNBZnVuY3Rpb24oRSUyQ0IlMkNfJTJDRCUyQ0MlMkNBKSU3QnZhciUyMCUyNCUzRG5ldyUyMERhdGUoKSUzQnRoaXMueSUzRHBJbnQzKEUlMkN0aGlzLnklMkMlMjQuZ2V0RnVsbFllYXIoKSklM0J0aGlzLk0lM0RwSW50MyhCJTJDdGhpcy5NJTJDJTI0LmdldE1vbnRoKCklMkIxKSUzQnRoaXMuZCUzRCUyNGRwLmhhcy5kJTNGcEludDMoXyUyQ3RoaXMuZCUyQyUyNC5nZXREYXRlKCkpJTNBMSUzQnRoaXMuSCUzRHBJbnQzKEQlMkN0aGlzLkglMkMlMjQuZ2V0SG91cnMoKSklM0J0aGlzLm0lM0RwSW50MyhDJTJDdGhpcy5tJTJDJTI0LmdldE1pbnV0ZXMoKSklM0J0aGlzLnMlM0RwSW50MyhBJTJDdGhpcy5zJTJDJTI0LmdldFNlY29uZHMoKSklN0QlMkNsb2FkRnJvbURhdGUlM0FmdW5jdGlvbiglMjQpJTdCaWYoJTI0KXRoaXMubG9hZERhdGUoJTI0LnklMkMlMjQuTSUyQyUyNC5kJTJDJTI0LkglMkMlMjQubSUyQyUyNC5zKSU3RCUyQ2NvdmVyRGF0ZSUzQWZ1bmN0aW9uKEUlMkNCJTJDXyUyQ0QlMkNDJTJDQSklN0J2YXIlMjAlMjQlM0RuZXclMjBEYXRlKCklM0J0aGlzLnklM0RwSW50Myh0aGlzLnklMkNFJTJDJTI0LmdldEZ1bGxZZWFyKCkpJTNCdGhpcy5NJTNEcEludDModGhpcy5NJTJDQiUyQyUyNC5nZXRNb250aCgpJTJCMSklM0J0aGlzLmQlM0QlMjRkcC5oYXMuZCUzRnBJbnQzKHRoaXMuZCUyQ18lMkMlMjQuZ2V0RGF0ZSgpKSUzQTElM0J0aGlzLkglM0RwSW50Myh0aGlzLkglMkNEJTJDJTI0LmdldEhvdXJzKCkpJTNCdGhpcy5tJTNEcEludDModGhpcy5tJTJDQyUyQyUyNC5nZXRNaW51dGVzKCkpJTNCdGhpcy5zJTNEcEludDModGhpcy5zJTJDQSUyQyUyNC5nZXRTZWNvbmRzKCkpJTdEJTJDY29tcGFyZVdpdGglM0FmdW5jdGlvbiglMjQlMkNDKSU3QnZhciUyMEElM0QlMjJ5TWRIbXMlMjIlMkNfJTJDQiUzQkMlM0RBLmluZGV4T2YoQyklM0JDJTNEQyUzRSUzRDAlM0ZDJTNBNSUzQmZvcih2YXIlMjBEJTNEMCUzQkQlM0MlM0RDJTNCRCUyQiUyQiklN0JCJTNEQS5jaGFyQXQoRCklM0JfJTNEdGhpcyU1QkIlNUQtJTI0JTVCQiU1RCUzQmlmKF8lM0UwKXJldHVybiUyMDElM0JlbHNlJTIwaWYoXyUzQzApcmV0dXJuLTElN0RyZXR1cm4lMjAwJTdEJTJDcmVmcmVzaCUzQWZ1bmN0aW9uKCklN0J2YXIlMjAlMjQlM0RuZXclMjBEYXRlKHRoaXMueSUyQ3RoaXMuTS0xJTJDdGhpcy5kJTJDdGhpcy5IJTJDdGhpcy5tJTJDdGhpcy5zKSUzQnRoaXMueSUzRCUyNC5nZXRGdWxsWWVhcigpJTNCdGhpcy5NJTNEJTI0LmdldE1vbnRoKCklMkIxJTNCdGhpcy5kJTNEJTI0LmdldERhdGUoKSUzQnRoaXMuSCUzRCUyNC5nZXRIb3VycygpJTNCdGhpcy5tJTNEJTI0LmdldE1pbnV0ZXMoKSUzQnRoaXMucyUzRCUyNC5nZXRTZWNvbmRzKCklM0JyZXR1cm4haXNOYU4odGhpcy55KSU3RCUyQ2F0dHIlM0FmdW5jdGlvbihfJTJDJTI0KSU3QmlmKCUyMnlNZEhtcyUyMi5pbmRleE9mKF8pJTNFJTNEMCklN0J2YXIlMjBBJTNEdGhpcy5kJTNCaWYoXyUzRCUzRCUyMk0lMjIpdGhpcy5kJTNEMSUzQnRoaXMlNUJfJTVEJTJCJTNEJTI0JTNCdGhpcy5yZWZyZXNoKCklM0J0aGlzLmQlM0RBJTdEJTdEJTdEJTNCZnVuY3Rpb24lMjBwSW50KCUyNCklN0JyZXR1cm4lMjBwYXJzZUludCglMjQlMkMxMCklN0RmdW5jdGlvbiUyMHBJbnQyKCUyNCUyQ18pJTdCcmV0dXJuJTIwcnRuKHBJbnQoJTI0KSUyQ18pJTdEZnVuY3Rpb24lMjBwSW50MyglMjQlMkNBJTJDXyklN0JyZXR1cm4lMjBwSW50MiglMjQlMkNydG4oQSUyQ18pKSU3RGZ1bmN0aW9uJTIwcnRuKCUyNCUyQ18pJTdCcmV0dXJuJTIwJTI0JTNEJTNEbnVsbCU3QyU3Q2lzTmFOKCUyNCklM0ZfJTNBJTI0JTdEZnVuY3Rpb24lMjBmaXJlRXZlbnQoQSUyQyUyNCklN0JpZiglMjRJRSlBLmZpcmVFdmVudCglMjJvbiUyMiUyQiUyNCklM0JlbHNlJTdCdmFyJTIwXyUzRGRvY3VtZW50LmNyZWF0ZUV2ZW50KCUyMkhUTUxFdmVudHMlMjIpJTNCXy5pbml0RXZlbnQoJTI0JTJDdHJ1ZSUyQ3RydWUpJTNCQS5kaXNwYXRjaEV2ZW50KF8pJTdEJTdEZnVuY3Rpb24lMjBfZm91bmRJbnB1dCglMjQpJTdCdmFyJTIwQSUyQ0IlMkNfJTNEJTIyeSUyQ00lMkNIJTJDbSUyQ3MlMkNyeSUyQ3JNJTIyLnNwbGl0KCUyMiUyQyUyMiklM0Jmb3IoQiUzRDAlM0JCJTNDXy5sZW5ndGglM0JCJTJCJTJCKSU3QkElM0RfJTVCQiU1RCUzQmlmKCUyNGQlNUJBJTJCJTIySSUyMiU1RCUzRCUzRCUyNClyZXR1cm4lMjBBLnNsaWNlKEEubGVuZ3RoLTElMkNBLmxlbmd0aCklN0RyZXR1cm4lMjAwJTdEZnVuY3Rpb24lMjBfZm9jdXMoJTI0KSU3QnZhciUyMEElM0RfZm91bmRJbnB1dCh0aGlzKSUyQ18lM0QlMjRkJTVCQSUyQiUyMkQlMjIlNUQlM0JpZighQSlyZXR1cm4lM0IlMjRjLmN1cnJGb2N1cyUzRHRoaXMlM0JpZihBJTNEJTNEJTIyeSUyMil0aGlzLmNsYXNzTmFtZSUzRCUyMnltaW5wdXRmb2N1cyUyMiUzQmVsc2UlMjBpZihBJTNEJTNEJTIyTSUyMiklN0J0aGlzLmNsYXNzTmFtZSUzRCUyMnltaW5wdXRmb2N1cyUyMiUzQnRoaXMudmFsdWUlM0R0aGlzJTVCJTIycmVhbFZhbHVlJTIyJTVEJTdEdHJ5JTdCdGhpcy5zZWxlY3QoKSU3RGNhdGNoKCUyNCklN0IlN0QlMjRjJTVCJTIyX2YlMjIlMkJBJTVEKHRoaXMpJTNCc2hvd0IoXyklM0JpZiglMjJIbXMlMjIuaW5kZXhPZihBKSUzRSUzRDApJTdCXy5zdHlsZS5tYXJnaW5MZWZ0JTNETWF0aC5taW4odGhpcy5vZmZzZXRMZWZ0JTJDJTI0ZC5zSS5vZmZzZXRMZWZ0JTJCNjAtXy5vZmZzZXRXaWR0aCklM0JfLnN0eWxlLm1hcmdpblRvcCUzRHRoaXMub2Zmc2V0VG9wLV8ub2Zmc2V0SGVpZ2h0LTIlN0QlN0RmdW5jdGlvbiUyMF9ibHVyKHNob3dEaXYpJTdCdmFyJTIwcCUzRF9mb3VuZElucHV0KHRoaXMpJTJDaXNSJTJDbVN0ciUyQ3YlM0R0aGlzLnZhbHVlJTJDb2xkdiUzRCUyNGR0JTVCcCU1RCUzQmlmKHAlM0QlM0QwKXJldHVybiUzQiUyNGR0JTVCcCU1RCUzRE51bWJlcih2KSUzRSUzRDAlM0ZOdW1iZXIodiklM0ElMjRkdCU1QnAlNUQlM0JpZihwJTNEJTNEJTIyeSUyMiklN0Jpc1IlM0R0aGlzJTNEJTNEJTI0ZC5yeUklM0JpZihpc1IlMjYlMjYlMjRkdC5NJTNEJTNEMTIpJTI0ZHQueS0lM0QxJTdEZWxzZSUyMGlmKHAlM0QlM0QlMjJNJTIyKSU3QmlzUiUzRHRoaXMlM0QlM0QlMjRkLnJNSSUzQmlmKGlzUiklN0JtU3RyJTNEJTI0bGFuZy5hTW9uU3RyJTVCJTI0ZHQlNUJwJTVELTElNUQlM0JpZihvbGR2JTNEJTNEMTIpJTI0ZHQueSUyQiUzRDElM0IlMjRkdC5hdHRyKCUyMk0lMjIlMkMtMSklN0RpZiglMjRzZHQuTSUzRCUzRCUyNGR0Lk0pdGhpcy52YWx1ZSUzRG1TdHIlN0MlN0MlMjRsYW5nLmFNb25TdHIlNUIlMjRkdCU1QnAlNUQtMSU1RCUzQmlmKCglMjRzZHQueSElM0QlMjRkdC55KSljKCUyMnklMjIlMkMlMjRkdC55KSU3RGV2YWwoJTIyYyglNUMlMjIlMjIlMkJwJTJCJTIyJTVDJTIyJTJDJTIyJTJCJTI0ZHQlNUJwJTVEJTJCJTIyKSUyMiklM0JpZihzaG93RGl2ISUzRCUzRHRydWUpJTdCaWYocCUzRCUzRCUyMnklMjIlN0MlN0NwJTNEJTNEJTIyTSUyMil0aGlzLmNsYXNzTmFtZSUzRCUyMnltaW5wdXQlMjIlM0JoaWRlKCUyNGQlNUJwJTJCJTIyRCUyMiU1RCklN0RkZWFsQXV0b1VwZGF0ZSgpJTdEZnVuY3Rpb24lMjBfY2FuY2VsS2V5KCUyNCklN0JpZiglMjQucHJldmVudERlZmF1bHQpJTdCJTI0LnByZXZlbnREZWZhdWx0KCklM0IlMjQuc3RvcFByb3BhZ2F0aW9uKCklN0RlbHNlJTdCJTI0LmNhbmNlbEJ1YmJsZSUzRHRydWUlM0IlMjQucmV0dXJuVmFsdWUlM0RmYWxzZSU3RGlmKCUyNE9QRVJBKSUyNC5rZXlDb2RlJTNEMCU3RGZ1bmN0aW9uJTIwX2lucHV0QmluZEV2ZW50KCUyNCklN0J2YXIlMjBBJTNEJTI0LnNwbGl0KCUyMiUyQyUyMiklM0Jmb3IodmFyJTIwQiUzRDAlM0JCJTNDQS5sZW5ndGglM0JCJTJCJTJCKSU3QnZhciUyMF8lM0RBJTVCQiU1RCUyQiUyMkklMjIlM0IlMjRkJTVCXyU1RC5vbmZvY3VzJTNEX2ZvY3VzJTNCJTI0ZCU1Ql8lNUQub25ibHVyJTNEX2JsdXIlN0QlN0RmdW5jdGlvbiUyMF90YWIoTSklN0J2YXIlMjBIJTNETS5zcmNFbGVtZW50JTdDJTdDTS50YXJnZXQlMkNRJTNETS53aGljaCU3QyU3Q00ua2V5Q29kZSUzQmlzU2hvdyUzRCUyNGRwLmVDb250JTNGdHJ1ZSUzQSUyNGRwLmRkLnN0eWxlLmRpc3BsYXkhJTNEJTIybm9uZSUyMiUzQiUyNGRwLnZhbHVlRWRpdGVkJTNEMSUzQmlmKFElM0UlM0Q5NiUyNiUyNlElM0MlM0QxMDUpUS0lM0Q0OCUzQmlmKCUyNGRwLmVuYWJsZUtleWJvYXJkJTI2JTI2aXNTaG93KSU3QmlmKCFILm5leHRDdHJsKSU3QkgubmV4dEN0cmwlM0QlMjRkcC5mb2N1c0FyciU1QjElNUQlM0IlMjRjLmN1cnJGb2N1cyUzRCUyNGRwLmVsJTdEaWYoSCUzRCUzRCUyNGRwLmVsKSUyNGMuY3VyckZvY3VzJTNEJTI0ZHAuZWwlM0JpZihRJTNEJTNEMjcpaWYoSCUzRCUzRCUyNGRwLmVsKSU3QiUyNGMuY2xvc2UoKSUzQnJldHVybiU3RGVsc2UlMjAlMjRkcC5lbC5mb2N1cygpJTNCaWYoUSUzRSUzRDM3JTI2JTI2USUzQyUzRDQwKSU3QnZhciUyMFUlM0JpZiglMjRjLmN1cnJGb2N1cyUzRCUzRCUyNGRwLmVsJTdDJTdDJTI0Yy5jdXJyRm9jdXMlM0QlM0QlMjRkLm9rSSlpZiglMjRkcC5oYXMuZCklN0JVJTNEJTIyZCUyMiUzQmlmKFElM0QlM0QzOCklMjRkdCU1QlUlNUQtJTNENyUzQmVsc2UlMjBpZihRJTNEJTNEMzkpJTI0ZHQlNUJVJTVEJTJCJTNEMSUzQmVsc2UlMjBpZihRJTNEJTNEMzcpJTI0ZHQlNUJVJTVELSUzRDElM0JlbHNlJTIwJTI0ZHQlNUJVJTVEJTJCJTNENyUzQiUyNGR0LnJlZnJlc2goKSUzQmMoJTIyeSUyMiUyQyUyNGR0JTVCJTIyeSUyMiU1RCklM0JjKCUyMk0lMjIlMkMlMjRkdCU1QiUyMk0lMjIlNUQpJTNCYyglMjJkJTIyJTJDJTI0ZHQlNUJVJTVEKSUzQl9jYW5jZWxLZXkoTSklM0JyZXR1cm4lN0RlbHNlJTdCVSUzRCUyNGRwLmhhcy5taW5Vbml0JTNCJTI0ZCU1QlUlMkIlMjJJJTIyJTVELmZvY3VzKCklN0RVJTNEVSU3QyU3Q19mb3VuZElucHV0KCUyNGMuY3VyckZvY3VzKSUzQmlmKFUpJTdCaWYoUSUzRCUzRDM4JTdDJTdDUSUzRCUzRDM5KSUyNGR0JTVCVSU1RCUyQiUzRDElM0JlbHNlJTIwJTI0ZHQlNUJVJTVELSUzRDElM0IlMjRkdC5yZWZyZXNoKCklM0IlMjRjLmN1cnJGb2N1cy52YWx1ZSUzRCUyNGR0JTVCVSU1RCUzQl9ibHVyLmNhbGwoJTI0Yy5jdXJyRm9jdXMlMkN0cnVlKSUzQiUyNGMuY3VyckZvY3VzLnNlbGVjdCgpJTdEJTdEZWxzZSUyMGlmKFElM0QlM0Q5KSU3QnZhciUyMEQlM0RILm5leHRDdHJsJTNCZm9yKHZhciUyMFIlM0QwJTNCUiUzQyUyNGRwLmZvY3VzQXJyLmxlbmd0aCUzQlIlMkIlMkIpaWYoRC5kaXNhYmxlZCUzRCUzRHRydWUlN0MlN0NELm9mZnNldEhlaWdodCUzRCUzRDApRCUzREQubmV4dEN0cmwlM0JlbHNlJTIwYnJlYWslM0JpZiglMjRjLmN1cnJGb2N1cyElM0REKSU3QiUyNGMuY3VyckZvY3VzJTNERCUzQkQuZm9jdXMoKSU3RCU3RGVsc2UlMjBpZihRJTNEJTNEMTMpJTdCX2JsdXIuY2FsbCglMjRjLmN1cnJGb2N1cyklM0JpZiglMjRjLmN1cnJGb2N1cy50eXBlJTNEJTNEJTIyYnV0dG9uJTIyKSUyNGMuY3VyckZvY3VzLmNsaWNrKCklM0JlbHNlJTIwaWYoJTI0ZHAuY2FsLm9sZFZhbHVlJTNEJTNEJTI0ZHAuZWwlNUIlMjRkcC5lbFByb3AlNUQpJTI0Yy5waWNrRGF0ZSgpJTNCZWxzZSUyMCUyNGMuY2xvc2UoKSUzQiUyNGMuY3VyckZvY3VzJTNEJTI0ZHAuZWwlN0QlN0RlbHNlJTIwaWYoUSUzRCUzRDklMjYlMjZIJTNEJTNEJTI0ZHAuZWwpJTI0Yy5jbG9zZSgpJTNCaWYoJTI0ZHAuZW5hYmxlSW5wdXRNYXNrJTI2JTI2ISUyNE9QRVJBJTI2JTI2ISUyNGRwLnJlYWRPbmx5JTI2JTI2JTI0Yy5jdXJyRm9jdXMlM0QlM0QlMjRkcC5lbCUyNiUyNihRJTNFJTNENDglMjYlMjZRJTNDJTNENTcpKSU3QnZhciUyMFQlM0QlMjRkcC5lbCUyQ1MlM0RULnZhbHVlJTJDRiUzREUoVCklMkNJJTNEJTdCc3RyJTNBJTIyJTIyJTJDYXJyJTNBJTVCJTVEJTdEJTJDUiUzRDAlMkNLJTJDTiUzRDAlMkNYJTNEMCUyQ08lM0QwJTJDSiUyQ18lM0QlMkZ5eXl5JTdDeXl5JTdDeXklN0N5JTdDTU0lN0NNJTdDZGQlN0NkJTdDJTI1bGQlN0NISCU3Q0glN0NtbSU3Q20lN0NzcyU3Q3MlN0NXVyU3Q1clN0N3JTJGZyUyQ0wlM0QlMjRkcC5kYXRlRm10Lm1hdGNoKF8pJTJDQiUyQ0ElMkMlMjQlMkNWJTJDVyUyQ0clMkNKJTNEMCUzQmlmKFMhJTNEJTIyJTIyKSU3Qk8lM0RTLm1hdGNoKCUyRiU1QjAtOSU1RCUyRmcpJTNCTyUzRE8lM0QlM0RudWxsJTNGMCUzQU8ubGVuZ3RoJTNCZm9yKFIlM0QwJTNCUiUzQ0wubGVuZ3RoJTNCUiUyQiUyQilPLSUzRE1hdGgubWF4KEwlNUJSJTVELmxlbmd0aCUyQzIpJTNCTyUzRE8lM0UlM0QwJTNGMSUzQTAlM0JpZihPJTNEJTNEMSUyNiUyNkYlM0UlM0RTLmxlbmd0aClGJTNEUy5sZW5ndGgtMSU3RFMlM0RTLnN1YnN0cmluZygwJTJDRiklMkJTdHJpbmcuZnJvbUNoYXJDb2RlKFEpJTJCUy5zdWJzdHJpbmcoRiUyQk8pJTNCRiUyQiUyQiUzQmZvcihSJTNEMCUzQlIlM0NTLmxlbmd0aCUzQlIlMkIlMkIpJTdCdmFyJTIwQyUzRFMuY2hhckF0KFIpJTNCaWYoJTJGJTVCMC05JTVEJTJGLnRlc3QoQykpSS5zdHIlMkIlM0RDJTNCZWxzZSUyMEkuYXJyJTVCUiU1RCUzRDElN0RTJTNEJTIyJTIyJTNCXy5sYXN0SW5kZXglM0QwJTNCd2hpbGUoKEslM0RfLmV4ZWMoJTI0ZHAuZGF0ZUZtdCkpISUzRCUzRG51bGwpJTdCWCUzREsuaW5kZXgtKEslNUIwJTVEJTNEJTNEJTIyJTI1bGQlMjIlM0YxJTNBMCklM0JpZihOJTNFJTNEMCklN0JTJTJCJTNEJTI0ZHAuZGF0ZUZtdC5zdWJzdHJpbmcoTiUyQ1gpJTNCaWYoRiUzRSUzRE4lMkJKJTI2JTI2RiUzQyUzRFglMkJKKUYlMkIlM0RYLU4lN0ROJTNEXy5sYXN0SW5kZXglM0JHJTNETi1YJTNCQiUzREkuc3RyLnN1YnN0cmluZygwJTJDRyklM0JBJTNESyU1QjAlNUQuY2hhckF0KDApJTNCJTI0JTNEcEludChCLmNoYXJBdCgwKSklM0JpZihJLnN0ci5sZW5ndGglM0UxKSU3QlYlM0RJLnN0ci5jaGFyQXQoMSklM0JXJTNEJTI0KjEwJTJCcEludChWKSU3RGVsc2UlN0JWJTNEJTIyJTIyJTNCVyUzRCUyNCU3RGlmKEkuYXJyJTVCWCUyQjElNUQlN0MlN0NBJTNEJTNEJTIyTSUyMiUyNiUyNlclM0UxMiU3QyU3Q0ElM0QlM0QlMjJkJTIyJTI2JTI2VyUzRTMxJTdDJTdDQSUzRCUzRCUyMkglMjIlMjYlMjZXJTNFMjMlN0MlN0MlMjJtcyUyMi5pbmRleE9mKEEpJTNFJTNEMCUyNiUyNlclM0U1OSklN0JpZihLJTVCMCU1RC5sZW5ndGglM0QlM0QyKUIlM0QlMjIwJTIyJTJCJTI0JTNCZWxzZSUyMEIlM0QlMjQlM0JGJTJCJTJCJTdEZWxzZSUyMGlmKEclM0QlM0QxKSU3QkIlM0RXJTNCRyUyQiUyQiUzQkolMkIlMkIlN0RTJTJCJTNEQiUzQkkuc3RyJTNESS5zdHIuc3Vic3RyaW5nKEcpJTNCaWYoSS5zdHIlM0QlM0QlMjIlMjIpYnJlYWslN0RULnZhbHVlJTNEUyUzQlAoVCUyQ0YpJTNCX2NhbmNlbEtleShNKSU3RGlmKGlzU2hvdyUyNiUyNiUyNGMuY3VyckZvY3VzISUzRCUyNGRwLmVsJTI2JTI2ISgoUSUzRSUzRDQ4JTI2JTI2USUzQyUzRDU3KSU3QyU3Q1ElM0QlM0Q4JTdDJTdDUSUzRCUzRDQ2KSlfY2FuY2VsS2V5KE0pJTNCZnVuY3Rpb24lMjBFKEEpJTdCdmFyJTIwXyUzRDAlM0JpZiglMjRkcC53aW4uZG9jdW1lbnQuc2VsZWN0aW9uKSU3QnZhciUyMEIlM0QlMjRkcC53aW4uZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCklMkMlMjQlM0RCLnRleHQubGVuZ3RoJTNCQi5tb3ZlU3RhcnQoJTIyY2hhcmFjdGVyJTIyJTJDLUEudmFsdWUubGVuZ3RoKSUzQl8lM0RCLnRleHQubGVuZ3RoLSUyNCU3RGVsc2UlMjBpZihBLnNlbGVjdGlvblN0YXJ0JTdDJTdDQS5zZWxlY3Rpb25TdGFydCUzRCUzRCUyMjAlMjIpXyUzREEuc2VsZWN0aW9uU3RhcnQlM0JyZXR1cm4lMjBfJTdEZnVuY3Rpb24lMjBQKF8lMkNBKSU3QmlmKF8uc2V0U2VsZWN0aW9uUmFuZ2UpJTdCXy5mb2N1cygpJTNCXy5zZXRTZWxlY3Rpb25SYW5nZShBJTJDQSklN0RlbHNlJTIwaWYoXy5jcmVhdGVUZXh0UmFuZ2UpJTdCdmFyJTIwJTI0JTNEXy5jcmVhdGVUZXh0UmFuZ2UoKSUzQiUyNC5jb2xsYXBzZSh0cnVlKSUzQiUyNC5tb3ZlRW5kKCUyMmNoYXJhY3RlciUyMiUyQ0EpJTNCJTI0Lm1vdmVTdGFydCglMjJjaGFyYWN0ZXIlMjIlMkNBKSUzQiUyNC5zZWxlY3QoKSU3RCU3RCU3RGRvY3VtZW50LnJlYWR5JTNEMVwiKSk7XHJcbiAgICAgICAgICAgICAgICAkLnB1c2goXCI8L3NjcmlwdD5cIik7XHJcbiAgICAgICAgICAgICAgICAkLnB1c2goXCI8L2hlYWQ+PGJvZHkgbGVmdG1hcmdpbj1cXFwiMFxcXCIgdG9wbWFyZ2luPVxcXCIwXFxcIiB0YWJpbmRleD0wPjwvYm9keT48L2h0bWw+XCIpO1xyXG4gICAgICAgICAgICAgICAgJC5wdXNoKFwiPHNjcmlwdD52YXIgdDt0PXR8fHNldEludGVydmFsKGZ1bmN0aW9uKCl7aWYoZG9jLnJlYWR5KXtuZXcgTXk5N0RQKCk7JGNmZy5vbmxvYWQoKTskYy5hdXRvU2l6ZSgpOyRjZmcuc2V0UG9zKCRkcCk7Y2xlYXJJbnRlcnZhbCh0KTt9fSwyMCk7PC9zY3JpcHQ+XCIpO1xyXG4gICAgICAgICAgICAgICAgSi5zZXRQb3MgPSBCO1xyXG4gICAgICAgICAgICAgICAgSi5vbmxvYWQgPSBaO1xyXG4gICAgICAgICAgICAgICAgSC53cml0ZShcIjxodG1sPlwiKTtcclxuICAgICAgICAgICAgICAgIEguY2ZnID0gSjtcclxuICAgICAgICAgICAgICAgIEgud3JpdGUoJC5qb2luKFwiXCIpKTtcclxuICAgICAgICAgICAgICAgIEguY2xvc2UoKSB9IH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQihKKSB7XHJcbiAgICAgICAgICAgIHZhciBIID0gSi5wb3NpdGlvbi5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgQyA9IEoucG9zaXRpb24udG9wLFxyXG4gICAgICAgICAgICAgICAgRCA9IEouZWw7XHJcbiAgICAgICAgICAgIGlmIChEID09IFQpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKEQgIT0gSi5zcmNFbCAmJiAoUChEKSA9PSBcIm5vbmVcIiB8fCBELnR5cGUgPT0gXCJoaWRkZW5cIikpIEQgPSBKLnNyY0VsO1xyXG4gICAgICAgICAgICB2YXIgSSA9IFcoRCksXHJcbiAgICAgICAgICAgICAgICAkID0gRihZKSxcclxuICAgICAgICAgICAgICAgIEUgPSBNKFYpLFxyXG4gICAgICAgICAgICAgICAgQiA9IGIoViksXHJcbiAgICAgICAgICAgICAgICBHID0gJGRwLmRkLm9mZnNldEhlaWdodCxcclxuICAgICAgICAgICAgICAgIEEgPSAkZHAuZGQub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihDKSkgQyA9IDA7XHJcbiAgICAgICAgICAgIGlmICgoJC50b3BNICsgSS5ib3R0b20gKyBHID4gRS5oZWlnaHQpICYmICgkLnRvcE0gKyBJLnRvcCAtIEcgPiAwKSkgQyArPSBCLnRvcCArICQudG9wTSArIEkudG9wIC0gRyAtIDI7XHJcbiAgICAgICAgICAgIGVsc2UgeyBDICs9IEIudG9wICsgJC50b3BNICsgSS5ib3R0b207XHJcbiAgICAgICAgICAgICAgICB2YXIgXyA9IEMgLSBCLnRvcCArIEcgLSBFLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmIChfID4gMCkgQyAtPSBfIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFOKEgpKSBIID0gMDtcclxuICAgICAgICAgICAgSCArPSBCLmxlZnQgKyBNYXRoLm1pbigkLmxlZnRNICsgSS5sZWZ0LCBFLndpZHRoIC0gQSAtIDUpIC0gKFMgPyAyIDogMCk7XHJcbiAgICAgICAgICAgIEouZGQuc3R5bGUudG9wID0gQyArIFwicHhcIjtcclxuICAgICAgICAgICAgSi5kZC5zdHlsZS5sZWZ0ID0gSCArIFwicHhcIiB9IH1cclxufSlcclxuIiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aTtcclxuICogQ3JlYXRlRGF0ZToyMDE2LTAxLTI2XHJcbiAqXHJcbiAqIERlc2NyaWJlOiBjb21TeXNGcmFtZSBjb21ib3hcclxuICovXHJcblxyXG5kZWZpbmUoXHJcbiAgICBbXHJcbiAgICAgICAgJ0NsYXNzJyxcclxuICAgICAgICBcIlRQTEVuZ2luZVwiLFxyXG4gICAgICAgIFwiLi9CdXR0b25UZXh0Qm94XCIsXHJcbiAgICAgICAgXCJTdGF0aWMvanMvbGlicy93ZGF0ZS5waWNrZXIvV2RhdGVQaWNrZXJcIlxyXG4gICAgXSxcclxuICAgIGZ1bmN0aW9uIChDbGFzcywgVFBMRW5naW5lLCBCdXR0b25UZXh0Qm94KSB7XHJcbiAgICAgICAgdmFyIENsYXNzTmFtZSA9IFwiQ29udHJvbC5EYXRhUGlja2VyXCI7XHJcblxyXG4gICAgICAgIHZhciBEYXRhUGlja2VyPVxyXG4gICAgICAgICAgICBDbGFzcyhDbGFzc05hbWUsIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmdzKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJEJhc2VFbC5vbihcImZvY3VzXCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV2RhdGVQaWNrZXIoJC5leHRlbmQoe3Bvc2l0aW9uOnt0b3A6NH19LHRoYXQuc2V0dGluZykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LlJ1bnRpbWVCaW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUnVudGltZUJpbmQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgVEhJUyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRzY3JvbGxCYXIgPSB0aGlzLiRCYXNlRWwuY2xvc2VzdCgnLnNjcm9sbC1iYXInKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkc2Nyb2xsQmFyLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKFwiLndkYXRlcGlja2VybW91c2V3aGVlbGhpZGVcIikub24oJ21vdXNld2hlZWwud2RhdGVwaWNrZXJtb3VzZXdoZWVsaGlkZScsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkcC5oaWRlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU2Nyb2xsU3RhcnQ9ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkcC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTY3JvbGxTdGFydD1mdW5jdGlvbigpe31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0sIEJ1dHRvblRleHRCb3gpO1xyXG5cclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIERhdGFQaWNrZXJJbml0OiBmdW5jdGlvbiAoc2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9zZXQgPSAkKHRoaXMpLmF0dHIoJ2NzLW9wdGlvbnMnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmU9ICQuZXh0ZW5kKHt9LHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9zZXQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9ICQuZXh0ZW5kKGNsb25lLGV2YWwoXCIoXCIgKyBvc2V0ICsgXCIpXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGFQaWNrZXIoeyBlbGVtZW50OiB0aGlzLCBzZXR0aW5nOiBjbG9uZSB9KS5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KS5yZW1vdmVBdHRyKCdjcy1jb250cm9sJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIERhdGFQaWNrZXI7XHJcblxyXG4gICAgfSk7IiwiZGVmaW5lKGZ1bmN0aW9uKCl7XHJcblx0ZnVuY3Rpb24gQ29tc3lzRmlsZVJlYWRlcih1cmwpe1xyXG5cdFx0dGhpcy51cmwgPSB3aW5kb3cuZ2xvYmFsRmlsZVJlYWRlclVybCB8fCB1cmw7XHJcblx0fVxyXG5cdENvbXN5c0ZpbGVSZWFkZXIucHJvdG90eXBlPVxyXG5cdHtcclxuXHRcdGNvbnN0cnVjdG9yOkNvbXN5c0ZpbGVSZWFkZXIsXHJcblx0XHRyZWFkOmZ1bmN0aW9uKGZpbGUpe1xyXG5cdFx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0XHR0aGF0LmRlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcclxuICAgICAgICAgICAgdGhhdC5kZWZlcnJlZC5wcm9taXNlKHRoYXQpO1xyXG4gICAgICAgICAgICB2YXIgJGZpbGUgPSAkKGZpbGUpO1xyXG5cclxuXHRcdFx0dmFyICRmb3JtID0gJGZpbGUuY2xvc2VzdCgnZm9ybScpO1xyXG5cdFx0XHRpZigkZmlsZS52YWwoKSA9PT0gJycpIHJldHVybjtcclxuXHRcdFx0JGZvcm0uYWpheFN1Ym1pdCh7XHJcblx0XHRcdFx0dHlwZTonUE9TVCcsXHJcblx0XHRcdFx0dXJsOiB0aGF0LnVybCwvLycvc2VydmVyL3VwbG9hZGltYWdlcycsXHJcblx0XHRcdFx0ZGF0YVR5cGU6J3RleHQnLFxyXG5cdFx0XHRcdHN1Y2Nlc3M6ZnVuY3Rpb24ocmV0RGF0YSl7XHJcblx0XHRcdFx0XHR0aGF0LmRlZmVycmVkLnJlc29sdmUocmV0RGF0YSk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjpmdW5jdGlvbihlKXtcclxuXHRcdFx0XHRcdCRmaWxlLnZhbChcIlwiKTtcclxuXHRcdFx0XHRcdHRoYXQuZGVmZXJyZWQucmVqZWN0KGUucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBDb21zeXNGaWxlUmVhZGVyO1xyXG59KSIsIi8qIVxyXG4gKiBqUXVlcnkgRm9ybSBQbHVnaW5cclxuICogdmVyc2lvbjogMy41MS4wLTIwMTQuMDYuMjBcclxuICogUmVxdWlyZXMgalF1ZXJ5IHYxLjUgb3IgbGF0ZXJcclxuICogQ29weXJpZ2h0IChjKSAyMDE0IE0uIEFsc3VwXHJcbiAqIEV4YW1wbGVzIGFuZCBkb2N1bWVudGF0aW9uIGF0OiBodHRwOi8vbWFsc3VwLmNvbS9qcXVlcnkvZm9ybS9cclxuICogUHJvamVjdCByZXBvc2l0b3J5OiBodHRwczovL2dpdGh1Yi5jb20vbWFsc3VwL2Zvcm1cclxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGFuZCBHUEwgbGljZW5zZXMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tYWxzdXAvZm9ybSNjb3B5cmlnaHQtYW5kLWxpY2Vuc2VcclxuICovXHJcbi8qZ2xvYmFsIEFjdGl2ZVhPYmplY3QgKi9cclxuXHJcbi8vIEFNRCBzdXBwb3J0XHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgLy8gdXNpbmcgQU1EOyByZWdpc3RlciBhcyBhbm9uIG1vZHVsZVxyXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gbm8gQU1EOyBpbnZva2UgZGlyZWN0bHlcclxuICAgICAgICBmYWN0b3J5KCAodHlwZW9mKGpRdWVyeSkgIT0gJ3VuZGVmaW5lZCcpID8galF1ZXJ5IDogd2luZG93LlplcHRvICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKlxyXG4gICAgVXNhZ2UgTm90ZTpcclxuICAgIC0tLS0tLS0tLS0tXHJcbiAgICBEbyBub3QgdXNlIGJvdGggYWpheFN1Ym1pdCBhbmQgYWpheEZvcm0gb24gdGhlIHNhbWUgZm9ybS4gIFRoZXNlXHJcbiAgICBmdW5jdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4gIFVzZSBhamF4U3VibWl0IGlmIHlvdSB3YW50XHJcbiAgICB0byBiaW5kIHlvdXIgb3duIHN1Ym1pdCBoYW5kbGVyIHRvIHRoZSBmb3JtLiAgRm9yIGV4YW1wbGUsXHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI215Rm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gPC0tIGltcG9ydGFudFxyXG4gICAgICAgICAgICAkKHRoaXMpLmFqYXhTdWJtaXQoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnI291dHB1dCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBVc2UgYWpheEZvcm0gd2hlbiB5b3Ugd2FudCB0aGUgcGx1Z2luIHRvIG1hbmFnZSBhbGwgdGhlIGV2ZW50IGJpbmRpbmdcclxuICAgIGZvciB5b3UuICBGb3IgZXhhbXBsZSxcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbXlGb3JtJykuYWpheEZvcm0oe1xyXG4gICAgICAgICAgICB0YXJnZXQ6ICcjb3V0cHV0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgWW91IGNhbiBhbHNvIHVzZSBhamF4Rm9ybSB3aXRoIGRlbGVnYXRpb24gKHJlcXVpcmVzIGpRdWVyeSB2MS43KyksIHNvIHRoZVxyXG4gICAgZm9ybSBkb2VzIG5vdCBoYXZlIHRvIGV4aXN0IHdoZW4geW91IGludm9rZSBhamF4Rm9ybTpcclxuXHJcbiAgICAkKCcjbXlGb3JtJykuYWpheEZvcm0oe1xyXG4gICAgICAgIGRlbGVnYXRpb246IHRydWUsXHJcbiAgICAgICAgdGFyZ2V0OiAnI291dHB1dCdcclxuICAgIH0pO1xyXG5cclxuICAgIFdoZW4gdXNpbmcgYWpheEZvcm0sIHRoZSBhamF4U3VibWl0IGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCBmb3IgeW91XHJcbiAgICBhdCB0aGUgYXBwcm9wcmlhdGUgdGltZS5cclxuKi9cclxuXHJcbi8qKlxyXG4gKiBGZWF0dXJlIGRldGVjdGlvblxyXG4gKi9cclxudmFyIGZlYXR1cmUgPSB7fTtcclxuZmVhdHVyZS5maWxlYXBpID0gJChcIjxpbnB1dCB0eXBlPSdmaWxlJy8+XCIpLmdldCgwKS5maWxlcyAhPT0gdW5kZWZpbmVkO1xyXG5mZWF0dXJlLmZvcm1kYXRhID0gd2luZG93LkZvcm1EYXRhICE9PSB1bmRlZmluZWQ7XHJcblxyXG52YXIgaGFzUHJvcCA9ICEhJC5mbi5wcm9wO1xyXG5cclxuLy8gYXR0cjIgdXNlcyBwcm9wIHdoZW4gaXQgY2FuIGJ1dCBjaGVja3MgdGhlIHJldHVybiB0eXBlIGZvclxyXG4vLyBhbiBleHBlY3RlZCBzdHJpbmcuICB0aGlzIGFjY291bnRzIGZvciB0aGUgY2FzZSB3aGVyZSBhIGZvcm0gXHJcbi8vIGNvbnRhaW5zIGlucHV0cyB3aXRoIG5hbWVzIGxpa2UgXCJhY3Rpb25cIiBvciBcIm1ldGhvZFwiOyBpbiB0aG9zZVxyXG4vLyBjYXNlcyBcInByb3BcIiByZXR1cm5zIHRoZSBlbGVtZW50XHJcbiQuZm4uYXR0cjIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICggISBoYXNQcm9wICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgIHZhciB2YWwgPSB0aGlzLnByb3AuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIGlmICggKCB2YWwgJiYgdmFsLmpxdWVyeSApIHx8IHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn07XHJcblxyXG4vKipcclxuICogYWpheFN1Ym1pdCgpIHByb3ZpZGVzIGEgbWVjaGFuaXNtIGZvciBpbW1lZGlhdGVseSBzdWJtaXR0aW5nXHJcbiAqIGFuIEhUTUwgZm9ybSB1c2luZyBBSkFYLlxyXG4gKi9cclxuJC5mbi5hamF4U3VibWl0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgLypqc2hpbnQgc2NyaXB0dXJsOnRydWUgKi9cclxuXHJcbiAgICAvLyBmYXN0IGZhaWwgaWYgbm90aGluZyBzZWxlY3RlZCAoaHR0cDovL2Rldi5qcXVlcnkuY29tL3RpY2tldC8yNzUyKVxyXG4gICAgaWYgKCF0aGlzLmxlbmd0aCkge1xyXG4gICAgICAgIGxvZygnYWpheFN1Ym1pdDogc2tpcHBpbmcgc3VibWl0IHByb2Nlc3MgLSBubyBlbGVtZW50IHNlbGVjdGVkJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1ldGhvZCwgYWN0aW9uLCB1cmwsICRmb3JtID0gdGhpcztcclxuXHJcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIG9wdGlvbnMgPSB7IHN1Y2Nlc3M6IG9wdGlvbnMgfTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBvcHRpb25zID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIG1ldGhvZCA9IG9wdGlvbnMudHlwZSB8fCB0aGlzLmF0dHIyKCdtZXRob2QnKTtcclxuICAgIGFjdGlvbiA9IG9wdGlvbnMudXJsICB8fCB0aGlzLmF0dHIyKCdhY3Rpb24nKTtcclxuXHJcbiAgICB1cmwgPSAodHlwZW9mIGFjdGlvbiA9PT0gJ3N0cmluZycpID8gJC50cmltKGFjdGlvbikgOiAnJztcclxuICAgIHVybCA9IHVybCB8fCB3aW5kb3cubG9jYXRpb24uaHJlZiB8fCAnJztcclxuICAgIGlmICh1cmwpIHtcclxuICAgICAgICAvLyBjbGVhbiB1cmwgKGRvbid0IGluY2x1ZGUgaGFzaCB2YXVlKVxyXG4gICAgICAgIHVybCA9ICh1cmwubWF0Y2goL14oW14jXSspLyl8fFtdKVsxXTtcclxuICAgIH1cclxuXHJcbiAgICBvcHRpb25zID0gJC5leHRlbmQodHJ1ZSwge1xyXG4gICAgICAgIHVybDogIHVybCxcclxuICAgICAgICBzdWNjZXNzOiAkLmFqYXhTZXR0aW5ncy5zdWNjZXNzLFxyXG4gICAgICAgIHR5cGU6IG1ldGhvZCB8fCAkLmFqYXhTZXR0aW5ncy50eXBlLFxyXG4gICAgICAgIGlmcmFtZVNyYzogL15odHRwcy9pLnRlc3Qod2luZG93LmxvY2F0aW9uLmhyZWYgfHwgJycpID8gJ2phdmFzY3JpcHQ6ZmFsc2UnIDogJ2Fib3V0OmJsYW5rJ1xyXG4gICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgLy8gaG9vayBmb3IgbWFuaXB1bGF0aW5nIHRoZSBmb3JtIGRhdGEgYmVmb3JlIGl0IGlzIGV4dHJhY3RlZDtcclxuICAgIC8vIGNvbnZlbmllbnQgZm9yIHVzZSB3aXRoIHJpY2ggZWRpdG9ycyBsaWtlIHRpbnlNQ0Ugb3IgRkNLRWRpdG9yXHJcbiAgICB2YXIgdmV0byA9IHt9O1xyXG4gICAgdGhpcy50cmlnZ2VyKCdmb3JtLXByZS1zZXJpYWxpemUnLCBbdGhpcywgb3B0aW9ucywgdmV0b10pO1xyXG4gICAgaWYgKHZldG8udmV0bykge1xyXG4gICAgICAgIGxvZygnYWpheFN1Ym1pdDogc3VibWl0IHZldG9lZCB2aWEgZm9ybS1wcmUtc2VyaWFsaXplIHRyaWdnZXInKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcm92aWRlIG9wcG9ydHVuaXR5IHRvIGFsdGVyIGZvcm0gZGF0YSBiZWZvcmUgaXQgaXMgc2VyaWFsaXplZFxyXG4gICAgaWYgKG9wdGlvbnMuYmVmb3JlU2VyaWFsaXplICYmIG9wdGlvbnMuYmVmb3JlU2VyaWFsaXplKHRoaXMsIG9wdGlvbnMpID09PSBmYWxzZSkge1xyXG4gICAgICAgIGxvZygnYWpheFN1Ym1pdDogc3VibWl0IGFib3J0ZWQgdmlhIGJlZm9yZVNlcmlhbGl6ZSBjYWxsYmFjaycpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0cmFkaXRpb25hbCA9IG9wdGlvbnMudHJhZGl0aW9uYWw7XHJcbiAgICBpZiAoIHRyYWRpdGlvbmFsID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgdHJhZGl0aW9uYWwgPSAkLmFqYXhTZXR0aW5ncy50cmFkaXRpb25hbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZWxlbWVudHMgPSBbXTtcclxuICAgIHZhciBxeCwgYSA9IHRoaXMuZm9ybVRvQXJyYXkob3B0aW9ucy5zZW1hbnRpYywgZWxlbWVudHMpO1xyXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xyXG4gICAgICAgIG9wdGlvbnMuZXh0cmFEYXRhID0gb3B0aW9ucy5kYXRhO1xyXG4gICAgICAgIHF4ID0gJC5wYXJhbShvcHRpb25zLmRhdGEsIHRyYWRpdGlvbmFsKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBnaXZlIHByZS1zdWJtaXQgY2FsbGJhY2sgYW4gb3Bwb3J0dW5pdHkgdG8gYWJvcnQgdGhlIHN1Ym1pdFxyXG4gICAgaWYgKG9wdGlvbnMuYmVmb3JlU3VibWl0ICYmIG9wdGlvbnMuYmVmb3JlU3VibWl0KGEsIHRoaXMsIG9wdGlvbnMpID09PSBmYWxzZSkge1xyXG4gICAgICAgIGxvZygnYWpheFN1Ym1pdDogc3VibWl0IGFib3J0ZWQgdmlhIGJlZm9yZVN1Ym1pdCBjYWxsYmFjaycpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpcmUgdmV0b2FibGUgJ3ZhbGlkYXRlJyBldmVudFxyXG4gICAgdGhpcy50cmlnZ2VyKCdmb3JtLXN1Ym1pdC12YWxpZGF0ZScsIFthLCB0aGlzLCBvcHRpb25zLCB2ZXRvXSk7XHJcbiAgICBpZiAodmV0by52ZXRvKSB7XHJcbiAgICAgICAgbG9nKCdhamF4U3VibWl0OiBzdWJtaXQgdmV0b2VkIHZpYSBmb3JtLXN1Ym1pdC12YWxpZGF0ZSB0cmlnZ2VyJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHEgPSAkLnBhcmFtKGEsIHRyYWRpdGlvbmFsKTtcclxuICAgIGlmIChxeCkge1xyXG4gICAgICAgIHEgPSAoIHEgPyAocSArICcmJyArIHF4KSA6IHF4ICk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy50eXBlLnRvVXBwZXJDYXNlKCkgPT0gJ0dFVCcpIHtcclxuICAgICAgICBvcHRpb25zLnVybCArPSAob3B0aW9ucy51cmwuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgcTtcclxuICAgICAgICBvcHRpb25zLmRhdGEgPSBudWxsOyAgLy8gZGF0YSBpcyBudWxsIGZvciAnZ2V0J1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucy5kYXRhID0gcTsgLy8gZGF0YSBpcyB0aGUgcXVlcnkgc3RyaW5nIGZvciAncG9zdCdcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FsbGJhY2tzID0gW107XHJcbiAgICBpZiAob3B0aW9ucy5yZXNldEZvcm0pIHtcclxuICAgICAgICBjYWxsYmFja3MucHVzaChmdW5jdGlvbigpIHsgJGZvcm0ucmVzZXRGb3JtKCk7IH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuY2xlYXJGb3JtKSB7XHJcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goZnVuY3Rpb24oKSB7ICRmb3JtLmNsZWFyRm9ybShvcHRpb25zLmluY2x1ZGVIaWRkZW4pOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwZXJmb3JtIGEgbG9hZCBvbiB0aGUgdGFyZ2V0IG9ubHkgaWYgZGF0YVR5cGUgaXMgbm90IHByb3ZpZGVkXHJcbiAgICBpZiAoIW9wdGlvbnMuZGF0YVR5cGUgJiYgb3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICB2YXIgb2xkU3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcyB8fCBmdW5jdGlvbigpe307XHJcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZm4gPSBvcHRpb25zLnJlcGxhY2VUYXJnZXQgPyAncmVwbGFjZVdpdGgnIDogJ2h0bWwnO1xyXG4gICAgICAgICAgICAkKG9wdGlvbnMudGFyZ2V0KVtmbl0oZGF0YSkuZWFjaChvbGRTdWNjZXNzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAob3B0aW9ucy5zdWNjZXNzKSB7XHJcbiAgICAgICAgY2FsbGJhY2tzLnB1c2gob3B0aW9ucy5zdWNjZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihkYXRhLCBzdGF0dXMsIHhocikgeyAvLyBqUXVlcnkgMS40KyBwYXNzZXMgeGhyIGFzIDNyZCBhcmdcclxuICAgICAgICB2YXIgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCB8fCB0aGlzIDsgICAgLy8galF1ZXJ5IDEuNCsgc3VwcG9ydHMgc2NvcGUgY29udGV4dFxyXG4gICAgICAgIGZvciAodmFyIGk9MCwgbWF4PWNhbGxiYWNrcy5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xyXG4gICAgICAgICAgICBjYWxsYmFja3NbaV0uYXBwbHkoY29udGV4dCwgW2RhdGEsIHN0YXR1cywgeGhyIHx8ICRmb3JtLCAkZm9ybV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaWYgKG9wdGlvbnMuZXJyb3IpIHtcclxuICAgICAgICB2YXIgb2xkRXJyb3IgPSBvcHRpb25zLmVycm9yO1xyXG4gICAgICAgIG9wdGlvbnMuZXJyb3IgPSBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBvcHRpb25zLmNvbnRleHQgfHwgdGhpcztcclxuICAgICAgICAgICAgb2xkRXJyb3IuYXBwbHkoY29udGV4dCwgW3hociwgc3RhdHVzLCBlcnJvciwgJGZvcm1dKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgICBpZiAob3B0aW9ucy5jb21wbGV0ZSkge1xyXG4gICAgICAgIHZhciBvbGRDb21wbGV0ZSA9IG9wdGlvbnMuY29tcGxldGU7XHJcbiAgICAgICAgb3B0aW9ucy5jb21wbGV0ZSA9IGZ1bmN0aW9uKHhociwgc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0IHx8IHRoaXM7XHJcbiAgICAgICAgICAgIG9sZENvbXBsZXRlLmFwcGx5KGNvbnRleHQsIFt4aHIsIHN0YXR1cywgJGZvcm1dKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFyZSB0aGVyZSBmaWxlcyB0byB1cGxvYWQ/XHJcblxyXG4gICAgLy8gW3ZhbHVlXSAoaXNzdWUgIzExMyksIGFsc28gc2VlIGNvbW1lbnQ6XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWFsc3VwL2Zvcm0vY29tbWl0LzU4ODMwNmFlZGJhMWRlMDEzODgwMzJkNWY0MmE2MDE1OWVlYTkyMjgjY29tbWl0Y29tbWVudC0yMTgwMjE5XHJcbiAgICB2YXIgZmlsZUlucHV0cyA9ICQoJ2lucHV0W3R5cGU9ZmlsZV06ZW5hYmxlZCcsIHRoaXMpLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICQodGhpcykudmFsKCkgIT09ICcnOyB9KTtcclxuXHJcbiAgICB2YXIgaGFzRmlsZUlucHV0cyA9IGZpbGVJbnB1dHMubGVuZ3RoID4gMDtcclxuICAgIHZhciBtcCA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhJztcclxuICAgIHZhciBtdWx0aXBhcnQgPSAoJGZvcm0uYXR0cignZW5jdHlwZScpID09IG1wIHx8ICRmb3JtLmF0dHIoJ2VuY29kaW5nJykgPT0gbXApO1xyXG5cclxuICAgIHZhciBmaWxlQVBJID0gZmVhdHVyZS5maWxlYXBpICYmIGZlYXR1cmUuZm9ybWRhdGE7XHJcbiAgICBsb2coXCJmaWxlQVBJIDpcIiArIGZpbGVBUEkpO1xyXG4gICAgdmFyIHNob3VsZFVzZUZyYW1lID0gKGhhc0ZpbGVJbnB1dHMgfHwgbXVsdGlwYXJ0KSAmJiAhZmlsZUFQSTtcclxuXHJcbiAgICB2YXIganF4aHI7XHJcblxyXG4gICAgLy8gb3B0aW9ucy5pZnJhbWUgYWxsb3dzIHVzZXIgdG8gZm9yY2UgaWZyYW1lIG1vZGVcclxuICAgIC8vIDA2LU5PVi0wOTogbm93IGRlZmF1bHRpbmcgdG8gaWZyYW1lIG1vZGUgaWYgZmlsZSBpbnB1dCBpcyBkZXRlY3RlZFxyXG4gICAgaWYgKG9wdGlvbnMuaWZyYW1lICE9PSBmYWxzZSAmJiAob3B0aW9ucy5pZnJhbWUgfHwgc2hvdWxkVXNlRnJhbWUpKSB7XHJcbiAgICAgICAgLy8gaGFjayB0byBmaXggU2FmYXJpIGhhbmcgKHRoYW5rcyB0byBUaW0gTW9sZW5kaWprIGZvciB0aGlzKVxyXG4gICAgICAgIC8vIHNlZTogIGh0dHA6Ly9ncm91cHMuZ29vZ2xlLmNvbS9ncm91cC9qcXVlcnktZGV2L2Jyb3dzZV90aHJlYWQvdGhyZWFkLzM2Mzk1YjdhYjUxMGRkNWRcclxuICAgICAgICBpZiAob3B0aW9ucy5jbG9zZUtlZXBBbGl2ZSkge1xyXG4gICAgICAgICAgICAkLmdldChvcHRpb25zLmNsb3NlS2VlcEFsaXZlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGpxeGhyID0gZmlsZVVwbG9hZElmcmFtZShhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBqcXhociA9IGZpbGVVcGxvYWRJZnJhbWUoYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoKGhhc0ZpbGVJbnB1dHMgfHwgbXVsdGlwYXJ0KSAmJiBmaWxlQVBJKSB7XHJcbiAgICAgICAganF4aHIgPSBmaWxlVXBsb2FkWGhyKGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAganF4aHIgPSAkLmFqYXgob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgJGZvcm0ucmVtb3ZlRGF0YSgnanF4aHInKS5kYXRhKCdqcXhocicsIGpxeGhyKTtcclxuXHJcbiAgICAvLyBjbGVhciBlbGVtZW50IGFycmF5XHJcbiAgICBmb3IgKHZhciBrPTA7IGsgPCBlbGVtZW50cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIGVsZW1lbnRzW2tdID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaXJlICdub3RpZnknIGV2ZW50XHJcbiAgICB0aGlzLnRyaWdnZXIoJ2Zvcm0tc3VibWl0LW5vdGlmeScsIFt0aGlzLCBvcHRpb25zXSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICAvLyB1dGlsaXR5IGZuIGZvciBkZWVwIHNlcmlhbGl6YXRpb25cclxuICAgIGZ1bmN0aW9uIGRlZXBTZXJpYWxpemUoZXh0cmFEYXRhKXtcclxuICAgICAgICB2YXIgc2VyaWFsaXplZCA9ICQucGFyYW0oZXh0cmFEYXRhLCBvcHRpb25zLnRyYWRpdGlvbmFsKS5zcGxpdCgnJicpO1xyXG4gICAgICAgIHZhciBsZW4gPSBzZXJpYWxpemVkLmxlbmd0aDtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIGksIHBhcnQ7XHJcbiAgICAgICAgZm9yIChpPTA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAvLyAjMjUyOyB1bmRvIHBhcmFtIHNwYWNlIHJlcGxhY2VtZW50XHJcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRbaV0gPSBzZXJpYWxpemVkW2ldLnJlcGxhY2UoL1xcKy9nLCcgJyk7XHJcbiAgICAgICAgICAgIHBhcnQgPSBzZXJpYWxpemVkW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgIC8vICMyNzg7IHVzZSBhcnJheSBpbnN0ZWFkIG9mIG9iamVjdCBzdG9yYWdlLCBmYXZvcmluZyBhcnJheSBzZXJpYWxpemF0aW9uc1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRbMF0pLCBkZWNvZGVVUklDb21wb25lbnQocGFydFsxXSldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAgLy8gWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMiBmaWxlIHVwbG9hZHMgKGJpZyBoYXQgdGlwIHRvIGZyYW5jb2lzMm1ldHopXHJcbiAgICBmdW5jdGlvbiBmaWxlVXBsb2FkWGhyKGEpIHtcclxuICAgICAgICB2YXIgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmb3JtZGF0YS5hcHBlbmQoYVtpXS5uYW1lLCBhW2ldLnZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmV4dHJhRGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplZERhdGEgPSBkZWVwU2VyaWFsaXplKG9wdGlvbnMuZXh0cmFEYXRhKTtcclxuICAgICAgICAgICAgZm9yIChpPTA7IGkgPCBzZXJpYWxpemVkRGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWREYXRhW2ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWRhdGEuYXBwZW5kKHNlcmlhbGl6ZWREYXRhW2ldWzBdLCBzZXJpYWxpemVkRGF0YVtpXVsxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IG51bGw7XHJcblxyXG4gICAgICAgIHZhciBzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcclxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6IG1ldGhvZCB8fCAnUE9TVCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMudXBsb2FkUHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBiZWNhdXNlIGpxWEhSIGRvZXMgbm90IGV4cG9zZSB1cGxvYWQgcHJvcGVydHlcclxuICAgICAgICAgICAgcy54aHIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4aHIgPSAkLmFqYXhTZXR0aW5ncy54aHIoKTtcclxuICAgICAgICAgICAgICAgIGlmICh4aHIudXBsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZXZlbnQubG9hZGVkIHx8IGV2ZW50LnBvc2l0aW9uOyAvKmV2ZW50LnBvc2l0aW9uIGlzIGRlcHJlY2F0ZWQqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG90YWwgPSBldmVudC50b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcmNlbnQgPSBNYXRoLmNlaWwocG9zaXRpb24gLyB0b3RhbCAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy51cGxvYWRQcm9ncmVzcyhldmVudCwgcG9zaXRpb24sIHRvdGFsLCBwZXJjZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGhyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5kYXRhID0gbnVsbDtcclxuICAgICAgICB2YXIgYmVmb3JlU2VuZCA9IHMuYmVmb3JlU2VuZDtcclxuICAgICAgICBzLmJlZm9yZVNlbmQgPSBmdW5jdGlvbih4aHIsIG8pIHtcclxuICAgICAgICAgICAgLy9TZW5kIEZvcm1EYXRhKCkgcHJvdmlkZWQgYnkgdXNlclxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5mb3JtRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgby5kYXRhID0gb3B0aW9ucy5mb3JtRGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG8uZGF0YSA9IGZvcm1kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGJlZm9yZVNlbmQpIHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZVNlbmQuY2FsbCh0aGlzLCB4aHIsIG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gJC5hamF4KHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIGZpbGUgdXBsb2FkcyAoaGF0IHRpcCB0byBZQUhPTyEpXHJcbiAgICBmdW5jdGlvbiBmaWxlVXBsb2FkSWZyYW1lKGEpIHtcclxuICAgICAgICB2YXIgZm9ybSA9ICRmb3JtWzBdLCBlbCwgaSwgcywgZywgaWQsICRpbywgaW8sIHhociwgc3ViLCBuLCB0aW1lZE91dCwgdGltZW91dEhhbmRsZTtcclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcblxyXG4gICAgICAgIC8vICMzNDFcclxuICAgICAgICBkZWZlcnJlZC5hYm9ydCA9IGZ1bmN0aW9uKHN0YXR1cykge1xyXG4gICAgICAgICAgICB4aHIuYWJvcnQoc3RhdHVzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCBldmVyeSBzZXJpYWxpemVkIGlucHV0IGlzIHN0aWxsIGVuYWJsZWRcclxuICAgICAgICAgICAgZm9yIChpPTA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZWwgPSAkKGVsZW1lbnRzW2ldKTtcclxuICAgICAgICAgICAgICAgIGlmICggaGFzUHJvcCApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9wdGlvbnMpO1xyXG4gICAgICAgIHMuY29udGV4dCA9IHMuY29udGV4dCB8fCBzO1xyXG4gICAgICAgIGlkID0gJ2pxRm9ybUlPJyArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgICAgICAgaWYgKHMuaWZyYW1lVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICRpbyA9ICQocy5pZnJhbWVUYXJnZXQpO1xyXG4gICAgICAgICAgICBuID0gJGlvLmF0dHIyKCduYW1lJyk7XHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgJGlvLmF0dHIyKCduYW1lJywgaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWQgPSBuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkaW8gPSAkKCc8aWZyYW1lIG5hbWU9XCInICsgaWQgKyAnXCIgc3JjPVwiJysgcy5pZnJhbWVTcmMgKydcIiAvPicpO1xyXG4gICAgICAgICAgICAkaW8uY3NzKHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJy0xMDAwcHgnLCBsZWZ0OiAnLTEwMDBweCcgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlvID0gJGlvWzBdO1xyXG5cclxuXHJcbiAgICAgICAgeGhyID0geyAvLyBtb2NrIG9iamVjdFxyXG4gICAgICAgICAgICBhYm9ydGVkOiAwLFxyXG4gICAgICAgICAgICByZXNwb25zZVRleHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlWE1MOiBudWxsLFxyXG4gICAgICAgICAgICBzdGF0dXM6IDAsXHJcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6ICduL2EnLFxyXG4gICAgICAgICAgICBnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge30sXHJcbiAgICAgICAgICAgIGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbigpIHt9LFxyXG4gICAgICAgICAgICBzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbigpIHt9LFxyXG4gICAgICAgICAgICBhYm9ydDogZnVuY3Rpb24oc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZSA9IChzdGF0dXMgPT09ICd0aW1lb3V0JyA/ICd0aW1lb3V0JyA6ICdhYm9ydGVkJyk7XHJcbiAgICAgICAgICAgICAgICBsb2coJ2Fib3J0aW5nIHVwbG9hZC4uLiAnICsgZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFib3J0ZWQgPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7IC8vICMyMTQsICMyNTdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW8uY29udGVudFdpbmRvdy5kb2N1bWVudC5leGVjQ29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpby5jb250ZW50V2luZG93LmRvY3VtZW50LmV4ZWNDb21tYW5kKCdTdG9wJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2goaWdub3JlKSB7fVxyXG5cclxuICAgICAgICAgICAgICAgICRpby5hdHRyKCdzcmMnLCBzLmlmcmFtZVNyYyk7IC8vIGFib3J0IG9wIGluIHByb2dyZXNzXHJcbiAgICAgICAgICAgICAgICB4aHIuZXJyb3IgPSBlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLmVycm9yLmNhbGwocy5jb250ZXh0LCB4aHIsIGUsIHN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZykge1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXZlbnQudHJpZ2dlcihcImFqYXhFcnJvclwiLCBbeGhyLCBzLCBlXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocy5jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHMuY29tcGxldGUuY2FsbChzLmNvbnRleHQsIHhociwgZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBnID0gcy5nbG9iYWw7XHJcbiAgICAgICAgLy8gdHJpZ2dlciBhamF4IGdsb2JhbCBldmVudHMgc28gdGhhdCBhY3Rpdml0eS9ibG9jayBpbmRpY2F0b3JzIHdvcmsgbGlrZSBub3JtYWxcclxuICAgICAgICBpZiAoZyAmJiAwID09PSAkLmFjdGl2ZSsrKSB7XHJcbiAgICAgICAgICAgICQuZXZlbnQudHJpZ2dlcihcImFqYXhTdGFydFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGcpIHtcclxuICAgICAgICAgICAgJC5ldmVudC50cmlnZ2VyKFwiYWpheFNlbmRcIiwgW3hociwgc10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuYmVmb3JlU2VuZCAmJiBzLmJlZm9yZVNlbmQuY2FsbChzLmNvbnRleHQsIHhociwgcykgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGlmIChzLmdsb2JhbCkge1xyXG4gICAgICAgICAgICAgICAgJC5hY3RpdmUtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoeGhyLmFib3J0ZWQpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFkZCBzdWJtaXR0aW5nIGVsZW1lbnQgdG8gZGF0YSBpZiB3ZSBrbm93IGl0XHJcbiAgICAgICAgc3ViID0gZm9ybS5jbGs7XHJcbiAgICAgICAgaWYgKHN1Yikge1xyXG4gICAgICAgICAgICBuID0gc3ViLm5hbWU7XHJcbiAgICAgICAgICAgIGlmIChuICYmICFzdWIuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIHMuZXh0cmFEYXRhID0gcy5leHRyYURhdGEgfHwge307XHJcbiAgICAgICAgICAgICAgICBzLmV4dHJhRGF0YVtuXSA9IHN1Yi52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChzdWIudHlwZSA9PSBcImltYWdlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLmV4dHJhRGF0YVtuKycueCddID0gZm9ybS5jbGtfeDtcclxuICAgICAgICAgICAgICAgICAgICBzLmV4dHJhRGF0YVtuKycueSddID0gZm9ybS5jbGtfeTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIENMSUVOVF9USU1FT1VUX0FCT1JUID0gMTtcclxuICAgICAgICB2YXIgU0VSVkVSX0FCT1JUID0gMjtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERvYyhmcmFtZSkge1xyXG4gICAgICAgICAgICAvKiBpdCBsb29rcyBsaWtlIGNvbnRlbnRXaW5kb3cgb3IgY29udGVudERvY3VtZW50IGRvIG5vdFxyXG4gICAgICAgICAgICAgKiBjYXJyeSB0aGUgcHJvdG9jb2wgcHJvcGVydHkgaW4gaWU4LCB3aGVuIHJ1bm5pbmcgdW5kZXIgc3NsXHJcbiAgICAgICAgICAgICAqIGZyYW1lLmRvY3VtZW50IGlzIHRoZSBvbmx5IHZhbGlkIHJlc3BvbnNlIGRvY3VtZW50LCBzaW5jZVxyXG4gICAgICAgICAgICAgKiB0aGUgcHJvdG9jb2wgaXMga25vdyBidXQgbm90IG9uIHRoZSBvdGhlciB0d28gb2JqZWN0cy4gc3RyYW5nZT9cclxuICAgICAgICAgICAgICogXCJTYW1lIG9yaWdpbiBwb2xpY3lcIiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NhbWVfb3JpZ2luX3BvbGljeVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBkb2MgPSBudWxsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSUU4IGNhc2NhZGluZyBhY2Nlc3MgY2hlY2tcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChmcmFtZS5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIC8vIElFOCBhY2Nlc3MgZGVuaWVkIHVuZGVyIHNzbCAmIG1pc3NpbmcgcHJvdG9jb2xcclxuICAgICAgICAgICAgICAgIGxvZygnY2Fubm90IGdldCBpZnJhbWUuY29udGVudFdpbmRvdyBkb2N1bWVudDogJyArIGVycik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkb2MpIHsgLy8gc3VjY2Vzc2Z1bCBnZXR0aW5nIGNvbnRlbnRcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb2M7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRyeSB7IC8vIHNpbXBseSBjaGVja2luZyBtYXkgdGhyb3cgaW4gaWU4IHVuZGVyIHNzbCBvciBtaXNtYXRjaGVkIHByb3RvY29sXHJcbiAgICAgICAgICAgICAgICBkb2MgPSBmcmFtZS5jb250ZW50RG9jdW1lbnQgPyBmcmFtZS5jb250ZW50RG9jdW1lbnQgOiBmcmFtZS5kb2N1bWVudDtcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIC8vIGxhc3QgYXR0ZW1wdFxyXG4gICAgICAgICAgICAgICAgbG9nKCdjYW5ub3QgZ2V0IGlmcmFtZS5jb250ZW50RG9jdW1lbnQ6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgZG9jID0gZnJhbWUuZG9jdW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRvYztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJhaWxzIENTUkYgaGFjayAodGhhbmtzIHRvIFl2YW4gQmFydGhlbGVteSlcclxuICAgICAgICB2YXIgY3NyZl90b2tlbiA9ICQoJ21ldGFbbmFtZT1jc3JmLXRva2VuXScpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICB2YXIgY3NyZl9wYXJhbSA9ICQoJ21ldGFbbmFtZT1jc3JmLXBhcmFtXScpLmF0dHIoJ2NvbnRlbnQnKTtcclxuICAgICAgICBpZiAoY3NyZl9wYXJhbSAmJiBjc3JmX3Rva2VuKSB7XHJcbiAgICAgICAgICAgIHMuZXh0cmFEYXRhID0gcy5leHRyYURhdGEgfHwge307XHJcbiAgICAgICAgICAgIHMuZXh0cmFEYXRhW2NzcmZfcGFyYW1dID0gY3NyZl90b2tlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRha2UgYSBicmVhdGggc28gdGhhdCBwZW5kaW5nIHJlcGFpbnRzIGdldCBzb21lIGNwdSB0aW1lIGJlZm9yZSB0aGUgdXBsb2FkIHN0YXJ0c1xyXG4gICAgICAgIGZ1bmN0aW9uIGRvU3VibWl0KCkge1xyXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgZm9ybSBhdHRycyBhcmUgc2V0XHJcbiAgICAgICAgICAgIHZhciB0ID0gJGZvcm0uYXR0cjIoJ3RhcmdldCcpLCBcclxuICAgICAgICAgICAgICAgIGEgPSAkZm9ybS5hdHRyMignYWN0aW9uJyksIFxyXG4gICAgICAgICAgICAgICAgbXAgPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgICAgICBldCA9ICRmb3JtLmF0dHIoJ2VuY3R5cGUnKSB8fCAkZm9ybS5hdHRyKCdlbmNvZGluZycpIHx8IG1wO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGZvcm0gYXR0cnMgaW4gSUUgZnJpZW5kbHkgd2F5XHJcbiAgICAgICAgICAgIGZvcm0uc2V0QXR0cmlidXRlKCd0YXJnZXQnLGlkKTtcclxuICAgICAgICAgICAgaWYgKCFtZXRob2QgfHwgL3Bvc3QvaS50ZXN0KG1ldGhvZCkgKSB7XHJcbiAgICAgICAgICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnbWV0aG9kJywgJ1BPU1QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYSAhPSBzLnVybCkge1xyXG4gICAgICAgICAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ2FjdGlvbicsIHMudXJsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWUgYm9ya3MgaW4gc29tZSBjYXNlcyB3aGVuIHNldHRpbmcgZW5jb2RpbmdcclxuICAgICAgICAgICAgaWYgKCEgcy5za2lwRW5jb2RpbmdPdmVycmlkZSAmJiAoIW1ldGhvZCB8fCAvcG9zdC9pLnRlc3QobWV0aG9kKSkpIHtcclxuICAgICAgICAgICAgICAgICRmb3JtLmF0dHIoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5jdHlwZTogICdtdWx0aXBhcnQvZm9ybS1kYXRhJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHN1cHBvcnQgdGltb3V0XHJcbiAgICAgICAgICAgIGlmIChzLnRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aW1lZE91dCA9IHRydWU7IGNiKENMSUVOVF9USU1FT1VUX0FCT1JUKTsgfSwgcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gbG9vayBmb3Igc2VydmVyIGFib3J0c1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja1N0YXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSBnZXREb2MoaW8pLnJlYWR5U3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdzdGF0ZSA9ICcgKyBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlICYmIHN0YXRlLnRvTG93ZXJDYXNlKCkgPT0gJ3VuaW5pdGlhbGl6ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tTdGF0ZSw1MCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZygnU2VydmVyIGFib3J0OiAnICwgZSwgJyAoJywgZS5uYW1lLCAnKScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKFNFUlZFUl9BQk9SVCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRIYW5kbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgXCJleHRyYVwiIGRhdGEgdG8gZm9ybSBpZiBwcm92aWRlZCBpbiBvcHRpb25zXHJcbiAgICAgICAgICAgIHZhciBleHRyYUlucHV0cyA9IFtdO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHMuZXh0cmFEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBzLmV4dHJhRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocy5leHRyYURhdGEuaGFzT3duUHJvcGVydHkobikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdXNpbmcgdGhlICQucGFyYW0gZm9ybWF0IHRoYXQgYWxsb3dzIGZvciBtdWx0aXBsZSB2YWx1ZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaXNQbGFpbk9iamVjdChzLmV4dHJhRGF0YVtuXSkgJiYgcy5leHRyYURhdGFbbl0uaGFzT3duUHJvcGVydHkoJ25hbWUnKSAmJiBzLmV4dHJhRGF0YVtuXS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFJbnB1dHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIicrcy5leHRyYURhdGFbbl0ubmFtZSsnXCI+JykudmFsKHMuZXh0cmFEYXRhW25dLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhmb3JtKVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRyYUlucHV0cy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJytuKydcIj4nKS52YWwocy5leHRyYURhdGFbbl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGZvcm0pWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcy5pZnJhbWVUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaWZyYW1lIHRvIGRvYyBhbmQgc3VibWl0IHRoZSBmb3JtXHJcbiAgICAgICAgICAgICAgICAgICAgJGlvLmFwcGVuZFRvKCdib2R5Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaW8uYXR0YWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpby5hdHRhY2hFdmVudCgnb25sb2FkJywgY2IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW8uYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrU3RhdGUsMTUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBpbiBjYXNlIGZvcm0gaGFzIGVsZW1lbnQgd2l0aCBuYW1lL2lkIG9mICdzdWJtaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1Ym1pdEZuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpLnN1Ym1pdDtcclxuICAgICAgICAgICAgICAgICAgICBzdWJtaXRGbi5hcHBseShmb3JtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIC8vIHJlc2V0IGF0dHJzIGFuZCByZW1vdmUgXCJleHRyYVwiIGlucHV0IGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWN0aW9uJyxhKTtcclxuICAgICAgICAgICAgICAgIGZvcm0uc2V0QXR0cmlidXRlKCdlbmN0eXBlJywgZXQpOyAvLyAjMzgwXHJcbiAgICAgICAgICAgICAgICBpZih0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsIHQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkZm9ybS5yZW1vdmVBdHRyKCd0YXJnZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoZXh0cmFJbnB1dHMpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5mb3JjZVN5bmMpIHtcclxuICAgICAgICAgICAgZG9TdWJtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZG9TdWJtaXQsIDEwKTsgLy8gdGhpcyBsZXRzIGRvbSB1cGRhdGVzIHJlbmRlclxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRhdGEsIGRvYywgZG9tQ2hlY2tDb3VudCA9IDUwLCBjYWxsYmFja1Byb2Nlc3NlZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2IoZSkge1xyXG4gICAgICAgICAgICBpZiAoeGhyLmFib3J0ZWQgfHwgY2FsbGJhY2tQcm9jZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9jID0gZ2V0RG9jKGlvKTtcclxuICAgICAgICAgICAgaWYoIWRvYykge1xyXG4gICAgICAgICAgICAgICAgbG9nKCdjYW5ub3QgYWNjZXNzIHJlc3BvbnNlIGRvY3VtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBlID0gU0VSVkVSX0FCT1JUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlID09PSBDTElFTlRfVElNRU9VVF9BQk9SVCAmJiB4aHIpIHtcclxuICAgICAgICAgICAgICAgIHhoci5hYm9ydCgndGltZW91dCcpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHhociwgJ3RpbWVvdXQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChlID09IFNFUlZFUl9BQk9SVCAmJiB4aHIpIHtcclxuICAgICAgICAgICAgICAgIHhoci5hYm9ydCgnc2VydmVyIGFib3J0Jyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoeGhyLCAnZXJyb3InLCAnc2VydmVyIGFib3J0Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZG9jIHx8IGRvYy5sb2NhdGlvbi5ocmVmID09IHMuaWZyYW1lU3JjKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZXNwb25zZSBub3QgcmVjZWl2ZWQgeWV0XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRpbWVkT3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpby5kZXRhY2hFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgaW8uZGV0YWNoRXZlbnQoJ29ubG9hZCcsIGNiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjYiwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gJ3N1Y2Nlc3MnLCBlcnJNc2c7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZWRPdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAndGltZW91dCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGlzWG1sID0gcy5kYXRhVHlwZSA9PSAneG1sJyB8fCBkb2MuWE1MRG9jdW1lbnQgfHwgJC5pc1hNTERvYyhkb2MpO1xyXG4gICAgICAgICAgICAgICAgbG9nKCdpc1htbD0nK2lzWG1sKTtcclxuICAgICAgICAgICAgICAgIGlmICghaXNYbWwgJiYgd2luZG93Lm9wZXJhICYmIChkb2MuYm9keSA9PT0gbnVsbCB8fCAhZG9jLmJvZHkuaW5uZXJIVE1MKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgtLWRvbUNoZWNrQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW4gc29tZSBicm93c2VycyAoT3BlcmEpIHRoZSBpZnJhbWUgRE9NIGlzIG5vdCBhbHdheXMgdHJhdmVyc2FibGUgd2hlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgb25sb2FkIGNhbGxiYWNrIGZpcmVzLCBzbyB3ZSBsb29wIGEgYml0IHRvIGFjY29tbW9kYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZygncmVxdWVpbmcgb25Mb2FkIGNhbGxiYWNrLCBET00gbm90IGF2YWlsYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNiLCAyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCB0aGlzIGZhbGwgdGhyb3VnaCBiZWNhdXNlIHNlcnZlciByZXNwb25zZSBjb3VsZCBiZSBhbiBlbXB0eSBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC8vbG9nKCdDb3VsZCBub3QgYWNjZXNzIGlmcmFtZSBET00gYWZ0ZXIgbXV0aXBsZSB0cmllcy4nKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3Rocm93ICdET01FeGNlcHRpb246IG5vdCBhdmFpbGFibGUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vbG9nKCdyZXNwb25zZSBkZXRlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRvY1Jvb3QgPSBkb2MuYm9keSA/IGRvYy5ib2R5IDogZG9jLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZVRleHQgPSBkb2NSb290ID8gZG9jUm9vdC5pbm5lckhUTUwgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgeGhyLnJlc3BvbnNlWE1MID0gZG9jLlhNTERvY3VtZW50ID8gZG9jLlhNTERvY3VtZW50IDogZG9jO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzWG1sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5kYXRhVHlwZSA9ICd4bWwnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeGhyLmdldFJlc3BvbnNlSGVhZGVyID0gZnVuY3Rpb24oaGVhZGVyKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaGVhZGVycyA9IHsnY29udGVudC10eXBlJzogcy5kYXRhVHlwZX07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlcnNbaGVhZGVyLnRvTG93ZXJDYXNlKCldO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIFhIUiAnc3RhdHVzJyAmICdzdGF0dXNUZXh0JyBlbXVsYXRpb24gOlxyXG4gICAgICAgICAgICAgICAgaWYgKGRvY1Jvb3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB4aHIuc3RhdHVzID0gTnVtYmVyKCBkb2NSb290LmdldEF0dHJpYnV0ZSgnc3RhdHVzJykgKSB8fCB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHhoci5zdGF0dXNUZXh0ID0gZG9jUm9vdC5nZXRBdHRyaWJ1dGUoJ3N0YXR1c1RleHQnKSB8fCB4aHIuc3RhdHVzVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZHQgPSAocy5kYXRhVHlwZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHZhciBzY3IgPSAvKGpzb258c2NyaXB0fHRleHQpLy50ZXN0KGR0KTtcclxuICAgICAgICAgICAgICAgIGlmIChzY3IgfHwgcy50ZXh0YXJlYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlZSBpZiB1c2VyIGVtYmVkZGVkIHJlc3BvbnNlIGluIHRleHRhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0YXJlYScpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIucmVzcG9uc2VUZXh0ID0gdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIFhIUiAnc3RhdHVzJyAmICdzdGF0dXNUZXh0JyBlbXVsYXRpb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc3RhdHVzID0gTnVtYmVyKCB0YS5nZXRBdHRyaWJ1dGUoJ3N0YXR1cycpICkgfHwgeGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnN0YXR1c1RleHQgPSB0YS5nZXRBdHRyaWJ1dGUoJ3N0YXR1c1RleHQnKSB8fCB4aHIuc3RhdHVzVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc2NyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFjY291bnQgZm9yIGJyb3dzZXJzIGluamVjdGluZyBwcmUgYXJvdW5kIGpzb24gcmVzcG9uc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZSA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgncHJlJylbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZVRleHQgPSBwcmUudGV4dENvbnRlbnQgPyBwcmUudGV4dENvbnRlbnQgOiBwcmUuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZVRleHQgPSBiLnRleHRDb250ZW50ID8gYi50ZXh0Q29udGVudCA6IGIuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZHQgPT0gJ3htbCcgJiYgIXhoci5yZXNwb25zZVhNTCAmJiB4aHIucmVzcG9uc2VUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGhyLnJlc3BvbnNlWE1MID0gdG9YbWwoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gaHR0cERhdGEoeGhyLCBkdCwgcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ3BhcnNlcmVycm9yJztcclxuICAgICAgICAgICAgICAgICAgICB4aHIuZXJyb3IgPSBlcnJNc2cgPSAoZXJyIHx8IHN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgbG9nKCdlcnJvciBjYXVnaHQ6ICcsZXJyKTtcclxuICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdlcnJvcic7XHJcbiAgICAgICAgICAgICAgICB4aHIuZXJyb3IgPSBlcnJNc2cgPSAoZXJyIHx8IHN0YXR1cyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh4aHIuYWJvcnRlZCkge1xyXG4gICAgICAgICAgICAgICAgbG9nKCd1cGxvYWQgYWJvcnRlZCcpO1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMpIHsgLy8gd2UndmUgc2V0IHhoci5zdGF0dXNcclxuICAgICAgICAgICAgICAgIHN0YXR1cyA9ICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwIHx8IHhoci5zdGF0dXMgPT09IDMwNCkgPyAnc3VjY2VzcycgOiAnZXJyb3InO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBvcmRlcmluZyBvZiB0aGVzZSBjYWxsYmFja3MvdHJpZ2dlcnMgaXMgb2RkLCBidXQgdGhhdCdzIGhvdyAkLmFqYXggZG9lcyBpdFxyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnc3VjY2VzcycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLnN1Y2Nlc3MuY2FsbChzLmNvbnRleHQsIGRhdGEsICdzdWNjZXNzJywgeGhyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeGhyLnJlc3BvbnNlVGV4dCwgJ3N1Y2Nlc3MnLCB4aHIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmV2ZW50LnRyaWdnZXIoXCJhamF4U3VjY2Vzc1wiLCBbeGhyLCBzXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyTXNnID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJNc2cgPSB4aHIuc3RhdHVzVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5lcnJvci5jYWxsKHMuY29udGV4dCwgeGhyLCBzdGF0dXMsIGVyck1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoeGhyLCAnZXJyb3InLCBlcnJNc2cpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmV2ZW50LnRyaWdnZXIoXCJhamF4RXJyb3JcIiwgW3hociwgcywgZXJyTXNnXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChnKSB7XHJcbiAgICAgICAgICAgICAgICAkLmV2ZW50LnRyaWdnZXIoXCJhamF4Q29tcGxldGVcIiwgW3hociwgc10pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZyAmJiAhIC0tJC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICQuZXZlbnQudHJpZ2dlcihcImFqYXhTdG9wXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocy5jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgcy5jb21wbGV0ZS5jYWxsKHMuY29udGV4dCwgeGhyLCBzdGF0dXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYWxsYmFja1Byb2Nlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChzLnRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2xlYW4gdXBcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICghcy5pZnJhbWVUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaW8ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHsgLy9hZGRpbmcgZWxzZSB0byBjbGVhbiB1cCBleGlzdGluZyBpZnJhbWUgcmVzcG9uc2UuXHJcbiAgICAgICAgICAgICAgICAgICAgJGlvLmF0dHIoJ3NyYycsIHMuaWZyYW1lU3JjKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZVhNTCA9IG51bGw7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdG9YbWwgPSAkLnBhcnNlWE1MIHx8IGZ1bmN0aW9uKHMsIGRvYykgeyAvLyB1c2UgcGFyc2VYTUwgaWYgYXZhaWxhYmxlIChqUXVlcnkgMS41KylcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5BY3RpdmVYT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xyXG4gICAgICAgICAgICAgICAgZG9jLmFzeW5jID0gJ2ZhbHNlJztcclxuICAgICAgICAgICAgICAgIGRvYy5sb2FkWE1MKHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZG9jID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKHMsICd0ZXh0L3htbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoZG9jICYmIGRvYy5kb2N1bWVudEVsZW1lbnQgJiYgZG9jLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSAhPSAncGFyc2VyZXJyb3InKSA/IGRvYyA6IG51bGw7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgcGFyc2VKU09OID0gJC5wYXJzZUpTT04gfHwgZnVuY3Rpb24ocykge1xyXG4gICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvd1snZXZhbCddKCcoJyArIHMgKyAnKScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBodHRwRGF0YSA9IGZ1bmN0aW9uKCB4aHIsIHR5cGUsIHMgKSB7IC8vIG1vc3RseSBsaWZ0ZWQgZnJvbSBqcTEuNC40XHJcblxyXG4gICAgICAgICAgICB2YXIgY3QgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgeG1sID0gdHlwZSA9PT0gJ3htbCcgfHwgIXR5cGUgJiYgY3QuaW5kZXhPZigneG1sJykgPj0gMCxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB4bWwgPyB4aHIucmVzcG9uc2VYTUwgOiB4aHIucmVzcG9uc2VUZXh0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHhtbCAmJiBkYXRhLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSA9PT0gJ3BhcnNlcmVycm9yJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmVycm9yKCdwYXJzZXJlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzICYmIHMuZGF0YUZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHMuZGF0YUZpbHRlcihkYXRhLCB0eXBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2pzb24nIHx8ICF0eXBlICYmIGN0LmluZGV4T2YoJ2pzb24nKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHBhcnNlSlNPTihkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJzY3JpcHRcIiB8fCAhdHlwZSAmJiBjdC5pbmRleE9mKFwiamF2YXNjcmlwdFwiKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5nbG9iYWxFdmFsKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhamF4Rm9ybSgpIHByb3ZpZGVzIGEgbWVjaGFuaXNtIGZvciBmdWxseSBhdXRvbWF0aW5nIGZvcm0gc3VibWlzc2lvbi5cclxuICpcclxuICogVGhlIGFkdmFudGFnZXMgb2YgdXNpbmcgdGhpcyBtZXRob2QgaW5zdGVhZCBvZiBhamF4U3VibWl0KCkgYXJlOlxyXG4gKlxyXG4gKiAxOiBUaGlzIG1ldGhvZCB3aWxsIGluY2x1ZGUgY29vcmRpbmF0ZXMgZm9yIDxpbnB1dCB0eXBlPVwiaW1hZ2VcIiAvPiBlbGVtZW50cyAoaWYgdGhlIGVsZW1lbnRcclxuICogICAgaXMgdXNlZCB0byBzdWJtaXQgdGhlIGZvcm0pLlxyXG4gKiAyLiBUaGlzIG1ldGhvZCB3aWxsIGluY2x1ZGUgdGhlIHN1Ym1pdCBlbGVtZW50J3MgbmFtZS92YWx1ZSBkYXRhIChmb3IgdGhlIGVsZW1lbnQgdGhhdCB3YXNcclxuICogICAgdXNlZCB0byBzdWJtaXQgdGhlIGZvcm0pLlxyXG4gKiAzLiBUaGlzIG1ldGhvZCBiaW5kcyB0aGUgc3VibWl0KCkgbWV0aG9kIHRvIHRoZSBmb3JtIGZvciB5b3UuXHJcbiAqXHJcbiAqIFRoZSBvcHRpb25zIGFyZ3VtZW50IGZvciBhamF4Rm9ybSB3b3JrcyBleGFjdGx5IGFzIGl0IGRvZXMgZm9yIGFqYXhTdWJtaXQuICBhamF4Rm9ybSBtZXJlbHlcclxuICogcGFzc2VzIHRoZSBvcHRpb25zIGFyZ3VtZW50IGFsb25nIGFmdGVyIHByb3Blcmx5IGJpbmRpbmcgZXZlbnRzIGZvciBzdWJtaXQgZWxlbWVudHMgYW5kXHJcbiAqIHRoZSBmb3JtIGl0c2VsZi5cclxuICovXHJcbiQuZm4uYWpheEZvcm0gPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgIG9wdGlvbnMuZGVsZWdhdGlvbiA9IG9wdGlvbnMuZGVsZWdhdGlvbiAmJiAkLmlzRnVuY3Rpb24oJC5mbi5vbik7XHJcblxyXG4gICAgLy8gaW4galF1ZXJ5IDEuMysgd2UgY2FuIGZpeCBtaXN0YWtlcyB3aXRoIHRoZSByZWFkeSBzdGF0ZVxyXG4gICAgaWYgKCFvcHRpb25zLmRlbGVnYXRpb24gJiYgdGhpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB2YXIgbyA9IHsgczogdGhpcy5zZWxlY3RvciwgYzogdGhpcy5jb250ZXh0IH07XHJcbiAgICAgICAgaWYgKCEkLmlzUmVhZHkgJiYgby5zKSB7XHJcbiAgICAgICAgICAgIGxvZygnRE9NIG5vdCByZWFkeSwgcXVldWluZyBhamF4Rm9ybScpO1xyXG4gICAgICAgICAgICAkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChvLnMsby5jKS5hamF4Rm9ybShvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpcyB5b3VyIERPTSByZWFkeT8gIGh0dHA6Ly9kb2NzLmpxdWVyeS5jb20vVHV0b3JpYWxzOkludHJvZHVjaW5nXyQoZG9jdW1lbnQpLnJlYWR5KClcclxuICAgICAgICBsb2coJ3Rlcm1pbmF0aW5nOyB6ZXJvIGVsZW1lbnRzIGZvdW5kIGJ5IHNlbGVjdG9yJyArICgkLmlzUmVhZHkgPyAnJyA6ICcgKERPTSBub3QgcmVhZHkpJykpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5kZWxlZ2F0aW9uICkge1xyXG4gICAgICAgICQoZG9jdW1lbnQpXHJcbiAgICAgICAgICAgIC5vZmYoJ3N1Ym1pdC5mb3JtLXBsdWdpbicsIHRoaXMuc2VsZWN0b3IsIGRvQWpheFN1Ym1pdClcclxuICAgICAgICAgICAgLm9mZignY2xpY2suZm9ybS1wbHVnaW4nLCB0aGlzLnNlbGVjdG9yLCBjYXB0dXJlU3VibWl0dGluZ0VsZW1lbnQpXHJcbiAgICAgICAgICAgIC5vbignc3VibWl0LmZvcm0tcGx1Z2luJywgdGhpcy5zZWxlY3Rvciwgb3B0aW9ucywgZG9BamF4U3VibWl0KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrLmZvcm0tcGx1Z2luJywgdGhpcy5zZWxlY3Rvciwgb3B0aW9ucywgY2FwdHVyZVN1Ym1pdHRpbmdFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5hamF4Rm9ybVVuYmluZCgpXHJcbiAgICAgICAgLmJpbmQoJ3N1Ym1pdC5mb3JtLXBsdWdpbicsIG9wdGlvbnMsIGRvQWpheFN1Ym1pdClcclxuICAgICAgICAuYmluZCgnY2xpY2suZm9ybS1wbHVnaW4nLCBvcHRpb25zLCBjYXB0dXJlU3VibWl0dGluZ0VsZW1lbnQpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZSBldmVudCBoYW5kbGVyc1xyXG5mdW5jdGlvbiBkb0FqYXhTdWJtaXQoZSkge1xyXG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cclxuICAgIHZhciBvcHRpb25zID0gZS5kYXRhO1xyXG4gICAgaWYgKCFlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7IC8vIGlmIGV2ZW50IGhhcyBiZWVuIGNhbmNlbGVkLCBkb24ndCBwcm9jZWVkXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICQoZS50YXJnZXQpLmFqYXhTdWJtaXQob3B0aW9ucyk7IC8vICMzNjVcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2FwdHVyZVN1Ym1pdHRpbmdFbGVtZW50KGUpIHtcclxuICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XHJcbiAgICB2YXIgJGVsID0gJCh0YXJnZXQpO1xyXG4gICAgaWYgKCEoJGVsLmlzKFwiW3R5cGU9c3VibWl0XSxbdHlwZT1pbWFnZV1cIikpKSB7XHJcbiAgICAgICAgLy8gaXMgdGhpcyBhIGNoaWxkIGVsZW1lbnQgb2YgdGhlIHN1Ym1pdCBlbD8gIChleDogYSBzcGFuIHdpdGhpbiBhIGJ1dHRvbilcclxuICAgICAgICB2YXIgdCA9ICRlbC5jbG9zZXN0KCdbdHlwZT1zdWJtaXRdJyk7XHJcbiAgICAgICAgaWYgKHQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGFyZ2V0ID0gdFswXTtcclxuICAgIH1cclxuICAgIHZhciBmb3JtID0gdGhpcztcclxuICAgIGZvcm0uY2xrID0gdGFyZ2V0O1xyXG4gICAgaWYgKHRhcmdldC50eXBlID09ICdpbWFnZScpIHtcclxuICAgICAgICBpZiAoZS5vZmZzZXRYICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9ybS5jbGtfeCA9IGUub2Zmc2V0WDtcclxuICAgICAgICAgICAgZm9ybS5jbGtfeSA9IGUub2Zmc2V0WTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiAkLmZuLm9mZnNldCA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGZvcm0uY2xrX3ggPSBlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQ7XHJcbiAgICAgICAgICAgIGZvcm0uY2xrX3kgPSBlLnBhZ2VZIC0gb2Zmc2V0LnRvcDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3JtLmNsa194ID0gZS5wYWdlWCAtIHRhcmdldC5vZmZzZXRMZWZ0O1xyXG4gICAgICAgICAgICBmb3JtLmNsa195ID0gZS5wYWdlWSAtIHRhcmdldC5vZmZzZXRUb3A7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gY2xlYXIgZm9ybSB2YXJzXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBmb3JtLmNsayA9IGZvcm0uY2xrX3ggPSBmb3JtLmNsa195ID0gbnVsbDsgfSwgMTAwKTtcclxufVxyXG5cclxuXHJcbi8vIGFqYXhGb3JtVW5iaW5kIHVuYmluZHMgdGhlIGV2ZW50IGhhbmRsZXJzIHRoYXQgd2VyZSBib3VuZCBieSBhamF4Rm9ybVxyXG4kLmZuLmFqYXhGb3JtVW5iaW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoJ3N1Ym1pdC5mb3JtLXBsdWdpbiBjbGljay5mb3JtLXBsdWdpbicpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGZvcm1Ub0FycmF5KCkgZ2F0aGVycyBmb3JtIGVsZW1lbnQgZGF0YSBpbnRvIGFuIGFycmF5IG9mIG9iamVjdHMgdGhhdCBjYW5cclxuICogYmUgcGFzc2VkIHRvIGFueSBvZiB0aGUgZm9sbG93aW5nIGFqYXggZnVuY3Rpb25zOiAkLmdldCwgJC5wb3N0LCBvciBsb2FkLlxyXG4gKiBFYWNoIG9iamVjdCBpbiB0aGUgYXJyYXkgaGFzIGJvdGggYSAnbmFtZScgYW5kICd2YWx1ZScgcHJvcGVydHkuICBBbiBleGFtcGxlIG9mXHJcbiAqIGFuIGFycmF5IGZvciBhIHNpbXBsZSBsb2dpbiBmb3JtIG1pZ2h0IGJlOlxyXG4gKlxyXG4gKiBbIHsgbmFtZTogJ3VzZXJuYW1lJywgdmFsdWU6ICdqcmVzaWcnIH0sIHsgbmFtZTogJ3Bhc3N3b3JkJywgdmFsdWU6ICdzZWNyZXQnIH0gXVxyXG4gKlxyXG4gKiBJdCBpcyB0aGlzIGFycmF5IHRoYXQgaXMgcGFzc2VkIHRvIHByZS1zdWJtaXQgY2FsbGJhY2sgZnVuY3Rpb25zIHByb3ZpZGVkIHRvIHRoZVxyXG4gKiBhamF4U3VibWl0KCkgYW5kIGFqYXhGb3JtKCkgbWV0aG9kcy5cclxuICovXHJcbiQuZm4uZm9ybVRvQXJyYXkgPSBmdW5jdGlvbihzZW1hbnRpYywgZWxlbWVudHMpIHtcclxuICAgIHZhciBhID0gW107XHJcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gYTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybSA9IHRoaXNbMF07XHJcbiAgICB2YXIgZm9ybUlkID0gdGhpcy5hdHRyKCdpZCcpO1xyXG4gICAgdmFyIGVscyA9IHNlbWFudGljID8gZm9ybS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpIDogZm9ybS5lbGVtZW50cztcclxuICAgIHZhciBlbHMyO1xyXG5cclxuICAgIGlmIChlbHMgJiYgIS9NU0lFIFs2NzhdLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7IC8vICMzOTBcclxuICAgICAgICBlbHMgPSAkKGVscykuZ2V0KCk7ICAvLyBjb252ZXJ0IHRvIHN0YW5kYXJkIGFycmF5XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIzM4NjsgYWNjb3VudCBmb3IgaW5wdXRzIG91dHNpZGUgdGhlIGZvcm0gd2hpY2ggdXNlIHRoZSAnZm9ybScgYXR0cmlidXRlXHJcbiAgICBpZiAoIGZvcm1JZCApIHtcclxuICAgICAgICBlbHMyID0gJCgnOmlucHV0W2Zvcm09XCInICsgZm9ybUlkICsgJ1wiXScpLmdldCgpOyAvLyBoYXQgdGlwIEB0aGV0XHJcbiAgICAgICAgaWYgKCBlbHMyLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgZWxzID0gKGVscyB8fCBbXSkuY29uY2F0KGVsczIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWVscyB8fCAhZWxzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBhO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpLGosbix2LGVsLG1heCxqbWF4O1xyXG4gICAgZm9yKGk9MCwgbWF4PWVscy5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xyXG4gICAgICAgIGVsID0gZWxzW2ldO1xyXG4gICAgICAgIG4gPSBlbC5uYW1lO1xyXG4gICAgICAgIGlmICghbiB8fCBlbC5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZW1hbnRpYyAmJiBmb3JtLmNsayAmJiBlbC50eXBlID09IFwiaW1hZ2VcIikge1xyXG4gICAgICAgICAgICAvLyBoYW5kbGUgaW1hZ2UgaW5wdXRzIG9uIHRoZSBmbHkgd2hlbiBzZW1hbnRpYyA9PSB0cnVlXHJcbiAgICAgICAgICAgIGlmKGZvcm0uY2xrID09IGVsKSB7XHJcbiAgICAgICAgICAgICAgICBhLnB1c2goe25hbWU6IG4sIHZhbHVlOiAkKGVsKS52YWwoKSwgdHlwZTogZWwudHlwZSB9KTtcclxuICAgICAgICAgICAgICAgIGEucHVzaCh7bmFtZTogbisnLngnLCB2YWx1ZTogZm9ybS5jbGtfeH0sIHtuYW1lOiBuKycueScsIHZhbHVlOiBmb3JtLmNsa195fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2ID0gJC5maWVsZFZhbHVlKGVsLCB0cnVlKTtcclxuICAgICAgICBpZiAodiAmJiB2LmNvbnN0cnVjdG9yID09IEFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKGo9MCwgam1heD12Lmxlbmd0aDsgaiA8IGptYXg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBuLCB2YWx1ZTogdltqXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZmlsZWFwaSAmJiBlbC50eXBlID09ICdmaWxlJykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGVsLmZpbGVzO1xyXG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGo9MDsgaiA8IGZpbGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBuLCB2YWx1ZTogZmlsZXNbal0sIHR5cGU6IGVsLnR5cGV9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vICMxODBcclxuICAgICAgICAgICAgICAgIGEucHVzaCh7IG5hbWU6IG4sIHZhbHVlOiAnJywgdHlwZTogZWwudHlwZSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2ICE9PSBudWxsICYmIHR5cGVvZiB2ICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYS5wdXNoKHtuYW1lOiBuLCB2YWx1ZTogdiwgdHlwZTogZWwudHlwZSwgcmVxdWlyZWQ6IGVsLnJlcXVpcmVkfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghc2VtYW50aWMgJiYgZm9ybS5jbGspIHtcclxuICAgICAgICAvLyBpbnB1dCB0eXBlPT0naW1hZ2UnIGFyZSBub3QgZm91bmQgaW4gZWxlbWVudHMgYXJyYXkhIGhhbmRsZSBpdCBoZXJlXHJcbiAgICAgICAgdmFyICRpbnB1dCA9ICQoZm9ybS5jbGspLCBpbnB1dCA9ICRpbnB1dFswXTtcclxuICAgICAgICBuID0gaW5wdXQubmFtZTtcclxuICAgICAgICBpZiAobiAmJiAhaW5wdXQuZGlzYWJsZWQgJiYgaW5wdXQudHlwZSA9PSAnaW1hZ2UnKSB7XHJcbiAgICAgICAgICAgIGEucHVzaCh7bmFtZTogbiwgdmFsdWU6ICRpbnB1dC52YWwoKX0pO1xyXG4gICAgICAgICAgICBhLnB1c2goe25hbWU6IG4rJy54JywgdmFsdWU6IGZvcm0uY2xrX3h9LCB7bmFtZTogbisnLnknLCB2YWx1ZTogZm9ybS5jbGtfeX0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNlcmlhbGl6ZXMgZm9ybSBkYXRhIGludG8gYSAnc3VibWl0dGFibGUnIHN0cmluZy4gVGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBzdHJpbmdcclxuICogaW4gdGhlIGZvcm1hdDogbmFtZTE9dmFsdWUxJmFtcDtuYW1lMj12YWx1ZTJcclxuICovXHJcbiQuZm4uZm9ybVNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHNlbWFudGljKSB7XHJcbiAgICAvL2hhbmQgb2ZmIHRvIGpRdWVyeS5wYXJhbSBmb3IgcHJvcGVyIGVuY29kaW5nXHJcbiAgICByZXR1cm4gJC5wYXJhbSh0aGlzLmZvcm1Ub0FycmF5KHNlbWFudGljKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogU2VyaWFsaXplcyBhbGwgZmllbGQgZWxlbWVudHMgaW4gdGhlIGpRdWVyeSBvYmplY3QgaW50byBhIHF1ZXJ5IHN0cmluZy5cclxuICogVGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBzdHJpbmcgaW4gdGhlIGZvcm1hdDogbmFtZTE9dmFsdWUxJmFtcDtuYW1lMj12YWx1ZTJcclxuICovXHJcbiQuZm4uZmllbGRTZXJpYWxpemUgPSBmdW5jdGlvbihzdWNjZXNzZnVsKSB7XHJcbiAgICB2YXIgYSA9IFtdO1xyXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuID0gdGhpcy5uYW1lO1xyXG4gICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB2ID0gJC5maWVsZFZhbHVlKHRoaXMsIHN1Y2Nlc3NmdWwpO1xyXG4gICAgICAgIGlmICh2ICYmIHYuY29uc3RydWN0b3IgPT0gQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaT0wLG1heD12Lmxlbmd0aDsgaSA8IG1heDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBhLnB1c2goe25hbWU6IG4sIHZhbHVlOiB2W2ldfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodiAhPT0gbnVsbCAmJiB0eXBlb2YgdiAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBhLnB1c2goe25hbWU6IHRoaXMubmFtZSwgdmFsdWU6IHZ9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vaGFuZCBvZmYgdG8galF1ZXJ5LnBhcmFtIGZvciBwcm9wZXIgZW5jb2RpbmdcclxuICAgIHJldHVybiAkLnBhcmFtKGEpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHZhbHVlKHMpIG9mIHRoZSBlbGVtZW50IGluIHRoZSBtYXRjaGVkIHNldC4gIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGUgZm9sbG93aW5nIGZvcm06XHJcbiAqXHJcbiAqICA8Zm9ybT48ZmllbGRzZXQ+XHJcbiAqICAgICAgPGlucHV0IG5hbWU9XCJBXCIgdHlwZT1cInRleHRcIiAvPlxyXG4gKiAgICAgIDxpbnB1dCBuYW1lPVwiQVwiIHR5cGU9XCJ0ZXh0XCIgLz5cclxuICogICAgICA8aW5wdXQgbmFtZT1cIkJcIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIkIxXCIgLz5cclxuICogICAgICA8aW5wdXQgbmFtZT1cIkJcIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIkIyXCIvPlxyXG4gKiAgICAgIDxpbnB1dCBuYW1lPVwiQ1wiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwiQzFcIiAvPlxyXG4gKiAgICAgIDxpbnB1dCBuYW1lPVwiQ1wiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwiQzJcIiAvPlxyXG4gKiAgPC9maWVsZHNldD48L2Zvcm0+XHJcbiAqXHJcbiAqICB2YXIgdiA9ICQoJ2lucHV0W3R5cGU9dGV4dF0nKS5maWVsZFZhbHVlKCk7XHJcbiAqICAvLyBpZiBubyB2YWx1ZXMgYXJlIGVudGVyZWQgaW50byB0aGUgdGV4dCBpbnB1dHNcclxuICogIHYgPT0gWycnLCcnXVxyXG4gKiAgLy8gaWYgdmFsdWVzIGVudGVyZWQgaW50byB0aGUgdGV4dCBpbnB1dHMgYXJlICdmb28nIGFuZCAnYmFyJ1xyXG4gKiAgdiA9PSBbJ2ZvbycsJ2JhciddXHJcbiAqXHJcbiAqICB2YXIgdiA9ICQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJykuZmllbGRWYWx1ZSgpO1xyXG4gKiAgLy8gaWYgbmVpdGhlciBjaGVja2JveCBpcyBjaGVja2VkXHJcbiAqICB2ID09PSB1bmRlZmluZWRcclxuICogIC8vIGlmIGJvdGggY2hlY2tib3hlcyBhcmUgY2hlY2tlZFxyXG4gKiAgdiA9PSBbJ0IxJywgJ0IyJ11cclxuICpcclxuICogIHZhciB2ID0gJCgnaW5wdXRbdHlwZT1yYWRpb10nKS5maWVsZFZhbHVlKCk7XHJcbiAqICAvLyBpZiBuZWl0aGVyIHJhZGlvIGlzIGNoZWNrZWRcclxuICogIHYgPT09IHVuZGVmaW5lZFxyXG4gKiAgLy8gaWYgZmlyc3QgcmFkaW8gaXMgY2hlY2tlZFxyXG4gKiAgdiA9PSBbJ0MxJ11cclxuICpcclxuICogVGhlIHN1Y2Nlc3NmdWwgYXJndW1lbnQgY29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIGZpZWxkIGVsZW1lbnQgbXVzdCBiZSAnc3VjY2Vzc2Z1bCdcclxuICogKHBlciBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNC9pbnRlcmFjdC9mb3Jtcy5odG1sI3N1Y2Nlc3NmdWwtY29udHJvbHMpLlxyXG4gKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgc3VjY2Vzc2Z1bCBhcmd1bWVudCBpcyB0cnVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBmYWxzZSB0aGUgdmFsdWUocylcclxuICogZm9yIGVhY2ggZWxlbWVudCBpcyByZXR1cm5lZC5cclxuICpcclxuICogTm90ZTogVGhpcyBtZXRob2QgKmFsd2F5cyogcmV0dXJucyBhbiBhcnJheS4gIElmIG5vIHZhbGlkIHZhbHVlIGNhbiBiZSBkZXRlcm1pbmVkIHRoZVxyXG4gKiAgICBhcnJheSB3aWxsIGJlIGVtcHR5LCBvdGhlcndpc2UgaXQgd2lsbCBjb250YWluIG9uZSBvciBtb3JlIHZhbHVlcy5cclxuICovXHJcbiQuZm4uZmllbGRWYWx1ZSA9IGZ1bmN0aW9uKHN1Y2Nlc3NmdWwpIHtcclxuICAgIGZvciAodmFyIHZhbD1bXSwgaT0wLCBtYXg9dGhpcy5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xyXG4gICAgICAgIHZhciBlbCA9IHRoaXNbaV07XHJcbiAgICAgICAgdmFyIHYgPSAkLmZpZWxkVmFsdWUoZWwsIHN1Y2Nlc3NmdWwpO1xyXG4gICAgICAgIGlmICh2ID09PSBudWxsIHx8IHR5cGVvZiB2ID09ICd1bmRlZmluZWQnIHx8ICh2LmNvbnN0cnVjdG9yID09IEFycmF5ICYmICF2Lmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2LmNvbnN0cnVjdG9yID09IEFycmF5KSB7XHJcbiAgICAgICAgICAgICQubWVyZ2UodmFsLCB2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbC5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB2YWw7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGZpZWxkIGVsZW1lbnQuXHJcbiAqL1xyXG4kLmZpZWxkVmFsdWUgPSBmdW5jdGlvbihlbCwgc3VjY2Vzc2Z1bCkge1xyXG4gICAgdmFyIG4gPSBlbC5uYW1lLCB0ID0gZWwudHlwZSwgdGFnID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKHN1Y2Nlc3NmdWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHN1Y2Nlc3NmdWwgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzdWNjZXNzZnVsICYmICghbiB8fCBlbC5kaXNhYmxlZCB8fCB0ID09ICdyZXNldCcgfHwgdCA9PSAnYnV0dG9uJyB8fFxyXG4gICAgICAgICh0ID09ICdjaGVja2JveCcgfHwgdCA9PSAncmFkaW8nKSAmJiAhZWwuY2hlY2tlZCB8fFxyXG4gICAgICAgICh0ID09ICdzdWJtaXQnIHx8IHQgPT0gJ2ltYWdlJykgJiYgZWwuZm9ybSAmJiBlbC5mb3JtLmNsayAhPSBlbCB8fFxyXG4gICAgICAgIHRhZyA9PSAnc2VsZWN0JyAmJiBlbC5zZWxlY3RlZEluZGV4ID09IC0xKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFnID09ICdzZWxlY3QnKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gZWwuc2VsZWN0ZWRJbmRleDtcclxuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYSA9IFtdLCBvcHMgPSBlbC5vcHRpb25zO1xyXG4gICAgICAgIHZhciBvbmUgPSAodCA9PSAnc2VsZWN0LW9uZScpO1xyXG4gICAgICAgIHZhciBtYXggPSAob25lID8gaW5kZXgrMSA6IG9wcy5sZW5ndGgpO1xyXG4gICAgICAgIGZvcih2YXIgaT0ob25lID8gaW5kZXggOiAwKTsgaSA8IG1heDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBvcCA9IG9wc1tpXTtcclxuICAgICAgICAgICAgaWYgKG9wLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IG9wLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2KSB7IC8vIGV4dHJhIHBhaW4gZm9yIElFLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgdiA9IChvcC5hdHRyaWJ1dGVzICYmIG9wLmF0dHJpYnV0ZXMudmFsdWUgJiYgIShvcC5hdHRyaWJ1dGVzLnZhbHVlLnNwZWNpZmllZCkpID8gb3AudGV4dCA6IG9wLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYS5wdXNoKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuICQoZWwpLnZhbCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENsZWFycyB0aGUgZm9ybSBkYXRhLiAgVGFrZXMgdGhlIGZvbGxvd2luZyBhY3Rpb25zIG9uIHRoZSBmb3JtJ3MgaW5wdXQgZmllbGRzOlxyXG4gKiAgLSBpbnB1dCB0ZXh0IGZpZWxkcyB3aWxsIGhhdmUgdGhlaXIgJ3ZhbHVlJyBwcm9wZXJ0eSBzZXQgdG8gdGhlIGVtcHR5IHN0cmluZ1xyXG4gKiAgLSBzZWxlY3QgZWxlbWVudHMgd2lsbCBoYXZlIHRoZWlyICdzZWxlY3RlZEluZGV4JyBwcm9wZXJ0eSBzZXQgdG8gLTFcclxuICogIC0gY2hlY2tib3ggYW5kIHJhZGlvIGlucHV0cyB3aWxsIGhhdmUgdGhlaXIgJ2NoZWNrZWQnIHByb3BlcnR5IHNldCB0byBmYWxzZVxyXG4gKiAgLSBpbnB1dHMgb2YgdHlwZSBzdWJtaXQsIGJ1dHRvbiwgcmVzZXQsIGFuZCBoaWRkZW4gd2lsbCAqbm90KiBiZSBlZmZlY3RlZFxyXG4gKiAgLSBidXR0b24gZWxlbWVudHMgd2lsbCAqbm90KiBiZSBlZmZlY3RlZFxyXG4gKi9cclxuJC5mbi5jbGVhckZvcm0gPSBmdW5jdGlvbihpbmNsdWRlSGlkZGVuKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJ2lucHV0LHNlbGVjdCx0ZXh0YXJlYScsIHRoaXMpLmNsZWFyRmllbGRzKGluY2x1ZGVIaWRkZW4pO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2xlYXJzIHRoZSBzZWxlY3RlZCBmb3JtIGVsZW1lbnRzLlxyXG4gKi9cclxuJC5mbi5jbGVhckZpZWxkcyA9ICQuZm4uY2xlYXJJbnB1dHMgPSBmdW5jdGlvbihpbmNsdWRlSGlkZGVuKSB7XHJcbiAgICB2YXIgcmUgPSAvXig/OmNvbG9yfGRhdGV8ZGF0ZXRpbWV8ZW1haWx8bW9udGh8bnVtYmVyfHBhc3N3b3JkfHJhbmdlfHNlYXJjaHx0ZWx8dGV4dHx0aW1lfHVybHx3ZWVrKSQvaTsgLy8gJ2hpZGRlbicgaXMgbm90IGluIHRoaXMgbGlzdFxyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdCA9IHRoaXMudHlwZSwgdGFnID0gdGhpcy50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKHJlLnRlc3QodCkgfHwgdGFnID09ICd0ZXh0YXJlYScpIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0ID09ICdjaGVja2JveCcgfHwgdCA9PSAncmFkaW8nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0YWcgPT0gJ3NlbGVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHQgPT0gXCJmaWxlXCIpIHtcclxuICAgICAgICAgICAgaWYgKC9NU0lFLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlcGxhY2VXaXRoKCQodGhpcykuY2xvbmUodHJ1ZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGluY2x1ZGVIaWRkZW4pIHtcclxuICAgICAgICAgICAgLy8gaW5jbHVkZUhpZGRlbiBjYW4gYmUgdGhlIHZhbHVlIHRydWUsIG9yIGl0IGNhbiBiZSBhIHNlbGVjdG9yIHN0cmluZ1xyXG4gICAgICAgICAgICAvLyBpbmRpY2F0aW5nIGEgc3BlY2lhbCB0ZXN0OyBmb3IgZXhhbXBsZTpcclxuICAgICAgICAgICAgLy8gICQoJyNteUZvcm0nKS5jbGVhckZvcm0oJy5zcGVjaWFsOmhpZGRlbicpXHJcbiAgICAgICAgICAgIC8vIHRoZSBhYm92ZSB3b3VsZCBjbGVhbiBoaWRkZW4gaW5wdXRzIHRoYXQgaGF2ZSB0aGUgY2xhc3Mgb2YgJ3NwZWNpYWwnXHJcbiAgICAgICAgICAgIGlmICggKGluY2x1ZGVIaWRkZW4gPT09IHRydWUgJiYgL2hpZGRlbi8udGVzdCh0KSkgfHxcclxuICAgICAgICAgICAgICAgICAodHlwZW9mIGluY2x1ZGVIaWRkZW4gPT0gJ3N0cmluZycgJiYgJCh0aGlzKS5pcyhpbmNsdWRlSGlkZGVuKSkgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXNldHMgdGhlIGZvcm0gZGF0YS4gIENhdXNlcyBhbGwgZm9ybSBlbGVtZW50cyB0byBiZSByZXNldCB0byB0aGVpciBvcmlnaW5hbCB2YWx1ZS5cclxuICovXHJcbiQuZm4ucmVzZXRGb3JtID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGd1YXJkIGFnYWluc3QgYW4gaW5wdXQgd2l0aCB0aGUgbmFtZSBvZiAncmVzZXQnXHJcbiAgICAgICAgLy8gbm90ZSB0aGF0IElFIHJlcG9ydHMgdGhlIHJlc2V0IGZ1bmN0aW9uIGFzIGFuICdvYmplY3QnXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJlc2V0ID09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB0aGlzLnJlc2V0ID09ICdvYmplY3QnICYmICF0aGlzLnJlc2V0Lm5vZGVUeXBlKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRW5hYmxlcyBvciBkaXNhYmxlcyBhbnkgbWF0Y2hpbmcgZWxlbWVudHMuXHJcbiAqL1xyXG4kLmZuLmVuYWJsZSA9IGZ1bmN0aW9uKGIpIHtcclxuICAgIGlmIChiID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBiID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9ICFiO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzL3VuY2hlY2tzIGFueSBtYXRjaGluZyBjaGVja2JveGVzIG9yIHJhZGlvIGJ1dHRvbnMgYW5kXHJcbiAqIHNlbGVjdHMvZGVzZWxlY3RzIGFuZCBtYXRjaGluZyBvcHRpb24gZWxlbWVudHMuXHJcbiAqL1xyXG4kLmZuLnNlbGVjdGVkID0gZnVuY3Rpb24oc2VsZWN0KSB7XHJcbiAgICBpZiAoc2VsZWN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBzZWxlY3QgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdCA9IHRoaXMudHlwZTtcclxuICAgICAgICBpZiAodCA9PSAnY2hlY2tib3gnIHx8IHQgPT0gJ3JhZGlvJykge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSBzZWxlY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdvcHRpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciAkc2VsID0gJCh0aGlzKS5wYXJlbnQoJ3NlbGVjdCcpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ICYmICRzZWxbMF0gJiYgJHNlbFswXS50eXBlID09ICdzZWxlY3Qtb25lJykge1xyXG4gICAgICAgICAgICAgICAgLy8gZGVzZWxlY3QgYWxsIG90aGVyIG9wdGlvbnNcclxuICAgICAgICAgICAgICAgICRzZWwuZmluZCgnb3B0aW9uJykuc2VsZWN0ZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBzZWxlY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBleHBvc2UgZGVidWcgdmFyXHJcbiQuZm4uYWpheFN1Ym1pdC5kZWJ1ZyA9IGZhbHNlO1xyXG5cclxuLy8gaGVscGVyIGZuIGZvciBjb25zb2xlIGxvZ2dpbmdcclxuZnVuY3Rpb24gbG9nKCkge1xyXG4gICAgaWYgKCEkLmZuLmFqYXhTdWJtaXQuZGVidWcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgbXNnID0gJ1tqcXVlcnkuZm9ybV0gJyArIEFycmF5LnByb3RvdHlwZS5qb2luLmNhbGwoYXJndW1lbnRzLCcnKTtcclxuICAgIGlmICh3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cpIHtcclxuICAgICAgICB3aW5kb3cuY29uc29sZS5sb2cobXNnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHdpbmRvdy5vcGVyYSAmJiB3aW5kb3cub3BlcmEucG9zdEVycm9yKSB7XHJcbiAgICAgICAgd2luZG93Lm9wZXJhLnBvc3RFcnJvcihtc2cpO1xyXG4gICAgfVxyXG59XHJcblxyXG59KSk7IiwiLyoqXHJcbiAqIEF1dGhvcjpIZXJ1aTtcclxuICogQ3JlYXRlRGF0ZToyMDE2LTAxLTI2XHJcbiAqXHJcbiAqIERlc2NyaWJlOiBjb21TeXNGcmFtZSB3cmFwIHVwbG9hZCBpbnB1dFxyXG4qL1xyXG5cclxuZGVmaW5lKFxyXG4gICAgW1xyXG4gICAgICAgICdDb3JlJyxcclxuICAgICAgICAnQ2xhc3MnLFxyXG4gICAgICAgIFwiY29tc3lzL2Jhc2UvQmFzZVwiLFxyXG4gICAgICAgIFwiY2xpZW50L0NvbXN5c0ZpbGVSZWFkZXJcIixcclxuICAgICAgICAnU3RhdGljL2pzL2xpYnMvanF1ZXJ5LmZvcm0vanF1ZXJ5LmZvcm0nXHJcbiAgICBdLCBmdW5jdGlvbiAoQ29yZSwgQ2xhc3MsIEJhc2UsIEZpbGVSZWFkZXIpIHtcclxuICAgICAgICB2YXIgQ2xhc3NOYW1lID0gXCJDb250cm9sLlByb3RvVXBsb2FkXCI7XHJcblxyXG4gICAgICAgIHZhciBQcm90b1VwbG9hZD1DbGFzcyhDbGFzc05hbWUsIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJncyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJChhcmdzLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9IHRoYXQuc2V0dGluZy50YXJnZXQgPyAkKCcjJyt0aGF0LnNldHRpbmcudGFyZ2V0KSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGF0LnNldHRpbmcub251cGxvYWRlZCA/IG5ldyBGdW5jdGlvbignaXNOZXcnLCdpbWFnZScsJ2lmKCcgKyB0aGF0LnNldHRpbmcub251cGxvYWRlZCArICcpICcgKyB0aGF0LnNldHRpbmcub251cGxvYWRlZCArICcoaXNOZXcsIGltYWdlKTsnKTpmdW5jdGlvbigpeyB9XHJcbiAgICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShDbGFzc05hbWUpID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkd3JhcCA9IHRoaXMuJHdyYXAgPSAkKFwiPGRpdiBjbGFzcz1cXFwiY29tc3lzLWJhc2UgY29tc3lzLVByb3RvVXBsb2FkXFxcIj48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRmb3JtID0gJCgnPGZvcm0gZW5jdHlwZT1cXFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVxcXCIgbWV0aG9kPVxcXCJQT1NUXFxcIj48L2Zvcm0+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uYXBwZW5kVG8oJHdyYXApXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuYmVmb3JlKCR3cmFwKS5hcHBlbmRUbygkZm9ybSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLm9mZihcIi5Qcm90b1VwbG9hZGZvY3VzXCIpLm9uKCdmb2N1cycsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdyYXAuYWRkQ2xhc3MoJ2ZvY3VzLW91dGVybGluZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLm9uKCdmb2N1c291dC5Qcm90b1VwbG9hZGZvY3VzJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd3JhcC5yZW1vdmVDbGFzcygnZm9jdXMtb3V0ZXJsaW5lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5vZmYoXCIuUHJvdG9VcGxvYWRDaGFuZ2VFdmVudFwiKS5vbihcImNoYW5nZS5Qcm90b1VwbG9hZENoYW5nZUV2ZW50XCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzTmV3ID0gKCAkd3JhcC5maW5kKCdpbWcnKS5sZW5ndGggPT0gMCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUmVhZGVyLnJlYWQoJHRoaXMuZ2V0KDApKS50aGVuKGZ1bmN0aW9uKGltYWdlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLm9ubG9hZD1mdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3cmFwLmZpbmQoJ2ltZycpLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoby53aWR0aD5vLmhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uc3R5bGUud2lkdGg9XCIxMDAlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uc3R5bGUuaGVpZ2h0PVwiMTAwJVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd3JhcC5hcHBlbmQobyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5zcmMgPSBpbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCR0YXJnZXQpICR0YXJnZXQudmFsKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGlzTmV3LGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbihtZXNzYWdlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCR0YXJnZXQpICR0YXJnZXQudmFsKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGlzTmV3LCcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YShDbGFzc05hbWUsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgQmFzZSk7XHJcblxyXG4gICAgICAgICQuZm4uZXh0ZW5kKHtcclxuICAgICAgICAgICAgUHJvdG9VcGxvYWRJbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUHJvdG9VcGxvYWQoeyBlbGVtZW50OiB0aGlzICxzZXR0aW5nOiB7IHRhcmdldCA6ICQodGhpcykuYXR0cignY3MtdGFyZ2V0JykgfHwgJycsIG9udXBsb2FkZWQ6ICQodGhpcykuYXR0cignY3Mtb251cGxvYWRlZCcpIHx8ICcnIH19KS5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9KS5yZW1vdmVBdHRyKCdjcy1jb250cm9sJyk7O1xyXG4gICAgICAgICAgICB9fSk7XHJcblxyXG4gICAgICAgIHJldHVybiBQcm90b1VwbG9hZDtcclxuXHJcbiAgICB9KTsiLCJyZXF1aXJlLmNvbmZpZyh7XHJcbiAgICBiYXNlVXJsOiBcIi4vXCJcclxufSk7XHJcbnZhciBXZWJBcGkgPSB7fTtcclxuZGVmaW5lKFtcclxuICAgICdDb250ZW50L2pzL2NvbW1vbi91dGlsJyxcclxuICAgICdTdGF0aWMvanMvY29tbW9uL2NsaWVudC9SZXF1ZXN0JyxcclxuICAgICdjc3MnLFxyXG4gICAgJ3RleHQnLFxyXG4gICAgJ1N0YXRpYy9qcy9saWJzL2pxdWVyeS5lYXNpbmcvanF1ZXJ5LmVhc2luZycsXHJcbiAgICAnd2lkZ2V0L0NoZWNrQm94JyxcclxuICAgICd3aWRnZXQvUmFkaW9Cb3gnLFxyXG4gICAgJ3dpZGdldC9TaW5nbGVDb21ib3gnLFxyXG4gICAgJ3dpZGdldC9CdXR0b25UZXh0Qm94JyxcclxuICAgICd3aWRnZXQvRGF0YVBpY2tlcicsXHJcbiAgICAnd2lkZ2V0L1Byb3RvVXBsb2FkJ1xyXG5dLCBmdW5jdGlvbih1dGlsKSB7XHJcbiAgICAkLmV4dGVuZChXZWJBcGksIHV0aWwpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbnRlcmZhY2U6IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoYWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChXZWJBcGksIGFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoV2ViQXBpLmluaXQoKSAhPT0gZmFsc2UpIHV0aWwuaW5pdCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgdXRpbC5pbml0KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKSxcclxuICAgICAgICAgICAgICAgIGwgPSBzY3JpcHRzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIG1haW47XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgaWYgKChtYWluID0gc2NyaXB0c1tpXS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJ1c2luZXNzXCIpKSkgYnJlYWs7XHJcbiAgICAgICAgICAgIGlmIChtYWluKVxyXG4gICAgICAgICAgICAgICAgcmVxdWlyZShbXCJDb250ZW50L2pzL21vZHVsZXNfYnVzaW5lc3MvXCIgKyBtYWluXSwgdGhpcy5pbnRlcmZhY2UpO1xyXG4gICAgICAgICAgICBlbHNlIHV0aWwuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSlcclxuIiwicmVxdWlyZShbXHJcbiAgICAnU3RhdGljL2pzL2FwcGxpY2F0aW9uJ1xyXG5dLCBmdW5jdGlvbihhcHBsaWNhdGlvbikge1xyXG4gICAgYXBwbGljYXRpb24uaW5pdCgpO1xyXG5cclxuICAgIHZhciAkbWFpbiA9ICQoJ2JvZHknKTtcclxuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG4gICAgdmFyICRzd2Jhbm5lcnMgPSAkKCcjc3diYW5uZXInKTtcclxuICAgIC8vdmFyICRhcGhvcmlzbSA9ICQoJy5hcGhvcmlzbScpXHJcbiAgICB2YXIgcmVzaXplVGltZXIgPSBudWxsO1xyXG4gICAgLy8gdmFyIGFwaG9yaXNtVG9nZ2xlVGltZXIgPSBudWxsO1xyXG4gICAgLy8gdmFyIGFwaG9yaXNtU3RvcCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyBcdHdpbmRvdy5jbGVhckludGVydmFsKGFwaG9yaXNtVG9nZ2xlVGltZXIpO1xyXG4gICAgLy8gfVxyXG4gICBcdC8vIHZhciBhcGhvcmlzbVBsYXkgPSBmdW5jdGlvbihzcGVlZCl7XHJcbiAgIFx0Ly8gXHQvL+itpuWPpeWIh+aNolxyXG4gICBcdC8vIFx0d2luZG93LmNsZWFySW50ZXJ2YWwoYXBob3Jpc21Ub2dnbGVUaW1lcik7XHJcbiAgIFx0Ly8gXHRhcGhvcmlzbVRvZ2dsZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgIFx0Ly8gXHRcdCRhcGhvcmlzbS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgIFx0Ly8gXHRcdFx0aWYoJGFwaG9yaXNtLmhhc0NsYXNzKCdhcGhvcmlzbS0xJykpXHJcbiAgIFx0Ly8gXHRcdFx0XHQkYXBob3Jpc20ucmVtb3ZlQ2xhc3MoJ2FwaG9yaXNtLTEnKS5hZGRDbGFzcygnYXBob3Jpc20tMicpLmZhZGVJbigpO1xyXG4gICBcdC8vIFx0XHRcdGVsc2VcclxuICAgXHQvLyBcdFx0XHRcdCRhcGhvcmlzbS5yZW1vdmVDbGFzcygnYXBob3Jpc20tMicpLmFkZENsYXNzKCdhcGhvcmlzbS0xJykuZmFkZUluKCk7XHJcbiAgICBcclxuICAgXHQvLyBcdFx0fSlcclxuICAgXHQvLyBcdH0sIHNwZWVkKTtcclxuICAgXHQvLyB9XHJcblx0LyoqXHJcblx0ICogW2luaXRpYWxpemUg6aG16Z2i5Yid5aeL5YyW5Ye95pWwIOWPiiDpobXpnaLph43nu5jlkI7ph43mlrDorqHnrpddXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSByZXNpemUgW+aYr+WQpuaYr+iuoeeul+mrmOW6pl1cclxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICBb5Ye95pWw5pys6LqrXVxyXG5cdCAqL1xyXG5cdHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24ocmVzaXplKXtcclxuXHRcdCRtYWluLmhpZGUoKTtcclxuXHRcdHZhciBjYiA9IGZ1bmN0aW9uKCkge307XHJcblx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KHJlc2l6ZVRpbWVyKTtcclxuXHRcdHJlc2l6ZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHJcblx0XHRcdHZhciBoID0gJHdpbmRvdy5oZWlnaHQoKSAtIDIwMCAtIDEwMCAtIDM1O1xyXG5cdFx0XHQkc3diYW5uZXJzLmNzcyh7IGhlaWdodDogaCA8IDI4NSA/IDI4NSA6IGggfSk7XHJcblx0XHRcdC8v56ys5LiA5qyh5Yqg6L29XHJcblx0XHRcdGlmKHJlc2l6ZSA9PT0gZmFsc2UpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQkc3diYW5uZXJzLnN3YmFubmVyKHtcclxuXHRcdFx0XHRcdHNwZWVkOiA1MDAwLFxyXG5cdFx0XHRcdFx0Y29udHJvbDI6IHRydWUsXHJcblx0XHRcdFx0XHRkZWZhdWx0V2lkdGg6ICR3aW5kb3cud2lkdGgoKSxcclxuXHRcdFx0XHRcdHBsYXllZDpmdW5jdGlvbihzcGVlZCl7XHJcblx0XHRcdFx0XHRcdC8vYXBob3Jpc21QbGF5KHNwZWVkKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRzdG9wZWQ6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0Ly9hcGhvcmlzbVN0b3AoKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdCQubG9hZEltYWdlKCk7XHJcblxyXG5cdFx0XHRcdGNiID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCQoXCIubG9naW4tcGFuZWw6Zmlyc3RcIikuYWRkQ2xhc3MoJ2ZvcndhcmQtaW4nKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdCQoJy5sb2dpbi1wYW5lbCAudG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcykuY2xvc2VzdCgnLmxvZ2luLXBhbmVsJyk7XHJcblx0XHRcdFx0XHR2YXIgJG90aGVyID0gJHRoaXMuc2libGluZ3MoKTtcclxuXHRcdFx0XHRcdCR0aGlzLmFkZENsYXNzKCdmb3J3YXJkLW91dCcpO1xyXG5cdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3MoJ2ZvcndhcmQtaW4gZm9yd2FyZC1vdXQnKTtcclxuXHRcdFx0XHRcdFx0JG90aGVyLmFkZENsYXNzKCdmb3J3YXJkLWluJyk7XHJcblx0XHRcdFx0XHR9LDE1MClcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0JCgnLmlucHV0JykuY2xpY2soZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdCQodGhpcykuZmluZCgnaW5wdXQnKS5mb2N1cygpXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fWVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8v6YeN5paw6K6h566X6auY5a69XHJcblx0XHRcdFx0JHN3YmFubmVycy5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHR2YXIgJGJhbm5lckNvbnRhaW5lciA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHR2YXIgJGltYWdlcyA9ICRiYW5uZXJDb250YWluZXIuZGF0YSgnaW1hZ2VzJyk7XHJcblx0XHRcdFx0XHR2YXIgd2lkdGggPSAkd2luZG93LndpZHRoKCk7XHJcblx0XHRcdFx0XHR2YXIgaGVpZ2h0ID0gJGJhbm5lckNvbnRhaW5lci5oZWlnaHQoKTtcclxuXHRcdFx0XHRcdCRpbWFnZXMuZWFjaChmdW5jdGlvbihpLCBlbCl7XHJcblx0XHRcdFx0XHRcdFdlYkFwaS5jb21wdXRlZChlbC5zcmMsIHdpZHRoLCBoZWlnaHQpLmRvbmUoZnVuY3Rpb24odywgaCwgaG9yaXpvbnRhbCl7XHJcblx0XHRcdFx0XHRcdFx0dmFyICRlbCA9ICQoZWwpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChob3Jpem9udGFsKVxyXG5cdFx0XHRcdFx0XHRcdFx0JGVsLmNzcyh7IGxlZnQ6JzAnLCB0b3AgOic1MCUnLCB3aWR0aDogJzEwMCUnLGhlaWdodDogJ2F1dG8nLCAgbWFyZ2luVG9wOiBoIC8gLTIgKyAncHgnLCBtYXJnaW5MZWZ0OiAwIH0pO1xyXG5cdFx0XHRcdFx0IFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHQkZWwuY3NzKHsgbGVmdDonNTAlJywgdG9wIDonMCcsIHdpZHRoOiAnYXV0bycsaGVpZ2h0OiAnMTAwJScsIG1hcmdpbkxlZnQ6IHcgLyAtMiArICdweCcsIG1hcmdpblRvcDogMCB9KTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkbWFpbi5mYWRlSW4oY2IpO1xyXG5cdFx0fSwgMjAwKTtcclxuXHRcdHJldHVybiBhcmd1bWVudHMuY2FsbGVlXHJcblx0fVxyXG5cclxuXHQkd2luZG93LnJlc2l6ZShpbml0aWFsaXplKGZhbHNlKSk7XHJcbn0pO1xyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
