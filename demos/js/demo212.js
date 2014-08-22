var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var mystack = scrawl.stack.mystack,
		actionZone = scrawl.stk.mystack,
		penguin = scrawl.element.penguin,
		mytitle = scrawl.element.mytitle,
		mycopytext = scrawl.element.mycopytext,
		myrule = scrawl.element.myrule,
		coreItems,
		tweenFadeOutImg, tweenTitle, tweenGrowStack,
		tweenText, tweenGrowRule,
		tweensActive = false,
		tweenCounter = 0,
		tweenReduce,
		expanded = false,
		mouseIn, mouseOut, triggerTween;

	//prepare elements
	mystack.set({
		width: 200,
		height: 200,
		border: '1px solid red',
		backgroundColor: 'navy',
		scaleText: true,
	});
	penguin.set({
		width: 200,
		height: 200,
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		pointerEvents: 'none',
	});

	// ... save on some typing by using scrawl.mergeInto()
	coreItems = {
		color: 'white',
		handleX: 'center',
		handleY: 'top',
		opacity: 0,
		pointerEvents: 'none',
		startX: 'center',
		width: 180,
	};

	myrule.set(scrawl.mergeInto({
		width: 30,
		borderWidth: '3px',
		height: 1,
		startY: 70,
		borderColor: 'white',
	}, coreItems));

	mytitle.set(scrawl.mergeInto({
		startY: 20,
		pitch: 90,
	}, coreItems));

	mycopytext.set(scrawl.mergeInto({
		textAlign: 'center',
		startY: 160,
		fontSize: '0.75em',
	}, coreItems));

	//initial render to position elements
	scrawl.renderElements();

	//define animation tweens
	tweenReduce = function() {
		//check to see if this is the last remaining tween (plus the animation loop) still running
		if (tweenCounter) {
			tweenCounter--;
		}
		if (!tweenCounter) {
			tweensActive = false;
			expanded = !expanded;
		}
	};
	tweenFadeOutImg = scrawl.newTween({
		start: {
			opacity: 1,
			width: 200,
			height: 200
		},
		end: {
			opacity: 0.6,
			width: 180,
			height: 180
		},
		engines: {
			opacity: 'easeOutIn',
			width: 'easeOutIn5',
			height: 'easeOutIn5'
		},
		targets: [penguin],
		duration: 800,
		callback: tweenReduce,
	});
	tweenText = scrawl.newTween({
		start: {
			opacity: 0,
			startY: 160
		},
		end: {
			opacity: 1,
			startY: 100
		},
		engines: {
			opacity: 'easeOutIn',
			startY: 'easeOutIn'
		},
		targets: [mycopytext],
		duration: 800,
		callback: tweenReduce,
	});
	tweenTitle = scrawl.newTween({
		start: {
			opacity: 0,
			pitch: 90,
			startY: 20
		},
		end: {
			opacity: 1,
			pitch: 0,
			startY: 50
		},
		engines: {
			opacity: 'easeIn4',
			pitch: 'easeOutIn',
			startY: 'easeOutIn'
		},
		targets: [mytitle],
		duration: 800,
		callback: tweenReduce,
	});
	tweenGrowStack = scrawl.newTween({
		start: {
			scale: 1
		},
		end: {
			scale: 1.40
		},
		engines: {
			scale: 'easeOutIn'
		},
		targets: [mystack],
		duration: 800,
		callback: tweenReduce,
	});
	tweenGrowRule = scrawl.newTween({
		start: {
			opacity: 0,
			width: 30
		},
		end: {
			opacity: 1,
			width: 150
		},
		engines: {
			opacity: 'easeOutIn',
			width: 'easeOutIn',
		},
		targets: [myrule],
		duration: 800,
		callback: tweenReduce,
	});

	//define the event listener routines
	triggerTween = function() {
		tweensActive = true;
		tweenCounter = 5;
		tweenGrowStack.run();
		tweenFadeOutImg.run();
		tweenText.run();
		tweenTitle.run();
		tweenGrowRule.run();
	};
	mouseIn = function() {
		if (!expanded) {
			tweenGrowStack.reverse = false;
			tweenFadeOutImg.reverse = false;
			tweenText.reverse = false;
			tweenTitle.reverse = false;
			tweenGrowRule.reverse = false;
			triggerTween();
		}
	};
	mouseOut = function() {
		if (expanded) {
			tweenGrowStack.reverse = true;
			tweenFadeOutImg.reverse = true;
			tweenText.reverse = true;
			tweenTitle.reverse = true;
			tweenGrowRule.reverse = true;
			triggerTween();
		}
	};

	//animation object
	scrawl.newAnimation({
		order: 1000,
		fn: function() {

			//only need to render the elements while they're being animated
			if (tweensActive) {
				scrawl.renderElements();
			}
			else {
				if (mystack.mouse.active) {
					mouseIn();
				}
				else {
					mouseOut();
				}
			}

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

//module loading and initialization function
scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
