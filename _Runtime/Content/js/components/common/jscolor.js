define(function(){
	var jscolor = {
		images : {
			pad : [ 181, 101 ],
			sld : [ 16, 101 ],
			cross : [ 15, 15 ],
			arrow : [ 7, 11 ]
		},
		getElementPos : function(e,end) {
			end = end || function(node){
				return node.nodeName.toUpperCase() !== 'BODY';
			}
			var e1=e, e2=e;
			var x=0, y=0;
			if(e1.offsetParent) {
				do {
					x += e1.offsetLeft;
					y += e1.offsetTop;
					if(e1.className.indexOf("SectionGroup")!=-1)
						{
							x += 1;
							y += 1;
						}
				} while((e1 = e1.offsetParent) && end(e1));
			}
			while((e2 = e2.parentNode) && end(e2)) {
				x -= e2.scrollLeft;
				y -= e2.scrollTop;
			}
			return [x - 1, y];
		},
		getElementSize : function(e) {
			return [e.offsetWidth, e.offsetHeight];
		},
		getMousePos : function(e) {
			if(!e) { e = window.event; }
			if(typeof e.pageX === 'number') {
				return [e.pageX, e.pageY];
			} else if(typeof e.clientX === 'number') {
				return [
					e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
					e.clientY + document.body.scrollTop + document.documentElement.scrollTop
				];
			}
		},
		getViewPos : function(target) {
			if(typeof window.pageYOffset === 'number') {
				return [window.pageXOffset, window.pageYOffset];
			} else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
				return [document.body.scrollLeft, document.body.scrollTop];
			} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
				return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
			} else {
				return [0, 0];
			}
		},
		getViewSize : function() {
			if(typeof window.innerWidth === 'number') {
				return [window.innerWidth, window.innerHeight];
			} else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
				return [document.body.clientWidth, document.body.clientHeight];
			} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
				return [document.documentElement.clientWidth, document.documentElement.clientHeight];
			} else {
				return [0, 0];
			}
		},
		color : function(append , prop) {
			var that=this;
			this.append=append;
			this.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
			this.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1
			this.pickerMode = 'HSV'; // HSV | HVS
			this.pickerPosition = 'bottom'; // left | right | top | bottom
			this.pickerFace = 5; // px
			this.pickerFaceColor = 'white'//'ThreeDFace'; // CSS color
			this.pickerBorder = 1; // px
			//this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
			this.pickerBorderColor = '#c2c2c2'
			this.pickerInset = 1; // px
			this.pickerInsetColor = '#c2c2c2'//'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
			this.pickerZIndex = 10000;

			this.runtime={
				time:function(){},
				sure:function(){},
				close:function(){}
			}
			for(var p in prop) {
				if(prop.hasOwnProperty(p)) {
					this[p] = prop[p];
				}
			}
			this.bind=function(){
				$(document.body).off('click.jscolor')
					.on('click.jscolor',function(e){
						if($(e.target).closest('.colorpicker').length==0)
						{
							that.runtime.close();
							that.unbind();
						}
					});
			},
			this.unbind=function(){
				$(document.body).off('click.jscolor');
			};
			this.showPicker = function(target,time,sure,close) {
				this.runtime.time = time || this.runtime.time;
				this.runtime.sure = sure || this.runtime.sure;
				this.runtime.close = close || this.runtime.close;
				this.$container = $(target).closest(".mCSB_container");
				var tp = jscolor.getElementPos(target); // target pos
				var ts = jscolor.getElementSize(target); // target size
				var vp = jscolor.getElementPos(this.$container.get(0)); // view pos
				var vs = jscolor.getElementSize(this.$container.get(0)); // view size
				var ps = [ // picker size
					2*this.pickerBorder + 4*this.pickerInset + 2*this.pickerFace + jscolor.images.pad[0] + 2*jscolor.images.arrow[0] + jscolor.images.sld[0],
					2*this.pickerBorder + 2*this.pickerInset + 2*this.pickerFace + jscolor.images.pad[1]
				];
				this.scrolltemp={
					x:this.$container.css('left').replace('px','')*1,
					y:this.$container.css('top').replace('px','')*1
				};
				var a, b, c;
				switch(this.pickerPosition.toLowerCase()) {
					case 'left': a=1; b=0; c=-1; break;
					case 'right':a=1; b=0; c=1; break;
					case 'top':  a=0; b=1; c=-1; break;
					default:     a=0; b=1; c=1; break;
				}
				var l = (ts[b]+ps[b])/2;
				var pp = [ // picker pos
					-vp[a]+tp[a]+ps[a] > vs[a] ?
						(-vp[a]+tp[a]+ts[a]/2 > vs[a]/2 && tp[a]+ts[a]-ps[a] >= 0 ? tp[a]+ts[a]-ps[a] : tp[a]) :
						tp[a],
					-vp[b]+tp[b]+ts[b]+ps[b]-l+l*c > vs[b] ?
						(-vp[b]+tp[b]+ts[b]/2 > vs[b]/2 && tp[b]+ts[b]-l-l*c >= 0 ? tp[b]+ts[b]-l-l*c : tp[b]+ts[b]-l+l*c) :
						(tp[b]+ts[b]-l+l*c >= 0 ? tp[b]+ts[b]-l+l*c : tp[b]+ts[b]-l-l*c)
				];
				drawPicker(pp[a], pp[b]);
				this.bind();
			};
			this.importColor = function() {
				this.exportColor();
			};
			this.exportColor = function(flags) {
				var _color=""
				if(!(flags & leaveValue) && true) {
					_color = '#' + this.toString();
				}
				if(!(flags & leavePad)) {
					redrawPad();
				}
				if(!(flags & leaveSld)) {
					redrawSld();
				}
				this.runtime.time(_color);
				return _color;
			};
			this.fromHSV = function(h, s, v, flags) { // null = don't change
				h<0 && (h=0) || h>6 && (h=6);
				s<0 && (s=0) || s>1 && (s=1);
				v<0 && (v=0) || v>1 && (v=1);
				this.rgb = HSV_RGB(
					h===null ? this.hsv[0] : (this.hsv[0]=h),
					s===null ? this.hsv[1] : (this.hsv[1]=s),
					v===null ? this.hsv[2] : (this.hsv[2]=v)
				);
				this.exportColor(flags);
			};
			this.fromRGB = function(r, g, b, flags) { // null = don't change
				r<0 && (r=0) || r>1 && (r=1);
				g<0 && (g=0) || g>1 && (g=1);
				b<0 && (b=0) || b>1 && (b=1);
				var hsv = RGB_HSV(
					r===null ? this.rgb[0] : (this.rgb[0]=r),
					g===null ? this.rgb[1] : (this.rgb[1]=g),
					b===null ? this.rgb[2] : (this.rgb[2]=b)
				);
				if(hsv[0] !== null) {
					this.hsv[0] = hsv[0];
				}
				if(hsv[2] !== 0) {
					this.hsv[1] = hsv[1];
				}
				this.hsv[2] = hsv[2];
				//this.exportColor(flags);
			};
			this.fromString = function(hex, flags) {
				var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
				if(!m) {
					return false;
				} else {
					if(m[1].length === 6) { // 6-char notation
						this.fromRGB(
							parseInt(m[1].substr(0,2),16) / 255,
							parseInt(m[1].substr(2,2),16) / 255,
							parseInt(m[1].substr(4,2),16) / 255,
							flags
						);
					} else { // 3-char notation
						this.fromRGB(
							parseInt(m[1].charAt(0)+m[1].charAt(0),16) / 255,
							parseInt(m[1].charAt(1)+m[1].charAt(1),16) / 255,
							parseInt(m[1].charAt(2)+m[1].charAt(2),16) / 255,
							flags
						);
					}
					return true;
				}
			};
			this.toString = function() {
				return (
					(0x100 | Math.round(255*this.rgb[0])).toString(16).substr(1) +
					(0x100 | Math.round(255*this.rgb[1])).toString(16).substr(1) +
					(0x100 | Math.round(255*this.rgb[2])).toString(16).substr(1)
				);
			};
			function RGB_HSV(r, g, b) {
				var n = Math.min(Math.min(r,g),b);
				var v = Math.max(Math.max(r,g),b);
				var m = v - n;
				if(m === 0) { return [ null, 0, v ]; }
				var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
				return [ h===6?0:h, m/v, v ];
			}
			function HSV_RGB(h, s, v) {
				if(h === null) { return [ v, v, v ]; }
				var i = Math.floor(h);
				var f = i%2 ? h-i : 1-(h-i);
				var m = v * (1 - s);
				var n = v * (1 - s*f);
				switch(i) {
					case 6:
					case 0: return [v,n,m];
					case 1: return [n,v,m];
					case 2: return [m,v,n];
					case 3: return [m,n,v];
					case 4: return [n,m,v];
					case 5: return [v,m,n];
				}
			}
			function drawPicker(x, y) {
				if(!jscolor.picker) {
					jscolor.picker = {
						box : document.createElement('div'),
						boxB : document.createElement('div'),
						pad : document.createElement('div'),
						padB : document.createElement('div'),
						padM : document.createElement('div'),
						sld : document.createElement('div'),
						sldB : document.createElement('div'),
						sldM : document.createElement('div'),
						sure: document.createElement('button'),
						close: document.createElement('button'),
					};
					for(var i=0,segSize=4; i<jscolor.images.sld[1]; i+=segSize) {
						var seg = document.createElement('div');
						seg.style.height = segSize+'px';
						seg.style.fontSize = '1px';
						seg.style.lineHeight = '0';
						jscolor.picker.sld.appendChild(seg);
					}
					jscolor.picker.sldB.appendChild(jscolor.picker.sld);
					jscolor.picker.box.appendChild(jscolor.picker.sldB);
					jscolor.picker.box.appendChild(jscolor.picker.sldM);
					jscolor.picker.padB.appendChild(jscolor.picker.pad);
					jscolor.picker.box.appendChild(jscolor.picker.padB);
					jscolor.picker.box.appendChild(jscolor.picker.padM);
					jscolor.picker.boxB.appendChild(jscolor.picker.box);
					jscolor.picker.boxB.appendChild(jscolor.picker.close);
					jscolor.picker.boxB.appendChild(jscolor.picker.sure);
				}
				var p = jscolor.picker;
				// recompute controls positions
				posPad = [
					x  + THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset,
					y  + THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset ];
				posSld = [
					null,
					y + THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset ];
				// controls interaction
				p.box.onmouseup =
				//p.box.onmouseout = function() { };
				p.box.onmousedown = function() { abortBlur=true; };
				p.box.onmousemove = function(e) { holdPad && setPad(e); holdSld && setSld(e); };
				p.padM.onmouseup =
				p.padM.onmouseout = function() { if(holdPad) { holdPad=false; } };
				p.padM.onmousedown = function(e) { holdPad=true; setPad(e); };
				p.sldM.onmouseup =
				p.sldM.onmouseout = function() { if(holdSld) { holdSld=false; } };
				p.sldM.onmousedown = function(e) { holdSld=true; setSld(e); };
				// picker
				p.box.style.width = 4*THIS.pickerInset + 2*THIS.pickerFace + jscolor.images.pad[0] + 2*jscolor.images.arrow[0] + jscolor.images.sld[0] + 'px';
				p.box.style.height = 2*THIS.pickerInset + 2*THIS.pickerFace + jscolor.images.pad[1] + 'px';

				// picker border
				p.boxB.style.position = 'absolute';
				p.boxB.style.clear = 'both';
				p.boxB.style.left = 0+'px';
				p.boxB.style.top = 0+'px';
				p.boxB.style.zIndex = THIS.pickerZIndex;
				p.boxB.style.border = THIS.pickerBorder+'px solid';
				p.boxB.style.borderColor = THIS.pickerBorderColor;
				p.boxB.style.background = THIS.pickerFaceColor;
				p.boxB.className="colorpicker";
				// pad image
				p.pad.style.width = jscolor.images.pad[0]+'px';
				p.pad.style.height = jscolor.images.pad[1]+'px';
				// pad border
				p.padB.style.position = 'absolute';
				p.padB.style.left = THIS.pickerFace+'px';
				p.padB.style.top = THIS.pickerFace+'px';
				p.padB.style.border = THIS.pickerInset+'px solid';
				p.padB.style.borderColor = THIS.pickerInsetColor;
				// pad mouse area
				p.padM.style.position = 'absolute';
				p.padM.style.left = '0';
				p.padM.style.top = '0';
				p.padM.style.width = THIS.pickerFace + 2*THIS.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + 'px';
				p.padM.style.height = p.box.style.height;
				p.padM.style.cursor = 'debfault';
				// slider image
				p.sld.style.overflow = 'hidden';
				p.sld.style.width = jscolor.images.sld[0]+'px';
				p.sld.style.height = jscolor.images.sld[1]+'px';
				// slider border
				p.sldB.style.position = 'absolute';
				p.sldB.style.right = THIS.pickerFace+'px';
				p.sldB.style.top = THIS.pickerFace+'px';
				p.sldB.style.border = THIS.pickerInset+'px solid';
				p.sldB.style.borderColor = THIS.pickerInsetColor;
				// slider mouse area
				p.sldM.style.position = 'absolute';
				p.sldM.style.right = '0';
				p.sldM.style.top = '0';
				p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + THIS.pickerFace + 2*THIS.pickerInset + 'px';
				p.sldM.style.height = p.box.style.height;
				p.sldM.style.cursor = "debfault";
				//button
				p.sure.innerHTML="确认";
				p.sure.className="button smaller g empty no-radius";
				p.sure.style.marginRight = THIS.pickerFace + 'px';
				p.sure.style.marginBottom = THIS.pickerFace + 'px';
				p.sure.onclick = function(e){
					e = e || event;
					e.stopPropagation();
					THIS.runtime.close();
					THIS.runtime.sure(THIS.exportColor());
					THIS.unbind();
				}

				p.close.innerHTML="关闭";
				p.close.className="button smaller r empty no-radius";
				p.close.style.marginRight = THIS.pickerFace + 'px';
				p.close.style.marginBottom = THIS.pickerFace + 'px';
				p.close.onclick = function(e){
					e = e || event;
					e.stopPropagation();
					THIS.runtime.close();
					THIS.unbind();
				}


				// load images in optimal order
				switch(modeID) {
					case 0: var padImg = 'hs.png'; break;
					case 1: var padImg = 'hv.png'; break;
				}
				p.padM.className="cross"//.style.background = "url('/Content/style/images/JSColor/cross.gif') no-repeat";
				p.sldM.className="arrow";//.style.background = "url('/Content/style/images/JSColor/arrow.gif') no-repeat";
				p.pad.className="pad";
				// place pointers
				redrawPad();
				redrawSld();
				THIS.append.appendChild(p.boxB);
			}
			function redrawPad() {
				// redraw the pad pointer
				switch(modeID) {
					case 0: var yComponent = 1; break;
					case 1: var yComponent = 2; break;
				}
				var x = Math.round((THIS.hsv[0]/6) * (jscolor.images.pad[0]-1));
				var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.pad[1]-1));
				jscolor.picker.padM.style.backgroundPosition =
					(THIS.pickerFace+THIS.pickerInset+x - Math.floor(jscolor.images.cross[0]/2)) + 'px ' +
					(THIS.pickerFace+THIS.pickerInset+y - Math.floor(jscolor.images.cross[1]/2)) + 'px';
				// redraw the slider image
				var seg = jscolor.picker.sld.childNodes;
				switch(modeID) {
					case 0:
						var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1);
						for(var i=0; i<seg.length; i+=1) {
							seg[i].style.backgroundColor = 'rgb('+
								(rgb[0]*(1-i/seg.length)*100)+'%,'+
								(rgb[1]*(1-i/seg.length)*100)+'%,'+
								(rgb[2]*(1-i/seg.length)*100)+'%)';
						}
						break;
					case 1:
						var rgb, s, c = [ THIS.hsv[2], 0, 0 ];
						var i = Math.floor(THIS.hsv[0]);
						var f = i%2 ? THIS.hsv[0]-i : 1-(THIS.hsv[0]-i);
						switch(i) {
							case 6:
							case 0: rgb=[0,1,2]; break;
							case 1: rgb=[1,0,2]; break;
							case 2: rgb=[2,0,1]; break;
							case 3: rgb=[2,1,0]; break;
							case 4: rgb=[1,2,0]; break;
							case 5: rgb=[0,2,1]; break;
						}
						for(var i=0; i<seg.length; i+=1) {
							s = 1 - 1/(seg.length-1)*i;
							c[1] = c[0] * (1 - s*f);
							c[2] = c[0] * (1 - s);
							seg[i].style.backgroundColor = 'rgb('+
								(c[rgb[0]]*100)+'%,'+
								(c[rgb[1]]*100)+'%,'+
								(c[rgb[2]]*100)+'%)';
						}
						break;
				}
			}
			function redrawSld() {
				// redraw the slider pointer
				switch(modeID) {
					case 0: var yComponent = 2; break;
					case 1: var yComponent = 1; break;
				}
				var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.sld[1]-1));
				jscolor.picker.sldM.style.backgroundPosition =
					'0 ' + (THIS.pickerFace+THIS.pickerInset + y - Math.floor(jscolor.images.arrow[1]/2)) + 'px';
			}
			function setPad(e) {
				var posM = jscolor.getMousePos(e);
				var x = posM[0]-posPad[0] - (THIS.$container.css('left').replace('px','')*1 - THIS.scrolltemp.x);
				var y = posM[1]-posPad[1] - (THIS.$container.css('top').replace('px','')*1 - THIS.scrolltemp.y);
				switch(modeID) {
					case 0: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), 1 - y/(jscolor.images.pad[1]-1), null, leaveSld); break;
					case 1: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), null, 1 - y/(jscolor.images.pad[1]-1), leaveSld); break;
				}
			}
			function setSld(e) {
				var posM = jscolor.getMousePos(e);
				var y = posM[1]-posPad[1]  - (THIS.$container.css('top').replace('px','')*1 - THIS.scrolltemp.y);
				switch(modeID) {
					case 0: THIS.fromHSV(null, null, 1 - y/(jscolor.images.sld[1]-1), leavePad); break;
					case 1: THIS.fromHSV(null, 1 - y/(jscolor.images.sld[1]-1), null, leavePad); break;
				}
			}
			var THIS = this;
			var modeID = this.pickerMode.toLowerCase()==='hvs' ? 1 : 0;
			var abortBlur = false;
			var
				holdPad = false,
				holdSld = false;
			var
				posPad,
				posSld;
			var
				leaveValue = 1<<0,
				leaveStyle = 1<<1,
				leavePad = 1<<2,
				leaveSld = 1<<3;
		}
	};

	return jscolor;
})