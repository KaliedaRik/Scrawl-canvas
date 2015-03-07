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
		mouseIn, mouseOut, triggerTween,
		here;

	//prepare elements
	mystack.set({
		width: 200,
		height: 200,
		border: '1px solid red',
		backgroundColor: 'navy',
	});
	penguin.set({
		width: '99%',
		height: '99%',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		pointerEvents: 'none',
		visibility: true,
	});

	// ... save on some typing by using scrawl.mergeInto()
	coreItems = {
		color: 'white',
		handleX: 'center',
		handleY: 'top',
		opacity: 0,
		pointerEvents: 'none',
		startX: 'center',
		width: '90%',
	};

	myrule.set(scrawl.mergeInto({
		width: '60%',
		height: 0,
		borderWidth: '3px',
		startY: '48%',
		borderColor: 'white',
	}, coreItems));

	mytitle.set(scrawl.mergeInto({
		startY: '10%',
		pitch: 90,
		fontSize: '100%',
	}, coreItems));

	mycopytext.set(scrawl.mergeInto({
		textAlign: 'center',
		startY: '80%',
		fontSize: '75%',
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
	tweenFadeOutImg = scrawl.makeTween({
		start: {
			opacity: 1,
			width: '99%',
			height: '99%'
		},
		end: {
			opacity: 0.6,
			width: '94%',
			height: '94%'
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
	tweenText = scrawl.makeTween({
		start: {
			opacity: 0,
			startY: '70%',
			fontSize: '75%'
		},
		end: {
			opacity: 1,
			startY: '55%',
			fontSize: '105%'
		},
		engines: {
			opacity: 'easeOutIn',
			startY: 'easeOutIn'
		},
		targets: [mycopytext],
		duration: 800,
		callback: tweenReduce,
	});
	tweenTitle = scrawl.makeTween({
		start: {
			opacity: 0,
			pitch: 90,
			startY: '10%',
			fontSize: '100%'
		},
		end: {
			opacity: 1,
			pitch: 0,
			startY: '25%',
			fontSize: '250%'
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
	tweenGrowStack = scrawl.makeTween({
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
	tweenGrowRule = scrawl.makeTween({
		start: {
			opacity: 0,
			width: '60%'
		},
		end: {
			opacity: 1,
			width: '75%'
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
	scrawl.makeAnimation({
		order: 1000,
		fn: function() {

			//only need to render the elements while they're being animated
			if (tweensActive) {
				scrawl.renderElements();
			}
			else {
				here = mystack.getMouse();
				if (here.active) {
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
