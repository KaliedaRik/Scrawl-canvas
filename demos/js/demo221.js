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
		backgroundColor: 'black',
		perspectiveX: 300,
		perspectiveY: 300,
		perspectiveZ: 100
	});

	buildStar = function() {
		var e, id, star,
			v, duration, scale, r1;

		e = document.createElement('div');
		id = 'star_' + starsCount;
		e.id = id;
		starHold.appendChild(e);

		stack.addElementById(id);
		star = scrawl.element[id];
		star.set({
			width: 6,
			height: 6,
			startX: 300,
			startY: 300,
			handleX: 'center',
			handleY: 'center',
			backgroundColor: 'white',
			borderRadius: '50%',
			zIndexIsTranslateZ: false
		});

		r1 = Math.random();
		v = scrawl.makeVector({
			x: 1
		}).rotate(Math.random() * 360).scalarMultiply(420);
		duration = Math.round((r1 * 3000) + 2000);
		scale = Math.round((1 - r1) * 300);

		scrawl.makeTween({
			name: star.name + '_tween',
			targets: star,
			duration: duration,
			cycles: 0,
			definitions: [{
				attribute: 'translateX',
				start: 0,
				end: v.x
			}, {
				attribute: 'translateY',
				start: 0,
				end: v.y
			}, {
				attribute: 'translateZ',
				start: -100,
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
