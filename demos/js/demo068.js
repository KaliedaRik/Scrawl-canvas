var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var here,
		currentEntity,
		canvas = scrawl.canvas.mycanvas,
		pad = scrawl.pad.mycanvas,
		background,
		myImages,
		drag,
		dragdrop,
		handleFiles,
		handleFile,
		pickupEntity,
		dropEntity,
		stopE;

	//define groups
	background = scrawl.makeGroup({
		name: 'background',
		order: 0,
	});
	myImages = scrawl.makeGroup({
		name: 'myImages',
		order: 1,
	});

	//define initial entity
	scrawl.makePhrase({
		font: '40pt Arial, sans-serif',
		text: 'Drag image files\nonto this canvas',
		startX: 300,
		startY: 200,
		handleX: 'center',
		handleY: '60%',
		fillStyle: 'lightgrey',
		group: 'background',
	});

	//event listener functions for dragging and dropping files onto canvas
	stopE = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	};
	drag = function(e) {
		stopE(e);
	};
	dragdrop = function(e) {
		var dt = e.dataTransfer,
			files = dt.files;
		stopE(e);
		handleFiles(files);
	};
	handleFiles = function(files) {
		for (var i = 0, iz = files.length; i < iz; i++) {
			if (files[i].type.match(/image.*/)) {
				handleFile(files[i], i);
			}
		}
	};
	handleFile = function(file, offset) {
		var reader = new FileReader();
		reader.onload = function() {
			scrawl.makePicture({
				name: file.name,
				url: reader.result,
				strokeStyle: 'red',
				method: 'fillDraw',
				startX: here.x + (offset * 10),
				startY: here.y + (offset * 10),
				width: 150,
				height: 100,
				handleX: 'center',
				handleY: 'center',
				group: 'myImages',
			});
		};
		reader.readAsDataURL(file);
	};
	scrawl.addNativeListener(['dragenter', 'dragover'], drag, canvas);
	scrawl.addNativeListener('drop', dragdrop, canvas);

	//event listeners for dragging and dropping entitys within the canvas
	pickupEntity = function(e) {
		stopE(e);
		if (currentEntity) {
			dropEntity();
		}
		currentEntity = myImages.getEntityAt(here);
		if (currentEntity) {
			currentEntity.pickupEntity(here);
		}
	};
	dropEntity = function(e) {
		stopE(e);
		if (currentEntity) {
			currentEntity.dropEntity();
			currentEntity = false;
		}
	};
	scrawl.addListener('down', pickupEntity, canvas);
	scrawl.addListener(['up', 'leave'], dropEntity, canvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = pad.getMouse();
			if (!here.active) {
				dropEntity();
			}
			scrawl.render();
			myImages.updateEntitysBy({
				roll: 0.2,
			});

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
	modules: ['animation', 'images', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
