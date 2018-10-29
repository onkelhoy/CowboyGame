var keys = {
	space: 0
};

var touchable = 'createTouch' in document,
	touches = [], // array of touch vectors
	firstTouch = -1;

function Events (c) {

	c.addEventListener( 'touchstart', onTouchStart, false );
	c.addEventListener( 'touchend', onTouchEnd, false );


	mouseAndKeyboardEvents();
}


function mouseAndKeyboardEvents () {
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
}
function onTouchStart(e) {
	if(keys.space === 0){
		keys.space = 1;
	}
}

function onTouchEnd(e) {
	if(keys.space === 1){
		keys.space = 0;
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
