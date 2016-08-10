define(function(){
	return {
		init:function(){
			//初始化页面内容
			//返回值true/false决定是否执行util.js下的_init_方法
			var $window = $(window);

			$window.resize(bumper.proxy(function(){
				loader.load($window.width());
			}, this));

			function ImageLoader( width ){

				this.leftnumber = 0;
				this.rightnumber = 0;
				this.pool = [];
				this.lastIsEmpty = false;

				this.initpool = function(){
					this.pool = []
					for(var i = 1 ; i < 22 ; i ++ )
						this.pool.push(i);
				}
				this.setNumber = function(w){
					if(w <= 1000)
					{
						this.rightnumber = this.leftnumber =Math.ceil( (w / 2 - 244) / 145 );
					}
					else
					{
						this.leftnumber = Math.ceil( w / 2 / 145 );
						this.rightnumber = Math.ceil( (w / 2 - 488) / 145 );
					}
				}
				this.getfrompool = function(even, i){
					var ret = 0;

					if(this.pool.length == 0)
						this.initpool();
					if(this.lastIsEmpty || Math.random() > 0.5 || (even ? i % 2 ===0 : i % 2 !== 0))
					{
						this.lastIsEmpty = false;
						ret = this.pool.splice(Math.floor(Math.random()*this.pool.length), 1)[0]
					}
					else
						this.lastIsEmpty = true
					return ret;
				}
				this.validateload = function(w){
					var l,r
					if(w <= 1000)
					{
						l = r =Math.ceil( (w / 2 - 244) / 145 );
					}
					else
					{
						l = Math.ceil( w / 2 / 145 );
						r = Math.ceil( (w / 2 - 488) / 145 );
					}
					return l <= this.leftnumber && r <= this.rightnumber;
				}
				this.load = function( _w_ ){
					if(this.validateload(_w_)) return;
					if( _w_ !== undefined )
						this.setNumber( _w_ );
					var fragment = document.createDocumentFragment()
					var left = document.createElement('div');
					var right = document.createElement('div');
					left.className="image-container-left";
					right.className="image-container-right";
					fragment.appendChild(left);
					fragment.appendChild(right);
					for(var i = 0 ; i < 6; i ++)
					{
						var isRight = (i >= 3);
						var line = document.createElement('div');
						line.className = "line";
						for(var j = ( (isRight ? this.rightnumber : this.leftnumber ) - 1 ) ; j >= 0 ; j --)
						{
							var div = document.createElement('div')
							div.className = 'img-' + this.getfrompool( i % 2 === 0, j);
							line.appendChild(div);
						}
						if ( isRight ) right.appendChild(line);else left.appendChild(line);
					}

					$(".login-images").empty().append(fragment).hide().fadeIn()
				}

				this.setNumber(width);
			}

			var loader = new ImageLoader( $window.width() );

			loader.load();
		}
	}
})

