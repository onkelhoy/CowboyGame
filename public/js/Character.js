var Character = function(pos){ //1 - hostPos -> 1 or 0 
	var character = new Object(this);
	var x = window.innerWidth/5;
	var diffx = x * 3;
	if(x > 200){
		x = 200;
		diffx = 600;
	}

	this.orginalPos = new Vector(x + diffx * pos, window.innerHeight - 100);
	this.rec = new Rectangle(this.orginalPos.x - 40, this.orginalPos.y - 40, 80, 80);
	this.ammo = 6;
	this.standedUp = false;
	this.canShoot = true;
	this.stand = false;
	this.space = 0;

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
				console.log('PANG');
				this.canShoot = false;
				this.ammo--;
			}
			this.stand = true;
			this.standedUp = false;
		}
	}

	this.render = function(){
		this.rec.render('black');
	}

	return character;
}