var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var canvas,
		pad,
		here,
		currentEntity,
		group,
		kill = [],
		counter = 0,
		filterEntitys,
		newRing;

	//add canvas to web page
	scrawl.addCanvasToPage({
		name: 'myCanvas',
		parentElement: 'canvasHolder',
		width: 600,
		height: 400
	}).makeCurrent();
	canvas = scrawl.canvas.myCanvas;
	pad = scrawl.pad.myCanvas;

	//define filters
	scrawl.makeSaturationFilter({
		name: 'sat',
		saturation: 3
	});

	//define groups
	group = scrawl.makeGroup({
		name: 'ripples',
		order: 1
	});

	//define entitys
	scrawl.makePicture({
		name: 'myImage',
		width: 600,
		height: 400,
		url: 'img/carousel/kookaburra.png'
	});

	//event listener - creates entitys
	newRing = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		counter++;
		scrawl.makeWheel({
			name: 'drop' + counter,
			start: here,
			radius: 1,
			method: 'none',
			handleX: 10,
			handleY: 10,
			lineWidth: 1,
			group: 'ripples',
			order: counter,
			filters: ['sat'],
			filterOnStroke: true
		});
	};
	scrawl.addListener('up', newRing, canvas);

	//stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}, canvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = pad.getMouse();
			group.updateEntitysBy({
				radius: 1,
				lineWidth: 0.2,
				globalAlpha: -0.006,
			});
			for (var i = 0, z = group.entitys.length; i < z; i++) {
				currentEntity = scrawl.entity[group.entitys[i]];
				if (currentEntity.radius > 120) {
					kill.push(currentEntity.name);
				}
			}
			if (kill.length > 0) {
				scrawl.deleteEntity(kill);
				kill = [];
			}
			pad.render();

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
	extensions: ['images', 'wheel', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
