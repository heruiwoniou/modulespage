/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame core libary
*/

define(function () {
    //Core Object
    var core = function () {
        this.versions = "1.0";
    };
    //Except Methods
    var de = [
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "toLocaleString",
        "toString",
        "valueOf"
    ],

    //Check Except Methods
    except = function (k) {
        for (var i = 0; i < de.length; i++) {
            if (de[i] === k) return false;
        }
        return true;
    }

    //Core Object Based Methods
    core.prototype = {
        constructor: core,
        extend: function (o, b, inner) {
            b = b || this;
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    var obj = o[k], fn=null;
                    if (!except(k)) continue;
                    if (!inner && typeof b[k] == "function" && typeof obj == "function")
                        fn = b[k];
                    b[k] = o[k];
                    if (fn) b[k].fn = fn;
                }
            }
            return b;
        }
    }

    core.classes = {};

    return function () {
        var c = new core();
        c.sup = core; return c;
    }
})