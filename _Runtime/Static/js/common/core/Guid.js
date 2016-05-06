/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

//表示全局唯一标识符 (GUID)。
define(function () {

    function Guid(g) {

        var arr = new Array();
        if (typeof(g) == "string") {
            InitByString(arr, g);
        }
        else {
            InitByOther(arr);
        }
        this.Equals = function (o) {
            if (o && o.IsGuid) {
                return this.ToString() == o.ToString();
            }
            else {
                return false;
            }
        }
        this.IsGuid = function () {}
        this.ToString = function (format) {
            if (typeof(format) == "string") {
                if (format == "N" || format == "D" || format == "B" || format == "P") {
                    return ToStringWithFormat(arr, format);
                }
                else {
                    return ToStringWithFormat(arr, "D");
                }
            }
            else {
                return ToStringWithFormat(arr, "D");
            }
        }
        function InitByString(arr, g) {
            g = g.replace(/\{|\(|\)|\}|-/g, "");
            g = g.toLowerCase();
            if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {
                InitByOther(arr);
            }
            else {
                for (var i = 0; i < g.length; i++) {
                    arr.push(g[i]);
                }
            }
        }
        function InitByOther(arr) {
            var i = 32;
            while (i--) {
                arr.push("0");
            }
        }
        function ToStringWithFormat(arr, format) {
            switch (format) {
                case "N":
                    return arr.toString().replace(/,/g, "");
                case "D":
                    var str = arr.slice(0, 8) + "-" + arr.slice(8, 12) + "-" + arr.slice(12, 16) + "-" + arr.slice(16, 20) + "-" + arr.slice(20, 32);
                    str = str.replace(/,/g, "");
                    return str;
                case "B":
                    var str = ToStringWithFormat(arr, "D");
                    str = "{" + str + "}";
                    return str;
                case "P":
                    var str = ToStringWithFormat(arr, "D");
                    str = "(" + str + ")";
                    return str;
                default:
                    return new Guid();
            }
        }
    }
    Guid.Empty = new Guid();
    Guid.NewGuid = function () {
        var g = "";
        var i = 32;
        while (i--) {
            g += Math.floor(Math.random() * 16.0).toString(16);
        }
        return new Guid(g);
    }
    return Guid;
})