var Character = function(pos){
	var character = new Object(this);
	this.orginalPos = pos.clone();
	this.rec = new Rectangle(pos.x - 40, pos.y - 40, 80, 80);
	this.ammo = 6;
	this.standedUp = false;

	this.update = function(){
		if(keys.space == 1){
			//move up
			this.shoot();
		}


		if(this.standedUp && keys.space == 0){
			this.standedUp = false;
			if(this.rec.h > 80){
				this.rec.y += 4;
				this.rec.h -= 4;
			}
			else {
				this.rec.y = this.orginalPos.y;
				this.rec.h = 80;
			}
		}
	}
	this.shoot = function(){
		if(this.rec.h != 160 && !this.standedUp){
			this.rec.y -= 5;
			this.rec.h += 5;
		}
		else {
			this.standedUp = true;
		}
	}

	this.render = function(){
		this.rec.render('black');
	}

	return character;
}