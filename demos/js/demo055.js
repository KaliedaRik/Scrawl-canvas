var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//setup variables
	var makeLine,
		checkBounds,
		minX = 0,
		minY = 0,
		maxX = 750,
		maxY = 375,
		positions = [150, 200, 300, 200, 450, 200, 600, 200],
		positionDeltas = [],
		entitys = [],
		count = 0,
		noOfLines = 30,
		i, iz;

	for (i = 0; i < 8; i++) {
		positionDeltas.push((Math.random() * 11) - 6);
	}

	//factory for producing bezier curves
	makeLine = function(item) {
		return scrawl.makeBezier({
			name: item,
			startX: positions[0],
			startY: positions[1],
			startControlX: positions[2],
			startControlY: positions[3],
			endControlX: positions[4],
			endControlY: positions[5],
			endX: positions[6],
			endY: positions[7],
			strokeStyle: 'red',
		});
	};

	//bounds checking function
	checkBounds = function() {
		var j;
		for (j = 0; j < 8; j += 2) {
			if (!scrawl.isBetween((positions[j] + positionDeltas[j]), minX, maxX)) {
				positionDeltas[j] = -positionDeltas[j];
			}
			if (!scrawl.isBetween((positions[j + 1] + positionDeltas[j + 1]), minY, maxY)) {
				positionDeltas[j + 1] = -positionDeltas[j + 1];
			}
			positions[j] += positionDeltas[j];
			positions[j + 1] += positionDeltas[j + 1];
		}
	};

	//build initial set of curves
	for (i = 0, iz = noOfLines; i < iz; i++) {
		checkBounds();
		entitys.push(makeLine('curve' + i));
	}

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			var entity = entitys[count];
			checkBounds();
			entity.start.set({
				x: positions[0],
				y: positions[1],
			});
			//scrawl bezier curve points are measured relative to the start point
			scrawl.point[entity.name + '_p2'].local.set({
				x: positions[2] - positions[0],
				y: positions[3] - positions[1],
			});
			scrawl.point[entity.name + '_p3'].local.set({
				x: positions[4] - positions[0],
				y: positions[5] - positions[1],
			});
			scrawl.point[entity.name + '_p4'].local.set({
				x: positions[6] - positions[0],
				y: positions[7] - positions[1],
			});
			count++;
			if (count >= noOfLines) {
				count = 0;
			}
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
	extensions: ['animation', 'path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
