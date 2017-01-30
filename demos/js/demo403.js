var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var filter,
		filterDefinitions,
		events,
		stopE,
		current = {
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
		},
		currentFilter = 'default';

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('filter').value = 'default';
	document.getElementById('red').value = '1';
	document.getElementById('green').value = '1';
	document.getElementById('blue').value = '1';

	// define multifilter
	filterDefinitions = {
		default: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'default',
			red: 1,
			green: 1,
			blue: 1
		}),
		channels: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'channels',
			red: 1,
			green: 1,
			blue: 1
		}),
		channelstep: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'channelstep',
			red: 1,
			green: 1,
			blue: 1
		}),
	};

	scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: filterDefinitions[currentFilter]
	});

	// define entitys
	scrawl.makeWheel({
		radius: '50%',
		startX: 'center',
		startY: 'center',
		order: 0,
	});
	scrawl.makePicture({
		name: 'parrot',
		copyWidth: 360,
		copyHeight: 360,
		pasteWidth: 360,
		pasteHeight: 360,
		copyX: 50,
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		globalAlpha: 1,
		globalCompositeOperation: 'source-over',
		order: 1,
		multiFilter: 'myFilter',
		url: 'img/carousel/cagedparrot.png',
	});

	// define event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		stopE(e);
		switch (e.target.id) {
			case 'globalAlpha':
				current.globalAlpha = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
			case 'gco':
				current.globalCompositeOperation = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
			case 'filter':
				currentFilter = e.target.value;
				scrawl.multifilter.myFilter.set({
					filters: filterDefinitions[currentFilter]
				});
				break;
			case 'red':
				if (currentFilter === 'channels') {
					filterDefinitions[currentFilter].set({
						red: parseFloat(e.target.value)
					});
				}
				else {
					filterDefinitions[currentFilter].set({
						red: parseFloat(e.target.value) * 64
					});
				}
				break;
			case 'green':
				if (currentFilter === 'channels') {
					filterDefinitions[currentFilter].set({
						green: parseFloat(e.target.value)
					});
				}
				else {
					filterDefinitions[currentFilter].set({
						green: parseFloat(e.target.value) * 64
					});
				}
				break;
			case 'blue':
				if (currentFilter === 'channels') {
					filterDefinitions[currentFilter].set({
						blue: parseFloat(e.target.value)
					});
				}
				else {
					filterDefinitions[currentFilter].set({
						blue: parseFloat(e.target.value) * 64
					});
				}
				break;
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controls');

	// define animation object
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
	extensions: ['images', 'multifilters', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
