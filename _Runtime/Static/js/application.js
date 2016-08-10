require.config({
    baseUrl: "./",
    paths:{
        jquery:"Content/js/common/jquery"
    }
});
require(['Static/js/base'],function(application){
    application.init();
})
