//---------------------------------------------------------------------------------
// The MIT License (MIT)
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
# scrawlPath

## Purpose and features

The Path module adds Path entitys - path-based objects - to the core module

* Defines a entity composed of lines, quadratic and bezier curves, etc
* Can act as a path along which other entitys can be positioned and animated
* See also Shape object, which achieves a similar thing in a different way

@module scrawlPath
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'path')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPath module adaptions to the Scrawl library object

## New library sections

* scrawl.point 
* scrawl.link 

## New default attributes

* Position.pathPlace - default: 0
* Position.pathRoll - default: 0;
* Position.addPathRoll - default: false;
* Position.path - default: '';

@class window.scrawl_Path
**/

		/**
scrawl.deleteEntity hook function - modified by path module
@method pathDeleteEntity
@private
**/
		my.pathDeleteEntity = function(item) {
			var pointList,
				linkList,
				i,
				iz,
				j,
				jz;
			if (item.type === 'Path') {
				pointList = item.getFullPointList();
				linkList = item.getFullLinkList();
				for (j = 0, jz = pointList.length; j < jz; j++) {
					my.removeItem(my.pointnames, pointList[j]);
					delete my.point[pointList[j]];
				}
				for (i = 0, iz = linkList.length; i < iz; i++) {
					my.removeItem(my.linknames, linkList[i]);
					delete my.link[linkList[i]];
				}
			}
		};
		/**
Clone a Scrawl.js object, optionally altering attribute values in the cloned object

(This function replaces the core function)

@method Base.clone
@param {Object} items Object containing attribute key:value pairs; will overwrite existing values in the cloned, but not the source, Object
@return Cloned object
@chainable
@example
    var box = scrawl.makeBlock({
        width: 50,
        height: 50,
        });
    var newBox = box.clone({
        height: 100,
        });
    newBox.get('width');        //returns 50
    newBox.get('height');       //returns 100
**/
		my.Base.prototype.clone = function(items) {
			var b = my.mergeOver(this.parse(), my.safeObject(items));
			delete b.context; //required for successful cloning of entitys
			return (this.type === 'Path') ? my.makePath(b) : new my[this.type](b);
		};
		my.d.Position.pathPlace = 0;
		my.d.Position.pathRoll = 0;
		my.d.Position.addPathRoll = false;
		my.d.Position.path = '';
		my.mergeInto(my.d.Cell, my.d.Position);
		my.mergeInto(my.d.Entity, my.d.Position);
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
		/**
Position constructor hook function - modified by path module
@method pathPositionInit
@private
**/
		my.Position.prototype.pathPositionInit = function(items) {
			this.path = my.xtGet(items.path, my.d[this.type].path);
			this.pathRoll = my.xtGet(items.pathRoll, my.d[this.type].pathRoll);
			this.addPathRoll = my.xtGet(items.addPathRoll, my.d[this.type].addPathRoll);
			this.pathPlace = my.xtGet(items.pathPlace, my.d[this.type].pathPlace);
		};
		/**
Position.setDelta hook function - modified by path module
@method pathPositionSetDelta
@private
**/
		my.Position.prototype.pathPositionSetDelta = function(items) {
			if (items.pathPlace) {
				this.pathPlace += items.pathPlace;
			}
		};
		/**
Cell.prepareToCopyCell hook function - modified by path module
@method pathPrepareToCopyCell
@private
**/
		my.Cell.prototype.pathPrepareToCopyCell = function() {
			var here;
			if (my.entity[this.path] && my.entity[this.path].type === 'Path') {
				here = my.entity[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
				this.start.x = (!this.lockX) ? here.x : this.start.x;
				this.start.y = (!this.lockY) ? here.y : this.start.y;
				this.pathRoll = here.r || 0;
			}
		};
		/**
Entity.stamp hook function - modified by path module
@method pathStamp
@private
**/
		my.Entity.prototype.pathStamp = function(method, cell) {
			var here;
			if (my.entity[this.path] && my.entity[this.path].type === 'Path') {
				here = my.entity[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
				this.start.x = (!this.lockX) ? here.x : this.start.x;
				this.start.y = (!this.lockY) ? here.y : this.start.y;
				this.pathRoll = here.r || 0;
			}
		};
		/**
Alias for makePoint()
@method newPoint
@deprecated
@private
**/
		my.newPoint = function(items) {
			return my.makePoint(items);
		};
		/**
Alias for makeLink()
@method newLink
@deprecated
@private
**/
		my.newLink = function(items) {
			return my.makeLink(items);
		};
		/**
A __factory__ function to generate new Point objects
@method makePoint
@param {Object} items Key:value Object argument for setting attributes
@return Point object
@private
**/
		my.makePoint = function(items) {
			return new my.Point(items);
		};
		/**
A __factory__ function to generate new Link objects
@method makeLink
@param {Object} items Key:value Object argument for setting attributes
@return Link object
@private
**/
		my.makeLink = function(items) {
			return new my.Link(items);
		};
		/**
A __factory__ function to generate new Path objects

_Note: this function does NOT produce Path entitys_ - use scrawl.makePath()
@method newPathObject
@param {Object} items Key:value Object argument for setting attributes
@return Path object
@private
**/
		my.newPathObject = function(items) {
			return new my.Path(items);
		};
		/**
A __factory__ function to generate new Path entitys
@method makePath
@param {Object} items Key:value Object argument for setting attributes
@return Path entity
@example
    scrawl.makePath({
        startX: 50,
        startY: 20,
        fillStyle: 'red',
        data: 'M0,0 50,0 60,20, 10,20 0,0z',
        });
**/
		my.makePath = function(items) {
			var stat1 = ['C', 'c', 'S', 's'],
				stat2 = ['Q', 'q', 'T', 't'],
				minX,
				minY,
				maxX,
				maxY,
				myShape,
				sn,
				tn,
				lib,
				sx,
				sy,
				set,
				data,
				command,
				lc,
				pc,
				cx,
				cy,
				k,
				v,
				myPivot,
				temp,
				i,
				iz,
				search = new RegExp('_', 'g');
			items = (my.isa(items, 'obj')) ? items : {};
			minX = 999999;
			minY = 999999;
			maxX = -999999;
			maxY = -999999;
			lc = 0;
			pc = 0;
			cx = 0;
			cy = 0;
			k = 0;
			v = 0;
			myPivot = my.xtGet(my.point[items.pivot], my.entity[items.pivot], false);
			if (myPivot) {
				temp = my.xtGet(myPivot.local, myPivot.place, myPivot.start, false);
				temp = my.safeObject(temp);
				items.startX = my.xtGet(temp.x, 0);
				items.startY = my.xtGet(temp.y, 0);
			}
			else {
				temp = my.safeObject(items.start);
				items.startX = my.xtGet(items.startX, temp.x, 0);
				items.startY = my.xtGet(items.startY, temp.y, 0);
			}
			items.start = (my.xt(items.start)) ? items.start : {};
			items.scaleX = items.scaleX || 1;
			items.scaleY = items.scaleY || 1;
			items.isLine = my.xtGet(items.isLine, true);
			var checkMinMax = function(_cx, _cy) {
				minX = (minX > _cx) ? _cx : minX;
				minY = (minY > _cy) ? _cy : minY;
				maxX = (maxX < _cx) ? _cx : maxX;
				maxY = (maxY < _cy) ? _cy : maxY;
			};
			var getPathSetData = function(_sim) {
				var psd = _sim.match(/(-?[0-9.]+\b)/g),
					j, w;
				if (psd) {
					for (j = 0, w = psd.length; j < w; j++) {
						psd[j] = parseFloat(psd[j]);
					}
					return psd;
				}
				return false;
			};
			var generatePoint = function(_tempname, _pcount, _shapename, _x, _y, _lcount, _sx, _sy) {
				my.makePoint({
					name: _tempname + '_p' + _pcount,
					entity: _shapename,
					currentX: _x * _sx,
					currentY: _y * _sy,
					startLink: _tempname + '_l' + _lcount,
				});
			};
			var generateLink = function(_tempname, _lcount, _shapename, _spec, _act, _spt, _ept, _cp1, _cp2) {
				_ept = (my.xt(_ept)) ? _ept : {};
				_cp1 = (my.xt(_cp1)) ? _cp1 : {};
				_cp2 = (my.xt(_cp2)) ? _cp2 : {};
				my.makeLink({
					name: _tempname + '_l' + _lcount,
					entity: _shapename,
					species: _spec,
					startPoint: _spt.name,
					endPoint: _ept.name || false,
					controlPoint1: _cp1.name || false,
					controlPoint2: _cp2.name || false,
					precision: items.precision || false,
					action: _act,
				});
			};
			if (my.xt(items.data)) {
				myShape = my.newPathObject(items);
				sn = myShape.name;
				tn = sn.replace(search, '=');
				lib = my.point;
				sx = items.scaleX;
				sy = items.scaleY;
				if (myShape) {
					set = items.data.match(/([A-Za-z][0-9. ,\-]*)/g);
					generatePoint(tn, pc, sn, cx, cy, lc, sx, sy);
					pc++;
					for (i = 0, iz = set.length; i < iz; i++) {
						command = set [i][0];
						data = getPathSetData(set [i]);
						switch (command) {
							case 'M':
								cx = data[0];
								cy = data[1];
								checkMinMax(cx, cy);
								generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
								pc++;
								generateLink(tn, lc, sn, false, 'move', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
								lc++;
								for (k = 2, v = data.length; k < v; k += 2) {
									generatePoint(tn, pc, sn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx = data[k];
									cy = data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							case 'm':
								if (i === 0) {
									cx = data[0];
									cy = data[1];
								}
								else {
									cx += data[0];
									cy += data[1];
								}
								checkMinMax(cx, cy);
								generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
								pc++;
								generateLink(tn, lc, sn, false, 'move', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
								lc++;
								for (k = 2, v = data.length; k < v; k += 2) {
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx += data[k];
									cy += data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							case 'Z':
							case 'z':
								generatePoint(tn, pc, sn, myShape.start.x, myShape.start.y, lc + 1, sx, sy);
								pc++;
								generateLink(tn, lc, sn, false, 'close', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
								lc++;
								break;
							case 'L':
								for (k = 0, v = data.length; k < v; k += 2) {
									generatePoint(tn, pc, sn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx = data[k];
									cy = data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							case 'l':
								for (k = 0, v = data.length; k < v; k += 2) {
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx += data[k];
									cy += data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							case 'H':
								for (k = 0, v = data.length; k < v; k++) {
									generatePoint(tn, pc, sn, data[k], cy, lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx = data[k];
									checkMinMax(cx, cy);
								}
								break;
							case 'h':
								for (k = 0, v = data.length; k < v; k++) {
									generatePoint(tn, pc, sn, cx + data[k], cy, lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cx += data[k];
									checkMinMax(cx, cy);
								}
								break;
							case 'V':
								for (k = 0, v = data.length; k < v; k++) {
									generatePoint(tn, pc, snsn, cx, data[k], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, snsn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cy = data[k];
									checkMinMax(cx, cy);
								}
								break;
							case 'v':
								for (k = 0, v = data.length; k < v; k++) {
									generatePoint(tn, pc, snsn, cx, cy + data[k], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, snsn, 'line', 'add', lib[tn + '_p' + (pc - 2)], lib[tn + '_p' + (pc - 1)]);
									lc++;
									cy += data[k];
									checkMinMax(cx, cy);
								}
								break;
							case 'C':
								for (k = 0, v = data.length; k < v; k += 6) {
									generatePoint(tn, pc, snsn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, snsn, data[k + 2], data[k + 3], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, snsn, data[k + 4], data[k + 5], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, snsn, 'bezier', 'add', lib[tn + '_p' + (pc - 4)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx = data[k + 4];
									cy = data[k + 5];
									checkMinMax(cx, cy);
								}
								break;
							case 'c':
								for (k = 0, v = data.length; k < v; k += 6) {
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, cx + data[k + 2], cy + data[k + 3], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, cx + data[k + 4], cy + data[k + 5], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn + '_p' + (pc - 4)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx += data[k + 4];
									cy += data[k + 5];
									checkMinMax(cx, cy);
								}
								break;
							case 'S':
								for (k = 0, v = data.length; k < v; k += 4) {
									if (i > 0 && my.contains(stat1, set [i - 1][0])) {
										lib[tn + '_p' + (pc - 2)].clone({
											name: tn + '_p' + pc,
											currentX: cx + (cx - lib[tn + '_p' + (pc - 2)].local.x),
											currentY: cy + (cy - lib[tn + '_p' + (pc - 2)].local.y),
											startLink: tn + '_l' + (lc + 1),
										});
										pc++;
									}
									else {
										generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
										pc++;
									}
									generatePoint(tn, pc, sn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, data[k + 2], data[k + 3], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn + '_p' + (pc - 4)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx = data[k + 2];
									cy = data[k + 3];
									checkMinMax(cx, cy);
								}
								break;
							case 's':
								for (k = 0, v = data.length; k < v; k += 4) {
									if (i > 0 && my.contains(stat1, set [i - 1][0])) {
										lib[tn + '_p' + (pc - 2)].clone({
											name: tn + '_p' + pc,
											currentX: cx + (cx - lib[tn + '_p' + (pc - 2)].local.x),
											currentY: cy + (cy - lib[tn + '_p' + (pc - 2)].local.y),
											startLink: tn + '_l' + (lc + 1),
										});
										pc++;
									}
									else {
										generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
										pc++;
									}
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, cx + data[k + 2], cy + data[k + 3], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn + '_p' + (pc - 4)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx += data[k + 2];
									cy += data[k + 3];
									checkMinMax(cx, cy);
								}
								break;
							case 'Q':
								for (k = 0, v = data.length; k < v; k += 4) {
									generatePoint(tn, pc, sn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, data[k + 2], data[k + 3], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx = data[k + 2];
									cy = data[k + 3];
									checkMinMax(cx, cy);
								}
								break;
							case 'q':
								for (k = 0, v = data.length; k < v; k += 4) {
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generatePoint(tn, pc, sn, cx + data[k + 2], cy + data[k + 3], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx += data[k + 2];
									cy += data[k + 3];
									checkMinMax(cx, cy);
								}
								break;
							case 'T':
								for (k = 0, v = data.length; k < v; k += 2) {
									if (i > 0 && my.contains(stat2, set [i - 1][0])) {
										lib[tn + '_p' + (pc - 2)].clone({
											name: tn + '_p' + pc,
											currentX: cx + (cx - lib[tn + '_p' + (pc - 2)].local.x),
											currentY: cy + (cy - lib[tn + '_p' + (pc - 2)].local.y),
											startLink: tn + '_l' + (lc + 1),
										});
										pc++;
									}
									else {
										generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
										pc++;
									}
									generatePoint(tn, pc, sn, data[k], data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx = data[k];
									cy = data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							case 't':
								for (k = 0, v = data.length; k < v; k += 2) {
									if (i > 0 && my.contains(stat2, set [i - 1][0])) {
										lib[tn + '_p' + (pc - 2)].clone({
											name: tn + '_p' + pc,
											currentX: cx + (cx - lib[tn + '_p' + (pc - 2)].local.x),
											currentY: cy + (cy - lib[tn + '_p' + (pc - 2)].local.y),
											startLink: tn + '_l' + (lc + 1),
										});
										pc++;
									}
									else {
										generatePoint(tn, pc, sn, cx, cy, lc + 1, sx, sy);
										pc++;
									}
									generatePoint(tn, pc, sn, cx + data[k], cy + data[k + 1], lc + 1, sx, sy);
									pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn + '_p' + (pc - 3)], lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc - 2)]);
									lc++;
									cx += data[k];
									cy += data[k + 1];
									checkMinMax(cx, cy);
								}
								break;
							default:
						}
					}
					generateLink(tn, lc, sn, false, 'end', lib[tn + '_p' + (pc - 1)], lib[tn + '_p' + (pc)]);
					myShape.set({
						firstPoint: tn + '_p0',
						width: (maxX - minX) * items.scaleX,
						height: (maxY - minY) * items.scaleY,
					});
					myShape.buildPositions();
					return myShape;
				}
			}
			return false;
		};
		my.pushUnique(my.sectionlist, 'point');
		my.pushUnique(my.nameslist, 'pointnames');
		my.pushUnique(my.sectionlist, 'link');
		my.pushUnique(my.nameslist, 'linknames');

		/**
# Path

## Instantiation

* scrawl.makePath() - Irregular, path-based shapes

Additional factory functions to instantiate Path objects are available in the __pathFactoryFunctions__ module

## Purpose

* Defines a entity composed of lines, quadratic and bezier curves, etc
* Makes use of, but doesn't contain, Point and Link objects to define the entity
* Can be used as a path for placing and animating other entitys
* Point objects can be used as pivots by other entitys

## Access

* scrawl.entity.PATHNAME - for the Path entity object

@class Path
@constructor
@extends Entity
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Path = function(items) {
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.isLine = (my.isa(items.isLine, 'bool')) ? items.isLine : true;
			this.linkList = [];
			this.linkDurations = [];
			this.pointList = [];
			this.perimeterLength = 0;
			this.registerInLibrary();
			my.pushUnique(my.group[this.group].entitys, this.name);
			return this;
		};
		my.Path.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Path'
@final
**/
		my.Path.prototype.type = 'Path';
		my.Path.prototype.classname = 'entitynames';
		my.d.Path = {
			/**
POINTNAME of the Point object that commences the drawing operation

Set automatically by Path creation factory functions
@property firstPoint
@type String
@default ''
@private
**/
			firstPoint: '',
			/**
Drawing flag - when set to true, will treat the first drawing (not positioning) data point as the start point

Generally this is set automatically as part of an outline factory function
@property isLine
@type Boolean
@default true
**/
			isLine: true,
			/**
Drawing flag - when true, path will be closed

_Note: this attribute must be set to true for those drawing methods that use a fill flood as part of their operation
@property closed
@type Boolean
@default true
**/
			closed: true,
			/**
Array of LINKNAME Strings for Link objects associated with this Path entity
@property linkList
@type Array
@default []
@private
**/
			linkList: [],
			/**
Array of length (Number) values for each Link object associated with this Path entity
@property linkDurations
@type Array
@default []
@private
**/
			linkDurations: [],
			/**
Array of POINTNAME Strings for Point objects associated with this Path entity
@property pointList
@type Array
@default []
@private
**/
			pointList: [],
			/**
Path length - calculated automatically by scrawl

_Note: this value will be affected by the value of the precision attribute - hiher precisions lead to more accurate perimeterLength values, particularly along curves_
@property perimeterLength
@type Number
@default 0
**/
			perimeterLength: 0,
			/**
Path marker entitys - SPRITENAME String of entity used at start of the Path
@property markStart
@type String
@default ''
**/
			markStart: '',
			/**
Path marker entitys - SPRITENAME String of entity used at the line/curve joints along the Path
@property markMid
@type String
@default ''
**/
			markMid: '',
			/**
Path marker entitys - SPRITENAME String of entity used at end of the Path
@property markEnd
@type String
@default ''
**/
			markEnd: '',
			/**
Path marker entitys - SPRITENAME String of entity used as the fallback when markStart, markMid or markEnd attributes are not set
@property mark
@type String
@default ''
**/
			mark: '',
			/**
Path entity default method attribute is 'draw', not 'fill'
@property method
@type String
@default 'draw'
**/
			method: 'draw',
			/**
Set the iterations required for calculating path length and positioning data - higher figures (eg 100) ensure entitys will follow the path more accurately
@property precision
@type Number
@default 10
**/
			precision: 10,
		};
		my.mergeInto(my.d.Path, my.d.Entity);
		/**
Helper function - define the entity's path on the &lt;canvas&gt; element's context engine
@method prepareShape
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.prepareShape = function(ctx, cell) {
			var here;
			my.cell[cell].setEngine(this);
			if (this.firstPoint) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				ctx.translate(here.x, here.y);
				ctx.beginPath();
				my.link[my.point[this.firstPoint].startLink].sketch(ctx);
			}
			return this;
		};
		/**
Augments Position.getPivotOffsetVector()
@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where entity drawing should start
@private
**/
		my.Path.prototype.getPivotOffsetVector = function() {
			return (this.isLine) ? my.Entity.prototype.getPivotOffsetVector.call(this) : this.getCenteredPivotOffsetVector();
		};
		/**
Display helper function

Stamp mark entitys onto Path

@method stampMark
@param {Entity} entity Entity object to be stamped
@param {Number} pos Path position (between 0 and 1)
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.stampMark = function(entity, pos, ctx, cell) {
			var path,
				place,
				group,
				handle,
				arg = {
					path: '',
					pathPlace: 0,
					group: '',
					handle: null
				};
			path = entity.path;
			place = entity.pathPlace;
			group = entity.group;
			handle = entity.handle;
			arg.path = this.name;
			arg.pathPlace = pos;
			arg.group = cell;
			arg.handle = this.handle;
			entity.set(arg).forceStamp();
			arg.path = path;
			arg.pathPlace = place;
			arg.group = group;
			arg.handle = handle;
			entity.set(arg);
			return this;
		};
		/**
Display helper function

Prepare mark entitys for stamping onto Path

@method addMarks
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.addMarks = function(ctx, cell) {
			var mark,
				entity,
				link,
				i,
				iz;
			mark = false;
			if (my.xtGet(this.mark, this.markStart, this.markMid, this.markEnd)) {
				this.buildPositions();
				link = this.get('linkDurations');
				mark = my.xtGetTrue(this.markStart, this.mark);
				if (mark && my.entity[mark]) {
					this.stampMark(my.entity[mark], 0, ctx, cell);
				}
				mark = my.xtGetTrue(this.markMid, this.mark);
				if (mark && my.entity[mark]) {
					entity = my.entity[mark];
					for (i = 0, iz = link.length - 1; i < iz; i++) {
						this.stampMark(entity, link[i], ctx, cell);
					}
				}
				mark = my.xtGetTrue(this.markEnd, this.mark);
				if (mark && my.entity[mark]) {
					this.stampMark(my.entity[mark], 1, ctx, cell);
				}
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.clip = function(ctx, cell) {
			if (this.closed) {
				this.prepareShape(ctx, cell);
				ctx.clip();
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.clear = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.stroke();
			ctx.fill(my.ctx[this.context].get('winding'));
			ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.clearWithBackground = function(ctx, cell) {
			var context,
				background,
				fill,
				stroke,
				alpha;
			cell = my.cell[cell];
			background = cell.get('backgroundColor');
			context = my.ctx[cell];
			fill = context.get('fillStyle');
			stroke = context.get('strokeStyle');
			alpha = context.get('globalAlpha');
			this.prepareShape(ctx, cell);
			ctx.fillStyle = background;
			ctx.strokeStyle = background;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.fill(my.ctx[this.context].get('winding'));
			ctx.fillStyle = fill;
			ctx.strokeStyle = stroke;
			ctx.globalAlpha = alpha;
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.fill = function(ctx, cell) {
			if (this.get('closed')) {
				this.prepareShape(ctx, cell);
				ctx.fill(my.ctx[this.context].get('winding'));
				this.addMarks(ctx, cell);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.draw = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			ctx.stroke();
			this.addMarks(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.drawFill = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			ctx.stroke();
			if (this.get('closed')) {
				this.clearShadow(ctx, cell);
				ctx.fill(my.ctx[this.context].get('winding'));
			}
			this.addMarks(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.fillDraw = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			if (this.get('closed')) {
				ctx.fill(my.ctx[this.context].get('winding'));
				this.clearShadow(ctx, cell);
			}
			ctx.stroke();
			this.addMarks(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.sinkInto = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			if (this.get('closed')) {
				ctx.fill(my.ctx[this.context].get('winding'));
			}
			ctx.stroke();
			this.addMarks(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.floatOver = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			ctx.stroke();
			if (this.get('closed')) {
				ctx.fill(my.ctx[this.context].get('winding'));
			}
			this.addMarks(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this entity's context values and defining the entitys path, on the canvas, but not drawing (fill stroke) the entity.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Path.prototype.none = function(ctx, cell) {
			this.prepareShape(ctx, cell);
			return this;
		};
		/**
@method getFullPointList
@return Array containing POINTNAME Strings of all Point objects associated with this Path object
**/
		my.Path.prototype.getFullPointList = function() {
			var search,
				list,
				i,
				iz;
			list = [];
			search = new RegExp(this.name + '_.*');
			for (i = 0, iz = my.pointnames.length; i < iz; i++) {
				if (search.test(my.pointnames[i])) {
					list.push(my.pointnames[i]);
				}
			}
			return list;
		};
		/**
@method getFullLinkList
@return Array containing LINKNAME Strings of all Link objects associated with this Path object
**/
		my.Path.prototype.getFullLinkList = function() {
			var search,
				list,
				i,
				iz;
			list = [];
			search = new RegExp(this.name + '_.*');
			for (i = 0, iz = my.linknames.length; i < iz; i++) {
				if (search.test(my.linknames[i])) {
					list.push(my.linknames[i]);
				}
			}
			return list;
		};
		/**
Calculate and return Path object's path length

Accuracy of returned value depends on the setting of the __precision__ attribute; lower precision is less accurate for curves
@method getPerimeterLength
@param {Boolean} [force] If set to true, forces a complete recalculation
@return Path length, in pixels
**/
		my.Path.prototype.getPerimeterLength = function(force) {
			if (force || !this.perimeterLength || this.get('linkDurations').length === 0) {
				this.buildPositions();
			}
			return this.perimeterLength;
		};
		/**
Helper function - calculate the positions and lengths of the Path's constituent Point and Link objects
@method buildPositions
@return This
@chainable
@private
**/
		my.Path.prototype.buildPositions = function() {
			var i,
				iz,
				links,
				durations,
				len,
				cumlen,
				link,
				pos;
			links = this.get('linkList');
			durations = [];
			cumlen = 0;
			for (i = 0, iz = links.length; i < iz; i++) {
				my.link[links[i]].setPositions();
			}
			for (i = 0, iz = links.length; i < iz; i++) {
				link = my.link[links[i]];
				pos = link.get('positionsCumulativeLength');
				len = pos[pos.length - 1];
				cumlen += len;
				durations.push(cumlen);
			}
			for (i = 0, iz = links.length; i < iz; i++) {
				durations[i] /= cumlen;
			}
			this.perimeterLength = cumlen;
			this.linkDurations.length = 0;
			for (i = 0, iz = durations.length; i < iz; i++) {
				this.linkDurations.push(durations[i]);
			}
			return this;
		};
		/**
Calculate coordinates of point at given distance along the Shape entity's path
@method getPerimeterPosition
@param {Number} [val] Distance along path, between 0 (start) and 1 (end); default: 1
@param {Boolean} [steady] Steady flag - if true, return 'steady calculation' coordinates; otherwise return 'simple calculation' coordinates. Default: true
@param {Boolean} [roll] Roll flag - if true, return tangent angle (degrees) at that point along the path. Default: false
@param {Boolean} [local] Local flag - if true, return coordinate Vector relative to Entity start parameter; otherwise return Cell coordinate Vector. Default: false
@return Vector coordinates
**/
		my.Path.prototype.getPerimeterPosition = function(val, steady, roll, local) {
			var i,
				iz,
				links,
				link,
				linkVal,
				durations,
				beforex,
				beforey,
				bVal,
				afterx,
				aftery,
				aVal,
				here,
				angle,
				temp,
				result = {
					x: 0,
					y: 0,
					r: 0
				};
			val = (my.isa(val, 'num')) ? val : 1;
			steady = (my.isa(steady, 'bool')) ? steady : true;
			roll = (my.isa(roll, 'bool')) ? roll : false;
			local = (my.isa(local, 'bool')) ? local : false;
			this.getPerimeterLength();
			links = this.get('linkList');
			durations = this.get('linkDurations');
			for (i = 0, iz = links.length; i < iz; i++) {
				link = my.link[links[i]];
				if (durations[i] >= val) {
					if (i === 0) {
						linkVal = val / durations[i];
					}
					else {
						linkVal = ((val - durations[i - 1]) / (durations[i] - durations[i - 1]));
					}
					linkVal = (linkVal < 0) ? 0 : ((linkVal > 1) ? 1 : linkVal);
					bVal = (linkVal - 0.0000001 < 0) ? 0 : linkVal - 0.0000001;
					aVal = (linkVal + 0.0000001 > 1) ? 1 : linkVal + 0.0000001;
					if (steady) {
						if (roll) {
							temp = (local) ? link.getLocalSteadyPositionOnLink(bVal) : link.getSteadyPositionOnLink(bVal);
							beforex = temp.x;
							beforey = temp.y;
							temp = (local) ? link.getLocalSteadyPositionOnLink(aVal) : link.getSteadyPositionOnLink(aVal);
							afterx = temp.x;
							aftery = temp.y;
							angle = Math.atan2(aftery - beforey, afterx - beforex) / my.radian;
							here = (local) ? link.getLocalSteadyPositionOnLink(linkVal) : link.getSteadyPositionOnLink(linkVal);
							result.x = here.x;
							result.y = here.y;
							result.r = angle;
							return result;
						}
						else {
							return (local) ? link.getLocalSteadyPositionOnLink(linkVal) : link.getSteadyPositionOnLink(linkVal);
						}
					}
					else {
						if (roll) {
							temp = (local) ? link.getLocalPositionOnLink(bVal) : link.getPositionOnLink(bVal);
							beforex = temp.x;
							beforey = temp.y;
							temp = (local) ? link.getLocalPositionOnLink(aVal) : link.getPositionOnLink(aVal);
							afterx = temp.x;
							aftery = temp.y;
							angle = Math.atan2(aftery - beforey, afterx - beforex) / my.radian;
							here = (local) ? link.getLocalPositionOnLink(linkVal) : link.getPositionOnLink(linkVal);
							result.x = here.x;
							result.y = here.y;
							result.r = angle;
							return result;
						}
						else {
							return (local) ? link.getLocalPositionOnLink(linkVal) : link.getPositionOnLink(linkVal);
						}
					}
				}
			}
			return false;
		};
		/**
Check a set of coordinates to see if any of them fall within this entity's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the entity's path; false if none fall within the path
**/
		my.Path.prototype.checkHit = function(items) {
			var i,
				iz,
				tests,
				result,
				here,
				winding,
				returnCoord = {
					x: 0,
					y: 0
				};
			items = my.safeObject(items);
			tests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)];
			result = false;
			winding = my.ctx[this.context].winding;
			my.cvx.mozFillRule = winding;
			my.cvx.msFillRule = winding;
			if (this.firstPoint) {
				here = this.prepareStamp();
				this.rotateCell(my.cvx, my.group[this.group].cell);
				my.cvx.translate(here.x, here.y);
				my.cvx.beginPath();
				my.link[my.point[this.firstPoint].startLink].sketch(my.cvx);
			}
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = my.cvx.isPointInPath(tests[i], tests[i + 1]);
				if (result) {
					break;
				}
			}
			if (result) {
				returnCoord.x = tests[i];
				returnCoord.y = tests[i + 1];
				return returnCoord;
			}
			return false;
		};
		/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the entity's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
		my.Path.prototype.buildCollisionVectors = function(items) {
			var i,
				iz,
				j,
				p = [],
				advance,
				point,
				currentPos;
			if (my.xt(my.d.Path.fieldChannel)) {
				p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints;
				//advance,
				//point,
				this.collisionVectors.length = 0;
				currentPos = 0;
				for (i = 0, iz = p.length; i < iz; i++) {
					if (my.isa(p[i], 'num') && p[i] >= 0) {
						if (p[i] > 1) {
							//regular points along the path
							advance = 1 / p[i];
							for (j = 0; j < p[i]; j++) {
								point = this.getPerimeterPosition(currentPos, true, false, true);
								this.collisionVectors.push(point.x);
								this.collisionVectors.push(point.y);
								currentPos += advance;
							}
						}
						else {
							//a point at a specific position on the path
							point = this.getPerimeterPosition(p[i], true, false, true);
							this.collisionVectors.push(point.x);
							this.collisionVectors.push(point.y);
						}
					}
					else if (my.isa(p[i], 'str')) {
						switch (p[i]) {
							case 'start':
								this.collisionVectors.push(0);
								this.collisionVectors.push(0);
								break;
						}
					}
					else if (my.isa(p[i], 'vector')) {
						this.collisionVectors.push(p[i].x);
						this.collisionVectors.push(p[i].y);
					}
				}
			}
			return this;
		};

		/**
# Point

## Instantiation

* Objects created via Path factories
* scrawl.makeCartesianPoints() - deprecated
* scrawl.makePolarPoints() - deprecated

## Purpose

* Defines a movable point within a Path entity object
* Acts as a coordinate vector for Link drawing

Path creation factories will all create Point objects automatically as part of the generation process. Point objects will be named regularly, depending on the factory:

* scrawl.makeLine(): SPRITENAME_p1 (start point), SPRITENAME_p2 (end point)
* scrawl.makeQuadratic(): SPRITENAME_p1 (start point), SPRITENAME_p2 (control point), SPRITENAME_p3 (end point)
* scrawl.makeBezier(): SPRITENAME_p1 (start point), SPRITENAME_p2 (first control point), SPRITENAME_p3 (second control point), SPRITENAME_p4 (end point)
* scrawl.makeRegularShape(): each angle point is numbered consecutively, starting at SPRITENAME_p1
* scrawl.makePath(): points are numbered consecutively, beginning from SPRITENAME_p1 at the start of the path; the end point of a line, quadratic curve or bezier curve will also act as the start point for the next line or curve

## Access

* scrawl.point.POINTNAME - for the Point object

@class Point
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Point = function(items) {
			var local;
			items = my.safeObject(items);
			my.Base.call(this, items);
			local = my.safeObject(items.local);
			this.entity = my.xtGet(items.entity, '');
			this.local = my.makeVector({
				x: my.xtGet(items.startX, items.currentX, local.x, 0),
				y: my.xtGet(items.startY, items.currentY, local.y, 0),
			});
			this.work.local = my.makeVector({
				name: this.type + '.' + this.name + '.work.local'
			});
			this.work.local.name = this.type + '.' + this.name + '.work.local';
			this.startLink = my.xtGet(items.startLink, '');
			this.fixed = my.xtGet(items.fixed, false);
			if (my.xto(items.angle, items.distance)) {
				this.setPolar(items);
			}
			my.point[this.name] = this;
			my.pushUnique(my.pointnames, this.name);
			if (this.entity && my.entity[this.entity].type === 'Path') {
				my.pushUnique(my.entity[this.entity].pointList, this.name);
			}
			return this;
		};
		my.Point.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Point'
@final
**/
		my.Point.prototype.type = 'Point';
		my.Point.prototype.classname = 'pointnames';
		my.d.Point = {
			/**
SPRITENAME String of point object's parent entity
@property entity
@type String
@default ''
**/
			entity: '',
			/**
Point's coordinate Vector - generally the Vector marks the Point's position (in pixels) from the Parent entity's start coordinates, though this can be changed by setting the __fixed__ attribute to true.

The following argument attributes can be used to initialize, set and get this attribute's component values:

* __startX__ or __currentX__ to set the x coordinate value
* __startY__ or __currentY__ to set the y coordinate value
@property local
@type Vector
@default zero value Vector
**/
			local: {
				x: 0,
				y: 0,
				z: 0
			},
			/**
LINKNAME of Link object for which this Point acts as the start coordinate; generated automatically by the Shape creation factory functions
@property startLink
@type String
@default ''
@private
**/
			startLink: '',
			/**
Fixed attribute is used to fix the Point to a specific Cell coordinate Vector (true), or to a Entity start Vector (SPRITENAME). Default action is to treat the Point as local to its parent Entity's start coordinate
@property fixed
@type Boolean
@default false
**/
			fixed: false,
		};
		my.mergeInto(my.d.Point, my.d.Base);
		/**
Augments Base.set(), to allow users to set the local attributes using startX, startY, currentX, currentY, distance, angle
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Point.prototype.set = function(items) {
			var local;
			my.Base.prototype.set.call(this, items);
			items = my.safeObject(items);
			local = my.safeObject(items.local);
			if (my.xto(items.distance, items.angle)) {
				this.setPolar(items);
			}
			else if (my.xto(items.startX, items.startY, items.currentX, items.currentY, items.local)) {
				this.local.x = (my.xt(items.startX)) ? items.startX : ((my.xt(items.currentX)) ? items.currentX : ((my.xt(local.x)) ? local.x : this.local.x));
				this.local.y = (my.xt(items.startY)) ? items.startY : ((my.xt(items.currentY)) ? items.currentY : ((my.xt(local.y)) ? local.y : this.local.y));
			}
			return this;
		};
		/**
Add values to the local attribute. Permitted attributes of the argument object include:

* __startX__, __currentX__ - added to _local.x
* __startY__, __currentY__ - added to _local.y
* __distance__ - recalculates the _local_ vector to set its values to equal vector's current magnitude + distance (in pixels)
* __angle__ - recalculates the _local_ vector to rotate it by the angle value (in degrees)
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Point.prototype.setDelta = function(items) {
			var local,
				m,
				d,
				a;
			items = my.safeObject(items);
			local = my.safeObject(items.local);
			if (my.xto(items.startX, items.startY, items.currentX, items.currentY, items.local)) {
				this.local.x += (my.xt(items.startX)) ? items.startX : ((my.xt(items.currentX)) ? items.currentX : ((my.xt(local.x)) ? local.x : 0));
				this.local.y += (my.xt(items.startY)) ? items.startY : ((my.xt(items.currentY)) ? items.currentY : ((my.xt(local.y)) ? local.y : 0));
			}
			if (my.xt(items.distance)) {
				m = this.local.getMagnitude();
				this.local.scalarMultiply((items.distance + m) / m);
			}
			if (my.xt(items.angle)) {
				d = this.local.getMagnitude();
				a = Math.atan2(this.local.y, this.local.x);
				a += (items.angle * my.radian);
				this.local.x = d * Math.cos(a);
				this.local.y = d * Math.sin(a);
			}
			return this;
		};
		/**
Sets the local attribute using angle and/or distance parameters:

* __distance__ - calculates the _local_ vector to set its values to equal vector's current magnitude + distance (in pixels)
* __angle__ - calculates the _local_ vector to rotate it by the angle value (in degrees)
@method setPolar
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Point.prototype.setPolar = function(items) {
			var m,
				d,
				a;
			items = my.safeObject(items);
			my.Base.prototype.set.call(this, items);
			if (my.xta(items.distance, items.angle)) {
				a = items.angle * my.radian;
				this.local.x = items.distance * Math.cos(a);
				this.local.y = items.distance * Math.sin(a);
			}
			else {
				if (my.xt(items.distance)) {
					m = this.local.getMagnitude();
					m = (my.xt(m) && m > 0.0000001) ? m : 1;
					this.local.scalarMultiply(items.distance / m);
				}
				if (my.xt(items.angle)) {
					d = this.local.getMagnitude();
					a = items.angle * my.radian;
					this.local.x = d * Math.cos(a);
					this.local.y = d * Math.sin(a);
				}
			}
			return this;
		};
		/**
Retrieve Point object's coordinates, together with additional data

* Coordinate reference frame determined by the value of Point.local
* Coordinate values determined by setting of Point.fixed, Point.local and the parent Shape object's position and settings

Return object has the following attributes:

* __name__ - Point.name
* __current__ - coordinate Vector
* __startLink__ - Point.startLink

@method getData
@return Result object
@private
**/
		my.Point.prototype.getData = function() {
			var s,
				myPivot,
				scale,
				result = {
					name: '',
					current: null,
					startLink: null
				};
			s = my.entity[this.entity];
			scale = s.scale;
			this.resetWork();
			if (my.xt(this.local) && this.local.type === 'Vector') {
				if (my.isa(this.fixed, 'str') && (my.entity[this.fixed] || my.point[this.fixed])) {
					myPivot = my.entity[this.fixed] || my.point[this.fixed];
					if (myPivot.type === 'Point') {
						this.work.local.set(myPivot.local);
						this.work.local.scalarMultiply(scale || 1);
					}
					else {
						if (myPivot.type === 'Particle') {
							this.work.local.set(myPivot.get('place'));
						}
						else {
							this.work.local.set(myPivot.start);
						}
					}
				}
				else if (!this.fixed) {
					this.work.local.scalarMultiply(scale || 1);
				}
				else {
					this.work.local.vectorSubtract(s.start || my.o);
					this.work.local.scalarMultiply(scale || 1);
					this.work.local.rotate(-s.roll);
				}
				result.name = this.name;
				result.current = this.work.local;
				result.startLink = this.startLink;
				return result;
			}
			return false;
		};
		/**
Retrieve Point object's coordinates

* Coordinate reference frame determined by the value of Point.local
* Coordinate values determined by setting of Point.fixed, Point.local and the parent Shape object's position and settings
@method getCurrentCoordinates
@return Coordinate Vector
**/
		my.Point.prototype.getCurrentCoordinates = function() {
			return this.getData().current;
		};
		/**
Set Point.fixed attribute
@method setToFixed
@param {Mixed} items - either a coordinate Vector; or an Object with x and y attributes; or a Number representing the horizontal coordinate, in pixels, from &lt;canvas&gt; element's left edge; or a pivot SPRITENAME, POINTNAME or PARTICLENAME String
@param {Number} [y] - vertical coordinate, in pixels, from &lt;canvas&gt; element's top edge
@return This
@chainable
**/
		my.Point.prototype.setToFixed = function(items, y) {
			var x;
			if (my.isa(items, 'str')) {
				this.fixed = items;
			}
			else {
				x = (my.isa(items, 'obj') && my.xt(items.x)) ? items.x : ((my.isa(items, 'num')) ? items : 0);
				y = (my.isa(items, 'obj') && my.xt(items.y)) ? items.y : ((my.isa(y, 'num')) ? y : 0);
				this.local.x = x;
				this.local.y = y;
				this.fixed = true;
			}
			return this;
		};

		/**
# Link

## Instantiation

* Objects created via Path factories

## Purpose

* Defines the type of line to be drawn between two Point objects
* Can be of the form (species): line, bezier, quadratic
* Posesses actions: 'add', 'move' (to not draw a line), 'close' (end Point is Path object's startPoint), 'end' (for non-closed Path objects)
* Makes use of additional control points to determine curves

## Access

* scrawl.link.LINKNAME - for the Link object

@class Link
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
@private
**/
		my.Link = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			my.Base.prototype.set.call(this, items);
			this.startPoint = my.xtGet(items.startPoint, my.d.Link.startPoint);
			this.entity = (my.xt(my.point[this.startPoint])) ? my.point[this.startPoint].entity : my.d.Link.entity;
			this.endPoint = my.xtGet(items.endPoint, my.d.Link.endPoint);
			this.species = my.xtGet(items.species, my.d.Link.species);
			this.action = my.xtGet(items.action, my.d.Link.action);
			my.link[this.name] = this;
			my.pushUnique(my.linknames, this.name);
			this.positionsX = [];
			this.positionsY = [];
			this.positionsLength = [];
			this.positionsCumulativeLength = [];
			if (this.startPoint && this.entity && this.action === 'add') {
				my.pushUnique(my.entity[this.entity].linkList, this.name);
			}
			return this;
		};
		my.Link.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Link'
@final
**/
		my.Link.prototype.type = 'Link';
		my.Link.prototype.classname = 'linknames';
		if (!my.xt(my.worklink)) {
			my.worklink = {
				start: my.makeVector({
					name: 'scrawl.worklink.start'
				}),
				end: my.makeVector({
					name: 'scrawl.worklink.end'
				}),
				control1: my.makeVector({
					name: 'scrawl.worklink.control1'
				}),
				control2: my.makeVector({
					name: 'scrawl.worklink.control2'
				}),
				v1: my.makeVector({
					name: 'scrawl.worklink.v1'
				}),
				v2: my.makeVector({
					name: 'scrawl.worklink.v2'
				}),
				v3: my.makeVector({
					name: 'scrawl.worklink.v3'
				}),
			};
		}
		my.d.Link = {
			/**
Type of link - permitted values include: 'line', 'quadratic', 'bezier'
@property species
@type String
@default ''
**/
			species: '',
			/**
POINTNAME of start Point object - used by line, quadratic and bezier links
@property startPoint
@type String
@default ''
**/
			startPoint: '',
			/**
SPRITENAME of this Link's parent entity object
@property entity
@type String
@default ''
**/
			entity: '',
			/**
POINTNAME of end Point object - used by line, quadratic and bezier links
@property endPoint
@type String
@default ''
**/
			endPoint: '',
			/**
POINTNAME of first control Point object - used by quadratic and bezier links
@property controlPoint1
@type String
@default ''
**/
			controlPoint1: '',
			/**
POINTNAME of second control Point object - used by bezier links
@property controlPoint2
@type String
@default ''
**/
			controlPoint2: '',
			/**
Link object's action - permitted values include: 'add', 'move', 'close', 'end'
@property startLink
@type String
@default 'add'
**/
			action: 'add',
			/**
Link length - this value will be affected by the value of the parent Entity object's __precision__ attribute
@property length
@type Number
@default 0
@private
**/
			length: 0,
			/**
Positions Arrays along the length of the Link's path - these values will be affected by the value of the parent Entity object's __precision__ attribute
@property positionsX
@type Array
@default []
@private
**/
			positionsX: [],
			/**
Positions Arrays along the length of the Link's path - these values will be affected by the value of the parent Entity object's __precision__ attribute
@property positionsY
@type Array
@default []
@private
**/
			positionsY: [],
			/**
Positions Arrays along the length of the Link's path - these values will be affected by the value of the parent Entity object's __precision__ attribute
@property positionsLength
@type Array
@default []
@private
**/
			positionsLength: [],
			/**
Positions Arrays along the length of the Link's path - these values will be affected by the value of the parent Entity object's __precision__ attribute
@property positionsCumulativeLength
@type Array
@default []
@private
**/
			positionsCumulativeLength: []
		};
		my.mergeInto(my.d.Link, my.d.Base);
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Link.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			items = my.safeObject(items);
			if (my.isa(items.entity, 'str') && items.entity !== this.entity && this.entity) {
				my.removeItem(my.entity[this.entity].linkList, this.name);
			}
			if (my.isa(items.action, 'str') && this.entity && my.entity[this.entity]) {
				if (items.action === 'add') {
					my.pushUnique(my.entity[this.entity].linkList, this.name);
				}
				else {
					my.removeItem(my.entity[this.entity].linkList, this.name);
				}
			}
			return this;
		};
		/**
Position calculation helper function
@method pointOnLine
@param {Point} origin Start Point for calculation
@param {Point} destination End Point for calculation
@param {Number} val Distance between start and end points, where 0 = start and 1 = end
@return Coordinate Vector
@private
**/
		my.Link.prototype.pointOnLine = function(origin, destination, val) {
			if (origin && destination && my.isa(val, 'num')) {
				return destination.vectorSubtract(origin).scalarMultiply(val).vectorAdd(origin);
			}
			return false;
		};
		/**
Position calculation helper function

Result Object contains the following attributes:

* __start__ - Link.start Point object's local Vector
* __end__ - Link.end Point object's local Vector
* __control1__ - Link.controlPoint1 Point object's local Vector
* __control2__ - Link.controlPoint2 Point object's local Vector
@method getPointCoordinates
@return Result Object
@private
**/
		my.Link.prototype.getPointCoordinates = function() {
			var vector;
			vector = (this.startPoint) ? my.point[this.startPoint].getCurrentCoordinates() : my.o;
			my.worklink.start.x = vector.x || 0;
			my.worklink.start.y = vector.y || 0;
			my.worklink.start.z = vector.z || 0;
			vector = (this.endPoint) ? my.point[this.endPoint].getCurrentCoordinates() : my.o;
			my.worklink.end.x = vector.x || 0;
			my.worklink.end.y = vector.y || 0;
			my.worklink.end.z = vector.z || 0;
			vector = (this.controlPoint1) ? my.point[this.controlPoint1].getCurrentCoordinates() : my.o;
			my.worklink.control1.x = vector.x || 0;
			my.worklink.control1.y = vector.y || 0;
			my.worklink.control1.z = vector.z || 0;
			vector = (this.controlPoint2) ? my.point[this.controlPoint2].getCurrentCoordinates() : my.o;
			my.worklink.control2.x = vector.x || 0;
			my.worklink.control2.y = vector.y || 0;
			my.worklink.control2.z = vector.z || 0;
			return my.worklink;
		};
		/**
Position calculation helper function
@method getLocalPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
		my.Link.prototype.getLocalPositionOnLink = function(val) {
			var mid1,
				mid2,
				fst1,
				fst2,
				fst3,
				sec1,
				sec2,
				result = {
					x: 0,
					y: 0,
					z: 0
				};
			val = (my.isa(val, 'num')) ? val : 1;
			this.getPointCoordinates();
			switch (this.species) {
				case 'line':
					my.worklink.v1.set(this.pointOnLine(my.worklink.start, my.worklink.end, val));
					break;
				case 'quadratic':
					mid2 = this.pointOnLine(my.worklink.control1, my.worklink.end, val);
					mid1 = this.pointOnLine(my.worklink.start, my.worklink.control1, val);
					my.worklink.v1.set(this.pointOnLine(mid1, mid2, val));
					break;
				case 'bezier':
					fst3 = this.pointOnLine(my.worklink.control2, my.worklink.end, val);
					fst2 = this.pointOnLine(my.worklink.control1, my.worklink.control2, val);
					fst1 = this.pointOnLine(my.worklink.start, my.worklink.control1, val);
					sec2 = this.pointOnLine(fst2, fst3, val);
					sec1 = this.pointOnLine(fst1, fst2, val);
					my.worklink.v1.set(this.pointOnLine(sec1, sec2, val));
					break;
				default:
					my.worklink.v1.set(result);
			}
			return my.worklink.v1;
		};
		/**
Position calculation helper function
@method getPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
		my.Link.prototype.getPositionOnLink = function(val) {
			var entity,
				result;
			entity = my.entity[this.entity];
			if (my.isa(val, 'num')) {
				result = this.getLocalPositionOnLink(val);
				return result.rotate(entity.roll).vectorAdd(entity.getStartValues());
			}
			return false;
		};
		/**
Position calculation helper function
@method getLocalSteadyPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
		my.Link.prototype.getLocalSteadyPositionOnLink = function(val) {
			var dPos,
				precision,
				distance,
				i,
				iz;
			val = (my.isa(val, 'num')) ? val : 1;
			precision = my.entity[this.entity].get('precision');
			distance = this.length * val;
			distance = (distance > this.positionsCumulativeLength[precision]) ? this.positionsCumulativeLength[precision] : ((distance < 0) ? 0 : distance);
			for (i = 1; i <= precision; i++) {
				if (distance <= this.positionsCumulativeLength[i]) {
					my.worklink.v1.x = this.positionsX[i - 1];
					my.worklink.v1.y = this.positionsY[i - 1];
					my.worklink.v2.x = this.positionsX[i];
					my.worklink.v2.y = this.positionsY[i];
					my.worklink.v2.vectorSubtract(my.worklink.v1);
					dPos = (distance - this.positionsCumulativeLength[i - 1]) / this.positionsLength[i];
					return my.worklink.v2.scalarMultiply(dPos).vectorAdd(my.worklink.v1);
				}
			}
			return false;
		};
		/**
Position calculation helper function
@method getSteadyPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
		my.Link.prototype.getSteadyPositionOnLink = function(val) {
			var entity,
				result;
			entity = my.entity[this.entity];
			result = this.getLocalSteadyPositionOnLink(val);
			result.rotate(entity.roll).vectorAdd(entity.getStartValues());
			return result;
		};
		/**
Returns length of Link, in pixels
@method getLength
@return Length, in pixels
**/
		my.Link.prototype.getLength = function() {
			this.setPositions();
			return this.length;
		};
		/**
(re)Calculate the Link object's __positions__ array
@method setPositions
@param {Number} [val] - precision level for the calculation. Default: parent Shape object's precision value
@return This
@chainable
**/
		my.Link.prototype.setPositions = function(val) {
			var pts,
				precision,
				step,
				pos,
				here,
				dist,
				cumLen,
				entity,
				temp,
				j;
			if (this.action === 'add') {
				pts = this.getPointCoordinates();
				precision = (my.isa(val, 'num') && val > 0) ? val : (my.entity[this.entity].get('precision'));
				step = 1 / precision;
				cumLen = 0;
				my.worklink.v2.set(pts.start);
				entity = my.entity[this.entity];
				temp = entity.roll;
				this.positionsX.length = 0;
				this.positionsY.length = 0;
				this.positionsLength.length = 0;
				this.positionsCumulativeLength.length = 0;
				this.positionsX[0] = my.worklink.v2.x;
				this.positionsY[0] = my.worklink.v2.y;
				this.positionsLength[0] = 0;
				this.positionsCumulativeLength[0] = 0;
				entity.roll = 0;
				for (j = 1; j <= precision; j++) {
					pos = step * ((j - 1) + 1);
					here = this.getPositionOnLink(pos); //my.worklink.v1
					here.vectorSubtract(entity.getStartValues());
					my.worklink.v3.set(here);
					dist = here.vectorSubtract(my.worklink.v2).getMagnitude();
					my.worklink.v2.set(my.worklink.v3);
					cumLen += dist;
					this.positionsX[j] = my.worklink.v2.x;
					this.positionsY[j] = my.worklink.v2.y;
					this.positionsLength[j] = dist;
					this.positionsCumulativeLength[j] = cumLen;
				}
				this.length = this.positionsCumulativeLength[precision];
				entity.roll = temp;
			}
			return this;
		};
		/**
Path object drawing helper function

_Note: this function is recursive_

@method sketch
@param {Object} ctx Entity Cell's &lt;canvas&gt; element's context engine Object
@return True (eventually)
@private
**/
		my.Link.prototype.sketch = function(ctx) {
			var myEnd,
				myCon1,
				myCon2;
			switch (this.action) {
				case 'close':
					ctx.closePath();
					break;
				case 'move':
					myEnd = my.point[this.endPoint].getCurrentCoordinates();
					ctx.moveTo(
						myEnd.x,
						myEnd.y
					);
					break;
				case 'add':
					switch (this.species) {
						case 'line':
							myEnd = my.point[this.endPoint].getCurrentCoordinates();
							ctx.lineTo(
								myEnd.x,
								myEnd.y
							);
							break;
						case 'quadratic':
							myCon1 = my.point[this.get('controlPoint1')].getCurrentCoordinates();
							myEnd = my.point[this.endPoint].getCurrentCoordinates();
							ctx.quadraticCurveTo(
								myCon1.x,
								myCon1.y,
								myEnd.x,
								myEnd.y
							);
							break;
						case 'bezier':
							myCon1 = my.point[this.get('controlPoint1')].getCurrentCoordinates();
							myCon2 = my.point[this.get('controlPoint2')].getCurrentCoordinates();
							myEnd = my.point[this.endPoint].getCurrentCoordinates();
							ctx.bezierCurveTo(
								myCon1.x,
								myCon1.y,
								myCon2.x,
								myCon2.y,
								myEnd.x,
								myEnd.y
							);
							break;
						default:
							return true;
					}
					break;
				default:
					return true;
			}
			my.link[my.point[this.endPoint].startLink].sketch(ctx);
			return true;
		};

		return my;
	}(scrawl));
}
