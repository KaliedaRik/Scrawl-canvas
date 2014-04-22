'use strict';
/**
# scrawlPathFactories

## Purpose and features

The Factories module adds a set of factory functions to the Scrawl library, which can be used to generate both Path and Shape sprites

@module scrawlPathFactories
**/

var scrawl = (function(my){
/**
# window.scrawl

scrawlPathFactories module adaptions to the Scrawl library object

@class window.scrawl_Factories
**/

/**
A __factory__ function to generate elliptical Shape or Path sprite objects

The argument can include:
* __radiusX__ - Number, horizontal radius of ellipse; default: 0 (not retained)
* __radiusY__ - Number, vertical radius of ellipse; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Sprite, Context or Shape/Path attribute
@method makeEllipse
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeEllipse = function(items){
		items = my.safeObject(items);
		items.startX = items.startX || 0; 
		items.startY = items.startY || 0;
		items.radiusX = items.radiusX || 0;
		items.radiusY = items.radiusY || 0;
		items.closed = true;
		var	myData = 'm',
			cx = items.startX,
			cy = items.startY,
			dx = items.startX,
			dy = items.startY-items.radiusY,
			myShape;
		myData += (cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+(items.radiusX*0.55);
		dy = items.startY-items.radiusY;
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX+items.radiusX;
		dy = items.startY-(items.radiusY*0.55);
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX+items.radiusX;
		dy = items.startY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+items.radiusX;
		dy = items.startY+(items.radiusY*0.55);
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX+(items.radiusX*0.55);
		dy = items.startY+items.radiusY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX;
		dy = items.startY+items.radiusY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-(items.radiusX*0.55);
		dy = items.startY+items.radiusY;
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX-items.radiusX;
		dy = items.startY+(items.radiusY*0.55);
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX-items.radiusX;
		dy = items.startY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-items.radiusX;
		dy = items.startY-(items.radiusY*0.55);
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX-(items.radiusX*0.55);
		dy = items.startY-items.radiusY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX;
		dy = items.startY-items.radiusY;
		myData += ' '+(cx-dx)+','+(cy-dy);
		myData += 'z';
		items.isLine = false;
		items.data = myData;
		return (items.shape) ? my.newShape(items) : my.makePath(items);
		};
/**
A __factory__ function to generate rectangular Shape or Path sprite objects, with optional rounded corners

The argument can include:
* __width__ - Number, default: 0
* __height__ - Number, default: 0
* also, 0, 1 or more of the following __radius__ attributes (all Number, default: radius=0): radiusTopLeftX, radiusTopLeftY, radiusTopRightX, radiusTopRightY, radiusBottomRightX, radiusBottomRightY, radiusBottomLeftX, radiusBottomLeftY, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, radiusTopX, radiusTopY, radiusBottomX, radiusBottomY, radiusLeftX, radiusLeftY, radiusRightX, radiusRightY, radiusTop, radiusBottom, radiusRight, radiusLeft, radiusX, radiusY, radius (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Sprite, Context or Shape/Path attribute
@method makeRectangle
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeRectangle = function(items){
		items = my.safeObject(items)
		items.startX = items.startX || 0; 
		items.startY = items.startY || 0;
		items.width = items.width || 0; 
		items.height = items.height || 0;
		items.radius = items.radius || 0; 
		items.closed = true;
		var	_brx = items.radiusTopLeftX || items.radiusTopLeft || items.radiusTopX || items.radiusLeftX || items.radiusTop || items.radiusLeft || items.radiusX || items.radius || 0,
			_bry = items.radiusTopLeftY || items.radiusTopLeft || items.radiusTopY || items.radiusLeftY || items.radiusTop || items.radiusLeft || items.radiusY || items.radius || 0,
			_blx = items.radiusTopRightX || items.radiusTopRight || items.radiusTopX || items.radiusRightX || items.radiusTop || items.radiusRight || items.radiusX || items.radius || 0,
			_bly = items.radiusTopRightY || items.radiusTopRight || items.radiusTopY || items.radiusRightY || items.radiusTop || items.radiusRight || items.radiusY || items.radius || 0,
			_tlx = items.radiusBottomRightX || items.radiusBottomRight || items.radiusBottomX || items.radiusRightX || items.radiusBottom || items.radiusRight || items.radiusX || items.radius || 0,
			_tly = items.radiusBottomRightY || items.radiusBottomRight || items.radiusBottomY || items.radiusRightY || items.radiusBottom || items.radiusRight || items.radiusY || items.radius || 0,
			_trx = items.radiusBottomLeftX || items.radiusBottomLeft || items.radiusBottomX || items.radiusLeftX || items.radiusBottom || items.radiusLeft || items.radiusX || items.radius || 0,
			_try = items.radiusBottomLeftY || items.radiusBottomLeft || items.radiusBottomY || items.radiusLeftY || items.radiusBottom || items.radiusLeft || items.radiusY || items.radius || 0,
			halfWidth = (items.width/2),
			halfHeight = (items.height/2),
			myData = 'm',
			cx = items.startX,
			cy = items.startY,
			dx = items.startX-halfWidth+_tlx,
			dy = items.startY-halfHeight,
			myShape;
		myData += (cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+halfWidth-_trx;
		dy = items.startY-halfHeight;
		myData += 'l'+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+halfWidth-_trx+(_trx*0.55);
		dy = items.startY-halfHeight;
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX+halfWidth;
		dy = items.startY-halfHeight+_try-(_try*0.55);
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX+halfWidth;
		dy = items.startY-halfHeight+_try;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+halfWidth;
		dy = items.startY+halfHeight-_bry;
		myData += 'l'+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX+halfWidth;
		dy = items.startY+halfHeight-_bry+(_bry*0.55);
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX+halfWidth-_brx+(_brx*0.55);
		dy = items.startY+halfHeight;
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX+halfWidth-_brx;
		dy = items.startY+halfHeight;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-halfWidth+_blx;
		dy = items.startY+halfHeight;
		myData += 'l'+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-halfWidth+_blx-(_blx*0.55);
		dy = items.startY+halfHeight;
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX-halfWidth;
		dy = items.startY+halfHeight-_bly+(_bly*0.55);
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX-halfWidth;
		dy = items.startY+halfHeight-_bly;
		myData += ' '+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-halfWidth;
		dy = items.startY-halfHeight+_tly;
		myData += 'l'+(cx-dx)+','+(cy-dy);
		cx = dx, cy = dy;
		dx = items.startX-halfWidth;
		dy = items.startY-halfHeight+_tly-(_tly*0.55);
		myData += 'c'+(cx-dx)+','+(cy-dy);
		dx = items.startX-halfWidth+_tlx-(_tlx*0.55);
		dy = items.startY-halfHeight;
		myData += ' '+(cx-dx)+','+(cy-dy);
		dx = items.startX-halfWidth+_tlx;
		dy = items.startY-halfHeight;
		myData += ' '+(cx-dx)+','+(cy-dy);
		myData += 'z';
		items.isLine = false;
		items.data = myData;
		return (items.shape) ? my.newShape(items) : my.makePath(items);
		};
/**
A __factory__ function to generate bezier curve Shape or Path sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __startControlX__ - Number; default: 0 (not retained)
* __startControlY__ - Number; default: 0 (not retained)
* __endControlX__ - Number; default: 0 (not retained)
* __endControlY__ - Number; default: 0 (not retained)
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Sprite, Context or Shape/Path attribute
@method makeBezier
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeBezier = function(items){
		items = my.safeObject(items)
		items.startX = items.startX || 0; 
		items.startY = items.startY || 0;
		items.startControlX = items.startControlX || 0;
		items.startControlY = items.startControlY || 0;
		items.endControlX = items.endControlX || 0;
		items.endControlY = items.endControlY || 0;
		items.endX = items.endX || 0;
		items.endY = items.endY || 0;
		items.closed = false;
		items.handleX = items.handleX || 'left';
		items.handleY = items.handleY || 'top';
		var	myFixed = items.fixed || 'none',
			myShape, 
			data, 
			tempName;
		items.fixed = false;
		data = 'm0,0c'+
			(items.startControlX-items.startX)+','+(items.startControlY-items.startY)+' '+
			(items.endControlX-items.startX)+','+(items.endControlY-items.startY)+' '+
			(items.endX-items.startX)+','+(items.endY-items.startY);
		items.data = data;
		items.isLine = true;
		if(items.shape){
			myShape = my.newShape(items);
			}
		else{
			myShape = my.makePath(items);
			tempName = myShape.name.replace('~','_','g');
			switch(myFixed){
				case 'all' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					my.point[tempName+'_p2'].setToFixed(items.startControlX, items.startControlY);
					my.point[tempName+'_p3'].setToFixed(items.endControlX, items.endControlY);
					my.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
					break;
				case 'both' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					my.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
					break;
				case 'start' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					break;
				case 'startControl' :
					my.point[tempName+'_p2'].setToFixed(items.startControlX, items.startControlY);
					break;
				case 'endControl' :
					my.point[tempName+'_p3'].setToFixed(items.endControlX, items.endControlY);
					break;
				case 'end' :
					my.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
					break;
				}
			}
		return myShape;
		};
/**
A __factory__ function to generate quadratic curve Shape or Path sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __controlX__ - Number; default: 0 (not retained)
* __controlY__ - Number; default: 0 (not retained)
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Sprite, Context or Shape/Path attribute
@method makeQuadratic
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeQuadratic = function(items){
		items = my.safeObject(items)
		items.startX = items.startX || 0; 
		items.startY = items.startY || 0;
		items.controlX = items.controlX || 0;
		items.controlY = items.controlY || 0;
		items.endX = items.endX || 0;
		items.endY = items.endY || 0;
		items.closed = false;
		items.handleX = items.handleX || 'left';
		items.handleY = items.handleY || 'top';
		var myFixed = items.fixed || 'none',
			data, 
			myShape, 
			tempName;
		data = 	'm0,0q'+
			(items.controlX-items.startX)+','+(items.controlY-items.startY)+' '+
			(items.endX-items.startX)+','+(items.endY-items.startY);
		items.fixed = false;
		items.data = data;
		items.isLine = true;
		if(items.shape){
			myShape = my.newShape(items);
			}
		else{
			myShape = my.makePath(items);
			tempName = myShape.name.replace('~','_','g');
			switch(myFixed){
				case 'all' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					my.point[tempName+'_p2'].setToFixed(items.controlX, items.controlY);
					my.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
					break;
				case 'both' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					my.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
					break;
				case 'start' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					break;
				case 'control' :
					my.point[tempName+'_p2'].setToFixed(items.controlX, items.controlY);
					break;
				case 'end' :
					my.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
					break;
				}
			}
		return myShape;
		};
/**
A __factory__ function to generate straight line Shape or Path sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Sprite, Context or Shape/Path attribute
@method makeLine
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeLine = function(items){
		items = my.safeObject(items)
		items.startX = items.startX || 0; 
		items.startY = items.startY || 0;
		items.endX = items.endX || 0;
		items.endY = items.endY || 0;
		items.closed = false;
		items.handleX = items.handleX || 'left';
		items.handleY = items.handleY || 'top';
		var myFixed = items.fixed || 'none',
			data, 
			myShape, 
			tempName;
		data = 	'm0,0 '+(items.endX-items.startX)+','+(items.endY-items.startY);
		items.fixed = false;
		items.data = data;
		items.isLine = true;
		if(items.shape){
			myShape = my.newShape(items);
			}
		else{
			myShape = my.makePath(items);
			tempName = myShape.name.replace('~','_','g');
			switch(myFixed){
				case 'both' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					my.point[tempName+'_p2'].setToFixed(items.endX, items.endY);
					break;
				case 'start' :
					my.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
					break;
				case 'end' :
					my.point[tempName+'_p2'].setToFixed(items.endX, items.endY);
					break;
				}
			}
		return myShape;
		};
/**
A __factory__ function to generate straight-edged regular sprites such as triangles, stars, hexagons, etc

The argument can include:
* __angle__ - Number; eg an angle of 72 produces a pentagon, while 144 produces a five-pointed star - default: 0
* __sides__ - Number; number of sides to the regular sprite - default: 0
* __outline__ - Number; default: 0
* __radius__ - Number; default: 0 (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path 
* any other legitimate Sprite, Context or Shape/Path attribute

_(Either the 'angle' attribute or the 'sides' attribute (but not both) must be included in the argument object)_

@method makeRegularShape
@param {Object} items Object containing attributes
@return Shape or Path sprite object
**/
	my.makeRegularShape = function(items){
		items = my.safeObject(items)
		if(my.xto([items.sides, items.angle])){
			items.startX = items.startX || 0;
			items.startY = items.startY || 0;
			items.radius = items.radius || 20;
			items.closed = true;
			// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
			var	turn = (my.isa(items.sides,'num') && items.sides > 1) ? 360/items.sides : ((my.isa(items.angle,'num') && items.angle > 0) ? items.angle : 4),
				currentAngle = 0,
				count = 0,
				point = my.worklink.v1.set({x: items.radius, y:0, z:0}),
				oPoint = my.worklink.v2.set(point), 
				test,
				data = 'm'+point.x.toFixed(4)+','+point.y.toFixed(4)+' ';
			do{
				count++;
				currentAngle += turn;
				currentAngle = currentAngle % 360;
				test = currentAngle.toFixed(0);
				point.rotate(turn);
				data += ''+(point.x - oPoint.x).toFixed(4)+','+(point.y - oPoint.y).toFixed(4)+' ';
				oPoint.set(point);
				}while(test !== '0' && count < 1000);
			data += 'z';
			items.data = data;
			items.isLine = false;
			return (items.shape) ? my.newShape(items) : my.makePath(items);
			}
		return false;
		};

	if(!my.xt(my.worklink)){
		my.worklink = {
			start: my.newVector({name: 'scrawl.worklink.start'}),
			end: my.newVector({name: 'scrawl.worklink.end'}),
			control1: my.newVector({name: 'scrawl.worklink.control1'}),
			control2: my.newVector({name: 'scrawl.worklink.control2'}),
			v1: my.newVector({name: 'scrawl.worklink.v1'}),
			v2: my.newVector({name: 'scrawl.worklink.v2'}),
			v3: my.newVector({name: 'scrawl.worklink.v3'}),
			};
		}
		
	return my;
	}(scrawl));

