/***************************************************************
		GAME VARIABLES
***************************************************************/
var c, ctx, w, h, USERNAME, POS;
var player, enemy = null;

/***************************************************************
		GAME INIT
***************************************************************/
function connect(){
	hidePop();
	socket.emit('connectToGame', $('#username').val());
}
function init(){
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
	player = new Player(POS, USERNAME);
}

function update(){
	player.update();
	if(enemy != null) enemy.update();
}

function render(){
	ctx.clearRect(0, 0, w, h);
	player.render();
	if(enemy != null) enemy.render();
	renderBullets();
}

function gameLoop(){
	update();
	render();
	requestAnimationFrame(gameLoop);
}