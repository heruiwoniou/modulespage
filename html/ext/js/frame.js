var templ = "<div class=\"frame-window bestBgColorNA bestBorder\">"
	+"<div class=\"frame-title bestBgColorNA bestTextColor\">"
	+"<span>{{:appname}}</span>"
	+"<div class=\"app-exit iconfont icon-close place-right\" onclick=\"appClose()\"></div>"
	+"</div><img src=\"{{:logo}}\" class=\"frame-logo\" /><iframe frameborder=no border=0 src=\"\"></iframe></div>";

function loadBackground(image){
		
		setCookie("ub",image.replace("/sb","/b"));
		var mm = $(".beauty .main .image img");
		$(".beauty .main .image img").attr("src",image);
		if (!IEor) {
				$("#bgsvg").css("opacity",0);
				if(mm[0].complete){
						stackBlurImageObj( mm[0], "bgsvg", 10, false );
						var w = $(window).width();
						var h = $(window).height();
						if (w / 16 * 9 > h) {
							h = parseInt(w / 16 * 9) * 1.05;
							w = w * 1.05;
						} else {
							w = parseInt(h / 9 * 16) * 1.05;
							h = h * 1.05;
						}
						$("#bgsvg").width(w).height(h);
						$("#bgsvg").css({
							"left" : "50%",
							"top" : "50%",
							"margin-left" : "-" + ((parseInt(w / 2)) + "px"),
							"margin-top" : ("-" + (parseInt(h / 2)) + "px")
						});
						$("#bgsvg").velocity({opacity:[1,0.3]},300);
				}else{
					  mm[0].onload = function(){
						stackBlurImageObj( mm[0], "bgsvg", 10, false );
						var w = $(window).width();
						var h = $(window).height();
						if (w / 16 * 9 > h) {
							h = parseInt(w / 16 * 9) * 1.05;
							w = w * 1.05;
						} else {
							w = parseInt(h / 9 * 16) * 1.05;
							h = h * 1.05;
						}
						$("#bgsvg").width(w).height(h);
						$("#bgsvg").css({
							"left" : "50%",
							"top" : "50%",
							"margin-left" : "-" + ((parseInt(w / 2)) + "px"),
							"margin-top" : ("-" + (parseInt(h / 2)) + "px")
						});
						$("#bgsvg").velocity({opacity:[1,0.3]},300);
					 };
				}
							
		} else {
					$("#bgimg").attr("src",image);
					$("#bgimg").velocity({opacity:[1,0.3]},300);
		}
	}
	
	function defineColor(img){
			var vb = new Vibrant(img,64,6);
			var swatches = vb.swatches();
			var ss=swatches['Vibrant'];
			if(ss==null||typeof(ss) == "undefined"){
				ss=swatches['Muted'];
			}
			updateColorSet(ss.getRgb());
			//$(".currentColor").css("background-color",ss.getHex());
			userColor=ss.getRgb();
	}
	function getBestColor(){
		return $("#current_style").html();
	}
	//更新颜色，只接受rgb(x,x,x)或者rgba(x,x,x,x)或者数组。
	function updateColorSet(color){
		var argb=[];
		if( typeof color=="string"){
			argb = color.replace(/( |rgb|a|\(|\))/g,"").split(",");
			if(argb.length>3){
				argb=argb.splice(2);
			}
		}else if(color instanceof Array){
			if(argb.length>3){
				argb=argb.splice(2);
			}
			argb = color;
		}else{
			return false;
		}
		var sw = new Swatch(argb,1);
		
		var txtColor = sw.getTitleTextColor();
		var rgb=argb.toString();
		
		var dkhsl =Vibrant.rgbToHsl(Number(argb[0]),Number(argb[1]),Number(argb[2]));
		dkhsl[1]=dkhsl[1]*1.3;
		dkhsl[2]=dkhsl[2]*0.6;
		var dksw = new Swatch(Vibrant.hslToRgb(dkhsl[0],dkhsl[1],dkhsl[2]),1);
		var dkTxtColor =  dksw.getTitleTextColor();
		var dkRgb = dksw.getRgb().toString();
		setCookie("uc",rgb);
		var str = ".bestTextColor{color:"+txtColor+"!important;}.bestDarkTextColor{color:"+dkTxtColor+"!important;}.bestColor{color:rgb("+rgb+");}.bestDarkColor{color:rgb("+dkRgb+");}.bestBgColor{background-color:rgb("+rgb+");background-color:rgba("+rgb+",0.9);}.bestDarkBgColor,.focus{background-color:rgb("+dkRgb+");background-color:rgba("+dkRgb+",0.9);}.bestBgColorNA{background-color:rgb("+rgb+");}.bestDarkBgColorNA{background-color:rgb("+dkRgb+");}.bestBorder{border-color:rgb("+rgb+")}.bestDarkBorder{border-color:rgb("+dkRgb+")}";
		$("#current_style").html(str);
		try{
			if(window.frames[0].setBestColor)
				window.frames[0].setBestColor(str);
		}catch(e){
			console.log(e);
		}
	}


	
	

	function doStartAnimate(){
				adjust();
			
			
			$(".blurbg").velocity("fadeIn", 300,function(){
					$(".nav").show();
					$(".nav .line").eq(0).click();
					setTimeout(function(){$(".icon-message").click();},1500);
			});
		}
		function globalBindings(){
		
		$(window).resize(function() {
			clearTimeout(reSizeTimeout);
			reSizeTimeout = setTimeout(function(){adjust();}, 100);
		});
		
		
		$(".nav .more .ico").click(function(){
		
			if($(".nav").css("margin-top")=="0px"){
					$(".nav").velocity({"margin-top":$(".nav").css("top").substring(1)},300);
			}else{
				$(".nav").velocity({"margin-top":"0px"},300)
			}
		});
		$(".icon-menu,.icon-message").click(function() {
			if ($(".sidebar").width() == 60) {
				$(".sidebar-bg").show();
				$(".sidebar").velocity({
					width : 300
				}, {
					duration : 600,
					easing : "easeOutCirc"
				});
				$(".sidebar-bg,.normal").show();
				$(".min").hide();
			}
		});
		$(".app-home .content,#dock").children().disableSelection();
		
		$(".sidebar-bg").click(function() {
			
			$(".sidebar-bg,.normal").hide();
			$(".min").show();
			$(".sidebar").velocity({
				width : 60
				
			}, {
				duration : 600,
				easing : "easeOutCirc"
			});
		});

	//移动端支持，暂不考虑
	/**	$(".app-home")[0].addEventListener('touchstart', function(event) {
				cx = event.changedTouches[0].pageX;
		},false);

		$(".app-home")[0].addEventListener('touchend', function(event) {
				
	　　　　
				var touch = event.changedTouches[0];
				if(!animating){
				animating=true;
				if(cx-touch.pageX<- 50&&app_pad>0){
					var tmp = $(".app-home .content .pad-page").eq(app_pad);
					
					tmp.velocity({left:$(window).width()},{duration:1200},function(){
						tmp.children().not(".ui-sortable-helper,.ui-sortable-placeholder").hide();
					});
					tmp.prev().css({left:-$(window).width()}).velocity({left:0},{duration:1200}).children().show()
					$(".dots .dot").removeClass("focus").eq(--app_pad).addClass("focus");
					setTimeout(function(){animating=false;$(".app-home .content").sortable("refreshPositions");},1200);
										
				}else if(cx-touch.pageX>50&&app_pad<($(".app-home .content .pad-page").size()-1)){
					var tmp = $(".app-home .content .pad-page").eq(app_pad);
					
					tmp.velocity({left:-$(window).width()},{duration:1200},function(){
						tmp.children().not(".ui-sortable-helper,.ui-sortable-placeholder").hide();
					});

					tmp.next().css({left:$(window).width()}).velocity({left:0},{duration:1200}).children().show();
					$(".dots .dot").removeClass("focus").eq(++app_pad).addClass("focus");
					
					setTimeout(function(){animating=false;$(".app-home .content").sortable("refreshPositions");},1200);
				
				}else{
					animating=false;
				}
				cx=touch.pageX
				
			}
		}, false);    **/
		
		$("#dock").sortable({
			connectWith: ".app-home .content",
			receive:function(event,ui){
				$("#dock").children().css("float","none");
				
				var c = ui.item.children("img").clone();
				ui.item.after(c).remove();
								
				current_sort=new Array();
				$(".app-home .content").find(".app").each(function(index,obj){
					current_sort[index]= $(obj).children("img").attr("id");
				});
				initAppHomePad(current_sort);
				
			},
			cursor: "move",
			appendTo:$(".app-home .content"),
			dropOnEmpty:true,
			delay:50,
			over:function(){
				$(".ui-sortable-helper").css("opacity",1);
				$("#dock,.dock_bg").width($("#dock").width()+60);
				$("#dock").children().css("float","left");
				$(".ui-sortable-placeholder").css({width:58,height:48,"background-color":"rgba(255,255,255,0)",float:"none"});
				$(".ui-sortable-helper").find(".app-name").hide();
				
			},
			out:function(event,ui){
				$("#dock").children().css("float","none");
			},
			update:function(event,ui){
				cus_apps=new Array();
				$("#dock img").each(function(index,obj){
					cus_apps[index]= $(obj).attr("id");
				});
			
				initDock();
				//XXX:todo 更新用户排序的数据到服务器。
			}
			
			
		});

		$(".app-home .content").sortable({
			helper:"clone",
			items:".app", 
			connectWith: "#dock,.pad-page",
			receive:function(event,ui){
				var kk = $("<div class=\"app\"></div>").append(ui.item.clone()).append("<div class=\"app-name\">"+ui.item.attr("title")+"</div>");
				ui.item.after(kk).remove();
			
				initDock();
				$(".app_title").hide();
			},
			cursor: "move",
			appendTo:$(".app-home .content"),
			distance:50,
			dropOnEmpty:true,
			update:function(event,ui){
				current_sort=new Array();
				$(".app-home .content").find(".app").each(function(index,obj){
						current_sort[index]= $(obj).children("img").attr("id");
				});
				initAppHomePad(current_sort);
				//XXX:todo 更新用户排序的数据到服务器。
				
			},
			start:function(event,ui){
				$(".app-home .content .pad-page").find(".app").css("opacity",0.5);
			},
			stop:function(event,ui){
				$(".app-home .content .pad-page").find(".app").css("opacity",1);
			},
			over:function(event,ui){
				$(".ui-sortable-placeholder").css({"width":210,"height":170,background:"#fff",float:"left"})
				$(".ui-sortable-helper").find(".app-name").show();
						
			}
		});

		$('.app-home').mousemove(function(e){
			  var oEvent = e || event;
			  var oMenu = $('#dock')[0];
			  var aImg = oMenu.getElementsByTagName('img');
			  for(var i=0;i<aImg.length;i++){
				  
				  var imgX = aImg[i].offsetLeft +  oMenu.offsetLeft+ aImg[i].offsetWidth / 2;
				  var imgY = aImg[i].offsetTop + oMenu.offsetTop + aImg[i].offsetHeight / 2;
				  
				  var a = imgX - oEvent.clientX;
				  var b = imgY - oEvent.clientY;
				  
				  var c = Math.sqrt(a*a+b*b);
				  
				  var scale = 1 - c / 300;
				  
				  if(scale<0.6){
					  scale=0.6;
				  }
				  $(aImg[i]).css("width",Math.ceil(scal_rate * scale));
				  $(aImg[i]).css("height",Math.ceil(scal_rate * scale));
			  }
		});

		$(".app-home .search input").keyup(function(){
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(function(){
				var s = $(".app-home .search input").val();
				if(s==""||s==null){
				      if($(".app-home .content").find(".app").size()!=current_sort.length){
					app_pad=0;
					initAppHomePad(current_sort);

				      }
				    $(".app-home .content").sortable('enable');
				}else{
					var search_cache=[];
					var tmp_id = 0;
					for(var tmp=0;tmp<current_sort.length;tmp++){
						if(apps[current_sort[tmp]].appname.indexOf(s)>=0){
							search_cache[tmp_id++]=current_sort[tmp];
						}
					}
					app_pad=0;
					initAppHomePad(search_cache);
					
					$(".app-home .content").sortable('disable');
				}
				

			},100);
				
		});

		$(".app-home").on('mousewheel', function(event) {
			//console.log(app_pad+":"+event.deltaY+":"+animating+":"+$(".app-home .content .pad-page").size());
			if(!animating){
				animating=true;
				if(event.deltaY>0&&app_pad>0){
					var tmp = $(".app-home .content .pad-page").eq(app_pad);
					
					tmp.velocity({left:$(window).width()},{duration:1200},function(){
						tmp.children().not(".ui-sortable-helper,.ui-sortable-placeholder").hide();
					});
					tmp.prev().css({left:-$(window).width()}).velocity({left:0},{duration:1200}).children().show()
					$(".dots .dot").removeClass("focus").eq(--app_pad).addClass("focus");
					setTimeout(function(){animating=false;$(".app-home .content").sortable("refreshPositions");},1200);
										
				}else if(event.deltaY<0&&app_pad<($(".app-home .content .pad-page").size()-1)){
					var tmp = $(".app-home .content .pad-page").eq(app_pad);
					
					tmp.velocity({left:-$(window).width()},{duration:1200},function(){
						tmp.children().not(".ui-sortable-helper,.ui-sortable-placeholder").hide();
					});

					tmp.next().css({left:$(window).width()}).velocity({left:0},{duration:1200}).children().show();
					$(".dots .dot").removeClass("focus").eq(++app_pad).addClass("focus");
					
					setTimeout(function(){animating=false;$(".app-home .content").sortable("refreshPositions");},1200);
				
				}else{
					animating=false;
				}
				
				
			}
		});

		
		if(doWinJS){
			$(".app-home").delegate(".app","mousedown",function(){
				WinJS.UI.Animation.pointerDown(this);
			});

			$(".app-home").delegate(".app","mouseup",function(){
				WinJS.UI.Animation.pointerUp(this);
			});
			
			$(".beauty .select-color div").mousedown(function(){
				WinJS.UI.Animation.pointerDown(this);
			}).mouseup(function(){
				WinJS.UI.Animation.pointerUp(this);
			});
			
			$(".nav .line,.sidebar .normal .quick .btn").mousedown(function(){
					WinJS.UI.Animation.pointerDown(this);
				}).mouseup(function(){
					WinJS.UI.Animation.pointerUp(this);
			});
		}
		
		$(".beauty .select-color").delegate("div","click",function(){
			//TODO: 更新用户选择的颜色。
			updateColorSet($(this).css("background-color"));
		});
		
		$(".beauty .image_select div img").click(function(){
			//$(".beauty .main .image img").attr("src",$(this).attr("src"));
			//TODO: 更新用户选择的颜色和图片
			
				loadBackground($(this).attr("src"));
				defineColor($(".beauty .main .image img")[0]);
		});
		
		/**$("#file-upload").fileupload({
			dataType: 'json',
			done: function (e, data) {
				if(data.result.resp=="SUCCESS"){
					var ss = $(".beauty .user_upload img").attr("src");
					$(".beauty .user_upload img,.beauty .main .image img").attr("src",ss+"1");
				}else{
					alert("上传失败");
				}
				$("#file-upload").removeAttr("disabled");
				$(".beauty .main .btn").text("浏览");
			},
			start : function(e){
				$("#file-upload").attr("disabled","disabled");
				$(".beauty .main .btn").text("更新中");
			},
			progressall: function (e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				$(".beauty .main .btn").text("更新("+progress+"%)");
			}
		});**/
	
	}

	function initDock(){
		$("#dock").html("");
		for(var i=0;i<cus_apps.length;i++){
			var ap = apps[cus_apps[i]];
			if(ap){
			    $("#dock").append("<img title=\""+ap.appname+"\" src=\""+ap.logo+"\" id=\""+ap.appid+"\" />");
			}
		}
		var ww = $('#dock').children().size()*61+70;
		var w = $(window).width();
		if(ww>w){
			ww=w;
			$('#dock,.dock_bg').css({"margin-left":-(ww)/2-1});
			scal_rate = ((w-70)/$('#dock').children().size()-10)/0.6;
		}else{
			scal_rate=84;
			$('#dock,.dock_bg').css({"margin-left":-(ww)/2});
		}
		$(".dock_bg,#dock").width(ww);
		
		$("#dock img").css({width:scal_rate*0.6,height:scal_rate*0.6,"margin-top":(60-scal_rate*0.6)/2});
		$("#dock img").unbind("hover").hover(
			function(){
				var posLeft= $(this).offset().left;
				var icon = $(this).attr("title");
				$('.app_title').css({"left":posLeft+$(this).width()/2,"bottom":100,"margin-left":-$('.app_title').width()/2}).html(icon).show();},
			function(){$('.app_title').hide();}
		);
			$("#dock").sortable("refresh");

	}

	function adjust() {
		var w = $(window).width();
		var h = $(window).height();
		if($("#main_frame").attr("max")=="0"){
			$("#main_frame").width(w-Number($("#main_frame").css("left").replace("px",""))-60);
		}else{
			$("#main_frame").width(w-Number($("#main_frame").css("left").replace("px","")));
		}
		
		if (w / 16 * 9 > h) {
			h = parseInt(w / 16 * 9) * 1.05;
			w = w * 1.05;
		} else {
			w = parseInt(h / 9 * 16) * 1.05;
			h = h * 1.05;
		}
		$("#bgsvg,#bgimg").width(w).height(h);
		$("#bgimg,#bgsvg").css({
			"left" : "50%",
			"top" : "50%",
			"margin-left" : "-" + ((parseInt(w / 2)) + "px"),
			"margin-top" : ("-" + (parseInt(h / 2)) + "px")
		});
		if (navigator.userAgent.indexOf("MSIE 9") > 0
				|| navigator.userAgent.indexOf("MSIE 8") > 0) {
			$("#bgimg").css("margin-left", "-" + (parseInt(w / 2) + 10) + "px")
					.css("margin-top", "-" + (parseInt(h / 2) + 10) + "px");
		}
		$(".frame-window iframe").css({width:$(".frame-window").width(),height:$(".frame-window").height()-35});
		initDock();
		if($(".app-home").css("display")=="block"){
			initAppHomePad(current_sort);
			
		}
	}


	function openAppHome(){

		$(".sidebar,.nav,#main_frame").hide();
		initAppHomePad(current_sort);
		$(".app-home").show();
		if(doWinJS){
			WinJS.UI.Animation.continuumForwardIn($(".app-home .content")[0],null);
		}
	
	}
	function closeAppHome(){
		if(doWinJS){
			WinJS.UI.Animation.continuumBackwardOut($(".app-home .content")[0],null).done(function(){
				$(".app-home").hide();
				$(".sidebar,.nav,#main_frame").velocity("fadeIn",300);
			});
		}else{
			$(".app-home").hide();
			$(".sidebar,.nav,#main_frame").velocity("fadeIn",300);
		}
		
	}
	

	

	function initAppHomePad(sorts){
		var w = $(".app-home").width();
		var h = $(".app-home").height()-200;
		var cols = (parseInt(w/210)-1);
		cols=cols>7?7:cols;
		var lines = (parseInt(h/170));

		$(".app-home .content").velocity({width:cols*210+"px","margin-left":((w-cols*210)/2)+"px",height:lines*170+"px"},100);
		
		var html="";
		$(".dots").html("");
		for(var ks = 0;ks<sorts.length;ks++){
			var its = apps[Number(sorts[ks])];
			
			if(ks==0||ks%(cols*lines)==0){
				html+="<div class=\"pad-page\">"
				$(".dots").append("<div class=\"dot\"></div>");
			}
			html+="<div class=\"app\"><img id=\""+its.appid+"\" title=\""+its.appname+"\" src=\""+its.logo+"\"/><div class=\"app-name\">"+its.appname+"</div></div>";
			
			if(ks%(cols*lines)==cols*lines-1||ks==sorts.length-1){
				html+="</div>"
			}
		}
		app_pad=app_pad>=$(".dots .dot").size()?$(".dots .dot").size()-1:app_pad;
		$(".app-home .content").html(html);
		$(".dots .dot").eq(app_pad).addClass("focus");
		$(".app-home .content .pad-page").css("left",w+"px").children().hide();
		$(".app-home .content .pad-page").eq(app_pad).css("left",0).children().show();
		$(".app-home .content .pad-page .app").click(function(){
			openApp(Number($(this).children("img").attr("id")),null);
		});
		$(".app-home .content").sortable("refresh");
		
		
	}

	function openApp(appid,params){
	
		initAppFrame(appid);
		doOpenAnimate(appid,params);
	}
	
	
	function initAppFrame(appid){
		var s = templ.replace("{{:appname}}",apps[appid].appname).replace("{{:logo}}",apps[appid].logo);
		$("body").append(s);
		$(".frame-window iframe").css({width:$(".frame-window").width(),height:$(".frame-window").height()-35})
		//$(".frame-window iframe").load(function() { 
			
				//if($(this).attr("src")!=""){
					setTimeout(function(){
						$(".frame-window iframe").show();
					},500);
				//}
		//	}); 
	}
	
	function appClose(){
		$(".frame-window iframe").hide().empty().remove();
		$(".frame-window .frame-title").hide();
		if(doWinJS){
			setTimeout(function(){
				WinJS.UI.Animation.turnstileBackwardOut($(".frame-window")[0], null).done(function(){
					$(".frame-window").remove();
					setTimeout(function(){
						$(".nav,#main_frame,.sidebar").velocity("fadeIn",200);
					},150);
				});
			},200);
		}else{
			$(".frame-window").fadeOut(100,function(){$(".frame-window").remove();$(".nav,#main_frame,.sidebar").show();});
		}
	}
	function beautyOpen(){
		$(".currentColor").css("background-color","rgb("+userColor+")");
		$(".app-home,#main_frame").hide();
		$(".beauty-bg").show();
		if(doWinJS){
			$(".beauty").show();
			WinJS.UI.Animation.turnstileForwardIn($(".beauty")[0], null);
		}else{
			$(".beauty").velocity("fadeIn",200);
		}
	}
	function beautyClose(){
	$(".beauty-bg").hide();
		
		if(doWinJS){
			setTimeout(function(){
				
				WinJS.UI.Animation.turnstileBackwardOut($(".beauty")[0], null).done(function(){
					setTimeout(function(){
						$("#main_frame").velocity("fadeIn",200);
					},150);
					$(".beauty").hide();
				});
			},200);
		}else{
			$(".beauty").velocity("fadeOut",100,function(){$("#main_frame").show();});
		}
	}

	function doOpenAnimate(appid,params){
		$(".app-home,.nav,#main_frame,.sidebar").hide();
		if(doWinJS){
			WinJS.UI.Animation.turnstileForwardIn($(".frame-window")[0], null).done(
				function(){
					setTimeout(function(){
						if(params!=null){
							if(apps[appid].url.indexOf("?")!=-1){
								$(".frame-window iframe").attr("src",apps[appid].url+"&amp;__qt="+params);
							}else{
								$(".frame-window iframe").attr("src",apps[appid].url+"?__qt="+params);
							}
						}else{
							$(".frame-window iframe").attr("src",apps[appid].url); 
						}
						
					},300);
					$(".frame-window").children(".frame-title").show();
				}
			);
		}else{
			$(".frame-window").velocity("fadeIn",200,function(){
				setTimeout(function(){
					if(params!=null){
						if(apps[appid].url.indexOf("?")!=-1){
							$(".frame-window iframe").attr("src",apps[appid].url+"&amp;__qt="+params);
						}else{
							$(".frame-window iframe").attr("src",apps[appid].url+"?__qt="+params);
						}
					}else{
						$(".frame-window iframe").attr("src",apps[appid].url); 
					}
				},300);
				$(".frame-window").children(".frame-title").show();
			});
		}
	}
	function setTitle(tt){
		$(".frame-title span").html(tt);
	}
	function openPage(obj,pageUrl,state){
			$(".nav .line").removeClass("focus");
			$(obj).addClass("focus");
			clearTimeout(switchTimeout);
			var fr = $('#main_frame');
			var newPage = (pageUrl!=fr.attr('src')&&pageUrl!=null);
			$(".sidebar-bg").click();
			$('.nav').css("margin-top","0px");
			if(newPage){
					fr.attr("src","").hide()
			}
			if(state){
				if(	fr.attr("max")=="0"){
					fr.css({left:"0px",width:$(window).width()});
					$(".sidebar").hide();					
					$('.nav').css({"margin-left":("-"+$('.nav').css("left")),width:100});
					$('.nav').velocity({top:-480},300,function(){
							if(newPage){
									fr.attr('src',pageUrl);
									switchTimeout=setTimeout(function(){$('#main_frame').show();if(doWinJS)WinJS.UI.Animation.enterContent($('#main_frame')[0],{ top: "50px", left: "0px", rtlflip: true });},300);
									
							}
							fr.attr("max","1");
						});
				}else{
					if(newPage){
							
									fr.attr('src',pageUrl)
									switchTimeout=setTimeout(function(){$('#main_frame').show();if(doWinJS)WinJS.UI.Animation.enterContent($('#main_frame')[0],{ top: "50px", left: "0px", rtlflip: true });},300);
								}
				}
			}else{
						
					if(	fr.attr("max")=="1"){
						fr.css({left:"235px",width:$(window).width()-295});
						$(".sidebar").show();
						$('.nav').css({"margin-left":0,width:155});
						$('.nav').velocity({top:0},300,function(){
									if(newPage){
										fr.attr('src',pageUrl)
										switchTimeout=setTimeout(function(){$('#main_frame').show();if(doWinJS){WinJS.UI.Animation.continuumForwardIn($('#main_frame')[0],null)};},300);
										}
										fr.attr("max","0");
						});
					}else{
							if(newPage){
								fr.attr('src',pageUrl)
										switchTimeout=setTimeout(function(){
											$('#main_frame').show();
											if(doWinJS){WinJS.UI.Animation.continuumForwardIn($('#main_frame')[0],null)};
										},300);
								}
					}
			}
			
		}