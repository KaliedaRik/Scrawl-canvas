var mycode = function() {
	'use strict';

	// setup the stacks and elements
	var titlestack = scrawl.stack.titlestack,
		controlsstack = scrawl.stack.controlsstack,
		canvasstack = scrawl.stack.canvasstack,
		iframestack = scrawl.stack.iframestack,
		pad = scrawl.pad.loadeffect,
		canvas = scrawl.canvas.loadeffect,
		title = scrawl.element.title,
		controls = scrawl.element.controls,
		iframe = scrawl.element.myframe,
		iframeElement = scrawl.elm.myframe,
		device = scrawl.device;

	var button = document.getElementById('button');
	var selector = document.getElementById('effect');
	selector.value = 'fog';
	
	var sliderWidth = 17;
	var runningTween = false;
	var currentLoader = 'fog';

	var zeroValues = {
		height: 0,
		padding: '0',
		margin: '0',
		border: '0',
	};

	// Stacks; Elements; Canvases, Pads and Cells
	titlestack.set(zeroValues);
	controlsstack.set(zeroValues);
	canvasstack.set(zeroValues);
	iframestack.set(zeroValues);
	iframe.set(zeroValues);
	pad.set(zeroValues);
	title.set(zeroValues);
	controls.set(zeroValues);

	pad.set({
		viewport: true,
		height: 0.1,	// scrawlStacks assumes if pad height is set to 0, it needs to be set to 'auto' (design feature, not a bug)
		startX: 0,
		startY: 0
	});
	title.set({
		width: '50%',
		height: 100,
		startX: 'center',
		startY: 15,
		handleX: 'center',
		handleY: 'top',
		padding: '10px',
		backgroundColor: 'rgba(255, 255, 255, 0.3)'
	});
	controls.set({
		viewport: true,
		handleX: 'right',
		handleY: 'top',
		width: '20%',
		startY: 15,
		textAlign: 'right',
		padding: '10px',
		backgroundColor: 'rgba(255, 127, 127, 0.3)'
	});
	iframe.set({
		startX: 0,
		startY: 0
	});

	var resetDimensions = function(){
		titlestack.set({
			width: device.width - sliderWidth,
		});
		pad.set({
			width: device.width - sliderWidth,
		});
		scrawl.cell[pad.base].set({
			width: device.width - sliderWidth,
			height: device.height
		});
		controls.set({
			startX: device.width - (sliderWidth * 2),
		});
		iframe.set({
			width: device.width - sliderWidth,
			height: device.height,
		});
	};
	resetDimensions();

	// Groups
	scrawl.makeGroup({
		name: 'fog',
		cell: pad.base,
		visibility: false,
	}).clone({
		name: 'rollingRectangle'
	}).clone({
		name: 'spinningStar'
	}).clone({
		name: 'chopFromTop'
	}).clone({
		name: 'clearWithCircles'
	}).clone({
		name: 'note',
		visibility: true,
		order: 1
	});

	// Entitys
	scrawl.makeBlock({
		name: 'fogBlock',
		group: 'fog',
		fillStyle: 'white',
		globalAlpha: 0
	}).clone({
		name: 'chopBlock',
		group: 'chopFromTop',
		globalAlpha: 1,
		height: '0%'
	}).clone({
		name: 'rollingBlock',
		group: 'rollingRectangle',
		scale: 0,
		roll: 0
	});

	scrawl.makePhrase({
		name: 'noteText',
		group: 'note',
		font: '50px bold Arial, sans-serif',
		fillStyle: 'red',
		strokeStyle: 'gray',
		method: 'fillDraw',
		text: 'Loading new wiki page',
		globalAlpha: 0
	});

	var buildEntitys = function(){
		var x, y, i, greatestDimension;

		scrawl.deleteEntity(scrawl.group.spinningStar.entitys);
		scrawl.deleteEntity(scrawl.group.clearWithCircles.entitys);

		greatestDimension = (device.width > device.height) ? device.width : device.height;

		scrawl.makeRegularShape({
			group: 'spinningStar',
			angle: 144,
			radius: greatestDimension * 1.4,
			fillStyle: 'white',
			scale: 0,
			roll: 0,
			startX: 'center',
			startY: 'center',
			method: 'fill',
			shape: true
		});

		for(i = 0; i < 100; i++){
			x = Math.round(Math.random() * device.width);
			y = Math.round(Math.random() * device.height);
			scrawl.makeWheel({
				group: 'clearWithCircles',
				startX: x,
				startY: y,
				fillStyle: 'white',
				scale: 0,
				radius: 300,
			});
		}

		scrawl.entity.fogBlock.set({
			width: '100%',
			height: '100%'
		});
		scrawl.entity.chopBlock.set({
			width: '100%'
		});
		scrawl.entity.rollingBlock.set({
			width: '100%',
			height: '100%',
			startX: 'center',
			startY: 'center',
			handleX: 'center',
			handleY: 'center'
		});
		scrawl.entity.noteText.set({
			startX: 'center',
			startY: 'center',
			handleX: 'center',
			handleY: 'center'
		});
	};
	buildEntitys();

	// Tickers
	scrawl.makeTicker({
		name: 'show_fog',
		duration: 2000
	}).clone({
		name: 'hide_fog',
	}).clone({
		name: 'show_rollingRectangle',
	}).clone({
		name: 'hide_rollingRectangle',
	}).clone({
		name: 'show_spinningStar',
	}).clone({
		name: 'hide_spinningStar',
	}).clone({
		name: 'show_chopFromTop',
	}).clone({
		name: 'hide_chopFromTop',
	}).clone({
		name: 'show_clearWithCircles',
	}).clone({
		name: 'hide_clearWithCircles',
	});

	// Actions
	scrawl.makeAction({
		ticker: 'show_fog',
		time: '100%',
		action: function(){ iframeElement.src = frameSources[requestedFrame]; }
	}).clone({
		ticker: 'show_rollingRectangle',
		action: function(){ iframeElement.src = frameSources[requestedFrame]; }
	}).clone({
		ticker: 'show_spinningStar',
		action: function(){ iframeElement.src = frameSources[requestedFrame]; }
	}).clone({
		ticker: 'show_chopFromTop',
		action: function(){ iframeElement.src = frameSources[requestedFrame]; }
	}).clone({
		ticker: 'show_clearWithCircles',
		action: function(){ iframeElement.src = frameSources[requestedFrame]; }
	});

	scrawl.makeAction({
		ticker: 'hide_fog',
		time: '100%',
		action: function(){ cleanup(); }
	}).clone({
		ticker: 'hide_rollingRectangle',
		action: function(){ cleanup(); }
	}).clone({
		ticker: 'hide_spinningStar',
		action: function(){ cleanup(); }
	}).clone({
		ticker: 'hide_chopFromTop',
		action: function(){ cleanup(); }
	}).clone({
		ticker: 'hide_clearWithCircles',
		action: function(){ cleanup(); }
	});

	// Tweens
	scrawl.makeTween({
		name: 'tween_show_fog',
		ticker: 'show_fog',
		targets: scrawl.group.fog.entitys,
		time: '1%',
		duration: '98%',
		definitions: [{
			attribute: 'globalAlpha',
			start: 0, 
			end: 1
		}]
	}).clone({
		name: 'tween_hide_fog',
		ticker: 'hide_fog',
		definitions: [{
			attribute: 'globalAlpha',
			start: 1, 
			end: 0
		}]
	}).clone({
		name: 'tween_show_rollingRectangle',
		ticker: 'show_rollingRectangle',
		targets: scrawl.group.rollingRectangle.entitys,
		definitions: [{
			attribute: 'scale',
			start: 0, 
			end: 1
		}, {
			attribute: 'roll',
			start: 0, 
			end: 180,
			engine: 'easeOutIn3'
		}]
	}).clone({
		name: 'tween_hide_rollingRectangle',
		ticker: 'hide_rollingRectangle',
		definitions: [{
			attribute: 'scale',
			start: 1, 
			end: 0
		}, {
			attribute: 'roll',
			start: 0, 
			end: 180,
			engine: 'easeOutIn3'
		}]
	}).clone({
		name: 'tween_show_spinningStar',
		ticker: 'show_spinningStar',
		targets: [],
		definitions: [{
			attribute: 'scale',
			start: 0, 
			end: 1
		}, {
			attribute: 'roll',
			start: 0, 
			end: 180,
			engine: 'easeOutIn3'
		}]
	}).clone({
		name: 'tween_hide_spinningStar',
		ticker: 'hide_spinningStar',
		definitions: [{
			attribute: 'scale',
			start: 1, 
			end: 0,
		}, {
			attribute: 'roll',
			start: 0, 
			end: 180,
			engine: 'easeOutIn3'
		}]
	}).clone({
		name: 'tween_show_chopFromTop',
		ticker: 'show_chopFromTop',
		targets: scrawl.group.chopFromTop.entitys,
		definitions: [{
			attribute: 'height',
			start: '0%', 
			end: '100%',
			engine: 'easeOut3'
		}]
	}).clone({
		name: 'tween_hide_chopFromTop',
		ticker: 'hide_chopFromTop',
		definitions: [{
			attribute: 'height',
			start: '100%', 
			end: '0%',
			engine: 'easeIn3'
		}]
	}).clone({
		name: 'tween_show_clearWithCircles',
		ticker: 'show_clearWithCircles',
		targets: [],
		definitions: [{
			attribute: 'scale',
			start: 0, 
			end: 1,
			engine: 'easeOut3'
		}]
	}).clone({
		name: 'tween_hide_clearWithCircles',
		ticker: 'hide_clearWithCircles',
		definitions: [{
			attribute: 'scale',
			start: 1, 
			end: 0,
			engine: 'easeIn3'
		}]
	}).clone({
		name: 'showNote',
		ticker: '',
		targets: 'noteText',
		time: '5%',
		duration: '50%',
		definitions: [{
			attribute: 'globalAlpha',
			start: 0, 
			end: 1
		}]
	}).clone({
		name: 'hideNote',
		time: '45%',
		definitions: [{
			attribute: 'globalAlpha',
			start: 1, 
			end: 0
		}]
	});

	var resetTargets = function(){
		scrawl.tween.tween_show_spinningStar.set({
			targets: scrawl.group.spinningStar.entitys
		});
		scrawl.tween.tween_hide_spinningStar.set({
			targets: scrawl.group.spinningStar.entitys
		});
		scrawl.tween.tween_show_clearWithCircles.set({
			targets: scrawl.group.clearWithCircles.entitys
		});
		scrawl.tween.tween_hide_clearWithCircles.set({
			targets: scrawl.group.clearWithCircles.entitys
		});
	};
	resetTargets();

	// pages to be loaded into iFrame
	var frameSources = {
			cat: 'http://en.wikipedia.org/wiki/Cat',
			dog: 'http://en.wikipedia.org/wiki/Dog',
			goat: 'http://en.wikipedia.org/wiki/Goat',
			rabbit: 'http://en.wikipedia.org/wiki/Rabbit',
			parrot: 'http://en.wikipedia.org/wiki/Parrot',
			slug: 'http://en.wikipedia.org/wiki/Sea_slug',
			orchid: 'http://en.wikipedia.org/wiki/Orchid',
			rose: 'http://en.wikipedia.org/wiki/Rose',
			html: 'http://en.wikipedia.org/wiki/HTML5',
			css: 'http://en.wikipedia.org/wiki/Css',
			javascript: 'http://en.wikipedia.org/wiki/Javascript'
		},
		currentFrame = 'cat',
		requestedFrame = '',
		frameKeys = Object.keys(frameSources);

	// action for selecting a different page load effect
	var changeLoader = function(e){
		if(!runningTween){
			currentLoader = e.target.value;
		}
	};

	// actions for a new page load
	var changePage = function(e){
		var myShow, myHide;
		if(!runningTween){
			runningTween = true;
			myShow = 'show_' + currentLoader;
			myHide = 'hide_' + currentLoader;
			requestedFrame = frameKeys[Math.floor(Math.random() * frameKeys.length)];
			while(!requestedFrame || requestedFrame === currentFrame){
				requestedFrame = frameKeys[Math.floor(Math.random() * frameKeys.length)];
			}
			pad.set({ height: device.height });
			scrawl.group[currentLoader].set({ visibility: true });
			scrawl.tween.showNote.addToTicker(myShow);
			scrawl.tween.hideNote.addToTicker(myHide);
			scrawl.animation[myShow].run();
		}
	};

	var changePageLoaded = function(e){
		currentFrame = requestedFrame;
		scrawl.animation['hide_' + currentLoader].run();
	};

	var cleanup = function(){
		scrawl.group[currentLoader].set({ visibility: false });
		pad.set({ height: 0.1 });
		runningTween = false;
	};

	// browser resize
	var resizeFlag = false,
		resizeChoke = 500,
		lastResize = 0;
	var resize = function(e){
		var now = Date.now();
		resizeFlag = true;
		if(!runningTween && lastResize + resizeChoke < now){
			resetDimensions();
			buildEntitys();
			resetTargets();
			resizeFlag = false;
			lastResize = now;
		}
	};

	// event listeners
	scrawl.addNativeListener(['input', 'change'], changeLoader, selector);
	scrawl.addNativeListener('click', changePage, button);
	scrawl.addNativeListener('load', changePageLoaded, iframeElement);
	scrawl.addNativeListener('resize', resize, window);

	// animation object
	scrawl.makeAnimation({
		fn: function() {
			if(resizeFlag){
				resize();
			}
			scrawl.render();
		},
	});
};

//load scrawl modules used in this demo
scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['shape', 'factories', 'animation', 'stacks', 'block', 'wheel', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
