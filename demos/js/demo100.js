var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	document.getElementById('duration').value = '4s';

	var engines = [
		'linear', 'in', 'easeIn', 'easeIn3', 'easeIn4', 'easeIn5', 
		'out', 'easeOut', 'easeOut3', 'easeOut4', 'easeOut5', 
		'easeOutIn', 'easeOutIn3', 'easeOutIn4', 'easeOutIn5'];

	scrawl.makeTicker({
		name: 'myTicker',
		cycles: 0,
		duration: '4s'
	})

	for(var i = 0, iz = engines.length; i < iz; i++){
		scrawl.makeBlock({
			name: 'b' + i,
			width: 100,
			height: 26,
			startX: 60,
			startY: (i * 30) + 18,
			method: 'draw',
			handleX: 'center',
			handleY: 'center'
		});
		scrawl.makePhrase({
			name: 'p' + i,
			font: '18px Arial, sans-serif',
			pivot: 'b' + i,
			handleX: 'center',
			handleY: '60%',
			text: engines[i],
		});
		scrawl.makeTween({
			name: 't' + i,
			ticker: 'myTicker',
			reverseOnCycleEnd: true,
			duration: '90%',
			time: '5%',
			targets: 'b' + i,
			definitions: [
				{
					attribute: 'startX',
					start: 60,
					end: 740,
					engine: engines[i]
				}
			]
		})
	}

	scrawl.animation.myTicker.run();

	//event listeners
	var stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	var events = function(e) {
		var items = {};
		stopE(e);
		switch (e.target.id) {
			case 'duration':
				items.duration = e.target.value;
				break;
			default:
				items = false;
		}
		if (items) {
			scrawl.animation.myTicker.set(items);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			scrawl.render();

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
	extensions: ['animation', 'phrase', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
