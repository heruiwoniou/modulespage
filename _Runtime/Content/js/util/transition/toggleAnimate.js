define(['vue'], function(Vue) {
    Vue.transition('toggle-animate', {
        css: false,
        enter: function(el, done) {
            $(el).css('left', "-100%").animate({ left: "0" }, 200, done)
        },
        leave: function(el, done) {
            $(el).css('left', "0").animate({ left: "-100%" }, 200, done)
        }
    });
})
