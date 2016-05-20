define(function(){
	//to define something
	//
	var library = {
	}

	var common={
		TBControlInit:function(){
			$(document).off(".TBControlHandler").on("click.TBControlHandler", '.tab-head li:not(li.other)', function () {
                    var $this = $(this);
                    if ($this.hasClass("select")) return;
                    var $control = $this.closest(".TBControl");
                    var $body=$control.find('.tab-body')
                    var $head = $this.closest(".tab-head");
                    $head.find("li.select").removeClass("select");
                    $this.addClass("select");
                    var id = $this.attr("data-target");
                    var url=$this.attr("data-url");
                    var itemcallback=$this.attr("data-callback");
                    var controlcallback=$control.attr("data-callback");
                    var showed=$body.find(">[data-id]:visible");
                    var target=$body.find(">[data-id='" + id + "']");
                    if(url) {
                        WebApi.showlayer();
                        target.load(url,null,function(html,status){
                            if(status=="success")
                            {
                                showed.hide();
                                $this.removeAttr("data-url").remove("data-callback");
                                target.show();
                                if(callback&&WebApi[itemcallback]){WebApi[itemcallback]();};
                                WebApi.initControl(target);
                            }else alert(html);
                            WebApi.hidelayer();
                        });
                    }else{
                        $body.find(">[data-id]:visible").hide().end().find(">[data-id='" + id + "']").show();
                    }
                    if(controlcallback&&WebApi[controlcallback]) WebApi[controlcallback](id);
                });
		},
		init:function(){
			WebApi.initControl();

			//TBControll init
			this.TBControlInit();

			//to do something
		}
	}

	$.extend(WebApi,library);

	return common;
})
