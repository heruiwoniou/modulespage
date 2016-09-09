/**
 * Created by comsys on 2016/9/7.
 */
define(function(){
    //code here
    // console.log('加载')
    var $container = $('#masonry');
    $container.imagesLoaded( function(){
        $container.masonry({
            itemSelector : '.list-box',
            gutterWidth : 0,
            isAnimated: true
        });
    });

})