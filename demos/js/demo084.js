var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myCanvas = scrawl.canvas.mycanvas,
		myPad = scrawl.pad.mycanvas,
		selectedTile = false,
		previousTile = false,
		moving = false,
		prepare = true,
		mixCounter = 0,
		here,
		currentTile,
		legalTiles,
		myTiles,
		myTile,
		mySpace,
		spaceBlock,
		getLegalTiles,
		spaceTileMove,
		myX,
		myY,
		hit,
		myEntity,
		startTileMove,
		endTileMove,
		mixTiles,
		handleEntity;

	//import images into scrawl library
	scrawl.getImagesByClass('demo084');

	//define groups
	myTiles = scrawl.newGroup({
		name: 'tiles',
		order: 1,
	});
	mySpace = scrawl.newGroup({
		name: 'space',
		order: 3,
	});
	scrawl.newGroup({
		name: 'lines',
		order: 2,
	});

	//define entitys
	myTile = scrawl.newPicture({
		source: 'gun',
		group: 'tiles',
		width: 80,
		height: 80,
		copyWidth: 80,
		copyHeight: 80,
		handleX: 'center',
		handleY: 'center',
		delta: {}
	});
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			myTile.clone({
				name: 'tile' + i + '' + j,
				copyX: i * 80,
				startX: i * 80 + 40,
				copyY: j * 80,
				startY: j * 80 + 40,
				keepCopyDimensions: true,
			});
		}
	}
	scrawl.deleteEntity(myTile.name, 'tile44');

	scrawl.newShape({
		strokeStyle: 'white',
		lineWidth: 2,
		group: 'lines',
		data: 'm0,79 400,0m0,80-400,0m0,80 400,0m0,80-400,0m80,80 0-400m80,0 0,400m80,0 0-400m80,0 0,400',
	});

	spaceBlock = scrawl.newBlock({
		name: 'spacer',
		startX: 360,
		startY: 360,
		handleX: 'center',
		handleY: 'center',
		width: 100,
		height: 100,
		fillStyle: 'rgba(0,0,0,0)',
		strokeStyle: 'red',
		lineWidth: 4,
		method: 'fillDraw',
		group: 'space',
		collisionPoints: 'edges',
	});

	//animation functions
	getLegalTiles = function() { //get tiles next to the mySpace tile
		legalTiles = [];
		hit = mySpace.getBetweenGroupEntityHits(myTiles);
		for (var i = 0, z = hit.length; i < z; i++) {
			scrawl.pushUnique(legalTiles, hit[i][1]);
		}
	};

	//this could probably be done better using scrawl tweens ...
	startTileMove = function(hit) { //initialise a tile to move
		if (scrawl.xt(hit)) {
			myX = 0;
			myY = 0;
			if (hit.start.x !== spaceBlock.start.x) {
				if (hit.start.x < spaceBlock.start.x) {
					myX = 2;
				}
				else {
					myX = -2;
				}
			}
			else {
				if (hit.start.y < spaceBlock.start.y) {
					myY = 2;
				}
				else {
					myY = -2;
				}
			}
			hit.delta.set({
				x: myX,
				y: myY,
			});
			currentTile = hit;
			moving = true;
		}
	};

	endTileMove = function() { //tidy up after tile move completed
		myX = 0;
		myY = 0;
		if (currentTile.delta.x !== 0) {
			myX = (currentTile.delta.x < 0) ? 80 : -80;
		}
		else {
			myY = (currentTile.delta.y < 0) ? 80 : -80;
		}
		spaceBlock.setDelta({
			start: {
				x: myX,
				y: myY,
			}
		});
		currentTile.delta.set();
		moving = false;
	};

	mixTiles = function() { //mixing up the tiles
		if (!moving) {
			getLegalTiles();
			if (selectedTile) {
				scrawl.removeItem(legalTiles, previousTile);
				scrawl.removeItem(legalTiles, selectedTile);
			}
			previousTile = selectedTile;
			selectedTile = legalTiles[Math.floor(Math.random() * legalTiles.length)];
			startTileMove(scrawl.entity[selectedTile]);
			mixCounter++;
			if (mixCounter >= 25) {
				prepare = false;
				document.getElementById('myP').innerHTML = 'Click on tile to move it into the adjacent space';
			}
		}
	};

	//event handler
	handleEntity = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (!prepare) {
			if (!moving) {
				myEntity = myTiles.getEntityAt(here);
				if (myEntity) {
					getLegalTiles();
					if (scrawl.contains(legalTiles, myEntity.name)) {
						startTileMove(myEntity);
					}
				}
			}
		}
	};
	scrawl.addListener('up', handleEntity, myCanvas);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (prepare) {
				mixTiles();
			}
			if (moving && currentTile) {
				currentTile.updateStart();
				if (currentTile.start.isEqual(spaceBlock.start)) {
					endTileMove();
				}
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'shape', 'animation', 'images', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
