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
	})

}()