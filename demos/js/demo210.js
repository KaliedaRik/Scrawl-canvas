var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var stack,
		buttons = [],
		moveButton,
		color,
		i;

	//add stack to web page
	stack = scrawl.addStackToPage({
		stackName: 'stack',
		parentElement: document.getElementById('stackHolder'),
		width: 600,
		height: 240,
		perspectiveZ: 400
	});

	//get DOM buttons and add them to the stack
	stack.addElementsByClassName('mybuttons');
	buttons.push(scrawl.element.button0);
	buttons.push(scrawl.element.button1);
	buttons.push(scrawl.element.button2);
	buttons.push(scrawl.element.button3);

	color = scrawl.makeColor();
	scrawl.element.button1.set({
		color: color
	});

	//position and size buttons
	for (i = 0; i < 4; i++) {
		buttons[i].set({
			startX: '20%',
			startY: (i * 50) + 20,
			width: 100,
			height: 40,
			handleX: 'center',
			handleY: 'center'
		});
	}
	scrawl.renderElements();



	scrawl.makeTween({
		name: 'button0',
		targets: buttons,
		duration: 3000,
		cycles: 2,
		reverseOnCycleEnd: true,
		definitions: [{
			attribute: 'startX',
			start: '20%',
			end: '120%',
			engine: 'easeOutIn3'
		}, {
			attribute: 'roll',
			start: 0,
			end: 360,
			engine: 'easeOutIn3'
		}]
	});

	scrawl.makeTween({
		name: 'button1',
		targets: scrawl.element.button1,
		duration: 3000,
		cycles: 2,
		reverseOnCycleEnd: true,
		definitions: [{
			attribute: 'startX',
			start: '20%',
			end: '120%',
			engine: 'easeIn5'
		}, {
			attribute: 'roll',
			start: 0,
			end: 360,
			engine: 'easeOut5'
		}, {
			attribute: 'scale',
			start: 1,
			end: 2
		}, {
			attribute: 'fontSize',
			start: '100%',
			end: '200%'
		}, {
			attribute: 'color',
			start: 0,
			end: 255,
			engine: function(start, change, progress) {
				var r = Math.round(change * progress);
				color.set({
					r: r
				});
				return color.get();
			}
		}]
	});

	scrawl.makeTween({
		name: 'button2',
		targets: scrawl.element.button2,
		duration: 3000,
		cycles: 2,
		reverseOnCycleEnd: true,
		definitions: [{
			attribute: 'startX',
			start: '20%',
			end: '120%',
			engine: 'easeIn3'
		}, {
			attribute: 'height',
			start: 40,
			end: 100,
			engine: 'easeIn3'
		}]
	});
	scrawl.makeTween({
		name: 'button3',
		targets: [scrawl.element.button1, buttons[3]],
		duration: 3000,
		cycles: 2,
		reverseOnCycleEnd: true,
		definitions: [{
			attribute: 'startX',
			start: '20%',
			end: '120%',
			engine: 'easeOutIn3'
		}, {
			attribute: 'roll',
			start: 0,
			end: 360,
			engine: 'easeOutIn3'
		}, {
			attribute: 'pitch',
			start: 0,
			end: 360,
			engine: 'in'
		}, {
			attribute: 'yaw',
			start: 0,
			end: 360,
			engine: 'out'
		}]
	});

	//button event listeners
	moveButton = function(e) {
		e.preventDefault();
		e.returnValue = false;
		scrawl.tween[e.target.id].run();
	};
	scrawl.addListener('up', moveButton, [
		scrawl.elm.button0,
		scrawl.elm.button1,
		scrawl.elm.button2,
		scrawl.elm.button3
	]);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			scrawl.renderElements();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'stacks', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
