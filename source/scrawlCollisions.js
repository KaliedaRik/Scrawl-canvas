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
		scrawlVars.buildFields_cells = [];
		scrawlVars.buildFields_i = 0;
		scrawlVars.buildFields_iz = 0;
		my.buildFields = function(items) {
			scrawlVars.buildFields_cells = (my.xt(items)) ? [].concat(items) : [my.pad[my.currentPad].current];
			if (items === 'all') {
				scrawlVars.buildFields_cells = my.cellnames;
			}
			for (scrawlVars.buildFields_i = 0, scrawlVars.buildFields_iz = scrawlVars.buildFields_cells.length; scrawlVars.buildFields_i < scrawlVars.buildFields_iz; scrawlVars.buildFields_i++) {
				my.cell[scrawlVars.buildFields_cells[scrawlVars.buildFields_i]].buildField();
			}
			return true;
		};

		/**
	Orders all Cell objects associated with this Pad to (re)create their field collision image maps
	@method Pad.buildFields
	@return This
	@chainable
	**/
		scrawlVars.Pad_buildFields_i = 0;
		scrawlVars.Pad_buildFields_iz = 0;
		my.Pad.prototype.buildFields = function() {
			for (scrawlVars.Pad_buildFields_i = 0, scrawlVars.Pad_buildFields_iz = this.cells.length; scrawlVars.Pad_buildFields_i < scrawlVars.Pad_buildFields_iz; scrawlVars.Pad_buildFields_i++) {
				my.cell[this.cells[scrawlVars.Pad_buildFields_i]].buildField();
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
		scrawlVars.Cell_buildFields_i = 0;
		scrawlVars.Cell_buildFields_iz = 0;
		scrawlVars.Cell_buildFields_j = 0;
		scrawlVars.Cell_buildFields_jz = 0;
		scrawlVars.Cell_buildFields_fieldEntitys = [];
		scrawlVars.Cell_buildFields_fenceEntitys = [];
		scrawlVars.Cell_buildFields_tempentity = '';
		scrawlVars.Cell_buildFields_tempfill = '';
		scrawlVars.Cell_buildFields_myfill = '';
		scrawlVars.Cell_buildFields_tempstroke = '';
		scrawlVars.Cell_buildFields_thisContext = null; //scrawl Context object
		scrawlVars.Cell_buildFields_thisEngine = null; //DOM Canvas context object
		scrawlVars.Cell_buildFields_entityContext = null; //scrawl Context object
		my.Cell.prototype.buildField = function() {
			scrawlVars.Cell_buildFields_fieldEntitys = [];
			scrawlVars.Cell_buildFields_fenceEntitys = [];
			scrawlVars.Cell_buildFields_thisContext = my.ctx[this.context];
			scrawlVars.Cell_buildFields_thisEngine = my.context[this.context];
			scrawlVars.Cell_buildFields_myfill = scrawlVars.Cell_buildFields_thisContext.get('fillStyle');
			scrawlVars.Cell_buildFields_thisEngine.fillStyle = 'rgba(0,0,0,1)';
			scrawlVars.Cell_buildFields_thisEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			scrawlVars.Cell_buildFields_thisEngine.fillStyle = scrawlVars.Cell_buildFields_myfill;
			scrawlVars.Cell_buildFields_fieldEntitys = my.group[this.name + '_field'].entitys;
			for (scrawlVars.Cell_buildFields_i = 0, scrawlVars.Cell_buildFields_iz = scrawlVars.Cell_buildFields_fieldEntitys.length; scrawlVars.Cell_buildFields_i < scrawlVars.Cell_buildFields_iz; scrawlVars.Cell_buildFields_i++) {
				scrawlVars.Cell_buildFields_tempentity = my.entity[scrawlVars.Cell_buildFields_fieldEntitys[scrawlVars.Cell_buildFields_i]];
				scrawlVars.Cell_buildFields_entityContext = my.ctx[scrawlVars.Cell_buildFields_tempentity.context];
				scrawlVars.Cell_buildFields_tempfill = scrawlVars.Cell_buildFields_entityContext.fillStyle;
				scrawlVars.Cell_buildFields_tempstroke = scrawlVars.Cell_buildFields_entityContext.strokeStyle;
				scrawlVars.Cell_buildFields_entityContext.fillStyle = 'rgba(255,255,255,1)';
				scrawlVars.Cell_buildFields_entityContext.strokeStyle = 'rgba(255,255,255,1)';
				scrawlVars.Cell_buildFields_tempentity.forceStamp('fillDraw', this.name);
				scrawlVars.Cell_buildFields_entityContext.fillStyle = scrawlVars.Cell_buildFields_tempfill;
				scrawlVars.Cell_buildFields_entityContext.strokeStyle = scrawlVars.Cell_buildFields_tempstroke;
			}
			scrawlVars.Cell_buildFields_fenceEntitys = my.group[this.name + '_fence'].entitys;
			for (scrawlVars.Cell_buildFields_j = 0, scrawlVars.Cell_buildFields_jz = scrawlVars.Cell_buildFields_fenceEntitys.length; scrawlVars.Cell_buildFields_j < scrawlVars.Cell_buildFields_jz; scrawlVars.Cell_buildFields_j++) {
				scrawlVars.Cell_buildFields_tempentity = my.entity[scrawlVars.Cell_buildFields_fenceEntitys[scrawlVars.Cell_buildFields_j]];
				scrawlVars.Cell_buildFields_entityContext = my.ctx[scrawlVars.Cell_buildFields_tempentity.context];
				scrawlVars.Cell_buildFields_tempfill = scrawlVars.Cell_buildFields_entityContext.fillStyle;
				scrawlVars.Cell_buildFields_tempstroke = scrawlVars.Cell_buildFields_entityContext.strokeStyle;
				scrawlVars.Cell_buildFields_entityContext.fillStyle = 'rgba(0,0,0,1)';
				scrawlVars.Cell_buildFields_entityContext.strokeStyle = 'rgba(0,0,0,1)';
				scrawlVars.Cell_buildFields_tempentity.forceStamp('fillDraw', this.name);
				scrawlVars.Cell_buildFields_entityContext.fillStyle = scrawlVars.Cell_buildFields_tempfill;
				scrawlVars.Cell_buildFields_entityContext.strokeStyle = scrawlVars.Cell_buildFields_tempstroke;
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
	* false if it encounters a coordinate outside the bou8ds of its image map
	* true if all coordinates exceed the test level (thus a entity testing in the red channel will report true if it is entirely within a red part of the collision map
	* the first coordinate that falls below, or equals, the test level
	@method Cell.checkFieldAt
	@param {Object} items Argument containing details of how and where to check the cell's collision map image
	@return Vector of first the first coordinates to 'pass' the test
	@private
	**/
		scrawlVars.Cell_checkFieldAt_i = 0;
		scrawlVars.Cell_checkFieldAt_iz = 0;
		scrawlVars.Cell_checkFieldAt_myChannel = '';
		scrawlVars.Cell_checkFieldAt_myTest = 0;
		scrawlVars.Cell_checkFieldAt_x = 0;
		scrawlVars.Cell_checkFieldAt_y = 0;
		scrawlVars.Cell_checkFieldAt_coords = [];
		scrawlVars.Cell_checkFieldAt_pos = 0;
		scrawlVars.Cell_checkFieldAt_d = null; //ImageData data array
		scrawlVars.Cell_checkFieldAt_fieldLabel = '';
		my.Cell.prototype.checkFieldAt = function(items) {
			items = my.safeObject(items);
			scrawlVars.Cell_checkFieldAt_myChannel = items.channel || 'anycolor';
			scrawlVars.Cell_checkFieldAt_myTest = items.test || 0;
			scrawlVars.Cell_checkFieldAt_coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0];
			scrawlVars.Cell_checkFieldAt_fieldLabel = this.get('fieldLabel');
			scrawlVars.Cell_checkFieldAt_d = my.imageData[scrawlVars.Cell_checkFieldAt_fieldLabel];
			for (scrawlVars.Cell_checkFieldAt_i = 0, scrawlVars.Cell_checkFieldAt_iz = scrawlVars.Cell_checkFieldAt_coords.length; scrawlVars.Cell_checkFieldAt_i < scrawlVars.Cell_checkFieldAt_iz; scrawlVars.Cell_checkFieldAt_i += 2) {
				scrawlVars.Cell_checkFieldAt_x = Math.round(scrawlVars.Cell_checkFieldAt_coords[scrawlVars.Cell_checkFieldAt_i]);
				scrawlVars.Cell_checkFieldAt_y = Math.round(scrawlVars.Cell_checkFieldAt_coords[scrawlVars.Cell_checkFieldAt_i + 1]);
				if (!my.isBetween(scrawlVars.Cell_checkFieldAt_x, 0, scrawlVars.Cell_checkFieldAt_d.width, true) || !my.isBetween(scrawlVars.Cell_checkFieldAt_y, 0, scrawlVars.Cell_checkFieldAt_d.height, true)) {
					return false;
				}
				else {
					scrawlVars.Cell_checkFieldAt_pos = ((scrawlVars.Cell_checkFieldAt_y * scrawlVars.Cell_checkFieldAt_d.width) + scrawlVars.Cell_checkFieldAt_x) * 4;
					switch (scrawlVars.Cell_checkFieldAt_myChannel) {
						case 'red':
							if (scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos] <= scrawlVars.Cell_checkFieldAt_myTest) {
								items.x = scrawlVars.Cell_checkFieldAt_x;
								items.y = scrawlVars.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'green':
							if (scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos + 1] <= scrawlVars.Cell_checkFieldAt_myTest) {
								items.x = scrawlVars.Cell_checkFieldAt_x;
								items.y = scrawlVars.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'blue':
							if (scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos + 2] <= scrawlVars.Cell_checkFieldAt_myTest) {
								items.x = scrawlVars.Cell_checkFieldAt_x;
								items.y = scrawlVars.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'alpha':
							if (scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos + 3] <= scrawlVars.Cell_checkFieldAt_myTest) {
								items.x = scrawlVars.Cell_checkFieldAt_x;
								items.y = scrawlVars.Cell_checkFieldAt_y;
								return items;
							}
							break;
						default:
							if (scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos] <= scrawlVars.Cell_checkFieldAt_myTest || scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos + 1] <= scrawlVars.Cell_checkFieldAt_myTest || scrawlVars.Cell_checkFieldAt_d.data[scrawlVars.Cell_checkFieldAt_pos + 2] <= scrawlVars.Cell_checkFieldAt_myTest) {
								items.x = scrawlVars.Cell_checkFieldAt_x;
								items.y = scrawlVars.Cell_checkFieldAt_y;
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
		scrawlVars.Group_getEntitysCollidingWith_i = 0;
		scrawlVars.Group_getEntitysCollidingWith_iz = 0;
		scrawlVars.Group_getEntitysCollidingWith_hits = [];
		scrawlVars.Group_getEntitysCollidingWith_myTests = [];
		my.Group.prototype.getEntitysCollidingWith = function(entity) {
			entity = (my.isa(entity, 'str')) ? my.entity[entity] : entity;
			if (entity.name && my.entity[entity.name]) {
				scrawlVars.Group_getEntitysCollidingWith_hits = [];
				scrawlVars.Group_getEntitysCollidingWith_myTests = entity.getCollisionPoints();
				for (scrawlVars.Group_getEntitysCollidingWith_i = 0, scrawlVars.Group_getEntitysCollidingWith_iz = this.entitys.length; scrawlVars.Group_getEntitysCollidingWith_i < scrawlVars.Group_getEntitysCollidingWith_iz; scrawlVars.Group_getEntitysCollidingWith_i++) {
					if (my.entity[this.entitys[scrawlVars.Group_getEntitysCollidingWith_i]].name !== entity.name) {
						if (my.entity[this.entitys[scrawlVars.Group_getEntitysCollidingWith_i]].get('visibility')) {
							if (my.entity[this.entitys[scrawlVars.Group_getEntitysCollidingWith_i]].checkHit({
								tests: scrawlVars.Group_getEntitysCollidingWith_myTests
							})) {
								scrawlVars.Group_getEntitysCollidingWith_hits.push(this.entitys[scrawlVars.Group_getEntitysCollidingWith_i]);
							}
						}
					}
				}
				return (scrawlVars.Group_getEntitysCollidingWith_hits.length > 0) ? scrawlVars.Group_getEntitysCollidingWith_hits : false;
			}
			return false;
		};
		/**
	Check all entitys in the Group against each other to see if they are in collision
	@method Group.getInGroupEntityHits
	@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
	**/
		scrawlVars.Group_getInGroupEntityHits_i = 0;
		scrawlVars.Group_getInGroupEntityHits_iz = 0;
		scrawlVars.Group_getInGroupEntityHits_j = 0;
		scrawlVars.Group_getInGroupEntityHits_jz = 0;
		scrawlVars.Group_getInGroupEntityHits_k = 0;
		scrawlVars.Group_getInGroupEntityHits_kz = 0;
		scrawlVars.Group_getInGroupEntityHits_hits = [];
		scrawlVars.Group_getInGroupEntityHits_cPoints = null; //raw object
		scrawlVars.Group_getInGroupEntityHits_cViz = null; //raw object
		scrawlVars.Group_getInGroupEntityHits_temp = null; //scrawl Entity object
		scrawlVars.Group_getInGroupEntityHits_ts1 = null; //scrawl Vector object
		scrawlVars.Group_getInGroupEntityHits_ts2 = null; //scrawl Vector object
		scrawlVars.Group_getInGroupEntityHits_tresult = 0;
		my.Group.prototype.getInGroupEntityHits = function() {
			scrawlVars.Group_getInGroupEntityHits_hits = [];
			scrawlVars.Group_getInGroupEntityHits_cPoints = {};
			scrawlVars.Group_getInGroupEntityHits_cViz = {};
			for (scrawlVars.Group_getInGroupEntityHits_i = 0, scrawlVars.Group_getInGroupEntityHits_iz = this.entitys.length; scrawlVars.Group_getInGroupEntityHits_i < scrawlVars.Group_getInGroupEntityHits_iz; scrawlVars.Group_getInGroupEntityHits_i++) {
				scrawlVars.Group_getInGroupEntityHits_temp = my.entity[this.entitys[scrawlVars.Group_getInGroupEntityHits_i]];
				scrawlVars.Group_getInGroupEntityHits_cViz[scrawlVars.Group_getInGroupEntityHits_temp.name] = scrawlVars.Group_getInGroupEntityHits_temp.visibility;
				if (scrawlVars.Group_getInGroupEntityHits_cViz[scrawlVars.Group_getInGroupEntityHits_temp.name]) {
					scrawlVars.Group_getInGroupEntityHits_cPoints[scrawlVars.Group_getInGroupEntityHits_temp.name] = scrawlVars.Group_getInGroupEntityHits_temp.getCollisionPoints();
				}
			}
			for (scrawlVars.Group_getInGroupEntityHits_k = 0, scrawlVars.Group_getInGroupEntityHits_kz = this.entitys.length; scrawlVars.Group_getInGroupEntityHits_k < scrawlVars.Group_getInGroupEntityHits_kz; scrawlVars.Group_getInGroupEntityHits_k++) {
				if (scrawlVars.Group_getInGroupEntityHits_cViz[this.entitys[scrawlVars.Group_getInGroupEntityHits_k]]) {
					for (scrawlVars.Group_getInGroupEntityHits_j = scrawlVars.Group_getInGroupEntityHits_k + 1, scrawlVars.Group_getInGroupEntityHits_jz = this.entitys.length; scrawlVars.Group_getInGroupEntityHits_j < scrawlVars.Group_getInGroupEntityHits_jz; scrawlVars.Group_getInGroupEntityHits_j++) {
						if (scrawlVars.Group_getInGroupEntityHits_cViz[this.entitys[scrawlVars.Group_getInGroupEntityHits_j]]) {
							if (this.regionRadius) {
								scrawlVars.Group_getInGroupEntityHits_ts1 = my.workcols.v1.set(my.entity[this.entitys[scrawlVars.Group_getInGroupEntityHits_k]].start);
								scrawlVars.Group_getInGroupEntityHits_ts2 = my.workcols.v2.set(my.entity[this.entitys[scrawlVars.Group_getInGroupEntityHits_j]].start);
								scrawlVars.Group_getInGroupEntityHits_tresult = scrawlVars.Group_getInGroupEntityHits_ts1.vectorSubtract(scrawlVars.Group_getInGroupEntityHits_ts2).getMagnitude();
								if (scrawlVars.Group_getInGroupEntityHits_tresult > this.regionRadius) {
									continue;
								}
							}
							if (my.entity[this.entitys[scrawlVars.Group_getInGroupEntityHits_j]].checkHit({
								tests: scrawlVars.Group_getInGroupEntityHits_cPoints[this.entitys[scrawlVars.Group_getInGroupEntityHits_k]]
							})) {
								scrawlVars.Group_getInGroupEntityHits_hits.push([this.entitys[scrawlVars.Group_getInGroupEntityHits_k], this.entitys[scrawlVars.Group_getInGroupEntityHits_j]]);
								continue;
							}
							if (my.entity[this.entitys[scrawlVars.Group_getInGroupEntityHits_k]].checkHit({
								tests: scrawlVars.Group_getInGroupEntityHits_cPoints[this.entitys[scrawlVars.Group_getInGroupEntityHits_j]]
							})) {
								scrawlVars.Group_getInGroupEntityHits_hits.push([this.entitys[scrawlVars.Group_getInGroupEntityHits_k], this.entitys[scrawlVars.Group_getInGroupEntityHits_j]]);
								continue;
							}
						}
					}
				}
			}
			return scrawlVars.Group_getInGroupEntityHits_hits;
		};
		/**
	Check all entitys in this Group against all entitys in the argument Group, to see if they are in collision
	@method Group.getBetweenGroupEntityHits
	@param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
	@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
	**/
		scrawlVars.Group_getBetweenGroupEntityHits_i = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_iz = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_j = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_jz = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_k = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_kz = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_l = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_lz = 0;
		scrawlVars.Group_getBetweenGroupEntityHits_hits = [];
		scrawlVars.Group_getBetweenGroupEntityHits_cPoints = null; //raw object
		scrawlVars.Group_getBetweenGroupEntityHits_cViz = null; //raw object
		scrawlVars.Group_getBetweenGroupEntityHits_temp = null; //scrawl Entity object
		scrawlVars.Group_getBetweenGroupEntityHits_ts1 = null; //scrawl Vector object
		scrawlVars.Group_getBetweenGroupEntityHits_ts2 = null; //scrawl Vector object
		scrawlVars.Group_getBetweenGroupEntityHits_tresult = 0;
		my.Group.prototype.getBetweenGroupEntityHits = function(g) {
			scrawlVars.Group_getBetweenGroupEntityHits_hits = [];
			scrawlVars.Group_getBetweenGroupEntityHits_cPoints = {};
			scrawlVars.Group_getBetweenGroupEntityHits_cViz = {};
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
				for (scrawlVars.Group_getBetweenGroupEntityHits_l = 0, scrawlVars.Group_getBetweenGroupEntityHits_lz = this.entitys.length; scrawlVars.Group_getBetweenGroupEntityHits_l < scrawlVars.Group_getBetweenGroupEntityHits_lz; scrawlVars.Group_getBetweenGroupEntityHits_l++) {
					scrawlVars.Group_getBetweenGroupEntityHits_temp = my.entity[this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_l]];
					scrawlVars.Group_getBetweenGroupEntityHits_cViz[scrawlVars.Group_getBetweenGroupEntityHits_temp.name] = scrawlVars.Group_getBetweenGroupEntityHits_temp.visibility;
					if (scrawlVars.Group_getBetweenGroupEntityHits_cViz[scrawlVars.Group_getBetweenGroupEntityHits_temp.name]) {
						scrawlVars.Group_getBetweenGroupEntityHits_cPoints[scrawlVars.Group_getBetweenGroupEntityHits_temp.name] = scrawlVars.Group_getBetweenGroupEntityHits_temp.getCollisionPoints();
					}
				}
				for (scrawlVars.Group_getBetweenGroupEntityHits_i = 0, scrawlVars.Group_getBetweenGroupEntityHits_iz = g.entitys.length; scrawlVars.Group_getBetweenGroupEntityHits_i < scrawlVars.Group_getBetweenGroupEntityHits_iz; scrawlVars.Group_getBetweenGroupEntityHits_i++) {
					scrawlVars.Group_getBetweenGroupEntityHits_temp = my.entity[g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_i]];
					scrawlVars.Group_getBetweenGroupEntityHits_cViz[scrawlVars.Group_getBetweenGroupEntityHits_temp.name] = scrawlVars.Group_getBetweenGroupEntityHits_temp.visibility;
					if (scrawlVars.Group_getBetweenGroupEntityHits_cViz[scrawlVars.Group_getBetweenGroupEntityHits_temp.name]) {
						scrawlVars.Group_getBetweenGroupEntityHits_cPoints[scrawlVars.Group_getBetweenGroupEntityHits_temp.name] = scrawlVars.Group_getBetweenGroupEntityHits_temp.getCollisionPoints();
					}
				}
				for (scrawlVars.Group_getBetweenGroupEntityHits_k = 0, scrawlVars.Group_getBetweenGroupEntityHits_kz = this.entitys.length; scrawlVars.Group_getBetweenGroupEntityHits_k < scrawlVars.Group_getBetweenGroupEntityHits_kz; scrawlVars.Group_getBetweenGroupEntityHits_k++) {
					if (scrawlVars.Group_getBetweenGroupEntityHits_cViz[this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k]]) {
						for (scrawlVars.Group_getBetweenGroupEntityHits_j = 0, scrawlVars.Group_getBetweenGroupEntityHits_jz = g.entitys.length; scrawlVars.Group_getBetweenGroupEntityHits_j < scrawlVars.Group_getBetweenGroupEntityHits_jz; scrawlVars.Group_getBetweenGroupEntityHits_j++) {
							if (scrawlVars.Group_getBetweenGroupEntityHits_cViz[g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]]) {
								if (this.regionRadius) {
									scrawlVars.Group_getBetweenGroupEntityHits_ts1 = my.workcols.v1.set(my.entity[this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k]].start);
									scrawlVars.Group_getBetweenGroupEntityHits_ts2 = my.workcols.v2.set(my.entity[g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]].start);
									scrawlVars.Group_getBetweenGroupEntityHits_tresult = scrawlVars.Group_getBetweenGroupEntityHits_ts1.vectorSubtract(scrawlVars.Group_getBetweenGroupEntityHits_ts2).getMagnitude();
									if (scrawlVars.Group_getBetweenGroupEntityHits_tresult > this.regionRadius) {
										continue;
									}
								}
								if (my.entity[g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]].checkHit({
									tests: scrawlVars.Group_getBetweenGroupEntityHits_cPoints[this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k]]
								})) {
									scrawlVars.Group_getBetweenGroupEntityHits_hits.push([this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k], g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]]);
									continue;
								}
								if (my.entity[this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k]].checkHit({
									tests: scrawlVars.Group_getBetweenGroupEntityHits_cPoints[g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]]
								})) {
									scrawlVars.Group_getBetweenGroupEntityHits_hits.push([this.entitys[scrawlVars.Group_getBetweenGroupEntityHits_k], g.entitys[scrawlVars.Group_getBetweenGroupEntityHits_j]]);
									continue;
								}
							}
						}
					}
				}
				return scrawlVars.Group_getBetweenGroupEntityHits_hits;
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
		scrawlVars.Group_getFieldEntityHits_j = 0;
		scrawlVars.Group_getFieldEntityHits_jz = 0;
		scrawlVars.Group_getFieldEntityHits_hits = [];
		scrawlVars.Group_getFieldEntityHits_result = null; //raw object
		my.Group.prototype.getFieldEntityHits = function(cell) {
			cell = (my.xt(cell)) ? cell : this.cell;
			scrawlVars.Group_getFieldEntityHits_hits = [];
			for (scrawlVars.Group_getFieldEntityHits_j = 0, scrawlVars.Group_getFieldEntityHits_jz = this.entitys.length; scrawlVars.Group_getFieldEntityHits_j < scrawlVars.Group_getFieldEntityHits_jz; scrawlVars.Group_getFieldEntityHits_j++) {
				scrawlVars.Group_getFieldEntityHits_result = my.entity[this.entitys[scrawlVars.Group_getFieldEntityHits_j]].checkField(cell);
				if (!my.isa(scrawlVars.Group_getFieldEntityHits_result, 'bool')) {
					scrawlVars.Group_getFieldEntityHits_hits.push([this.entitys[scrawlVars.Group_getFieldEntityHits_j], scrawlVars.Group_getFieldEntityHits_result]);
				}
			}
			return scrawlVars.Group_getFieldEntityHits_hits;
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
		scrawlVars.Entity_addEntityToCellFields_i = 0;
		scrawlVars.Entity_addEntityToCellFields_iz = 0;
		my.Entity.prototype.addEntityToCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (scrawlVars.Entity_addEntityToCellFields_i = 0, scrawlVars.Entity_addEntityToCellFields_iz = cells.length; scrawlVars.Entity_addEntityToCellFields_i < scrawlVars.Entity_addEntityToCellFields_iz; scrawlVars.Entity_addEntityToCellFields_i++) {
				if (my.cell[cells[scrawlVars.Entity_addEntityToCellFields_i]]) {
					my.group[cells[scrawlVars.Entity_addEntityToCellFields_i] + '_field'].addEntitysToGroup(this.name);
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
		scrawlVars.Entity_addEntityToCellFences_i = 0;
		scrawlVars.Entity_addEntityToCellFences_iz = 0;
		my.Entity.prototype.addEntityToCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (scrawlVars.Entity_addEntityToCellFences_i = 0, scrawlVars.Entity_addEntityToCellFences_iz = cells.length; scrawlVars.Entity_addEntityToCellFences_i < scrawlVars.Entity_addEntityToCellFences_iz; scrawlVars.Entity_addEntityToCellFences_i++) {
				if (my.cell[cells[scrawlVars.Entity_addEntityToCellFences_i]]) {
					my.group[cells[scrawlVars.Entity_addEntityToCellFences_i] + '_fence'].addEntitysToGroup(this.name);
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
		scrawlVars.Entity_removeEntityFromCellFields_i = 0;
		scrawlVars.Entity_removeEntityFromCellFields_iz = 0;
		my.Entity.prototype.removeEntityFromCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (scrawlVars.Entity_removeEntityFromCellFields_i = 0, scrawlVars.Entity_removeEntityFromCellFields_iz = cells.length; scrawlVars.Entity_removeEntityFromCellFields_i < scrawlVars.Entity_removeEntityFromCellFields_iz; scrawlVars.Entity_removeEntityFromCellFields_i++) {
				if (my.cell[cells[scrawlVars.Entity_removeEntityFromCellFields_i]]) {
					my.group[cells[scrawlVars.Entity_removeEntityFromCellFields_i] + '_field'].removeEntitysFromGroup(this.name);
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
		scrawlVars.Entity_removeEntityFromCellFences_i = 0;
		scrawlVars.Entity_removeEntityFromCellFences_iz = 0;
		my.Entity.prototype.removeEntityFromCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (scrawlVars.Entity_removeEntityFromCellFences_i = 0, scrawlVars.Entity_removeEntityFromCellFences_iz = cells.length; scrawlVars.Entity_removeEntityFromCellFences_i < scrawlVars.Entity_removeEntityFromCellFences_iz; scrawlVars.Entity_removeEntityFromCellFences_i++) {
				if (my.cell[cells[scrawlVars.Entity_removeEntityFromCellFences_i]]) {
					my.group[cells[scrawlVars.Entity_removeEntityFromCellFences_i] + '_fence'].removeEntitysFromGroup(this.name);
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
		scrawlVars.Entity_checkField_cell = null; //scrawl Cell object
		my.Entity.prototype.checkField = function(cell) {
			scrawlVars.Entity_checkField_cell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
			return scrawlVars.Entity_checkField_cell.checkFieldAt({
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
		scrawlVars.Entity_getCollisionPoints_i = 0;
		scrawlVars.Entity_getCollisionPoints_iz = 0;
		scrawlVars.Entity_getCollisionPoints_p = [];
		scrawlVars.Entity_getCollisionPoints_v = null; //scrawl Vector object
		scrawlVars.Entity_getCollisionPoints_c = [];
		my.Entity.prototype.getCollisionPoints = function() {
			scrawlVars.Entity_getCollisionPoints_p = [];
			if (!my.xt(this.collisionVectors)) {
				if (my.xt(this.collisionPoints)) {
					this.buildCollisionVectors();
				}
			}
			scrawlVars.Entity_getCollisionPoints_c = this.collisionVectors || false;
			if (scrawlVars.Entity_getCollisionPoints_c) {
				for (scrawlVars.Entity_getCollisionPoints_i = 0, scrawlVars.Entity_getCollisionPoints_iz = scrawlVars.Entity_getCollisionPoints_c.length; scrawlVars.Entity_getCollisionPoints_i < scrawlVars.Entity_getCollisionPoints_iz; scrawlVars.Entity_getCollisionPoints_i += 2) {
					scrawlVars.Entity_getCollisionPoints_v = my.v;
					scrawlVars.Entity_getCollisionPoints_v.x = (this.flipReverse) ? -scrawlVars.Entity_getCollisionPoints_c[scrawlVars.Entity_getCollisionPoints_i] : scrawlVars.Entity_getCollisionPoints_c[scrawlVars.Entity_getCollisionPoints_i];
					scrawlVars.Entity_getCollisionPoints_v.y = (this.flipUpend) ? -scrawlVars.Entity_getCollisionPoints_c[scrawlVars.Entity_getCollisionPoints_i + 1] : scrawlVars.Entity_getCollisionPoints_c[scrawlVars.Entity_getCollisionPoints_i + 1];
					if (this.roll) {
						scrawlVars.Entity_getCollisionPoints_v.rotate(this.roll);
					}
					if (this.scale !== 1) {
						scrawlVars.Entity_getCollisionPoints_v.scalarMultiply(this.scale);
					}
					scrawlVars.Entity_getCollisionPoints_v.vectorAdd(this.start);
					scrawlVars.Entity_getCollisionPoints_p.push(scrawlVars.Entity_getCollisionPoints_v.x);
					scrawlVars.Entity_getCollisionPoints_p.push(scrawlVars.Entity_getCollisionPoints_v.y);
				}
				return scrawlVars.Entity_getCollisionPoints_p;
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
		scrawlVars.Entity_getCollisionPoints_i = 0;
		scrawlVars.Entity_getCollisionPoints_iz = 0;
		scrawlVars.Entity_getCollisionPoints_p = [];
		scrawlVars.Entity_getCollisionPoints_o = null; //scrawl Vector object
		scrawlVars.Entity_getCollisionPoints_w = 0;
		scrawlVars.Entity_getCollisionPoints_h = 0;
		scrawlVars.Entity_getCollisionPoints_c = [];
		my.Entity.prototype.buildCollisionVectors = function(items) {
			scrawlVars.Entity_getCollisionPoints_p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints;
			scrawlVars.Entity_getCollisionPoints_o = this.getOffsetStartVector().reverse();
			scrawlVars.Entity_getCollisionPoints_w = this.width;
			scrawlVars.Entity_getCollisionPoints_h = this.height;
			scrawlVars.Entity_getCollisionPoints_c = [];
			for (scrawlVars.Entity_getCollisionPoints_i = 0, scrawlVars.Entity_getCollisionPoints_iz = scrawlVars.Entity_getCollisionPoints_p.length; scrawlVars.Entity_getCollisionPoints_i < scrawlVars.Entity_getCollisionPoints_iz; scrawlVars.Entity_getCollisionPoints_i++) {
				if (my.isa(scrawlVars.Entity_getCollisionPoints_p[scrawlVars.Entity_getCollisionPoints_i], 'str')) {
					switch (scrawlVars.Entity_getCollisionPoints_p[scrawlVars.Entity_getCollisionPoints_i]) {
						case 'start':
							scrawlVars.Entity_getCollisionPoints_c.push(0);
							scrawlVars.Entity_getCollisionPoints_c.push(0);
							break;
						case 'N':
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_w / 2) - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'NE':
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_w - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'E':
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_w - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_h / 2) - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'SE':
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_w - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_h - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'S':
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_w / 2) - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_h - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'SW':
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_h - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'W':
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_h / 2) - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'NW':
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push(-scrawlVars.Entity_getCollisionPoints_o.y);
							break;
						case 'center':
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_w / 2) - scrawlVars.Entity_getCollisionPoints_o.x);
							scrawlVars.Entity_getCollisionPoints_c.push((scrawlVars.Entity_getCollisionPoints_h / 2) - scrawlVars.Entity_getCollisionPoints_o.y);
							break;
					}
				}
				else if (my.isa(scrawlVars.Entity_getCollisionPoints_p[scrawlVars.Entity_getCollisionPoints_i], 'vector')) {
					scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_p[scrawlVars.Entity_getCollisionPoints_i].x);
					scrawlVars.Entity_getCollisionPoints_c.push(scrawlVars.Entity_getCollisionPoints_p[scrawlVars.Entity_getCollisionPoints_i].y);
				}
			}
			this.collisionVectors = scrawlVars.Entity_getCollisionPoints_c;
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
		scrawlVars.Entity_parseCollisionPoints_i = 0;
		scrawlVars.Entity_parseCollisionPoints_iz = 0;
		scrawlVars.Entity_parseCollisionPoints_p = [];
		scrawlVars.Entity_parseCollisionPoints_myItems = [];
		my.Entity.prototype.parseCollisionPoints = function(items) {
			scrawlVars.Entity_parseCollisionPoints_myItems = (my.xt(items)) ? [].concat(items) : [];
			scrawlVars.Entity_parseCollisionPoints_p = [];
			for (scrawlVars.Entity_parseCollisionPoints_i = 0, scrawlVars.Entity_parseCollisionPoints_iz = scrawlVars.Entity_parseCollisionPoints_myItems.length; scrawlVars.Entity_parseCollisionPoints_i < scrawlVars.Entity_parseCollisionPoints_iz; scrawlVars.Entity_parseCollisionPoints_i++) {
				if (my.isa(scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i], 'str')) {
					switch (scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i].toLowerCase()) {
						case 'all':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'N');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'E');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'S');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SW');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'W');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NW');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'start');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'center');
							break;
						case 'corners':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SW');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NW');
							break;
						case 'edges':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'N');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'E');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'S');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'W');
							break;
						case 'perimeter':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'N');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'E');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SE');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'S');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SW');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'W');
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NW');
							break;
						case 'north':
						case 'n':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'N');
							break;
						case 'northeast':
						case 'ne':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NE');
							break;
						case 'east':
						case 'e':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'E');
							break;
						case 'southeast':
						case 'se':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SE');
							break;
						case 'south':
						case 's':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'S');
							break;
						case 'southwest':
						case 'sw':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'SW');
							break;
						case 'west':
						case 'w':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'W');
							break;
						case 'northwest':
						case 'nw':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'NW');
							break;
						case 'start':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'start');
							break;
						case 'center':
							my.pushUnique(scrawlVars.Entity_parseCollisionPoints_p, 'center');
							break;
					}
				}
				else if (my.isa(scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i], 'num')) {
					scrawlVars.Entity_parseCollisionPoints_p.push(scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i]);
				}
				else if (my.isa(scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i], 'vector')) {
					scrawlVars.Entity_parseCollisionPoints_p.push(scrawlVars.Entity_parseCollisionPoints_myItems[scrawlVars.Entity_parseCollisionPoints_i]);
				}
			}
			this.collisionPoints = scrawlVars.Entity_parseCollisionPoints_p;
			return scrawlVars.Entity_parseCollisionPoints_p;
		};

		return my;
	}(scrawl));
}
