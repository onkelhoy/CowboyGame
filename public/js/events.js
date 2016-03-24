var keys = {
	space: 0
};

var touchable = 'createTouch' in document,
	touches = [], // array of touch vectors
	firstTouch = null;
	
function Events () {

	c.addEventListener( 'touchstart', onTouchStart, false );
	c.addEventListener( 'touchend', onTouchEnd, false );
	window.onorientationchange = resetCanvas;  
	window.onresize = resetCanvas;  

	mouseAndKeyboardEvents();

	
	window.onorientationchange = resetCanvas;  
	window.onresize = resetCanvas;

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
 
	if(keys.space == 0){
		keys.space == 1;
		//add to first touch
	}
	touches = e.touches; 
}

 
function onTouchEnd(e) { 
   
   	touches = e.touches; 
	//if first touch id then keys.space = 0
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