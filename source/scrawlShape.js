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

'use strict';
/**
# scrawlShape

## Purpose and features

The Shape module adds Shape sprites - path-based objects - to the core module

* Defines a sprite composed of lines, quadratic and bezier curves, etc
* See also Path object, which achieves a similar thing in a different way

@module scrawlShape
**/

var scrawl = (function(my){

/**
# window.scrawl

scrawlShape module adaptions to the Scrawl library object

@class window.scrawl_Shape
**/

/**
A __factory__ function to generate new Shape sprites
@method newShape
@param {Object} items Key:value Object argument for setting attributes
@return Shape object
@example
	scrawl.newShape({
		startX: 50,
		startY: 20,
		fillStyle: 'red',
		data: 'M0,0 50,0 60,20, 10,20 0,0z',
		});
**/
	my.newShape = function(items){
		return new my.Shape(items);
		};
		
/**
# Shape
	
## Instantiation

* scrawl.newShape() - Irregular, path-based shapes

Additional factory functions to instantiate Shape objects are available in the __pathFactoryFunctions__ module

## Purpose

* Defines a sprite composed of lines, quadratic and bezier curves, etc
* See also Path object, which achieves a similar thing in a different way

## Access

* scrawl.sprite.SHAPENAME - for the Shape sprite object

@class Shape
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Shape = function Shape(items){
		items = (my.isa(items,'obj')) ? items : {};
		my.Sprite.call(this, items);
		my.Position.prototype.set.call(this, items);
		this.isLine = (my.isa(items.isLine,'bool')) ? items.isLine : true;
		this.dataSet = (my.xt(this.data)) ? this.buildDataSet(this.data) : '';
		this.registerInLibrary();
		my.pushUnique(my.group[this.group].sprites, this.name);
		return this;
		}
	my.Shape.prototype = Object.create(my.Sprite.prototype);
/**
@property type
@type String
@default 'Shape'
@final
**/		
	my.Shape.prototype.type = 'Shape';
	my.Shape.prototype.classname = 'spritenames';
	my.d.Shape = {
/**
Interpreted path data - calculated by scrawl from the data attribute
@property dataSet
@type Array
@default false
@private
**/
		dataSet: false,
/**
Drawing flag - when set to true, will treat the first drawing (not positioning) data point as the start point

Generally this is set automatically as part of a shape factory function
@property isLine
@type Boolean
@default true
**/
		isLine: true,
/**
Shape sprite default method attribute is 'draw', not 'fill'
@property method
@type String
@default 'draw'
**/
		method: 'draw',
		};
	my.mergeInto(my.d.Shape, my.d.Sprite);
/**
Augments Sprite.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Shape.prototype.set = function(items){
		my.Sprite.prototype.set.call(this, items);
		items = (my.isa(items,'obj')) ? items : {};
		if(my.xt(items.data)){
			this.dataSet = this.buildDataSet(this.data);
			this.offset.flag = false;
			}
		return this;
		};
/**
Augments Position.getPivotOffsetVector()
@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	my.Shape.prototype.getPivotOffsetVector = function(){
		return (this.isLine) ? my.Sprite.prototype.getPivotOffsetVector.call(this) : this.getCenteredPivotOffsetVector();
		}
/**
Constructor, clone and set helper function

Create native path data from data attribute String

@method buildDataSet
@param {String} d Path string
@return Native path data
@private
**/
	my.Shape.prototype.buildDataSet = function(d){
		var	myData = [], 
			command, 
			points, 
			minX = 999999, 
			minY = 999999, 
			maxX = -999999, 
			maxY = -999999, 
			curX = this.start.x, 
			curY = this.start.y,
			set = d.match(/([A-Za-z][0-9. ,\-]*)/g),
			checkMaxMin = function(cx,cy){
				minX = (minX > cx) ? cx : minX;
				minY = (minY > cy) ? cy : minY;
				maxX = (maxX < cx) ? cx : maxX;
				maxY = (maxY < cy) ? cy : maxY;
				};
		for(var i=0,z=set.length; i<z; i++){
			command = set[i][0];
			points = set[i].match(/(-?[0-9.]+\b)/g);
			if(points){
				for(var j=0, w=points.length; j<w; j++){
					points[j] = parseFloat(points[j]);
					}
				switch(command){
					case 'H' :
						for(var j=0, w=points.length; j<w; j++){
							curX = points[j];								checkMaxMin(curX,curY);
							}
						break;
					case 'V' :
						for(var j=0, w=points.length; j<w; j++){
													curY = points[j];		checkMaxMin(curX,curY);
							}
						break;
					case 'M' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX = points[j];		curY = points[j+1];		checkMaxMin(curX,curY);
							}
					case 'L' :
					case 'T' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX = points[j];		curY = points[j+1];		checkMaxMin(curX,curY);
							}
						break;
					case 'Q' :
					case 'S' :
						for(var j=0, w=points.length; j<w; j+=4){
							curX = points[j+2]; 	curY = points[j+3];		checkMaxMin(curX,curY);
							}
						break;
					case 'C' :
						for(var j=0, w=points.length; j<w; j+=6){
							curX = points[j+4];		curY = points[j+5];		checkMaxMin(curX,curY);
							}
						break;
					case 'h' :
						for(var j=0, w=points.length; j<w; j++){
							curX += points[j];								checkMaxMin(curX,curY);
							}
						break;
					case 'v' :
						for(var j=0, w=points.length; j<w; j++){
													curY += points[j];		checkMaxMin(curX,curY);
							}
						break;
					case 'm' :
					case 'l' :
					case 't' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX += points[j];		curY += points[j+1];	checkMaxMin(curX,curY);
							}
						break;
					case 'q' :
					case 's' :
						for(var j=0, w=points.length; j<w; j+=4){
							curX += points[j+2];	curY += points[j+3];	checkMaxMin(curX,curY);
							}
						break;
					case 'c' :
						for(var j=0, w=points.length; j<w; j+=6){
							curX += points[j+4];	curY += points[j+5];	checkMaxMin(curX,curY);
							}
						break;
					}
				}
			myData.push({c: command, p: points});
			}
		for(var i=0, z=myData.length; i<z; i++){
			if(my.contains(['M','L','C','Q','S','T'], myData[i].c)){
				for(var j=0, w=myData[i].p.length; j<w; j+=2){
					myData[i].p[j] -= minX;
					myData[i].p[j+1] -= minY;
					}
				}
			if(myData[i].c === 'H'){
				for(var j=0, w=myData[i].p.length; j<w; j++){
					myData[i].p[j] -= minX;
					}
				}
			if(myData[i].c === 'V'){
				for(var j=0, w=myData[i].p.length; j<w; j++){
					myData[i].p[j] -= minY;
					}
				}
			}
		this.width = maxX - minX;
		this.height = maxY - minY;
		return myData;
		};
/**
Helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method doOutline
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@private
**/
	my.Shape.prototype.doOutline = function(ctx, cell){
		my.cell[cell].setEngine(this);
		if(!this.dataSet && this.data){
			this.buildDataSet(this.data);
			}
		return this.completeOutline(ctx);
		};
/**
Helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method completeOutline
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@private
**/
	my.Shape.prototype.completeOutline = function(ctx){
		if(this.dataSet){
			var here = this.prepareStamp(),
				currentX = 0,
				currentY = 0,
				reflectX = 0,
				reflectY = 0,
				d, 
				tempX, 
				tempY;
			this.rotateCell(ctx);
			ctx.translate(here.x,here.y);
			ctx.beginPath();
			if(!my.contains(['M'], this.dataSet[0].c)){
				ctx.moveTo(currentX,currentY);
				}
			for(var i=0, z=this.dataSet.length; i<z; i++){
				d = this.dataSet[i];
				switch(d.c){
					case 'M' :
						currentX = d.p[0], currentY = d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX * this.scale),(currentY * this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX = d.p[k], currentY = d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'm' :
						currentX += d.p[0], currentY += d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX * this.scale),(currentY * this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'Z' :
					case 'z' :
						ctx.closePath();
						break;
					case 'L' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							currentX = d.p[k], currentY = d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'l' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'H' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX = d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'h' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX += d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'V' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY = d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'v' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY += d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'C' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo((d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale),(d.p[k+4] * this.scale),(d.p[k+5] * this.scale));
							reflectX = d.p[k+2], reflectY = d.p[k+3];
							currentX = d.p[k+4], currentY = d.p[k+5];
							}
						break;
					case 'c' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo(((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale),((currentX+d.p[k+4]) * this.scale),((currentY+d.p[k+5]) * this.scale));
							reflectX = currentX + d.p[k+2];
							reflectY = currentY + d.p[k+3];
							currentX += d.p[k+4], currentY += d.p[k+5];
							}
						break;
					case 'S' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && my.contains(['C','c','S','s'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX * this.scale),(tempY * this.scale),(d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 's' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && my.contains(['C','c','S','s'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX * this.scale),(tempY * this.scale),((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale));
							reflectX = currentX + d.p[k], reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'Q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo((d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 'q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo(((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale));
							reflectX = currentX + d.p[k];
							reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'T' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && my.contains(['Q','q','T','t'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX * this.scale),(tempY * this.scale),(d.p[k] * this.scale),(d.p[k+1] * this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX = d.p[k], currentY = d.p[k+1];
							}
						break;
					case 't' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && my.contains(['Q','q','T','t'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX * this.scale),(tempY * this.scale),((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX += d.p[k], currentY += d.p[k+1];
							}
						break;
					}
				}
			}
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
	my.Shape.prototype.clip = function(ctx, cell){
		ctx.save();
		this.doOutline(ctx);
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
	my.Shape.prototype.clear = function(ctx, cell){
		var c = my.cell[cell];
		this.clip(ctx, cell);
		ctx.clearRect(0, 0, c.get('actualWidth'), c.get('.actualHeight'));
		ctx.restore();
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
	my.Shape.prototype.clearWithBackground = function(ctx, cell){
		var c = my.cell[cell];
		this.clip(ctx, cell);
		ctx.fillStyle = c.backgroundColor;
		ctx.fillRect(0, 0, c.get('actualWidth'), c.get('actualHeight'));
		ctx.fillStyle = my.ctx[cell].get('fillStyle');
		ctx.restore();
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
	my.Shape.prototype.draw = function(ctx, cell){
		this.doOutline(ctx, cell);
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
	my.Shape.prototype.fill = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(my.ctx[this.context].get('winding'));
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
	my.Shape.prototype.drawFill = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill(my.ctx[this.context].get('winding'));
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
	my.Shape.prototype.fillDraw = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(my.ctx[this.context].get('winding'));
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
	my.Shape.prototype.sinkInto = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(my.ctx[this.context].get('winding'));
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
	my.Shape.prototype.floatOver = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.stroke();
		ctx.fill(my.ctx[this.context].get('winding'));
		return this;
		};
/**
Check Cell coordinates to see if any of them fall within this sprite's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the sprite's path; false if none fall within the path
**/
	my.Shape.prototype.checkHit = function(items){
		items = (my.isa(items,'obj')) ? items : {};
		var ctx = my.cvx,
			tests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)],
			result = false,
			winding = my.ctx[this.context].winding;
		ctx.mozFillRule = winding;
		ctx.msFillRule = winding;
		this.completeOutline(ctx);
		for(var i = 0, z = tests.length; i < z; i += 2){
			result = ctx.isPointInPath(tests[i], tests[i+1]);
			if(result){
				break;
				}
			}
		return (result) ? {x: tests[i], y: tests[i+1]} : false;
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
	my.Shape.prototype.buildCollisionVectors = function(items){
		if(this.isLine){
			my.Sprite.prototype.buildCollisionVectors.call(this, items);
			}
		else{
			var	p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints, 
				o = this.getOffsetStartVector().reverse(),
				w = this.width/2,
				h = this.height/2,
				c = [];
			for(var i = 0, iz = p.length; i < iz; i++){
				if(my.isa(p[i], 'str')){
					switch(p[i]) {
						case 'start' : 	c.push(0); 			c.push(0); 			break;
						case 'N' : 		c.push(-o.x); 		c.push(-h - o.y); 	break;
						case 'NE' : 	c.push(w - o.x);	c.push(-h - o.y); 	break;
						case 'E' : 		c.push(w - o.x);	c.push(-o.y); 		break;
						case 'SE' : 	c.push(w - o.x);	c.push(h - o.y); 	break;
						case 'S' : 		c.push(-o.x);		c.push(h - o.y); 	break;
						case 'SW' : 	c.push(-w - o.x);	c.push(h - o.y); 	break;
						case 'W' : 		c.push(-w - o.x);	c.push(-o.y); 		break;
						case 'NW' : 	c.push(-w - o.x);	c.push(-h - o.y); 	break;
						case 'center' :	c.push(-o.x);		c.push(-o.y); 		break;
						}
					}
				else if(my.isa(p[i], 'vector')){
					c.push(p[i].x);		c.push(p[i].y);
					}
				}
			this.collisionVectors = c;
			}
		return this;
		};

	return my;
	}(scrawl));

