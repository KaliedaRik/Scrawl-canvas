/*
# Phrase factory
*/
import { constructors, cell, cellnames, styles, stylesnames, artefact } from '../core/library.js';
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
tDimsCalc.style.lineHeight = 1;
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

* underline - boolean - whether underline should be applied to the glyph
* overline - boolean - whether overline should be applied to the glyph

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
The position and stroke style to be applied to a glyph when it is set to show underline or overline
*/
	overlinePosition: 0.1,
	overlineStyle: 'rgb(250,0,0)',
	underlinePosition: 0.6,
	underlineStyle: 'rgb(250,0,0)',

/*
The fill style to be applied to a glyph when it is set to show background highlighting
*/
	highlightStyle: 'rgba(250,218,94,0.4)',

/*
A set number of pixels to place between each glyph. Positive numbers only
*/
	letterSpacing: 0,

/*

*/
	textPath: '',
	textPathPosition: 0,
	textPathDirection: 'ltr',
	textPathLoop: true,
	addTextPathRoll: true,

/*

*/
	boundingBoxColor: 'rgba(0,0,0,0.5)',
	showBoundingBox: false,
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

*/
S.textPath = function (item) {

	this.textPath = item;

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

S.overlinePosition = function (item) {

	this.overlinePosition = ensureFloat(item, 3);

	this.dirtyPathObject = true;
	this.dirtyText = true;
};
D.overlinePosition = function (item) {

	this.overlinePosition += ensureFloat(item, 3);

	this.dirtyPathObject = true;
	this.dirtyText = true;
};

S.underlinePosition = function (item) {

	this.underlinePosition = ensureFloat(item, 3);

	this.dirtyPathObject = true;
	this.dirtyText = true;
};
D.underlinePosition = function (item) {

	this.underlinePosition += ensureFloat(item, 3);

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
P.getTextPath = function () {

	let path = this.textPath;

	if (path && path.substring) {

		path = this.textPath = artefact[this.textPath];

		if (path.type === 'Shape' && path.useAsPath) path.subscribers.push(this.name);
		else {

			path = this.path = false;
		}
	}

	return path;
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
	// TODO: need to check (with a demo-test) that we can use gradients and patterns as styles
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
	// TODO - check code uses all of these local variables; remove those that are not used
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
		spacesArray = [],
		gStyle, gPos, item, 
		starts, ends, cursor, word, height,
		space, i, iz, j, jz, k, kz;

	let fragment, len, glyphArr, glyph, nextGlyph, glyphWidth, lineLen, totalLen,
		singles = [],
		pairs = [],
		path = this.getTextPath(),
		direction, loop, rotate;

	let fontAttributes = this.fontAttributes,
		glyphAttributes = fontAttributes.clone({});

	let glyphStyles = this.glyphStyles;

	let state = this.state,
		fontLibrary = {},
		fontArray = [];

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

	let highlightStyle = (this.highlightStyle) ? makeStyle(this.highlightStyle) : false,
		highlightFlag = false;

	let underlineStyle = (this.underlineStyle) ? makeStyle(this.underlineStyle) : false,
		underlinePosition = this.underlinePosition,
		underlineFlag = false;

	let overlineStyle = (this.overlineStyle) ? makeStyle(this.overlineStyle) : false,
		overlinePosition = this.overlinePosition,
		overlineFlag = false;

	let maxHeight = 0;

	// 2. create textGlyphs array
	// - also shove the default font into the fontLibrary array
	textGlyphs = (treatWordAsGlyph) ? this.text.split(' ') : this.text.split('');
	fontArray.push(currentFont);

	// 3. textPositions array will include an array of data for each glyph
	// - [font, strokeStyle, fillStyle, highlight, underline, overline, text, startX, startY, (pathData)]
	// - and populate spacesArray with space position data (for full justify calculations later)
	// TODO - does current code use SpacesArray? If not, refactor code to delete it
	for (i = 0, iz = textGlyphs.length; i < iz; i++) {

		item = textGlyphs[i];

		textPositions[i] = [, , , , , , item, 0, 0, 0];

		if (item === ' ') spacesArray.push(i);
	}

	// 4. process the glyphStyles array to start populating the textPositions arrays
	if (!glyphStyles[0]) glyphStyles[0] = {
		family: glyphAttributes.family,
		size: (glyphAttributes.sizeValue) ? `${glyphAttributes.sizeValue}${glyphAttributes.sizeMetric}` : glyphAttributes.sizeMetric,
		stretch: glyphAttributes.stretch,
		style: glyphAttributes.style,
		variant: glyphAttributes.variant,
		weight: glyphAttributes.weight,
	};

	for (i = 0, iz = glyphStyles.length; i < iz; i++) {

		gStyle = glyphStyles[i];

		if (gStyle) {

			gPos = textPositions[i];

			if (i === 0) {
				gPos[0] = currentFont;
				gPos[1] = currentStrokeStyle;
				gPos[2] = currentFillStyle;
				gPos[3] = highlightFlag;
				gPos[4] = underlineFlag;
				gPos[5] = overlineFlag;
			}

			if (gStyle.defaults) {
				currentFont = glyphAttributes.update(scale, fontAttributes);
				currentStrokeStyle = defaultStrokeStyle;
				currentFillStyle = defaultFillStyle;
				currentSpace = defaultSpace;
				gPos[0] = currentFont;
				gPos[1] = currentStrokeStyle;
				gPos[2] = currentFillStyle;
				gPos[3] = highlightFlag;
				gPos[4] = underlineFlag;
				gPos[5] = overlineFlag;
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

			item = gStyle.underline;
			if (xt(item) && item !== underlineFlag) {

				underlineFlag = item;
				gPos[4] = underlineFlag;
			};

			item = gStyle.overline;
			if (xt(item) && item !== overlineFlag) {

				overlineFlag = item;
				gPos[5] = overlineFlag;
			};

			if (i !== 0 && (gStyle.variant || gStyle.weight || gStyle.style || gStyle.stretch || gStyle.size || gStyle.sizeValue || gStyle.sizeMetric || gStyle.family || gStyle.font)) {

				item = glyphAttributes.update(scale, gStyle);
				if (item !== currentFont) {

					currentFont = item;
					gPos[0] = currentFont;

					if (fontArray.indexOf(currentFont) < 0) fontArray.push(currentFont);
				}
			}
		}

		// setup textGlyphWidths array, populating it with current letterSpacing values
		textGlyphWidths[i] = currentSpace;
	}

	// finish populating textGlyphWidths
	for (i = 0, iz = textGlyphs.length; i < iz; i++) {

		if (xt(textGlyphWidths[i])) currentSpace = textGlyphWidths[i];

		textGlyphWidths[i] = currentSpace;
	}

	// 5. calculate the text height value
	// - all lines in a multiline Phrase will use the maximum text height value, even if they don't include the biggest value
	fontArray.forEach(font => {

		tDimsCalc.style.font = font;
		item = tDimsCalc.clientHeight;
		fontLibrary[font] = item;
	});

	maxHeight = Math.max(...Object.values(fontLibrary));

	// 6. calculate glyph width values
	// - this is the tricky bit as, ideally, we need to take into account font kerning values
	// - however kerning values go out of the window when font attributes (especially size) change in mid-text
	// - and we need to remember that letterSpacing can also be different in different parts of the text
	// - this is also the best place to populate the textLine arrays

	// TODO - none of this takes into consideration the needs of RTL scripts eg Arabic, Hebrew, etc - needs testing, review and necessary refactor to fix (if required)

	totalLen = lineLen = starts = ends = 0;

	for (i = 0, iz = textPositions.length; i < iz; i++) {

		glyphArr = textPositions[i];
		glyph = glyphArr[6];

		if (glyphArr[0]) engine.font = glyphArr[0];

		singles.push(engine.measureText(glyph).width);
		
		nextGlyph = textPositions[i + 1];
		nextGlyph = (!treatWordAsGlyph && nextGlyph) ? nextGlyph[6] : false;

		len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
		pairs.push(len);
	}

	for (i = 0, iz = pairs.length; i < iz; i++) {

		glyph = pairs[i];

		if (glyph) {

			len = singles[i] + singles[i + 1];
			gPos = textPositions[i + 1];

			if (len > glyph && !gPos[0]) singles[i] -= (len - glyph);
		}
	}

	// calculate text line arrays
	// TODO: create a demo-test for treatWordAsGlyph
	for (i = 0, iz = textPositions.length; i < iz; i++) {

		glyphArr = textPositions[i];
		glyph = glyphArr[6];

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
		if (i + 1 === iz) {

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

		// and complete the population of data for highlight, overline, underline
		if (xt(glyphArr[3])) highlightFlag = glyphArr[3];
		if (xt(glyphArr[4])) underlineFlag = glyphArr[4];
		if (xt(glyphArr[5])) overlineFlag = glyphArr[5];

		glyphArr[3] = highlightFlag;
		glyphArr[4] = underlineFlag;
		glyphArr[5] = overlineFlag;
	}

	// handle path positioning (which we'll assume will need to be done for every display cycle) separately during stamping
	if (!path) {

		// 7. calculate localHeight
		this.localHeight = (((textLines.length - 1) * maxHeight) * lineHeight) + maxHeight;

		this.cleanHandle();
		this.dirtyHandle = false;
		handle = this.currentHandle;
		
		handleX = -handle.x * scale;
		handleY = -handle.y;

		// 8. we should now be in a position where we can calculate each glyph's startXY values

		// - we have 2 non-path scenarios: full-justified text; and regular text


		// Scenario 1: justify === 'full'
		if (justify === 'full') {

			cursor = 0;
			height = handleY + (maxHeight / 2);

			for (i = 0, iz = textLineWidths.length; i < iz; i++) {

				len = handleX;

				if (textLineWords[i] > 1) space = (width - textLineWidths[i]) / (textLineWords[i] - 1);
				else space = 0;

				for (j = 0, jz = textLines[i].length; j < jz; j++) {

					item = textPositions[cursor];

					if (item[6] === ' ') textGlyphWidths[cursor] += space;

					item[7] = len;
					item[8] = height;
					item[9] = textGlyphWidths[cursor];

					len += textGlyphWidths[cursor];

					cursor++;
				}

				cursor++;
				height += (maxHeight * lineHeight);
			}
		}

		// Scenario 2: regular text - justify === 'left', or 'centre', or 'right'
		else {

			cursor = 0;
			height = handleY + (maxHeight / 2);

			for (i = 0, iz = textLineWidths.length; i < iz; i++) {

				if (justify === 'right') len = (width - textLineWidths[i]) + handleX;
				else if (justify === 'center') len = ((width - textLineWidths[i]) / 2) + handleX;
				else len = handleX;

				for (j = 0, jz = textLines[i].length; j < jz; j++) {

					item = textPositions[cursor];

					item[7] = len;
					item[8] = height;
					item[9] = textGlyphWidths[cursor];

					len += textGlyphWidths[cursor];

					cursor++;
				}

				cursor++;
				height += (maxHeight * lineHeight);
			}
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
	this.fontLibrary = fontLibrary;

	releaseCell(myCell);
};

/*

*/
P.calculateGlyphPathPositions = function () {

	let path = this.getTextPath(),
		len = path.length,
		textPos = this.textPositions,
		widths = this.textGlyphWidths,
		direction = (this.textPathDirection === 'ltr') ? true : false,
		pathPos = this.textPathPosition,
		distance, posArray, i, iz, width,
		justify = this.justify,
		loop = this.textPathLoop;

	for (i = 0, iz = textPos.length; i < iz; i++) {

		posArray = textPos[i];
		width = widths[i];

		// TODO - justify isn't working as I'd like it to (ie stamping glyph so centres middle of glyph on path)
		if (justify === 'right') posArray[7] = -width;
		else if (justify === 'center') posArray[7] = -width / 2;

		posArray[10] = path.getPathPositionData(pathPos);
		posArray[9] = width;

		if (direction) pathPos += (width / len);
		else pathPos -= (width / len);

		if (loop && (pathPos > 1 || pathPos < 0)) {

			pathPos = (pathPos > 0.5) ? pathPos - 1 : pathPos + 1;
		}
	}
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

		else if (this.textPath) {

			this.getTextPath();
			this.calculateGlyphPathPositions();

			pos = this.textPositions;

			let item, pathData,
				aPR = this.addPathRoll;

			this.addPathRoll = this.addTextPathRoll;

			for (i = 0, iz = pos.length; i < iz; i++) {

				item = pos[i];

				pathData = item[10];

				this.currentPathData = pathData;

				dest.rotateDestination(engine, pathData.x, pathData.y, this);

				data = preStamper(engine, this, item);
				stamper[method](engine, this, data);
			}

			this.addPathRoll = aPR;
		}

		else {

			pos = this.textPositions;

			this.performRotation(engine);

			for (i = 0, iz = pos.length; i < iz; i++) {

				data = preStamper(engine, this, pos[i]);
				stamper[method](engine, this, data);
			}

			if (this.showBoundingBox) this.drawBoundingBox(engine);
		}
	}
};

/*

*/
P.preStamper = function (engine, entity, args) {

	let [font, strokeStyle, fillStyle, highlight, underline, overline, ...data] = args;

	if (font) engine.font = font;

	if (highlight || underline || overline) {

		let highlightStyle = entity.highlightStyle,
			height = entity.textHeight,
			halfHeight = height / 2,
			underlineStyle = entity.underlineStyle,
			underlinePosition = entity.underlinePosition,
			overlineStyle = entity.overlineStyle,
			overlinePosition = entity.overlinePosition;

		engine.save();

		if (highlight) {

			engine.fillStyle = highlightStyle;
			engine.fillRect(data[1], data[2] - halfHeight, data[3], height);
		}

		if (underline) {

			engine.strokeStyle = underlineStyle;
			engine.strokeRect(data[1], data[2] - halfHeight + (height * underlinePosition), data[3], 1);
		}

		if (overline) {

			engine.strokeStyle = overlineStyle;
			engine.strokeRect(data[1], data[2] - halfHeight + (height * overlinePosition), data[3], 1);
		}

		engine.restore();
	}

	if (strokeStyle) engine.strokeStyle = strokeStyle;
	if (fillStyle) engine.fillStyle = fillStyle;

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
