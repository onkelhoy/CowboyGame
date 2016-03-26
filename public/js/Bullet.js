var Bullets = [];
var Bullet = function(pos, dir){
	var bullet = new Object(this);
	this.pos = pos.clone();
	this.dead = false;
	this.dir = dir;
	this.line = new Line(this.pos, this.pos);

	this.update = function(){
		var before = this.pos.clone();
		this.pos.x += 120 * this.dir;
		this.line.update(before, this.pos);

		if(this.pos.x > window.innerWidth + 300 || this.pos.x < -300){
			this.dead = true;
		}
	}
	this.render = function(){
		this.line.render(ctx);
	}
	Bullets.push(bullet);
}

function renderBullets(){
	for(var i = 0; i < Bullets.length; i++){
		Bullets[i].update();
		Bullets[i].render();
		if(enemy != null){
			bulletCol(Bullets[i].line);
		}
		if(Bullets[i].dead){
			Bullets.splice(i, 1);
		}
	}
}

function bulletCol(line){
	var prec = player.character.rec,
		erec = player.character.rec,
		p, e;
	if(player.pos == 1){//player right
		p = getState(false, line, prec);
		e = getState(true, line, erec);
	}
	else { //player left
		p = getState(true, line, prec);
		e = getState(false, line, erec);
	}


	if(p){
		socket.emit('enemyWin');
		$('#winner').text(enemy.name);
		resetGame();
	}
	if(e){
		socket.emit('playerWin');
		$('#winner').text(player.name);
		resetGame();
	}
}
function getState(left, line, rec){
	if(left){
		return line.v1.x <= rec.x + rec.w && line.v2.x >= rec.x && line.v1.y >= rec.y
	} else {
		return line.v1.x >= rec.x && line.v2.x <= rec.x + rec.w && line.v1.y >= rec.y;
	}
}
