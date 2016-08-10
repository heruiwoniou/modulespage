require(['Static/js/application','Static/js/common/client/WinResizeResponder'],function(application, Responder){
    application.init();
    var $control = $('#mybody');
    Responder.resize(function(wh){
        $control.css({minHeight:wh - 185 + 'px'})
    })
})