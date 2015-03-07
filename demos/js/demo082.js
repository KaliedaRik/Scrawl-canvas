var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

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
		stopE,
		textInput,
		sizeInput,
		updateTextSize,
		widthInput,
		updateTextWidth,
		updateText;

	//add canvas to web page
	scrawl.addCanvasToPage({
		name: 'canvas',
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
	texts = scrawl.makeGroup({
		name: 'texts',
	});

	//define entitys
	scrawl.makePicture({
		name: 'penguin',
		url: 'img/penguin02.jpg',
	});

	displayText = scrawl.makePhrase({
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
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	getText = function(e) { //text drag-and-drop
		stopE(e);
		here = pad.getMouse();
		myText = texts.getEntityAt(here);
		if (myText) {
			myText.pickupEntity(here);
		}
	};
	dropText = function(e) {
		stopE(e);
		if (myText) {
			myText.dropEntity();
			myText = false;
		}
	};
	scrawl.addListener('down', getText, canvas);
	scrawl.addListener(['up', 'leave'], dropText, canvas);

	updateText = function(e) { //changing the text content
		stopE(e);
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
	};
	scrawl.addNativeListener('keyup', updateText, textInput);

	updateTextSize = function(e) { //changing the text size
		stopE(e);
		displayText.set({
			size: sizeInput.value,
		});
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
	};
	scrawl.addNativeListener(['input', 'change'], updateTextSize, sizeInput);

	updateTextWidth = function(e) { //changing the text width
		stopE(e);
		currentMaxWidth = widthInput.value;
		displayText.set({
			text: parseText(displayText.get('font'), textInput.value),
		});
	};
	scrawl.addNativeListener(['input', 'change'], updateTextWidth, widthInput);

	updateText();

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			pad.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
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
