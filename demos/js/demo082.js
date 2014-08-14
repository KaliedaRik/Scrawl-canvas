var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var canvas,
		pad,
		texts,
		displayText,
		currentMaxWidth = 150,
		engine,
		parseText,
		here,
		myText,
		getText,
		dropText,
		textInput,
		sizeInput,
		updateTextSize,
		widthInput,
		updateTextWidth,
		updateText;

	//add canvas to web page
	scrawl.addCanvasToPage({
		canvasName: 'canvas',
		parentElement: 'canvasHolder',
		width: 400,
		height: 400,
	}).makeCurrent();
	canvas = scrawl.canvas.canvas;
	pad = scrawl.pad.canvas;
	engine = scrawl.context[pad.base];

	//preparing the DOM input elements
	textInput = document.getElementById('textchange');
	textInput.value = 'Hello world!';
	sizeInput = document.getElementById('textsize');
	sizeInput.value = 20;
	widthInput = document.getElementById('textwidth');
	widthInput.value = 150;

	//define groups
	texts = scrawl.newGroup({
		name: 'texts',
	});

	//define sprites
	scrawl.newPicture({
		name: 'penguin',
		url: 'img/penguin02.jpg',
	});

	displayText = scrawl.newPhrase({
		font: '20pt bold Arial, sans-serif',
		handleX: 'center',
		handleY: 'center',
		startX: 200,
		startY: 200,
		fillStyle: 'yellow',
		strokeStyle: 'black',
		shadowColor: 'black',
		shadowBlur: 8,
		method: 'fillDraw',
		text: 'Hello world!',
		group: 'texts',
	});

	//DYNAMIC MULTILINE TEXT WIDTH FUNCTION
	parseText = function(font, text) {
		engine.font = font;
		var space = engine.measureText(' ').width,
			words = text.split(' '),
			result = '',
			currentWidth = 0,
			wordWidth;
		for (var i = 0, z = words.length; i < z; i++) {
			if (words[i].length > 0) {
				wordWidth = engine.measureText(words[i]).width;
				if (i === 0) {
					currentWidth = wordWidth;
					result += words[i];
				}
				else {
					if (currentWidth + space + wordWidth > currentMaxWidth) {
						result += '\n' + words[i];
						currentWidth = wordWidth;
					}
					else {
						result += ' ' + words[i];
						currentWidth += (space + wordWidth);
					}
				}
			}
		}
		return result;
	};

	//event listeners
	getText = function(e) { //text drag-and-drop
		myText = texts.getSpriteAt(here);
		if (myText) {
			myText.pickupSprite(here);
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	dropText = function(e) {
		if (myText) {
			myText.dropSprite();
			myText = false;
		}
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	canvas.addEventListener('mousedown', getText, false);
	canvas.addEventListener('mouseup', dropText, false);

	updateText = function(e) { //changing the text content
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
	};
	textInput.addEventListener('keyup', updateText, false);

	updateTextSize = function(e) { //changing the text size
		displayText.set({
			size: sizeInput.value,
		});
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
		e.preventDefault();
		e.returnValue = false;
	};
	sizeInput.addEventListener('input', updateTextSize, false); //for firefox real-time updating
	sizeInput.addEventListener('change', updateTextSize, false);

	updateTextWidth = function(e) { //changing the text width
		currentMaxWidth = widthInput.value;
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
		e.preventDefault();
		e.returnValue = false;
	};
	widthInput.addEventListener('input', updateTextWidth, false); //for firefox real-time updating
	widthInput.addEventListener('change', updateTextWidth, false);

	updateText();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = pad.getMouse();
			if (!here.active) {
				if (myText) {
					dropText();
				}
			}

			pad.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['phrase', 'images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
