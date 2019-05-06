/*
# Phrase factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, xt } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

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
tDimsCalc.style.width = '20em';
tDimsCalc.style.boxSizing = 'border-box';
tDimsCalc.style.position = 'absolute';
tDimsCalc.style.top = '-5000px';
tDimsCalc.style.left = '-5000px';
tDimsCalc.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qyp';
document.body.appendChild(tDimsCalc);

const textEntityConverter = document.createElement('textarea');

/*
## Phrase constructor
*/
const Phrase = function (items = {}) {

	this.entityInit(items);
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
	width: '100%',

/*

*/
	font: '12px sans-serif',

/*

*/
	currentFontStyle: 'normal',
	currentFontVariant: 'normal',
	currentFontWeight: 'normal',
	currentFontStretch: 'normal',
	currentFontSize: 12,
	currentFontSizeMetric: 'px',
	currentFontFamily: 'sans-serif',

/*

*/
	text: '',

/*
Scrawl-canvas will break a text string into lines based on the width value set for the entity
*/
	textLines: [],
	textLineWidths: [],

/*
Required for when using 'full' justification for text
- can also display/animate words, rather than glyphs, along a path by setting __treatWordAsGlyph__ attribute to true
*/
	textWords: [],
	textWordWidths: [],
	treatWordAsGlyph: false,

/*
Used for displaying text along a path, and animating it along the path

Triggered whenever any of the following occurs:
* .letterSpacing attribute does not = 1; OR
* .justify attribute is set to 'full'; OR
* .path attribute is a Path entity AND (either .lockXTo or .lockYTo attributes = 'path')
*/
	textGlyphs: [],
	textGlyphWidths: [],

/*
Permitted values are: 'left' (default), 'center', 'right', 'full'
*/
	justify: 'left',

/*

*/
	lineHeight: 1.3,

/*

*/
	letterSpacing: 1,

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
Retrieving aspects of the font string
*/
G.fontStyle = function () {

	return this.currentFontStyle;
};

G.fontVariant = function () {

	return this.currentFontVariant;
};

G.fontWeight = function () {

	return this.currentFontWeight;
};

G.fontStretch = function () {

	return this.currentFontStretch;
};

G.fontSize = function () {

	return `${this.currentFontSize}${this.currentFontSizeMetric}`;
};

G.fontSizeValue = function () {

	return this.currentFontSize;
};

G.fontSizeMetric = function () {

	return this.currentFontSizeMetric;
};

G.fontFamily = function () {

	return this.currentFontFamily;
};

/*
Handling updates to font attributes
*/
S.font = function (item) {

	this.setters.fontStyle.call(this, item);
	this.setters.fontVariant.call(this, item);
	this.setters.fontWeight.call(this, item);
	this.setters.fontStretch.call(this, item);
	this.setters.fontSize.call(this, item);
	this.setters.fontFamily.call(this, item);
};

/*
__font-style__

_values:_ 
* 'normal', 'italic', 'oblique'
*/
S.fontStyle = function (item) {

	let v = 'normal';

	v = (item.indexOf('italic') >= 0) ? 'italic' : v;
	v = (item.indexOf('oblique') >= 0) ? 'oblique' : v;

	this.currentFontStyle = v;
	this.updateFont();
};

/*
__font-variant__ - the standard indicates that canvas context engine should only recognise 'normal' and 'small-caps' values

Scrawl-canvas ignores all other possible values. Do not use them in font strings.
* font-variant-caps
* font-variant-numeric
* font-variant-ligatures
* font-variant-east-asian
* font-variant-alternates

CANVAS CONTEXT ENGINE - only accepts 'small caps'
*/
S.fontVariant = function (item) {

	let v = 'normal';

	v = (item.indexOf('small-caps') >= 0) ? 'small-caps' : v;

	this.currentFontVariant = v;
	this.updateFont();
};

/*
__font-weight__

_Values:_ 
* 'normal', 'bold', 'lighter', 'bolder'; or
* a number (between 1 and 1000)

('normal' translates to 400; 'bold' translates to 700)

CANVAS CONTEXT ENGINE - doesn't seem to recognise number values (for Garamond), but doesn't choke on their presence either
*/
S.fontWeight = function (item) {

	// handling direct entry of numbers
	if (item.toFixed) this.currentFontWeight = item;
	else {

		let v = 'normal';

		v = (item.indexOf('bold') >= 0) ? 'bold' : v;
		v = (item.indexOf('lighter') >= 0) ? 'lighter' : v;
		v = (item.indexOf('bolder') >= 0) ? 'bolder' : v;

		// putting spaces around the number should help identify it as a Weight value within the font string the string
		v = (item.indexOf(' 100 ') >= 0) ? '100' : v;
		v = (item.indexOf(' 200 ') >= 0) ? '200' : v;
		v = (item.indexOf(' 300 ') >= 0) ? '300' : v;
		v = (item.indexOf(' 400 ') >= 0) ? '400' : v;
		v = (item.indexOf(' 500 ') >= 0) ? '500' : v;
		v = (item.indexOf(' 600 ') >= 0) ? '600' : v;
		v = (item.indexOf(' 700 ') >= 0) ? '700' : v;
		v = (item.indexOf(' 800 ') >= 0) ? '800' : v;
		v = (item.indexOf(' 900 ') >= 0) ? '900' : v;

		this.currentFontWeight = v;
	}

	this.updateFont();
};

/*
__font-stretch__

_Values:_ 
* 'normal' (default), 
* 'semi-condensed', 'condensed', 'extra-condensed', 'ultra-condensed', 
* 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', 

(Ignoring 'number%' values as it clashes with font-size % values, which are far more likely to be used in a font string)

CANVAS CONTEXT ENGINE - doesn't seem to recognise font-stretch values (for Garamond), but doesn't choke on their presence either
*/
S.fontStretch = function (item) {

	let v = 'normal';

	v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
	v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
	v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
	v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;
	v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
	v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
	v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
	v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;

	this.currentFontStretch = v;
	this.updateFont();
};

/*
__font-size__

Standard says "with the 'font-size' component converted to CSS pixels" - hoping this means that canvas font will do this for us, rather than having to convert in code - if not, extract it by sticking an interim css style against the internal <div> to get computed value?

Values can be: 

_Absolute or relative string values:_
* 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large' 
* 'smaller', 'larger'

_Length values:_ 
* 1.2em, 1.2ch, 1.2ex, 1.2rem
* (experimental!) 1.2cap, 1.2ic, 1.2lh, 1.2rlh
* 1.2vh, 1.2vw, 1.2vmin, 1.2vmax
* (experimental!) 1.2vi, 1.2vb
* 1.2px, 1.2cm, 1.2mm, 1.2in, 1.2pc, 1.2pt
* (experimental!) 1.2Q

Note that only the following have wide support; these are the only metrics this code tests for: em, ch, ex, rem, vh, vw, vmin, vmax, px, cm, mm, in, pc, pt

_Percent values: 
* 1.2%

(Percent values clash with font-stretch % values - assume any number followed by a % is a font-size value)

GOTCHA NOTE 1: font-size is never a number; it must always have a metric. Tweens should be able to handle this requirement with no issues.

GOTCHA NOTE 2: the canvas context engine refuses to handle line heights appended to the font size value (eg: 12px/1.2) and expects all line height values to = 'normal'. Scrawl-canvas 8 handles line height for multiline phrases using an alternative mechanism. Thus including a /lineheight value in a font string may cause .set() functionality to fail in unexpected ways.
*/
S.fontSize = function (item) {

	let res, 
		size = 0, 
		metric = 'medium';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 9px Garamond
	if (item.indexOf('xx-small') >= 0) metric = 'xx-small';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 10px Garamond
	else if (item.indexOf('x-small') >= 0) metric = 'x-small';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 8.33px Garamond
	else if (item.indexOf('smaller') >= 0) metric = 'smaller';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 13px Garamond
	else if (item.indexOf('small') >= 0) metric = 'small';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 32px Garamond
	else if (item.indexOf('xx-large') >= 0) metric = 'xx-large';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 24px Garamond
	else if (item.indexOf('x-large') >= 0) metric = 'x-large';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 12px Garamond
	else if (item.indexOf('larger') >= 0) metric = 'larger';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 18px Garamond
	else if (item.indexOf('large') >= 0) metric = 'large';

	// Canvas context engine (Chrome on MacBook Pro) interprets this as 16px Garamond
	else if (item.indexOf('medium') >= 0) metric = 'medium';
	else {
		size = 12;
		metric = 'px'
	}

	// for when the size has stuff before it in the string (which can, sadly, include numbers)
	if (/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
		
		res = item.match(/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
		size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
		metric = res[2];
	}
	// for when the size starts the string
	else if (/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
		
		res = item.match(/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
		size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
		metric = res[2];
	}

	this.currentFontSize = size;
	this.currentFontSizeMetric = metric;
	this.updateFont();
};

/*
__font-family__ - always comes at the end of the string. More than one can be included, with each separated by commas - be aware that string may often include quotes around font families with spaces in their names.

Generic font names have been extended - values include: 
* 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'math', 'emoji', 'fangsong'

GOTCHA NOTE: current functionality tests the supplied string with the expectation that the font families will be preceded by a font size metric value. To set the fontFamily value direct, put a font size metric at the start of the string - % will do - followed by a space and then the font family string:

	entity.set({
		fontFamily: '% "Gill Sans", sans-serif'
	})

*/
S.fontFamily = function (item) {
	
	this.currentFontFamily = 'sans-serif';

	let guess = item.match(/(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger|%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt) (.*)$/i);

	if (guess && guess[2]) this.currentFontFamily = guess[2];

	this.updateFont();
};

/*
Handling text updates
*/
S.text = function (item) {

	this.text = (item.substring) ? item : item.toString();
	
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

/*
Manipulating lineHeight and letterSpacing attributes
*/
S.lineHeight = function (item) {

	if (xt(item)) {

		let val = (item.toFixed) ? item : parseFloat(item);

		this.lineHeight = (val) ? val : this.defs.lineHeight;

		this.dirtyPathObject = true;
		this.dirtyText = true;
	}
};
D.lineHeight = function (item) {

	if (xt(item)) {

		let val = (item.toFixed) ? item : parseFloat(item);

		this.lineHeight += (val) ? val : 0;

		this.dirtyPathObject = true;
		this.dirtyText = true;
	}
};

S.letterSpacing = function (item) {

	if (xt(item)) {

		let val = (item.toFixed) ? item : parseFloat(item);

		this.letterSpacing = (val) ? val : this.defs.letterSpacing;

		this.dirtyPathObject = true;
		this.dirtyText = true;
	}
};
D.letterSpacing = function (item) {

	if (xt(item)) {

		let val = (item.toFixed) ? item : parseFloat(item);

		this.letterSpacing += (val) ? val : 0;

		this.dirtyPathObject = true;
		this.dirtyText = true;
	}
};


/*
## Define prototype functions
*/

/*

*/
P.updateFont = function () {

	this.dirtyFont = true;
	this.dirtyPathObject = true;
};

/*

*/
P.buildFont = function () {

	this.dirtyFont = false;

	let font = ''

	if (this.currentFontStyle !== 'normal') font += `${this.currentFontStyle} `;
	if (this.currentFontVariant !== 'normal') font += `${this.currentFontVariant} `;
	if (this.currentFontWeight !== 'normal') font += `${this.currentFontWeight} `;
	if (this.currentFontStretch !== 'normal') font += `${this.currentFontStretch} `;
	if (this.currentFontSize) font += `${this.currentFontSize}${this.currentFontSizeMetric} `;
	else font += `${this.currentFontSizeMetric} `;

	font += `${this.currentFontFamily}`;

	// Temper the font string. Submit it to a canvas context engine to see what it makes of it
	let myCell = requestCell();
	myCell.engine.font = font;
	this.font = myCell.engine.font;
	releaseCell(myCell);

	if (this.state) this.state.font = this.font;

	this.dirtyText = true;
};

/*

*/
P.buildText = function () {

	this.dirtyText = false;
	this.text = this.convertTextEntityCharacters(this.text);
	this.calculateTextDimensions(this.text);
};

/*
To get convert any HTML entity (eg: &lt; &epsilon;) in the text string into their required glyphs
*/
P.convertTextEntityCharacters = function (item) {

	textEntityConverter.innerHTML = item;
	return textEntityConverter.value;
};

/*

*/
P.calculateTextDimensions = function (item) {

	// get single line text height
	tDimsCalc.style.lineHeight = this.lineHeight;
	tDimsCalc.style.letterSpacing = this.letterSpacing;
	tDimsCalc.style.font = this.font;
	this.textHeight = tDimsCalc.clientHeight;

	// setup local variables
	let myCell = requestCell(),
		engine = myCell.engine,
		width = this.localWidth,
		textLines = this.textLines,
		textLineWidths = this.textLineWidths,
		textWords = this.textWords,
		textWordWidths = this.textWordWidths,
		textGlyphs = this.textGlyphs,
		textGlyphWidths = this.textGlyphWidths,
		letterSpacing = this.letterSpacing,
		measure, fullLineLength, i, iz, words, wordLengths, wordCursor,
		lineOfWords, lineOfWordsLength, oldLineOfWords, oldLineOfWordsLength;

	// prime the engine
	engine.font = this.font;

	// get text length as a single line
	measure = engine.measureText(item); 
	fullLineLength = measure.width;

	// clear the text arrays
	textLines.length = 0;
	textLineWidths.length = 0;
	textWords.length = 0;
	textWordWidths.length = 0;
	textGlyphs.length = 0;
	textGlyphWidths.length = 0;

	// create the textWords arrays
	textWords.push(...item.split(' '));

	for (i = 0, iz = textWords.length; i < iz; i++) {

		measure = engine.measureText(textWords[i]);
		textWordWidths.push(measure.width * letterSpacing);
	}

	// break into lines of text

	// ... single line Phrase - note we've already corrected for letterspacing when we extracted text height above
	if (fullLineLength <= width) {

		textLines.push(item);
		textLineWidths.push(fullLineLength);
	}

	// ... multiple line Phrase
	else {

		wordCursor = 0;

		while (wordCursor < textWords.length) {

			lineOfWords = '';
			lineOfWordsLength = 0;

			for (i = wordCursor, iz = textWords.length; i < iz; i++) {

				oldLineOfWords = lineOfWords;
				oldLineOfWordsLength = lineOfWordsLength;

				lineOfWords += (i !== wordCursor) ? ` ${textWords[i]}` : textWords[i];
				lineOfWordsLength = engine.measureText(lineOfWords).width * letterSpacing;

				if (lineOfWordsLength > width) {

					// ... for situations where a single word is longer than the width
					if (i === wordCursor) {

						textLines.push(lineOfWords);
						textLineWidths.push(lineOfWordsLength);
						wordCursor = i + 1;
					}
					// ... multi-word lines
					else {

						textLines.push(oldLineOfWords);
						textLineWidths.push(oldLineOfWordsLength);
						wordCursor = i;
					}
					break;
				}

				// ... final line is shorter than width
				else if (i + 1 === iz) {

					textLines.push(lineOfWords);
					textLineWidths.push(lineOfWordsLength);
					wordCursor = iz;
					break;
				}
			}
		}
	}

	// calculate localHeight
	this.localHeight = this.textLines.length * this.textHeight;
	this.dirtyHandle = true;

	// calculater glyph arrays (if required)

	releaseCell(myCell);
};

/*

*/
P.preCloneActions = function () {

	this.buildFont();
};

/*
Fonts don't have accessible paths...
*/
P.cleanPathObject = function () {

	this.dirtyPathObject = false;
	if (this.dirtyFont) this.buildFont();
	if (this.dirtyText) this.buildText();
	if (this.dirtyHandle) this.cleanHandle();
};

/*

*/
P.stamper = {

	draw: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.strokeText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	fill: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.fillText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	drawFill: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.strokeText(...data);
			entity.currentHost.clearShadow();
			engine.fillText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	fillDraw: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.fillText(...data);
			entity.currentHost.clearShadow();
			engine.strokeText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	floatOver: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.strokeText(...data);
			engine.fillText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	sinkInto: function (engine, entity) {

		let data, i, iz;

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.fillText(...data);
			engine.strokeText(...data);
		}

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},

	clear: function (engine, entity) {

		let data, i, iz,
			gco = engine.globalCompositeOperation;

		engine.globalCompositeOperation = 'destination-out';

		for (i = 0, iz = entity.textLines.length; i < iz; i++) {

			data = entity.getLineData(i);
			engine.fillText(...data);
		}

		engine.globalCompositeOperation = gco;

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);
	},	

	none: function (engine, entity) {},	
};

/*

*/
P.getLineData = function (lineItem) {

	let handle = this.currentHandle,
		height = this.textHeight,
		width = this.localWidth,
		justify = this.justify,
		lines = this.textLines,
		lineWidths = this.textLineWidths,
		x = 0, 
		y = 0;

	switch (justify) {

		case 'right' :
			x = width - lineWidths[lineItem] - handle.x;
			y = (lineItem * height) - handle.y;
			break;

		case 'center' :
			x = ((width - lineWidths[lineItem]) / 2) - handle.x;
			y = (lineItem * height) - handle.y;
			break;

		// 'full' justified text needs to be done by the word, not by the line
		case 'full' :
		default :
			x = -handle.x;
			y = (lineItem * height) - handle.y;
			break;

	}

	return [lines[lineItem], x, y];
};

/*

*/
P.drawBoundingBox = function (engine, entity) {

	let handle = entity.currentHandle,
		floor = Math.floor,
		ceil = Math.ceil;

	engine.save();
	engine.strokeStyle = entity.boundingBoxColor;
	engine.lineWidth = 1;
	engine.globalCompositeOperation = 'source-over';
	engine.globalAlpha = 1;
	engine.shadowOffsetX = 0;
	engine.shadowOffsetY = 0;
	engine.shadowBlur = 0;
	engine.strokeRect(floor(-handle.x), floor(-handle.y), ceil(entity.localWidth), ceil(entity.localHeight));
	engine.restore();
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
