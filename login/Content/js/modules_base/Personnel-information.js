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
    $.loadImage();
    $('.scroll-bar').scrollBar({
        scrollInertia: 400,
        advanced: { autoScrollOnFocus: false },
        autoHideScrollbar: true,
        scrollButtons: { enable: false },
        advanced: { updateOnImageLoad: false }
    });
});
define('Content/js/modules_base/Personnel-information', [
    'Static/js/application',
    'Static/js/libs/jquery.scrollbar/jquery.mCustomScrollbar'
], function () {
    return;
});