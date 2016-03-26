var Character = function(name, pos){ //1 - hostPos -> 1 or 0 
	var character = new Object(this);
	var x = window.innerWidth/5;
	var diffx = x * 3;
	var startx = 0;
	if(x > 300){
		x = 300;
		diffx = 900;
		startx = window.innerWidth/2 - 450;
	}

	this.dir = pos;
	this.orginalPos = new Vector(x + diffx * pos + startx, window.innerHeight - 200);
	this.rec = new Rectangle(this.orginalPos.x - 40, this.orginalPos.y - 40, 80, 80);
	this.ammo = 6;
	this.standedUp = false;
	this.canShoot = true;
	this.stand = false;
	this.space = 0;
	this.name = name;

	this.update = function(){
		if(this.space == 1 && !this.standedUp){
			//move up
			this.standedUp = true;
		}
		if(this.standedUp){
			this.shoot();
		}

		if(this.space == 0 && !this.standedUp){
			this.canShoot = this.ammo > 0;
			this.stand = false;
			if(this.rec.h > 80){
				this.rec.y += 5;
				this.rec.h -= 5;
			}
			else {
				this.rec.y = this.orginalPos.y;
				this.rec.h = 80;
			}
		}
	}
	this.shoot = function(){
		if(this.rec.h < 160 && !this.stand){
			this.rec.y -= 10;
			this.rec.h += 10;
		}
		else {
			this.rec.y = this.orginalPos.y - 80;
			this.rec.h = 160;

			if(this.canShoot) {
				//positioning the bullet
				new Bullet(new Vector(this.rec.x - 20 + 120 * (1 - this.dir), this.rec.y + 20), (this.dir == 0 ? 1 : -1));
				this.canShoot = false;
				this.ammo--;
			}
			this.stand = true;
			this.standedUp = false;
		}
	}

	this.render = function(){
		this.rec.render('black');
		ctx.beginPath();
			ctx.font="20px Georgia";
			ctx.fillStyle = "#333";
			ctx.fillText(this.name, this.orginalPos.x - ctx.measureText(this.name).width/2, this.orginalPos.y + 120);
		ctx.closePath();
	}

	return character;
}