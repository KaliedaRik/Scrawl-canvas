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
# scrawlFrame

## Purpose and features

The Frame module adds PerspectiveCell entitys to the core module

* ...

@module scrawlFrame
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'frame')) {
	var scrawl = (function(my) {
		'use strict';
		/**
# window.scrawl

scrawlFrame module adaptions to the Scrawl library object

@class window.scrawl_Frame
**/

		/**
Alias for makeFramePoint()
@method newFramePoint
@deprecated
**/
		my.newFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
A __factory__ function to generate new FramePoint entitys
@method makeFramePoint
@param {Object} items Key:value Object argument for setting attributes
@return FramePoint object
**/
		my.makeFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
Alias for makeFrame()
@method newFrame
@deprecated
**/
		my.newFrame = function(items) {
			return new my.Frame(items);
		};
		/**
A __factory__ function to generate new Frame entitys
@method makeFrame
@param {Object} items Key:value Object argument for setting attributes
@return Frame object
**/
		my.makeFrame = function(items) {
			return new my.Frame(items);
		};

		/**
# FramePoint

## Instantiation

* scrawl.makeFramePoint()

## Purpose

* Defines the corner points for a Frame entity

## Access

* none - like Vectors, only stored locally

@class FramePoint
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.FramePoint = function FramePoint(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.host = my.xtGet(items.host, false);
			this.data = my.xtGet(items.data, false);
			this.reference = my.xtGet(items.reference, false);
			this.lock = my.xtGet(items.lock, false);
			this.pivot = my.xtGet(items.pivot, false);
			this.path = my.xtGet(items.path, false);
			this.pathPlace = my.xtGet(items.pathPlace, false);
			this.deltaPathPlace = my.xtGet(items.deltaPathPlace, false);
			this.pathSpeedConstant = my.xtGet(items.pathSpeedConstant, false);
			this.local = my.makeVector({
				name: this.name + '_local'
			});
			this.work = {
				local: my.makeVector({
					name: this.name + '_work.local'
				})
			};
			this.setReference();
			this.setLocal();
		};
		my.FramePoint.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'FramePoint'
@final
**/
		my.FramePoint.prototype.type = 'FramePoint';
		my.d.FramePoint = {
			host: false,
			data: false,
			reference: false,
			pivot: false,
			lock: false,
			local: {
				x: 0,
				y: 0,
				z: 0
			},
			path: false,
			pathPlace: false,
			deltaPathPlace: false,
			pathSpeedConstant: false,
			work: {
				local: {
					x: 0,
					y: 0,
					z: 0
				}
			}
		};
		my.mergeInto(my.d.FramePoint, my.d.Base);
		/**
@method get
@param {String} item Name of attribute to return
@return attribute
**/
		my.FramePoint.prototype.get = function(item) {
			if (!item) {
				this.work.local.set(this.local);
				return this.work.local;
			}
			else {
				return my.Base.get.call(this, items);
			}
		};
		/**
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.FramePoint.prototype.set = function(items) {
			this.host = my.xtGet(items.host, this.host);
			this.data = my.xtGet(items.data, this.data);
			this.pivot = my.xtGet(items.pivot, this.pivot);
			this.path = my.xtGet(items.path, this.path);
			this.lock = my.xtGet(items.lock, this.lock);
			this.pathPlace = my.xtGet(items.pathPlace, this.pathPlace);
			this.deltaPathPlace = my.xtGet(items.deltaPathPlace, this.deltaPathPlace);
			this.pathSpeedConstant = my.xtGet(items.pathSpeedConstant, this.pathSpeedConstant);
			this.setReference();
			this.setLocal();
			return this;
		};
		/**
@method setReference
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setReference = function() {
			if (this.data) {
				this.reference = 'data';
			}
			else if (this.lock) {
				this.reference = 'lock';
			}
			else if (this.path && my.contains(my.entitynames, this.path)) {
				this.reference = 'entity';
			}
			else if (this.pivot) {
				if (my.contains(my.entitynames, this.pivot)) {
					this.reference = 'entity';
				}
				else if (my.contains(my.cellnames, this.pivot)) {
					this.reference = 'cell';
				}
				else if (my.contains(my.pointnames, this.pivot)) {
					this.reference = 'point';
				}
				else if (my.stack && my.contains(my.stacknames, this.pivot)) {
					this.reference = 'stack';
				}
				else if (my.pad && my.contains(my.padnames, this.pivot)) {
					this.reference = 'pad';
				}
				else if (my.element && my.contains(my.elementnames, this.pivot)) {
					this.reference = 'element';
				}
				else if (my.particle && my.contains(my.particlenames, this.pivot)) {
					this.reference = 'particle';
				}
				else {
					this.reference = false;
				}
			}
			else {
				this.reference = false;
			}
			return this;
		};
		/**
@method setLocal
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocal = function() {
			if (this.reference === 'data') {
				this.setLocalFromData();
			}
			else if (this.reference === 'lock') {
				// do nothing - it's up to the entity to set the local value;
			}
			else if (this.path) {
				this.setLocalFromPath();
			}
			else if (this.pivot) {
				switch (this.reference) {
					case 'point':
						this.local = my.point[this.pivot].local;
						break;
					case 'particle':
						this.local = my.particle[this.pivot].place;
						break;
					default:
						this.local = my[this.reference][this.pivot].start;
				}
			}
			return this;
		};
		/**
Data should always be an array in the form [x, y, z]
@method setLocalFromData
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromData = function() {
			var cell = my.cell[my.group[my.entity[this.host].group].cell];
			if (Array.isArray(this.data)) {
				this.local.x = (this.data[0].toFixed) ? this.data[0] : this.setLocalFromDataString(this.data[0], cell.actualWidth);
				this.local.y = (this.data[1].toFixed) ? this.data[1] : this.setLocalFromDataString(this.data[1], cell.actualHeight);
			}
			return this;
		};
		/**
@method setLocalFromDataString
@param {String} item percentage string or string position value
@param {Number} dimension Host's cell's actualWidth or actualHeight
@return Number calculated position value
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromDataString = function(item, dimension) {
			switch (item) {
				case 'top':
				case 'left':
					return 0;
				case 'right':
				case 'bottom':
					return dimension;
				case 'center':
					return dimension / 2;
				default:
					return (parseFloat(item) / 100) * dimension;
			}
		};
		/**
@method setLocalFromPath
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromPath = function() {
			return this;
		};

		/**
# Frame

## Instantiation

* scrawl.Frame()

## Purpose

* ...

## Access

* scrawl.entity.FRAMENAME - for the Frame entity object

@class Frame
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Frame = function Frame(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);

			this.cornersDataArrayOrder = my.xtGet(items.cornersDataArrayOrder, ['tlx', 'tly', 'trx', 'try', 'brx', 'bry', 'blx', 'bly']);

			this.topLeft = false;
			this.topRight = false;
			this.bottomRight = false;
			this.bottomLeft = false;

			this.width = 1;
			this.height = 1;
			this.localWidth = 1;
			this.localHeight = 1;
			this.start = my.makeVector();
			this.work = {
				start: my.makeVector()
			};

			this.source = my.xtGet(items.source, false);
			this.sourceType = false;
			this.cell = document.createElement('canvas');
			this.engine = this.cell.getContext('2d');

			this.interferenceLoops = my.xtGet(items.interferenceLoops, 2);
			this.interferenceFactor = my.xtGet(items.interferenceFactor, 1.03);

			this.method = my.xtGet(items.method, 'fill');
			this.visibility = my.xtGet(items.visibility, true);
			this.order = my.xtGet(items.order, 0);

			this.globalAlpha = my.xtGet(items.globalAlpha, 1);
			this.globalCompositeOperation = my.xtGet(items.globalCompositeOperation, 'source-over');

			this.lineWidth = my.xtGet(items.lineWidth, 1);
			this.lineCap = my.xtGet(items.lineCap, 'butt');
			this.lineJoin = my.xtGet(items.lineJoin, 'miter');
			this.lineDash = my.xtGet(items.lineDash, []);
			this.lineDashOffset = my.xtGet(items.lineDashOffset, 0);
			this.miterLimit = my.xtGet(items.miterLimit, 10);
			this.strokeStyle = my.xtGet(items.strokeStyle, '#000000');
			this.shadowOffsetX = my.xtGet(items.shadowOffsetX, 0);
			this.shadowOffsetY = my.xtGet(items.shadowOffsetY, 0);
			this.shadowBlur = my.xtGet(items.shadowBlur, 0);
			this.shadowColor = my.xtGet(items.shadowColor, '#000000');

			this.group = my.Entity.prototype.getGroup.call(this, items);

			my.Entity.prototype.registerInLibrary.call(this, items);
			my.pushUnique(my.group[this.group].entitys, this.name);

			this.lockFrameTo = my.xtGet(items.lockFrameTo, false);
			this.lockElementAttributes = {};

			this.setCorners(items);
			this.setEngine(this);
			this.filtersEntityInit(items);

			this.redraw = true;

			return this;
		};
		my.Frame.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Frame'
@final
**/
		my.Frame.prototype.type = 'Frame';
		my.Frame.prototype.classname = 'entitynames';
		my.d.Frame = {
			topLeft: false,
			topRight: false,
			bottomRight: false,
			bottomLeft: false,
			width: 1,
			height: 1,
			localWidth: 1,
			localHeight: 1,
			start: false,
			method: 'fill',
			visibility: true,
			order: 0,
			lockFrameTo: false,
			lockElementAttributes: false,
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
			lineWidth: 1,
			lineCap: 'butt',
			lineJoin: 'miter',
			lineDash: [],
			lineDashOffset: 0,
			miterLimit: 10,
			strokeStyle: '#000000',
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowBlur: 0,
			shadowColor: '#000000',
			source: false,
			sourceType: false,
			cell: false,
			engine: false,
			filters: [],
			filterOnStroke: false,
			pivot: false,
			mouseIndex: 'mouse',
			flipReverse: false,
			flipUpend: false,
			lockX: false,
			lockY: false,
			group: false,
			redraw: false,
			interferenceLoops: 2,
			interferenceFactor: 1.03,
			work: {
				start: false
			}
		};
		my.mergeInto(my.d.Frame, my.d.Base);
		/**
Frame.registerInLibrary hook function - modified by collisions extension
@method collisionsEntityRegisterInLibrary
@private
**/
		my.Frame.prototype.collisionsEntityRegisterInLibrary = function(items) {
			return my.Entity.prototype.collisionsEntityRegisterInLibrary.call(this, items);
		};
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.setCorners(items);
			this.setEngine(items);
			this.redraw = true;
			return this;
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.clone = function(items) {
			var c = my.Base.prototype.clone.call(this, items);
			c.setLockElementAttributes(my.mergeOver(this.lockElementAttributes, my.safeObject(items)));
			c.setCorners(items);
			return c;
		};
		/**
@method setCorners
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Frame.prototype.setCorners = function(items) {
			var i,
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				cornersX = ['tlx', 'trx', 'brx', 'blx'],
				cornersY = ['tly', 'try', 'bry', 'bly'],
				temp;

			items = my.safeObject(items);
			for (i = 0; i < 4; i++) {
				temp = {};
				if (!this[corners[i]]) {
					this[corners[i]] = my.makeFramePoint({
						name: this.name + '_' + corners[i],
						host: this.name,
					});
				}
				if (items.cornersData && Array.isArray(items.cornersData)) {
					temp.data = [
						my.xtGet(items.cornersData[this.cornersDataArrayOrder.indexOf(cornersX[i])], this[corners[i]].local.x, 0),
						my.xtGet(items.cornersData[this.cornersDataArrayOrder.indexOf(cornersY[i])], this[corners[i]].local.y, 0)
					];
					this[corners[i]].set(temp);
				}
				else if (items.lockFrameTo) {
					temp.lock = items.lockFrameTo;
					this[corners[i]].set(temp);
				}
				else {
					temp.path = my.xtGet(items[corners[i] + 'Path'], this[corners[i]].path);
					temp.pathPlace = my.xtGet(items[corners[i] + 'PathPlace'], this[corners[i]].pathPlace);
					temp.deltaPathPlace = my.xtGet(items[corners[i] + 'DeltaPathPlace'], this[corners[i]].deltaPathPlace);
					temp.pathSpeedConstant = my.xtGet(items[corners[i] + 'PathSpeedConstant'], this[corners[i]].pathSpeedConstant);
					temp.pivot = my.xtGet(items[corners[i] + 'Pivot'], this[corners[i]].pivot);
					this[corners[i]].set(temp);
				}
			}
			if (items.lockFrameTo || this.lockFrameTo) {
				this.lockOn(items);
			}
			return this;
		};
		/**
@method setEngine
@private
**/
		my.Frame.prototype.setEngine = function(items) {
			var design, strokeStyle;
			if (items.lineWidth) {
				this.engine.lineWidth = items.lineWidth;
			}
			if (items.lineCap) {
				this.engine.lineCap = items.lineCap;
			}
			if (items.lineJoin) {
				this.engine.lineJoin = items.lineJoin;
			}
			if (items.lineDash) {
				this.engine.mozDash = items.lineDash;
				this.engine.lineDash = items.lineDash;
				try {
					this.engine.setLineDash(items.lineDash);
				}
				catch (e) {}
			}
			if (items.lineDashOffset) {
				this.engine.mozDashOffset = items.lineDashOffset;
				this.engine.lineDashOffset = items.lineDashOffset;
			}
			if (items.miterLimit) {
				this.engine.miterLimit = items.miterLimit;
			}
			if (items.shadowOffsetX) {
				this.engine.shadowOffsetX = items.shadowOffsetX;
			}
			if (items.shadowOffsetY) {
				this.engine.shadowOffsetY = items.shadowOffsetY;
			}
			if (items.shadowBlur) {
				this.engine.shadowBlur = items.shadowBlur;
			}
			if (items.shadowColor) {
				this.engine.shadowColor = items.shadowColor;
			}
			if (items.strokeStyle) {
				if (my.xt(my.design[items.strokeStyle])) {
					design = my.design[items.strokeStyle];
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = items.strokeStyle;
				}
				this.engine.strokeStyle = strokeStyle;
			}
			return this;
		};
		/**
@method setDestinationEngine
@private
**/
		my.Frame.prototype.setDestinationEngine = function(ctx, cell) {
			var design, strokeStyle,
				record = my.ctx[cell];
			if (record.lineWidth != this.lineWidth) {
				ctx.lineWidth = this.lineWidth;
				record.lineWidth = this.lineWidth;
			}
			if (record.lineCap != this.lineCap) {
				ctx.lineCap = this.lineCap;
				record.lineCap = this.lineCap;
			}
			if (record.lineJoin != this.lineJoin) {
				ctx.lineJoin = this.lineJoin;
				record.lineJoin = this.lineJoin;
			}
			if (record.lineDash != this.lineDash) {
				ctx.mozDash = this.lineDash;
				ctx.lineDash = this.lineDash;
				try {
					ctx.setLineDash(this.lineDash);
				}
				catch (e) {}
				record.lineDash = this.lineDash;
			}
			if (record.lineDashOffset != this.lineDashOffset) {
				ctx.mozDashOffset = this.lineDashOffset;
				ctx.lineDashOffset = this.lineDashOffset;
				record.lineDashOffset = this.lineDashOffset;
			}
			if (record.miterLimit != this.miterLimit) {
				ctx.miterLimit = this.miterLimit;
				record.miterLimit = this.miterLimit;
			}
			if (record.shadowOffsetX != this.shadowOffsetX) {
				ctx.shadowOffsetX = this.shadowOffsetX;
				record.shadowOffsetX = this.shadowOffsetX;
			}
			if (record.shadowOffsetY != this.shadowOffsetY) {
				ctx.shadowOffsetY = this.shadowOffsetY;
				record.shadowOffsetY = this.shadowOffsetY;
			}
			if (record.shadowBlur != this.shadowBlur) {
				ctx.shadowBlur = this.shadowBlur;
				record.shadowBlur = this.shadowBlur;
			}
			if (record.shadowColor != this.shadowColor) {
				ctx.shadowColor = this.shadowColor;
				record.shadowColor = this.shadowColor;
			}
			if (record.strokeStyle != this.strokeStyle) {
				if (my.xt(my.design[this.strokeStyle])) {
					design = my.design[this.strokeStyle];
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = this.strokeStyle;
				}
				ctx.strokeStyle = strokeStyle;
				record.strokeStyle = this.strokeStyle;
			}
			return this;
		};
		/**
@method lockOn
@private
**/
		my.Frame.prototype.lockOn = function(items) {
			var el = my.xtGet(my.safeObject(my.stack)[this.lockFrameTo], my.safeObject(my.pad)[this.lockFrameTo], my.safeObject(my.element)[this.lockFrameTo], false),
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				parent, stack, temp,
				i;
			if (!el) {
				temp = document.createElement('div');
				temp.id = this.lockFrameTo;
				parent = my.pad[my.cell[my.group[this.group].cell].pad].group;
				if (parent) {
					stack = my.stack[parent];
					document.body.appendChild(temp);
					el = stack.addElementById(this.lockFrameTo);
					el.set({
						translateZ: stack.get('translateZ') - 1
					});
				}
			}
			if (el) {
				if (!el.topLeft) {
					el.addCornerTrackers();
				}
				this.setLockElementAttributes(items);
				el.set(this.lockElementAttributes);
				for (i = 0; i < 4; i++) {
					this[corners[i]].local = el[corners[i]];
				}
			}
		};
		/**
@method setLockElementAttributes
@private
**/
		my.Frame.prototype.setLockElementAttributes = function(items) {
			var keys = Object.keys(items),
				whitelist = ['start', 'startX', 'startY', 'handle', 'handleX', 'handleY', 'deltaStart', 'deltaStartX', 'deltaStartY', 'deltaHandle', 'deltaHandleX', 'deltaHandleY', 'width', 'height', 'scale', 'deltaScale', 'deltaRoll', 'deltaPitch', 'deltaYaw', 'roll', 'pitch', 'yaw', 'includeCornerTrackers', 'pivot', 'path', 'pathPlace', 'deltaPathPlace', 'pathSpeedConstant', 'translate', 'translateX', 'translateY', 'translateZ', 'mouseIndex'],
				i, iz;
			for (i = 0, iz = keys.length; i < iz; i++) {
				if (my.contains(whitelist, keys[i])) {
					this.lockElementAttributes[keys[i]] = items[keys[i]];
				}
			}
			return this;
		};
		/**
@method forceStamp
@private
**/
		my.Frame.prototype.forceStamp = function(method, cell) {
			var temp = this.visibility;
			this.visibility = true;
			this.stamp(method, cell);
			this.visibility = temp;
			return this;
		};
		/**
@method stamp
@private
**/
		my.Frame.prototype.stamp = function(method, cell) {
			var dCell = (cell) ? cell : my.group[this.group].cell,
				dCtx = my.context[dCell],
				dMethod = (method) ? method : this.method;
			if (this.visibility) {
				if (this.redraw) {
					this.redrawCanvas();
				}
				this[dMethod](dCtx, dCell);
				this.stampFilter(dCtx, dCell);
			}
			return this;
		};
		/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
		my.Frame.prototype.filtersEntityInit = function(items) {
			my.Entity.prototype.filtersEntityInit.call(this, items);
		};
		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		my.Frame.prototype.stampFilter = function(engine, cell, force) {
			my.Entity.prototype.stampFilter.call(this, engine, cell, force);
		};
		/**
Entity.stamp hook helper function
@method stampFilterDefault
@private
**/
		my.Frame.prototype.stampFilterDefault = function(engine, cell, force) {
			return my.Entity.prototype.stampFilterDefault.call(this, engine, cell, force);
		};
		/**
@method redrawCanvas
@private
**/
		my.Frame.prototype.redrawCanvas = function() {
			var tlx = this.topLeft.local.x,
				tly = this.topLeft.local.y,
				trx = this.topRight.local.x,
				tryy = this.topRight.local.y,
				brx = this.bottomRight.local.x,
				bry = this.bottomRight.local.y,
				blx = this.bottomLeft.local.x,
				bly = this.bottomLeft.local.y,
				xmin = Math.min.apply(Math, [tlx, trx, brx, blx]),
				ymin = Math.min.apply(Math, [tly, tryy, bry, bly]),
				xmax = Math.max.apply(Math, [tlx, trx, brx, blx]),
				ymax = Math.max.apply(Math, [tly, tryy, bry, bly]),
				width = xmax - xmin || 1,
				height = ymax - ymin || 1,
				dim = Math.max.apply(Math, [width, height]),
				maxDim = Math.ceil(dim),
				minDim = Math.floor(dim),
				src = my.xtGet(my.asset[this.source], my.canvas[this.source], false), //must be an image, canvas or video
				i, sx, sy, ex, ey, len, angle, val, fw, fh;

			this.width = width;
			this.localWidth = width;
			this.height = height;
			this.localHeight = height;
			this.start.x = xmin;
			this.start.y = ymin;
			if (src && my.contains(['fill', 'drawFill', 'fillDraw', 'sinkInto', 'floatOver'], this.method)) {
				this.cell.width = Math.ceil(width);
				this.cell.height = Math.ceil(height);
				my.cv.width = maxDim;
				my.cv.height = maxDim;
				my.cvx.drawImage(src, 0, 0, src.width, src.height, 0, 0, minDim, minDim);
				for (i = 0; i <= minDim; i++) {
					val = i / minDim;
					sx = this.getPosition(tlx, blx, val) - xmin;
					sy = this.getPosition(tly, bly, val) - ymin;
					ex = this.getPosition(trx, brx, val) - xmin;
					ey = this.getPosition(tryy, bry, val) - ymin;
					len = this.getLength(sx, sy, ex, ey);
					angle = this.getAngle(sx, sy, ex, ey);

					this.setEasel(sx, sy, angle);
					this.engine.drawImage(my.cv, 0, i, minDim, 1, 0, 0, len, 1);
					this.resetEasel();
				}
				fw = Math.ceil(width);
				fh = Math.ceil(height);
				for (i = 0; i < this.interferenceLoops; i++) {
					fw = Math.ceil(fw * this.interferenceFactor);
					fh = Math.ceil(fh * this.interferenceFactor);
					my.cv.width = fw;
					my.cv.height = fh;
					my.cvx.drawImage(this.cell, 0, 0, this.cell.width, this.cell.height, 0, 0, fw, fh);
					this.engine.drawImage(my.cv, 0, 0, fw, fh, 0, 0, this.cell.width, this.cell.height);
				}
				this.redraw = false;
			}
			return this;
		};
		/**
@method getPosition
@private
**/
		my.Frame.prototype.getPosition = function(a, b, v) {
			return ((b - a) * v) + a;
		};
		/**
@method getLength
@private
**/
		my.Frame.prototype.getLength = function(xa, ya, xb, yb) {
			return Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));
		};
		/**
@method getAngle
@private
**/
		my.Frame.prototype.getAngle = function(xa, ya, xb, yb) {
			return Math.atan2(ya - yb, xa - xb);
		};
		/**
@method setEasel
@private
**/
		my.Frame.prototype.setEasel = function(x, y, a) {
			var cos = Math.cos(a),
				sin = Math.sin(a);
			this.engine.setTransform(-cos, -sin, sin, -cos, x, y);
		};
		/**
@method resetEasel
@private
**/
		my.Frame.prototype.resetEasel = function() {
			this.engine.setTransform(1, 0, 0, 1, 0, 0);
		};
		/**
Stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Frame.prototype.clearShadow = function(ctx, cell) {
			if (this.shadowOffsetX || this.shadowOffsetY || this.shadowBlur) {
				cell = (cell.substring) ? my.cell[cell] : cell;
				cell.clearShadow();
			}
			return this;
		};
		/**
@method prepareStamp
@private
**/
		my.Frame.prototype.prepareStamp = function(ctx, cell) {
			this.setDestinationEngine(ctx, cell);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		};
		/**
@method drawPath
@private
**/
		my.Frame.prototype.drawPath = function(ctx, cell) {
			ctx.beginPath();
			ctx.moveTo(this.topLeft.local.x, this.topLeft.local.y);
			ctx.lineTo(this.topRight.local.x, this.topRight.local.y);
			ctx.lineTo(this.bottomRight.local.x, this.bottomRight.local.y);
			ctx.lineTo(this.bottomLeft.local.x, this.bottomLeft.local.y);
			ctx.closePath();
			return this;
		};
		/**
@method drawImage
@private
**/
		my.Frame.prototype.drawImage = function(ctx, cell) {
			ctx.drawImage(this.cell, this.start.x, this.start.y);
			return this;
		};
		/**
@method clip
**/
		my.Frame.prototype.clip = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.clip();
			return this;
		};
		/**
@method clear
**/
		my.Frame.prototype.clear = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = my.ctx[cell].get('fillStyle');
			ctx.strokeStyle = my.ctx[cell].get('strokeStyle');
			ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
			return this;
		};
		/**
@method clearWithBackground
**/
		my.Frame.prototype.clearWithBackground = function(ctx, cell) {
			var color = my.cell[cell].get('backgroundColor');
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = my.ctx[cell].get('fillStyle');
			ctx.strokeStyle = my.ctx[cell].get('strokeStyle');
			ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
			return this;
		};
		/**
@method draw
**/
		my.Frame.prototype.draw = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.stroke();
			return this;
		};
		/**
@method fill
**/
		my.Frame.prototype.fill = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawImage(ctx, cell);
			return this;
		};
		/**
@method drawFill
**/
		my.Frame.prototype.drawFill = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.stroke();
			this.clearShadow(ctx, cell);
			this.drawImage(ctx, cell);
			return this;
		};
		/**
@method fillDraw
**/
		my.Frame.prototype.fillDraw = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawImage(ctx, cell);
			this.drawPath(ctx, cell);
			this.clearShadow(ctx, cell);
			ctx.stroke();
			return this;
		};
		/**
@method sinkInto
**/
		my.Frame.prototype.sinkInto = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawImage(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.stroke();
			return this;
		};
		/**
@method floatOver
**/
		my.Frame.prototype.floatOver = function(ctx, cell) {
			this.prepareStamp(ctx, cell);
			this.drawPath(ctx, cell);
			ctx.stroke();
			this.drawImage(ctx, cell);
			return this;
		};
		/**
@method none
**/
		my.Frame.prototype.none = function(ctx, cell) {
			return this;
		};
		/**
@method checkHit
**/
		my.Frame.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			var tests = (my.xt(items.tests)) ? items.tests : [(items.x || false), (items.y || false)],
				result = false;
			my.cvx.setTransform(1, 0, 0, 1, 0, 0);
			this.drawPath(my.cvx);
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = my.cvx.isPointInPath(tests[i], tests[i + 1]);
				if (result) {
					items.x = tests[i];
					items.y = tests[i + 1];
					break;
				}
			}
			return (result) ? items : false;
		};

		return my;
	}(scrawl));
}
