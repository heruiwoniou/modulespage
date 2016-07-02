define(['vue'], function(Vue) {
    Vue.transition('right-to-center', {
		css: false,
		enter (el, done) {
			// 元素已被插入 DOM
			// 在动画结束后调用 done
			var $el = $(el);
			var $right = $(this.$el).find('~.right')
			$el.css({ left : -600 , width: 600})
				.animate({ left : 0 }, 300, "easeOutExpo" , done);
			$right.css({ left : 600 })
		},
		leave (el, done) {
			var $el = $(el);
			var $right = $(this.$el).find('~.right')
			// 与 enter 相同
			$el.animate({ left: -600 , width: 600 }, 300 , done);
			$right.css({ left : 210 })
		}
	});
})
