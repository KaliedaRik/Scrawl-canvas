/*
# State factory

TODO - documentation
*/
import { constructors, entity, styles } from '../core/library.js';
import { isa_obj, xt, xtGet } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

/*
## State constructor
*/
const State = function (items = {}) {

	this.set(this.defs);
	this.lineDash = [];
	this.set(items);

	return this;
};


/*
## State object prototype setup
*/
let P = State.prototype = Object.create(Object.prototype);
P.type = 'State';

/*
Apply mixins to prototype object
*/
P = baseMix(P);

/*
## Define default attributes
*/
P.defs = {

/*
Color, gradient or pattern used to fill a entity. Can be:

+ Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
+ COLORNAME String
+ GRADIENTNAME String
+ RADIALGRADIENTNAME String
+ PATTERNNAME String
*/
	fillStyle: 'rgba(0,0,0,1)',

/*
Color, gradient or pattern used to outline a entity. Can be:

+ Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
+ COLORNAME String
+ GRADIENTNAME String
+ RADIALGRADIENTNAME String
+ PATTERNNAME String
*/
	strokeStyle: 'rgba(0,0,0,1)',

/*
Entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
*/
	globalAlpha: 1,

/*
Compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include

+ 'source-over'
+ 'source-atop'
+ 'source-in'
+ 'source-out'
+ 'destination-over'
+ 'destination-atop'
+ 'destination-in'
+ 'destination-out'
+ 'lighter'
+ 'darker'
+ 'copy'
+ 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers_
*/
	globalCompositeOperation: 'source-over',

/*
Line width, in pixels
*/
	lineWidth: 1,

/*
Line cap styling. Permitted values include:

+ 'butt'
+ 'round'
+ 'square'
*/
	lineCap: 'butt',

/*
Line join styling. Permitted values include:

+ 'miter'
+ 'round'
+ 'bevel'
*/
	lineJoin: 'miter',

/*
Line dash format - an array of Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
*/
	lineDash: null,

/*
Line dash offset - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
*/
	lineDashOffset: 0,

/*
miterLimit - affecting the 'pointiness' of the line join where two lines join at an acute angle
*/
	miterLimit: 10,

/*
Horizontal offset of a entity's shadow, in pixels
*/
	shadowOffsetX: 0,

/*
Vertical offset of a entity's shadow, in pixels
*/
	shadowOffsetY: 0,

/*
Blur border for a entity's shadow, in pixels
*/
	shadowBlur: 0,

/*
Color used for entity shadow effect. Can be:

+ Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
+ COLORNAME String
*/
	shadowColor: 'rgba(0,0,0,0)',

/*
Cascading Style Sheet font String, for Phrase entitys
*/
	font: '12px sans-serif',

/*
Following values are permitted according to Canvas API specs: 'left', 'center', 'right', 'start', 'end'

TODO: check how setting this value to different values affects Scrawl-canvas functionality
- because at the moment I ignore it, beyond setting it on the canvas2d rendering engine
*/
	textAlign: 'start',

/*
Following values are permitted according to Canvas API specs: 'top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'

TODO: find a (sane) way to interrogate fonts to find out the values - from font tables? - given for these settings
- because if I can do that, then I can work out the bounding box
*/
	textBaseline: 'alphabetic',
};

/*
## Packet management

Overwriting base mixin functions. Nothing to add to base mixin arrays
*/
P.processPacketOut = function (key, value, includes) {

	let result = true;

	switch (key) {

		case 'lineDash' : 

			if (!value.length) {

				result = (includes.indexOf('lineDash') >= 0) ? true : false;
			}
			break;

		default : 

        	if (includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
	}
	return result;
};

/*
## Define attribute getters and setters
*/

/*
TODO - documentation
*/
P.set = function (items) {

	let key, i, iz,
		keys = Object.keys(items),
		d = this.defs;

	for (i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];

		if (key !== 'name') {

			if (typeof d[key] !== 'undefined') this[key] = items[key];
		}
	}
	return this;
};

P.get = function (item) {

	let undef, d, i;

	d = this.defs[item];

	if (typeof d !== 'undefined') {
	
		i = this[item];
		return (typeof i !== 'undefined') ? i : d;
	}
	else return undef;
};

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*
TODO - documentation
*/
S.fillStyle = function (item) {

	let temp;

	if (isa_obj(item) && item.lib === 'styles') this.fillStyle = item;
	else{

		temp = styles[item];

		if (temp) this.fillStyle = temp;
		else this.fillStyle = item;
	}
};

/*
TODO - documentation
*/
S.strokeStyle = function (item) {

	let temp;

	if (isa_obj(item) && item.lib === 'styles') this.strokeStyle = item;
	else{

		temp = styles[item];

		if (temp) this.strokeStyle = temp;
		else this.strokeStyle = item;
	}
};

/*
## Define prototype functions
*/
P.allKeys = Object.keys(P.defs);
P.mainKeys = ['globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'];
P.lineKeys = ['lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'];
P.styleKeys = ['fillStyle', 'strokeStyle', 'shadowColor'];
P.textKeys = ['font'];

/*
TODO - documentation
*/
P.getChanges = function (ent, engineState) {

	let mainKeys = this.mainKeys,
		lineKeys = this.lineKeys,
		styleKeys = this.styleKeys,
		textKeys = this.textKeys,
		k, style, scaled, i, iz, j, jz,
		linedashFlag, desired, current,
		defs = this.defs,
		result = {};

	let getItem = function (source, key) {
		return (typeof source[key] != 'undefined') ? source[key] : defs[key];
	};

	if (ent.substring) ent = entity[ent];

	// 'globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'
	for (i = 0, iz = mainKeys.length; i < iz; i++) {

		k = mainKeys[i];
		desired = getItem(this, k);
		current = getItem(engineState, k);

		if (current !== desired) result[k] = desired;
	}

	// 'lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'
	if (this.lineWidth || engineState.lineWidth) {

		for (i = 0, iz = lineKeys.length; i < iz; i++) {

			k = lineKeys[i];
			desired = getItem(this, k);
			current = getItem(engineState, k);

			if (k == 'lineDash') {

				if (desired.length || current.length) {

					if (desired.length != current.length) result.lineDash = desired;
					else {

						linedashFlag = false;

						for (j = 0, jz = desired.length; j < jz; j++) {

							if (desired[j] != current[j]) {
								linedashFlag = true;
								break;
							}
						}

						if (linedashFlag) result.lineDash = desired;
					}
				}
			}

			else if (k == 'lineWidth') {

				if (ent.scaleOutline) {

					scaled = (desired || 1) * (ent.scale || 1);

					if (scaled !== current) result.lineWidth = scaled;
				}
				else {

					if (desired !== current) result.lineWidth = desired;
				}
			}

			else if (current !== desired) result[k] = desired
		}
	}

	// 'fillStyle', 'strokeStyle', 'shadowColor'
	for (i = 0, iz = styleKeys.length; i < iz; i++) {

		k = styleKeys[i];
		current = getItem(engineState, k);
		desired = getItem(this, k);

		// string colors - only update if necessary
		if (desired.substring && current !== desired) result[k] = desired;

		// Color object colors need to be extracted before they can be compared and, if necessary, updated
		else if (desired.type === 'Color') {

			desired = desired.getData();

			if (current !== desired) result[k] = desired;
		}

		// gradient and pattern objects - get freshly deployed with each entity stamp
		else result[k] = desired;
	}

	// 'font'
	if (ent.type === 'Phrase') {

		for (i = 0, iz = textKeys.length; i < iz; i++) {

			k = textKeys[i];
			desired = getItem(this, k);
			current = getItem(engineState, k);

			if (current !== desired) result[k] = desired
		}
	}
	return result;
};

/*
TODO - documentation
*/
P.setStateFromEngine = function (engine) {

	let keys = this.allKeys,
		key;

	for (let i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];
		this[key] = engine[key];
	}

	this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
	this.lineDashOffset = xtGet(engine.lineDashOffset, 0);

	return this;
};

/*
## Exported factory function
*/
const makeState = function (items) {

	return new State(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.State = State;


/*
TODO - documentation
*/
export {
	makeState,
};
