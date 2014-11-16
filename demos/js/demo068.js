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
		dropEntity;

	//define groups
	background = scrawl.newGroup({
		name: 'background',
		order: 0,
	});
	myImages = scrawl.newGroup({
		name: 'myImages',
		order: 1,
	});

	//define initial entity
	scrawl.newPhrase({
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
	drag = function(e) {
		e.stopPropagation();
		e.preventDefault();
	};
	dragdrop = function(e) {
		var dt = e.dataTransfer,
			files = dt.files;
		e.stopPropagation();
		e.preventDefault();
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
			scrawl.newPicture({
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
	canvas.addEventListener("dragenter", drag, false);
	canvas.addEventListener("dragover", drag, false);
	canvas.addEventListener("drop", dragdrop, false);

	//event listeners for dragging and dropping entitys within the canvas
	pickupEntity = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (currentEntity) {
			dropEntity();
		}
		currentEntity = myImages.getEntityAt(here);
		if (currentEntity) {
			currentEntity.pickupEntity(here);
		}
	};
	dropEntity = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (currentEntity) {
			currentEntity.dropEntity();
			currentEntity = false;
		}
	};
	canvas.addEventListener('mousedown', pickupEntity, false);
	document.body.addEventListener('mouseup', dropEntity, false);
	document.body.addEventListener('mouseleave', dropEntity, false);

	//animation object
	scrawl.newAnimation({
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
