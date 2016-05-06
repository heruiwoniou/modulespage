/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame Control Base
*/

define(
    [
        'Core',
        'Class',
        'Guid'
    ],
    function (Core, Class,Guid) {

        function createSettings(b, o) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    if (typeof o[k] !== "object" || o[k].nodeName)
                        b[k] = o[k];
                    else {
                        b[k] = {};
                        arguments.callee(b[k], o[k]);
                    }
                }
            }
        }

        var ClassName = "Controll.Base";

        return Class(ClassName, {
            constructor: function (args) {
                args = args || {};
                this.callParent(args);
                this.setting = {};
                if(args.setting)
                    createSettings((this.setting = {}), args.setting);
                this.classids = Guid.NewGuid().ToString("D");//"classids" + (Math.random() * 1e+10).toFixed();
            },
            initialize: function () {
                return this;
            }
        }, Core);
    });
