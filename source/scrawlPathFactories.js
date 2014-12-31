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
# scrawlPathFactories

## Purpose and features

The Factories module adds a set of factory functions to the Scrawl library, which can be used to generate both Path and Shape entitys

@module scrawlPathFactories
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'factories')) {
	var scrawl = (function(my, S) {
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
		S.makeEllipse_cell = null; //scrawl Cell object
		S.makeEllipse_startX = 0;
		S.makeEllipse_startY = 0;
		S.makeEllipse_radiusX = 0;
		S.makeEllipse_radiusY = 0;
		S.makeEllipse_myData = '';
		S.makeEllipse_cx = 0;
		S.makeEllipse_cy = 0;
		S.makeEllipse_dx = 0;
		S.makeEllipse_dy = 0;
		my.makeEllipse = function(items) {
			items = my.safeObject(items);
			items.closed = true;
			S.makeEllipse_cell = my.Entity.prototype.getEntityCell(items);
			S.makeEllipse_startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, S.makeEllipse_cell, true) : items.startX || 0;
			S.makeEllipse_startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, S.makeEllipse_cell, false) : items.startY || 0;
			S.makeEllipse_radiusX = (my.isa(items.radiusX, 'str')) ? my.convertPercentage(items.radiusX, S.makeEllipse_cell, true) : items.radiusX || 0;
			S.makeEllipse_radiusY = (my.isa(items.radiusY, 'str')) ? my.convertPercentage(items.radiusY, S.makeEllipse_cell, false) : items.radiusY || 0;
			S.makeEllipse_myData = 'm';
			S.makeEllipse_cx = S.makeEllipse_startX;
			S.makeEllipse_cy = S.makeEllipse_startY;
			S.makeEllipse_dx = S.makeEllipse_startX;
			S.makeEllipse_dy = S.makeEllipse_startY - S.makeEllipse_radiusY;
			S.makeEllipse_myData += (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_cx = S.makeEllipse_dx;
			S.makeEllipse_cy = S.makeEllipse_dy;
			S.makeEllipse_dx = S.makeEllipse_startX + (S.makeEllipse_radiusX * 0.55);
			S.makeEllipse_dy = S.makeEllipse_startY - S.makeEllipse_radiusY;
			S.makeEllipse_myData += 'c' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX + S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY - (S.makeEllipse_radiusY * 0.55);
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX + S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_cx = S.makeEllipse_dx;
			S.makeEllipse_cy = S.makeEllipse_dy;
			S.makeEllipse_dx = S.makeEllipse_startX + S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY + (S.makeEllipse_radiusY * 0.55);
			S.makeEllipse_myData += 'c' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX + (S.makeEllipse_radiusX * 0.55);
			S.makeEllipse_dy = S.makeEllipse_startY + S.makeEllipse_radiusY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX;
			S.makeEllipse_dy = S.makeEllipse_startY + S.makeEllipse_radiusY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_cx = S.makeEllipse_dx;
			S.makeEllipse_cy = S.makeEllipse_dy;
			S.makeEllipse_dx = S.makeEllipse_startX - (S.makeEllipse_radiusX * 0.55);
			S.makeEllipse_dy = S.makeEllipse_startY + S.makeEllipse_radiusY;
			S.makeEllipse_myData += 'c' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX - S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY + (S.makeEllipse_radiusY * 0.55);
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX - S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_cx = S.makeEllipse_dx;
			S.makeEllipse_cy = S.makeEllipse_dy;
			S.makeEllipse_dx = S.makeEllipse_startX - S.makeEllipse_radiusX;
			S.makeEllipse_dy = S.makeEllipse_startY - (S.makeEllipse_radiusY * 0.55);
			S.makeEllipse_myData += 'c' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX - (S.makeEllipse_radiusX * 0.55);
			S.makeEllipse_dy = S.makeEllipse_startY - S.makeEllipse_radiusY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_dx = S.makeEllipse_startX;
			S.makeEllipse_dy = S.makeEllipse_startY - S.makeEllipse_radiusY;
			S.makeEllipse_myData += ' ' + (S.makeEllipse_cx - S.makeEllipse_dx) + ',' + (S.makeEllipse_cy - S.makeEllipse_dy);
			S.makeEllipse_myData += 'z';
			items.isLine = false;
			items.data = S.makeEllipse_myData;
			return (items.shape) ? my.newShape(items) : my.makePath(items);
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
		S.makeRectangle_cell = null; //scrawl Cell object
		S.makeRectangle_startX = 0;
		S.makeRectangle_startY = 0;
		S.makeRectangle_width = 0;
		S.makeRectangle_height = 0;
		S.makeRectangle_halfWidth = 0;
		S.makeRectangle_halfHeight = 0;
		S.makeRectangle_brx = 0;
		S.makeRectangle_bry = 0;
		S.makeRectangle_blx = 0;
		S.makeRectangle_bly = 0;
		S.makeRectangle_tlx = 0;
		S.makeRectangle_tly = 0;
		S.makeRectangle_trx = 0;
		S.makeRectangle_try = 0;
		S.makeRectangle_myData = '';
		S.makeRectangle_cx = 0;
		S.makeRectangle_cy = 0;
		S.makeRectangle_dx = 0;
		S.makeRectangle_dy = 0;
		my.makeRectangle = function(items) {
			items = my.safeObject(items);
			items.closed = true;
			S.makeRectangle_cell = my.Entity.prototype.getEntityCell(items);
			S.makeRectangle_startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, S.makeRectangle_cell, true) : items.startX || 0;
			S.makeRectangle_startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, S.makeRectangle_cell, false) : items.startY || 0;
			S.makeRectangle_width = (my.isa(items.width, 'str')) ? my.convertPercentage(items.width, S.makeRectangle_cell, true) : items.width || 0;
			S.makeRectangle_height = (my.isa(items.height, 'str')) ? my.convertPercentage(items.height, S.makeRectangle_cell, false) : items.height || 0;
			S.makeRectangle_brx = my.xtGet(items.radiusTopLeftX, items.radiusTopLeft, items.radiusTopX, items.radiusLeftX, items.radiusTop, items.radiusLeft, items.radiusX, items.radius, 0);
			S.makeRectangle_bry = my.xtGet(items.radiusTopLeftY, items.radiusTopLeft, items.radiusTopY, items.radiusLeftY, items.radiusTop, items.radiusLeft, items.radiusY, items.radius, 0);
			S.makeRectangle_blx = my.xtGet(items.radiusTopRightX, items.radiusTopRight, items.radiusTopX, items.radiusRightX, items.radiusTop, items.radiusRight, items.radiusX, items.radius, 0);
			S.makeRectangle_bly = my.xtGet(items.radiusTopRightY, items.radiusTopRight, items.radiusTopY, items.radiusRightY, items.radiusTop, items.radiusRight, items.radiusY, items.radius, 0);
			S.makeRectangle_tlx = my.xtGet(items.radiusBottomRightX, items.radiusBottomRight, items.radiusBottomX, items.radiusRightX, items.radiusBottom, items.radiusRight, items.radiusX, items.radius, 0);
			S.makeRectangle_tly = my.xtGet(items.radiusBottomRightY, items.radiusBottomRight, items.radiusBottomY, items.radiusRightY, items.radiusBottom, items.radiusRight, items.radiusY, items.radius, 0);
			S.makeRectangle_trx = my.xtGet(items.radiusBottomLeftX, items.radiusBottomLeft, items.radiusBottomX, items.radiusLeftX, items.radiusBottom, items.radiusLeft, items.radiusX, items.radius, 0);
			S.makeRectangle_try = my.xtGet(items.radiusBottomLeftY, items.radiusBottomLeft, items.radiusBottomY, items.radiusLeftY, items.radiusBottom, items.radiusLeft, items.radiusY, items.radius, 0);
			S.makeRectangle_halfWidth = (S.makeRectangle_width / 2);
			S.makeRectangle_halfHeight = (S.makeRectangle_height / 2);
			S.makeRectangle_myData = 'm';
			S.makeRectangle_cx = S.makeRectangle_startX;
			S.makeRectangle_cy = S.makeRectangle_startY;
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth + S.makeRectangle_tlx;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight;
			S.makeRectangle_myData += (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth - S.makeRectangle_trx;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight;
			S.makeRectangle_myData += 'l' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth - S.makeRectangle_trx + (S.makeRectangle_trx * 0.55);
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight;
			S.makeRectangle_myData += 'c' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight + S.makeRectangle_try - (S.makeRectangle_try * 0.55);
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight + S.makeRectangle_try;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight - S.makeRectangle_bry;
			S.makeRectangle_myData += 'l' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight - S.makeRectangle_bry + (S.makeRectangle_bry * 0.55);
			S.makeRectangle_myData += 'c' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth - S.makeRectangle_brx + (S.makeRectangle_brx * 0.55);
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX + S.makeRectangle_halfWidth - S.makeRectangle_brx;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth + S.makeRectangle_blx;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight;
			S.makeRectangle_myData += 'l' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth + S.makeRectangle_blx - (S.makeRectangle_blx * 0.55);
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight;
			S.makeRectangle_myData += 'c' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight - S.makeRectangle_bly + (S.makeRectangle_bly * 0.55);
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY + S.makeRectangle_halfHeight - S.makeRectangle_bly;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight + S.makeRectangle_tly;
			S.makeRectangle_myData += 'l' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_cx = S.makeRectangle_dx;
			S.makeRectangle_cy = S.makeRectangle_dy;
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight + S.makeRectangle_tly - (S.makeRectangle_tly * 0.55);
			S.makeRectangle_myData += 'c' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth + S.makeRectangle_tlx - (S.makeRectangle_tlx * 0.55);
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_dx = S.makeRectangle_startX - S.makeRectangle_halfWidth + S.makeRectangle_tlx;
			S.makeRectangle_dy = S.makeRectangle_startY - S.makeRectangle_halfHeight;
			S.makeRectangle_myData += ' ' + (S.makeRectangle_cx - S.makeRectangle_dx) + ',' + (S.makeRectangle_cy - S.makeRectangle_dy);
			S.makeRectangle_myData += 'z';
			items.isLine = false;
			items.data = S.makeRectangle_myData;
			return (items.shape) ? my.newShape(items) : my.makePath(items);
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
		S.makeBezier_cell = null; //scrawl Cell object
		S.makeBezier_startX = 0;
		S.makeBezier_startY = 0;
		S.makeBezier_startControlX = 0;
		S.makeBezier_startControlY = 0;
		S.makeBezier_endControlX = 0;
		S.makeBezier_endControlY = 0;
		S.makeBezier_endX = 0;
		S.makeBezier_endY = 0;
		S.makeBezier_data = '';
		S.makeBezier_myFixed = '';
		S.makeBezier_myShape = null; //scrawl Entity object
		S.makeBezier_tempName = '';
		my.makeBezier = function(items) {
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			S.makeBezier_cell = my.Entity.prototype.getEntityCell(items);
			S.makeBezier_startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, S.makeBezier_cell, true) : items.startX || 0;
			S.makeBezier_startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, S.makeBezier_cell, false) : items.startY || 0;
			S.makeBezier_startControlX = (my.isa(items.startControlX, 'str')) ? my.convertPercentage(items.startControlX, S.makeBezier_cell, true) : items.startControlX || 0;
			S.makeBezier_startControlY = (my.isa(items.startControlY, 'str')) ? my.convertPercentage(items.startControlY, S.makeBezier_cell, false) : items.startControlY || 0;
			S.makeBezier_endControlX = (my.isa(items.endControlX, 'str')) ? my.convertPercentage(items.endControlX, S.makeBezier_cell, true) : items.endControlX || 0;
			S.makeBezier_endControlY = (my.isa(items.endControlY, 'str')) ? my.convertPercentage(items.endControlY, S.makeBezier_cell, false) : items.endControlY || 0;
			S.makeBezier_endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, S.makeBezier_cell, true) : items.endX || 0;
			S.makeBezier_endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, S.makeBezier_cell, false) : items.endY || 0;
			S.makeBezier_myFixed = items.fixed || 'none';
			items.fixed = false;
			S.makeBezier_data = 'm0,0c' +
				(S.makeBezier_startControlX - S.makeBezier_startX) + ',' + (S.makeBezier_startControlY - S.makeBezier_startY) + ' ' +
				(S.makeBezier_endControlX - S.makeBezier_startX) + ',' + (S.makeBezier_endControlY - S.makeBezier_startY) + ' ' +
				(S.makeBezier_endX - S.makeBezier_startX) + ',' + (S.makeBezier_endY - S.makeBezier_startY);
			items.data = S.makeBezier_data;
			if (items.shape) {
				S.makeBezier_myShape = my.newShape(items);
			}
			else {
				S.makeBezier_myShape = my.makePath(items);
				S.makeBezier_tempName = S.makeBezier_myShape.name.replace('~', '_', 'g');
				switch (S.makeBezier_myFixed) {
					case 'all':
						my.point[S.makeBezier_tempName + '_p1'].setToFixed(S.makeBezier_startX, S.makeBezier_startY);
						my.point[S.makeBezier_tempName + '_p2'].setToFixed(S.makeBezier_startControlX, S.makeBezier_startControlY);
						my.point[S.makeBezier_tempName + '_p3'].setToFixed(S.makeBezier_endControlX, S.makeBezier_endControlY);
						my.point[S.makeBezier_tempName + '_p4'].setToFixed(S.makeBezier_endX, S.makeBezier_endY);
						break;
					case 'both':
						my.point[S.makeBezier_tempName + '_p1'].setToFixed(S.makeBezier_startX, S.makeBezier_startY);
						my.point[S.makeBezier_tempName + '_p4'].setToFixed(S.makeBezier_endX, S.makeBezier_endY);
						break;
					case 'start':
						my.point[S.makeBezier_tempName + '_p1'].setToFixed(S.makeBezier_startX, S.makeBezier_startY);
						break;
					case 'startControl':
						my.point[S.makeBezier_tempName + '_p2'].setToFixed(S.makeBezier_startControlX, S.makeBezier_startControlY);
						break;
					case 'endControl':
						my.point[S.makeBezier_tempName + '_p3'].setToFixed(S.makeBezier_endControlX, S.makeBezier_endControlY);
						break;
					case 'end':
						my.point[S.makeBezier_tempName + '_p4'].setToFixed(S.makeBezier_endX, S.makeBezier_endY);
						break;
				}
			}
			return S.makeBezier_myShape;
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
		S.makeQuadratic_cell = null; //scrawl Cell object
		S.makeQuadratic_startX = 0;
		S.makeQuadratic_startY = 0;
		S.makeQuadratic_controlX = 0;
		S.makeQuadratic_controlY = 0;
		S.makeQuadratic_endX = 0;
		S.makeQuadratic_endY = 0;
		S.makeQuadratic_data = '';
		S.makeQuadratic_myFixed = '';
		S.makeQuadratic_myShape = null; //scrawl Entity object
		S.makeQuadratic_tempName = '';
		my.makeQuadratic = function(items) {
			items = my.safeObject(items);
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.isLine = true;
			S.makeQuadratic_cell = my.Entity.prototype.getEntityCell(items);
			S.makeQuadratic_startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, S.makeQuadratic_cell, true) : items.startX || 0;
			S.makeQuadratic_startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, S.makeQuadratic_cell, false) : items.startY || 0;
			S.makeQuadratic_controlX = (my.isa(items.controlX, 'str')) ? my.convertPercentage(items.controlX, S.makeQuadratic_cell, true) : items.controlX || 0;
			S.makeQuadratic_controlY = (my.isa(items.controlY, 'str')) ? my.convertPercentage(items.controlY, S.makeQuadratic_cell, false) : items.controlY || 0;
			S.makeQuadratic_endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, S.makeQuadratic_cell, true) : items.endX || 0;
			S.makeQuadratic_endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, S.makeQuadratic_cell, false) : items.endY || 0;
			S.makeQuadratic_myFixed = items.fixed || 'none';
			S.makeQuadratic_data = 'm0,0q' +
				(S.makeQuadratic_controlX - S.makeQuadratic_startX) + ',' + (S.makeQuadratic_controlY - S.makeQuadratic_startY) + ' ' +
				(S.makeQuadratic_endX - S.makeQuadratic_startX) + ',' + (S.makeQuadratic_endY - S.makeQuadratic_startY);
			items.fixed = false;
			items.data = S.makeQuadratic_data;
			if (items.shape) {
				S.makeQuadratic_myShape = my.newShape(items);
			}
			else {
				S.makeQuadratic_myShape = my.makePath(items);
				S.makeQuadratic_tempName = S.makeQuadratic_myShape.name.replace('~', '_', 'g');
				switch (S.makeQuadratic_myFixed) {
					case 'all':
						my.point[S.makeQuadratic_tempName + '_p1'].setToFixed(S.makeQuadratic_startX, S.makeQuadratic_startY);
						my.point[S.makeQuadratic_tempName + '_p2'].setToFixed(S.makeQuadratic_controlX, S.makeQuadratic_controlY);
						my.point[S.makeQuadratic_tempName + '_p3'].setToFixed(S.makeQuadratic_endX, S.makeQuadratic_endY);
						break;
					case 'both':
						my.point[S.makeQuadratic_tempName + '_p1'].setToFixed(S.makeQuadratic_startX, S.makeQuadratic_startY);
						my.point[S.makeQuadratic_tempName + '_p3'].setToFixed(S.makeQuadratic_endX, S.makeQuadratic_endY);
						break;
					case 'start':
						my.point[S.makeQuadratic_tempName + '_p1'].setToFixed(S.makeQuadratic_startX, S.makeQuadratic_startY);
						break;
					case 'control':
						my.point[S.makeQuadratic_tempName + '_p2'].setToFixed(S.makeQuadratic_controlX, S.makeQuadratic_controlY);
						break;
					case 'end':
						my.point[S.makeQuadratic_tempName + '_p3'].setToFixed(S.makeQuadratic_endX, S.makeQuadratic_endY);
						break;
				}
			}
			return S.makeQuadratic_myShape;
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
		S.makeLine_cell = null; //scrawl Cell object
		S.makeLine_startX = 0;
		S.makeLine_startY = 0;
		S.makeLine_endX = 0;
		S.makeLine_endY = 0;
		S.makeLine_data = '';
		S.makeLine_myFixed = '';
		S.makeLine_myShape = null; //scrawl Entity object
		S.makeLine_tempName = '';
		my.makeLine = function(items) {
			items = my.safeObject(items);
			items.isLine = true;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			S.makeLine_cell = my.Entity.prototype.getEntityCell(items);
			S.makeLine_startX = (my.isa(items.startX, 'str')) ? my.convertPercentage(items.startX, S.makeLine_cell, true) : items.startX || 0;
			S.makeLine_startY = (my.isa(items.startY, 'str')) ? my.convertPercentage(items.startY, S.makeLine_cell, false) : items.startY || 0;
			S.makeLine_endX = (my.isa(items.endX, 'str')) ? my.convertPercentage(items.endX, S.makeLine_cell, true) : items.endX || 0;
			S.makeLine_endY = (my.isa(items.endY, 'str')) ? my.convertPercentage(items.endY, S.makeLine_cell, false) : items.endY || 0;
			S.makeLine_myFixed = items.fixed || 'none';
			S.makeLine_data = 'm0,0 ' + (S.makeLine_endX - S.makeLine_startX) + ',' + (S.makeLine_endY - S.makeLine_startY);
			items.fixed = false;
			items.data = S.makeLine_data;
			if (items.shape) {
				S.makeLine_myShape = my.newShape(items);
			}
			else {
				S.makeLine_myShape = my.makePath(items);
				S.makeLine_tempName = S.makeLine_myShape.name.replace('~', '_', 'g');
				switch (S.makeLine_myFixed) {
					case 'both':
						my.point[S.makeLine_tempName + '_p1'].setToFixed(S.makeLine_startX, S.makeLine_startY);
						my.point[S.makeLine_tempName + '_p2'].setToFixed(S.makeLine_endX, S.makeLine_endY);
						break;
					case 'start':
						my.point[S.makeLine_tempName + '_p1'].setToFixed(S.makeLine_startX, S.makeLine_startY);
						break;
					case 'end':
						my.point[S.makeLine_tempName + '_p2'].setToFixed(S.makeLine_endX, S.makeLine_endY);
						break;
				}
			}
			return S.makeLine_myShape;
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
		S.stat_makeRegularShape1 = ['c', 's', 'q', 't', 'l'];
		S.stat_makeRegularShape2 = ['s', 't'];
		S.stat_makeRegularShape3 = ['c', 's', 'q', 't'];
		S.stat_makeRegularShape4 = ['c', 'q'];
		S.makeRegularShape_cell = null; //scrawl Cell object
		S.makeRegularShape_startX = 0;
		S.makeRegularShape_startY = 0;
		S.makeRegularShape_radius = 0;
		S.makeRegularShape_turn = 0;
		S.makeRegularShape_currentAngle = 0;
		S.makeRegularShape_count = 0;
		S.makeRegularShape_test = 0;
		S.makeRegularShape_species = '';
		S.makeRegularShape_c1x = 0;
		S.makeRegularShape_c1y = 0;
		S.makeRegularShape_c2x = 0;
		S.makeRegularShape_c2y = 0;
		S.makeRegularShape_data = '';
		my.makeRegularShape = function(items) {
			items = my.safeObject(items);
			S.makeRegularShape_cell = my.Entity.prototype.getEntityCell(items);
			if (my.xto(items.sides, items.angle)) {
				items.closed = true;
				items.isLine = false;
				S.makeRegularShape_c1x = my.xtGet(items.startControlX, items.controlX, 0);
				S.makeRegularShape_c1y = my.xtGet(items.startControlY, items.controlY, 0);
				S.makeRegularShape_c2x = items.endControlX || 0;
				S.makeRegularShape_c2y = items.endControlY || 0;
				S.makeRegularShape_c1x = (my.isa(S.makeRegularShape_c1x, 'str')) ? my.convertPercentage(S.makeRegularShape_c1x, S.makeRegularShape_cell, true) : S.makeRegularShape_c1x;
				S.makeRegularShape_c1y = (my.isa(S.makeRegularShape_c1y, 'str')) ? my.convertPercentage(S.makeRegularShape_c1y, S.makeRegularShape_cell, false) : S.makeRegularShape_c1y;
				S.makeRegularShape_c2x = (my.isa(S.makeRegularShape_c2x, 'str')) ? my.convertPercentage(S.makeRegularShape_c2x, S.makeRegularShape_cell, true) : S.makeRegularShape_c2x;
				S.makeRegularShape_c2y = (my.isa(S.makeRegularShape_c2y, 'str')) ? my.convertPercentage(S.makeRegularShape_c2y, S.makeRegularShape_cell, false) : S.makeRegularShape_c2y;
				S.makeRegularShape_species = (my.contains(S.stat_makeRegularShape1, items.lineType)) ? items.lineType : 'l';
				S.makeRegularShape_radius = items.radius || 20;
				// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
				S.makeRegularShape_turn = (my.isa(items.sides, 'num') && items.sides > 1) ? 360 / items.sides : ((my.isa(items.angle, 'num') && items.angle > 0) ? items.angle : 4);
				S.makeRegularShape_currentAngle = 0;
				S.makeRegularShape_count = 0;
				my.worklink.v1.x = S.makeRegularShape_radius;
				my.worklink.v1.y = 0;
				my.worklink.v1.z = 0;
				my.worklink.v2.set(my.worklink.v1);
				my.worklink.control1.x = S.makeRegularShape_c1x;
				my.worklink.control1.y = S.makeRegularShape_c1y;
				my.worklink.control1.z = 0;
				my.worklink.control2.x = S.makeRegularShape_c2x;
				my.worklink.control2.y = S.makeRegularShape_c2y;
				my.worklink.control2.z = 0;
				S.makeRegularShape_data = 'm' + my.worklink.v1.x.toFixed(4) + ',' + my.worklink.v1.y.toFixed(4);
				if (my.contains(S.stat_makeRegularShape2, S.makeRegularShape_species)) {
					S.makeRegularShape_data += ('s' === S.makeRegularShape_species) ? 'c' : 'q';
				}
				else {
					S.makeRegularShape_data += S.makeRegularShape_species;
				}
				do {
					S.makeRegularShape_count++;
					S.makeRegularShape_currentAngle += S.makeRegularShape_turn;
					S.makeRegularShape_currentAngle = S.makeRegularShape_currentAngle % 360;
					S.makeRegularShape_test = S.makeRegularShape_currentAngle.toFixed(0);
					my.worklink.v1.rotate(S.makeRegularShape_turn);
					my.worklink.control1.rotate(S.makeRegularShape_turn);
					my.worklink.control2.rotate(S.makeRegularShape_turn);
					if (my.contains(S.stat_makeRegularShape3, S.makeRegularShape_species)) {
						if (1 === S.makeRegularShape_count && my.contains(S.stat_makeRegularShape2, S.makeRegularShape_species)) {
							if ('s' === S.makeRegularShape_species) {
								S.makeRegularShape_data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ' + my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
							}
							else {
								S.makeRegularShape_data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ';
							}
						}
						else {
							if ('s' === S.makeRegularShape_species) {
								S.makeRegularShape_data += my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
							}
							else if (my.contains(S.stat_makeRegularShape4, S.makeRegularShape_species)) {
								S.makeRegularShape_data += my.worklink.control1.x.toFixed(4) + ',' + my.worklink.control1.y.toFixed(4) + ' ';
							}
						}
					}
					if ('c' === S.makeRegularShape_species) {
						S.makeRegularShape_data += my.worklink.control2.x.toFixed(4) + ',' + my.worklink.control2.y.toFixed(4) + ' ';
					}
					S.makeRegularShape_data += (my.worklink.v1.x - my.worklink.v2.x).toFixed(4) + ',' + (my.worklink.v1.y - my.worklink.v2.y).toFixed(4) + ' ';
					if (1 === S.makeRegularShape_count) {
						if (my.contains(S.stat_makeRegularShape2, S.makeRegularShape_species)) {
							S.makeRegularShape_data += ('s' === S.makeRegularShape_species) ? 's' : 't';
						}
					}
					my.worklink.v2.set(my.worklink.v1);
				} while (S.makeRegularShape_test !== '0' && S.makeRegularShape_count < 1000);
				S.makeRegularShape_data += 'z';
				items.data = S.makeRegularShape_data;
				return (items.shape) ? my.newShape(items) : my.makePath(items);
			}
			return false;
		};

		if (!my.xt(my.worklink)) {
			my.worklink = {
				start: my.newVector({
					name: 'scrawl.worklink.start'
				}),
				end: my.newVector({
					name: 'scrawl.worklink.end'
				}),
				control1: my.newVector({
					name: 'scrawl.worklink.control1'
				}),
				control2: my.newVector({
					name: 'scrawl.worklink.control2'
				}),
				v1: my.newVector({
					name: 'scrawl.worklink.v1'
				}),
				v2: my.newVector({
					name: 'scrawl.worklink.v2'
				}),
				v3: my.newVector({
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
	}(scrawl, scrawlVars));
}
