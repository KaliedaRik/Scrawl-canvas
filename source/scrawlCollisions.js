//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Richard James Roots
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

/**
# scrawlCollisions

## Purpose and features

The Collisions module adds support for detecting collisions between entitys

* Adds functionality to various core objects and functions so they can take detect collisions

@module scrawlCollisions
**/
if (window.scrawl && !window.scrawl.workcols) {
	var scrawl = (function(my) {
		'use strict';

		/**
	# window.scrawl

	scrawlCollisions module adaptions to the Scrawl library object

	## New default attributes

	* Position.delta - default: {x:0,y:0,z:0};
	* Cell.fieldLabel - default: '';
	* Entity.fieldChannel - default: 'anycolor';
	* Entity.fieldTest - default: 0;
	* Entity.collisionVectors - default: [];
	* Entity.collisionPoints - default: [];

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
			v1: my.newVector({
				name: 'scrawl.workcols.v1'
			}),
			v2: my.newVector({
				name: 'scrawl.workcols.v2'
			}),
			v3: my.newVector({
				name: 'scrawl.workcols.v3'
			}),
		};
		/**
	A __general__ function which asks Cell objects to generate field collision tables
	@method scrawl.buildFields
	@param {Array} [items] Array of CELLNAME Strings - can also be a String
	@return Always true
	**/
		my.buildFields = function(items) {
			var myCells = (my.xt(items)) ? [].concat(items) : [my.pad[my.currentPad].current];
			if (items === 'all') {
				myCells = my.cellnames;
			}
			for (var i = 0, iz = myCells.length; i < iz; i++) {
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
		my.Pad.prototype.buildFields = function() {
			for (var i = 0, iz = this.cells.length; i < iz; i++) {
				my.cell[this.cells[i]].buildField();
			}
			return this;
		};

		/**
	Cell constructor hook function - modified by collisions module
	@method Cell.collisionsCellInit
	@private
	**/
		my.Cell.prototype.collisionsCellInit = function(items) {
			my.newGroup({
				name: this.name + '_field',
				cell: this.name,
				visibility: false,
			});
			if (items.field) {
				my.group[this.name + '_field'].entitys = [].concat(items.field);
			}
			my.newGroup({
				name: this.name + '_fence',
				cell: this.name,
				visibility: false,
			});
			if (items.fence) {
				my.group[this.name + '_fence'].entitys = [].concat(items.fence);
			}
		};

		my.d.Cell.fieldLabel = '';
		/**
	Builds a collision map image from entitys, for use in entity field collision detection functions
	@method Cell.buildField
	@return This
	@chainable
	**/
		my.Cell.prototype.buildField = function() {
			var fieldEntitys = [],
				fenceEntitys = [],
				tempentity = '',
				tempfill,
				tempstroke,
				myfill = my.ctx[this.context].get('fillStyle');
			my.context[this.context].fillStyle = 'rgba(0,0,0,1)';
			my.context[this.context].fillRect(0, 0, this.actualWidth, this.actualHeight);
			my.context[this.context].fillStyle = myfill;
			fieldEntitys = my.group[this.name + '_field'].entitys;
			for (var i = 0, iz = fieldEntitys.length; i < iz; i++) {
				tempentity = my.entity[fieldEntitys[i]];
				tempfill = my.ctx[tempentity.context].fillStyle;
				tempstroke = my.ctx[tempentity.context].strokeStyle;
				my.ctx[tempentity.context].fillStyle = 'rgba(255,255,255,1)';
				my.ctx[tempentity.context].strokeStyle = 'rgba(255,255,255,1)';
				tempentity.forceStamp('fillDraw', this.name);
				my.ctx[tempentity.context].fillStyle = tempfill;
				my.ctx[tempentity.context].strokeStyle = tempstroke;
			}
			fenceEntitys = my.group[this.name + '_fence'].entitys;
			for (var j = 0, jz = fenceEntitys.length; j < jz; j++) {
				tempentity = my.entity[fenceEntitys[j]];
				tempfill = my.ctx[tempentity.context].fillStyle;
				tempstroke = my.ctx[tempentity.context].strokeStyle;
				my.ctx[tempentity.context].fillStyle = 'rgba(0,0,0,1)';
				my.ctx[tempentity.context].strokeStyle = 'rgba(0,0,0,1)';
				tempentity.forceStamp('fillDraw', this.name);
				my.ctx[tempentity.context].fillStyle = tempfill;
				my.ctx[tempentity.context].strokeStyle = tempstroke;
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
	* true if all coordinates exceed the test level (thus a entity testing in the red channel will report true if it is entirely within a red part of the collision map
	* the first coordinate that falls below, or equals, the test level
	@method Cell.checkFieldAt
	@param {Object} items Argument containing details of how and where to check the cell's collision map image
	@return Vector of first the first coordinates to 'pass' the test
	@private
	**/
		my.Cell.prototype.checkFieldAt = function(items) {
			items = my.safeObject(items);
			var myChannel = items.channel || 'anycolor',
				myTest = items.test || 0,
				x,
				y,
				coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0],
				pos,
				d,
				fieldLabel = this.get('fieldLabel');
			d = my.imageData[fieldLabel];
			for (var i = 0, iz = coords.length; i < iz; i += 2) {
				x = Math.round(coords[i]);
				y = Math.round(coords[i + 1]);
				if (!my.isBetween(x, 0, d.width, true) || !my.isBetween(y, 0, d.height, true)) {
					return false;
				}
				else {
					pos = ((y * d.width) + x) * 4;
					switch (myChannel) {
						case 'red':
							if (d.data[pos] <= myTest) {
								return {
									x: x,
									y: y
								};
							}
							break;
						case 'green':
							if (d.data[pos + 1] <= myTest) {
								return {
									x: x,
									y: y
								};
							}
							break;
						case 'blue':
							if (d.data[pos + 2] <= myTest) {
								return {
									x: x,
									y: y
								};
							}
							break;
						case 'alpha':
							if (d.data[pos + 3] <= myTest) {
								return {
									x: x,
									y: y
								};
							}
							break;
						case 'anycolor':
							if (d.data[pos] <= myTest || d.data[pos + 1] <= myTest || d.data[pos + 2] <= myTest) {
								return {
									x: x,
									y: y
								};
							}
							break;
					}
				}
			}
			return true;
		};

		/**
	Check all entitys in the Group to see if they are colliding with the supplied entity object. An Array of all entity objects colliding with the reference entity will be returned
	@method Group.getEntitysCollidingWith
	@param {String} entity SPRITENAME String of the reference entity; alternatively the entity Object itself can be passed as the argument
	@return Array of visible entity Objects currently colliding with the reference entity
	**/
		my.Group.prototype.getEntitysCollidingWith = function(entity) {
			entity = (my.isa(entity, 'str')) ? my.entity[entity] : entity;
			if (my.contains(my.entitynames, entity.name)) {
				var hits = [],
					myTests = entity.getCollisionPoints();
				for (var i = 0, iz = this.entitys.length; i < iz; i++) {
					if (my.entity[this.entitys[i]].name !== entity.name) {
						if (my.entity[this.entitys[i]].get('visibility')) {
							if (my.entity[this.entitys[i]].checkHit({
								tests: myTests
							})) {
								hits.push(this.entitys[i]);
							}
						}
					}
				}
				return (hits.length > 0) ? hits : false;
			}
			return false;
		};
		/**
	Check all entitys in the Group against each other to see if they are in collision
	@method Group.getInGroupEntityHits
	@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
	**/
		my.Group.prototype.getInGroupEntityHits = function() {
			var hits = [],
				cPoints = {},
				cViz = {},
				temp,
				ts1,
				ts2,
				tresult;
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				temp = my.entity[this.entitys[i]];
				cViz[temp.name] = temp.visibility;
				if (cViz[temp.name]) {
					cPoints[temp.name] = temp.getCollisionPoints();
				}
			}
			for (var k = 0, kz = this.entitys.length; k < kz; k++) {
				if (cViz[this.entitys[k]]) {
					for (var j = k + 1, jz = this.entitys.length; j < jz; j++) {
						if (cViz[this.entitys[j]]) {
							if (this.regionRadius) {
								ts1 = my.workcols.v1.set(my.entity[this.entitys[k]].start);
								ts2 = my.workcols.v2.set(my.entity[this.entitys[j]].start);
								tresult = ts1.vectorSubtract(ts2).getMagnitude();
								if (tresult > this.regionRadius) {
									continue;
								}
							}
							if (my.entity[this.entitys[j]].checkHit({
								tests: cPoints[this.entitys[k]]
							})) {
								hits.push([this.entitys[k], this.entitys[j]]);
								continue;
							}
							if (my.entity[this.entitys[k]].checkHit({
								tests: cPoints[this.entitys[j]]
							})) {
								hits.push([this.entitys[k], this.entitys[j]]);
								continue;
							}
						}
					}
				}
			}
			return hits;
		};
		/**
	Check all entitys in this Group against all entitys in the argument Group, to see if they are in collision
	@method Group.getBetweenGroupEntityHits
	@param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
	@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
	**/
		my.Group.prototype.getBetweenGroupEntityHits = function(g) {
			var hits = [],
				cPoints = {},
				cViz = {},
				temp,
				ts1,
				ts2,
				tresult;
			if (my.xt(g)) {
				if (my.isa(g, 'str')) {
					if (my.contains(my.groupnames, g)) {
						g = my.group[g];
					}
					else {
						return false;
					}
				}
				else {
					if (!my.xt(g.type) || g.type !== 'Group') {
						return false;
					}
				}
				for (var l = 0, lz = this.entitys.length; l < lz; l++) {
					temp = my.entity[this.entitys[l]];
					cViz[temp.name] = temp.visibility;
					if (cViz[temp.name]) {
						cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
				for (var i = 0, iz = g.entitys.length; i < iz; i++) {
					temp = my.entity[g.entitys[i]];
					cViz[temp.name] = temp.visibility;
					if (cViz[temp.name]) {
						cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
				for (var k = 0, kz = this.entitys.length; k < kz; k++) {
					if (cViz[this.entitys[k]]) {
						for (var j = 0, jz = g.entitys.length; j < jz; j++) {
							if (cViz[g.entitys[j]]) {
								if (this.regionRadius) {
									ts1 = my.workcols.v1.set(my.entity[this.entitys[k]].start);
									ts2 = my.workcols.v2.set(my.entity[g.entitys[j]].start);
									tresult = ts1.vectorSubtract(ts2).getMagnitude();
									if (tresult > this.regionRadius) {
										continue;
									}
								}
								if (my.entity[g.entitys[j]].checkHit({
									tests: cPoints[this.entitys[k]]
								})) {
									hits.push([this.entitys[k], g.entitys[j]]);
									continue;
								}
								if (my.entity[this.entitys[k]].checkHit({
									tests: cPoints[g.entitys[j]]
								})) {
									hits.push([this.entitys[k], g.entitys[j]]);
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
	Check all entitys in this Group against a &lt;canvas&gt; element's collision field image

	If no argument is supplied, the Group's default Cell's &lt;canvas&gt; element will be used for the check

	An Array of Arrays is returned, with each constituent array consisting of the the SPRITENAME of the entity that has reported a positive hit, alongside a coordinate Vector of where the collision is occuring
	@method Group.getFieldEntityHits
	@param {String} [cell] CELLNAME of Cell whose &lt;canvas&gt; element is to be used for the check
	@return Array of [SPRITENAME, Vector] Arrays
	**/
		my.Group.prototype.getFieldEntityHits = function(cell) {
			cell = (my.xt(cell)) ? cell : this.cell;
			var hits = [],
				result;
			for (var j = 0, jz = this.entitys.length; j < jz; j++) {
				result = my.entity[this.entitys[j]].checkField(cell);
				if (!my.isa(result, 'bool')) {
					hits.push([this.entitys[j], result]);
				}
			}
			return hits;
		};

		my.d.Entity.fieldChannel = 'anycolor';
		my.d.Entity.fieldTest = 0;
		my.d.Entity.collisionVectors = [];
		my.d.Entity.collisionPoints = [];
		if (my.xt(my.d.Block)) {
			my.mergeInto(my.d.Block, my.d.Entity);
		}
		if (my.xt(my.d.Shape)) {
			my.mergeInto(my.d.Shape, my.d.Entity);
		}
		if (my.xt(my.d.Wheel)) {
			my.mergeInto(my.d.Wheel, my.d.Entity);
		}
		if (my.xt(my.d.Picture)) {
			my.mergeInto(my.d.Picture, my.d.Entity);
		}
		if (my.xt(my.d.Phrase)) {
			my.mergeInto(my.d.Phrase, my.d.Entity);
		}
		if (my.xt(my.d.Path)) {
			my.mergeInto(my.d.Path, my.d.Entity);
		}
		/**
	Entity constructor hook function - modified by collisions module
	@method Entity.collisionsEntityConstructor
	@private
	**/
		my.Entity.prototype.collisionsEntityConstructor = function(items) {
			if (my.xt(items.field)) {
				this.addEntityToCellFields();
			}
			if (my.xt(items.fence)) {
				this.addEntityToCellFences();
			}
		};
		/**
	Entity.registerInLibrary hook function - modified by collisions module
	@method Entity.collisionsEntityRegisterInLibrary
	@private
	**/
		my.Entity.prototype.collisionsEntityRegisterInLibrary = function() {
			if (my.xt(this.collisionPoints)) {
				this.collisionPoints = (my.isa(this.collisionPoints, 'arr')) ? this.collisionPoints : [this.collisionPoints];
				this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
			}
			return this;
		};
		/**
	Entity.set hook function - modified by collisions module
	@method Entity.collisionsEntitySet
	@private
	**/
		my.Entity.prototype.collisionsEntitySet = function(items) {
			if (my.xto([items.collisionPoints, items.field, items.fence])) {
				if (my.xt(items.collisionPoints)) {
					this.collisionPoints = (my.isa(items.collisionPoints, 'arr')) ? items.collisionPoints : [items.collisionPoints];
					this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
					delete this.collisionVectors;
				}
				if (my.xt(items.field)) {
					this.addEntityToCellFields();
				}
				if (my.xt(items.fence)) {
					this.addEntityToCellFences();
				}
			}
		};
		/**
	Add this entity to a (range of) Cell object field groups
	@method Entity.addEntityToCellFields
	@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
	@return This
	@chainable
	**/
		my.Entity.prototype.addEntityToCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (var i = 0, iz = cells.length; i < iz; i++) {
				if (my.contains(my.cellnames, cells[i])) {
					my.group[cells[i] + '_field'].addEntitysToGroup(this.name);
				}
			}
			return this;
		};
		/**
	Add this entity to a (range of) Cell object fence groups
	@method Entity.addEntityToCellFences
	@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
	@return This
	@chainable
	**/
		my.Entity.prototype.addEntityToCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (var i = 0, iz = cells.length; i < iz; i++) {
				if (my.contains(my.cellnames, cells[i])) {
					my.group[cells[i] + '_fence'].addEntitysToGroup(this.name);
				}
			}
			return this;
		};
		/**
	Remove this entity from a (range of) Cell object field groups
	@method Entity.removeEntityFromCellFields
	@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
	@return This
	@chainable
	**/
		my.Entity.prototype.removeEntityFromCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (var i = 0, iz = cells.length; i < iz; i++) {
				if (my.contains(my.cellnames, cells[i])) {
					my.group[cells[i] + '_field'].removeEntitysFromGroup(this.name);
				}
			}
			return this;
		};
		/**
	Remove this entity from a (range of) Cell object fence groups
	@method Entity.removeEntityFromCellFences
	@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
	@return This
	@chainable
	**/
		my.Entity.prototype.removeEntityFromCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (var i = 0, iz = cells.length; i < iz; i++) {
				if (my.contains(my.cellnames, cells[i])) {
					my.group[cells[i] + '_fence'].removeEntitysFromGroup(this.name);
				}
			}
			return this;
		};
		/**
	Check this entity's collision Vectors against a Cell object's collision field image to see if any of them are colliding with the Cell's field entitys
	@method Entity.checkField
	@param {String} [cell] CELLNAME String of the Cell to be checked against
	@return First Vector coordinate to 'pass' the Cell.checkFieldAt() function's test; true if none pass; false if the test parameters are out of bounds
	**/
		my.Entity.prototype.checkField = function(cell) {
			var myCell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
			return myCell.checkFieldAt({
				coordinates: this.getCollisionPoints(),
				test: this.get('fieldTest'),
				channel: this.get('fieldChannel'),
			});
		};
		/**
	Calculate the current positions of this entity's collision Vectors, taking into account the entity's current position, roll and scale
	@method Entity.getCollisionPoints
	@return Array of coordinate Vectors
	**/
		my.Entity.prototype.getCollisionPoints = function() {
			var p = [],
				v,
				c;
			if (!my.xt(this.collisionVectors)) {
				if (my.xt(this.collisionPoints)) {
					this.buildCollisionVectors();
				}
			}
			c = this.collisionVectors || false;
			if (c) {
				for (var i = 0, iz = c.length; i < iz; i += 2) {
					v = my.v;
					v.x = (this.flipReverse) ? -c[i] : c[i];
					v.y = (this.flipUpend) ? -c[i + 1] : c[i + 1];
					if (this.roll) {
						v.rotate(this.roll);
					}
					if (this.scale !== 1) {
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

	Parses the collisionPoints array to generate coordinate Vectors representing the entity's collision points
	@method Entity.buildCollisionVectors
	@param {Array} [items] Array of collision point data
	@return This
	@chainable
	@private
	**/
		my.Entity.prototype.buildCollisionVectors = function(items) {
			var p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints,
				o = this.getOffsetStartVector().reverse(),
				w = this.width,
				h = this.height,
				c = [];
			for (var i = 0, iz = p.length; i < iz; i++) {
				if (my.isa(p[i], 'str')) {
					switch (p[i]) {
						case 'start':
							c.push(0);
							c.push(0);
							break;
						case 'N':
							c.push((w / 2) - o.x);
							c.push(-o.y);
							break;
						case 'NE':
							c.push(w - o.x);
							c.push(-o.y);
							break;
						case 'E':
							c.push(w - o.x);
							c.push((h / 2) - o.y);
							break;
						case 'SE':
							c.push(w - o.x);
							c.push(h - o.y);
							break;
						case 'S':
							c.push((w / 2) - o.x);
							c.push(h - o.y);
							break;
						case 'SW':
							c.push(-o.x);
							c.push(h - o.y);
							break;
						case 'W':
							c.push(-o.x);
							c.push((h / 2) - o.y);
							break;
						case 'NW':
							c.push(-o.x);
							c.push(-o.y);
							break;
						case 'center':
							c.push((w / 2) - o.x);
							c.push((h / 2) - o.y);
							break;
					}
				}
				else if (my.isa(p[i], 'vector')) {
					c.push(p[i].x);
					c.push(p[i].y);
				}
			}
			this.collisionVectors = c;
			return this;
		};
		/**
	Collision detection helper function

	Parses user input for the collisionPoint attribute
	@method Entity.parseCollisionPoints
	@param {Array} [items] Array of collision point data
	@return This
	@chainable
	@private
	**/
		my.Entity.prototype.parseCollisionPoints = function(items) {
			var myItems = (my.xt(items)) ? [].concat(items) : [],
				p = [];
			for (var i = 0, iz = myItems.length; i < iz; i++) {
				if (my.isa(myItems[i], 'str')) {
					switch (myItems[i].toLowerCase()) {
						case 'all':
							my.pushUnique(p, 'N');
							my.pushUnique(p, 'NE');
							my.pushUnique(p, 'E');
							my.pushUnique(p, 'SE');
							my.pushUnique(p, 'S');
							my.pushUnique(p, 'SW');
							my.pushUnique(p, 'W');
							my.pushUnique(p, 'NW');
							my.pushUnique(p, 'start');
							my.pushUnique(p, 'center');
							break;
						case 'corners':
							my.pushUnique(p, 'NE');
							my.pushUnique(p, 'SE');
							my.pushUnique(p, 'SW');
							my.pushUnique(p, 'NW');
							break;
						case 'edges':
							my.pushUnique(p, 'N');
							my.pushUnique(p, 'E');
							my.pushUnique(p, 'S');
							my.pushUnique(p, 'W');
							break;
						case 'perimeter':
							my.pushUnique(p, 'N');
							my.pushUnique(p, 'NE');
							my.pushUnique(p, 'E');
							my.pushUnique(p, 'SE');
							my.pushUnique(p, 'S');
							my.pushUnique(p, 'SW');
							my.pushUnique(p, 'W');
							my.pushUnique(p, 'NW');
							break;
						case 'north':
						case 'n':
							my.pushUnique(p, 'N');
							break;
						case 'northeast':
						case 'ne':
							my.pushUnique(p, 'NE');
							break;
						case 'east':
						case 'e':
							my.pushUnique(p, 'E');
							break;
						case 'southeast':
						case 'se':
							my.pushUnique(p, 'SE');
							break;
						case 'south':
						case 's':
							my.pushUnique(p, 'S');
							break;
						case 'southwest':
						case 'sw':
							my.pushUnique(p, 'SW');
							break;
						case 'west':
						case 'w':
							my.pushUnique(p, 'W');
							break;
						case 'northwest':
						case 'nw':
							my.pushUnique(p, 'NW');
							break;
						case 'start':
							my.pushUnique(p, 'start');
							break;
						case 'center':
							my.pushUnique(p, 'center');
							break;
					}
				}
				else if (my.isa(myItems[i], 'num')) {
					p.push(myItems[i]);
				}
				else if (my.isa(myItems[i], 'vector')) {
					p.push(myItems[i]);
				}
			}
			this.collisionPoints = p;
			return p;
		};

		return my;
	}(scrawl));
}
