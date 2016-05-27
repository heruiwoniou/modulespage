define(['vue'], function(Vue) {
    Vue.transition('fadeInOut', {
        css: false,
        enter: function(el, done) {
            $(el).css({opacity: 0 }).animate({ opacity: "1" }, 200,done)
        },
        leave: function(el, done) {
        	var $el=$(el);
            $el.css('opacity', 1).animate({ opacity: 0 }, 150, function(){
            	$el.hide(50,done)
            })
        }
    });
})
