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
if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'collisions')) {
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
			var cells,
				i,
				iz;
			cells = (my.xt(items)) ? [].concat(items) : [my.pad[my.currentPad].current];
			if (items === 'all') {
				cells = my.cellnames;
			}
			for (i = 0, iz = cells.length; i < iz; i++) {
				my.cell[cells[i]].buildField();
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
			var i,
				iz,
				j,
				jz,
				fieldEntitys,
				fenceEntitys,
				tempentity,
				tempfill,
				myfill,
				tempstroke,
				thisContext,
				thisEngine,
				entityContext;
			fieldEntitys = [];
			fenceEntitys = [];
			thisContext = my.ctx[this.context];
			thisEngine = my.context[this.context];
			myfill = thisContext.get('fillStyle');
			thisEngine.fillStyle = 'rgba(0,0,0,1)';
			thisEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			thisEngine.fillStyle = myfill;
			fieldEntitys = my.group[this.name + '_field'].entitys;
			for (i = 0, iz = fieldEntitys.length; i < iz; i++) {
				tempentity = my.entity[fieldEntitys[i]];
				entityContext = my.ctx[tempentity.context];
				tempfill = entityContext.fillStyle;
				tempstroke = entityContext.strokeStyle;
				entityContext.fillStyle = 'rgba(255,255,255,1)';
				entityContext.strokeStyle = 'rgba(255,255,255,1)';
				tempentity.forceStamp('fillDraw', this.name);
				entityContext.fillStyle = tempfill;
				entityContext.strokeStyle = tempstroke;
			}
			fenceEntitys = my.group[this.name + '_fence'].entitys;
			for (j = 0, jz = fenceEntitys.length; j < jz; j++) {
				tempentity = my.entity[fenceEntitys[j]];
				entityContext = my.ctx[tempentity.context];
				tempfill = entityContext.fillStyle;
				tempstroke = entityContext.strokeStyle;
				entityContext.fillStyle = 'rgba(0,0,0,1)';
				entityContext.strokeStyle = 'rgba(0,0,0,1)';
				tempentity.forceStamp('fillDraw', this.name);
				entityContext.fillStyle = tempfill;
				entityContext.strokeStyle = tempstroke;
			}
			this.set({
				fieldLabel: this.getImageData({
					name: 'field'
				})
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
    * false if it encounters a coordinate outside the bounds of its image map
    * true if all coordinates exceed the test level (thus a entity testing in the red channel will report true if it is entirely within a red part of the collision map
    * the first coordinate that falls below, or equals, the test level
    @method Cell.checkFieldAt
    @param {Object} items Argument containing details of how and where to check the cell's collision map image
    @return Vector of first the first coordinates to 'pass' the test
    @private
    **/
		my.Cell.prototype.checkFieldAt = function(items) {
			var i,
				iz,
				myChannel,
				myTest,
				x,
				y,
				coords,
				pos,
				d,
				fieldLabel;
			items = my.safeObject(items);
			myChannel = items.channel || 'anycolor';
			myTest = items.test || 0;
			coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0];
			fieldLabel = this.get('fieldLabel');
			d = my.imageData[fieldLabel];
			for (i = 0, iz = coords.length; i < iz; i += 2) {
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
								items.x = x;
								items.y = y;
								return items;
							}
							break;
						case 'green':
							if (d.data[pos + 1] <= myTest) {
								items.x = x;
								items.y = y;
								return items;
							}
							break;
						case 'blue':
							if (d.data[pos + 2] <= myTest) {
								items.x = x;
								items.y = y;
								return items;
							}
							break;
						case 'alpha':
							if (d.data[pos + 3] <= myTest) {
								items.x = x;
								items.y = y;
								return items;
							}
							break;
						default:
							if (d.data[pos] <= myTest || d.data[pos + 1] <= myTest || d.data[pos + 2] <= myTest) {
								items.x = x;
								items.y = y;
								return items;
							}
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
			var i,
				iz,
				homeTemp,
				awayTemp,
				hits = [],
				arg = {
					tests: []
				},
				types = ['Block', 'Phrase', 'Picture', 'Path', 'Shape', 'Wheel'];
			homeTemp = (my.isa(entity, 'str')) ? my.entity[entity] : entity;
			if (my.contains(types, homeTemp.type)) {
				hits.length = 0;
				for (i = 0, iz = this.entitys.length; i < iz; i++) {
					awayTemp = my.entity[this.entitys[i]];
					if (homeTemp.name !== awayTemp.name) {
						if (awayTemp.visibility) {
							arg.tests = homeTemp.getCollisionPoints();
							if (awayTemp.checkHit(arg)) {
								hits.push(awayTemp);
								continue;
							}
							arg.tests = awayTemp.getCollisionPoints();
							if (homeTemp.checkHit(arg)) {
								hits.push(awayTemp);
								continue;
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
			var j,
				jz,
				k,
				kz,
				hits = [],
				homeTemp,
				awayTemp,
				ts1,
				ts2,
				tresult,
				arg = {
					tests: []
				};
			hits.length = 0;
			for (k = 0, kz = this.entitys.length; k < kz; k++) {
				homeTemp = my.entity[this.entitys[k]];
				if (homeTemp.visibility) {
					for (j = k + 1, jz = this.entitys.length; j < jz; j++) {
						awayTemp = my.entity[this.entitys[j]];
						if (awayTemp.visibility) {
							if (this.regionRadius) {
								ts1 = my.workcols.v1.set(homeTemp.start);
								ts2 = my.workcols.v2.set(awayTemp.start);
								tresult = ts1.vectorSubtract(ts2).getMagnitude();
								if (tresult > this.regionRadius) {
									continue;
								}
							}
							arg.tests = homeTemp.getCollisionPoints();
							if (awayTemp.checkHit(arg)) {
								hits.push([homeTemp.name, awayTemp.name]);
								continue;
							}
							arg.tests = awayTemp.getCollisionPoints();
							if (homeTemp.checkHit(arg)) {
								hits.push([homeTemp.name, awayTemp.name]);
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
			var j,
				jz,
				k,
				kz,
				hits = [],
				thisTemp,
				gTemp,
				arg = {
					tests: []
				},
				ts1,
				ts2,
				tresult;
			if (my.xt(g)) {
				if (my.isa(g, 'str')) {
					if (my.group[g]) {
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
				hits.length = 0;
				for (k = 0, kz = this.entitys.length; k < kz; k++) {
					thisTemp = my.entity[this.entitys[k]];
					if (thisTemp.visibility) {
						for (j = 0, jz = g.entitys.length; j < jz; j++) {
							gTemp = my.entity[g.entitys[j]];
							if (gTemp.visibility) {
								if (this.regionRadius) {
									ts1 = my.workcols.v1.set(thisTemp.start);
									ts2 = my.workcols.v2.set(gTemp.start);
									tresult = ts1.vectorSubtract(ts2).getMagnitude();
									if (tresult > this.regionRadius) {
										continue;
									}
								}
								arg.tests = thisTemp.getCollisionPoints();
								if (gTemp.checkHit(arg)) {
									hits.push([thisTemp.name, gTemp.name]);
									continue;
								}
								arg.tests = gTemp.getCollisionPoints();
								if (thisTemp.checkHit(arg)) {
									hits.push([thisTemp.name, gTemp.name]);
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
			var j,
				jz,
				hits = [],
				result;
			cell = (my.xt(cell)) ? cell : this.cell;
			hits.length = 0;
			for (j = 0, jz = this.entitys.length; j < jz; j++) {
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
		my.d.Entity.collisionArray = [];
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
    Recalculate the current collision point positions for all entitys in the group

    @method Group.resetCollisionPoints
    @return this
    @chainable
    **/
		my.Group.prototype.resetCollisionPoints = function() {
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].resetCollisionPoints();
			}
			return this;
		};
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
			this.collisionVectors = [];
			this.collisionArray = [];
			this.parseCollisionPoints();
			return this;
		};
		/**
    Entity.set hook function - modified by collisions module
    @method Entity.collisionsEntitySet
    @private
    **/
		my.Entity.prototype.collisionsEntitySet = function(items) {
			if (my.xt(items.collisionPoints)) {
				this.parseCollisionPoints();
			}
			if (my.xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.roll)) {
				this.collisionArray.length = 0;
			}
			if (my.xto(items.collisionPoints, items.width, items.height, items.radius, items.pasteWidth, items.pasteHeight)) {
				this.collisionVectors.length = 0;
			}
			if (my.xto(items.field, items.fence)) {
				if (my.xt(items.field)) {
					this.addEntityToCellFields();
				}
				if (my.xt(items.fence)) {
					this.addEntityToCellFences();
				}
			}
		};
		/**
    Recalculate the entity's current collision point positions

    This will be triggered automatically when changing the following attributes via set ort setDelta:

    * for set() - start, startX, startY, handle, handleX, handleY, scale, roll, collisionPoints, width, height, radius, pasteWidth, pasteHeight
    * for setDelta() - start, startX, startY, handle, handleX, handleY, scale, roll, width, height, radius, pasteWidth, pasteHeight

    @method Entity.resetCollisionPoints
    @return this
    @chainable
    **/
		my.Entity.prototype.resetCollisionPoints = function() {
			this.collisionArray.length = 0;
			return this;
		};
		/**
    Entity.setDelta hook function - modified by collisions module
    @method Entity.collisionsEntitySetDelta
    @private
    **/
		my.Entity.prototype.collisionsEntitySetDelta = function(items) {
			if (my.xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.roll)) {
				this.collisionArray.length = 0;
			}
			if (my.xto(items.width, items.height, items.radius, items.pasteWidth, items.pasteHeight)) {
				this.collisionVectors.length = 0;
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
			var i,
				iz;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (my.cell[cells[i]]) {
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
			var i,
				iz;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (my.cell[cells[i]]) {
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
			var i,
				iz;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (my.cell[cells[i]]) {
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
			var i,
				iz;
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (i = 0, iz = cells.length; i < iz; i++) {
				if (my.cell[cells[i]]) {
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
			var arg = {
				coordinates: [],
				test: 0,
				channel: ''
			};
			cell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
			arg.coordinates = this.getCollisionPoints();
			arg.test = this.get('fieldTest');
			arg.channel = this.get('fieldChannel');
			return cell.checkFieldAt(arg);
		};
		/**
    Calculate the current positions of this entity's collision Vectors, taking into account the entity's current position, roll and scale
    @method Entity.getCollisionPoints
    @return Array of coordinate Vectors
    **/
		my.Entity.prototype.getCollisionPoints = function() {
			var i,
				iz;
			if (this.collisionVectors.length === 0) {
				if (my.xt(this.collisionPoints)) {
					this.buildCollisionVectors();
					this.collisionArray.length = 0;
				}
			}
			if (this.collisionArray.length === 0) {
				for (i = 0, iz = this.collisionVectors.length; i < iz; i += 2) {
					my.v.x = (this.flipReverse) ? -this.collisionVectors[i] : this.collisionVectors[i];
					my.v.y = (this.flipReverse) ? -this.collisionVectors[i + 1] : this.collisionVectors[i + 1];
					if (this.roll) {
						my.v.rotate(this.roll);
					}
					if (this.scale !== 1) {
						my.v.scalarMultiply(this.scale);
					}
					my.v.vectorAdd(this.start);
					this.collisionArray.push(my.v.x);
					this.collisionArray.push(my.v.y);
				}
			}
			return this.collisionArray;
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
		my.Entity.prototype.buildCollisionVectors = function() {
			var i,
				iz,
				o,
				w,
				h;
			o = this.getOffsetStartVector().reverse();
			if (my.xt(this.localWidth)) {
				w = this.localWidth / this.scale || 0;
				h = this.localHeight / this.scale || 0;
			}
			else if (my.xt(this.pasteData)) {
				w = this.pasteData.w / this.scale || 0;
				h = this.pasteData.h / this.scale || 0;
			}
			else {
				w = this.width || 0;
				h = this.height || 0;
			}
			this.collisionVectors.length = 0;
			for (i = 0, iz = this.collisionPoints.length; i < iz; i++) {
				if (my.isa(this.collisionPoints[i], 'str')) {
					switch (this.collisionPoints[i]) {
						case 'start':
							this.collisionVectors.push(0);
							this.collisionVectors.push(0);
							break;
						case 'N':
							this.collisionVectors.push((w / 2) - o.x);
							this.collisionVectors.push(-o.y);
							break;
						case 'NE':
							this.collisionVectors.push(w - o.x);
							this.collisionVectors.push(-o.y);
							break;
						case 'E':
							this.collisionVectors.push(w - o.x);
							this.collisionVectors.push((h / 2) - o.y);
							break;
						case 'SE':
							this.collisionVectors.push(w - o.x);
							this.collisionVectors.push(h - o.y);
							break;
						case 'S':
							this.collisionVectors.push((w / 2) - o.x);
							this.collisionVectors.push(h - o.y);
							break;
						case 'SW':
							this.collisionVectors.push(-o.x);
							this.collisionVectors.push(h - o.y);
							break;
						case 'W':
							this.collisionVectors.push(-o.x);
							this.collisionVectors.push((h / 2) - o.y);
							break;
						case 'NW':
							this.collisionVectors.push(-o.x);
							this.collisionVectors.push(-o.y);
							break;
						case 'center':
							this.collisionVectors.push((w / 2) - o.x);
							this.collisionVectors.push((h / 2) - o.y);
							break;
					}
				}
				else if (my.isa(this.collisionPoints[i], 'vector')) {
					this.collisionVectors.push(this.collisionPoints[i].x);
					this.collisionVectors.push(this.collisionPoints[i].y);
				}
			}
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
		my.Entity.prototype.parseCollisionPoints = function() {
			var i,
				iz,
				j,
				jz,
				myItems = [];
			this.collisionPoints = (my.isa(this.collisionPoints, 'arr')) ? this.collisionPoints : [this.collisionPoints];
			myItems.length = 0;
			for (j = 0, jz = this.collisionPoints.length; j < jz; j++) {
				myItems.push(this.collisionPoints[j]);
			}
			this.collisionPoints.length = 0;
			if (my.xt(myItems)) {
				for (i = 0, iz = myItems.length; i < iz; i++) {
					if (my.isa(myItems[i], 'str')) {
						switch (myItems[i].toLowerCase()) {
							case 'all':
								my.pushUnique(this.collisionPoints, 'N');
								my.pushUnique(this.collisionPoints, 'NE');
								my.pushUnique(this.collisionPoints, 'E');
								my.pushUnique(this.collisionPoints, 'SE');
								my.pushUnique(this.collisionPoints, 'S');
								my.pushUnique(this.collisionPoints, 'SW');
								my.pushUnique(this.collisionPoints, 'W');
								my.pushUnique(this.collisionPoints, 'NW');
								my.pushUnique(this.collisionPoints, 'start');
								my.pushUnique(this.collisionPoints, 'center');
								break;
							case 'corners':
								my.pushUnique(this.collisionPoints, 'NE');
								my.pushUnique(this.collisionPoints, 'SE');
								my.pushUnique(this.collisionPoints, 'SW');
								my.pushUnique(this.collisionPoints, 'NW');
								break;
							case 'edges':
								my.pushUnique(this.collisionPoints, 'N');
								my.pushUnique(this.collisionPoints, 'E');
								my.pushUnique(this.collisionPoints, 'S');
								my.pushUnique(this.collisionPoints, 'W');
								break;
							case 'perimeter':
								my.pushUnique(this.collisionPoints, 'N');
								my.pushUnique(this.collisionPoints, 'NE');
								my.pushUnique(this.collisionPoints, 'E');
								my.pushUnique(this.collisionPoints, 'SE');
								my.pushUnique(this.collisionPoints, 'S');
								my.pushUnique(this.collisionPoints, 'SW');
								my.pushUnique(this.collisionPoints, 'W');
								my.pushUnique(this.collisionPoints, 'NW');
								break;
							case 'north':
							case 'n':
								my.pushUnique(this.collisionPoints, 'N');
								break;
							case 'northeast':
							case 'ne':
								my.pushUnique(this.collisionPoints, 'NE');
								break;
							case 'east':
							case 'e':
								my.pushUnique(this.collisionPoints, 'E');
								break;
							case 'southeast':
							case 'se':
								my.pushUnique(this.collisionPoints, 'SE');
								break;
							case 'south':
							case 's':
								my.pushUnique(this.collisionPoints, 'S');
								break;
							case 'southwest':
							case 'sw':
								my.pushUnique(this.collisionPoints, 'SW');
								break;
							case 'west':
							case 'w':
								my.pushUnique(this.collisionPoints, 'W');
								break;
							case 'northwest':
							case 'nw':
								my.pushUnique(this.collisionPoints, 'NW');
								break;
							case 'start':
								my.pushUnique(this.collisionPoints, 'start');
								break;
							case 'center':
								my.pushUnique(this.collisionPoints, 'center');
								break;
						}
					}
					else if (my.isa(myItems[i], 'num')) {
						this.collisionPoints.push(myItems[i]);
					}
					else if (my.isa(myItems[i], 'vector')) {
						this.collisionPoints.push(myItems[i]);
					}
				}
			}
			return this.collisionPoints;
		};

		return my;
	}(scrawl));
}
