'use strict';
/**
# scrawlWheel

## Purpose and features

The Wheel module adds Wheel sprites - circles, segments and filled arcs - to the core module

* Defines 'arc' objects for displaying on a Cell's canvas
* Performs 'arc' based drawing operations on canvases

@module scrawlWheel
**/

var scrawl = (function(my){

/**
# window.scrawl

scrawlWheel module adaptions to the Scrawl library object

@class window.scrawl_Wheel
**/

/**
A __factory__ function to generate new Wheel sprites
@method newWheel
@param {Object} items Key:value Object argument for setting attributes
@return Wheel object
@example
	scrawl.newWheel({
		radius: 50,
		startX: 150,
		startY: 60,
		fillStyle: 'blue',
		strokeStyle: 'red',
		method: 'drawFill',
		});
**/
	my.newWheel = function(items){
		return new my.Wheel(items);
		};

/**
# Wheel
	
## Instantiation

* scrawl.newWheel()

## Purpose

* Defines 'arc' objects for displaying on a Cell's canvas
* Performs 'arc' based drawing operations on canvases

## Access

* scrawl.sprite.WHEELNAME - for the Wheel sprite object

@class Wheel
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Wheel = function Wheel(items){
		items = my.safeObject(items);
		my.Sprite.call(this, items);
		my.Position.prototype.set.call(this, items);
		this.radius = items.radius || my.d.Wheel.radius;
		this.width = this.radius * 2;
		this.height = this.width;
		this.checkHitUsingRadius = (my.isa(items.checkHitUsingRadius,'bool')) ? items.checkHitUsingRadius : my.d.Wheel.checkHitUsingRadius;
		this.closed = (my.isa(items.closed,'bool')) ? items.closed : my.d.Wheel.closed;
		this.includeCenter = (my.isa(items.includeCenter,'bool')) ? items.includeCenter : my.d.Wheel.includeCenter;
		this.clockwise = (my.isa(items.clockwise,'bool')) ? items.clockwise : my.d.Wheel.clockwise;
		this.registerInLibrary();
		my.pushUnique(my.group[this.group].sprites, this.name);
		return this;
		}
	my.Wheel.prototype = Object.create(my.Sprite.prototype);
/**
@property type
@type String
@default 'Wheel'
@final
**/		
	my.Wheel.prototype.type = 'Wheel';
	my.Wheel.prototype.classname = 'spritenames';
	my.d.Wheel = {
/**
Angle of the path's start point, from due east, in degrees
@property startAngle
@type Number
@default 0
**/
		startAngle: 0,
/**
Angle of the path's end point, from due east, in degrees
@property endAngle
@type Number
@default 360
**/
		endAngle: 360,
/**
Drawing flag - true to draw the arc in a clockwise direction; false for anti-clockwise
@property clockwise
@type Boolean
@default false
**/
		clockwise: false,
/**
Drawing flag - true to close the path; false to keep the path open
@property closed
@type Boolean
@default true
**/
		closed: true,
/**
Drawing flag - true to include the center in the path (for wedge shapes); false for circles
@property includeCenter
@type Boolean
@default false
**/
		includeCenter: false,
/**
Collision calculation flag - true to use a simple radius check; false to use the JavaScript isPointInPath() function
@property checkHitUsingRadius
@type Boolean
@default true
**/
		checkHitUsingRadius: true,
/**
Collision calculation value - collision radius, from start vector
@property checkHitRadius
@type Number
@default 0
**/
		checkHitRadius: 0,
		};
	my.mergeInto(my.d.Wheel, my.d.Sprite);
/**
Augments Sprite.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Wheel.prototype.set = function(items){
		my.Sprite.prototype.set.call(this, items);
		this.radius = items.radius || this.radius;
		this.width = this.radius * 2;
		this.height = this.width;
		return this;
		};
/**
Augments Sprite.setDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Wheel.prototype.setDelta = function(items){
		my.Sprite.prototype.setDelta.call(this, items);
		items = (my.isa(items,'obj')) ? items : {};
		var f = {};
		if(my.xt(items.radius)){
			this.radius += items.radius;
			this.width = this.radius * 2;
			this.height = this.width;
			}
		if(my.xt(items.startAngle)){f.startAngle = this.get('startAngle') + items.startAngle;}
		if(my.xt(items.endAngle)){f.endAngle = this.get('endAngle') + items.endAngle;}
		this.set(f);
		return this;
		};
/**
Check a set of coordinates to see if any of them fall within this sprite's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate
* __pad__ - PADNAME String

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values

If the __checkHitUsingRadius__ attribute is true, collisions will be detected using a simple distance comparison; otherwise the JavaScript isPointInPath() function will be invoked
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the sprite's path; false if none fall within the path
**/
	my.Wheel.prototype.checkHit = function(items){
		items = my.safeObject(items);
		var	tests = (my.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}],
			result = false,
			myX,
			myY,
			distance,
			testRadius,
			pad,
			cell,
			ctx;
		if(this.checkHitUsingRadius){
			testRadius = (this.checkHitRadius) ? this.checkHitRadius : this.radius * this.scale;
			for(var i=0, z=tests.length; i<z; i++){
				myX = tests[i].x - this.start.x;
				myY = tests[i].y - this.start.y;
				distance = Math.sqrt((myX * myX) + (myY * myY));
				result = (distance <= testRadius) ? true : false;
				if(result){break;}
				}
			}
		else{
			pad = my.pad[items.pad] || my.pad[my.currentPad];
			cell = my.cell[pad.current].name;
			ctx = my.context[pad.current];
			this.buildPath(ctx, cell);
			for(var i=0, z=tests.length; i<z; i++){
				result = ctx.isPointInPath(tests[i].x, tests[i].y);
				if(result){break;}
				}
			}
		return (result) ? tests[i] : false;
		};
/**
Position.getOffsetStartVector() helper function
@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	my.Wheel.prototype.getPivotOffsetVector = function(){
		return this.getCenteredPivotOffsetVector();
		};
/**
Stamp helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method buildPath
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.buildPath = function(ctx, cell){
		var here = this.prepareStamp(),
			startAngle = this.get('startAngle'),
			endAngle = this.get('endAngle');
		this.rotateCell(ctx, cell);
		ctx.beginPath();
		ctx.arc(here.x, here.y, (this.radius * this.scale), (startAngle * my.radian), (endAngle * my.radian), this.clockwise);
		if(this.includeCenter){ctx.lineTo(here.x, here.y);}
		if(this.closed){ctx.closePath();}
		return this;
		};
/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clip = function(ctx, cell){
		this.buildPath(ctx, cell);
		ctx.clip();
		return this;
		};
/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clear = function(ctx, cell){
		ctx.globalCompositeOperation = 'destination-out';
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
		return this;
		};
/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clearWithBackground = function(ctx, cell){
		var myCell = my.cell[cell],
			bc = myCell.get('backgroundColor'),
			myCellCtx = my.ctx[cell],
			fillStyle = myCellCtx.get('fillStyle'),
			strokeStyle = myCellCtx.get('strokeStyle'),
			globalAlpha = myCellCtx.get('globalAlpha');
		ctx.fillStyle = bc;
		ctx.strokeStyle = bc;
		ctx.globalAlpha = 1;
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.globalAlpha = globalAlpha;
		return this;
		};
/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.draw = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		return this;
		};
/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.fill = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		return this;
		};
/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.drawFill = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill();
		return this;
		};
/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.fillDraw = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		this.clearShadow(ctx, cell);
		ctx.stroke();
		return this;
		};
/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.sinkInto = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		ctx.stroke();
		return this;
		};
/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.floatOver = function(ctx, cell){
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		return this;
		};
/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	my.Wheel.prototype.buildCollisionVectors = function(items){
		if(my.xt(my.d.Wheel.fieldChannel)){
			var	p,
				v = my.newVector({x: this.radius, y: 0}),
				r,
				res;
			if(my.xt(items)){
				p = this.parseCollisionPoints(items);
				}
			else{
				p = this.collisionPoints;
				}
			this.collisionVectors = [];
			for(var i=0, z=p.length; i<z; i++){
				if(my.isa(p[i], 'num') && p[i] > 1){
					r = 360/Math.floor(p[i]);
					for(var j=0; j<p[i]; j++){
						this.collisionVectors.push(v.getVector().rotate(r*j));
						}
					}
				else if(my.isa(p[i], 'str')){
					switch(p[i]) {
						case 'start' : 	res = my.newVector(); break;
						case 'N' : 		res = v.getVector().rotate(-90); break;
						case 'NE' : 	res = v.getVector().rotate(-45); break;
						case 'E' : 		res = v.getVector(); break;
						case 'SE' : 	res = v.getVector().rotate(45); break;
						case 'S' : 		res = v.getVector().rotate(90); break;
						case 'SW' : 	res = v.getVector().rotate(135); break;
						case 'W' : 		res = v.getVector().rotate(180); break;
						case 'NW' : 	res = v.getVector().rotate(-135); break;
						case 'center' :	res = my.newVector(); break;
						}
					this.collisionVectors.push(res);
					}
				else if(my.isa(p[i], 'obj') && p[i].type === 'Vector'){
					this.collisionVectors.push(p[i]);
					}
				}
			}
		return this;
		};

	return my;
	}(scrawl));
