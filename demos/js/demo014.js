var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var mypad = scrawl.pad.mycanvas,
		countries = scrawl.group[mypad.base],
		here,
		newCountry,
		currentCountry = false;

	//set and display canvas background color
	scrawl.cell[mypad.base].set({
		backgroundColor: 'lightblue',
	}).compile();

	//build and display outlines from SVG path data
	//data is contained in a separate javascript file with a structure of:
	//	var worldMap = {
	//		shapes: {		
	//			AE:	"M604.196, 161.643 l0.514 -0.129 l0,0.772 l2.188-0.386 l2.189,0 l1.672,0.129 
	//				l1.803-1.802 l2.058-1.802 l1.674-1.673 l0.518,0.900 l0.385,2.189 l-1.417,0 
	//				l-0.258,1.802 l0.517,0.386 l-1.159,0.515 l-0.129,1.029 l-0.773,1.159 l0,1.030 
	//				l-0.514,0.644 l-8.110-1.416 l-1.031-2.704 l0.127,0.643 z",
	//			... etc
	//			},
	//		offset: {		
	//			AE: [604.196,156.752],
	//			... etc
	//			},
	//		};
	for (var country in worldMap.shapes) {
		scrawl.newShape({
			name: country,
			data: worldMap.shapes[country],
			method: 'drawFill',
			fillStyle: 'white',
			startX: worldMap.offset[country][0],
			startY: worldMap.offset[country][1],
		}).stamp();
	}

	//limit the checking region for country entity collision detection
	countries.regionRadius = 465;

	//animation object
	scrawl.newAnimation({
		fn: function() {
			//update display; check if mouse cursor is over an outline
			here = mypad.show().getMouse();
			newCountry = countries.getEntityAt(here);

			//action for when mouse cursor crosses a border
			if (newCountry && newCountry !== currentCountry) {
				if (currentCountry) {
					currentCountry.set({
						fillStyle: 'white',
					}).stamp();
				}
				newCountry.set({
					fillStyle: 'red',
				}).stamp();
			}

			//action for when mouse cursor moves from land to sea
			else if (!newCountry && currentCountry) {
				currentCountry.set({
					fillStyle: 'white',
				}).stamp();
			}
			currentCountry = newCountry;

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['shape', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
