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
		kill = [],
		counter = 0,
		filterEntitys,
		newRing;

	//add canvas to web page
	scrawl.addCanvasToPage({
		canvasName: 'myCanvas',
		parentElement: 'canvasHolder',
		width: 600,
		height: 400,
	}).makeCurrent();
	canvas = scrawl.canvas.myCanvas;
	pad = scrawl.pad.myCanvas;

	//define filters
	scrawl.newSaturationFilter({
		name: 'sat',
		saturation: 3,
	});

	//define groups
	scrawl.newGroup({
		name: 'ripples',
		order: 1,
		filters: ['sat'],
		filterOnStroke: true,
	});
	filterEntitys = scrawl.group.ripples.entitys;

	//define entitys
	scrawl.newPicture({
		name: 'myImage',
		width: 600,
		height: 400,
		url: 'img/carousel/kookaburra.png',
	});

	//event listener - creates entitys
	newRing = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		counter++;
		scrawl.newWheel({
			name: 'drop' + counter,
			start: here,
			radius: 1,
			method: 'none',
			lineWidth: 4,
			group: 'ripples',
			order: counter,
		});
	};
	canvas.addEventListener('mouseup', newRing, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = pad.getMouse();
			for (var i = 0, z = filterEntitys.length; i < z; i++) {
				currentEntity = scrawl.entity[filterEntitys[i]];
				currentEntity.setDelta({
					radius: 1,
					lineWidth: 0.2,
					globalAlpha: -0.006,
					order: 1,
				});
				if (currentEntity.get('radius') > 180) {
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'wheel', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
