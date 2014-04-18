!function(){
	require.config({
        paths:{
            zrender:'./js/zrender' ,
			GeoMap:'./js/GeoMap' ,
			"zrender/tool/util":'./js/zrender' 
        }
    });
    var gm;
    var conf = { 
		container: 'operator'
	};
    require(['GeoMap'],function(GeoMap) {
		gm = GeoMap.init(conf);
		$.getJSON('./data/map/china.geo.json',function(mapData){
			gm.load(mapData);
			gm.render();
			gm.zr.on("click",function(e){
				// try{alert(e.target.id);}catch(e){}
			})
		})
	});
	/*手势事件*/
	(function(global) {
		var eventConfig = {
			// 'MoveStart': null,
			'Move': null,
			'MoveEnd': null,
			'SwipeLeft': null,
			'SwipeRight': null,
			'Scale': null,
			'ScaleEnd': null
		}
		var pow = function(num) {
			return Math.pow.call(Math, num, 2);
		}
		//得到两个手指点的直线长度
		var lineLength = function(touches) {
			var a = touches[0],
				b = touches[1];
			return Math.sqrt(pow(a.pageX - b.pageX) + pow(a.pageY - b.pageY));
		}
		var TouchEvent = function($obj,preventFn) {
			$obj.on('touchstart', function(eStart) {
				// 是否阻止默认行为交给外部逻辑
				preventFn && preventFn(eStart);
				// eStart.preventDefault();
				//防止事件重复绑定
				$obj.off('touchend');
				$obj.off('touchmove');
				var touches = eStart.originalEvent.touches;
				var len = touches.length;
				if (len == 2) {
					eStart.preventDefault();
					var startLineLen = lineLength(touches);
				} else if (len == 1) {
					var startTouchEvent = touches[0];
					var startX = startTouchEvent.pageX,
						startY = startTouchEvent.pageY;
				}
				var moveX, moveY;
				var scalecache;
				$obj.on('touchmove', function(eMove) {
					var moveTouchEvent = eMove.originalEvent.touches;
					// result.html('move'+moveTouchEvent.length);
					if (len == 2) {
						eMove.preventDefault();
						var moveLineLen = lineLength(moveTouchEvent);
						var scale = moveLineLen / startLineLen;
						scalecache = scale;
						// result.html(scale+'scale<br/>' + result.html());
						// return;
						$obj.trigger('Scale', {
							scale: scale
						});
					} else if (len == 1) {
						var eMove = moveTouchEvent[0];
						moveX = eMove.pageX;
						moveY = eMove.pageY;
						// result.html('Move'+(moveX - startX)+' '+(moveY - startY)+'<br/>'+result.html());
						$obj.trigger('Move', {
							xStep: moveX - startX,
							yStep: moveY - startY,
							oE: eMove
						});
					}
				});
				$obj.on('touchend', function() {
					if (scalecache) {
						$obj.trigger('ScaleEnd', {
							scale: scalecache
						});
						scalecache = null;
					}
					if(Math.abs(moveY - startY) < 50){
						var eventType = moveX - startX < 0 ? 'SwipeLeft' : 'SwipeRight';
						$obj.trigger(eventType);
					}
					
					if (!isNaN(moveX) && !isNaN(startX)) {
						// result.html((moveX - startX)+'<br/>'+result.html());
						$obj.trigger('MoveEnd', {
							xStep: moveX - startX,
							yStep: moveY - startY
						});
						moveX = moveY = null;
					}

					$obj.off('touchend');
					$obj.off('touchmove');
				});
				// result.html(len+'<br/>'+result.html());
			});
		}
		global.TouchEvent = TouchEvent;
	})(this);
	$(function(){
		var data_pinch = {
			origin: {
				x: 0,
				y: 0
			},
			middle: {
				x: 0,
				y: 0
			},
			move: {
				x: 0,
				y: 0,
				offset: null
			},
			size: {
				width: 0,
				height: 0
			}
		}
		var $operator = $("#operator");
		var $container = $('#container');
		$container.swipe({
			pinchStatus: function(e, phase, direction, distance , duration , fingerCount, pinchZoom){
				console.log([phase, direction, distance , duration , fingerCount, pinchZoom].join('__'));
				// var _p = $operator.position();
				// var _middle = data_pinch.middle;
				// var _origin = data_pinch.origin = {
				// 	x: _middle.x - _p.left,
				// 	y: _middle.y - _p.top
				// }
				// console.log('transform-origin:'+ _origin.x+' '+_origin.y);
				// $operator.css({
				// 	'transform-origin': _origin.x+'px '+_origin.y+'px'
				// });
				if(fingerCount == 2){// 缩放
					if(phase == 'end'){
						var _oldWidth = $operator.width(),
							_oldHeight = $operator.height(),
							_newWidth = _oldWidth * pinchZoom,
							_newHeight = _oldHeight * pinchZoom,
							_oldOffset = $operator.position(),
							_oldLeft = _oldOffset.left,
							_oldTop = _oldOffset.top,
							_origin = data_pinch.origin,
							_newLeft = _oldLeft + (_newWidth - _oldWidth) * _origin.x/_oldWidth,
							_newTop = _oldTop + (_newHeight - _oldHeight) * _origin.y/_oldHeight;
						$operator.css({
							transform: 'scale(1)',
							width: _newWidth,
							height: _newHeight,
							left: _newLeft,
							top: _newTop
						});
						gm && gm.resize();
					}else if(phase == 'move'){
						$operator.css({
							transform: 'scale('+pinchZoom+')'
						});
					}
				}
				else if(fingerCount == 1){// 移动
					var touchEvent = e.targetTouches[0];
					var _moveData = data_pinch.move;
					if(phase == 'start'){
						_moveData.x = touchEvent.pageX;
						_moveData.y = touchEvent.pageY;
						_moveData.offset = $operator.position();
					}else if(phase == 'move'){
						var _offset = _moveData.offset;
						var _newLeft = _offset.left + touchEvent.pageX - _moveData.x,
							_newTop = _offset.top + touchEvent.pageY - _moveData.y;
						var _width = data_pinch.size.width,
							_height = data_pinch.size.height;
						var _pWidth = data_pinch.middle.x * 2,
							_pHeight = data_pinch.middle.y * 2;
						// if(_newLeft + _width < _pWidth){
						// 	_newLeft = _pWidth - _width;
						// }else if(_newLeft > 0){
						// 	_newLeft = 0;
						// }

						// if(_newTop > 0){
						// 	_newTop = 0;
						// }else{
						// 	if(_height > _pHeight){
						// 		if(_newTop + _height < _pHeight){
						// 			_newTop = _pHeight - _height;
						// 		}
						// 	}else{
						// 		_newTop = _oldHeight;
						// 	}
						// }

						$operator.css({
							left:_newLeft,
							top: _newTop
						});
					}
				}				
			},
			pinchThreshold:0,
			triggerOnTouchEnd: true,
			triggerOnTouchLeave: true,
			fingers: 2
		});
		var $_parent = $operator.parent();
		data_pinch.middle = {
			x: $container.width() / 2,
			y: $container.height() / 2
		}
		data_pinch.size = {
			width: $operator.width(),
			height: $operator.height()
		}
		// $container.on('touchstart',function(e){
		// 	var _p = $operator.position();
		// 	var _middle = data_pinch.middle;
		// 	var _origin = data_pinch.origin = {
		// 		x: _middle.x - _p.left,
		// 		y: _middle.y - _p.top
		// 	}
		// 	$operator.css({
		// 		'transform-origin': _origin.x+' '+_origin.y
		// 	});

		// 	// var touchEvent = e.originalEvent.touches[0];
		// 	// console.log(e,touchEvent);
		// 	// var _moveData = data_pinch.move;
		// 	// _moveData.x = touchEvent.pageX;
		// 	// _moveData.y = touchEvent.pageY;
		// 	// _moveData.offset = $operator.position();
		// }).on('Scale',function(e,d){
		// 	$operator.css({
		// 		transform: 'scale('+d.scale+')'
		// 	});
		// }).on('ScaleEnd',function(e,d){
		// 	var pinchZoom = d.scale;
		// 	var _oldWidth = $operator.width(),
		// 		_oldHeight = $operator.height(),
		// 		_newWidth = _oldWidth * pinchZoom,
		// 		_newHeight = _oldHeight * pinchZoom,
		// 		_oldOffset = $operator.position(),
		// 		_oldLeft = _oldOffset.left,
		// 		_oldTop = _oldOffset.top,
		// 		_origin = data_pinch.origin,
		// 		_newLeft = _oldLeft + (_newWidth - _oldWidth) * _origin.x/_oldWidth,
		// 		_newTop = _oldTop + (_newHeight - _oldHeight) * _origin.y/_oldHeight;
		// 	$operator.css({
		// 		transform: 'scale(1)',
		// 		width: _newWidth,
		// 		height: _newHeight,
		// 		left: _newLeft,
		// 		top: _newTop
		// 	});
		// 	gm && gm.resize();
		// })
		// .on('Move',function(e,d){
		// 	var _moveData = data_pinch.move;
		// 	var _offset = _moveData.offset;
		// 	var _newLeft = _offset.left + d.xStep,
		// 		_newTop = _offset.top + d.yStep;
		// 	var _width = data_pinch.size.width,
		// 		_height = data_pinch.size.height;
		// 	var _pWidth = data_pinch.middle.x * 2,
		// 		_pHeight = data_pinch.middle.y * 2;
		// 	if(_newLeft + _width < _pWidth){
		// 		_newLeft = _pWidth - _width;
		// 	}else if(_newLeft > 0){
		// 		_newLeft = 0;
		// 	}

		// 	if(_newTop > 0){
		// 		_newTop = 0;
		// 	}else{
		// 		if(_height > _pHeight){
		// 			if(_newTop + _height < _pHeight){
		// 				_newTop = _pHeight - _height;
		// 			}
		// 		}else{
		// 			_newTop = 0;
		// 		}
		// 	}

		// 	$operator.css({
		// 		left:_newLeft,
		// 		top: _newTop
		// 	});
		// });
		// TouchEvent($container);


		// ;(function(){
		// 	$.touchyOptions.useDelegation = true;
		// 	$container.on('touchy-pinch', function(event, phase, $target, data){
		// 		var pinchZoom = data.scale;
		// 		if(phase == 'end'){
		// 			var _oldWidth = $operator.width(),
		// 				_oldHeight = $operator.height(),
		// 				_newWidth = _oldWidth * pinchZoom,
		// 				_newHeight = _oldHeight * pinchZoom,
		// 				_oldOffset = $operator.position(),
		// 				_oldLeft = _oldOffset.left,
		// 				_oldTop = _oldOffset.top,
		// 				_origin = data_pinch.origin,
		// 				_newLeft = _oldLeft + (_newWidth - _oldWidth) * _origin.x/_oldWidth,
		// 				_newTop = _oldTop + (_newHeight - _oldHeight) * _origin.y/_oldHeight;
		// 			$operator.css({
		// 				transform: 'scale(1)',
		// 				width: _newWidth,
		// 				height: _newHeight,
		// 				left: _newLeft,
		// 				top: _newTop
		// 			});
		// 			gm && gm.resize();
		// 		}else if(phase == 'move'){
		// 			$operator.css({
		// 				transform: 'scale('+pinchZoom+')'
		// 			});
		// 		}else if(phase == 'start'){
		// 			var _p = $operator.position();
		// 			var _middle = data_pinch.middle;
		// 			var _origin = data_pinch.origin = {
		// 				x: _middle.x - _p.left,
		// 				y: _middle.y - _p.top
		// 			}
		// 			$operator.css({
		// 				'transform-origin': _origin.x+' '+_origin.y
		// 			});
		// 		}
		// 	}).on('touchy-drag',function(event, phase, $target, data){
		// 		var _moveData = data_pinch.move;
		// 		if(phase == 'start'){
		// 			var _firstPoint = data.startPoint
		// 			_moveData.x = _firstPoint.x;
		// 			_moveData.y = _firstPoint.y;
		// 			_moveData.offset = $operator.position();
		// 		}else if(phase == 'move'){
		// 			var _offset = _moveData.offset;
		// 			var _movePoint = data.movePoint;
		// 			var _newLeft = _offset.left + _movePoint.x - _moveData.x,
		// 				_newTop = _offset.top + _movePoint.y - _moveData.y;
		// 			var _width = data_pinch.size.width,
		// 				_height = data_pinch.size.height;
		// 			var _pWidth = data_pinch.middle.x * 2,
		// 				_pHeight = data_pinch.middle.y * 2;
		// 			if(_newLeft + _width < _pWidth){
		// 				_newLeft = _pWidth - _width;
		// 			}else if(_newLeft > 0){
		// 				_newLeft = 0;
		// 			}

		// 			if(_newTop > 0){
		// 				_newTop = 0;
		// 			}else{
		// 				if(_height > _pHeight){
		// 					if(_newTop + _height < _pHeight){
		// 						_newTop = _pHeight - _height;
		// 					}
		// 				}else{
		// 					_newTop = 0;
		// 				}
		// 			}

		// 			$operator.css({
		// 				left:_newLeft,
		// 				top: _newTop
		// 			});
		// 		}
		// 		console.log(phase, data);
		// 	});
		// })();
		// ;(function(){
		// 	$container.on('pinchopen',function(){
		// 		console.log(arguments);
		// 	});
		// })();
	})

}()