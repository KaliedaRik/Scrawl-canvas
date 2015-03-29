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
# scrawlPathFactories

## Purpose and features

The Factories module adds a set of factory functions to the Scrawl library, which can be used to generate both Path and Shape entitys

@module scrawlPathFactories
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'factories')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPathFactories module adaptions to the Scrawl library object

@class window.scrawl_Factories
**/

		/**
A __factory__ function to generate elliptical Shape or Path entity objects

The argument can include:
* __radiusX__ - Number, horizontal radius of ellipse; default: 0 (not retained)
* __radiusY__ - Number, vertical radius of ellipse; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeEllipse
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeEllipse = function(items) {
			var cell,
				startX,
				startY,
				radiusX,
				radiusY,
				myData,
				cx,
				cy,
				dx,
				dy;
			items = my.safeObject(items);
			items.closed = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, cell, true) : items.startX || 0;
			startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, cell, false) : items.startY || 0;
			radiusX = (my.isa(items.radiusX, 'str')) ? my.convertPercentage(items.radiusX, cell, true) : items.radiusX || 0;
			radiusY = (my.isa(items.radiusY, 'str')) ? my.convertPercentage(items.radiusY, cell, false) : items.radiusY || 0;
			myData = 'm';
			cx = startX;
			cy = startY;
			dx = startX;
			dy = startY - radiusY;
			myData += (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + (radiusX * 0.55);
			dy = startY - radiusY;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + radiusX;
			dy = startY - (radiusY * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + radiusX;
			dy = startY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + radiusX;
			dy = startY + (radiusY * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + (radiusX * 0.55);
			dy = startY + radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX;
			dy = startY + radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - (radiusX * 0.55);
			dy = startY + radiusY;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - radiusX;
			dy = startY + (radiusY * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - radiusX;
			dy = startY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - radiusX;
			dy = startY - (radiusY * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - (radiusX * 0.55);
			dy = startY - radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX;
			dy = startY - radiusY;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.shape) ? my.makeShape(items) : my.makePath(items);
		};
		/**
A __factory__ function to generate rectangular Shape or Path entity objects, with optional rounded corners

The argument can include:
* __width__ - Number or % String, default: 0
* __height__ - Number or % String, default: 0
* also, 0, 1 or more of the following __radius__ attributes (all Number, default: radius=0): radiusTopLeftX, radiusTopLeftY, radiusTopRightX, radiusTopRightY, radiusBottomRightX, radiusBottomRightY, radiusBottomLeftX, radiusBottomLeftY, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, radiusTopX, radiusTopY, radiusBottomX, radiusBottomY, radiusLeftX, radiusLeftY, radiusRightX, radiusRightY, radiusTop, radiusBottom, radiusRight, radiusLeft, radiusX, radiusY, radius (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeRectangle
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeRectangle = function(items) {
			var cell,
				startX,
				startY,
				width,
				height,
				halfWidth,
				halfHeight,
				brx,
				bry,
				blx,
				bly,
				tlx,
				tly,
				trx,
				_try,
				myData,
				cx,
				cy,
				dx,
				dy;
			items = my.safeObject(items);
			items.closed = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, cell, true) : items.startX || 0;
			startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, cell, false) : items.startY || 0;
			width = (my.isa(items.width, 'str')) ? my.convertPercentage(items.width, cell, true) : items.width || 0;
			height = (my.isa(items.height, 'str')) ? my.convertPercentage(items.height, cell, false) : items.height || 0;
			brx = my.xtGet(items.radiusTopLeftX, items.radiusTopLeft, items.radiusTopX, items.radiusLeftX, items.radiusTop, items.radiusLeft, items.radiusX, items.radius, 0);
			bry = my.xtGet(items.radiusTopLeftY, items.radiusTopLeft, items.radiusTopY, items.radiusLeftY, items.radiusTop, items.radiusLeft, items.radiusY, items.radius, 0);
			blx = my.xtGet(items.radiusTopRightX, items.radiusTopRight, items.radiusTopX, items.radiusRightX, items.radiusTop, items.radiusRight, items.radiusX, items.radius, 0);
			bly = my.xtGet(items.radiusTopRightY, items.radiusTopRight, items.radiusTopY, items.radiusRightY, items.radiusTop, items.radiusRight, items.radiusY, items.radius, 0);
			tlx = my.xtGet(items.radiusBottomRightX, items.radiusBottomRight, items.radiusBottomX, items.radiusRightX, items.radiusBottom, items.radiusRight, items.radiusX, items.radius, 0);
			tly = my.xtGet(items.radiusBottomRightY, items.radiusBottomRight, items.radiusBottomY, items.radiusRightY, items.radiusBottom, items.radiusRight, items.radiusY, items.radius, 0);
			trx = my.xtGet(items.radiusBottomLeftX, items.radiusBottomLeft, items.radiusBottomX, items.radiusLeftX, items.radiusBottom, items.radiusLeft, items.radiusX, items.radius, 0);
			_try = my.xtGet(items.radiusBottomLeftY, items.radiusBottomLeft, items.radiusBottomY, items.radiusLeftY, items.radiusBottom, items.radiusLeft, items.radiusY, items.radius, 0);
			halfWidth = (width / 2);
			halfHeight = (height / 2);
			myData = 'm';
			cx = startX;
			cy = startY;
			dx = startX - halfWidth + tlx;
			dy = startY - halfHeight;
			myData += (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth - trx;
			dy = startY - halfHeight;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth - trx + (trx * 0.55);
			dy = startY - halfHeight;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth;
			dy = startY - halfHeight +
				_try - (
					_try * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth;
			dy = startY - halfHeight +
				_try;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth;
			dy = startY + halfHeight - bry;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX + halfWidth;
			dy = startY + halfHeight - bry + (bry * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth - brx + (brx * 0.55);
			dy = startY + halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX + halfWidth - brx;
			dy = startY + halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth + blx;
			dy = startY + halfHeight;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth + blx - (blx * 0.55);
			dy = startY + halfHeight;
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth;
			dy = startY + halfHeight - bly + (bly * 0.55);
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth;
			dy = startY + halfHeight - bly;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth;
			dy = startY - halfHeight + tly;
			myData += 'l' + (cx - dx) + ',' + (cy - dy);
			cx = dx;
			cy = dy;
			dx = startX - halfWidth;
			dy = startY - halfHeight + tly - (tly * 0.55);
			myData += 'c' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth + tlx - (tlx * 0.55);
			dy = startY - halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			dx = startX - halfWidth + tlx;
			dy = startY - halfHeight;
			myData += ' ' + (cx - dx) + ',' + (cy - dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.shape) ? my.makeShape(items) : my.makePath(items);
		};
		/**
A __factory__ function to generate bezier curve Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __startControlX__ - Number or % String; default: 0 (not retained)
* __startControlY__ - Number or % String; default: 0 (not retained)
* __endControlX__ - Number or % String; default: 0 (not retained)
* __endControlY__ - Number or % String; default: 0 (not retained)
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeBezier
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeBezier = function(items) {
			var cell,
				startX,
				startY,
				startControlX,
				startControlY,
				endControlX,
				endControlY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName;
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, cell, true) : items.startX || 0;
			startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, cell, false) : items.startY || 0;
			startControlX = (my.isa(items.startControlX, 'str')) ? my.convertPercentage(items.startControlX, cell, true) : items.startControlX || 0;
			startControlY = (my.isa(items.startControlY, 'str')) ? my.convertPercentage(items.startControlY, cell, false) : items.startControlY || 0;
			endControlX = (my.isa(items.endControlX, 'str')) ? my.convertPercentage(items.endControlX, cell, true) : items.endControlX || 0;
			endControlY = (my.isa(items.endControlY, 'str')) ? my.convertPercentage(items.endControlY, cell, false) : items.endControlY || 0;
			endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, cell, true) : items.endX || 0;
			endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, cell, false) : items.endY || 0;
			myFixed = items.fixed || 'none';
			items.fixed = false;
			data = 'm0,0c' +
				(startControlX - startX) + ',' + (startControlY - startY) + ' ' +
				(endControlX - startX) + ',' + (endControlY - startY) + ' ' +
				(endX - startX) + ',' + (endY - startY);
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'all':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						my.point[tempName + '_p2'].setToFixed(startControlX, startControlY);
						my.point[tempName + '_p3'].setToFixed(endControlX, endControlY);
						my.point[tempName + '_p4'].setToFixed(endX, endY);
						break;
					case 'both':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						my.point[tempName + '_p4'].setToFixed(endX, endY);
						break;
					case 'start':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'startControl':
						my.point[tempName + '_p2'].setToFixed(startControlX, startControlY);
						break;
					case 'endControl':
						my.point[tempName + '_p3'].setToFixed(endControlX, endControlY);
						break;
					case 'end':
						my.point[tempName + '_p4'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate quadratic curve Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __controlX__ - Number or % String; default: 0 (not retained)
* __controlY__ - Number or % String; default: 0 (not retained)
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeQuadratic
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeQuadratic = function(items) {
			var cell,
				startX,
				startY,
				controlX,
				controlY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName;
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			cell = my.Entity.prototype.getEntityCell(items);
			startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, cell, true) : items.startX || 0;
			startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, cell, false) : items.startY || 0;
			controlX = (my.isa(items.controlX, 'str')) ? my.convertPercentage(items.controlX, cell, true) : items.controlX || 0;
			controlY = (my.isa(items.controlY, 'str')) ? my.convertPercentage(items.controlY, cell, false) : items.controlY || 0;
			endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, cell, true) : items.endX || 0;
			endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, cell, false) : items.endY || 0;
			myFixed = items.fixed || 'none';
			data = 'm0,0q' +
				(controlX - startX) + ',' + (controlY - startY) + ' ' +
				(endX - startX) + ',' + (endY - startY);
			items.fixed = false;
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'all':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						my.point[tempName + '_p2'].setToFixed(controlX, controlY);
						my.point[tempName + '_p3'].setToFixed(endX, endY);
						break;
					case 'both':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						my.point[tempName + '_p3'].setToFixed(endX, endY);
						break;
					case 'start':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'control':
						my.point[tempName + '_p2'].setToFixed(controlX, controlY);
						break;
					case 'end':
						my.point[tempName + '_p3'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate straight line Shape or Path entity objects

The argument can include:
* __startX__ - Number or % String; default: 0
* __startY__ - Number or % String; default: 0
* __endX__ - Number or % String; default: 0 (not retained)
* __endY__ - Number or % String; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Entity, Context or Shape/Path attribute

Percentage String values are relative to the entity's cell's dimensions

@method makeLine
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeLine = function(items) {
			var cell,
				startX,
				startY,
				endX,
				endY,
				data,
				myFixed,
				myShape,
				tempName;
			items = my.safeObject(items);
			items.isLine = true;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			cell = my.Entity.prototype.getEntityCell(items);
			startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, cell, true) : items.startX || 0;
			startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, cell, false) : items.startY || 0;
			endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, cell, true) : items.endX || 0;
			endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, cell, false) : items.endY || 0;
			myFixed = items.fixed || 'none';
			data = 'm0,0 ' + (endX - startX) + ',' + (endY - startY);
			items.fixed = false;
			items.data = data;
			if (items.shape) {
				myShape = my.makeShape(items);
			}
			else {
				myShape = my.makePath(items);
				tempName = myShape.name.replace('~', '_', 'g');
				switch (myFixed) {
					case 'both':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						my.point[tempName + '_p2'].setToFixed(endX, endY);
						break;
					case 'start':
						my.point[tempName + '_p1'].setToFixed(startX, startY);
						break;
					case 'end':
						my.point[tempName + '_p2'].setToFixed(endX, endY);
						break;
				}
			}
			return myShape;
		};
		/**
A __factory__ function to generate regular entitys such as triangles, stars, hexagons, etc

The argument can include:
* __angle__ - Number; eg an angle of 72 produces a pentagon, while 144 produces a five-pointed star - default: 0
* __sides__ - Number; number of sides to the regular entity - default: 0
* __outline__ - Number; default: 0
* __radius__ - Number; default: 0 (not retained)
* __startControlX__ - Number or % String - x coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlX__ - alias for startControlX; default: 0 (not retained)
* __startControlY__ - Number or % String - y coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlY__ - alias for startControlY; default: 0 (not retained)
* __endControlX__ - Number or % String - x coordinate for endControl (bezier) curve; default: 0 (not retained)
* __endControlY__ - Number or % String - y coordinate for endControl (bezier) curve; default: 0 (not retained)
* __lineType__ - String defining type of line/curve to use for generated entity (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Entitys can be generated using lines, or quadratic or bezier curves. The species of line to use is defined in the __lineType__ attribute which accepts the following values:
* '__l__' - straight line (default)
* '__q__' - quadratic curve
* '__t__' - reflected quadratic curve
* '__c__' - bezier curve
* '__s__' - reflected bezier curve

_Either the 'angle' attribute or the 'sides' attribute (but not both) must be included in the argument object_

Percentage String values are relative to the entity's cell's dimensions

@method makeRegularShape
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
		my.makeRegularShape = function(items) {
			var stat1 = ['c', 's', 'q', 't', 'l'],
				stat2 = ['s', 't'],
				stat3 = ['c', 's', 'q', 't'],
				stat4 = ['c', 'q'],
				cell,
				startX,
				startY,
				radius,
				turn,
				currentAngle,
				count,
				test,
				species,
				c1x,
				c1y,
				c2x,
				c2y,
				data;
			items = my.safeObject(items);
			cell = my.Entity.prototype.getEntityCell(items);
			if (my.xto(items.sides, items.angle)) {
				items.closed = true;
				items.isLine = false;
				c1x = my.xtGet(items.startControlX, items.controlX, 0);
				c1y = my.xtGet(items.startControlY, items.controlY, 0);
				c2x = items.endControlX || 0;
				c2y = items.endControlY || 0;
				c1x = (my.isa(c1x, 'str')) ? my.convertPercentage(c1x, cell, true) : c1x;
				c1y = (my.isa(c1y, 'str')) ? my.convertPercentage(c1y, cell, false) : c1y;
				c2x = (my.isa(c2x, 'str')) ? my.convertPercentage(c2x, cell, true) : c2x;
				c2y = (my.isa(c2y, 'str')) ? my.convertPercentage(c2y, cell, false) : c2y;
				species = (my.contains(stat1, items.lineType)) ? items.lineType : 'l';
				radius = items.radius || 20;
				// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
				turn = (my.isa(items.sides, 'num') && items.sides > 1) ? 360 / items.sides : ((my.isa(items.angle, 'num') && items.angle > 0) ? items.angle : 4);
				currentAngle = 0;
				count = 0;
				my.worklink.v1.x = radius;
				my.worklink.v1.y = 0;
				my.worklink.v1.z = 0;
				my.worklink.v2.set(my.worklink.v1);
				my.worklink.control1.x = c1x;
				my.worklink.control1.y = c1y;
				my.worklink.control1.z = 0;
				my.worklink.control2.x = c2x;
				my.worklink.control2.y = c2y;
				my.worklink.control2.z = 0;
				data = 'm' + my.worklink.v1.x.toFixed(4) + ',' + my.worklink.v1.y.toFixed(4);
				if (my.contains(stat2, species)) {
					data += ('s' === species) ? 'c' : 'q';
				}
				else {
					data += species;
				}
				do {
					count++;
					currentAngle += turn;
					currentAngle = currentAngle % 360;
					test = currentAngle.toFixed(0);
					my.worklink.v1.rotate(turn);
					my.worklink.control1.rotate(turn);
					my.worklink.control2.rotate(turn);
					if (my.contains(stat3, species)) {
						if (1 === count && my.contains(stat2, species)) {
							if ('s' === species) {
								data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ' + my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
							}
							else {
								data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ';
							}
						}
						else {
							if ('s' === species) {
								data += my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
							}
							else if (my.contains(stat4, species)) {
								data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ';
							}
						}
					}
					if ('c' === species) {
						data += my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
					}
					data += (my.worklink.v1.x - my.worklink.v2.x).toFixed(4) + ',' + (my.worklink.v1.y - my.worklink.v2.y).toFixed(4) + ' ';
					if (1 === count) {
						if (my.contains(stat2, species)) {
							data += ('s' === species) ? 's' : 't';
						}
					}
					my.worklink.v2.set(my.worklink.v1);
				} while (test !== '0' && count < 1000);
				data += 'z';
				items.data = data;
				return (items.shape) ? my.makeShape(items) : my.makePath(items);
			}
			return false;
		};

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
		/**
A __factory__ helper function - convert percentage values to pixel values
@method convertPercentage
@param {String} val - the percentage to be converted
@param {Object} cell - the reference cell
@param {Boolean} useWidth - true calculates the x point along the cell width; false calculates the y point against height
@return Number result (px)
@private
**/
		my.convertPercentage = function(val, cell, useWidth) {
			return (useWidth) ? (parseFloat(val) / 100) * cell.actualWidth : (parseFloat(val) / 100) * cell.actualHeight;
		};

		return my;
	}(scrawl));
}
