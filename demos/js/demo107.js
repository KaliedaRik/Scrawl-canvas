var mycode = function() {
	'use strict';
	//define variables
	var stack = scrawl.stack.mystack,
		group = scrawl.group.mystack,
		pad = scrawl.pad.mycanvas,
		page1 = scrawl.element.page1,
		page2 = scrawl.element.page2,
		browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
		browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
		startButton = document.getElementById('startButton'),
		returnButton = document.getElementById('returnButton'),
		effectSelector = document.getElementById('effect'),
		getEffect,
		currentEffect,
		frame = document.getElementById('myframe'),
		frameSources = [
          'http://en.wikipedia.org/wiki/Cat',
          'http://en.wikipedia.org/wiki/Dog',
          'http://en.wikipedia.org/wiki/Goat',
          'http://en.wikipedia.org/wiki/Rabbit',
          'http://en.wikipedia.org/wiki/Parrot',
          'http://en.wikipedia.org/wiki/Sea_slug',
          'http://en.wikipedia.org/wiki/Orchid',
          'http://en.wikipedia.org/wiki/Rose',
          'http://en.wikipedia.org/wiki/HTML5',
          'http://en.wikipedia.org/wiki/Css',
          'http://en.wikipedia.org/wiki/Javascript'
        ],
		currentFrame,
		newFrame,
		doButtons,
		resize,
		checkE,
		//variables specific to each page load effect
		myBlock, myStar, myCircles, myCirclesGroup,
		fogIn, fogOut, doFog, buildFog,
		clearFromCenterIn, clearFromCenterOut, doClearFromCenter, buildClearFromCenter,
		starburstIn, starburstOut, doStarburst, buildStarburst,
		rollerIn, rollerOut, doRoller, buildRoller,
		clearCirclesIn, clearCirclesOut, doClearCircles, buildClearCircles,
		showPad, hidePad, switchPages, clearEntitys;

	//initial setup of DOM elements in stack
	stack.set({
		margin: '15px'
	});
	group.setElementsTo({
		width: '100%',
		height: '100%'
	});
	pad.set({
		translateZ: 0,
		lockTo: 'mystack'
	});
	page1.set({
		translateZ: 1,
		visibility: true
	});
	page2.set({
		translateZ: -1,
		visibility: false
	});
	scrawl.renderElements();

	//functions for manipulating the display of various page sections (page1, page2, pad)
	showPad = function() {
		pad.set({
			translateZ: 2
		});
	};
	hidePad = function() {
		pad.set({
			translateZ: 0
		});
	};
	switchPages = function() {
		if (page1.visibility) {
			page1.set({
				translateZ: -1,
				visibility: false
			});
			page2.set({
				translateZ: 1,
				visibility: true
			});
		}
		else {
			page1.set({
				translateZ: 1,
				visibility: true
			});
			page2.set({
				translateZ: -1,
				visibility: false
			});
		}
	};
	//determine which wikipedia page to display in the iframe
	newFrame = function() {
		currentFrame = Math.floor(Math.random() * frameSources.length);
	};

	//define entitys to be used in animations
	clearEntitys = function() {
		scrawl.group[pad.base].setEntitysTo({
			visibility: false,
		});
		myCirclesGroup.setEntitysTo({
			visibility: false,
		});
	};
	myBlock = scrawl.newBlock({
		name: 'myblock',
		fillStyle: 'white',
		visibility: false,
	});
	myStar = scrawl.makeRegularShape({
		name: 'mystar',
		fillStyle: 'gold',
		method: 'fill',
		radius: 1000,
		angle: 144,
		visibility: false,
	});
	myCircles = [];
	myCirclesGroup = scrawl.makeGroup({
		name: 'circles',
	});
	for (var i = 0; i < 20; i++) {
		myCircles.push(scrawl.newWheel({
			radius: 200,
			group: 'circles',
			fillStyle: 'lightblue',
			visibility: false,
		}));
	}

	//event listeners
	checkE = function(e) { //common function to halt propogation of event
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
	};
	resize = function(e) { //listen and respond to browser resizing
		checkE(e);
		browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		browserWidth -= 45;
		stack.set({
			width: browserWidth,
			height: browserHeight
		});
		frame.width = browserWidth - 10;
		frame.height = browserHeight - 50;
	};
	window.addEventListener('resize', resize, false);

	//event listener
	getEffect = function(e) {
		checkE(e);
		currentEffect = e.currentTarget.value;
	};
	effectSelector.options.selectedIndex = 0;
	currentEffect = 'fog';
	effectSelector.addEventListener('change', getEffect, false);

	doButtons = function(e) {
		clearEntitys();
		switch (currentEffect) {
			case 'clearFromCenter':
				doClearFromCenter();
				break;
			case 'fog':
				doFog();
				break;
			case 'starburst':
				doStarburst();
				break;
			case 'roller':
				doRoller();
				break;
			case 'clearCircles':
				doClearCircles();
				break;
		}
		checkE(e);
	};
	startButton.addEventListener('click', doButtons, false);
	returnButton.addEventListener('click', doButtons, false);

	//roller animation: animate block by its height
	rollerIn = scrawl.newTween({
		name: 'rollerIn',
		start: {
			height: 0
		},
		engines: {
			height: 'easeOut3'
		},
		duration: 1000,
		killOnComplete: true,
	});
	rollerOut = scrawl.newTween({
		name: 'rollerOut',
		end: {
			height: 0
		},
		engines: {
			height: 'easeIn3'
		},
		duration: 1000,
		killOnComplete: true,
	});
	buildRoller = function() {
		switchPages();
		rollerOut.clone({
			targets: myBlock,
			start: {
				height: browserHeight,
			},
			onComplete: {
				visibility: false,
			},
			callback: function() {
				hidePad();
				scrawl.renderElements();
			},
		}).run();
	};
	doRoller = function() {
		var tween = rollerIn.clone({
			targets: myBlock,
			onCommence: {
				visibility: true,
				width: browserWidth,
				height: 0,
				startX: 0,
				startY: 0,
				handleX: 'left',
				handleY: 'top',
				scale: 1,
				globalAlpha: 1,
				roll: 0,
			},
			end: {
				height: browserHeight
			},
			onComplete: {
				height: browserHeight,
			},
			callback: function() {
				if (page1.visibility) {
					newFrame();
					frame.onload = function() {
						buildRoller();
					};
					frame.src = frameSources[currentFrame];
				}
				else {
					buildRoller();
				}
			},
		});
		showPad();
		scrawl.renderElements();
		tween.run();
	};

	//starburst animation: animate star by its scale and roll
	starburstIn = scrawl.newTween({
		name: 'starburstIn',
		start: {
			scale: 0.01,
			roll: 0
		},
		end: {
			scale: 2,
			roll: 180
		},
		engines: {
			scale: 'easeOut'
		},
		duration: 3000,
		killOnComplete: true,
	});
	starburstOut = scrawl.newTween({
		name: 'starburstOut',
		start: {
			scale: 2,
			roll: 180
		},
		end: {
			scale: 0.01,
			roll: 360
		},
		engines: {
			scale: 'easeIn'
		},
		duration: 3000,
		killOnComplete: true,
	});
	buildStarburst = function() {
		switchPages();
		starburstOut.clone({
			targets: myStar,
			onComplete: {
				visibility: false,
			},
			callback: function() {
				hidePad();
				scrawl.renderElements();
			},
		}).run();
	};
	doStarburst = function() {
		var tween = starburstIn.clone({
			targets: myStar,
			onCommence: {
				visibility: true,
				startX: browserWidth / 2,
				startY: browserHeight / 2,
				handleX: 'center',
				handleY: 'center',
				scale: 0.01,
				globalAlpha: 1,
				roll: 0,
			},
			onComplete: {
				scale: 2,
				roll: 180,
			},
			callback: function() {
				if (page1.visibility) {
					newFrame();
					frame.onload = function() {
						buildStarburst();
					};
					frame.src = frameSources[currentFrame];
				}
				else {
					buildStarburst();
				}
			},
		});
		showPad();
		scrawl.renderElements();
		tween.run();
	};

	//fog animation: white out browser - animate block by its globalAlpha
	fogIn = scrawl.newTween({
		name: 'fogIn',
		start: {
			globalAlpha: 0
		},
		end: {
			globalAlpha: 1
		},
		duration: 1000,
		killOnComplete: true,
	});
	fogOut = scrawl.newTween({
		name: 'fogOut',
		start: {
			globalAlpha: 1
		},
		end: {
			globalAlpha: 0
		},
		duration: 1000,
		killOnComplete: true,
	});
	buildFog = function() {
		switchPages();
		fogOut.clone({
			targets: myBlock,
			onComplete: {
				visibility: false,
			},
			callback: function() {
				hidePad();
				scrawl.renderElements();
			},
		}).run();
	};
	doFog = function() {
		var tween = fogIn.clone({
			targets: myBlock,
			onCommence: {
				visibility: true,
				width: browserWidth,
				height: browserHeight,
				startX: 0,
				startY: 0,
				handleX: 'left',
				handleY: 'top',
				scale: 1,
				globalAlpha: 0,
				roll: 0,
			},
			onComplete: {
				globalAlpha: 1,
			},
			callback: function() {
				if (page1.visibility) {
					newFrame();
					frame.onload = function() {
						buildFog();
					};
					frame.src = frameSources[currentFrame];
				}
				else {
					buildFog();
				}
			},
		});
		showPad();
		scrawl.renderElements();
		tween.run();
	};

	//clear from center: animate block by its scale and roll
	clearFromCenterIn = scrawl.newTween({
		name: 'clearFromCenterIn',
		start: {
			scale: 0,
			roll: 0
		},
		end: {
			scale: 1,
			roll: 360
		},
		duration: 1500,
		killOnComplete: true,
	});
	clearFromCenterOut = scrawl.newTween({
		name: 'clearFromCenterOut',
		start: {
			scale: 1,
			roll: 0
		},
		end: {
			scale: 0,
			roll: 360
		},
		duration: 1500,
		killOnComplete: true,
	});
	buildClearFromCenter = function() {
		switchPages();
		clearFromCenterOut.clone({
			targets: myBlock,
			onComplete: {
				visibility: false,
			},
			callback: function() {
				hidePad();
				scrawl.renderElements();
			},
		}).run();
	};
	doClearFromCenter = function() {
		var tween = clearFromCenterIn.clone({
			targets: myBlock,
			onCommence: {
				visibility: true,
				scale: 0,
				globalAlpha: 1,
				roll: 0,
				startX: browserWidth / 2,
				startY: browserHeight / 2,
				width: browserWidth * 1.2,
				height: browserHeight * 1.2,
				handleX: 'center',
				handleY: 'center',
			},
			onComplete: {
				scale: 1,
				roll: 360,
			},
			callback: function() {
				if (page1.visibility) {
					newFrame();
					frame.onload = function() {
						buildClearFromCenter();
					};
					frame.src = frameSources[currentFrame];
				}
				else {
					buildClearFromCenter();
				}
			},
		});
		showPad();
		scrawl.renderElements();
		tween.run();
	};

	//clear with circles: animate circles by their scale
	clearCirclesIn = scrawl.newTween({
		name: 'clearCirclesIn',
		start: {
			scale: 0
		},
		end: {
			scale: 2
		},
		engines: {
			scale: 'easeOut4'
		},
		duration: 2000,
		killOnComplete: true,
	});
	clearCirclesOut = scrawl.newTween({
		name: 'clearCirclesOut',
		start: {
			scale: 2
		},
		end: {
			scale: 0
		},
		engines: {
			scale: 'easeIn4'
		},
		duration: 2000,
		killOnComplete: true,
	});
	buildClearCircles = function() {
		switchPages();
		clearCirclesOut.clone({
			targets: myCircles,
			onComplete: {
				visibility: false,
			},
			callback: function() {
				hidePad();
				scrawl.renderElements();
			},
		}).run();
	};
	doClearCircles = function() {
		var tween = clearCirclesIn.clone({
			targets: myCircles,
			onCommence: {
				visibility: true,
				scale: 0,
			},
			onComplete: {
				scale: 2,
			},
			callback: function() {
				if (page1.visibility) {
					newFrame();
					frame.onload = function() {
						buildClearCircles();
					};
					frame.src = frameSources[currentFrame];
				}
				else {
					buildClearCircles();
				}
			},
		});
		for (var i = 0, iz = myCircles.length; i < iz; i++) {
			myCircles[i].set({
				startX: Math.floor(Math.random() * browserWidth),
				startY: Math.floor(Math.random() * browserHeight),
			});
		}
		showPad();
		scrawl.renderElements();
		tween.run();
	};

	//canvas animation - runs all the time
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();
		},
	});

	//complete initial setup of DOM elements in stack
	resize();
	scrawl.renderElements();
};

//load scrawl modules used in this demo
scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'factories', 'animation', 'stacks', 'block', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
