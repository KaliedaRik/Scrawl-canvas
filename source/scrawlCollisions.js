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
	var scrawl = (function(my, S) {
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
		S.buildFields_cells = [];
		S.buildFields_i = 0;
		S.buildFields_iz = 0;
		my.buildFields = function(items) {
			S.buildFields_cells = (my.xt(items)) ? [].concat(items) : [my.pad[my.currentPad].current];
			if (items === 'all') {
				S.buildFields_cells = my.cellnames;
			}
			for (S.buildFields_i = 0, S.buildFields_iz = S.buildFields_cells.length; S.buildFields_i < S.buildFields_iz; S.buildFields_i++) {
				my.cell[S.buildFields_cells[S.buildFields_i]].buildField();
			}
			return true;
		};

		/**
    Orders all Cell objects associated with this Pad to (re)create their field collision image maps
    @method Pad.buildFields
    @return This
    @chainable
    **/
		S.Pad_buildFields_i = 0;
		S.Pad_buildFields_iz = 0;
		my.Pad.prototype.buildFields = function() {
			for (S.Pad_buildFields_i = 0, S.Pad_buildFields_iz = this.cells.length; S.Pad_buildFields_i < S.Pad_buildFields_iz; S.Pad_buildFields_i++) {
				my.cell[this.cells[S.Pad_buildFields_i]].buildField();
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
		S.Cell_buildFields_i = 0;
		S.Cell_buildFields_iz = 0;
		S.Cell_buildFields_j = 0;
		S.Cell_buildFields_jz = 0;
		S.Cell_buildFields_fieldEntitys = [];
		S.Cell_buildFields_fenceEntitys = [];
		S.Cell_buildFields_tempentity = '';
		S.Cell_buildFields_tempfill = '';
		S.Cell_buildFields_myfill = '';
		S.Cell_buildFields_tempstroke = '';
		S.Cell_buildFields_thisContext = null; //scrawl Context object
		S.Cell_buildFields_thisEngine = null; //DOM Canvas context object
		S.Cell_buildFields_entityContext = null; //scrawl Context object
		my.Cell.prototype.buildField = function() {
			S.Cell_buildFields_fieldEntitys = [];
			S.Cell_buildFields_fenceEntitys = [];
			S.Cell_buildFields_thisContext = my.ctx[this.context];
			S.Cell_buildFields_thisEngine = my.context[this.context];
			S.Cell_buildFields_myfill = S.Cell_buildFields_thisContext.get('fillStyle');
			S.Cell_buildFields_thisEngine.fillStyle = 'rgba(0,0,0,1)';
			S.Cell_buildFields_thisEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			S.Cell_buildFields_thisEngine.fillStyle = S.Cell_buildFields_myfill;
			S.Cell_buildFields_fieldEntitys = my.group[this.name + '_field'].entitys;
			for (S.Cell_buildFields_i = 0, S.Cell_buildFields_iz = S.Cell_buildFields_fieldEntitys.length; S.Cell_buildFields_i < S.Cell_buildFields_iz; S.Cell_buildFields_i++) {
				S.Cell_buildFields_tempentity = my.entity[S.Cell_buildFields_fieldEntitys[S.Cell_buildFields_i]];
				S.Cell_buildFields_entityContext = my.ctx[S.Cell_buildFields_tempentity.context];
				S.Cell_buildFields_tempfill = S.Cell_buildFields_entityContext.fillStyle;
				S.Cell_buildFields_tempstroke = S.Cell_buildFields_entityContext.strokeStyle;
				S.Cell_buildFields_entityContext.fillStyle = 'rgba(255,255,255,1)';
				S.Cell_buildFields_entityContext.strokeStyle = 'rgba(255,255,255,1)';
				S.Cell_buildFields_tempentity.forceStamp('fillDraw', this.name);
				S.Cell_buildFields_entityContext.fillStyle = S.Cell_buildFields_tempfill;
				S.Cell_buildFields_entityContext.strokeStyle = S.Cell_buildFields_tempstroke;
			}
			S.Cell_buildFields_fenceEntitys = my.group[this.name + '_fence'].entitys;
			for (S.Cell_buildFields_j = 0, S.Cell_buildFields_jz = S.Cell_buildFields_fenceEntitys.length; S.Cell_buildFields_j < S.Cell_buildFields_jz; S.Cell_buildFields_j++) {
				S.Cell_buildFields_tempentity = my.entity[S.Cell_buildFields_fenceEntitys[S.Cell_buildFields_j]];
				S.Cell_buildFields_entityContext = my.ctx[S.Cell_buildFields_tempentity.context];
				S.Cell_buildFields_tempfill = S.Cell_buildFields_entityContext.fillStyle;
				S.Cell_buildFields_tempstroke = S.Cell_buildFields_entityContext.strokeStyle;
				S.Cell_buildFields_entityContext.fillStyle = 'rgba(0,0,0,1)';
				S.Cell_buildFields_entityContext.strokeStyle = 'rgba(0,0,0,1)';
				S.Cell_buildFields_tempentity.forceStamp('fillDraw', this.name);
				S.Cell_buildFields_entityContext.fillStyle = S.Cell_buildFields_tempfill;
				S.Cell_buildFields_entityContext.strokeStyle = S.Cell_buildFields_tempstroke;
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
		S.Cell_checkFieldAt_i = 0;
		S.Cell_checkFieldAt_iz = 0;
		S.Cell_checkFieldAt_myChannel = '';
		S.Cell_checkFieldAt_myTest = 0;
		S.Cell_checkFieldAt_x = 0;
		S.Cell_checkFieldAt_y = 0;
		S.Cell_checkFieldAt_coords = [];
		S.Cell_checkFieldAt_pos = 0;
		S.Cell_checkFieldAt_d = null; //ImageData data array
		S.Cell_checkFieldAt_fieldLabel = '';
		my.Cell.prototype.checkFieldAt = function(items) {
			items = my.safeObject(items);
			S.Cell_checkFieldAt_myChannel = items.channel || 'anycolor';
			S.Cell_checkFieldAt_myTest = items.test || 0;
			S.Cell_checkFieldAt_coords = (items.coordinates) ? items.coordinates : [items.x || 0, items.y || 0];
			S.Cell_checkFieldAt_fieldLabel = this.get('fieldLabel');
			S.Cell_checkFieldAt_d = my.imageData[S.Cell_checkFieldAt_fieldLabel];
			for (S.Cell_checkFieldAt_i = 0, S.Cell_checkFieldAt_iz = S.Cell_checkFieldAt_coords.length; S.Cell_checkFieldAt_i < S.Cell_checkFieldAt_iz; S.Cell_checkFieldAt_i += 2) {
				S.Cell_checkFieldAt_x = Math.round(S.Cell_checkFieldAt_coords[S.Cell_checkFieldAt_i]);
				S.Cell_checkFieldAt_y = Math.round(S.Cell_checkFieldAt_coords[S.Cell_checkFieldAt_i + 1]);
				if (!my.isBetween(S.Cell_checkFieldAt_x, 0, S.Cell_checkFieldAt_d.width, true) || !my.isBetween(S.Cell_checkFieldAt_y, 0, S.Cell_checkFieldAt_d.height, true)) {
					return false;
				}
				else {
					S.Cell_checkFieldAt_pos = ((S.Cell_checkFieldAt_y * S.Cell_checkFieldAt_d.width) + S.Cell_checkFieldAt_x) * 4;
					switch (S.Cell_checkFieldAt_myChannel) {
						case 'red':
							if (S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos] <= S.Cell_checkFieldAt_myTest) {
								items.x = S.Cell_checkFieldAt_x;
								items.y = S.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'green':
							if (S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos + 1] <= S.Cell_checkFieldAt_myTest) {
								items.x = S.Cell_checkFieldAt_x;
								items.y = S.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'blue':
							if (S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos + 2] <= S.Cell_checkFieldAt_myTest) {
								items.x = S.Cell_checkFieldAt_x;
								items.y = S.Cell_checkFieldAt_y;
								return items;
							}
							break;
						case 'alpha':
							if (S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos + 3] <= S.Cell_checkFieldAt_myTest) {
								items.x = S.Cell_checkFieldAt_x;
								items.y = S.Cell_checkFieldAt_y;
								return items;
							}
							break;
						default:
							if (S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos] <= S.Cell_checkFieldAt_myTest || S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos + 1] <= S.Cell_checkFieldAt_myTest || S.Cell_checkFieldAt_d.data[S.Cell_checkFieldAt_pos + 2] <= S.Cell_checkFieldAt_myTest) {
								items.x = S.Cell_checkFieldAt_x;
								items.y = S.Cell_checkFieldAt_y;
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
		S.Group_getEntitysCollidingWith_i = 0;
		S.Group_getEntitysCollidingWith_iz = 0;
		S.Group_getEntitysCollidingWith_homeTemp = null; //scrawl Entity object
		S.Group_getEntitysCollidingWith_awayTemp = null; //scrawl Entity object
		S.Group_getEntitysCollidingWith_hits = [];
		S.Group_getEntitysCollidingWith_arg = {
			tests: []
		};
		S.Group_getEntitysCollidingWith_types = ['Block', 'Phrase', 'Picture', 'Path', 'Shape', 'Wheel'];
		my.Group.prototype.getEntitysCollidingWith = function(entity) {
			S.Group_getEntitysCollidingWith_homeTemp = (my.isa(entity, 'str')) ? my.entity[entity] : entity;
			if (my.contains(S.Group_getEntitysCollidingWith_types, S.Group_getEntitysCollidingWith_homeTemp.type)) {
				S.Group_getEntitysCollidingWith_hits.length = 0;
				for (S.Group_getEntitysCollidingWith_i = 0, S.Group_getEntitysCollidingWith_iz = this.entitys.length; S.Group_getEntitysCollidingWith_i < S.Group_getEntitysCollidingWith_iz; S.Group_getEntitysCollidingWith_i++) {
					S.Group_getEntitysCollidingWith_awayTemp = my.entity[this.entitys[S.Group_getEntitysCollidingWith_i]];
					if (S.Group_getEntitysCollidingWith_homeTemp.name !== S.Group_getEntitysCollidingWith_awayTemp.name) {
						if (S.Group_getEntitysCollidingWith_awayTemp.visibility) {
							S.Group_getEntitysCollidingWith_arg.tests = S.Group_getEntitysCollidingWith_homeTemp.getCollisionPoints();
							if (S.Group_getEntitysCollidingWith_awayTemp.checkHit(S.Group_getEntitysCollidingWith_arg)) {
								S.Group_getEntitysCollidingWith_hits.push(S.Group_getEntitysCollidingWith_awayTemp);
								continue;
							}
							S.Group_getEntitysCollidingWith_arg.tests = S.Group_getEntitysCollidingWith_awayTemp.getCollisionPoints();
							if (S.Group_getEntitysCollidingWith_homeTemp.checkHit(S.Group_getEntitysCollidingWith_arg)) {
								S.Group_getEntitysCollidingWith_hits.push(S.Group_getEntitysCollidingWith_awayTemp);
								continue;
							}
						}
					}
				}
				return (S.Group_getEntitysCollidingWith_hits.length > 0) ? S.Group_getEntitysCollidingWith_hits : false;
			}
			return false;
		};
		/**
    Check all entitys in the Group against each other to see if they are in collision
    @method Group.getInGroupEntityHits
    @return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
    **/
		S.Group_getInGroupEntityHits_j = 0;
		S.Group_getInGroupEntityHits_jz = 0;
		S.Group_getInGroupEntityHits_k = 0;
		S.Group_getInGroupEntityHits_kz = 0;
		S.Group_getInGroupEntityHits_hits = [];
		S.Group_getInGroupEntityHits_homeTemp = null; //scrawl Entity object
		S.Group_getInGroupEntityHits_awayTemp = null; //scrawl Entity object
		S.Group_getInGroupEntityHits_ts1 = null; //scrawl Vector object
		S.Group_getInGroupEntityHits_ts2 = null; //scrawl Vector object
		S.Group_getInGroupEntityHits_tresult = 0;
		S.Group_getInGroupEntityHits_arg = {
			tests: []
		};
		my.Group.prototype.getInGroupEntityHits = function() {
			S.Group_getInGroupEntityHits_hits.length = 0;
			for (S.Group_getInGroupEntityHits_k = 0, S.Group_getInGroupEntityHits_kz = this.entitys.length; S.Group_getInGroupEntityHits_k < S.Group_getInGroupEntityHits_kz; S.Group_getInGroupEntityHits_k++) {
				S.Group_getInGroupEntityHits_homeTemp = my.entity[this.entitys[S.Group_getInGroupEntityHits_k]];
				if (S.Group_getInGroupEntityHits_homeTemp.visibility) {
					for (S.Group_getInGroupEntityHits_j = S.Group_getInGroupEntityHits_k + 1, S.Group_getInGroupEntityHits_jz = this.entitys.length; S.Group_getInGroupEntityHits_j < S.Group_getInGroupEntityHits_jz; S.Group_getInGroupEntityHits_j++) {
						S.Group_getInGroupEntityHits_awayTemp = my.entity[this.entitys[S.Group_getInGroupEntityHits_j]];
						if (S.Group_getInGroupEntityHits_awayTemp.visibility) {
							if (this.regionRadius) {
								S.Group_getInGroupEntityHits_ts1 = my.workcols.v1.set(S.Group_getInGroupEntityHits_homeTemp.start);
								S.Group_getInGroupEntityHits_ts2 = my.workcols.v2.set(S.Group_getInGroupEntityHits_awayTemp.start);
								S.Group_getInGroupEntityHits_tresult = S.Group_getInGroupEntityHits_ts1.vectorSubtract(S.Group_getInGroupEntityHits_ts2).getMagnitude();
								if (S.Group_getInGroupEntityHits_tresult > this.regionRadius) {
									continue;
								}
							}
							S.Group_getInGroupEntityHits_arg.tests = S.Group_getInGroupEntityHits_homeTemp.collisionArray;
							if (S.Group_getInGroupEntityHits_awayTemp.checkHit(S.Group_getInGroupEntityHits_arg)) {
								S.Group_getInGroupEntityHits_hits.push([S.Group_getInGroupEntityHits_homeTemp.name, S.Group_getInGroupEntityHits_awayTemp.name]);
								continue;
							}
							S.Group_getInGroupEntityHits_arg.tests = S.Group_getInGroupEntityHits_awayTemp.collisionArray;
							if (S.Group_getInGroupEntityHits_homeTemp.checkHit(S.Group_getInGroupEntityHits_arg)) {
								S.Group_getInGroupEntityHits_hits.push([S.Group_getInGroupEntityHits_homeTemp.name, S.Group_getInGroupEntityHits_awayTemp.name]);
								continue;
							}
						}
					}
				}
			}
			return S.Group_getInGroupEntityHits_hits;
		};
		/**
    Check all entitys in this Group against all entitys in the argument Group, to see if they are in collision
    @method Group.getBetweenGroupEntityHits
    @param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
    @return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of entitys currently in collision
    **/
		S.Group_getBetweenGroupEntityHits_j = 0;
		S.Group_getBetweenGroupEntityHits_jz = 0;
		S.Group_getBetweenGroupEntityHits_k = 0;
		S.Group_getBetweenGroupEntityHits_kz = 0;
		S.Group_getBetweenGroupEntityHits_hits = [];
		S.Group_getBetweenGroupEntityHits_thisTemp = null; //scrawl Entity object
		S.Group_getBetweenGroupEntityHits_gTemp = null; //scrawl Entity object
		S.Group_getBetweenGroupEntityHits_arg = {
			tests: []
		};
		S.Group_getBetweenGroupEntityHits_ts1 = null; //scrawl Vector object
		S.Group_getBetweenGroupEntityHits_ts2 = null; //scrawl Vector object
		S.Group_getBetweenGroupEntityHits_tresult = 0;
		my.Group.prototype.getBetweenGroupEntityHits = function(g) {
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
				S.Group_getBetweenGroupEntityHits_hits.length = 0;
				for (S.Group_getBetweenGroupEntityHits_k = 0, S.Group_getBetweenGroupEntityHits_kz = this.entitys.length; S.Group_getBetweenGroupEntityHits_k < S.Group_getBetweenGroupEntityHits_kz; S.Group_getBetweenGroupEntityHits_k++) {
					S.Group_getBetweenGroupEntityHits_thisTemp = my.entity[this.entitys[S.Group_getBetweenGroupEntityHits_k]];
					if (S.Group_getBetweenGroupEntityHits_thisTemp.visibility) {
						for (S.Group_getBetweenGroupEntityHits_j = 0, S.Group_getBetweenGroupEntityHits_jz = g.entitys.length; S.Group_getBetweenGroupEntityHits_j < S.Group_getBetweenGroupEntityHits_jz; S.Group_getBetweenGroupEntityHits_j++) {
							S.Group_getBetweenGroupEntityHits_gTemp = my.entity[g.entitys[S.Group_getBetweenGroupEntityHits_j]];
							if (S.Group_getBetweenGroupEntityHits_gTemp.visibility) {
								if (this.regionRadius) {
									S.Group_getBetweenGroupEntityHits_ts1 = my.workcols.v1.set(S.Group_getBetweenGroupEntityHits_thisTemp.start);
									S.Group_getBetweenGroupEntityHits_ts2 = my.workcols.v2.set(S.Group_getBetweenGroupEntityHits_gTemp.start);
									S.Group_getBetweenGroupEntityHits_tresult = S.Group_getBetweenGroupEntityHits_ts1.vectorSubtract(S.Group_getBetweenGroupEntityHits_ts2).getMagnitude();
									if (S.Group_getBetweenGroupEntityHits_tresult > this.regionRadius) {
										continue;
									}
								}
								S.Group_getBetweenGroupEntityHits_arg.tests = S.Group_getBetweenGroupEntityHits_thisTemp.collisionArray;
								if (S.Group_getBetweenGroupEntityHits_gTemp.checkHit(S.Group_getBetweenGroupEntityHits_arg)) {
									S.Group_getBetweenGroupEntityHits_hits.push([S.Group_getBetweenGroupEntityHits_thisTemp.name, S.Group_getBetweenGroupEntityHits_gTemp.name]);
									continue;
								}
								S.Group_getBetweenGroupEntityHits_arg.tests = S.Group_getBetweenGroupEntityHits_gTemp.collisionArray;
								if (S.Group_getBetweenGroupEntityHits_thisTemp.checkHit(S.Group_getBetweenGroupEntityHits_arg)) {
									S.Group_getBetweenGroupEntityHits_hits.push([S.Group_getBetweenGroupEntityHits_thisTemp.name, S.Group_getBetweenGroupEntityHits_gTemp.name]);
									continue;
								}
							}
						}
					}
				}
				return S.Group_getBetweenGroupEntityHits_hits;
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
		S.Group_getFieldEntityHits_j = 0;
		S.Group_getFieldEntityHits_jz = 0;
		S.Group_getFieldEntityHits_hits = [];
		S.Group_getFieldEntityHits_result = null; //raw object
		my.Group.prototype.getFieldEntityHits = function(cell) {
			cell = (my.xt(cell)) ? cell : this.cell;
			S.Group_getFieldEntityHits_hits.length = 0;
			for (S.Group_getFieldEntityHits_j = 0, S.Group_getFieldEntityHits_jz = this.entitys.length; S.Group_getFieldEntityHits_j < S.Group_getFieldEntityHits_jz; S.Group_getFieldEntityHits_j++) {
				S.Group_getFieldEntityHits_result = my.entity[this.entitys[S.Group_getFieldEntityHits_j]].checkField(cell);
				if (!my.isa(S.Group_getFieldEntityHits_result, 'bool')) {
					S.Group_getFieldEntityHits_hits.push([this.entitys[S.Group_getFieldEntityHits_j], S.Group_getFieldEntityHits_result]);
				}
			}
			return S.Group_getFieldEntityHits_hits;
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
		S.Entity_addEntityToCellFields_i = 0;
		S.Entity_addEntityToCellFields_iz = 0;
		my.Entity.prototype.addEntityToCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (S.Entity_addEntityToCellFields_i = 0, S.Entity_addEntityToCellFields_iz = cells.length; S.Entity_addEntityToCellFields_i < S.Entity_addEntityToCellFields_iz; S.Entity_addEntityToCellFields_i++) {
				if (my.cell[cells[S.Entity_addEntityToCellFields_i]]) {
					my.group[cells[S.Entity_addEntityToCellFields_i] + '_field'].addEntitysToGroup(this.name);
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
		S.Entity_addEntityToCellFences_i = 0;
		S.Entity_addEntityToCellFences_iz = 0;
		my.Entity.prototype.addEntityToCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (S.Entity_addEntityToCellFences_i = 0, S.Entity_addEntityToCellFences_iz = cells.length; S.Entity_addEntityToCellFences_i < S.Entity_addEntityToCellFences_iz; S.Entity_addEntityToCellFences_i++) {
				if (my.cell[cells[S.Entity_addEntityToCellFences_i]]) {
					my.group[cells[S.Entity_addEntityToCellFences_i] + '_fence'].addEntitysToGroup(this.name);
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
		S.Entity_removeEntityFromCellFields_i = 0;
		S.Entity_removeEntityFromCellFields_iz = 0;
		my.Entity.prototype.removeEntityFromCellFields = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (S.Entity_removeEntityFromCellFields_i = 0, S.Entity_removeEntityFromCellFields_iz = cells.length; S.Entity_removeEntityFromCellFields_i < S.Entity_removeEntityFromCellFields_iz; S.Entity_removeEntityFromCellFields_i++) {
				if (my.cell[cells[S.Entity_removeEntityFromCellFields_i]]) {
					my.group[cells[S.Entity_removeEntityFromCellFields_i] + '_field'].removeEntitysFromGroup(this.name);
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
		S.Entity_removeEntityFromCellFences_i = 0;
		S.Entity_removeEntityFromCellFences_iz = 0;
		my.Entity.prototype.removeEntityFromCellFences = function(cells) {
			cells = (my.xt(cells)) ? [].concat(cells) : [this.group];
			for (S.Entity_removeEntityFromCellFences_i = 0, S.Entity_removeEntityFromCellFences_iz = cells.length; S.Entity_removeEntityFromCellFences_i < S.Entity_removeEntityFromCellFences_iz; S.Entity_removeEntityFromCellFences_i++) {
				if (my.cell[cells[S.Entity_removeEntityFromCellFences_i]]) {
					my.group[cells[S.Entity_removeEntityFromCellFences_i] + '_fence'].removeEntitysFromGroup(this.name);
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
		S.Entity_checkField_cell = null; //scrawl Cell object
		S.Entity_checkField_arg = {
			coordinates: [],
			test: 0,
			channel: ''
		};
		my.Entity.prototype.checkField = function(cell) {
			S.Entity_checkField_cell = (cell) ? my.cell[cell] : my.cell[my.group[this.group].cell];
			S.Entity_checkField_arg.coordinates = this.getCollisionPoints();
			S.Entity_checkField_arg.test = this.get('fieldTest');
			S.Entity_checkField_arg.channel = this.get('fieldChannel');
			return S.Entity_checkField_cell.checkFieldAt(S.Entity_checkField_arg);
		};
		/**
    Calculate the current positions of this entity's collision Vectors, taking into account the entity's current position, roll and scale
    @method Entity.getCollisionPoints
    @return Array of coordinate Vectors
    **/
		S.Entity_getCollisionPoints_i = 0;
		S.Entity_getCollisionPoints_iz = 0;
		my.Entity.prototype.getCollisionPoints = function() {
			if (this.collisionVectors.length === 0) {
				if (my.xt(this.collisionPoints)) {
					this.buildCollisionVectors();
					this.collisionArray.length = 0;
				}
			}
			if (this.collisionArray.length === 0) {
				for (S.Entity_getCollisionPoints_i = 0, S.Entity_getCollisionPoints_iz = this.collisionVectors.length; S.Entity_getCollisionPoints_i < S.Entity_getCollisionPoints_iz; S.Entity_getCollisionPoints_i += 2) {
					my.v.x = (this.flipReverse) ? -this.collisionVectors[S.Entity_getCollisionPoints_i] : this.collisionVectors[S.Entity_getCollisionPoints_i];
					my.v.y = (this.flipReverse) ? -this.collisionVectors[S.Entity_getCollisionPoints_i + 1] : this.collisionVectors[S.Entity_getCollisionPoints_i + 1];
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
		S.Entity_getCollisionPoints_i = 0;
		S.Entity_getCollisionPoints_iz = 0;
		S.Entity_getCollisionPoints_o = null; //scrawl Vector object
		S.Entity_getCollisionPoints_w = 0;
		S.Entity_getCollisionPoints_h = 0;
		my.Entity.prototype.buildCollisionVectors = function() {
			S.Entity_getCollisionPoints_o = this.getOffsetStartVector().reverse();
			if (my.xt(this.localWidth)) {
				S.Entity_getCollisionPoints_w = this.localWidth / this.scale || 0;
				S.Entity_getCollisionPoints_h = this.localHeight / this.scale || 0;
			}
			else if (my.xt(this.pasteData)) {
				S.Entity_getCollisionPoints_w = this.pasteData.w / this.scale || 0;
				S.Entity_getCollisionPoints_h = this.pasteData.h / this.scale || 0;
			}
			else {
				S.Entity_getCollisionPoints_w = this.width || 0;
				S.Entity_getCollisionPoints_h = this.height || 0;
			}
			this.collisionVectors.length = 0;
			for (S.Entity_getCollisionPoints_i = 0, S.Entity_getCollisionPoints_iz = this.collisionPoints.length; S.Entity_getCollisionPoints_i < S.Entity_getCollisionPoints_iz; S.Entity_getCollisionPoints_i++) {
				if (my.isa(this.collisionPoints[S.Entity_getCollisionPoints_i], 'str')) {
					switch (this.collisionPoints[S.Entity_getCollisionPoints_i]) {
						case 'start':
							this.collisionVectors.push(0);
							this.collisionVectors.push(0);
							break;
						case 'N':
							this.collisionVectors.push((S.Entity_getCollisionPoints_w / 2) - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.y);
							break;
						case 'NE':
							this.collisionVectors.push(S.Entity_getCollisionPoints_w - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.y);
							break;
						case 'E':
							this.collisionVectors.push(S.Entity_getCollisionPoints_w - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push((S.Entity_getCollisionPoints_h / 2) - S.Entity_getCollisionPoints_o.y);
							break;
						case 'SE':
							this.collisionVectors.push(S.Entity_getCollisionPoints_w - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(S.Entity_getCollisionPoints_h - S.Entity_getCollisionPoints_o.y);
							break;
						case 'S':
							this.collisionVectors.push((S.Entity_getCollisionPoints_w / 2) - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(S.Entity_getCollisionPoints_h - S.Entity_getCollisionPoints_o.y);
							break;
						case 'SW':
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(S.Entity_getCollisionPoints_h - S.Entity_getCollisionPoints_o.y);
							break;
						case 'W':
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push((S.Entity_getCollisionPoints_h / 2) - S.Entity_getCollisionPoints_o.y);
							break;
						case 'NW':
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push(-S.Entity_getCollisionPoints_o.y);
							break;
						case 'center':
							this.collisionVectors.push((S.Entity_getCollisionPoints_w / 2) - S.Entity_getCollisionPoints_o.x);
							this.collisionVectors.push((S.Entity_getCollisionPoints_h / 2) - S.Entity_getCollisionPoints_o.y);
							break;
					}
				}
				else if (my.isa(this.collisionPoints[S.Entity_getCollisionPoints_i], 'vector')) {
					this.collisionVectors.push(this.collisionPoints[S.Entity_getCollisionPoints_i].x);
					this.collisionVectors.push(this.collisionPoints[S.Entity_getCollisionPoints_i].y);
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
		S.Entity_parseCollisionPoints_i = 0;
		S.Entity_parseCollisionPoints_iz = 0;
		S.Entity_parseCollisionPoints_j = 0;
		S.Entity_parseCollisionPoints_jz = 0;
		S.Entity_parseCollisionPoints_myItems = [];
		my.Entity.prototype.parseCollisionPoints = function() {
			this.collisionPoints = (my.isa(this.collisionPoints, 'arr')) ? this.collisionPoints : [this.collisionPoints];
			S.Entity_parseCollisionPoints_myItems.length = 0;
			for (S.Entity_parseCollisionPoints_j = 0, S.Entity_parseCollisionPoints_jz = this.collisionPoints.length; S.Entity_parseCollisionPoints_j < S.Entity_parseCollisionPoints_jz; S.Entity_parseCollisionPoints_j++) {
				S.Entity_parseCollisionPoints_myItems.push(this.collisionPoints[S.Entity_parseCollisionPoints_j]);
			}
			this.collisionPoints.length = 0;
			if (my.xt(S.Entity_parseCollisionPoints_myItems)) {
				for (S.Entity_parseCollisionPoints_i = 0, S.Entity_parseCollisionPoints_iz = S.Entity_parseCollisionPoints_myItems.length; S.Entity_parseCollisionPoints_i < S.Entity_parseCollisionPoints_iz; S.Entity_parseCollisionPoints_i++) {
					if (my.isa(S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i], 'str')) {
						switch (S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i].toLowerCase()) {
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
					else if (my.isa(S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i], 'num')) {
						this.collisionPoints.push(S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i]);
					}
					else if (my.isa(S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i], 'vector')) {
						this.collisionPoints.push(S.Entity_parseCollisionPoints_myItems[S.Entity_parseCollisionPoints_i]);
					}
				}
			}
			return this.collisionPoints;
		};

		return my;
	}(scrawl, scrawlVars));
}
