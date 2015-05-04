var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myColors = ['Green', 'Blue', 'lightblue', 'gold', 'lightgreen', 'Pink'],
		phrase = ['Canvas', 'just', 'wanna\nwanna', 'have', 'some\nFUN', 'innit!'],
		groupA,
		groupB,
		allEntitys,
		minX = 10,
		minY = 10,
		maxX = 740,
		maxY = 365,
		myEntity,
		coord,
		hits,
		moveEntitys,
		checkBounds,
		checkCollisions;

	//define groups
	groupA = scrawl.makeGroup({
		name: 'A',
		regionRadius: 200,
	});
	groupB = scrawl.makeGroup({
		name: 'B',
		regionRadius: 200,
	});
	allEntitys = scrawl.makeGroup({
		name: 'all',
	});

	//build cell collision map
	scrawl.makeBlock({
		startX: 10,
		startY: 10,
		width: 730,
		height: 355,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.buildFields();

	//define entitys
	for (var i = 0; i < 6; i++) {
		scrawl.makePhrase({
			name: 'text' + i,
			startX: (100 * i) + 100,
			startY: 300,
			deltaX: (Math.random() * 4) - 2,
			deltaY: (Math.random() * 2) - 1,
			roll: 15 * i,
			fillStyle: myColors[i],
			handleX: 'center',
			handleY: 'center',
			size: 20,
			metrics: 'pt',
			family: 'Arial, sans-serif',
			group: 'B',
			order: i,
			method: 'fill',
			collisionPoints: 'corners',
			backgroundColor: '#a0a0a0',
			backgroundMargin: 2,
			text: phrase[i],
		});
		scrawl.makeBlock({
			name: 'B' + i,
			startX: (100 * i) + 100,
			startY: 60,
			roll: 15 * i,
			deltaX: (Math.random() * 4) - 2,
			deltaY: (Math.random() * 2) - 1,
			width: 80,
			height: 50,
			handleX: 'center',
			handleY: 'center',
			fillStyle: myColors[i],
			method: 'fillDraw',
			group: 'A',
			order: i,
			collisionPoints: 'corners',
		});
	}
	allEntitys.addEntitysToGroup(groupA.entitys);
	allEntitys.addEntitysToGroup(groupB.entitys);

	//animation functions
	moveEntitys = function() {
		for (var i = 0, iz = allEntitys.entitys.length; i < iz; i++) {
			myEntity = scrawl.entity[allEntitys.entitys[i]];
			if (myEntity.scale < 0.2) {
				myEntity.set({
					scale: 0.2,
				});
			}
			myEntity.setDelta({
				scale: (myEntity.scale < 1) ? 0.005 : 0,
			});
		}
		groupA.updateEntitysBy({
			roll: 1,
		});
		groupB.updateEntitysBy({
			roll: -1,
		});
		allEntitys.updateStart();
	};

	checkBounds = function() {
		hits = allEntitys.getFieldEntityHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			myEntity = scrawl.entity[hits[i][0]];
			coord = hits[i][1];
			myEntity.revertStart();
			if (!scrawl.isBetween(coord.x, minX, maxX, true)) {
				myEntity.reverse('deltaX');
				myEntity.setDelta({
					scale: -0.08,
				});
			}
			if (!scrawl.isBetween(coord.y, minY, maxY, true)) {
				myEntity.reverse('deltaY');
				myEntity.setDelta({
					scale: -0.08,
				});
			}
			allEntitys.updateStart();
		}
	};

	checkCollisions = function() {
		hits = groupB.getBetweenGroupEntityHits(groupA);
		for (var i = 0, z = hits.length; i < z; i++) {
			scrawl.entity[hits[i][0]].exchange(scrawl.entity[hits[i][1]], 'delta');
			for (var j = 0; j < 2; j++) {
				myEntity = scrawl.entity[hits[i][j]];
				myEntity.setDelta({
					scale: -0.08,
				});
			}
		}
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			checkBounds();
			checkCollisions();
			moveEntitys();
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
	extensions: ['block', 'phrase', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
