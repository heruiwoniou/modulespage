/**
 * Author:Herui;
 * CreateDate:2016-01-26
 *
 * Describe: comSysFrame layout TextCalulate
*/


define(["jquery"],
    function () {
        var TextCalulate = {
            init: function () {
                if (this.$Container) return;
                this.$Container = $(document.createElement("DIV"));
                this.$InnerContainer = $(document.createElement("DIV"));
                this.$Container.css({ width: 0, height: 0, position: "relative", background: "green", overFlow: "hidden" });
                this.$InnerContainer.css({ position: "absolute", background: "brown", left: 1, top: 1,whiteSpace: "nowrap" });
                this.$Container.append(this.$InnerContainer);
                $(document.body).append(this.$Container);
            },
            getOption: function (str, style) {
                this.init();
                style = style || {};
                var $span = $(document.createElement("SPAN")).css(style).append(document.createTextNode(str));
                this.$InnerContainer.append($span);
                var result = {
                    width: $span.width() + 2,
                    height: $span.height()
                };
                $span.remove();
                return result;
            },
            getWidth: function (str, style) {
                this.init();
                style = style || {};
                var $span = $(document.createElement("SPAN")).css(style).append(document.createTextNode(str));
                this.$InnerContainer.append($span);
                var result = $span.width();
                $span.remove();
                return result + 2;
            }
        };

        return TextCalulate;
    });

