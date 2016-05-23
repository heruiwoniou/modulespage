define(['vue'], function(Vue) {
    Vue.filter('date', function(value) {
        var match = /(\d{4,4})-(\d{1,2})-(\d{1,2})/.exec(value);
        return match ? RegExp.$1 + "年" + RegExp.$2 + "月" + RegExp.$3 + "日" : value;
    })
})
