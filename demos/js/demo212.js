var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var mystack = scrawl.stack.mystack,
		actionZone = scrawl.stk.mystack,
		penguin = scrawl.element.penguin,
		mytitle = scrawl.element.mytitle,
		mycopytext = scrawl.element.mycopytext,
		myrule = scrawl.element.myrule,
		coreItems,
		timeline,
		here;

	// prepare elements
	mystack.set({
		width: 200,
		height: 200,
		border: '1px solid red',
		backgroundColor: 'navy'
	});
	penguin.set({
		width: '99%',
		height: '99%',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		pointerEvents: 'none',
		visibility: true
	});

	// ... save on some typing by using scrawl.mergeInto()
	coreItems = {
		color: 'white',
		handleX: 'center',
		handleY: 'top',
		opacity: 0,
		pointerEvents: 'none',
		startX: 'center',
		width: '90%'
	};

	myrule.set(scrawl.mergeInto({
		width: '60%',
		height: 0,
		borderWidth: '3px',
		startY: '48%',
		borderColor: 'white'
	}, coreItems));

	mytitle.set(scrawl.mergeInto({
		startY: '10%',
		pitch: 90,
		fontSize: '100%'
	}, coreItems));

	mycopytext.set(scrawl.mergeInto({
		textAlign: 'center',
		startY: '80%',
		fontSize: '75%'
	}, coreItems));

	// initial render to position elements
	scrawl.renderElements();

	// tweens
	timeline = scrawl.makeTicker({
		name: 'myTimeline',
		duration: 800
	});

	scrawl.makeTween({
		name: 'growStack',
		ticker: 'myTimeline',
		targets: mystack,
		start: '0%',
		duration: '100%',
		definitions: [{
			attribute: 'scale',
			start: 1,
			end: 1.4,
			engine: 'easeOutIn'
		}]
	}).clone({
		name: 'fadeOutImage',
		targets: penguin,
		definitions: [{
			attribute: 'opacity',
			start: 1,
			end: 0.6,
			engine: 'easeOutIn'
		}, {
			attribute: 'width',
			start: '99%',
			end: '94%',
			engine: 'easeOutIn5'
		}, {
			attribute: 'height',
			start: '99%',
			end: '94%',
			engine: 'easeOutIn5'
		}]
	}).clone({
		name: 'moveText',
		targets: mycopytext,
		definitions: [{
			attribute: 'opacity',
			start: 0,
			end: 1,
			engine: 'easeOutIn'
		}, {
			attribute: 'startY',
			start: '70%',
			end: '55%',
			engine: 'easeOutIn'
		}, {
			attribute: 'fontSize',
			start: '75%',
			end: '105%'
		}]
	}).clone({
		name: 'moveTitle',
		targets: mytitle,
		definitions: [{
			attribute: 'opacity',
			start: 0,
			end: 1,
			engine: 'easeIn4'
		}, {
			attribute: 'pitch',
			start: 90,
			end: 0,
			engine: 'easeOutIn'
		}, {
			attribute: 'startY',
			start: '10%',
			end: '25%',
			engine: 'easeOutIn'
		}, {
			attribute: 'fontSize',
			start: '100%',
			end: '250%'
		}]
	}).clone({
		name: 'growRule',
		targets: myrule,
		definitions: [{
			attribute: 'opacity',
			start: 0,
			end: 1,
			engine: 'easeOutIn'
		}, {
			attribute: 'width',
			start: '60%',
			end: '75%',
			engine: 'easeOutIn'
		}]
	});

	// event listeners
	scrawl.addListener('enter', function(e) {
		if (timeline.active) {
			timeline.reverse().resume();
		}
		else {
			timeline.reset().resume();
		}
	}, actionZone);

	scrawl.addListener('leave', function(e) {
		if (timeline.active) {
			timeline.reverse().resume();
		}
		else {
			timeline.complete().resume();
		}
	}, actionZone);

	// animation object
	scrawl.makeAnimation({
		order: 1000,
		fn: function() {

			//only need to render the elements while they're being animated
			if (timeline.active) {
				scrawl.renderElements();
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

// module loading and initialization function
scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
