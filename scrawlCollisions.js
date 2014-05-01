'use strict';
/**
# scrawlCollisions

## Purpose and features

The Collisions module adds support for detecting collisions between sprites

* Adds functionality to various core objects and functions so they can take detect collisions

@module scrawlCollisions
**/
var scrawl = (function(my){

/**
# window.scrawl

scrawlCollisions module adaptions to the Scrawl library object

## New default attributes

* Position.delta - default: {x:0,y:0,z:0};
* Cell.fieldLabel - default: '';
* Sprite.fieldChannel - default: 'anycolor';
* Sprite.fieldTest - default: 0;
* Sprite.collisionVectors - default: [];
* Sprite.collisionPoints - default: [];

@class window.scrawl_Collisions
**/

/**
Collision vectors, for use in collision detection calculations
@property scrawl.workcols
@type Object 
@value Object containing three vectors - v1, v2, v3
@private
**/
	my.workcols = {
		v1: my.newVector({name: 'scrawl.workcols.v1'}),
		v2: my.newVector({name: 'scrawl.workcols.v2'}),
		v3: my.newVector({name: 'scrawl.workcols.v3'}),
		};
/**
A __general__ function which asks Cell objects to generate field collision tables
@method scrawl.buildFields
@param {Array} [items] Array of CELLNAME Strings - can also be a String
@return Always true
**/
	my.buildFields = function(items){
		var myCells = (my.xt(items)) ? [].concat(items) : [my.pad[my.currentPad].current];
		if(items === 'all'){
			myCells = my.cellnames;
			}
		for(var i=0, z=myCells.length; i<z; i++){
			my.cell[myCells[i]].buildField();
			}
		return true;
		};
		
/**
Orders all Cell objects associated with this Pad to (re)create their field collision image maps
@method Pad.buildFields
@return This
@chainable
**/
	my.Pad.prototype.buildFields = function(){
		for(var i=0, z=this.cells.length; i<z; i++){
			my.cell[this.cells[i]].buildField();
			}
		return this;
		};

/**
Cell constructor hook function - modified by collisions module
@method Cell.collisionsCellInit
@private
**/
	my.Cell.prototype.collisionsCellInit = function(items){
		my.newGroup({
			name: this.name+'_field',
			cell: this.name,
			visibility: false,
			});
		if(items.field){
			my.group[this.name+'_field'].sprites = [].concat(items.field);
			}
		my.newGroup({
			name: this.name+'_fence',
			cell: this.name,
			visibility: false,
			});
		if(items.fence){
			my.group[this.name+'_fence'].sprites = [].concat(items.fence);
			}
		}

	my.d.Cell.fieldLabel = '';
/**
Builds a collision map image from sprites, for use in sprite field collision detection functions
@method Cell.buildField
@return This
@chainable
**/
	my.Cell.prototype.buildField = function(){
		var	fieldSprites = [],
			fenceSprites = [],
			tempsprite = '',
			tempfill,
			tempstroke,
			myfill = my.ctx[this.context].get('fillStyle');
		my.context[this.context].fillStyle = 'rgba(0,0,0,1)';
		my.context[this.context].fillRect(0, 0, this.actualWidth, this.actualHeight);
		my.context[this.context].fillStyle = myfill;
		fieldSprites = my.group[this.name+'_field'].sprites;
		for(var i=0, z=fieldSprites.length; i<z; i++){
			tempsprite = my.sprite[fieldSprites[i]];
			tempfill = my.ctx[tempsprite.context].fillStyle;
			tempstroke = my.ctx[tempsprite.context].strokeStyle;
			my.ctx[tempsprite.context].fillStyle = 'rgba(255,255,255,1)';
			my.ctx[tempsprite.context].strokeStyle = 'rgba(255,255,255,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			my.ctx[tempsprite.context].fillStyle = tempfill;
			my.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		fenceSprites = my.group[this.name+'_fence'].sprites;
		for(var i=0, z=fenceSprites.length; i<z; i++){
			tempsprite = my.sprite[fenceSprites[i]];
			tempfill = my.ctx[tempsprite.context].fillStyle;
			tempstroke = my.ctx[tempsprite.context].strokeStyle;
			my.ctx[tempsprite.context].fillStyle = 'rgba(0,0,0,1)';
			my.ctx[tempsprite.context].strokeStyle = 'rgba(0,0,0,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			my.ctx[tempsprite.context].fillStyle = tempfill;
			my.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		this.set({
			fieldLabel: this.getImageData({
				name: 'field',
				}),
			});
		return this;
		};
/**
Cell field collision detection function

Argument should be in the form of:

* {channel:String, test:Number, coordinates:Array of Vectors, x:Number, y:Number}

Where:

* __channel__ (optional) can be 'red', 'green', 'blue', 'alpha', or 'anycolor' (default)
* __test__ (optional) can be a value between 0 and 254 (default: 0)
* __coordinates__ (optional) is an array of Vector coordinates, in pixels, relative to the Cell's &lt;canvas&gt; element's top left corner
* __x__ (optional) is the horizontal coordinate, in pixels, relative to the Cell's top left corner
* __y__ (optional) is the vertical coordinate, in pixels, relative to the Cell's top left corner

Either include a single coordinate (x, y), or an array of coordinate Vectors

Test will return: 
* false if it encounters a coordinate outside the bou8ds of its image map
* true if all coordinates exceed the test level (thus a sprite testing in the red channel will report true if it is entirely within a red part of the collision map
* the first coordinate that falls below, or equals, the test level
@method Cell.checkFieldAt
@param {Object} items Argument containing details of how and where to check the cell's collision map image
@return Vector of first the first coordinates to 'pass' the test
@private
**/
	my.Cell.prototype.checkFieldAt = function(items){
		items = my.safeObject(items);
		var	myChannel = items.channel || 'anycolor',
			myTest = items.test || 0,
			x, 
			y, 
			coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0], 
			pos,
			d,
			fieldLabel = this.get('fieldLabel');
		d = my.imageData[fieldLabel];
		for(var i = 0, iz = coords.length; i < iz; i += 2){
			x = Math.round(coords[i]);
			y = Math.round(coords[i+1]);
			if(!my.isBetween(x, 0, d.width, true) || !my.isBetween(y, 0, d.height, true)){
				return false;
				break;
				}
			else{
				pos = ((y * d.width) + x) * 4;
				switch(myChannel){
					case 'red' : 
						if(d.data[pos] <= myTest){
							return {x: x, y: y};
							}
						break;
					case 'green' : 
						if(d.data[pos+1] <= myTest){
							return {x: x, y: y};
							}
						break;
					case 'blue' : 
						if(d.data[pos+2] <= myTest){
							return {x: x, y: y};
							}
						break;
					case 'alpha' : 
						if(d.data[pos+3] <= myTest){
							return {x: x, y: y};
							}
						break;
					case 'anycolor' :
						if(d.data[pos] <= myTest || d.data[pos+1] <= myTest || d.data[pos+2] <= myTest){
							return {x: x, y: y};
							}
						break;
					}
				}
			}
		return true;
		};
		
/**
Check all sprites in the Group to see if they are colliding with the supplied sprite object. An Array of all sprite objects colliding with the reference sprite will be returned
@method Group.getSpritesCollidingWith
@param {String} sprite SPRITENAME String of the reference sprite; alternatively the sprite Object itself can be passed as the argument
@return Array of visible sprite Objects currently colliding with the reference sprite
**/
	my.Group.prototype.getSpritesCollidingWith = function(sprite){
		sprite = (my.isa(sprite, 'str')) ? my.sprite[sprite] : sprite; 
		if(my.contains(my.spritenames, sprite.name)){
			var	hits = [],
				myTests = sprite.getCollisionPoints();
			for(var i=0, z=this.sprites.length; i<z; i++){
				if(my.sprite[this.sprites[i]].name !== sprite.name){
					if(my.sprite[this.sprites[i]].get('visibility')){
						if(my.sprite[this.sprites[i]].checkHit({tests: myTests})){
							hits.push(this.sprites[i]);
							}
						}
					}
				}
			return (hits.length > 0) ? hits : false;
			}
		return false;
		};
/**
Check all sprites in the Group against each other to see if they are in collision
@method Group.getInGroupSpriteHits
@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of sprites currently in collision
**/
	my.Group.prototype.getInGroupSpriteHits = function(){
		var	hits = [],
			cPoints = {},
			cViz = {},
			temp,
			ts1,
			ts2,
			tresult;
		for(var i=0, z=this.sprites.length; i<z; i++){
			temp = my.sprite[this.sprites[i]];
			cViz[temp.name] = temp.visibility;
			if(cViz[temp.name]){
				cPoints[temp.name] = temp.getCollisionPoints();
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(cViz[this.sprites[i]]){
				for(var j=i+1, w=this.sprites.length; j<w; j++){
					if(cViz[this.sprites[j]]){
						if(this.regionRadius){
							ts1 = my.workcols.v1.set(my.sprite[this.sprites[i]].start);
							ts2 = my.workcols.v2.set(my.sprite[this.sprites[j]].start);
							tresult = ts1.vectorSubtract(ts2).getMagnitude();
							if(tresult > this.regionRadius){
								continue;
								}
							}
						if(my.sprite[this.sprites[j]].checkHit({tests: cPoints[this.sprites[i]]})){
							hits.push([this.sprites[i],this.sprites[j]]);
							continue;
							}
						if(my.sprite[this.sprites[i]].checkHit({tests: cPoints[this.sprites[j]]})){
							hits.push([this.sprites[i],this.sprites[j]]);
							continue;
							}
						}
					}
				}
			}
		return hits;
		};
/**
Check all sprites in this Group against all sprites in the argument Group, to see if they are in collision
@method Group.getBetweenGroupSpriteHits
@param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of sprites currently in collision
**/
	my.Group.prototype.getBetweenGroupSpriteHits = function(g){
		var	hits = [],
			cPoints = {},
			cViz = {},
			temp,
			ts1,
			ts2,
			tresult;
		if(my.xt(g)){
			if(my.isa(g,'str')){
				if(my.contains(my.groupnames, g)){
					g = my.group[g];
					}
				else{
					return false;
					}
				}
			else{
				if(!my.xt(g.type) || g.type !== 'Group'){
					return false;
					}
				}
			for(var i=0, z=this.sprites.length; i<z; i++){
				temp = my.sprite[this.sprites[i]];
				cViz[temp.name] = temp.visibility;
				if(cViz[temp.name]){
					cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
			for(var i=0, z=g.sprites.length; i<z; i++){
				temp = my.sprite[g.sprites[i]];
				cViz[temp.name] = temp.visibility;
				if(cViz[temp.name]){
					cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
//console.log(cPoints);
			for(var i=0, z=this.sprites.length; i<z; i++){
				if(cViz[this.sprites[i]]){
//console.log(this.name, this.sprites[i]);
					for(var j=0, w=g.sprites.length; j<w; j++){
						if(cViz[g.sprites[j]]){
							if(this.regionRadius){
								ts1 = my.workcols.v1.set(my.sprite[this.sprites[i]].start);
								ts2 = my.workcols.v2.set(my.sprite[g.sprites[j]].start);
								tresult = ts1.vectorSubtract(ts2).getMagnitude();
								if(tresult > this.regionRadius){
									continue;
									}
								}
//console.log(g.name, g.sprites[j], cPoints[this.sprites[i]]);
							if(my.sprite[g.sprites[j]].checkHit({tests: cPoints[this.sprites[i]]})){
								hits.push([this.sprites[i],g.sprites[j]]);
								continue;
								}
							if(my.sprite[this.sprites[i]].checkHit({tests: cPoints[g.sprites[j]]})){
								hits.push([this.sprites[i],g.sprites[j]]);
								continue;
								}
							}
						}
					}
				}
			return hits;
			}
		return false;
		};
/**
Check all sprites in this Group against a &lt;canvas&gt; element's collision field image

If no argument is supplied, the Group's default Cell's &lt;canvas&gt; element will be used for the check

An Array of Arrays is returned, with each constituent array consisting of the the SPRITENAME of the sprite that has reported a positive hit, alongside a coordinate Vector of where the collision is occuring
@method Group.getFieldSpriteHits
@param {String} [cell] CELLNAME of Cell whose &lt;canvas&gt; element is to be used for the check
@return Array of [SPRITENAME, Vector] Arrays
**/
	my.Group.prototype.getFieldSpriteHits = function(cell){
		cell = (my.xt(cell)) ? cell : this.cell;
		var	hits = [],
			result;
		for(var j=0, w=this.sprites.length; j<w; j++){
			result = my.sprite[this.sprites[j]].checkField(cell);
			if(!my.isa(result,'bool')){
				hits.push([this.sprites[j], result]);
				}
			}
		return hits;
		};

	my.d.Sprite.fieldChannel = 'anycolor';
	my.d.Sprite.fieldTest = 0;
	my.d.Sprite.collisionVectors = [];
	my.d.Sprite.collisionPoints = [];
	if(my.xt(my.d.Block)){my.mergeInto(my.d.Block, my.d.Sprite);}
	if(my.xt(my.d.Shape)){my.mergeInto(my.d.Shape, my.d.Sprite);}
	if(my.xt(my.d.Wheel)){my.mergeInto(my.d.Wheel, my.d.Sprite);}
	if(my.xt(my.d.Picture)){my.mergeInto(my.d.Picture, my.d.Sprite);}
	if(my.xt(my.d.Phrase)){my.mergeInto(my.d.Phrase, my.d.Sprite);}
	if(my.xt(my.d.Path)){my.mergeInto(my.d.Path, my.d.Sprite);}
/**
Sprite constructor hook function - modified by collisions module
@method Sprite.collisionsSpriteConstructor
@private
**/
	my.Sprite.prototype.collisionsSpriteConstructor = function(items){
		if(my.xt(items.field)){
			this.addSpriteToCellFields();
			}
		if(my.xt(items.fence)){
			this.addSpriteToCellFences();
			}
		};
/**
Sprite.registerInLibrary hook function - modified by collisions module
@method Sprite.collisionsSpriteRegisterInLibrary
@private
**/
	my.Sprite.prototype.collisionsSpriteRegisterInLibrary = function(){
		if(my.xt(this.collisionPoints)){
			this.collisionPoints = (my.isa(this.collisionPoints, 'arr')) ? this.collisionPoints : [this.collisionPoints];
			this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
			}
		return this;
		};
/**
Sprite.set hook function - modified by collisions module
@method Sprite.collisionsSpriteSet
@private
**/
	my.Sprite.prototype.collisionsSpriteSet = function(items){
		if(my.xto([items.collisionPoints, items.field, items.fence])){
			if(my.xt(items.collisionPoints)){
				this.collisionPoints = (my.isa(items.collisionPoints, 'arr')) ? items.collisionPoints : [items.collisionPoints];
				this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
				delete this.collisionVectors;
				}
			if(my.xt(items.field)){
				this.addSpriteToCellFields();
				}
			if(my.xt(items.fence)){
				this.addSpriteToCellFences();
				}
			}
		};
/**
Add this sprite to a (range of) Cell object field groups
@method Sprite.addSpriteToCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	my.Sprite.prototype.addSpriteToCellFields = function(cells){
		cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(my.contains(my.cellnames, cells[i])){
				my.group[cells[i]+'_field'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};
/**
Add this sprite to a (range of) Cell object fence groups
@method Sprite.addSpriteToCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	my.Sprite.prototype.addSpriteToCellFences = function(cells){
		cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(my.contains(my.cellnames, cells[i])){
				my.group[cells[i]+'_fence'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};
/**
Remove this sprite from a (range of) Cell object field groups
@method Sprite.removeSpriteFromCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	my.Sprite.prototype.removeSpriteFromCellFields = function(cells){
		cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(my.contains(my.cellnames, cells[i])){
				my.group[cells[i]+'_field'].removeSpritesFromGroup(this.name);
				}
			}
		return this;
		};
/**
Remove this sprite from a (range of) Cell object fence groups
@method Sprite.removeSpriteFromCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	my.Sprite.prototype.removeSpriteFromCellFences = function(cells){
		cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(my.contains(my.cellnames, cells[i])){
				my.group[cells[i]+'_fence'].removeSpritesFromGroup(this.name);
				}
			}
		return this;
		};
/**
Check this sprite's collision Vectors against a Cell object's collision field image to see if any of them are colliding with the Cell's field sprites
@method Sprite.checkField
@param {String} [cell] CELLNAME String of the Cell to be checked against
@return First Vector coordinate to 'pass' the Cell.checkFieldAt() function's test; true if none pass; false if the test parameters are out of bounds
**/
	my.Sprite.prototype.checkField = function(cell){
		var	myCell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
		return myCell.checkFieldAt({
			coordinates: this.getCollisionPoints(),
			test: this.get('fieldTest'),
			channel: this.get('fieldChannel'),
			});
		};
/**
Calculate the current positions of this sprite's collision Vectors, taking into account the sprite's current position, roll and scale
@method Sprite.getCollisionPoints
@return Array of coordinate Vectors
**/
	my.Sprite.prototype.getCollisionPoints = function(){
		var	p = [],
			v,
			c;
		if(!my.xt(this.collisionVectors)){
			if(my.xt(this.collisionPoints)){
				this.buildCollisionVectors();
				}
			}
		c = this.collisionVectors || false;
		if(c){
			for(var i = 0, iz = c.length; i < iz; i += 2){
				v = my.v;
				v.x = (this.flipReverse) ? -c[i] : c[i];
				v.y = (this.flipUpend) ? -c[i+1] : c[i+1];
				if(this.roll){
					v.rotate(this.roll);
					}
				if(this.scale !== 1){
					v.scalarMultiply(this.scale);
					}
				v.vectorAdd(this.start);
				p.push(v.x);
				p.push(v.y);
				}
			return p;
			}
		return [];
		};
/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method Sprite.buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	my.Sprite.prototype.buildCollisionVectors = function(items){
		var	p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints, 
			o = this.getOffsetStartVector().reverse(),
			w = this.width,
			h = this.height,
			c = [];
		for(var i = 0, iz = p.length; i < iz; i++){
			if(my.isa(p[i], 'str')){
				switch(p[i]) {
					case 'start' : 	c.push(0); 				c.push(0); 				break;
					case 'N' : 		c.push((w/2) - o.x); 	c.push(-o.y); 			break;
					case 'NE' : 	c.push(w - o.x);		c.push(-o.y); 			break;
					case 'E' : 		c.push(w - o.x);		c.push((h/2) - o.y); 	break;
					case 'SE' : 	c.push(w - o.x);		c.push(h - o.y); 		break;
					case 'S' : 		c.push((w/2) - o.x);	c.push(h - o.y); 		break;
					case 'SW' : 	c.push(-o.x);			c.push(h - o.y); 		break;
					case 'W' : 		c.push(-o.x);			c.push((h/2) - o.y); 	break;
					case 'NW' : 	c.push(-o.x);			c.push(-o.y); 			break;
					case 'center' :	c.push((w/2) - o.x);	c.push((h/2) - o.y); 	break;
					}
				}
			else if(my.isa(p[i], 'vector')){
				c.push(p[i].x);		c.push(p[i].y);
				}
			}
		this.collisionVectors = c;
		return this;
		};
/**
Collision detection helper function

Parses user input for the collisionPoint attribute
@method Sprite.parseCollisionPoints
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	my.Sprite.prototype.parseCollisionPoints = function(items){
		var myItems = (my.xt(items)) ? [].concat(items) : [],
			p = [];
		for(var i=0, z=myItems.length; i<z; i++){
			if(my.isa(myItems[i], 'str')){
				switch(myItems[i].toLowerCase()) {
					case 'all' :
						my.pushUnique(p, 'N'); my.pushUnique(p, 'NE'); my.pushUnique(p, 'E'); my.pushUnique(p, 'SE'); my.pushUnique(p, 'S');
						my.pushUnique(p, 'SW'); my.pushUnique(p, 'W'); my.pushUnique(p, 'NW'); my.pushUnique(p, 'start'); my.pushUnique(p, 'center');
						break;
					case 'corners' :
						my.pushUnique(p, 'NE'); my.pushUnique(p, 'SE'); my.pushUnique(p, 'SW'); my.pushUnique(p, 'NW');
						break;
					case 'edges' :
						my.pushUnique(p, 'N'); my.pushUnique(p, 'E'); my.pushUnique(p, 'S'); my.pushUnique(p, 'W');
						break;
					case 'perimeter' :
						my.pushUnique(p, 'N'); my.pushUnique(p, 'NE'); my.pushUnique(p, 'E'); my.pushUnique(p, 'SE');
						my.pushUnique(p, 'S'); my.pushUnique(p, 'SW'); my.pushUnique(p, 'W'); my.pushUnique(p, 'NW');
						break;
					case 'north' : 
					case 'n' :
						my.pushUnique(p, 'N'); break;
					case 'northeast' : 
					case 'ne' :
						my.pushUnique(p, 'NE'); break;
					case 'east' : 
					case 'e' :
						my.pushUnique(p, 'E'); break;
					case 'southeast' : 
					case 'se' :
						my.pushUnique(p, 'SE'); break;
					case 'south' : 
					case 's' :
						my.pushUnique(p, 'S'); break;
					case 'southwest' : 
					case 'sw' :
						my.pushUnique(p, 'SW'); break;
					case 'west' : 
					case 'w' :
						my.pushUnique(p, 'W'); break;
					case 'northwest' : 
					case 'nw' :
						my.pushUnique(p, 'NW'); break;
					case 'start' : 
						my.pushUnique(p, 'start'); break;
					case 'center' : 
						my.pushUnique(p, 'center'); break;
					}
				}
			else if(my.isa(myItems[i], 'num')){
				p.push(myItems[i]);
				}
			else if(my.isa(myItems[i], 'vector')){
				p.push(myItems[i]);
				}
			}
		this.collisionPoints = p;
		return p;
		};

	return my;
	}(scrawl));
