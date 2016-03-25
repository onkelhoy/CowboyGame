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
		if(Bullets[i].dead){
			Bullets.splice(i, 1);
		}
	}
}