define(['vue'],function(Vue){
    Vue.filter('number-split', function(value) {
        value = value || "";
        var result = [];
        var arr = [].slice.call(value.toString(), 0);
        while (arr.length != 0) {
            for (var i = 0; i < 3; i++) {
                var char = arr.pop()
                if (!char) break;
                result.push(char);
            }
            if (arr.length != 0) result.push(' , ')
        }
        return result.reverse().join('') + ' ';
    })
})

