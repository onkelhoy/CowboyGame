var keys = {
	space: 0
};

var touchable = 'createTouch' in document,
	touches = [], // array of touch vectors
	firstTouch = -1;
	
function Events () {

	c.addEventListener( 'touchstart', onTouchStart, false );
	c.addEventListener( 'touchend', onTouchEnd, false );
	window.onorientationchange = resetCanvas;  
	window.onresize = resetCanvas;  

	mouseAndKeyboardEvents();

	if(touchable){
		//tab to shoot
	}
	else {
		//press space to shoot
	}
}


function mouseAndKeyboardEvents () {
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
}
function onTouchStart(e) {
 
	if(firstTouch<0) {
		var touch =e.changedTouches[0]; 
		
		firstTouch = touch.identifier; 
		if(keys.space == 0){
			keys.space = 1;
		}
	}
	touches = e.touches; 
}
 
function onTouchEnd(e) { 
   
   	touches = e.touches; 
   	if(firstTouch >-1){
		for(var i = 0; i<e.changedTouches.length; i++){
			var touch =e.changedTouches[i]; 
			if(firstTouch == touch.identifier)
			{
				firstTouch = -1; 
				if(keys.space == 1){
					keys.space = 0;
				}
				break; 		
			}		
		}
	}
}

function keyDown (key) {
	var k = key.keyCode;
	if(k == 32){
		keys.space = 1;
	}
}
function keyUp (key) {
	var k = key.keyCode;
	if(k == 32){
		keys.space = 0;
	}
}
