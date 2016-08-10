require.config({
    baseUrl: "./",
    paths:{
    	libs:"Static/js/libs",

        jquery:"Content/js/common/jquery",
        ztree:"Static/js/libs/ztree/jquery.ztree"
    }
});
require(['Static/js/base'],function(application){
    application.init();
})
