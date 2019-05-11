/*
# Phrase factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, 
	xt, 
	defaultNonReturnFunction, 
	ensurePositiveFloat, 
	ensureFloat, 
	ensureString, 
	removeCharFromString } from '../core/utilities.js';

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
tDimsCalc.style.width = '200em';
tDimsCalc.style.boxSizing = 'border-box';
tDimsCalc.style.position = 'absolute';
tDimsCalc.style.top = '-5000px';
tDimsCalc.style.left = '-5000px';
tDimsCalc.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwerty0123456789QWERTY';
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
	textLineGlyphs: [],
	textLineGlyphWidths: [],
	textLineWords: [],
	textLineWordWidths: [],

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
	lineHeight: 1.5,

/*

*/
	letterSpacing: 1,

/*

*/
	textPath: '',

/*

*/
	textPathPosition: 0,

/*

*/
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

		// also need to capture instances where a number value has been directly set with no other font attributes around it
		v = (/^\d00$/.test(item)) ? item : v;

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

	this.text = ensureString(item);
	
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
	if (this.currentFontSize) font += `${this.currentFontSize * this.scale}${this.currentFontSizeMetric} `;
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
TODO:

1. refactor into smaller functions

2. recode - currently full-justified text, and text where letterspacing != 1, recalculate word/glyph position data for every display cycle. It will be far more efficient to calculate those positions here, once, and then use those precalculated position coordinates for the display cycle
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
		width = this.localWidth * this.scale,
		textLines = this.textLines,
		textLineWidths = this.textLineWidths,
		textLineGlyphs = this.textLineGlyphs,
		textLineGlyphWidths = this.textLineGlyphWidths,
		textWords = this.textWords,
		textWordWidths = this.textWordWidths,
		textLineWords = this.textLineWords,
		textLineWordWidths = this.textLineWordWidths,
		textGlyphs = this.textGlyphs,
		textGlyphWidths = this.textGlyphWidths,
		letterSpacing = this.letterSpacing,
		lineHeight = this.lineHeight,
		textHeight = this.textHeight,
		measure, fullLineLength, i, iz, j, jz, wordCursor,
		lineOfWords, lineOfWordsLength, oldLineOfWords, oldLineOfWordsLength,
		currentLineWords, currentLineWordWidths, currentLineGlyphWidths;

	// prime the engine
	engine.font = this.font;

	// get text length as a single line
	fullLineLength = engine.measureText(item).width * letterSpacing; 

	// clear the text arrays
	textLines.length = 0;
	textLineWidths.length = 0;
	textLineGlyphs.length = 0;
	textLineGlyphWidths.length = 0;
	textLineWords.length = 0;
	textLineWordWidths.length = 0;
	textWords.length = 0;
	textWordWidths.length = 0;
	textGlyphs.length = 0;
	textGlyphWidths.length = 0;

	// create the textWords arrays
	textWords.push(...item.split(' '));

	for (i = 0, iz = textWords.length; i < iz; i++) {

		measure = engine.measureText(textWords[i]).width * letterSpacing;
		textWordWidths.push(measure);
	}

	// break into lines of text

	// ... entire text is shorter than Phrase width
	if (fullLineLength <= width) {

		textLines.push(item);
		textLineWidths.push(fullLineLength);
		textLineWords.push(textWords);
		textLineWordWidths.push(textWordWidths);
	}

	// ... multiple line Phrase
	else {

		wordCursor = 0;

		while (wordCursor < textWords.length) {

			lineOfWords = '';
			lineOfWordsLength = 0;
			currentLineWords = [];
			currentLineWordWidths = [];

			for (i = wordCursor, iz = textWords.length; i < iz; i++) {

				oldLineOfWords = lineOfWords;
				oldLineOfWordsLength = lineOfWordsLength;

				lineOfWords += (i !== wordCursor) ? ` ${textWords[i]}` : textWords[i];
				lineOfWordsLength = engine.measureText(lineOfWords).width * letterSpacing;

				if (lineOfWordsLength > width) {

					// ... for situations where a single word is longer than the width
					if (i === wordCursor) {

						currentLineWords.push(textWords[i]);
						currentLineWordWidths.push(textWordWidths[i]);
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

					currentLineWords.push(textWords[i]);
					currentLineWordWidths.push(textWordWidths[i]);
					textLines.push(lineOfWords);
					textLineWidths.push(lineOfWordsLength);
					wordCursor = iz;
					break;
				}

				// ... otherwise, add word data to currentLine arrays, and iterate again
				else {

					currentLineWords.push(textWords[i]);
					currentLineWordWidths.push(textWordWidths[i]);
				}
			}

			textLineWords.push(currentLineWords);
			textLineWordWidths.push(currentLineWordWidths);
		}
	}

	// calculate localHeight
	this.localHeight = ((this.textLines.length - 1) * textHeight * lineHeight) + textHeight;
	this.dirtyHandle = true;

	// calculater glyph arrays (if required)
	if (this.textPath) {

		textGlyphs.push(...item.split(''));

		for (i = 0, iz = textGlyphs.length; i < iz; i++) {

			// ... seem to get a better kerning result if we measure glyph width this way, rather than just measuring the glyph on its own
			measure = engine.measureText(removeCharFromString(item, i)).width * letterSpacing;
			textGlyphWidths.push(fullLineLength - measure);
		}
	}

	else if (this.letterSpacing !== 1) {

		for (i = 0, iz = textLines.length; i < iz; i++) {

			lineOfWords = textLines[i];
			lineOfWordsLength = textLineWidths[i];
			currentLineGlyphWidths = [];

			textLineGlyphs.push(lineOfWords.split(''));

			for (j = 0, jz = lineOfWords.length; j < jz; j++) {

				measure = engine.measureText(removeCharFromString(lineOfWords, j)).width * letterSpacing;
				currentLineGlyphWidths.push(lineOfWordsLength - measure);
			}

			textLineGlyphWidths.push(currentLineGlyphWidths);
		}
	}

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
P.regularStampSynchronousActions = function () {

	let dest = this.currentHost, 
		engine;

	if (dest) {

		engine = dest.engine;

		if (!this.fastStamp) dest.setEngine(this);

		if (this.method === 'none') defaultNonReturnFunction();
		else if (this.textPath) this.textPathStamper[this.method](engine, this);
		else if (this.justify === 'full') {

			if (this.letterSpacing !== 1) this.spaceJustifiedStamper[this.method](engine, this);
			else this.justifiedStamper[this.method](engine, this);
		}
		else if (this.letterSpacing !== 1) this.spacedStamper[this.method](engine, this);
		else this.stamper[this.method](engine, this);
	}
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
TODO: recode in line with calculateTextDimensions() TODO point 2...
*/
P.getLineData = function (lineIndex) {

	let handle = this.currentHandle,
		height = this.textHeight,
		lineHeight = this.lineHeight,
		scale = this.scale,
		width = this.localWidth * scale,
		justify = this.justify,
		lines = this.textLines,
		lineWidths = this.textLineWidths,
		x = 0, 
		y = (lineIndex * height * lineHeight) - handle.y;

	switch (justify) {

		case 'right' :
			x = width - lineWidths[lineIndex] - (handle.x * scale);
			break;

		case 'center' :
			x = ((width - lineWidths[lineIndex]) / 2) - (handle.x * scale);
			break;

		default :
			x = -handle.x * scale;
			break;

	}

	return [lines[lineIndex], x, y];
};

/*
TODO: recode in line with calculateTextDimensions() TODO point 2...
*/
P.getWordData = function (lineIndex, wordIndex, spaceWidth) {

	let handle = this.currentHandle,
		height = this.textHeight,
		lineHeight = this.lineHeight,
		scaledHandleX = -handle.x * this.scale,
		x = 0, 
		y = (lineIndex * height * lineHeight) - handle.y;

	let justify = this.justify,
		words = this.textLineWords[lineIndex],
		wordWidths = this.textLineWordWidths[lineIndex],
		slicedWidths, width;

	// first word is always hard left
	if (wordIndex === 0) x = scaledHandleX;

	// second and subsequent words
	else {

		switch (justify) {

			case 'full' :
				slicedWidths = wordWidths.slice(0, wordIndex);
				width = slicedWidths.reduce((a, v) => a + v, 0);
				x = width + (spaceWidth * wordIndex) + scaledHandleX;
				break;

			default :
				x = scaledHandleX;
				break;
		}
	}

	return [words[wordIndex], x, y];
};

/*
TODO: recode in line with calculateTextDimensions() TODO point 2...
*/
P.getLineGlyphData = function (lineIndex, glyphIndex) {

	let handle = this.currentHandle,
		height = this.textHeight,
		lineHeight = this.lineHeight,
		scale = this.scale,
		width = this.localWidth * scale,
		scaledHandleX = -handle.x * scale,
		x = 0, 
		y = (lineIndex * height * lineHeight) - handle.y;

	let justify = this.justify,
		glyphs = this.textLineGlyphs[lineIndex],
		glyphWidths = this.textLineGlyphWidths[lineIndex],
		slicedWidths, currentWidth, offset;

	slicedWidths = glyphWidths.slice(0, glyphIndex);
	currentWidth = slicedWidths.reduce((a, v) => a + v, 0);
	offset = width - glyphWidths.reduce((a, v) => a + v, 0);

	switch (justify) {

		case 'right' :
			x = currentWidth + offset + scaledHandleX;
			break;

		case 'center' :
			x = currentWidth + (offset / 2) + scaledHandleX;
			break;

		default :
			x = currentWidth + scaledHandleX;
			break;
	}

	return [glyphs[glyphIndex], x, y];
};

/*
TODO: recode in line with calculateTextDimensions() TODO point 2...
*/
P.getJustifiedSpace = function (lineIndex) {

	let lineWidth = this.textLineWordWidths[lineIndex].reduce((a, v) => a + v, 0),
		spaceCount = this.textLineWords[lineIndex].length - 1;

	return (spaceCount > 0) ? ((this.localWidth * this.scale) - lineWidth) / spaceCount : 0;
};

/*

*/
P.stamperMethods = function (engine, method, data) {

	switch (method) {

		case 'draw' :
			engine.strokeText(...data);
			break;

		case 'fill' :
			engine.fillText(...data);
			break;

		case 'drawFill' :
			engine.strokeText(...data);
			this.currentHost.clearShadow();
			engine.fillText(...data);
			break;

		case 'fillDraw' :
			engine.fillText(...data);
			this.currentHost.clearShadow();
			engine.strokeText(...data);
			break;

		case 'floatOver' :
			engine.strokeText(...data);
			engine.fillText(...data);
			break;

		case 'sinkInto' :
			engine.fillText(...data);
			engine.strokeText(...data);
			break;

		case 'clear' :
			let gco = engine.globalCompositeOperation;
			engine.globalCompositeOperation = 'destination-out';
			engine.fillText(...data);
			engine.globalCompositeOperation = gco;
			break;
	}
};

/*

*/
P.stamper = {

	draw: function (engine, entity) { 

		entity.stamperFunctions(engine, 'draw'); 
	},
	fill: function (engine, entity) { 

		entity.stamperFunctions(engine, 'fill'); 
	},
	drawFill: function (engine, entity) { 

		entity.stamperFunctions(engine, 'drawFill'); 
	},
	fillDraw: function (engine, entity) { 

		entity.stamperFunctions(engine, 'fillDraw'); 
	},
	floatOver: function (engine, entity) { 

		entity.stamperFunctions(engine, 'floatOver'); 
	},
	sinkInto: function (engine, entity) { 

		entity.stamperFunctions(engine, 'sinkInto'); 
	},
	clear: function (engine, entity) { 

		entity.stamperFunctions(engine, 'clear'); 
	},	
};

/*

*/
P.stamperFunctions = function (engine, method) {

	let data, i, iz;

	this.performRotation(engine);

	for (i = 0, iz = this.textLines.length; i < iz; i++) {

		data = this.getLineData(i);
		this.stamperMethods(engine, method, data);
	}

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};

/*

*/
P.spacedStamper = {

	draw: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'draw'); 
	},
	fill: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'fill'); 
	},
	drawFill: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'drawFill'); 
	},
	fillDraw: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'fillDraw'); 
	},
	floatOver: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'floatOver'); 
	},
	sinkInto: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'sinkInto'); 
	},
	clear: function (engine, entity) { 

		entity.spacedStamperFunctions(engine, 'clear'); 
	},	
};

/*

*/
P.spacedStamperFunctions = function (engine, method) {

	let lineGlyphs, data, 
		i, iz, j, jz;

	this.performRotation(engine);

	for (i = 0, iz = this.textLines.length; i < iz; i++) {

		lineGlyphs = this.textLineGlyphs[i];

		for (j = 0, jz = lineGlyphs.length; j < jz; j++) {

			data = this.getLineGlyphData(i, j);
			this.stamperMethods(engine, method, data);
		}
	}

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};

/*

*/
P.spaceJustifiedStamper = {

	draw: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'draw'); 
	},
	fill: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'fill'); 
	},
	drawFill: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'drawFill'); 
	},
	fillDraw: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'fillDraw'); 
	},
	floatOver: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'floatOver'); 
	},
	sinkInto: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'sinkInto'); 
	},
	clear: function (engine, entity) { 

		entity.spaceJustifiedStamperFunctions(engine, 'clear'); 
	},	
};

/*
TODO: code up this functionality
*/
P.spaceJustifiedStamperFunctions = function (engine, method) {

	let data, i, iz;

	this.performRotation(engine);

	for (i = 0, iz = this.textLines.length; i < iz; i++) {

		data = this.getLineData(i);
		this.stamperMethods(engine, method, data);
	}

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};

/*

*/
P.textPathStamper = {

	draw: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'draw'); 
	},
	fill: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'fill'); 
	},
	drawFill: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'drawFill'); 
	},
	fillDraw: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'fillDraw'); 
	},
	floatOver: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'floatOver'); 
	},
	sinkInto: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'sinkInto'); 
	},
	clear: function (engine, entity) { 

		entity.textPathStamperFunctions(engine, 'clear'); 
	},	
};

/*
TODO: code up this functionality
*/
P.textPathStamperFunctions = function (engine, method) {

	let data, i, iz;

	this.performRotation(engine);

	for (i = 0, iz = this.textLines.length; i < iz; i++) {

		data = this.getLineData(i);
		this.stamperMethods(engine, method, data);
	}

	if (this.showBoundingBox) this.drawBoundingBox(engine);
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
