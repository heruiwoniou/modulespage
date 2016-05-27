define(['vue'], function(Vue) {
    Vue.transition('fadeInOutDown', {
        css: false,
        enter: function(el, done) {
            $(el).css({opacity: 0,top:"-20%" }).animate({ opacity: "1", top:'0%' }, 200,done)
        },
        leave: function(el, done) {
        	var $el=$(el);
            $el.css({opacity: 1,left:"0" }).animate({ opacity: 0,left:'-20%' }, 200, done)
        }
    });
})
