/***********************************************************************************
* SCRAWL.JS Library 
*	version 0.302 - 31 August 2013
*	Developed by Rik Roots - rik.roots@gmail.com, rik@rikweb.org.uk
*
*   Scrawl demo website: http://scrawl.rikweb.org.uk
*
***********************************************************************************/

//various methods sourced mainly from Stack Overflow - can't remember authors ... many apologies!
Array.prototype.contains = function(k){
	if(k instanceof RegExp){
		for(var p in this){
			if(this[p].match(k)) return this[p];
			}
		return false;
		}
	else{
		for(var p in this){
			if(this[p] === k) return true;
			}
		return false;
		}
	};
Array.prototype.pushUnique = function(o){
	if(!this.contains(o)){
		this.push(o);
		return true;
		}
	return false;
	};
Array.prototype.removeItem = function(o){
	if(this.contains(o)){
		var i = this.indexOf(o);
		this.splice(i, 1);
		return true;
		}
	return false;
	};
Number.prototype.isBetween = function(a, b, e){
	if(a>b){var t=a; a=b; b=t;}
	if(e){
		if(this >= a && this <= b){
			return true;
			}
		return false;
		}
	else{
		if((this > a && this < b) || (this === a && this === b)){
			return true;
			}
		return false;
		}
	};
String.prototype.strtr = function(replacePairs){
    "use strict";
    var str = this.toString(), key, re;
    for(key in replacePairs){
        if(replacePairs.hasOwnProperty(key)){
            re = new RegExp(key, "g");
            str = str.replace(re, replacePairs[key]);
			}
		}
		return str;
	};

// requestAnimFrame from Paul Irish - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000/60);};
	})();
 
window.scrawl = (function(){
	var scrawl = {
		type: 'Library',
		object: {},
		objectnames: [],
		pad: {},
		padnames: [],
		currentPad: null,
		cell: {},
		canvas: {},
		context: {},
		cellnames: [],
		ctx: {},
		ctxnames: [],
		image: {},
		imageData: {},
		img: {},
		imagenames: [],
		group: {},
		groupnames: [],
		design: {},
		dsn: {},
		designnames: [],
		sprite: {},
		spritenames: [],
		point: {},
		pointnames: [],
		link: {},
		linknames: [],
		anim: {},
		animnames: [],
		nameslist: ['objectnames', 'padnames', 'cellnames', 'imagenames', 'groupnames', 'designnames', 'spritenames', 'pointnames', 'linknames', 'ctxnames', 'animnames'],
		radian: Math.PI/180,
		degree: 180/Math.PI,
		mouseX: 0,
		mouseY: 0,
		newPad: function(items){return new Pad(items);},
		newCell: function(items){return new Cell(items);},
		newImage: function(items){return new ScrawlImage(items);},
		newGroup: function(items){return new Group(items);},
		newPhrase: function(items){return new Phrase(items);},
		newBlock: function(items){return new Block(items);},
		newWheel: function(items){return new Wheel(items);},
		newPicture: function(items){return new Picture(items);},
		newShape: function(items){return new Shape(items);},
		newPoint: function(items){return new Point(items);},
		newLink: function(items){return new Link(items);},
		newAnimSheet: function(items){return new AnimSheet(items);},
		newGradient: function(items){return new Gradient(items);},
		newRadialGradient: function(items){return new RadialGradient(items);},
		newPattern: function(items){return new Pattern(items);},
		isa: function(item, identifier){
			if(this.xta([item, identifier])){
				var myId = identifier.toLowerCase();
				switch(myId){
					case 'bool' :
					case 'boolean' :
						return (typeof item === 'boolean') ? true : false;
						break;
					case 'num' :
					case 'number' :
						return (typeof item === 'number') ? true : false;
						break;
					case 'str' :
					case 'string' :
						return (typeof item === 'string') ? true : false;
						break;
					case 'fn' :
					case 'func' :
					case 'function' :
						return (typeof item === 'function') ? true : false;
						break;
					case 'arr' :
					case 'array' :
						return (Object.prototype.toString.call(item) === '[object Array]') ? true : false;
						break;
					case 'date' :
						return (Object.prototype.toString.call(item) === '[object Date]') ? true : false;
						break;
					case 'obj' :
					case 'object' :
						return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
						break;
					default :
						return false;
					}
				}
			return false;
			},
		xt: function(item){
			return (typeof item !== 'undefined') ? true : false;
			},
		xta: function(item){
			var a = [].concat(item);
			if(a.length > 0){
				for(var i=0, z=a.length; i<z; i++){
					if(typeof a[i] === 'undefined'){
						return false;
						}
					}
				return true;
				}
			return false;
			},
		xto: function(item){
			var a = [].concat(item);
			if(a.length > 0){
				for(var i=0, z=a.length; i<z; i++){
					if(typeof a[i] !== 'undefined'){
						return true;
						}
					}
				}
			return false;
			},
		save: function(items, name){
			items = (this.xt(items)) ? [].concat(items) : [];
			if(items.length === 0 || items[0] === 'all' || items[0] === 'scrawl'){
				items = this.designnames.concat(this.spritenames).concat(this.animnames).concat(this.groupnames);
				}
			else if(items[0] === 'sprites'){
				items = this.designnames.concat(this.spritenames).concat(this.animnames).concat(this.groupnames);
				}
			name = (this.xt(name)) ? name : 'saved_'+Date.now();
			var saved = [], saving;
			for(var i=0, z=items.length; i<z; i++){
				if(this.designnames.contains(items[i])){
					saving = this.design[items[i]].getObjectData()
					saved.push(saving);
					}
				if(this.spritenames.contains(items[i])){
					saving = this.sprite[items[i]].getObjectData()
					saved.push(saving);
					}
				if(this.animnames.contains(items[i])){
					saving = this.anim[items[i]].getObjectData()
					saved.push(saving);
					}
				if(this.groupnames.contains(items[i])){
					saving = this.group[items[i]].getObjectData()
					saved.push(saving);
					}
				}
			saved = JSON.stringify(saved);
			var myE = {'"action"': '°Ḁ','"addPathRoll"': '°ḁ','"angle"': '°Ḃ','"angleDegrees"': '°ḃ','"AnimSheet"': '°Ḅ','"animSheet"': '°ḅ','"Block"': '°Ḇ','"cell"': '°ḇ','"cells"': '°Ḉ','"checkHitUsingImageData"': '°ḉ','"checkHitUsingRadius"': '°Ḋ','"clockwise"': '°ḋ','"closed"': '°Ḍ','"collisionPoints"': '°ḍ','"color"': '°Ḏ','"comment"': '°ḏ','"context"': '°Ḑ','"controlPoint1"': '°ḑ','"controlPoint2"': '°Ḓ','"copyHeight"': '°ḓ','"copyWidth"': '°Ḕ','"copyX"': '°ḕ','"copyY"': '°Ḗ','"currentFrame"': '°ḗ','"currentX"': '°Ḙ','"currentY"': '°ḙ','"degree"': '°Ḛ','"distance"': '°ḛ','"element"': '°Ḝ','"endAngle"': '°ḝ','"endHandleX"': '°Ḟ','"endHandleY"': '°ḟ','"endPoint"': '°Ḡ','"endRadius"': '°ḡ','"endX"': '°Ḣ','"endY"': '°ḣ','"family"': '°Ḥ','"fence"': '°ḥ','"field"': '°Ḧ','"fieldChannel"': '°ḧ','"fieldTest"': '°Ḩ','"fillStyle"': '°ḩ','"firstPoint"': '°Ḫ','"fixed"': '°ḫ','"font"': '°Ḭ','"frames"': '°ḭ','"globalAlpha"': '°Ḯ','"globalCompositeOperation"': '°ḯ','"Gradient"': '°Ḱ','"Group"': '°ḱ','"group"': '°Ḳ','"handleX"': '°ḳ','"handleY"': '°Ḵ','"height"': '°ḵ','"Image"': '°Ḷ','"image"': '°ḷ','"imageData"': '°Ḹ','"imageDataChannel"': '°ḹ','"imageType"': '°Ḻ','"includeCenter"': '°ḻ','"keepCopyDimensions"': '°Ḽ','"lastCalled"': '°ḽ','"length"': '°Ḿ','"lineCap"': '°ḿ','"lineJoin"': '°Ṁ','"lineWidth"': '°ṁ','"Link"': '°Ṃ','"linkDurations"': '°ṃ','"linkList"': '°Ṅ','"loop"': '°ṅ','"method"': '°Ṇ','"metrics"': '°ṇ','"miterLimit"': '°Ṉ','"moveHandleX"': '°ṉ','"moveHandleY"': '°Ṋ','"movePathPosition"': '°ṋ','"moveStartX"': '°Ṍ','"moveStartY"': '°ṍ','"name"': '°Ṏ','"object"': '°ṏ','"order"': '°Ṑ','"path"': '°ṑ','"pathPosition"': '°Ṓ','"pathRoll"': '°ṓ','"pathSpeedConstant"': '°Ṕ','"Pattern"': '°ṕ','"perimeterLength"': '°Ṗ','"Phrase"': '°ṗ','"Picture"': '°Ṙ','"pivot"': '°ṙ','"Point"': '°Ṛ','"pointList"': '°ṛ','"positions"': '°Ṝ','"precision"': '°ṝ','"RadialGradient"': '°Ṟ','"radius"': '°ṟ','"repeat"': '°Ṡ','"roll"': '°ṡ','"rollable"': '°Ṣ','"running"': '°ṣ','"scale"': '°Ṥ','"shadowBlur"': '°ṥ','"shadowColor"': '°Ṧ','"shadowOffsetX"': '°ṧ','"shadowOffsetY"': '°Ṩ','"Shape"': '°ṩ','"size"': '°Ṫ','"source"': '°ṫ','"species"': '°Ṭ','"speed"': '°ṭ','"sprite"': '°Ṯ','"sprites"': '°ṯ','"startAngle"': '°Ṱ','"startHandleX"': '°ṱ','"startHandleY"': '°Ṳ','"startLink"': '°ṳ','"startPoint"': '°Ṵ','"startRadius"': '°ṵ','"startX"': '°Ṷ','"startY"': '°ṷ','"strokeStyle"': '°Ṹ','"style"': '°ṹ','"target"': '°Ṻ','"text"': '°ṻ','"textAlign"': '°Ṽ','"textBaseline"': '°ṽ','"timestamp"': '°Ṿ','"title"': '°ṿ','"type"': '°Ẁ','"variant"': '°ẁ','"visibility"': '°Ẃ','"weight"': '°ẃ','"Wheel"': '°Ẅ','"width"': '°ẅ','"#000000"': '°Ẇ','"10pt sans-serif"': '°ẇ','"source-over"': '°Ẉ','"source-atop"': '°ẉ','"source-in"': '°Ẋ','"source-out"': '°ẋ','"destination-over"': '°Ẍ','"destination-atop"': '°ẍ','"destination-in"': '°Ẏ','"destination-out"': '°ẏ','"lighter"': '°Ẑ','"darker"': '°ẑ','"copy"': '°Ẓ','"xor"': '°ẓ','"butt"': '°Ẕ','"round"': '°ẕ','"square"': '°Ā','"bevel"': '°ā','"miter"': '°Ă','"start"': '°Ą','"left"': '°ą','"center"': '°Ć','"right"': '°ć','"end"': '°Ĉ','"alphabetic"': '°ĉ','"top"': '°Ċ','"hanging"': '°ċ','"middle"': '°Č','"ideographic"': '°č','"bottom"': '°Ď','"anycolor"': '°ď','"red"': '°Đ','"green"': '°đ','"blue"': '°Ē','"alpha"': '°ē','"bold"': '°Ĕ','"italic"': '°ĕ','"normal"': '°Ė','"Context"': '°ė','"fill"': '°Ę','"draw"': '°ę','"fillDraw"': '°Ě','"drawFill"': '°ě','"sinkInto"': '°Ĝ','"floatOver"': '°ĝ','"none"': '°Ğ','"clear"': '°ğ',};
			var enc = saved.strtr(myE);
			this.object[name] = enc;
			this.objectnames.push(name);
			return true;
			},
		load: function(item, callback){
			var myD = {'°Ḁ': '"action"','°ḁ': '"addPathRoll"','°Ḃ': '"angle"','°ḃ': '"angleDegrees"','°Ḅ': '"AnimSheet"','°ḅ': '"animSheet"','°Ḇ': '"Block"','°ḇ': '"cell"','°Ḉ': '"cells"','°ḉ': '"checkHitUsingImageData"','°Ḋ': '"checkHitUsingRadius"','°ḋ': '"clockwise"','°Ḍ': '"closed"','°ḍ': '"collisionPoints"','°Ḏ': '"color"','°ḏ': '"comment"','°Ḑ': '"context"','°ḑ': '"controlPoint1"','°Ḓ': '"controlPoint2"','°ḓ': '"copyHeight"','°Ḕ': '"copyWidth"','°ḕ': '"copyX"','°Ḗ': '"copyY"','°ḗ': '"currentFrame"','°Ḙ': '"currentX"','°ḙ': '"currentY"','°Ḛ': '"degree"','°ḛ': '"distance"','°Ḝ': '"element"','°ḝ': '"endAngle"','°Ḟ': '"endHandleX"','°ḟ': '"endHandleY"','°Ḡ': '"endPoint"','°ḡ': '"endRadius"','°Ḣ': '"endX"','°ḣ': '"endY"','°Ḥ': '"family"','°ḥ': '"fence"','°Ḧ': '"field"','°ḧ': '"fieldChannel"','°Ḩ': '"fieldTest"','°ḩ': '"fillStyle"','°Ḫ': '"firstPoint"','°ḫ': '"fixed"','°Ḭ': '"font"','°ḭ': '"frames"','°Ḯ': '"globalAlpha"','°ḯ': '"globalCompositeOperation"','°Ḱ': '"Gradient"','°ḱ': '"Group"','°Ḳ': '"group"','°ḳ': '"handleX"','°Ḵ': '"handleY"','°ḵ': '"height"','°Ḷ': '"Image"','°ḷ': '"image"','°Ḹ': '"imageData"','°ḹ': '"imageDataChannel"','°Ḻ': '"imageType"','°ḻ': '"includeCenter"','°Ḽ': '"keepCopyDimensions"','°ḽ': '"lastCalled"','°Ḿ': '"length"','°ḿ': '"lineCap"','°Ṁ': '"lineJoin"','°ṁ': '"lineWidth"','°Ṃ': '"Link"','°ṃ': '"linkDurations"','°Ṅ': '"linkList"','°ṅ': '"loop"','°Ṇ': '"method"','°ṇ': '"metrics"','°Ṉ': '"miterLimit"','°ṉ': '"moveHandleX"','°Ṋ': '"moveHandleY"','°ṋ': '"movePathPosition"','°Ṍ': '"moveStartX"','°ṍ': '"moveStartY"','°Ṏ': '"name"','°ṏ': '"object"','°Ṑ': '"order"','°ṑ': '"path"','°Ṓ': '"pathPosition"','°ṓ': '"pathRoll"','°Ṕ': '"pathSpeedConstant"','°ṕ': '"Pattern"','°Ṗ': '"perimeterLength"','°ṗ': '"Phrase"','°Ṙ': '"Picture"','°ṙ': '"pivot"','°Ṛ': '"Point"','°ṛ': '"pointList"','°Ṝ': '"positions"','°ṝ': '"precision"','°Ṟ': '"RadialGradient"','°ṟ': '"radius"','°Ṡ': '"repeat"','°ṡ': '"roll"','°Ṣ': '"rollable"','°ṣ': '"running"','°Ṥ': '"scale"','°ṥ': '"shadowBlur"','°Ṧ': '"shadowColor"','°ṧ': '"shadowOffsetX"','°Ṩ': '"shadowOffsetY"','°ṩ': '"Shape"','°Ṫ': '"size"','°ṫ': '"source"','°Ṭ': '"species"','°ṭ': '"speed"','°Ṯ': '"sprite"','°ṯ': '"sprites"','°Ṱ': '"startAngle"','°ṱ': '"startHandleX"','°Ṳ': '"startHandleY"','°ṳ': '"startLink"','°Ṵ': '"startPoint"','°ṵ': '"startRadius"','°Ṷ': '"startX"','°ṷ': '"startY"','°Ṹ': '"strokeStyle"','°ṹ': '"style"','°Ṻ': '"target"','°ṻ': '"text"','°Ṽ': '"textAlign"','°ṽ': '"textBaseline"','°Ṿ': '"timestamp"','°ṿ': '"title"','°Ẁ': '"type"','°ẁ': '"variant"','°Ẃ': '"visibility"','°ẃ': '"weight"','°Ẅ': '"Wheel"','°ẅ': '"width"','°Ẇ': '"#000000"','°ẇ': '"10pt sans-serif"','°Ẉ': '"source-over"','°ẉ': '"source-atop"','°Ẋ': '"source-in"','°ẋ': '"source-out"','°Ẍ': '"destination-over"','°ẍ': '"destination-atop"','°Ẏ': '"destination-in"','°ẏ': '"destination-out"','°Ẑ': '"lighter"','°ẑ': '"darker"','°Ẓ': '"copy"','°ẓ': '"xor"','°Ẕ': '"butt"','°ẕ': '"round"','°Ā': '"square"','°ā': '"bevel"','°Ă': '"miter"','°Ą': '"start"','°ą': '"left"','°Ć': '"center"','°ć': '"right"','°Ĉ': '"end"','°ĉ': '"alphabetic"','°Ċ': '"top"','°ċ': '"hanging"','°Č': '"middle"','°č': '"ideographic"','°Ď': '"bottom"','°ď': '"anycolor"','°Đ': '"red"','°đ': '"green"','°Ē': '"blue"','°ē': '"alpha"','°Ĕ': '"bold"','°ĕ': '"italic"','°Ė': '"normal"','°ė': '"Context"','°Ę': '"fill"','°ę': '"draw"','°Ě': '"fillDraw"','°ě': '"drawFill"','°Ĝ': '"sinkInto"','°ĝ': '"floatOver"','°Ğ': '"none"','°ğ': '"clear"',};
			var dec = item.strtr(myD);
			var a = JSON.parse(dec);
			var _ctx = ['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','lineWidth','lineCap','lineJoin','miterLimit','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','font','textAlign','textBaseline'];
			var _image = {}, _pattern = {}, _gradient = {}, _sprite = {}, _point = {}, _link = {}, _anim = {}, _group = {};
			var _imageNames = [], _patternNames = [], _gradientNames = [], _spriteNames = [], _pointNames = [], _linkNames = [], _animNames = [], _groupNames = [];
			for(var i=0, z=a.length; i<z; i++){
				switch(a[i].type){
					case 'Pattern' :
						_pattern[a[i].name] = a[i]; 
						_patternNames.push(a[i].name);
						break;
					case 'Gradient' :
					case 'RadialGradient' :
						_gradient[a[i].name] = a[i]; 
						_gradientNames.push(a[i].name);
						break;
					case 'Image' :
						_image[a[i].name] = a[i]; 
						_imageNames.push(a[i].name);
						break;
					case 'AnimSheet' :
						_anim[a[i].name] = a[i]; 
						_animNames.push(a[i].name);
						break;
					case 'Group' :
						_group[a[i].name] = a[i]; 
						_groupNames.push(a[i].name);
						break;
					case 'Shape' :
						for(var j=0, w=a[i].points.length; j<w; j++){
							_point[a[i].points[j].name] = a[i].points[j];
							_pointNames.push(a[i].points[j].name);
							}
						for(var j=0, w=a[i].links.length; j<w; j++){
							_link[a[i].links[j].name] = a[i].links[j];
							_linkNames.push(a[i].links[j].name);
							}
					case 'Block' :
					case 'Phrase' :
					case 'Wheel' :
					case 'Picture' :
						_sprite[a[i].name] = a[i]; 
						_spriteNames.push(a[i].name);
						break;
					}
				}
			for(var i=0, z=_patternNames.length; i<z; i++){
				if(_pattern[_patternNames[i]].image.type === 'Image'){
					_pattern[_patternNames[i]].image['parent'] = _patternNames[i];
					_pattern[_patternNames[i]].image['parentType'] = _pattern[_patternNames[i]].type;
					_image[_pattern[_patternNames[i]].image.name] = _pattern[_patternNames[i]].image;
					_imageNames.push(_pattern[_patternNames[i]].image.name);
					_pattern[_patternNames[i]].image = _pattern[_patternNames[i]].image.name;
					}
				}
			for(var i=0, z=_spriteNames.length; i<z; i++){
				if(this.xt(_sprite[_spriteNames[i]].image) && _sprite[_spriteNames[i]].image.type === 'Image'){
					_sprite[_spriteNames[i]].image['parent'] = _spriteNames[i];
					_sprite[_spriteNames[i]].image['parentType'] = _sprite[_spriteNames[i]].type;
					_image[_sprite[_spriteNames[i]].image.name] = _sprite[_spriteNames[i]].image;
					_imageNames.push(_sprite[_spriteNames[i]].image.name);
					_sprite[_spriteNames[i]].source = _sprite[_spriteNames[i]].image.name;
					}
				if(_sprite[_spriteNames[i]].context.type === 'Context'){
					for(var j=0, w=_ctx.length; j<w; j++){
						_sprite[_spriteNames[i]].object[_ctx[j]] = _sprite[_spriteNames[i]].context.object[_ctx[j]];
						}
					_sprite[_spriteNames[i]].context = _sprite[_spriteNames[i]].context.name;
					}
				}
			var newobj, parobj;
			for(var i=0, z=_imageNames.length; i<z; i++){
				_image[_imageNames[i]].object.source = false;
				_image[_imageNames[i]].object.imageData = _image[_imageNames[i]].imageData;
				newobj = this.newImage(_image[_imageNames[i]].object);
				}
			for(var i=0, z=_animNames.length; i<z; i++){
				newobj = this.newAnimSheet(_anim[_animNames[i]].object);
				}
			for(var i=0, z=_patternNames.length; i<z; i++){
				newobj = this.newPattern(_pattern[_patternNames[i]].object);
				}
			for(var i=0, z=_gradientNames.length; i<z; i++){
				switch(_gradient[_gradientNames[i]].type){
					case 'Gradient' :
						newobj = this.newGradient(_gradient[_gradientNames[i]].object);
						break;
					case 'RadialGradient' :
						newobj = this.newRadialGradient(_gradient[_gradientNames[i]].object);
						break;
					}
				}
			for(var i=0, z=_groupNames.length; i<z; i++){
				if(this.groupnames.contains(_groupNames[i])){
					for(var j=0, w=_group[_groupNames[i]].object.sprites.length; j<w; j++){
						this.group[_groupNames[i]].sprites.pushUnique(_group[_groupNames[i]].object.sprites[j]);
						}
					}
				else{
					newobj = this.newGroup(_group[_groupNames[i]].object);
					}
				}
			for(var i=0, z=_spriteNames.length; i<z; i++){
				switch(_sprite[_spriteNames[i]].type){
					case 'Block' :
						newobj = this.newBlock(_sprite[_spriteNames[i]].object);
						break;
					case 'Phrase' :
						newobj = this.newPhrase(_sprite[_spriteNames[i]].object);
						break;
					case 'Picture' :
						newobj = this.newPicture(_sprite[_spriteNames[i]].object);
						if(newobj.imageData){newobj.getImageData();}
						break;
					case 'Wheel' :
						newobj = this.newWheel(_sprite[_spriteNames[i]].object);
						break;
					case 'Shape' :
						newobj = this.newShape(_sprite[_spriteNames[i]].object);
						break;
					}
				}
			for(var i=0, z=_pointNames.length; i<z; i++){
				newobj = this.newPoint(_point[_pointNames[i]].object);
				}
			for(var i=0, z=_linkNames.length; i<z; i++){
				newobj = this.newLink(_link[_linkNames[i]].object);
				}
			if(callback){
				callback();
				}
			return true;
			},
		makeName: function(item){
			var o = {
				name: (this.isa(item.name,'str')) ? item.name : null,
				type: (this.isa(item.type,'str')) ? item.type : null,
				target: (this.isa(item.target,'str')) ? item.target : null,
				};
			if(this.nameslist.contains(o.target)){
				var name = o.name || o.type || 'default';
				name += (this[o.target].contains(name)) ? '_'+Math.floor(Math.random()*100000000) : '';
				return name;
				}
			return false;
			},
		getImagesByClass: function(classtag){
			if(classtag){
				var names = []
				var s = document.getElementsByClassName(classtag);
				if(s.length > 0){
					for(var myImg, i=0, z=s.length; i<z; i++){
						myImg = scrawl.newImage({
							element: s[i],							//unrecorded flag for triggering Image stuff
							});
						names.push(myImg.name);
						}
					return names;
					}
				}
			console.log('scrawl.getImagesByClass() failed to find any <img> elements of class="'+classtag+'" on the page');
			return false;
			},
		clear: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].clear(command);
					}
				return true;
				}
			return false;
			},
		compile: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].compile(command);
					}
				return true;
				}
			return false;
			},
		show: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].show(command);
					}
				return true;
				}
			return false;
			},
		render: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].render(command);
					}
				return true;
				}
			return false;
			},
		reset: function(){
			this.objectnames = []; 
			this.stack = {}; this.stk = {}; this.stacknames = [];
			this.element = {}; this.elm = {}; this.elementnames = [];
			this.pad = {}; this.padnames = []; this.currentPad = null;
			this.cell = {}; this.canvas = {}; this.context = {}; this.cellnames = [];
			this.ctx = {}; this.ctxnames = []; this.image = {};
			this.imageData = {}; this.img = {}; this.imagenames = [];
			this.group = {}; this.groupnames = [];
			this.design = {}; this.dsn = {}; this.designnames = [];
			this.sprite = {}; this.spritenames = [];
			this.point = {}; this.pointnames = [];
			this.link = {}; this.linknames = [];
			this.anim = {}; this.animnames = [];
			this.initialize();
			return true;
			},
		addNewCell: function(data, pad){
			var p = (this.isa(pad,'str')) ? pad : this.currentPad;
			return scrawl.pad[p].addNewCell(data);
			},
		deleteCells: function(cells){
			if(this.xt(cells)){
				var c = [].concat(cells)
				for(var i=0, z=c.length; i<z; i++){
					for(var j=0, w=this.padnames.length; j<w; j++){
						this.pad[this.padnames[j]].deleteCell(c[i]);
						}
					delete this.group[c[i]];
					delete this.group[c[i]+'_field'];
					delete this.group[c[i]+'_fence'];
					this.groupnames.removeItem(c[i]);
					this.groupnames.removeItem(c[i]+'_field');
					this.groupnames.removeItem(c[i]+'_fence');
					delete this.context[c[i]];
					delete this.canvas[c[i]];
					delete this.ctx[scrawl.cell[c[i]].context];
					this.ctxnames.removeItem(scrawl.cell[c[i]].context);
					delete this.cell[c[i]];
					this.cellnames.removeItem(c[i]);
					}
				return true;
				}
			return false;
			},
		setDrawOrder: function(order, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : [this.currentPad];
			for(var i=0, z=p.length; i<z; i++){
				this.pad[p[i]].setDrawOrder(order);
				}
			return true;
			},
		makeCartesianPoints: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.isa(items.pointLabel,'str') && this.isa(items.sprite,'str') && this.isa(items.data,'arr')){
				var v = [], temp;
				var viz = (this.isa(items.visibility,'bool')) ? items.visibility : true;
				var vLabel = (this.xt(items.linkLabel)) ? items.linkLabel : items.pointLabel+'_link';
				for(var i=0, z=items.data.length; i<z; i++){
					temp = new Point({
						name: items.pointLabel+i,
						sprite: items.sprite,
						currentX: items.data[i][0] || 0,
						currentY: items.data[i][1] || 0,
						visibility: viz,
						startLink: vLabel+i,
						});
					v.push(temp.name);
					}
				}
			return v;
			},
		makePolarPoints: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.isa(items.pointLabel,'str') && this.isa(items.sprite,'str') && this.isa(items.data,'arr')){
				var v = [], temp;
				var viz = (this.isa(items.visibility,'bool')) ? items.visibility : true;
				var ang = (this.isa(items.degree,'bool')) ? items.degree : true;
				var vLabel = (this.xt(items.linkLabel)) ? items.linkLabel : items.pointLabel+'_link';
				for(var i=0, z=items.data.length; i<z; i++){
					temp = new Point({
						name: items.pointLabel+i,
						sprite: items.sprite,
						distance: items.data[i][0] || 0,
						angle: items.data[i][1] || 0,
						degree: ang,
						visibility: viz,
						startLink: vLabel+i,
						});
					v.push(temp.name);
					}
				}
			return v;
			},
		makeLine: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			var myFixed = items.fixed || 'none';
			items.fixed = false;
			var myShape = this.newShape(items);
			if(myShape){
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_p',
					linkLabel: myShape.name+'_v',
					sprite: myShape.name,
					data: [[items.startX, items.startY], [items.endX, items.endY]],
					});
				this.newLink({
					name: myShape.name+'_v0',
					species: 'line', 
					startPoint: myShape.name+'_p0',
					endPoint: myShape.name+'_p1',
					action: 'add',
					precision: items.precision || false,
					});
				this.newLink({
					name: myShape.name+'_v1',
					action: 'end',
					});
				this.link[myShape.name+'_v1'].action = 'end';		//????
				myShape.set({
					firstPoint: myShape.name+'_p0',
					collisionPoints: myShape.collisionPoints,
					});
				switch(myFixed){
					case 'both' :
						this.point[myShape.name+'_p0'].fixed = true;
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					case 'start' :
						this.point[myShape.name+'_p0'].fixed = true;
						break;
					case 'end' :
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					default :
						this.point[myShape.name+'_p0'].fixed = myShape.name;
					}
				myShape.forceStamp('none');
				return myShape;
				}
			return false;
			},
		makeEllipse: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.radiusX = items.radiusX || 0;
			items.radiusY = items.radiusY || 0;
			items.closed = true;
			var myShape = this.newShape(items);
			if(myShape){
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_p',
					linkLabel: myShape.name+'_l',
					sprite: myShape.name,
					data: [
						[(items.startX-(items.radiusX*0.55)), (items.startY-items.radiusY)],
						[items.startX, (items.startY-items.radiusY)], 
						[(items.startX+(items.radiusX*0.55)), (items.startY-items.radiusY)],
						[(items.startX+items.radiusX), (items.startY-(items.radiusY*0.55))],
						[(items.startX+items.radiusX), items.startY],
						[(items.startX+items.radiusX), (items.startY+(items.radiusY*0.55))],
						[(items.startX+(items.radiusX*0.55)), (items.startY+items.radiusY)],
						[items.startX, (items.startY+items.radiusY)], 
						[(items.startX-(items.radiusX*0.55)), (items.startY+items.radiusY)],
						[(items.startX-items.radiusX), (items.startY+(items.radiusY*0.55))],
						[(items.startX-items.radiusX), items.startY],
						[(items.startX-items.radiusX), (items.startY-(items.radiusY*0.55))],
						[items.startX, (items.startY-items.radiusY)], 
						],
					});
				this.newLink({
					name: myShape.name+'_l0',
					species: 'bezier', 
					startPoint: myShape.name+'_p1',
					endPoint: myShape.name+'_p4',
					controlPoint1: myShape.name+'_p2',
					controlPoint2: myShape.name+'_p3',
					precision: items.precision || false,
					action: 'add',
					}).clone({
					name: myShape.name+'_l1',
					startPoint: myShape.name+'_p4',
					endPoint: myShape.name+'_p7',
					controlPoint1: myShape.name+'_p5',
					controlPoint2: myShape.name+'_p6',
					}).clone({
					name: myShape.name+'_l2',
					startPoint: myShape.name+'_p7',
					endPoint: myShape.name+'_p10',
					controlPoint1: myShape.name+'_p8',
					controlPoint2: myShape.name+'_p9',
					}).clone({
					name: myShape.name+'_l3',
					startPoint: myShape.name+'_p10',
					endPoint: myShape.name+'_p12',
					controlPoint1: myShape.name+'_p11',
					controlPoint2: myShape.name+'_p0',
					});
				this.newLink({
					name: myShape.name+'_l4',
					startPoint: myShape.name+'_p12',
					action: 'close',
					});
				myShape.set({
					firstPoint: myShape.name+'_p1',
					collisionPoints: myShape.collisionPoints,
					});
				scrawl.point[myShape.name+'_p1'].set({startLink: myShape.name+'_l0'});
				scrawl.point[myShape.name+'_p4'].set({startLink: myShape.name+'_l1'});
				scrawl.point[myShape.name+'_p7'].set({startLink: myShape.name+'_l2'});
				scrawl.point[myShape.name+'_p10'].set({startLink: myShape.name+'_l3'});
				scrawl.point[myShape.name+'_p12'].set({startLink: myShape.name+'_l4'});
				myShape.forceStamp('none');
				return myShape;
				}
			return false;
			},
		makeRectangle: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.width = items.width || 0; 
			items.height = items.height || 0;
			items.radius = items.radius || 0; 
			items.closed = true;
			var myShape = this.newShape(items);
			if(myShape){
				var _tlx = items.radiusTopLeftX || items.radiusTopLeft || items.radiusTopX || items.radiusLeftX || items.radiusTop || items.radiusLeft || items.radiusX || items.radius || 0;
				var _tly = items.radiusTopLeftY || items.radiusTopLeft || items.radiusTopY || items.radiusLeftY || items.radiusTop || items.radiusLeft || items.radiusY || items.radius || 0;
				var _trx = items.radiusTopRightX || items.radiusTopRight || items.radiusTopX || items.radiusRightX || items.radiusTop || items.radiusRight || items.radiusX || items.radius || 0;
				var _try = items.radiusTopRightY || items.radiusTopRight || items.radiusTopY || items.radiusRightY || items.radiusTop || items.radiusRight || items.radiusY || items.radius || 0;
				var _brx = items.radiusBottomRightX || items.radiusBottomRight || items.radiusBottomX || items.radiusRightX || items.radiusBottom || items.radiusRight || items.radiusX || items.radius || 0;
				var _bry = items.radiusBottomRightY || items.radiusBottomRight || items.radiusBottomY || items.radiusRightY || items.radiusBottom || items.radiusRight || items.radiusY || items.radius || 0;
				var _blx = items.radiusBottomLeftX || items.radiusBottomLeft || items.radiusBottomX || items.radiusLeftX || items.radiusBottom || items.radiusLeft || items.radiusX || items.radius || 0;
				var _bly = items.radiusBottomLeftY || items.radiusBottomLeft || items.radiusBottomY || items.radiusLeftY || items.radiusBottom || items.radiusLeft || items.radiusY || items.radius || 0;
				var halfWidth = (items.width/2);
				var halfHeight = (items.height/2);
				
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_p',
					linkLabel: myShape.name+'_l',
					sprite: myShape.name,
					data: [
						[items.startX + halfWidth - _trx, items.startY - halfHeight],
						[items.startX + halfWidth, items.startY - halfHeight + _try],
						[items.startX + halfWidth, items.startY + halfHeight - _bry],
						[items.startX + halfWidth - _brx, items.startY + halfHeight],
						[items.startX - halfWidth + _blx, items.startY + halfHeight],
						[items.startX - halfWidth, items.startY + halfHeight - _bly],
						[items.startX - halfWidth, items.startY - halfHeight + _tly],
						[items.startX - halfWidth + _tlx, items.startY - halfHeight],
						[items.startX + halfWidth - _trx, items.startY - halfHeight]
						],
					});
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_pc',
					linkLabel: myShape.name+'_l',
					sprite: myShape.name,
					data: [
						[items.startX + halfWidth - _trx + (_trx*0.55), items.startY - halfHeight],
						[items.startX + halfWidth, items.startY - halfHeight + _try - (_try*0.55)],
						[items.startX + halfWidth, items.startY + halfHeight - _bry + (_bry*0.55)],
						[items.startX + halfWidth - _brx + (_brx*0.55), items.startY + halfHeight],
						[items.startX - halfWidth + _blx - (_blx*0.55), items.startY + halfHeight],
						[items.startX - halfWidth, items.startY + halfHeight - _bly + (_bly*0.55)],
						[items.startX - halfWidth, items.startY - halfHeight + _tly - (_tly*0.55)],
						[items.startX - halfWidth + _tlx - (_tlx*0.55), items.startY - halfHeight],
						],
					});
				this.newLink({
					name: myShape.name+'_l4',
					species: 'bezier', 
					startPoint: myShape.name+'_p0',
					endPoint: myShape.name+'_p1',
					controlPoint1: myShape.name+'_pc0',
					controlPoint2: myShape.name+'_pc1',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_l0',
					species: 'line', 
					startPoint: myShape.name+'_p1',
					endPoint: myShape.name+'_p2',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_l5',
					species: 'bezier', 
					startPoint: myShape.name+'_p2',
					endPoint: myShape.name+'_p3',
					controlPoint1: myShape.name+'_pc2',
					controlPoint2: myShape.name+'_pc3',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					species: 'line', 
					name: myShape.name+'_l1',
					startPoint: myShape.name+'_p3',
					endPoint: myShape.name+'_p4',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_l6',
					species: 'bezier', 
					startPoint: myShape.name+'_p4',
					endPoint: myShape.name+'_p5',
					controlPoint1: myShape.name+'_pc4',
					controlPoint2: myShape.name+'_pc5',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					species: 'line', 
					name: myShape.name+'_l2',
					startPoint: myShape.name+'_p5',
					endPoint: myShape.name+'_p6',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_l7',
					species: 'bezier', 
					startPoint: myShape.name+'_p6',
					endPoint: myShape.name+'_p7',
					controlPoint1: myShape.name+'_pc6',
					controlPoint2: myShape.name+'_pc7',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					species: 'line', 
					name: myShape.name+'_l3',
					startPoint: myShape.name+'_p7',
					endPoint: myShape.name+'_p8',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_l8',
					startPoint: myShape.name+'_p8',
					action: 'close',
					});
				myShape.set({
					firstPoint: myShape.name+'_p0',
					collisionPoints: myShape.collisionPoints,
					});
				scrawl.point[myShape.name+'_p0'].set({startLink: myShape.name+'_l4'});
				scrawl.point[myShape.name+'_p1'].set({startLink: myShape.name+'_l0'});
				scrawl.point[myShape.name+'_p2'].set({startLink: myShape.name+'_l5'});
				scrawl.point[myShape.name+'_p3'].set({startLink: myShape.name+'_l1'});
				scrawl.point[myShape.name+'_p4'].set({startLink: myShape.name+'_l6'});
				scrawl.point[myShape.name+'_p5'].set({startLink: myShape.name+'_l2'});
				scrawl.point[myShape.name+'_p6'].set({startLink: myShape.name+'_l7'});
				scrawl.point[myShape.name+'_p7'].set({startLink: myShape.name+'_l3'});
				scrawl.point[myShape.name+'_p8'].set({startLink: myShape.name+'_l8'});
				myShape.forceStamp('none');
				return myShape;
				}
			return false;
			},
		makeBezier: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.startControlX = items.startControlX || 0;
			items.startControlY = items.startControlY || 0;
			items.endControlX = items.endControlX || 0;
			items.endControlY = items.endControlY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			var myFixed = items.fixed || 'none';
			items.fixed = false;
			var myShape = this.newShape(items);
			if(myShape){
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_p',
					linkLabel: myShape.name+'_v',
					sprite: myShape.name,
					data: [[items.startX, items.startY], [items.endX, items.endY]],
					});
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_pc',
					linkLabel: myShape.name+'_vc',
					sprite: myShape.name,
					data: [[items.startControlX, items.startControlY], [items.endControlX, items.endControlY]],
					});
				this.newLink({
					name: myShape.name+'_v0',
					species: 'bezier', 
					startPoint: myShape.name+'_p0',
					endPoint: myShape.name+'_p1',
					controlPoint1: myShape.name+'_pc0',
					controlPoint2: myShape.name+'_pc1',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_v1',
					action: 'end',
					});
				myShape.set({
					firstPoint: myShape.name+'_p0',
					collisionPoints: myShape.collisionPoints,
					});
				switch(myFixed){
					case 'all' :
						this.point[myShape.name+'_p0'].fixed = true;
						this.point[myShape.name+'_pc0'].fixed = true;
						this.point[myShape.name+'_pc1'].fixed = true;
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					case 'both' :
						this.point[myShape.name+'_p0'].fixed = true;
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					case 'start' :
						this.point[myShape.name+'_p0'].fixed = true;
						break;
					case 'startControl' :
						this.point[myShape.name+'_pc0'].fixed = true;
						break;
					case 'endControl' :
						this.point[myShape.name+'_pc1'].fixed = true;
						break;
					case 'end' :
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					default :
						this.point[myShape.name+'_p0'].fixed = myShape.name;
					}
				myShape.forceStamp('none');
				return myShape;
				}
			return false;
			},
		makeQuadratic: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.controlX = items.controlX || 0;
			items.controlY = items.controlY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			var myFixed = items.fixed || 'none';
			items.fixed = false;
			var myShape = this.newShape(items);
			if(myShape){
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_p',
					linkLabel: myShape.name+'_v',
					sprite: myShape.name,
					data: [[items.startX, items.startY], [items.endX, items.endY]],
					});
				this.makeCartesianPoints({
					pointLabel: myShape.name+'_pc',
					linkLabel: myShape.name+'_vc',
					sprite: myShape.name,
					data: [[items.controlX, items.controlY]],
					});
				this.newLink({
					name: myShape.name+'_v0',
					species: 'quadratic', 
					startPoint: myShape.name+'_p0',
					endPoint: myShape.name+'_p1',
					controlPoint1: myShape.name+'_pc0',
					precision: items.precision || false,
					action: 'add',
					});
				this.newLink({
					name: myShape.name+'_v1',
					action: 'end',
					});
				myShape.set({
					firstPoint: myShape.name+'_p0',
					collisionPoints: myShape.collisionPoints,
					});
				switch(myFixed){
					case 'all' :
						this.point[myShape.name+'_p0'].fixed = true;
						this.point[myShape.name+'_pc0'].fixed = true;
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					case 'both' :
						this.point[myShape.name+'_p0'].fixed = true;
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					case 'start' :
						this.point[myShape.name+'_p0'].fixed = true;
						break;
					case 'control' :
						this.point[myShape.name+'_pc0'].fixed = true;
						break;
					case 'end' :
						this.point[myShape.name+'_p1'].fixed = true;
						break;
					default :
						this.point[myShape.name+'_p0'].fixed = myShape.name;
					}
				myShape.forceStamp('none');
				return myShape;
				}
			return false;
			},
		makeRegularShape: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.xto([items.sides, items.angle])){
				items.startX = items.startX || 0;
				items.startY = items.startY || 0;
				items.radius = (this.isa(items.radius,'num')) ? items.radius : 20;
				items.closed = true;
				var myTurn = (items.sides) ? 360/items.sides : items.angle;
				var mySides = 0, calculateSides = myTurn;
				while(calculateSides > 0.000001 && mySides<360){
					mySides++;
					calculateSides += myTurn;
					calculateSides = calculateSides%360;
					}
				mySides++;
				var myShape = this.newShape(items);
				if(myShape){
					var myAngle = myTurn;
					for(var i=0; i<mySides; i++){
						this.newPoint({
							name: myShape.name+'_p'+i,
							sprite: myShape.name,
							distance: items.radius,
							angle: myAngle,
							startLink: myShape.name+'_v'+i,
							});
						this.newLink({
							name: myShape.name+'_v'+i,
							species: 'line',
							startPoint: myShape.name+'_p'+i,
							endPoint: myShape.name+'_p'+(i+1),
							action: 'add',
							precision: items.precision || false,
							});
						myAngle += myTurn;
						myAngle = myAngle%360;
						}
					this.newPoint({
						name: myShape.name+'_p'+mySides,
						sprite: myShape.name,
						distance: items.radius,
						angle: myAngle,
						startLink: myShape.name+'_v'+mySides,
						});
					this.newLink({
						name: myShape.name+'_v'+mySides,
						action: 'close',
						});
					myShape.set({
						firstPoint: myShape.name+'_p0',
						collisionPoints: myShape.collisionPoints,
						});
					myShape.forceStamp('none');
					return myShape;
					}
				}
			return false;
			},
		deleteSprite: function(items){
			var myItems = [].concat(items);
			for(var i=0, z=myItems.length; i<z; i++){
				if(this.spritenames.contains(myItems[i])){
					if(this.sprite[myItems[i]].type === 'Shape'){
						var myPointList = [this.sprite[myItems[i]].firstPoint];
						var myData = this.point[this.sprite[myItems[i]].firstPoint].getData();
						var myLinkList = [myData.startLink];
						var nextLink = this.link[myData.startLink];
						while(nextLink.action && ['move','add'].contains(nextLink.action)){
							if(nextLink.controlPoint1){myPointList.push(nextLink.controlPoint1);}
							if(nextLink.controlPoint2){myPointList.push(nextLink.controlPoint2);}
							if(nextLink.endPoint){
								myPointList.push(nextLink.endPoint);
								myLinkList.push(this.point[nextLink.endPoint].startLink);
								nextLink = this.link[this.point[nextLink.endPoint].startLink];
								}
							else{break;}
							}
						for(var k=0, w=myPointList.length; k<w; k++){
							this.pointnames.removeItem(myPointList[k]);
							delete this.point[myPointList[k]];
							}
						for(var k=0, w=myLinkList.length; k<w; k++){
							this.linknames.removeItem(myLinkList[k]);
							delete this.link[myLinkList[k]];
							}
						}
					if(this.sprite[myItems[i]].collisionPoints.length > 0){
						var myPoints = [];
						for(var k=0, w=this.sprite[myItems[i]].collisionPoints.length; k<w; k++){
							myPoints.push(this.sprite[myItems[i]].collisionPoints[k]);
							}
						this.sprite[myItems[i]].removeCollisionPoints(myPoints);
						}
					this.ctxnames.removeItem(myItems[i]);
					delete this.ctx[myItems[i]];
					this.spritenames.removeItem(myItems[i]);
					delete this.sprite[myItems[i]];
					for(var j =0, v=this.groupnames.length; j<v; j++){
						this.group[this.groupnames[j]].sprites.removeItem(myItems[i]);
						}
					}
				}
			return true;
			},
		addSpritesToGroups: function(groups, sprites){
			if(this.xta([groups,sprites])){
				var myGroups = [].concat(groups);
				var mySprites = [].concat(sprites);
				for(var i=0, z=myGroups.length; i<z; i++){
					if(this.groupnames.contains(myGroups[i])){
						this.group[myGroups[i]].addSpritesToGroup(mySprites);
						}
					}
				return true;
				}
			return false;
			},
		removeSpritesFromGroups: function(groups, sprites){
			if(this.xta([groups,sprites])){
				var myGroups = [].concat(groups);
				var mySprites = [].concat(sprites);
				for(var i=0, z=myGroups.length; i<z; i++){
					if(this.groupnames.contains(myGroups[i])){
						this.group[myGroups[i]].removeSpritesFromGroup(mySprites);
						}
					}
				return true;
				}
			return false;
			},
		buildFields: function(items){
			var myCells = (this.xt(items)) ? [].concat(items) : [this.pad[this.currentPad].current];
			if(items === 'all'){
				myCells = this.cellnames;
				}
			for(var i=0, z=myCells.length; i<z; i++){
				this.cell[myCells[i]].buildField();
				}
			return true;
			},
		addCanvasToPage: function(items){
			var myName = scrawl.makeName({
				name: items.canvasName || false,
				type: 'Pad',
				target: 'padnames',
				});
			var myParent = document.getElementById(items.parentElement) || document.body;
			var myCanvas = document.createElement('canvas');
			myCanvas.id = myName;
			myParent.appendChild(myCanvas);
			var DOMCanvas = document.getElementById(myName);
			DOMCanvas.width = items.width;
			DOMCanvas.height = items.height;
			var myPad = scrawl.newPad({
				canvasElement: DOMCanvas,
				});
			myPad.set(items);
			myPad.setDisplayOffsets();
			return myPad;
			},
		initialize: function(){
			this.getCanvases();
			this.setDisplayOffsets('all');
			return true;
			},
		getCanvases: function(){
			var s = document.getElementsByTagName("canvas");
			var myPad;
			var canvases = [];
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					canvases.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					myPad = scrawl.newPad({
						canvasElement: canvases[i],
						});
					if(i === 0){
						scrawl.currentPad = myPad.name;
						}
					}
				return true;
				}
			console.log('scrawl.getCanvases() failed to find any <canvas> elements on the page');
			return false;
			},
		setDisplayOffsets: function(item){
			for(var i=0, z=scrawl.padnames.length; i<z; i++){
				scrawl.pad[scrawl.padnames[i]].setDisplayOffsets();
				}
			return true;
			},
		handleMouseMove: function(e){
			if (!e) var e = window.event;
			if (e.pageX || e.pageY){
				scrawl.mouseX = e.pageX;
				scrawl.mouseY = e.pageY;
				}
			else if (e.clientX || e.clientY){
				scrawl.mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				scrawl.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
			return true;
			},
		getImageDataValue: function(items){
			if(this.xta([items.table, items.channel]) && this.isa(items.x,'num') && this.isa(items.y,'num')){
				var myTable = scrawl.imageData[items.table];
				if(myTable){
					if(items.y.isBetween(-1, myTable.height)){ 
						if(items.x.isBetween(-1, myTable.width)){ 
							var myEl = ((items.y * myTable.width) + items.x) * 4;
							var result;
							if(items.channel === 'color'){
								result = 'rgba('+myTable.data[myEl]+','+myTable.data[myEl+1]+','+myTable.data[myEl+2]+','+myTable.data[myEl+3]+')';
								}
							else{
								var myChannel;
								switch(items.channel){
									case 'red' : myChannel = 0; break;
									case 'blue' : myChannel = 1; break;
									case 'green' : myChannel = 2; break;
									case 'alpha' : myChannel = 3; break;
									}
								result = myTable.data[myEl+myChannel];
								}
							return result;
							}
						}
					}
				}
			return false;
			},
		};

	function Scrawl(items){
		var tempname = items.name || '';
		items.name = scrawl.makeName({name: tempname, type: this.type, target: this.classname});
		this.name = items.name;
		this.comment = items.comment || '';
		this.title = items.title || '';
		this.timestamp = Date.now();
		return this;
		}
	Scrawl.prototype.type = 'Scrawl';
	Scrawl.prototype.classname = 'objectnames';
	Scrawl.prototype.get = function(item){
		return this[item];
		};
	Scrawl.prototype.set = function(items){
		for(var label in items){
			if(scrawl.xt(this[label])){
				this[label] = items[label];
				}
			}
		return this
		};
	Scrawl.prototype.clone = function(items){
		var a;
		var b = JSON.parse(JSON.stringify(this));
		items = (scrawl.isa(items,'obj')) ? items : {};
		b.name = items.name || b.name;
		switch(this.type){
			case 'Phrase' : a = new Phrase(b); break;
			case 'Block' : a = new Block(b); break;
			case 'Wheel' : a = new Wheel(b); break;
			case 'Picture' : a = new Picture(b); break;
			case 'Shape' : a = new Shape(b); break;
			case 'Gradient' : a = new Gradient(b); break;
			case 'RadialGradient' : a = new RadialGradient(b); break;
			case 'Pattern' : a = new Pattern(b); break;
			case 'Point' : a = new Point(b); break;
			case 'Link' : a = new Link(b); break;
			case 'Context' : a = new Context(b); break;
			case 'AnimSheet' : a = new AnimSheet(b); break;
			}
		a.set(items);
		return a;
		};
	Scrawl.prototype.toString = function(){
		return JSON.stringify(this);
		};
	Scrawl.prototype.getObjectData = function(){
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			timestamp: Date.now()
			};
		};

	function SubScrawl(items){
		Scrawl.call(this, items);
		this.startX = items.startX || 0;
		this.startY = items.startY || 0;
		this.handleX = items.handleX || 0;
		this.handleY = items.handleY || 0;
		this.moveStartX = items.moveStartX || 0;
		this.moveStartY = items.moveStartY || 0;
		this.moveHandleX = items.moveHandleX || 0;
		this.moveHandleY = items.moveHandleY || 0;
		this.pivot = items.pivot || false;
		this.path = items.path || false;
		this.pathPosition = items.pathPosition || 0;
		this.movePathPosition = items.movePathPosition || 0;
		this.pathSpeedConstant = (scrawl.isa(items.pathSpeedConstant,'bool')) ? items.pathSpeedConstant : true;
		this.pathRoll = 0;
		this.addPathRoll = (scrawl.isa(items.addPathRoll,'bool')) ? items.addPathRoll : false;
		this.scale = (scrawl.isa(items.scale,'num')) ? items.scale : 1;
		return this;
		}
	SubScrawl.prototype = Object.create(Scrawl.prototype);
	SubScrawl.prototype.type = 'SubScrawl';
	SubScrawl.prototype.classname = 'objectnames';
	SubScrawl.prototype.moveStart = function(item){
		switch(item){
			case 'x' :
				this.startX += this.moveStartX;
				break;
			case 'y' :
				this.startY += this.moveStartY;
				break;
			case 'path' :
				this.pathPosition += this.movePathPosition;
				if(this.pathPosition > 1){this.pathPosition -= 1;}
				if(this.pathPosition < 0){this.pathPosition += 1;}
				break;
			default :
				this.startX += this.moveStartX;
				this.startY += this.moveStartY;
				this.pathPosition += this.movePathPosition;
				if(this.pathPosition > 1){this.pathPosition -= 1;}
				if(this.pathPosition < 0){this.pathPosition += 1;}
			}
		return this;
		};
	SubScrawl.prototype.exchange = function(obj, item){
		if(scrawl.isa(obj,'obj')){
			var temp;
			switch(item){
				case 'start' :
					temp = this.startX; this.startX = obj.startX; obj.startX = temp;
					temp = this.startY; this.startY = obj.startY; obj.startY = temp;
					break;
				case 'moveStart' :
					temp = this.moveStartX; this.moveStartX = obj.moveStartX; obj.moveStartX = temp;
					temp = this.moveStartY; this.moveStartY = obj.moveStartY; obj.moveStartY = temp;
					break;
				case 'handle' :
					temp = this.handleX; this.handleX = obj.handleX; obj.handleX = temp;
					temp = this.handleY; this.handleY = obj.handleY; obj.handleY = temp;
					break;
				case 'moveHandle' :
					temp = this.moveHandleX; this.moveHandleX = obj.moveHandleX; obj.moveHandleX = temp;
					temp = this.moveHandleY; this.moveHandleY = obj.moveHandleY; obj.moveHandleY = temp;
					break;
				default :
					if(scrawl.xt(this[item]) && scrawl.xt(obj[item])){
						temp = this[item]; this[item] = obj[item]; obj[item] = temp;
						}
				}
			}
		return this;
		};
	SubScrawl.prototype.moveHandle = function(item){
		switch(item){
			case 'x' : this.handleX += this.moveHandleX; break;
			case 'y' : this.handleY += this.moveHandleY; break;
			default : this.handleX += this.moveHandleX; this.handleY += this.moveHandleY;
			}
		return this;
		};
	SubScrawl.prototype.reverse = function(item){
		switch(item){
			case 'moveStartX' : this.moveStartX = -this.moveStartX; break;
			case 'moveStartY' : this.moveStartY = -this.moveStartY; break;
			case 'moveStart' : this.moveStartX = -this.moveStartX; this.moveStartY = -this.moveStartY; break;
			case 'moveHandleX' : this.moveHandleX = -this.moveHandleX; break;
			case 'moveHandleY' : this.moveHandleY = -this.moveHandleY; break;
			case 'moveHandle' : this.moveHandleX = -this.moveHandleX; this.moveHandleY = -this.moveHandleY; break;
			case 'movePath' : this.movePathPosition = -this.movePathPosition; break;
			}
		return this;
		};
	SubScrawl.prototype.getStartX = function(override){
		override = (scrawl.isa(override,'obj')) ? override : {};
		var myH;
		if(this.type === 'Block' || this.type === 'Picture'){
			switch (this.handleX){
				case 'left' : myH = 0; break;
				case 'center' : myH = this.width/2; break;
				case 'right' : myH = this.width; break;
				default : myH = this.handleX;
				}
			}
		else{
			myH = this.handleX;
			}
		var a = this.startX - (myH*this.scale);
		return (scrawl.xt(override.x)) ? a+override.x : a;
		};
	SubScrawl.prototype.getStartY = function(override){
		override = (scrawl.isa(override,'obj')) ? override : {};
		var myH;
		if(this.type === 'Block' || this.type === 'Picture'){
			switch (this.handleY){
				case 'top' : myH = 0; break;
				case 'center' : myH = this.height/2; break;
				case 'bottom' : myH = this.height; break;
				default : myH = this.handleY;
				}
			}
		else{
			myH = this.handleY;
			}
		var a = this.startY - (myH*this.scale);
		return (scrawl.xt(override.y)) ? a+override.y : a;
		};

	function Scrawl3d(items){
		SubScrawl.call(this, items);
		this.isIE = (navigator.appName == 'Microsoft Internet Explorer') ? true : false;
		return this;
		}
	Scrawl3d.prototype = Object.create(SubScrawl.prototype);
	Scrawl3d.prototype.type = 'Scrawl3d';
	Scrawl3d.prototype.classname = 'objectnames';
	Scrawl3d.prototype.initialize2d = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.setTitle(items.title || this.getTitle() || '');
		this.setComment(items.comment || this.getComment() || '');
		this.setWidth(items.width || this.getWidth() || 300);
		this.setHeight(items.height || this.getHeight() || 150);
		this.setDisplayOffsets();
		return this;
		};
	Scrawl3d.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		if(scrawl.xt(items.title)){this.setTitle(items.title);}
		if(scrawl.xt(items.comment)){this.setComment(items.comment);}
		if(scrawl.xt(items.width)){this.setWidth(items.width);}
		if(scrawl.xt(items.height)){this.setHeight(items.height);}
		return this;
		};
	Scrawl3d.prototype.setDelta = function(items){
		if(scrawl.xt(items.width)){this.setWidth(this.width+items.width);}
		if(scrawl.xt(items.height)){this.setHeight(this.height+items.height);}
		return this;
		};
	Scrawl3d.prototype.setDisplayOffsets = function(){
		this.displayOffsetX = 0;
		this.displayOffsetY = 0;
		var myDisplay = this.getElement();
		if(myDisplay.offsetParent){
			do{
				this.displayOffsetX += myDisplay.offsetLeft;
				this.displayOffsetY += myDisplay.offsetTop;
				} while (myDisplay = myDisplay.offsetParent);
			}
		return this;
		};
	Scrawl3d.prototype.getTitle = function(){
		var myDisplay = this.getElement();
		return myDisplay.title || false;
		};
	Scrawl3d.prototype.setTitle = function(item){
		this.title = (scrawl.xt(item)) ? item : this.title;
		var myDisplay = this.getElement();
		myDisplay.title = this.title;
		return this;
		};
	Scrawl3d.prototype.getComment = function(){
		var myDisplay = this.getElement();
		return myDisplay.getAttribute('data-comment') || false;
		};
	Scrawl3d.prototype.setComment = function(item){
		this.comment = (scrawl.xt(item)) ? item : this.comment;
		var myDisplay = this.getElement();
		myDisplay.setAttribute('data-comment',this.comment);
		return this;
		};
	Scrawl3d.prototype.getWidth = function(){
		var myDisplay = this.getElement();
		return myDisplay.width || myDisplay.clientWidth || parseFloat(myDisplay.style.width) || false;
		};
	Scrawl3d.prototype.setWidth = function(item){
		this.width = (scrawl.xt(item)) ? item : this.width;
		var myDisplay = this.getElement();
		myDisplay.width = (this.width*this.scale);
		return this;
		};
	Scrawl3d.prototype.getHeight = function(){
		var myDisplay = this.getElement();
		return myDisplay.height || myDisplay.clientHeight || parseFloat(myDisplay.style.height) || false;
		};
	Scrawl3d.prototype.setHeight = function(item){
		this.height = (scrawl.xt(item)) ? item : this.height;
		var myDisplay = this.getElement();
		myDisplay.height = (this.height*this.scale);
		return this;
		};
		
	function Pad(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.canvasElement)){
			scrawl.canvas['PadConstructorTemporaryCanvas'] = items.canvasElement;
			this.display = 'PadConstructorTemporaryCanvas';
			var tempname = '';
			if(scrawl.xto([items.canvasElement.id,items.canvasElement.name])){
				tempname = items.canvasElement.id || items.canvasElement.name;
				}
			(tempname.match(/_display$/)) ? Scrawl3d.call(this, {name: tempname.substr(0,tempname.length-8),}) : Scrawl3d.call(this, {name: tempname,});
			if(!items.canvasElement.id){items.canvasElement.id = tempname;}
			if(!scrawl.cellnames.contains(this.name)){
				this.cells = [];
				this.drawOrder = [];
				scrawl.pad[this.name] = this;
				scrawl.padnames.pushUnique(this.name);
				if(items.length > 1){
					this.set(items);
					}
				var myCell = new Cell({
					name: tempname,
					pad: this.name,
					canvas: items.canvasElement,
					});
				this.cells.pushUnique(myCell.name);
				this.display = myCell.name;
				delete scrawl.canvas.PadConstructorTemporaryCanvas;
				var baseCanvas = items.canvasElement.cloneNode(true);
				baseCanvas.setAttribute('id', this.name+'_base');
				var myCellBase = new Cell({
					name: this.name+'_base',
					pad: this.name,
					canvas: baseCanvas,
					});
				this.cells.pushUnique(myCellBase.name);
				this.base = myCellBase.name;
				this.current = myCellBase.name;
				this.initialize2d();
				return this;
				}
			}
		console.log('Failed to generate a Pad controller - no canvas element supplied'); 
		return false;
		}
	Pad.prototype = Object.create(Scrawl3d.prototype);
	Pad.prototype.type = 'Pad';
	Pad.prototype.classname = 'padnames';
	Pad.prototype.getElement = function(){
		return scrawl.canvas[this.display];
		};
	Pad.prototype.set = function(items){
		Scrawl3d.prototype.set.call(this, items);
		scrawl.cell[this.display].set(items);
		scrawl.cell[this.base].set(items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.setDrawOrder(items.drawOrder || []);
		if(scrawl.isa(items.scale,'num')){
			scrawl.cell[this.display].scale = items.scale;
			this.scale = items.scale;
			}
		return this;
		};
	Pad.prototype.setDrawOrder = function(order){
		this.drawOrder = (scrawl.xt(order)) ? [].concat(order) : [];
		return this;
		};
	Pad.prototype.getMouse = function(){
		if(!window.onmousemove){
			window.onmousemove = scrawl.handleMouseMove;
			}
		if(scrawl.mouseX.isBetween(this.displayOffsetX, this.displayOffsetX+(this.width*this.scale), true) && scrawl.mouseY.isBetween(this.displayOffsetY, this.displayOffsetY+(this.height*this.scale), true)){
			this.mouseX = (scrawl.mouseX - this.displayOffsetX) * (1/this.scale);
			this.mouseY = (scrawl.mouseY - this.displayOffsetY) * (1/this.scale);
			this.mouseOverPad = true;
			}
		else{
			this.mouseX = 0;
			this.mouseY = 0;
			this.mouseOverPad = false;
			}
		return {
			x: this.mouseX,
			y: this.mouseY,
			active: this.mouseOverPad,
			};
		};
	Pad.prototype.clear = function(command){
		var temp = [];
		if(scrawl.isa(command,'arr')){
			temp = command;
			}
		else{
			for(var i=0, z=this.cells.length; i<z; i++){
				temp.push(this.cells[i]);
				}
			switch(command){
				case 'all' : break;
				case 'display' : temp = [this.display]; break;
				case 'base' : temp = [this.base]; break;
				case 'non-base' : temp.removeItem(this.base); break;
				case 'current' : temp = [this.current]; break;
				case 'non-current' : temp.removeItem(this.current); break;
				case 'additionals' :
					temp.removeItem(this.display);
					temp.removeItem(this.base);
					break;
				case 'non-additionals' : temp = [this.display, this.base]; break;
				case 'none' : temp = []; break;
				default : temp.removeItem(this.display); break;
				}
			}
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].clear();
			}
		return this;
		};
	Pad.prototype.compile = function(command){
		var temp = [];
		if(scrawl.isa(command,'arr')){
			temp = command;
			}
		else{
			for(var i=0, z=this.cells.length; i<z; i++){
				temp.push(this.cells[i]);
				}
			switch(command){
				case 'all' : break;
				case 'display' : temp = [this.display]; break;
				case 'base' : temp = [this.base]; break;
				case 'non-base' : temp.removeItem(this.base); break;
				case 'current' : temp = [this.current]; break;
				case 'non-current' : temp.removeItem(this.current); break;
				case 'additionals' :
					temp.removeItem(this.display);
					temp.removeItem(this.base);
					break;
				case 'non-additionals' : temp = [this.display, this.base]; break;
				case 'none' : temp = []; break;
				default : temp.removeItem(this.display); break;
				}
			}
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].compile();
			}
		return this;
		};
	Pad.prototype.show = function(command){
		switch(command){
			case 'wipe-base' :
				scrawl.cell[this.base].clear();
				break;
			case 'wipe-both' :
				scrawl.cell[this.base].clear();
				scrawl.cell[this.display].clear();
				break;
			default :
				scrawl.cell[this.display].clear();
				break;
			}
		if(this.drawOrder.length > 0){
			for(var i=0, z=this.drawOrder.length; i<z; i++){
				scrawl.cell[this.base].copyCellToSelf(scrawl.cell[this.drawOrder[i]]);
				}
			}
		scrawl.cell[this.display].copyCellToSelf(scrawl.cell[this.base]);
		return this;
		};
	Pad.prototype.render = function(command){
		command = (scrawl.isa(command,'obj')) ? command : {};
		command.clear = (scrawl.xt(command.clear)) ? command.clear : null;
		command.compile = (scrawl.xt(command.compile)) ? command.compile : null;
		command.show = (scrawl.xt(command.show)) ? command.show : null;
		this.clear(command.clear);
		this.compile(command.compile);
		this.show(command.show);
		return this;
		};
	Pad.prototype.addNewCell = function(data){
		data = (scrawl.isa(data,'obj')) ? data : {};
		if(scrawl.xta([data.width,data.height]) && scrawl.isa(data.name,'str')){
			data.width = parseInt(data.width);
			data.height = parseInt(data.height);
			var myCanvas = document.createElement('canvas');
			myCanvas.setAttribute('id', data.name);
			myCanvas.setAttribute('height', data.height);
			myCanvas.setAttribute('width', data.width);
			data['pad'] = this.name;
			data['canvas'] = myCanvas;
			var myCell = new Cell(data);
			this.cells.pushUnique(myCell.name);
			return myCell;
			}
		return false;
		};
	Pad.prototype.addCells = function(items){
		items = [].concat(items);
		for(var i=0, z=items.length; i<z; i++){
			if(scrawl.cellnames.contains(items[i])){
				this.cells.push(items[i]);
				this.drawOrder.push(items[i]);
				}
			}
		return this;
		};
	Pad.prototype.deleteCell = function(cell){
		if(scrawl.isa(cell,'str')){
			this.cells.removeItem(cell);
			if(this.display === cell){this.display = false;}
			if(this.current === cell){this.current = false;}
			if(this.base === cell){this.base = false;}
			return this;
			}
		return false;
		};
	Pad.prototype.makeCurrent = function(){
		scrawl.currentPad = this.name;
		return this;
		};
	Pad.prototype.buildFields = function(){
		for(var i=0, z=this.cells.length; i<z; i++){
			scrawl.cell[this.cells[i]].buildField();
			}
		return this;
		};
		
	function Cell(items){
		if(scrawl.xta([items,items.canvas])){					//flag used by Pad constructor when calling Cell constructor
			SubScrawl.call(this, items);
			this.pad = items.pad || false;
			this.sourceX = items.sourceX || 0;
			this.sourceY = items.sourceY || 0;
			this.sourceWidth = items.sourceWidth || items.width || 0;
			this.sourceHeight = items.sourceHeight || items.height || 0;
			this.targetX = items.targetX || 0;
			this.targetY = items.targetY || 0;
			this.targetWidth = items.targetWidth || items.width || 0;
			this.targetHeight = items.targetHeight || items.height || 0;
			this.actualX = items.actualX || 0;
			this.actualY = items.actualY || 0;
			this.actualWidth = items.actualWidth || items.width || 0;
			this.actualHeight = items.actualHeight || items.height || 0;
			this.scaleX = (scrawl.isa(items.scaleX,'num')) ? items.scaleX : 1;
			this.scaleY = (scrawl.isa(items.scaleY,'num')) ? items.scaleY : 1;
			this.roll = items.roll || 0;
			this.rollDegree = (scrawl.isa(items.rollDegree,'bool')) ? items.rollDegree : true;
			this.cellX = items.cellX || 0;
			this.cellY = items.cellY || 0;
			this.shearX = items.shearX || 0;
			this.shearY = items.shearY || 0;
			this.backgroundColor = (scrawl.isa(items.backgroundColor,'str')) ? items.backgroundColor : 'rgba(0,0,0,0)';
			scrawl.canvas[this.name] = items.canvas;
			scrawl.context[this.name] = items.canvas.getContext('2d');
			scrawl.cell[this.name] = this;
			scrawl.cellnames.pushUnique(this.name);
			var myContext = new Context({name: this.name,});
			this.context = myContext.name;
			scrawl.ctx[this.context].getContextFromEngine(scrawl.context[this.name]);
			this.groups = (scrawl.xt(items.groups)) ? [].concat(items.groups) : [];
			new Group({
				name: this.name,
				cells: [this.name],
				});
			new Group({
				name: this.name+'_field',
				cells: [this.name],
				visibility: false,
				});
			if(items.field){
				scrawl.group[this.name+'_field'].sprites = [].concat(items.field);
				}
			new Group({
				name: this.name+'_fence',
				cells: [this.name],
				visibility: false,
				});
			if(items.fence){
				scrawl.group[this.name+'_fence'].sprites = [].concat(items.fence);
				}
			this.usePadDimensions = (scrawl.isa(items.usePadDimensions,'bool')) ? items.usePadDimensions : ((this.sourceWidth === 0 && this.sourceHeight === 0 && this.targetWidth === 0 && this.targetHeight === 0 && this.actualWidth === 0 && this.actualHeight === 0) ? true : false);
			this.setDimensions(items);
			if(this.scaleX !== 1 || this.scaleY !== 1 || this.shearX || this.shearY || this.cellX || this.cellY || this.roll){
				this.transformCell();
				}
			return this;
			}
		console.log('Cell constructor encountered an error: no canvas element supplied to it');
		return false;
		}
	Cell.prototype = Object.create(SubScrawl.prototype);
	Cell.prototype.type = 'Cell';
	Cell.prototype.classname = 'cellnames';
	Cell.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		scrawl.ctx[this.context].set(items);
		if(scrawl.xt(items)){
			if(scrawl.xto([items.width,items.height,items.actualWidth,items.actualHeight])){
				this.setDimensions(items);
				}
			if(scrawl.xto([items.cellY,items.roll,items.scaleX,items.scaleY,items.shearX,items.shearY,items.cellX])){
				this.transformCell();
				}
			}
		return this;
		};
	Cell.prototype.setDelta = function(items){
		if(scrawl.xt(items)){
			if(scrawl.xt(items.sourceX)){this.sourceX += items.sourceX;}
			if(scrawl.xt(items.sourceY)){this.sourceY += items.sourceY;}
			if(scrawl.xt(items.sourceWidth)){this.sourceWidth += items.sourceWidth;}
			if(scrawl.xt(items.sourceHeight)){this.sourceHeight += items.sourceHeight;}
			if(scrawl.xt(items.targetX)){this.targetX += items.targetX;}
			if(scrawl.xt(items.targetY)){this.targetY += items.targetY;}
			if(scrawl.xt(items.targetWidth)){this.targetWidth += items.targetWidth;}
			if(scrawl.xt(items.targetHeight)){this.targetHeight += items.targetHeight;}
			}
		return this;
		};
	Cell.prototype.getPadWidth = function(){
		return scrawl.pad[this.pad].getWidth();
		};
	Cell.prototype.getPadHeight = function(){
		return scrawl.pad[this.pad].getHeight();
		};
	Cell.prototype.buildField = function(){
		var fieldSprites, fenceSprites, tempsprite, tempfill, tempstroke;
		var buildFieldBlock = new Block({
			width: this.actualWidth,
			height: this.actualHeight,
			target: this.name,
			}).stamp();
		scrawl.deleteSprite(buildFieldBlock.name);
		fieldSprites = scrawl.group[this.name+'_field'].sprites;
		for(var i=0, z=fieldSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fieldSprites[i]];
			tempfill = scrawl.ctx[tempsprite.name].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.name].strokeStyle;
			scrawl.ctx[tempsprite.name].fillStyle = 'rgba(255,255,255,1)';
			scrawl.ctx[tempsprite.name].strokeStyle = 'rgba(255,255,255,1)';
			tempsprite.forceStamp({method: ((tempsprite.type === 'Shape' && !tempsprite.closed) ? 'draw' : 'fill'), cells: [this.name]});
			scrawl.ctx[tempsprite.name].fillStyle = tempfill;
			scrawl.ctx[tempsprite.name].strokeStyle = tempstroke;
			}
		fenceSprites = scrawl.group[this.name+'_fence'].sprites;
		for(var i=0, z=fenceSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fenceSprites[i]];
			tempfill = scrawl.ctx[tempsprite.name].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.name].strokeStyle;
			scrawl.ctx[tempsprite.name].fillStyle = 'rgba(0,0,0,1)';
			scrawl.ctx[tempsprite.name].strokeStyle = 'rgba(0,0,0,1)';
			tempsprite.forceStamp({method: ((tempsprite.type === 'Shape' && !tempsprite.closed) ? 'draw' : 'fill'), cells: [this.name]});
			scrawl.ctx[tempsprite.name].fillStyle = tempfill;
			scrawl.ctx[tempsprite.name].strokeStyle = tempstroke;
			}
		this.fieldLabel = this.getImageData({
			name: 'field',
			});
		return this;
		};
	Cell.prototype.checkFieldAt = function(items, y){
		if(scrawl.xt(items) && scrawl.imageData[this.fieldLabel]){
			var myX, myY, myCoord, myChannel, myTest;
			if(scrawl.isa(items,'str')){
				if(scrawl.spritenames.contains(items)){
					var mySprite = scrawl.sprite[items];
					myX = parseInt(mySprite.getStartX());
					myY = parseInt(mySprite.getStartY());
					myChannel = mySprite.fieldChannel || 'anycolor';
					myTest = mySprite.fieldTest || 0;
					}
				else{return false;}
				}
			else if(scrawl.isa(items,'num') && scrawl.xt(y)){
				myX = parseInt(items);
				myY = parseInt(y);
				myChannel = 'anycolor';
				myTest = 0;
				}
			else if(scrawl.xta([items.x,items.y])){
				myX = parseInt(items.x);
				myY = parseInt(items.y);
				myChannel = items.channel || 'anycolor';
				myTest = items.test || 0;
				}
			else{return false;}
			var d = scrawl.imageData[this.fieldLabel].data;
			if(myX > d.width || myY > d.height){
				return false;
				}
			myCoord = ((myY * this.actualWidth) + myX) * 4;
			switch(myChannel){
				case 'red' : if(d[myCoord] > myTest){return true;} return false; break;
				case 'green' : if(d[myCoord+1] > myTest){return true;} return false; break;
				case 'blue' : if(d[myCoord+2] > myTest){return true;} return false; break;
				case 'alpha' : if(d[myCoord+3] > myTest){return true;} return false; break;
				case 'anycolor' :
					if(d[myCoord] > myTest || d[myCoord+1] > myTest || d[myCoord+2] > myTest){
						return true;
						}
					return false;
					break;
				default :
					return false;
				}
			}
		return false;
		};
	Cell.prototype.setEngine = function(spriteContext, scale){
		if(scrawl.isa(spriteContext,'str')){
			spriteContext = scrawl.ctx[spriteContext];
			}
		var myContext = scrawl.ctx[this.context];
		var myScale = (scrawl.isa(scale,'num')) ? scale : 1;
		var changes = spriteContext.getChanges(myContext, myScale);
		var engine = scrawl.context[this.name];
		for(var item in changes){
			switch (item) {
				case 'name' :
					break;
				case 'fillStyle' :
					if(scrawl.xt(scrawl.dsn[changes[item]])){
						engine.fillStyle = scrawl.dsn[changes[item]];
						}
					else if(scrawl.isa(changes[item],'str')){
						engine.fillStyle = changes[item];
						}
					break;
				case 'strokeStyle' :
					if(scrawl.xt(scrawl.dsn[changes[item]])){
						engine.strokeStyle = scrawl.dsn[changes[item]];
						}
					else if(scrawl.isa(changes[item],'str')){
						engine.strokeStyle = changes[item];
						}
					break;
				case 'globalAlpha' : engine.globalAlpha = changes[item]; break;
				case 'globalCompositeOperation' : engine.globalCompositeOperation = changes[item]; break;
				case 'lineWidth' : engine.lineWidth = changes[item]; break;
				case 'lineCap' : engine.lineCap = changes[item]; break;
				case 'lineJoin' : engine.lineJoin = changes[item]; break;
				case 'miterLimit' : engine.miterLimit = changes[item]; break;
				case 'shadowOffsetX' : engine.shadowOffsetX = changes[item]; break;
				case 'shadowOffsetY' : engine.shadowOffsetY = changes[item]; break;
				case 'shadowBlur' : engine.shadowBlur = changes[item]; break;
				case 'shadowColor' : engine.shadowColor = changes[item]; break;
				case 'font' : engine.font = changes[item]; break;
				case 'textAlign' : engine.textAlign = changes[item]; break;
				case 'textBaseline' : engine.textBaseline = changes[item]; break;
				}
			if(item !== 'name'){
				myContext[item] = changes[item];
				}
			}
		return engine;
		};
	Cell.prototype.clear = function(){
		var ctx = scrawl.context[this.name];
		ctx.clearRect(this.actualX-this.cellX, this.actualY-this.cellY, this.actualWidth*this.scale, this.actualHeight*this.scale);
		return this;
		};
	Cell.prototype.compile = function(){
		if(this.backgroundColor !== 'rgba(0,0,0,0)'){
			var ctx = scrawl.context[this.name];
			var tempFillStyle = ctx.fillStyle;
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(this.actualX-this.cellX, this.actualY-this.cellY, this.actualWidth, this.actualHeight);
			ctx.fillStyle = tempFillStyle;
			}
		this.groups.sort(function(a,b){
			return scrawl.group[a].order - scrawl.group[b].order;
			});
		for(var i=0, z=this.groups.length; i<z; i++){
			if(scrawl.group[this.groups[i]].visibility){
				scrawl.group[this.groups[i]].stamp(false, this.name);
				}
			}
		return this;
		};
	Cell.prototype.copyCellToSelf = function(cell){
		if(scrawl.xt(cell)){
			var ctx = scrawl.context[this.name];
			var mySourceWidth = (cell.usePadDimensions) ? scrawl.pad[cell.pad].width : cell.sourceWidth;
			var mySourceHeight = (cell.usePadDimensions) ? scrawl.pad[cell.pad].height : cell.sourceHeight;
			var myTargetWidth = (cell.usePadDimensions) ? scrawl.pad[cell.pad].width*this.scale : cell.targetWidth*this.scale;
			var myTargetHeight = (cell.usePadDimensions) ? scrawl.pad[cell.pad].height*this.scale : cell.targetHeight*this.scale;
			ctx.drawImage(scrawl.canvas[cell.name], cell.sourceX, cell.sourceY, mySourceWidth, mySourceHeight, (cell.targetX-cell.handleX)*this.scale, (cell.targetY-cell.handleY)*this.scale, myTargetWidth, myTargetHeight);
			}
		return this;
		};
	Cell.prototype.clearShadow = function(){
		var engine = scrawl.context[this.name];
		var context = scrawl.ctx[this.context];
		engine.shadowOffsetX = 0.0;
		context.shadowOffsetX = 0.0;
		engine.shadowOffsetY = 0.0;
		context.shadowOffsetY = 0.0;
		engine.shadowBlur = 0.0;
		context.shadowBlur = 0.0;
		engine.shadowColor = 'rgba(0, 0, 0, 0)';
		context.shadowColor = 'rgba(0, 0, 0, 0)';
		return this;
		};
	Cell.prototype.setToClearShape = function(){
		var engine = scrawl.context[this.name];
		var context = scrawl.ctx[this.context];
		engine.fillStyle = 'rgba(0, 0, 0, 0)'
		context.fillStyle = 'rgba(0, 0, 0, 0)'
		engine.strokeStyle = 'rgba(0, 0, 0, 0)'
		context.strokeStyle = 'rgba(0, 0, 0, 0)'
		engine.shadowColor = 'rgba(0, 0, 0, 0)'
		context.shadowColor = 'rgba(0, 0, 0, 0)'
		return this;
		};
	Cell.prototype.setDimensions = function(items){
		var myWidth, myHeight;
		if(scrawl.xt(items) && !this.usePadDimensions){
			myWidth = items.width || items.actualWidth || this.actualWidth;
			myHeight = items.height || items.actualHeight || this.actualHeight;
			}
		else{
			myWidth = this.getPadWidth();
			myHeight = this.getPadHeight();
			}
		scrawl.canvas[this.name].width = myWidth;
		scrawl.canvas[this.name].height = myHeight;
		this.actualWidth = myWidth;
		this.actualHeight = myHeight;
		return this;
		};
	Cell.prototype.scaleCell = function(values){
		values = (scrawl.isa(values,'obj')) ? values : {};
		if(scrawl.isa(values.x,'num')){this.scaleX = values.x;}
		if(scrawl.isa(values.y,'num')){this.scaleY = values.y;}
		if(scrawl.isa(values.scaleX,'num')){this.scaleX = values.scaleX;}
		if(scrawl.isa(values.scaleY,'num')){this.scaleY = values.scaleY;}
		scrawl.context[this.name].scale(this.scaleX, this.scaleY);
		return this;
		};
	Cell.prototype.translateCell = function(values){
		values = (scrawl.isa(values,'obj')) ? values : {};
		if(scrawl.isa(values.x,'num')){this.cellX = values.x;}
		if(scrawl.isa(values.y,'num')){this.cellY = values.y;}
		if(scrawl.isa(values.cellX,'num')){this.cellX = values.cellX;}
		if(scrawl.isa(values.cellY,'num')){this.cellY = values.cellY;}
		scrawl.context[this.name].translate(this.cellX, this.cellY);
		return this;
		};
	Cell.prototype.rotateCell = function(values){
		values = (scrawl.isa(values,'obj')) ? values : {rot: values,};
		var myRotation;
		if(scrawl.isa(values.degrees,'num')){myRotation = values.degrees; this.rollDegree = true;}
		else if(scrawl.isa(values.radians,'num')){myRotation = values.radians; this.rollDegree = false;}
		else if(scrawl.isa(values.rot,'num')){myRotation = values.rot;}
		var deltaRotation = (this.rollDegree) ? (myRotation - this.roll) * scrawl.radian : myRotation - this.roll;
		scrawl.context[this.name].rotate(deltaRotation);
		this.roll = myRotation;
		return this;
		};
	Cell.prototype.resetRotation = function(){
		var deltaRotation = (this.rollDegree) ? this.roll * scrawl.radian : this.roll;
		scrawl.context[this.name].rotate(-deltaRotation);
		this.roll = 0;
		return this;
		};
	Cell.prototype.transformCell = function(items, rollFirst){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var myRollFirst = (scrawl.isa(rollFirst,'bool')) ? rollFirst : false;
		this.scaleX = items.scaleX || this.scaleX;
		this.scaleY = items.scaleY || this.scaleY;
		this.shearX = items.shearX || this.shearX;
		this.shearY = items.shearY || this.shearY;
		this.cellX = items.cellX || this.cellX;
		this.cellY = items.cellY || this.cellY;
		items['roll'] = items.roll || this.roll || 0;
		this.rollDegree = (scrawl.isa(items.rollDegree,'bool')) ? items.rollDegree : this.rollDegree;
		if(myRollFirst){
			this.rotateCell(items.roll);
			scrawl.context[this.name].setTransform(this.scaleX, this.shearX, this.shearY, this.scaleY, this.cellX, this.cellY);
			}
		else{
			scrawl.context[this.name].setTransform(this.scaleX, this.shearX, this.shearY, this.scaleY, this.cellX, this.cellY);
			this.rotateCell(items.roll);
			}
		return this;
		};
	Cell.prototype.saveContext = function(){
		scrawl.context[this.name].save();
		return this;
		};
	Cell.prototype.restoreContext = function(){
		scrawl.context[this.name].restore();
		return this;
		};
	Cell.prototype.getImageData = function(dimensions){
		var myLabel, myX, myY, myW, myH;
		dimensions = (scrawl.isa(dimensions,'obj')) ? dimensions : {};
		myX = (scrawl.isa(dimensions.x,'num')) ? dimensions.x : this.actualX;
		myY = (scrawl.isa(dimensions.y,'num')) ? dimensions.y : this.actualY;
		myW = (scrawl.isa(dimensions.width,'num')) ? dimensions.width : this.actualWidth;
		myH = (scrawl.isa(dimensions.height,'num')) ? dimensions.height : this.actualHeight;
		myLabel = (scrawl.isa(dimensions.name,'str')) ? this.name+'_'+dimensions.name : this.name+'_imageData';
		scrawl.imageData[myLabel] = scrawl.context[this.name].getImageData(myX, myY, myW, myH);
		return myLabel;
		};
	Cell.prototype.spliceCell = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(['horizontal','vertical','top','bottom','left','right'].contains(items.edge)){
			var myStrip, myRemains, myEdge, stripSlice, remainsSlice;
			var ctx = scrawl.context[this.name];
			switch(items.edge){
				case 'horizontal' :
					myStrip = myRemains = this.actualWidth/2;
					myEdge = 'left';
					break;
				case 'vertical' :
					myStrip = myRemains = this.actualHeight/2;
					myEdge = 'top';
					break;
				case 'top' :
				case 'bottom' :
					myStrip = items.strip || 20;
					myRemains = this.actualHeight - myStrip;
					myEdge = items.edge;
					break;
				case 'left' :
				case 'right' :
					myStrip = items.strip || 20;
					myRemains = this.actualWidth - myStrip;
					myEdge = items.edge;
					break;
				}
			switch(myEdge){
				case 'top' :
					stripSlice = ctx.getImageData(0,0,this.actualWidth,myStrip);
					remainsSlice = ctx.getImageData(0,myStrip,this.actualWidth,myRemains);
					ctx.clearRect(0,0,this.actualWidth,this.actualHeight);
					ctx.putImageData(remainsSlice,0,0);
					ctx.putImageData(stripSlice,0,myRemains);
					break;
				case 'bottom' :
					remainsSlice = ctx.getImageData(0,0,this.actualWidth,myRemains);
					stripSlice = ctx.getImageData(0,myRemains,this.actualWidth,myStrip);
					ctx.clearRect(0,0,this.actualWidth,this.actualHeight);
					ctx.putImageData(stripSlice,0,0);
					ctx.putImageData(remainsSlice,0,myStrip);
					break;
				case 'left' :
					stripSlice = ctx.getImageData(0,0,myStrip,this.actualHeight);
					remainsSlice = ctx.getImageData(myStrip,0,myRemains,this.actualHeight);
					ctx.clearRect(0,0,this.actualWidth,this.actualHeight);
					ctx.putImageData(remainsSlice,0,0);
					ctx.putImageData(stripSlice,myRemains,0);
					break;
				case 'right' :
					remainsSlice = ctx.getImageData(0,0,myRemains,this.actualHeight);
					stripSlice = ctx.getImageData(myRemains,0,myStrip,this.actualHeight);
					ctx.clearRect(0,0,this.actualWidth,this.actualHeight);
					ctx.putImageData(stripSlice,0,0);
					ctx.putImageData(remainsSlice,myStrip,0);
					break;
				}
			}
		return this;
		};
		
	function Context(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.fillStyle = (scrawl.isa(items.fillStyle,'str')) ? items.fillStyle : '#000000';
		this.strokeStyle = (scrawl.isa(items.strokeStyle,'str')) ? items.strokeStyle : '#000000';
		this.globalAlpha = (scrawl.isa(items.globalAlpha,'num')) ? items.globalAlpha : 1;
		this.globalCompositeOperation = (scrawl.isa(items.globalCompositeOperation,'str')) ? items.globalCompositeOperation : 'source-over';
		this.lineWidth = (scrawl.isa(items.lineWidth,'num')) ? items.lineWidth : 1;
		this.lineCap = (scrawl.isa(items.lineCap,'str')) ? items.lineCap : 'butt';
		this.lineJoin = (scrawl.isa(items.lineJoin,'str')) ? items.lineJoin : 'miter';
		this.miterLimit = (scrawl.isa(items.miterLimit,'num')) ? items.miterLimit : 10;
		this.shadowOffsetX = items.shadowOffsetX || 0;
		this.shadowOffsetY = items.shadowOffsetY || 0;
		this.shadowBlur = items.shadowBlur || 0;
		this.shadowColor = (scrawl.isa(items.shadowColor,'str')) ? items.shadowColor : 'rgba(0,0,0,0)';
		this.font = (scrawl.isa(items.font,'str')) ? items.font : '10pt sans-serif';
		this.textAlign = (scrawl.isa(items.textAlign,'str')) ? items.textAlign : 'start';
		this.textBaseline = (scrawl.isa(items.textBaseline,'str')) ? items.textBaseline : 'alphabetic';
		scrawl.ctx[this.name] = this;
		scrawl.ctxnames.pushUnique(this.name);
		return this;
		}
	Context.prototype = Object.create(Scrawl.prototype);
	Context.prototype.type = 'Context';
	Context.prototype.classname = 'ctxnames';
	Context.prototype.getContextFromEngine = function(ctx){
		var defaults = ['fillStyle', 'strokeStyle', 'globalAlpha', 'globalCompositeOperation', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor', 'font', 'textAlign', 'textBaseline'];
		for(var i=0, z=defaults.length; i<z; i++){
			this[defaults[i]] = ctx[defaults[i]];
			}
		return this;
		};
	Context.prototype.getChanges = function(ctx, scale){
		var r = {};
		for(var item in this){
			if(['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'].contains(item)){
				if(this[item]*scale !== ctx[item]){
					r[item] = this[item]*scale;
					}
				}
			else{
				if(this[item] !== ctx[item]){
					r[item] = this[item];
					}
				}
			}
		return r;
		};
	Context.prototype.swapStyles = function(){
		var temp = this.fillStyle; this.fillStyle = this.strokeStyle; this.strokeStyle = temp;
		};
	
	function ScrawlImage(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.width = items.width || 0;
		this.height = items.height || 0;
		if(scrawl.xt(items.imageData)){						//flag used by scrawl.addScrawlImage() when calling Image constructor
			var c = document.createElement('img');
			c.id = this.name;
			c.width = this.width;
			c.height = this.height;
			c.src = items.imageData;
			items['element'] = c;
			}
		this.source = items.source || false;
		if(scrawl.xt(items.element)){						//flag used by scrawl.getImagesByClass() when calling Image constructor
			var myName = items.element.getAttribute('id') || items.element.getAttribute('name') || items.element.getAttribute('src');
			this.name = scrawl.makeName({name: myName, type: this.type, target: 'imagenames'});
			this.width = parseFloat(items.element.offsetWidth);
			this.height = parseFloat(items.element.offsetHeight);
			this.source = items.element.src;
			}
		this.copyX = items.copyX || 0;
		this.copyY = items.copyY || 0;
		this.copyWidth = items.copyWidth || this.width || 0;
		this.copyHeight = items.copyHeight || this.height || 0;
		scrawl.img[this.name] = items.element;
		scrawl.image[this.name] = this;
		scrawl.imagenames.pushUnique(this.name);
		return this;
		}
	ScrawlImage.prototype = Object.create(Scrawl.prototype);
	ScrawlImage.prototype.type = 'Image';
	ScrawlImage.prototype.classname = 'imagenames';
	ScrawlImage.prototype.getImageData = function(){
		var c = document.createElement('canvas');
		c.width = this.width;
		c.height = this.height;
		var cx = c.getContext('2d');
		cx.drawImage(scrawl.img[this.name],0,0);
		return c.toDataURL();
		};
	ScrawlImage.prototype.getObjectData = function(){
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			imageData: this.getImageData(), 
			timestamp: Date.now()
			};
		};

	function AnimSheet(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.sheet = items.sheet || items.source || false;
		this.frames = (scrawl.xt(items.frames)) ? [].concat(items.frames) : [];
		this.currentFrame = items.currentFrame || 0;
		this.speed = (scrawl.isa(items.speed,'num')) ? items.speed : 1;
		this.loop = (scrawl.isa(items.loop,'str')) ? items.loop : 'end';
		this.running = (scrawl.isa(items.running,'str')) ? items.running : 'complete';
		this.lastCalled = (scrawl.xt(items.lastCalled)) ? items.lastCalled : Date.now();
		scrawl.anim[this.name] = this;
		scrawl.animnames.pushUnique(this.name);
		return this;
		}
	AnimSheet.prototype = Object.create(Scrawl.prototype);
	AnimSheet.prototype.type = 'AnimSheet';
	AnimSheet.prototype.classname = 'animnames';
	AnimSheet.prototype.set = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var paused = (this.loop === 'pause') ? true : false;
		Scrawl.prototype.set.call(this, items);
		if(scrawl.xt(items.running)){
			switch(items.running){
				case 'forward' :
					this.running = 'forward';
					if(!paused){
						this.currentFrame = 0;
						}
					break;
				case 'backward' :
					this.running = 'backward';
					if(!paused){
						this.currentFrame = this.frames.length - 1;
						}
					break;
				default :
					this.running = 'complete';
					this.currentFrame = 0;
					break;
				}
			}
		};
	AnimSheet.prototype.getData = function(){
		if(this.speed > 0){
			var interval = this.frames[this.currentFrame].d/this.speed;
			var changeFrame = (this.lastCalled + interval < Date.now()) ? true : false;
			switch(this.running){
				case 'complete' :
					this.lastCalled = Date.now();
					break;
				case 'forward' :
					if(changeFrame){
						switch(this.loop){
							case 'pause' :
								break;
							case 'end' :
								this.running = (this.currentFrame + 1 >= this.frames.length) ? 'complete' : this.running;
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
								break;
							case 'loop' :
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? 0 : this.currentFrame + 1;
								break;
							case 'reverse' :
								this.running = (this.currentFrame + 1 >= this.frames.length) ? 'backward' : 'forward';
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
								break;
							}
						this.lastCalled = Date.now();
						}
					break;
				case 'backward' :
					if(changeFrame){
						switch(this.loop){
							case 'pause' :
								break;
							case 'end' :
								this.running = (this.currentFrame - 1 <= 0) ? 'complete' : this.running;
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
								break;
							case 'loop' :
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.frames.length - 1 : this.currentFrame - 1;
								break;
							case 'reverse' :
								this.running = (this.currentFrame - 1 <= 0) ? 'forward' : 'backward';
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
								break;
							}
						this.lastCalled = Date.now();
						}
					break;
				}
			}
		return {
			copyX: this.frames[this.currentFrame].x,
			copyY: this.frames[this.currentFrame].y,
			copyWidth: this.frames[this.currentFrame].w,
			copyHeight: this.frames[this.currentFrame].h,
			};
		};

	function Group(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.sprites = (scrawl.xt(items.sprites)) ? [].concat(items.sprites) : [];
		this.cells = (scrawl.xt(items.cells)) ? [].concat(items.cells) : [];
		this.order = items.order || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.method = items.method || false;
		scrawl.group[this.name] = this;
		scrawl.groupnames.pushUnique(this.name);
		if(this.cells.length === 0){
			this.cells.push(scrawl.pad[scrawl.currentPad].base);
			}
		for(var i=0, z=this.cells.length; i<z; i++){
			scrawl.cell[this.cells[i]].groups.pushUnique(this.name);
			}
		return this;
		}
	Group.prototype = Object.create(SubScrawl.prototype);
	Group.prototype.type = 'Group';
	Group.prototype.classname = 'groupnames';
	Group.prototype.setHandles = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		items.x = items.x || 'center';
		items.y = items.y || 'center';
		var myXRange, myYRange;
		if(!scrawl.isa(items.x,'number')){
			myXRange = this.getSpriteRange('X');
			}
		if(!scrawl.isa(items.y,'number')){
			myYRange = this.getSpriteRange('Y');
			}
		switch(items.x){
			case 'left' : this.handleX = myXRange.minimum; break;
			case 'center' : this.handleX = myXRange.minimum + ((myXRange.maximum - myXRange.minimum)/2); break;
			case 'right' : this.handleX = myXRange.maximum; break;
			default : this.handleX = items.x || 0;
			}
		switch(items.y){
			case 'top' : this.handleY = myYRange.minimum; break;
			case 'center' : this.handleY = myYRange.minimum + ((myYRange.maximum - myYRange.minimum)/2); break;
			case 'bottom' : this.handleY = myYRange.maximum; break;
			default : this.handleY = items.y || 0;
			}
		return this;
		};
	Group.prototype.getSpriteRange = function(item){
		var max = -9999, min = 9999, tmax, tmin, temp;
		var suffix = (['X','Y','x','y'].contains(item)) ? item : false;
		if(suffix){
			var direction = (['X','x'].contains(suffix)) ? 'width' : 'height';
			suffix = 'start' + suffix.toUpperCase();
			for(var i=0, z=this.sprites.length; i<z; i++){
				temp = scrawl.sprite[this.sprites[i]];
				if(!temp.pivot){
					switch(temp.type){
						case 'Block' :
						case 'Picture' :
						case 'Phrase' :
							tmax = temp[suffix] + (temp[direction] * temp.scale);
							tmin = temp[suffix];
							break;
						case 'Wheel' :
							tmax = temp[suffix] - (temp.radius * temp.scale);
							tmin = temp[suffix] + (temp.radius * temp.scale);
							break;
						case 'Shape' :
							var shaperad = temp.getRadius(true);
							tmax = temp[suffix] - shaperad;
							tmin = temp[suffix] + shaperad;
							break;
						default :
							tmax = temp[suffix];
							tmin = temp[suffix];
						}
					max = (tmax > max) ? tmax : max;
					min = (tmin < min) ? tmin : min;
					}
				}
			return {minimum: min, maximum: max};
			}
		return false;
		};
	Group.prototype.sortSprites = function(){
		this.sprites.sort(function(a,b){
			return scrawl.sprite[a].order - scrawl.sprite[b].order;
			});
		};
	Group.prototype.stamp = function(method, cell){
		this.sortSprites();
		var myMethod = (scrawl.isa(method,'str')) ? method : this.method;
		var myCell = (scrawl.xt(cell)) ? [].concat(cell) : this.cells;
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(scrawl.sprite[this.sprites[i]].pivot !== this.name){
				scrawl.sprite[this.sprites[i]].stamp({
					x: this.getStartX(),
					y: this.getStartY(),
					method: myMethod,
					cells: myCell,
					});
				}
			else{
				scrawl.sprite[this.sprites[i]].stamp({
					x: 0,
					y: 0,
					method: myMethod,
					cells: myCell,
					});
				}
			}
		return this;
		};
	Group.prototype.getSpriteAt = function(items){
		this.sortSprites();
		for(var i=this.sprites.length-1; i>=0; i--){
			if(scrawl.sprite[this.sprites[i]].checkHit(items, {x: this.getStartX(), y: this.getStartY()})){
				return scrawl.sprite[this.sprites[i]];
				}
			}
		return false;
		};
	Group.prototype.getInGroupSpriteHits = function(){
		var hits = [], pts = [], flag;
		var override = {x: this.getStartX(), y: this.getStartY()};
		for(var p=0, z=this.sprites.length; p<z; p++){
			if(scrawl.sprite[this.sprites[p]].visibility){
				pts[p] = scrawl.sprite[this.sprites[p]].getCollisionPoints(override);
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(scrawl.sprite[this.sprites[i]].visibility){
				for(var j=i+1, w=this.sprites.length; j<w; j++){
					if(scrawl.sprite[this.sprites[j]].visibility){
						flag = false;
						for(var k=0, v=k<pts[i].length; k<v; k++){
							if(scrawl.sprite[this.sprites[j]].checkHit(pts[i][k], override)){
								hits.push([this.sprites[i],this.sprites[j]]);
								flag = true;
								break;
								}
							}
						if(!flag){
							for(var k=0, v=pts[j].length; k<v; k++){
								if(scrawl.sprite[this.sprites[i]].checkHit(pts[j][k], override)){
									hits.push([this.sprites[i],this.sprites[j]]);
									break;
									}
								}
							}
						}
					}
				}
			}
		return hits;
		};
	Group.prototype.getBetweenGroupSpriteHits = function(groupItem){
		var hits = [], herePoints = [], therePoints = [], flag;
		groupItem = (scrawl.isa(groupItem,'str')) ? scrawl.group[groupItem] : groupItem;
		var thisOverride = {x: this.getStartX(), y: this.getStartY()};
		var thatOverride = {x: groupItem.getStartX(), y: groupItem.getStartY()};
		for(var p=0, z=this.sprites.length; p<z; p++){
			if(scrawl.sprite[this.sprites[p]].visibility){
				herePoints[p] = scrawl.sprite[this.sprites[p]].getCollisionPoints(thisOverride);
				}
			}
		for(var p=0, z=groupItem.sprites.length; p<z; p++){
			if(scrawl.sprite[groupItem.sprites[p]].visibility){
				therePoints[p] = scrawl.sprite[groupItem.sprites[p]].getCollisionPoints(thatOverride);
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(scrawl.sprite[this.sprites[i]].visibility){
				for(var j=0, w=groupItem.sprites.length; j<w; j++){
					if(scrawl.sprite[groupItem.sprites[j]].visibility){
						flag = false;
						for(var k=0, v=herePoints[i].length; k<v; k++){
							if(scrawl.sprite[groupItem.sprites[j]].checkHit(herePoints[i][k], thatOverride)){
								hits.push([this.sprites[i],groupItem.sprites[j]]);
								flag = true;
								break;
								}
							}
						if(!flag){
							for(var k=0, v=therePoints[j].length; k<v; k++){
								if(scrawl.sprite[this.sprites[i]].checkHit(therePoints[j][k], thisOverride)){
									hits.push([this.sprites[i],groupItem.sprites[j]]);
									break;
									}
								}
							}
						}
					}
				}
			}
		return hits;
		};
	Group.prototype.getFieldSpriteHits = function(cells){
		var hits = [], pts = [], flag;
		var override = {x: this.getStartX(), y: this.getStartY()};
		for(var p=0, z=this.sprites.length; p<z; p++){
			if(scrawl.sprite[this.sprites[p]].visibility){
				pts[p] = scrawl.sprite[this.sprites[p]].getCollisionPoints(override);
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(scrawl.sprite[this.sprites[i]].visibility){
				for(var k=0, w=pts[i].length; k<w; k++){
					pts[i][k]['cells'] = cells;
					if(!scrawl.sprite[this.sprites[i]].checkField(pts[i][k], override)){
						hits.push([this.sprites[i], pts[i][k]]);
						break;
						}
					}
				}
			}
		return hits;
		};
	Group.prototype.checkField = function(cell){
		var result;
		var myCell = (scrawl.xt(cell) && scrawl.cellnames.contains(cell)) ? cell : (this.cells[0] || scrawl.pad[scrawl.currentPad].current);
		return scrawl.cell[myCell].checkFieldAt(this.startX, this.startY);
		};
	Group.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.startX)){this.startX += items.startX;}
		if(scrawl.xt(items.startY)){this.startY += items.startY;}
		if(scrawl.xt(items.handleX)){this.handleX += items.handleX;}
		if(scrawl.xt(items.handleY)){this.handleY += items.handleY;}
		if(scrawl.xt(items.pathPosition)){this.pathPosition += items.pathPosition;}
		return this;
		};
	Group.prototype.addSpritesToGroup = function(item){
		item = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=item.length; i<z; i++){
			if(scrawl.spritenames.contains(item[i])){
				this.sprites.pushUnique(item[i]);
				}
			}
		return this;
		};
	Group.prototype.removeSpritesFromGroup = function(item){
		item = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=item.length; i<z; i++){
			this.sprites.removeItem(item[i]);
			}
		return this;
		};
		
	function Sprite(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.order = items.order || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.method = (scrawl.isa(items.method,'str')) ? items.method : ((this.type === 'Shape' ) ? 'draw' : 'fill');
		this.collisionPoints = this.parseCollisionPoints(items.collisionPoints || ['start']);
		this.rollable = (scrawl.isa(items.rollable,'bool')) ? items.rollable : true;
		this.roll = items.roll || 0;
		this.degree = (scrawl.isa(items.degree,'bool')) ? items.degree : true;
		var myContext = new Context(items);
		this.context = myContext.name;
		this.group = this.getGroup(items);
		if(items.field){
			this.addSpriteToCellFields(items.target || items.group);
			}
		if(items.fence){
			this.addSpriteToCellFences(items.target || items.group);
			}
		this.fieldChannel = (scrawl.isa(items.fieldChannel,'str')) ? items.fieldChannel : 'anycolor';
		this.fieldTest = items.fieldTest || 0;
		if(this.path){
			}
		return this;
		}
	Sprite.prototype = Object.create(SubScrawl.prototype);
	Sprite.prototype.type = 'Sprite';
	Sprite.prototype.classname = 'spritenames';
	Sprite.prototype.pickupSprite = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.x,items.y])){
			this.order += 9999;
			this.handleX = items.x - (this.startX - this.handleX);
			this.handleY = items.y - (this.startY - this.handleY);
			this.pivot = 'mouse';
			}
		return this;
		};
	Sprite.prototype.dropSprite = function(item){
		if(this.order >= 9999){
			this.order -= 9999;
			this.pivot = item || null;
			}
		return this;
		};
	Sprite.prototype.addSpriteToCellFields = function(cells){
		var cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_field'].sprites.push(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.addSpriteToCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_fence'].sprites.push(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.removeSpriteFromCellFields = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_field'].sprites.removeItem(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.removeSpriteFromCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_fence'].sprites.removeItem(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		scrawl.ctx[this.context].set(items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.collisionPoints)){this.collisionPoints = this.parseCollisionPoints(items.collisionPoints);}
		if(scrawl.xt(items.field)){this.addSpriteToCellFields();}
		if(scrawl.xt(items.fence)){this.addSpriteToCellFences();}
		if(scrawl.xto([items.group,items.target])){
			scrawl.group[this.group].sprites.removeItem(this.name);
			this.group = this.getGroup(items);
			scrawl.group[this.group].sprites.pushUnique(this.name);
			}
		return this;
		};
	Sprite.prototype.get = function(item){
		if(['globalAlpha','globalCompositeOperation','lineWidth','lineCap','lineJoin','miterLimit','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','font','textAlign','textBaseline'].contains(item)){
			return scrawl.ctx[this.context].get(item);
			}
		else{
			return this[item];
			}
		};
	Sprite.prototype.parseCollisionPoints = function(items){
		var myItems = (scrawl.xt(items)) ? [].concat(items) : this.collisionPoints;
		var p = [];
		for(var i=0, z=myItems.length; i<z; i++){
			switch(myItems[i]) {
				case 'all' :
					p.pushUnique('N'); p.pushUnique('NE'); p.pushUnique('E'); p.pushUnique('SE'); p.pushUnique('S');
					p.pushUnique('SW'); p.pushUnique('W'); p.pushUnique('NW'); p.pushUnique('start'); p.pushUnique('center');
					break;
				case 'corners' :
					p.pushUnique('NE'); p.pushUnique('SE'); p.pushUnique('SW'); p.pushUnique('NW');
					break;
				case 'edges' :
					p.pushUnique('N'); p.pushUnique('E'); p.pushUnique('S'); p.pushUnique('W');
					break;
				case 'perimeter' :
					p.pushUnique('N'); p.pushUnique('NE'); p.pushUnique('E'); p.pushUnique('SE');
					p.pushUnique('S'); p.pushUnique('SW'); p.pushUnique('W'); p.pushUnique('NW');
					break;
				case 'north' : p.pushUnique('N'); break;
				case 'northeast' : p.pushUnique('NE'); break;
				case 'east' : p.pushUnique('E'); break;
				case 'southeast' : p.pushUnique('SE'); break;
				case 'south' : p.pushUnique('S'); break;
				case 'southwest' : p.pushUnique('SW'); break;
				case 'west' : p.pushUnique('W'); break;
				case 'northwest' : p.pushUnique('NW'); break;
				default : p.pushUnique(myItems[i]);
				}
			}
		return p;
		};
	Sprite.prototype.addCollisionPoints = function(item){
		var myPoints = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=myPoints.length; i<z; i++){
			if(scrawl.pointnames.contains(myPoints[i])){
				this.collisionPoints.pushUnique(myPoints[i]);
				}
			}
		return this;
		};
	Sprite.prototype.removeCollisionPoints = function(item){
		var myPoints = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=myPoints.length; i<z; i++){
			this.collisionPoints.removeItem(myPoints[i]);
			if(scrawl.pointnames.contains(myPoints[i])){
				delete scrawl.point[myPoints[i]];
				scrawl.pointnames.removeItem(myPoints[i]);
				}
			}
		return this;
		};
	Sprite.prototype.clone = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var a = Scrawl.prototype.clone.call(this, items);
		delete scrawl.ctx[a.name];
		scrawl.ctxnames.removeItem(a.name);
		items['name'] = a.name;
		scrawl.ctx[this.context].clone(items);
		if(items.field){
			a.addSpriteToCellFields();
			}
		if(items.fence){
			a.addSpriteToCellFences();
			}
		if(items.group||items.target){
			scrawl.group[this.group].sprites.removeItem(a.name);
			a.group = this.getGroup(items);
			scrawl.group[a.group].sprites.pushUnique(a.name);
			}
		return a;
		};
	Sprite.prototype.swap = function(){
		scrawl.ctx[this.context].swapStyles();
		return this;
		};
	Sprite.prototype.getGroup = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.target) && scrawl.groupnames.contains(items.target)){return items.target;}
		else if(scrawl.xt(items.group) && scrawl.groupnames.contains(items.group)){return items.group;}
		else{return scrawl.pad[scrawl.currentPad].current;}
		};
	Sprite.prototype.forceStamp = function(item){				//override object is only generated by group objects
		var temp = this.visibility;
		this.visibility = true;
		this.stamp(item);
		this.visibility = temp;
		return this;
		};
	Sprite.prototype.stamp = function(item){					//override object is only generated by group objects
		if(this.visibility){
			var ctx, engine, myCell, myMethod;
			var override = {};
			if(scrawl.xt(item)){
				if(['clear','draw','fill','drawFill','fillDraw','sinkInto','floatOver','clip','none'].contains(item)){
					override = {
						x: 0,
						y: 0,
						method: item,
						cells: scrawl.group[this.group].cells,
						};
					}
				else{
					override = {
						x: item.x || 0,
						y: item.y || 0,
						method: item.method || false,
						cells: item.cells || scrawl.group[this.group].cells,
						};
					}
				}
			else{
				override = {
					x: 0,
					y: 0,
					method: false,
					cells: scrawl.group[this.group].cells,
					};
				}
			myMethod = override.method || this.method;
			for(var i=0, z=override.cells.length; i<z; i++){
				ctx = scrawl.cell[override.cells[i]];
				ctx.setEngine(this.context, this.scale);
				engine = scrawl.context[ctx.name];
				myCell = scrawl.cell[override.cells[i]].name;
				var here;
				if(this.pivot){
					if(scrawl.pointnames.contains(this.pivot)){
						this.startX = scrawl.point[this.pivot].currentX;
						this.startY = scrawl.point[this.pivot].currentY;
						}
					else if(scrawl.spritenames.contains(this.pivot)){
						this.startX = scrawl.sprite[this.pivot].startX;
						this.startY = scrawl.sprite[this.pivot].startY;
						}
					else if(this.pivot === 'mouse'){
						here = scrawl.pad[scrawl.cell[override.cells[i]].pad].getMouse();
						if(here.active){
							this.startX = here.x;
							this.startY = here.y;
							}
						}
					else if(scrawl.groupnames.contains(this.pivot)){
						this.startX = scrawl.group[this.pivot].startX;
						this.startY = scrawl.group[this.pivot].startY;
						}
					}
				else if(scrawl.spritenames.contains(this.path) && scrawl.sprite[this.path].type === 'Shape'){
					here = scrawl.sprite[this.path].getPerimeterPosition(this.pathPosition, this.pathSpeedConstant, this.addPathRoll);
					this.startX = here.x;
					this.startY = here.y;
					this.pathRoll = here.r || 0;
					}
				switch(myMethod){
					case 'clear' : this.clear(engine, myCell, override); break;
					case 'draw' : this.draw(engine, myCell, override); break;
					case 'fill' : this.fill(engine, myCell, override); break;
					case 'drawFill' : this.drawFill(engine, myCell, override); break;
					case 'fillDraw' : this.fillDraw(engine, myCell, override); break;
					case 'sinkInto' : this.sinkInto(engine, myCell, override); break;
					case 'floatOver' : this.floatOver(engine, myCell, override); break;
					case 'clip' : this.clip(engine, myCell, override); break;
					case 'none' : this.none(engine, myCell, override); break;
					}
				}
			}
		return this;
		};
	Sprite.prototype.rotateCell = function(ctx, cell){
		if(scrawl.xta([ctx,cell]) && (this.rollable || this.addPathRoll)){
			if(this.roll !== scrawl.cell[cell].roll || this.roll + this.pathRoll !== scrawl.cell[cell].roll){
				var deltaRotation;
				if(this.addPathRoll){
					deltaRotation = (this.degree) ? ((this.roll + this.pathRoll) - scrawl.cell[cell].roll) * scrawl.radian : (this.roll + (this.pathRoll/scrawl.radian)) - scrawl.cell[cell].roll;
					}
				else{
					deltaRotation = (this.degree) ? (this.roll - scrawl.cell[cell].roll) * scrawl.radian : this.roll - scrawl.cell[cell].roll;
					}
				var deltaX = this.startX - scrawl.cell[cell].cellX;
				var deltaY = this.startY - scrawl.cell[cell].cellY;
				ctx.translate(deltaX, deltaY);
				ctx.rotate(deltaRotation);
				ctx.translate(-deltaX, -deltaY);
				}
			}
		return this;
		};
	Sprite.prototype.unrotateCell = function(ctx, cell){
		if(scrawl.xta([ctx,cell]) && (this.rollable || this.addPathRoll)){
			if(this.roll !== scrawl.cell[cell].roll || this.roll + this.pathRoll !== scrawl.cell[cell].roll){
				var deltaRotation;
				if(this.addPathRoll){
					deltaRotation = (this.degree) ? (scrawl.cell[cell].roll - (this.roll + this.pathRoll)) * scrawl.radian : scrawl.cell[cell].roll - (this.roll + (this.pathRoll/scrawl.radian));
					}
				else{
					deltaRotation = (this.degree) ? (scrawl.cell[cell].roll - this.roll) * scrawl.radian : scrawl.cell[cell].roll - this.roll;
					}
				var deltaX = this.startX - scrawl.cell[cell].cellX;
				var deltaY = this.startY - scrawl.cell[cell].cellY;
				ctx.translate(deltaX, deltaY);
				ctx.rotate(deltaRotation);
				ctx.translate(-deltaX, -deltaY);
				}
			}
		return this;
		};
	Sprite.prototype.clear = function(ctx, cell, override){return this;};			//not tested for any sprite objects
	Sprite.prototype.draw = function(ctx, cell, override){return this;};
	Sprite.prototype.fill = function(ctx, cell, override){return this;};
	Sprite.prototype.drawFill = function(ctx, cell, override){return this;};
	Sprite.prototype.fillDraw = function(ctx, cell, override){return this;};
	Sprite.prototype.sinkInto = function(ctx, cell, override){return this;};
	Sprite.prototype.floatOver = function(ctx, cell, override){return this;};
	Sprite.prototype.clip = function(ctx, cell, override){return this;};			//not tested for any sprite objects
	Sprite.prototype.none = function(ctx, cell, override){return this;};
	Sprite.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.startX)){this.startX += items.startX;}
		if(scrawl.xt(items.startY)){this.startY += items.startY;}
		if(scrawl.xt(items.handleX)){this.handleX += items.handleX;}
		if(scrawl.xt(items.handleY)){this.handleY += items.handleY;}
		if(scrawl.xt(items.width)){this.width += items.width;}
		if(scrawl.xt(items.height)){this.height += items.height;}
		if(scrawl.xt(items.radius)){this.radius += items.radius;}
		if(scrawl.xt(items.scale)){this.scale += items.scale;}
		if(scrawl.xt(items.roll)){this.roll += items.roll;}
		if(scrawl.xt(items.startAngle)){this.startAngle += items.startAngle;}
		if(scrawl.xt(items.endAngle)){this.endAngle += items.endAngle;}
		if(scrawl.xt(items.copyX)){this.copyX += items.copyX;}
		if(scrawl.xt(items.copyY)){this.copyY += items.copyY;}
		if(scrawl.xt(items.copyWidth)){this.copyWidth += items.copyWidth;}
		if(scrawl.xt(items.copyHeight)){this.copyHeight += items.copyHeight;}
		if(scrawl.xt(items.pathPosition)){this.pathPosition += items.pathPosition;}
		return this;
		};
	Sprite.prototype.getAngle = function(v){
		if(this.addPathRoll){
			return (this.degree) ? (v+this.roll+this.pathRoll) * scrawl.radian : v+this.roll+(this.pathroll/scrawl.radian);
			}
		else{
			return (this.degree) ? (v+this.roll) * scrawl.radian : v+this.roll;
			}
		};
	Sprite.prototype.checkField = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var myX, myY, myCell, myChannel, myTest;
		var myCell = (scrawl.xt(items.cell) && scrawl.cellnames.contains(items.cell)) ? items.cell : (scrawl.group[this.group].cells[0] || scrawl.pad[scrawl.currentPad].current);
		myX = items.x || this.startX;
		myY = items.y || this.startY;
		myChannel = items.channel || this.fieldChannel;
		myTest = items.test || this.fieldTest;
		return scrawl.cell[myCell].checkFieldAt({x: myX, y: myY, test: myTest, channel: myChannel});
		};
	Sprite.prototype.clearShadow = function(ctx, cell){
		if(scrawl.ctx[this.context].shadowOffsetX + scrawl.ctx[this.context].shadowOffsetY > 0){
			scrawl.cell[cell].clearShadow();
			}
		};
	Sprite.prototype.getObjectData = function(){
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			context: scrawl.ctx[this.context].getObjectData(), 
			timestamp: Date.now()
			};
		};
		
	function Phrase(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.text = items.text || '';
		this.style = items.style || 'normal';
		this.variant = items.variant || 'normal';
		this.weight = items.weight || 'normal';
		this.size = items.size || 12;
		this.metrics = items.metrics || 'pt';
		this.family = items.family || 'sans-serif';
		this.checkFont(items.font);
		this.getMetrics();
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].sprites.pushUnique(this.name);
		return this;
		}
	Phrase.prototype = Object.create(Sprite.prototype);
	Phrase.prototype.type = 'Phrase';
	Phrase.prototype.classname = 'spritenames';
	Phrase.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.checkFont(items.font);
		return this;
		};
	Phrase.prototype.checkFont = function(item){
		if(scrawl.xt(item)){
			this.deconstructFont();
			}
		this.constructFont();
		return this;
		};
	Phrase.prototype.deconstructFont = function(){
		var myFont = scrawl.ctx[this.context].font;
		var res;
		if(/italic/i.test(myFont)) {this.style = 'italic';}
		else if(/oblique/i.test(myFont)) {this.style = 'oblique';}
		else{this.style = 'normal';}
		if(/small-caps/i.test(myFont)) {this.variant = 'small-caps';}
		else{this.variant = 'normal';}
		if(/bold/i.test(myFont)) {this.weight = 'bold';}
		else if(/bolder/i.test(myFont)) {this.weight = 'bolder';}
		else if(/lighter/i.test(myFont)) {this.weight = 'lighter';}
		else if(/([1-9]00)/i.test(myFont)) {
			res = myFont.match(/([1-9]00)/i);
			this.weight = res[1];
			}
		else{this.weight = 'normal';}
		if(/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex)?/i.test(myFont)) {
			res = myFont.match(/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex|px)?/i);
			this.size = parseFloat(res[1]);
			this.metrics = res[2];
			}
		else if(/xx-small/i.test(myFont)) {this.size = 3; this.metrics = 'pt';}
		else if(/x-small/i.test(myFont)) {this.size = 6; this.metrics = 'pt';}
		else if(/small/i.test(myFont)) {this.size = 9; this.metrics = 'pt';}
		else if(/medium/i.test(myFont)) {this.size = 12; this.metrics = 'pt';}
		else if(/large/i.test(myFont)) {this.size = 15; this.metrics = 'pt';}
		else if(/x-large/i.test(myFont)) {this.size = 18; this.metrics = 'pt';}
		else if(/xx-large/i.test(myFont)) {this.size = 21; this.metrics = 'pt';}
		else{this.size = 12; this.metrics = 'pt';}
		var myFamily = '', myFontArray = myFont.split(' ');
		var exclude = [100, 200, 300, 400, 500, 600, 700, 800, 900, 'italic', 'oblique', 'small-caps', 'bold', 'bolder', 'lighter', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
		for(var i=0, z=myFontArray.length; i<z; i++){
			if(!exclude.contains(myFontArray[i])){
				if(!myFontArray[i].match(/[^\/](\d)+(%|in|cm|mm|em|ex|pt|pc|ex)?/i)){
					myFamily += myFontArray[i]+' ';
					}
				}
			}
		if(!myFamily){myFamily = 'Verdana, Geneva, sans-serif';}
		this.family = myFamily;
		return this;
		};
	Phrase.prototype.constructFont = function(){
		var myFont = '';
		if(this.style !== 'normal'){myFont += this.style+' ';}
		if(this.variant !== 'normal'){myFont += this.variant+' ';}
		if(this.weight !== 'normal'){myFont += this.weight+' ';}
		myFont += (this.size * this.scale) + this.metrics + ' ';
		myFont += this.family;
		scrawl.ctx[this.context].font = myFont;
		return this;
		};
	Phrase.prototype.clear = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillText(this.text, this.getStartX(override), this.getStartY(override));
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.draw = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.strokeText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.fill = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.fillText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.drawFill = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.strokeText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.clearShadow(ctx, cell);
		ctx.fillText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.fillDraw = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.fillText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.clearShadow(ctx, cell);
		ctx.strokeText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.sinkInto = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.fillText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		ctx.strokeText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.floatOver = function(ctx, cell, override){
		this.constructFont();
		this.rotateCell(ctx, cell);
		ctx.strokeText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		ctx.fillText(this.text, this.getStartX(override)+0.5, this.getStartY(override)+0.5);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Phrase.prototype.clip = function(ctx, cell, override){
		this.constructFont();
		ctx.save();
		ctx.rect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		ctx.clip();
		return this;
		};
	Phrase.prototype.getMetrics = function(cellname){
		var myContext = (scrawl.xt(cellname)) ? scrawl.context[cellname] : scrawl.context[scrawl.pad[scrawl.currentPad].current];
		var myEngine = scrawl.ctx[this.context];
		var tempFont = myContext.font;
		var tempBaseline = myContext.textBaseline;
		var tempAlign = myContext.textAlign;
		myContext.font = myEngine.font;
		myContext.textBaseline = myEngine.textBaseline;
		myContext.textAlign = myEngine.textAlign;
		this.width = myContext.measureText(this.text).width * this.scale;
		this.height = this.size * this.scale;
		myContext.font = tempFont;
		myContext.textBaseline = tempBaseline;
		myContext.textAlign = tempAlign;
		return this;
		};
	Phrase.prototype.checkHit = function(items, override){
		if(scrawl.xta([items.x,items.y])){
			var d = this.getCorners(override);
			if(items.x.isBetween(d.topLeftX, d.bottomRightX, true) && items.y.isBetween(d.topLeftY, d.bottomRightY, true)){
				return true;
				}
			}
		return false;
		};
	Phrase.prototype.getCorners = function(override){
		this.getMetrics();
		var myContext = scrawl.ctx[this.context];
		var tlx, tly, brx, bry;
		switch(myContext.textBaseline){
			case 'top' :
				tly = this.getStartY(override);
				bry = this.getStartY(override) + (this.height * 1.5);
				break;
			case 'hanging' :
				tly = this.getStartY(override) - (this.height * 0.2);
				bry = this.getStartY(override) + (this.height * 1.3);
				break;
			case 'middle' :
				tly = this.getStartY(override) - (this.height * 0.75);
				bry = this.getStartY(override) + (this.height * 0.75);
				break;
			case 'bottom' :
				tly = this.getStartY(override) - (this.height * 1.5);
				bry = this.getStartY(override);
				break;
			default :					//alphabetic, ideographic
				tly = this.getStartY(override) - (this.height * 1.2);
				bry = this.getStartY(override) + (this.height * 0.3);
			}
		switch(myContext.textAlign){
			case 'end' :
			case 'right' :
				tlx = this.getStartX(override) - this.width;
				brx = this.getStartX(override);
				break;
			case 'center' :
				tlx = this.getStartX(override) - (this.width/2);
				brx = this.getStartX(override) + (this.width/2)
				break;
			default :					//start, left
				tlx = this.getStartX(override);
				brx = this.getStartX(override) + this.width;
			}
		return {topLeftX: tlx, topLeftY: tly, bottomRightX: brx, bottomRightY: bry};
		};
	Phrase.prototype.getCollisionPoints = function(override){
		var c = [], n;
		var d = this.getCorners(override);
		var hW = this.width/2;
		var hH = this.height/2;
		for(var i=0, z=this.collisionPoints.length; i<z; i++){
			switch(this.collisionPoints[i]) {
				case 'start' : c.push({x: parseInt(this.startX), y: parseInt(this.startY)}); break;
				case 'center' : c.push({x: parseInt(d.topLeftX+hW), y: parseInt(d.topLeftY+hH)}); break;
				case 'N' : c.push({x: parseInt(d.topLeftX+hW), y: parseInt(d.topLeftY)}); break;
				case 'NE' : c.push({x: parseInt(d.bottomRightX), y: parseInt(d.topLeftY)}); break;
				case 'E' : c.push({x: parseInt(d.bottomRightX), y: parseInt(d.topLeftY+hH)}); break;
				case 'SE' : c.push({x: parseInt(d.bottomRightX), y: parseInt(d.bottomRightY)}); break;
				case 'S' : c.push({x: parseInt(d.topLeftX+hW), y: parseInt(d.bottomRightY)}); break;
				case 'SW' : c.push({x: parseInt(d.topLeftX), y: parseInt(d.bottomRightY)}); break;
				case 'W' : c.push({x: parseInt(d.topLeftX), y: parseInt(d.topLeftY+hH)}); break;
				case 'NW' : c.push({x: parseInt(d.topLeftX), y: parseInt(d.topLeftY)}); break;
				default :
					if(scrawl.pointnames.contains(this.collisionPoints[i])){
						n = scrawl.point[this.collisionPoints[i]];
						c.push({x: parseInt(n.currentX), y: parseInt(n.currentY)});
						}
					break;
				}
			}
		return c;
		};
		
	function Block(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.width = items.width || 0;
		this.height = items.height || 0;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].sprites.pushUnique(this.name);
		return this;
		}
	Block.prototype = Object.create(Sprite.prototype);
	Block.prototype.type = 'Block';
	Block.prototype.classname = 'spritenames';
	Block.prototype.clip = function(ctx, cell, override){
		ctx.save();
		this.rotateCell(ctx, cell);
		ctx.rect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		ctx.clip();
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.clear = function(ctx, cell, override){
		scrawl.cell[cell].setToClearShape();
		this.rotateCell(ctx, cell);
		ctx.clearRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.draw = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.fill = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.fillRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.drawFill = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.clearShadow(ctx, cell);
		ctx.fillRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.fillDraw = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.fillRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.clearShadow(ctx, cell);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.sinkInto = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.fillRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.floatOver = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		ctx.fillRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Block.prototype.checkHit = function(items, override){
		if(scrawl.xta([items.x,items.y])){
			if(items.x.isBetween(this.getStartX(override), this.getStartX(override)+this.getWidth(override)-1, true)){
				if(items.y.isBetween(this.getStartY(override), this.getStartY(override)+this.getHeight(override)-1, true)){
					return true;
					}
				}
			}
		return false;
		};
	Block.prototype.getEndX = function(override){
		return this.getStartX(override) + this.getWidth();
		};
	Block.prototype.getEndY = function(override){
		return this.getStartY(override) + this.getHeight();
		};
	Block.prototype.getWidth = function(){
		return this.width*this.scale;
		};
	Block.prototype.getHeight = function(){
		return this.height*this.scale;
		};
	Block.prototype.getCollisionPoints = function(override){
		var c = [], n;
		var sX = this.getStartX(override);
		var sY = this.getStartY(override);
		var eX = this.getEndX(override);
		var eY = this.getEndY(override);
		var hW = this.getWidth(override)/2;
		var hH = this.getHeight(override)/2;
		for(var i=0, z=this.collisionPoints.length; i<z; i++){
			switch(this.collisionPoints[i]) {
				case 'start' : c.push({x: parseInt(this.startX), y: parseInt(this.startY)}); break;
				case 'center' : c.push({x: parseInt(sX+hW), y: parseInt(sY+hH)}); break;
				case 'N' : c.push({x: parseInt(sX+hW), y: parseInt(sY)}); break;
				case 'NE' : c.push({x: parseInt(eX), y: parseInt(sY)}); break;
				case 'E' : c.push({x: parseInt(eX), y: parseInt(sY+hH)}); break;
				case 'SE' : c.push({x: parseInt(eX), y: parseInt(eY)}); break;
				case 'S' : c.push({x: parseInt(sX+hW), y: parseInt(eY)}); break;
				case 'SW' : c.push({x: parseInt(sX), y: parseInt(eY)}); break;
				case 'W' : c.push({x: parseInt(sX), y: parseInt(sY+hH)}); break;
				case 'NW' : c.push({x: parseInt(sX), y: parseInt(sY)}); break;
				default :
					if(scrawl.pointnames.contains(this.collisionPoints[i])){
						n = scrawl.point[this.collisionPoints[i]];
						c.push({x: parseInt(n.currentX), y: parseInt(n.currentY)});
						}
					break;
				}
			}
		return c;
		};

	function Wheel(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.radius = items.radius || 0;
		this.startAngle = items.startAngle || 0;
		this.endAngle = (scrawl.isa(items.endAngle,'num')) ? items.endAngle : 360;
		this.clockwise = (scrawl.isa(items.clockwise,'bool')) ? items.clockwise : false;
		this.closed = (scrawl.isa(items.closed,'bool')) ? items.closed : true;
		this.includeCenter = (scrawl.isa(items.includeCenter,'bool')) ? items.includeCenter : false;
		this.checkHitUsingRadius = (scrawl.isa(items.checkHitUsingRadius,'bool')) ? items.checkHitUsingRadius : true;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].sprites.pushUnique(this.name);
		return this;
		}
	Wheel.prototype = Object.create(Sprite.prototype);
	Wheel.prototype.type = 'Wheel';
	Wheel.prototype.classname = 'spritenames';
	Wheel.prototype.getCollisionPoints = function(override){
		var c = [], n;
		var cX = this.getStartX(override);
		var cY = this.getStartY(override);
		var r = this.radius*this.scale;
		var r2 = r*0.707;
		for(var i=0, z=this.collisionPoints.length; i<z; i++){
			switch(this.collisionPoints[i]) { 
				case 'start' : c.push({x: parseInt(this.startX), y: parseInt(this.startY)}); break;
				case 'center' : c.push({x: parseInt(cX), y: parseInt(cY)}); break;
				case 'N' : c.push({x: parseInt(cX), y: parseInt(cY-r)}); break;
				case 'NE' : c.push({x: parseInt(cX+r2), y: parseInt(cY-r2)}); break;
				case 'E' : c.push({x: parseInt(cX+r), y: parseInt(cY)}); break;
				case 'SE' : c.push({x: parseInt(cX+r2), y: parseInt(cY+r2)}); break;
				case 'S' : c.push({x: parseInt(cX), y: parseInt(cY+r)}); break;
				case 'SW' : c.push({x: parseInt(cX-r2), y: parseInt(cY+r2)}); break;
				case 'W' : c.push({x: parseInt(cX-r), y: parseInt(cY)}); break;
				case 'NW' : c.push({x: parseInt(cX-r2), y: parseInt(cY-r2)}); break;
				default :
					if(scrawl.pointnames.contains(this.collisionPoints[i])){
						n = scrawl.point[this.collisionPoints[i]];
						c.push({x: n.currentX, y: n.currentY});
						}
					break;
				}
			}
		return c;
		};
	Wheel.prototype.buildPath = function(ctx, override){
		ctx.beginPath();
		ctx.arc(this.getStartX(override), this.getStartY(override), (this.radius*this.scale), this.getAngle(this.startAngle), this.getAngle(this.endAngle), this.clockwise);
		if(this.includeCenter){ctx.lineTo(this.getStartX(override), this.getStartY(override));}
		if(this.closed){ctx.closePath();}
		return this;
		};
	Wheel.prototype.clip = function(ctx, cell, override){
		ctx.save();
		this.buildPath(ctx, override);
		ctx.clip();
		return this;
		};
	Wheel.prototype.clear = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.stroke();
		ctx.fill();
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		return this;
		};
	Wheel.prototype.draw = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.stroke();
		return this;
		};
	Wheel.prototype.fill = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.fill();
		return this;
		};
	Wheel.prototype.drawFill = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.stroke();
		if(scrawl.ctx[this.context].shadowOffsetX + scrawl.ctx[this.context].shadowOffsetY > 0){
			scrawl.cell[cell].clearShadow();
			}
		ctx.fill();
		return this;
		};
	Wheel.prototype.fillDraw = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.fill();
		if(scrawl.ctx[this.context].shadowOffsetX + scrawl.ctx[this.context].shadowOffsetY > 0){
			scrawl.cell[cell].clearShadow();
			}
		ctx.stroke();
		return this;
		};
	Wheel.prototype.sinkInto = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.fill();
		ctx.stroke();
		return this;
		};
	Wheel.prototype.floatOver = function(ctx, cell, override){
		this.buildPath(ctx, override);
		ctx.stroke();
		ctx.fill();
		return this;
		};
	Wheel.prototype.checkHit = function(items, override){
		if(scrawl.xta([items.x,items.y])){
			if(this.checkHitUsingRadius){
				var test = items.test || 0;
				var thisX = this.getStartX(override);
				var thisY = this.getStartY(override);
				var myRadius = (test) ? test : this.radius*this.scale;
				var xSquare = (items.x-thisX)*(items.x-thisX);
				var ySquare = (items.y-thisY)*(items.y-thisY);
				var distance = Math.sqrt(xSquare+ySquare);
				return (distance <= myRadius) ? true : false;
				}
			else{
				var ctx = scrawl.context[scrawl.cell[scrawl.group[this.group].cells[0]].name];
				this.buildPath(ctx, override);
				return ctx.isPointInPath(items.x, items.y);
				}
			}
		return false;
		};

	function Picture(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.source = items.source || false;
		this.imageData = items.imageData || false;
		this.imageDataChannel = items.imageDataChannel || 'alpha';
		this.animSheet = items.animSheet || false;
		this.imageType = this.sourceImage(items.source) || false;
		this.checkHitUsingImageData = (scrawl.isa(items.checkHitUsingImageData,'bool')) ? items.checkHitUsingImageData : false;
		if(this.source){
			if(this.imageType === 'img'){
				this.width = items.width || scrawl.image[this.source].copyWidth;
				this.height = items.height || scrawl.image[this.source].copyHeight;
				this.copyX = items.copyX || scrawl.image[this.source].copyX;
				this.copyY = items.copyY || scrawl.image[this.source].copyY;
				this.copyWidth = items.copyWidth || scrawl.image[this.source].copyWidth;
				this.copyHeight = items.copyHeight || scrawl.image[this.source].copyHeight;
				}
			else if(this.imageType === 'canvas'){
				this.width = items.width || scrawl.cell[this.source].sourceWidth;
				this.height = items.height || scrawl.cell[this.source].sourceHeight;
				this.copyX = items.copyX || scrawl.cell[this.source].sourceX;
				this.copyY = items.copyY || scrawl.cell[this.source].sourceY;
				this.copyWidth = items.copyWidth || scrawl.cell[this.source].sourceWidth;
				this.copyHeight = items.copyHeight || scrawl.cell[this.source].sourceHeight;
				}
			else if(this.imageType === 'animation'){
				var myData = scrawl.anim[this.animSheet].getData();
				this.width = items.width || myData.copyWidth;
				this.height = items.height || myData.copyHeight;
				this.copyX = items.copyX || myData.copyX;
				this.copyY = items.copyY || myData.copyY;
				this.copyWidth = items.copyWidth || myData.copyWidth;
				this.copyHeight = items.copyHeight || myData.copyHeight;
				}
			}
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].sprites.pushUnique(this.name);
		return this;
		}
	Picture.prototype = Object.create(Sprite.prototype);
	Picture.prototype.type = 'Picture';
	Picture.prototype.classname = 'spritenames';
	Picture.prototype.clone = function(items){
		var a = Sprite.prototype.clone.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(!items.keepCopyDimensions){
			a.fitToImageSize();
			}
		return a;
		};
	Picture.prototype.fitToImageSize = function(){
		if(this.imageType === 'img'){
			this.copyWidth = scrawl.image[this.source].copyWidth;
			this.copyHeight = scrawl.image[this.source].copyHeight;
			this.copyX = scrawl.image[this.source].copyX;
			this.copyY = scrawl.image[this.source].copyY;
			}
		return this;
		};
	Picture.prototype.sourceImage = function(){
		if(this.animSheet && scrawl.imagenames.contains(this.source)){return 'animation';}
		if(scrawl.imagenames.contains(this.source)){return 'img';}
		if(scrawl.cellnames.contains(this.source)){return 'canvas';}
		return false;
		};
	Picture.prototype.clip = function(ctx, cell, override){
		ctx.save();
		this.rotateCell(ctx, cell);
		ctx.rect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		ctx.clip();
		this.unrotateCell(ctx, cell);
		return this;
		};
	Picture.prototype.clear = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.clearRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Picture.prototype.draw = function(ctx, cell, override){
		this.rotateCell(ctx, cell);
		ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
		this.unrotateCell(ctx, cell);
		return this;
		};
	Picture.prototype.fill = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.unrotateCell(ctx, cell);
			}
		return this;
		};
	Picture.prototype.drawFill = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell);
			ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.clearShadow(ctx, cell);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.unrotateCell(ctx, cell);
			}
		return this;
		};
	Picture.prototype.fillDraw = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.clearShadow(ctx, cell);
			ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.unrotateCell(ctx, cell);
			}
		return this;
		};
	Picture.prototype.sinkInto = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.unrotateCell(ctx, cell);
			}
		return this;
		};
	Picture.prototype.floatOver = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell);
			ctx.strokeRect(this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, this.getStartX(override), this.getStartY(override), this.width*this.scale, this.height*this.scale);
			this.unrotateCell(ctx, cell);
			}
		return this;
		};
	Picture.prototype.getImageData = function(){
		var myCanvas, myImage;
		if(this.imageType === 'animation' && scrawl.image[this.source]){
			myImage = scrawl.image[this.source];
			myCanvas = scrawl.addNewCell({
				name: this.name,
				height: myImage.height,
				width: myImage.width,
				});
			scrawl.context[myCanvas.name].drawImage(scrawl.img[this.source], 0, 0);
			}
		else{
			myCanvas = scrawl.addNewCell({
				name: this.name,
				height: this.copyHeight,
				width: this.copyWidth,
				});
			scrawl.context[myCanvas.name].drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, 0, 0, this.copyWidth, this.copyHeight);
			}
		this.imageData = myCanvas.getImageData({
			name: 'data',
			});
		scrawl.deleteCells([myCanvas.name]);
		return this;
		};
	Picture.prototype.getImageDataValue = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.isa(items.x,'num') && scrawl.isa(items.y,'num')){
			var myX = parseInt(((items.x-this.getStartX(override))/this.scale)*(this.copyWidth/this.width));
			var myY = parseInt(((items.y-this.getStartY(override))/this.scale)*(this.copyHeight/this.height));
			var myChannel = items.channel || this.imageDataChannel;
			return scrawl.getImageDataValue({
				table: this.imageData,
				x: myX,
				y: myY,
				channel: myChannel,
				});
			}
		return false;
		};
	Picture.prototype.getImage = function(){
		if(this.imageType === 'animation'){
			var myData = scrawl.anim[this.animSheet].getData();
			this.copyX = myData.copyX;
			this.copyY = myData.copyY;
			this.copyWidth = myData.copyWidth;
			this.copyHeight = myData.copyHeight;
			return scrawl.img[this.source];
			}
		else{
			return scrawl[this.imageType][this.source];
			}
		};
	Picture.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		if(scrawl.xto([items.sheet,items.frames,items.currentFrame,items.speed,items.loop,items.running,items.lastCalled])){
			scrawl.anim[this.animSheet].set(items);
			}
		return this;
		};
	Picture.prototype.get = function(item){
		if(['sheet','frames','currentFrame','speed','loop','running','lastCalled'].contains(item)){
			return scrawl.anim[this.animSheet].get(item);
			}
		else{
			return Sprite.prototype.get.call(this, item);
			}
		};
	Picture.prototype.checkHit = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.x,items.y])){
			if(items.x.isBetween(this.getStartX(override), this.getStartX(override)+this.getWidth(override)-1, true)){
				if(items.y.isBetween(this.getStartY(override), this.getStartY(override)+this.getHeight(override)-1, true)){
					if(this.checkHitUsingImageData){
						if(this.imageData && scrawl.imageData[this.imageData]){
							var d = scrawl.imageData[this.imageData]
							var test = (scrawl.isa(items.test,'num')) ? items.test : 200;
							var myX, myY;
							if(this.imageType === 'animation'){
								myX = parseInt((((items.x-this.getStartX(override))/this.scale)*(this.copyWidth/this.width))+this.copyX);
								myY = parseInt((((items.y-this.getStartY(override))/this.scale)*(this.copyHeight/this.height))+this.copyY);
								}
							else{
								myX = parseInt(((items.x-this.getStartX(override))/this.scale)*(this.copyWidth/this.width));
								myY = parseInt(((items.y-this.getStartY(override))/this.scale)*(this.copyHeight/this.height));
								}
							if(myY.isBetween(-1, d.height)){ 
								if(myX.isBetween(-1, d.width)){ 
									var myEl = ((myY * d.width) + myX) * 4;
									var myChannel;
									switch(items.channel || this.imageDataChannel){
										case 'red' : myChannel = 0; break;
										case 'blue' : myChannel = 1; break;
										case 'green' : myChannel = 2; break;
										case 'alpha' : myChannel = 3; break;
										}
									return (d.data[myEl+myChannel] > test) ? true : false;
									}
								}
							return false;
							}
						}
					return true;
					}
				}
			}
		return false;
		};
	Picture.prototype.getEndX = function(override){
		return this.getStartX(override) + this.getWidth();
		};
	Picture.prototype.getEndY = function(override){
		return this.getStartY(override) + this.getHeight();
		};
	Picture.prototype.getWidth = function(){
		return this.width*this.scale;
		};
	Picture.prototype.getHeight = function(){
		return this.height*this.scale;
		};
	Picture.prototype.getCollisionPoints = function(override){
		return Block.prototype.getCollisionPoints.call(this, override);
		};
	Picture.prototype.getObjectData = function(){
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			context: scrawl.ctx[this.context].getObjectData(), 
			image: scrawl.image[this.source].getObjectData(), 
			timestamp: Date.now()
			};
		};
		
	function Shape(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.firstPoint = items.firstPoint || false;
		this.collisionPoints = this.parseCollisionPoints(items.collisionPoints || ['start']);
		this.checkHitUsingRadius = (scrawl.isa(items.checkHitUsingRadius,'bool')) ? items.checkHitUsingRadius : false;
		this.closed = (scrawl.isa(items.closed,'bool')) ? items.closed : true;
		this.radius = false;
		this.linkList = [];
		this.linkDurations = [];
		this.pointList = [];
		this.perimeterLength = false;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].sprites.pushUnique(this.name);
		return this;
		}
	Shape.prototype = Object.create(Sprite.prototype);
	Shape.prototype.type = 'Shape';
	Shape.prototype.classname = 'spritenames';
	Shape.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
//		this.radius = 0;
		if(this.linkDurations.length > 0 || this.perimeterLength){
			this.buildPositions();
			}
		return this;
		};
	Shape.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
//		this.radius = 0;
		if(this.linkDurations.length > 0 || this.perimeterLength){
			this.buildPositions();
			}
		return this;
		};
	Shape.prototype.parseCollisionPoints = function(items){
		var p = Sprite.prototype.parseCollisionPoints.call(this, items);
		if(this.firstPoint){
			if(p.contains('endpoints')){
				p.removeItem('endpoints');
				var nextLink = scrawl.link[scrawl.point[this.firstPoint].startLink];
				while(nextLink.action && ['move','add'].contains(nextLink.action)){
					if(nextLink.endPoint){
						p.pushUnique(nextLink.endPoint);
						nextLink = scrawl.link[scrawl.point[nextLink.endPoint].startLink];
						}
					else{break;}
					}
				}
			}
		return p;
		};
	Shape.prototype.getCollisionPoints = function(override){
		return Wheel.prototype.getCollisionPoints.call(this, override);
		};
	Shape.prototype.prepareShape = function(ctx, override){
		if(this.firstPoint){
			var myPoint = scrawl.point[this.firstPoint].getData(override);
			ctx.beginPath();
			ctx.moveTo(myPoint.currentX, myPoint.currentY);
			return scrawl.link[myPoint.startLink].sketch(ctx, override);
			}
		return false;
		};
	Shape.prototype.clip = function(ctx, cell, override){
		if(this.closed){
			this.prepareShape(ctx, override);
			ctx.clip();
			}
		return this;
		};
	Shape.prototype.clear = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fill();
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		return this;
		};
	Shape.prototype.fill = function(ctx, cell, override){
		if(this.closed){
			this.prepareShape(ctx, override);
			ctx.fill();
			}
		return this;
		};
	Shape.prototype.draw = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		ctx.stroke();
		return this;
		};
	Shape.prototype.drawFill = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		ctx.stroke();
		if(this.closed){
			scrawl.cell[cell].clearShadow();
			ctx.fill();
			}
		return this;
		};
	Shape.prototype.fillDraw = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		if(this.closed){
			ctx.fill();
			scrawl.cell[cell].clearShadow();
			}
		ctx.stroke();
		return this;
		};
	Shape.prototype.sinkInto = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		if(this.closed){
			ctx.fill();
			}
		ctx.stroke();
		return this;
		};
	Shape.prototype.floatOver = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		ctx.stroke();
		if(this.closed){
			ctx.fill();
			}
		return this;
		};
	Shape.prototype.none = function(ctx, cell, override){
		this.prepareShape(ctx, override);
		return this;
		};
	Shape.prototype.setStartTo = function(items, yDelta){
		items = (scrawl.xt(items)) ? items : {};
		var myX, myY;
		if(scrawl.xt(yDelta)){
			myX = items;
			myY = yDelta;
			}
		else if(scrawl.xta([items.x,items.y])){
			myX = items.x;
			myY = items.y;
			}
		if(myX && myY){
			var myPointList = [this.firstPoint];
			var myData = scrawl.point[this.firstPoint].getData();
			var nextLink = scrawl.link[myData.startLink];
			while(nextLink.action && ['move','add'].contains(nextLink.action)){
				if(nextLink.controlPoint1){myPointList.push(nextLink.controlPoint1);}
				if(nextLink.controlPoint2){myPointList.push(nextLink.controlPoint2);}
				if(nextLink.endPoint){
					myPointList.push(nextLink.endPoint);
					nextLink = scrawl.link[scrawl.point[nextLink.endPoint].startLink];
					}
				else{break;}
				}
			this.startX = myX;
			this.startY = myY;
			for(var i=0, z=myPointList.length; i<z; i++){
				if(myPointList[i]){
					scrawl.point[myPointList[i]].setPolar();
					}
				}
			}
		return this;
		};
	Shape.prototype.checkHit = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.x,items.y])){
			if(this.checkHitUsingRadius){
				var test = items.test || 0;
				var thisX = this.getStartX(override);
				var thisY = this.getStartY(override);
				var myRadius = (test) ? test : ((this.radius) ? this.radius : this.getRadius(true));
				var xSquare = (items.x-thisX)*(items.x-thisX);
				var ySquare = (items.y-thisY)*(items.y-thisY);
				var distance = Math.sqrt(xSquare+ySquare);
				return (distance <= myRadius) ? true : false;
				}
			else{
				var ctx = scrawl.context[scrawl.cell[scrawl.group[this.group].cells[0]].name];
				this.prepareShape(ctx, override);
				return ctx.isPointInPath(items.x, items.y);
				}
			}
		return false;
		};
	Shape.prototype.getRadius = function(scaled){
		var check = 0;
		var myPointList = [this.firstPoint];
		check = (!scrawl.point[this.firstPoint].fixed) ? scrawl.point[this.firstPoint].distance : 0;
		var nextLink = scrawl.link[scrawl.point[this.firstPoint].startLink];
		while(nextLink.action && ['move','add'].contains(nextLink.action)){
			if(nextLink.endPoint){
				check = (scrawl.point[nextLink.endPoint].distance > check) ? scrawl.point[nextLink.endPoint].distance : check;
				nextLink = scrawl.link[scrawl.point[nextLink.endPoint].startLink];
				}
			else{break;}
			}
		this.radius = (scaled) ? check*this.scale : check;
		return this.radius;
		};
	Shape.prototype.getPerimeterLength = function(force){
		if(force || !this.perimeterLength || this.linkDurations.length === 0){
			this.buildPositions();
			}
		return this.perimeterLength;
		};
	Shape.prototype.buildPositions = function(){
		for(var i=0, z=this.linkList.length; i<z; i++){
			scrawl.link[this.linkList[i]].setPositions();
			}
		this.linkDurations = [];
		var cumLen = 0, len, myLink;
		for(var i=0, z=this.linkList.length; i<z; i++){
			myLink = scrawl.link[this.linkList[i]];
			len = myLink.positions[myLink.precision].cumulativeLength;
			cumLen += len;
			this.linkDurations.push(cumLen);
			}
		this.perimeterLength = cumLen;
		for(var i=0, z=this.linkList.length; i<z; i++){
			this.linkDurations[i] = this.linkDurations[i]/this.perimeterLength;
			}
		return this;
		};
	Shape.prototype.getPerimeterPosition = function(val, steady, roll){
		this.getPerimeterLength();
		val = scrawl.isa(val,'num') ? val : 1;
		var myLink, linkVal;
		for(var i=0, z=this.linkList.length; i<z; i++){
			myLink = scrawl.link[this.linkList[i]];
			if(this.linkDurations[i] >= val){
				if(i === 0){
					linkVal = val/this.linkDurations[i];
					}
				else{
					linkVal = ((val-this.linkDurations[i-1])/(this.linkDurations[i]-this.linkDurations[i-1]));
					}
				linkVal = (linkVal < 0) ? 0 : ((linkVal > 1) ? 1 : linkVal);
				if(steady){
					if(roll){
						var before = myLink.getSteadyPositionOnLink((linkVal-0.0000001 < 0) ? (linkVal-0.0000001)+1 : linkVal-0.0000001);
						var after = myLink.getSteadyPositionOnLink((linkVal+0.0000001 > 1) ? (linkVal+0.0000001)-1 : linkVal+0.0000001);
						var here = myLink.getSteadyPositionOnLink(linkVal);
						var angle = Math.atan2(after.y-before.y, after.x-before.x)*scrawl.degree;
						return {x:here.x, y:here.y, r:angle};
						}
					else{
						return myLink.getSteadyPositionOnLink(linkVal);
						}
					}
				else{
					if(roll){
						var before = myLink.getPositionOnLink((linkVal-0.0000001 < 0) ? (linkVal-0.0000001)+1 : linkVal-0.0000001);
						var after = myLink.getPositionOnLink((linkVal+0.0000001 > 1) ? (linkVal+0.0000001)-1 : linkVal+0.0000001);
						var here = myLink.getPositionOnLink(linkVal);
						var angle = Math.atan2(after.y-before.y, after.x-before.x)*scrawl.degree;
						return {x:here.x, y:here.y, r:angle};
						}
					else{
						return myLink.getPositionOnLink(linkVal);
						}
					}
				}
			}
		return false;
		};
	Shape.prototype.clone = function(items){
		var a = Sprite.prototype.clone.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		var tempObj, tempFirstPoint;
		var myName = a.name;
		var myPoints = [this.firstPoint];
		var myData = scrawl.point[this.firstPoint].getData();
		var myLinks = [myData.startLink];
		var nextLink = scrawl.link[myData.startLink];
		while(nextLink.action && ['move','add'].contains(nextLink.action)){
			if(nextLink.controlPoint1){myPoints.push(nextLink.controlPoint1);}
			if(nextLink.controlPoint2){myPoints.push(nextLink.controlPoint2);}
			if(nextLink.endPoint){
				myPoints.push(nextLink.endPoint);
				myData = scrawl.point[nextLink.endPoint].getData();
				myLinks.push(myData.startLink);
				nextLink = scrawl.link[myData.startLink];
				}
			else{break;}
			}
		for(var i=0, z=myPoints.length; i<z; i++){
			tempObj = scrawl.point[myPoints[i]];
			var b = tempObj.clone({
				name: tempObj.name.replace(this.name,myName),
				sprite: tempObj.sprite.replace(this.name,myName),
				startLink: (tempObj.startLink) ? tempObj.startLink.replace(this.name,myName) : null,
				fixed: (tempObj.fixed === this.name) ? myName : tempObj.fixed,
				});
			if(i === 0){
				tempFirstPoint = b.name;
				}
			}
		for(var i=0, z=myLinks.length; i<z; i++){
			tempObj = scrawl.link[myLinks[i]];
			tempObj.name.replace(this.name, myName);
			var c = tempObj.clone({
				name: tempObj.name.replace(this.name, myName),
				startPoint: (tempObj.startPoint) ? tempObj.startPoint.replace(this.name, myName) : null,
				endPoint: (tempObj.endPoint) ? tempObj.endPoint.replace(this.name, myName) : null,
				controlPoint1: (tempObj.controlPoint1) ? tempObj.controlPoint1.replace(this.name, myName) : null,
				controlPoint2: (tempObj.controlPoint2) ? tempObj.controlPoint2.replace(this.name, myName) : null,
				});
			}
		a.firstPoint = tempFirstPoint;
		return a;
		};
	Shape.prototype.getObjectData = function(){
		var p = [], l = [];
		var myPoints = [this.firstPoint];
		var myData = scrawl.point[this.firstPoint].getData();
		var myLinks = [myData.startLink];
		var nextLink = scrawl.link[myData.startLink];
		while(nextLink.action && ['move','add'].contains(nextLink.action)){
			if(nextLink.controlPoint1){myPoints.push(nextLink.controlPoint1);}
			if(nextLink.controlPoint2){myPoints.push(nextLink.controlPoint2);}
			if(nextLink.endPoint){
				myPoints.push(nextLink.endPoint);
				myData = scrawl.point[nextLink.endPoint].getData();
				myLinks.push(myData.startLink);
				nextLink = scrawl.link[myData.startLink];
				}
			else{break;}
			}
		for(var i=0, z=myPoints.length; i<z; i++){
			p.push(scrawl.point[myPoints[i]].getObjectData());
			}
		for(var i=0, z=myLinks.length; i<z; i++){
			l.push(scrawl.link[myLinks[i]].getObjectData());
			}
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			context: scrawl.ctx[this.context].getObjectData(), 
			points: p,
			links: l,
			timestamp: Date.now()
			};
		};

	function Point(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.sprite = items.sprite || false;
		this.distance = items.distance || 0;
		this.angle = items.angle || 0;
		this.degree = (scrawl.isa(items.degree,'bool')) ? items.degree : true;
		this.startLink = items.startLink || false;
		this.currentX = items.currentX || 0;
		this.currentY = items.currentY || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.fixed = (scrawl.isa(items.fixed,'bool')) ? items.fixed : false;
		this.pad = items.pad || false;
		scrawl.point[this.name] = this;
		scrawl.pointnames.pushUnique(this.name);
		if(this.sprite && scrawl.sprite[this.sprite].type === 'Shape'){
			scrawl.sprite[this.sprite].pointList.pushUnique(this.name);
			}
		return this;
		}
	Point.prototype = Object.create(SubScrawl.prototype);
	Point.prototype.type = 'Point';
	Point.prototype.classname = 'pointnames';
	Point.prototype.getData = function(override){
		if(!this.distance && !this.angle){
			this.setPolar();
			}
		this.recalculate(override);
		return {
			name: this.name,
			currentX: this.currentX,
			currentY: this.currentY,
			startLink: this.startLink,
			};
		};
	Point.prototype.set = function(items){
		var mySprite = this.sprite;
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xto([items.currentX,items.currentY])){
			this.setPolar();
			}
		if(scrawl.isa(items.sprite,'str')){
			scrawl.sprite[mySprite].pointList.removeItem(this.name);
			scrawl.sprite[this.sprite].pointList.pushUnique(this.name);
			}
		return this;
		};
	Point.prototype.recalculate = function(override){
		if(scrawl.isa(this.fixed,'str') && (scrawl.spritenames.contains(this.fixed) || scrawl.pointnames.contains(this.fixed))){
			var myPivot = scrawl.sprite[this.fixed] || scrawl.point[this.fixed];
			if(myPivot.type === 'Point'){
				this.currentX = myPivot.currentX;
				this.currentY = myPivot.currentY;
				}
			else{
				this.currentX = myPivot.startX;
				this.currentY = myPivot.startY;
				}
			}
		else if(!this.fixed){
			var obj, myStartX, myStartY, myAngle, myRadius; 
			obj = scrawl.sprite[this.sprite];
			myStartX = obj.getStartX(override);
			myStartY = obj.getStartY(override);
			if(obj.type === 'Shape'){
				if(obj.addPathRoll){
					myAngle = (this.degree) ? (this.angle + obj.roll + obj.pathRoll) * scrawl.radian : this.angle + obj.roll + (obj.pathRoll/scrawl.radian);
					}
				else{
					myAngle = (this.degree) ? (this.angle + obj.roll) * scrawl.radian : this.angle + obj.roll;
					}
				myRadius = this.distance * obj.scale;
				}
			else{
				myAngle = (this.degree) ? this.angle * scrawl.radian : this.angle;
				myRadius = this.distance;
				}
			this.currentX = myStartX + (myRadius * Math.cos(myAngle));
			this.currentY = myStartY + (myRadius * Math.sin(myAngle));
			}
		return this;
		};
	Point.prototype.setPolar = function(){
		var obj = scrawl.sprite[this.sprite];
		var dx = this.currentX - obj.startX;
		var dy = this.currentY - obj.startY;
		this.angle = (this.degree) ? Math.atan2(dy, dx)/scrawl.radian : Math.atan2(dy, dx);
		this.distance = Math.sqrt((dx*dx)+(dy*dy));
		return this;
		};

	function Link(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.species = items.species || false;
		this.startPoint = items.startPoint || false;
		this.sprite = (scrawl.xt(scrawl.point[this.startPoint])) ? scrawl.point[this.startPoint].sprite : false;
		this.endPoint = items.endPoint || false;
		this.controlPoint1 = items.controlPoint1 || false;
		this.controlPoint2 = items.controlPoint2 || false;
		this.action = items.action || 'add';
		scrawl.link[this.name] = this;
		scrawl.linknames.pushUnique(this.name);
		this.length = (scrawl.isa(items.length,'bool') && items.length) ? this.getLength() : false;
		this.precision = (scrawl.isa(items.precision,'num')) ? items.precision : 100; 
		this.positions = (scrawl.isa(items.positions,'bool') && items.positions) ? this.setPositions(this.precision) : false;
		if(this.startPoint && this.sprite && this.action === 'add'){
			scrawl.sprite[this.sprite].linkList.pushUnique(this.name);
			}
		return this;
		}
	Link.prototype = Object.create(SubScrawl.prototype);
	Link.prototype.type = 'Link';
	Link.prototype.classname = 'linknames';
	Link.prototype.set = function(items){
		var mySprite = this.sprite;
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.isa(items.sprite,'str') && items.sprite !== mySprite && mySprite){
			scrawl.sprite[mySprite].linkList.removeItem(this.name);
			}
		if(scrawl.isa(items.action,'str') && this.sprite && scrawl.spritenames.contains(this.sprite)){
			if(items.action === 'add'){
				scrawl.sprite[this.sprite].linkList.pushUnique(this.name);
				}
			else{
				scrawl.sprite[this.sprite].linkList.removeItem(this.name);
				}
			}
		return this;
		};
	Link.prototype.pointOnLine = function(origin, destination, val){
		return {
			x: origin.x + ((destination.x - origin.x) * val),
			y: origin.y + ((destination.y - origin.y) * val),
			};
		};
	Link.prototype.getPointCoordinates = function(){
		if(!scrawl.point[this.startPoint].currentX){
			scrawl.sprite[this.sprite].forceStamp('empty');
			}
		var s = {
			x: scrawl.point[this.startPoint].currentX,
			y: scrawl.point[this.startPoint].currentY,
			};
		var e = {
			x: scrawl.point[this.endPoint].currentX,
			y: scrawl.point[this.endPoint].currentY,
			};
		var c1 = (['quadratic', 'bezier'].contains(this.species)) ? {
			x: scrawl.point[this.controlPoint1].currentX,
			y: scrawl.point[this.controlPoint1].currentY,
			} : false;
		var c2 = (this.species === 'bezier') ? {
			x: scrawl.point[this.controlPoint2].currentX,
			y: scrawl.point[this.controlPoint2].currentY,
			} : false;
		return {
			start: s,
			end: e,
			control1: c1,
			control2: c2,
			};
		};
	Link.prototype.getPositionOnLink = function(val){
		val = (scrawl.isa(val,'num')) ? val : 1;
		var pts = this.getPointCoordinates();
		switch(this.species){
			case 'line':
				return this.pointOnLine(pts.start, pts.end, val);
				break;
			case 'quadratic':
				var mid1 = this.pointOnLine(pts.start, pts.control1, val);
				var mid2 = this.pointOnLine(pts.control1, pts.end, val);
				return this.pointOnLine(mid1, mid2, val);
				break;
			case 'bezier':
				var fst1 = this.pointOnLine(pts.start, pts.control1, val);
				var fst2 = this.pointOnLine(pts.control1, pts.control2, val);
				var fst3 = this.pointOnLine(pts.control2, pts.end, val);
				var sec1 = this.pointOnLine(fst1, fst2, val);
				var sec2 = this.pointOnLine(fst2, fst3, val);
				return this.pointOnLine(sec1, sec2, val);
				break;
			}
		return false;
		};
	Link.prototype.getSteadyPositionOnLink = function(val){
		val = (scrawl.isa(val,'num')) ? val : 1;
		if(this.positions.length === 0){
			this.setPositions();
			}
		var distance = this.length * val;
		distance = (distance > this.positions[this.precision].cumulativeLength) ? this.positions[this.precision].cumulativeLength : ((distance < 0) ? 0 : distance);
		var startX, startY, dx, dy, dPos, result;
		for(var i=1; i<=this.precision; i++){
			if(distance <= this.positions[i].cumulativeLength){
				startX = this.positions[i-1].x;
				startY = this.positions[i-1].y;
				dx = this.positions[i].x - startX;
				dy = this.positions[i].y - startY;
				dPos = (distance - this.positions[i-1].cumulativeLength)/this.positions[i].length;
				result = {
					x: startX + (dx * dPos),
					y: startY + (dy * dPos),
					};
				return result;
				}
			}
		return false;
		};
	Link.prototype.getLength = function(){
		var pts = this.getPointCoordinates();
		this.setPositions(this.precision);
		return this.length;
		};
	Link.prototype.setPositions = function(val){
		var pts = this.getPointCoordinates();
		this.precision = (scrawl.isa(val,'num') && val>0) ? val : (this.precision || 100); 
		this.positions = [];
		var step = 1/this.precision, pos, here, dist, dx, dy;
		var cumLen = 0, curX = pts.start.x, curY = pts.start.y;
		this.positions.push({
			x: curX,
			y: curY,
			length: 0,
			cumulativeLength: cumLen,
			});
		for(var i=0; i<this.precision; i++){
			pos = step*(i+1);
			here = this.getPositionOnLink(pos);
			dx = here.x - curX;
			dy = here.y - curY;
			curX = here.x;
			curY = here.y;
			dist = Math.sqrt((dx*dx)+(dy*dy));
			cumLen += dist;
			this.positions.push({
				x: curX,
				y: curY,
				length: dist,
				cumulativeLength: cumLen,
				});
			}
		this.length = this.positions[this.precision].cumulativeLength;
		return this;
		};
	Link.prototype.sketch = function(ctx, override){
		var myEnd, myCon1, myCon2;
		var myResult;
		switch(this.action){
			case 'close' :
				ctx.closePath();
				return true;
				break;
			case 'move' :
				try{
					myEnd = scrawl.point[this.endPoint].getData(override);
					ctx.moveTo(
						myEnd.currentX, 
						myEnd.currentY
						);
					}
				catch(e){
					return true;
					}
				break;
			case 'add' :
				try{
					switch(this.species){
						case 'line' :
							myEnd = scrawl.point[this.endPoint].getData(override);
							ctx.lineTo(
								myEnd.currentX, 
								myEnd.currentY
								);
							break;
						case 'quadratic' :
							myCon1 = scrawl.point[this.controlPoint1].getData(override);
							myEnd = scrawl.point[this.endPoint].getData(override);
							ctx.quadraticCurveTo(
								myCon1.currentX, 
								myCon1.currentY, 
								myEnd.currentX, 
								myEnd.currentY
								);
							break;
						case 'bezier' :
							myCon1 = scrawl.point[this.controlPoint1].getData(override);
							myCon2 = scrawl.point[this.controlPoint2].getData(override);
							myEnd = scrawl.point[this.endPoint].getData(override);
							ctx.bezierCurveTo(
								myCon1.currentX, 
								myCon1.currentY, 
								myCon2.currentX, 
								myCon2.currentY, 
								myEnd.currentX, 
								myEnd.currentY
								);
							break;
						default : 
							return true;
						}
					}
				catch(e){
					return true;
					}
				break;
			default :
				return true;
				break;
			}
		try{
			myResult = scrawl.link[scrawl.point[this.endPoint].startLink].sketch(ctx, override);
			}
		catch(e){
			return true;
			}
		return true;
		};
		
	function Design(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.color = items.color || [{color: 'black', stop: 0},{color: 'white', stop: 0.999999}];
		this.roll = items.roll || 0;
		this.cell = items.cell || scrawl.pad[scrawl.currentPad].current;
		this.startX = items.startX || 0;
		this.startY = items.startY || 0;
		this.endX = items.endX || 0;
		this.endY = items.endY || 0;
		this.handleX = items.handleX || 0;
		this.handleY = items.handleY || 0;
		this.startHandleX = items.startHandleX || 0;
		this.startHandleY = items.startHandleY || 0;
		this.endHandleX = items.endHandleX || 0;
		this.endHandleY = items.endHandleY || 0;
		return this;
		}
	Design.prototype = Object.create(Scrawl.prototype);
	Design.prototype.type = 'Design';
	Design.prototype.classname = 'designnames';
	Design.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.roll){this.roll += items.roll;}
		if(items.startX){this.startX += items.startX;}
		if(items.startY){this.startY += items.startY;}
		if(items.startRadius){this.startRadius += items.startRadius;}
		if(items.endX){this.endX += items.endX;}
		if(items.endY){this.endY += items.endY;}
		if(items.endRadius){this.endRadius += items.endRadius;}
		if(items.handleX){this.handleX += items.handleX;}
		if(items.handleY){this.handleY += items.handleY;}
		if(items.startHandleX){this.startHandleX += items.startHandleX;}
		if(items.startHandleY){this.startHandleY += items.startHandleY;}
		if(items.endHandleX){this.endHandleX += items.endHandleX;}
		if(items.endHandleY){this.endHandleY += items.endHandleY;}
		this.update();
		return this;
		};
	Design.prototype.update = function(){
		this.makeGradient();
		this.sortStops();
		this.applyStops();
		return this;
		};
	Design.prototype.makeGradient = function(){
		var ctx = scrawl.context[this.cell];
		var g;
		switch (this.type) {
			case 'Gradient' :
				g = ctx.createLinearGradient((this.startX+this.startHandleX+this.handleX), (this.startY+this.startHandleY+this.handleY), (this.endX+this.endHandleX+this.handleX), (this.endY+this.endHandleY+this.handleY));
				break;
			case 'RadialGradient' :
				g = ctx.createRadialGradient((this.startX+this.startHandleX+this.handleX), (this.startY+this.startHandleY+this.handleY), this.startRadius, (this.endX+this.endHandleX+this.handleX), (this.endY+this.endHandleY+this.handleY), this.endRadius);
				break;
			default :
				g = false;
			}
		scrawl.dsn[this.name] = g;
		return this;
		};
	Design.prototype.sortStops = function(){
		for(var i=0, z=this.color.length; i<z; i++){
			this.color[i].roll = this.roll;
			}
		this.color.sort(function(a,b){
			return (((a.stop+a.roll)-Math.floor(a.stop+a.roll)) - ((b.stop+b.roll)-Math.floor(b.stop+b.roll)));
			});
		};
	Design.prototype.applyStops = function(){
		if(scrawl.dsn[this.name]){
			for(var i=0, z=this.color.length; i<z; i++){
				scrawl.dsn[this.name].addColorStop(((this.color[i].stop+this.roll)-Math.floor(this.color[i].stop+this.roll)), this.color[i].color);
				}
			}
		return this;
		};
		
	function Gradient(items){
		Design.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		scrawl.design[this.name] = this;
		scrawl.designnames.pushUnique(this.name);
		this.update();
		return this;
		}
	Gradient.prototype = Object.create(Design.prototype);
	Gradient.prototype.type = 'Gradient';
	Gradient.prototype.classname = 'designnames';
	Gradient.prototype.swap = function(){
		var tempX = this.startX; this.startX = this.endX; this.endX = tempX;
		var tempY = this.startY; this.startY = this.endY; this.endY = tempY;
		this.update();
		return this;
		};

	function RadialGradient(items){
		Design.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.startRadius = items.startRadius || 0;
		this.endRadius = items.endRadius || 0;
		scrawl.design[this.name] = this;
		scrawl.designnames.pushUnique(this.name);
		this.update();
		return this;
		}
	RadialGradient.prototype = Object.create(Design.prototype);
	RadialGradient.prototype.type = 'RadialGradient';
	RadialGradient.prototype.classname = 'designnames';
	RadialGradient.prototype.swap = function(){
		var tempX = this.startX; this.startX = this.endX; this.endX = tempX;
		var tempY = this.startY; this.startY = this.endY; this.endY = tempY;
		var tempR = this.startRadius; this.startRadius = this.endRadius; this.endRadius = tempY;
		this.update();
		return this;
		};

	function Pattern(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.repeat = items.repeat || 'repeat';
		scrawl.design[this.name] = this;
		scrawl.designnames.pushUnique(this.name);
		this.setImage((items.source || items.imageData || scrawl.image[items.image] || false), this.name);
		return this;
		}
	Pattern.prototype = Object.create(Scrawl.prototype);
	Pattern.prototype.type = 'Pattern';
	Pattern.prototype.classname = 'designnames';
	Pattern.prototype.setImage = function(source, name, callback){
		if(scrawl.isa(source, 'str')){
			var myImage = new Image();
			myImage.id = name;
			myImage.onload = function(callback){
				try{
					var iObj = scrawl.newImage({
						name: name,
						element: myImage,
						});
					scrawl.design[name].image = iObj.name;
					scrawl.design[name].source = source;
					scrawl.design[name].makeDesign();
					if(scrawl.isa(callback, 'fn')){
						callback();
						}
					}
				catch(e){
					console.log('Pattern '+[this.name]+' - setImage() failed - '+e.name+' error: '+e.message);
					return this;
					}
				};
			myImage.src = source;
			}
		else if(scrawl.isa(source, 'obj')){
			this.image = source.name;
			this.source = source.source;
			this.makeDesign();
			if(scrawl.isa(callback, 'fn')){
				callback();
				}
			}
		else{
			console.log('Pattern '+[this.name]+' - setImage() failed - source not a string or an object');
			}
		return this;
		};
	Pattern.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		this.setImage();
//		this.makeDesign();
		return this;
		};
	Pattern.prototype.getObjectData = function(){
		return {
			type: this.type, 
			name: this.name, 
			object: this, 
			image: scrawl.image[this.image].getObjectData(), 
			timestamp: Date.now()
			};
		};
	Pattern.prototype.makeDesign = function(cell){
		var ctx = (scrawl.xt(cell)) ? scrawl.context[cell] : scrawl.context[scrawl.pad[scrawl.currentPad].current];
		try{
			if(this.image){
				if(scrawl.img[this.image]){
					scrawl.dsn[this.name] = ctx.createPattern(scrawl.img[this.image], this.repeat);
					return this;
					}
				return this;
				}
			return this;
			}
		catch(e){
			return this;
			}
		};
	Pattern.prototype.clone = function(items){
		var c = scrawl.newPattern(items);
		return c;
		};

	scrawl.initialize();
	return scrawl;
	}());
