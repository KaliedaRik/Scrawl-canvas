/*
# Phrase factory
*/
import { constructors, cell, cellnames, styles, stylesnames } from '../core/library.js';
import { mergeOver, 
	xt, 
	defaultNonReturnFunction, 
	ensurePositiveFloat, 
	ensureFloat, 
	ensureString, 
	removeCharFromString } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import { makeFontAttributes } from './fontAttributes.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

/*
Constants used by Phrase entitys
*/
const tDimsCalc = document.createElement('div');
tDimsCalc.style.padding = 0;
tDimsCalc.style.border = 0;
tDimsCalc.style.margin = 0;
tDimsCalc.style.height = 'auto';
tDimsCalc.style.width = '200em';
tDimsCalc.style.boxSizing = 'border-box';
tDimsCalc.style.position = 'absolute';
tDimsCalc.style.top = '-5000px';
tDimsCalc.style.left = '-5000px';
tDimsCalc.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwertyd0123456789QWERTY';
document.body.appendChild(tDimsCalc);

const textEntityConverter = document.createElement('textarea');

/*
## Phrase constructor
*/
const Phrase = function (items = {}) {

	this.fontAttributes = makeFontAttributes(items);

	delete items.font;
	delete items.style;
	delete items.variant;
	delete items.weight;
	delete items.stretch;
	delete items.size;
	delete items.sizeValue;
	delete items.sizeMetric;
	delete items.family;

	this.entityInit(items);

	this.glyphStyles = [];

	this.dirtyText = true;
	this.dirtyFont = true;

	return this;
};

/*
## Phrase object prototype setup
*/
let P = Phrase.prototype = Object.create(Object.prototype);
P.type = 'Phrase';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = entityMix(P);
P = filterMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	// fontAttributes: {},

/*

*/
	text: '',
	textPositions: [],

/*

*/
	textLines: [],
	textLineWidths: [],
	textLineWords: [],

	treatWordAsGlyph: false,

	textGlyphs: [],
	textGlyphWidths: [],

/*
Glyphs (individual letters) can be individually styled by adding a styling object to the __glyphStyles__ array. Subsequent glyphs will inherit those styles until a second styling object is encountered further along the array.

Subsequent styling objects will alter specified attributes, leaving other attributes in their current (not default) state. To reset all attributes to their defaults and at the same time change selected attributes, include _defaults: true_ in the object.

The styling object can take one or more of the following attributes:

* style - eg 'italic'
* variant - eg 'small-caps'
* weight - eg 'bold'
* stretch
* size - any permitted font size value
* family 

* space - alter the letterSpacing values to spread or condense glyphs

* fill - fillStyle to be applied to the glyph
* stroke - strokeStyle to be applied to the glyph

* highlight - boolean - whether highlight should be applied to the glyph

* defaults - boolean - setting this to true will set the glyph (and subsequent glyphs) to the Phrase entity's current font and fill/stroke style values

	Example: "make the word __glyphs__ bold"

	myPhrase.setGlyphStyles(14, {weight: 'bold'});
	myPhrase.setGlyphStyles(20, {defaults: true});
	myPhrase.setGlyphStyles(22, {fill: 'red'});
*/
	glyphStyles: [],

/*
Permitted values are: 'left' (default), 'center', 'right', 'full'
*/
	justify: 'left',

/*
A multiplier applied to the font height to add space between lines of text
*/
	lineHeight: 1.5,

/*
A set number of pixels to place between each glyph. Positive numbers only
*/
	letterSpacing: 0,

/*

*/
	textPath: '',

/*

*/
	textPathPosition: 0,

/*

*/
	textPathLoop: true,

/*

*/
	addTextPathRoll: true,

/*

*/
	boundingBoxColor: 'rgba(0,0,0,0.5)',
	showBoundingBox: false,

/*

*/
	highlightColor: 'rgb(250,218,94)',
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
S.handleX = function (item) {

	this.checkVector('handle');
	this.handle.x = item;
	this.dirtyHandle = true;
	this.dirtyText = true;
	this.dirtyPathObject = true;
};

/*

*/
S.handleY = function (item) {

	this.checkVector('handle');
	this.handle.y = item;
	this.dirtyHandle = true;
	this.dirtyText = true;
	this.dirtyPathObject = true;
};

/*

*/
S.handle = function (item = {}) {

	this.checkVector('handle');
	this.handle.x = (xt(item.x)) ? item.x : this.handle.x;
	this.handle.y = (xt(item.y)) ? item.y : this.handle.y;
	this.dirtyHandle = true;
	this.dirtyText = true;
	this.dirtyPathObject = true;
};

/*
Retrieving aspects of the font string
*/
G.style = function () {

	return this.fontAttributes.get('style');
};

G.variant = function () {

	return this.fontAttributes.get('variant');
};

G.weight = function () {

	return this.fontAttributes.get('weight');
};

G.stretch = function () {

	return this.fontAttributes.get('stretch');
};

G.size = function () {

	return this.fontAttributes.get('size');
};

G.sizeValue = function () {

	return this.fontAttributes.get('sizeValue');
};

G.sizeMetric = function () {

	return this.fontAttributes.get('sizeMetric');
};

G.family = function () {

	return this.fontAttributes.get('family');
};

G.font = function () {

	return this.fontAttributes.get('font');
};

S.font = function (item) {

	this.fontAttributes.set({font: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.style = function (item) {

	this.fontAttributes.set({style: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.variant = function (item) {

	this.fontAttributes.set({variant: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.weight = function (item) {

	this.fontAttributes.set({weight: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.stretch = function (item) {

	this.fontAttributes.set({stretch: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.size = function (item) {

	this.fontAttributes.set({size: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.sizeValue = function (item) {

	this.fontAttributes.set({sizeValue: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

D.sizeValue = function (item) {

	this.fontAttributes.deltaSet({sizeValue: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.sizeMetric = function (item) {

	this.fontAttributes.set({sizeMetric: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

S.family = function (item) {
	
	this.fontAttributes.set({family: item});

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

/*
Handling text updates
*/
S.text = function (item) {

	this.text = ensureString(item);
	
	this.dirtyText = true;
	this.dirtyPathObject = true;
};

S.justify = function (item) {

	this.justify = ensureString(item);
	
	this.dirtyText = true;
	this.dirtyPathObject = true;
};

/*
Handling text width - overwrites functions defined in mixin/entity.js
*/
S.width = function (item) {

	this.width = (xt(item)) ? item : this.defs.width;

	this.dirtyDimensions = true;
	this.dirtyHandle = true;
	this.dirtyPathObject = true;
	this.dirtyPivoted = true;
	this.dirtyText = true;
};
D.width = function (item) {

	this.width = addStrings(this.width, item);

	this.dirtyDimensions = true;
	this.dirtyHandle = true;
	this.dirtyPathObject = true;
	this.dirtyPivoted = true;
	this.dirtyText = true;
};

S.scale = function (item) {

	this.scale = ensurePositiveFloat(item);

	this.dirtyFont = true;
	this.dirtyPathObject = true;
	this.dirtyScale = true;
	this.dirtyPivoted = true;
};
D.scale = function (item) {

	this.scale += ensureFloat(item);
	if (this.scale < 0) this.scale = 0;

	this.dirtyFont = true;
	this.dirtyPathObject = true;
	this.dirtyScale = true;
	this.dirtyPivoted = true;
};

/*
Manipulating lineHeight and letterSpacing attributes
*/
S.lineHeight = function (item) {

	this.lineHeight = ensurePositiveFloat(item, 3);

	this.dirtyPathObject = true;
	this.dirtyText = true;
};
D.lineHeight = function (item) {

	this.lineHeight += ensureFloat(item, 3);
	if (this.lineHeight < 0) this.lineHeight = 0;

	this.dirtyPathObject = true;
	this.dirtyText = true;
};

S.letterSpacing = function (item) {

	this.letterSpacing = ensurePositiveFloat(item, 3);

	this.dirtyPathObject = true;
	this.dirtyText = true;
};
D.letterSpacing = function (item) {

	this.letterSpacing += ensureFloat(item, 3);
	if (this.letterSpacing < 0) this.letterSpacing = 0;

	this.dirtyPathObject = true;
	this.dirtyText = true;
};


/*
## Define prototype functions
*/

/*

*/
P.setGlyphStyles = function (args, ...pos) {

	if (args && Array.isArray(pos)) {

		let styles = this.glyphStyles,
			slot, style, i, iz;

		for (i = 0, iz = pos.length; i < iz; i++) {

			slot = pos[i];
			style = styles[slot];

			if (!style) styles[slot] = args;
			else mergeOver(style, args);
		}

		this.dirtyPathObject = true;
		this.dirtyText = true;
	}

	return this;
};

/*

*/
P.buildText = function () {

	this.dirtyText = false;
	this.text = this.convertTextEntityCharacters(this.text);
	this.calculateTextPositions(this.text);
};

/*
To get convert any HTML entity (eg: &lt; &epsilon;) in the text string into their required glyphs

Also removes excessive white space
*/
P.convertTextEntityCharacters = function (item) {

	let mytext = item.trim();

	mytext = mytext.replace(/[\s\uFEFF\xA0]+/g, ' ');

	textEntityConverter.innerHTML = mytext;
	return textEntityConverter.value;
};

/*

*/
P.calculateTextPositions = function (mytext) {

	// 0. strokeStyle/fillStyle helper function
	let makeStyle = function (item) {

		if (item.substring) {

			let brokenStyle = false;

			if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
			else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

			if (brokenStyle) return brokenStyle.getData(self, host, true);
			else return item;
		}
		else return item.getData(self, host, true);
	};

	// 1. setup - get values for text? arrays, current?, highlight?, ?Attributes, etc
	let myCell = requestCell(),
		engine = myCell.engine;

	let self = this,
		host = (this.group && this.group.getHost) ? this.group.getHost() : myCell;

	let textGlyphs, 
		textGlyphWidths = [], 
		textLines = [], 
		textLineWidths = [],
		textLineWords = [], 
		textPositions = [],
		fontLibrary = [],
		spacesArray = [],
		gStyle, gPos, item, 
		starts, ends, cursor, word, height,
		space, i, iz, j, jz, k, kz;

	let fragment, len, glyphArr, glyph, nextGlyph, glyphWidth, lineLen, totalLen, rotate,
		singles = [],
		pairs = [];

	let fontAttributes = this.fontAttributes,
		glyphAttributes = fontAttributes.clone({});

	let glyphStyles = this.glyphStyles;

	let state = this.state;

	let scale = this.scale,
		width = this.localWidth * scale,
		treatWordAsGlyph = this.treatWordAsGlyph,
		lineHeight = this.lineHeight,
		justify = this.justify,
		handle, handleX, handleY;

	let defaultFont = fontAttributes.update(scale), 
		defaultFillStyle = makeStyle(state.fillStyle), 
		defaultStrokeStyle = makeStyle(state.strokeStyle), 
		defaultSpace = this.letterSpacing * scale, 

		currentFont = defaultFont, 
		currentFillStyle = defaultFillStyle, 
		currentStrokeStyle = defaultStrokeStyle, 
		currentSpace = defaultSpace;

	let highlightColor = (this.highlightColor) ? makeStyle(this.highlightColor) : false,
		highlightFlag = false;

	let maxHeight = 0;

	// 2. create textGlyphs array
	// - also shove the default font into the fontLibrary array
	textGlyphs = (treatWordAsGlyph) ? this.text.split(' ') : this.text.split('');
	fontLibrary.push(currentFont);

	// 3. textPositions array will include an array of data for each glyph
	// - [font, strokeStyle, fillStyle, highlight, text, startX, startY]
	// - and populate spacesArray with space position data (for full justify calculations later)
	for (i = 0, iz = textGlyphs.length; i < iz; i++) {

		item = textGlyphs[i];

		// textPositions[i] = (i === 0) ? 
		// 	[currentFont, currentStrokeStyle, currentFillStyle, false, item, 0, 0] :
		// 	[, , , , item, 0, 0];
		textPositions[i] = [, , , , item, 0, 0];

		if (item === ' ') spacesArray.push(i);
	}

	// 4. process the glyphStyles array to start populating the textPositions arrays
	// TODO - things definitely not working yet: space
	if (glyphStyles.length) {

		for (i = 0, iz = glyphStyles.length; i < iz; i++) {

			gStyle = glyphStyles[i];

			if (gStyle) {

				gPos = textPositions[i];

				if (gStyle.defaults) {
					currentFont = glyphAttributes.update(scale, fontAttributes);
					currentStrokeStyle = defaultStrokeStyle;
					currentFillStyle = defaultFillStyle;
					currentSpace = defaultSpace;
					gPos[0] = currentFont;
					gPos[1] = currentStrokeStyle;
					gPos[2] = currentFillStyle;
					gPos[3] = highlightFlag;
				}

				item = gStyle.stroke;
				if (item && item !== currentStrokeStyle) {

					currentStrokeStyle = makeStyle(gStyle.stroke);
					gPos[1] = currentStrokeStyle;
				};

				item = gStyle.fill;
				if (item && item !== currentFillStyle) {

					currentFillStyle = makeStyle(gStyle.fill);
					gPos[2] = currentFillStyle;
				};

				item = gStyle.space;
				if (xt(item) && item !== currentSpace) currentSpace = item * scale

				item = gStyle.highlight;
				if (xt(item) && item !== highlightFlag) {

					highlightFlag = item;
					gPos[3] = highlightFlag;
				};

				if (gStyle.variant || gStyle.weight || gStyle.style || gStyle.stretch || gStyle.size || gStyle.sizeValue || gStyle.sizeMetric || gStyle.family || gStyle.font) {

					item = glyphAttributes.update(scale, gStyle);
					if (item !== currentFont) {

						currentFont = item;
						gPos[0] = currentFont;

						if (fontLibrary.indexOf(currentFont) < 0) fontLibrary.push(currentFont);
					}
				}
			}
			else if (i === 0) {

				textPositions[0][0] = currentFont;
				textPositions[0][1] = currentStrokeStyle;
				textPositions[0][2] = currentFillStyle;
				textPositions[0][3] = highlightFlag;
			}

			// setup textGlyphWidths array, populating it with current letterSpacing values
			textGlyphWidths[i] = currentSpace;
		}
	}

	// 5. calculate the text height value
	// - all lines in a multiline Phrase will use the maximum text height value, even if they don't include the biggest value
	fontLibrary.forEach(font => {

		tDimsCalc.style.font = font;
		maxHeight = (tDimsCalc.clientHeight > maxHeight) ? tDimsCalc.clientHeight : maxHeight;
	});

	// 6. calculate glyph width values
	// - this is the tricky bit as, ideally, we need to take into account font kerning values
	// - however kerning values go out of the window when font attributes (especially size) change in mid-text
	// - and we need to remember that letterSpacing can also be different in different parts of the text
	// - this is also the best place to populate the textLine arrays

	// TODO - mixed text doesn't scale as expected - investigate
	// TODO - none of this takes into consideration the needs of RTL scripts eg Arabic, Hebrew, etc

	totalLen = lineLen = starts = ends = 0;

	for (i = 0, iz = textPositions.length; i < iz; i++) {

		glyphArr = textPositions[i];
		glyph = glyphArr[4];

		if (glyphArr[0]) {

			engine.font = glyphArr[0];
			singles.push(engine.measureText(glyph).width);
			
			if (i > 0) pairs.push(false);
			else {

				nextGlyph = textPositions[i + 1];
				nextGlyph = (!treatWordAsGlyph && nextGlyph) ? nextGlyph[4] : false;
				len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
				pairs.push(len);
			}
		}
		else {

			nextGlyph = textPositions[i + 1];
			nextGlyph = (!treatWordAsGlyph && nextGlyph) ? nextGlyph[4] : false;

			singles.push(engine.measureText(glyph).width);

			len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
			pairs.push(len);
		}
	}

	for (i = 0, iz = pairs.length; i < iz; i++) {

		glyph = pairs[i];

		if (glyph) {

			len = singles[i] + singles[i + 1];

			if (len > glyph) singles[i] -= (len - glyph);
		}
	}

	for (i = 0, iz = textPositions.length; i < iz; i++) {

		glyph = textPositions[i][4];

		glyphWidth = singles[i] + textGlyphWidths[i];
		textGlyphWidths[i] = glyphWidth;

		if (treatWordAsGlyph || glyph === ' ') ends = i;

		lineLen += glyphWidth;
		totalLen += glyphWidth;

		// need starts to be less than ends
		// - this should make sure we pick up individual words that are longer than the Phrase entity's width
		if (lineLen >= width && starts < ends) {

			fragment = textGlyphs.slice(starts, ends).join('');
			textLines.push(fragment);
			len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
			textLineWords.push(len);

			len = textGlyphWidths.slice(starts, ends).reduce((a, v) => a + v, 0);
			textLineWidths.push(len);

			lineLen -= len;
			starts = ends + 1;
		}

		// need to pick up the last (or only) line
		else if (i + 1 === iz) {

			// pick up single line
			if (lineLen === totalLen) {

				fragment = this.text;

				textLines.push(fragment);
				textLineWords.push((treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length);
				textLineWidths.push(totalLen);
			}

			// final line of multiline text
			else {

				fragment = textGlyphs.slice(starts).join('');
				textLines.push(fragment);
				len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
				textLineWords.push(len);

				len = textGlyphWidths.slice(starts).reduce((a, v) => a + v, 0);
				textLineWidths.push(len);
			}
		}
	}

	// 7. calculate localHeight
	this.localHeight = (((textLines.length - 1) * maxHeight) * lineHeight) + maxHeight;

	this.cleanHandle();
	this.dirtyHandle = false;
	handle = this.currentHandle;
	
	handleX = -handle.x * scale;
	handleY = -handle.y;

	// 8. we should now be in a position where we can calculate each glyph's startXY values
	// - BE AWARE - this is probably where the whole thing falls over visually
	// - because I've set textBaseline to the top of the glyph
	//   - so bigger letters will line up at the top (CONFIRMED), not on their (latin/cyrillic) baselines

	// TODO - work out a way to manage Text Baseline - preferably better than native canvas engine does - so different sized text can mix in a better pleasing, more flexible way

	// we have 3 scenarios, each with two options determined by whether we're going to position by-word or by-glyph

	// Scenario 1: text needs to be positioned on, or move along, a Shape entity path
	// - we'll have to get the position fresh each time? Assume yes for now ...
	// - change the positions array constituentt to: [font, strokeStyle, fillStyle, highlight, text, pathPos, rotateWithPath]
	if (this.textPath && this.textPath.length) {

		len = this.textPath.length;
		rotate = this.addTextPathRoll;
		cursor = 0;

		for (i = 0, iz = textPositions.length; i < iz; i++) {

			item = textPositions[i];
			item[5] = cursor / len;
			item[6] = rotate;

			cursor += textGlyphWidths[i];
		}

	}

	// Scenario 2: justify === 'full'
	// TODO!
	else if (justify === 'full') {

		for (j = 0, jz = textPositions.length; j < jz; j++) {

			item = textPositions[j];
			item[5] = 0;
			item[6] = 0;
		}
	}

	// Scenario 3: justify === 'left', or 'centre', or 'right'
	else {

		cursor = 0;
		height = handleY;

		for (i = 0, iz = textLineWidths.length; i < iz; i++) {

			if (justify === 'right') len = (width - textLineWidths[i]) + handleX;
			else if (justify === 'center') len = ((width - textLineWidths[i]) / 2) + handleX;
			else len = handleX;

			for (j = 0, jz = textLines[i].length; j < jz; j++) {

				item = textPositions[cursor];
				item[5] = len;
				item[6] = height;

				len += textGlyphWidths[cursor];

				cursor++;
			}

			cursor++;
			height += (maxHeight * lineHeight);
		}
	}

	// 9. clean up and exit
	this.textGlyphs = textGlyphs;
	this.textGlyphWidths = textGlyphWidths;
	this.textLines = textLines;
	this.textLineWidths = textLineWidths;
	this.textLineWords = textLineWords;
	this.textPositions = textPositions;
	this.textHeight = maxHeight;
	this.textLength = totalLen;

	releaseCell(myCell);
};

/*

*/
P.preCloneActions = function () {

	this.fontAttributes.buildFont(this.scale);
};

/*

*/
P.postCloneActions = function (clone, items) {

	clone.fontAttributes.set(this.fontAttributes);
	clone.fontAttributes.set(items);
	clone.fontAttributes.buildFont(clone.scale);
	clone.glyphStyles = JSON.parse(JSON.stringify(this.glyphStyles));
};

/*
Fonts don't have accessible paths...
*/
P.cleanPathObject = function () {

	this.dirtyPathObject = false;

	if (this.dirtyFont && this.fontAttributes) {

		this.dirtyFont = false;
		this.fontAttributes.buildFont(this.scale);
		this.dirtyText = true;
	}

	if (this.dirtyText) this.buildText();

	if (this.dirtyHandle) this.cleanHandle();

	let p = this.pathObject = new Path2D();
	
	let handle = this.currentHandle,
		scale = this.scale,
		x = -handle.x * scale,
		y = -handle.y,
		w = this.localWidth * scale,
		h = this.localHeight;

	p.rect(x, y, w, h);
};

/*

*/
P.prepareStamp = function() {

	if (this.mimic) this.prepareMimicStamp();

	if (this.dirtyDimensions) this.cleanDimensions();
	if (this.dirtyStart) this.cleanStart();
	if (this.dirtyOffset || this.dirtyScale || this.pivot) this.cleanOffset();
	if (this.dirtyPathObject) this.cleanPathObject();
	if (this.dirtyPivoted) this.updatePivotSubscribers();
};

/*

*/
P.regularStampSynchronousActions = function () {

	let dest = this.currentHost, 
		method = this.method,
		engine, i, iz, pos, data, 
		preStamper = this.preStamper,
		stamper = this.stamper;

	if (dest) {

		engine = dest.engine;

		if (!this.fastStamp) dest.setEngine(this);

		if (this.method === 'none') {

			this.performRotation(engine);
		}

		// TODO - need an elseif here to handle text along a path

		else {

			pos = this.textPositions;

			this.performRotation(engine);

			for (i = 0, iz = pos.length; i < iz; i++) {

				data = preStamper(engine, pos[i]);
				stamper[method](engine, this, data);
			}

			if (this.showBoundingBox) this.drawBoundingBox(engine);
		}
	}
};

/*

*/
P.preStamper = function (engine, args) {

	let [font, strokeStyle, fillStyle, highlight, ...data] = args;

	if (font) engine.font = font;
	if (strokeStyle) engine.strokeStyle = strokeStyle;
	if (fillStyle) engine.fillStyle = fillStyle;

	// TODO - highlight stuff needs to go here

	return data;
};

/*

*/
P.stamper = {

	draw: function (engine, entity, data) { 

		engine.strokeText(...data);
	},
	fill: function (engine, entity, data) { 

		engine.fillText(...data);
	},
	drawFill: function (engine, entity, data) { 

		engine.strokeText(...data);
		entity.currentHost.clearShadow();
		engine.fillText(...data);
		entity.currentHost.restoreShadow(entity);
	},
	fillDraw: function (engine, entity, data) { 

		engine.fillText(...data);
		entity.currentHost.clearShadow();
		engine.strokeText(...data);
		entity.currentHost.restoreShadow(entity);
	},
	floatOver: function (engine, entity, data) { 

		engine.strokeText(...data);
		engine.fillText(...data);
	},
	sinkInto: function (engine, entity, data) { 

		engine.fillText(...data);
		engine.strokeText(...data);
	},
	clear: function (engine, entity, data) { 

		let gco = engine.globalCompositeOperation;
		engine.globalCompositeOperation = 'destination-out';
		engine.fillText(...data);
		engine.globalCompositeOperation = gco;
	},	
};

/*

*/
P.drawBoundingBox = function (engine) {

	let handle = this.currentHandle,
		scale = this.scale,
		floor = Math.floor,
		ceil = Math.ceil;

	engine.save();
	engine.strokeStyle = this.boundingBoxColor;
	engine.lineWidth = 1;
	engine.globalCompositeOperation = 'source-over';
	engine.globalAlpha = 1;
	engine.shadowOffsetX = 0;
	engine.shadowOffsetY = 0;
	engine.shadowBlur = 0;
	engine.strokeRect(floor(-handle.x * scale), floor(-handle.y), ceil(this.localWidth * scale), ceil(this.localHeight));
	engine.restore();
};

/*

*/
P.performRotation = function (engine) {

	let dest = this.currentHost, 
		x, y;

	if (dest) {

		x = this.updateStampX();
		y = this.updateStampY();

		dest.rotateDestination(engine, x, y, this);
	}
};


/*
## Exported factory function
*/
const makePhrase = function (items) {
	return new Phrase(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Phrase = Phrase;

export {
	makePhrase,
};
