/***********************************************************************************
* SCRAWL.JS Library 
*	version 1.02 - 24 November 2013
*	Developed by Rik Roots - rik.roots@gmail.com, rik@rikweb.org.uk
*
*   Scrawl demo website: http://scrawl.rikweb.org.uk
*
***********************************************************************************/

//various methods sourced mainly from Stack Overflow - can't remember authors ... many apologies!
Array.prototype.contains = Array.prototype.contains || function(k){
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
Array.prototype.pushUnique = Array.prototype.pushUnique || function(o){
	if(!this.contains(o)){
		this.push(o);
		return true;
		}
	return false;
	};
Array.prototype.removeItem = Array.prototype.removeItem || function(o){
	if(this.contains(o)){
		var i = this.indexOf(o);
		this.splice(i, 1);
		return true;
		}
	return false;
	};
Number.prototype.isBetween = Number.prototype.isBetween || function(a, b, e){
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

// requestAnimFrame from Paul Irish - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000/60);};
	})();
 
window.scrawl = (function(){
	var scrawl = {
m: '',
		type: 'Library',
		version: '1.01',
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
		text: {},
		textnames: [],
		stack: {},
		stk: {},
		stacknames: [],
		element: {},
		elm: {},
		elementnames: [],
		nameslist: ['objectnames', 'padnames', 'cellnames', 'imagenames', 'groupnames', 'designnames', 'spritenames', 'pointnames', 'linknames', 'ctxnames', 'animnames', 'textnames', 'stacknames', 'elementnames'],
		radian: Math.PI/180,
		mouseX: 0,
		mouseY: 0,
		newPad: function(items){return new Pad(items);},
		newStack: function(items){return new Stack(items);},
		newElement: function(items){return new Element(items);},
		newCell: function(items){return new Cell(items);},
		newImage: function(items){return new ScrawlImage(items);},
		newGroup: function(items){return new Group(items);},
		newPhrase: function(items){return new Phrase(items);},
		newBlock: function(items){return new Block(items);},
		newWheel: function(items){return new Wheel(items);},
		newPicture: function(items){return new Picture(items);},
		newOutline: function(items){return new Outline(items);},
		newShape: function(items){return new Shape(items);},
		newPoint: function(items){return new Point(items);},
		newLink: function(items){return new Link(items);},
		newAnimSheet: function(items){return new AnimSheet(items);},
		newGradient: function(items){return new Gradient(items);},
		newRadialGradient: function(items){return new RadialGradient(items);},
		newColor: function(items){return new Color(items);},
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
		makeName: function(item){
			item = (this.isa(item,'obj')) ? item : {};
			var o = {
				name: (this.isa(item.name,'str')) ? item.name : null,
				type: (this.isa(item.type,'str')) ? item.type : null,
				target: (this.isa(item.target,'str')) ? item.target : null,
				};
			if(this.nameslist.contains(o.target)){
				var name = o.name || o.type || 'default';
				var nameArray = name.split('~£!');
				var newname = (this[o.target].contains(nameArray[0])) ? nameArray[0]+'~£!'+Math.floor(Math.random()*100000000) : nameArray[0];
				return newname;
				}
			return false;
			},
		loadNative: function(items){
			items = (this.isa(items,'str')) ? [items] : items;
			if(this.isa(items,'arr')){
				var temp;
				for(var i=0, z=items.length; i<z; i++){
					temp = JSON.parse(items[i]);
					for(var j=0, w=temp.length; j<w; j++){
						switch(temp[j].type){
							case 'Group' :
								if(this.groupnames.contains(temp[j].name)){
									this.group[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newGroup(temp[j]);
									}
								break;
							case 'AnimSheet' :
								if(this.animnames.contains(temp[j].name)){
									this.anim[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newAnimSheet(temp[j]);
									}
								break;
							case 'ScrawlImage' :
								if(this.imagenames.contains(temp[j].name)){
									this.image[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									if(this.xt(items.element)){
										items.element = document.getElementById(items.element);
										}
									this.newImage(temp[j]);
									}
								break;
							case 'Gradient' :
								if(this.designnames.contains(temp[j].name)){
									this.design[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newGradient(temp[j]);
									}
								break;
							case 'RadialGradient' :
								if(this.designnames.contains(temp[j].name)){
									this.design[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newRadialGradient(temp[j]);
									}
								break;
							case 'Pattern' :
								if(this.designnames.contains(temp[j].name)){
									this.design[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newPattern(temp[j]);
									}
								break;
							case 'Color' :
								if(this.designnames.contains(temp[j].name)){
									this.design[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newColor(temp[j]);
									}
								break;
							case 'Phrase' :
								if(this.spritenames.contains(temp[j].name)){
									this.sprite[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newPhrase(temp[j]);
									}
								break;
							case 'Block' :
								if(this.spritenames.contains(temp[j].name)){
									this.sprite[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newBlock(temp[j]);
									}
								break;
							case 'Wheel' :
								if(this.spritenames.contains(temp[j].name)){
									this.sprite[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newWheel(temp[j]);
									}
								break;
							case 'Picture' :
								var p;
								if(this.spritenames.contains(temp[j].name)){
									p = this.sprite[temp[j].name];
									p.setToDefaults().set(temp[j]);
									}
								else{
									p = this.newPicture(temp[j]);
									}
								if(temp[j].checkHitUsingImageData){
									p.getImageData();
									}
								break;
							case 'Outline' :
								if(this.spritenames.contains(temp[j].name)){
									this.sprite[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newOutline(temp[j]);
									}
								break;
							case 'Shape' :
								if(this.spritenames.contains(temp[j].name)){
									this.sprite[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newShape(temp[j]);
									}
								break;
							case 'Point' :
								if(this.pointnames.contains(temp[j].name)){
									this.point[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newPoint(temp[j]);
									}
								break;
							case 'Link' :
								if(this.linknames.contains(temp[j].name)){
									this.link[temp[j].name].setToDefaults().set(temp[j]);
									}
								else{
									this.newLink(temp[j]);
									}
								break;
							}
						}
					}
				}
			return true;
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
		stampBackground: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].stampBackground(command);
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
			this.text = {}; this.textnames = [];
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
				var vLabel = (this.xt(items.linkLabel)) ? items.linkLabel : items.pointLabel+'_link';
				for(var i=0, z=items.data.length; i<z; i++){
					temp = new Point({
						name: items.pointLabel+i,
						sprite: items.sprite,
						distance: items.data[i][0] || 0,
						angle: items.data[i][1] || 0,
						visibility: viz,
						startLink: vLabel+i,
						});
					v.push(temp.name);
					}
				}
			return v;
			},
		makePath: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.scaleX = items.scaleX || 1; 
			items.scaleY = items.scaleY || 1;
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			var minX = 999999, minY = 999999, maxX = -999999, maxY = -999999;
			var checkMinMax = function(cx,cy){
				minX = (minX > cx) ? cx : minX;
				minY = (minY > cy) ? cy : minY;
				maxX = (maxX < cx) ? cx : maxX;
				maxY = (maxY < cy) ? cy : maxY;
				};
			var getPathSetData = function(sim){
				var psd = sim.match(/(-?[0-9.]+\b)/g);
				if(psd){
					for(var j=0, w=psd.length; j<w; j++){
						psd[j] = parseFloat(psd[j]);
						}
					return psd;
					}
				return false;
				};
			var generatePoint = function(_tempname,_pcount,_shapename,_x,_y,_viz,_lcount,_sx,_sy){
				new Point({
					name: _tempname+'_p'+_pcount,
					sprite: _shapename,
					currentX: _x*_sx,
					currentY: _y*_sy,
					visibility: _viz,
					startLink: _tempname+'_l'+_lcount,
					});
				};
			var generateLink = function(_tempname,_lcount,_shapename,_spec,_act,_spt,_ept,_cp1,_cp2){
				_ept = (scrawl.xt(_ept)) ? _ept : {};
				_cp1 = (scrawl.xt(_cp1)) ? _cp1 : {};
				_cp2 = (scrawl.xt(_cp2)) ? _cp2 : {};
				new Link({
					name: _tempname+'_l'+_lcount,
					sprite: _shapename,
					species: _spec, 
					startPoint: _spt.name,
					endPoint: _ept.name || false,
					controlPoint1: _cp1.name || false,
					controlPoint2: _cp2.name || false,
					precision: false,
					action: _act,
					});
				};
			if(this.xt(items.data)){
				var myShape = this.newShape(items);
				var sn = myShape.name;
				var tn = sn.replace('~','_','g');
				var lib = scrawl.point;
				var sx = items.scaleX;
				var sy = items.scaleY;
				if(myShape){
					var set = items.data.match(/([A-Za-z][0-9. ,\-]*)/g);
					var data, command, temppoint;
					var lc = 0, pc = 0;
					var cx = myShape.startX, cy = myShape.startY;
					generatePoint(tn, pc, sn, cx, cy, false, lc, sx, sy); pc++;
					for(var i=0,z=set.length; i<z; i++){
						command = set[i][0];
						data = getPathSetData(set[i]);
						switch(command){
							case 'M' :
//NEED TO WORK OUT WHAT .dataFile did in the SVG import stuff, and how its removal will affect existing demos
								if(i===0 && items.dataFile){
									myShape.startX = data[0];
									myShape.startY = data[1];
									checkMinMax(cx,cy);
									}
								else{
									cx = data[0], cy = data[1];
									checkMinMax(cx,cy);
									generatePoint(tn, pc, sn, cx, cy, true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, false, 'move', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									}
								for(var k=2,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, data[k], data[k+1], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'm' :
								cx += data[0], cy += data[1];
								checkMinMax(cx,cy);
								generatePoint(tn, pc, sn, cx, cy, true, lc+1, sx, sy); pc++;
								generateLink(tn, lc, sn, false, 'move', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
								for(var k=2,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'Z' :
							case 'z' :
								generatePoint(tn, pc, sn, myShape.startX, myShape.startY, false, lc+1, sx, sy); pc++;
								generateLink(tn, lc, sn, false, 'close', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
								break;
							case 'L' :
								for(var k=0,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, data[k], data[k+1], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'l' :
								for(var k=0,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'H' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, data[k], cy, true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'h' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx+data[k], cy, true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'V' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx, data[k], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cy = data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'v' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx, cy+data[k], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cy += data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'C' :
								for(var k=0,v=data.length;k<v;k+=6){
									generatePoint(tn, pc, sn, data[k], data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+4], data[k+5], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+4], cy = data[k+5];
									checkMinMax(cx,cy);
									}
								break;
							case 'c' :
								for(var k=0,v=data.length;k<v;k+=6){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+2], cy+data[k+3], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+4], cy+data[k+5], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+4], cy += data[k+5];
									checkMinMax(cx,cy);
									}
								break;
							case 'S' :
								for(var k=0,v=data.length;k<v;k+=4){
									if(i>0 && ['C','c','S','s'].contains(set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, false, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+2], cy = data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 's' :
								for(var k=0,v=data.length;k<v;k+=4){
									if(i>0 && ['C','c','S','s'].contains(set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, false, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+2], cy += data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'Q' :
								for(var k=0,v=data.length;k<v;k+=4){
									generatePoint(tn, pc, sn, data[k], data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+2], cy = data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'q' :
								for(var k=0,v=data.length;k<v;k+=4){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], false, lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+2], cy+data[k+3], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+2], cy += data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'T' :
								for(var k=0,v=data.length;k<v;k+=2){
									if(i>0 && ['Q','q','T','t'].contains(set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, false, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], false, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 't' :
								for(var k=0,v=data.length;k<v;k+=2){
									if(i>0 && ['Q','q','T','t'].contains(set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, false, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], true, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							default :
							}
						}
					generateLink(tn, lc, sn, false, 'end', lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc)]);
					myShape.firstPoint = tn+'_p0';
					myShape.width = (maxX-minX)*items.scaleX;
					myShape.height = (maxY-minY)*items.scaleY;
					this.point[tn+'_p0'].fixed = myShape.name;
					if(items.path){
						myShape.path = false;
						myShape.forceStamp('none');
						myShape.path = items.path;
						}
					else{myShape.forceStamp('none');}
					myShape.handleX = items.handleX || 'center';
					myShape.handleY = items.handleY || 'center';
					return myShape;
					}
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
			var myData = 'm';
			var cx = items.startX;
			var cy = items.startY;
			var dx = items.startX;
			var dy = items.startY-items.radiusY;
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
			items.data = myData;
			var myShape;
			if(items.outline){
				items.data = 'M'+items.startX+','+items.startY+items.data;
				items.handleX = items.handleX || 'left';
				items.handleY = items.handleY || 'top';
				myShape = this.newOutline(items);
				}
			else{
				items.handleX = items.handleX || 'center';
				items.handleY = items.handleY || 'center';
				myShape = this.makePath(items);
				}
			return myShape;
			},
		makeRectangle: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.width = items.width || 0; 
			items.height = items.height || 0;
			items.radius = items.radius || 0; 
			items.closed = true;
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
			var myData = 'm';
			var cx = items.startX;
			var cy = items.startY;
			var dx = items.startX-halfWidth+_tlx;
			var dy = items.startY-halfHeight;
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
			items.data = myData;
			var myShape;
			if(items.outline){
				items.data = 'M'+items.startX+','+items.startY+items.data;
				items.handleX = items.handleX || 'left';
				items.handleY = items.handleY || 'top';
				myShape = this.newOutline(items);
				}
			else{
				items.handleX = items.handleX || 'center';
				items.handleY = items.handleY || 'center';
				myShape = this.makePath(items);
				}
			return myShape;
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
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			var myFixed = items.fixed || 'none';
			items.fixed = false;
			items.data = 	'm0,0'+
							'c'+(items.startControlX-items.startX)+','+(items.startControlY-items.startY)+
							' '+(items.endControlX-items.startX)+','+(items.endControlY-items.startY)+
							' '+(items.endX-items.startX)+','+(items.endY-items.startY);
			var myShape;
			if(items.outline){
				items.data = 'M'+items.startX+','+items.startY+items.data;
				myShape = this.newOutline(items);
				}
			else{
				items.line = true;
				myShape = this.makePath(items);
				var tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'all' :
						this.point[tempName+'_p1'].fixed = true;
						this.point[tempName+'_p2'].fixed = true;
						this.point[tempName+'_p3'].fixed = true;
						this.point[tempName+'_p4'].fixed = true;
						break;
					case 'both' :
						this.point[tempName+'_p1'].fixed = true;
						this.point[tempName+'_p4'].fixed = true;
						break;
					case 'start' :
						this.point[tempName+'_p1'].fixed = true;
						break;
					case 'startControl' :
						this.point[tempName+'_p2'].fixed = true;
						break;
					case 'endControl' :
						this.point[tempName+'_p3'].fixed = true;
						break;
					case 'end' :
						this.point[tempName+'_p4'].fixed = true;
						break;
					default :
						this.point[tempName+'_p0'].fixed = myShape.name;
					}
				}
			return myShape;
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
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			var myFixed = items.fixed || 'none';
			items.fixed = false;
			items.data = 	'm0,0'+
							'q'+(items.controlX-items.startX)+','+(items.controlY-items.startY)+
							' '+(items.endX-items.startX)+','+(items.endY-items.startY);
			var myShape;
			if(items.outline){
				items.data = 'M'+items.startX+','+items.startY+items.data;
				myShape = this.newOutline(items);
				}
			else{
				items.line = true;
				myShape = this.makePath(items);
				var tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'all' :
						this.point[tempName+'_p1'].fixed = true;
						this.point[tempName+'_p2'].fixed = true;
						this.point[tempName+'_p3'].fixed = true;
						break;
					case 'both' :
						this.point[tempName+'_p1'].fixed = true;
						this.point[tempName+'_p3'].fixed = true;
						break;
					case 'start' :
						this.point[tempName+'_p1'].fixed = true;
						break;
					case 'control' :
						this.point[tempName+'_p2'].fixed = true;
						break;
					case 'end' :
						this.point[tempName+'_p3'].fixed = true;
						break;
					default :
						this.point[tempName+'_p0'].fixed = myShape.name;
					}
				}
			return myShape;
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
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			items.data = 	'm0,0 '+(items.endX-items.startX)+','+(items.endY-items.startY);
			var myShape;
			if(items.outline){
				items.data = 'M'+items.startX+','+items.startY+items.data;
				myShape = this.newOutline(items);
				}
			else{
				items.line = true;
				myShape = this.makePath(items);
				var tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'both' :
						this.point[tempName+'_p1'].fixed = true;
						this.point[tempName+'_p2'].fixed = true;
						break;
					case 'start' :
						this.point[tempName+'_p1'].fixed = true;
						break;
					case 'end' :
						this.point[tempName+'_p2'].fixed = true;
						break;
					default :
						this.point[tempName+'_p0'].fixed = myShape.name;
					}
				}
			return myShape;
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
				var myAngle = myTurn;
				var myData = 'm', cx, cy, dx = 0, dy = 0;
				for(var i=0; i<=mySides; i++){
					cx = items.radius * Math.cos(myAngle * this.radian);
					cy = items.radius * Math.sin(myAngle * this.radian);
					myData += (cx-dx).toFixed(3)+','+(cy-dy).toFixed(3)+' ';
					dx=cx, dy=cy;
					myAngle += myTurn;
					myAngle = myAngle%360;
					}
				myData += 'z';
				items.data = myData;
				var myShape;
				if(items.outline){
					items.data = 'M'+items.startX+','+items.startY+items.data;
					items.handleX = items.handleX || 'left';
					items.handleY = items.handleY || 'top';
					myShape = this.newOutline(items);
					}
				else{
					items.handleX = items.handleX || 'center';
					items.handleY = items.handleY || 'center';
					var myShape = this.makePath(items);
					myShape.width = myShape.radius*2;
					myShape.height = myShape.width;
					}
				return myShape;
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
		initialize: function(){
			this.getStacks();
			this.getCanvases();
			this.getElements();
			this.setDisplayOffsets('all');
			return true;
			},
		getStacks: function(){
			var s = document.getElementsByClassName("scrawlstack");
			var stacks = [];
			var myStack;
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					stacks.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					myStack = scrawl.newStack({
						stackElement: stacks[i],
						});
					for(var j=0, w=scrawl.stk[myStack.name].children.length; j<w; j++){
						scrawl.stk[myStack.name].children[j].style.position = 'absolute';
						if(scrawl.stk[myStack.name].children[j].tagName !== 'CANVAS'){
							scrawl.newElement({
								domElement: scrawl.stk[myStack.name].children[j],
								stack: myStack.name,
								});
							}
						}
					if(this.elementnames.contains(myStack.name)){
						myStack.stack = this.element[myStack.name].stack;
						delete this.element[myStack.name];
						delete this.elm[myStack.name];
						this.elementnames.removeItem(myStack.name);
						}
					}
				return true;
				}
			console.log('scrawl.getStacks() failed to find any elements with class="scrawlstack" on the page');
			return false;
			},
		getCanvases: function(){
			var s = document.getElementsByTagName("canvas");
			var myPad, myStack, myElement, myNewStack;
			var canvases = [];
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					canvases.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					if(canvases[i].className.indexOf('stack:') !== -1){
						myStack = canvases[i].className.match(/stack:(\w+)/);
						if(scrawl.stacknames.contains(myStack[1])){
							scrawl.stk[myStack[1]].appendChild(canvases[i]);
							}
						else{
							myElement = document.createElement('div');
							myElement.id = myStack[1];
							canvases[i].parentElement.appendChild(myElement);
							myElement.appendChild(canvases[i]);
							myNewStack = scrawl.newStack({
								stackElement: document.getElementById(myStack[1]),
								});
							}
						}
					myPad = scrawl.newPad({
						canvasElement: canvases[i],
						});
					if(scrawl.stacknames.contains(canvases[i].parentElement.id)){
						myPad.stack = canvases[i].parentElement.id;
						canvases[i].style.position = 'absolute';
						myPad.initialize3d();
						}
					if(i === 0){
						scrawl.currentPad = myPad.name;
						}
					}
				return true;
				}
			console.log('scrawl.getCanvases() failed to find any <canvas> elements on the page');
			return false;
			},
		getElements: function(){
			var s = document.getElementsByClassName("scrawl");
			var el = [];
			var myName, myStack;
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					el.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					myName = el.id || el.name || false;
					if(!scrawl.elementnames.contains(myName)){
						if(el[i].className.indexOf('stack:') !== -1){
							myStack = el[i].className.match(/stack:(\w+)/);
							if(scrawl.stacknames.contains(myStack[1])){
								scrawl.stk[myStack[1]].appendChild(el[i]);
								scrawl.newElement({
									domElement: el[i],
									stack: myStack[1],
									});
								}
							}
						}
					}
				return true;
				}
			console.log('scrawl.getElements() failed to find any elements with class="scrawl" on the page');
			return false;
			},
		addCanvasToPage: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			var myStk = false;
			if(this.xt(items.stackName)){
				myStk = document.getElementById(items.stackName) || false;
				if(!myStk){
					myStk = this.addStackToPage({
						stackName: items.stackName, 
						width: items.width, 
						height: items.height, 
						parentElement: document.getElementById(items.parentElement) || document.body,
						});
					}
				items.stack = myStk.id;
				}
			var myParent = myStk || document.getElementById(items.parentElement) || document.body;
			var myName = scrawl.makeName({
				name: items.canvasName || false,
				type: 'Pad',
				target: 'padnames',
				});
			var myCanvas = document.createElement('canvas');
			myCanvas.id = myName;
			myParent.appendChild(myCanvas);
			var DOMCanvas = document.getElementById(myName)
			DOMCanvas.width = items.width;
			DOMCanvas.height = items.height;
			var myPad = scrawl.newPad({
				canvasElement: DOMCanvas,
				});
			if(this.xt(items.position) || myStk){
				items.position = items.position || 'absolute';
				}
			myPad.set(items);
			myPad.setDisplayOffsets();
			return myPad;
			},
		addStackToPage: function(items){
			if(this.isa(items.stackName,'str') && this.xt(items.parentElement)){
				var myElement = document.createElement('div');
				myElement.id = items.stackName;
				items.parentElement.appendChild(myElement);
				items['stackElement'] = document.getElementById(items.stackName);
				items['stack'] = (scrawl.stacknames.contains(items.parentElement.id)) ? items.parentElement.id : false;
				var myStack = new Stack(items);
				return scrawl.stk[myStack.name];
				}
			return false;
			},
		setDisplayOffsets: function(item){
			var myItem = item || 'all';
			if(myItem === 'stacks' || myItem === 'all'){
				for(var i=0, z=scrawl.stacknames.length; i<z; i++){
					scrawl.stack[scrawl.stacknames[i]].setDisplayOffsets();
					}
				}
			if(myItem === 'pads' || myItem === 'all'){
				for(var i=0, z=scrawl.padnames.length; i<z; i++){

					scrawl.pad[scrawl.padnames[i]].setDisplayOffsets();
					}
				}
			if(myItem === 'elements' || myItem === 'all'){
				for(var i=0, z=scrawl.elementnames.length; i<z; i++){
					scrawl.element[scrawl.elementnames[i]].setDisplayOffsets();
					}
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
		items = (scrawl.isa(items,'obj')) ? items : {};
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
			if(scrawl.xt(this[label]) && scrawl.xt(items[label])){
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
			case 'Outline' : a = new Outline(b); break;
			case 'Shape' : a = new Shape(b); break;
			case 'Gradient' : a = new Gradient(b); break;
			case 'RadialGradient' : a = new RadialGradient(b); break;
			case 'Pattern' : a = new Pattern(b); break;
			case 'Color' : a = new Color(b); break;
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

	function SubScrawl(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
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
		if(['Block','Phrase','Wheel','Outline','Shape','Picture'].contains(this.type)){
			this.setCurrentParameters(scrawl.group[this.group].getOverride(this.name,'none'));
			}
		return this;
		};
	SubScrawl.prototype.unmoveStart = function(item){
		switch(item){
			case 'x' :
				this.startX -= this.moveStartX;
				break;
			case 'y' :
				this.startY -= this.moveStartY;
				break;
			case 'path' :
				this.pathPosition -= this.movePathPosition;
				if(this.pathPosition > 1){this.pathPosition -= 1;}
				if(this.pathPosition < 0){this.pathPosition += 1;}
				break;
			default :
				this.startX -= this.moveStartX;
				this.startY -= this.moveStartY;
				this.pathPosition -= this.movePathPosition;
				if(this.pathPosition > 1){this.pathPosition -= 1;}
				if(this.pathPosition < 0){this.pathPosition += 1;}
			}
		if(['Block','Phrase','Wheel','Outline','Shape','Picture'].contains(this.type)){
			this.setCurrentParameters(scrawl.group[this.group].getOverride(this.name,'none'));
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
		if(['Block','Phrase','Wheel','Outline','Shape','Picture'].contains(this.type)){
			this.setCurrentParameters(scrawl.group[this.group].getOverride(this.name,'none'));
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
	SubScrawl.prototype.getPivotOffset = function(val,useHeight){
		if(scrawl.xt(val)){
			useHeight = (scrawl.isa(useHeight,'bool')) ? useHeight : false;
			var result;
			if((scrawl.isa(val,'str')) && !['left','center','right','top','bottom'].contains(val)){
				result = (useHeight) ? (parseFloat(val)/100)*this.height : (parseFloat(val)/100)*this.width;
				}
			else{
				switch (val){
					case 'left' : result = 0; break;
					case 'center' : (useHeight) ? result = this.height/2 : result = this.width/2; break;
					case 'right' : result = this.width; break;
					case 'top' : result = 0; break;
					case 'bottom' : result = this.height; break;
					default : result = val;
					}
				}
			return result;
			}
		return 0;
		};
	SubScrawl.prototype.getStartX = function(override){
		override = (scrawl.isa(override,'obj')) ? override : {};
		var myH, a;
		var myScale = this.currentScale || this.scale || 1;
		if(this.flipReverse){
			myH = this.getPivotOffset(this.handleX,false);
			a = this.startX + (myH*myScale);
			return (scrawl.xt(override.x)) ? a-override.x : a;
			}
		else{
			myH = this.getPivotOffset(this.handleX,false);
			a = this.startX - (myH*myScale);
			return (scrawl.xt(override.x)) ? a+override.x : a;
			}
		};
	SubScrawl.prototype.getStartY = function(override){
		override = (scrawl.isa(override,'obj')) ? override : {};
		var myH, a;
		var myScale = this.currentScale || this.scale || 1;
		if(this.flipUpend){
			myH = this.getPivotOffset(this.handleY,true);
			a = this.startY + (myH*myScale);
			return (scrawl.xt(override.y)) ? a-override.y : a;
			}
		else{
			myH = this.getPivotOffset(this.handleY,true);
			a = this.startY - (myH*myScale);
			return (scrawl.xt(override.y)) ? a+override.y : a;
			}
		};

	function Scrawl3d(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
//THERE'S BETTER IE DETECTORS THAN THIS
		this.isIE = (navigator.appName == 'Microsoft Internet Explorer') ? true : false;
		return this;
		}
	Scrawl3d.prototype = Object.create(SubScrawl.prototype);
	Scrawl3d.prototype.type = 'Scrawl3d';
	Scrawl3d.prototype.classname = 'objectnames';
	Scrawl3d.prototype.initialize2d = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.stack = items.stack || false;
		this.setTitle(items.title || this.getTitle() || '');
		this.setComment(items.comment || this.getComment() || '');
		this.setOverflow(items.overflow || this.getOverflow() || ((this.type === 'Stack') ? 'hidden' : 'visible'));
		this.setZIndex(items.order || items.zIndex || this.getZIndex() || 0);
		this.setWidth(items.width || this.getWidth() || 300);
		this.setHeight(items.height || this.getHeight() || 150);
		this.setLeft(items.startX || items.left || this.getLeft() || 0);
		this.setTop(items.startY || items.top || this.getTop() || 0);
		this.setDisplayOffsets();
		return this;
		};
	Scrawl3d.prototype.initialize3d = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.setPerspectiveOrigin({perspectiveOriginX: items.perspectiveOriginX, perspectiveOriginY: items.perspectiveOriginY} || items.perspectiveOrigin || this.getPerspectiveOrigin() || false);
		this.setPerspective(items.perspective || this.getPerspective());
		this.setTransformOrigin({transformOriginX: items.transformOriginX, transformOriginY: items.transformOriginY} || items.transformOrigin || this.getTransformOrigin() || false);
		this.setTransformStyle(items.transformStyle || this.getTransformStyle() || 'preserve-3d');
		this.setBackfaceVisibility(items.backfaceVisibility || this.getBackfaceVisibility() || 'visible');
		this.setPitch(items.rotateX || items.pitch || 0);
		this.setYaw(items.rotateY || items.yaw || 0);
		this.setRoll(items.rotateZ || items.rotate || items.roll || 0);
		this.setTranslateX(items.translateX || 0);
		this.setTranslateY(items.translateY || 0);
		this.setTranslateZ(items.translateZ || 0);
		this.setRotateFirst(items.rotateFirst || false);
		this.setTransform();
		this.setDisplayOffsets();
		return this;
		};
	Scrawl3d.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.title)){this.setTitle(items.title);}
		if(scrawl.xt(items.comment)){this.setComment(items.comment);}
		if(scrawl.xt(items.overflow)){this.setOverflow(items.overflow);}
		if(scrawl.xto([items.order,items.zIndex])){this.setZIndex(items.order || items.zIndex || 0);}
		if(scrawl.xt(items.width)){this.setWidth(items.width);}
		if(scrawl.xt(items.height)){this.setHeight(items.height);}
		if(scrawl.xt(items.position)){this.setPosition(items.position);}
		if(scrawl.xto([items.startX,items.left])){this.setLeft(items.startX || items.left || 0);}
		if(scrawl.xto([items.startY,items.top])){this.setTop(items.startY || items.top || 0);}
		if(scrawl.xt(items.perspective)){this.setPerspective(items.perspective);}
		if(scrawl.xto([items.perspectiveOriginX,items.perspectiveOriginY])){
			this.setPerspectiveOrigin({perspectiveOriginX: (items.perspectiveOriginX || this.perspectiveOriginX), perspectiveOriginY: (items.perspectiveOriginY || this.perspectiveOriginY)});
			}
		else if(scrawl.xt(items.perspectiveOrigin)){
			this.setPerspectiveOrigin(items.perspectiveOrigin);
			}
		if(scrawl.xto([items.transformOriginX,items.transformOriginY])){
			this.setTransformOrigin({transformOriginX: (items.transformOriginX || this.transformOriginX), transformOriginY: (items.transformOriginY || this.transformOriginY)});
			}
		else if(scrawl.xt(items.transformOrigin)){
			this.setTransformOrigin(items.transformOrigin);
			}
		if(scrawl.xt(items.transformStyle)){this.setTransformStyle(items.transformStyle);}
		if(scrawl.xt(items.backfaceVisibility)){this.setBackfaceVisibility(items.backfaceVisibility);}
		if(scrawl.xto([items.rotateX,items.pitch])){this.setPitch(items.rotateX || items.pitch || 0);}
		if(scrawl.xto([items.rotateY,items.yaw])){this.setYaw(items.rotateY || items.yaw || 0);}
		if(scrawl.xto([items.rotateZ,items.rotate,items.roll])){this.setRoll(items.rotateZ || items.rotate || items.roll || 0);}
		if(scrawl.xt(items.translateX)){this.setTranslateX(items.translateX);}
		if(scrawl.xt(items.translateY)){this.setTranslateY(items.translateY);}
		if(scrawl.xt(items.translateZ)){this.setTranslateZ(items.translateZ);}
		if(scrawl.xto([items.rotateX,items.pitch,items.rotateY,items.yaw,items.rotateZ,items.rotate,items.roll,items.translateX,items.translateY,items.translateZ])){
			this.setTransform();
			}
		if(scrawl.xto([items.startX,items.left,items.startY,items.top])){
			this.setDisplayOffsets();
			}
		return this;
		};
	Scrawl3d.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.width)){this.setWidth(this.width+items.width);}
		if(scrawl.xt(items.height)){this.setHeight(this.height+items.height);}
		if(scrawl.xto([items.startX,items.left])){this.setLeft(this.startX+items.startX || this.startX+items.left || this.startX);}
		if(scrawl.xto([items.startY,items.top])){this.setTop(this.startY+items.startY || this.startY+items.top || this.startY);}
		if(scrawl.xto([items.rotateX,items.pitch])){this.setPitch(this.pitch+items.rotateX || this.pitch+items.pitch || this.pitch);}
		if(scrawl.xto([items.rotateY,items.yaw])){this.setYaw(this.yaw+items.rotateY || this.yaw+items.yaw || this.yaw);}
		if(scrawl.xto([items.rotateZ,items.rotate,items.roll])){this.setRoll(this.roll+items.rotateZ || this.roll+items.rotate || this.roll+items.roll || this.roll);}
		if(scrawl.xt(items.translateX)){this.setTranslateX(this.translateX+items.translateX);}
		if(scrawl.xt(items.translateY)){this.setTranslateY(this.translateY+items.translateY);}
		if(scrawl.xt(items.translateZ)){this.setTranslateZ(this.translateZ+items.translateZ);}
		if(scrawl.xto([items.rotateX,items.pitch,items.rotateY,items.yaw,items.rotateZ,items.rotate,items.roll,items.translateX,items.translateY,items.translateZ])){
			this.setTransform();
			}
		if(scrawl.xto([items.startX,items.left,items.startY,items.top])){
			this.setDisplayOffsets();
			}
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
	Scrawl3d.prototype.getPosition = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.position || false;
		};
	Scrawl3d.prototype.setPosition = function(item){
		this.position = (scrawl.xt(item)) ? item : this.position;
		var myDisplay = this.getElement();
		myDisplay.style.position = this.position;
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
	Scrawl3d.prototype.getOverflow = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.overflow || false;
		};
	Scrawl3d.prototype.setOverflow = function(item){
		this.overflow = (scrawl.xt(item)) ? item : this.overflow;
		var myDisplay = this.getElement();
		myDisplay.style.overflow = this.overflow;
		return this;
		};
	Scrawl3d.prototype.getZIndex = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.zIndex || false;
		};
	Scrawl3d.prototype.setZIndex = function(item){
		this.zIndex = item || this.zIndex || 0;
		var myDisplay = this.getElement();
		myDisplay.style.zIndex = this.zIndex;
		return this;
		};
	Scrawl3d.prototype.getWidth = function(){
		var myDisplay = this.getElement();
		return myDisplay.width || myDisplay.clientWidth || parseFloat(myDisplay.style.width) || false;
		};
	Scrawl3d.prototype.setWidth = function(item){
		this.width = (scrawl.xt(item)) ? item : this.width;
		var myDisplay = this.getElement();
		if(this.type === 'Pad'){
			myDisplay.width = (this.width*this.scale);
			}
		else{
			myDisplay.style.width = (this.width*this.scale)+'px';
			}
		return this;
		};
	Scrawl3d.prototype.getHeight = function(){
		var myDisplay = this.getElement();
		return myDisplay.height || myDisplay.clientHeight || parseFloat(myDisplay.style.height) || false;
		};
	Scrawl3d.prototype.setHeight = function(item){
		this.height = (scrawl.xt(item)) ? item : this.height;
		var myDisplay = this.getElement();
		if(this.type === 'Pad'){
			myDisplay.height = (this.height*this.scale);
			}
		else{
			myDisplay.style.height = (this.height*this.scale)+'px';
			}
		return this;
		};
	Scrawl3d.prototype.getStartX = function(){
		return this.getLeft();
		};
	Scrawl3d.prototype.setStartX = function(item, reset){
		return this.setLeft(item, reset);
		};
	Scrawl3d.prototype.getLeft = function(){
		var myDisplay = this.getElement();
		return parseFloat(myDisplay.style.left) || false;
		};
	Scrawl3d.prototype.setLeft = function(item, reset){
		this.startX = (scrawl.xt(item)) ? item : this.startX;
		var myDisplay = this.getElement();
		myDisplay.style.left = (this.startX*this.scale)+'px';
		if(scrawl.xt(reset) && reset){
			this.setDisplayOffsets();
			}
		return this;
		};
	Scrawl3d.prototype.getStartY = function(){
		return this.getTop();
		};
	Scrawl3d.prototype.setStartY = function(item, reset){
		return this.setTop(item, reset);
		};
	Scrawl3d.prototype.getTop = function(){
		var myDisplay = this.getElement();
		return parseFloat(myDisplay.style.top) || false;
		};
	Scrawl3d.prototype.setTop = function(item, reset){
		this.startY = (scrawl.xt(item)) ? item : this.startY;
		var myDisplay = this.getElement();
		myDisplay.style.top = (this.startY*this.scale)+'px';
		if(scrawl.xt(reset) && reset){
			this.setDisplayOffsets();
			}
		return this;
		};
	Scrawl3d.prototype.getPerspective = function(){
		var myDisplay = this.getElement();
		return parseFloat(myDisplay.style.webkitPerspective) || parseFloat(myDisplay.style.MozPerspective) || parseFloat(myDisplay.style.perspective) || false;
		};
	Scrawl3d.prototype.setPerspective = function(item){
		if(this.isIE && this.type === 'Stack'){
			for(var i=0, z=scrawl.stacknames.length; i<z; i++){
				if(scrawl.stack[scrawl.stacknames[i]].stack === this.name){
					scrawl.stack[scrawl.stacknames[i]].setPerspective(item);
					}
				}
			}
		this.perspective = (scrawl.xt(item)) ? item : this.perspective;
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.webkitPerspective)){
			myDisplay.style.webkitPerspective = (this.perspective*this.scale)+'px';
			}
		else if(scrawl.xt(myDisplay.style.MozPerspective)){
			myDisplay.style.MozPerspective = (this.perspective*this.scale)+'px';
			}
		else{
			myDisplay.style.perspective = (this.perspective*this.scale)+'px';
			}
		return this;
		};
	Scrawl3d.prototype.getPerspectiveOrigin = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.webkitPerspectiveOrigin || myDisplay.style.MozPerspectiveOrigin || myDisplay.style.perspectiveOrigin || false;
		};
	Scrawl3d.prototype.setPerspectiveOrigin = function(items){
		if(this.isIE && this.type === 'Stack'){
			for(var i=0, z=scrawl.stacknames.length; i<z; i++){
				if(scrawl.stack[scrawl.stacknames[i]].stack === this.name){
					scrawl.stack[scrawl.stacknames[i]].setPerspectiveOrigin(items);
					}
				}
			}
		if(scrawl.isa(items,'str')){
			var a = items.split(' ');
			this.perspectiveOriginX = a[0] || '50%';
			this.perspectiveOriginY = a[1] || '50%';
			}
		else{
			items = (scrawl.isa(items,'obj')) ? items : {};
			this.perspectiveOriginX = items.perspectiveOriginX || this.perspectiveOriginX || '50%';
			this.perspectiveOriginY = items.perspectiveOriginY || this.perspectiveOriginY || '50%';
			}
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.webkitPerspectiveOrigin)){
			myDisplay.style.webkitPerspectiveOrigin = this.perspectiveOriginX+' '+this.perspectiveOriginY;
			}
		else if(scrawl.xt(myDisplay.style.MozPerspectiveOrigin)){
			myDisplay.style.MozPerspectiveOrigin = this.perspectiveOriginX+' '+this.perspectiveOriginY;
			}
		else{
			myDisplay.style.perspectiveOrigin = this.perspectiveOriginX+' '+this.perspectiveOriginY;
			}
		return this;
		};
	Scrawl3d.prototype.getTransformOrigin = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.webkitTransformOrigin || myDisplay.style.MozTransformOrigin || myDisplay.style.transformOrigin || false;
		};
	Scrawl3d.prototype.setTransformOrigin = function(items){
		if(scrawl.isa(items,'str')){
			var a = items.split(' ');
			this.transformOriginX = a[0] || '50%';
			this.transformOriginY = a[1] || '50%';
			}
		else{
			items = (scrawl.isa(items,'obj')) ? items : {};
			this.transformOriginX = items.transformOriginX || this.transformOriginX || '50%';
			this.transformOriginY = items.transformOriginY || this.transformOriginY || '50%';
			}
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.webkitTransformOrigin)){
			myDisplay.style.webkitTransformOrigin = this.transformOriginX+' '+this.transformOriginY;
			}
		else if(scrawl.xt(myDisplay.style.MozTransformOrigin)){
			myDisplay.style.MozTransformOrigin = this.transformOriginX+' '+this.transformOriginY;
			}
		else{
			myDisplay.style.transformOrigin = this.transformOriginX+' '+this.transformOriginY;
			}
		return this;
		};
	Scrawl3d.prototype.getTransformStyle = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.WebkitTransformStyle || myDisplay.style.MozTransformStyle || myDisplay.style.transformStyle || false;
		};
	Scrawl3d.prototype.setTransformStyle = function(item){
		this.transformStyle = (scrawl.xt(item)) ? item : this.transformStyle;
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.WebkitTransformStyle)){
			myDisplay.style.WebkitTransformStyle = this.transformStyle;
			}
		else if(scrawl.xt(myDisplay.style.MozTransformStyle)){
			myDisplay.style.MozTransformStyle = this.transformStyle;
			}
		else{
			myDisplay.style.transformStyle = this.transformStyle;
			}
		return this;
		};
	Scrawl3d.prototype.getRotateX = function(){return this.getPitch();};
	Scrawl3d.prototype.getPitch = function(){
		return this.pitch || false;
		};
	Scrawl3d.prototype.getRotateY = function(){return this.getYaw();};
	Scrawl3d.prototype.getYaw = function(){
		return this.yaw || false;
		};
	Scrawl3d.prototype.getRotateZ = function(){return this.getRoll();};
	Scrawl3d.prototype.getRotate = function(){return this.getRoll();};
	Scrawl3d.prototype.getRoll = function(){
		return this.roll || false;
		};
	Scrawl3d.prototype.setRotateX = function(item){return this.setPitch(item);};
	Scrawl3d.prototype.setPitch = function(item){
		this.pitch = item || this.pitch || 0;
		return this;
		};
	Scrawl3d.prototype.setRotateY = function(item){return this.setYaw(item);};
	Scrawl3d.prototype.setYaw = function(item){
		this.yaw = item || this.yaw || 0;
		return this;
		};
	Scrawl3d.prototype.setRotateZ = function(item){return this.setRoll(item);};
	Scrawl3d.prototype.setRotate = function(item){return this.setRoll(item);};
	Scrawl3d.prototype.setRoll = function(item){
		this.roll = item || this.roll || 0;
		return this;
		};
	Scrawl3d.prototype.getTranslateX = function(){
		return this.translateX || false;
		};
	Scrawl3d.prototype.setTranslateX = function(item){
		this.translateX = item || this.translateX || 0;
		return this;
		};
	Scrawl3d.prototype.getTranslateY = function(){
		return this.translateY || false;
		};
	Scrawl3d.prototype.setTranslateY = function(item){
		this.translateY = item || this.translateY || 0;
		return this;
		};
	Scrawl3d.prototype.getTranslateZ = function(){
		return this.translateZ || false;
		};
	Scrawl3d.prototype.setTranslateZ = function(item){
		this.translateZ = item || this.translateZ || 0;
		return this;
		};
	Scrawl3d.prototype.setRotateFirst = function(item){
		this.rotateFirst = (scrawl.isa(item,'bool')) ? item : false;
		return this;
		};
	Scrawl3d.prototype.getTransform = function(){
		if(this.rotateFirst){
			return 'rotateX('+this.pitch+'deg) rotateY('+this.yaw+'deg) rotateZ('+this.roll+'deg) translateX('+(this.translateX*this.scale)+'px) translateY('+(this.translateY*this.scale)+'px) translateZ('+(this.translateZ*this.scale)+'px)';
			}
		else{
			return 'translateX('+(this.translateX*this.scale)+'px) translateY('+(this.translateY*this.scale)+'px) translateZ('+(this.translateZ*this.scale)+'px) rotateX('+this.pitch+'deg) rotateY('+this.yaw+'deg) rotateZ('+this.roll+'deg)';
			}
		};
	Scrawl3d.prototype.setTransform = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.setPitch(items.pitch || items.rotateX || false);
		this.setYaw(items.yaw || items.rotateY || false);
		this.setRoll(items.roll || items.rotateZ || items.rotate || false);
		this.setTranslateX(items.translateX || false);
		this.setTranslateY(items.translateY || false);
		this.setTranslateZ(items.translateZ || false);
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.webkitTransform)){
			myDisplay.style.webkitTransform = this.getTransform();
			}
		else if(scrawl.xt(myDisplay.style.MozTransform)){
			myDisplay.style.MozTransform = this.getTransform();
			}
		else{
			if(this.isIE && this.type === 'Stack'){
				myDisplay.style.transform = this.getTransform();
				for(var i=0, z=scrawl.stacknames.length; i<z; i++){
					if(scrawl.stack[scrawl.stacknames[i]].stack === this.name){
						scrawl.stack[scrawl.stacknames[i]].setTransform();
						}
					}
				for(var i=0, z=scrawl.elementnames.length; i<z; i++){
					if(scrawl.element[scrawl.elementnames[i]].stack === this.name){
						scrawl.element[scrawl.elementnames[i]].setTransform();
						}
					}
				for(var i=0, z=scrawl.padnames.length; i<z; i++){
					if(scrawl.pad[scrawl.padnames[i]].stack === this.name){
						scrawl.pad[scrawl.padnames[i]].setTransform();
						}
					}
				}
			else{
				myDisplay.style.transform = this.getTransform();
				}
			}
		return this;
		};
	Scrawl3d.prototype.getBackfaceVisibility = function(){
		var myDisplay = this.getElement();
		return myDisplay.style.webkitBackfaceVisibility || myDisplay.style.MozBackfaceVisibility || myDisplay.style.backfaceVisibility || false;
		};
	Scrawl3d.prototype.setBackfaceVisibility = function(item){
		this.backfaceVisibility = (scrawl.xt(item)) ? item : this.backfaceVisibility;
		var myDisplay = this.getElement();
		if(scrawl.xt(myDisplay.style.webkitBackfaceVisibility)){
			myDisplay.style.webkitBackfaceVisibility = this.backfaceVisibility;
			}
		else if(scrawl.xt(myDisplay.style.MozBackfaceVisibility)){
			myDisplay.style.MozBackfaceVisibility = this.backfaceVisibility;
			}
		else{
			myDisplay.style.backfaceVisibility = this.backfaceVisibility;
			}
		return this;
		};
	Scrawl3d.prototype.shiftPosition = function(){
		this.shiftLeft();
		this.shiftTop();
		this.setDisplayOffsets();
		return this;
		};
	Scrawl3d.prototype.shiftLeft = function(reset){
		this.moveStart('x');
		this.setLeft();
		if(scrawl.xt(reset) && reset){
			this.setDisplayOffsets();
			}
		return this;
		};
	Scrawl3d.prototype.shiftTop = function(item, reset){
		this.moveStart('y');
		this.setTop();
		if(scrawl.xt(reset) && reset){
			this.setDisplayOffsets();
			}
		return this;
		};
	Scrawl3d.prototype.scaleStack = function(item){
		if(this.type === 'Stack'){
			for(var i=0, z=scrawl.stacknames.length; i<z; i++){
				if(scrawl.stack[scrawl.stacknames[i]].stack === this.name){
					scrawl.stack[scrawl.stacknames[i]].scaleStack(item);
					}
				}
			for(var i=0, z=scrawl.elementnames.length; i<z; i++){
				if(scrawl.element[scrawl.elementnames[i]].stack === this.name){
					scrawl.element[scrawl.elementnames[i]].scaleDimensions(item);
					}
				}
			for(var i=0, z=scrawl.padnames.length; i<z; i++){
				if(scrawl.pad[scrawl.padnames[i]].stack === this.name){
					scrawl.pad[scrawl.padnames[i]].scaleDimensions(item);
					}
				}
			this.scaleDimensions(item);
			}
		return this;
		};
	Scrawl3d.prototype.scaleDimensions = function(item){
		this.scale = item || this.scale;
		this.setWidth();
		this.setHeight();
		this.setTop();
		this.setLeft();
		this.setPerspectiveOrigin();
		this.setPerspective();
		this.setTransformOrigin();
		this.setTransform();
		this.setDisplayOffsets();
		if(this.type === 'Pad'){
			scrawl.cell[this.display].scale = this.scale;
			}
		return this;
		};
		
	function Stack(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.stackElement)){
			var tempname = '';
			if(scrawl.xto([items.stackElement.id,items.stackElement.name])){
				tempname = items.stackElement.id || items.stackElement.name;
				}
			Scrawl3d.call(this, {name: tempname,});
			scrawl.stack[this.name] = this;
			scrawl.stk[this.name] = items.stackElement;
			scrawl.stacknames.pushUnique(this.name);
			scrawl.stk[this.name].style.position = 'relative';
			scrawl.stk[this.name].id = this.name;
			this.initialize2d(items);
			this.initialize3d(items);
			return this;
			}
		console.log('Failed to generate a Stack wrapper - no DOM element supplied'); 
		return false;
		}
	Stack.prototype = Object.create(Scrawl3d.prototype);
	Stack.prototype.type = 'Stack';
	Stack.prototype.classname = 'stacknames';
	Stack.prototype.getElement = function(){
		return scrawl.stk[this.name];
		};
	Stack.prototype.addElementById = function(item){
		if(scrawl.isa(item,'str')){
			var myElement = scrawl.newElement({
				domElement: document.getElementById(item),
				stack: this.name,
				});
			scrawl.stk[this.name].appendChild(scrawl.elm[myElement.name]);
			scrawl.elm[myElement.name] = document.getElementById(myElement.name);
			scrawl.setDisplayOffsets('all');
			return myElement;
			}
		return false;
		};
	Stack.prototype.addElementsByClassName = function(item){
		if(scrawl.isa(item,'str')){
			var myElements = [];
			var myArray = document.getElementsByClassName(item);
			var myElement, myElm, thisElement;
			for(var i=0, z=myArray.length; i<z; i++){
				thisElement = myArray[i]
				if(thisElement.nodeName !== 'CANVAS'){
					myElement = scrawl.newElement({
						domElement: thisElement,
						stack: this.name,
						});
					myElements.push(myElement);
					}
				}
			for(var i=0, z=myElements.length; i<z; i++){
				scrawl.stk[this.name].appendChild(scrawl.elm[myElements[i].name]);
				scrawl.elm[myElements[i].name] = document.getElementById(myElements[i].name);
				}
			scrawl.setDisplayOffsets('all');
			return myElements;
			}
		return false;
		};
	
	function Element(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.domElement)){
			var tempname = '';
			if(scrawl.xto([items.domElement.id,items.domElement.name])){
				tempname = items.domElement.id || items.domElement.name;
				}
			Scrawl3d.call(this, {name: tempname,});
			scrawl.element[this.name] = this;
			scrawl.elm[this.name] = items.domElement;
			scrawl.elementnames.pushUnique(this.name);
			scrawl.elm[this.name].style.position = 'absolute';
			scrawl.elm[this.name].id = this.name;
			this.initialize2d(items);
			this.initialize3d(items);
			return this;
			}
		console.log('Failed to generate an Element wrapper - no DOM element supplied'); 
		return false;
		}
	Element.prototype = Object.create(Scrawl3d.prototype);
	Element.prototype.type = 'Element';
	Element.prototype.classname = 'elementnames';
	Element.prototype.getElement = function(){
		return scrawl.elm[this.name];
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
	Pad.prototype.getCellsForDisplayAction = function(command){
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
		return temp;
		};
	Pad.prototype.clear = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].clear();
			}
		return this;
		};
	Pad.prototype.compile = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].compile();
			}
		return this;
		};
	Pad.prototype.stampBackground = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].stampBackground();
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
			data.width = parseFloat((data.width).toFixed());
			data.height = parseFloat((data.height).toFixed());
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
			this.sourceMaxWidth = items.sourceMaxWidth || this.sourceWidth;
			this.sourceMaxHeight = items.sourceMaxHeight || this.sourceHeight;
			this.sourceMinWidth = items.sourceMinWidth || this.sourceWidth;
			this.sourceMinHeight = items.sourceMinHeight || this.sourceHeight;
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
	Cell.prototype.zoom = function(item){
		if(scrawl.isa(item,'num')){
			var myW = this.sourceWidth + item;
			var myH = this.sourceHeight + item;
			if(myW.isBetween(this.sourceMinWidth,this.sourceMaxWidth,true) && myH.isBetween(this.sourceMinHeight,this.sourceMaxHeight,true)){
				this.sourceWidth = myW;
				var myX = this.sourceX - (item/2);
				if(myX < 0){
					this.sourceX = 0;
					}
				else if(myX > (this.actualWidth - this.sourceWidth)){
					this.sourceX = this.actualWidth - this.sourceWidth;
					}
				else{
					this.sourceX = myX;
					}
				this.sourceHeight = myH;
				var myY = this.sourceY - (item/2);
				if(myY < 0){
					this.sourceY = 0;
					}
				else if(myY > (this.actualHeight - this.sourceHeight)){
					this.sourceY = this.actualHeight - this.sourceHeight;
					}
				else{
					this.sourceY = myY;
					}
				}
			}
		return this;
		};
	Cell.prototype.buildField = function(){
		var fieldSprites, fenceSprites, tempsprite, tempfill, tempstroke;
		var buildFieldBlock = new Block({
			width: this.actualWidth,
			height: this.actualHeight,
			group: this.name,
			}).stamp();
		scrawl.deleteSprite(buildFieldBlock.name);
		fieldSprites = scrawl.group[this.name+'_field'].sprites;
		for(var i=0, z=fieldSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fieldSprites[i]];
			tempfill = scrawl.ctx[tempsprite.context].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.context].strokeStyle;
			scrawl.ctx[tempsprite.context].fillStyle = 'rgba(255,255,255,1)';
			scrawl.ctx[tempsprite.context].strokeStyle = 'rgba(255,255,255,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			scrawl.ctx[tempsprite.context].fillStyle = tempfill;
			scrawl.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		fenceSprites = scrawl.group[this.name+'_fence'].sprites;
		for(var i=0, z=fenceSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fenceSprites[i]];
			tempfill = scrawl.ctx[tempsprite.context].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.context].strokeStyle;
			scrawl.ctx[tempsprite.context].fillStyle = 'rgba(0,0,0,1)';
			scrawl.ctx[tempsprite.context].strokeStyle = 'rgba(0,0,0,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			scrawl.ctx[tempsprite.context].fillStyle = tempfill;
			scrawl.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		this.fieldLabel = this.getImageData({
			name: 'field',
			});
		return this;
		};
	Cell.prototype.checkFieldAt = function(items){
//		items.coordinates - list of coordinates - sprite.getCoordinates()
//		items.test - minimum threshhold against which the check will be made - sprite.fieldTest
//		items.channel - one from: red, green, blue, alpha, anycolor - sprite.fieldChannel
//		items.x, items.y - a single coordinate
//			gonna change this:
//				if all coordinates pass the test, return -1
//				if a coordinate fails, return the index of that coordinate (1, 2, 3, etc)
//				if a coordinate is out of bounds, or no coordinates are supplied, return false
		items = (scrawl.isa(items,'obj')) ? items : false;
		if(scrawl.xt(items.coordinates) || scrawl.xta([items.x,items.y])){
			var myChannel = items.channel || 'anycolor';
			var myTest = items.test || 0;
			var x, y, coords, pos;
			if(!scrawl.xt(items.coordinates)){
				coords = [{
					x: items.x || 0,
					y: items.y || 0,
					}];
				}
			else{
				coords = items.coordinates;
				}
			var d = scrawl.imageData[this.fieldLabel];
			var result;
			for(var i=0, z=coords.length; i<z; i++){
				x = parseFloat((coords[i].x).toFixed());
				y = parseFloat((coords[i].y).toFixed());
				if(!x.isBetween(0, d.width, true) || !y.isBetween(0, d.height, true)){
					return false;
					break;
					}
				else{
					result = false;
					pos = ((y * d.width) + x) * 4;
					switch(myChannel){
						case 'red' : 
							if(d.data[pos] <= myTest){
								return i+1;
								}
							break;
						case 'green' : 
							if(d.data[pos+1] <= myTest){
								return i+1;
								}
							break;
						case 'blue' : 
							if(d.data[pos+2] <= myTest){
								return i+1;
								}
							break;
						case 'alpha' : 
							if(d.data[pos+3] <= myTest){
								return i+1;
								}
							break;
						case 'anycolor' :
							if(d.data[pos] <= myTest || d.data[pos+1] <= myTest || d.data[pos+2] <= myTest){
								return i+1;
								}
							break;
						}
					}
				}
			return -1;
			}
		return false;
		};
	Cell.prototype.setEngine = function(sprite){
		var myContext = scrawl.ctx[this.context];
		var spriteContext = scrawl.ctx[sprite.context];
		var changes = spriteContext.getChanges(myContext, sprite.scale, sprite.scaleOutline);
		var engine = scrawl.context[this.name];
		var tempFillStyle, tempStrokeStyle;
		for(var item in changes){
			switch(item){
				case 'name' :
					break;
				case 'fillStyle' :
					if(scrawl.xt(scrawl.dsn[changes[item]])){
						var des	= scrawl.design[changes[item]];
						if(des.setToSprite){
							if(scrawl.xta([sprite.currentX,sprite.currentWidth,des.startRangeX,sprite.currentY,sprite.currentHeight,des.startRangeY,des.endRangeX,des.endRangeY])){
								if(des.type === 'Gradient'){
									switch (sprite.type) {
										case 'Wheel' :
										case 'Shape' :
											des.set({
												startX: sprite.currentX-(sprite.currentWidth/2),
												startY: sprite.currentY-(sprite.currentHeight/2),
												endX: sprite.currentX+(sprite.currentWidth/2),
												endY: sprite.currentY+(sprite.currentHeight/2),
												}).update();
											break;
										default :
											des.set({
												startX: sprite.currentX+(sprite.currentWidth*des.startRangeX),
												startY: sprite.currentY+(sprite.currentHeight*des.startRangeY),
												endX: sprite.currentX+(sprite.currentWidth*des.endRangeX),
												endY: sprite.currentY+(sprite.currentHeight*des.endRangeY),
												}).update();
										}
									}
								else{
									switch(sprite.type){
										case 'Wheel' :
										case 'Shape' :
											des.set({
												startX: sprite.currentX,
												startY: sprite.currentY,
												startRadius: sprite.currentWidth/2,
												endX: sprite.currentX,
												endY: sprite.currentY,
												endRadius: 0,
												}).update();
											break;
										default :
											des.set({
												startX: sprite.currentX+(sprite.currentWidth*des.startRangeX),
												startY: sprite.currentY+(sprite.currentHeight*des.startRangeY),
												startRadius: ((sprite.currentWidth+sprite.currentHeight)/2)*des.startRangeRadius,
												endX: sprite.currentX+(sprite.currentWidth*des.endRangeX),
												endY: sprite.currentY+(sprite.currentHeight*des.endRangeY),
												endRadius: 0,
												}).update();
										}
									}
								}
							}
						tempFillStyle = scrawl.dsn[changes[item]];
						}
					else if(scrawl.xt(scrawl.design[changes[item]])){
						tempFillStyle = scrawl.design[changes[item]].get();
						}
					else if(scrawl.isa(changes[item],'str')){
						tempFillStyle = changes[item];
						}
					engine.fillStyle = tempFillStyle;
					break;
				case 'winding' :
					engine.mozFillRule = changes[item];
					engine.msFillRule = changes[item];
					break;
				case 'strokeStyle' :
					if(scrawl.xt(scrawl.dsn[changes[item]])){
						var des	= scrawl.design[changes[item]];
						if(des.setToSprite){
							if(scrawl.xta([sprite.currentX,sprite.currentWidth,des.startRangeX,sprite.currentY,sprite.currentHeight,des.startRangeY,des.endRangeX,des.endRangeY])){
								if(des.type === 'Gradient'){
									switch (sprite.type) {
										case 'Wheel' :
										case 'Shape' :
											des.set({
												startX: sprite.currentX-(sprite.currentWidth/2),
												startY: sprite.currentY-(sprite.currentHeight/2),
												endX: sprite.currentX+(sprite.currentWidth/2),
												endY: sprite.currentY+(sprite.currentHeight/2),
												}).update();
											break;
										default :
											des.set({
												startX: sprite.currentX+(sprite.currentWidth*des.startRangeX),
												startY: sprite.currentY+(sprite.currentHeight*des.startRangeY),
												endX: sprite.currentX+(sprite.currentWidth*des.endRangeX),
												endY: sprite.currentY+(sprite.currentHeight*des.endRangeY),
												}).update();
										}
									}
								else{
									switch(sprite.type){
										case 'Wheel' :
										case 'Shape' :
											des.set({
												startX: sprite.currentX,
												startY: sprite.currentY,
												startRadius: sprite.currentWidth/2,
												endX: sprite.currentX,
												endY: sprite.currentY,
												endRadius: 0,
												}).update();
											break;
										default :
											des.set({
												startX: sprite.currentX+(sprite.currentWidth*des.startRangeX),
												startY: sprite.currentY+(sprite.currentHeight*des.startRangeY),
												startRadius: ((sprite.currentWidth+sprite.currentHeight)/2)*des.startRangeRadius,
												endX: sprite.currentX+(sprite.currentWidth*des.endRangeX),
												endY: sprite.currentY+(sprite.currentHeight*des.endRangeY),
												endRadius: 0,
												}).update();
										}
									}
								}
							}
						tempStrokeStyle = scrawl.dsn[changes[item]];
						}
					else if(scrawl.xt(scrawl.design[changes[item]])){
						tempStrokeStyle = scrawl.design[changes[item]].get();
						}
					else if(scrawl.isa(changes[item],'str')){
						tempStrokeStyle = changes[item];
						}
					engine.strokeStyle = tempStrokeStyle;
					break;
				case 'lineDash' :
					engine.mozDash = changes[item];
					engine.lineDash = changes[item];
					try{engine.setLineDash(changes[item]);}catch(e){}
					break;
				case 'lineDashOffset' : 
					engine.mozDashOffset = changes[item]; 
					engine.lineDashOffset = changes[item]; 
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
				if(scrawl.xt(scrawl.dsn[changes[item]])){
					if('fillStyle' === item){
						if(engine.fillStyle === tempFillStyle){
							myContext[item] = changes[item];
							}
						}
					else if('strokeStyle' === item){
						if(engine.strokeStyle === tempStrokeStyle){
							myContext[item] = changes[item];
							}
						}
					}
				else{
					myContext[item] = changes[item];
					}
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
			this.stampBackground();
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
	Cell.prototype.stampBackground = function(){
		var ctx = scrawl.context[this.name];
		var tempFillStyle = ctx.fillStyle;
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(this.actualX-this.cellX, this.actualY-this.cellY, this.actualWidth, this.actualHeight);
		ctx.fillStyle = tempFillStyle;
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
	Cell.prototype.getCopyScaling = function(cell){
		cell = (scrawl.isa(cell,'str')) ? scrawl.cell[cell] : cell;
		if(scrawl.xt(cell)){
			var mySourceWidth = (cell.usePadDimensions) ? scrawl.pad[cell.pad].width : cell.sourceWidth;
			var mySourceHeight = (cell.usePadDimensions) ? scrawl.pad[cell.pad].height : cell.sourceHeight;
			var myTargetWidth = (cell.usePadDimensions) ? scrawl.pad[cell.pad].width*this.scale : cell.targetWidth*this.scale;
			var myTargetHeight = (cell.usePadDimensions) ? scrawl.pad[cell.pad].height*this.scale : cell.targetHeight*this.scale;
			return({w: myTargetWidth/mySourceWidth, h: myTargetHeight/mySourceHeight});
			}
		return false;
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
	Cell.prototype.restoreShadow = function(spritecontext){
		var engine = scrawl.context[this.name];
		var context = scrawl.ctx[this.context];
		var spritectx = scrawl.ctx[spritecontext];
		engine.shadowOffsetX = spritectx.shadowOffsetX;
		context.shadowOffsetX = spritectx.shadowOffsetX;
		engine.shadowOffsetY = spritectx.shadowOffsetY;
		context.shadowOffsetY = spritectx.shadowOffsetY;
		engine.shadowBlur = spritectx.shadowBlur;
		context.shadowBlur = spritectx.shadowBlur;
		engine.shadowColor = spritectx.shadowColor;
		context.shadowColor = spritectx.shadowColor;
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
	Cell.prototype.rotateCell = function(value){
		if(scrawl.isa(value,'num')){
			var deltaRotation = (value - this.roll) * scrawl.radian;
			if(deltaRotation !== 0){
				scrawl.context[this.name].rotate(deltaRotation);
				}
			this.roll = value;
			}
		return this;
		};
	Cell.prototype.resetRotation = function(){
		scrawl.context[this.name].rotate(-this.roll * scrawl.radian);
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
		this.winding = (scrawl.isa(items.winding,'str')) ? items.winding : 'nonzero';
		this.strokeStyle = (scrawl.isa(items.strokeStyle,'str')) ? items.strokeStyle : '#000000';
		this.globalAlpha = (scrawl.isa(items.globalAlpha,'num')) ? items.globalAlpha : 1;
		this.globalCompositeOperation = (scrawl.isa(items.globalCompositeOperation,'str')) ? items.globalCompositeOperation : 'source-over';
		this.lineWidth = (scrawl.isa(items.lineWidth,'num')) ? items.lineWidth : 1;
		this.lineCap = (scrawl.isa(items.lineCap,'str')) ? items.lineCap : 'butt';
		this.lineJoin = (scrawl.isa(items.lineJoin,'str')) ? items.lineJoin : 'miter';
		this.lineDash = (scrawl.isa(items.lineDash,'arr')) ? items.lineDash : [];
		this.lineDashOffset = (scrawl.isa(items.lineDashOffset,'num')) ? items.lineDashOffset : 0;
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
		defaults.winding = ctx.mozFillRule || ctx.msFillRule || 'nonzero';
		defaults.lineDash = [];
		defaults.lineDashOffset = ctx.mozDashOffset || ctx.lineDashOffset;
		return this;
		};
	Context.prototype.getChanges = function(ctx, scale, doscale){
		var r = {};
		for(var item in this){
			if(doscale && ['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'].contains(item)){
				if(this[item]*scale !== ctx[item]){
					r[item] = this[item]*scale;
					}
				}
			else if(['fillStyle', 'strokeStyle'].contains(item)){
				if(scrawl.designnames.contains(this[item])){
					if(scrawl.design[this[item]].type === 'Color' && scrawl.design[this[item]].autoUpdate){
						scrawl.design[this[item]].update();
						r[item] = this[item];
						}
					else if(['Gradient','RadialGradient'].contains(scrawl.design[this[item]].type) && (scrawl.design[this[item]].roll || scrawl.design[this[item]].autoUpdate)){
						scrawl.design[this[item]].update();
						r[item] = this[item];
						}
					else if(this[item] !== ctx[item]){
						r[item] = this[item];
						}
					}
				else if(this[item] !== ctx[item]){
					r[item] = this[item];
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
			this.width = parseFloat(items.element.offsetWidth) || items.element.width || items.element.style.width || 0;
			this.height = parseFloat(items.element.offsetHeight) || items.element.height || items.element.style.height || 0;
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
	ScrawlImage.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Link
			width: (this.width !== 0) ? this.width : u,
			height: (this.height !== 0) ? this.height : u,
			imageData: (scrawl.xt(scrawl.imageData[this.name])) ? scrawl.imageData[this.name] : u,
			source: (this.source) ? this.source : u,
			element: (scrawl.xt(scrawl.img[this.name])) ? scrawl.img[this.name].id : u,
			copyX: (this.copyX !== 0) ? this.copyX : u,
			copyY: (this.copyY !== 0) ? this.copyY : u,
			copyWidth: (this.copyWidth !== 0) ? this.copyWidth : u,
			copyHeight: (this.copyHeight !== 0) ? this.copyHeight : u,
			};
		};
	ScrawlImage.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			width: 0,
			height: 0,
			copyX: 0,
			copyY: 0,
			copyWidth: 0,
			copyHeight: 0,
			});
		return this;
		};
	ScrawlImage.prototype.getImageData = function(){
		var c = document.createElement('canvas');
		c.width = this.width;
		c.height = this.height;
		var cx = c.getContext('2d');
		cx.drawImage(scrawl.img[this.name],0,0);
		return c.toDataURL();
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
	AnimSheet.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//AnimSheet
			sheet: (this.sheet) ? this.sheet : u,
			frames: (this.frames.length > 0) ? this.frames : u,
			currentFrame: (this.currentFrame !== 0) ? this.currentFrame : u,
			speed: (this.speed !== 1) ? this.speed : u,
			loop: (this.loop !== 'end') ? this.loop : u,
			running: (this.running !== 'complete') ? this.running : u,
			lastCalled: (this.lastCalled) ? this.lastCalled : u,
			};
		};
	AnimSheet.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			sheet: false,
			frames: [],
			currentFrame: 0,
			speed: 1,
			loop: 'end',
			running: 'complete',
			lastCalled: false,
			});
		return this;
		};
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
		return this;
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
		this.fieldTest = items.fieldTest || 0;
		this.fieldChannel = items.fieldChannel || 'anycolor';
		this.roll = items.roll || 0;
		this.groups = (scrawl.xt(items.groups)) ? [].concat(items.groups) : [];
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
	Group.prototype.exportNative = function(items){
		items = (scrawl.xt(items)) ? items : {string: true};
		var myItems = {
			includeDesigns: items.includeDesigns || true,
			includeImages: items.includeImages || false,
			string: false,
			};
		var result = [], temp;
		result.push(this.prepareForExport());
		for(var i=0, z=this.groups.length; i<z; i++){
			if(this.groups[i] !== this.name){
				temp = scrawl.group[this.groups[i]].exportNative(myItems);
				for(var j=0, w=temp.length; j<w; j++){
					result.pushUnique(temp[j]);
					}
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			temp = scrawl.sprite[this.sprites[i]].exportNative(myItems);
			for(var j=0, w=temp.length; j<w; j++){
				result.pushUnique(temp[j]);
				}
			}
		var result2 = [];
		var check = [];
		for(var i=0, z=result.length; i<z; i++){
			if(!check.contains(result[i].name)){
				result2.push(result[i]);
				check.push(result[i].name);
				}
			}
		return (items.string) ? JSON.stringify(result2) : result2;
		};
	Group.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//SubScrawl
			startX: (this.startX !== 0) ? this.startX : u,
			startY: (this.startY !== 0) ? this.startY : u,
			handleX: (this.handleX !== 0) ? this.handleX : u,
			handleY: (this.handleY !== 0) ? this.handleY : u,
			moveStartX: (this.moveStartX !== 0) ? this.moveStartX : u,
			moveStartY: (this.moveStartY !== 0) ? this.moveStartY : u,
			moveHandleX: (this.moveHandleX !== 0) ? this.moveHandleX : u,
			moveHandleY: (this.moveHandleY !== 0) ? this.moveHandleY : u,
			pivot: (this.pivot) ? this.pivot : u,
			path: (this.path) ? this.path : u,
			pathPosition: (this.pathPosition !== 0) ? this.pathPosition : u,
			movePathPosition: (this.movePathPosition !== 0) ? this.movePathPosition : u,
			pathSpeedConstant: (!this.pathSpeedConstant) ? this.pathSpeedConstant : u,
			pathRoll: (this.pathRoll !== 0) ? this.pathRoll : u,
			addPathRoll: (this.addPathRoll) ? this.addPathRoll : u,
			scale: (this.scale !== 1) ? this.scale : u,
			//Group
			groups: (this.groups.length > 0) ? this.groups : u,
			cells: (this.cells.length > 0) ? this.cells : u,
			order: (this.order !== 0) ? this.order : u,
			visibility: (!this.visibility) ? this.visibility : u,
			isSprite: (this.isSprite) ? this.isSprite : u,
			isMarker: (this.isMarker) ? this.isMarker : u,
			isDefinition: (this.isDefinition) ? this.isDefinition : u,
			method: (this.method) ? this.method : u,
			fieldTest: (this.fieldTest !== 0) ? this.fieldTest : u,
			fieldChannel: (this.fieldChannel !== 'anycolor') ? this.fieldChannel : u,
			roll: (this.roll !== 0) ? this.roll : u,
			};
		};
	Group.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			startX: 0,
			startY: 0,
			handleX: 0,
			handleY: 0,
			moveStartX: 0,
			moveStartY: 0,
			moveHandleX: 0,
			moveHandleY: 0,
			pivot: false,
			path: false,
			pathPosition: 0,
			movePathPosition: 0,
			pathSpeedConstant: true,
			pathRoll: 0,
			addPathRoll: false,
			scale: 1,
			groups: [],
			cells: [],
			order: 0,
			visibility: true,
			isSprite: false,
			isMarker: false,
			isDefinition: false,
			fieldTest: 0,
			fieldChannel: 'anycolor',
			roll: 0,
			});
		return this;
		};
	Group.prototype.sortSprites = function(){
		this.sprites.sort(function(a,b){
			return scrawl.sprite[a].order - scrawl.sprite[b].order;
			});
		};
	Group.prototype.sortGroups = function(){
		this.groups.sort(function(a,b){
			return scrawl.group[a].order - scrawl.group[b].order;
			});
		};
	Group.prototype.getOverride = function(sprite, myMethod, myCell){
		myMethod = (scrawl.xt(myMethod)) ? myMethod : this.method;
		myCell = (scrawl.xt(myCell)) ? myCell : this.cells;
		if(!scrawl.xt(sprite) || scrawl.sprite[sprite].pivot !== this.name){
			return {
				x: this.getStartX(),
				y: this.getStartY(),
				r: this.roll,
				s: this.scale,
				method: myMethod,
				cells: myCell,
				};
			}
		else{
			return {
				x: 0,
				y: 0,
				r: this.roll,
				s: this.scale,
				method: myMethod,
				cells: myCell,
				};
			}
		};
	Group.prototype.forceStamp = function(method, cell){
		var temp = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = temp;
		return this;
		};
	Group.prototype.stamp = function(method, cell){
		this.sortSprites();
		var myMethod = (scrawl.isa(method,'str')) ? method : this.method;
		var myCell = (scrawl.xt(cell)) ? [].concat(cell) : this.cells;
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].stamp(this.getOverride(this.sprites[i], myMethod, myCell));
			}
		if(this.groups.length > 0){
			this.sortGroups();
			for(var i=0, z=this.groups.length; i<z; i++){
				if(scrawl.group[this.groups[i]].name !== this.name){
					scrawl.group[this.groups[i]].forceStamp(method, cell);
					}
				}
			}
		return this;
		};
	Group.prototype.getSpriteAt = function(items){
		this.sortSprites();
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.x,items.y])){
			items.pad = (scrawl.xt(items.pad)) ? items.pad : scrawl.pad[scrawl.cell[this.cells[0]].pad].name;
			for(var i=this.sprites.length-1; i>=0; i--){
				if(scrawl.sprite[this.sprites[i]].checkHit(items, {x: this.getStartX(), y: this.getStartY()})){
					return scrawl.sprite[this.sprites[i]];
					}
				}
			}
		return false;
		};
	Group.prototype.getInGroupSpriteHits = function(){
		var hits = [], flag;
		var oCollisionPoints = {x: this.getStartX(), y: this.getStartY(), r: this.roll, s: this.scale};
		var oCollisions = {x: this.getStartX(), y: this.getStartY(), r: this.roll, s: this.scale, pad: scrawl.pad[scrawl.cell[this.cells[0]].pad].name};
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(scrawl.sprite[this.sprites[i]].visibility){
				for(var j=i+1, w=this.sprites.length; j<w; j++){
					if(scrawl.sprite[this.sprites[j]].visibility){
						flag = false;
						if(scrawl.sprite[this.sprites[j]].checkHit({tests: scrawl.sprite[this.sprites[i]].getCollisionPoints(oCollisionPoints)}, oCollisions)){
							hits.push([this.sprites[i],this.sprites[j]]);
							flag = true;
							break;
							}
						if(!flag){
							if(scrawl.sprite[this.sprites[i]].checkHit({tests: scrawl.sprite[this.sprites[j]].getCollisionPoints(oCollisionPoints)}, oCollisions)){
								hits.push([this.sprites[i],this.sprites[j]]);
								break;
								}
							}
						}
					}
				}
			}
		return hits;
		};
	Group.prototype.getBetweenGroupSpriteHits = function(g){
		if(scrawl.xt(g)){
			if(scrawl.isa(g,'str')){
				if(scrawl.groupnames.contains(g)){
					g = scrawl.group[g];
					}
				else{
					return false;
					}
				}
			else{
				if(!scrawl.xt(g.type) || g.type !== 'Group'){
					return false;
					}
				}
			var hits = [], flag;
			var oCollisions = {x: this.getStartX(), y: this.getStartY(), r: this.roll, s: this.scale, pad: scrawl.pad[scrawl.cell[this.cells[0]].pad].name};
			var gCollisions = {x: g.getStartX(), y: g.getStartY(), r: this.roll, s: this.scale, pad: scrawl.pad[scrawl.cell[g.cells[0]].pad].name};
			for(var i=0, z=this.sprites.length; i<z; i++){
				if(scrawl.sprite[this.sprites[i]].visibility){
					for(var j=0, w=g.sprites.length; j<w; j++){
						if(scrawl.sprite[g.sprites[j]].visibility){
							flag = false;
							if(scrawl.sprite[g.sprites[j]].checkHit({tests: scrawl.sprite[this.sprites[i]].getCollisionPoints(oCollisions)}, gCollisions)){
								hits.push([this.sprites[i],g.sprites[j]]);
								flag = true;
								}
							if(!flag){
								if(scrawl.sprite[this.sprites[i]].checkHit({tests: scrawl.sprite[g.sprites[j]].getCollisionPoints(gCollisions)}, oCollisions)){
									hits.push([this.sprites[i],g.sprites[j]]);
									}
								}
							}
						}
					}
				}
			return hits;
			}
		return false;
		};
	Group.prototype.getFieldSpriteHits = function(cells){
		var results = {}, hits, result;
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [this.cells[0]];
		var override = {
			x: this.getStartX(),
			y: this.getStartY(),
			r: this.roll,
			s: this.scale,
			};
		for(var i=0, z=cells.length; i<z; i++){
			hits = [];
			for(var j=0, w=this.sprites.length; j<w; j++){
				result = scrawl.sprite[this.sprites[j]].checkField(cells[i], override);
				if(scrawl.isa(result,'obj')){
					hits.push([this.sprites[j], result]);
					}
				}
			results[cells[i]] = hits;
			}
		return (cells.length === 1) ? results[cells[0]] : results;
		};
	Group.prototype.checkField = function(cell){
		var myCell = (scrawl.xt(cell) && scrawl.cellnames.contains(cell)) ? scrawl.cell[cell] : (scrawl.cell[this.cells[0]] || scrawl.cell[scrawl.pad[scrawl.currentPad].current]);
		var coords = {x: this.startX, y: this.startY};
		var result = myCell.checkFieldAt({
			coordinates: [coords],
			test: this.fieldTest,
			channel: this.fieldChannel,
			});
		//returns the coordinates that FAILED the test, or true if all coordinates PASSED, or false if there was an error
		return (result > 0) ? coords : ((result) ? true : false);
		};
	Group.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.startX)){this.startX += items.startX;}
		if(scrawl.xt(items.startY)){this.startY += items.startY;}
		if(scrawl.xt(items.handleX)){this.handleX += items.handleX;}
		if(scrawl.xt(items.handleY)){this.handleY += items.handleY;}
		if(scrawl.xt(items.roll)){this.roll += items.roll;}
		if(scrawl.xt(items.scale)){this.scale += items.scale;}
		if(scrawl.xt(items.pathPosition)){this.pathPosition += items.pathPosition;}
		return this;
		};
	Group.prototype.addSpritesToGroup = function(item){
		item = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=item.length; i<z; i++){
			this.sprites.pushUnique(item[i]);
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
	Group.prototype.moveSpriteStart = function(item){
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].moveStart(item);
			}
		return this;
		};
	Group.prototype.setGroupDimensions = function(items){
		items = (scrawl.xt(items)) ? items : {x:this.startX,y:this.startY};
		var maxX = -9999, minX = 9999, maxY = -9999, minY = 9999, tmaxX, tminX, tmaxY, tminY, temp, px, py;
		for(var i=0, x=this.groups.length; i<z; i++){
			temp = scrawl.group[this.groups[i]];
			if(!temp.isMarker && !temp.isDefinition){
				temp.setGroupDimensions();
				maxX = (temp.startX+temp.width > maxX) ? temp.startX+temp.width : maxX;
				minX = (temp.startX < minX) ? temp.startX : minX;
				maxY = (temp.startY+temp.height > maxY) ? temp.startY+temp.height : maxY;
				minY = (temp.startY < minY) ? temp.startY : minY;
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			temp = scrawl.sprite[this.sprites[i]];
			if(!temp.pivot || !temp.path){
				switch(temp.type){
					case 'Block' :
					case 'Outline' :
					case 'Picture' :
					case 'Phrase' :
						tmaxX = temp.startX + (temp.width * temp.scale);
						tminX = temp.startX;
						tmaxY = temp.startY + (temp.height * temp.scale);
						tminY = temp.startY;
						break;
					case 'Wheel' :
						tmaxX = temp.startX + (temp.radius * temp.scale);
						tminX = temp.startX - (temp.radius * temp.scale);
						tmaxY = temp.startY + (temp.radius * temp.scale);
						tminY = temp.startY - (temp.radius * temp.scale);
						break;
					case 'Shape' :
						tmaxX = -9999, tmaxY = -9999, tminX = 9999, tminY = 9999;
						for(var j=0, w=temp.pointList.length; j<w; j++){
							px = scrawl.point[temp.pointList[j]].currentX;
							py = scrawl.point[temp.pointList[j]].currentY;
							tmaxX = (px > tmaxX) ? px : tmaxX;
							tminX = (px < tminX) ? px : tminX;
							tmaxY = (py > tmaxY) ? py : tmaxY;
							tminY = (py < tminY) ? py : tminY;
							}
						break;
					}
				maxX = (tmaxX > maxX) ? tmaxX : maxX;
				minX = (tminX < minX) ? tminX : minX;
				maxY = (tmaxY > maxY) ? tmaxY : maxY;
				minY = (tminY < minY) ? tminY : minY;
				}
			}
		this.startX = items.x || minX;
		this.startY = items.y || minY;
		this.width = (maxX - minX);
		this.height = (maxY - minY);
		this.setSpritesToGroupHandle()
		return this;
		};
	Group.prototype.setSpritesToGroupHandle = function(){
		var offsetX = this.getPivotOffset(this.handleX,false);
		var offsetY = this.getPivotOffset(this.handleY,true);
		var s, sx, sy;
		for(var i=0,z=this.sprites.length; i<z; i++){
			s = scrawl.sprite[this.sprites[i]];
			if(scrawl.spritenames.contains(s.name) && s.pivot === this.name){
				sx = s.getPivotOffset(s.handleX,false);
				sy = s.getPivotOffset(s.handleY,true);
				s.set({
					handleX: sx+offsetX,
					handleY: sy+offsetY,
					});
				}
			}
		return this;
		};
		
	function Sprite(items){
		SubScrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.order = items.order || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.method = (scrawl.isa(items.method,'str')) ? items.method : ((this.type === 'Shape' ) ? 'draw' : 'fill');
		this.collisionPoints = this.parseCollisionPoints(items.collisionPoints || []);
		this.rollable = (scrawl.isa(items.rollable,'bool')) ? items.rollable : true;
		this.roll = items.roll || 0;
		this.data = items.data || false;
		this.flipReverse = (scrawl.isa(items.flipReverse,'bool')) ? items.flipReverse : false;
		this.flipUpend = (scrawl.isa(items.flipUpend,'bool')) ? items.flipUpend : false;
		this.scaleOutline = (scrawl.isa(items.scaleOutline,'bool')) ? items.scaleOutline : true;
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
		if(scrawl.xt(items.target)){
			this.targetGroup(items);
			}
		return this;
		}
	Sprite.prototype = Object.create(SubScrawl.prototype);
	Sprite.prototype.type = 'Sprite';
	Sprite.prototype.classname = 'spritenames';
	Sprite.prototype.targetGroup = function(items){
		this.pivot = this.group;
		this.handleX = scrawl.group[this.group].startX - this.startX;
		this.handleY = scrawl.group[this.group].startY - this.startY;
		return this;
		};
	Sprite.prototype.exportNative = function(items){
		items = (scrawl.xt(items)) ? items : {includeDesigns: true, includeImages: false, string: true};
		var result = [];
		if(items.includeDesigns){
			var designs = items.designs || [];
			if(scrawl.xt(this.context) && scrawl.designnames.contains(scrawl.ctx[this.context].fillStyle) && !designs.contains(scrawl.ctx[this.context].fillStyle)){
				result.push(scrawl.design[scrawl.ctx[this.context].fillStyle].prepareForExport());
				designs.push(scrawl.ctx[this.context].fillStyle);
				}
			if(scrawl.xt(this.context) && scrawl.designnames.contains(scrawl.ctx[this.context].strokeStyle) && !designs.contains(scrawl.ctx[this.context].strokeStyle)){
				result.push(scrawl.design[scrawl.ctx[this.context].strokeStyle].prepareForExport());
				designs.push(scrawl.ctx[this.context].strokeStyle);
				}
			}
		if(items.includeImages){
			if(scrawl.xt(this.imageData) && this.imageData && scrawl.xt(scrawl.imageData[this.imageData])){
				result.push(scrawl.imageData[this.imageData]);
				}
			}
		if(scrawl.xt(this.animSheet) && this.animSheet && scrawl.animnames.contains(this.animSheet)){
			result.push(scrawl.anim[this.animSheet].prepareForExport());
			}
		result.push(this.prepareForExport());
		return (items.string) ? JSON.stringify(result) : result;
		};
	Sprite.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//SubScrawl
			startX: (this.startX !== 0) ? this.startX : u,
			startY: (this.startY !== 0) ? this.startY : u,
			handleX: (this.handleX !== 0) ? this.handleX : u,
			handleY: (this.handleY !== 0) ? this.handleY : u,
			moveStartX: (this.moveStartX !== 0) ? this.moveStartX : u,
			moveStartY: (this.moveStartY !== 0) ? this.moveStartY : u,
			moveHandleX: (this.moveHandleX !== 0) ? this.moveHandleX : u,
			moveHandleY: (this.moveHandleY !== 0) ? this.moveHandleY : u,
			pivot: (this.pivot) ? this.pivot : u,
			path: (this.path) ? this.path : u,
			pathPosition: (this.pathPosition !== 0) ? this.pathPosition : u,
			movePathPosition: (this.movePathPosition !== 0) ? this.movePathPosition : u,
			pathSpeedConstant: (!this.pathSpeedConstant) ? this.pathSpeedConstant : u,
			pathRoll: (this.pathRoll !== 0) ? this.pathRoll : u,
			addPathRoll: (this.addPathRoll) ? this.addPathRoll : u,
			scale: (this.scale !== 1) ? this.scale : u,
			//Sprite
			order: (this.order !== 0) ? this.order : u,
			visibility: (!this.visibility) ? this.visibility : u,
			method: this.method,
			collisionPoints: (scrawl.xt(this.collisionPoints) && this.collisionPoints.length > 0) ? this.collisionPoints : u,
			rollable: (!this.rollable) ? this.rollable : u,
			roll: (this.roll !== 0) ? this.roll : u,
			data: (this.data) ? this.data : u,
			flipReverse: (this.flipReverse) ? this.flipReverse : u,
			flipUpend: (this.flipUpend) ? this.flipUpend : u,
			scaleOutline: (!this.scaleOutline) ? this.scaleOutline : u,
			group: this.group,
			fieldChannel: (this.fieldChannel !== 'anycolor') ? this.fieldChannel : u,
			fieldTest: (this.fieldTest !== 0) ? this.fieldTest : u,
			//Phrase (text objects not saved)
			text: (scrawl.xt(this.text) && this.text !=='') ? this.text : u,
			style: (scrawl.xt(this.style) && this.style !== 'normal') ? this.style : u,
			variant: (scrawl.xt(this.variant) && this.variant !== 'normal') ? this.variant : u,
			weight: (scrawl.xt(this.weight) && this.weight !== 'normal') ? this.weight : u,
			size: (scrawl.xt(this.size) && this.size !== 12) ? this.size : u,
			metrics: (scrawl.xt(this.metrics) && this.metrics !== 'pt') ? this.metrics : u,
			family: (scrawl.xt(this.family) && this.family !== 'sans-serif') ? this.family : u,
			lineHeight: (scrawl.xt(this.lineHeight) && this.lineHeight !== 1.5) ? this.lineHeight : u,
			backgroundColor: (scrawl.xt(this.backgroundColor) && this.backgroundColor) ? this.backgroundColor : u,
			backgroundMargin: (scrawl.xt(this.backgroundMargin) && this.backgroundMargin !== 0) ? this.backgroundMargin : u,
			textAlongPath: (scrawl.xt(this.textAlongPath) && this.textAlongPath !== 'phrase') ? this.textAlongPath : u,
			fixedWidth: (scrawl.xt(this.fixedWidth) && this.fixedWidth) ? this.fixedWidth : u,
			//Block (and other sprites)
			width: (scrawl.xt(this.width) && this.width !== 0) ? this.width : u,
			height: (scrawl.xt(this.height) && this.height !== 0) ? this.height : u,
			//Wheel
			radius: (scrawl.xt(this.radius) && this.radius !== 0) ? this.radius : u,
			startAngle: (scrawl.xt(this.startAngle) && this.startAngle !== 0) ? this.startAngle : u,
			endAngle: (scrawl.xt(this.endAngle) && this.endAngle !== 360) ? this.endAngle : u,
			clockwise: (scrawl.xt(this.clockwise) && this.clockwise) ? this.clockwise : u,
			closed: (scrawl.xt(this.closed)) ? this.closed : u,
			includeCenter: (scrawl.xt(this.includeCenter) && this.includeCenter) ? this.includeCenter : u,
			checkHitUsingRadius: (scrawl.xt(this.checkHitUsingRadius) && !this.checkHitUsingRadius) ? this.checkHitUsingRadius : u,
			//Picture
			source: (scrawl.xt(this.source) && this.source) ? this.source : u,
			imageData: (scrawl.xt(this.imageData) && this.imageData) ? this.imageData : u,
			imageDataChannel: (scrawl.xt(this.imageDataChannel) && this.imageDataChannel !=='alpha') ? this.imageDataChannel : u,
			animSheet: (scrawl.xt(this.animSheet) && this.animSheet) ? this.animSheet : u,
			imageType: (scrawl.xt(this.imageType) && this.imageType) ? this.imageType : u,
			checkHitUsingImageData: (scrawl.xt(this.checkHitUsingImageData) && this.checkHitUsingImageData) ? this.checkHitUsingImageData : u,
			copyX: (scrawl.xt(this.copyX)) ? this.copyX : u,
			copyY: (scrawl.xt(this.copyY)) ? this.copyY : u,
			copyWidth: (scrawl.xt(this.copyWidth)) ? this.copyWidth : u,
			copyHeight: (scrawl.xt(this.copyHeight)) ? this.copyHeight : u,
			//Shape
			firstPoint: (scrawl.xt(this.firstPoint) && this.firstPoint) ? this.firstPoint : u,
			line: (scrawl.xt(this.line) && this.line) ? this.line : u,
			linkDurations: (scrawl.xt(this.linkDurations) && this.linkDurations.length > 0) ? this.linkDurations : u,
			markStart: (scrawl.xt(this.markStart) && this.markStart) ? this.markStart : u,
			markMid: (scrawl.xt(this.markMid) && this.markMid) ? this.markMid : u,
			markEnd: (scrawl.xt(this.markEnd) && this.markEnd) ? this.markEnd : u,
			//Context
			fillStyle: (scrawl.ctx[this.context].fillStyle !== '#000000') ? scrawl.ctx[this.context].fillStyle : u,
			winding: (scrawl.ctx[this.context].winding !== 'nonzero') ? scrawl.ctx[this.context].winding : u,
			strokeStyle: (scrawl.ctx[this.context].strokeStyle !== '#000000') ? scrawl.ctx[this.context].strokeStyle : u,
			globalAlpha: (scrawl.ctx[this.context].globalAlpha !== 1) ? scrawl.ctx[this.context].globalAlpha : u,
			globalCompositeOperation: (scrawl.ctx[this.context].globalCompositeOperation !== 'source-over') ? scrawl.ctx[this.context].globalCompositeOperation : u,
			lineWidth: (scrawl.ctx[this.context].lineWidth !== 1) ? scrawl.ctx[this.context].lineWidth : u,
			lineCap: (scrawl.ctx[this.context].lineCap !== 'butt') ? scrawl.ctx[this.context].lineCap : u,
			lineJoin: (scrawl.ctx[this.context].lineJoin !== 'miter') ? scrawl.ctx[this.context].lineJoin : u,
			lineDash: (scrawl.ctx[this.context].lineDash.length > 0) ? scrawl.ctx[this.context].lineDash : u,
			lineDashOffset: (scrawl.ctx[this.context].lineDashOffset !== 0) ? scrawl.ctx[this.context].lineDashOffset : u,
			miterLimit: (scrawl.ctx[this.context].miterLimit !== 10) ? scrawl.ctx[this.context].miterLimit : u,
			shadowOffsetX: (scrawl.ctx[this.context].shadowOffsetX !== 0) ? scrawl.ctx[this.context].shadowOffsetX : u,
			shadowOffsetY: (scrawl.ctx[this.context].shadowOffsetY !== 0) ? scrawl.ctx[this.context].shadowOffsetY : u,
			shadowBlur: (scrawl.ctx[this.context].shadowBlur !== 0) ? scrawl.ctx[this.context].shadowBlur : u,
			shadowColor: (scrawl.ctx[this.context].shadowColor !== 'rgba(0,0,0,0)') ? scrawl.ctx[this.context].shadowColor : u,
			font: (scrawl.ctx[this.context].font !== '10pt sans-serif') ? scrawl.ctx[this.context].font : u,
			textAlign: (scrawl.ctx[this.context].textAlign !== 'start') ? scrawl.ctx[this.context].textAlign : u,
			textBaseline: (scrawl.ctx[this.context].textBaseline !== 'alphabetic') ? scrawl.ctx[this.context].textBaseline : u,
			};
		};
	Sprite.prototype.setToDefaults = function(){
		var u;
		this.set({
			comment: '',
			title: '',
			startX: 0,
			startY: 0,
			handleX: 0,
			handleY: 0,
			moveStartX: 0,
			moveStartY: 0,
			moveHandleX: 0,
			moveHandleY: 0,
			pivot: false,
			path: false,
			pathPosition: 0,
			movePathPosition: 0,
			pathSpeedConstant: true,
			pathRoll: 0,
			addPathRoll: false,
			scale: 1,
			order: 0,
			visibility: true,
			collisionPoints: [],
			rollable: true,
			roll: 0,
			data: false,
			flipReverse: false,
			flipUpend: false,
			scaleOutline: true,
			group: false,
			fieldChannel: 'anycolor',
			fieldTest: 0,
			text: (scrawl.xt(this.text)) ? '' : u,
			style: (scrawl.xt(this.style)) ? 'normal' : u,
			variant: (scrawl.xt(this.variant)) ? 'normal' : u,
			weight: (scrawl.xt(this.weight)) ? 'normal' : u,
			size: (scrawl.xt(this.size)) ? 12 : u,
			metrics: (scrawl.xt(this.metrics)) ? 'pt' : u,
			family: (scrawl.xt(this.family)) ? 'sans-serif' : u,
			lineHeight: (scrawl.xt(this.lineHeight)) ? 1.5 : u,
			backgroundColor: (scrawl.xt(this.backgroundColor)) ? false : u,
			backgroundMargin: (scrawl.xt(this.backgroundMargin)) ? 0 : u,
			textAlongPath: (scrawl.xt(this.textAlongPath)) ? 'phrase' : u,
			fixedWidth: (scrawl.xt(this.fixedWidth)) ? false : u,
			width: (scrawl.xt(this.width)) ? 0 : u,
			height: (scrawl.xt(this.height)) ? 0 : u,
			radius: (scrawl.xt(this.radius)) ? 0 : u,
			startAngle: (scrawl.xt(this.startAngle)) ? 0 : u,
			endAngle: (scrawl.xt(this.endAngle)) ? 360 : u,
			clockwise: (scrawl.xt(this.clockwise)) ? false : u,
			closed: (scrawl.xt(this.closed)) ? false : u,
			includeCenter: (scrawl.xt(this.includeCenter)) ? false : u,
			checkHitUsingRadius: (scrawl.xt(this.checkHitUsingRadius)) ? true : u,
			imageData: (scrawl.xt(this.imageData)) ? false : u,
			imageDataChannel: (scrawl.xt(this.imageDataChannel)) ? 'alpha' : u,
			animSheet: (scrawl.xt(this.animSheet)) ? false : u,
			checkHitUsingImageData: (scrawl.xt(this.checkHitUsingImageData)) ? false : u,
			copyX: (scrawl.xt(this.copyX)) ? false : u,
			copyY: (scrawl.xt(this.copyY)) ? false : u,
			copyWidth: (scrawl.xt(this.copyWidth)) ? false : u,
			copyHeight: (scrawl.xt(this.copyHeight)) ? false : u,
			firstPoint: (scrawl.xt(this.firstPoint)) ? false : u,
			line: (scrawl.xt(this.line)) ? false : u,
			markStart: (scrawl.xt(this.markStart)) ? false : u,
			markMid: (scrawl.xt(this.markMid)) ? false : u,
			markEnd: (scrawl.xt(this.markEnd)) ? false : u,
			fillStyle: '#000000',
			winding: 'nonzero',
			strokeStyle: '#000000',
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
			lineWidth: 1,
			lineCap: 'butt',
			lineJoin: 'miter',
			lineDash: [],
			lineDashOffset: 0,
			miterLimit: 10,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowBlur: 0,
			shadowColor: 'rgba(0,0,0,0)',
			font: '10pt sans-serif',
			textAlign: 'start',
			textBaseline: 'alphabetic',
			});
		return this;
		};
	Sprite.prototype.pickupSprite = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.x,items.y])){
			this.mouseX = items.x || 0;
			this.mouseY = items.y || 0;
			this.realPivot = this.pivot;
			this.pivot = 'mouse';
			this.order += 9999;
			}
		return this;
		};
	Sprite.prototype.dropSprite = function(item){
		this.pivot = item || this.realPivot || false;
		this.order -= (this.order >= 9999) ? 9999 : 0;
		delete this.realPivot;
		delete this.mouseX;
		delete this.mouseY;
		return this;
		};
	Sprite.prototype.clone = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var a = Scrawl.prototype.clone.call(this, items);
		if(!scrawl.xt(items.createNewContext) || items.createNewContext){
			var b = scrawl.ctx[a.context];
			var c = JSON.parse(JSON.stringify(scrawl.ctx[this.context]));
			delete c.name;
			b.set(c);
			delete items.name;
			b.set(items);
			if(scrawl.designnames.contains(b.fillStyle)){
				if(scrawl.design[b.fillStyle].type !== 'Pattern'){
					var f = scrawl.design[b.fillStyle].clone();
					b.fillStyle = f.name;
					}
				else{
					b.fillStyle = items.fillStyle || scrawl.ctx[this.context].fillStyle;
					}
				}
			if(scrawl.designnames.contains(b.strokeStyle)){
				if(scrawl.design[b.strokeStyle].type !== 'Pattern'){
					var s = scrawl.design[b.strokeStyle].clone();
					b.strokeStyle = s.name;
					}
				else{
					b.strokeStyle = items.strokeStyle || scrawl.ctx[this.context].strokeStyle;
					}
				}
			}
		else{
			delete scrawl.ctx[a.context];
			scrawl.ctxnames.removeItem(a.context);
			a.context = this.context;
			}
		if(items.field){
			a.addSpriteToCellFields();
			}
		if(items.fence){
			a.addSpriteToCellFences();
			}
		if(items.group||items.target){
			scrawl.group[this.group].removeSpritesFromGroup(a.name);
			a.group = this.getGroup(items);
			scrawl.group[a.group].addSpritesToGroup(a.name);
			if(scrawl.xt(items.target)){
				a.targetGroup(items);
				}
			}
		return a;
		};
	Sprite.prototype.addSpriteToCellFields = function(cells){
		var cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_field'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.addSpriteToCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_fence'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.removeSpriteFromCellFields = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_field'].removeSpritesFromGroup(this.name);
				}
			}
		return this;
		};
	Sprite.prototype.removeSpriteFromCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [scrawl.pad[scrawl.currentPad].current];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.cellnames.contains(cells[i])){
				scrawl.group[cells[i]+'_fence'].removeSpritesFromGroup(this.name);
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
		if(scrawl.xto([items.startX,items.handleX,items.startY,items.handleY])){
			this.setCurrentParameters();
			}
		if(scrawl.xto([items.group,items.target])){
			scrawl.group[this.group].removeSpritesFromGroup(this.name);
			this.group = this.getGroup(items);
			scrawl.group[this.group].addSpritesToGroup(this.name);
			if(scrawl.xt(items.target)){
				this.targetGroup(items);
				}
			}
		return this;
		};
	Sprite.prototype.get = function(item){
		if(['globalAlpha','globalCompositeOperation','lineWidth','lineCap','lineJoin','miterLimit','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','font','textAlign','textBaseline','winding','lineDash','lineDashOffset','fillStyle','strokeStyle'].contains(item)){
			return scrawl.ctx[this.context].get(item);
			}
		else{
			return this[item];
			}
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
	Sprite.prototype.forceStamp = function(method, cell){				//override object is only generated by group objects
		var temp = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = temp;
		return this;
		};
	Sprite.prototype.prepareStamp = function(override){
		override = (scrawl.xt(override)) ? override : {x:0,y:0};
		return {
			x: (this.flipReverse) ? this.currentX - (override.x*2) : this.currentX,
			y: (this.flipUpend) ? this.currentY - (override.y*2) : this.currentY,
			};
		};
	Sprite.prototype.prepareItemForStamp = function(method, cell){
		var override;
		if(scrawl.xt(method)){
			override = (scrawl.isa(method,'str')) ? scrawl.group[this.group].getOverride(this.name, method) : method;
			}
		else{
			override = scrawl.group[this.group].getOverride(this.name, this.method);
			}
		if(scrawl.xt(cell) && scrawl.cellnames.contains(cell)){ 
			override.cells = [cell];
			}
		return override;
		};
	Sprite.prototype.setStampUsingPivot = function(override, cell){
		var here, myCell;
		if(scrawl.pointnames.contains(this.pivot)){
			this.startX = scrawl.point[this.pivot].currentX;
			this.startY = scrawl.point[this.pivot].currentY;
			}
		else if(scrawl.spritenames.contains(this.pivot)){
			this.startX = scrawl.sprite[this.pivot].startX;
			this.startY = scrawl.sprite[this.pivot].startY;
			}
		else if(this.pivot === 'mouse'){
			myCell = scrawl.cell[cell];
			here = scrawl.pad[myCell.pad].getMouse();
			if(!scrawl.xta([this.mouseX,this.mouseY])){
				this.mouseX = this.startX;
				this.mouseY = this.startY;
				}
			if(here.active){
				this.startX += (here.x - this.mouseX);
				this.startY += (here.y - this.mouseY);
				this.mouseX = here.x;
				this.mouseY = here.y;
				}
			}
		else if(scrawl.groupnames.contains(this.pivot)){
			this.startX = scrawl.group[this.pivot].startX;
			this.startY = scrawl.group[this.pivot].startY;
			}
		return this;
		};
	Sprite.prototype.setCurrentParameters = function(override){
		override = (scrawl.xt(override)) ? override : {x:0,y:0,r:0,s:1};
		this.currentScale = this.scale * override.s;
		this.currentX = this.getStartX(override);
		this.currentY = this.getStartY(override);
		this.currentWidth = this.width * this.currentScale;
		this.currentHeight = this.height * this.currentScale;
		if(scrawl.xt(this.radius)){
			this.currentRadius = this.radius * this.currentScale;
			}
		this.currentRoll = this.roll + override.r;
		return this;
		};
	Sprite.prototype.stamp = function(method, cell){
		if(this.visibility){
			var ctx, engine, myCell, myMethod;
			var override = this.prepareItemForStamp(method, cell);
			myMethod = override.method || this.method;
			for(var i=0, z=override.cells.length; i<z; i++){
				ctx = scrawl.cell[override.cells[i]];
				engine = scrawl.context[ctx.name];
				myCell = scrawl.cell[override.cells[i]].name;
				var here;
				if(this.pivot){
					this.setStampUsingPivot(override, myCell);
					}
				else if(scrawl.spritenames.contains(this.path) && scrawl.sprite[this.path].type === 'Shape'){
					here = scrawl.sprite[this.path].getPerimeterPosition(this.pathPosition, this.pathSpeedConstant, this.addPathRoll);
					this.startX = here.x;
					this.startY = here.y;
					this.pathRoll = here.r || 0;
					}
				this.setCurrentParameters(override);
				this.callMethod(engine, myCell, override, myMethod);
				}
			}
		return this;
		};
	Sprite.prototype.flipCanvas = function(engine, myCell){
		var c = scrawl.cell[myCell];
		var w = c.actualWidth, h = c.actualHeight;
		if(this.flipReverse && this.flipUpend){
			engine.translate(w,h);
			engine.scale(-1,-1);
			this.currentX = w-this.currentX;
			this.currentY = h-this.currentY;
			}
		else if(this.flipReverse){
			engine.translate(w,0);
			engine.scale(-1,1);
			this.currentX = w-this.currentX;
			}
		else if(this.flipUpend){
			engine.translate(0,h);
			engine.scale(1,-1);
			this.currentY = h-this.currentY;
			}
		return this;
		};
	Sprite.prototype.callMethod = function(engine, myCell, override, method){
		this.flipCanvas(engine, myCell);
		switch(method){
			case 'clear' : this.clear(engine, myCell, override); break;
			case 'clearWithBackground' : this.clearWithBackground(engine, myCell, override); break;
			case 'draw' : this.draw(engine, myCell, override); break;
			case 'fill' : this.fill(engine, myCell, override); break;
			case 'drawFill' : this.drawFill(engine, myCell, override); break;
			case 'fillDraw' : this.fillDraw(engine, myCell, override); break;
			case 'sinkInto' : this.sinkInto(engine, myCell, override); break;
			case 'floatOver' : this.floatOver(engine, myCell, override); break;
			case 'clip' : this.clip(engine, myCell, override); break;
			case 'none' : this.none(engine, myCell, override); break;
			}
		this.flipCanvas(engine, myCell);
		return this;
		};
	Sprite.prototype.rotateCell = function(ctx, cell, override){
		if(scrawl.xta([ctx,cell]) && (this.rollable || this.addPathRoll)){
			if(this.currentRoll !== scrawl.cell[cell].roll || this.currentRoll + this.pathRoll !== scrawl.cell[cell].roll){
				var deltaRotation = (this.addPathRoll) ? ((this.currentRoll + this.pathRoll) - scrawl.cell[cell].roll) * scrawl.radian : (this.currentRoll - scrawl.cell[cell].roll) * scrawl.radian;
				this.completeRotation(ctx, cell, override, deltaRotation);
				}
			}
		return this;
		};
	Sprite.prototype.getRotationPoint = function(override, cell){
		var cellX, cellY, deltaX, deltaY;
		override = (scrawl.xt(override)) ? override : {x:0,y:0};
		if(this.flipReverse){
			deltaX = this.currentX + (this.getPivotOffset(this.handleX)*this.currentScale) - (override.x * 2);
			}
		else{
			deltaX = this.currentX + (this.getPivotOffset(this.handleX)*this.currentScale);
			}
		if(this.flipUpend){
			deltaY = this.currentY + (this.getPivotOffset(this.handleY, true)*this.currentScale) - (override.y * 2);
			}
		else{
			deltaY = this.currentY + (this.getPivotOffset(this.handleY, true)*this.currentScale);
			}
		return {x: deltaX, y: deltaY};
		};
	Sprite.prototype.completeRotation = function(ctx, cell, override, deltaRotation){
		var delta = this.getRotationPoint(override, cell);
		ctx.translate(delta.x, delta.y);
		ctx.rotate(deltaRotation);
		ctx.translate(-delta.x, -delta.y);
		return this;
		};
	Sprite.prototype.unrotateCell = function(ctx, cell, override){
		if(scrawl.xta([ctx,cell]) && (this.rollable || this.addPathRoll)){
			if(this.currentRoll !== scrawl.cell[cell].roll || this.currentRoll + this.pathRoll !== scrawl.cell[cell].roll){
				var deltaRotation = (this.addPathRoll) ? (scrawl.cell[cell].roll - (this.currentRoll + this.pathRoll)) * scrawl.radian : (scrawl.cell[cell].roll - this.currentRoll) * scrawl.radian;
				this.completeRotation(ctx, cell, override, deltaRotation);
				}
			}
		return this;
		};
	Sprite.prototype.clear = function(ctx, cell, override){return this;};
	Sprite.prototype.clearWithBackground = function(ctx, cell, override){return this;};
	Sprite.prototype.draw = function(ctx, cell, override){return this;};
	Sprite.prototype.fill = function(ctx, cell, override){return this;};
	Sprite.prototype.drawFill = function(ctx, cell, override){return this;};
	Sprite.prototype.fillDraw = function(ctx, cell, override){return this;};
	Sprite.prototype.sinkInto = function(ctx, cell, override){return this;};
	Sprite.prototype.floatOver = function(ctx, cell, override){return this;};
	Sprite.prototype.clip = function(ctx, cell, override){return this;};
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
		if(scrawl.xt(items.lineDashOffset)){scrawl.ctx[this.context].lineDashOffset += items.lineDashOffset;}
		if(scrawl.xt(items.lineWidth)){scrawl.ctx[this.context].lineWidth += items.lineWidth;}
		if(scrawl.xt(items.globalAlpha)){scrawl.ctx[this.context].globalAlpha += items.globalAlpha;}
		return this;
		};
	Sprite.prototype.getAngle = function(v){
		return (this.addPathRoll) ? (v+this.currentRoll+this.pathRoll) * scrawl.radian : (v+this.currentRoll) * scrawl.radian;
		};
	Sprite.prototype.checkHit = function(items, override){
		var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad];
		var cell = scrawl.cell[pad.current].name;
		var ctx = scrawl.context[pad.current];
		var tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}];
		this.flipCanvas(ctx, cell);
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.beginPath();
		ctx.rect(here.x, here.y, this.currentWidth, this.currentHeight);
		var result = false;
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		this.unrotateCell(ctx, cell, override);
		this.flipCanvas(ctx, cell);
		return (result) ? tests[i] : false;
		};
	Sprite.prototype.checkField = function(cell, override){
		var myCell = (scrawl.xt(cell) && scrawl.cellnames.contains(cell)) ? scrawl.cell[cell] : (scrawl.cell[scrawl.group[this.group].cells[0]] || scrawl.cell[scrawl.pad[scrawl.currentPad].current]);
		var coords = this.getCollisionPoints(override);
		var result = myCell.checkFieldAt({
			coordinates: coords,
			test: this.fieldTest,
			channel: this.fieldChannel,
			});
		//returns the coordinates that FAILED the test, or true if all coordinates PASSED, or false if there was an error
		return (result > 0) ? coords[result-1] : ((result) ? true : false);
		};
	Sprite.prototype.clearShadow = function(ctx, cell){
		scrawl.cell[cell].clearShadow();
		};
	Sprite.prototype.restoreShadow = function(ctx, cell){
		scrawl.cell[cell].restoreShadow(this.context);
		};
	Sprite.prototype.getCollisionPoints = function(override){
		override = (scrawl.xt(override)) ? override : {x:0,y:0};
		var p = [], tempHeight, tempWidth, cr, sx, sy;
		var leftWidth = (this.flipReverse) ? -(this.startX - this.currentX - (override.x || 0)) : this.startX - this.currentX + (override.x || 0);
		var topHeight = (this.flipUpend) ? -(this.startY - this.currentY - (override.y || 0)) : this.startY - this.currentY + (override.y || 0);
		cr = this.currentRoll * scrawl.radian;
		sx = (this.flipReverse) ? this.startX + (override.x || 0) : this.startX + (override.x || 0);
		sy = (this.flipUpend) ? this.startY + (override.y || 0) : this.startY + (override.y || 0);
		for(var i=0, z=this.collisionPoints.length; i<z; i++){
			switch(this.collisionPoints[i]) {
				case 'start' : p.push({x:this.currentX,y:this.currentY}); break;
				case 'N' : 
					tempWidth = ((this.currentWidth/2) - leftWidth);
					tempHeight = (0 - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'NE' : 
					tempWidth = ((this.currentWidth) - leftWidth);
					tempHeight = (0 - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'E' : 
					tempWidth = ((this.currentWidth) - leftWidth);
					tempHeight = ((this.currentHeight/2) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'SE' : 
					tempWidth = ((this.currentWidth) - leftWidth);
					tempHeight = ((this.currentHeight) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'S' : 
					tempWidth = ((this.currentWidth/2) - leftWidth);
					tempHeight = ((this.currentHeight) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'SW' : 
					tempWidth = (0 - leftWidth);
					tempHeight = ((this.currentHeight) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'W' : 
					tempWidth = (0 - leftWidth);
					tempHeight = ((this.currentHeight/2) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'NW' : 
					tempWidth = (0 - leftWidth);
					tempHeight = (0 - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				case 'center' :
					tempWidth = ((this.currentWidth/2) - leftWidth);
					tempHeight = ((this.currentHeight/2) - topHeight);
					p.push(this.getRotatedCoordinates(
						sx,
						sy,
						Math.sqrt((tempHeight*tempHeight)+(tempWidth*tempWidth)),
						cr+(Math.atan2(tempHeight,tempWidth)))); 
					break;
				default :
					if(scrawl.pointnames.contains(this.collisionPoints[i])){
						var n = scrawl.point[this.collisionPoints[i]];
						if(n.visibility){
							p.push({x: n.currentX, y: n.currentY});
							}
						}
				}
			}
		return p;
		};
	Sprite.prototype.getRotatedCoordinates = function(x,y,d,r){
		r = (this.flipReverse) ? (180*scrawl.radian)-r : r;
		r = (this.flipUpend) ? -r : r;
		return {
			x: x+(d*Math.cos(r)),
			y: y+(d*Math.sin(r)),
			};
		};
	Sprite.prototype.parseCollisionPoints = function(items){
		var myItems = (scrawl.xt(items)) ? [].concat(items) : this.collisionPoints;
		var p = [];
		for(var i=0, z=myItems.length; i<z; i++){
			switch(myItems[i].toLowerCase()) {
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
				case 'north' : 
				case 'n' :
					p.pushUnique('N'); break;
				case 'northeast' : 
				case 'ne' :
					p.pushUnique('NE'); break;
				case 'east' : 
				case 'e' :
					p.pushUnique('E'); break;
				case 'southeast' : 
				case 'se' :
					p.pushUnique('SE'); break;
				case 'south' : 
				case 's' :
					p.pushUnique('S'); break;
				case 'southwest' : 
				case 'sw' :
					p.pushUnique('SW'); break;
				case 'west' : 
				case 'w' :
					p.pushUnique('W'); break;
				case 'northwest' : 
				case 'nw' :
					p.pushUnique('NW'); break;
				case 'start' : 
					p.pushUnique('start'); break;
				case 'center' : 
					p.pushUnique('center'); break;
				}
			}
		return p;
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
		this.lineHeight = (scrawl.isa(items.lineHeight,'num')) ? items.lineHeight : 1.5;
		this.backgroundColor = items.backgroundColor || false;
		this.backgroundMargin = items.backgroundMargin || 0;
		this.textAlongPath = items.textAlongPath || 'phrase';
		this.fixedWidth = (scrawl.isa(items.fixedWidth,'bool')) ? items.fixedWidth : false;
		this.checkFont(items.font);
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		this.texts = [];
		this.multiline(items);
		return this;
		}
	Phrase.prototype = Object.create(Sprite.prototype);
	Phrase.prototype.type = 'Phrase';
	Phrase.prototype.classname = 'spritenames';
	Phrase.prototype.multiline = function(items){
		for(var i=0,z=this.texts.length; i<z; i++){
			delete scrawl.text[this.texts[i]];
			scrawl.textnames.removeItem(this.texts[i]);
			}
		this.texts = [];
		this.text = items.text || this.text;
		var textArray = this.text.split('\n');
		items.phrase = this.name;
		var temp;
		for(var i=0, z=textArray.length; i<z; i++){
			items.name = this.name+'_'+i;
			items.text = textArray[i];
			if(items.text.length > 0){
				temp = new Text(items);
				}
			}
		this.getMetrics()
		return this;
		};
	Phrase.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.font){
			this.checkFont(items.font);
			}
		if(scrawl.xto([items.style,items.variant,items.weight,items.size,items.metrics,items.family,items.scale])){
			this.constructFont();
			}
		this.getMetrics();
		this.multiline(items);
		return this;
		};
	Phrase.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		if(scrawl.xto([items.size,items.scale])){
			this.constructFont();
			}
		this.getMetrics();
		return this;
		};
	Phrase.prototype.clone = function(items){
		items = (scrawl.xt(items)) ? items : {};
		items.textAlongPath = items.textAlongPath || this.textAlongPath;
		return Sprite.prototype.clone.call(this, items);
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
		if(!scrawl.xt(this.currentScalse)){
			this.currentScale = this.scale * scrawl.group[this.group].scale;
			}
		myFont += (this.size * this.currentScale) + this.metrics + ' ';
		myFont += this.family;
		scrawl.ctx[this.context].font = myFont;
		return this;
		};
	Phrase.prototype.stamp = function(item, cell){
		if(this.visibility){
			var test = (scrawl.spritenames.contains(this.path) && scrawl.sprite[this.path].type === 'Shape');
			if(this.pivot || !test || this.textAlongPath === 'phrase'){
				Sprite.prototype.stamp.call(this, item);
				}
			else{
				scrawl.text[this.texts[0]].stampAlongPath(item, cell);
				}
			}
		return this;
		};
	Phrase.prototype.clear = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		ctx.globalCompositeOperation = 'destination-out';
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].clear(ctx, cell, override, here.x+o.x, tY);
			}
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.clearWithBackground = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].clearWithBackground(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.draw = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].draw(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.fill = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].fill(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.drawFill = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].drawFill(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.fillDraw = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].fillDraw(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.sinkInto = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].sinkInto(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.floatOver = function(ctx, cell, override){
		var tY;
		var o = this.getOffset();
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		if(this.backgroundColor){this.addBackgroundColor(ctx, cell, override);}
		var here = this.prepareStamp(override);
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (this.size*this.lineHeight*this.currentScale*i) + o.y;
			scrawl.text[this.texts[i]].floatOver(ctx, cell, override, here.x+o.x, tY);
			}
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Phrase.prototype.clip = function(ctx, cell, override){
		return this;
		};
	Phrase.prototype.getMetrics = function(cellname){
		var h = 0, w = 0;
		for(var i=0, z=this.texts.length; i<z; i++){
			w = (scrawl.text[this.texts[i]].width > w) ? scrawl.text[this.texts[i]].width : w;
			h += scrawl.text[this.texts[i]].height;
			}
		this.width = w;
		this.height = h;
		return this;
		};
	Phrase.prototype.addBackgroundColor = function(ctx, cell, override){
		var here = this.prepareStamp(override);
		var backX = this.backgroundMargin;
		var backY = this.backgroundMargin;
		var topX = here.x - this.backgroundMargin;
		var topY = here.y - this.backgroundMargin;
		var w = this.currentWidth + (this.backgroundMargin*2);
		var h = this.currentHeight + (this.backgroundMargin*2);
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(topX,topY,w,h);
		ctx.fillStyle = scrawl.ctx[this.context].fillStyle;
		return this;
		};
	Phrase.prototype.getOffset = function(){
		var myContext = scrawl.ctx[this.context];
		var oX = 0, oY = 0;
		switch(myContext.textAlign){
			case 'start' :
			case 'left' :
				oX = 0;
				break;
			case 'center' :
				oX = (this.width/2) * this.currentScale;
				break;
			case 'right' :
			case 'end' :
				oX = this.width * this.currentScale;
				break;
			}
		switch(myContext.textBaseline){
			case 'top' :
				oY = 0;
				break;
			case 'hanging' :
				oY = this.size*this.lineHeight*this.currentScale*0.1;
				break;
			case 'middle' :
				oY = this.size*this.lineHeight*this.currentScale*0.5;
				break;
			case 'bottom' :
				oY = this.size*this.lineHeight*this.currentScale;
				break;
			default: 
				oY = this.size*this.lineHeight*this.currentScale*0.85;
			}
		return {x: oX, y: oY};
		};
		
	function Text(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.text = items.text || '';
		this.phrase = items.phrase || false,
		this.context = scrawl.sprite[this.phrase].context;
		this.fixedWidth = (scrawl.isa(items.fixedWidth,'bool')) ? items.fixedWidth : false;
		this.textAlongPath = items.textAlongPath || 'phrase';
		scrawl.text[this.name] = this;
		scrawl.textnames.pushUnique(this.name);
		scrawl.sprite[this.phrase].texts.pushUnique(this.name);
		this.getMetrics();
		return this;
		}
	Text.prototype = Object.create(Scrawl.prototype);
	Text.prototype.type = 'Text';
	Text.prototype.classname = 'textnames';
	Text.prototype.stampAlongPath = function(item){
		var p, ctx, engine, override, myCell, myMethod, here, ratio, pathLength, width, pos, nowPos, oldText, x, y, r;
		if(!scrawl.xt(this.glyphs)){
			this.getMetrics();
			}
		p = scrawl.sprite[this.phrase];
		override = p.prepareItemForStamp(item);
		myMethod = override.method || p.method;
		pathLength = scrawl.sprite[p.path].getPerimeterLength();
		width = this.width*p.scale;
		ratio = width/pathLength;
		oldText = this.text;
		for(var i=0, z=override.cells.length; i<z; i++){
			ctx = scrawl.cell[override.cells[i]];
			ctx.setEngine(p);
			engine = scrawl.context[ctx.name];
			myCell = scrawl.cell[override.cells[i]].name;
			pos = p.pathPosition;
			this.flipCanvas(engine, myCell, p);
			for(var j=0, w=this.glyphs.length; j<w; j++){
				if(scrawl.xt(this.glyphs[j])){
					this.text = this.glyphs[j];
					nowPos = pos + (((this.glyphWidths[j]/2)/width)*ratio);
					if(!nowPos.isBetween(0,1,true)){
						nowPos += (nowPos > 0.5) ? -1 : 1;
						}
					here = scrawl.sprite[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
					x = here.x;
					y = here.y;
					r = here.r * scrawl.radian;
					engine.translate(x, y);
					engine.rotate(r);
					engine.translate(-x, -y);
					switch(myMethod){
						case 'draw' : this.draw(engine, myCell, override, x, y); break;
						case 'fill' : this.fill(engine, myCell, override, x, y); break;
						case 'drawFill' : this.drawFill(engine, myCell, override, x, y); break;
						case 'fillDraw' : this.fillDraw(engine, myCell, override, x, y); break;
						case 'sinkInto' : this.sinkInto(engine, myCell, override, x, y); break;
						case 'floatOver' : this.floatOver(engine, myCell, override, x, y); break;
						case 'clear' : 
						case 'clearWithBackground' : 
						case 'clip' : 
						case 'none' : 
						default :
							//do nothing
						}
					pos += (this.glyphWidths[j]/width)*ratio
					if(!pos.isBetween(0,1,true)){
						pos += (pos > 0.5) ? -1 : 1;
						}
					engine.translate(x, y);
					engine.rotate(-r);
					engine.translate(-x, -y);
					}
				}
			this.flipCanvas(engine, myCell, p);
			}
		this.text = oldText;
		return this;
		};
	Text.prototype.flipCanvas = function(engine, myCell, p){
		var c = scrawl.cell[myCell];
		var w = c.actualWidth, h = c.actualHeight;
		if(p.flipReverse && p.flipUpend){
			engine.translate(w,h);
			engine.scale(-1,-1);
			}
		else if(p.flipReverse){
			engine.translate(w,0);
			engine.scale(-1,1);
			}
		else if(p.flipUpend){
			engine.translate(0,h);
			engine.scale(1,-1);
			}
		return this;
		};
	Text.prototype.clear = function(ctx, cell, override, x, y){
		ctx.fillText(this.text, x, y);
		return this;
		};
	Text.prototype.clearWithBackground = function(ctx, cell, override, x, y){
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.fillText(this.text, x, y);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		return this;
		};
	Text.prototype.draw = function(ctx, cell, override, x, y){
		ctx.strokeText(this.text, x, y);
		return this;
		};
	Text.prototype.fill = function(ctx, cell, override, x, y){
		ctx.fillText(this.text, x, y);
		return this;
		};
	Text.prototype.drawFill = function(ctx, cell, override, x, y){
		var p = scrawl.sprite[this.phrase];
		ctx.strokeText(this.text, x, y);
		p.clearShadow(ctx, cell);
		ctx.fillText(this.text, x, y);
		p.restoreShadow(ctx, cell);
		return this;
		};
	Text.prototype.fillDraw = function(ctx, cell, override, x, y){
		var p = scrawl.sprite[this.phrase];
		ctx.fillText(this.text, x, y);
		p.clearShadow(ctx, cell);
		ctx.strokeText(this.text, x, y);
		p.restoreShadow(ctx, cell);
		return this;
		};
	Text.prototype.sinkInto = function(ctx, cell, override, x, y){
		ctx.fillText(this.text, x, y);
		ctx.strokeText(this.text, x, y);
		return this;
		};
	Text.prototype.floatOver = function(ctx, cell, override, x, y){
		ctx.strokeText(this.text, x, y);
		ctx.fillText(this.text, x, y);
		return this;
		};
	Text.prototype.clip = function(ctx, cell, override){
		return this;
		};
	Text.prototype.getMetrics = function(){
		var p = scrawl.sprite[this.phrase];
		var myContext = scrawl.context[scrawl.pad[scrawl.currentPad].current];
		var myEngine = scrawl.ctx[this.context];
		var tempFont = myContext.font;
		var tempBaseline = myContext.textBaseline;
		var tempAlign = myContext.textAlign;
		myContext.font = myEngine.font;
		myContext.textBaseline = myEngine.textBaseline;
		myContext.textAlign = myEngine.textAlign;
		this.width = myContext.measureText(this.text).width/p.scale;
		this.height = p.size * 1.5;
		if(p.path){
			this.glyphs = [];
			this.glyphWidths = [];
			var myText = this.text, tempText;
			if(this.textAlongPath === 'word'){
				tempText = this.text.split(' ');
				for(var i=0, z=tempText.length; i<z; i++){
					this.glyphs.push(tempText[i]);
					this.glyphWidths.push(myContext.measureText(tempText[i]).width);
					if(scrawl.xt(tempText[i+1])){
						this.glyphs.push(' ');
						this.glyphWidths.push(myContext.measureText(' ').width);
						}
					}
				}
			else{
				var myTextWidth = myContext.measureText(myText).width;
				if(this.fixedWidth){
					for(var i=0, z=myText.length; i<z; i++){
						this.glyphs.push(myText[i]);
						this.glyphWidths.push(myTextWidth/z);
						}
					}
				else{
					for(var i=1, z=myText.length; i<=z; i++){
						this.glyphs.push(myText[i-1]);
						tempText = myText.substr(0, i-1)+myText.substr(i);
						this.glyphWidths.push((myTextWidth - myContext.measureText(tempText).width));
						}
					}
				}
			}
		myContext.font = tempFont;
		myContext.textBaseline = tempBaseline;
		myContext.textAlign = tempAlign;
		return this;
		};
		
	function Block(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.width = items.width || 0;
		this.height = items.height || 0;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		return this;
		}
	Block.prototype = Object.create(Sprite.prototype);
	Block.prototype.type = 'Block';
	Block.prototype.classname = 'spritenames';
	Block.prototype.clip = function(ctx, cell, override){
		ctx.save();
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.rect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.clip();
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.clear = function(ctx, cell, override){
		scrawl.cell[cell].setToClearShape();
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.clearRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.clearWithBackground = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.draw = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.fill = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.drawFill = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.clearShadow(ctx, cell);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.fillDraw = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.clearShadow(ctx, cell);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.sinkInto = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Block.prototype.floatOver = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
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
		this.handleX = items.handleX || 'center';
		this.handleY = items.handleY || 'center';
		this.width = this.radius*2;
		this.height = this.width;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		return this;
		}
	Wheel.prototype = Object.create(Sprite.prototype);
	Wheel.prototype.type = 'Wheel';
	Wheel.prototype.classname = 'spritenames';
	Wheel.prototype.checkHit = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}];
		var here = this.prepareStamp(override);
		var result = false;
		if(this.checkHitUsingRadius){
			var test = items.test || 0;
			var testRadius = (test) ? test : this.currentRadius;
			for(var i=0, z=tests.length; i<z; i++){
				var xSquare = (tests[i].x-here.x)*(tests[i].x-here.x);
				var ySquare = (tests[i].y-here.y)*(tests[i].y-here.y);
				var distance = Math.sqrt(xSquare+ySquare);
				result = (distance <= testRadius) ? true : false;
				if(result){break;}
				}
			}
		else{
			var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad];
			var cell = scrawl.cell[pad.current].name;
			var ctx = scrawl.context[pad.current];
			this.flipCanvas(ctx, cell);
			this.buildPath(ctx, override);
			for(var i=0, z=tests.length; i<z; i++){
				result = ctx.isPointInPath(tests[i].x, tests[i].y);
				if(result){break;}
				}
			this.flipCanvas(ctx, cell);
			}
		return (result) ? tests[i] : false;
		};
	Wheel.prototype.getPivotOffset = function(val,useHeight){
		if(scrawl.xt(val)){
			var result;
			if((scrawl.isa(val,'str')) && !['left','center','right','top','bottom'].contains(val)){
				result = ((parseFloat(val)/100)*this.width)-this.radius;
				}
			else{
				switch (val){
					case 'left' : result = -this.radius; break;
					case 'center' : result = 0; break;
					case 'right' : result = this.radius; break;
					case 'top' : result = -this.radius; break;
					case 'bottom' : result = this.radius; break;
					default : result = val;
					}
				}
			return result;
			}
		return 0;
		};
	Wheel.prototype.buildPath = function(ctx, cell, override){
		var here = this.prepareStamp(override);
		ctx.beginPath();
		ctx.arc(here.x, here.y, this.currentRadius, this.getAngle(this.startAngle), this.getAngle(this.endAngle), this.clockwise);
		if(this.includeCenter){ctx.lineTo(here.x, here.y);}
		if(this.closed){ctx.closePath();}
		return this;
		};
	Wheel.prototype.clip = function(ctx, cell, override){
		this.buildPath(ctx, cell, override);
		ctx.clip();
		return this;
		};
	Wheel.prototype.clear = function(ctx, cell, override){
		this.buildPath(ctx, cell, override);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		return this;
		};
	Wheel.prototype.clearWithBackground = function(ctx, cell, override){
		this.buildPath(ctx, cell, override);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		return this;
		};
	Wheel.prototype.draw = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.stroke();
		return this;
		};
	Wheel.prototype.fill = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		return this;
		};
	Wheel.prototype.drawFill = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].winding);
		return this;
		};
	Wheel.prototype.fillDraw = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		this.clearShadow(ctx, cell);
		ctx.stroke();
		return this;
		};
	Wheel.prototype.sinkInto = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.stroke();
		return this;
		};
	Wheel.prototype.floatOver = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell, override);
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		return this;
		};
	Wheel.prototype.getCollisionPoints = function(override){
		var cr, p = [];
		var here = {
			x: (this.flipReverse) ? this.currentX + (override.x*2) : this.currentX,
			y: (this.flipUpend) ? this.currentY + (override.y*2) : this.currentY,
			};
		cr = this.currentRoll * scrawl.radian;
		for(var i=0, z=this.collisionPoints.length; i<z; i++){
			switch(this.collisionPoints[i]) {
				case 'start' : p.push({x:here.x,y:here.y}); break;
				case 'N' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(270*scrawl.radian))); break;
				case 'NE' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(315*scrawl.radian))); break;
				case 'E' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr)); break;
				case 'SE' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(45*scrawl.radian))); break;
				case 'S' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(90*scrawl.radian))); break;
				case 'SW' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(135*scrawl.radian))); break;
				case 'W' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(180*scrawl.radian))); break;
				case 'NW' : p.push(this.getRotatedCoordinates(here.x,here.y,this.currentRadius,cr+(225*scrawl.radian))); break;
				case 'center' : p.push({x:here.x,y:here.y}); break;
				default :
					if(scrawl.pointnames.contains(this.collisionPoints[i])){
						var n = scrawl.point[this.collisionPoints[i]];
						if(n.visibility){
							p.push({x: n.currentX, y: n.currentY});
							}
						}
				}
			}
		return p;
		};

	function Picture(items){
		if(scrawl.isa(items, 'obj') && scrawl.xt(items.url)){
			return this.importImage(items);
			}
		else{
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
			scrawl.group[this.group].addSpritesToGroup(this.name);
			return this;
			}
		}
	Picture.prototype = Object.create(Sprite.prototype);
	Picture.prototype.type = 'Picture';
	Picture.prototype.classname = 'spritenames';
	Picture.prototype.importImage = function(items){
		if(scrawl.isa(items, 'obj') && scrawl.xt(items.url)){
			var myImage = new Image();
			myImage.id = items.name || 'image'+Math.floor(Math.random()*100000000);
			myImage.onload = function(){
				try{
					var iObj = scrawl.newImage({
						name: myImage.id,
						element: myImage,
						});
					delete items.url;
					items.source = myImage.id;
					return scrawl.newPicture(items);
					}
				catch(e){
					console.log('Image <'+url+'> failed to load - '+e.name+' error: '+e.message);
					return false;
					}
				};
			myImage.src = items.url;
			}
		else{
			console.log('Picture.importImage() failed - no url supplied');
			return false;
			}
		};
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
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.rect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.clip();
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Picture.prototype.clear = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.clearRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Picture.prototype.clearWithBackground = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.fillRect(here.x, here.y, this.currentWidth, this.currentHeight);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Picture.prototype.draw = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Picture.prototype.fill = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			var here = this.prepareStamp(override);
			try{ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, this.currentWidth, this.currentHeight);}catch(e){}
			this.unrotateCell(ctx, cell, override);
			}
		return this;
		};
	Picture.prototype.drawFill = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			var here = this.prepareStamp(override);
			ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
			this.clearShadow(ctx, cell);
			try{ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, this.currentWidth, this.currentHeight);}catch(e){}
			this.unrotateCell(ctx, cell, override);
			}
		return this;
		};
	Picture.prototype.fillDraw = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			var here = this.prepareStamp(override);
			try{ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, this.currentWidth, this.currentHeight);}catch(e){}
			this.clearShadow(ctx, cell);
			ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
			this.unrotateCell(ctx, cell, override);
			}
		return this;
		};
	Picture.prototype.sinkInto = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			var here = this.prepareStamp(override);
			try{ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, this.currentWidth, this.currentHeight);}catch(e){}
			ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
			this.unrotateCell(ctx, cell, override);
			}
		return this;
		};
	Picture.prototype.floatOver = function(ctx, cell, override){
		if(this.imageType){
			this.rotateCell(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			var here = this.prepareStamp(override);
			ctx.strokeRect(here.x, here.y, this.currentWidth, this.currentHeight);
			try{ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, this.currentWidth, this.currentHeight);}catch(e){}
			this.unrotateCell(ctx, cell, override);
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
			try{scrawl.context[myCanvas.name].drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, 0, 0, this.copyWidth, this.copyHeight);}catch(e){}
			}
		this.imageData = myCanvas.getImageData({
			name: 'data',
			});
		scrawl.deleteCells([myCanvas.name]);
		return this;
		};
	Picture.prototype.getImageDataValue = function(items, override){
		//very similar to .checkHit ... could be abstracted?
		items = (scrawl.isa(items,'obj')) ? items : {x:0,y:0};
		override = (scrawl.isa(override,'obj')) ? override : {x:0,y:0};
		var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad] || scrawl.pad[scrawl.cell[scrawl.group[this.group].cells[0]].pad];
		var cell = scrawl.cell[pad.current].name;
		var ctx = scrawl.context[pad.current];
		var d = scrawl.imageData[this.imageData]
		this.flipCanvas(ctx, cell);
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		var result = false;
		var c = this.getLocalRotatedPoint(override, cell, pad, items, here)
		var myEl = (parseFloat((c.y * d.width).toFixed()) + parseFloat((c.x).toFixed())) * 4;
		if(c.x.isBetween(0,d.width-1,true) && c.y.isBetween(0,d.height-1,true)){
			switch(items.channel || this.imageDataChannel){
				case 'red' : result = (scrawl.xt(d.data[myEl])) ? d.data[myEl] : false; break;
				case 'blue' : result = (scrawl.xt(d.data[myEl+1])) ? d.data[myEl+1] : false; break;
				case 'green' : result = (scrawl.xt(d.data[myEl+2])) ? d.data[myEl+2] : false; break;
				case 'alpha' : result = (scrawl.xt(d.data[myEl+3])) ? d.data[myEl+3] : false; break;
				case 'color' : result = (scrawl.xta([d.data[myEl],d.data[myEl+1],d.data[myEl+2],d.data[myEl+3]])) ? 'rgba('+d.data[myEl]+','+d.data[myEl+1]+','+d.data[myEl+2]+','+d.data[myEl+3]+')' : false; break;
				default : result = false;
				}
			}
		this.unrotateCell(ctx, cell, override);
		this.flipCanvas(ctx, cell);
		return result;
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
		if(this.checkHitUsingImageData){
			var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad];
			var cell = scrawl.cell[pad.current].name;
			var ctx = scrawl.context[pad.current];
			var tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || 0), y: (items.y || 0)}];
			var d = scrawl.imageData[this.imageData]
			var test = (scrawl.isa(items.test,'num')) ? items.test : 0;
			this.flipCanvas(ctx, cell);
			this.rotateCell(ctx, cell, override);
			var here = this.prepareStamp(override);
			ctx.beginPath();
			ctx.rect(here.x, here.y, this.currentWidth, this.currentHeight);
			var result = false;
			for(var i=0, z=tests.length; i<z; i++){
				result = ctx.isPointInPath(tests[i].x, tests[i].y);
				if(result){
					var c = this.getLocalRotatedPoint(override, cell, pad, tests[i], here);
					var myEl = (parseFloat((c.y * d.width).toFixed()) + parseFloat((c.x).toFixed())) * 4;
					var myChannel;
					switch(items.channel || this.imageDataChannel){
						case 'red' : myChannel = 0; break;
						case 'blue' : myChannel = 1; break;
						case 'green' : myChannel = 2; break;
						case 'alpha' : myChannel = 3; break;
						}
					result = (d.data[myEl+myChannel] > test) ? true : false;
					if(result){
						break;
						}
					}
				}
			this.unrotateCell(ctx, cell, override);
			this.flipCanvas(ctx, cell);
			return (result) ? tests[i] : false;
			}
		else{
			return Sprite.prototype.checkHit.call(this, items, override);
			}
		};
	Picture.prototype.getLocalRotatedCoordinates = function(x,y,d,r){
		return {
			x: x+(d*Math.cos(r)),
			y: y+(d*Math.sin(r)),
			};
		};
	Picture.prototype.getLocalRotatedPoint = function(override, cell, pad, test, here){
		var s = this.getRotationPoint(override,cell);
		var t, tX, tY, myX, myY;
		tX = (this.flipReverse) ? (pad.width - test.x) - s.x : test.x - s.x;
		tY = (this.flipUpend) ? (pad.height - test.y) - s.y : test.y - s.y;
		t = this.getLocalRotatedCoordinates(s.x, s.y, Math.sqrt((tX*tX)+(tY*tY)), Math.atan2(tY,tX)-(this.currentRoll*scrawl.radian)); 
		myX = (((t.x - s.x) + (s.x - here.x))/this.currentScale)*(this.copyWidth/this.width);
		myY = (((t.y - s.y) + (s.y - here.y))/this.currentScale)*(this.copyHeight/this.height);
		if(this.imageType === 'animation'){
			myX += this.copyX;
			myY += this.copyY;
			}
		myX = parseFloat(myX.toFixed());
		myY = parseFloat(myY.toFixed());
		return {x: myX, y: myY};
		};
		
	function Outline(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.dataSet = (scrawl.xt(this.data)) ? this.buildDataSet(this.data) : false;
		this.startX = items.startX || 0;
		this.startY = items.startY || 0;
		this.handleX = items.handleX || 'left';
		this.handleY = items.handleY || 'top';
		this.method = items.method || 'draw';
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		return this;
		}
	Outline.prototype = Object.create(Sprite.prototype);
	Outline.prototype.type = 'Outline';
	Outline.prototype.classname = 'spritenames';
	Outline.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.data)){
			this.dataSet = this.buildDataSet(this.data);
			}
		return this;
		};
	Outline.prototype.buildDataSet = function(d){
		var myData = [];
		var command, points, minX = 999999, minY = 999999, maxX = -999999, maxY = -999999, curX = this.startX, curY = this.startY;
		var checkMaxMin = function(cx,cy){
			minX = (minX > cx) ? cx : minX;
			minY = (minY > cy) ? cy : minY;
			maxX = (maxX < cx) ? cx : maxX;
			maxY = (maxY < cy) ? cy : maxY;
			};
		var set = d.match(/([A-Za-z][0-9. ,\-]*)/g);
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
		this.width = maxX - minX;
		this.height = maxY - minY;
		for(var i=0, z=myData.length; i<z; i++){
			if(['M','L','C','Q','S','T'].contains(myData[i].c)){
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
		this.compiledData = false;
		return myData;
		};
	Outline.prototype.doOutline = function(ctx,override){
		if(!this.dataSet && this.data){
			this.buildDataSet(this.data);
			}
		if(this.dataSet){
			var here = this.prepareStamp(override);
			var currentX = here.x, currentY = here.y;
			var reflectX = here.x, reflectY = here.y;
			var d, tempX, tempY;
			ctx.beginPath();
			if(!['M','m'].contains(this.dataSet[0].c)){
				currentX = 0, currentY = 0;
				reflectX = currentX, reflectY = currentY;
				ctx.moveTo(0,0);
				}
			for(var i=0, z=this.dataSet.length; i<z; i++){
				d = this.dataSet[i];
				switch(d.c){
					case 'M' :
						currentX = d.p[0], currentY = d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX*this.scale),(currentY*this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX = d.p[k], currentY = d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'm' :
						currentX += d.p[0], currentY += d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX*this.scale),(currentY*this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
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
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'l' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'H' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX = d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'h' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX += d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'V' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY = d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'v' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY += d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX*this.scale),(currentY*this.scale));
							}
						break;
					case 'C' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo((d.p[k]*this.scale),(d.p[k+1]*this.scale),(d.p[k+2]*this.scale),(d.p[k+3]*this.scale),(d.p[k+4]*this.scale),(d.p[k+5]*this.scale));
							reflectX = d.p[k+2], reflectY = d.p[k+3];
							currentX = d.p[k+4], currentY = d.p[k+5];
							}
						break;
					case 'c' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo(((currentX+d.p[k])*this.scale),((currentY+d.p[k+1])*this.scale),((currentX+d.p[k+2])*this.scale),((currentY+d.p[k+3])*this.scale),((currentX+d.p[k+4])*this.scale),((currentY+d.p[k+5])*this.scale));
							reflectX = currentX + d.p[k+2];
							reflectY = currentY + d.p[k+3];
							currentX += d.p[k+4], currentY += d.p[k+5];
							}
						break;
					case 'S' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && ['C','c','S','s'].contains(this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX*this.scale),(tempY*this.scale),(d.p[k]*this.scale),(d.p[k+1]*this.scale),(d.p[k+2]*this.scale),(d.p[k+3]*this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 's' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && ['C','c','S','s'].contains(this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX*this.scale),(tempY*this.scale),((currentX+d.p[k])*this.scale),((currentY+d.p[k+1])*this.scale),((currentX+d.p[k+2])*this.scale),((currentY+d.p[k+3])*this.scale));
							reflectX = currentX + d.p[k], reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'Q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo((d.p[k]*this.scale),(d.p[k+1]*this.scale),(d.p[k+2]*this.scale),(d.p[k+3]*this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 'q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo(((currentX+d.p[k])*this.scale),((currentY+d.p[k+1])*this.scale),((currentX+d.p[k+2])*this.scale),((currentY+d.p[k+3])*this.scale));
							reflectX = currentX + d.p[k];
							reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'T' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && ['Q','q','T','t'].contains(this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX*this.scale),(tempY*this.scale),(d.p[k]*this.scale),(d.p[k+1]*this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX = d.p[k], currentY = d.p[k+1];
							}
						break;
					case 't' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && ['Q','q','T','t'].contains(this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX*this.scale),(tempY*this.scale),((currentX+d.p[k])*this.scale),((currentY+d.p[k+1])*this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX += d.p[k], currentY += d.p[k+1];
							}
						break;
					}
				}
			}
		return this;
		};
	Outline.prototype.clip = function(ctx, cell, override){
		ctx.save();
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.clip();
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.clear = function(ctx, cell, override){
		scrawl.cell[cell].setToClearShape();
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.clearWithBackground = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		this.doOutline(ctx, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.stroke();
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.draw = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.stroke();
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.fill = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.drawFill = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.fillDraw = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		this.clearShadow(ctx, cell);
		ctx.stroke();
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.sinkInto = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.stroke();
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.floatOver = function(ctx, cell, override){
		this.rotateCell(ctx, cell, override);
		scrawl.cell[cell].setEngine(this);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		return this;
		};
	Outline.prototype.checkHit = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad];
		var cell = scrawl.cell[pad.current].name;
		var ctx = scrawl.context[pad.current];
		var tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}];
		this.flipCanvas(ctx, cell);
		this.rotateCell(ctx, cell, override);
		var here = this.prepareStamp(override);
		ctx.translate(here.x, here.y);
		this.doOutline(ctx, override);
		var result = false;
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		ctx.translate(-here.x, -here.y);
		this.unrotateCell(ctx, cell, override);
		this.flipCanvas(ctx, cell);
		return (result) ? tests[i] : false;
		};

	function Shape(items){
		Sprite.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.firstPoint = items.firstPoint || false;
		this.collisionPoints = (scrawl.xt(items.collisionPoints)) ? items.collisionPoints : [];
		this.closed = (scrawl.isa(items.closed,'bool')) ? items.closed : true;
		this.line = (scrawl.isa(items.line,'bool')) ? items.line : false;
		this.radius = items.radius || false;
		this.linkList = [];
		this.linkDurations = [];
		this.pointList = [];
		this.perimeterLength = false;
		this.markStart = items.markStart || items.mark || false;
		this.markMid = items.markMid || items.mark || false;
		this.markEnd = items.markEnd || items.mark || false;
		this.handleX = items.handleX || 'center';
		this.handleY = items.handleY || 'center';
		this.width = items.width || 0;
		this.height = items.height || 0;
		scrawl.sprite[this.name] = this;
		scrawl.spritenames.pushUnique(this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		return this;
		}
	Shape.prototype = Object.create(Sprite.prototype);
	Shape.prototype.type = 'Shape';
	Shape.prototype.classname = 'spritenames';
	Shape.prototype.exportNative = function(items){
		var result = Sprite.prototype.exportNative.call(this, items);
		var points = this.getFullPointList();
		for(var i=0, z=points.length; i<z; i++){
			result.push(scrawl.point[points[i]].prepareForExport(items));
			if(scrawl.xt(scrawl.point[points[i]].startLink) && scrawl.linknames.contains(scrawl.point[points[i]].startLink)){
				result.push(scrawl.link[scrawl.point[points[i]].startLink].prepareForExport(items));
				}
			}
		return result;
		};
	Shape.prototype.getRadius = function(){
		var check = 0;
		for(var i=0, z=this.pointList.length; i<z; i++){
			check = (scrawl.point[this.pointList[i]].distance > check) ? scrawl.point[this.pointList[i]].distance : check;
			}
		this.radius = check;
		return this.radius;
		};
	Shape.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		if(this.linkDurations.length > 0 || this.perimeterLength){
			this.buildPositions();
			}
		return this;
		};
	Shape.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		if(this.linkDurations.length > 0 || this.perimeterLength){
			this.buildPositions();
			}
		return this;
		};
	Shape.prototype.parseCollisionPoints = function(items){
		return this.collisionPoints;
		};
	Shape.prototype.prepareShape = function(ctx, cell, override){
		if(this.firstPoint){
			var myPoint = scrawl.point[this.firstPoint].getData(override);
			ctx.beginPath();
			scrawl.link[myPoint.startLink].sketch(ctx, override);
			}
		return this;
		};
	Shape.prototype.getPivotOffset = function(val,useHeight){
		if(scrawl.xt(val)){
			var result;
			if((scrawl.isa(val,'str')) && !['left','center','right','top','bottom'].contains(val)){
				result = (useHeight) ? ((parseFloat(val)/100)*this.height)-(this.height/2) : ((parseFloat(val)/100)*this.width)-(this.width/2);
				}
			else{
				switch (val){
					case 'left' : result = -(this.width/2); break;
					case 'center' : result = 0; break;
					case 'right' : result = (this.width/2); break;
					case 'top' : result = -(this.height/2); break;
					case 'bottom' : result = (this.height/2); break;
					default : result = val;
					}
				}
			if(this.line){
				result += (useHeight) ? (this.height/2) : (this.width/2);
				}
			return result;
			}
		return 0;
		};
	Shape.prototype.stampMark = function(sprite, pos, ctx, cell, override){
		var tPath = sprite.path;
		var tPathPosition = sprite.pathPosition;
		var tGroup = sprite.group;
		sprite.set({
			path: this.name,
			pathPosition: pos,
			group: cell,
			}).forceStamp();
		sprite.set({
			path: tPath,
			pathPosition: tPathPosition,
			group: tGroup,
			});
		};
	Shape.prototype.addMarks = function(ctx, cell, override){
		if(this.markStart && (scrawl.spritenames.contains(this.markStart) || scrawl.groupnames.contains(this.markStart))){
			if(scrawl.groupnames.contains(this.markStart)){
				for(var i=0, z=scrawl.group[this.markStart].sprites.length; i<z; i++){
					this.stampMark(scrawl.sprite[scrawl.group[this.markStart].sprites[i]], 0, ctx, cell, override);
					}
				}
			else{
				this.stampMark(scrawl.sprite[this.markStart], 0, ctx, cell, override);
				}
			}
		if(this.markMid && (scrawl.spritenames.contains(this.markMid) || scrawl.groupnames.contains(this.markMid))){
			if(this.linkDurations.length === 0 || !this.perimeterLength){
				this.buildPositions();
				}
			for(var j=0, w=this.linkDurations.length-1; j<w; j++){
				if(scrawl.groupnames.contains(this.markMid)){
					for(var i=0, z=scrawl.group[this.markMid].sprites.length; i<z; i++){
						this.stampMark(scrawl.sprite[scrawl.group[this.markMid].sprites[i]], this.linkDurations[j], ctx, cell, override);
						}
					}
				else{
					this.stampMark(scrawl.sprite[this.markMid], this.linkDurations[j], ctx, cell, override);
					}
				}
			}
		if(this.markEnd && (scrawl.spritenames.contains(this.markEnd) || scrawl.groupnames.contains(this.markEnd))){
			if(scrawl.groupnames.contains(this.markEnd)){
				for(var i=0, z=scrawl.group[this.markEnd].sprites.length; i<z; i++){
					this.stampMark(scrawl.sprite[scrawl.group[this.markEnd].sprites[i]], 1, ctx, cell, override);
					}
				}
			else{
				this.stampMark(scrawl.sprite[this.markEnd], 1, ctx, cell, override);
				}
			}
		return false;
		};
	Shape.prototype.clip = function(ctx, cell, override){
		if(this.closed){
			this.prepareShape(ctx, cell, override);
			ctx.clip();
			}
		return this;
		};
	Shape.prototype.clear = function(ctx, cell, override){
		this.prepareShape(ctx, cell, override);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.globalCompositeOperation = scrawl.ctx[cell].globalCompositeOperation;
		return this;
		};
	Shape.prototype.clearWithBackground = function(ctx, cell, override){
		this.prepareShape(ctx, cell, override);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].winding);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		return this;
		};
	Shape.prototype.fill = function(ctx, cell, override){
		if(this.closed){
			this.prepareShape(ctx, cell, override);
			scrawl.cell[cell].setEngine(this);
			ctx.fill(scrawl.ctx[this.context].winding);
			if(this.markStart || this.markMid || this.markEnd){
				this.addMarks(ctx, cell, override);
				}
			}
		return this;
		};
	Shape.prototype.draw = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.prepareShape(ctx, cell, override);
		ctx.stroke();
		if(this.markStart || this.markMid || this.markEnd){
			this.addMarks(ctx, cell, override);
			}
		return this;
		};
	Shape.prototype.drawFill = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.prepareShape(ctx, cell, override);
		ctx.stroke();
		if(this.closed){
			this.clearShadow(ctx, cell);
			ctx.fill(scrawl.ctx[this.context].winding);
			}
		return this;
		};
	Shape.prototype.fillDraw = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.prepareShape(ctx, cell, override);
		if(this.closed){
			ctx.fill(scrawl.ctx[this.context].winding);
			this.clearShadow(ctx, cell);
			}
		ctx.stroke();
		if(this.markStart || this.markMid || this.markEnd){
			this.addMarks(ctx, cell, override);
			}
		return this;
		};
	Shape.prototype.sinkInto = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.prepareShape(ctx, cell, override);
		if(this.closed){
			ctx.fill(scrawl.ctx[this.context].winding);
			}
		ctx.stroke();
		if(this.markStart || this.markMid || this.markEnd){
			this.addMarks(ctx, cell, override);
			}
		return this;
		};
	Shape.prototype.floatOver = function(ctx, cell, override){
		scrawl.cell[cell].setEngine(this);
		this.prepareShape(ctx, cell, override);
		ctx.stroke();
		if(this.closed){
			ctx.fill(scrawl.ctx[this.context].winding);
			}
		if(this.markStart || this.markMid || this.markEnd){
			this.addMarks(ctx, cell, override);
			}
		return this;
		};
	Shape.prototype.none = function(ctx, cell, override){
		this.prepareShape(ctx, cell, override);
		return this;
		};
	Shape.prototype.getFullPointList = function(){
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
		return myPointList;
		};
	Shape.prototype.setRotationPointTo = function(items){
		items = (scrawl.xt(items)) ? items : {};
		var myX = (scrawl.xt(items.x)) ? this.getPivotOffset(items.x,false) : this.getPivotOffset('center',false);
		var myY = (scrawl.xt(items.y)) ? this.getPivotOffset(items.y,true) : this.getPivotOffset('center',true);
		var temppath = this.path;
		var temproll = this.roll
		this.path = false;
		this.roll = 0;
		var myPointList = this.getFullPointList()
		var tempX = this.startX, tempY = this.startY;
		this.startX += myX;
		this.startY += myY;
		for(var i=0, z=myPointList.length; i<z; i++){
			if(myPointList[i]){
				scrawl.point[myPointList[i]].setPolar();
				}
			}
		this.forceStamp('none');
		this.startX = tempX, this.startY = tempY;
		this.path = temppath;
		this.roll = temproll;
		return this;
		};
	Shape.prototype.checkHit = function(items, override){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var pad = scrawl.pad[items.pad] || scrawl.pad[override.pad];
		var cell = scrawl.cell[pad.current].name;
		var ctx = scrawl.context[pad.current];
		var tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}];
		this.flipCanvas(ctx, cell);
		if(this.closed){
//			ctx.mozFillRule = scrawl.ctx[this.context].winding;
//			ctx.msFillRule = scrawl.ctx[this.context].winding;
//			ctx.fill(scrawl.ctx[this.context].winding);
			}
		this.prepareShape(ctx, override);
		var result = false;
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		if(this.closed){
//			ctx.mozFillRule = scrawl.ctx[cell].winding;
//			ctx.msFillRule = scrawl.ctx[cell].winding;
//			ctx.fill(scrawl.ctx[cell].winding);
			}
		this.flipCanvas(ctx, cell);
		return (result) ? tests[i] : false;
		};
	Shape.prototype.getCollisionPoints = function(override){
		if(scrawl.isa(this.collisionPoints,'num')){
			var currentPos = 0;
			var myAdvance = 1/this.collisionPoints;
			var point, p = [], cr;
			var myCell = scrawl.cell[scrawl.group[this.group].cells[0]];
			cr = this.currentRoll * scrawl.radian;
			for(var i=0; i<this.collisionPoints; i++){
				point = this.getPerimeterPosition(currentPos, true, cr);
				point.x = (this.flipReverse) ? myCell.actualWidth - point.x : point.x;
				point.y = (this.flipUpend) ? myCell.actualHeight - point.y : point.y;
				p.push(point);
				currentPos += myAdvance;
				}
			return p;
			}
		else{
			var here = this.prepareStamp(override);
			return [{x: here.x, y: here.y}];
			}
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
						var before = myLink.getSteadyPositionOnLink((linkVal-0.0000001 < 0) ? 0 : linkVal-0.0000001);
						var after = myLink.getSteadyPositionOnLink((linkVal+0.0000001 > 1) ? 1 : linkVal+0.0000001);
						var here = myLink.getSteadyPositionOnLink(linkVal);
						var angle = Math.atan2(after.y-before.y, after.x-before.x)/scrawl.radian;
						return {x:here.x, y:here.y, r:angle};
						}
					else{
						return myLink.getSteadyPositionOnLink(linkVal);
						}
					}
				else{
					if(roll){
						var before = myLink.getPositionOnLink((linkVal-0.0000001 < 0) ? 0 : linkVal-0.0000001);
						var after = myLink.getPositionOnLink((linkVal+0.0000001 > 1) ? 1 : linkVal+0.0000001);
						var here = myLink.getPositionOnLink(linkVal);
						var angle = Math.atan2(after.y-before.y, after.x-before.x)/scrawl.radian;
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
		items = (scrawl.isa(items,'obj')) ? items : {};
		var myItems = JSON.parse(JSON.stringify(this));
		myItems.name = items.name || this.name;
		myItems.data = items.data || this.data;
		myItems.startX = items.startX || this.startX;
		myItems.startY = items.startY || this.startY;
		myItems.handleX = items.handleX || this.handleX;
		myItems.handleY = items.handleY || this.handleY;
		var a = scrawl.makePath(myItems);
		if(!scrawl.xt(items.createNewContext) || items.createNewContext){
			var c = JSON.parse(JSON.stringify(scrawl.ctx[this.context]));
			delete c.name;
			a.set(c);
			}
//		else{
//			delete scrawl.ctx[a.context];
//			scrawl.ctxnames.removeItem(a.context);
//			a.context = this.context;
//			}
//		delete items.name || this.name;
//		delete items.data || this.data;
//		delete items.startX || this.startX,
//		delete items.startY || this.startY,
//		delete items.handleX || this.handleX,
//		delete items.handleY || this.handleY,
		delete items.name;
		delete items.data;
		delete items.startX,
		delete items.startY,
		delete items.handleX,
		delete items.handleY,
		a.set(items);
		return a;
		};

	function Point(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.sprite = items.sprite || false;
		this.distance = items.distance || false;
		this.angle = items.angle || false;
		this.startLink = items.startLink || false;
		this.currentX = items.currentX || 0;
		this.currentY = items.currentY || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.fixed = (scrawl.isa(items.fixed,'bool')) ? items.fixed : false;
		scrawl.point[this.name] = this;
		scrawl.pointnames.pushUnique(this.name);
		if(this.sprite && scrawl.sprite[this.sprite].type === 'Shape'){
			scrawl.sprite[this.sprite].pointList.pushUnique(this.name);
			}
		return this;
		}
	Point.prototype = Object.create(Scrawl.prototype);
	Point.prototype.type = 'Point';
	Point.prototype.classname = 'pointnames';
	Point.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Point
			sprite: this.sprite,
			distance: (this.distance) ? this.distance : u,
			angle: (this.angle) ? this.angle : u,
			startLink: (this.startLink) ? this.startLink : u,
			currentX: (this.currentX !== 0) ? this.currentX : u,
			currentY: (this.currentY !== 0) ? this.currentY : u,
			visibility: (!this.visibility) ? this.visibility : u,
			fixed: (this.fixed) ? this.fixed : u,
			};
		};
	Point.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			sprite: false,
			distance: false,
			angle: false,
			startLink: false,
			currentX: 0,
			currentY: 0,
			visibility: false,
			fixed: false,
			});
		return this;
		};
	Point.prototype.getData = function(override){
		if(!scrawl.isa(this.distance,'num') && !scrawl.isa(this.angle,'num')){
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
			try{scrawl.sprite[this.sprite].pointList.removeItem(this.name);}catch(e){}
			try{scrawl.sprite[items.sprite].pointList.pushUnique(this.name);}catch(e){}
			this.sprite = items.sprite;
			}
		return this;
		};
	Point.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.distance){this.distance += items.distance;}
		if(items.angle){this.angle += items.angle;}
		var override = (items.override) ? items.override : {x:0,y:0};
		this.recalculate(override);
		return this;
		};
	Point.prototype.recalculate = function(override){
		var override = (override) ? override : {x:0,y:0};
		if(scrawl.isa(this.fixed,'str') && (scrawl.spritenames.contains(this.fixed) || scrawl.pointnames.contains(this.fixed))){
			var myPivot = scrawl.sprite[this.fixed] || scrawl.point[this.fixed];
			if(myPivot.type === 'Point'){
				this.currentX = myPivot.currentX + override.x;
				this.currentY = myPivot.currentY + override.y;
				}
			else{
				this.currentX = myPivot.startX;
				this.currentY = myPivot.startY;
				}
			}
		else if(!this.fixed){
			var obj, myAngle, myRadius, here; 
			obj = scrawl.sprite[this.sprite];
			here = obj.prepareStamp(override)
			if(obj.type === 'Shape'){
				if(obj.addPathRoll){
					myAngle = (this.angle + obj.currentRoll + obj.pathRoll) * scrawl.radian;
					}
				else{
					myAngle = (this.angle + obj.currentRoll) * scrawl.radian;
					}
				myRadius = this.distance * obj.scale;
				}
			else{
				myAngle = this.angle * scrawl.radian;
				myRadius = this.distance;
				}
			this.currentX = here.x + (myRadius * Math.cos(myAngle));
			this.currentY = here.y + (myRadius * Math.sin(myAngle));
			}
		return this;
		};
	Point.prototype.setPolar = function(){
		var obj = scrawl.sprite[this.sprite];
		var dx = this.currentX - obj.startX;
		var dy = this.currentY - obj.startY;
		this.angle = Math.atan2(dy, dx)/scrawl.radian;
		this.distance = Math.sqrt((dx*dx)+(dy*dy));
		return this;
		};

	function Link(items){
		Scrawl.call(this, items);
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
	Link.prototype = Object.create(Scrawl.prototype);
	Link.prototype.type = 'Link';
	Link.prototype.classname = 'linknames';
	Link.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Link
			species: (this.species) ? this.species : u,
			startPoint: (this.startPoint) ? this.startPoint : u,
			sprite: (this.sprite) ? this.sprite : u,
			endPoint: (this.endPoint) ? this.endPoint : u,
			controlPoint1: (this.controlPoint1) ? this.controlPoint1 : u,
			controlPoint2: (this.controlPoint2) ? this.controlPoint2 : u,
			action: (this.action !== 'add') ? this.action : u,
			precision: (this.precision !== 100) ? this.precision : u,
			positions: (this.positions) ? true : u,
			};
		};
	Link.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			species: false,
			startPoint: false,
			sprite: false,
			endPoint: false,
			controlPoint1: false,
			controlPoint2: false,
			action: false,
			precision: 100,
			positions: false,
			});
		return this;
		};
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
		this.setToSprite = (scrawl.isa(items.setToSprite,'bool')) ? items.setToSprite : false; 
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
		this.startRangeX = items.startRangeX || 0;
		this.startRangeY = items.startRangeY || 0;
		this.endRangeX = (scrawl.isa(items.endRangeX,'num')) ? items.endRangeX : 1;
		this.endRangeY = (scrawl.isa(items.endRangeY,'num')) ? items.endRangeY : 0;
		this.autoUpdate = (scrawl.isa(items.autoUpdate,'bool')) ? items.autoUpdate : false;
		return this;
		}
	Design.prototype = Object.create(Scrawl.prototype);
	Design.prototype.type = 'Design';
	Design.prototype.classname = 'designnames';
	Design.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Design/Gradient/RadialGradient
			color: (this.color) ? this.color : u,
			setToSprite: (this.setToSprite) ? this.setToSprite : u,
			roll: (this.roll !== 0) ? this.roll : u,
			cell: (this.cell) ? this.cell : u,
			startX: (this.startX !== 0) ? this.startX : u,
			startY: (this.startY !== 0) ? this.startY : u,
			endX: (this.endX !== 0) ? this.endX : u,
			endY: (this.endY !== 0) ? this.endY : u,
			handleX: (this.handleX !== 0) ? this.handleX : u,
			handleY: (this.handleY !== 0) ? this.handleY : u,
			startHandleX: (this.startHandleX !== 0) ? this.startHandleX : u,
			startHandleY: (this.startHandleY !== 0) ? this.startHandleY : u,
			endHandleX: (this.endHandleX !== 0) ? this.endHandleX : u,
			endHandleY: (this.endHandleY !== 0) ? this.endHandleY : u,
			startRangeX: (this.startRangeX !== 0) ? this.startRangeX : u,
			startRangeY: (this.startRangeY !== 0) ? this.startRangeY : u,
			endRangeX: (this.endRangeX !== 1) ? this.endRangeX : u,
			endRangeY: (this.endRangeY !== 1) ? this.endRangeY : u,
			autoUpdate: (this.autoUpdate) ? this.autoUpdate : u,
			startRadius: (scrawl.xt(this.startRadius) && this.startRadius !== 0) ? this.startRadius : u,
			endRadius: (scrawl.xt(this.endRadius) && this.endRadius !== 0) ? this.endRadius : u,
			startRangeRadius: (scrawl.xt(this.startRangeRadius) && this.startRangeRadius !== 0.5) ? this.startRangeRadius : u,
			endRangeRadius: (scrawl.xt(this.endRangeRadius) && this.endRangeRadius !== 0) ? this.endRangeRadius : u,
			};
		};
	Design.prototype.setToDefaults = function(){
		var u;
		this.set({
			comment: '',
			title: '',
			setToSprite: false,
			roll: 0,
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
			handleX: 0,
			handleY: 0,
			startHandleX: 0,
			startHandleY: 0,
			endHandleX: 0,
			endHandleY: 0,
			startRangeX: 0,
			startRangeY: 0,
			endRangeX: 1,
			endRangeY: 1,
			autoUpdate: false,
			startRadius: (scrawl.xt(this.startRadius)) ? 0 : u,
			endRadius: (scrawl.xt(this.endRadius)) ? 0 : u,
			startRangeRadius: (scrawl.xt(this.startRangeRadius)) ? 0.5 : u,
			endRangeRadius: (scrawl.xt(this.endRangeRadius)) ? 0 : u,
			});
		return this;
		};
	Design.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.roll){this.roll += items.roll;}
		if(items.startX){this.startX += items.startX;}
		if(items.startY){this.startY += items.startY;}
		if(items.startRadius){this.startRadius += items.startRadius;}
		if(items.endX){this.endX += items.endX;}
		if(items.endY){this.endY += items.endY;}
		if(items.endRadius){this.endRadius += items.endRadius;}
		if(items.startRangeRadius){this.startRangeRadius += items.startRangeRadius;}
		if(items.endRangeRadius){this.endRangeRadius += items.endRangeRadius;}
		if(items.handleX){this.handleX += items.handleX;}
		if(items.handleY){this.handleY += items.handleY;}
		if(items.startHandleX){this.startHandleX += items.startHandleX;}
		if(items.startHandleY){this.startHandleY += items.startHandleY;}
		if(items.endHandleX){this.endHandleX += items.endHandleX;}
		if(items.endHandleY){this.endHandleY += items.endHandleY;}
		if(items.startRangeX){this.startRangeX += items.startRangeX;}
		if(items.startRangeY){this.startRangeY += items.startRangeY;}
		if(items.endRangeX){this.endRangeX += items.endRangeX;}
		if(items.endRangeY){this.endRangeY += items.endRangeY;}
		this.update();
		return this;
		};
	Design.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
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
			this.color[i].stop += this.roll;
			if(!this.color[i].stop.isBetween(0,1,true)){
				this.color[i].stop = (this.color[i].stop > 0.5) ? this.color[i].stop-1 : this.color[i].stop+1;
				}
			if(this.color[i].stop <= 0){this.color[i].stop = 0.000001;}
			else if(this.color[i].stop >= 1){this.color[i].stop = 0.999999;}
			}
		this.color.sort(function(a,b){
			return a.stop - b.stop;
			});
		};
	Design.prototype.applyStops = function(){
		if(scrawl.dsn[this.name]){
			for(var i=0, z=this.color.length; i<z; i++){
				scrawl.dsn[this.name].addColorStop(this.color[i].stop, this.color[i].color);
				}
			}
		return this;
		};
	Design.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.designnames.removeItem(this.name);
		return true;
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
		this.startRangeRadius = (scrawl.isa(items.startRangeRadius,'num')) ? items.startRangeRadius : 0.5;
		this.endRangeRadius = items.endRangeRadius || 0;
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
		this.setImage((items.source || items.imageData || scrawl.image[items.image] || false), this.name);
		return this;
		}
	Pattern.prototype = Object.create(Scrawl.prototype);
	Pattern.prototype.type = 'Pattern';
	Pattern.prototype.classname = 'designnames';
	Pattern.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Pattern
			repeat: (this.repeat !== 'repeat') ? this.repeat : u,
			image: (this.image) ? this.image : u,
			source: (this.source) ? this.source : u,
			};
		};
	Pattern.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			repeat: 'repeat',
			});
		return this;
		};
	Pattern.prototype.setImage = function(source, name, callback){
		if(scrawl.isa(source, 'str')){
			var myImage = new Image();
			var that = this;
			myImage.id = name;
			myImage.onload = function(callback){
				try{
					var iObj = scrawl.newImage({
						name: name,
						element: myImage,
						});
					scrawl.design[name] = that;
					scrawl.design[name].image = iObj.name;
					scrawl.design[name].source = source;
					scrawl.designnames.pushUnique(name);
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
			scrawl.design[this.name] = this;
			scrawl.designnames.pushUnique(this.name);
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
		return this;
		};
	Pattern.prototype.get = function(){
		return (scrawl.xt(scrawl.dsn[this.name])) ? scrawl.dsn[this.name] : 'rgba(0,0,0,0)';
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
	Pattern.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.designnames.removeItem(this.name);
		return true;
		};

	function Color(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.r = items.r || 0;
		this.g = items.g || 0;
		this.b = items.b || 0;
		this.a = items.a || 1;
		this.rShift = items.rShift || 0;
		this.gShift = items.gShift || 0;
		this.bShift = items.bShift || 0;
		this.aShift = items.aShift || 0;
		this.rMax = items.rMax || 255;
		this.gMax = items.gMax || 255;
		this.bMax = items.bMax || 255;
		this.aMax = items.aMax || 1;
		this.rMin = items.rMin || 0;
		this.gMin = items.gMin || 0;
		this.bMin = items.bMin || 0;
		this.aMin = items.aMin || 0;
		this.rBounce = (scrawl.isa(items.rBounce,'bool')) ? items.rBounce : false;
		this.gBounce = (scrawl.isa(items.gBounce,'bool')) ? items.gBounce : false;
		this.bBounce = (scrawl.isa(items.bBounce,'bool')) ? items.bBounce : false;
		this.aBounce = (scrawl.isa(items.aBounce,'bool')) ? items.aBounce : false;
		this.autoUpdate = (scrawl.isa(items.autoUpdate,'bool')) ? items.autoUpdate : false;
		if(scrawl.xt(items.color)){
			this.convert(items.color)
			};
		if(items.random){
			this.generateRandomColor(items)
			};
		this.checkValues();
		scrawl.design[this.name] = this;
		scrawl.designnames.pushUnique(this.name);
		return this;
		}
	Color.prototype = Object.create(Scrawl.prototype);
	Color.prototype.type = 'Color';
	Color.prototype.classname = 'designnames';
	Color.prototype.prepareForExport = function(){
		var u;
		return {
			//all
			name: this.name,
			comment: (this.comment !== '') ? this.comment : u,
			title: (this.title !== '') ? this.title : u,
			timestamp: this.timestamp,
			type: this.type,
			//Pattern
			r: (this.r !== 0) ? this.r : u,
			g: (this.g !== 0) ? this.g : u,
			b: (this.b !== 0) ? this.b : u,
			a: (this.a !== 1) ? this.a : u,
			rShift: (this.rShift !== 0) ? this.rShift : u,
			gShift: (this.gShift !== 0) ? this.gShift : u,
			bShift: (this.bShift !== 0) ? this.bShift : u,
			aShift: (this.aShift !== 0) ? this.aShift : u,
			rMax: (this.rMax !== 255) ? this.rMax : u,
			gMax: (this.gMax !== 255) ? this.gMax : u,
			bMax: (this.bMax !== 255) ? this.bMax : u,
			aMax: (this.aMax !== 1) ? this.aMax : u,
			rMin: (this.rMin !== 0) ? this.rMin : u,
			gMin: (this.gMin !== 0) ? this.gMin : u,
			bMin: (this.bMin !== 0) ? this.bMin : u,
			aMin: (this.aMin !== 0) ? this.aMin : u,
			rBounce: (this.rBounce) ? this.rBounce : u,
			gBounce: (this.gBounce) ? this.gBounce : u,
			bBounce: (this.bBounce) ? this.bBounce : u,
			aBounce: (this.aBounce) ? this.aBounce : u,
			autoUpdate: (this.autoUpdate) ? this.autoUpdate : u,
			};
		};
	Color.prototype.setToDefaults = function(){
		this.set({
			comment: '',
			title: '',
			r: 0,
			g: 0,
			b: 0,
			a: 1,
			rShift: 0,
			gShift: 0,
			bShift: 0,
			aShift: 0,
			rMax: 255,
			gMax: 255,
			bMax: 255,
			aMax: 1,
			rMin: 0,
			gMin: 0,
			bMin: 0,
			aMin: 0,
			rBounce: false,
			gBounce: false,
			bBounce: false,
			aBounce: false,
			autoUpdate: false,
			});
		return this;
		};
	Color.prototype.get = function(){
		this.checkValues();
		return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
		};
	Color.prototype.generateRandomColor = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.r = items.r || parseInt(((Math.random()*(this.rMax-this.rMin))+this.rMin).toFixed());
		this.g = items.g || parseInt(((Math.random()*(this.gMax-this.gMin))+this.gMin).toFixed());
		this.b = items.b || parseInt(((Math.random()*(this.bMax-this.bMin))+this.bMin).toFixed());
		this.a = items.a || parseFloat(((Math.random()*(this.aMax-this.aMin))+this.aMin).toFixed(6));
		this.checkValues();
		return this;
		};
	Color.prototype.checkValues = function(){
		this.r = (this.r > 255) ? 255 : ((this.r < 0) ? 0 : this.r);
		this.g = (this.g > 255) ? 255 : ((this.g < 0) ? 0 : this.g);
		this.b = (this.b > 255) ? 255 : ((this.b < 0) ? 0 : this.b);
		this.a = (this.a > 1) ? 1 : ((this.a < 0) ? 0 : this.a);
		return this;
		};
	Color.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.random){
			this.generateRandomColor(items);
			}
		this.checkValues();
		return this;
		};
	Color.prototype.update = function(){
		var l = ['r','g','b','a'];
		for(var i=0, z=l.length; i<z; i++){
			if(!(this[l[i]]+this[l[i]+'Shift']).isBetween(this[l[i]+'Max'],this[l[i]+'Min'],true)){
				if(this[l[i]+'Bounce']){
					this[l[i]+'Shift'] = -this[l[i]+'Shift'];
					}
				else{
					this[l[i]] = (this[l[i]] > (this[l[i]+'Max']+this[l[i]+'Min'])/2) ? this[l[i]+'Max'] : this[l[i]+'Min'];
					this[l[i]+'Shift'] = 0;
					}
				}
			this[l[i]] += this[l[i]+'Shift'];
			}
		return this;
		};
	Color.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.r += items.r || 0;
		this.g += items.g || 0;
		this.b += items.b || 0;
		this.a += items.a || 0;
		this.checkValues();
		return this;
		};
	Color.prototype.convert = function(items){
		items = (scrawl.isa(items,'str')) ? items : '';
		if(items.length > 0){
			items.toLowerCase();
			var temp;
			if(items[0] === '#'){
				if(items.length < 5){
					this.r = this.toDecimal(items[1]+items[1]);
					this.g = this.toDecimal(items[2]+items[2]);
					this.b = this.toDecimal(items[3]+items[3]);
					}
				else if(items.length < 8){
					this.r = this.toDecimal(items[1]+items[2]);
					this.g = this.toDecimal(items[3]+items[4]);
					this.b = this.toDecimal(items[5]+items[6]);
					}
				}
			else if(/rgb\(/.test(items)){
				temp = items.match(/([0-9.]+\b)/g);
				if(/%/.test(items)){
					this.r = parseInt((temp[0]/100)*255,10);
					this.g = parseInt((temp[1]/100)*255,10);
					this.b = parseInt((temp[2]/100)*255,10);
					}
				else{
					this.r = parseInt(temp[0],10);
					this.g = parseInt(temp[1],10);
					this.b = parseInt(temp[2],10);
					}
				}
			else if(/rgba\(/.test(items)){
				temp = items.match(/([0-9.]+\b)/g);
				this.r = temp[0];
				this.g = temp[1];
				this.b = temp[2];
				this.a = temp[3];
				}
			else{
				switch(items){
					case 'green' : 		this.r = 0;		this.g = 128;	this.b = 0;		break;
					case 'silver' : 	this.r = 192;	this.g = 192;	this.b = 192;	break;
					case 'lime' : 		this.r = 0;		this.g = 255;	this.b = 0;		break;
					case 'gray' : 		this.r = 128;	this.g = 128;	this.b = 128;	break;
					case 'grey' : 		this.r = 128;	this.g = 128;	this.b = 128;	break;
					case 'olive' : 		this.r = 128;	this.g = 128;	this.b = 0;		break;
					case 'white' : 		this.r = 255;	this.g = 255;	this.b = 255;	break;
					case 'yellow' : 	this.r = 255;	this.g = 255;	this.b = 0;		break;
					case 'maroon' : 	this.r = 128;	this.g = 0;		this.b = 0;		break;
					case 'navy' : 		this.r = 0;		this.g = 0;		this.b = 128;	break;
					case 'red' : 		this.r = 255;	this.g = 0;		this.b = 0;		break;
					case 'blue' : 		this.r = 0;		this.g = 0;		this.b = 255;	break;
					case 'purple' : 	this.r = 128;	this.g = 0;		this.b = 128;	break;
					case 'teal' : 		this.r = 0;		this.g = 128;	this.b = 128;	break;
					case 'fuchsia' : 	this.r = 255;	this.g = 0;		this.b = 255;	break;
					case 'aqua' : 		this.r = 0;		this.g = 255;	this.b = 255;	break;
					default : 			this.r = 0;		this.g = 0;		this.b = 0;		break;
					}
				}
			}
		this.checkValues();
		return this;
		};
	Color.prototype.toDecimal = function(item){
		return parseInt(item,16);
		};
	Color.prototype.toHex = function(item){
		return item.toString(16);
		};
	Color.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.designnames.removeItem(this.name);
		return true;
		};
	
	scrawl.initialize();
	return scrawl;
	}());
