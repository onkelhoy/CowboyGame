/***************************************************************
		GAME VARIABLES
***************************************************************/
var c, ctx, w, h, USERNAME, POS;
var player, enemy = null;
var countDown = "00:00",
	startCounter = false,
	renderGame = true,
	playerScore = 0, enemyScore = 0, rounds = 0,
	gameTime = null;

/***************************************************************
		GAME INIT
***************************************************************/
function connect(){
	hidePop();
	socket.emit('connectToGame', $('#username').val());
}
function resetGame(){
	renderGame = false;
	rounds++;
	if(rounds < 3){
		showStaticPopup(0);
		$('#right > p').text(player.name);
		$('#left > p').text(enemy.name);

		var end = new Date();
		end.setSeconds(end.getSeconds() + 6);

		var timer = setInterval(function(){

			var remain = getTimeRemaining(end);
			var s = remain.seconds,
				ms = remain.miliseconds;

			if(s <= 0 && ms <= 0){
				clearInterval(timer);
				hideStaticPopup();
				startGame(function(){
					renderGame = true;
					player.character.ammo = 6;
					enemy.character.ammo = 6;
				});
			}
			else {
				countDown = ((s+"").length < 2 ? "0"+s : s) +":"+ ((ms+"").length < 2 ? "0"+ms : ms); 
				$('#timeLeft').text(countDown);
			}
		}, 10);
	} else {
		alert("WE HAVE A WINNER!");
	}
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
function startGame(func){
	var end = new Date();
	end.setSeconds(end.getSeconds() + 3);
	$('#startCounter').show();
	var timer = setInterval(function(){
		var remain = getTimeRemaining(end);
		var s = remain.seconds,
			ms = remain.miliseconds;

		if(s <= 0 && ms <= 0){
			clearInterval(timer);
			$('#startCounter').hide();
			gameTime = new Date();
			gameTime.setSeconds(gameTime.getSeconds() + 60);
			func();
		}
		else {
			countDown = ((s+"").length < 2 ? "0"+s : s) +":"+ ((ms+"").length < 2 ? "0"+ms : ms); 
			$('#startCounter').text(countDown);
		}
	}, 10);
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
	if(renderGame){
		var remain = getTimeRemaining(gameTime);
		if((remain.minutes == 0 && remain.seconds == 0) ||
			(player.character.ammo == 0 && enemy.character.ammo == 0 && Bullets.length == 0)){
			resetGame();
		}
		update();
		render();
	}
	requestAnimationFrame(gameLoop);
}