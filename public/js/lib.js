var Vector = function(x, y){
	var vector = new Object(this);
	vector.x = x;
	vector.y = y;

	vector.addTo = function(v2){
		vector.x += v2.x;
		vector.y += v2.y;
	};
	vector.reset = function(x, y){
		vector.x = x;
		vector.y = y;
	};
	vector.subtractFrom = function(v2){
		vector.x -= v2.x;
		vector.y -= v2.y;
	};
	vector.subract = function(v2){
		return new Vector(vector.x - v2.x, vector.y - v2.y);
	};
	vector.add = function(v2){
		return new Vector(vector.x + v2.x, vector.y + v2.y);
	};
	vector.getAngle = function(){
		return Math.atan2(vector.y, vector.x);
	};
	vector.getAngle2 = function(v2){ //USES LINE
		return new Line(vector, v2).getAngle();
	};
	vector.getLength = function(){
		return Math.sqrt(vector.x * vector.x, vector.y * vector.y);
	};
	vector.setAngle = function(angle){
		var l = vector.getLength();
		vector.x = Math.cos(angle) * l;
		vector.y = Math.sin(angle) * l;
	};
	vector.addAngle = function(angle){
		vector.setAngle(vector.getAngle() + angle);
	};
	vector.setLength = function(length){
		var angle = vector.getAngle();
		vector.x = Math.cos(angle) * length;
		vector.y = Math.sin(angle) * length;
	};
	vector.multiplicate = function(term){
		vector.x *= term;
		vector.y *= term;
	};
	vector.multi = function(term){
		return new Vector(vector.x * term, vector.y * term);
	};
	vector.getMiddle = function(v2){
		return new Vector((vector.x + v2.x) / 2, (vector.y + v2.y) / 2);
	};
	vector.distance = function(v2){
		var dx = v2.x - vector.x,
			dy = v2.y - vector.y;
		return Math.sqrt(dx * dx + dy * dy);
	};
	vector.clone = function(){
		return new Vector(vector.x, vector.y);
	};
	return vector;
};

var Line = function(v1, v2){
	var line = new Object(this);
	line.v1 = new Vector(v1.x, v1.y);
	line.v2 = new Vector(v2.x, v2.y);

	line.getLength = function(){
		var dx = line.v1.x - line.v2.x,
			dy = line.v1.y - line.v2.y;
		return Math.sqrt(dx * dx + dy * dy);
	};
	line.setLength = function(length){
		var angle = line.getAngle();
		line.v2 = new Vector(Math.cos(angle), Math.sin(angle));
		line.v2.multiplicate(length);
		line.v2.addTo(new Vector(line.v1.x, line.v1.y));
	};
	line.getCenter = function(){
		return new Vector((line.v1.x + line.v2.x)/2, (line.v1.y + line.v2.y)/2);
	};
	line.getAngle = function(){
		var dx = line.v2.x - line.v1.x,
			dy = line.v2.y - line.v1.y;
		return Math.atan2(dy, dx);
	};
	line.intersect = function(l2){
		if(isLineIntersecting(line.v1, line.v2, l2.v1, l2.v2)){
			return lineIntersect(line, l2);
		}
		return null;
	};
	line.setAngle = function(angle){
		angle *= -1;
		var length = line.getLength();
		line.v2 = new Vector(Math.cos(angle), Math.sin(angle));
		line.v2.multiplicate(length);
		line.v2.addTo(new Vector(line.v1.x, line.v1.y));
	};
	line.render = function(context){
		context.beginPath();
			context.moveTo(line.v1.x, line.v1.y);
			context.lineTo(line.v2.x, line.v2.y);
			context.strokeStyle = "blue";
			context.lineWidth = 5;
			context.stroke();
		context.closePath();
	};
	return line;
};

var Rectangle = function(x, y, w, h){
	var rec = new Object(this);
	rec.x = x;
	rec.y = y;
	rec.w = w;
	rec.h = h;


	rec.set = function(){
		rec.top = rec.y;
		rec.right = rec.x + rec.w;
		rec.bottom = rec.y + rec.h;
		rec.left = rec.x;
	}
	rec.set();

	rec.update = function(x, y){
		rec.x = x;
		rec.y = y;
		rec.set();
	}
	rec.getTop = function(margin){
		return new Rectangle(rec.x + margin, rec.y, rec.w - 2 * margin, 2 * margin);
	}
	rec.getBottom = function(margin){
		return new Rectangle(rec.x + margin, rec.y + rec.h - 2 * margin, rec.w - 2 * margin, 2 * margin);
	}
	rec.getLeft = function(margin){
		return new Rectangle(rec.x - margin, rec.y + 3 * margin, 2 * margin, rec.h - 6 * margin);
	}
	rec.getRight = function(margin){
		return new Rectangle(rec.x - margin + rec.w, rec.y + 3 * margin, 2 * margin, rec.h - 6 * margin);
	}
	rec.topLine = function(){ return new Line(new Vector(rec.x, rec.y), new Vector(rec.x + rec.w, rec.y)); }
	rec.leftLine = function(){ return new Line(new Vector(rec.x, rec.y), new Vector(rec.x, rec.y + rec.h)); }
	rec.rightLine = function(){ return new Line(new Vector(rec.x + rec.w, rec.y), new Vector(rec.x + rec.w, rec.y + rec.h)); }
	rec.bottomLine = function(){ return new Line(new Vector(rec.x + rec.w, rec.y + rec.h), new Vector(rec.x, rec.y + rec.h)); }

	rec.intersect = function(r2){
		return !(r2.left > rec.right || 
           r2.right < rec.left || 
           r2.top > rec.bottom ||
           r2.bottom < rec.top);
	}
	rec.render = function(color){
		ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.rect(rec.x, rec.y, rec.w, rec.h);
			ctx.stroke();
		ctx.closePath();
	}

	return true;
}