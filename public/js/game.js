/***************************************************************
		GAME VARIABLES
***************************************************************/
var c, ctx, w, h, USERNAME;
var player;

/***************************************************************
		GAME INIT
***************************************************************/

function init(){
	hidePop();
	USERNAME = $('#username').val();
	socket.emit('connectToGame', USERNAME);
	c = document.getElementById("c");
	ctx = c.getContext("2d");
	resetCanvas();

	load();
	gameLoop();

	Events();
}
function resetCanvas (e) {
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;

	//make sure we scroll to the top left. 
	window.scrollTo(0,0); 
}


/***************************************************************
		GAME FUNCTIONS
***************************************************************/
function load(){
	player = new Player(new Vector(500, 500), USERNAME);
}

function update(){

}

function render(){
	ctx.clearRect(0, 0, w, h);
}

function gameLoop(){
	update();
	render();
	requestAnimationFrame(gameLoop);
}