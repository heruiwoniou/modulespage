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
        var ClassName = "Controll.Base";
        return Class(ClassName, {
            constructor: function (args) {
                args = args || {};
                this.callParent(args);
                this.setting = {};
                if(args.setting)
                    this.setting=$.extend({},args.setting);
                this.classids = Guid.NewGuid().ToString("D");//"classids" + (Math.random() * 1e+10).toFixed();
            },
            initialize: function () {
                return this;
            }
        }, Core);
    });
