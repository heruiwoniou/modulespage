/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame js templete engine
*/

define(function () {

    var TPLEngine;

    TPLEngine = {
        render: function (tpl, data) {
            return this.draw(tpl, data);
        },
        drawlayout: function (tpl, data) {
            var reg = /@\{layout:([\s\S]*?)\}@/g, regRender = /@\{layout\}@/, match;
            if ((match = reg.exec(tpl))) {
                var code = "var r=[];\n";
                var param = match[1].split(',');
                code += "r.push(TPLEngine.draw(" + param[0] + "," + param[1] + "));\n";
                code += 'return r.join("");';
                var part = new Function("TPLEngine", code.replace(/[\r\t\n]/g, '')).apply(data, [TPLEngine]);
                return part.replace(regRender, tpl.slice(match[0].length));
            }
            return false;
        },
        draw: function (tpl, data, $parent) {
            $parent = $parent || data;
            var content = tpl;
            ((content = this.drawlayout(content, data)) !== false) ? tpl = content : undefined;
            var reg = /<%([\s\S]*?)%>|@\{section:([\s\S]*?)\}@/g,
				regOut = /^\s*=\s*([\s\S]*)$/,
				code = 'var r=[];\n',
				cursor = 0,
				match, e, line;
            var add = function (match, js) {
                var section = (match[1] === undefined || match[1] === "");
                line = (typeof match == 'string' ? match : (section ? match[2] : match[1]));
                if (js) {
                    if (section) {
                        var param = line.split(',');
                        var item = param.shift();
                        var param = param.join(",");
                        code += "this.$parent=$parent;r.push(TPLEngine.draw(" + item + "," + param + ",this));\n";
                    }
                    else {
                        if ((e = regOut.exec(line)) == null) {
                            code += line + '\n';
                        }
                        else {
                            code += 'r.push(' + e[1] + ');\n';
                        }
                    }
                }
                else {
                    if (line != '')
                        code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
                }
                return add;
            }
            while ((match = reg.exec(tpl))) {
                add(tpl.slice(cursor, match.index))(match, true);
                cursor = match.index + match[0].length;
            }
            add(tpl.substr(cursor, tpl.length - cursor));
            code += 'return r.join("");';
            return new Function("$parent", "TPLEngine", code.replace(/[\r\t\n]/g, '')).apply(data, [$parent, TPLEngine]);
        }
    }

    return TPLEngine;

});