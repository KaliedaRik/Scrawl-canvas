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
		currentSprite,
		kill = [],
		offsetX = 8,
		offsetY = 8,
		counter = 0,
		filterSprites,
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

	//add cells to canvas
	pad.addNewCell({
		name: 'background',
		width: 600,
		height: 400,
	});
	pad.addNewCell({
		name: 'filter',
		width: 600,
		height: 400,
		targetX: offsetX,
		targetY: offsetY,
	});
	pad.setDrawOrder(['background', 'filter']);

	//define groups
	scrawl.newGroup({
		name: 'ripples',
		cell: 'filter',
		order: 0,
	});
	scrawl.newGroup({
		name: 'ripplesOverlay',
		cell: 'filter',
		order: 1,
	});
	filterSprites = scrawl.group.ripples.sprites;

	//define sprites
	scrawl.newPicture({
		name: 'myImage',
		width: 600,
		height: 400,
		url: 'img/carousel/kookaburra.png',
		group: 'background',
	});

	//event listener - creates sprites
	newRing = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		counter++;
		scrawl.newWheel({
			name: 'drop' + counter,
			startX: here.x - offsetX,
			startY: here.y - offsetY,
			radius: 1,
			method: 'draw',
			lineWidth: 3,
			shadowBlur: 15,
			globalAlpha: 1,
			group: 'ripples',
			order: counter,
		});
	};
	canvas.addEventListener('mouseup', newRing, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			if (scrawl.contains(scrawl.spritenames, 'myImage')) {
				if (!scrawl.contains(scrawl.spritenames, 'myImageRipple')) {
					scrawl.sprite.myImage.clone({
						name: 'myImageRipple',
						group: 'ripplesOverlay',
						globalCompositeOperation: 'source-atop',
					});
				}
			}
			here = pad.getMouse();
			for (var i = 0, z = filterSprites.length; i < z; i++) {
				currentSprite = scrawl.sprite[filterSprites[i]];
				currentSprite.setDelta({
					globalAlpha: -0.0015,
					radius: 1,
					lineWidth: 0.05,
					order: 1,
				});
				if (currentSprite.get('globalAlpha') <= 0) {
					kill.push(currentSprite.name);
				}
			}
			if (kill.length > 0) {
				scrawl.deleteSprite(kill);
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
	modules: ['images', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
