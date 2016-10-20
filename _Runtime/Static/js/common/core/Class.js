define(
    function() {
        var ClassLibrary = {
            Classes: {},
            _callParent: function() {
                return arguments.callee.caller && arguments.callee.caller.fn ? arguments.callee.caller.fn.apply(this, arguments) : null;
            },
            _isDontEnum: function() {
                for (var key in { constructor: 1 })
                    if (key == "constructor") return false;
                return true;
            },
            _extend: function(b, e, isRecursion) {
                b = b || {};
                for (var k in e) {
                    var current = e[k];
                    var ctype = Object.prototype.toString.apply(current);
                    if (ctype == "[object Function]") {
                        var fn;
                        if (Object.prototype.toString.apply(b[k]) == "[object Function]")
                            fn = b[k];
                        b[k] = current;
                        if (fn) b[k].fn = fn;
                    } else if (ctype == "[object Object]") {
                        if (!b[k]) b[k] = {}
                        arguments.callee(b[k], e[k], true)
                    } else
                        b[k] = current;
                }
                if (!isRecursion && ClassLibrary._isDontEnum() && b.constructor) {
                    var constructor = b.constructor;
                    b.constructor = e.constructor;
                    b.constructor.fn = constructor;
                }
            },
            Class: function(sub, method, sup, area) {
                sup = sup || Object;

                area = area || ClassLibrary.Classes;
                var name;
                var space = sub.split('.');
                space.reverse();
                sub = space.shift();
                while ((name = space.pop()) != null) {
                    if (!area[name]) area[name] = {};
                    area = area[name];
                }

                var subclassProto =
                    Object.create ?
                    Object.create(sup.prototype) :
                    function() {
                        var Super = function() {};
                        Super.prototype = sup.prototype;
                        return new Super()
                    }();

                ClassLibrary._extend(subclassProto, method);

                sub = area[sub] = subclassProto.constructor;
                sub.prototype = subclassProto;
                sub.prototype.constructor = sub;
                sub.prototype.callParent = ClassLibrary._callParent;

                return sub;
            }
        }

        window.ClassLibrary = ClassLibrary;
        return ClassLibrary.Class;
    })