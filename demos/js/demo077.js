var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myGroups = ['corners', 'edges', 'center', 'start'],
		myOptions = document.getElementById('collision'),
		changeDisplay;

	//define groups
	scrawl.newGroup({
		name: 'corners',
		order: 4
	});
	scrawl.newGroup({
		name: 'edges',
		order: 3
	});
	scrawl.newGroup({
		name: 'center',
		order: 1
	});
	scrawl.newGroup({
		name: 'start',
		order: 2
	});

	//define sprites
	scrawl.newWheel({
		startX: 200,
		startY: 200,
		radius: 150,
		lineWidth: 4,
		strokeStyle: 'gold',
		method: 'draw',
	});

	scrawl.newWheel({
		name: 'north',
		startX: 200,
		startY: 50,
		radius: 5,
		fillStyle: 'red',
		method: 'fillDraw',
		group: 'edges',
	}).clone({
		name: 'east',
		startX: 350,
		startY: 200,
	}).clone({
		name: 'south',
		startX: 200,
		startY: 350,
	}).clone({
		name: 'west',
		startX: 50,
		startY: 200,
	}).clone({
		name: 'northwest',
		startX: 200 - (150 * 0.707),
		startY: 200 - (150 * 0.707),
		fillStyle: 'blue',
		group: 'corners',
	}).clone({
		name: 'northeast',
		startX: 200 + (150 * 0.707),
		startY: 200 - (150 * 0.707),
	}).clone({
		name: 'southeast',
		startX: 200 + (150 * 0.707),
		startY: 200 + (150 * 0.707),
	}).clone({
		name: 'southwest',
		startX: 200 - (150 * 0.707),
		startY: 200 + (150 * 0.707),
	}).clone({
		name: 'center',
		startX: 200,
		startY: 200,
		fillStyle: 'orange',
		group: 'center',
	}).clone({
		name: 'start',
		startX: 200,
		startY: 200,
		fillStyle: 'purple',
		group: 'start',
		radius: 7,
	});

	scrawl.newPhrase({
		pivot: 'north',
		text: 'north/N',
		handleX: 'center',
		handleY: 24,
		font: '11pt Arial, sans-serif',
		group: 'edges',
	}).clone({
		pivot: 'east',
		text: 'east/E',
	}).clone({
		pivot: 'south',
		text: 'south/S',
	}).clone({
		pivot: 'west',
		text: 'west/W',
	}).clone({
		pivot: 'northwest',
		text: 'northwest/NW',
		group: 'corners',
	}).clone({
		pivot: 'northeast',
		text: 'northeast/NE',
	}).clone({
		pivot: 'southeast',
		text: 'southeast/SE',
	}).clone({
		pivot: 'southwest',
		text: 'southwest/SW',
	}).clone({
		pivot: 'center',
		text: 'center',
		group: 'center',
	}).clone({
		pivot: 'start',
		text: 'start',
		group: 'start',
		handleY: -8,
	});

	//event listener
	changeDisplay = function(e) {
		var i, iz;
		e.stopPropagation();
		e.preventDefault();
		testTicker = Date.now();
		for (i = 0, iz = myGroups.length; i < iz; i++) {
			scrawl.group[myGroups[i]].visibility = false;
		}
		switch (e.currentTarget.value) {
			case 'all':
				for (i = 0, iz = myGroups.length; i < iz; i++) {
					scrawl.group[myGroups[i]].visibility = true;
				}
				break;
			case 'perimeter':
				scrawl.group.corners.visibility = true;
				scrawl.group.edges.visibility = true;
				break;
			case 'corners':
				scrawl.group.corners.visibility = true;
				break;
			case 'edges':
				scrawl.group.edges.visibility = true;
				break;
			case 'center':
				scrawl.group.center.visibility = true;
				break;
			case 'start':
				scrawl.group.start.visibility = true;
				break;
		}
		scrawl.render();

		testNow = Date.now();
		testTime = testNow - testTicker;
		testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	};
	myOptions.options.selectedIndex = 0;
	myOptions.addEventListener('change', changeDisplay, false);

	//display initial canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['wheel', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
