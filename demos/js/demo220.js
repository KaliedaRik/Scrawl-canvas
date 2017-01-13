var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	var stack = scrawl.stack.myStack,
		stackElement = scrawl.stk.myStack,
		starHold = document.getElementById('starHold'),
		buildStar, addStars,
		starsCount = 0;

	stack.set({
		width: 600,
		height: 600,
		overflow: 'hidden',
		backgroundColor: 'black'
	});

	buildStar = function() {
		var e = document.createElement('div'),
			id = 'star_' + starsCount;
		e.id = id;
		starHold.appendChild(e);

		var rand1, rand2, rand3,
			x, y, scale, duration, star;

		rand1 = Math.random();
		rand2 = Math.round(Math.random() * 600);
		rand3 = Math.random();

		if (rand1 < 0.25) {
			x = 0;
			y = rand2;
		}
		else if (rand1 < 0.5) {
			x = 600;
			y = rand2;
		}
		else if (rand1 < 0.75) {
			x = rand2;
			y = 0;
		}
		else {
			x = rand2;
			y = 600;
		}
		duration = Math.round((rand3 * 3000) + 1000);
		scale = 0.5 + ((1 - rand3) * 1.4);

		stack.addElementById(id);
		star = scrawl.element[id];
		star.set({
			width: 8,
			height: 8,
			startX: 300,
			startY: 300,
			handleX: 'center',
			handleY: 'center',
			backgroundColor: 'white',
			borderRadius: '50%',
			zIndexIsTranslateZ: false
		});

		scrawl.makeTween({
			name: star.name + '_tween',
			targets: star,
			duration: duration,
			cycles: 0,
			definitions: [{
				attribute: 'startX',
				start: 300,
				end: x
	        }, {
				attribute: 'startY',
				start: 300,
				end: y
    		}, {
				attribute: 'scale',
				start: 0.1,
				end: scale
    		}]
		}).run();

		starsCount++;
	};

	addStars = function() {
		for (var i = 0; i < 100; i++) {
			buildStar();
		}
	}
	addStars();

	scrawl.addListener('up', addStars, stackElement);

	scrawl.makeAnimation({
		fn: function() {

			scrawl.renderElements();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Stars: ' + starsCount + '; milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
